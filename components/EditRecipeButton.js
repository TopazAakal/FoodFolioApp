import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const EditRecipeButton = ({ navigation, recipeId, onPress }) => {
  const handleEdit = () => {
    if (onPress) onPress();
    navigation.navigate("AddRecipeManually", { recipeId });
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
    borderRadius: wp("5%"),
    width: wp("32.5%"),
    alignItems: "center",
    padding: wp("1%"),
  },
  editButton: {},
  buttonText: {
    color: "black",
    fontSize: wp("4%"),
  },
});

export default EditRecipeButton;
