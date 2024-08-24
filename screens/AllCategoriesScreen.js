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
import SecondaryButton from "../components/UI/SecondaryButton";
import colors from "../constants/colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

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
      }
    } catch (error) {
      console.error("Failed to delete category", error);
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
          <Ionicons name="trash" size={wp("6%")} color="#df3119" />
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
      <SecondaryButton
        title="הוסף קטגוריה"
        onPress={() => navigation.navigate("AddCategory")}
        style={styles.addButton}
      >
        <Ionicons name="add" size={wp("8%")} style={styles.addButtonIcon} />
      </SecondaryButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  listContentContainer: {
    paddingBottom: hp("8%"),
  },
  cardContainer: {
    width: wp("45%"),
    borderRadius: 10,
    overflow: "hidden",
    margin: wp("2%"),
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardImage: {
    width: "100%",
    height: wp("45%"),
    justifyContent: "flex-end",
    alignItems: "flex-end",
    padding: wp("2%"),
  },
  cardText: {
    position: "absolute",
    left: wp("2%"),
    bottom: wp("1%"),
    color: colors.white,
    fontSize: wp("4.5%"),
    fontWeight: "bold",
  },
  deleteIcon: {
    position: "absolute",
    top: wp("2%"),
    right: wp("2%"),
  },
  addButton: {
    flexDirection: "row-reverse",
    width: wp("40%"),
  },
  addButtonIcon: {
    color: colors.secondaryGreen,
    fontSize: wp("6%"),
    paddingRight: wp("2%"),
    fontWeight: "bold",
  },
});

export default AllCategoriesScreen;
