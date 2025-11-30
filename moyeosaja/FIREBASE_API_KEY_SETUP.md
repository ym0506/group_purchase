# Firebase API Key 설정 가이드

## 🚀 빠른 설정 방법

### 방법 1: 브라우저 콘솔에서 설정 (가장 빠름)

1. **Firebase Console 접속**
   - https://console.firebase.google.com/project/login-baa7f/settings/general

2. **웹 앱 설정 정보 확인**
   - "내 앱" 섹션에서 웹 앱 찾기
   - 또는 "웹 앱 추가" 버튼 클릭하여 새로 추가

3. **apiKey 복사**
   - 설정 정보에서 `apiKey` 값 복사
   - 예: `AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567`

4. **브라우저 콘솔에서 설정**
   - 개발자 도구 열기 (F12)
   - Console 탭에서 다음 명령어 실행:
   ```javascript
   localStorage.setItem('firebase_api_key', '실제_API_KEY_여기에_붙여넣기');
   ```
   - 예:
   ```javascript
   localStorage.setItem('firebase_api_key', 'AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567');
   ```

5. **페이지 새로고침**
   - 페이지를 새로고침하면 Firebase Storage가 자동으로 초기화됩니다.

### 방법 2: 코드에 직접 설정

`js/firebase-storage.js` 파일을 열어서 `apiKey` 값을 직접 수정:

```javascript
firebaseConfig = {
    apiKey: "실제_API_KEY_여기에_붙여넣기", // 여기 수정
    authDomain: "login-baa7f.firebaseapp.com",
    projectId: "login-baa7f",
    storageBucket: "login-baa7f.appspot.com",
    messagingSenderId: "296899354710",
    appId: "1:296899354710:web:fcf0d584b294b8a9505bf7"
};
```

## 📋 Firebase Console에서 설정 정보 가져오기

### 단계별 가이드

1. **Firebase Console 접속**
   - https://console.firebase.google.com
   - 프로젝트 `login-baa7f` 선택

2. **프로젝트 설정 열기**
   - 좌측 상단 ⚙️ 아이콘 클릭
   - "프로젝트 설정" 클릭

3. **일반 탭 선택**
   - "일반" 탭이 기본으로 열림

4. **내 앱 섹션 확인**
   - "내 앱" 섹션에서 웹 앱 찾기
   - 웹 앱이 없으면 "웹 앱 추가" 버튼 클릭

5. **설정 정보 복사**
   - 웹 앱의 설정 정보에서 다음 값들을 복사:
     - `apiKey`
     - `authDomain` (이미 설정됨: `login-baa7f.firebaseapp.com`)
     - `projectId` (이미 설정됨: `login-baa7f`)
     - `storageBucket` (이미 설정됨: `login-baa7f.appspot.com`)
     - `messagingSenderId` (이미 설정됨: `296899354710`)
     - `appId` (이미 설정됨: `1:296899354710:web:fcf0d584b294b8a9505bf7`)

## ✅ 확인 방법

설정이 완료되면 브라우저 콘솔에서 다음 메시지를 확인할 수 있습니다:

```
✅ Firebase Storage 초기화 완료
```

설정이 안 되면:
```
⚠️ Firebase apiKey가 설정되지 않았습니다.
💡 Firebase Console에서 apiKey를 가져와서 설정하세요:
```

## 🔧 Firebase Storage 활성화

Firebase Storage를 사용하려면:

1. **Firebase Console에서 Storage 활성화**
   - https://console.firebase.google.com/project/login-baa7f/storage
   - "시작하기" 버튼 클릭
   - 프로덕션 모드 또는 테스트 모드 선택
   - Storage 위치 선택 (예: `asia-northeast3` - 서울)

2. **Storage 규칙 설정**
   - Storage > 규칙 탭
   - 다음 규칙 설정 (테스트용):
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /posts/{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

## 🎯 완료 후

설정이 완료되면:
1. 이미지 업로드 시 Firebase Storage에 자동 업로드
2. 업로드된 이미지의 다운로드 URL을 백엔드로 전송
3. Firebase Storage 업로드 실패 시 base64로 자동 fallback

