import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const EditRecipeButton = ({ navigation, recipeId, onPress }) => {
  const handleEdit = () => {
    if (onPress) onPress();
    navigation.navigate("AddRecipe", { recipeId });
  };

  return (
    <TouchableOpacity
      style={[styles.button, styles.editButton]}
      onPress={handleEdit}
    >
      <Text style={styles.buttonText}>עריכת מתכון</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    padding: 7,
  },
  editButton: {},
  buttonText: {
    color: "black",
    fontSize: 16,
  },
});

export default EditRecipeButton;
