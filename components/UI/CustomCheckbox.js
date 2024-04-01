import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const CustomCheckbox = ({ isChecked, onCheckChange, label }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onCheckChange}>
      <Ionicons
        name={isChecked ? "checkbox" : "square-outline"}
        size={24}
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
    marginBottom: 10,
  },
  label: {
    marginRight: 10,
    marginLeft: 5,
    fontSize: 16,
    color: "#333",
  },
});

export default CustomCheckbox;
