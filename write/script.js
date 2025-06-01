let croppedImageBase64 = "";

document.getElementById("thumbnail").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const cropImage = document.getElementById("cropImage");
    cropImage.src = reader.result;
    document.getElementById("cropModal").style.display = "flex";

    const cropper = new Cropper(cropImage, {
      aspectRatio: 16 / 9,
      viewMode: 1,
    });

    document.getElementById("cropConfirm").onclick = () => {
      const canvas = cropper.getCroppedCanvas();
      croppedImageBase64 = canvas.toDataURL("image/jpeg");
      document.getElementById("preview").src = croppedImageBase64;
      document.getElementById("preview").style.display = "block";
      document.getElementById("cropModal").style.display = "none";
      cropper.destroy();
    };
  };
  reader.readAsDataURL(file);
});

// 본문 이미지 삽입 버튼 로직
document.getElementById("insertImageBtn").addEventListener("click", async () => {
  const insertFile = document.getElementById("insertImage").files[0];
  if (!insertFile) return alert("본문에 삽입할 이미지를 선택하세요.");
  const reader = new FileReader();
  reader.onload = () => {
    const markdown = `\n\n![이미지](${reader.result})\n`;
    document.getElementById("content").value += markdown;
  };
  reader.readAsDataURL(insertFile);
});
