import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { I18nManager } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const LabeledInput = ({ label, value, onChangeText, ...props }) => {
  return (
    <View style={styles.inputContainer}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, props.multiline ? styles.multilineInput : {}]}
        value={value}
        onChangeText={onChangeText}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: hp("2.5%"),
  },
  label: {
    marginBottom: hp("1.25%"),
    textAlign: "right",
    fontWeight: "bold",
    color: "black",
    fontSize: wp("4.5%"),
  },
  input: {
    backgroundColor: "#ffffff",
    paddingVertical: hp("2%"),
    paddingHorizontal: wp("2.5%"),
    borderRadius: wp("2.5%"),
    fontSize: wp("4%"),
    color: "#4e4e4ea8",
    borderColor: "#ccc",
    borderWidth: 1,
    elevation: 1,
    shadowColor: "#ccc",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: wp("2.5%"),
    textAlign: "right",
  },
  multilineInput: {
    paddingTop: hp("2%"),
    height: hp("18%"),
    textAlignVertical: "top",
  },
});

export default LabeledInput;
