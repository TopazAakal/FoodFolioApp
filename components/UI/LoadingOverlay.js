import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import colors from "../../constants/colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

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
    transform: [{ scale: wp("10%") / 25 }],
  },
  loadingText: {
    color: colors.white,
    fontSize: wp("4.5%"),
    fontWeight: "bold",
    marginTop: hp("4%"),
  },
});

export default LoadingOverlay;
