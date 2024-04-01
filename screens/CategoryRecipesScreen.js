import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import {
  fetchRecipesByCategory,
  deleteRecipeFromCategory,
} from "../util/database";
import { Ionicons } from "@expo/vector-icons";

const windowWidth = Dimensions.get("window").width;

const CategoryRecipesScreen = ({ navigation, route }) => {
  const { categoryId, categoryName } = route.params;
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    fetchRecipesByCategory(categoryId, (success, data) => {
      if (success) {
        setRecipes(data);
      } else {
        console.log("Failed to fetch recipes for category ID:", categoryId);
      }
    });
  }, [categoryId]);

  const navigateToRecipeDetail = (recipeId) => {
    navigation.navigate("RecipeDisplay", {
      recipeId: recipeId,
      selectedCategory: categoryName,
    });
  };

  const refreshRecipes = () => {
    fetchRecipesByCategory(categoryId, (success, data) => {
      if (success) {
        setRecipes(data);
      } else {
        console.log("Failed to fetch recipes for category ID:", categoryId);
      }
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => navigateToRecipeDetail(item.id)}
    >
      <Image style={styles.cardImage} source={{ uri: item.image }} />
      <Text style={styles.cardTitle}>{item.title}</Text>
      <View style={styles.detailsContainer}>
        <Text style={styles.categoryText}>{categoryName}</Text>
        <View style={styles.timeCircle} />
        <Text style={styles.timeText}>{item.totalTime}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteIcon}
        onPress={() =>
          deleteRecipeFromCategory(item.id, categoryId, refreshRecipes)
        }
      >
        <Ionicons name="trash-outline" size={24} color="#df3119" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const addRecipeHandler = () => {
    //TODO
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.listContentContainer}
      />
      <TouchableOpacity style={styles.addButton} onPress={addRecipeHandler}>
        <Ionicons name="add" size={30} style={styles.addButtonIcon} />
        <Text style={styles.addButtonText}>הוסף מתכון</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  listContentContainer: {
    marginHorizontal: 5,
  },
  cardContainer: {
    borderRadius: 10,
    overflow: "hidden",
    margin: 10,
    width: windowWidth / 2 - 20,
    backgroundColor: "#fff",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#000",
    paddingVertical: 10,
    textAlign: "left",
  },

  addButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: "#4db384",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    flexDirection: "row-reverse",
    marginBottom: 20,
  },

  addButtonText: {
    color: "#4db384",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 5,
  },

  addButtonIcon: {
    color: "#4db384",
    fontSize: 22,
    paddingRight: 5,
  },
  detailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingBottom: 10,
    textAlign: "right",
  },
  categoryText: {
    fontSize: 15,
    color: "#0000008c",
  },

  timeCircle: {
    width: 7,
    height: 7,
    borderRadius: 5,
    backgroundColor: "#0000008c",
    marginHorizontal: 8,
  },
  timeText: {
    fontSize: 15,
    color: "#0000008c",
  },
  deleteIcon: {
    position: "absolute",
    top: 5,
    right: 5,
  },
});

export default CategoryRecipesScreen;
