import React, { useState, useEffect, useCallback } from "react";
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
} from "../util/database";
import { Ionicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import getImageSource from "../util/image";

const daysOfWeek = [
  "יום ראשון",
  "יום שני",
  "יום שלישי",
  "יום רביעי",
  "יום חמישי",
  "יום שישי",
  "יום שבת",
];

const mealTypes = [
  "ארוחת בוקר",
  "ארוחת ביניים 1",
  "ארוחת צהריים",
  "ארוחת ביניים 2",
  "ארוחת ערב",
];

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
              <Image source={{ uri: recipe.image }} style={styles.mealImage} />
              <Text style={styles.mealTitle}>{recipe.title}</Text>
              {isSelected && (
                <TouchableOpacity
                  style={styles.deleteIcon}
                  onPress={() => handleDeleteMeal(mealType)}
                >
                  <Ionicons name="trash" size={20} color="#FF6347" />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.addMealButton}>
              <Ionicons name="add" size={24} color="#4CAF50" />
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

  return (
    <DraxProvider>
      <ScrollView style={styles.container}>
        <View style={styles.daySelector}>
          <TouchableOpacity
            onPress={handlePreviousDay}
            style={styles.arrowButton}
          >
            <AntDesign name="right" size={16} color="#2A3631" />
          </TouchableOpacity>
          <Text style={styles.dayText}>{daysWithDates[selectedDayIndex]}</Text>
          <TouchableOpacity onPress={handleNextDay} style={styles.arrowButton}>
            <AntDesign name="left" size={16} color="#2A3631" />
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
    marginVertical: 20,
    alignSelf: "center",
  },
  arrowButton: {
    paddingHorizontal: 40,
  },
  dayText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2A3631",
  },
  mealsContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 20,
  },
  mealWrapper: {
    width: "48%",
  },
  mealContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    height: 140,
  },
  mealContainerHovered: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  mealImage: {
    width: 140,
    height: 100,
    borderRadius: 10,
    alignSelf: "center",
  },
  mealTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    color: "#666",
    paddingVertical: 5,
  },
  mealType: {
    color: "#4d4c4c",
    fontSize: 16,
    textAlign: "left",
    paddingBottom: 3,
    paddingLeft: 5,
    fontWeight: "bold",
  },
  addMealButton: {
    alignItems: "center",
    padding: 20,
  },
  addMealText: {
    marginTop: 5,
    color: "#4CAF50",
  },
  recipeItem: {
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
    marginBottom: 10,
  },
  recipeItemText: {
    fontWeight: "bold",
    color: "#000",
  },
  clearButton: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#ff6347",
    borderRadius: 10,
    width: "40%",
    alignSelf: "center",
  },
  clearButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  recipeCard: {
    width: 170,
    marginRight: 15,
    borderRadius: 10,
    overflow: "hidden",
  },
  recipeImage: {
    width: "100%",
    height: 120,
    borderRadius: 10,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
    textAlign: "left",
  },
  categoriesList: {
    alignItems: "center",
    marginBottom: 10,
  },
  categoryItem: {
    backgroundColor: "white",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ebeeec",
    marginHorizontal: 5,
  },
  categoryText: {
    color: "#acacac",
    fontSize: 14,
  },
  selectedCategoryItem: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  selectedCategoryText: {
    color: "white",
    fontWeight: "bold",
  },
  listsContainer: {
    paddingHorizontal: 10,
    paddingVertical: 20,
    marginHorizontal: 10,
    marginBottom: 20,
    backgroundColor: "#F8F9F8",
  },
  recipeList: {},
  dragging: {
    width: 170,
    height: 150,
    opacity: 0.3,
  },
  draggingReleased: {
    opacity: 1,
  },
  deleteIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 12,
    padding: 3,
  },
});
