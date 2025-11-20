/**
 * 공구글 작성하기 2단계 JavaScript
 */

// 상태바 시간 업데이트
function updateStatusTime() {
    const timeElement = document.querySelector('.status-time');
    if (timeElement) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeElement.textContent = `${hours}:${minutes}`;
    }
}

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    updateStatusTime();

    // 이전 단계 데이터 복원
    const savedData = JSON.parse(sessionStorage.getItem('createPostFormData') || '{}');

    // 다음 버튼
    const nextBtn = document.querySelector('.btn-next');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const formData = {
                ...savedData,
                meetDate: document.querySelector('#meetDate')?.value || '',
                meetTime: document.querySelector('#meetTime')?.value || '',
                meetLocation: document.querySelector('#meetLocation')?.value || ''
            };
            sessionStorage.setItem('createPostFormData', JSON.stringify(formData));
            window.location.href = './create-post-step3.html';
        });
    }
});

