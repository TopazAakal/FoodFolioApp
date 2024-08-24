import React, { useState } from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import colors from "../constants/colors";

const IngredientItem = ({ ingredient }) => {
  const [isChecked, setIsChecked] = useState(false);

  const toggleCheck = () => setIsChecked(!isChecked);

  return (
    <TouchableOpacity onPress={toggleCheck} style={styles.ingredientItem}>
      {isChecked ? (
        <View style={styles.checkboxChecked}>
          <Ionicons name="checkmark" size={wp("4%")} color="white" />
        </View>
      ) : (
        <View style={styles.checkbox} />
      )}
      <Text
        style={styles.ingredientText}
      >{`${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`}</Text>
    </TouchableOpacity>
  );
};

export default IngredientItem;

const styles = StyleSheet.create({
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: hp("0.5%"),
    marginBottom: hp("1%"),
  },
  checkbox: {
    width: wp("5%"),
    height: wp("5%"),
    borderRadius: wp("2.5%"),
    borderWidth: wp("0.5%"),
    borderColor: "black",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp("2.5%"),
  },
  checkboxChecked: {
    width: wp("5%"),
    height: wp("5%"),
    borderRadius: wp("2.5%"),
    backgroundColor: colors.secondaryGreen,
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp("2.5%"),
  },
  ingredientText: {
    fontSize: wp("4%"),
  },
});
