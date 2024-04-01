import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { I18nManager } from "react-native";

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
    marginBottom: 20,
  },
  label: {
    marginBottom: 10,
    textAlign: "right",
    fontWeight: "bold",
    color: "black",
    fontSize: 18,
  },
  input: {
    backgroundColor: "#ffffff",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    fontSize: 16,
    color: "#4e4e4ea8",
    borderColor: "#ccc",
    borderWidth: 1,
    elevation: 1,
    shadowColor: "#ccc",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    textAlign: "right",
  },
  multilineInput: {
    paddingTop: 15,
    height: 140,
    textAlignVertical: "top",
  },
});

export default LabeledInput;
