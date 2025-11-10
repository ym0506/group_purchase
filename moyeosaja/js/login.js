/**
 * 로그인 페이지 JavaScript
 * 
 * 역할:
 * - 로그인 폼 제출 처리
 * - 입력 유효성 검사
 * - 자동 로그인 체크박스 처리
 * - localStorage를 통한 자동 로그인 관리
 */

class LoginPage {
    constructor() {
        // DOM 요소 참조
        this.form = document.querySelector('.login-form');
        this.emailInput = document.querySelector('input[type="email"]');
        this.passwordInput = document.querySelector('input[type="password"]');
        this.autoLoginCheckbox = document.querySelector('#autoLogin');
        this.loginBtn = document.querySelector('.btn-login');
        this.signupLink = document.querySelector('.signup-link');
        this.findAccountLink = document.querySelector('.find-account');

        // 초기화
        this.init();
    }

    /**
     * 초기화 메서드
     * - 이벤트 리스너 등록
     * - 저장된 로그인 정보 확인
     */
    init() {
        this.attachEventListeners();
        this.checkSavedLogin();
        this.updateStatusTime();
    }

    /**
     * 이벤트 리스너 등록
     */
    attachEventListeners() {
        // 폼 제출 이벤트
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // 이메일 입력 이벤트
        this.emailInput.addEventListener('input', () => this.handleEmailInput());
        this.emailInput.addEventListener('focus', () => this.handleInputFocus(this.emailInput));
        this.emailInput.addEventListener('blur', () => this.handleInputBlur(this.emailInput));

        // 비밀번호 입력 이벤트
        this.passwordInput.addEventListener('input', () => this.handlePasswordInput());
        this.passwordInput.addEventListener('focus', () => this.handleInputFocus(this.passwordInput));
        this.passwordInput.addEventListener('blur', () => this.handleInputBlur(this.passwordInput));

        // 회원가입 링크 클릭
        this.signupLink.addEventListener('click', (e) => this.handleSignupClick(e));

        // 계정 찾기 링크 클릭
        this.findAccountLink.addEventListener('click', (e) => this.handleFindAccountClick(e));

        // Enter 키 처리
        this.emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.passwordInput.focus();
            }
        });
    }

    /**
     * 이메일 입력 처리
     */
    handleEmailInput() {
        const email = this.emailInput.value.trim();

        if (email) {
            this.emailInput.classList.add('active');
        } else {
            this.emailInput.classList.remove('active');
        }

        // 실시간 유효성 검사
        if (email && !this.isValidEmail(email)) {
            this.emailInput.style.borderColor = '#ff5758';
        } else {
            this.emailInput.style.borderColor = '#297eff';
        }
    }

    /**
     * 비밀번호 입력 처리
     */
    handlePasswordInput() {
        const password = this.passwordInput.value;

        if (password) {
            this.passwordInput.classList.add('active');
        } else {
            this.passwordInput.classList.remove('active');
        }
    }

    /**
     * 입력 필드 포커스 처리
     */
    handleInputFocus(input) {
        input.parentElement.classList.add('focused');
    }

    /**
     * 입력 필드 블러 처리
     */
    handleInputBlur(input) {
        input.parentElement.classList.remove('focused');
    }

    /**
     * 로그인 폼 제출 처리
     */
    async handleSubmit(e) {
        e.preventDefault();

        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;
        const autoLogin = this.autoLoginCheckbox.checked;

        // 유효성 검사
        if (!this.validateForm(email, password)) {
            return;
        }

        // 로딩 상태 표시
        this.setLoadingState(true);

        try {
            // 로그인 API 호출 시뮬레이션
            await this.performLogin(email, password, autoLogin);

            // 성공 처리
            this.handleLoginSuccess(email, autoLogin);
        } catch (error) {
            // 에러 처리
            this.handleLoginError(error);
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * 폼 유효성 검사
     */
    validateForm(email, password) {
        // 이메일 유효성 검사
        if (!email) {
            this.showError(this.emailInput, '이메일을 입력해주세요.');
            return false;
        }

        if (!this.isValidEmail(email)) {
            this.showError(this.emailInput, '올바른 이메일 형식이 아닙니다.');
            return false;
        }

        // 비밀번호 유효성 검사
        if (!password) {
            this.showError(this.passwordInput, '비밀번호를 입력해주세요.');
            return false;
        }

        if (password.length < 6) {
            this.showError(this.passwordInput, '비밀번호는 6자 이상이어야 합니다.');
            return false;
        }

        return true;
    }

    /**
     * 이메일 형식 검증
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * 에러 메시지 표시
     */
    showError(input, message) {
        input.style.borderColor = '#ff5758';
        input.focus();

        // 간단한 알림으로 표시 (추후 토스트 메시지로 개선 가능)
        alert(message);
    }

    /**
     * 로그인 수행 (백엔드 API 연동)
     */
    async performLogin(email, password, autoLogin) {
        try {
            // 실제 백엔드 API 호출
            const response = await window.apiService.login(email, password);

            // 응답 구조: { access_token, user_id }
            if (response.access_token) {
                // 자동 로그인 설정
                if (autoLogin) {
                    localStorage.setItem('autoLogin', 'true');
                    localStorage.setItem('userEmail', email);
                }

                // 유저 ID 저장
                localStorage.setItem('userId', response.user_id);

                return {
                    success: true,
                    user: {
                        email: email,
                        userId: response.user_id,
                        token: response.access_token
                    }
                };
            } else {
                throw new Error('로그인 응답이 올바르지 않습니다.');
            }
        } catch (error) {
            console.error('로그인 실패:', error);
            throw new Error(error.message || '이메일 또는 비밀번호가 올바르지 않습니다.');
        }
    }

    /**
     * 로그인 성공 처리
     */
    handleLoginSuccess(email, autoLogin) {
        // 자동 로그인 체크 시 localStorage에 저장
        if (autoLogin) {
            localStorage.setItem('autoLogin', 'true');
            localStorage.setItem('userEmail', email);
        } else {
            localStorage.removeItem('autoLogin');
            localStorage.removeItem('userEmail');
        }

        // 세션 저장 (실제로는 토큰 저장)
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userEmail', email);

        // 성공 메시지
        alert('로그인 성공!');

        // 홈 페이지로 이동
        setTimeout(() => {
            window.location.href = './home.html';
        }, 500);
    }

    /**
     * 로그인 실패 처리
     */
    handleLoginError(error) {
        console.error('로그인 에러:', error);
        alert(error.message || '로그인 중 오류가 발생했습니다.');

        // 비밀번호 필드 초기화
        this.passwordInput.value = '';
        this.passwordInput.focus();
    }

    /**
     * 로딩 상태 설정
     */
    setLoadingState(isLoading) {
        if (isLoading) {
            this.loginBtn.disabled = true;
            this.loginBtn.textContent = '로그인 중...';
            this.loginBtn.style.opacity = '0.7';
        } else {
            this.loginBtn.disabled = false;
            this.loginBtn.textContent = '로그인';
            this.loginBtn.style.opacity = '1';
        }
    }

    /**
     * 저장된 로그인 정보 확인
     */
    checkSavedLogin() {
        const autoLogin = localStorage.getItem('autoLogin');
        const savedEmail = localStorage.getItem('userEmail');

        if (autoLogin === 'true' && savedEmail) {
            this.emailInput.value = savedEmail;
            this.autoLoginCheckbox.checked = true;
            this.emailInput.classList.add('active');
        }
    }

    /**
     * 회원가입 링크 클릭 처리
     */
    handleSignupClick(e) {
        // 링크가 직접 이동하므로 별도 처리 불필요
        // 필요시 여기서 추가 로직 처리 가능
    }

    /**
     * 계정 찾기 링크 클릭 처리
     */
    handleFindAccountClick(e) {
        e.preventDefault();
        alert('아이디/비밀번호 찾기 페이지로 이동합니다.');
        // 실제로는 계정 찾기 페이지로 이동
        // window.location.href = './find-account.html';
    }

    /**
     * 상태바 시간 업데이트
     */
    updateStatusTime() {
        const timeElement = document.querySelector('.status-time');
        if (timeElement) {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            timeElement.textContent = `${hours}:${minutes}`;

            // 매 분마다 업데이트
            setInterval(() => {
                const now = new Date();
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                timeElement.textContent = `${hours}:${minutes}`;
            }, 60000);
        }
    }
}

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    new LoginPage();
});

