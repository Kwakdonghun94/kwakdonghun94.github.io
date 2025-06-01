
let croppedImageBase64 = "";

document.getElementById("thumbnail").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const cropImage = document.getElementById("cropImage");
    cropImage.src = reader.result;
    document.getElementById("cropModal").style.display = "flex";

    // 이전 cropper 인스턴스 정리
    if (window._cropper) window._cropper.destroy();
    window._cropper = new Cropper(cropImage, {
      aspectRatio: 16 / 9,
      viewMode: 1,
      movable: true,
      zoomable: true,
      responsive: true,
      background: false
    });

    document.getElementById("cropConfirm").onclick = () => {
      const canvas = window._cropper.getCroppedCanvas({
        width: 1280,
        height: 720
      });
      croppedImageBase64 = canvas.toDataURL("image/jpeg", 0.92);
      document.getElementById("preview").src = croppedImageBase64;
      document.getElementById("preview").style.display = "block";
      document.getElementById("cropModal").style.display = "none";
      window._cropper.destroy();
    };
  };
  reader.readAsDataURL(file);
});

// 본문 이미지 삽입 버튼
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
