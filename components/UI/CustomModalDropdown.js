import React from "react";
import ModalDropdown from "react-native-modal-dropdown";

const CustomModalDropdown = ({ options, defaultIndex = 0, ...rest }) => {
  const validDefaultIndex = Math.max(
    0,
    Math.min(defaultIndex, options.length - 1)
  );

  return (
    options.length > 0 && (
      <ModalDropdown
        {...rest}
        options={options}
        defaultIndex={validDefaultIndex}
      />
    )
  );
};

export default CustomModalDropdown;
