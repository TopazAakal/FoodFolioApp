import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const CustomCheckbox = ({ isChecked, onCheckChange, label }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onCheckChange}>
      <Ionicons
        name={isChecked ? "checkbox" : "square-outline"}
        size={wp("6%")}
        color="#333"
      />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("1.5%"),
  },
  label: {
    marginRight: wp("2.5%"),
    marginLeft: wp("1.25%"),
    fontSize: wp("4%"),
    color: "#333",
  },
});

export default CustomCheckbox;
