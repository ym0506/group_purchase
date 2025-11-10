/**
 * 공구글 작성하기 JavaScript - 기본 구조
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

    // 다음 버튼
    const nextBtn = document.querySelector('.btn-next');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            // sessionStorage에 데이터 저장
            const formData = {
                name: document.querySelector('.form-row:nth-child(1) .form-input')?.value || '',
                quantity: document.querySelector('.form-row:nth-child(2) .form-input')?.value || '',
                content: document.querySelector('.form-textarea')?.value || '',
                people: document.querySelector('.people-input')?.value || '',
                price: document.querySelector('.price-input')?.value || ''
            };

            sessionStorage.setItem('createPostStep1', JSON.stringify(formData));

            // 다음 단계로 이동
            window.location.href = './create-post-step2.html';
        });
    }

    // 이미지 업로드
    const uploadBox = document.querySelector('.image-upload-box');
    if (uploadBox) {
        uploadBox.addEventListener('click', () => {
            alert('이미지 업로드 기능은 추후 구현 예정입니다.');
            // 실제로는 파일 업로드 기능 구현
        });
    }

    // AI 요약 버튼
    const aiBtn = document.querySelector('.ai-summary-btn');
    if (aiBtn) {
        aiBtn.addEventListener('click', () => {
            alert('AI 요약 기능은 추후 구현 예정입니다.');
            // 실제로는 AI API 호출
        });
    }
});

