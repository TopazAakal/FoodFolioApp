import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { readAsStringAsync, EncodingType } from "expo-file-system";
import axios from "axios";
import { insertRecipeWithCategories } from "../../util/database";
import ImagePicker from "../../components/UI/ImagePicker";
import PrimaryButton from "../../components/UI/PrimaryButton";
import LoadingOverlay from "../../components/UI/LoadingOverlay";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

function AddRecipeByImageScreen({ navigation }) {
  const [imageUri, setImageUri] = useState(null);
  const [detectedText, setDetectedText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSaveImage = async () => {
    if (!imageUri) {
      Alert.alert("שגיאה", "אנא בחר תמונה להעלאה", [{ text: "אישור" }]);
      return;
    }

    setLoading(true);

    const base64Image = await readAsStringAsync(imageUri, {
      encoding: EncodingType.Base64,
    });

    try {
      const response = await axios.post(
        "https://ilwcjy1wk4.execute-api.us-east-1.amazonaws.com/dev/",
        {
          image_data: String(base64Image),
        }
      );

      try {
        if (response.data.statusCode !== 200) {
          Alert.alert(
            "שגיאה",
            "התמונה לא זוהתה כתמונת מתכון. נסה שנית או הכנס את המתכון באופן ידני.",
            [
              {
                text: "אישור",
                onPress: () => {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "Home" }],
                  });
                },
              },
            ],
            { cancelable: false }
          );
          return;
        }
        const data = JSON.parse(response.data.body);
        const resultString = data.result
          .replace(/\\n/g, "")
          .replace(/\\"/g, '"')
          .replace(/(\d+):/g, '"$1":');
        const detectedJson = JSON.parse(resultString);
        if (detectedJson.Ingredients) {
          detectedJson.ingredients = detectedJson.Ingredients;
          delete detectedJson.Ingredients;
        }
        setDetectedText(detectedJson);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        return;
      }
    } catch (error) {
      console.error("Error calling API:", error);
    }
  };

  useEffect(() => {
    if (detectedText) {
      console.log("Detected Text:", detectedText);

      // Check for required fields
      if (!detectedText.title) {
        console.error("Recipe title is missing");
        alert("שגיאה בזיהוי המתכון: כותרת המתכון חסרה");
        return;
      }

      // Validate ingredients format
      if (
        !Array.isArray(detectedText.ingredients) ||
        detectedText.ingredients.length === 0
      ) {
        console.error("Invalid ingredients format or no ingredients found");
        alert("שגיאה בזיהוי המתכון: נתוני המתכון לא נמצאו או בפורמט לא תקין");
        return;
      }

      // Insert the recipe data into the database
      const insertRecipe = async () => {
        const recipeData = {
          title: detectedText.title,
          ingredients: detectedText.ingredients,
          instructions: detectedText.instructions,
          imageUri: null,
          totalTime:
            detectedText["totalTime"] === "undefined"
              ? "לא צוין"
              : detectedText["totalTime"],
        };
        try {
          const newRecipeId = await insertRecipeWithCategories(recipeData);
          console.log(`Recipe added successfully with ID: ${newRecipeId}`);
          navigation.reset({
            index: 0,
            routes: [
              { name: "Home" },
              {
                name: "RecipeDisplay",
                params: { recipeId: newRecipeId },
              },
            ],
          });
        } catch (error) {
          console.error("Error inserting recipe:", error);
        }
      };
      insertRecipe();
    }
  }, [detectedText, navigation]);

  return (
    <KeyboardAwareScrollView
      style={styles.rootContainer}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.form}>
        <ImagePicker
          image={imageUri}
          onTakeImage={setImageUri}
          style={{
            width: wp("92.5%"), // 370px converted to percentage based on width
            height: hp("65%"), // 600px converted to percentage based on height
            marginTop: hp("1.75%"),
          }}
        />
      </View>
      <PrimaryButton
        title="שמור מתכון"
        onPress={handleSaveImage}
        style={styles.button}
      />
      {loading && <LoadingOverlay message="מייצר מתכון..." />}
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
    paddingHorizontal: wp("5%"), // 20px converted to percentage based on width
  },
  form: {
    margin: wp("5%"), // 20px converted to percentage based on width
    flex: 1,
    paddingHorizontal: wp("1.25%"), // 5px converted to percentage based on width
  },
  button: {
    position: "absolute",
    bottom: hp("2.5%"), // 20px converted to percentage based on height
    left: wp("5%"), // 20px converted to percentage based on width
    right: wp("5%"), // 20px converted to percentage based on width
  },
});
