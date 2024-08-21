import React from "react";
import axios from "axios";
import { Alert } from "react-native";
import { Text } from "react-native";
import { insertRecipeWithCategories } from "@/util/database";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import AddRecipeByImageScreen from "../AddRecipeByImageScreen";

jest.mock("react-native-keyboard-aware-scroll-view", () => {
  const KeyboardAwareScrollView = ({ children }) => children;
  return { KeyboardAwareScrollView };
});

jest.mock("react-native/Libraries/Settings/Settings.ios", () => ({
  settings: jest.fn(),
}));

jest.mock("react-native/Libraries/Utilities/DevSettings", () => ({
  addMenuItem: jest.fn(),
}));

jest.mock("../../../util/database", () => ({
  insertRecipeWithCategories: jest.fn(),
}));

// jest.mock("axios", () => ({
//   post: jest.fn().mockResolvedValue({
//     data: {
//       statusCode: 200,
//       body: JSON.stringify({
//         result:
//           '{"title": "Test Recipe", "ingredients": [{"name": "Ingredient 1"}]}',
//       }),
//     },
//   }),
// }));
jest.mock("axios");

//Mock the ImagePicker component
jest.mock("../../../components/UI/ImagePicker", () => {
  const React = require("react");
  const { View, Button } = require("react-native");
  return (props) => (
    <View testID="MockedImagePicker" {...props}>
      <Button
        title="Pick Image"
        onPress={() => {
          console.log("MockedImagePicker: Image selected");
          props.onTakeImage("mockImageUri");
        }}
      />
    </View>
  );
});

//jest.mock("../../../components/UI/ImagePicker", () => "MockedImagePicker");

// Mock Alert.alert
jest.spyOn(Alert, "alert");

jest.mock("../../../components/UI/LoadingOverlay", () => {
  const React = require("react");
  const { View } = require("react-native");
  return (props) => <View testID="loading-overlay" {...props} />;
});

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    reset: jest.fn(),
    goBack: jest.fn(),
  }),
}));

jest.mock("react-native", () => {
  const actualReactNative = jest.requireActual("react-native");
  return {
    ...actualReactNative,
    Alert: {
      alert: jest.fn(),
    },
  };
});

describe("AddRecipeByImageScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //Test 1: Rendering the Screen
  it("renders the screen correctly", () => {
    const { getByText, getByTestId } = render(<AddRecipeByImageScreen />);

    // Checks that the "Save Recipe" button is rendered
    expect(getByText("שמור מתכון")).toBeTruthy();
    // Verifies the ImagePicker is rendered
    expect(getByTestId("MockedImagePicker")).toBeTruthy();
  });

  //Test 2: Validation for Empty Image
  it("shows an alert if no image is selected", async () => {
    const { getByText } = render(<AddRecipeByImageScreen />);

    const saveButton = getByText("שמור מתכון");
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "שגיאה",
        "אנא בחר תמונה להעלאה",
        [{ text: "אישור" }]
      );
    });
  });

  //Test 3: Check if the loading overlay is displayed when saving the image
  //   it("displays the loading overlay when saving the image", async () => {
  //     const { getByText, getByTestId } = render(<AddRecipeByImageScreen />);

  //     // Simulate image selection
  //     fireEvent.changeText(getByTestId("MockedImagePicker"), "mockImageUri");

  //     const saveButton = getByText("שמור מתכון");
  //     fireEvent.press(saveButton);

  //     await waitFor(
  //       () => {
  //         console.log("Checking if loading overlay is rendered");
  //         expect(getByTestId("loading-overlay")).toBeTruthy();
  //       },
  //       { timeout: 3000 }
  //     );
  //   });
  // });

  //Test 4: Check if the API is called and the response is handled correctly
  //   it("calls the API and handles response correctly", async () => {
  //     // Mock the axios.post to return a successful response
  //     axios.post.mockResolvedValueOnce({
  //       data: {
  //         statusCode: 200,
  //         body: JSON.stringify({
  //           result: '{"title":"Test Recipe","Ingredients":["1 cup sugar"]}',
  //         }),
  //       },
  //     });

  //     const { getByTestId, getByText } = render(
  //       <AddRecipeByImageScreen navigation={{ reset: jest.fn() }} />
  //     );

  //     // Simulate image selection directly by invoking onTakeImage
  //     const imagePicker = getByTestId("MockedImagePicker");
  //     // Open the picker options
  //     fireEvent.press(imagePicker);

  //     // Mock the image selection
  //     fireEvent(imagePicker, "onTakeImage", "mockImageUri"); // Trigger the image selection

  //     // Debug to ensure imageUri is set
  //     await waitFor(() => {
  //       expect(imagePicker.props.value).toBe("mockImageUri");
  //     });

  //     const saveButton = getByText("שמור מתכון");
  //     fireEvent.press(saveButton);

  //     // Wait for the loading state to be true
  //     await waitFor(() => expect(axios.post).toHaveBeenCalled());

  //     // Wait for the recipe to be inserted
  //     await waitFor(() => {
  //       expect(insertRecipeWithCategories).toHaveBeenCalledWith(
  //         expect.objectContaining({
  //           title: "Test Recipe",
  //           ingredients: ["1 cup sugar"],
  //           imageUri: "mockImageUri",
  //         })
  //       );
  //     });
  //   });
  // });

  //Test 5: Check if the screen navigates back on successful API response
  // it("handles failed API response", async () => {
  //   axios.post.mockResolvedValue({
  //     data: {
  //       statusCode: 400,
  //     },
  //   });

  //   const { getByText, getByTestId } = render(<AddRecipeByImageScreen />);

  //   // Simulate image selection
  //   const imagePicker = getByTestId("MockedImagePicker");
  //   fireEvent.changeText(imagePicker, "mockImageUri");

  //   console.log("Image selection should have occurred.");

  //   const saveButton = getByText("שמור מתכון");
  //   fireEvent.press(saveButton);

  //   // Wait for the alert to appear with the correct message
  //   await waitFor(() => {
  //     expect(Alert.alert).toHaveBeenCalledWith(
  //       "שגיאה",
  //       "התמונה לא זוהתה כתמונת מתכון. נסה שנית או הכנס את המתכון באופן ידני.",
  //       [{ text: "אישור", onPress: expect.any(Function) }],
  //       { cancelable: false }
  //     );
  //   });
  // });
});
