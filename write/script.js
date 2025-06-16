// --- 1. 대표 썸네일 16:9 자르기 및 미리보기 ---
let croppedThumbBlob = null;
let cropper = null;

// 썸네일 선택
document.getElementById('thumbnail').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (ev) {
    document.getElementById('cropperImage').src = ev.target.result;
    document.getElementById('cropModal').style.display = 'flex';
    setTimeout(() => {
      if (cropper) cropper.destroy();
      cropper = new Cropper(document.getElementById('cropperImage'), {
        aspectRatio: 16 / 9,
        viewMode: 1,
        autoCropArea: 1,
        background: false,
        minCropBoxWidth: 160,
        minCropBoxHeight: 90
      });
    }, 120);
  };
  reader.readAsDataURL(file);
});

// 자르기 완료
document.getElementById('cropBtn').addEventListener('click', async function () {
  if (!cropper) return;
  cropper.getCroppedCanvas({width: 1280, height: 720}).toBlob(blob => {
    croppedThumbBlob = blob;
    const thumbUrl = URL.createObjectURL(blob);
    document.getElementById('thumbPreview').src = thumbUrl;
    document.getElementById('thumbPreview').style.display = 'block';
    document.getElementById('cropModal').style.display = 'none';
    cropper.destroy();
    cropper = null;
  }, "image/jpeg", 0.92);
});

// 자르기 취소
document.getElementById('closeModalBtn').addEventListener('click', function () {
  document.getElementById('cropModal').style.display = 'none';
  if (cropper) cropper.destroy();
  cropper = null;
  croppedThumbBlob = null;
  document.getElementById('thumbnail').value = "";
  document.getElementById('thumbPreview').style.display = 'none';
});

// --- 2. 본문 이미지 삽입 ---
document.getElementById("insertImageBtn").addEventListener("click", async () => {
  const insertFile = document.getElementById("insertImage").files[0];
  if (!insertFile) {
    alert("본문에 삽입할 이미지를 선택하세요.");
    return;
  }
  const now = new Date(Date.now() - 9 * 60 * 60 * 1000);
  const dateStr = now.toISOString().split("T")[0];
  const imageFolder = `img/${dateStr}`;
  const imagePath = `${imageFolder}/${insertFile.name}`;
  const repo = "mancambo/mancambo.github.io";
  const token = localStorage.getItem("github_token");
  const imageBase64 = await toBase64(insertFile);
  await uploadToGitHub(token, repo, imagePath, imageBase64, "본문 이미지 업로드");
  const textarea = document.getElementById("content");
  const insertMarkdown = `\n\n![이미지](../${imagePath})\n`;
  textarea.value += insertMarkdown;
  alert("✅ 본문에 이미지가 삽입되었습니다!");
});

// --- 3. 글 업로드 (썸네일/본문 분리) ---
document.getElementById("postForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const titleInput = document.getElementById("title").value.trim();
  const subtitleInput = document.getElementById("subtitle").value.trim();
  const contentInput = document.getElementById("content").value.trim();
  const status = document.getElementById("status");
  const previewLink = document.getElementById("previewLink");

  if (!titleInput || !contentInput) {
    alert("제목과 내용을 입력해주세요.");
    return;
  }

  let token = localStorage.getItem("github_token");
  if (!token) {
    token = prompt("GitHub 토큰을 입력하세요:");
    if (!token) return alert("토큰이 필요합니다.");
    localStorage.setItem("github_token", token);
  }

  const repo = "mancambo/mancambo.github.io";
  const now = new Date(Date.now() - 9 * 60 * 60 * 1000);

  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");

  const dateStr = `${yyyy}-${mm}-${dd}`;
  const fullDateTime = `${dateStr} ${hh}:${mi}:${ss}`;
  const uniqueSuffix = Math.random().toString(36).substring(2, 10);
  const fileName = `${dateStr}-${uniqueSuffix}.md`;
  const postPath = `_posts/${fileName}`;

  // 썸네일 이미지 업로드
  let thumbPath = "";
  if (croppedThumbBlob) {
    const thumbFileName = "thumb_" + Date.now() + ".jpeg";
    const thumbFolder = `img/${dateStr}`;
    thumbPath = `${thumbFolder}/${thumbFileName}`;
    const thumbBase64 = await toBase64(croppedThumbBlob);
    await uploadToGitHub(token, repo, thumbPath, thumbBase64, "썸네일 업로드");
  }

  // 본문 이미지 마크다운은 content에 삽입됨
  const mdContent = `---\n` +
    `title:  "${titleInput}"\n` +
    `subtitle:  "${subtitleInput}"\n` +
    `author:  "mancambo"\n` +
    `avatar:  "img/authors/0616.png"\n` +
    `image:  "${thumbPath}"\n` +
    `date:   ${fullDateTime}\n` +
    `---\n\n` +
    `${contentInput}`;

  const encodedContent = btoa(unescape(encodeURIComponent(mdContent)));
  await uploadToGitHub(token, repo, postPath, encodedContent, "글 업로드");

  status.textContent = `✅ 글 업로드 완료: ${fileName}`;
  previewLink.href = `https://mancambo.github.io/${yyyy}/${mm}/${dd}/${titleInput}/`;
  previewLink.style.display = "inline-block";
});

// --- 4. 기타 함수 ---

document.getElementById("resetToken").addEventListener("click", () => {
  localStorage.removeItem("github_token");
  alert("🔓 GitHub 토큰이 초기화되었습니다.");
});

async function toBase64(fileOrBlob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(fileOrBlob);
  });
}

async function uploadToGitHub(token, repo, path, contentBase64, message) {
  await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: message,
      content: contentBase64.split(",").pop(),
    }),
  });
}
