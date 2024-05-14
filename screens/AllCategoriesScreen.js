import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { fetchAllCategories, deleteCategoryById } from "../util/database";

const windowWidth = Dimensions.get("window").width;

const AllCategoriesScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const fetchCategories = async () => {
        try {
          const data = await fetchAllCategories();
          setCategories(data);
        } catch (error) {
          console.log("Failed to fetch categories", error);
        }
      };

      fetchCategories();
    }, [])
  );

  const handleDeleteCategory = async (categoryId) => {
    try {
      const result = await deleteCategoryById(categoryId);
      if (result.success) {
        console.log(`Deleted ${result.rowsAffected} rows.`);
        const updatedCategories = await fetchAllCategories();
        setCategories(updatedCategories);
        console.log("Category deleted successfully");
      } else {
        console.log(
          "No rows affected. Category might not exist or is protected."
        );
      }
    } catch (error) {
      console.log("Failed to delete category", error);
    }
  };

  const handleSelectCategory = (categoryId, categoryName) => {
    navigation.navigate("CategoryRecipesScreen", { categoryId, categoryName });
  };

  const renderItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        onPress={() => handleSelectCategory(item.id, item.name)}
      >
        <Image
          style={styles.cardImage}
          source={
            item.image
              ? { uri: item.image }
              : require("../images/category_placeholder.jpg")
          }
        />
        <View>
          <Text style={styles.cardText}>{item.name}</Text>
        </View>
      </TouchableOpacity>
      {item.name !== "מועדפים" && (
        <TouchableOpacity
          style={styles.deleteIcon}
          onPress={() => handleDeleteCategory(item.id)}
        >
          <Ionicons name="trash" size={24} color="#df3119" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.listContentContainer}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddCategory")}
      >
        <Ionicons name="add" size={30} style={styles.addButtonIcon} />
        <Text style={styles.addButtonText}>הוסף קטגוריה</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  listContentContainer: {
    paddingBottom: 60,
  },
  cardContainer: {
    width: windowWidth / 2 - 10,
    borderRadius: 10,
    overflow: "hidden",
    margin: 5,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardImage: {
    width: "100%",
    height: windowWidth / 2 - 10,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    padding: 10,
  },
  cardText: {
    position: "absolute",
    left: 10,
    bottom: 10,
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  deleteIcon: {
    position: "absolute",
    top: 5,
    right: 5,
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
    fontWeight: "bold",
  },
});

export default AllCategoriesScreen;
