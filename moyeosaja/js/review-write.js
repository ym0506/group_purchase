/**
 * 리뷰 작성 페이지 JavaScript
 * 
 * 역할:
 * - 별점 선택
 * - 리뷰 내용 입력 관리
 * - 리뷰 제출
 * - 상태바 시간 업데이트
 */

document.addEventListener('DOMContentLoaded', () => {
    initializePage();
});

/**
 * 페이지 초기화
 */
function initializePage() {
    // 상태바 시간 업데이트
    updateStatusTime();

    // 별점 초기화
    initializeStarRating();

    // 리뷰 입력 초기화
    initializeReviewInput();

    // 작성하기 버튼 초기화
    initializeSubmitButton();

    // 페이지 데이터 불러오기
    loadPageData();
}

/**
 * 상태바 시간 업데이트
 */
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

/**
 * 별점 초기화
 */
function initializeStarRating() {
    const stars = document.querySelectorAll('.star');
    let currentRating = 0;

    stars.forEach((star, index) => {
        // 클릭 이벤트
        star.addEventListener('click', () => {
            currentRating = index + 1;
            updateStars(currentRating);

            // 별점 데이터 저장
            const reviewData = getReviewData();
            reviewData.rating = currentRating;
            saveReviewData(reviewData);

            // 버튼 활성화 상태 업데이트
            checkSubmitButtonState();
        });

        // 호버 이벤트
        star.addEventListener('mouseenter', () => {
            updateStars(index + 1);
        });
    });

    // 별점 영역 벗어날 때 현재 선택된 별점으로 복구
    const starRating = document.querySelector('.star-rating');
    if (starRating) {
        starRating.addEventListener('mouseleave', () => {
            updateStars(currentRating);
        });
    }
}

/**
 * 별 업데이트
 * @param {number} rating - 별점 (1-5)
 */
function updateStars(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

/**
 * 리뷰 입력 초기화
 */
function initializeReviewInput() {
    const textarea = document.querySelector('.review-textarea');
    if (textarea) {
        textarea.addEventListener('input', () => {
            const reviewData = getReviewData();
            reviewData.content = textarea.value;
            saveReviewData(reviewData);

            // 버튼 활성화 상태 업데이트
            checkSubmitButtonState();
        });
    }
}

/**
 * 작성하기 버튼 초기화
 */
function initializeSubmitButton() {
    const submitButton = document.querySelector('.btn-submit');
    if (submitButton) {
        submitButton.addEventListener('click', handleSubmit);
    }
}

/**
 * 리뷰 제출 처리
 */
async function handleSubmit() {
    const reviewData = getReviewData();

    // 필수 항목 체크
    if (!reviewData.rating) {
        if (window.toast) {
            window.toast.error('별점을 선택해주세요.');
        } else {
            alert('별점을 선택해주세요.');
        }
        return;
    }

    if (!reviewData.content || reviewData.content.trim() === '') {
        if (window.toast) {
            window.toast.error('한 줄 후기를 작성해주세요.');
        } else {
            alert('한 줄 후기를 작성해주세요.');
        }
        return;
    }

    // 리뷰 제출 확인
    const confirmed = window.confirmDialog 
        ? await window.confirmDialog.show('리뷰를 작성하시겠습니까?', '리뷰 작성')
        : confirm('리뷰를 작성하시겠습니까?');
    if (!confirmed) {
        return;
    }

    // 제출 버튼 비활성화
    const submitButton = document.querySelector('.btn-submit');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = '제출 중...';
    }

    try {
        // 게시글 ID 가져오기
        const postId = reviewData.itemId || sessionStorage.getItem('selectedPostId') || sessionStorage.getItem('reviewPostId');
        
        if (!postId) {
            throw new Error('게시글 정보를 찾을 수 없습니다.');
        }

        console.log('리뷰 제출:', reviewData);

        // 백엔드 API 호출
        const response = await window.apiService.createReview(
            postId,
            reviewData.rating,
            reviewData.content
        );

        console.log('리뷰 제출 성공:', response);

        // 성공 메시지
        if (window.toast) {
            window.toast.success('리뷰가 작성되었습니다. 감사합니다! 😊');
        } else {
            alert('리뷰가 작성되었습니다. 감사합니다! 😊');
        }

        // 리뷰 데이터 초기화
        sessionStorage.removeItem('reviewData');

        // 리뷰 목록 페이지로 이동
        window.location.href = './review-list.html';
    } catch (error) {
        console.error('리뷰 제출 에러:', error);
        
        if (window.toast) {
            window.toast.error(error.message || '리뷰 작성에 실패했습니다. 다시 시도해주세요.');
        } else {
            alert(error.message || '리뷰 작성에 실패했습니다. 다시 시도해주세요.');
        }
    } finally {
        // 제출 버튼 복구
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = '작성하기';
            checkSubmitButtonState();
        }
    }
}

