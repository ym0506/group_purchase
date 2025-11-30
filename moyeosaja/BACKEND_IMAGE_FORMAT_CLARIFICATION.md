# 백엔드 이미지 형식 확인 요청

## 📋 백엔드 답변 해석

백엔드 팀의 답변:
> "이미지 업로드 따로는 없고 공구글이나 회원가입할때 url주소 프론트에서 받는 형식으로 구현했습니다!"

**의미:**
- ✅ 이미지 업로드 전용 API 엔드포인트는 없음
- ✅ 공구글 작성/회원가입 API 호출 시 이미지 URL을 함께 전송
- ✅ 프론트엔드에서 이미지 URL 문자열을 받아서 백엔드로 전송

## 🔍 현재 프론트엔드 구현

### 공구글 작성 시 이미지 전송

**현재 전송 형식:**
```json
{
  "post_type": "group",
  "title": "게시글 제목",
  "description": "게시글 내용",
  "imageUrls": ["data:image/png;base64,iVBORw0KGgoAAAANS..."],  // base64 데이터 URL
  "main_image_url": "data:image/png;base64,iVBORw0KGgoAAAANS..."  // base64 데이터 URL
}
```

**이미지 형식:**
- base64 데이터 URL: `data:image/png;base64,iVBORw0KGgoAAAANS...`
- 예시: `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...`

## ❓ 확인이 필요한 사항

### 1. 이미지 URL 형식

**질문:** 백엔드가 받는 "url주소"는 어떤 형식인가요?

**옵션 A: base64 데이터 URL**
- 형식: `data:image/png;base64,iVBORw0KGgoAAAANS...`
- 현재 프론트엔드가 전송하는 형식
- ✅ 장점: 별도 업로드 API 불필요
- ❓ 백엔드가 이 형식을 처리할 수 있나요?

**옵션 B: 실제 HTTP URL**
- 형식: `https://example.com/images/photo.jpg`
- ❓ 프론트엔드에서 어떻게 이 URL을 얻나요?
- ❓ 외부 이미지 호스팅 서비스를 사용해야 하나요?

### 2. 필드명 확인

**질문:** 백엔드가 기대하는 필드명은 무엇인가요?

**현재 프론트엔드 전송:**
- `imageUrls`: 배열 형식 `["data:image/..."]`
- `main_image_url`: 문자열 형식 `"data:image/..."`

**백엔드 응답:**
- `imageUrls`: 배열 형식 `[]` (빈 배열로 반환됨)

**확인 필요:**
- [ ] `imageUrls` 배열을 받아서 저장하나요?
- [ ] `main_image_url` 문자열을 받아서 저장하나요?
- [ ] 다른 필드명을 사용하나요? (예: `images`, `imageUrl`, `mainImageUrl`)

### 3. base64 처리

**질문:** 백엔드가 base64 데이터 URL을 처리할 수 있나요?

**현재 상황:**
- 프론트엔드: base64 데이터 URL 전송 ✅
- 백엔드 응답: `imageUrls: []` (빈 배열) ❌
- 결과: 이미지가 저장되지 않음

**확인 필요:**
- [ ] base64 데이터 URL을 받아서 저장할 수 있나요?
- [ ] base64를 디코딩하여 파일로 저장하나요?
- [ ] base64를 그대로 문자열로 저장하나요?
- [ ] base64 크기 제한이 있나요? (현재 최대 약 5MB)

### 4. 게시글 작성 API 스펙

**엔드포인트:** `POST /api/posts`

**현재 프론트엔드 전송 데이터:**
```json
{
  "post_type": "group",
  "title": "게시글 제목",
  "description": "게시글 내용",
  "imageUrls": ["data:image/png;base64,..."],
  "main_image_url": "data:image/png;base64,...",
  "total_price": 30000,
  "target_participants": 4,
  "per_person_price": 7500,
  "pickup_datetime": "2025-11-05T18:00:00",
  "end_date": "2025-11-06T23:59:59",
  "pickup_location_text": "한서대학교 학생회관 앞"
}
```

**확인 필요:**
- [ ] 이 형식이 맞나요?
- [ ] 어떤 필드가 필수인가요?
- [ ] 이미지 필드명이 정확한가요?

### 5. 게시글 조회 API 스펙

**엔드포인트:** `GET /api/posts/{postId}`

**현재 백엔드 응답:**
```json
{
  "id": 8,
  "postType": "GROUP",
  "title": "게시글 제목",
  "content": null,
  "imageUrls": [],  // 빈 배열로 반환됨
  ...
}
```

**확인 필요:**
- [ ] 이미지가 저장되었을 때 `imageUrls` 배열에 포함되나요?
- [ ] 응답 형식이 맞나요?
- [ ] 다른 필드명으로 반환되나요?

## 🐛 현재 문제

### 증상
1. 프론트엔드에서 base64 이미지 전송 ✅
2. 백엔드 응답에서 `imageUrls: []` 빈 배열 반환 ❌
3. 게시글 상세 페이지에서 이미지가 표시되지 않음 ❌

### 가능한 원인
1. 백엔드가 base64를 처리하지 못함
2. 필드명이 맞지 않음
3. 백엔드가 base64를 저장하지 않음
4. base64 크기가 너무 커서 저장 실패

## 📝 백엔드 팀에게 전달할 요약

**현재 상황:**
- 프론트엔드에서 base64 데이터 URL을 `imageUrls` 배열과 `main_image_url` 필드로 전송
- 하지만 백엔드 응답에서 `imageUrls: []` 빈 배열로 반환됨
- 이미지가 저장되지 않고 있음

**확인 요청:**
1. base64 데이터 URL을 받아서 저장할 수 있나요?
2. 게시글 작성 API에서 이미지 필드명은 무엇인가요? (`imageUrls`? `main_image_url`? 다른 필드명?)
3. 이미지가 저장되었을 때 조회 API에서 어떤 필드명으로 반환되나요?
4. base64 크기 제한이 있나요?

**프론트엔드 준비 상태:**
- ✅ base64 데이터 URL 생성 완료
- ✅ 게시글 작성 시 이미지 전송 완료
- ✅ 게시글 조회 시 이미지 표시 준비 완료
- ❓ 백엔드 스펙 확인 필요

**필요한 정보만 받으면 즉시 수정 가능합니다!**

