const defaultRecipeImage = require("../images/recipe_placeholder.jpg");

const getImageSource = (image) => {
  if (!image) {
    return defaultRecipeImage;
  }
  if (typeof image === "string" && image.startsWith("file")) {
    return { uri: image };
  }
  if (typeof image === "number") {
    return image;
  }
  return defaultRecipeImage;
};

export default getImageSource;
