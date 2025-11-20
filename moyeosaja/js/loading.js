/**
 * 로딩 상태 관리 시스템
 * API 호출 및 비동기 작업 시 로딩 인디케이터를 표시합니다.
 */

class LoadingManager {
    constructor() {
        this.overlay = null;
        this.spinner = null;
        this.init();
    }

    init() {
        // 로딩 오버레이 생성
        if (!document.querySelector('.loading-overlay')) {
            this.overlay = document.createElement('div');
            this.overlay.className = 'loading-overlay';
            this.overlay.setAttribute('role', 'status');
            this.overlay.setAttribute('aria-live', 'polite');
            this.overlay.setAttribute('aria-label', '로딩 중');
            this.overlay.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner-circle"></div>
                    <p class="loading-text">로딩 중...</p>
                </div>
            `;
            document.body.appendChild(this.overlay);
        } else {
            this.overlay = document.querySelector('.loading-overlay');
        }
    }

    /**
     * 로딩 표시
     * @param {string} message - 로딩 메시지 (선택)
     */
    show(message = '로딩 중...') {
        const textElement = this.overlay.querySelector('.loading-text');
        if (textElement) {
            textElement.textContent = message;
        }
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * 로딩 숨기기
     */
    hide() {
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * 특정 요소에 로딩 상태 추가
     * @param {HTMLElement|string} element - 대상 요소
     * @param {boolean} show - 표시 여부
     */
    setElementLoading(element, show = true) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            if (show) {
                element.classList.add('loading');
                element.setAttribute('aria-busy', 'true');
            } else {
                element.classList.remove('loading');
                element.removeAttribute('aria-busy');
            }
        }
    }
}

// 전역 인스턴스 생성
window.loading = new LoadingManager();

// 편의 함수
window.showLoading = (message) => window.loading.show(message);
window.hideLoading = () => window.loading.hide();

