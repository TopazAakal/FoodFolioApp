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
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import colors from "../constants/colors";

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
    width: wp("80%"),
    backgroundColor: "white",
    padding: hp("2.5%"),
    borderRadius: wp("4%"),
    alignItems: "center",
    borderWidth: wp("1%"),
    borderColor: "black",
  },
  titleContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp("4"),
  },
  modalTitle: {
    fontSize: wp("6%"),
    fontWeight: "bold",
    marginTop: hp("1.5%"),
    marginBottom: hp("1.5%"),
    textAlign: "center",
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: hp("2.5%"),
    width: wp("90%"),
    paddingHorizontal: wp("5%"),
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioCircle: {
    height: wp("5%"),
    width: wp("5%"),
    borderRadius: wp("2.5%"),
    borderWidth: wp("0.5%"),
    borderColor: "#000",
    marginRight: wp("2%"),
  },
  selectedRadio: {
    backgroundColor: "#000",
  },
  radioText: {
    fontSize: wp("4%"),
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginTop: hp("2.5%"),
    marginBottom: hp("5%"),
  },
  input: {
    height: hp("5%"),
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: wp("2%"),
    width: wp("20%"),
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: wp("70%"),
    marginBottom: hp("2%"),
  },
  modalButton: {
    backgroundColor: colors.secondaryGreen,
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("5%"),
    borderRadius: wp("2%"),
  },
  modalButtonText: {
    color: "white",
    fontSize: wp("4%"),
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: colors.light,
  },
});

export default ConversionModal;
