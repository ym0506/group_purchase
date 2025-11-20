/**
 * 회원가입 단계별 페이지 JavaScript
 * 
 * 역할:
 * - 각 단계별 유효성 검사
 * - 단계 간 데이터 전달 (sessionStorage)
 * - 타이머 관리 (인증번호)
 * - 폼 제출 처리
 */

// 회원가입 데이터를 sessionStorage에 저장
const SignupData = {
    set(key, value) {
        sessionStorage.setItem(`signup_${key}`, value);
    },
    get(key) {
        return sessionStorage.getItem(`signup_${key}`);
    },
    clear() {
        ['nickname', 'email', 'emailDomain', 'password', 'phone', 'verifyCode'].forEach(key => {
            sessionStorage.removeItem(`signup_${key}`);
        });
    }
};

// 상태바 시간 업데이트
function updateStatusTime() {
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

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    updateStatusTime();

    const path = window.location.pathname;

    if (path.includes('signup-step1')) {
        initStep1();
    } else if (path.includes('signup-step2')) {
        initStep2();
    }
    // signup-step3 (휴대폰 인증) 제거됨
});

// ========================================
// 1단계: 닉네임 입력
// ========================================

function initStep1() {
    const nicknameInput = document.getElementById('nickname');
    const nextBtn = document.getElementById('nextBtn');

    // 저장된 닉네임 불러오기
    const savedNickname = SignupData.get('nickname');
    if (savedNickname) {
        nicknameInput.value = savedNickname;
    }

    // 실시간 유효성 검사
    nicknameInput.addEventListener('input', () => {
        validateNickname();
    });

    // 다음 버튼 클릭
    nextBtn.addEventListener('click', () => {
        if (validateNickname()) {
            SignupData.set('nickname', nicknameInput.value.trim());
            window.location.href = './signup-step2.html';
        }
    });

    // Enter 키 처리
    nicknameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && validateNickname()) {
            nextBtn.click();
        }
    });

    function validateNickname() {
        const nickname = nicknameInput.value.trim();

        if (!nickname) {
            nicknameInput.style.borderColor = '#ff5758';
            return false;
        }

        if (nickname.length < 2 || nickname.length > 10) {
            nicknameInput.style.borderColor = '#ff5758';
            return false;
        }

        nicknameInput.style.borderColor = '#297eff';
        return true;
    }
}

// ========================================
// 2단계: 이메일 + 비밀번호
// ========================================

