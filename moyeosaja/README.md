# 공동구매 웹사이트 🛒

피그마 디자인을 완벽하게 웹으로 구현한 공동구매 플랫폼입니다.

## 📁 프로젝트 구조

```
figma-website/
├── css/                    # 스타일시트
│   ├── base.css           # 기본 스타일
│   ├── layout.css         # 레이아웃 스타일
│   └── components.css     # 컴포넌트 스타일
├── js/                     # JavaScript 모듈
│   ├── utils.js           # 유틸리티 함수
│   ├── components.js      # 컴포넌트 컨트롤러
│   └── app.js            # 메인 애플리케이션
├── pages/                  # HTML 페이지
│   ├── home.html         # 홈페이지
│   ├── nearby.html       # 내주변 페이지 (예정)
│   ├── my-group.html     # 내 공구 페이지 (예정)
│   ├── notifications.html # 알림 페이지 (예정)
│   └── mypage.html       # 마이페이지 (예정)
├── components/            # 재사용 가능한 컴포넌트
│   └── navigation.html   # 네비게이션 컴포넌트
├── assets/               # 정적 자원
│   ├── images/          # 이미지 파일
│   └── icons/           # 아이콘 파일
├── package.json         # 프로젝트 설정
└── README.md           # 프로젝트 문서
```

## 🚀 시작하기

### 1. 개발 서버 실행 (Python)
```bash
cd figma-website
python3 -m http.server 8000
# http://localhost:8000/pages/home.html 접속
```

### 2. 개발 서버 실행 (Node.js - 선택사항)
```bash
npm install -g live-server
cd figma-website
npm run dev
```

## 🎨 구현된 기능

### ✅ 홈페이지
- [x] 피그마 디자인 완벽 복제
- [x] 반응형 디자인
- [x] 카테고리 카드 인터랙션
- [x] 검색 기능
- [x] 매칭 버튼 애니메이션
- [x] 하단 네비게이션
- [x] 페이지네이션

### 🔄 예정된 페이지
- [ ] 내주변 페이지
- [ ] 내 공구 페이지
- [ ] 알림 페이지
- [ ] 마이페이지
- [ ] 로그인 페이지
- [ ] 공구글 작성 페이지

## 🛠️ 기술 스택

- **HTML5**: 시맨틱 마크업
- **CSS3**: 플렉스박스, 그리드, 애니메이션
- **ES6+ JavaScript**: 모듈, 클래스, async/await
- **Pretendard Font**: 한글 폰트
- **모바일 퍼스트**: 반응형 디자인

## 📱 주요 컴포넌트

### SearchComponent
- 검색 입력 처리
- 실시간 검색 제안
- 키보드 단축키 지원

### CategoryComponent
- 카테고리 선택 처리
- 라우팅 로직
- 호버 애니메이션

### MatchButtonComponent
- 매칭 상태 관리
- 로딩 애니메이션
- API 호출 시뮬레이션

### NavigationComponent
- 페이지 간 이동
- 활성 상태 관리
- 알림 배지 표시

## 🎯 개발 가이드

### 새 페이지 추가하기

1. **HTML 파일 생성**
```bash
cp pages/home.html pages/new-page.html
```

2. **CSS 모듈 수정**
```css
/* components.css에 새로운 컴포넌트 스타일 추가 */
.new-component {
    /* 스타일 정의 */
}
```

3. **JavaScript 컴포넌트 추가**
```javascript
// components.js에 새 컴포넌트 클래스 추가
export class NewComponent {
    constructor(selector) {
        this.element = document.querySelector(selector);
        this.init();
    }
    
    init() {
        // 초기화 로직
    }
}
```

### 스타일 가이드

- **색상**: 피그마 디자인 시스템 준수
- **타이포그래피**: Pretendard 폰트 사용
- **간격**: 4px 단위 사용
- **애니메이션**: 0.2s ease 기본값

### JavaScript 패턴

- **ES6 모듈**: import/export 사용
- **클래스 기반**: 컴포넌트는 클래스로 구현
- **이벤트 위임**: 동적 요소 처리
- **에러 처리**: try/catch 블록 사용

## 🔧 유틸리티 함수

```javascript
import { Utils } from './js/utils.js';

// DOM 조작
Utils.$('.selector');
Utils.$$('.multiple-selector');

// 이벤트 처리
Utils.on(element, 'click', handler);

// 로딩 상태
Utils.addLoadingState(element);

// 로컬 스토리지
Utils.storage.set('key', value);
Utils.storage.get('key');
```

## 📊 성능 최적화

- **CSS**: 중요하지 않은 스타일 지연 로딩
- **JavaScript**: 모듈 분할로 코드 스플리팅
- **이미지**: WebP 포맷 사용 권장
- **폰트**: preconnect로 빠른 로딩

## 🐛 디버깅

```javascript
// 개발자 도구에서 앱 인스턴스 접근
window.app.getCurrentPage();
window.app.search('검색어');
window.app.navigateToPage('홈');
```

## 📝 라이선스

MIT License - 자유롭게 사용하세요!
