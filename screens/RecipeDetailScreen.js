import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";
import { fetchRecipeById, deleteRecipeById } from "../util/database";
import { Ionicons } from "@expo/vector-icons";
import { I18nManager } from "react-native";
import Timer from "../components/UI/Timer";
import { Picker } from "@react-native-picker/picker";
import { Entypo } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

function RecipeDeatailScreen({ navigation, route }) {
  const [timers, setTimers] = useState([]);
  const [recipe, setRecipe] = useState({
    title: "",
    instructions: "",
    totalTime: "",
    image: null,
    ingredients: [],
  });
  const [displayedIngredients, setDisplayedIngredients] = useState([]);
  const [isConvertModalVisible, setConvertModalVisible] = useState(false);
  const [conversionType, setConversionType] = useState("multiply");
  const [conversionFactor, setConversionFactor] = useState("1");

  useEffect(() => {
    const { recipeId, selectedCategory } = route.params;
    const fetchRecipe = async () => {
      if (recipeId) {
        try {
          const data = await fetchRecipeById(recipeId);
          if (data) {
            const ingredientsArray = JSON.parse(data.ingredients || []);
            console.log("Ingredients Array:", ingredientsArray);
            const categoryNames = data.categoryNames
              ? data.categoryNames.split(",")
              : [];
            const categoryToShow =
              selectedCategory || categoryNames[0] || "ללא קטגוריה";
            setRecipe({
              ...data,
              ingredients: ingredientsArray,
              categoryToShow,
            });
            setDisplayedIngredients(ingredientsArray);
          } else {
            console.error("No data returned for recipe ID:", recipeId);
          }
        } catch (error) {
          console.error("Failed to fetch recipe for ID:", recipeId, error);
        }
      }
    };

    fetchRecipe();
  }, [route.params]);

  useEffect(() => {
    if (recipe.ingredients.length > 0) {
      let parsedIngredients;
      try {
        parsedIngredients =
          typeof recipe.ingredients === "string"
            ? JSON.parse(recipe.ingredients)
            : recipe.ingredients;
      } catch (error) {
        console.error("Failed to parse ingredients in useEffect:", error);
        parsedIngredients = [];
      }
      setDisplayedIngredients(parsedIngredients);
      console.log(
        "displayedIngredients updated in useEffect:",
        parsedIngredients
      );
    }
  }, [recipe.ingredients]);

  if (!recipe) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  const applyConversion = () => {
    const factor = parseFloat(conversionFactor);
    if (isNaN(factor) || factor <= 0) {
      Alert.alert("שגיאה", "אנא הזן ערך תקף להמרה");
      return;
    }
    console.log("Conversion factor:", factor);
    console.log("Original Ingredients:", recipe.ingredients);

    let ingredients = displayedIngredients;
    if (typeof ingredients === "string") {
      try {
        ingredients = JSON.parse(ingredients);
        console.log("Parsed Ingredients:", ingredients);
      } catch (error) {
        console.error("Failed to parse ingredients:", error);
        Alert.alert("שגיאה", "שגיאה בפירוש המרכיבים");
        return;
      }
    }

    if (!Array.isArray(ingredients)) {
      console.error("Ingredients is not an array:", ingredients);
      Alert.alert("שגיאה", "המרכיבים אינם במבנה תקין");
      return;
    }

    const newIngredients = ingredients.map((ingredient, index) => {
      const quantity = parseFloat(ingredient.quantity);
      if (isNaN(quantity)) {
        console.error("Invalid quantity:", ingredient.quantity);
        return ingredient;
      }
      const newQuantity =
        conversionType === "multiply" ? quantity * factor : quantity / factor;
      return {
        ...ingredient,
        quantity:
          newQuantity % 1 === 0
            ? newQuantity.toString()
            : newQuantity.toFixed(2),
      };
    });

    console.log("Converted Ingredients:", newIngredients);

    setDisplayedIngredients(newIngredients);
    setConvertModalVisible(false);
  };

  const handleDelete = () => {
    Alert.alert("מחיקת מתכון", "האם אתה בטוח שברצונך למחוק את המתכון?", [
      { text: "ביטול", style: "cancel" },
      {
        text: "מחיקה",
        onPress: async () => {
          const recipeId = route.params?.recipeId;
          try {
            if (recipeId) {
              await deleteRecipeById(recipeId);
              Alert.alert("המתכון נמחק בהצלחה", "", [
                { text: "אישור", onPress: () => navigation.goBack() },
              ]);
            } else {
              Alert.alert("שגיאה", "המתכון לא נמחק בהצלחה");
            }
          } catch (error) {
            Alert.alert("שגיאה", "המתכון לא נמחק בהצלחה");
          }
        },
      },
    ]);
  };

  const handleEdit = () => {
    //TODO
    // navigation.navigate("AddRecipe", { recipeId: recipe.id });
  };

  function IngredientItem({ ingredient }) {
    const [isChecked, setIsChecked] = useState(false);

    const toggleCheck = () => setIsChecked(!isChecked);

    return (
      <TouchableOpacity onPress={toggleCheck} style={styles.ingredientItem}>
        {isChecked ? (
          <View style={styles.checkboxChecked}>
            <Ionicons name="checkmark" size={16} color="white" />
          </View>
        ) : (
          <View style={styles.checkbox} />
        )}
        <Text
          style={styles.ingredientText}
        >{`${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`}</Text>
      </TouchableOpacity>
    );
  }

  const formatIngredients = (ingredients) => {
    console.log("formatIngredients called with:", ingredients);
    return ingredients.map((ingredient, index) => (
      <IngredientItem key={index} ingredient={ingredient} />
    ));
  };

  const incrementFactor = () => {
    setConversionFactor((prevFactor) =>
      (parseFloat(prevFactor) + 1).toString()
    );
  };

  const decrementFactor = () => {
    setConversionFactor((prevFactor) => {
      const newFactor = parseFloat(prevFactor) - 1;
      return newFactor > 0 ? newFactor.toString() : "0";
    });
  };

  const addTimer = () => {
    const newTimer = {
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isRunning: false,
      showPicker: true,
    };
    setTimers([...timers, newTimer]);
  };

  const startTimer = (index) => {
    const newTimers = [...timers];
    const totalSeconds =
      newTimers[index].hours * 3600 +
      newTimers[index].minutes * 60 +
      newTimers[index].seconds;
    newTimers[index].totalSeconds = totalSeconds;
    newTimers[index].isRunning = true;
    newTimers[index].showPicker = false;
    setTimers(newTimers);
  };

  const cancelTimer = (index) => {
    setTimers(timers.filter((_, idx) => idx !== index));
  };

  const updateTimerSetting = (index, setting, value) => {
    const newTimers = [...timers];
    newTimers[index][setting] = parseInt(value);
    setTimers(newTimers);
  };

  const handleTimerComplete = () => {
    Alert.alert("נגמר הזמן!", "הטיימר סיים את הספירה");
  };

  const renderTimers = () => {
    return timers.map((timer, index) => (
      <View key={index} style={styles.timerControl}>
        {timer.showPicker && (
          <View style={styles.pickerContainer}>
            <View style={styles.individualPickerContainer}>
              <Picker
                selectedValue={timer.hours}
                onValueChange={(itemValue) =>
                  updateTimerSetting(index, "hours", itemValue)
                }
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <Picker.Item label={`${i} שעות`} value={i} key={i} />
                ))}
              </Picker>
            </View>
            <View style={styles.individualPickerContainer}>
              <Picker
                selectedValue={timer.minutes}
                onValueChange={(itemValue) =>
                  updateTimerSetting(index, "minutes", itemValue)
                }
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {Array.from({ length: 60 }, (_, i) => (
                  <Picker.Item label={`${i} דק'`} value={i} key={i} />
                ))}
              </Picker>
            </View>
            <View style={styles.individualPickerContainer}>
              <Picker
                selectedValue={timer.seconds}
                onValueChange={(itemValue) =>
                  updateTimerSetting(index, "seconds", itemValue)
                }
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {Array.from({ length: 60 }, (_, i) => (
                  <Picker.Item label={`${i} שנ'`} value={i} key={i} />
                ))}
              </Picker>
            </View>
          </View>
        )}
        {timer.totalSeconds > 0 && (
          <Timer
            initialTime={timer.totalSeconds}
            onComplete={() => handleTimerComplete()}
          />
        )}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            onPress={() => startTimer(index)}
            style={styles.circleButton}
          >
            <Text style={styles.buttonText}>התחלה</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => cancelTimer(index)}
            style={[styles.circleButton, styles.cancelButton]}
          >
            <Text style={styles.buttonText}>ביטול</Text>
          </TouchableOpacity>
        </View>
      </View>
    ));
  };

  return (
    <ScrollView style={styles.screen}>
      <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
      <View style={styles.detailsContainer}>
        <Text style={styles.recipeTitle}>{recipe.title}</Text>
        <View style={styles.metaInfo}>
          <Text style={styles.categoryName}>{recipe.categoryToShow}</Text>

          <View style={styles.dot}></View>
          <Text style={styles.totalTime}>{recipe.totalTime}</Text>
        </View>
        <View style={styles.separator} />
        <Text style={styles.heading}>מרכיבים</Text>
        <View>
          {Array.isArray(displayedIngredients) &&
          displayedIngredients.length > 0 ? (
            formatIngredients(displayedIngredients)
          ) : (
            <Text>אין מרכיבים</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.convertUnitsBtn}
          onPress={() => setConvertModalVisible(true)}
        >
          <Entypo name="swap" size={24} color="white" />
          <Text style={styles.convertUnitsBtnText}>המרת יחידות מידה </Text>
        </TouchableOpacity>
        {/* <View>{formatIngredients(recipe.ingredients)}</View> */}
        <Text style={styles.heading}>הוראות הכנה</Text>
        <Text style={styles.instructions}>{recipe.instructions}</Text>
      </View>
      <View style={styles.addTimerContainer}>
        <TouchableOpacity style={styles.addTimerBtn} onPress={addTimer}>
          <Entypo name="time-slot" size={30} color="white" />
          <Text style={styles.addTimerBtnText}>הוסף טיימר </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.timersContainer}>{renderTimers()}</View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={handleEdit}
        >
          <Text style={styles.buttonText}>עריכת מתכון</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.buttonText}>מחיקת מתכון</Text>
        </TouchableOpacity>
      </View>
      <Modal
        visible={isConvertModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setConvertModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>המרת יחידות מידה</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setConversionType("multiply")}
              >
                <View
                  style={[
                    styles.radioCircle,
                    conversionType === "multiply" && styles.selectedRadio,
                  ]}
                />
                <Text style={styles.radioText}>להכפיל כמויות</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setConversionType("divide")}
              >
                <View
                  style={[
                    styles.radioCircle,
                    conversionType === "divide" && styles.selectedRadio,
                  ]}
                />
                <Text style={styles.radioText}>לחלק כמויות</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="minus-box"
                size={45}
                color="black"
                onPress={decrementFactor}
              />
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={conversionFactor}
                onChangeText={(text) => setConversionFactor(text)}
                placeholder="הזן מספר"
              />
              <MaterialCommunityIcons
                name="plus-box"
                size={45}
                color="black"
                onPress={incrementFactor}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={applyConversion}
              >
                <Text style={styles.modalButtonText}>אישור</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setConvertModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>ביטול</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

