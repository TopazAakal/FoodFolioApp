import AllRecipesScreen from "../screens/AllRecipesScreen";
import HomeScreen from "../screens/HomeScreen";
import { Ionicons } from "@expo/vector-icons";
import ShoppingListScreen from "../screens/ShoppingListScreen";
import MealPlanningScreen from "../screens/MealPlanningScreen";
import AllCategoriesScreen from "../screens/AllCategoriesScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <Tab.Navigator
        backBehavior="initialRoute"
        initialRouteName="Home Screen"
        screenOptions={({ route }) => ({
          headerStyle: {
            backgroundColor: "#fff",
            height: hp("8%"),
          },
          headerTintColor: "black",
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: wp("5.8%"),
          },
          headerTitleAlign: "right",
          headerBackTitleVisible: false,

          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            let iconSize = wp("6.8%");
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
              iconSize = focused ? wp("8.5%") : wp("7.5%");
              customStyle = {
                ...Platform.select({
                  ios: {
                    padding: hp("0.75%"), // 6px converted to percentage based on height
                    bottom: hp("-3.1%"), // -28px converted to percentage based on height
                    zIndex: 10,
                    shadowOffset: { width: 0, height: hp("-0.25%") }, // -2px converted to percentage based on height
                    shadowOpacity: 0.2,
                    shadowRadius: 1,
                    width: wp("15%"), // 60px converted to percentage based on width
                    height: wp("15%"), // 60px converted to percentage based on width
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#000",
                  },
                }),
                backgroundColor: "white",
                borderRadius: wp("17.5%") / 2, // Fully rounded circle
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
                      bottom: 0,
                      backgroundColor: "transparent",
                      height: hp("3.75%"), // 30px converted to percentage based on height
                      width: wp("15%"), // 60px converted to percentage based on width
                      zIndex: 5,
                      borderBottomLeftRadius: wp("17.5%") / 2, // 35px converted to percentage based on width
                      borderBottomRightRadius: wp("17.5%") / 2, // 35px converted to percentage based on width
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
            height: hp("8.2%"), // Set the height to 60
            paddingBottom: hp("0.8%"), // Adjust padding below text
            paddingTop: hp("0.5%"), // Adjust padding above icons
            paddingHorizontal: wp("2.2%"), // Add horizontal padding
          },
          tabBarLabelStyle: {
            fontSize: wp("2.75%"),
          },
          tabBarIconStyle: {
            marginTop: hp("0.5%"), // Add margin above icons
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
