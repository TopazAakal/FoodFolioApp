import React, { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
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
import getImageSource from "../util/image";
import SecondaryButton from "../components/UI/SecondaryButton";
import colors from "../constants/colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const windowWidth = Dimensions.get("window").width;

const CategoryRecipesScreen = ({ navigation, route }) => {
  const { categoryId, categoryName } = route.params;
  const [recipes, setRecipes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const fetchRecipes = async () => {
        const data = await fetchRecipesByCategory(categoryId);
        if (data) {
          setRecipes(data);
        } else {
          console.log("לא קיימים מתכונים בקטגוריה זו.", categoryId);
        }
      };
      fetchRecipes();
    }, [categoryId])
  );

  const navigateToRecipeDetail = (recipeId) => {
    navigation.navigate("RecipeDisplay", {
      recipeId: recipeId,
      selectedCategory: categoryName,
    });
  };

  const refreshRecipes = async () => {
    try {
      const data = await fetchRecipesByCategory(categoryId);
      setRecipes(data);
    } catch (error) {
      console.log(
        "Failed to fetch recipes for category ID:",
        categoryId,
        error
      );
    }
  };

  useEffect(() => {
    if (refreshing) {
      fetchRecipesByCategory();
      setRefreshing(false);
    }
  }, [refreshing]);

  const addRecipeHandler = () => {
    navigation.navigate("AllRecipes", {
      categoryId: categoryId,
      fromCategoryScreen: true,
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => navigateToRecipeDetail(item.id)}
    >
      <Image style={styles.cardImage} source={getImageSource(item.image)} />
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
        <Ionicons name="trash-outline" size={24} color="colors.red" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.listContentContainer}
      />
      <SecondaryButton
        title="הוסף מתכון"
        onPress={addRecipeHandler}
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
    backgroundColor: colors.white,
    elevation: 5,
    shadowColor: colors.black,
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
    color: colors.black,
    paddingVertical: 10,
    textAlign: "left",
  },

  addButton: {
    flexDirection: "row-reverse",
    width: "40%",
    marginHorizontal: "30%",
  },
  addButtonIcon: {
    color: colors.secondaryGreen,
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
    color: colors.black,
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
