import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import colors from "../../constants/colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

function PrimaryButton({ onPress, title, style, textStyle }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primaryGreen,
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("5%"),
    borderRadius: wp("2.5%"),
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: hp("2%"),
  },
  text: {
    color: colors.white,
    fontSize: wp("4.8%"),
    fontWeight: "bold",
  },
});

export default PrimaryButton;
