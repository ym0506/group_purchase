/**
 * 공구글 작성 완료 페이지 JavaScript
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

// sessionStorage에서 데이터 불러오기
function loadPostData() {
    const postData = {
        title: sessionStorage.getItem('postTitle') || '소금빵',
        people: sessionStorage.getItem('postPeople') || '4',
        location: sessionStorage.getItem('postLocation') || '한서대학교 학생회관 앞',
        deadline: sessionStorage.getItem('postDeadline') || '2024-10-30 18:00'
    };

    // DOM에 데이터 표시
    document.getElementById('summaryTitle').textContent = postData.title;
    document.getElementById('summaryPeople').textContent = `${postData.people}명`;
    document.getElementById('summaryLocation').textContent = postData.location;
    document.getElementById('summaryDeadline').textContent = postData.deadline;

    // sessionStorage 초기화 (완료 후 데이터 삭제)
    console.log('공구글 작성 완료:', postData);
}

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    updateStatusTime();
    loadPostData();

    // 축하 애니메이션 추가 (선택사항)
    setTimeout(() => {
        const successIcon = document.querySelector('.success-icon');
        if (successIcon) {
            successIcon.style.animation = 'bounce 0.6s ease-in-out';
        }
    }, 100);
});

