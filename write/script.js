
document.getElementById("postForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const titleInput = document.getElementById("title").value.trim();
  const subtitleInput = document.getElementById("subtitle").value.trim();
  const contentInput = document.getElementById("content").value.trim();
  const image = document.getElementById("image").files[0];
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

  const repo = "kwakdonghun94/kwakdonghun94.github.io";
  const now = new Date(Date.now() - 9 * 60 * 60 * 1000); // -9시간 적용

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

  let imageMarkdown = "";
  let imagePath = "";

  if (image) {
    const imageBase64 = await toBase64(image);
    const imageFolder = `img/${dateStr}`;
    imagePath = `${imageFolder}/${image.name}`;
    await uploadToGitHub(token, repo, imagePath, imageBase64, "이미지 업로드");
    imageMarkdown = `\n\n![이미지](../${imagePath})\n`;
  }

  const mdContent = `---\n` +
    `title:  "${titleInput}"\n` +
    `subtitle:  "${subtitleInput}"\n` +
    `author:  "donghun"\n` +
    `avatar:  "img/authors/6497.jpg"\n` +
    `image:  "${imagePath}"\n` +
    `date:   ${fullDateTime}\n` +
    `---\n\n` +
    `${contentInput}${imageMarkdown}`;

  const encodedContent = btoa(unescape(encodeURIComponent(mdContent)));
  await uploadToGitHub(token, repo, postPath, encodedContent, "글 업로드");

  status.textContent = `✅ 글 업로드 완료: ${fileName}`;
  previewLink.href = `https://kwakdonghun94.github.io/${yyyy}/${mm}/${dd}/${fileName.replace(".md", "")}/`;
  previewLink.style.display = "inline-block";
});

document.getElementById("resetToken").addEventListener("click", () => {
  localStorage.removeItem("github_token");
  alert("🔓 GitHub 토큰이 초기화되었습니다.");
});

async function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
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

// 이미지 미리보기
const preview = document.getElementById("preview");
document.getElementById("image").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      preview.src = event.target.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    preview.src = "#";
    preview.style.display = "none";
  }
});

// 본문 이미지 삽입
document.getElementById("insertImageBtn").addEventListener("click", async () => {
  const insertImage = document.getElementById("insertImage").files[0];
  const content = document.getElementById("content");

  if (!insertImage) return alert("본문에 삽입할 이미지를 선택해주세요.");

  const now = new Date(Date.now() - 9 * 60 * 60 * 1000); // UTC-9h 적용
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}-${mm}-${dd}`;
  const imageFolder = `img/${dateStr}`;
  const imagePath = `${imageFolder}/${insertImage.name}`;

  const imageBase64 = await toBase64(insertImage);
  const token = localStorage.getItem("github_token");
  const repo = "kwakdonghun94/kwakdonghun94.github.io";

  await uploadToGitHub(token, repo, imagePath, imageBase64, "본문 이미지 업로드");

  const markdown = `\n\n![본문 이미지](../${imagePath})\n\n`;
  content.value += markdown;
});
