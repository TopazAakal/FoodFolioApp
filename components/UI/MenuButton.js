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
        <Ionicons name="add" size={26} color="#FFFFFF" />
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondaryGreen,
    justifyContent: "center",
    alignItems: "center",
  },
  menu: {
    backgroundColor: "white",
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    paddingVertical: 10,
    paddingHorizontal: 5,
    width: 180,
    position: "absolute",
  },
  menuItem: {
    fontWeight: "bold",
    paddingVertical: 8,
    paddingHorizontal: 5,
    alignItems: "flex-start",
  },
  menuText: {
    fontSize: 16,
    paddingHorizontal: 5,
  },
});
