import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import colors from "../../constants/colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

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
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("1.5%"),
    borderColor: colors.secondaryGreen,
    borderWidth: 2,
    borderRadius: wp("4%"),
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: hp("1%"),
  },
  text: {
    color: colors.secondaryGreen,
    fontSize: wp("4%"),
    fontWeight: "bold",
    marginRight: wp("1%"),
  },
});

export default SecondaryButton;
