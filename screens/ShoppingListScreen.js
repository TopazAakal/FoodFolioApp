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
import { FontAwesome5 } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { formatUnit } from "../util/unitConversion";
import Feather from "@expo/vector-icons/Feather";
import CustomModalDropdown from "../components/UI/CustomModalDropdown";
import { unitOptions, departments } from "../constants/recipeConstants";
import MenuButton from "../components/UI/MenuButton";
import PrimaryButton from "../components/UI/PrimaryButton";

import {
  fetchRecipeById,
  fetchShoppingList,
  saveShoppingList,
  clearShoppingList,
  deleteShoppingListItems,
} from "../util/database";
import { Pressable } from "react-native";

const departmentOrder = departments.map((department) => department.name);

function ShoppingListScreen({ navigation, route }) {
  const [groupedIngredients, setGroupedIngredients] = useState([]);
  const selectedRecipes = route.params?.selectedRecipes || [];
  const [showManualInput, setShowManualInput] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(true);
  const [ingredientName, setIngredientName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [selectedUnit, setSelectedUnit] = useState(unitOptions[0].value);
  const [selectedDepartment, setSelectedDepartment] = useState(
    departments[0].name
  );

  const [dropdownTop, setDropdownTop] = useState(null);
  const [dropdownLeft, setDropdownLeft] = useState(null);
  const [departmentDropdownTop, setDepartmentDropdownTop] = useState(null);
  const [departmentDropdownLeft, setDepartmentDropdownLeft] = useState(null);

  const unitLabels = unitOptions.map((option) => option.label);
  const departmentLabels = departments.map((department) => department.name);
  const menuOptions = [
    {
      title: "הוספת מוצרים ממתכון",
      onPress: () => {
        console.log("Adding products from recipe");
        handleAddProductsFromRecipe();
      },
    },
    {
      title: "הוספת מוצרים ידנית",
      onPress: () => {
        console.log("Adding products manually");
        handleAddProductsManually();
      },
    },
  ];

  useEffect(() => {
    loadShoppingList();
  }, []);

  useEffect(() => {
    if (selectedRecipes.length > 0) {
      fetchIngredientsForSelectedRecipes();
    }
  }, [selectedRecipes]);

  const loadShoppingList = async () => {
    const list = await fetchShoppingList();
    if (Array.isArray(list)) {
      groupIngredientsByDepartment(list);
    } else {
      console.error("Loaded shopping list is not an array:", list);
      setGroupedIngredients([]);
    }
  };

  const fetchIngredientsForSelectedRecipes = async () => {
    let allIngredients = [];

    for (let recipeId of selectedRecipes) {
      const data = await fetchRecipeById(recipeId);
      if (data) {
        const ingredientsArray = parseIngredients(data.ingredients);
        if (ingredientsArray) {
          allIngredients = allIngredients.concat(ingredientsArray);
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
  };

  const parseIngredients = (ingredients) => {
    try {
      let parsedIngredients = JSON.parse(ingredients);
      if (typeof parsedIngredients === "string") {
        parsedIngredients = JSON.parse(parsedIngredients);
      }
      if (Array.isArray(parsedIngredients)) {
        return parsedIngredients;
      } else {
        console.error(
          "Ingredients are not in array format after parsing:",
          parsedIngredients
        );
        return null;
      }
    } catch (error) {
      console.error("Failed to parse ingredients:", error);
      return null;
    }
  };

  const combineIngredients = (existingIngredients, newIngredients) => {
    const combined = {};
    const allIngredients = existingIngredients.concat(newIngredients);
    let idCounter = 1;

    allIngredients.forEach((ingredient) => {
      if (!isValidIngredient(ingredient)) {
        console.error("Invalid ingredient format:", ingredient);
        return;
      }

      const { name, unit, quantity, department, checked } = ingredient;
      const key = `${name}-${unit}`;

      if (combined[key]) {
        combined[key].quantity += quantity;
      } else {
        combined[key] = {
          id: idCounter++,
          name,
          department: department || "אחר",
          quantity,
          unit,
          checked: checked || false,
        };
      }
    });

    return Object.values(combined);
  };

  const isValidIngredient = (ingredient) => {
    if (
      !ingredient ||
      typeof ingredient !== "object" ||
      Array.isArray(ingredient)
    ) {
      return false;
    }
    const { name, unit, quantity } = ingredient;
    return name && unit && parseFloat(quantity) > 0;
  };

  const groupIngredientsByDepartment = (ingredients) => {
    if (!ingredients || ingredients.length === 0) {
      setGroupedIngredients([]);
      return;
    }

    const grouped = initializeGroupedDepartments();
    ingredients.forEach((ingredient) => {
      const department = ingredient.department || "אחר";
      if (grouped[department]) {
        grouped[department].push(ingredient);
      } else {
        console.error(`Invalid department: ${department}`);
      }
    });

    const sortedGrouped = sortAndConvertToGroupedArray(grouped);
    setGroupedIngredients(sortedGrouped);
  };

  const initializeGroupedDepartments = () => {
    const grouped = {};
    departments.forEach((department) => {
      grouped[department.name] = [];
    });
    return grouped;
  };

  const sortAndConvertToGroupedArray = (grouped) => {
    return Object.keys(grouped)
      .sort((a, b) => departmentOrder.indexOf(a) - departmentOrder.indexOf(b))
      .map((department) => ({ department, ingredients: grouped[department] }));
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
    } else {
      console.log("No ingredients to save.");
    }
  };

  const clearList = () => {
    const checkedItems = groupedIngredients
      .flatMap((group) => group.ingredients)
      .filter((ingredient) => ingredient.checked);

    if (checkedItems.length > 0) {
      // Confirm deletion of checked items
      Alert.alert(
        "אישור מחיקה",
        "האם אתה בטוח שברצונך למחוק את המוצרים המסומנים?",
        [
          {
            text: "ביטול",
            style: "cancel",
          },
          {
            text: "אישור",
            onPress: async () => {
              const idsToDelete = checkedItems.map((item) => item.id);
              await deleteShoppingListItems(idsToDelete);

              const updatedGroupedIngredients = groupedIngredients.map(
                (group) => ({
                  ...group,
                  ingredients: group.ingredients.filter(
                    (ingredient) => !ingredient.checked
                  ),
                })
              );

              setGroupedIngredients(
                updatedGroupedIngredients.filter(
                  (group) => group.ingredients.length > 0
                )
              );
              handleSaveList(
                updatedGroupedIngredients.flatMap((group) => group.ingredients)
              );
            },
          },
        ],
        { cancelable: false }
      );
    } else {
      // Confirm deletion of entire list
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
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        !showManualInput && (
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
  }, [navigation, groupedIngredients, showManualInput]);

  const handleAddProductsFromRecipe = () => {
    handleSaveList();
    navigation.reset({
      index: 2,
      routes: [
        { name: "Home" },
        {
          name: "ShoppingList",
        },
        {
          name: "AllRecipes",
          params: { fromShoppingCart: true },
        },
      ],
    });
  };

  const handleAddProductsManually = () => {
    setShowManualInput(true);
    setShowShoppingList(false);
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

  const addManualIngredient = () => {
    if (
      !ingredientName.trim() ||
      !quantity.trim() ||
      !selectedUnit ||
      !selectedDepartment
    ) {
      Alert.alert("שגיאה", "נא למלא את כל השדות לפני הוספת המוצר", [
        { text: "אישור" },
      ]);
      return;
    }

    const newIngredient = {
      id: new Date().getTime(),
      name: ingredientName,
      quantity: parseFloat(quantity),
      unit: selectedUnit,
      department: selectedDepartment,
      checked: false,
    };

    const updatedIngredients = combineIngredients(
      groupedIngredients.flatMap((group) => group.ingredients),
      [newIngredient]
    );

    groupIngredientsByDepartment(updatedIngredients);
    handleSaveList(updatedIngredients);

    setIngredientName("");
    setQuantity("");
    setSelectedUnit(unitOptions[0].value);
    setSelectedDepartment(departments[0].name);
    setShowManualInput(false);
    setShowShoppingList(true);
  };

  const renderItem = ({ item }) => {
    const quantity = item.quantity ? parseFloat(item.quantity) : 1;
    const unit = formatUnit(quantity, item.unit || "");

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
          {`${item.quantity} ${unit} ${item.name}`}
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
      {showManualInput && (
        <View style={styles.addIngredientSection}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>הוספת מוצר לרשימת קניות</Text>
            <TouchableOpacity
              onPress={() => {
                setShowManualInput(false);
                setShowShoppingList(true);
              }}
            >
              <Feather name="x" size={28} color="black" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.ingredientInput}
            placeholder="שם המוצר"
            placeholderTextColor="#666"
            value={ingredientName}
            onChangeText={setIngredientName}
            returnKeyType="done"
          />
          <View style={styles.quantityUnitContainer}>
            <TextInput
              style={styles.quantityInput}
              placeholder="0"
              placeholderTextColor="#666"
              value={quantity}
              onChangeText={(text) => setQuantity(text.replace(/[^0-9]/g, ""))}
              keyboardType="numeric"
            />
            <View
              style={styles.pickerContainer}
              onLayout={(event) => {
                const { x, y } = event.nativeEvent.layout;
                setDropdownLeft(x);
                setDropdownTop(y);
              }}
            >
              {unitOptions.length > 0 && (
                <CustomModalDropdown
                  options={unitLabels}
                  defaultValue={unitOptions[0].label}
                  style={styles.dropdown}
                  textStyle={styles.dropdownText}
                  dropdownStyle={[styles.dropdownStyle, { width: "45%" }]}
                  dropdownTextStyle={styles.dropdownOptionText}
                  dropdownTextHighlightStyle={styles.dropdownOptionText}
                  onSelect={(index, value) =>
                    setSelectedUnit(unitOptions[index].value)
                  }
                  adjustFrame={(style) => {
                    style.left = dropdownLeft + 225;
                    style.top = dropdownTop + 295;
                    return style;
                  }}
                />
              )}
            </View>
          </View>
          <View
            style={styles.pickerContainerFull}
            onLayout={(event) => {
              const { x, y } = event.nativeEvent.layout;
              setDepartmentDropdownLeft(x);
              setDepartmentDropdownTop(y);
            }}
          >
            {departments.length > 0 && (
              <CustomModalDropdown
                options={departmentLabels}
                defaultValue={departments[0].name}
                style={styles.dropdown}
                textStyle={styles.dropdownText}
                dropdownStyle={[styles.dropdownStyle, { width: "95%" }]}
                dropdownTextStyle={styles.dropdownOptionText}
                dropdownTextHighlightStyle={styles.dropdownOptionText}
                onSelect={(index, value) =>
                  setSelectedDepartment(departments[index].name)
                }
                adjustFrame={(style) => {
                  style.left = departmentDropdownLeft + 10;
                  style.top = departmentDropdownTop + 165;
                  return style;
                }}
              />
            )}
          </View>
          <PrimaryButton
            title="הוסף מוצר"
            onPress={addManualIngredient}
            style={{ marginTop: 20 }}
          />
        </View>
      )}
      {showShoppingList && (
        <View style={{ flex: 1 }}>
          <FlatList
            contentContainerStyle={{
              flexGrow: 1,
            }}
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
            keyExtractor={(item, index) => item.department + index.toString()}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            // contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={() => (
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: 16,
                  color: "#666",
                  marginTop: 40,
                }}
              >
                אין מוצרים ברשימה.
              </Text>
            )}
          />
        </View>
      )}
      {!showManualInput && (
        <>
          {/* <Pressable
            style={styles.overlay}
            onPress={() => setMenuVisible(false)}
          /> */}
          <MenuButton
            menuOptions={menuOptions}
            style={{ right: 16, bottom: 25 }}
            fabStyle={{ top: 15 }}
            menuStyle={{ width: 190, bottom: 20, right: 35, zIndex: 1001 }}
          />
        </>
      )}
    </View>
  );
}

