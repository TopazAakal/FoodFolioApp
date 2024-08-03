import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import {
  fetchRecipeById,
  fetchShoppingList,
  saveShoppingList,
  clearShoppingList,
} from "../util/database";
import { FontAwesome5 } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AntDesign } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";

const departments = [
  { name: "פירות וירקות", image: require("../images/fruits.png") },
  { name: "בשר ועוף", image: require("../images/chicken.png") },
  { name: "דגים", image: require("../images/fish.png") },
  { name: "תבלינים", image: require("../images/spices.png") },
  { name: "מוצרי חלב וביצים", image: require("../images/milk-eggs.png") },
  { name: "ממרחים", image: require("../images/sauces.png") },
  { name: "קפה ותה", image: require("../images/coffee.png") },
  { name: "ממתקים", image: require("../images/sweets.png") },
  { name: "אלכוהול", image: require("../images/alcohol.png") },
  { name: "שימורים", image: require("../images/cans.png") },
  { name: "לחם", image: require("../images/bread.png") },
  { name: "אחר", image: require("../images/other.png") },
];

const departmentOrder = departments.map((department) => department.name);

function ShoppingListScreen({ navigation, route }) {
  const [groupedIngredients, setGroupedIngredients] = useState([]);
  const selectedRecipes = route.params?.selectedRecipes || [];
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadShoppingList = async () => {
      const list = await fetchShoppingList();
      if (Array.isArray(list)) {
        groupIngredientsByDepartment(list);
      } else {
        console.error("Loaded shopping list is not an array:", list);
        setGroupedIngredients([]);
      }
    };

    loadShoppingList();
  }, []);

  useEffect(() => {
    const fetchIngredients = async () => {
      if (selectedRecipes.length > 0) {
        let allIngredients = [];

        for (let recipeId of selectedRecipes) {
          const data = await fetchRecipeById(recipeId);

          if (data) {
            let ingredientsArray;
            try {
              ingredientsArray = JSON.parse(data.ingredients);

              if (typeof ingredientsArray === "string") {
                ingredientsArray = JSON.parse(ingredientsArray);
              }

              if (Array.isArray(ingredientsArray)) {
                allIngredients = allIngredients.concat(ingredientsArray);
              } else {
                console.error(
                  "Ingredients are not in array format after parsing:",
                  ingredientsArray
                );
              }
            } catch (error) {
              console.error("Failed to parse ingredients:", error);
            }
          } else {
            console.error("No data returned for recipe ID:", recipeId);
          }
        }

        const combinedIngredients = combineIngredients(
          groupedIngredients.flatMap((group) => group.ingredients),
          allIngredients
        );
        groupIngredientsByDepartment(combinedIngredients);
        handleSaveList(combinedIngredients);
      }
    };

    fetchIngredients();
  }, [selectedRecipes]);

  const combineIngredients = (existingIngredients, newIngredients) => {
    const combined = {};
    const allIngredients = existingIngredients.concat(newIngredients);
    let idCounter = 1;

    allIngredients.forEach((ingredient) => {
      if (
        !ingredient ||
        typeof ingredient !== "object" ||
        Array.isArray(ingredient)
      ) {
        console.error("Invalid ingredient format:", ingredient);
        return;
      }

      const name = ingredient.name || "Unknown ingredient";
      const unit = ingredient.unit || "Unknown unit";
      const quantity = parseFloat(ingredient.quantity) || 0;

      if (quantity === 0 || !name || !unit) {
        console.error("Invalid ingredient data:", ingredient);
        return;
      }

      const key = `${name}-${unit}`;
      if (combined[key]) {
        combined[key].quantity += quantity;
      } else {
        combined[key] = {
          id: idCounter++,
          name: name,
          department: ingredient.department || "אחר",
          quantity: quantity,
          unit: unit,
          checked: ingredient.checked || false,
        };
      }
    });

    return Object.values(combined);
  };

  const groupIngredientsByDepartment = (ingredients) => {
    if (!ingredients || ingredients.length === 0) {
      setGroupedIngredients([]);
      return;
    }

    const grouped = {};
    departments.forEach((department) => {
      grouped[department.name] = [];
    });

    ingredients.forEach((ingredient) => {
      const department = ingredient.department || "אחר";
      if (grouped[department]) {
        if (!ingredient.name) {
          console.error("Ingredient name is missing:", ingredient);
          return;
        }
        grouped[department].push(ingredient);
      } else {
        console.error(`Invalid department: ${department}`);
      }
    });

    const sortedGrouped = Object.keys(grouped)
      .sort((a, b) => departmentOrder.indexOf(a) - departmentOrder.indexOf(b))
      .map((department) => ({ department, ingredients: grouped[department] }));

    setGroupedIngredients(sortedGrouped);
  };

  const validateIngredients = (ingredients) => {
    if (!Array.isArray(ingredients)) {
      console.error("validateIngredients received invalid input:", ingredients);
      return [];
    }

    return ingredients.filter((ingredient) => {
      if (!ingredient.name) {
        console.error("Ingredient with invalid name:", ingredient);
        return false;
      }
      return true;
    });
  };

  const handleSaveList = async (ingredients) => {
    if (!Array.isArray(ingredients)) {
      return;
    }

    const validIngredients = validateIngredients(ingredients);
    if (validIngredients.length > 0) {
      try {
        await saveShoppingList(validIngredients);
      } catch (error) {
        console.error("Error saving shopping list:", error);
      }
    }
  };

  const clearList = () => {
    Alert.alert(
      "אישור מחיקה",
      "האם אתה בטוח שברצונך למחוק את כל הרשימה?",
      [
        {
          text: "ביטול",
          style: "cancel",
        },
        {
          text: "אישור",
          onPress: async () => {
            await clearShoppingList();
            setGroupedIngredients([]);
            console.log("Shopping list cleared");
          },
        },
      ],
      { cancelable: false }
    );
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity onPress={clearList} style={{ marginRight: 15 }}>
            <FontAwesome5 name="trash" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShareList}
            style={{ marginRight: 15 }}
          >
            <AntDesign name="sharealt" size={24} color="black" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, groupedIngredients]);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleAddProductsFromRecipe = () => {
    handleSaveList();
    setMenuVisible(false);
    navigation.navigate("AllRecipes", { fromShoppingCart: true });
  };

  const handleAddProductsManually = () => {
    setMenuVisible(false);
    setSearchVisible(true);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleShareList = async () => {
    if (groupedIngredients.length === 0) {
      Alert.alert("הרשימה ריקה", "אין מוצרים לשיתוף");
      return;
    }

    const filteredGroupedIngredients = groupedIngredients.filter(
      (group) => group.ingredients.length > 0
    );

    const listContent = filteredGroupedIngredients
      .map((group) => {
        const departmentHeader = `${group.department}:\n`;
        const ingredientsList = group.ingredients
          .map((item) => `- ${item.quantity} ${item.unit} ${item.name}`)
          .join("\n");
        return departmentHeader + ingredientsList;
      })
      .join("\n\n");

    const fileUri = FileSystem.documentDirectory + "רשימת קניות.txt";
    await FileSystem.writeAsStringAsync(fileUri, listContent);

    await Sharing.shareAsync(fileUri);
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.itemContainer} key={item.id}>
        <TouchableOpacity onPress={() => toggleChecked(item.id)}>
          <View style={styles.checkbox}>
            {item.checked && (
              <FontAwesome5 name="check" size={16} color="#4CAF50" />
            )}
          </View>
        </TouchableOpacity>
        <Text style={styles.itemText}>
          {`${item.quantity} ${item.unit} ${item.name}`}
        </Text>
      </View>
    );
  };

  const renderDepartmentHeader = (department) => {
    const departmentData = departments.find((dep) => dep.name === department);
    if (!departmentData) {
      console.error(`No image found for department: ${department}`);
      return null;
    }
    return (
      <View style={styles.departmentHeader} key={department}>
        <Image source={departmentData.image} style={styles.departmentImage} />
        <Text style={styles.departmentTitle}>{departmentData.name}</Text>
      </View>
    );
  };

  const toggleChecked = (id) => {
    setGroupedIngredients((prevGrouped) =>
      prevGrouped.map((group) => ({
        ...group,
        ingredients: group.ingredients.map((ingredient) => {
          if (ingredient.id === id) {
            return { ...ingredient, checked: !ingredient.checked };
          }
          return ingredient;
        }),
      }))
    );
  };

  return (
    <View style={styles.container}>
      {searchVisible && (
        <TextInput
          style={styles.searchBar}
          placeholder="חפש מוצרים..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      )}
      {groupedIngredients.length > 0 ? (
        <FlatList
          data={groupedIngredients.filter(
            (group) => group.ingredients.length > 0
          )}
          renderItem={({ item }) => (
            <View key={item.department}>
              {renderDepartmentHeader(item.department)}
              {item.ingredients.map((ingredient, index) =>
                renderItem({ item: ingredient, index })
              )}
            </View>
          )}
          keyExtractor={(item) =>
            item.department + Math.random().toString(36).substring(7)
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <Text>אין מוצרים ברשימה.</Text>
      )}
      <View style={styles.ButtonContainer}>
        {menuVisible && (
          <View style={styles.menu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleAddProductsFromRecipe}
            >
              <Text style={styles.menuText}>הוספת מוצרים ממתכון</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleAddProductsManually}
            >
              <Text style={styles.menuText}>הוספת מוצרים ידנית</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity onPress={toggleMenu} style={styles.fab}>
          <Ionicons name="add" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default ShoppingListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  itemContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 15,
  },
  itemText: {
    fontSize: 16,
    flex: 1,
    textAlign: "left",
    marginLeft: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 2,
    borderColor: "#acacac",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  separator: {
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  clearButton: {
    marginRight: 15,
  },
  ButtonContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 15,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 20,
    zIndex: 1,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 29,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 15,
    bottom: 30,
    zIndex: 1000,
  },
  menu: {
    backgroundColor: "white",
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    width: 200,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    paddingVertical: 10,
    paddingHorizontal: 5,
    position: "absolute",
    bottom: 65,
    right: 50,
    zIndex: 1001,
  },
  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 5,
    alignItems: "flex-start",
  },
  menuText: {
    fontSize: 16,
    paddingHorizontal: 5,
    fontWeight: "bold",
  },
  searchBar: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    textAlign: "right",
  },
  departmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
    backgroundColor: "#f8f8f8",
    marginTop: 10,
  },
  departmentImage: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  departmentTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
