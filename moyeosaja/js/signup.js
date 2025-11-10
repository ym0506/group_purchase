/**
 * 회원가입 페이지 JavaScript
 * 
 * 역할:
 * - 회원가입 폼 제출 처리
 * - 입력 유효성 검사
 * - 비밀번호 일치 확인
 * - 약관 동의 체크
 * - 전체 동의 토글
 */

class SignupPage {
    constructor() {
        // DOM 요소 참조
        this.form = document.querySelector('.signup-form');
        this.emailInput = document.querySelector('input[type="email"]');
        this.passwordInput = document.querySelectorAll('input[type="password"]')[0];
        this.passwordConfirmInput = document.querySelectorAll('input[type="password"]')[1];
        this.nicknameInput = document.querySelector('input[type="text"]');
        this.phoneInput = document.querySelector('input[type="tel"]');
        this.allAgreeCheckbox = document.querySelector('#allAgree');
        this.termCheckboxes = document.querySelectorAll('.term-checkbox');
        this.signupBtn = document.querySelector('.btn-signup');

        // 초기화
        this.init();
    }

    /**
     * 초기화 메서드
     */
    init() {
        this.attachEventListeners();
        this.updateStatusTime();
    }

    /**
     * 이벤트 리스너 등록
     */
    attachEventListeners() {
        // 폼 제출 이벤트
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // 입력 필드 이벤트
        this.emailInput.addEventListener('blur', () => this.validateEmail());
        this.passwordInput.addEventListener('input', () => this.validatePassword());
        this.passwordConfirmInput.addEventListener('input', () => this.validatePasswordConfirm());
        this.nicknameInput.addEventListener('blur', () => this.validateNickname());
        this.phoneInput.addEventListener('input', (e) => this.formatPhoneNumber(e));
        this.phoneInput.addEventListener('blur', () => this.validatePhone());

        // 전체 동의 체크박스
        this.allAgreeCheckbox.addEventListener('change', () => this.handleAllAgree());

        // 개별 약관 체크박스
        this.termCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.handleTermChange());
        });

        // Enter 키 처리
        const inputs = [
            this.emailInput,
            this.passwordInput,
            this.passwordConfirmInput,
            this.nicknameInput,
            this.phoneInput
        ];

        inputs.forEach((input, index) => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (index < inputs.length - 1) {
                        inputs[index + 1].focus();
                    }
                }
            });
        });
    }

    /**
     * 이메일 유효성 검사
     */
    validateEmail() {
        const email = this.emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            this.showInputError(this.emailInput, '이메일을 입력해주세요.');
            return false;
        }

        if (!emailRegex.test(email)) {
            this.showInputError(this.emailInput, '올바른 이메일 형식이 아닙니다.');
            return false;
        }

        this.clearInputError(this.emailInput);
        return true;
    }

    /**
     * 비밀번호 유효성 검사
     */
    validatePassword() {
        const password = this.passwordInput.value;

        if (!password) {
            this.showInputError(this.passwordInput, '비밀번호를 입력해주세요.');
            return false;
        }

        if (password.length < 6) {
            this.showInputError(this.passwordInput, '비밀번호는 6자 이상이어야 합니다.');
            return false;
        }

        this.clearInputError(this.passwordInput);

        // 비밀번호 확인 필드가 비어있지 않으면 함께 검증
        if (this.passwordConfirmInput.value) {
            this.validatePasswordConfirm();
        }

        return true;
    }

    /**
     * 비밀번호 확인 검사
     */
    validatePasswordConfirm() {
        const password = this.passwordInput.value;
        const passwordConfirm = this.passwordConfirmInput.value;

        if (!passwordConfirm) {
            this.showInputError(this.passwordConfirmInput, '비밀번호를 다시 입력해주세요.');
            return false;
        }

        if (password !== passwordConfirm) {
            this.showInputError(this.passwordConfirmInput, '비밀번호가 일치하지 않습니다.');
            return false;
        }

        this.clearInputError(this.passwordConfirmInput);
        return true;
    }

    /**
     * 닉네임 유효성 검사
     */
    validateNickname() {
        const nickname = this.nicknameInput.value.trim();

        if (!nickname) {
            this.showInputError(this.nicknameInput, '닉네임을 입력해주세요.');
            return false;
        }

        if (nickname.length < 2) {
            this.showInputError(this.nicknameInput, '닉네임은 2자 이상이어야 합니다.');
            return false;
        }

        if (nickname.length > 10) {
            this.showInputError(this.nicknameInput, '닉네임은 10자 이하여야 합니다.');
            return false;
        }

        this.clearInputError(this.nicknameInput);
        return true;
    }

    /**
     * 전화번호 자동 포맷팅
     */
    formatPhoneNumber(e) {
        let value = e.target.value.replace(/[^0-9]/g, '');

        if (value.length > 11) {
            value = value.slice(0, 11);
        }

        if (value.length >= 7) {
            value = value.replace(/(\d{3})(\d{4})(\d{0,4})/, '$1-$2-$3');
        } else if (value.length >= 4) {
            value = value.replace(/(\d{3})(\d{0,4})/, '$1-$2');
        }

        e.target.value = value;
    }

    /**
     * 전화번호 유효성 검사
     */
    validatePhone() {
        const phone = this.phoneInput.value.replace(/[^0-9]/g, '');

        if (!phone) {
            this.showInputError(this.phoneInput, '전화번호를 입력해주세요.');
            return false;
        }

        if (phone.length !== 11) {
            this.showInputError(this.phoneInput, '올바른 전화번호를 입력해주세요.');
            return false;
        }

        if (!phone.startsWith('010')) {
            this.showInputError(this.phoneInput, '올바른 전화번호를 입력해주세요.');
            return false;
        }

        this.clearInputError(this.phoneInput);
        return true;
    }

    /**
     * 입력 에러 표시
     */
    showInputError(input, message) {
        input.classList.add('error');
        input.setAttribute('title', message);
    }

    /**
     * 입력 에러 제거
     */
    clearInputError(input) {
        input.classList.remove('error');
        input.removeAttribute('title');
    }

    /**
     * 전체 동의 처리
     */
    handleAllAgree() {
        const isChecked = this.allAgreeCheckbox.checked;
        this.termCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
        });
    }

    /**
     * 개별 약관 변경 처리
     */
    handleTermChange() {
        const allChecked = Array.from(this.termCheckboxes).every(cb => cb.checked);
        this.allAgreeCheckbox.checked = allChecked;
    }

    /**
     * 약관 동의 검사
     */
    validateTerms() {
        const requiredTerms = Array.from(this.termCheckboxes).filter(cb => cb.required);
        const allRequiredChecked = requiredTerms.every(cb => cb.checked);

        if (!allRequiredChecked) {
            alert('필수 약관에 동의해주세요.');
            return false;
        }

        return true;
    }

    /**
     * 회원가입 폼 제출 처리
     */
    async handleSubmit(e) {
        e.preventDefault();

        // 모든 유효성 검사
        const isEmailValid = this.validateEmail();
        const isPasswordValid = this.validatePassword();
        const isPasswordConfirmValid = this.validatePasswordConfirm();
        const isNicknameValid = this.validateNickname();
        const isPhoneValid = this.validatePhone();
        const areTermsValid = this.validateTerms();

        if (!isEmailValid || !isPasswordValid || !isPasswordConfirmValid ||
            !isNicknameValid || !isPhoneValid || !areTermsValid) {
            return;
        }

        // 로딩 상태
        this.setLoadingState(true);

        try {
            // 회원가입 데이터
            const signupData = {
                email: this.emailInput.value.trim(),
                password: this.passwordInput.value,
                nickname: this.nicknameInput.value.trim(),
                phone: this.phoneInput.value.replace(/[^0-9]/g, ''),
                marketingAgree: this.termCheckboxes[2].checked
            };

            // API 호출 (시뮬레이션)
            await this.performSignup(signupData);

            // 성공 처리
            this.handleSignupSuccess();
        } catch (error) {
            // 에러 처리
            this.handleSignupError(error);
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * 회원가입 수행 (API 호출 시뮬레이션)
     */
    async performSignup(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // 간단한 검증
                console.log('회원가입 데이터:', data);

                // 이메일 중복 체크 시뮬레이션
                if (data.email === 'test@test.com') {
                    reject(new Error('이미 가입된 이메일입니다.'));
                    return;
                }

                resolve({
                    success: true,
                    message: '회원가입이 완료되었습니다.'
                });
            }, 1500);
        });
    }

    /**
     * 회원가입 성공 처리
     */
    handleSignupSuccess() {
        alert('회원가입이 완료되었습니다!\n로그인 페이지로 이동합니다.');

        setTimeout(() => {
            window.location.href = './login.html';
        }, 500);
    }

    /**
     * 회원가입 실패 처리
     */
    handleSignupError(error) {
        console.error('회원가입 에러:', error);
        alert(error.message || '회원가입 중 오류가 발생했습니다.');
    }

    /**
     * 로딩 상태 설정
     */
    setLoadingState(isLoading) {
        if (isLoading) {
            this.signupBtn.disabled = true;
            this.signupBtn.textContent = '회원가입 중...';
            this.signupBtn.style.opacity = '0.7';
        } else {
            this.signupBtn.disabled = false;
            this.signupBtn.textContent = '회원가입';
            this.signupBtn.style.opacity = '1';
        }
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
    new SignupPage();
});

