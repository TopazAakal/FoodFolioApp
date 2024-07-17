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
import { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";

function ImagePicker({ onTakeImage, initialImage, style }) {
  const [pickedImage, setPickedImage] = useState(initialImage);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [galleryPermission, setGalleryPermission] = useState(null);
  const [cameraPermissionInformation, requestPermission] =
    useCameraPermissions();

  // Update pickedImage if initialImage changes
  useEffect(() => {
    if (initialImage) {
      setPickedImage(initialImage);
    }
  }, [initialImage]);

  useEffect(() => {
    (async () => {
      try {
        // Request camera permissions
        const { status: cameraStatus } =
          await Camera.requestCameraPermissionsAsync();
        setCameraPermission(cameraStatus === "granted");

        // Request media library permissions
        const { status: galleryStatus } =
          await MediaLibrary.requestPermissionsAsync();
        setGalleryPermission(galleryStatus === "granted");
      } catch (error) {
        console.error("Error requesting permissions:", error);
        // Handle error (e.g., show error message)
        Alert.alert(
          "Permission Error",
          "Failed to request permissions. Please try again."
        );
      }
    })();
  }, []);

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
      allowsEditing: false,
      // aspect: [3, 4],
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
      allowsEditing: false,
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
      <TouchableOpacity
        onPress={imagePickHandler}
        style={[styles.imagePreview, style]}
      >
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
    marginBottom: 5,
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
    resizeMode: "cover",
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
