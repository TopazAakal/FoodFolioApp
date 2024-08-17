import AllRecipesScreen from "../screens/AllRecipesScreen";
import HomeScreen from "../screens/HomeScreen";
import { Ionicons } from "@expo/vector-icons";
import ShoppingListScreen from "../screens/ShoppingListScreen";
import MealPlanningScreen from "../screens/MealPlanningScreen";
import AllCategoriesScreen from "../screens/AllCategoriesScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <Tab.Navigator
        initialRouteName="Home Screen"
        screenOptions={({ route }) => ({
          headerStyle: {
            backgroundColor: "#fff",
            height: 80,
          },
          headerTintColor: "black",
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 22,
          },
          headerTitleAlign: "right",
          headerBackTitleVisible: false,

          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            let iconSize = 26;
            let customStyle = {};
            let isHomeScreen = route.name === "Home Screen";

            if (route.name === "Meal Plan") {
              iconName = focused ? "calendar" : "calendar-outline";
            } else if (route.name === "Shopping List") {
              iconName = focused ? "cart" : "cart-outline";
            } else if (route.name === "All Recipes") {
              iconName = focused ? "book" : "book-outline";
            } else if (route.name === "Home Screen") {
              iconName = focused ? "home" : "home-outline";
              iconSize = focused ? 34 : 30;
              customStyle = {
                ...Platform.select({
                  ios: {
                    padding: 6,
                    bottom: -28, // Adjusted to reduce space below the icon
                    zIndex: 10, // Ensure it's on top
                    shadowOffset: { width: 0, height: -2 }, // Negative height to focus shadow upwards
                    shadowOpacity: 0.2,
                    shadowRadius: 1,
                    width: 60,
                    height: 60,
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#000", // Add shadow for a floating effect
                  },
                }),
                backgroundColor: "white",
                borderRadius: 35, // Fully rounded circle
                position: "absolute",
              };
            } else if (route.name === "All Categories") {
              iconName = focused ? "grid" : "grid-outline";
            }

            return (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                {isHomeScreen && (
                  <View
                    style={{
                      position: "absolute",
                      // bottom: 0,
                      backgroundColor: "transparent", // Background color of the tab bar
                      // height: 30, // Adjust this value to cover the bottom half of the circle
                      // width: 60,
                      // zIndex: 5, // Below the circle but above the tab bar
                      // borderBottomLeftRadius: 35,
                      // borderBottomRightRadius: 35,
                    }}
                  />
                )}
                <View style={customStyle}>
                  <Ionicons name={iconName} size={iconSize} color={color} />
                </View>
              </View>
            );
          },
          tabBarActiveTintColor: "#4CAF50", // Active icon color
          tabBarInactiveTintColor: "gray", // Inactive icon color
          tabBarStyle: {
            height: 70, // Set the height to 60
            paddingBottom: 15, // Adjust padding below text
            paddingTop: 3, // Adjust padding above icons
            paddingHorizontal: 10, // Add horizontal padding
          },
          tabBarLabelStyle: {
            marginBottom: 0, // Bring text closer to the icons
            fontSize: 11,
          },
          tabBarIconStyle: {
            marginTop: 5,
          },
        })}
      >
        <Tab.Screen
          name="All Categories"
          component={AllCategoriesScreen}
          options={{ title: "קטגוריות" }}
        />
        <Tab.Screen
          name="All Recipes"
          component={AllRecipesScreen}
          options={{ title: "מתכונים" }}
        />
        <Tab.Screen
          name="Home Screen"
          component={HomeScreen}
          options={{
            title: "ראשי",
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="Shopping List"
          component={ShoppingListScreen}
          options={{ title: "רשימת קניות" }}
        />
        <Tab.Screen
          name="Meal Plan"
          component={MealPlanningScreen}
          options={{ title: "לוח ארוחות" }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

export default MyTabs;
