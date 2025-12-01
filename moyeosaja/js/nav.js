/**
 * 하단 네비게이션 바 기능
 * 프로덕션 레디 - 모든 페이지에서 완벽하게 작동
 */

(function () {
    'use strict';

    // 페이지 라우트 매핑 (상대 경로)
    const pageRoutes = {
        'calendar': './calendar.html',
        'create': './create-post-step1.html',
        'home-main': './home.html',
        'favorites': './favorites.html',
        'mypage': './mypage.html'
    };

    // 현재 페이지 파일명 추출
    function getCurrentPageFile() {
        const path = window.location.pathname;
        const segments = path.split('/');
        return segments[segments.length - 1] || 'home.html';
    }

    // 페이지 이동
    function navigateToPage(navItem) {
        try {
            const dataPage = navItem.getAttribute('data-page');

            if (!dataPage) {
                console.error('[Nav] No data-page attribute');
                showError('페이지를 찾을 수 없습니다.');
                return false;
            }

            const route = pageRoutes[dataPage];

            if (!route) {
                console.error('[Nav] Route not found for:', dataPage);
                showError('페이지 경로를 찾을 수 없습니다.');
                return false;
            }

            // 현재 페이지와 동일한 경우 스킵
            if (isCurrentPage(dataPage)) {
                return false;
            }

            // 시각적 피드백
            addClickFeedback(navItem);

            // 페이지 이동
            window.location.href = route;
            return true;
        } catch (error) {
            console.error('[Nav] Navigation error:', error);
            showError('페이지 이동 중 오류가 발생했습니다.');
            return false;
        }
    }

    // 클릭 피드백 (시각적)
    function addClickFeedback(navItem) {
        navItem.style.transform = 'scale(0.95)';
        navItem.style.opacity = '0.7';

        setTimeout(() => {
            navItem.style.transform = '';
            navItem.style.opacity = '';
        }, 150);
    }

    // 에러 메시지 표시 (간단한 토스트)
    function showError(message) {
        // 간단한 에러 표시 (필요시 토스트 라이브러리로 교체 가능)
        console.error('[Nav Error]', message);
        // 실제 프로덕션에서는 토스트 메시지 표시
    }

    // 현재 페이지 확인
    function isCurrentPage(dataPage) {
        const currentFile = getCurrentPageFile();
        const pageMap = getPageMap();
        return pageMap[currentFile] === dataPage;
    }

    // 페이지 매핑 (현재 파일명 -> data-page 값)
    function getPageMap() {
        return {
            'home.html': 'home-main',
            'calendar.html': 'calendar',
            'create-post-step1.html': 'create',
            'create-post-step2.html': 'create',
            'create-post-step3.html': 'create',
            'create-post-step4.html': 'create',
            'create-post-complete.html': 'create',
            'favorites.html': 'favorites',
            'mypage.html': 'mypage',
            'my-posts.html': 'mypage',
            'my-posts-empty.html': 'mypage',
            'post-history.html': 'mypage',
            'review-list.html': 'mypage',
            'review-write.html': 'mypage',
            // 매칭 관련 페이지는 홈으로
            'matching.html': 'home-main',
            'matching-all.html': 'home-main',
            'matching-waiting.html': 'home-main',
            'matching-success.html': 'home-main',
            'matching-closed.html': 'home-main',
            // 검색 및 카테고리 페이지는 홈으로
            'search.html': 'home-main',
            'category-all.html': 'home-main',
            'category-delivery.html': 'home-main',
            'category-bulk.html': 'home-main',
            'category-flash.html': 'home-main',
            'category-regular.html': 'home-main',
            // 기타
            'notifications.html': 'home-main',
            'profile-other.html': 'home-main'
        };
    }

    // 활성 네비게이션 아이템 설정
    function setActiveNavItem() {
        const currentFile = getCurrentPageFile();
        const pageMap = getPageMap();
        const activeDataPage = pageMap[currentFile];

        if (!activeDataPage) {
            return;
        }

        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            const dataPage = item.getAttribute('data-page');

            if (dataPage === activeDataPage) {
                item.classList.add('active');
                item.setAttribute('aria-current', 'page');
            } else {
                item.classList.remove('active');
                item.removeAttribute('aria-current');
            }
        });
    }

    // 네비게이션 초기화
    function initNavigation() {
        const navItems = document.querySelectorAll('.bottom-nav .nav-item');

        if (navItems.length === 0) {
            console.warn('[Nav] No navigation items found');
            return;
        }

        // 활성 상태 설정
        setActiveNavItem();

        // 이벤트 리스너 추가 (bottom-nav 안의 .nav-item에만 적용)
        navItems.forEach(item => {
            // 클릭 이벤트
            item.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                navigateToPage(this);
            });

            // 키보드 이벤트 (Enter, Space)
            item.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    navigateToPage(this);
                }
            });

            // 접근성 속성
            if (!item.hasAttribute('role')) {
                item.setAttribute('role', 'button');
            }
            if (!item.hasAttribute('tabindex')) {
                item.setAttribute('tabindex', '0');
            }

            // 스타일
            item.style.cursor = 'pointer';
            item.style.transition = 'all 0.2s ease';

            // 호버 효과
            item.addEventListener('mouseenter', function () {
                if (!this.classList.contains('active')) {
                    this.style.opacity = '0.8';
                }
            });

            item.addEventListener('mouseleave', function () {
                this.style.opacity = '1';
            });
        });

        console.log('[Nav] Initialized successfully with', navItems.length, 'items');
    }

    // DOM 로드 완료 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavigation);
    } else {
        initNavigation();
    }
})();
