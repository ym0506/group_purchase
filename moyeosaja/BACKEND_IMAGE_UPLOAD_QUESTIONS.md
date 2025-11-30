# 백엔드 이미지 업로드 API 확인 사항

## 📋 현재 상황

프론트엔드에서 이미지 업로드를 시도할 때 `404 (Not Found)` 에러가 발생하고 있습니다.

**현재 프론트엔드 동작:**
- 이미지 업로드 API 호출: `POST /api/upload/image`
- 404 에러 발생 시: base64 이미지로 자동 fallback
- 게시물 작성 시: base64 URL을 `main_image_url` 필드에 저장

---

## ❓ 백엔드에게 확인할 사항

### 1. 이미지 업로드 API 존재 여부

**질문:** 이미지 업로드 전용 API 엔드포인트가 있나요?

**현재 프론트엔드가 호출하는 엔드포인트:**
```
POST /api/upload/image
```

**요청 형식:**
- Method: `POST`
- Headers: 
  - `Authorization: Bearer {access_token}`
- Body: `FormData`
  - Key: `image`
  - Value: `File` 객체

**예상 응답 형식:**
```json
{
  "image_url": "https://example.com/uploaded-image.jpg"
}
```

---

### 2. 이미지 업로드 API가 없는 경우

**질문:** 이미지 업로드 API가 없다면, base64 이미지를 그대로 받아서 처리할 수 있나요?

**현재 프론트엔드 동작:**
- 이미지 업로드 API가 없으면 base64 문자열을 `main_image_url`에 저장
- 예: `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...`

**확인 필요:**
- [ ] base64 이미지를 직접 저장할 수 있나요?
- [ ] base64 이미지 크기 제한이 있나요? (현재 최대 약 5MB)
- [ ] base64 이미지를 URL로 변환하는 로직이 백엔드에 있나요?

---

### 3. 이미지 업로드 API가 있는 경우

**질문:** 이미지 업로드 API가 있다면, 다음 사항을 확인해주세요.

#### 3.1 엔드포인트 정보
- [ ] 정확한 엔드포인트 URL은 무엇인가요?
  - 현재 시도: `/api/upload/image`
  - 다른 경로인가요? (예: `/api/posts/upload-image`, `/upload`, 등)

#### 3.2 요청 형식
- [ ] 요청 Method는 `POST`가 맞나요?
- [ ] 인증이 필요한가요? (`Authorization` 헤더)
- [ ] 요청 Body 형식은 무엇인가요?
  - `FormData`? (현재 사용 중)
  - `multipart/form-data`?
  - `application/json`? (base64 문자열)
- [ ] FormData의 key 이름은 무엇인가요?
  - 현재 사용: `image`
  - 다른 이름인가요? (예: `file`, `photo`, `upload`)

#### 3.3 응답 형식
- [ ] 성공 응답 형식은 무엇인가요?
  ```json
  {
    "image_url": "https://example.com/image.jpg"
  }
  ```
  또는
  ```json
  {
    "url": "https://example.com/image.jpg"
  }
  ```
  또는
  ```json
  {
    "imageUrl": "https://example.com/image.jpg"
  }
  ```

#### 3.4 이미지 크기 제한
- [ ] 최대 이미지 크기는 얼마인가요?
  - 현재 프론트엔드: 1MB 이상이면 자동 리사이즈 (최대 1920x1920px, 80% 품질)
- [ ] 권장 이미지 크기는 얼마인가요?

#### 3.5 에러 응답
- [ ] 413 (Content Too Large) 에러를 반환하나요?
- [ ] 다른 에러 코드를 사용하나요?

---

### 4. 이미지 저장 방식

**질문:** 업로드된 이미지는 어디에 저장되나요?

- [ ] AWS S3
- [ ] Google Cloud Storage
- [ ] 로컬 파일 시스템
- [ ] 다른 클라우드 스토리지

**확인 필요:**
- [ ] 이미지 URL 형식은 무엇인가요?
  - 예: `https://s3.amazonaws.com/bucket/image.jpg`
  - 예: `https://storage.googleapis.com/bucket/image.jpg`
  - 예: `https://moasaja.onrender.com/uploads/image.jpg`

---

### 5. 게시물 작성 시 이미지 처리

**질문:** 게시물 작성 API (`POST /api/posts`)에서 이미지를 어떻게 처리하나요?

**현재 프론트엔드가 전송하는 데이터:**
```json
{
  "title": "게시물 제목",
  "content": "게시물 내용",
  "main_image_url": "https://example.com/image.jpg" // 또는 base64 문자열
}
```

**확인 필요:**
- [ ] `main_image_url` 필드에 URL을 전송하면 되나요?
- [ ] `main_image_url` 필드에 base64를 전송해도 되나요?
- [ ] 다른 필드 이름을 사용하나요? (예: `imageUrl`, `image_url`, `mainImageUrl`)
- [ ] 이미지가 없을 때는 `null`을 전송하면 되나요?

---

### 6. 이미지 표시

**질문:** 게시물 조회 API에서 이미지 URL을 어떻게 반환하나요?

**현재 프론트엔드가 기대하는 필드:**
- `main_image_url`
- `mainImageUrl`
- `image_url`
- `imageUrl`

**확인 필요:**
- [ ] 게시물 조회 API에서 이미지 URL 필드 이름은 무엇인가요?
- [ ] 이미지가 없을 때는 `null`을 반환하나요?

---

## 🔧 프론트엔드 현재 구현 상태

### 이미지 업로드 플로우

1. **이미지 선택**
   - 사용자가 이미지 파일 선택
   - 파일 크기 확인

2. **이미지 리사이즈** (1MB 이상인 경우)
   - 최대 크기: 1920x1920px
   - 품질: 80%
   - 자동 압축

3. **이미지 업로드 시도**
   - API 호출: `POST /api/upload/image`
   - FormData로 전송
   - Authorization 헤더 포함

4. **Fallback 처리**
   - 404 에러: base64 사용 (경고 없음)
   - 413 에러: 이미지가 너무 큼 (경고 표시)
   - 기타 에러: base64 사용 (경고 없음)

5. **게시물 작성**
   - `main_image_url` 필드에 URL 또는 base64 저장
   - 이미지가 없으면 `null` 전송

---

## 📝 백엔드에게 전달할 요약

**현재 문제:**
- 이미지 업로드 API (`POST /api/upload/image`)가 404 에러를 반환합니다.
- 프론트엔드는 base64로 fallback하고 있지만, 정확한 API 스펙을 확인하고 싶습니다.

**확인 요청:**
1. 이미지 업로드 API가 있나요? 있다면 엔드포인트와 요청/응답 형식을 알려주세요.
2. 없다면 base64 이미지를 직접 받아서 처리할 수 있나요?
3. 게시물 작성 시 이미지 URL 필드 이름과 형식을 확인해주세요.

**프론트엔드 준비 상태:**
- ✅ 이미지 리사이즈 기능 구현 완료
- ✅ 이미지 업로드 API 호출 로직 구현 완료
- ✅ base64 fallback 로직 구현 완료
- ✅ 에러 처리 로직 구현 완료

**필요한 정보만 받으면 즉시 수정 가능합니다!**

