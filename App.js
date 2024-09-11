import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { initDB } from "./util/database";
import { I18nManager } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import AddRecipeManuallyScreen from "./screens/AddRecipeManuallyScreen";
import RecipeDetailScreen from "./screens/RecipeDetailScreen";
import AllRecipesScreen from "./screens/AllRecipesScreen";
import AllCategoriesScreen from "./screens/AllCategoriesScreen";
import CategoryRecipesScreen from "./screens/CategoryRecipesScreen";
import AddRecipeByUrlScreen from "./screens/AddRecipeByUrlScreen";
import AddCategoryScreen from "./screens/AddCategory/AddCategoryScreen";
import AddRecipeByImageScreen from "./screens/AddRecipeByImage/AddRecipeByImageScreen";
import ShoppingListScreen from "./screens/ShoppingListScreen";
import MealPlanningScreen from "./screens/MealPlanningScreen";
import SettingsScreen from "./screens/SettingsScreen";
import MyTabs from "./components/MyTabs";
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from "react-native-responsive-screen";

I18nManager.forceRTL(true);
I18nManager.allowRTL(true);

const Stack = createStackNavigator();

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const headerHeight = Platform.OS === "ios" ? 50 : 56;

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
        <Text>טוען...</Text>
      </View>
    );
  } else {
    return (
      <>
        <StatusBar style="auto" />
        <>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                headerStyle: {
                  backgroundColor: "#fff",
                  height: heightPercentageToDP("12%"),
                },
                headerTintColor: "black",
                headerTitleStyle: {
                  fontWeight: "bold",
                  fontSize: widthPercentageToDP("5.2%"),
                },
                headerTitleAlign: "right",
                headerBackTitleVisible: false,
              }}
            >
              <Stack.Screen
                name="Home"
                component={MyTabs}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="AddRecipeManually"
                component={AddRecipeManuallyScreen}
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
                component={RecipeDetailScreen}
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
                      onPress={() => navigation.navigate("AddRecipeManually")}
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
                options={{
                  title: "קטגוריה חדשה",
                }}
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
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: "הגדרות" }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </>
      </>
    );
  }
}
