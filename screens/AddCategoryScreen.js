import React, { useState } from "react";
import { View, TextInput, StyleSheet, Alert } from "react-native";
import { insertCategory } from "../util/database";
import ImagePicker from "../components/UI/ImagePicker";
import PrimaryButton from "../components/UI/PrimaryButton";
import colors from "../constants/colors";

const AddCategoryScreen = ({ navigation }) => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState("");

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert("שגיאה", "נא להזין שם קטגוריה", [{ text: "אישור" }]);
      return;
    }

    try {
      const { success, id } = await insertCategory(categoryName, categoryImage);
      if (success) {
        navigation.goBack();
      } else {
        console.log("Failed to add category");
      }
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={categoryName}
        placeholder="שם קטגוריה"
        onChangeText={setCategoryName}
        style={styles.input}
      />
      <View style={{ width: "90%" }}>
        <ImagePicker image={categoryImage} onTakeImage={setCategoryImage} />
      </View>
      <PrimaryButton
        title="שמור"
        onPress={handleSaveCategory}
        style={styles.addButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.white,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.light,
    borderRadius: 10,
    width: "90%",
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    textAlign: "right",
  },
  addButton: {
    width: "90%",
  },
});

export default AddCategoryScreen;
