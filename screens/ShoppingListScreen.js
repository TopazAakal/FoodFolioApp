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
  const [ingredientsList, setIngredientsList] = useState([]);
  const selectedRecipes = route.params?.selectedRecipes || [];
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadShoppingList = async () => {
      const list = await fetchShoppingList();
      const initializedList = list.map((ingredient) => ({
        ...ingredient,
        checked: ingredient.checked ?? false,
      }));
      console.log("Loaded shopping list:", initializedList);
      setIngredientsList(initializedList);
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

        const combinedIngredients = combineIngredients(allIngredients);
        setIngredientsList((prevList) => [...prevList, ...combinedIngredients]);
      }
    };

    fetchIngredients();
  }, [selectedRecipes]);

  const groupIngredientsByDepartment = (ingredients) => {
    const grouped = {};

    // Initialize grouped object with all departments
    departments.forEach((department) => {
      grouped[department.name] = [];
    });

    // Fill the departments with their respective ingredients
    ingredients.forEach((ingredient) => {
      const department = ingredient.department || "אחר";
      if (!grouped[department]) {
        grouped[department] = [];
      }
      grouped[department].push(ingredient);
    });

    // Sort the grouped object based on departmentOrder
    return Object.keys(grouped)
      .sort((a, b) => departmentOrder.indexOf(a) - departmentOrder.indexOf(b))
      .map((department) => ({ department, ingredients: grouped[department] }));
  };

  const combineIngredients = (ingredients) => {
    const combined = {};
    ingredients.forEach((ingredient) => {
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
          name: name,
          department: ingredient.department || "אחר",
          quantity: quantity,
          unit: unit,
          department: ingredient.department || "אחר",
          checked: ingredient.checked ?? false,
        };
      }
    });
    return Object.values(combined);
  };

  const toggleChecked = (key) => {
    setIngredientsList((prevList) =>
      prevList.map((item) => {
        if (`${item.name}-${item.unit}` === key) {
          return { ...item, checked: !item.checked };
        }
        return item;
      })
    );
  };

  // Save the shopping list to the database whenever it changes
  useEffect(() => {
    const saveList = async () => {
      console.log("Saving shopping list:", ingredientsList);
      await saveShoppingList(ingredientsList);
      console.log("Shopping list saved successfully:", ingredientsList);
    };

    saveList();
  }, [ingredientsList]);

  const handleSaveList = async () => {
    if (ingredientsList.length > 0) {
      console.log("Saving shopping list:", ingredientsList);
      await saveShoppingList(ingredientsList);
      console.log("Shopping list saved successfully:", ingredientsList);
    } else {
      console.log("No ingredients to save.");
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
            setIngredientsList([]);
            console.log("Shopping list cleared");
          },
        },
      ],
      { cancelable: false }
    );
  };

  React.useLayoutEffect(() => {
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
  }, [navigation, ingredientsList]);

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
    //TODO
  };

  const handleShareList = async () => {
    if (ingredientsList.length === 0) {
      Alert.alert("הרשימה ריקה", "אין מוצרים לשיתוף");
      return;
    }

    const listContent = ingredientsList
      .map((item) => `${item.quantity} ${item.unit} ${item.name}`)
      .join("\n");

    const fileUri = FileSystem.documentDirectory + "shopping_list.txt";
    await FileSystem.writeAsStringAsync(fileUri, listContent);

    await Sharing.shareAsync(fileUri);
  };

  const renderItem = ({ item, index }) => {
    const itemKey = `${item.name}-${item.unit}-${index}`;
    return (
      <View style={styles.itemContainer} key={itemKey}>
        <TouchableOpacity onPress={() => toggleChecked(itemKey)}>
          <View style={styles.checkbox}>
            {item.checked && (
              <FontAwesome5 name="check" size={16} color="green" />
            )}
          </View>
        </TouchableOpacity>
        <Text
          style={styles.itemText}
        >{`${item.quantity} ${item.unit} ${item.name}`}</Text>
      </View>
    );
  };

  const renderDepartmentHeader = (department) => {
    const departmentData = departments.find((dep) => dep.name === department);
    return (
      <View style={styles.departmentHeader} key={department}>
        <Image source={departmentData.image} style={styles.departmentImage} />
        <Text style={styles.departmentTitle}>{departmentData.name}</Text>
      </View>
    );
  };

  const groupedIngredients = groupIngredientsByDepartment(ingredientsList);

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
      <FlatList
        data={groupedIngredients}
        renderItem={({ item }) => (
          <View key={item.department}>
            {renderDepartmentHeader(item.department)}
            {item.ingredients.map((ingredient, index) =>
              renderItem({ item: ingredient, index })
            )}
          </View>
        )}
        keyExtractor={(item) => item.department}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
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
