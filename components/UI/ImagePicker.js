import {
  Alert,
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import {
  launchCameraAsync,
  launchImageLibraryAsync,
  useCameraPermissions,
  PermissionStatus,
} from "expo-image-picker";
import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";

function ImagePicker({ onTakeImage }) {
  const [pickedImage, setPickedImage] = useState();
  const [cameraPermissionInformation, requestPermission] =
    useCameraPermissions();

  async function verifyPermissions() {
    if (cameraPermissionInformation.status === PermissionStatus.UNDETERMINED) {
      const permissionResponse = await requestPermission();

      return permissionResponse.granted;
    }

    if (cameraPermissionInformation.status === PermissionStatus.DENIED) {
      Alert.alert(
        "Insufficient Permissions!",
        "You need to grant camera permissions to use this app."
      );
      return false;
    }

    return true;
  }

  async function takeImageHandler() {
    const hasPermission = await verifyPermissions();

    if (!hasPermission) {
      return;
    }

    const image = await launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    });

    if (!image.canceled) {
      const uri = image.assets[0].uri;
      setPickedImage(uri);
      onTakeImage(uri);
    }
  }

  async function pickImageHandler() {
    const hasPermission = await verifyPermissions();

    if (!hasPermission) {
      return;
    }

    const result = await launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0];
      setPickedImage(selectedImage.uri);
      onTakeImage(selectedImage.uri);
    }
  }

  const imagePickHandler = () => {
    Alert.alert("בחר אפשרות", "", [
      { text: "בטל", style: "cancel" },
      {
        text: "צילום תמונה",
        onPress: takeImageHandler,
      },
      {
        text: "בחירה מהגלריה",
        onPress: pickImageHandler,
      },
    ]);
  };

  if (pickedImage) {
    imagePreview = <Image style={styles.image} source={{ uri: pickedImage }} />;
  }

  return (
    <View style={styles.imagePicker}>
      <TouchableOpacity onPress={imagePickHandler} style={styles.imagePreview}>
        {!pickedImage ? (
          <MaterialIcons name="add-a-photo" size={55} color="gray" />
        ) : (
          <Image style={styles.image} source={{ uri: pickedImage }} />
        )}
        {!pickedImage && <Text style={styles.promptText}>הוספת תמונה</Text>}
      </TouchableOpacity>
    </View>
  );
}

export default ImagePicker;

const styles = StyleSheet.create({
  imagePicker: {
    alignItems: "center",
    marginBottom: 15,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 3,
    backgroundColor: "#f5f3f3",
    borderRadius: 10,
    overflow: "hidden",
    padding: 10,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
  },
  imagePromptContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  promptText: {
    color: "gray",
    fontSize: 18,
    fontWeight: "bold",
    paddingTop: 8,
  },
});
