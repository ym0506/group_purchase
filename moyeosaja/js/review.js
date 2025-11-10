/**
 * 리뷰 작성/조회 페이지
 * 별점 선택, 리뷰 작성, 제출 기능
 */

document.addEventListener('DOMContentLoaded', () => {
    updateStatusTime();
    initializeRating();
    initializeReviewForm();
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
 * 별점 시스템 초기화
 */
function initializeRating() {
    const stars = document.querySelectorAll('.star');
    let selectedRating = 0;

    stars.forEach(star => {
        // 호버 효과
        star.addEventListener('mouseenter', () => {
            const rating = parseInt(star.getAttribute('data-rating'));
            highlightStars(stars, rating);
        });

        // 마우스 아웃
        star.addEventListener('mouseleave', () => {
            highlightStars(stars, selectedRating);
        });

        // 클릭 선택
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.getAttribute('data-rating'));
            highlightStars(stars, selectedRating);

            // 선택된 별점 저장
            star.parentElement.setAttribute('data-selected-rating', selectedRating);

            console.log('Selected rating:', selectedRating);
        });
    });
}

/**
 * 별점 하이라이트
 */
function highlightStars(stars, rating) {
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('filled');
        } else {
            star.classList.remove('filled');
        }
    });
}

/**
 * 리뷰 폼 초기화
 */
function initializeReviewForm() {
    const submitBtn = document.getElementById('submitReview');
    const reviewText = document.getElementById('reviewText');
    const ratingStars = document.getElementById('ratingStars');

    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const rating = ratingStars.getAttribute('data-selected-rating') || 0;
            const review = reviewText.value.trim();

            // 유효성 검사
            if (rating === 0) {
                alert('별점을 선택해주세요!');
                return;
            }

            if (!review) {
                alert('한 줄 후기를 작성해주세요!');
                return;
            }

            // 리뷰 제출
            submitReview(rating, review);
        });
    }
}

/**
 * 리뷰 제출 (백엔드 API 연동)
 */
async function submitReview(rating, review) {
    console.log('Submitting review:', { rating, review });

    // 제출 중 표시
    const submitBtn = document.getElementById('submitReview');
    submitBtn.disabled = true;
    submitBtn.textContent = '제출 중...';

    try {
        // sessionStorage에서 게시글 ID 가져오기
        const postId = sessionStorage.getItem('selectedPostId') || sessionStorage.getItem('reviewPostId');

        if (!postId) {
            throw new Error('게시글 정보를 찾을 수 없습니다.');
        }

        console.log('리뷰 제출 시도:', { postId, rating, review });

        // 백엔드 API 호출
        const response = await window.apiService.createReview(postId, parseInt(rating), review);

        console.log('리뷰 제출 성공:', response);

        alert('리뷰가 성공적으로 작성되었습니다! 🎉');

        // 리뷰 목록 페이지로 이동
        window.location.href = './review-list.html';
    } catch (error) {
        console.error('리뷰 제출 중 오류:', error);
        alert(error.message || '리뷰 제출 중 오류가 발생했습니다.');

        // 버튼 복구
        submitBtn.disabled = false;
        submitBtn.textContent = '작성하기';
    }
}

