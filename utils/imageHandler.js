const previewImage = document.getElementById("previewImage");
const previewImgContainer = document.getElementById("previewImgContainer");

let currentImageURL = null;

const showImagePreview = (file) => {
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    currentImageURL = reader.result;

    previewImage.src = currentImageURL;
    previewImgContainer.style.setProperty(
      "--preview-bg",
      `url(${currentImageURL})`,
    );
    previewImgContainer.style.height = "300px";
  };

  reader.readAsDataURL(file); //converts file to base64
};

const resetImagePreview = () => {
  previewImage.src = "";
  previewImgContainer.style.height = "0px";

  currentImageURL = null;
};

const getCurrentImageURL = () => currentImageURL;

export { showImagePreview, resetImagePreview, getCurrentImageURL };
