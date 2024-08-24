import React, {
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { DraxProvider, DraxView } from "react-native-drax";
import {
  fetchAllRecipes,
  fetchMealPlan,
  insertMealPlan,
  deleteMealPlan,
  deleteSpecificMeal,
  fetchAllCategories,
  fetchRecipesByCategory,
  clearShoppingList,
} from "../util/database";
import { Ionicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import getImageSource from "../util/image";
import { daysOfWeek, mealTypes } from "../constants/recipeConstants";
import colors from "../constants/colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

function MealPlanningScreen({ navigation }) {
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mealPlan, setMealPlan] = useState({});
  const [allMealPlanRecipes, setAllMealPlanRecipes] = useState([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [hoveredMealType, setHoveredMealType] = useState(null);
  const [draggedRecipe, setDraggedRecipe] = useState(null);
  const [daysWithDates, setDaysWithDates] = useState([]);
  const [selectedMealForDeletion, setSelectedMealForDeletion] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      const fetchedCategories = await fetchAllCategories();
      setCategories(fetchedCategories);
      if (fetchedCategories.length > 0) {
        selectCategory(fetchedCategories[0].id);
      }
    };
    loadCategories();

    const loadMealPlan = async () => {
      try {
        const data = await fetchMealPlan();
        const formattedData = data.reduce((acc, item) => {
          if (!acc[item.day]) {
            acc[item.day] = {};
          }
          acc[item.day][item.meal_type] = item.recipe_id;
          return acc;
        }, {});
        setMealPlan(formattedData);
        const mealPlanRecipeIds = [
          ...new Set(data.map((item) => item.recipe_id)),
        ];
        const mealPlanRecipes = await fetchAllRecipes();
        setAllMealPlanRecipes(
          mealPlanRecipes.filter((recipe) =>
            mealPlanRecipeIds.includes(recipe.id)
          )
        );
      } catch (error) {
        console.error("Failed to fetch meal plan", error);
      }
    };

    loadMealPlan();
    const days = getDaysWithDates();
    setDaysWithDates(days);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchRecipes = async () => {
        const data = await fetchAllRecipes();
        const sortedByRecent = [...data].sort((a, b) => b.id - a.id);
        setRecipes(sortedByRecent);
      };
      fetchRecipes();
    }, [])
  );

  const getDaysWithDates = () => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = daysOfWeek[date.getDay()];
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = String(date.getFullYear()).slice(-2);
      const dateString = `${day}/${month}/${year}`;
      return `${dayOfWeek} ${dateString}`;
    });
  };

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

  const renderRecipeByCategory = ({ item }) => (
    <DraxView
      style={styles.recipeCard}
      draggingStyle={styles.dragging}
      dragReleasedStyle={styles.draggingReleased}
      dragPayload={item}
      onDragStart={() => setDraggedRecipe(item)}
      onDragEnd={() => setDraggedRecipe(null)}
      longPressDelay={150}
    >
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("RecipeDisplay", { recipeId: item.id })
        }
      >
        <View style={{ position: "relative" }}>
          <Image
            source={getImageSource(item.image)}
            style={styles.recipeImage}
          />
        </View>
        <Text style={styles.recipeTitle}>{item.title}</Text>
      </TouchableOpacity>
    </DraxView>
  );

  const handleDrop = async (mealType) => {
    if (!draggedRecipe) return;

    const fullDayString = daysWithDates[selectedDayIndex];
    if (!fullDayString) {
      return;
    }

    const dayNameParts = fullDayString.split(" ");
    if (dayNameParts.length < 2) {
      console.error("Invalid day name extracted:", fullDayString);
      return;
    }
    const dayName = dayNameParts[0] + " " + dayNameParts[1];

    if (!daysOfWeek.includes(dayName)) {
      console.error(`Invalid day name extracted: ${dayName}`);
      return;
    }

    const newMealPlan = { ...mealPlan };
    if (!newMealPlan[dayName]) {
      newMealPlan[dayName] = {};
    }
    newMealPlan[dayName][mealType] = draggedRecipe.id;

    // Save to database
    await insertMealPlan(dayName, mealType, draggedRecipe.id);

    // Update state
    setMealPlan(newMealPlan);
    setAllMealPlanRecipes((prevRecipes) => {
      const recipeExists = prevRecipes.some(
        (recipe) => recipe.id === draggedRecipe.id
      );
      return recipeExists ? prevRecipes : [...prevRecipes, draggedRecipe];
    });
    setDraggedRecipe(null);
    setHoveredMealType(null);
    console.log("Updated meal plan: ", newMealPlan);
  };

  const handleDeleteMeal = async (mealType) => {
    const fullDayString = daysWithDates[selectedDayIndex];
    if (!fullDayString) {
      return;
    }

    const dayNameParts = fullDayString.split(" ");
    if (dayNameParts.length < 2) {
      console.error("Invalid day name extracted:", fullDayString);
      return;
    }
    const dayName = dayNameParts[0] + " " + dayNameParts[1];

    await deleteSpecificMeal(dayName, mealType);
    const newMealPlan = { ...mealPlan };
    delete newMealPlan[dayName][mealType];
    setMealPlan(newMealPlan);
    setSelectedMealForDeletion(null);
  };

  const toggleSelection = (mealType) => {
    if (selectedMealForDeletion?.mealType === mealType) {
      setSelectedMealForDeletion(null);
    } else {
      setSelectedMealForDeletion({ mealType });
    }
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const renderMeal = (mealType) => {
    const fullDayString = daysWithDates[selectedDayIndex];
    if (!fullDayString) {
      return null;
    }

    const dayNameParts = fullDayString.split(" ");
    if (dayNameParts.length < 2) {
      console.error("Invalid day name extracted:", fullDayString);
      return null;
    }
    const dayName = dayNameParts[0] + " " + dayNameParts[1];
    const recipeId = mealPlan[dayName]?.[mealType];
    const recipe = allMealPlanRecipes.find((r) => r.id === recipeId);
    const isSelected = selectedMealForDeletion?.mealType === mealType;

    return (
      <TouchableOpacity
        key={mealType}
        style={[styles.mealWrapper, isSelected && styles.mealContainerSelected]}
        onPress={() => toggleSelection(mealType)}
      >
        <Text style={styles.mealType}>{mealType}</Text>
        <DraxView
          style={[
            styles.mealContainer,
            hoveredMealType === mealType ? styles.mealContainerHovered : {},
          ]}
          receptive
          onReceiveDragDrop={() => handleDrop(mealType)}
          onReceiveDragEnter={() => setHoveredMealType(mealType)}
          onReceiveDragExit={() => setHoveredMealType(null)}
        >
          {recipe ? (
            <View style={styles.meal}>
              <Image
                source={getImageSource(recipe.image)}
                style={styles.mealImage}
              />
              <Text style={styles.mealTitle}>{recipe.title}</Text>
              {isSelected && (
                <TouchableOpacity
                  style={styles.deleteIcon}
                  onPress={() => handleDeleteMeal(mealType)}
                >
                  <Ionicons name="trash" size={wp("5%")} color="#FF6347" />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.addMealButton}>
              <Ionicons name="add" size={wp("6%")} color="#4CAF50" />
              <Text style={styles.addMealText}>הוסף מתכון</Text>
            </View>
          )}
        </DraxView>
      </TouchableOpacity>
    );
  };

  const clearMealPlan = async () => {
    await deleteMealPlan();
    setMealPlan({});
    Alert.alert("ניקוי לוח ארוחות", "לוח הארוחות נוקה!");
  };

  const handleNextDay = () => {
    setSelectedDayIndex((prevIndex) => (prevIndex + 1) % daysWithDates.length);
  };

  const handlePreviousDay = () => {
    setSelectedDayIndex(
      (prevIndex) =>
        (prevIndex - 1 + daysWithDates.length) % daysWithDates.length
    );
  };

  const extractRecipeIdsFromMealPlan = () => {
    const recipeIds = [];
    for (const day in mealPlan) {
      for (const mealType in mealPlan[day]) {
        const recipeId = mealPlan[day][mealType];
        if (recipeId && !recipeIds.includes(recipeId)) {
          recipeIds.push(recipeId);
        }
      }
    }
    return recipeIds;
  };

  const handleCreateShoppingList = async () => {
    const recipeIds = extractRecipeIdsFromMealPlan();
    if (recipeIds.length > 0) {
      await clearShoppingList();
      navigation.navigate("ShoppingList", { selectedRecipes: recipeIds });
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ position: "relative" }}>
          <TouchableOpacity
            onPress={toggleMenu}
            style={{ paddingRight: wp("5%") }}
          >
            <Ionicons
              name="ellipsis-vertical-circle"
              size={wp("7%")}
              color="black"
            />
          </TouchableOpacity>
          {menuVisible && (
            <View
              style={{
                position: "absolute",
                top: hp("2.8%"),
                right: wp("10%"),
                backgroundColor: "white",
                borderRadius: 8,
                paddingHorizontal: wp("2%"),
                paddingVertical: hp("1%"),
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 2,
                elevation: 5,
                zIndex: 1000,
                width: wp("40%"),
              }}
            >
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleCreateShoppingList}
              >
                <Text style={styles.menuText}>
                  יצירת רשימת קניות מהלוח השבועי
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ),
    });
  }, [navigation, toggleMenu, menuVisible]);

  return (
    <DraxProvider>
      <ScrollView style={styles.container}>
        <View style={styles.daySelector}>
          <TouchableOpacity
            onPress={handlePreviousDay}
            style={styles.arrowButton}
          >
            <AntDesign name="right" size={wp("4%")} color="#2A3631" />
          </TouchableOpacity>
          <Text style={styles.dayText}>{daysWithDates[selectedDayIndex]}</Text>
          <TouchableOpacity onPress={handleNextDay} style={styles.arrowButton}>
            <AntDesign name="left" size={wp("4%")} color="#2A3631" />
          </TouchableOpacity>
        </View>
        <View style={styles.listsContainer}>
          <FlatList
            horizontal
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
          <DraxView style={styles.recipeList}>
            <FlatList
              horizontal
              data={recipes}
              renderItem={renderRecipeByCategory}
              keyExtractor={(item) => item.id.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRecipesList}
            />
          </DraxView>
        </View>

        <View style={styles.mealsContainer}>
          {mealTypes.map((mealType) => renderMeal(mealType))}
        </View>
        <TouchableOpacity style={styles.clearButton} onPress={clearMealPlan}>
          <Text style={styles.clearButtonText}>ניקוי הלוח השבועי</Text>
        </TouchableOpacity>
      </ScrollView>
    </DraxProvider>
  );
}

