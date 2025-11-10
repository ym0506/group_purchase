// Main application - 메인 애플리케이션

import { Utils } from './utils.js';
import {
    SearchComponent,
    CategoryComponent,
    MatchButtonComponent,
    NavigationComponent,
    PaginationComponent
} from './components.js';

class App {
    constructor() {
        this.components = {};
        this.init();
    }

    init() {
        // DOM이 로드되면 컴포넌트 초기화
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeComponents();
            });
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        try {
            // 각 컴포넌트 초기화
            this.components.search = new SearchComponent('.search-container');
            this.components.category = new CategoryComponent('.category-card');
            this.components.matchButton = new MatchButtonComponent('.match-button');
            this.components.navigation = new NavigationComponent('.nav-item');
            this.components.pagination = new PaginationComponent('.page-indicator');

            // 글로벌 이벤트 리스너
            this.initGlobalEvents();

            // 위치 권한 모달 초기화
            this.initLocationModal();

            // 게시글 목록 로드 (백엔드 API 연동)
            this.loadPosts();

            console.log('App initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }

    initLocationModal() {
        const modal = Utils.$('#locationModal');
        const allowBtn = Utils.$('#allowLocationBtn');
        const laterBtn = Utils.$('#laterBtn');

        // 페이지 로드 시 모달 표시 (2초 후)
        setTimeout(() => {
            if (modal && !localStorage.getItem('locationPermissionAsked')) {
                modal.classList.add('active');
            }
        }, 2000);

        // 허용하기 버튼
        if (allowBtn) {
            Utils.on(allowBtn, 'click', () => {
                this.requestLocation();
                this.closeLocationModal();
            });
        }

        // 다음에 버튼
        if (laterBtn) {
            Utils.on(laterBtn, 'click', () => {
                this.closeLocationModal();
            });
        }

        // 모달 외부 클릭 시 닫기
        if (modal) {
            Utils.on(modal, 'click', (e) => {
                if (e.target === modal) {
                    this.closeLocationModal();
                }
            });
        }
    }

    requestLocation() {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log('Location granted:', position.coords);
                    localStorage.setItem('locationPermissionAsked', 'true');
                    localStorage.setItem('locationEnabled', 'true');
                    alert('위치 권한이 허용되었습니다! 내 주변 공구를 확인할 수 있습니다.');
                },
                (error) => {
                    console.error('Location error:', error);
                    localStorage.setItem('locationPermissionAsked', 'true');
                    alert('위치 권한을 가져올 수 없습니다. 브라우저 설정을 확인해주세요.');
                }
            );
        } else {
            alert('이 브라우저는 위치 서비스를 지원하지 않습니다.');
        }
    }

    closeLocationModal() {
        const modal = Utils.$('#locationModal');
        if (modal) {
            modal.classList.remove('active');
            localStorage.setItem('locationPermissionAsked', 'true');
        }
    }

    initGlobalEvents() {
        // 전체보기 링크
        Utils.on('.view-all', 'click', (e) => {
            e.preventDefault();
            alert('전체 추천 공구 목록을 불러왔습니다!');
        });

        // 아이템 클릭 이벤트 - 매칭 페이지로 이동
        Utils.$$('.item').forEach(item => {
            // 클릭 가능한 스타일 추가
            item.style.cursor = 'pointer';

            Utils.on(item, 'click', (e) => {
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

        // 키보드 단축키
        Utils.on(document, 'keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // 스크롤 이벤트 (무한 스크롤 등)
        Utils.on(window, 'scroll', Utils.debounce(() => {
            this.handleScroll();
        }, 100));
    }

    showItemDetail(itemId, title) {
        // 매칭 페이지로 이동
        sessionStorage.setItem('selectedItemId', itemId);
        sessionStorage.setItem('selectedItemTitle', title);
        window.location.href = './matching.html';
    }

    handleKeyboardShortcuts(e) {
        // ESC 키로 검색 초기화
        if (e.key === 'Escape') {
            const searchInput = Utils.$('.search-input');
            if (searchInput) {
                searchInput.value = '';
                searchInput.blur();
            }
        }

        // Cmd/Ctrl + K로 검색 포커스
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = Utils.$('.search-input');
            if (searchInput) {
                searchInput.focus();
            }
        }
    }

    handleScroll() {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // 하단 근처에서 더 많은 아이템 로드 (무한 스크롤)
        if (scrollPosition + windowHeight >= documentHeight - 100) {
            this.loadMoreItems();
        }
    }

    /**
     * 게시글 목록 로드 (백엔드 API 연동)
     */
    async loadPosts() {
        try {
            // 현재 위치 정보 가져오기 (localStorage에서)
            const latitude = localStorage.getItem('latitude') || 37.5665; // 기본값: 서울
            const longitude = localStorage.getItem('longitude') || 126.9780;
            const distance = 10; // 기본 거리: 10km

            console.log('게시글 목록 로드 시도...');

            // 백엔드 API 호출
            const response = await window.apiService.getPosts({
                type: 'group', // 또는 null (전체)
                latitude,
                longitude,
                distance
            });

            console.log('게시글 목록 로드 성공:', response);

            // UI 업데이트 (실제 게시글 렌더링)
            if (response.posts && response.posts.length > 0) {
                this.renderPosts(response.posts);
            }
        } catch (error) {
            console.error('게시글 목록 로드 실패:', error);
            // 에러 시 기본 UI 유지
        }
    }

    /**
     * 게시글 렌더링
     */
    renderPosts(posts) {
        const itemsContainer = Utils.$('.items-list');
        if (!itemsContainer) return;

        // 기존 아이템은 유지하고 추가로 렌더링 (또는 전체 교체)
        // 실제 구현에서는 기존 아이템을 지우고 새로 렌더링할 수 있습니다.

        posts.forEach(post => {
            const itemElement = this.createPostElement(post);
            itemsContainer.appendChild(itemElement);
        });
    }

    /**
     * 게시글 HTML 요소 생성
     */
    createPostElement(post) {
        const item = document.createElement('div');
        item.className = 'item';
        item.setAttribute('data-item-id', post.post_id);
        item.setAttribute('data-product', post.title);
        item.style.cursor = 'pointer';

        item.innerHTML = `
            <div class="item-avatar"></div>
            <div class="item-content">
                <h3 class="item-title">${post.title}</h3>
                <p class="item-description">${post.pickup_location_text || ''}</p>
            </div>
            <div class="item-count">${post.current_participants}/${post.target_participants}</div>
        `;

        // 클릭 이벤트 추가
        Utils.on(item, 'click', () => {
            sessionStorage.setItem('selectedPostId', post.post_id);
            sessionStorage.setItem('selectedItemTitle', post.title);
            window.location.href = './matching.html';
        });

        return item;
    }

    async loadMoreItems() {
        if (this.isLoading) return;

        this.isLoading = true;

        try {
            // 백엔드 API로 더 많은 아이템 로드
            // 페이지네이션 또는 무한 스크롤 구현
            console.log('더 많은 아이템 로드...');

            // TODO: 페이지네이션 파라미터 추가
            await this.loadPosts();
        } catch (error) {
            console.error('Error loading more items:', error);
        } finally {
            this.isLoading = false;
        }
    }

    // 공개 API 메서드들
    getCurrentPage() {
        return this.components.navigation?.currentPage || 'home';
    }

    navigateToPage(page) {
        if (this.components.navigation) {
            this.components.navigation.navigateTo(page);
        }
    }

    search(query) {
        if (this.components.search) {
            this.components.search.performSearch(query);
        }
    }
}

// 전역 인스턴스 생성
window.app = new App();

// ES6 모듈을 지원하지 않는 환경에서도 사용 가능하도록
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}
