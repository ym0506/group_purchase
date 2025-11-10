/**
 * 매칭 상태 페이지 (매칭성공, 매칭 대기 중, 종료)
 * 공구 내역을 보여주고 필터링하는 페이지
 */

document.addEventListener('DOMContentLoaded', () => {
    updateStatusTime();
    initializeFilterTabs();
    initializeItemClicks();
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

    // 페이지 이동
    switch (filter) {
        case 'all':
            window.location.href = './matching-all.html';
            break;
        case 'waiting':
            window.location.href = './matching-waiting.html';
            break;
        case 'success':
            window.location.href = './matching-success.html';
            break;
        case 'closed':
            window.location.href = './matching-closed.html';
            break;
    }
}

/**
 * 아이템 클릭 이벤트 초기화
 */
function initializeItemClicks() {
    const items = document.querySelectorAll('.item');

    items.forEach(item => {
        item.addEventListener('click', () => {
            const itemId = item.getAttribute('data-item-id');
            const title = item.querySelector('.item-title')?.textContent;
            const product = item.getAttribute('data-product');

            // 아이템 정보를 sessionStorage에 저장
            sessionStorage.setItem('selectedItemId', itemId);
            sessionStorage.setItem('selectedItemTitle', title);
            sessionStorage.setItem('selectedItemProduct', product);

            // 매칭 페이지로 이동
            window.location.href = './matching.html';
        });
    });
}

/**
 * 백엔드 연동을 위한 미래 확장 구조
 * 
 * async function loadMatchingHistory(filter) {
 *     try {
 *         const response = await fetch(`/api/matching/history?filter=${filter}`);
 *         const data = await response.json();
 *         renderItems(data.items);
 *     } catch (error) {
 *         console.error('Error loading matching history:', error);
 *     }
 * }
 * 
 * function renderItems(items) {
 *     const itemsList = document.querySelector('.items-list');
 *     itemsList.innerHTML = items.map(item => `
 *         <div class="item completed" data-item-id="${item.id}" data-product="${item.productType}">
 *             <div class="item-avatar"></div>
 *             <div class="item-content">
 *                 <div class="item-title">${item.title}</div>
 *                 <div class="item-description">${item.description}</div>
 *             </div>
 *             <div class="item-count">${item.currentCount}/${item.maxCount}</div>
 *         </div>
 *     `).join('');
 * }
 */

