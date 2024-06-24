import React from "react";
import { View, Text, StyleSheet } from "react-native";

function OutputScreen({ route }) {
  const { text } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.outputText}>{text}</Text>
    </View>
  );
}

export default OutputScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  outputText: {
    fontSize: 18,
    textAlign: "center",
    margin: 10,
  },
});
