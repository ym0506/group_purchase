/**
 * 공구글 작성하기 4단계 JavaScript
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

    // 작성하기 버튼
    const submitBtn = document.querySelector('.btn-submit');
    const form = document.querySelector('.create-post-form');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                ...savedData,
                deadline: document.querySelector('#deadline')?.value || ''
            };

            console.log('공구글 작성 시작:', formData);

            // 버튼 로딩 상태
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = '작성 중...';
            }

            try {
                // 백엔드 API 호출: 게시글 작성
                const postData = {
                    post_type: formData.category || 'group',
                    title: formData.title || '소금빵',
                    description: formData.description || '소금빵 실수로 너무 많이 사버렸는데 같이 나눠먹어요',
                    main_image_url: formData.imageUrl || 'https://example.com/default-image.jpg',
                    total_price: parseInt(formData.totalPrice) || 30000,
                    target_participants: parseInt(formData.people) || 4,
                    per_person_price: Math.floor((parseInt(formData.totalPrice) || 30000) / (parseInt(formData.people) || 4)),
                    pickup_datetime: formData.pickupDate || '2025-11-05T18:00:00',
                    end_date: formData.deadline || '2025-11-06T23:59:59',
                    pickup_location_text: formData.location || '한서대학교 학생회관 앞'
                };

                console.log('백엔드 전송 데이터:', postData);

                // 실제 백엔드 API 호출
                const response = await window.apiService.createPost(postData);

                console.log('공구글 작성 성공:', response);

                // sessionStorage에 완료 데이터 저장 (완료 페이지에서 표시용)
                sessionStorage.setItem('postTitle', postData.title);
                sessionStorage.setItem('postPeople', postData.target_participants);
                sessionStorage.setItem('postLocation', postData.pickup_location_text);
                sessionStorage.setItem('postDeadline', postData.end_date);
                sessionStorage.setItem('createdPostId', response.post_id);

                // 완료 페이지로 이동
                window.location.href = 'create-post-complete.html';
            } catch (error) {
                console.error('공구글 작성 실패:', error);
                alert(error.message || '공구글 작성에 실패했습니다.');

                // 버튼 원래 상태로
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = '작성하기';
                }
            }
        });
    }
});