function initStep2() {
    const emailInput = document.getElementById('email');
    const emailDropdown = document.getElementById('emailDomain');
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('passwordConfirm');
    const nextBtn = document.getElementById('nextBtn');
    const passwordMatchIndicator = document.querySelector('.password-match-indicator');

    // 저장된 데이터 불러오기
    const savedEmail = SignupData.get('email');
    const savedEmailDomain = SignupData.get('emailDomain');
    const savedPassword = SignupData.get('password');

    if (savedEmail) emailInput.value = savedEmail;
    if (savedEmailDomain) emailDropdown.value = savedEmailDomain;
    if (savedPassword) {
        passwordInput.value = savedPassword;
        passwordConfirmInput.value = savedPassword;
    }

    // 이메일 유효성 검사
    emailInput.addEventListener('blur', validateEmail);

    // 비밀번호 확인 체크
    passwordConfirmInput.addEventListener('input', () => {
        validatePasswordMatch();
    });

    // 다음 버튼 클릭 (휴대폰 인증 단계 제거 - 바로 회원가입 완료)
    nextBtn.addEventListener('click', async () => {
        if (!validateAll()) {
            return;
        }

        // 회원가입 데이터 저장
        SignupData.set('email', emailInput.value.trim());
        SignupData.set('emailDomain', emailDropdown.value);
        SignupData.set('password', passwordInput.value);

        // 버튼 로딩 상태
        nextBtn.disabled = true;
        const originalText = nextBtn.textContent;
        nextBtn.textContent = '가입 중...';

        try {
            // 회원가입 데이터 준비
            const nickname = SignupData.get('nickname');
            const email = SignupData.get('email') + SignupData.get('emailDomain');
            const password = SignupData.get('password');
            // phone_number는 선택 사항 - 휴대폰 인증 단계 제거됨
            const phone = null; // 또는 빈 문자열 ''

            console.log('회원가입 시도:', { nickname, email, phone });

            // 실제 백엔드 API 호출 (phone_number는 선택 사항)
            const response = await window.apiService.signup(
                email,
                password,
                nickname,
                phone || '' // null이면 빈 문자열로 전송
            );

            console.log('회원가입 성공:', response);

            // 성공 - 세션 데이터 삭제
            SignupData.clear();

            // 백엔드 응답 형식이 다를 수 있으므로 여러 형식 확인
            const accessToken = response.access_token || response.accessToken || response.token;
            const userId = response.user_id || response.userId || response.id;
            const userEmail = response.email || email; // 요청한 이메일 사용
            const userNickname = response.nickname || nickname; // 요청한 닉네임 사용

            // 토큰 및 사용자 정보 저장
            if (accessToken) {
                localStorage.setItem('access_token', accessToken);
                sessionStorage.setItem('isLoggedIn', 'true');
                window.apiService.setToken(accessToken); // APIService에도 토큰 설정
                console.log('✅ 토큰 저장됨');
            } else {
                console.warn('⚠️ 회원가입 응답에 access_token이 없습니다:', response);
                console.warn('⚠️ 회원가입은 성공했지만 자동 로그인은 되지 않습니다. 로그인 페이지로 이동합니다.');
            }
            
            // 사용자 ID 저장 (백엔드 응답에 포함된 경우)
            if (userId) {
                localStorage.setItem('userId', userId.toString());
                localStorage.setItem('user_id', userId.toString()); // 호환성을 위해 둘 다 저장
                console.log('✅ 사용자 ID 저장됨:', userId);
            }
            
            // 이메일 및 닉네임 저장
            if (userEmail) {
                localStorage.setItem('userEmail', userEmail);
            }
            if (userNickname) {
                localStorage.setItem('userNickname', userNickname);
            }
            
            console.log('✅ 회원가입 완료');
            
            // 토큰이 없으면 로그인 페이지로, 있으면 완료 페이지로 이동
            if (accessToken) {
                // 회원가입 완료 페이지로 이동
                window.location.href = './signup-complete.html';
            } else {
                // 토큰이 없으면 로그인 페이지로 안내
                alert('회원가입이 완료되었습니다.\n로그인 페이지로 이동합니다.');
                setTimeout(() => {
                    window.location.href = './login.html';
                }, 500);
            }
        } catch (error) {
            console.error('회원가입 에러:', error);
            if (window.toast) {
                window.toast.error(error.message || '회원가입 중 오류가 발생했습니다.');
            } else {
                alert(error.message || '회원가입 중 오류가 발생했습니다.');
            }
            nextBtn.disabled = false;
            nextBtn.textContent = originalText;
        }
    });

    // Enter 키 처리
    passwordConfirmInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            nextBtn.click();
        }
    });

    function validateEmail() {
        const email = emailInput.value.trim();
        if (!email) {
            emailInput.style.borderColor = '#ff5758';
            return false;
        }
        emailInput.style.borderColor = '#297eff';
        return true;
    }

    function validatePassword() {
        const password = passwordInput.value;
        if (!password || password.length < 6) {
            passwordInput.style.borderColor = '#ff5758';
            return false;
        }
        passwordInput.style.borderColor = '#297eff';
        return true;
    }

    function validatePasswordMatch() {
        const password = passwordInput.value;
        const passwordConfirm = passwordConfirmInput.value;

        if (!passwordConfirm) {
            passwordMatchIndicator.classList.remove('show');
            return false;
        }

        passwordMatchIndicator.classList.add('show');

        if (password === passwordConfirm) {
            passwordMatchIndicator.classList.add('match');
            passwordMatchIndicator.classList.remove('mismatch');
            passwordConfirmInput.style.borderColor = '#297eff';
            return true;
        } else {
            passwordMatchIndicator.classList.add('mismatch');
            passwordMatchIndicator.classList.remove('match');
            passwordConfirmInput.style.borderColor = '#ff5758';
            return false;
        }
    }

    function validateAll() {
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        const isPasswordMatchValid = validatePasswordMatch();

        if (!isEmailValid || !isPasswordValid || !isPasswordMatchValid) {
            alert('모든 항목을 올바르게 입력해주세요.');
            return false;
        }

        return true;
    }
}

