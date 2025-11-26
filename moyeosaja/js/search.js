/**
 * 검색 페이지
 * 검색 기록 관리, 검색 실행, 필터링 기능
 */

// 샘플 데이터 (실제로는 API에서 가져옴)
const sampleItems = [
    { id: 1, title: '뿌링클 + 치즈볼', description: '치킨이 땡기는 밤이에용', count: '1/2', product: 'chicken' },
    { id: 2, title: '소금빵', description: '소금빵 실수로 너무 많이 사버렸는데 같이 나눠...', count: '3/4', product: 'bread' },
    { id: 3, title: '두루마리 휴지', description: '휴지 대용량으로 샀는데 아 너무 많아요 연락주...', count: '2/5', product: 'tissue' },
    { id: 4, title: '쌀', description: '아 이러다가 이거 평생 먹을듯 같이 해치워주세...', count: '2/5', product: 'rice' },
    { id: 5, title: '티빙 정기공구', description: '제가 유퀴즈 지나가는 행인으로 나오는데 보고...', count: '2/4', product: 'tving' },
    { id: 6, title: '뿌링클 + 치즈볼', description: '치킨이 땡기는 밤이에용', count: '2/4', product: 'chicken' },
    { id: 7, title: '소금빵', description: '소금빵 실수로 너무 많이 사버렸는데 같이 나눠...', count: '3/4', product: 'bread' },
    { id: 8, title: '두루마리 휴지', description: '휴지 대용량으로 샀는데 아 너무 많아요 연락주...', count: '2/5', product: 'tissue' },
    { id: 9, title: '쌀', description: '아 이러다가 이거 평생 먹을듯 같이 해치워주세...', count: '3/4', product: 'rice' },
    { id: 10, title: '넷플릭스', description: '은중과상연재밋다는데...', count: '3/4', product: 'streaming' },
    { id: 11, title: '디즈니플러스', description: '보고싶은 드라마가 생겻어요', count: '1/2', product: 'streaming' }
];

document.addEventListener('DOMContentLoaded', () => {
    updateStatusTime();
    initializeSearch();
    initializeSearchHistory();

    // 검색 입력창에 자동 포커스
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.focus();
    }

    // 세션 스토리지에서 검색어 불러오기
    const savedQuery = sessionStorage.getItem('searchQuery');
    if (savedQuery && searchInput) {
        searchInput.value = savedQuery;
        performSearch(savedQuery);
        // 검색어 사용 후 제거
        sessionStorage.removeItem('searchQuery');
    }
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
 * 검색 기능 초기화
 */
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.querySelector('.btn-search');

    // 검색 버튼 클릭
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                performSearch(query);
            }
        });
    }

    // Enter 키 입력
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    performSearch(query);
                }
            }
        });
    }
}

/**
 * 검색 기록 초기화
 */
function initializeSearchHistory() {
    const historyItems = document.querySelectorAll('.search-history-item');

    historyItems.forEach(item => {
        const text = item.querySelector('.search-history-text');
        const deleteBtn = item.querySelector('.btn-delete-history');

        // 검색 기록 클릭 시 검색 실행
        text.addEventListener('click', () => {
            const query = text.textContent;
            document.getElementById('searchInput').value = query;
            performSearch(query);
        });

        // 삭제 버튼 클릭
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            item.remove();
            console.log('검색 기록 삭제:', text.textContent);
        });
    });
}

/**
 * 검색 실행 (백엔드 API 연동)
 */
async function performSearch(query) {
    console.log('검색 실행:', query);

    // 검색 기록 숨기기, 검색 결과 표시
    const searchHistory = document.getElementById('searchHistory');
    const searchResults = document.getElementById('searchResults');
    const itemsList = document.querySelector('.search-results .items-list');

    if (searchHistory) searchHistory.style.display = 'none';
    if (searchResults) searchResults.style.display = 'block';

    // 로딩 상태 표시
    if (itemsList) {
        itemsList.innerHTML = '<div class="loading-results">검색 중...</div>';
    }

    try {
        // 백엔드 검색 API 호출: GET /api/posts/search?q=<keyword>
        const results = await window.apiService.searchPosts(query);

        console.log('검색 결과:', results);

        // 검색 결과 렌더링
        if (results && results.length > 0) {
            renderSearchResults(results);
            // 검색 기록에 추가
            addToSearchHistory(query);
        } else {
            // 검색 결과가 없으면 빈 결과 표시
            if (itemsList) {
                itemsList.innerHTML = '<div class="empty-results">검색 결과가 없습니다.</div>';
            }
            if (window.toast) {
                window.toast.info('검색 결과가 없습니다.');
            }
        }
    } catch (error) {
        console.error('❌ 검색 오류:', error);

        // 에러 발생 시 사용자에게 명확한 메시지 표시
        if (itemsList) {
            itemsList.innerHTML = '<div class="error-results">검색 중 오류가 발생했습니다.<br>잠시 후 다시 시도해주세요.</div>';
        }

        if (window.toast) {
            window.toast.error('검색 중 오류가 발생했습니다.');
        }
    }
}

