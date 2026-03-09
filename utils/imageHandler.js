const previewImage = document.getElementById("previewImage");
const previewImgContainer = document.getElementById("previewImgContainer");

let currentImageURL = null;

const showImagePreview = (file) => {
  if (!file) return;

  if (currentImageURL) {
    URL.revokeObjectURL(currentImageURL);
  }

  currentImageURL = URL.createObjectURL(file);

  previewImage.src = currentImageURL;
  previewImgContainer.style.setProperty(
    "--preview-bg",
    `url(${currentImageURL})`,
  );
  previewImgContainer.style.height = "300px";
};

const resetImagePreview = () => {
  previewImage.src = "";
  previewImgContainer.style.height = "0px";

  currentImageURL = null;
};

const getCurrentImageURL = () => currentImageURL;

export { showImagePreview, resetImagePreview, getCurrentImageURL };
