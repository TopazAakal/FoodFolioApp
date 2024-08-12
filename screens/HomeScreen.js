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

const daysOfWeek = [
  "יום א'",
  "יום ב'",
  "יום ג'",
  "יום ד'",
  "יום ה'",
  "יום ו'",
  "יום ש'",
];

const mealTypes = ["בוקר", "ביניים 1", "צהריים", "ביניים 2", "ערב"];

const originalDaysOfWeek = [
  "יום ראשון",
  "יום שני",
  "יום שלישי",
  "יום רביעי",
  "יום חמישי",
  "יום שישי",
  "יום שבת",
];

const mealTypeMap = {
  "ארוחת בוקר": "בוקר",
  "ארוחת ביניים 1": "ביניים 1",
  "ארוחת צהריים": "צהריים",
  "ארוחת ביניים 2": "ביניים 2",
  "ארוחת ערב": "ערב",
};

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [latestRecipes, setLatestRecipes] = useState([]);
  const [mealPlan, setMealPlan] = useState({});
  const [allMealPlanRecipes, setAllMealPlanRecipes] = useState([]);

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

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleTouchOutside = () => {
    if (menuVisible) {
      setMenuVisible(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Hide the menu when the screen is unfocused
      return () => setMenuVisible(false);
    }, [])
  );

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
        {menuVisible}
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
    <TouchableWithoutFeedback onPress={handleTouchOutside}>
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
              style={styles.iconStyle}
            />
          </View>
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <AntDesign name="leftsquare" size={40} color="#4CAF50" />
          </TouchableOpacity>
        </View>
        <View style={styles.mealsHeader}>
          <Text style={styles.subTitle}>הארוחות שלי</Text>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => navigation.navigate("MealPlan")}
          >
            <Text style={styles.moreButtonText}>הצג עוד</Text>
            <AntDesign name="arrowleft" size={24} color="#4CAF50" />
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
            <AntDesign name="arrowleft" size={24} color="#4CAF50" />
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

        <View style={styles.ButtonContainer}>
          {menuVisible && (
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.menu}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => navigation.navigate("AddRecipe")}
                >
                  <Text style={styles.menuText}>הוספת מתכון ידנית</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => navigation.navigate("AddRecipeByUrl")}
                >
                  <Text style={styles.menuText}>הוספת מתכון מקישור</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => navigation.navigate("AddRecipeByImage")}
                >
                  <Text style={styles.menuText}>הוספת מתכון מתמונה</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          )}
          <TouchableOpacity onPress={toggleMenu} style={styles.fab}>
            <Ionicons name="add" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.interestHeader}>
          <Text style={styles.subTitle}>אולי יעניין אותך</Text>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => navigation.navigate("AllCategories")}
          >
            <Text style={styles.moreButtonText}> לכל הקטגוריות</Text>
            <AntDesign name="arrowleft" size={24} color="#4CAF50" />
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
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  // ==== General styles =====
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: "flex-start",
  },
  contentContainer: {
    alignItems: "flex-start",
  },
  greeting: {
    fontSize: 24,
    marginBottom: 20,
    marginTop: 30,
    fontWeight: "bold",
  },

  moreButton: {
    paddingVertical: 5,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  moreButtonText: {
    color: "#4CAF50",
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
    marginBottom: 25,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    width: "100%",
    height: 40,
    borderColor: "#ccc",
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
  },
  mealContainer: {
    alignItems: "flex-start",
    marginHorizontal: 10,
    marginBottom: 5,
  },
  mealCard: {
    width: 190,
    marginRight: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  mealCardEmpty: {
    width: 190,
    height: 100,
    marginRight: 10,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#ccc",
    borderWidth: 1,
  },
  mealImage: {
    width: "100%",
    height: 100,
    borderRadius: 10,
  },
  mealTypeText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  mealTitle: {
    fontSize: 14,
    marginLeft: 5,
    textAlign: "left",
    fontWeight: "bold",
    paddingVertical: 3,
  },

  mealInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 3,
    marginBottom: 10,
  },

  mealInfo: {
    fontSize: 13,
    marginLeft: 3,
    textAlign: "left",
    color: "#727272",
  },
  mealEmptyText: {
    fontSize: 14,
    color: "#727272",
  },

  // ==== Recipes styles =====
  recipeCard: {
    width: 170,
    marginRight: 15,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 10,
  },
  recipeImage: {
    width: "100%",
    height: 120,
    borderRadius: 10,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 15,
    paddingTop: 5,
  },

  // ==== Categories styles =====
  latestList: {
    flexGrow: 0,
    backgroundColor: "transparent",
  },

  // ==== Headers styles =====
  latestRecipesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  interestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center",
    width: "100%",
    marginBottom: 5,
  },

  mealsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },

  // ==== Categories styles =====
  categoryItem: {
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ebeeec",
    marginHorizontal: 5,
    padding: 5,
    paddingHorizontal: 12,
    height: 35,
    justifyContent: "center",
  },
  categoryText: {
    color: "#acacac",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  selectedCategoryItem: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  selectedCategoryText: {
    color: "white",
    fontWeight: "bold",
  },
  categoriesList: {
    backgroundColor: "transparent",
    height: 35,
    paddingVertical: 0,
  },
  categoryRecipesList: {
    backgroundColor: "transparent",
    height: 150,
  },

  // === Menu styles ===
  iconStyle: {
    marginRight: 10,
    color: "#ccc",
  },

  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 16,
    bottom: 25,
    zIndex: 1000,
  },

  ButtonContainer: {
    position: "absolute",
    left: 0,
    right: -5,
    bottom: -14.5, // to bottom corner -14.5
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 20,
    zIndex: 1,
  },

  menu: {
    backgroundColor: "white",
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    paddingVertical: 10,
    paddingHorizontal: 5,
    width: 180,
    position: "absolute",
    bottom: 65,
    right: 50,
    zIndex: 1001,
  },

  menuItem: {
    fontWeight: "bold",
    paddingVertical: 8,
    paddingHorizontal: 5,
    alignItems: "flex-start",
  },
  menuText: {
    fontSize: 16,
    paddingHorizontal: 5,
  },
});

export default HomeScreen;
