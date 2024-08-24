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
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

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
      maxWidth: 1024,
      maxHeight: 1024,
      // aspect: [3, 4],
      quality: 0.9,
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
      quality: 1,
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
          <MaterialIcons name="add-a-photo" size={wp("14%")} color="gray" />
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
    marginBottom: hp("2%"),
  },
  imagePreview: {
    width: "100%",
    height: hp("25%"),
    marginBottom: hp("1%"),
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 2,
    borderStyle: "dashed",
    backgroundColor: "#f5f3f3",
    borderRadius: wp("2.5%"),
    overflow: "hidden",
    padding: wp("2.5%"),
  },
  image: {
    width: wp("90%"),
    height: hp("64%"),
    borderRadius: wp("2.5%"),
    resizeMode: "cover",
  },
  imagePromptContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  promptText: {
    color: "gray",
    fontSize: wp("4.5%"),
    fontWeight: "bold",
    paddingTop: hp("1%"),
  },
});
