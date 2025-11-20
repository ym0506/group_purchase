/**
 * 다른 사람 프로필 페이지 JavaScript
 * 
 * 역할:
 * - 탭 전환 (판매 물품 / 리뷰)
 * - 프로필 정보 표시
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

    // 탭 초기화
    initializeTabs();

    // 프로필 정보 불러오기
    loadUserProfile();
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
 * 탭 초기화
 */
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const contentPanels = document.querySelectorAll('.content-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            // 모든 탭 비활성화
            tabButtons.forEach(tab => tab.classList.remove('active'));
            contentPanels.forEach(panel => panel.classList.remove('active'));

            // 클릭된 탭 활성화
            this.classList.add('active');

            // 해당 탭의 콘텐츠 표시
            const tabName = this.getAttribute('data-tab');
            const targetPanel = document.querySelector(`[data-content="${tabName}"]`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }

            // 콘텐츠 불러오기
            loadTabContent(tabName);
        });
    });
}

/**
 * 탭 콘텐츠 불러오기
 * @param {string} tabName - 탭 이름 (products, reviews)
 */
async function loadTabContent(tabName) {
    console.log('탭 콘텐츠 불러오기:', tabName);

    // URL에서 사용자 ID 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');

    if (!userId) {
        console.error('사용자 ID가 없습니다.');
        return;
    }

    try {
        if (tabName === 'products') {
            // 판매 물품 목록 불러오기
            await loadUserProducts(userId);
        } else if (tabName === 'reviews') {
            // 리뷰 목록 불러오기
            await loadUserReviews(userId);
        }
    } catch (error) {
        console.error('탭 콘텐츠 불러오기 에러:', error);
    }
}

/**
 * 사용자 판매 물품 목록 로드
 * @param {string} userId - 사용자 ID
 */
async function loadUserProducts(userId) {
    try {
        // 모든 게시글을 가져와서 필터링
        const response = await window.apiService.getPosts({
            page: 1,
            limit: 100
        });

        // 해당 사용자가 작성한 게시글만 필터링
        const userPosts = response.posts?.filter(post => post.author_id === parseInt(userId)) || [];

        console.log('사용자 판매 물품:', userPosts);

        updateProductList(userPosts);
    } catch (error) {
        console.error('판매 물품 목록 불러오기 에러:', error);
        const listContainer = document.querySelector('.product-list');
        if (listContainer) {
            listContainer.innerHTML = '<p class="empty-message">판매 물품을 불러올 수 없습니다.</p>';
        }
    }
}

/**
 * 사용자 리뷰 목록 로드
 * @param {string} userId - 사용자 ID
 */
async function loadUserReviews(userId) {
    try {
        // 백엔드 API 호출
        const response = await window.apiService.getUserReviews(userId);

        console.log('사용자 리뷰 목록:', response);

        if (response.reviews && response.reviews.length > 0) {
            updateReviewList(response.reviews);
        } else {
            const listContainer = document.querySelector('.review-list');
            if (listContainer) {
                listContainer.innerHTML = '<p class="empty-message">받은 리뷰가 없습니다.</p>';
            }
        }
    } catch (error) {
        console.error('리뷰 목록 불러오기 에러:', error);
        const listContainer = document.querySelector('.review-list');
        if (listContainer) {
            listContainer.innerHTML = '<p class="empty-message">리뷰를 불러올 수 없습니다.</p>';
        }
    }
}

/**
 * 프로필 정보 불러오기
 */
async function loadUserProfile() {
    // URL에서 사용자 ID 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');

    if (!userId) {
        console.error('사용자 ID가 없습니다.');
        // 홈으로 리다이렉트
        // window.location.href = './home.html';
        return;
    }

    try {
        // 리뷰 API를 통해 프로필 정보 가져오기 (평균 평점, 리뷰 수)
        const reviewsResponse = await window.apiService.getUserReviews(userId);

        // 판매 물품 수 가져오기
        const postsResponse = await window.apiService.getPosts({
            page: 1,
            limit: 100
        });
        const userPosts = postsResponse.posts?.filter(post => post.author_id === parseInt(userId)) || [];

        // 프로필 정보 구성
        const userProfile = {
            name: reviewsResponse.reviews?.[0]?.reviewer_nickname || '사용자',
            rating: reviewsResponse.average_rating || 0,
            avatar: null, // 프로필 이미지는 별도 API 필요
            stats: {
                products: userPosts.length,
                reviews: reviewsResponse.total_reviews || reviewsResponse.reviews?.length || 0
            }
        };

        console.log('프로필 정보:', userProfile);

        // UI 업데이트
        updateProfileUI(userProfile);
    } catch (error) {
        console.error('프로필 정보 불러오기 에러:', error);
        if (window.toast) {
            window.toast.error('프로필 정보를 불러올 수 없습니다.');
        } else {
            alert('프로필 정보를 불러올 수 없습니다.');
        }
    }
}

/**
 * 프로필 UI 업데이트
 * @param {Object} profile - 프로필 정보
 */