export default MealPlanningScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  daySelector: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: hp("2%"),
    alignSelf: "center",
    position: "relative",
    zIndex: 10,
  },
  arrowButton: {
    paddingHorizontal: wp("10%"),
  },
  dayText: {
    fontSize: wp("4.5%"),
    fontWeight: "bold",
    color: "#2A3631",
  },
  mealsContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: wp("5%"),
  },
  mealWrapper: {
    width: wp("43%"),
  },
  mealContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp("2%"),
    paddingHorizontal: wp("5%"),
    paddingVertical: hp("1%"),
    borderWidth: 1,
    borderColor: "#ccc",
    alignContent: "center",
    borderRadius: wp("2.5%"),
    height: hp("20%"),
  },
  mealContainerHovered: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  mealImage: {
    aspectRatio: 1,
    height: hp("13%"),
    borderRadius: wp("2.5%"),
    marginTop: hp("1%"),
    alignSelf: "center",
  },
  mealTitle: {
    fontSize: wp("3.5%"),
    fontWeight: "bold",
    textAlign: "center",
    color: "#666",
    paddingVertical: hp("1%"),
  },
  mealType: {
    color: "#4d4c4c",
    fontSize: wp("4%"),
    textAlign: "center",
    paddingBottom: hp("1%"),
    paddingLeft: wp("1%"),
    fontWeight: "bold",
  },
  addMealButton: {
    position: "absolute",
    alignItems: "center",
  },
  addMealText: {
    marginTop: hp("0.5%"),
    color: colors.secondaryGreen,
    alignContent: "center",
  },

  clearButton: {
    marginBottom: hp("2%"),
    padding: wp("3%"),
    backgroundColor: "#ff6347",
    borderRadius: wp("10%"),
    width: wp("40%"),
    alignSelf: "center",
  },
  clearButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  recipeCard: {
    width: wp("40%"),
    marginRight: wp("5%"),
    borderRadius: wp("2%"),
    overflow: "hidden",
  },
  recipeImage: {
    width: "100%",
    height: hp("15%"),
    borderRadius: wp("2%"),
  },
  recipeTitle: {
    fontSize: wp("4%"),
    fontWeight: "bold",
    marginTop: hp("1%"),
    textAlign: "left",
  },
  categoriesList: {
    alignItems: "center",
    marginBottom: hp("2%"),
  },
  categoryItem: {
    backgroundColor: "white",
    paddingHorizontal: wp("2%"),
    paddingVertical: hp("1%"),
    borderRadius: wp("2%"),
    borderWidth: 1,
    borderColor: "#ebeeec",
    marginHorizontal: wp("1%"),
  },
  categoryText: {
    color: "#acacac",
    fontSize: wp("3.5%"),
  },
  selectedCategoryItem: {
    backgroundColor: colors.secondaryGreen,
    borderColor: colors.secondaryGreen,
  },
  selectedCategoryText: {
    color: "white",
    fontWeight: "bold",
  },
  listsContainer: {
    paddingHorizontal: wp("2%"),
    paddingVertical: hp("2%"),
    marginHorizontal: wp("2%"),
    marginBottom: hp("2%"),
    // backgroundColor: "#F8F9F8",
    zIndex: 0,
  },
  recipeList: {},
  dragging: {
    width: wp("40%"),
    height: hp("20%"),
    opacity: 0.3,
  },
  draggingReleased: {
    opacity: 1,
  },
  deleteIcon: {
    position: "absolute",
    top: hp("2%"),
    right: wp("2%"),
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: wp("2%"),
    padding: wp("2%"),
  },

  menuItem: {
    paddingVertical: hp("1%"),
  },
  menuText: {
    fontSize: wp("4%"),
    color: "black",
    textAlign: "center",
  },
});
