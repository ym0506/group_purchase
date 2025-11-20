/**
 * 공구 찾기 (전체) 페이지
 * 카테고리별 게시글 목록 로드
 */

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    initCategoryTabs();
    initSearchButton();
    // 기본으로 전체 카테고리 로드
    loadCategoryPosts('all');
});

/**
 * 카테고리 탭 초기화
 */
function initCategoryTabs() {
    const filterTabs = document.querySelectorAll('.filter-tab');

    filterTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            // 모든 탭에서 active 제거
            filterTabs.forEach(t => t.classList.remove('active'));
            // 클릭된 탭에 active 추가
            this.classList.add('active');

            const filter = this.getAttribute('data-filter');
            console.log('Category filter changed to:', filter);

            // 카테고리별 데이터 로드
            loadCategoryPosts(filter);
        });
    });
}

/**
 * 검색 버튼 초기화
 */
function initSearchButton() {
    const searchBtn = document.querySelector('.btn-search');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            window.location.href = './search.html';
        });
    }
}

/**
 * 카테고리별 게시글 로드
 * @param {string} filter - 필터 타입 ('all', 'delivery', 'bulk', 'flash', 'regular')
 */
async function loadCategoryPosts(filter) {
    try {
        // 로딩 상태 표시
        const itemsContainer = document.querySelector('.items-list, .post-list');
        if (itemsContainer) {
            itemsContainer.innerHTML = '<div class="loading">로딩 중...</div>';
        }

        // 필터를 API type 파라미터로 변환
        const typeMap = {
            'all': null,
            'delivery': 'delivery',
            'bulk': 'bundle',
            'flash': 'flash',
            'regular': 'regular'
        };
        const postType = typeMap[filter] || null;

        // 위치 정보 가져오기
        const latitude = localStorage.getItem('latitude') || 37.5665;
        const longitude = localStorage.getItem('longitude') || 126.9780;

        // API 호출
        const params = {
            type: postType,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            distance: 10
        };

        console.log('카테고리 게시글 로드:', params);
        const response = await window.apiService.getPosts(params);

        console.log('카테고리 게시글 로드 성공:', response);

        // UI 업데이트
        if (itemsContainer) {
            if (response.posts && response.posts.length > 0) {
                renderPosts(response.posts, itemsContainer);
            } else {
                itemsContainer.innerHTML = '<div class="empty-message">해당 카테고리의 게시글이 없습니다.</div>';
            }
        }
    } catch (error) {
        console.error('카테고리 게시글 로드 에러:', error);
        const itemsContainer = document.querySelector('.items-list, .post-list');
        if (itemsContainer) {
            itemsContainer.innerHTML = '<div class="error-message">게시글을 불러올 수 없습니다.</div>';
        }
    }
}

/**
 * 게시글 목록 렌더링
 * @param {Array} posts - 게시글 배열
 * @param {HTMLElement} container - 컨테이너 요소
 */
function renderPosts(posts, container) {
    if (!posts || posts.length === 0) {
        container.innerHTML = '<div class="empty-message">게시글이 없습니다.</div>';
        return;
    }

    container.innerHTML = posts.map(post => {
        const currentCount = post.current_participants || 0;
        const targetCount = post.target_participants || 0;
        const perPersonPrice = post.per_person_price || Math.floor((post.total_price || 0) / targetCount);

        return `
            <div class="item" data-post-id="${post.post_id || post.id}">
                <div class="item-avatar" style="${post.author?.profile_image_url ? `background-image: url('${post.author.profile_image_url}'); background-size: cover;` : ''}"></div>
                <div class="item-content">
                    <h3 class="item-title">${post.title || '제목 없음'}</h3>
                    <p class="item-description">${post.pickup_location_text || post.description || ''}</p>
                </div>
                <div class="item-count">${currentCount}/${targetCount}</div>
            </div>
        `;
    }).join('');

    // 클릭 이벤트 추가
    container.querySelectorAll('.item').forEach(item => {
        item.addEventListener('click', () => {
            const postId = item.getAttribute('data-post-id');
            sessionStorage.setItem('selectedPostId', postId);
            window.location.href = './matching.html';
        });
    });
}


