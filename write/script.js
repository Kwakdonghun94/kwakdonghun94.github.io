document.getElementById("postForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const titleInput = document.getElementById("title").value.trim();
  const contentInput = document.getElementById("content").value.trim();
  const image = document.getElementById("image").files[0];
  const status = document.getElementById("status");
  const previewLink = document.getElementById("previewLink");

  if (!titleInput || !contentInput) {
    alert("제목과 내용을 입력해주세요.");
    return;
  }

  // ✅ GitHub 토큰 로딩
  let token = localStorage.getItem("github_token");
  if (!token) {
    token = prompt("GitHub Personal Access Token을 입력하세요:");
    if (!token) return alert("토큰이 필요합니다.");
    localStorage.setItem("github_token", token);
  }

  const repo = "kwakdonghun94/kwakdonghun94.github.io";
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const safeTitle = titleInput.replace(/[^\w\-가-힣]+/g, "-");
  const fileName = `${dateStr}-${safeTitle}.md`;
  const postPath = `_posts/${fileName}`;

  let imageMarkdown = "";

  // ✅ 이미지 업로드
  if (image) {
    const imageBase64 = await toBase64(image);
    const imagePath = `img/${image.name}`;

    await uploadToGitHub(token, repo, imagePath, imageBase64, "이미지 업로드");

    imageMarkdown = `\n\n![이미지](../img/${image.name})\n`;
  }

  // ✅ Markdown 파일 구성
  const mdContent = `---
title: "${titleInput}"
date: ${dateStr}
---

${contentInput}${imageMarkdown}
`;

  const encodedContent = btoa(unescape(encodeURIComponent(mdContent)));

  // ✅ 글 업로드
  await uploadToGitHub(token, repo, postPath, encodedContent, "블로그 글 업로드");

  status.textContent = `✅ 글 업로드 완료: ${fileName}`;

  // ✅ 블로그 미리보기 링크 설정
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