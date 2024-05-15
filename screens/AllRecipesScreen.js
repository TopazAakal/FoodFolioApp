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

const windowWidth = Dimensions.get("window").width;

function AllRecipesScreen({ navigation, route }) {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { categoryId, addingToCategory } = route.params || {};
  const [selectedRecipes, setSelectedRecipes] = useState(new Set());

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const data = await fetchAllRecipes();
        if (data && data.length > 0) {
          setRecipes(data);
          //console.log("Recipes fetched: ", data);
          setFilteredRecipes(data);
        } else {
          console.log("No recipes found or failed to fetch recipes");
        }
      } catch (error) {
        console.error("Failed to fetch recipes", error);
      }
    };

    loadRecipes();
  }, []);

  useEffect(() => {
    setFilteredRecipes(recipes); // Initialize filtered recipes
  }, [recipes]);

  useEffect(() => {
    const filteredData = recipes.filter((recipe) =>
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRecipes(filteredData);
    console.log("Filtered Recipes:", filteredData);
  }, [searchQuery, recipes]);

  const addRecipeToSelectedCategory = async (recipeId) => {
    if (addingToCategory && categoryId) {
      const result = await addRecipeToCategory(categoryId, recipeId);
      if (result.success) {
        console.log(`Recipe ${recipeId} added to category ${categoryId}`);
        navigation.goBack();
      } else {
        console.log(result.message);
      }
    }
  };

  const deleteRecipe = (id) => {
    deleteRecipeById(id, (success) => {
      if (success) {
        fetchAllRecipes((success, data) => {
          if (success) {
            setRecipes(data);
          } else {
            console.log("Failed to fetch recipes after delete");
          }
        });
      } else {
        console.log(`Failed to delete recipe with id ${id}`);
      }
    });
  };

  const toggleRecipeSelection = (recipeId) => {
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

  const renderItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <View style={styles.imageContainer}>
        <Image style={styles.cardImage} source={{ uri: item.image }} />
        <View style={styles.imageOverlay} />
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>

      <TouchableOpacity
        style={styles.checkboxIcon}
        onPress={() => toggleRecipeSelection(item.id)}
      >
        <Ionicons
          name={
            selectedRecipes.has(item.id) ? "checkbox-outline" : "square-outline"
          }
          size={30}
          color="#ffffff"
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="חפש מתכון"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredRecipes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContent}
      />
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.okButton}
          onPress={addSelectedRecipesToCategory}
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
    fontSize: 20,
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
