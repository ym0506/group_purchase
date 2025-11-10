/**
 * 카테고리 페이지 JavaScript
 */

// 상태바 시간 업데이트
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

// 필터 탭 전환
function initFilterTabs() {
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 모든 탭에서 active 제거
            tabs.forEach(t => t.classList.remove('active'));
            // 클릭된 탭에 active 추가
            tab.classList.add('active');

            const filterType = tab.textContent;
            console.log(`필터 적용: ${filterType}`);
            // 실제로는 여기서 필터링된 데이터를 가져와서 리스트 업데이트
        });
    });
}

// 정렬 옵션 변경
function initSortSelect() {
    const sortSelect = document.querySelector('.sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const sortType = e.target.value;
            console.log(`정렬 변경: ${sortType}`);
            // 실제로는 여기서 정렬된 데이터를 가져와서 리스트 업데이트
        });
    }
}

// 아이템 클릭 시 매칭 페이지로 이동
function initItemClick() {
    const items = document.querySelectorAll('.item');
    items.forEach(item => {
        item.addEventListener('click', function () {
            const itemId = this.getAttribute('data-item-id');
            const itemTitle = this.querySelector('.item-title').textContent;
            const itemProduct = this.getAttribute('data-product');

            // 선택된 아이템 정보를 sessionStorage에 저장
            sessionStorage.setItem('selectedItemId', itemId);
            sessionStorage.setItem('selectedItemTitle', itemTitle);
            sessionStorage.setItem('selectedItemProduct', itemProduct);

            // 매칭 상세 페이지로 이동
            window.location.href = './matching.html';
        });
    });
}

// 카테고리 필터 탭 초기화
function initCategoryFilterTabs() {
    const tabs = document.querySelectorAll('.category-filter-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const category = this.getAttribute('data-category');
            navigateToCategory(category);
        });
    });
}

// 카테고리 페이지로 이동
function navigateToCategory(category) {
    const categoryPages = {
        'all': './home.html',
        'delivery': './category-delivery.html',
        'bulk': './category-bulk.html',
        'flash': './category-flash.html',
        'regular': './category-regular.html'
    };

    const targetPage = categoryPages[category];
    if (targetPage) {
        window.location.href = targetPage;
    }
}

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    updateStatusTime();
    initFilterTabs();
    initSortSelect();
    initItemClick();
    initCategoryFilterTabs();

    console.log('카테고리 페이지 초기화 완료');
});

