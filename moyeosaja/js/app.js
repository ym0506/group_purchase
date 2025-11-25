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
        // 페이지네이션 상태 관리
        this.currentPage = 1;
        this.pageLimit = 20; // 페이지당 게시글 수
        this.hasMore = true; // 더 불러올 게시글이 있는지
        this.isLoading = false; // 로딩 중인지
        this.total = 0; // 전체 게시글 수
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

            // 로그인 상태 확인 및 UI 업데이트
            this.checkLoginState();

            // 게시글 목록 로드 (백엔드 API 연동)
            this.loadPosts();

            console.log('App initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }

    checkLoginState() {
        const authLinks = document.querySelector('.auth-links');
        const greeting = document.querySelector('.greeting');
        const accessToken = localStorage.getItem('access_token');
        const nickname = localStorage.getItem('nickname') || localStorage.getItem('userNickname') || '사용자';

        if (accessToken) {
            // 로그인 상태
            if (authLinks) authLinks.style.display = 'none';
            if (greeting) {
                greeting.style.display = 'block';
                greeting.textContent = `${nickname}님, 안녕하세요!`;
            }
        } else {
            // 비로그인 상태
            if (authLinks) authLinks.style.display = 'flex';
            if (greeting) greeting.style.display = 'none';
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

        // 아이템 클릭 이벤트는 동적으로 생성된 게시글에만 적용됨 (createPostElement 함수에서 처리)
        // 하드코딩된 HTML 아이템은 백엔드 데이터 로드 후 제거됨

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
        // 스크롤이 하단 200px 이내에 도달하면 다음 페이지 로드
        if (scrollPosition + windowHeight >= documentHeight - 200) {
            this.loadMoreItems();
        }
    }

    /**
     * 게시글 목록 로드 (백엔드 API 연동)
     * @param {boolean} reset - true면 첫 페이지부터 다시 로드
     */
    async loadPosts(reset = false) {
        if (this.isLoading) {
            console.log('이미 로딩 중입니다.');
            return;
        }

        // 첫 페이지 로드 시 초기화
        if (reset) {
            this.currentPage = 1;
            this.hasMore = true;
            const itemsContainer = Utils.$('.items-list');
            if (itemsContainer) {
                itemsContainer.innerHTML = ''; // 기존 게시글 제거
            }
        }

        // 더 불러올 게시글이 없으면 중단
        if (!this.hasMore && !reset) {
            console.log('더 이상 불러올 게시글이 없습니다.');
            return;
        }

        this.isLoading = true;

        try {
            // 현재 위치 정보 가져오기 (localStorage에서)
            const latitude = localStorage.getItem('latitude') || 37.5665; // 기본값: 서울
            const longitude = localStorage.getItem('longitude') || 126.9780;
            const distance = 10; // 기본 거리: 10km

            console.log(`게시글 목록 로드 시도... (페이지: ${this.currentPage})`);

            // 백엔드 API 호출 (페이지네이션 파라미터 포함)
            const response = await window.apiService.getPosts({
                type: null, // 전체 타입
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                distance,
                page: this.currentPage,
                limit: this.pageLimit
            });

            console.log('게시글 목록 로드 성공:', response);

            // 페이지네이션 상태 업데이트
            if (response.total !== undefined) {
                this.total = response.total;
            }

            // UI 업데이트 (실제 게시글 렌더링)
            if (response.posts && response.posts.length > 0) {
                this.renderPosts(response.posts, !reset); // reset이 false면 append

                // 더 불러올 게시글이 있는지 확인
                const loadedCount = this.currentPage * this.pageLimit;
                this.hasMore = loadedCount < (this.total || response.posts.length * this.currentPage + 1);

                if (this.hasMore) {
                    this.currentPage += 1;
                } else {
                    console.log('모든 게시글을 불러왔습니다.');
                    // 로딩 완료 표시 제거
                    this.hideLoadingIndicator();
                }
            } else {
                // 응답이 없으면 더 이상 불러올 게시글이 없음
                this.hasMore = false;
                this.hideLoadingIndicator();
            }
        } catch (error) {
            console.error('게시글 목록 로드 실패:', error);
            this.hasMore = false;
            this.hideLoadingIndicator();
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * 게시글 렌더링
     * @param {Array} posts - 게시글 배열
     * @param {boolean} append - true면 기존 목록에 추가, false면 교체
     */
    renderPosts(posts, append = false) {
        const itemsContainer = Utils.$('.items-list');
        if (!itemsContainer) return;

        if (!append) {
            // 전체 교체
            itemsContainer.innerHTML = '';
        }

        posts.forEach(post => {
            const itemElement = this.createPostElement(post);
            itemsContainer.appendChild(itemElement);
        });

        // 로딩 인디케이터 추가/업데이트
        this.updateLoadingIndicator();
    }

    /**
     * 게시글 HTML 요소 생성
     */
    createPostElement(post) {
        const item = document.createElement('div');
        item.className = 'item';
        const postId = post.post_id || post.id;
        item.setAttribute('data-post-id', postId);
        item.setAttribute('data-product', post.title);
        item.style.cursor = 'pointer';
        item.style.position = 'relative'; // For absolute positioning of wishlist button

        const currentCount = post.current_participants || 0;
        const targetCount = post.target_participants || 0;

        // 게시글 이미지 우선, 없으면 작성자 아바타 사용
        const displayImage = post.main_image_url || post.author?.profile_image_url || '';

        // 배지 표시 로직
        let badgeHtml = '';
        if (post.is_new) {
            badgeHtml = '<div class="badge badge-new">NEW</div>';
        } else if (post.is_urgent) {
            badgeHtml = '<div class="badge badge-urgent">마감임박</div>';
        }

        // 관심 여부 확인 (초기값은 false, 나중에 API로 확인)
        const isWishlisted = post.is_wishlisted || false;
        const heartIcon = isWishlisted ? '❤️' : '🤍';

        item.innerHTML = `
            <div class="item-avatar" style="${displayImage ? `background-image: url('${displayImage}'); background-size: cover; background-position: center;` : ''}"></div>
            <div class="item-content">
                <div class="item-header">
                    <div class="item-title">${post.title || '제목 없음'}</div>
                    ${badgeHtml}
                </div>
                <div class="item-description">${post.pickup_location_text || post.description || ''}</div>
            </div>
            <div class="item-count">${currentCount}/${targetCount}</div>
            <button class="btn-wishlist" data-post-id="${postId}" title="관심있어요" style="position: absolute; top: 8px; right: 8px; background: rgba(255,255,255,0.9); border: none; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); z-index: 10; transition: transform 0.2s;">
                ${heartIcon}
            </button>
        `;

        // 관심있어요 버튼 이벤트
        const wishlistBtn = item.querySelector('.btn-wishlist');
        if (wishlistBtn) {
            Utils.on(wishlistBtn, 'click', async (e) => {
                e.stopPropagation(); // 게시글 클릭 이벤트 방지
                await this.toggleWishlist(postId, wishlistBtn);
            });

            // 호버 효과
            Utils.on(wishlistBtn, 'mouseenter', () => {
                wishlistBtn.style.transform = 'scale(1.1)';
            });
            Utils.on(wishlistBtn, 'mouseleave', () => {
                wishlistBtn.style.transform = 'scale(1)';
            });
        }

        // 클릭 이벤트 추가
        Utils.on(item, 'click', () => {
            console.log('게시글 클릭:', postId, post.title);
            sessionStorage.setItem('selectedPostId', postId);
            sessionStorage.setItem('selectedItemTitle', post.title);
            window.location.href = './matching.html';
        });

        return item;
    }

    /**
     * 관심목록 토글
     */
    async toggleWishlist(postId, buttonElement) {
        try {
            // 로그인 확인
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                if (window.toast) {
                    window.toast.warning('로그인이 필요한 서비스입니다.');
                } else {
                    alert('로그인이 필요한 서비스입니다.');
                }
                window.location.href = './login.html';
                return;
            }

            // 현재 상태 확인
            const currentIcon = buttonElement.textContent.trim();
            const isCurrentlyWishlisted = currentIcon === '❤️';

            // 버튼 비활성화 (중복 클릭 방지)
            buttonElement.disabled = true;

            if (isCurrentlyWishlisted) {
                // 관심목록에서 제거
                await window.apiService.removeFromWishlist(postId);
                buttonElement.textContent = '🤍';
                if (window.toast) {
                    window.toast.success('관심목록에서 제거되었습니다.');
                }
            } else {
                // 관심목록에 추가
                await window.apiService.addToWishlist(postId);
                buttonElement.textContent = '❤️';
                if (window.toast) {
                    window.toast.success('관심목록에 추가되었습니다.');
                }

                // 애니메이션 효과
                buttonElement.style.transform = 'scale(1.3)';
                setTimeout(() => {
                    buttonElement.style.transform = 'scale(1)';
                }, 200);
            }
        } catch (error) {
            console.error('관심목록 토글 실패:', error);
            if (window.toast) {
                window.toast.error('관심목록 처리에 실패했습니다.');
            } else {
                alert('관심목록 처리에 실패했습니다.');
            }
        } finally {
            // 버튼 다시 활성화
            if (buttonElement) {
                buttonElement.disabled = false;
            }
        }
    }

    /**
     * 더 많은 아이템 로드 (다음 페이지)
     */
    async loadMoreItems() {
        if (this.isLoading || !this.hasMore) {
            return;
        }

        console.log('더 많은 아이템 로드...');
        await this.loadPosts(false); // append 모드로 다음 페이지 로드
    }

    /**
     * 로딩 인디케이터 업데이트
     */
    updateLoadingIndicator() {
        const itemsContainer = Utils.$('.items-list');
        if (!itemsContainer) return;

        // 기존 로딩 인디케이터 제거
        const existingIndicator = itemsContainer.querySelector('.loading-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        // 더 불러올 게시글이 있으면 로딩 인디케이터 추가
        if (this.hasMore && !this.isLoading) {
            const indicator = document.createElement('div');
            indicator.className = 'loading-indicator';
            indicator.innerHTML = '<div class="loading-spinner"></div><p>더 많은 게시글을 불러오는 중...</p>';
            indicator.style.textAlign = 'center';
            indicator.style.padding = '20px';
            indicator.style.color = '#9e9e9e';
            indicator.style.fontSize = '12px';
            itemsContainer.appendChild(indicator);
        }
    }

    /**
     * 로딩 인디케이터 숨기기
     */
    hideLoadingIndicator() {
        const itemsContainer = Utils.$('.items-list');
        if (!itemsContainer) return;

        const indicator = itemsContainer.querySelector('.loading-indicator');
        if (indicator) {
            indicator.remove();
        }

        // 마지막 페이지 표시
        if (!this.hasMore && this.currentPage > 1) {
            const endMessage = document.createElement('div');
            endMessage.className = 'end-message';
            endMessage.innerHTML = '<p>모든 게시글을 불러왔습니다.</p>';
            endMessage.style.textAlign = 'center';
            endMessage.style.padding = '20px';
            endMessage.style.color = '#9e9e9e';
            endMessage.style.fontSize = '12px';
            itemsContainer.appendChild(endMessage);
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
