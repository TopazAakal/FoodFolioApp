import React from "react";
import { TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { deleteRecipeById } from "../util/database";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

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
                {
                  text: "אישור",
                  onPress: () =>
                    setTimeout(() => {
                      navigation.reset(
                        {
                          index: 0,
                          routes: [{ name: "Home" }],
                        },
                        1000
                      );
                    }),
                },
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
    borderRadius: wp("5%"),
    width: wp("32.5%"),
    alignItems: "center",
    padding: wp("1%"),
  },
  deleteButton: {},
  buttonText: {
    color: "black",
    fontSize: wp("4%"), 
  },
});

export default DeleteRecipeButton;
