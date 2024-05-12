import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { insertCategory } from "../util/database";
import ImagePicker from "../components/UI/ImagePicker";
import { I18nManager } from "react-native";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const AddCategoryScreen = ({ navigation }) => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState("");

  const handleSaveCategory = async () => {
    try {
      const { success, id } = await insertCategory(categoryName, categoryImage);
      if (success) {
        console.log(`Category added successfully with ID: ${id}`);
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
      <TouchableOpacity style={styles.addButton} onPress={handleSaveCategory}>
        <Text style={styles.addButtonText}>שמור</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    width: "90%",
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
  },
  buttonContainer: {
    marginTop: 20,
    width: "100%",
    borderRadius: 10,
  },
  addButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: "#4db384",
    borderRadius: 15,
    backgroundColor: "#4db384",
    flexDirection: "row-reverse",
    alignSelf: "center",
    width: "90%",
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 5,
  },
});

export default AddCategoryScreen;
