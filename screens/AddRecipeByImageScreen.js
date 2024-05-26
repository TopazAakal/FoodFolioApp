import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import ImagePicker from "../components/UI/ImagePicker";
import CustomButton from "../components/UI/CustomButton";
import { readAsStringAsync, EncodingType } from "expo-file-system";
import axios from "axios";

function AddRecipeByImageScreen({ navigation }) {
  const [imageUri, setImageUri] = useState(null);

  const handleSaveImage = async () => {
    try {
      if (!imageUri) {
        alert("Please pick an image first.");
        return;
      }
      console.log(imageUri);
      const apiKey = "AIzaSyDlUdIzb7DqD7SgK2wteQcj2w_r-5rmxEY";
      const apiURL = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
      // const response = await uploadImage(imageUri);

      const base64Image = await readAsStringAsync(imageUri, {
        encoding: EncodingType.Base64,
      });

      const requestData = {
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [
              {
                type: "TEXT_DETECTION",
                maxResults: 1,
              },
            ],
          },
        ],
      };
      const apiResponse = await axios.post(apiURL, requestData);
      console.log(
        "api response",
        apiResponse.data.responses[0].fullTextAnnotation.text
      );
    } catch (error) {
      console.log("Error:", error);
    }
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
