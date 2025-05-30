document.getElementById("postForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const titleInput = document.getElementById("title").value.trim();
  const subtitleInput = document.getElementById("subtitle").value.trim();
  const categoryInput = document.getElementById("category").value.trim();
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

  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000); // KST
  const yyyy = kst.getFullYear();
  const mm = String(kst.getMonth() + 1).padStart(2, "0");
  const dd = String(kst.getDate()).padStart(2, "0");
  const hh = String(kst.getHours()).padStart(2, "0");
  const mi = String(kst.getMinutes()).padStart(2, "0");
  const ss = String(kst.getSeconds()).padStart(2, "0");

  const dateStr = `${yyyy}-${mm}-${dd}`;
  const fullDateTime = `${dateStr} ${hh}:${mi}:${ss}`;

  const slugify = (text) => {
    return text
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  const safeSlug = slugify(titleInput);
  const fileName = `${dateStr}-${safeSlug}.md`;
  const postPath = `_posts/${fileName}`;

  let imageMarkdown = "";
  let imagePath = "";

  if (image) {
    const imageBase64 = await toBase64(image);
    imagePath = `img/${dateStr}/${image.name}`;
    await uploadToGitHub(token, repo, imagePath, imageBase64, "이미지 업로드");
    imageMarkdown = `\n\n![이미지](../${imagePath})\n`;
  }

  const mdContent = `---
title: "${titleInput}"
subtitle: "${subtitleInput || ""}"
author: "donghun"
avatar: "img/authors/6497.jpg"
category: "${categoryInput || "일반"}"
image: "${imagePath || ""}"
date: ${fullDateTime}
---

${contentInput}${imageMarkdown}
`;

  const encodedContent = btoa(unescape(encodeURIComponent(mdContent)));
  await uploadToGitHub(token, repo, postPath, encodedContent, "글 업로드");

  status.textContent = `✅ 글 업로드 완료: ${fileName}`;
  const blogUrl = `https://kwakdonghun94.github.io/${yyyy}/${mm}/${dd}/${safeSlug}/`;
  previewLink.href = blogUrl;
  previewLink.style.display = "inline-block";
});

document.getElementById("resetToken").addEventListener("click", () => {
  localStorage.removeItem("github_token");
  alert("🔓 GitHub 토큰이 초기화되었습니다.");
});

document.getElementById("image").addEventListener("change", function () {
  const preview = document.getElementById("imagePreview");
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    preview.src = "#";
    preview.style.display = "none";
  }
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
