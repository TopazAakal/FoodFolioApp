import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import colors from "../../constants/colors";

const LoadingOverlay = ({ message = "טוען..." }) => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator
        size="large"
        color={colors.secondaryGreen}
        style={styles.indicator}
      />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  indicator: {
    transform: [{ scale: 1.5 }],
  },
  loadingText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 30,
  },
});

export default LoadingOverlay;
