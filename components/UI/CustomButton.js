import { TouchableOpacity, Text, StyleSheet, View } from "react-native";

function CustomButton({ onPress, title, style }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
        <Text style={styles.text}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  button: {
    backgroundColor: "#2E7D32",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "95%",
    marginBottom: 15,
    marginTop: "auto",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CustomButton;
