import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  fetchAllRecipes,
  fetchAllCategories,
  fetchRecipesByCategory,
  fetchMealPlan,
} from "../util/database";
import { AntDesign } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import getImageSource from "../util/image";
import MenuButton from "../components/UI/MenuButton";
import colors from "../constants/colors";
import { daysOfWeek, mealTypes } from "../constants/recipeConstants";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [latestRecipes, setLatestRecipes] = useState([]);
  const [mealPlan, setMealPlan] = useState({});
  const [allMealPlanRecipes, setAllMealPlanRecipes] = useState([]);
  const menuOptions = [
    { title: "הוספת מתכון ידנית", navigateTo: "AddRecipeManually" },
    { title: "הוספת מתכון מקישור", navigateTo: "AddRecipeByUrl" },
    { title: "הוספת מתכון מתמונה", navigateTo: "AddRecipeByImage" },
  ];

  useEffect(() => {
    const loadCategories = async () => {
      const fetchedCategories = await fetchAllCategories();
      setCategories(fetchedCategories);
      if (fetchedCategories.length > 0) {
        selectCategory(fetchedCategories[0].id);
      }
    };

    loadCategories();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchMealPlanData = async () => {
        const data = await fetchMealPlan();
        const formattedData = data.reduce((acc, item) => {
          if (!acc[item.day]) {
            acc[item.day] = {};
          }
          acc[item.day][item.meal_type] = item.recipe_id;
          return acc;
        }, {});
        setMealPlan(formattedData);

        // Fetch all recipes in the meal plan
        const mealPlanRecipeIds = [
          ...new Set(data.map((item) => item.recipe_id)),
        ];
        const mealPlanRecipes = await fetchAllRecipes();
        setAllMealPlanRecipes(
          mealPlanRecipes.filter((recipe) =>
            mealPlanRecipeIds.includes(recipe.id)
          )
        );
      };

      const fetchRecipes = async () => {
        const data = await fetchAllRecipes();
        const sortedByRecent = [...data]
          .sort((a, b) => b.id - a.id)
          .slice(0, 6);
        setLatestRecipes(sortedByRecent);
      };

      fetchMealPlanData();
      fetchRecipes();
    }, [])
  );

  const selectCategory = async (categoryId) => {
    setSelectedCategoryId(categoryId);
    const categoryRecipes = await fetchRecipesByCategory(categoryId);
    setRecipes(categoryRecipes);
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        item.id === selectedCategoryId ? styles.selectedCategoryItem : {},
      ]}
      onPress={() => selectCategory(item.id)}
    >
      <Text
        style={[
          styles.categoryText,
          item.id === selectedCategoryId ? styles.selectedCategoryText : {},
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderMeal = (mealType) => {
    const currentDayIndex = new Date().getDay();
    const currentDayShort = daysOfWeek[currentDayIndex];
    const recipeId = mealPlan[currentDayShort]?.[mealType];
    const recipe = allMealPlanRecipes.find((r) => r.id === recipeId);

    if (!recipe) {
      return (
        <View>
          <View style={styles.mealCardEmpty}>
            <View style={styles.mealImagePlaceholder}>
              <TouchableOpacity onPress={() => navigation.navigate("MealPlan")}>
                <Text style={styles.mealEmptyText}>הוסף מתכון + </Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.mealTitle}>לא שובץ מתכון</Text>
          <View style={styles.mealInfoContainer}>
            <Ionicons name="alarm-outline" size={16} color="#727272" />
            <Text style={styles.mealInfo}>
              {mealType}, {currentDayShort},{" "}
              {new Date().toLocaleDateString("he-IL")}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={styles.mealContainer}
        onPress={() =>
          navigation.navigate("RecipeDisplay", { recipeId: recipe.id })
        }
      >
        <Image source={getImageSource(recipe.image)} style={styles.mealImage} />
        <Text style={styles.mealTitle}>{recipe.title}</Text>
        <View style={styles.mealInfoContainer}>
          <Ionicons name="alarm-outline" size={16} color="#727272" />
          <Text style={styles.mealInfo}>
            {mealType}, {currentDayShort},{" "}
            {new Date().toLocaleDateString("he-IL")}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getGreeting = () => {
    const date = new Date(); // Gets the current date and time
    date.setHours(date.getHours() + date.getTimezoneOffset() / 60 + 3); // Convert to Israel Time (GMT+3)

    const hours = date.getHours();
    const minutes = date.getMinutes();

    if (hours < 5 || (hours === 22 && minutes >= 0) || hours > 22) {
      return "לילה טוב!";
    } else if (hours < 11 || (hours === 11 && minutes < 30)) {
      return "בוקר טוב!";
    } else if (hours < 17 || (hours === 17 && minutes === 0)) {
      return "צהריים טובים!";
    } else {
      return "ערב טוב!";
    }
  };

  const handleSearch = () => {
    navigation.navigate("AllRecipes", {
      searchQuery: searchQuery.trim(),
    });
  };

  const renderRecipe = ({ item }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() =>
        navigation.navigate("RecipeDisplay", { recipeId: item.id })
      }
    >
      <View style={{ position: "relative" }}>
        <Image source={getImageSource(item.image)} style={styles.recipeImage} />
      </View>
      <Text style={styles.recipeTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderRecipeByCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() =>
        navigation.navigate("RecipeDisplay", { recipeId: item.id })
      }
    >
      <View style={{ position: "relative" }}>
        <Image source={getImageSource(item.image)} style={styles.recipeImage} />
      </View>
      <Text style={styles.recipeTitle}>{item.title}</Text>
    </TouchableOpacity>
  );
  const handleSettingsPress = () => {
    navigation.navigate("Settings");
  };

  return (
    <View style={styles.container}>
      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <TouchableOpacity onPress={handleSettingsPress}>
          <Ionicons
            name="settings-outline"
            size={24}
            color="black"
            style={styles.settingsIcon}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="חיפוש"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          <Ionicons
            name="search"
            size={20}
            color="black"
            style={styles.searchIcon}
          />
        </View>
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <AntDesign
            name="leftsquare"
            size={hp("5%")}
            color={colors.secondaryGreen}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.mealsHeader}>
        <Text style={styles.subTitle}>הארוחות שלי</Text>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => navigation.navigate("MealPlan")}
        >
          <Text style={styles.moreButtonText}>הצג עוד</Text>
          <AntDesign
            name="arrowleft"
            size={wp("6%")}
            color={colors.secondaryGreen}
          />
        </TouchableOpacity>
      </View>
      <FlatList
        data={mealTypes}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        renderItem={({ item }) => renderMeal(item)}
        style={styles.mealsList}
      />
      <View style={styles.latestRecipesHeader}>
        <Text style={styles.subTitle}>נוספו לאחרונה🔥</Text>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => navigation.navigate("AllRecipes")}
        >
          <Text style={styles.moreButtonText}>לכל המתכונים</Text>
          <AntDesign
            name="arrowleft"
            size={wp("6%")}
            color={colors.secondaryGreen}
          />
        </TouchableOpacity>
      </View>
      <FlatList
        data={latestRecipes}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRecipe}
        style={styles.latestList}
      />

      <MenuButton
        navigation={navigation}
        menuOptions={menuOptions}
        style={{ right: 16, bottom: 25 }}
        fabStyle={{ top: 15 }}
        menuStyle={{ bottom: 20, right: 35, zIndex: 1001 }}
      />

      <View style={styles.interestHeader}>
        <Text style={styles.subTitle}>אולי יעניין אותך</Text>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => navigation.navigate("AllCategories")}
        >
          <Text style={styles.moreButtonText}> לכל הקטגוריות</Text>
          <AntDesign
            name="arrowleft"
            size={wp("6%")}
            color={colors.secondaryGreen}
          />
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      />
      <FlatList
        horizontal
        data={recipes}
        renderItem={renderRecipeByCategory}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRecipesList}
      />
    </View>
  );
};
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const isSmallScreenWidth = screenWidth < 360;
const isSmallScreenHeight = screenHeight < 880;

