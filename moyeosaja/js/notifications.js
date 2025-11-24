/**
 * 알림 페이지 JavaScript
 */

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

    // 수락하기 버튼
    const acceptButtons = document.querySelectorAll('.btn-accept');
    acceptButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const notificationItem = button.closest('.notification-item');
            const userName = notificationItem.querySelector('.user-name').textContent;

            // 버튼 로딩 상태
            button.disabled = true;
            const originalText = button.textContent;
            button.textContent = '처리 중...';

            try {
                // 실제 API 호출 시뮬레이션
                await new Promise(resolve => setTimeout(resolve, 500));

                // 성공 처리
                if (window.toast) {
                    window.toast.success(`${userName}님의 공구 요청을 수락했습니다!`);
                }

                // UI 업데이트
                notificationItem.style.backgroundColor = '#e8f5e9';
                notificationItem.style.transition = 'background-color 0.3s ease';
                button.textContent = '수락됨';
                button.style.backgroundColor = '#4caf50';
                button.style.color = 'white';

                const rejectBtn = notificationItem.querySelector('.btn-reject');
                if (rejectBtn) {
                    rejectBtn.disabled = true;
                    rejectBtn.style.opacity = '0.5';
                }
            } catch (error) {
                console.error('수락 처리 실패:', error);
                if (window.toast) {
                    window.toast.error('요청 처리에 실패했습니다.');
                }
                button.disabled = false;
                button.textContent = originalText;
            }
        });
    });

    // 거절하기 버튼
    const rejectButtons = document.querySelectorAll('.btn-reject');
    rejectButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const notificationItem = button.closest('.notification-item');
            const userName = notificationItem.querySelector('.user-name').textContent;

            // 확인 다이얼로그
            const confirmed = window.confirmDialog
                ? await window.confirmDialog.show(`${userName}님의 공구 요청을 거절하시겠습니까?`, '요청 거절')
                : confirm(`${userName}님의 공구 요청을 거절하시겠습니까?`);

            if (!confirmed) return;

            // 버튼 로딩 상태
            button.disabled = true;
            const originalText = button.textContent;
            button.textContent = '처리 중...';

            try {
                // 실제 API 호출 시뮬레이션
                await new Promise(resolve => setTimeout(resolve, 500));

                // 성공 처리
                if (window.toast) {
                    window.toast.info(`${userName}님의 공구 요청을 거절했습니다.`);
                }

                // UI 업데이트
                notificationItem.style.backgroundColor = '#ffebee';
                notificationItem.style.transition = 'background-color 0.3s ease';
                button.textContent = '거절됨';
                button.style.backgroundColor = '#f44336';
                button.style.color = 'white';

                const acceptBtn = notificationItem.querySelector('.btn-accept');
                if (acceptBtn) {
                    acceptBtn.disabled = true;
                    acceptBtn.style.opacity = '0.5';
                }
            } catch (error) {
                console.error('거절 처리 실패:', error);
                if (window.toast) {
                    window.toast.error('요청 처리에 실패했습니다.');
                }
                button.disabled = false;
                button.textContent = originalText;
            }
        });
    });
});

