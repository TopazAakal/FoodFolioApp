// /tests/CustomButton.test.js
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import CustomButton from "../../../components/UI/CustomButton";

describe("CustomButton Component", () => {
  it("renders correctly with given title", () => {
    const { getByText } = render(
      <CustomButton title="Press me" onPress={() => {}} />
    );
    expect(getByText("Press me")).toBeTruthy();
  });

  it("executes onPress when button is pressed", () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <CustomButton title="Press me" onPress={onPressMock} />
    );

    fireEvent.press(getByText("Press me"));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it("applies custom styles", () => {
    const customStyle = {
      alignItems: "center",
      backgroundColor: "red",
      borderRadius: 10,
      justifyContent: "center",
      marginBottom: 15,
      marginTop: "auto",
      opacity: 1,
      padding: 10,
      width: "95%",
    };
    const { getByText } = render(
      <CustomButton title="Press me" onPress={() => {}} style={customStyle} />
    );

    const button = getByText("Press me").parent.parent;
    expect(button.props.style).toEqual(expect.objectContaining(customStyle));
  });
});
