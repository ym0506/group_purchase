/**
 * API 서비스 레이어
 * 모든 백엔드 API 호출을 중앙에서 관리합니다.
 */

/**
 * API 기본 URL (환경/설정에 따라 동적으로 결정)
 * 
 * 참고: 로컬 개발 시 CORS 문제를 피하기 위해 기본적으로 프로덕션 백엔드를 사용합니다.
 * 로컬 백엔드를 사용하려면 브라우저 콘솔에서 다음 명령어를 실행하세요:
 *   window.apiService.setBaseURL('http://localhost:3000');
 * 또는 localStorage에 저장:
 *   localStorage.setItem('api_base_url', 'http://localhost:3000');
 */
const DEFAULT_DEV_BASE_URL = 'http://localhost:3000';
const DEFAULT_PROXY_BASE_URL = 'http://localhost:3001'; // CORS 프록시 서버
const DEFAULT_PROD_BASE_URL = 'https://moasaja.onrender.com';

/**
 * 브라우저/환경 정보를 기반으로 API BASE URL 결정
 */
function resolveApiBaseUrl() {
    try {
        // 1) 전역 오버라이드 (window.__API_BASE_URL__)
        if (typeof window !== 'undefined' && window.__API_BASE_URL__) {
            return window.__API_BASE_URL__;
        }

        // 2) localStorage 커스텀 설정 (디버깅용)
        if (typeof window !== 'undefined' && window.localStorage) {
            const stored = window.localStorage.getItem('api_base_url');
            if (stored) {
                console.log('💡 API Base URL을 localStorage에서 로드:', stored);
                return stored;
            }
        }

        // 3) 호스트 기반 자동 분기
        if (typeof window !== 'undefined') {
            const host = window.location.hostname;

            // 배포 환경인 경우 프로덕션 백엔드 사용
            if (host.includes('onrender.com') ||
                host.includes('vercel.app') ||
                host.includes('netlify.app')) {
                return DEFAULT_PROD_BASE_URL;
            }

            // 로컬 개발 환경인 경우 백엔드 직접 연결 (백엔드에서 CORS 허용됨)
            if (host === '127.0.0.1' || host === 'localhost') {
                // 로컬 개발 환경에서도 프로덕션 백엔드 사용 (CORS 허용됨)
                console.log('💡 로컬 개발 환경 감지: 프로덕션 백엔드 사용', DEFAULT_PROD_BASE_URL);
                return DEFAULT_PROD_BASE_URL;
            }
        }

        // 4) 기본값 (프로덕션 백엔드)
        console.log('💡 API Base URL 기본값 사용 (프로덕션):', DEFAULT_PROD_BASE_URL);
        return DEFAULT_PROD_BASE_URL;
    } catch (error) {
        console.warn('API BASE URL 결정 중 오류가 발생했습니다. 기본값을 사용합니다.', error);
        return DEFAULT_PROD_BASE_URL;
    }
}

/**
 * API 서비스 클래스
 */
class APIService {
    constructor() {
        this.baseURL = resolveApiBaseUrl();
        this.accessToken = this.getStoredToken();
        this.defaultTimeout = 15000; // 15초
        this.defaultRetries = 1; // 네트워크 오류 시 1회 재시도
    }

    /**
     * 저장된 토큰 가져오기
     */
    getStoredToken() {
        return localStorage.getItem('access_token');
    }

    /**
     * 토큰 저장
     */
    setToken(token) {
        this.accessToken = token;
        localStorage.setItem('access_token', token);
    }

    /**
     * 토큰 삭제
     */
    removeToken() {
        this.accessToken = null;
        localStorage.removeItem('access_token');
    }

