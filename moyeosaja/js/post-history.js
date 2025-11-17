// 공구 내역 페이지
console.log('Post History page loaded');

document.addEventListener('DOMContentLoaded', () => {
    const filterTabs = document.querySelectorAll('.filter-tab');

    filterTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            // 모든 탭에서 active 제거
            filterTabs.forEach(t => t.classList.remove('active'));
            // 클릭된 탭에 active 추가
            this.classList.add('active');

            const filter = this.getAttribute('data-filter');
            console.log('Filter changed to:', filter);

            // TODO: 필터에 따른 데이터 로드
        });
    });
});


