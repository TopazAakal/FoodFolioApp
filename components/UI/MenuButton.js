import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Text,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import colors from "../../constants/colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const MenuButton = ({
  navigation,
  menuOptions,
  style,
  fabStyle,
  menuStyle,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  return (
    <View style={[styles.container, style]}>
      {menuVisible && (
        <View style={[styles.menu, menuStyle]}>
          {menuOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => {
                if (option.onPress) {
                  option.onPress();
                } else if (option.navigateTo) {
                  navigation.navigate(option.navigateTo);
                }
                setMenuVisible(false);
              }}
            >
              <Text style={styles.menuText}>{option.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <TouchableOpacity onPress={toggleMenu} style={[styles.fab, fabStyle]}>
        <Ionicons name="add" size={wp("7%")} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

export default MenuButton;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 1000,
  },
  fab: {
    width: wp("15%"),
    height: wp("15%"),
    borderRadius: wp("7.5%"),
    backgroundColor: colors.secondaryGreen,
    justifyContent: "center",
    alignItems: "center",
  },
  menu: {
    backgroundColor: "white",
    borderRadius: wp("2%"),
    borderColor: "#ccc",
    borderWidth: 1,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: wp("0.5%"),
    paddingVertical: hp("0.5%"),
    paddingHorizontal: wp("1.8%"),
    width: wp("50%"),
    position: "absolute",
    alignItems: "right",
  },
  menuItem: {
    fontWeight: "bold",
    paddingVertical: hp("1.2%"),
    paddingHorizontal: wp("1.5%"),
  },
  menuText: {
    fontSize: wp("4%"),
    paddingHorizontal: wp("2.5%"),
  },
});
