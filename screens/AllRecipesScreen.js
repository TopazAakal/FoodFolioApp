import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from "react-native";
import {
  fetchAllRecipes,
  deleteRecipeById,
  addRecipeToCategory,
} from "../util/database";
import { Ionicons } from "react-native-vector-icons";
import getImageSource from "../util/image";

const windowWidth = Dimensions.get("window").width;

function AllRecipesScreen({ navigation, route }) {
  const { fromCategoryScreen, fromShoppingCart, categoryId, addingToCategory } =
    route.params || {};
  const { searchQuery: externalSearchQuery } = route.params || {};
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery || "");
  const [selectedRecipes, setSelectedRecipes] = useState(new Set());

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const data = await fetchAllRecipes();
        if (data && data.length > 0) {
          setRecipes(data);
          filterRecipes(searchQuery, data);
        } else {
          console.log("No recipes found or failed to fetch recipes");
        }
      } catch (error) {
        console.error("Failed to fetch recipes", error);
      }
    };

    loadRecipes();
  }, []);

  const filterRecipes = (query, recipesArray) => {
    const filtered = query
      ? recipesArray.filter((recipe) =>
          recipe.title.toLowerCase().includes(query.toLowerCase())
        )
      : recipesArray;
    setFilteredRecipes(filtered);
  };

  useEffect(() => {
    filterRecipes(searchQuery, recipes);
  }, [searchQuery]);

  const handleSearchInputChange = (query) => {
    setSearchQuery(query);
  };

  const toggleRecipeSelection = (recipeId) => {
    if (!fromCategoryScreen && !fromShoppingCart) return;

    const newSet = new Set(selectedRecipes);
    if (selectedRecipes.has(recipeId)) {
      newSet.delete(recipeId);
    } else {
      newSet.add(recipeId);
    }
    setSelectedRecipes(new Set(newSet));
  };

  const addSelectedRecipesToCategory = async () => {
    for (let recipeId of selectedRecipes) {
      await addRecipeToCategory(categoryId, recipeId);
    }
    console.log(`Added recipes to category ${categoryId}`);
    navigation.goBack();
  };

  const selectAllRecipes = () => {
    if (selectedRecipes.size === recipes.length) {
      setSelectedRecipes(new Set());
    } else {
      const newSelectedRecipes = new Set(recipes.map((recipe) => recipe.id));
      setSelectedRecipes(newSelectedRecipes);
    }
  };

  const handleFinishSelection = () => {
    const selectedRecipesArray = Array.from(selectedRecipes);
    navigation.navigate("ShoppingList", {
      selectedRecipes: selectedRecipesArray,
    });
  };

  const handleRecipePress = (recipeId) => {
    if (fromCategoryScreen || fromShoppingCart) {
      toggleRecipeSelection(recipeId);
    } else {
      navigation.navigate("RecipeDisplay", { recipeId: recipeId });
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => handleRecipePress(item.id)}
    >
      <View style={styles.imageContainer}>
        <Image style={styles.cardImage} source={getImageSource(item.image)} />
        {(fromCategoryScreen || fromShoppingCart) && (
          <View style={styles.imageOverlay} />
        )}
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      {(fromCategoryScreen || fromShoppingCart) &&
        selectedRecipes.has(item.id) && (
          <TouchableOpacity
            style={styles.checkboxIcon}
            onPress={() => toggleRecipeSelection(item.id)}
          >
            <Ionicons
              name={
                selectedRecipes.has(item.id)
                  ? "checkbox-outline"
                  : "square-outline"
              }
              size={30}
              color="#ffffff"
            />
          </TouchableOpacity>
        )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {fromCategoryScreen && (
        <TextInput
          style={styles.searchBar}
          placeholder="חפש מתכון"
          value={searchQuery}
          onChangeText={handleSearchInputChange}
        />
      )}
      <FlatList
        data={filteredRecipes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContent}
      />
      {(fromCategoryScreen || fromShoppingCart) && (
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity
            style={styles.okButton}
            onPress={
              fromShoppingCart
                ? handleFinishSelection
                : addSelectedRecipesToCategory
            }
          >
            <Text style={styles.okButtonText}>אישור</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.selectAllButton}
            onPress={selectAllRecipes}
          >
            <Text style={styles.selectAllButtonText}>בחר הכל</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default AllRecipesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchBar: {
    height: 45,
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 15,
    width: "90%",
    paddingHorizontal: 10,
    marginHorizontal: 10,
    marginVertical: 10,
    alignSelf: "center",
    textAlign: "right",
  },
  listContent: {
    paddingHorizontal: 15,
  },
  cardContainer: {
    borderRadius: 15,
    overflow: "hidden",
    margin: 10,
    width: windowWidth / 2 - 30,
    backgroundColor: "#fff",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: "relative",
  },
  checkboxIcon: {
    position: "absolute",
    top: 2,
    left: 2,
    padding: 6,
    zIndex: 2,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageContainer: {
    width: "100%",
    height: 180,
    overflow: "hidden",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.29)",
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#000",
    paddingTop: 7,
    textAlign: "center",
  },
  okButton: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginHorizontal: 10,
    borderWidth: 2,
    borderColor: "#4db384",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4db384",
  },
  okButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 120,
  },
  selectAllButton: {
    paddingHorizontal: 10,
    marginHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: "#4db384",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  selectAllButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4db384",
  },
});
