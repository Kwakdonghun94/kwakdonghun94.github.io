---
layout: compress
title: "About"
subtitle: "블로그 소개"
author: "donghun"
avatar: "img/authors/profile.png"
image: "img/6497.jpg"  # 원하는 썸네일 이미지
date: 2025-05-28
hidden: true  # ← 이건 커스텀 키로 사용 (필터용)
permalink: /about/
---
<div class="card" data-id="about-page">
  <div class="card__container card__container--closed">
    <svg class="card__image" xmlns="http://www.w3.org/2000/svg"
         xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1920 1200"
         preserveAspectRatio="xMidYMid slice">
      <defs>
        <clipPath id="about-page-clip-path">
          <polygon class="clip" points="0,1200 0,0 1920,0 1920,1200"></polygon>
        </clipPath>
      </defs>
      <image clip-path="url(#about-page-clip-path)" width="1920" height="1200"
             xlink:href="{{ page.image }}"></image>
    </svg>

    <div class="card__content">
      <i class="card__btn-close fa fa-times"></i>
      <div class="card__caption">
        <h2 class="card__title">{{ page.title }}</h2>
        <p class="card__subtitle">{{ page.subtitle }}</p>
      </div>
      <div class="card__copy">
        <div class="meta">
          <img class="meta__avatar" src="{{ page.avatar }}" alt="author avatar"/>
          <span class="meta__author">{{ page.author }}</span>
          <span class="meta__date">{{ page.date | date: "%Y-%m-%d" }}</span>
        </div>
        <p>안녕하세요! 저는 동훈입니다.</p>
        <p>이 블로그는 제가 만든 프로그램, AI 실험, 사진 기록 등을 담는 공간입니다.</p>
        <p><strong>Flutter, Python, GPT</strong> 같은 기술들을 다뤄보고 있으며,<br>
        일상생활에 쓰일법한 아이디어를 가지고 프로그램을 만드는 과정을 담은 곳입니다.</p>
        <p>문의: <a href="mailto:rhkrstm111@naver.com">rhkrstm111@naver.com</a></p>
      </div>
    </div>
  </div>
</div>