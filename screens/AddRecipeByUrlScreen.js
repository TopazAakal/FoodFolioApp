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
    <KeyboardAwareScrollView
      style={styles.rootContainer}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="הזן קישור למתכון"
          value={recipeUrl}
          onChangeText={setRecipeUrl}
          autoCapitalize="none"
          keyboardType="url"
        />
      </View>
      <CustomButton
        title="שמור מתכון"
        onPress={handleSaveRecipe}
        style={styles.button}
      />
    </KeyboardAwareScrollView>
  );
}

export default AddRecipeByUrlScreen;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  form: {
    margin: 20,
    paddingHorizontal: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 7,
    fontSize: 16,
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 15,
    textAlign: "right",
  },
  button: {
    alignSelf: "center",
  },
});
