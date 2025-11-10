/**
 * 하단 네비게이션 바 기능
 * 모든 페이지에서 독립적으로 작동
 */

(function () {
    'use strict';

    // 페이지 매핑
    const pageRoutes = {
        // data-page 속성값
        'calendar': './calendar.html',
        'create': './create-post-step1.html',
        'home-main': './home.html',
        'favorites': './favorites.html',
        'mypage': './mypage.html',

        // 라벨 텍스트
        '캘린더': './calendar.html',
        '공구 글 작성하기': './create-post-step1.html',
        '홈': './home.html',
        '관심있어요': './favorites.html',
        '마이': './mypage.html'
    };

    // DOM 로드 완료 후 초기화
    function initNavigation() {
        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            item.addEventListener('click', function (e) {
                e.preventDefault();

                // data-page 속성 확인
                const dataPage = this.getAttribute('data-page');

                // 라벨 텍스트 확인
                const label = this.querySelector('.nav-label')?.textContent?.trim();

                // 라우트 찾기
                const route = pageRoutes[dataPage] || pageRoutes[label];

                if (route) {
                    console.log('Navigating to:', route);
                    window.location.href = route;
                } else {
                    console.warn('No route found for:', dataPage, label);
                }
            });

            // 커서 스타일 추가
            item.style.cursor = 'pointer';
        });

        console.log('Navigation initialized with', navItems.length, 'items');
    }

    // DOM 로드 완료 확인
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavigation);
    } else {
        initNavigation();
    }
})();