/**
 * 검색 결과 렌더링
 * @param {Array} items - 검색 결과 배열 (API 응답)
 */
function renderSearchResults(items) {
    const itemsList = document.querySelector('.search-results .items-list');

    if (!itemsList) return;

    if (!items || items.length === 0) {
        itemsList.innerHTML = `
            <div class="empty-results">
                <p class="empty-results-text">검색 결과가 없습니다.</p>
            </div>
        `;
        return;
    }

    // API 응답 형식:
    // {
    //   "id": 12,
    //   "postType": "GROUP",
    //   "author": { "id": 3, "nickname": "홍길동", "profileImageUrl": "..." },
    //   "title": "소금빵",
    //   "content": "...",
    //   "pricePerPerson": 3000,
    //   "totalQuantity": 10,
    //   "minParticipants": 2,
    //   "maxParticipants": 4,
    //   "pickupLocationText": "강남역 1번 출구",
    //   "imageUrls": ["https://.../image1.png"]
    // }

    itemsList.innerHTML = items.map((item) => {
        const itemId = item.id;
        const title = item.title || '';
        const description = item.content || item.pickupLocationText || '';
        // maxParticipants를 목표 인원으로 사용 (current는 API에 없을 수 있음)
        const count = `0/${item.maxParticipants || item.totalQuantity || 0}`;
        const product = item.title || '';

        // 이미지: imageUrls 배열의 첫 번째 이미지 또는 작성자 프로필 이미지
        const imageUrl = (item.imageUrls && item.imageUrls.length > 0)
            ? item.imageUrls[0]
            : item.author?.profileImageUrl || '';

        return `
            <div class="item" data-item-id="${itemId}" data-product="${product}">
                <div class="item-avatar" style="${imageUrl ? `background-image: url('${imageUrl}'); background-size: cover;` : ''}"></div>
                <div class="item-content">
                    <div class="item-title">${title}</div>
                    <div class="item-description">${description}</div>
                </div>
                <div class="item-count">${count}</div>
            </div>
        `;
    }).join('');

    // 아이템 클릭 이벤트 추가
    initItemClicks();
}

/**
 * 아이템 클릭 이벤트
 */
function initItemClicks() {
    const items = document.querySelectorAll('.search-results .item');
    items.forEach(item => {
        item.addEventListener('click', function () {
            const itemId = this.getAttribute('data-item-id');
            const itemTitle = this.querySelector('.item-title').textContent;
            const itemProduct = this.getAttribute('data-product');

            // 선택된 아이템 정보를 sessionStorage에 저장
            sessionStorage.setItem('selectedPostId', itemId); // post_id로 통일
            sessionStorage.setItem('selectedItemId', itemId);
            sessionStorage.setItem('selectedItemTitle', itemTitle);
            sessionStorage.setItem('selectedItemProduct', itemProduct);

            // 매칭 상세 페이지로 이동
            window.location.href = './matching.html';
        });
    });
}

/**
 * 검색 기록 추가
 */
function addToSearchHistory(query) {
    // 실제로는 localStorage나 API에 저장
    console.log('검색 기록 추가:', query);
}

/**
 * 백엔드 연동을 위한 미래 확장 구조
 * 
 * async function performSearch(query) {
 *     try {
 *         const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
 *         const data = await response.json();
 *         
 *         if (data.success) {
 *             renderSearchResults(data.results);
 *         }
 *     } catch (error) {
 *         console.error('검색 오류:', error);
 *     }
 * }
 * 
 * async function addToSearchHistory(query) {
 *     try {
 *         await fetch('/api/search/history', {
 *             method: 'POST',
 *             headers: { 'Content-Type': 'application/json' },
 *             body: JSON.stringify({ query })
 *         });
 *     } catch (error) {
 *         console.error('검색 기록 저장 오류:', error);
 *     }
 * }
 */

