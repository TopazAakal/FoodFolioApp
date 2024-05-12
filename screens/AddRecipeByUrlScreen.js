import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import CustomButton from "../components/UI/CustomButton";

function AddRecipeByUrlScreen() {
  const [recipeUrl, setRecipeUrl] = useState("");

  const handleSaveRecipe = () => {
    console.log("URL submitted:", recipeUrl);
  };

  return (
    <KeyboardAwareScrollView style={styles.rootContainer}>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="הזן קישור למתכון"
          value={recipeUrl}
          onChangeText={setRecipeUrl}
          autoCapitalize="none"
          keyboardType="url"
        />

        <CustomButton title="שמור מתכון" onPress={handleSaveRecipe} />
      </View>
    </KeyboardAwareScrollView>
  );
}

export default AddRecipeByUrlScreen;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  form: {
    margin: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    width: "100%",
    marginBottom: 20,
  },
});
