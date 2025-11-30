# Firebase Storage 설정 가이드

## 📋 개요

이미지 처리를 Firebase Storage로 구현했습니다. Firebase Storage에 이미지를 업로드하고, 다운로드 URL을 받아서 백엔드로 전송합니다.

## 🔧 Firebase Storage 설정 방법

### 1. Firebase Console 접속

1. [Firebase Console](https://console.firebase.google.com) 접속
2. 프로젝트 선택: `login-baa7f`

### 2. Firebase Storage 활성화

1. Firebase Console에서 **Storage** 메뉴 클릭
2. **시작하기** 버튼 클릭
3. **프로덕션 모드에서 시작** 선택 (또는 테스트 모드)
4. Storage 위치 선택 (예: `asia-northeast3` - 서울)

### 3. Firebase 프로젝트 설정 정보 가져오기

1. Firebase Console에서 **프로젝트 설정** (⚙️ 아이콘) 클릭
2. **일반** 탭 선택
3. **내 앱** 섹션에서 웹 앱이 있는지 확인
   - 없으면: **웹 앱 추가** 버튼 클릭하여 추가
   - 있으면: 기존 웹 앱의 설정 정보 확인

4. 다음 정보를 복사:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",  // apiKey
     authDomain: "login-baa7f.firebaseapp.com",  // authDomain
     projectId: "login-baa7f",  // projectId
     storageBucket: "login-baa7f.appspot.com",  // storageBucket
     messagingSenderId: "123456789",  // messagingSenderId
     appId: "1:123456789:web:abcdef..."  // appId
   };
   ```

### 4. Firebase Storage 규칙 설정

1. Firebase Console에서 **Storage** > **규칙** 탭 클릭
2. 다음 규칙으로 설정 (테스트용):

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 인증된 사용자만 업로드 가능
    match /posts/{allPaths=**} {
      allow read: if true;  // 모든 사용자가 읽기 가능
      allow write: if request.auth != null;  // 인증된 사용자만 쓰기 가능
    }
    
    // 프로필 이미지
    match /profiles/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**주의:** 프로덕션 환경에서는 더 엄격한 규칙을 설정해야 합니다.

### 5. Firebase 설정 정보 적용

`js/firebase-storage.js` 파일의 `firebaseConfig` 객체를 업데이트:

```javascript
const firebaseConfig = {
  apiKey: "실제_API_KEY",
  authDomain: "login-baa7f.firebaseapp.com",
  projectId: "login-baa7f",
  storageBucket: "login-baa7f.appspot.com",
  messagingSenderId: "실제_SENDER_ID",
  appId: "실제_APP_ID"
};
```

## 📝 현재 구현 상태

### ✅ 완료된 기능

1. **Firebase Storage 업로드 함수**
   - `uploadImageToFirebase()`: Firebase Storage에 이미지 업로드
   - `uploadImageWithFallback()`: Firebase Storage 실패 시 base64 fallback

2. **이미지 업로드 플로우**
   - Firebase Storage 업로드 시도
   - 실패 시 base64로 자동 fallback
   - 업로드된 URL을 백엔드로 전송

3. **이미지 리사이즈**
   - 1MB 이상인 경우 자동 리사이즈 (1920x1920px, 80% 품질)

### ⚠️ 설정 필요

1. **Firebase 프로젝트 설정 정보**
   - `js/firebase-storage.js`의 `firebaseConfig` 업데이트 필요

2. **Firebase Storage 활성화**
   - Firebase Console에서 Storage 활성화 필요

3. **Storage 규칙 설정**
   - 업로드/다운로드 권한 설정 필요

## 🔄 이미지 업로드 플로우

### 현재 동작 방식

1. **이미지 선택**
   - 사용자가 이미지 파일 선택
   - 파일 크기 및 형식 검증

2. **이미지 리사이즈** (1MB 이상인 경우)
   - 최대 크기: 1920x1920px
   - 품질: 80%
   - 자동 압축

3. **Firebase Storage 업로드 시도**
   - Firebase Storage에 이미지 업로드
   - 업로드된 이미지의 다운로드 URL 받기
   - 예: `https://firebasestorage.googleapis.com/v0/b/login-baa7f.appspot.com/o/posts%2F1234567890_abc123.jpg?alt=media&token=...`

4. **Fallback 처리**
   - Firebase Storage 업로드 실패 시 base64 사용
   - base64 데이터 URL 생성

5. **백엔드로 전송**
   - Firebase Storage URL 또는 base64를 백엔드로 전송
   - `imageUrls` 배열과 `main_image_url` 필드에 포함

## 🎯 다음 단계

1. **Firebase Console에서 Storage 활성화**
2. **Firebase 프로젝트 설정 정보 가져오기**
3. **`js/firebase-storage.js` 파일 업데이트**
4. **Storage 규칙 설정**
5. **테스트: 이미지 업로드 및 게시글 작성**

## 📚 참고 자료

- [Firebase Storage 문서](https://firebase.google.com/docs/storage)
- [Firebase Storage 규칙](https://firebase.google.com/docs/storage/security)
- [Firebase 프로젝트 설정](https://firebase.google.com/docs/web/setup)

