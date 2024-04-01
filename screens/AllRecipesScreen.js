import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { fetchAllRecipes, deleteRecipeById } from "../util/database";
import { Ionicons } from "react-native-vector-icons";

function AllRecipesScreen({ navigation }) {
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

  const renderItem = ({ item }) => (
    <View style={styles.recipeItemRow}>
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() => {
          console.log("Navigating to RecipeDisplay with ID:", item.id);
          navigation.navigate("RecipeDisplay", { recipeId: item.id });
        }}
      >
        <Text style={styles.title}>{item.title}</Text>
        <Image source={{ uri: item.image }} style={styles.recipeImage} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => deleteRecipe(item.id)}
        style={styles.deleteIcon}
      >
        <Ionicons name="trash-outline" size={24} color="#4b0707" />
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={recipes}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
    />
  );
}

export default AllRecipesScreen;

const styles = StyleSheet.create({
  recipeItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  recipeImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  recipeItemRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  deleteIcon: {
    padding: 10,
    marginLeft: 10,
  },
});
