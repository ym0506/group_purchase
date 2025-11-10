/**
 * 리뷰 목록 페이지
 * 내가 받은 리뷰 / 내가 작성한 리뷰 탭 전환 및 리뷰 표시
 */

document.addEventListener('DOMContentLoaded', () => {
    updateStatusTime();
    initializeFilterTabs();

    // 초기 로드: 내가 작성한 리뷰 표시
    loadMyReviews();
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
 * 필터 탭 초기화
 */
function initializeFilterTabs() {
    const filterTabs = document.querySelectorAll('.filter-tab');

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const filter = tab.getAttribute('data-filter');
            handleFilterChange(filter);
        });
    });
}

/**
 * 필터 변경 처리
 */
function handleFilterChange(filter) {
    // 탭 활성화 상태 변경
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    const activeTab = document.querySelector(`[data-filter="${filter}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }

    console.log('Filter changed to:', filter);

    // API 호출하여 리뷰 목록 업데이트
    loadReviews(filter);
}

/**
 * 내가 작성한 리뷰 목록 로드 (백엔드 API 연동)
 */
async function loadMyReviews() {
    try {
        console.log('내가 작성한 리뷰 로드 시작...');

        // 백엔드 API 호출
        const response = await window.apiService.getMyReviews();

        console.log('내가 작성한 리뷰 로드 성공:', response);

        // UI 업데이트
        if (response.reviews && response.reviews.length > 0) {
            renderReviews(response.reviews);
        } else {
            showEmptyMessage('아직 작성한 리뷰가 없습니다.');
        }
    } catch (error) {
        console.error('리뷰 로드 오류:', error);

        // 에러 처리
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            alert('로그인이 필요합니다.');
            window.location.href = './login.html';
        } else {
            showEmptyMessage('리뷰를 불러오는 중 오류가 발생했습니다.');
        }
    }
}

/**
 * 받은 리뷰 목록 로드 (백엔드 API 연동)
 */
async function loadReceivedReviews() {
    try {
        console.log('받은 리뷰 로드 시작...');

        // 현재 로그인한 유저 ID 필요
        const userId = localStorage.getItem('userId');

        if (!userId) {
            throw new Error('사용자 정보를 찾을 수 없습니다.');
        }

        // 백엔드 API 호출
        const response = await window.apiService.getUserReviews(userId);

        console.log('받은 리뷰 로드 성공:', response);

        // UI 업데이트
        if (response.reviews && response.reviews.length > 0) {
            renderReceivedReviews(response.reviews);
        } else {
            showEmptyMessage('아직 받은 리뷰가 없습니다.');
        }
    } catch (error) {
        console.error('리뷰 로드 오류:', error);
        showEmptyMessage('리뷰를 불러오는 중 오류가 발생했습니다.');
    }
}

/**
 * 내가 작성한 리뷰 렌더링
 */
function renderReviews(reviews) {
    const reviewsList = document.querySelector('.reviews-list');
    if (!reviewsList) return;

    reviewsList.innerHTML = reviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <div class="review-info">
                    <span class="reviewer-name">${review.receiver?.nickname || '사용자'}</span>
                    <span class="review-divider">|</span>
                    <span class="product-name">${review.post_title || '공구'}</span>
                </div>
                <div class="review-stars">
                    ${generateStars(review.rating)}
                </div>
            </div>
            <p class="review-text">${review.comment}</p>
            <span class="review-date">${formatDate(review.created_at)}</span>
        </div>
    `).join('');
}

/**
 * 받은 리뷰 렌더링
 */
function renderReceivedReviews(reviews) {
    const reviewsList = document.querySelector('.reviews-list');
    if (!reviewsList) return;

    reviewsList.innerHTML = reviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <div class="review-info">
                    <span class="reviewer-name">${review.reviewer?.nickname || '사용자'}</span>
                    <span class="review-divider">|</span>
                    <span class="product-name">공구</span>
                </div>
                <div class="review-stars">
                    ${generateStars(review.rating)}
                </div>
            </div>
            <p class="review-text">${review.comment}</p>
        </div>
    `).join('');
}

/**
 * 별점 HTML 생성
 */
function generateStars(rating) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        const filled = i <= rating ? 'filled' : '';
        starsHTML += `<span class="star-small ${filled}">★</span>`;
    }
    return starsHTML;
}

/**
 * 날짜 포맷팅
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
}

/**
 * 빈 메시지 표시
 */
function showEmptyMessage(message) {
    const reviewsList = document.querySelector('.reviews-list');
    if (reviewsList) {
        reviewsList.innerHTML = `<p style="text-align: center; color: #9e9e9e; padding: 40px;">${message}</p>`;
    }
}

/**
 * 필터에 따른 리뷰 로드
 */
async function loadReviews(filter) {
    if (filter === 'received') {
        await loadReceivedReviews();
    } else {
        await loadMyReviews();
    }
}

