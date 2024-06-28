import React, { useState } from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const IngredientItem = ({ ingredient }) => {
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
};

export default IngredientItem;

const styles = StyleSheet.create({
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
});
