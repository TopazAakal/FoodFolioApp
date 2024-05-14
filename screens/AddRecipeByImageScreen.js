import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import ImagePicker from "../components/UI/ImagePicker";
import CustomButton from "../components/UI/CustomButton";

function AddRecipeByImageScreen({ navigation }) {
  const [imageUri, setImageUri] = useState(null);

  const handleSaveImage = () => {
    console.log("Photo uploaded:", imageUri);
  };

  return (
    <KeyboardAwareScrollView
      style={styles.rootContainer}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.form}>
        <ImagePicker
          image={imageUri}
          onTakeImage={setImageUri}
          style={styles.imagePickerStyle}
        />
      </View>
      <CustomButton
        title="שמור מתכון"
        onPress={handleSaveImage}
        style={styles.button}
      />
    </KeyboardAwareScrollView>
  );
}

export default AddRecipeByImageScreen;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  form: {
    margin: 20,
    flex: 1,
    paddingHorizontal: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  button: {
    alignSelf: "center",
  },
  imagePickerStyle: {
    height: 500,
  },
});
