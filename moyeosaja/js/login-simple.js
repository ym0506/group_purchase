// 간단한 로그인 페이지 초기화 (백업용)
document.addEventListener('DOMContentLoaded', function() {
    console.log('로그인 페이지 로드됨');
    
    // 로그인 폼 제출
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('로그인 버튼 클릭됨');
            
            const email = document.querySelector('input[type="email"]').value;
            const password = document.querySelector('input[type="password"]').value;
            
            if (!email || !password) {
                alert('이메일과 비밀번호를 입력해주세요.');
                return;
            }
            
            // 데모 모드: 바로 홈으로 이동
            console.log('로그인 시도:', email);
            alert('로그인 성공! (데모 모드)');
            window.location.href = './home.html';
        });
    }
    
    // 로그인 버튼 직접 클릭
    const loginBtn = document.querySelector('.btn-login');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('로그인 버튼 직접 클릭');
            if (loginForm) {
                loginForm.dispatchEvent(new Event('submit'));
            }
        });
    }
    
    // 회원가입 링크 확인
    const signupLink = document.querySelector('.signup-link');
    if (signupLink) {
        console.log('회원가입 링크 찾음:', signupLink.href);
    }
});

