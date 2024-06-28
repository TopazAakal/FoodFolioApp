import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const EditRecipeButton = ({ navigation, recipeId }) => {
  const handleEdit = () => {
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
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default EditRecipeButton;
