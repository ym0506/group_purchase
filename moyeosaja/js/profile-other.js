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
            // const products = await window.apiService.getUserProducts(userId);
            // updateProductList(products);
            console.log('판매 물품 목록 불러오기');
        } else if (tabName === 'reviews') {
            // 리뷰 목록 불러오기
            // const reviews = await window.apiService.getUserReviews(userId);
            // updateReviewList(reviews);
            console.log('리뷰 목록 불러오기');
        }
    } catch (error) {
        console.error('탭 콘텐츠 불러오기 에러:', error);
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
        // 프로필 정보 가져오기
        // const userProfile = await window.apiService.getUserProfile(userId);

        // 프로필 정보 시뮬레이션
        const userProfile = {
            name: '최지인',
            rating: 1.0,
            avatar: null,
            stats: {
                products: 20,
                reviews: 18
            }
        };

        // UI 업데이트
        updateProfileUI(userProfile);
    } catch (error) {
        console.error('프로필 정보 불러오기 에러:', error);
        alert('프로필 정보를 불러올 수 없습니다.');
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
 * @param {Array} products - 상품 목록
 */
function updateProductList(products) {
    const listContainer = document.querySelector('.product-list');
    if (!listContainer) return;

    if (products.length === 0) {
        listContainer.innerHTML = '<p class="empty-message">판매 물품이 없습니다.</p>';
        return;
    }

    listContainer.innerHTML = products.map(product => `
        <div class="product-item">
            <div class="product-image" style="${product.image ? `background-image: url('${product.image}'); background-size: cover; background-position: center;` : ''}"></div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
            </div>
            <span class="product-status">${product.currentCount}/${product.maxCount}</span>
        </div>
    `).join('');
}

/**
 * 리뷰 목록 UI 업데이트
 * @param {Array} reviews - 리뷰 목록
 */
function updateReviewList(reviews) {
    const listContainer = document.querySelector('.review-list');
    if (!listContainer) return;

    if (reviews.length === 0) {
        listContainer.innerHTML = '<p class="empty-message">리뷰가 없습니다.</p>';
        return;
    }

    listContainer.innerHTML = reviews.map((review, index) => `
        <div class="review-item">
            <div class="review-header">
                <div class="reviewer-info">
                    <span class="reviewer-name">${review.reviewerName}</span>
                    <span class="review-divider">|</span>
                    <span class="product-name-small">${review.productName}</span>
                </div>
                <div class="rating-stars-small">
                    ${generateStars(review.rating)}
                </div>
            </div>
            <p class="review-content">${review.content}</p>
        </div>
        ${index < reviews.length - 1 ? '<div class="review-divider"></div>' : ''}
    `).join('');
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
