import React from "react";
import { TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { deleteRecipeById } from "../util/database";

const DeleteRecipeButton = ({ navigation, recipeId, onPress }) => {
  const handleDelete = () => {
    if (onPress) onPress();
    Alert.alert("מחיקת מתכון", "האם אתה בטוח שברצונך למחוק את המתכון?", [
      { text: "ביטול", style: "cancel" },
      {
        text: "מחיקה",
        onPress: async () => {
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

  return (
    <TouchableOpacity
      style={[styles.button, styles.deleteButton]}
      onPress={handleDelete}
    >
      <Text style={styles.buttonText}>מחיקת מתכון</Text>
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
  deleteButton: {},
  buttonText: {
    color: "black",
    fontSize: 16,
  },
});

export default DeleteRecipeButton;
