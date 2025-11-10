/**
 * API 서비스 레이어
 * 모든 백엔드 API 호출을 중앙에서 관리합니다.
 */

// API 기본 URL (환경에 따라 변경)
const API_BASE_URL = 'http://localhost:3000'; // 개발 환경
// const API_BASE_URL = 'https://api.moyeo.com'; // 프로덕션 환경

/**
 * API 서비스 클래스
 */
class APIService {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.accessToken = this.getStoredToken();
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

        try {
            const response = await fetch(url, config);

            // 응답이 JSON인지 확인
            const contentType = response.headers.get('content-type');
            const isJson = contentType && contentType.includes('application/json');

            const data = isJson ? await response.json() : await response.text();

            if (!response.ok) {
                // 401 Unauthorized: 토큰 만료 또는 유효하지 않음
                if (response.status === 401) {
                    this.removeToken();
                    window.location.href = '/pages/login.html';
                }

                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API 요청 실패:', error);
            throw error;
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
        const response = await this.post('/api/users/signup', {
            email,
            password,
            nickname,
            phone_number: phoneNumber,
        });
        return response;
    }

    /**
     * 로그인
     */
    async login(email, password) {
        const response = await this.post('/api/users/login', {
            email,
            password,
        });

        // 토큰 저장
        if (response.access_token) {
            this.setToken(response.access_token);
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
     * 내 정보 조회
     */
    async getMyInfo() {
        return this.get('/api/users/me');
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
     */
    async getMyMatching() {
        return this.get('/api/users/me/matching');
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