function updateProfileUI(profile) {
    // 이름 업데이트
    const nameElement = document.querySelector('.profile-name');
    if (nameElement && profile.name) {
        nameElement.textContent = profile.name;
    }

    // 별점 업데이트
    const ratingScoreElement = document.querySelector('.rating-score');
    if (ratingScoreElement && profile.rating !== undefined) {
        ratingScoreElement.textContent = profile.rating.toFixed(1);
    }

    // 탭 레이블 업데이트
    if (profile.stats) {
        const productsTab = document.querySelector('[data-tab="products"] .tab-label');
        if (productsTab) {
            productsTab.textContent = `판매 물품 ${profile.stats.products}`;
        }

        const reviewsTab = document.querySelector('[data-tab="reviews"] .tab-label');
        if (reviewsTab) {
            reviewsTab.textContent = `리뷰 ${profile.stats.reviews}`;
        }
    }

    // 아바타 업데이트 (실제 이미지가 있는 경우)
    if (profile.avatar) {
        const avatarElement = document.querySelector('.profile-avatar-large');
        if (avatarElement) {
            avatarElement.style.backgroundImage = `url('${profile.avatar}')`;
            avatarElement.style.backgroundSize = 'cover';
            avatarElement.style.backgroundPosition = 'center';
        }
    }
}

/**
 * 판매 물품 목록 UI 업데이트
 * @param {Array} products - 상품 목록 (게시글 배열)
 */
function updateProductList(products) {
    const listContainer = document.querySelector('.product-list');
    if (!listContainer) return;

    if (!products || products.length === 0) {
        listContainer.innerHTML = '<p class="empty-message">판매 물품이 없습니다.</p>';
        return;
    }

    listContainer.innerHTML = products.map(product => {
        const currentCount = product.current_participants || 0;
        const targetCount = product.target_participants || 0;

        return `
            <div class="product-item" data-post-id="${product.post_id}">
                <div class="product-image" style="${product.main_image_url ? `background-image: url('${product.main_image_url}'); background-size: cover; background-position: center;` : ''}"></div>
                <div class="product-info">
                    <h3 class="product-name">${product.title || '제목 없음'}</h3>
                    <p class="product-description">${product.description || product.pickup_location_text || ''}</p>
                </div>
                <span class="product-status">${currentCount}/${targetCount}</span>
            </div>
        `;
    }).join('');

    // 클릭 이벤트 추가
    listContainer.querySelectorAll('.product-item').forEach(item => {
        item.addEventListener('click', () => {
            const postId = item.getAttribute('data-post-id');
            if (postId) {
                sessionStorage.setItem('selectedPostId', postId);
                window.location.href = './matching.html';
            }
        });
    });
}

/**
 * 리뷰 목록 UI 업데이트
 * @param {Array} reviews - 리뷰 목록 (API 응답)
 */
function updateReviewList(reviews) {
    const listContainer = document.querySelector('.review-list');
    if (!listContainer) return;

    if (!reviews || reviews.length === 0) {
        listContainer.innerHTML = '<p class="empty-message">받은 리뷰가 없습니다.</p>';
        return;
    }

    listContainer.innerHTML = reviews.map((review, index) => {
        const reviewerName = review.reviewer_nickname || review.reviewer?.nickname || '익명';
        const productName = review.post_title || '공구';
        const rating = review.rating || 0;
        const content = review.comment || review.content || '';

        return `
            <div class="review-item">
                <div class="review-header">
                    <div class="reviewer-info">
                        <span class="reviewer-name">${reviewerName}</span>
                        <span class="review-divider">|</span>
                        <span class="product-name-small">${productName}</span>
                    </div>
                    <div class="rating-stars-small">
                        ${generateStars(rating)}
                    </div>
                </div>
                <p class="review-content">${escapeHtml(content)}</p>
                ${review.created_at ? `<span class="review-date">${formatDate(review.created_at)}</span>` : ''}
            </div>
            ${index < reviews.length - 1 ? '<div class="review-divider"></div>' : ''}
        `;
    }).join('');
}

/**
 * HTML 이스케이프 (XSS 방지)
 * @param {string} text - 텍스트
 * @returns {string} 이스케이프된 텍스트
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 날짜 포맷팅
 * @param {string} dateString - 날짜 문자열
 * @returns {string} 포맷된 날짜
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * 별점 SVG 생성
 * @param {number} rating - 별점 (1-5)
 * @returns {string} - SVG HTML
 */
function generateStars(rating) {
    const stars = [];
    for (let i = 0; i < 5; i++) {
        stars.push(`
            <svg class="star-small" viewBox="0 0 11 11">
                <polygon points="5.5,0 6.8,3.7 10.9,4.3 8.2,6.9 8.9,10.9 5.5,9 2.1,10.9 2.8,6.9 0,4.3 4.2,3.7"
                    fill="${i < rating ? '#272727' : '#d9d9d9'}" />
            </svg>
        `);
    }
    return stars.join('');
}
