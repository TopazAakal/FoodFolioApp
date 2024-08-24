import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { insertRecipeWithCategories } from "../util/database";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import PrimaryButton from "../components/UI/PrimaryButton";
import LoadingOverlay from "../components/UI/LoadingOverlay";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

function AddRecipeByUrlScreen({ navigation }) {
  const [recipeUrl, setRecipeUrl] = useState("");
  const [detectedText, setDetectedText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSaveRecipe = async () => {
    console.log("URL submitted:", recipeUrl);
    const encodedUrl = encodeURIComponent(recipeUrl);
    try {
      if (!recipeUrl) {
        Alert.alert("שגיאה", "אנא הזן קישור למתכון", [{ text: "אישור" }]);
        return;
      }
      setLoading(true);
      const response = await axios.post(
        "https://ilwcjy1wk4.execute-api.us-east-1.amazonaws.com/dev/",
        {
          URL: encodedUrl,
        }
      );
      try {
        console.log("Response:", response.data.body);
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
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
      return;
    }
  };

  useEffect(() => {
    if (detectedText) {
      console.log("Detected Text:", detectedText);
      // Check for required fields
      if (!detectedText.title) {
        console.error("Recipe title is missing");
        alert("שגיאה בהוספת המתכון: כותרת המתכון חסרה");
        return;
      }
      // Validate ingredients format
      if (
        !Array.isArray(detectedText.ingredients) ||
        detectedText.ingredients.length === 0
      ) {
        console.error("Invalid ingredients format or no ingredients found");
        alert("שגיאה בהוספת המתכון: נתוני המתכון לא תקינים");
        return;
      }

      // Insert the recipe data into the database
      const insertRecipe = async () => {
        const recipeData = {
          title: detectedText.title,
          ingredients: detectedText.ingredients,
          instructions: detectedText.instructions,
          totalTime:
            detectedText["total time"] === "undefined"
              ? "לא צוין"
              : detectedText["total time"],
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

  const showSupportedSites = () => {
    Alert.alert(
      "רשימת אתרים נתמכים",
      "\n- אליטה אופק \n- דניאל עמית \n- עדיקוש \n- השולחן \n- קובי אדרי \n- לייזה פאנלים \n- ענת אלישע \n- רון יוחננוב \n- שירי עמית \n- פודי \n- רחלי Krutit",
      [{ text: "סגור", style: "cancel" }]
    );
  };

  return (
    <KeyboardAwareScrollView
      style={styles.rootContainer}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.elementContainer}>
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
        <MaterialIcons
          styles={styles.infoIcon}
          name="info-outline"
          size={wp("7.5%")}
          paddingTop={wp("4%")}
          marginLeft={wp("1.5%")}
          color="black"
          onPress={showSupportedSites}
          style={styles.infoIcon}
        />
      </View>
      <PrimaryButton
        title="שמור מתכון"
        onPress={handleSaveRecipe}
        style={styles.button}
      />

      {loading && <LoadingOverlay message="מייבא מתכון..." />}
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
    padding: wp("2.5%"),
  },
  elementContainer: {
    flexDirection: "row",
    marginBottom: hp("2.5%"),
  },
  form: {
    flex: 1,
    marginTop: hp("1.25%"),
    marginLeft: wp("2.5%"),
    paddingLeft: wp("2.5%"),
  },
  infoIcon: {
    flex: 0.1,
    marginTop: hp("0.625%"),
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: hp("1.25%"), // Adjust padding to be responsive
    borderRadius: wp("1.75%"), // Adjust border radius
    fontSize: wp("4%"), // Adjust font size
    width: "100%",
    marginBottom: hp("2.5%"), // Adjust margin bottom
    paddingHorizontal: wp("3.75%"), // Adjust horizontal padding
    textAlign: "right",
  },
  button: {
    position: "absolute",
    bottom: hp("2.5%"), // Adjust position from bottom
    left: wp("2.5%"), // Adjust position from left
    right: wp("5%"),
  },
});
