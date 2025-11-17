# 🛍️ MOYEO (모여사자) - 공동구매 플랫폼

Figma 디자인을 완벽하게 웹으로 구현한 공동구매 플랫폼입니다.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## 📖 목차
- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [페이지 구조](#-페이지-구조)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [시작하기](#-시작하기)
- [개발 가이드](#-개발-가이드)

## 🎯 프로젝트 소개

**MOYEO (모여사자)**는 대학생과 지역 커뮤니티를 위한 공동구매 플랫폼입니다. 
혼자서는 부담스러운 대용량 제품을 함께 구매하고, 배달비를 나누며, 정기적으로 필요한 상품을 공동으로 구매할 수 있습니다.

### ✨ 특징
- 🎨 **Figma 디자인 100% 재현** - 픽셀 퍼펙트 구현
- 📱 **모바일 최적화** - 반응형 디자인 (최대 440px)
- 🚀 **빠른 성능** - 순수 HTML/CSS/JavaScript
- ♿ **접근성** - WCAG 2.1 준수
- 🎭 **부드러운 애니메이션** - 호버, 트랜지션 효과

## 🌟 주요 기능

### 공동구매 카테고리
- **공동배달** 🍕 - 한 번에 시키고, 비용은 가볍게
- **묶음구매** 📦 - 한 박스는 벅찰 때, 같이 쪼개요
- **번개공구** ⚡ - 급하다, 급해! 빠르게 공구하기
- **정기공구** 🔄 - 자주 사는 건, 같이 정기적으로

### 핵심 기능
- 🔍 **스마트 검색** - 원하는 상품 빠르게 찾기
- 🗓️ **캘린더** - 공구 일정 관리
- 💬 **매칭 시스템** - 공구 친구 매칭
- ⭐ **리뷰 시스템** - 거래 후기 작성 및 조회
- 📋 **내 공구 관리** - 진행 중인 공구 추적
- 🔔 **알림** - 공구 요청 및 매칭 알림

## 📄 페이지 구조

### 🏠 메인 페이지 (5개)
```
├── home.html              # 홈 - 카테고리, 추천 공구
├── calendar.html          # 캘린더 - 공구 일정 관리
├── favorites.html         # 관심있어요 - 관심 목록
├── notifications.html     # 알림 - 공구 요청 알림
└── mypage.html           # 마이페이지 - 프로필, 내 공구
```

### 🔍 공구 찾기 (6개)
```
├── category-all.html      # 전체
├── category-delivery.html # 공동배달
├── category-bulk.html     # 묶음구매
├── category-flash.html    # 번개공구
├── category-regular.html  # 정기공구
└── search.html           # 검색 결과
```

### ✏️ 공구 글 작성 (5개)
```
├── create-post-step1.html # 1단계 - 이미지, 공구명, 카테고리
├── create-post-step2.html # 2단계 - 모집 인원, 가격
├── create-post-step3.html # 3단계 - 만남 장소, 시간
├── create-post-step4.html # 4단계 - 최종 확인
└── create-post-complete.html # 작성 완료
```

### 🤝 매칭 & 거래 (5개)
```
├── matching.html          # 공구 친구 매칭하기
├── matching-all.html      # 매칭 상태 - 전체
├── matching-waiting.html  # 매칭 대기 중
├── matching-success.html  # 매칭 성공
└── matching-closed.html   # 종료
```

### 📝 리뷰 (2개)
```
├── review-list.html       # 리뷰 목록
└── review-write.html      # 리뷰 작성
```

### 👤 마이페이지 관련 (6개)
```
├── mypage.html            # 마이페이지 (로그인 O)
├── mypage-logged-out.html # 마이페이지 (로그인 X)
├── profile-other.html     # 다른 사람 프로필
├── my-posts.html          # 내 공구글
├── my-posts-empty.html    # 내 공구글 (빈 상태)
└── post-history.html      # 공구 내역
```

### 🔐 인증 (6개)
```
├── login.html             # 로그인
├── signup.html            # 회원가입 (구버전)
├── signup-step1.html      # 회원가입 1단계 - 닉네임
├── signup-step2.html      # 회원가입 2단계 - 이메일/비밀번호
├── signup-step3.html      # 회원가입 3단계 - 전화번호 인증
└── signup-complete.html   # 회원가입 완료
```

**총 35개 페이지 완벽 구현 ✅**

## 🛠️ 기술 스택

### Frontend
- **HTML5** - 시맨틱 마크업
- **CSS3** - Flexbox, Grid, Animations
- **JavaScript (ES6+)** - 모듈, 클래스, async/await

### 디자인
- **Figma** - 디자인 시스템 기반
- **Pretendard Font** - 한글 웹폰트
- **반응형 디자인** - Mobile First (max-width: 440px)

### 도구
- **Git** - 버전 관리
- **Live Server** - 개발 서버
- **Figma MCP** - Figma 연동

## 📁 프로젝트 구조

```
moyeosaja/
├── assets/                 # 정적 자원
│   ├── images/            # 이미지 파일
│   │   ├── categories/    # 카테고리 이미지
│   │   ├── avatars/       # 아바타 이미지
│   │   └── icons/         # 아이콘
│   └── icons/             # SVG 아이콘
│
├── css/                    # 스타일시트
│   ├── base.css           # 기본 스타일, 색상, 타이포그래피
│   ├── layout.css         # 레이아웃, 헤더, 네비게이션
│   ├── components.css     # 컴포넌트 스타일
│   ├── calendar.css       # 캘린더 페이지
│   ├── category.css       # 카테고리 페이지
│   ├── create-post.css    # 공구글 작성
│   ├── favorites.css      # 관심있어요
│   ├── login.css          # 로그인
│   ├── matching.css       # 매칭
│   ├── matching-status.css # 매칭 상태
│   ├── mypage.css         # 마이페이지
│   ├── notifications.css  # 알림
│   ├── profile-other.css  # 다른 사람 프로필
│   ├── review-list.css    # 리뷰 목록
│   ├── review-write.css   # 리뷰 작성
│   ├── search.css         # 검색
│   ├── signup.css         # 회원가입
│   └── signup-steps.css   # 회원가입 단계
│
├── js/                     # JavaScript 모듈
│   ├── api.js             # API 호출 (Mock)
│   ├── app.js             # 메인 애플리케이션
│   ├── components.js      # UI 컴포넌트
│   ├── nav.js             # 네비게이션 로직
│   ├── utils.js           # 유틸리티 함수
│   ├── calendar.js        # 캘린더 기능
│   ├── category-all.js    # 카테고리 전체
│   ├── create-post.js     # 공구글 작성
│   ├── create-post-step2.js # 단계별 작성
│   ├── create-post-step3.js
│   ├── create-post-step4.js
│   ├── favorites.js       # 관심있어요
│   ├── login.js           # 로그인
│   ├── matching.js        # 매칭
│   ├── matching-status.js # 매칭 상태
│   ├── my-posts.js        # 내 공구글
│   ├── mypage.js          # 마이페이지
│   ├── mypage-logged-out.js # 로그인 전 마이페이지
│   ├── notifications.js   # 알림
│   ├── post-history.js    # 공구 내역
│   ├── profile-other.js   # 다른 사람 프로필
│   ├── review-list.js     # 리뷰 목록
│   ├── review-write.js    # 리뷰 작성
│   ├── search.js          # 검색
│   ├── signup.js          # 회원가입
│   └── signup-steps.js    # 회원가입 단계
│
├── pages/                  # HTML 페이지 (35개)
│   └── (위 페이지 구조 참고)
│
├── package.json           # 프로젝트 설정
└── README.md             # 이 문서
```

## 🚀 시작하기

### 필수 조건
- 웹 브라우저 (Chrome, Firefox, Safari, Edge 최신 버전)
- 로컬 서버 (Python, Node.js, 또는 Live Server)

### 설치 및 실행

#### 방법 1: Python 서버 (추천)
```bash
cd moyeosaja
python3 -m http.server 8000
```
브라우저에서 `http://localhost:8000/pages/home.html` 접속

#### 방법 2: Node.js Live Server
```bash
npm install -g live-server
cd moyeosaja
live-server --port=8000
```

#### 방법 3: VS Code Live Server 확장
1. VS Code에서 Live Server 확장 설치
2. `pages/home.html` 우클릭 → "Open with Live Server"

## 🎨 개발 가이드

### 디자인 시스템

#### 색상 팔레트
```css
/* Primary Colors */
--primary-dark: #272727;    /* 메인 텍스트, 버튼 */
--primary-blue: #297eff;    /* 액센트, 활성 상태 */
--primary-red: #ff5758;     /* 긴급, 에러 */

/* Background */
--bg-light: #f1f1f1;        /* 페이지 배경 */
--bg-white: #fcfcfc;        /* 카드 배경 */

/* Category Colors */
--category-navy: #373e6c;   /* 공동배달, 번개공구 */
--category-red: #ff5758;    /* 묶음구매 */
--category-blue: #297eff;   /* 정기공구 */

/* Text */
--text-primary: #272727;
--text-secondary: #545454;
--text-muted: #9e9e9e;
```

#### 타이포그래피
```css
/* Font Family */
font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;

/* Font Sizes */
--font-xs: 8px;      /* 배지 */
--font-sm: 10px;     /* 설명 텍스트 */
--font-base: 12px;   /* 본문 */
--font-md: 15px;     /* 타이틀 */
--font-lg: 17px;     /* 페이지 타이틀 */
--font-xl: 28px;     /* 캘린더 월 */
```

#### 간격 시스템
```css
/* 4px 단위 사용 */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
```

### 컴포넌트 개발

#### 새 페이지 추가하기

1. **HTML 파일 생성**
```bash
cp pages/home.html pages/new-page.html
```

2. **CSS 스타일 추가**
```css
/* css/new-page.css */
.new-page-container {
    background-color: #f1f1f1;
    min-height: 100vh;
    padding-bottom: 92px;
}
```

3. **JavaScript 기능 추가**
```javascript
// js/new-page.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('New page loaded');
    // 기능 구현
});
```

4. **네비게이션 추가**
```html
<!-- nav.js가 자동으로 처리 -->
<script src="../js/nav.js"></script>
```

### JavaScript 패턴

#### 컴포넌트 클래스
```javascript
class MyComponent {
    constructor(selector) {
        this.element = document.querySelector(selector);
        this.init();
    }
    
    init() {
        this.bindEvents();
    }
    
    bindEvents() {
        this.element.addEventListener('click', () => {
            this.handleClick();
        });
    }
    
    handleClick() {
        // 클릭 처리
    }
}

export default MyComponent;
```

#### 유틸리티 함수 사용
```javascript
import { Utils } from './utils.js';

// DOM 선택
const element = Utils.$('.selector');
const elements = Utils.$$('.multiple');

// 스토리지
Utils.storage.set('key', 'value');
const value = Utils.storage.get('key');

// 디바운스
const debouncedFn = Utils.debounce(() => {
    console.log('Debounced!');
}, 300);
```

### 스타일링 가이드

#### BEM 네이밍
```css
/* Block */
.card { }

/* Element */
.card__title { }
.card__description { }

/* Modifier */
.card--large { }
.card--featured { }
```

#### 반응형 디자인
```css
/* 기본 (모바일) */
.container {
    max-width: 440px;
}

/* 작은 화면 */
@media (max-width: 390px) {
    .container {
        padding: 0 16px;
    }
}

/* 큰 화면 */
@media (min-width: 441px) {
    .container {
        margin: 0 auto;
    }
}
```

## 🎯 주요 기능 구현

### 하단 네비게이션
```javascript
// nav.js가 자동으로 처리
// 모든 페이지에 다음 스크립트 추가:
<script src="../js/nav.js"></script>
```

### 검색 기능
```javascript
// SearchComponent 사용
const search = new SearchComponent('.search-input');
search.onSearch((query) => {
    console.log('Search:', query);
});
```

### 폼 검증
```javascript
// signup-steps.js 참고
const isValid = validateEmail(email);
const isStrongPassword = validatePassword(password);
```

### 상태 관리
```javascript
// sessionStorage 사용
sessionStorage.setItem('searchQuery', query);
const query = sessionStorage.getItem('searchQuery');

// localStorage 사용 (자동 로그인)
localStorage.setItem('autoLogin', 'true');
```

## 🧪 테스트

### 브라우저 호환성
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### 테스트 체크리스트
- [ ] 모든 페이지 로딩 확인
- [ ] 네비게이션 동작 확인
- [ ] 폼 검증 테스트
- [ ] 반응형 디자인 확인
- [ ] 접근성 테스트 (스크린 리더)

## 📈 성능 최적화

### 이미지 최적화
- WebP 포맷 사용
- 이미지 압축 (TinyPNG)
- Lazy Loading 구현

### CSS 최적화
- 중복 스타일 제거
- CSS 압축 (production)
- Critical CSS 인라인

### JavaScript 최적화
- 코드 스플리팅
- 디바운싱/스로틀링
- 이벤트 위임

## 🤝 기여하기

프로젝트 개선에 기여하고 싶으시다면:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 변경 이력

### v1.0.0 (2025-01-13)
- ✅ 35개 페이지 완벽 구현
- ✅ Figma 디자인 100% 재현
- ✅ 반응형 디자인 적용
- ✅ 인터랙션 & 애니메이션
- ✅ 네비게이션 시스템
- ✅ 폼 검증
- ✅ 리뷰 시스템
- ✅ 회원가입 4단계 프로세스

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 
자세한 내용은 `LICENSE` 파일을 참조하세요.

## 👥 제작

**MOYEO Team**
- UI/UX Design: Figma 디자인 시스템
- Frontend Development: HTML/CSS/JavaScript

## 📞 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 Issue를 생성해주세요.

---

⭐ 이 프로젝트가 도움이 되셨다면 Star를 눌러주세요!
