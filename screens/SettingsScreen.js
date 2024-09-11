// SettingsScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons"; // Using Ionicons as per your preference
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const SettingsScreen = () => {
  const handlePrivacyPolicyPress = () => {
    const url = "https://foodfolio.streamlit.app/"; // Replace with your privacy policy URL
    Linking.openURL(url).catch((err) =>
      console.error("Couldn't load page", err)
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.option}
        onPress={handlePrivacyPolicyPress}
      >
        <Text style={styles.optionText}> מדיניות פרטיות</Text>
        <Ionicons name="document-text-outline" size={wp("5%")} color="#000" />
      </TouchableOpacity>

      {/* Add more settings options here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp("4%"),
    backgroundColor: "#fff",
  },
  option: {
    flexDirection: "row",
    alignSelf: "center",
    paddingVertical: hp("2%"),
  },
  optionText: {
    marginRight: wp("5%"),
    fontSize: wp("4.5%"),
  },
});

export default SettingsScreen;
