/**
 * 마이페이지 로그인 X
 * 로그인하지 않은 상태의 마이페이지
 */

document.addEventListener('DOMContentLoaded', () => {
    updateStatusTime();
    initQuickLinks();
});

/**
 * 상태바 시간 업데이트
 */
function updateStatusTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    const statusTimeElement = document.querySelector('.status-time');
    if (statusTimeElement) {
        statusTimeElement.textContent = timeString;
    }
}

/**
 * 빠른 링크 초기화
 */
function initQuickLinks() {
    const quickLinks = document.querySelectorAll('.quick-link');

    quickLinks.forEach(link => {
        link.addEventListener('click', function () {
            const label = this.querySelector('.quick-link-label').textContent;

            // 로그인 페이지로 리다이렉트
            console.log(`${label} 클릭 - 로그인 필요`);
            // window.location.href = './login.html';

            // 또는 로그인 모달 표시
            alert('로그인이 필요합니다.');
        });
    });
}

/**
 * 백엔드 연동을 위한 미래 확장 구조
 * 
 * async function checkLoginStatus() {
 *     try {
 *         const response = await fetch('/api/auth/check');
 *         const data = await response.json();
 *         
 *         if (data.isLoggedIn) {
 *             // 로그인된 상태라면 마이페이지로 리다이렉트
 *             window.location.href = './mypage.html';
 *         }
 *     } catch (error) {
 *         console.error('로그인 상태 확인 오류:', error);
 *     }
 * }
 */

