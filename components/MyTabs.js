import AllRecipesScreen from "../screens/AllRecipesScreen";
import HomeScreen from "../screens/HomeScreen";
import { Ionicons } from "@expo/vector-icons";
import ShoppingListScreen from "../screens/ShoppingListScreen";
import MealPlanningScreen from "../screens/MealPlanningScreen";
import AllCategoriesScreen from "../screens/AllCategoriesScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home Screen"
      screenOptions={({ route, navigation }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Meal Plan") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "Shopping List") {
            iconName = focused ? "cart" : "cart-outline";
          } else if (route.name === "All Recipes") {
            iconName = focused ? "book" : "book-outline";
          } else if (route.name === "Home Screen") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "All Categories") {
            iconName = focused ? "grid" : "grid-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#4CAF50", // Active icon color
        tabBarInactiveTintColor: "gray", // Inactive icon color
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
  );
}

export default MyTabs;