/**
 * 버튼 활성화 상태 체크
 */
function checkSubmitButtonState() {
    const submitButton = document.querySelector('.btn-submit');
    const reviewData = getReviewData();

    if (submitButton) {
        if (reviewData.rating && reviewData.content && reviewData.content.trim() !== '') {
            submitButton.disabled = false;
        } else {
            submitButton.disabled = true;
        }
    }
}

/**
 * 리뷰 데이터 가져오기
 * @returns {Object} 리뷰 데이터
 */
function getReviewData() {
    const data = sessionStorage.getItem('reviewData');
    if (data) {
        return JSON.parse(data);
    }
    return {
        itemId: null,
        authorName: null,
        productName: null,
        rating: 0,
        content: ''
    };
}

/**
 * 리뷰 데이터 저장
 * @param {Object} data - 리뷰 데이터
 */
function saveReviewData(data) {
    sessionStorage.setItem('reviewData', JSON.stringify(data));
}

/**
 * 페이지 데이터 불러오기
 */
function loadPageData() {
    // URL 파라미터에서 아이템 정보 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('itemId');

    // sessionStorage에서 아이템 정보 가져오기
    const selectedItemId = sessionStorage.getItem('selectedItemId');
    const selectedItemTitle = sessionStorage.getItem('selectedItemTitle');
    const selectedItemProduct = sessionStorage.getItem('selectedItemProduct');

    // 리뷰 데이터 초기화
    const reviewData = getReviewData();
    reviewData.itemId = itemId || selectedItemId;
    reviewData.productName = selectedItemTitle || '소금빵';
    reviewData.authorName = '최지인';
    saveReviewData(reviewData);

    // UI 업데이트
    updateUI(reviewData);

    // 버튼 초기 상태 설정
    checkSubmitButtonState();
}

/**
 * UI 업데이트
 * @param {Object} data - 리뷰 데이터
 */
function updateUI(data) {
    // 상품명 업데이트
    const productNameElement = document.querySelector('.product-name');
    if (productNameElement && data.productName) {
        productNameElement.textContent = data.productName;
    }

    // 작성자명 업데이트
    const authorNameElement = document.querySelector('.author-name');
    if (authorNameElement && data.authorName) {
        authorNameElement.textContent = data.authorName;
    }

    // 질문 문구 업데이트
    const ratingQuestions = document.querySelectorAll('.rating-question');
    if (ratingQuestions.length >= 2 && data.authorName) {
        ratingQuestions[1].textContent = `${data.authorName}님과 공구가 어떠셨나요?`;
    }
}

/**
 * 백엔드 연동을 위한 미래 확장 구조
 * 
 * async function submitReview(reviewData) {
 *     try {
 *         const response = await fetch('/api/reviews', {
 *             method: 'POST',
 *             headers: {
 *                 'Content-Type': 'application/json',
 *                 'Authorization': `Bearer ${getAuthToken()}`
 *             },
 *             body: JSON.stringify({
 *                 item_id: reviewData.itemId,
 *                 rating: reviewData.rating,
 *                 content: reviewData.content
 *             })
 *         });
 *         
 *         if (!response.ok) {
 *             throw new Error('리뷰 제출 실패');
 *         }
 *         
 *         return await response.json();
 *     } catch (error) {
 *         throw error;
 *     }
 * }
 */


