# 기능 작동 확인 체크리스트

백엔드 배포 후 주요 기능들이 정상 작동하는지 확인하는 체크리스트입니다.

## 🔍 검색 기능

### 테스트 방법
1. 배포 주소 접속: https://login-baa7f.web.app/pages/search.html
2. 검색어 입력 (예: "소금빵", "치킨")
3. Enter 키 또는 검색 버튼 클릭

### 확인 사항
- ✅ 검색어 입력 시 API 호출: `GET /api/posts/search?q=<keyword>`
- ✅ 검색 결과가 정상적으로 표시되는지
- ✅ 검색 결과가 없을 때 빈 상태 메시지 표시
- ✅ 에러 발생 시 에러 메시지 표시

### API 엔드포인트
```javascript
// js/api.js
async searchPosts(keyword) {
    return this.get('/api/posts/search', { q: keyword });
}
```

### 예상 응답 형식
```json
[
  {
    "id": 1,
    "title": "소금빵",
    "content": "소금빵 실수로 너무 많이 사버렸는데...",
    "maxParticipants": 4,
    "imageUrls": ["https://..."],
    "author": { "nickname": "홍길동", "profileImageUrl": "..." }
  }
]
```

---

## 🤖 AI 요약하기 기능

### 테스트 방법
1. 배포 주소 접속: https://login-baa7f.web.app/pages/create-post-step1.html
2. 로그인 필요 (로그인하지 않은 경우 로그인 페이지로 이동)
3. 공구 내용 입력란에 텍스트 입력
4. "AI 요약하기" 버튼 클릭

### 확인 사항
- ✅ 텍스트 입력 후 AI 요약 버튼 클릭 시 API 호출: `POST /api/ai/refine`
- ✅ 요약 결과가 정상적으로 반환되는지
- ✅ 토글 스위치가 켜져 있으면 자동 적용
- ✅ 토글 스위치가 꺼져 있으면 확인 후 적용
- ✅ 에러 발생 시 에러 메시지 표시

### API 엔드포인트
```javascript
// js/api.js
async refineContent(content) {
    const response = await this.post('/api/ai/refine', { content });
    return response; // 문자열로 반환
}
```

### 요청 형식
```json
{
  "content": "소금빵 실수로 너무 많이 사버렸는데 같이 나눠먹어요..."
}
```

### 예상 응답
```
"소금빵을 너무 많이 구매하여 함께 나눠 드리고 싶습니다."
```

---

## 📝 기타 주요 기능 확인

### 1. 로그인/회원가입
- ✅ 회원가입: `POST /api/users/signup`
- ✅ 로그인: `POST /api/users/login`
- ✅ 내 정보 조회: `GET /api/users/me` (현재 500 에러 가능성)

### 2. 게시글 관리
- ✅ 게시글 목록: `GET /api/posts`
- ✅ 게시글 작성: `POST /api/posts`
- ✅ 게시글 상세: `GET /api/posts/{postId}`
- ✅ 게시글 수정: `PATCH /api/posts/{postId}`
- ✅ 게시글 삭제: `DELETE /api/posts/{postId}`

### 3. 댓글
- ✅ 댓글 목록: `GET /api/posts/{postId}/comments`
- ✅ 댓글 작성: `POST /api/posts/{postId}/comments`
- ✅ 댓글 삭제: `DELETE /api/comments/{commentId}`

### 4. 관심목록
- ✅ 관심목록 조회: `GET /api/users/me/wishlist`
- ✅ 관심 추가: `POST /api/posts/{postId}/wishlist`
- ✅ 관심 제거: `DELETE /api/posts/{postId}/wishlist`

### 5. 매칭/참여
- ✅ 공구 참여: `POST /api/posts/{postId}/participations`
- ✅ 공구 참여 취소: `DELETE /api/posts/{postId}/participations`
- ✅ 매칭 내역: `GET /api/users/me/matching`

### 6. 리뷰
- ✅ 리뷰 작성: `POST /api/posts/{postId}/reviews`
- ✅ 내 리뷰 목록: `GET /api/users/me/reviews`
- ✅ 사용자별 리뷰: `GET /api/users/{userId}/reviews`

---

## 🐛 알려진 이슈

### 1. 내 정보 조회 500 에러
- **엔드포인트**: `GET /api/users/me`
- **상태**: 백엔드 서버 오류 가능성
- **대응**: localStorage 폴백 데이터 사용 중

### 2. API Base URL
- **프로덕션**: `https://moasaja.onrender.com`
- **자동 감지**: 배포 환경에서는 자동으로 프로덕션 URL 사용

---

## 🔧 테스트 방법

### 브라우저 콘솔에서 직접 테스트

```javascript
// 1. 검색 기능 테스트
window.apiService.searchPosts('소금빵')
  .then(results => console.log('검색 결과:', results))
  .catch(error => console.error('검색 오류:', error));

// 2. AI 요약 기능 테스트
window.apiService.refineContent('소금빵 실수로 너무 많이 사버렸는데 같이 나눠먹어요')
  .then(summary => console.log('AI 요약:', summary))
  .catch(error => console.error('AI 요약 오류:', error));

// 3. API Base URL 확인
console.log('API Base URL:', window.apiService.baseURL);

// 4. 토큰 확인
console.log('Access Token:', localStorage.getItem('access_token') ? '있음' : '없음');
```

---

## ✅ 체크리스트

### 검색 기능
- [ ] 검색어 입력 시 API 호출 확인
- [ ] 검색 결과 정상 표시
- [ ] 빈 결과 처리 확인
- [ ] 에러 처리 확인

### AI 요약 기능
- [ ] 텍스트 입력 후 버튼 클릭 시 API 호출 확인
- [ ] 요약 결과 정상 반환
- [ ] 자동 적용 기능 확인
- [ ] 에러 처리 확인

### 기타 기능
- [ ] 로그인/회원가입 정상 작동
- [ ] 게시글 CRUD 정상 작동
- [ ] 댓글 기능 정상 작동
- [ ] 관심목록 기능 정상 작동
- [ ] 매칭/참여 기능 정상 작동
- [ ] 리뷰 기능 정상 작동

---

## 📞 문제 발생 시

1. **브라우저 콘솔 확인**: F12 → Console 탭에서 에러 메시지 확인
2. **Network 탭 확인**: F12 → Network 탭에서 API 요청/응답 확인
3. **API Base URL 확인**: 콘솔에서 `window.apiService.baseURL` 확인
4. **토큰 확인**: 콘솔에서 `localStorage.getItem('access_token')` 확인

---

**마지막 업데이트**: 2025-11-26

