// Component controllers - 컴포넌트 컨트롤러

import { Utils } from './utils.js';

// 검색 컴포넌트
export class SearchComponent {
    constructor(selector) {
        this.container = Utils.$(selector);
        this.input = this.container?.querySelector('.search-input');
        this.init();
    }

    init() {
        if (!this.input) return;

        // 검색 페이지가 아닌 경우에만 포커스 시 이동
        const isSearchPage = window.location.pathname.includes('search.html');

        if (!isSearchPage) {
            // 포커스 이벤트 - 검색 페이지로 이동 (홈 페이지에서만)
            Utils.on(this.input, 'focus', () => {
                window.location.href = './search.html';
            });
        } else {
            // 검색 페이지에서는 검색 실행
            Utils.on(this.input, 'keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(this.input.value);
                }
            });
        }
    }

    async performSearch(query) {
        if (!query.trim()) return;

        // 검색어를 세션 스토리지에 저장하고 검색 페이지로 이동
        sessionStorage.setItem('searchQuery', query);
        window.location.href = './search.html';
    }
}

// 카테고리 카드 컴포넌트
export class CategoryComponent {
    constructor(selector) {
        this.cards = Utils.$$(selector);
        this.init();
    }

    init() {
        this.cards.forEach(card => {
            Utils.on(card, 'click', () => {
                const title = card.querySelector('.category-title')?.textContent;
                this.selectCategory(title);
            });
        });
    }

    selectCategory(title) {
        // 카테고리별 라우팅 로직
        const routes = {
            '공동배달': './category-delivery.html',
            '묶음구매': './category-bulk.html',
            '번개공구': './category-flash.html',
            '정기공구': './category-regular.html'
        };

        const route = routes[title];
        if (route) {
            // 실제 페이지로 이동
            window.location.href = route;
        }
    }
}

// 매칭 버튼 컴포넌트
export class MatchButtonComponent {
    constructor(selector) {
        this.buttons = Utils.$$(selector);
        this.init();
    }

    init() {
        this.buttons.forEach(button => {
            Utils.on(button, 'click', (e) => {
                e.stopPropagation();
                this.handleMatch(button);
            });
        });
    }

    async handleMatch(button) {
        const itemTitle = button.closest('.item')?.querySelector('.item-title')?.textContent;

        // 매칭 중 상태
        button.textContent = '매칭중...';
        button.classList.add('matching');
        button.disabled = true;

        try {
            // 매칭 API 호출 시뮬레이션
            await Utils.simulate({ success: true }, 1500);

            // 완료 상태
            button.textContent = '매칭완료';
            button.classList.remove('matching');
            button.classList.add('completed');

        } catch (error) {
            // 에러 상태
            button.textContent = '매칭하기';
            button.classList.remove('matching');
            button.disabled = false;
            console.error('Matching error:', error);
        }
    }
}

// 네비게이션 컴포넌트
export class NavigationComponent {
    constructor(selector) {
        this.navItems = Utils.$$(selector);
        this.currentPage = 'home';
        this.init();
    }

    init() {
        this.navItems.forEach(item => {
            Utils.on(item, 'click', () => {
                const label = item.querySelector('.nav-label')?.textContent;
                this.navigateTo(label, item);
            });
        });

        // 초기 활성화 상태 설정
        this.setActiveItem('홈');
    }

    navigateTo(page, itemElement) {
        // 모든 아이템에서 active 클래스 제거
        this.navItems.forEach(nav => nav.classList.remove('active'));

        // 클릭된 아이템에 active 클래스 추가
        if (itemElement) {
            itemElement.classList.add('active');
        }

        // data-page 속성 확인
        const dataPage = itemElement?.getAttribute('data-page');

        // 페이지별 라우팅 (실제 페이지로 이동)
        const routes = {
            '홈': './home.html',
            '알림': './notifications.html',
            '마이': './mypage.html',
            '캘린더': './calendar.html',
            '공구 글 작성하기': './create-post-step1.html',
            '관심있어요': './favorites.html',
            'home': './home.html',
            'home-main': './home.html',
            'notifications': './notifications.html',
            'mypage': './mypage.html',
            'create': './create-post-step1.html',
            'calendar': './calendar.html',
            'favorites': './favorites.html'
        };

        const route = routes[page] || routes[dataPage];
        if (route) {
            this.currentPage = route;
            // 실제 페이지로 이동
            window.location.href = route;
        }
    }

    setActiveItem(page) {
        this.navItems.forEach(item => {
            const label = item.querySelector('.nav-label')?.textContent;
            if (label === page) {
                item.classList.add('active');
            }
        });
    }
}

// 페이지네이션 컴포넌트
export class PaginationComponent {
    constructor(selector) {
        this.indicators = Utils.$$(selector);
        this.currentPage = 0;
        this.init();
    }

    init() {
        this.indicators.forEach((indicator, index) => {
            Utils.on(indicator, 'click', () => {
                this.goToPage(index);
            });
        });
    }

    goToPage(pageIndex) {
        // 모든 인디케이터에서 active 제거
        this.indicators.forEach(indicator => {
            indicator.classList.remove('active');
        });

        // 선택된 페이지 활성화
        this.indicators[pageIndex]?.classList.add('active');
        this.currentPage = pageIndex;

        // 페이지 변경 로직 (실제로는 아이템 목록 필터링 등)
        console.log(`Page ${pageIndex + 1} selected`);
    }
}
