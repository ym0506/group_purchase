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
        button.addEventListener('click', (event) => {
            const notificationItem = button.closest('.notification-item');
            const userName = notificationItem.querySelector('.user-name').textContent;

            alert(`${userName}님의 공구 요청을 수락했습니다!`);

            // 실제로는 서버에 요청을 보내고, 성공 시 해당 알림을 목록에서 제거하거나 상태 변경
            // 예: notificationItem.style.opacity = '0.5'; 또는 notificationItem.remove();
            notificationItem.style.backgroundColor = '#e8f5e9';
            button.textContent = '수락됨';
            button.disabled = true;
            button.style.backgroundColor = '#4caf50';
            notificationItem.querySelector('.btn-reject').disabled = true;
            notificationItem.querySelector('.btn-reject').style.opacity = '0.5';
        });
    });

    // 거절하기 버튼
    const rejectButtons = document.querySelectorAll('.btn-reject');
    rejectButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const notificationItem = button.closest('.notification-item');
            const userName = notificationItem.querySelector('.user-name').textContent;

            alert(`${userName}님의 공구 요청을 거절했습니다.`);

            // 실제로는 서버에 요청을 보내고, 성공 시 해당 알림을 목록에서 제거하거나 상태 변경
            // 예: notificationItem.remove();
            notificationItem.style.backgroundColor = '#ffebee';
            button.textContent = '거절됨';
            button.disabled = true;
            button.style.backgroundColor = '#f44336';
            notificationItem.querySelector('.btn-accept').disabled = true;
            notificationItem.querySelector('.btn-accept').style.opacity = '0.5';
        });
    });
});