export default ShoppingListScreen;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
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
  addIngredientSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    color: "#2A3631",
    fontWeight: "bold",
    textAlign: "left",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    paddingTop: 20,
    paddingBottom: 20,
  },
  ingredientInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ingredientInput: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 16,
    textAlign: "right",
    marginVertical: 10,
    height: 45,
  },
  quantityUnitContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  quantityInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#ccc",
    paddingVertical: 10,
    fontSize: 16,
    textAlign: "right",
    paddingLeft: 5,
    marginRight: 10,
    height: 45,
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    overflow: "hidden",
    marginVertical: 10,
    height: 45,
  },
  pickerContainerFull: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
    height: 45,
  },
  picker: {
    width: "100%",
    height: 45,
  },
  pickerItem: {
    fontSize: 14,
  },
  dropdown: {
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    width: "100%",
  },
  dropdownText: {
    fontSize: 16,
    color: "#666",
  },
  dropdownStyle: {
    borderRadius: 10,
    borderWidth: 1,
    position: "absolute",
  },
  dropdownOptionText: {
    fontSize: 16,
    color: "#666",
    padding: 10,
    textAlign: "left",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    width: "100%",
  },
  unitPicker: {
    width: "100%",
  },
  departmentPicker: {
    width: "100%",
    paddingVertical: 6,
    itemStyle: { height: 120, fontSize: 16 },
    marginBottom: 10,
  },
});
