# 백엔드 API 연동 가이드

## 📋 목차
1. [기본 정보](#기본-정보)
2. [API 엔드포인트 목록](#api-엔드포인트-목록)
3. [인증 방식](#인증-방식)
4. [요청/응답 형식](#요청응답-형식)
5. [에러 처리](#에러-처리)
6. [필수 구현 사항](#필수-구현-사항)

---

## 기본 정보

### 프론트엔드 설정
- **API 기본 URL**: `http://localhost:3000` (개발 환경)
- **프로덕션 URL**: `https://api.moyeo.com` (배포 시 변경)
- **인증 토큰 저장**: `localStorage.getItem('access_token')`
- **Content-Type**: `application/json`

### 백엔드 서버 주소
백엔드 개발자에게 다음 정보를 제공해주세요:
- **개발 환경**: `http://localhost:3000`
- **프로덕션 환경**: `https://api.moyeo.com` (또는 실제 배포 주소)

---

## API 엔드포인트 목록

### 1. 유저 API

#### 1.1 회원가입
```
POST /api/users/signup
```

**요청 Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "nickname": "사용자닉네임",
  "phone_number": "01012345678"
}
```

**응답:**
```json
{
  "user_id": 1,
  "email": "user@example.com",
  "nickname": "사용자닉네임",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 1.2 로그인
```
POST /api/users/login
```

**요청 Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**응답:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_id": 1,
  "email": "user@example.com",
  "nickname": "사용자닉네임"
}
```

#### 1.3 내 정보 조회
```
GET /api/users/me
```

**헤더:**
```
Authorization: Bearer {access_token}
```

**응답:**
```json
{
  "user_id": 1,
  "email": "user@example.com",
  "nickname": "사용자닉네임",
  "phone_number": "01012345678",
  "profile_image_url": "https://example.com/profile.jpg"
}
```

#### 1.4 내 정보 수정
```
PATCH /api/users/me
```

**헤더:**
```
Authorization: Bearer {access_token}
```

**요청 Body:**
```json
{
  "nickname": "새닉네임",
  "phone_number": "01087654321"
}
```

---

### 2. 공구 게시글 API

#### 2.1 게시글 목록 조회
```
GET /api/posts
```

**Query Parameters:**
- `type`: 게시글 타입 (`group`, `delivery`, `bundle`, `flash`, `regular` 또는 `null` 전체)
- `latitude`: 위도 (선택)
- `longitude`: 경도 (선택)
- `distance`: 거리 (km, 선택)
- `page`: 페이지 번호 (선택, 기본값: 1)
- `limit`: 페이지당 항목 수 (선택, 기본값: 20)

**응답:**
```json
{
  "posts": [
    {
      "post_id": 1,
      "title": "소금빵",
      "description": "소금빵 실수로 너무 많이 사버렸는데 같이 나눠먹어요",
      "main_image_url": "https://example.com/image.jpg",
      "total_price": 75000,
      "target_participants": 4,
      "current_participants": 2,
      "per_person_price": 18750,
      "pickup_datetime": "2025-11-05T18:00:00",
      "end_date": "2025-11-06T23:59:59",
      "pickup_location_text": "한서대학교 학생회관 앞",
      "author_id": 1,
      "author_nickname": "최지인",
      "created_at": "2025-11-01T10:00:00"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

#### 2.2 게시글 작성
```
POST /api/posts
```

**헤더:**
```
Authorization: Bearer {access_token}
```

**요청 Body:**
```json
{
  "post_type": "group",
  "title": "소금빵",
  "description": "소금빵 실수로 너무 많이 사버렸는데 같이 나눠먹어요",
  "main_image_url": "https://example.com/image.jpg",
  "total_price": 75000,
  "target_participants": 4,
  "per_person_price": 18750,
  "pickup_datetime": "2025-11-05T18:00:00",
  "end_date": "2025-11-06T23:59:59",
  "pickup_location_text": "한서대학교 학생회관 앞"
}
```

**응답:**
```json
{
  "post_id": 1,
  "title": "소금빵",
  "created_at": "2025-11-01T10:00:00"
}
```

#### 2.3 게시글 상세 조회
```
GET /api/posts/{postId}
```

**응답:**
```json
{
  "post_id": 1,
  "title": "소금빵",
  "description": "소금빵 실수로 너무 많이 사버렸는데 같이 나눠먹어요",
  "main_image_url": "https://example.com/image.jpg",
  "total_price": 75000,
  "target_participants": 4,
  "current_participants": 2,
  "per_person_price": 18750,
  "pickup_datetime": "2025-11-05T18:00:00",
  "end_date": "2025-11-06T23:59:59",
  "pickup_location_text": "한서대학교 학생회관 앞",
  "author_id": 1,
  "author_nickname": "최지인",
  "participants": [
    {
      "user_id": 2,
      "nickname": "참여자1",
      "joined_at": "2025-11-01T11:00:00"
    }
  ],
  "created_at": "2025-11-01T10:00:00"
}
```

#### 2.4 게시글 수정
```
PATCH /api/posts/{postId}
```

**헤더:**
```
Authorization: Bearer {access_token}
```

#### 2.5 게시글 삭제
```
DELETE /api/posts/{postId}
```

**헤더:**
```
Authorization: Bearer {access_token}
```

---

### 3. 공구 참여 API

#### 3.1 공구 참여 신청
```
POST /api/posts/{postId}/participations
```

**헤더:**
```
Authorization: Bearer {access_token}
```

**응답:**
```json
{
  "participation_id": 1,
  "post_id": 1,
  "user_id": 2,
  "joined_at": "2025-11-01T11:00:00"
}
```

#### 3.2 공구 참여 취소
```
DELETE /api/posts/{postId}/participations
```

**헤더:**
```
Authorization: Bearer {access_token}
```

---

### 4. 댓글 API

#### 4.1 댓글 목록 조회
```
GET /api/posts/{postId}/comments
```

**응답:**
```json
{
  "comments": [
    {
      "comment_id": 1,
      "post_id": 1,
      "user_id": 2,
      "nickname": "댓글작성자",
      "content": "참여하고 싶어요!",
      "parent_comment_id": null,
      "created_at": "2025-11-01T12:00:00"
    }
  ]
}
```

#### 4.2 댓글 작성
```
POST /api/posts/{postId}/comments
```

**헤더:**
```
Authorization: Bearer {access_token}
```

**요청 Body:**
```json
{
  "content": "참여하고 싶어요!",
  "parent_comment_id": null
}
```

#### 4.3 댓글 삭제
```
DELETE /api/comments/{commentId}
```

**헤더:**
```
Authorization: Bearer {access_token}
```

---

### 5. 리뷰 & 관심목록 API

#### 5.1 리뷰 작성
```
POST /api/posts/{postId}/reviews
```

**헤더:**
```
Authorization: Bearer {access_token}
```

**요청 Body:**
```json
{
  "rating": 5,
  "comment": "정말 좋은 공구였어요!"
}
```

#### 5.2 내가 작성한 리뷰 목록 조회
```
GET /api/users/me/reviews
```

**헤더:**
```
Authorization: Bearer {access_token}
```

#### 5.3 유저가 받은 리뷰 목록
```
GET /api/users/{userId}/reviews
```

**응답:**
```json
{
  "reviews": [
    {
      "review_id": 1,
      "post_id": 1,
      "reviewer_id": 2,
      "reviewer_nickname": "리뷰어",
      "rating": 5,
      "comment": "정말 좋은 공구였어요!",
      "created_at": "2025-11-01T13:00:00"
    }
  ],
  "average_rating": 4.5,
  "total_reviews": 10
}
```

#### 5.4 관심 목록 추가
```
POST /api/posts/{postId}/wishlist
```

**헤더:**
```
Authorization: Bearer {access_token}
```

#### 5.5 관심 목록 삭제
```
DELETE /api/posts/{postId}/wishlist
```

**헤더:**
```
Authorization: Bearer {access_token}
```

#### 5.6 내 관심 목록 조회
```
GET /api/users/me/wishlist
```

**헤더:**
```
Authorization: Bearer {access_token}
```

---

### 6. 매칭대기 & 거래내역 API

#### 6.1 매칭 대기 내역 조회
```
GET /api/users/me/matching
```

**헤더:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `status`: 상태 필터 (`waiting`, `success`, `closed` 또는 `null` 전체)

**응답:**
```json
{
  "matching": [
    {
      "post_id": 1,
      "title": "소금빵",
      "status": "waiting",
      "current_participants": 2,
      "target_participants": 4,
      "pickup_datetime": "2025-11-05T18:00:00",
      "created_at": "2025-11-01T10:00:00"
    }
  ]
}
```

#### 6.2 거래 완료 내역 조회
```
GET /api/users/me/transactions
```

**헤더:**
```
Authorization: Bearer {access_token}
```

#### 6.3 취소한 내역 조회
```
GET /api/users/me/cancellations
```

**헤더:**
```
Authorization: Bearer {access_token}
```

---

## 인증 방식

### JWT 토큰 기반 인증
- 모든 인증이 필요한 API는 `Authorization` 헤더에 Bearer 토큰을 포함해야 합니다.
- 토큰 형식: `Bearer {access_token}`
- 토큰 만료 시: `401 Unauthorized` 응답 후 자동으로 로그인 페이지로 리다이렉트

### 토큰 저장
- 프론트엔드에서 `localStorage.setItem('access_token', token)`으로 저장
- 자동 로그인 기능 지원

---

## 요청/응답 형식

### 요청
- **Content-Type**: `application/json`
- **Method**: GET, POST, PATCH, DELETE
- **Body**: JSON 형식 (POST, PATCH 요청 시)

### 응답
- **성공**: `200 OK` 또는 `201 Created`
- **에러**: `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`
- **응답 형식**: JSON

---

## 에러 처리

### 에러 응답 형식
```json
{
  "error": true,
  "message": "에러 메시지",
  "code": "ERROR_CODE"
}
```

### 주요 에러 코드
- `401`: 인증 실패 (토큰 만료 또는 유효하지 않음)
- `400`: 잘못된 요청 (필수 파라미터 누락, 형식 오류 등)
- `404`: 리소스를 찾을 수 없음
- `500`: 서버 내부 오류

### 프론트엔드 에러 처리
- 모든 API 호출은 try-catch로 감싸져 있음
- 에러 발생 시 사용자에게 alert 또는 console.error로 표시
- 401 에러 시 자동으로 로그인 페이지로 리다이렉트

---

## 필수 구현 사항

### 백엔드 개발자에게 전달할 사항

1. **CORS 설정**
   - 프론트엔드 도메인에서의 요청을 허용해야 합니다.
   - 개발 환경: `http://localhost:5500`, `http://127.0.0.1:5500` 등
   - 프로덕션 환경: 실제 프론트엔드 도메인

2. **API 엔드포인트**
   - 위에 나열된 모든 엔드포인트를 구현해야 합니다.
   - 엔드포인트 경로는 정확히 일치해야 합니다.

3. **인증 토큰**
   - JWT 토큰 기반 인증을 사용합니다.
   - 토큰은 `Authorization: Bearer {token}` 형식으로 전달됩니다.

4. **응답 형식**
   - 모든 응답은 JSON 형식이어야 합니다.
   - 에러 응답도 위의 형식을 따라야 합니다.

5. **데이터베이스 스키마**
   - 게시글, 유저, 댓글, 리뷰, 관심목록 등의 테이블이 필요합니다.
   - 관계형 데이터베이스 설계가 필요합니다.

6. **이미지 업로드**
   - 게시글 이미지 업로드 기능이 필요합니다.
   - 이미지 URL을 반환해야 합니다.

7. **위치 기반 검색**
   - 위도/경도 기반 거리 계산 기능이 필요합니다.
   - 반경 내 게시글 검색 기능이 필요합니다.

---

## 테스트 방법

### 개발 환경 테스트
1. 백엔드 서버를 `http://localhost:3000`에서 실행
2. 프론트엔드를 로컬 서버에서 실행
3. 브라우저 콘솔에서 API 호출 확인
4. Network 탭에서 요청/응답 확인

### API 테스트 도구
- Postman
- curl
- 브라우저 개발자 도구 Network 탭

---

## 추가 참고사항

### 프론트엔드 파일 위치
- API 서비스: `/js/api.js`
- 각 페이지별 JavaScript: `/js/{page-name}.js`

### 주요 기능별 연동 파일
- 로그인: `js/login.js`
- 회원가입: `js/signup-steps.js`
- 게시글 작성: `js/create-post-step4.js`
- 게시글 목록: `js/app.js`
- 매칭: `js/matching.js`
- 리뷰: `js/review-write.js`, `js/review-list.js`

---

## 문의사항

백엔드 개발 중 문제가 발생하면 다음 정보를 확인해주세요:
1. API 엔드포인트가 정확히 일치하는지
2. CORS 설정이 올바른지
3. 인증 토큰이 올바르게 전달되는지
4. 응답 형식이 JSON인지
5. 에러 응답 형식이 일치하는지

