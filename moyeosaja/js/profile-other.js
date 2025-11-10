/**
 * 다른사람 프로필 페이지
 * 다른 사용자의 프로필 및 활동 내역 표시
 */

document.addEventListener('DOMContentLoaded', () => {
    updateStatusTime();
    initActivityTabs();
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
 * 활동 탭 초기화
 */
function initActivityTabs() {
    const tabs = document.querySelectorAll('.activity-tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            // 모든 탭에서 active 제거
            tabs.forEach(t => t.classList.remove('active'));

            // 클릭한 탭에 active 추가
            this.classList.add('active');

            // TODO: 탭에 따라 다른 내용 표시
            const tabText = this.textContent;
            console.log(`선택된 탭: ${tabText}`);

            // 실제로는 API 호출하여 해당 탭의 데이터를 가져와야 함
        });
    });
}

/**
 * 백엔드 연동을 위한 미래 확장 구조
 * 
 * async function loadUserProfile(userId) {
 *     try {
 *         const response = await fetch(`/api/users/${userId}`);
 *         const data = await response.json();
 *         
 *         if (data.success) {
 *             renderUserProfile(data.user);
 *         }
 *     } catch (error) {
 *         console.error('프로필 로드 오류:', error);
 *     }
 * }
 * 
 * async function loadUserItems(userId, type = 'sales') {
 *     try {
 *         const response = await fetch(`/api/users/${userId}/items?type=${type}`);
 *         const data = await response.json();
 *         
 *         if (data.success) {
 *             renderActivityList(data.items);
 *         }
 *     } catch (error) {
 *         console.error('활동 내역 로드 오류:', error);
 *     }
 * }
 */

