// 공구 찾기 (전체) 페이지
console.log('Category All page loaded');

document.addEventListener('DOMContentLoaded', () => {
    const filterTabs = document.querySelectorAll('.filter-tab');

    filterTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            // 모든 탭에서 active 제거
            filterTabs.forEach(t => t.classList.remove('active'));
            // 클릭된 탭에 active 추가
            this.classList.add('active');

            const filter = this.getAttribute('data-filter');
            console.log('Category filter changed to:', filter);

            // TODO: 카테고리별 데이터 로드
        });
    });

    // 검색 버튼
    const searchBtn = document.querySelector('.btn-search');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            window.location.href = './search.html';
        });
    }
});

