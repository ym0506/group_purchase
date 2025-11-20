# 백엔드 500 에러 리포트

## 문제 상황

`GET /api/users/me` 엔드포인트에서 **500 Internal Server Error**가 발생하고 있습니다.

## 에러 상세

### 요청 정보
- **엔드포인트**: `GET /api/users/me`
- **URL**: `https://moasaja.onrender.com/api/users/me`
- **HTTP 메서드**: GET
- **상태 코드**: 500 Internal Server Error

### 요청 헤더
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

### 프론트엔드에서 확인된 사항
1. ✅ 토큰이 정상적으로 전송되고 있음
2. ✅ 요청 형식이 올바름 (GET 요청, Bearer 토큰 포함)
3. ❌ 백엔드에서 500 에러 반환

## 가능한 원인

1. **토큰 검증 오류**
   - 토큰 파싱 실패
   - 토큰 만료 처리 오류
   - 데이터베이스 연결 오류

2. **사용자 정보 조회 오류**
   - 데이터베이스 쿼리 오류
   - 사용자 정보가 없는 경우 처리 오류
   - 관계형 데이터 조회 오류

3. **서버 내부 오류**
   - 예외 처리 누락
   - Null 참조 오류
   - 환경 변수 누락

## 백엔드 확인 사항

### 1. 서버 로그 확인
백엔드 서버 로그에서 다음을 확인해주세요:
- 에러 스택 트레이스
- 에러 발생 시점
- 데이터베이스 쿼리 오류
- 환경 변수 설정

### 2. 엔드포인트 구현 확인
```javascript
// 예상되는 구현 (Node.js/Express)
app.get('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // 또는 req.user.user_id
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    
    res.json({
      user_id: user.id,
      email: user.email,
      nickname: user.nickname,
      phone_number: user.phone_number,
      profile_image_url: user.profile_image_url
    });
  } catch (error) {
    console.error('getMyInfo error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
```

### 3. 토큰 검증 미들웨어 확인
```javascript
// authenticateToken 미들웨어
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: '토큰이 필요합니다.' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '토큰이 유효하지 않습니다.' });
    }
    req.user = user;
    next();
  });
}
```

## 프론트엔드에서 수집한 정보

브라우저 콘솔에서 다음 정보를 확인할 수 있습니다:

```javascript
// 콘솔에서 실행하여 확인
console.log('토큰:', localStorage.getItem('access_token'));
console.log('User ID:', localStorage.getItem('userId'));
console.log('User Email:', localStorage.getItem('userEmail'));
```

## 임시 해결 방법

백엔드 수정 전까지 프론트엔드에서:
1. 500 에러 발생 시 사용자에게 명확한 메시지 표시
2. 에러 발생 시 로그인 페이지로 리다이렉트 옵션 제공
3. 재시도 로직 추가 (선택사항)

## 요청 사항

백엔드 팀에서 확인 부탁드립니다:

1. **서버 로그 확인**
   - `/api/users/me` 엔드포인트 호출 시 에러 로그
   - 에러 스택 트레이스 전체 내용

2. **에러 응답 개선**
   - 현재: `{ "error": "Internal Server Error" }`
   - 개선: `{ "error": "Internal Server Error", "message": "상세 에러 메시지", "code": "ERROR_CODE" }`
   - 개발 환경에서는 스택 트레이스 포함 (프로덕션에서는 제외)

3. **엔드포인트 테스트**
   - 유효한 토큰으로 `/api/users/me` 호출 테스트
   - 다양한 시나리오 테스트 (토큰 만료, 사용자 없음 등)

## 추가 정보

프론트엔드에서 다음 정보를 로깅하고 있습니다:
- 요청 URL
- 요청 헤더 (토큰 제외)
- 응답 상태 코드
- 응답 본문
- 에러 메시지

브라우저 개발자 도구 → Network 탭에서 상세한 요청/응답 정보를 확인할 수 있습니다.

