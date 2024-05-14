import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { initDB } from "./util/database";
import { I18nManager } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import AddRecipeScreen from "./screens/AddRecipeScreen";
import RecipeDeatailScreen from "./screens/RecipeDetailScreen";
import AllRecipesScreen from "./screens/AllRecipesScreen";
import AllCategoriesScreen from "./screens/AllCategoriesScreen";
import CategoryRecipesScreen from "./screens/CategoryRecipesScreen";
import AddCategoryScreen from "./screens/AddCategoryScreen";
import AddRecipeByUrlScreen from "./screens/AddRecipeByUrlScreen";
import AddRecipeByImageScreen from "./screens/AddRecipeByImageScreen";

I18nManager.forceRTL(true);

const Stack = createStackNavigator();

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        await initDB();
        setDbInitialized(true);
      } catch (e) {
        console.warn("Application setup failed:", e);
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  if (!dbInitialized) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#4db384" />
        <Text>Loading database...</Text>
      </View>
    );
  } else {
    return (
      <>
        <StatusBar style="light" />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="AllCategories"
            screenOptions={{
              headerStyle: {
                backgroundColor: "#fff",
                height: 120,
              },
              headerTintColor: "black",
              headerTitleStyle: {
                fontWeight: "bold",
                fontSize: 22,
              },
              headerTitleAlign: "right",
              headerBackTitleVisible: false,
            }}
          >
            <Stack.Screen
              name="AddRecipe"
              component={AddRecipeScreen}
              options={{ title: "הוספת מתכון ידנית " }}
            />
            <Stack.Screen
              name="AddRecipeByUrl"
              component={AddRecipeByUrlScreen}
              options={{ title: "הוספת מתכון URL" }}
            />
            <Stack.Screen
              name="AddRecipeByImage"
              component={AddRecipeByImageScreen}
              options={{ title: "הוספת מתכון באמצעות תמונה" }}
            />
            <Stack.Screen
              name="RecipeDisplay"
              component={RecipeDeatailScreen}
              options={{ title: "", headerTransparent: true }}
            />
            <Stack.Screen
              name="AllRecipes"
              component={AllRecipesScreen}
              options={{ title: "כל המתכונים" }}
            />
            <Stack.Screen
              name="AllCategories"
              component={AllCategoriesScreen}
              options={({ navigation }) => ({
                title: "קטגוריות",
                headerRight: () => (
                  <TouchableOpacity
                    onPress={() => navigation.navigate("AddRecipe")}
                    style={{ marginRight: 15 }}
                  >
                    <AntDesign name="pluscircle" size={28} color="black" />
                  </TouchableOpacity>
                ),
              })}
            />
            <Stack.Screen
              name="CategoryRecipesScreen"
              component={CategoryRecipesScreen}
              options={({ route }) => ({ title: route.params.categoryName })}
            />
            <Stack.Screen
              name="AddCategory"
              component={AddCategoryScreen}
              options={{ title: "קטגוריה חדשה" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </>
    );
  }
}