// ========================================
// 3단계: 휴대폰 인증
// ========================================

function initStep3() {
    const phoneInput = document.getElementById('phone');
    const sendCodeBtn = document.getElementById('sendCodeBtn');
    const verifyCodeInput = document.getElementById('verifyCode');
    const verifyBtn = document.getElementById('verifyBtn');
    const signupBtn = document.getElementById('signupBtn');
    const timerElement = document.getElementById('timer');

    let timerInterval = null;
    let timeLeft = 300; // 5분 = 300초
    let isVerified = false;

    // 저장된 전화번호 불러오기
    const savedPhone = SignupData.get('phone');
    if (savedPhone) {
        phoneInput.value = savedPhone;
    }

    // 전화번호 자동 포맷팅
    phoneInput.addEventListener('input', (e) => {
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
    });

    // 인증번호 받기 버튼
    sendCodeBtn.addEventListener('click', () => {
        const phone = phoneInput.value.replace(/[^0-9]/g, '');

        if (phone.length !== 11 || !phone.startsWith('010')) {
            alert('올바른 전화번호를 입력해주세요.');
            return;
        }

        // 인증번호 전송 (시뮬레이션)
        console.log('인증번호 전송:', phone);
        alert('인증번호가 전송되었습니다.');

        // UI 상태 변경
        phoneInput.disabled = true;
        sendCodeBtn.disabled = true;
        verifyCodeInput.disabled = false;
        verifyBtn.disabled = false;

        // 타이머 시작
        startTimer();
    });

    // 타이머 시작
    function startTimer() {
        timeLeft = 300;
        updateTimerDisplay();

        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                alert('인증 시간이 만료되었습니다. 다시 시도해주세요.');
                resetVerification();
            }
        }, 1000);
    }

    // 타이머 표시 업데이트
    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
    }

    // 인증 확인 버튼
    verifyBtn.addEventListener('click', () => {
        const code = verifyCodeInput.value.trim();

        if (!code) {
            alert('인증번호를 입력해주세요.');
            return;
        }

        // 인증번호 확인 (시뮬레이션 - 실제로는 서버 검증)
        if (code === '123456' || code.length === 6) {
            clearInterval(timerInterval);
            alert('인증이 완료되었습니다.');

            isVerified = true;
            verifyCodeInput.disabled = true;
            verifyBtn.disabled = true;
            verifyCodeInput.style.borderColor = '#4caf50';
            signupBtn.disabled = false;

            SignupData.set('phone', phoneInput.value.replace(/[^0-9]/g, ''));
        } else {
            alert('인증번호가 일치하지 않습니다.');
        }
    });

    // 인증 초기화
    function resetVerification() {
        phoneInput.disabled = false;
        sendCodeBtn.disabled = false;
        verifyCodeInput.disabled = true;
        verifyCodeInput.value = '';
        verifyBtn.disabled = true;
        signupBtn.disabled = true;
        isVerified = false;
    }

    // 회원가입 버튼
    signupBtn.addEventListener('click', async () => {
        if (!isVerified) {
            alert('휴대폰 인증을 완료해주세요.');
            return;
        }

        // 로딩 상태
        signupBtn.disabled = true;
        signupBtn.textContent = '가입 중...';

        try {
            // 회원가입 데이터 준비
            const nickname = SignupData.get('nickname');
            const email = SignupData.get('email') + SignupData.get('emailDomain');
            const password = SignupData.get('password');
            const phone = SignupData.get('phone');

            console.log('회원가입 시도:', { nickname, email, phone });

            // 실제 백엔드 API 호출
            const response = await window.apiService.signup(
                email,
                password,
                nickname,
                phone
            );

            console.log('회원가입 성공:', response);

            // 성공 - 세션 데이터 삭제
            SignupData.clear();

            // 회원가입 완료 페이지로 이동
            window.location.href = './signup-complete.html';
        } catch (error) {
            console.error('회원가입 에러:', error);
            alert(error.message || '회원가입 중 오류가 발생했습니다.');
            signupBtn.disabled = false;
            signupBtn.textContent = '회원가입';
        }
    });
}

