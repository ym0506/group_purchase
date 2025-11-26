/**
 * 개발용 CORS 프록시 서버
 * 로컬 개발 환경에서 CORS 문제를 해결하기 위한 간단한 프록시 서버
 * 
 * 사용법:
 *   node proxy-server.js
 * 
 * 프론트엔드는 http://localhost:3001 에서 실행
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const PROXY_PORT = 3001;
const BACKEND_URL = 'https://moasaja.onrender.com';

// CORS 헤더 설정
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // 24시간
};

const server = http.createServer((req, res) => {
    // OPTIONS 요청 (Preflight) 처리
    if (req.method === 'OPTIONS') {
        res.writeHead(200, corsHeaders);
        res.end();
        return;
    }

    // 요청 URL 파싱
    const targetPath = req.url;
    const targetUrl = `${BACKEND_URL}${targetPath}`;

    console.log(`[${new Date().toISOString()}] ${req.method} ${targetPath} -> ${targetUrl}`);

    // 백엔드로 요청 전달
    const options = {
        method: req.method,
        headers: {
            ...req.headers,
            host: new URL(BACKEND_URL).hostname,
            // 백엔드에서 허용하는 Origin으로 변경
            origin: 'https://login-baa7f.web.app',
        },
    };

    // Authorization 헤더가 있으면 유지
    if (req.headers.authorization) {
        options.headers['Authorization'] = req.headers.authorization;
    }

    // 요청 본문 수집
    let body = '';
    req.on('data', (chunk) => {
        body += chunk.toString();
    });

    req.on('end', () => {
        // POST/PUT/PATCH 요청의 경우 본문 포함
        if (body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
            options.headers['Content-Length'] = Buffer.byteLength(body);
        }

        // HTTPS 요청
        const protocol = BACKEND_URL.startsWith('https') ? https : http;
        const proxyReq = protocol.request(targetUrl, options, (proxyRes) => {
            // 응답 헤더 복사
            const responseHeaders = {
                ...proxyRes.headers,
            };

            // 로컬 개발을 위해 CORS 헤더 덮어쓰기
            responseHeaders['access-control-allow-origin'] = '*';
            responseHeaders['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
            responseHeaders['access-control-allow-headers'] = 'Content-Type, Authorization, X-Requested-With';
            responseHeaders['access-control-max-age'] = '86400';

            res.writeHead(proxyRes.statusCode, responseHeaders);

            // 응답 본문 스트리밍
            proxyRes.pipe(res);
        });

        proxyReq.on('error', (error) => {
            console.error('프록시 오류:', error);
            res.writeHead(502, corsHeaders);
            res.end(JSON.stringify({ error: '백엔드 서버에 연결할 수 없습니다.' }));
        });

        // 요청 본문 전송
        if (body) {
            proxyReq.write(body);
        }
        proxyReq.end();
    });
});

server.listen(PROXY_PORT, () => {
    console.log(`🚀 CORS 프록시 서버가 포트 ${PROXY_PORT}에서 실행 중입니다.`);
    console.log(`📡 백엔드 URL: ${BACKEND_URL}`);
    console.log(`\n💡 프론트엔드에서 다음 URL을 사용하세요:`);
    console.log(`   http://localhost:${PROXY_PORT}`);
    console.log(`\n또는 브라우저 콘솔에서 실행:`);
    console.log(`   window.apiService.setBaseURL('http://localhost:${PROXY_PORT}');`);
});

