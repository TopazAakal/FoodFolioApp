import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
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
import {
  daysOfWeek,
  mealTypes,
  originalDaysOfWeek,
  mealTypeMap,
} from "../constants/recipeConstants";

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [latestRecipes, setLatestRecipes] = useState([]);
  const [mealPlan, setMealPlan] = useState({});
  const [allMealPlanRecipes, setAllMealPlanRecipes] = useState([]);
  const menuOptions = [
    { title: "הוספת מתכון ידנית", navigateTo: "AddRecipe" },
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
    const currentDay = originalDaysOfWeek[currentDayIndex];
    const currentDayShort = daysOfWeek[currentDayIndex];
    const originalMealType = Object.keys(mealTypeMap).find(
      (key) => mealTypeMap[key] === mealType
    );

    const recipeId = mealPlan[currentDay]?.[originalMealType];
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

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>{getGreeting()}</Text>
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
            size={40}
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
          <AntDesign name="arrowleft" size={24} color={colors.secondaryGreen} />
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
          <AntDesign name="arrowleft" size={24} color={colors.secondaryGreen} />
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
          <AntDesign name="arrowleft" size={24} color={colors.secondaryGreen} />
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
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  // ==== General styles =====
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 15,
    paddingTop: screenHeight < 900 ? 15 : 50,
    paddingBottom: screenHeight < 900 ? 0 : 20,
    alignItems: "flex-start",
  },
  contentContainer: {
    alignItems: "flex-start",
  },
  greeting: {
    fontSize: 22,
    marginBottom: screenHeight < 900 ? 10 : 20,
    marginTop: screenHeight < 900 ? 0 : 30,
    fontWeight: "bold",
  },

  moreButton: {
    paddingTop: 5,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  moreButtonText: {
    color: colors.secondaryGreen,
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 5,
  },

  subTitle: {
    fontSize: 18,
    fontWeight: "bold",
    alignContent: "center",
  },
  // ==== Search styles =====
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: screenHeight < 900 ? 10 : 25,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    width: "100%",
    height: 40,
    borderColor: colors.light,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginRight: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    textAlign: "right",
    marginRight: 5,
  },
  // ==== Meals styles =====
  mealsList: {
    flexGrow: 0,
    backgroundColor: "transparent",
    marginBottom: screenHeight < 900 ? 10 : 20,
  },
  mealContainer: {
    alignItems: "flex-start",
    marginRight: screenHeight < 900 ? 1 : 10,
    marginBottom: 5,
    width: 170,
    height: 120,
  },
  mealCardEmpty: {
    width: 170,
    height: 120,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    marginRight: 10,
  },
  mealImage: {
    width: screenHeight < 900 ? "90%" : "100%",
    height: 120,
    borderRadius: 10,
  },

  mealTitle: {
    width: "75%",
    fontSize: 14,
    textAlign: "left",
    fontWeight: "bold",
    marginLeft: 3,
    marginTop: 5,
  },

  mealInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    marginRight: screenHeight < 900 ? 0 : 15,
  },

  mealInfo: {
    fontSize: 13,
    marginLeft: 3,
    textAlign: "left",
    color: colors.mouseGray,
  },
  mealEmptyText: {
    fontSize: 14,
    color: colors.mouseGray,
  },

  // ==== Recipes styles =====
  recipeCard: {
    width: 170,
    marginRight: 15,
    borderRadius: 10,
    overflow: "hidden",
  },
  recipeImage: {
    width: "100%",
    height: screenHeight < 900 ? 100 : 120,
    borderRadius: 10,
  },
  recipeTitle: {
    fontSize: 14,
    width: "85%",
    fontWeight: "bold",
    textAlign: "left",
    marginLeft: 5,
    marginBottom: 3,
  },

  // ==== Categories styles =====
  latestList: {
    flexGrow: 0,
    backgroundColor: "transparent",
    marginBottom: screenHeight < 900 ? 10 : 20,
  },

  // ==== Headers styles =====
  latestRecipesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: screenHeight < 900 ? 5 : 10,
  },
  interestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center",
    width: "100%",
    marginBottom: screenHeight < 900 ? 5 : 10,
  },

  mealsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: screenHeight < 900 ? 5 : 10,
  },

  // ==== Categories styles =====
  categoryItem: {
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ebeeec",
    marginHorizontal: 3,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  categoryText: {
    color: "#acacac",
    fontSize: screenWidth < 400 ? 12 : 14,
    textAlign: "center",
    lineHeight: 20,
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
    height: 35,
    marginBottom: screenHeight < 900 ? 0 : 15,
  },
  categoryRecipesList: {
    backgroundColor: "transparent",
  },

  searchIcon: {
    marginRight: 10,
    color: colors.light,
  },
});

export default HomeScreen;
