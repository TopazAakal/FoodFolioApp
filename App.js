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
import HomeScreen from "./screens/HomeScreen";
import { Entypo } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import ShoppingListScreen from "./screens/ShoppingListScreen";
import MealPlanningScreen from "./screens/MealPlanningScreen";

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
        <StatusBar style="auto" />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: "#fff",
                height: 110,
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
              name="Home"
              component={HomeScreen}
              options={({ navigation }) => ({
                title: "",
                headerRight: () => (
                  <TouchableOpacity
                    onPress={() => navigation.navigate("ShoppingList")}
                    style={{ marginRight: 20 }}
                  >
                    <Entypo name="shopping-cart" size={26} color="black" />
                  </TouchableOpacity>
                ),
                headerLeft: () => (
                  <TouchableOpacity
                    onPress={() => {}}
                    style={{ marginLeft: 20 }}
                  >
                    <Ionicons name="menu" size={28} color="black" />
                  </TouchableOpacity>
                ),
              })}
            />
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
            <Stack.Screen
              name="ShoppingList"
              component={ShoppingListScreen}
              options={{ title: "רשימת קניות" }}
            />
            <Stack.Screen
              name="MealPlan"
              component={MealPlanningScreen}
              options={{ title: "לוח ארוחות" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </>
    );
  }
}
