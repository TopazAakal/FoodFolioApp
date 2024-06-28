import React from "react";
import { TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { deleteRecipeById } from "../util/database";

const DeleteRecipeButton = ({ navigation, recipeId }) => {
  const handleDelete = () => {
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
    backgroundColor: "#cccccc",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: "45%",
    alignItems: "center",
    marginVertical: 10,
    padding: 15,
  },
  deleteButton: {
    backgroundColor: "#8a8a8a",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default DeleteRecipeButton;
