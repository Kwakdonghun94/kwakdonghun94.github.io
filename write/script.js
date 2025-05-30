
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
  const now = new Date(); // 브라우저 시간 그대로 사용

  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");

  const dateStr = `${yyyy}-${mm}-${dd}`;
  const fullDateTime = `${dateStr} ${hh}:${mi}:${ss}`;
  const safeTitle = titleInput.replace(/[^\w\-]+/g, "-").toLowerCase();
  const fileName = `${dateStr}-${safeTitle}.md`;
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
  const blogSlug = safeTitle.toLowerCase();
  const blogUrl = `https://kwakdonghun94.github.io/${yyyy}/${mm}/${dd}/${blogSlug}/`;
  previewLink.href = blogUrl;
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
