# 백엔드 CORS 설정 요청

## 문제 상황

프론트엔드 개발 환경에서 백엔드 API(`https://moasaja.onrender.com`) 호출 시 CORS(Cross-Origin Resource Sharing) 오류가 발생하고 있습니다.

**에러 메시지:**
```
Access to fetch at 'https://moasaja.onrender.com/api/users/signup' 
from origin 'http://127.0.0.1:56142' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 요청 사항

백엔드 서버에서 다음 Origin들을 허용하는 CORS 설정이 필요합니다:

### 1. 개발 환경 (필수)
- `http://127.0.0.1:*` (모든 포트)
- `http://localhost:*` (모든 포트)

### 2. 프로덕션 환경 (배포 후)
- `https://moyeosaja.vercel.app` (예시, 실제 도메인으로 변경)
- `https://moyeosaja.netlify.app` (예시, 실제 도메인으로 변경)

### 3. 허용해야 할 HTTP 메서드
- `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`

### 4. 허용해야 할 헤더
- `Content-Type`
- `Authorization`
- `X-Requested-With`

## 구현 예시

### Node.js/Express 예시

```javascript
const express = require('express');
const cors = require('cors');

const app = express();

// CORS 설정
const corsOptions = {
    origin: function (origin, callback) {
        // 허용할 Origin 목록
        const allowedOrigins = [
            // 개발 환경
            /^http:\/\/127\.0\.0\.1:\d+$/,  // 127.0.0.1:모든포트
            /^http:\/\/localhost:\d+$/,      // localhost:모든포트
            
            // 프로덕션 환경 (실제 도메인으로 변경 필요)
            'https://moyeosaja.vercel.app',
            'https://moyeosaja.netlify.app',
        ];

        // Origin이 없거나 (같은 Origin 요청) 허용된 Origin인 경우
        if (!origin || allowedOrigins.some(pattern => {
            if (typeof pattern === 'string') {
                return pattern === origin;
            }
            return pattern.test(origin);
        })) {
            callback(null, true);
        } else {
            callback(new Error('CORS 정책에 의해 차단되었습니다.'));
        }
    },
    credentials: true, // 쿠키/인증 정보 포함 허용
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
    ],
    exposedHeaders: ['Authorization'], // 클라이언트에서 접근 가능한 헤더
    maxAge: 86400, // Preflight 요청 캐시 시간 (24시간)
};

app.use(cors(corsOptions));

// 또는 모든 Origin 허용 (개발용, 프로덕션에서는 비추천)
// app.use(cors({
//     origin: '*',
//     credentials: false,
// }));
```

### Django 예시

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://127.0.0.1:3000",
    "http://127.0.0.1:56142",
    "http://localhost:3000",
    "http://localhost:56142",
    # 프로덕션 도메인 추가
    "https://moyeosaja.vercel.app",
]

# 또는 개발 환경에서 모든 로컬 호스트 허용
CORS_ALLOW_ALL_ORIGINS = True  # 개발용만 (프로덕션에서는 False)

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# django-cors-headers 미들웨어 추가
MIDDLEWARE = [
    ...
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    ...
]
```

### Spring Boot 예시

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://127.0.0.1:3000",
                    "http://127.0.0.1:56142",
                    "http://localhost:3000",
                    "http://localhost:56142",
                    "https://moyeosaja.vercel.app",
                    "https://moyeosaja.netlify.app"
                )
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(86400);
    }
}
```

## 테스트 방법

CORS 설정 후 다음 명령어로 확인:

```bash
# OPTIONS 요청 (Preflight) 테스트
curl -X OPTIONS "https://moasaja.onrender.com/api/users/signup" \
  -H "Origin: http://127.0.0.1:56142" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  -v

# 응답 헤더에 다음이 포함되어야 함:
# Access-Control-Allow-Origin: http://127.0.0.1:56142
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
# Access-Control-Allow-Headers: Content-Type, Authorization
```

## 중요 사항

1. **Preflight 요청 처리**: `OPTIONS` 메서드 요청도 제대로 처리해야 합니다.
2. **자격 증명(credentials)**: JWT 토큰 등 인증 정보를 사용하는 경우 `credentials: true` 설정 필요
3. **보안**: 프로덕션 환경에서는 정확한 도메인만 허용하도록 설정
4. **개발 환경**: 개발 중에는 로컬 호스트의 모든 포트를 허용하는 것이 편리합니다

## 현재 임시 해결책

프론트엔드에서는 임시로 CORS 프록시 서버(`proxy-server.js`)를 사용하고 있으나, 
이는 개발용이며 프로덕션에서는 백엔드에서 CORS를 제대로 설정하는 것이 필수입니다.

## 문의

프론트엔드에서 추가로 필요한 설정이 있으면 알려주세요!

