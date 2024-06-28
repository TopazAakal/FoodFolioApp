import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";

const ConversionModal = ({
  isVisible,
  onClose,
  ingredients,
  setIngredients,
  pluralUnits,
  singularUnits,
}) => {
  const [conversionType, setConversionType] = useState("multiply");
  const [conversionFactor, setConversionFactor] = useState("1");

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

  const applyConversion = () => {
    const factor = parseFloat(conversionFactor);
    if (isNaN(factor) || factor <= 0) {
      Alert.alert("שגיאה", "אנא הזן ערך תקף להמרה");
      return;
    }
    console.log("Conversion factor:", factor);

    let ingredientsToConvert = ingredients;
    if (typeof ingredientsToConvert === "string") {
      try {
        ingredientsToConvert = JSON.parse(ingredientsToConvert);
        console.log("Parsed Ingredients:", ingredientsToConvert);
      } catch (error) {
        console.error("Failed to parse ingredients:", error);
        Alert.alert("שגיאה", "שגיאה בפירוש המרכיבים");
        return;
      }
    }

    if (!Array.isArray(ingredientsToConvert)) {
      console.error("Ingredients is not an array:", ingredientsToConvert);
      Alert.alert("שגיאה", "המרכיבים אינם במבנה תקין");
      return;
    }

    const newIngredients = ingredientsToConvert.map((ingredient) => {
      const quantity = parseFloat(ingredient.quantity);
      if (isNaN(quantity)) {
        console.error("Invalid quantity:", ingredient.quantity);
        return ingredient;
      }
      let newQuantity =
        conversionType === "multiply" ? quantity * factor : quantity / factor;

      let newUnit = ingredient.unit;
      if (newUnit === "גרם" && newQuantity >= 1000) {
        newQuantity /= 1000;
        newUnit = 'ק"ג';
      } else if (newUnit === 'מ"ל' && newQuantity >= 1000) {
        newQuantity /= 1000;
        newUnit = "ליטר";
      } else if (newUnit === 'ק"ג' && newQuantity < 1) {
        newQuantity *= 1000;
        newUnit = "גרם";
      } else if (newUnit === "ליטר" && newQuantity < 1) {
        newQuantity *= 1000;
        newUnit = 'מ"ל';
      }

      if (newQuantity > 1 && pluralUnits[newUnit]) {
        newUnit = pluralUnits[newUnit];
      } else if (newQuantity <= 1) {
        newUnit = singularUnits[newUnit] || newUnit;
      }

      return {
        ...ingredient,
        quantity:
          newQuantity % 1 === 0
            ? newQuantity.toString()
            : newQuantity.toFixed(2),
        unit: newUnit,
      };
    });

    console.log("Converted Ingredients:", newIngredients);
    setIngredients(newIngredients);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.modalTitle}>המרת יחידות מידה</Text>
            <FontAwesome5 name="pencil-ruler" size={30} color="black" />
          </View>
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
              onPress={onClose}
            >
              <Text style={styles.modalButtonText}>ביטול</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.781)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 5,
    borderColor: "black",
  },
  titleContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
    textAlign: "center",
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

export default ConversionModal;