    /**
     * 공통 요청 메서드
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const showLoading = options.showLoading !== false; // 기본값: true
        const showErrorToast = options.showErrorToast !== false; // 기본값: true
        const timeout = options.timeout || this.defaultTimeout;
        const retries = options.retries ?? this.defaultRetries;

        const defaultHeaders = {
            'Content-Type': 'application/json',
        };

        // 인증 토큰이 있으면 헤더에 추가
        if (this.accessToken) {
            defaultHeaders['Authorization'] = `Bearer ${this.accessToken}`;
        }

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };

        // 로딩 표시
        if (showLoading && window.loading) {
            window.loading.show('처리 중...');
        }

        try {
            // 요청 전 로깅 (디버깅용)
            if (endpoint.includes('/users/me')) {
                console.log('📤 API 요청 상세:', {
                    method: config.method || 'GET',
                    url,
                    headers: {
                        'Content-Type': config.headers['Content-Type'],
                        'Authorization': config.headers['Authorization'] ? `${config.headers['Authorization'].substring(0, 20)}...` : '없음'
                    },
                    hasToken: !!this.accessToken,
                    tokenLength: this.accessToken ? this.accessToken.length : 0
                });
            }

            const response = await this.fetchWithRetry(url, config, timeout, retries);

            // 응답이 JSON인지 확인
            const contentType = response.headers.get('content-type');
            const isJson = contentType && contentType.includes('application/json');

            const data = isJson ? await response.json() : await response.text();

            // 500 에러인 경우 응답 본문 상세 로깅
            if (!response.ok && response.status === 500) {
                console.error('❌ 500 에러 응답 상세:', {
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers.entries()),
                    body: data,
                    url: response.url
                });
            }

            if (!response.ok) {
                // 401 Unauthorized: 토큰 만료 또는 유효하지 않음
                if (response.status === 401) {
                    console.error('❌ 인증 오류 (401): 토큰이 만료되었거나 유효하지 않습니다.');
                    this.removeToken();
                    if (window.toast) {
                        window.toast.error('로그인이 만료되었습니다. 다시 로그인해주세요.');
                    }
                    setTimeout(() => {
                        window.location.href = './login.html';
                    }, 1500);
                    throw new Error('인증이 만료되었습니다.');
                }

                // 500 Internal Server Error: 서버 오류
                if (response.status === 500) {
                    console.error('❌ 서버 오류 (500):', {
                        endpoint,
                        url,
                        response: data,
                        responseString: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
                        headers: Object.fromEntries(response.headers.entries()),
                        requestHeaders: {
                            'Authorization': config.headers['Authorization'] ? 'Bearer ***' : '없음',
                            'Content-Type': config.headers['Content-Type']
                        }
                    });

                    // 백엔드 응답 메시지 추출
                    let errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                    if (typeof data === 'object' && data !== null) {
                        errorMessage = data.message || data.error || data.detail || errorMessage;
                    } else if (typeof data === 'string') {
                        errorMessage = data || errorMessage;
                    }

                    console.error('❌ 에러 메시지:', errorMessage);

                    if (showErrorToast && window.toast) {
                        window.toast.error(errorMessage);
                    }
                    throw new Error(errorMessage);
                }

                // 400 Bad Request, 404 Not Found 등 기타 오류
                console.error(`❌ API 오류 (${response.status}):`, {
                    endpoint,
                    url,
                    response: data
                });
                const errorMessage = data.message || data.error || `요청 처리 중 오류가 발생했습니다. (${response.status})`;
                if (showErrorToast && window.toast) {
                    window.toast.error(errorMessage);
                }
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            // 네트워크 오류 처리
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                const networkError = '네트워크 연결을 확인해주세요.';
                if (showErrorToast && window.toast) {
                    window.toast.error(networkError);
                }
                throw new Error(networkError);
            }

            // 타임아웃 오류 처리
            if (error.name === 'AbortError') {
                const timeoutError = '서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
                if (showErrorToast && window.toast) {
                    window.toast.error(timeoutError);
                }
                throw new Error(timeoutError);
            }

            // 이미 토스트가 표시된 경우는 다시 표시하지 않음
            if (!error.message.includes('인증이 만료') && showErrorToast && window.toast) {
                // 에러 메시지가 없거나 이미 표시된 경우는 표시하지 않음
            }

            throw error;
        } finally {
            // 로딩 숨기기
            if (showLoading && window.loading) {
                window.loading.hide();
            }
        }
    }

    /**
     * fetch 래퍼: 타임아웃 및 재시도 처리
     */
    async fetchWithRetry(url, config, timeout, retries) {
        let attempt = 0;
        let lastError = null;

        while (attempt <= retries) {
            try {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), timeout);
                const response = await fetch(url, {
                    ...config,
                    signal: controller.signal,
                });
                clearTimeout(timer);
                return response;
            } catch (error) {
                lastError = error;

                const isAbortError = error.name === 'AbortError';
                const isNetworkError = error.name === 'TypeError' ||
                    (error.message && error.message.includes('fetch'));

                // 재시도 가능한 오류인지 확인
                const isRetryable = isAbortError || isNetworkError;

                if (attempt === retries || !isRetryable) {
                    throw error;
                }

                attempt += 1;
                console.warn(
                    `요청 재시도 (${attempt}/${retries}) - ${url}`,
                    isAbortError ? '타임아웃' : error.message
                );

                // 재시도 전 대기 시간 (지수 백오프)
                await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
            }
        }

        throw lastError || new Error('알 수 없는 네트워크 오류가 발생했습니다.');
    }

    /**
     * API BASE URL 변경 (예: 디버깅용)
     */
    setBaseURL(newBaseUrl, { persist = true } = {}) {
        if (!newBaseUrl) return;

        this.baseURL = newBaseUrl;
        if (persist && typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem('api_base_url', newBaseUrl);
        }
    }

    /**
     * GET 요청
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;

        return this.request(url, {
            method: 'GET',
        });
    }

    /**
     * POST 요청
     */
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * PATCH 요청
     */
    async patch(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    /**
     * DELETE 요청
     */
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE',
        });
    }

    // ==================== 유저 API ====================

    /**
     * 회원가입
     */
    async signup(email, password, nickname, phoneNumber) {
        // 회원가입은 더 긴 타임아웃과 재시도 적용
        const requestData = {
            email,
            password,
            nickname,
            phone_number: phoneNumber || '',
        };

        console.log('📤 회원가입 API 요청:', {
            url: `${this.baseURL}/api/users/signup`,
            data: { ...requestData, password: '***' } // 비밀번호는 숨김
        });

        const response = await this.request('/api/users/signup', {
            method: 'POST',
            body: JSON.stringify(requestData),
        }, {
            timeout: 30000, // 30초 타임아웃
            retries: 2, // 2회 재시도
            showLoading: true,
            showErrorToast: true,
        });

        console.log('📥 회원가입 API 응답:', response);
        return response;
    }

    /**
     * 로그인
     */
    async login(email, password) {
        const requestData = { email, password };

        console.log('📤 로그인 API 요청:', {
            url: `${this.baseURL}/api/users/login`,
            data: { email, password: '***' } // 비밀번호는 숨김
        });

        const response = await this.post('/api/users/login', requestData);

        console.log('📥 로그인 API 응답:', response);

        // 토큰 및 유저 정보 저장
        if (response.access_token) {
            this.setToken(response.access_token);

            // 유저 정보 저장 (500 에러 fallback 및 UI 표시용)
            if (response.user_id) localStorage.setItem('userId', response.user_id);
            if (response.nickname) localStorage.setItem('nickname', response.nickname);
            if (response.profile_image_url) localStorage.setItem('profile_image_url', response.profile_image_url);
            if (email) localStorage.setItem('userEmail', email); // 이메일은 요청 데이터에서

            console.log('✅ 로그인 성공: 토큰 및 유저 정보 저장됨', {
                userId: response.user_id,
                nickname: response.nickname
            });
        } else {
            console.warn('⚠️ 로그인 응답에 access_token이 없습니다');
        }

        return response;
    }

    /**
     * 로그아웃
     */
    logout() {
        this.removeToken();
        window.location.href = '/pages/login.html';
    }

    /**
     * 내 정보 조회 (재시도 로직 포함)
     */
    async getMyInfo() {
        // 토큰 확인
        if (!this.accessToken) {
            const storedToken = this.getStoredToken();
            if (storedToken) {
                this.setToken(storedToken);
                console.log('✅ 저장된 토큰으로 설정됨');
            } else {
                console.warn('⚠️ getMyInfo: 토큰이 없습니다.');
                throw new Error('로그인이 필요합니다.');
            }
        }

        // 토큰 형식 확인
        if (this.accessToken && !this.accessToken.startsWith('Bearer ')) {
            console.log('📝 토큰 형식 확인:', {
                hasBearer: this.accessToken.startsWith('Bearer '),
                tokenLength: this.accessToken.length,
                tokenPreview: this.accessToken.substring(0, 30) + '...'
            });
        }

        console.log('📤 내 정보 조회 API 호출:', {
            url: `${this.baseURL}/api/users/me`,
            hasToken: !!this.accessToken,
            tokenLength: this.accessToken ? this.accessToken.length : 0,
            baseURL: this.baseURL
        });

        // 재시도 로직
        const maxRetries = 2;
        let lastError = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const response = await this.get('/api/users/me', {}, {
                    showErrorToast: attempt === maxRetries, // 마지막 시도에만 에러 토스트 표시
                    showLoading: false
                });

                console.log('📥 내 정보 조회 성공:', response);

                // 성공 시 localStorage에 백업 저장
                if (response.user_id) localStorage.setItem('userId', response.user_id);
                if (response.email) localStorage.setItem('userEmail', response.email);
                if (response.nickname) localStorage.setItem('nickname', response.nickname);
                if (response.profile_image_url) localStorage.setItem('profile_image_url', response.profile_image_url);

                return response;
            } catch (error) {
                lastError = error;

                // 500 에러가 아니면 즉시 throw (재시도 불필요)
                if (!error.message || (!error.message.includes('500') && !error.message.includes('Internal Server Error'))) {
                    console.error('❌ 내 정보 조회 실패 (재시도 불가):', error);
                    throw error;
                }

                // 마지막 시도가 아니면 재시도
                if (attempt < maxRetries) {
                    const waitTime = 1000 * (attempt + 1); // 1초, 2초 대기
                    console.warn(`⚠️ 500 에러 발생, ${waitTime}ms 후 재시도 (${attempt + 1}/${maxRetries})...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    continue;
                }

                // 모든 재시도 실패 시 폴백 처리
                console.error('❌ 모든 재시도 실패, localStorage 폴백 사용');
                console.error('❌ 서버 오류 상세 정보:', {
                    endpoint: '/api/users/me',
                    baseURL: this.baseURL,
                    token: this.accessToken ? {
                        length: this.accessToken.length,
                        preview: this.accessToken.substring(0, 30) + '...',
                        startsWithBearer: this.accessToken.startsWith('Bearer ')
                    } : '없음',
                    error: error.message,
                    localStorage: {
                        access_token: localStorage.getItem('access_token') ? '있음' : '없음',
                        userId: localStorage.getItem('userId'),
                        userEmail: localStorage.getItem('userEmail'),
                        nickname: localStorage.getItem('nickname')
                    }
                });

                // 백엔드 팀에게 전달할 디버깅 정보
                console.error('🔍 백엔드 팀에게 전달할 정보:', {
                    endpoint: 'GET /api/users/me',
                    headers: {
                        'Authorization': 'Bearer [토큰 있음]',
                        'Content-Type': 'application/json'
                    },
                    error: '500 Internal Server Error (재시도 2회 실패)',
                    requestURL: `${this.baseURL}/api/users/me`
                });
            }
        }

        // localStorage 폴백 데이터 생성
        const fallbackUser = {
            user_id: localStorage.getItem('userId') || 'unknown',
            email: localStorage.getItem('userEmail') || 'unknown@example.com',
            nickname: localStorage.getItem('nickname') || '사용자',
            profile_image_url: localStorage.getItem('profile_image_url') || null,
            is_fallback: true
        };

        console.warn('⚠️ 500 에러로 인해 로컬 데이터로 폴백합니다:', fallbackUser);

        if (window.toast) {
            window.toast.warning('서버 연결이 불안정합니다. 일부 정보가 최신이 아닐 수 있습니다.');
        }

        return fallbackUser;
    }

    /**
     * 내 정보 수정
     */
    async updateMyInfo(data) {
        return this.patch('/api/users/me', data);
    }

    // ==================== 공구 게시글 API ====================

    /**
     * 게시글 목록 조회
     */
    async getPosts(params = {}) {
        return this.get('/api/posts', params);
    }

    /**
     * 게시글 작성
     */
    async createPost(data) {
        return this.post('/api/posts', data);
    }

    /**
     * 게시글 상세 조회
     */
    async getPostDetail(postId) {
        return this.get(`/api/posts/${postId}`);
    }

    /**
     * 게시글 수정
     */
    async updatePost(postId, data) {
        return this.patch(`/api/posts/${postId}`, data);
    }

    /**
     * 게시글 삭제
     */
    async deletePost(postId) {
        return this.delete(`/api/posts/${postId}`);
    }

    // ==================== 공구 참여 API ====================

    /**
     * 공구 참여 신청
     */
    async participateInPost(postId) {
        return this.post(`/api/posts/${postId}/participations`);
    }

    /**
     * 공구 참여 취소
     */
    async cancelParticipation(postId) {
        return this.delete(`/api/posts/${postId}/participations`);
    }

    // ==================== 댓글 API ====================

    /**
     * 댓글 목록 조회
     */
    async getComments(postId) {
        return this.get(`/api/posts/${postId}/comments`);
    }

    /**
     * 댓글 작성
     */
    async createComment(postId, content, parentCommentId = null) {
        return this.post(`/api/posts/${postId}/comments`, {
            content,
            parent_comment_id: parentCommentId,
        });
    }

    /**
     * 댓글 삭제
     */
    async deleteComment(commentId) {
        return this.delete(`/api/comments/${commentId}`);
    }

    // ==================== 리뷰 & 관심목록 API ====================

    /**
     * 리뷰 작성
     */
    async createReview(postId, rating, comment) {
        return this.post(`/api/posts/${postId}/reviews`, {
            rating,
            comment,
        });
    }

    /**
     * 내가 작성한 리뷰 목록 조회
     */
    async getMyReviews() {
        return this.get('/api/users/me/reviews');
    }

    /**
     * 유저가 받은 리뷰 목록
     */
    async getUserReviews(userId) {
        return this.get(`/api/users/${userId}/reviews`);
    }

    /**
     * 관심 목록 추가
     */
    async addToWishlist(postId) {
        return this.post(`/api/posts/${postId}/wishlist`);
    }

    /**
     * 관심 목록 삭제
     */
    async removeFromWishlist(postId) {
        return this.delete(`/api/posts/${postId}/wishlist`);
    }

    /**
     * 내 관심 목록 조회
     */
    async getMyWishlist() {
        return this.get('/api/users/me/wishlist');
    }

    // ==================== 매칭대기 & 거래내역 API ====================

    /**
     * 매칭 대기 내역 조회
     * @param {Object} params - 쿼리 파라미터 { status?: 'waiting' | 'success' | 'closed' }
     */
    async getMyMatching(params = {}) {
        return this.get('/api/users/me/matching', params);
    }

    /**
     * 거래 완료 내역 조회
     */
    async getMyTransactions() {
        return this.get('/api/users/me/transactions');
    }

    /**
     * 취소한 내역 조회
     */
    async getMyCancellations() {
        return this.get('/api/users/me/cancellations');
    }
}

// API 서비스 인스턴스 생성 및 export
const apiService = new APIService();

// ES6 모듈로 export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = apiService;
}

// 전역으로도 사용 가능하도록
window.apiService = apiService;

