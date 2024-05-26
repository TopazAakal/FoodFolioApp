import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  fetchAllRecipes,
  fetchAllCategories,
  fetchRecipesByCategory,
} from "../util/database";
import { AntDesign } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [categories, setCategories] = useState([]); // Categories data
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [recipes, setRecipes] = useState([]); // Recipes for selected category
  const [latestRecipes, setLatestRecipes] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      const fetchedCategories = await fetchAllCategories();
      setCategories(fetchedCategories);
      if (fetchedCategories.length > 0) {
        selectCategory(fetchedCategories[0].id);
      }
    };
    loadCategories();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchRecipes = async () => {
        const success = true;
        const data = await fetchAllRecipes();
        if (success) {
          const sortedByRecent = [...data]
            .sort((a, b) => b.id - a.id)
            .slice(0, 6);
          setLatestRecipes(sortedByRecent);
        } else {
          console.log("Failed to fetch recipes");
        }
      };
      fetchRecipes();
    }, [])
  );

  const selectCategory = async (categoryId) => {
    setSelectedCategoryId(categoryId);
    const categoryRecipes = await fetchRecipesByCategory(categoryId);
    setRecipes(categoryRecipes);
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        item.id === selectedCategoryId ? styles.selectedCategoryItem : {},
      ]}
      onPress={() => selectCategory(item.id)}
    >
      <Text
        style={[
          styles.categoryText,
          item.id === selectedCategoryId ? styles.selectedCategoryText : {},
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

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

  const handleSearch = () => {
    navigation.navigate("AllRecipes", {
      searchQuery: searchQuery.trim(),
    });
  };

  const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  };

  const renderRecipe = ({ item }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() =>
        navigation.navigate("RecipeDisplay", { recipeId: item.id })
      }
    >
      <View style={{ position: "relative" }}>
        <Image source={{ uri: item.image }} style={styles.recipeImage} />
        {menuVisible && <View style={overlayStyle} />}
      </View>
      <Text style={styles.recipeTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderRecipeByCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() =>
        navigation.navigate("RecipeDisplay", { recipeId: item.id })
      }
    >
      <View style={{ position: "relative" }}>
        <Image source={{ uri: item.image }} style={styles.recipeImage} />
      </View>
      <Text style={styles.recipeTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>{getGreeting()}</Text>
      <View style={styles.searchRow}>
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
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <AntDesign name="leftsquare" size={40} color="#4CAF50" />
        </TouchableOpacity>
      </View>
      <View>
        <Text style={styles.subTitle}>הארוחות שלי</Text>
        {/* ***************************************/}
        <View
          style={{ backgroundColor: "white", width: 120, height: 150 }}
        ></View>
      </View>
      <View style={styles.latestRecipesHeader}>
        <Text style={styles.subTitle}>נוספו לאחרונה🔥</Text>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => navigation.navigate("AllRecipes")}
        >
          <Text style={styles.moreButtonText}>הצג עוד</Text>
          <AntDesign name="arrowleft" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={latestRecipes}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRecipe}
        style={styles.latestList}
      />

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
      <View style={styles.interestHeader}>
        <Text style={styles.subTitle}>אולי יעניין אותך</Text>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => navigation.navigate("AllRecipes")}
        >
          <Text style={styles.moreButtonText}> לכל המתכונים</Text>
          <AntDesign name="arrowleft" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      />
      <FlatList
        horizontal
        data={recipes}
        renderItem={renderRecipeByCategory}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRecipesList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
    paddingBottom: 50,
    alignItems: "flex-start",
  },
  contentContainer: {
    padding: 15,
    paddingBottom: 50,
    alignItems: "flex-start",
  },
  greeting: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 25,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginRight: 5,
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
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 15,
    bottom: 300,
    zIndex: 1000,
  },

  ButtonContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 15,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 20,
    zIndex: 1,
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
    bottom: 340,
    right: 50,
    zIndex: 1001,
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
    width: 170,
    marginRight: 15,
    borderRadius: 10,
    overflow: "hidden",
  },
  recipeImage: {
    width: "100%",
    height: 120,
    borderRadius: 10,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
    textAlign: "left",
  },
  subTitle: {
    fontSize: 20,
    fontWeight: "bold",
    alignContent: "center",
  },
  latestRecipesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
    paddingLeft: 2,
  },
  interestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center",
    width: "100%",
    marginTop: 15,
    paddingVertical: 0,
    paddingLeft: 2,
  },
  latestList: {
    flexGrow: 0,
    backgroundColor: "transparent",
    padding: 0,
    marginBottom: 20,
  },
  moreButton: {
    paddingVertical: 5,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  moreButtonText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 5,
  },
  categoriesList: {
    alignItems: "center",
    marginBottom: 5,
  },
  categoryItem: {
    backgroundColor: "white",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ebeeec",
    marginHorizontal: 5,
  },
  categoryText: {
    color: "#acacac",
    fontSize: 14,
  },
  selectedCategoryItem: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  selectedCategoryText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default HomeScreen;