export default RecipeDeatailScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "white",
  },
  recipeImage: {
    width: "100%",
    height: 300,
  },
  detailsContainer: {
    backgroundColor: "white",
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    marginTop: -20,
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "black",
    marginHorizontal: 10,
  },
  totalTime: {
    fontSize: 16,
  },
  separator: {
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    marginVertical: 8,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "right",
    alignSelf: "flex-start",
  },
  ingredientText: {
    fontSize: 16,
  },
  instructions: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: "left",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#cccccc",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: "45%",
    alignItems: "center",
    marginVertical: 10,
    padding: 15,
  },
  editButton: {
    backgroundColor: "#8a8a8a",
  },
  deleteButton: {
    backgroundColor: "#8a8a8a",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "black",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkboxChecked: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  ingredientText: {
    fontSize: 16,
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  individualPickerContainer: {
    flex: 1,
    alignItems: "center",
  },
  picker: {
    marginHorizontal: 0,
    paddingHorizontal: 0,
    width: 95,
  },
  pickerItem: {
    fontSize: 12,
    height: 120,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -10,
    marginBottom: 20,
  },
  circleButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 50,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  cancelButton: {
    backgroundColor: "#cccccc",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  timersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 4,
  },
  timerControl: {
    width: "49%",
    padding: 10,
    marginVertical: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  addTimerContainer: {
    marginLeft: 10,
    paddingBottom: 5,
  },
  addTimerBtn: {
    backgroundColor: "black",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    width: "35%",
    marginBottom: 10,
  },
  addTimerBtnText: {
    color: "white",
    fontSize: 16,
    paddingRight: 8,
    fontWeight: "bold",
  },
  convertUnitsBtn: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "45%",
    marginBottom: 10,
    marginTop: 10,
  },
  convertUnitsBtnText: {
    color: "white",
    fontSize: 14,
    paddingLeft: 8,
    fontWeight: "bold",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.781)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderWidth: 1,
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 40,
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    width: "90%",
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#000",
    marginRight: 7,
  },
  selectedRadio: {
    backgroundColor: "#000",
  },
  radioText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  input: {
    height: 38,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    width: "20%",
    textAlign: "center",
  },
  incrementButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  incrementButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "70%",
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#cccccc",
  },
});
