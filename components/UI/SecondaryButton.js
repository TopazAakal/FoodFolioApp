import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import colors from "../../constants/colors";

function SecondaryButton({ onPress, title, style, textStyle, children }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
      {children}
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderColor: colors.secondaryGreen,
    borderWidth: 2,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 15,
  },
  text: {
    color: colors.secondaryGreen,
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 5,
  },
});

export default SecondaryButton;