const styles = StyleSheet.create({
  // ==== General styles =====
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: wp("4%"), // 4% of screen width
    paddingTop: hp("2%"), // 2% or 6% of screen height
    paddingBottom: hp("0%"), // 0% or 2% of screen height
    alignItems: "flex-start",
  },
  contentContainer: {
    alignItems: "flex-start",
  },
  greetingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: hp("1%"), // Adjusted margin
  },

  greeting: {
    fontSize: wp("5.2%"), // Adjusted font size
    marginBottom: hp("1%"),
    fontWeight: "bold",
  },
  moreButton: {
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  moreButtonText: {
    color: colors.secondaryGreen,
    fontSize: wp("3.6%"),
    fontWeight: "bold",
    marginRight: wp("1%"),
  },

  subTitle: {
    fontSize: wp("4.2%"),
    fontWeight: "bold",
    alignContent: "center",
  },
  // ==== Search styles =====
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: isSmallScreenHeight ? hp("1.5%") : hp("2.5%"),
    marginTop: hp("1%"),
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    width: "100%",
    height: hp("5%"),
    borderColor: colors.light,
    borderWidth: 1,
    borderRadius: wp("2.5%"), // Border radius adjusted
    paddingHorizontal: wp("3%"), // Adjusted padding
    marginRight: wp("1.5%"), // Adjusted margin
  },
  searchInput: {
    flex: 1,
    fontSize: wp("4%"),
    textAlign: "right",
    marginRight: wp("1.5%"),
  },
  // ==== Meals styles =====
  mealsList: {
    flexGrow: 0,
    backgroundColor: "transparent",
    marginBottom: hp("1%"),
  },
  mealContainer: {
    alignItems: "flex-start",
    marginRight: wp("2.5%"),
    marginBottom: hp("0.5%"), // Adjusted margin
    width: wp("42%"), // Width set as a percentage
    height: hp("15%"), // Height set as a percentages
  },
  mealCardEmpty: {
    width: wp("42%"), // Width set as a percentage
    height: hp("12%"), // Height set as a percentage
    borderRadius: wp("2.5%"), // Border radius adjusted
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    marginRight: wp("2.5%"),
  },
  mealImage: {
    width: wp("42%"),
    height: hp("12%"), // Height set as a percentage
    borderRadius: wp("2.5%"), // Border radius adjusted
    marginRight: wp("2.5%"),
  },

  mealTitle: {
    width: "75%",
    fontSize: wp("3.3%"),
    textAlign: "left",
    fontWeight: "bold",
    marginLeft: wp("1%"), // Adjusted margin
    marginTop: hp("0.5%"),
  },

  mealInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("2.5%"),
    marginRight: wp("0%"),
    marginTop: hp("0.5%"),
  },

  mealInfo: {
    fontSize: wp("3.25%"),
    marginLeft: wp("1%"),
    textAlign: "left",
    color: colors.mouseGray,
  },
  mealEmptyText: {
    fontSize: wp("3.5%"),
    color: colors.mouseGray,
  },

  // ==== Recipes styles =====
  recipeCard: {
    width: wp("42%"), // Width set as a percentage
    height: hp("17%"), // Height set as a percentage
    marginRight: wp("3.75%"), // Adjusted margin
    borderRadius: wp("2.5%"), // Border radius adjusted
    overflow: "hidden",
  },
  recipeImage: {
    width: isSmallScreenWidth ? wp("38") : wp("42%"), // Width set as a percentage
    height: hp("12%"),
    borderRadius: wp("2.5%"),
  },
  recipeTitle: {
    fontSize: wp("3.5%"),
    width: "85%",
    fontWeight: "bold",
    textAlign: "left",
    marginLeft: wp("1.25%"),
    paddingTop: hp("0.75%"),
  },

  // ==== Categories styles =====
  latestList: {
    flexGrow: 0,
    backgroundColor: "transparent",
    marginBottom: hp("0.5%"),
  },

  // ==== Headers styles =====
  latestRecipesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: hp("1%"),
  },
  interestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center",
    width: "100%",
    marginBottom: hp("1%"),
  },

  mealsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: hp("1%"),
  },

  // ==== Categories styles =====
  categoryItem: {
    backgroundColor: "white",
    borderRadius: wp("2.5%"),
    borderWidth: 1,
    borderColor: "#ebeeec",
    marginHorizontal: wp("0.75%"),
    paddingHorizontal: wp("3%"),
    justifyContent: "center",
  },
  categoryText: {
    color: "#acacac",
    fontSize: wp("3%"),
    textAlign: "center",
    lineHeight: wp("5%"),
  },
  selectedCategoryItem: {
    backgroundColor: colors.secondaryGreen,
    borderColor: colors.secondaryGreen,
  },
  selectedCategoryText: {
    color: "white",
    fontWeight: "bold",
  },
  categoriesList: {
    backgroundColor: "transparent",
    height: hp("4.2%"),
    marginBottom: hp("0.6%"),
  },
  categoryRecipesList: {
    backgroundColor: "transparent",
  },

  searchIcon: {
    marginRight: wp("2.5%"),
    color: colors.light,
  },
});

export default HomeScreen;
