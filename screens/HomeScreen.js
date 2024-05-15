import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { fetchAllRecipes } from "../util/database";

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    fetchAllRecipes((success, data) => {
      if (success) {
        setRecipes(data);
        console.log("Recipes fetched: ", data);
      } else {
        console.log("Failed to fetch recipes");
      }
    });
  }, []);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const getGreeting = () => {
    const date = new Date(); // Gets the current date and time
    date.setHours(date.getHours() + date.getTimezoneOffset() / 60 + 3); // Convert to Israel Time (GMT+3)

    const hours = date.getHours();
    const minutes = date.getMinutes();

    if (hours < 5 || (hours === 22 && minutes >= 0) || hours > 22) {
      return "לילה טוב!";
    } else if (hours < 11 || (hours === 11 && minutes < 30)) {
      return "בוקר טוב!";
    } else if (hours < 17 || (hours === 17 && minutes === 0)) {
      return "צהריים טובים!";
    } else {
      return "ערב טוב!";
    }
  };

  const renderRecipe = ({ item }) => (
    <View style={styles.recipeCard}>
      <Image source={{ uri: item.image }} style={styles.recipeImage} />
      <Text style={styles.recipeTitle}>{item.title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>{getGreeting()}</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="חיפוש"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        <Ionicons
          name="search"
          size={20}
          color="black"
          style={styles.iconStyle}
        />
      </View>
      <View>
        <Text style={styles.subTitle}>הארוחות שלי</Text>
        {/* <FlatList
          data={recipes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRecipe}
          horizontal={true}
        /> */}
      </View>
      <View>
        <Text style={styles.subTitle}>נוספו לאחרונה🔥</Text>
      </View>
      <View>
        <Text style={styles.subTitle}>אולי יעניין אותך</Text>
      </View>
      <View style={styles.ButtonContainer}>
        {menuVisible && (
          <View style={styles.menu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("AddRecipe")}
            >
              <Text style={styles.menuText}>הוספת מתכון ידנית</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("AddRecipeByUrl")}
            >
              <Text style={styles.menuText}>הוספת מתכון מקישור</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("AddRecipeByImage")}
            >
              <Text style={styles.menuText}>הוספת מתכון מתמונה</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity onPress={toggleMenu} style={styles.fab}>
          <Ionicons name="add" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "flex-start",
    backgroundColor: "#fff",
    padding: 25,
  },
  greeting: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    width: "100%",
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    textAlign: "right",
    marginRight: 5,
  },
  iconStyle: {
    marginRight: 10,
    color: "#ccc",
  },
  subTitle: {
    fontSize: 20,
    marginVertical: 40,
    fontWeight: "bold",
  },
  ButtonContainer: {
    position: "absolute",
    left: 20,
    bottom: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 28,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },

  menu: {
    backgroundColor: "white",
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    paddingVertical: 10,
    paddingHorizontal: 5,
    width: 180,
    position: "absolute",
    bottom: 50,
    right: 20,
    zIndex: 1000,
  },

  menuItem: {
    fontWeight: "bold",
    paddingVertical: 8,
    paddingHorizontal: 5,
    alignItems: "flex-start",
  },
  menuText: {
    fontSize: 16,
    paddingHorizontal: 5,
  },
  recipeCard: {
    width: 140,
    marginRight: 15,
    borderRadius: 10,
    overflow: "hidden",
  },
  recipeImage: {
    width: "100%",
    height: 100,
    borderRadius: 10,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
});

export default HomeScreen;
