/**
 * 확인 다이얼로그 시스템
 * confirm()을 대체하는 사용자 친화적인 모달
 */

class ConfirmDialog {
    constructor() {
        this.overlay = null;
        this.init();
    }

    init() {
        // 오버레이 생성
        if (!document.querySelector('.confirm-overlay')) {
            this.overlay = document.createElement('div');
            this.overlay.className = 'confirm-overlay';
            this.overlay.innerHTML = `
                <div class="confirm-modal">
                    <div class="confirm-icon">⚠️</div>
                    <h3 class="confirm-title">확인</h3>
                    <p class="confirm-message"></p>
                    <div class="confirm-buttons">
                        <button class="btn-confirm-cancel">취소</button>
                        <button class="btn-confirm-ok">확인</button>
                    </div>
                </div>
            `;
            document.body.appendChild(this.overlay);
        } else {
            this.overlay = document.querySelector('.confirm-overlay');
        }
    }

    /**
     * 확인 다이얼로그 표시
     * @param {string} message - 확인 메시지
     * @param {string} title - 제목 (선택)
     * @returns {Promise<boolean>} 확인 여부 (true: 확인, false: 취소)
     */
    show(message, title = '확인') {
        return new Promise((resolve) => {
            const modal = this.overlay.querySelector('.confirm-modal');
            const titleElement = modal.querySelector('.confirm-title');
            const messageElement = modal.querySelector('.confirm-message');
            const cancelBtn = modal.querySelector('.btn-confirm-cancel');
            const okBtn = modal.querySelector('.btn-confirm-ok');

            // 메시지 설정
            titleElement.textContent = title;
            messageElement.textContent = message;

            // 이벤트 리스너 제거 (중복 방지)
            const newCancelBtn = cancelBtn.cloneNode(true);
            const newOkBtn = okBtn.cloneNode(true);
            cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
            okBtn.parentNode.replaceChild(newOkBtn, okBtn);

            // 취소 버튼
            newCancelBtn.addEventListener('click', () => {
                this.hide();
                resolve(false);
            });

            // 확인 버튼
            newOkBtn.addEventListener('click', () => {
                this.hide();
                resolve(true);
            });

            // 오버레이 클릭 시 닫기 (모달 외부 클릭)
            const handleOverlayClick = (e) => {
                if (e.target === this.overlay) {
                    this.hide();
                    resolve(false);
                }
            };
            this.overlay.addEventListener('click', handleOverlayClick);

            // ESC 키로 닫기
            const handleEsc = (e) => {
                if (e.key === 'Escape') {
                    this.hide();
                    resolve(false);
                    document.removeEventListener('keydown', handleEsc);
                }
            };
            document.addEventListener('keydown', handleEsc);

            // 모달 표시
            this.overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    /**
     * 모달 숨기기
     */
    hide() {
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// 전역 인스턴스 생성
window.confirmDialog = new ConfirmDialog();

// 편의 함수 (기존 confirm()과 유사한 사용법)
window.showConfirm = (message, title) => window.confirmDialog.show(message, title);

// CSS 스타일 추가 (동적으로 추가)
const style = document.createElement('style');
style.textContent = `
.confirm-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(4px);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.confirm-overlay.active {
    display: flex;
    opacity: 1;
}

.confirm-modal {
    background-color: #ffffff;
    border-radius: 20px;
    padding: 32px 24px 24px;
    max-width: 320px;
    width: 90%;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    animation: confirmSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    text-align: center;
}

@keyframes confirmSlideUp {
    from {
        opacity: 0;
        transform: translateY(30px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.confirm-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.confirm-title {
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 18px;
    font-weight: 600;
    color: #272727;
    margin-bottom: 12px;
}

.confirm-message {
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: #666666;
    line-height: 1.5;
    margin-bottom: 24px;
    white-space: pre-line;
}

.confirm-buttons {
    display: flex;
    gap: 8px;
}

.btn-confirm-cancel,
.btn-confirm-ok {
    flex: 1;
    padding: 12px 24px;
    border-radius: 12px;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
}

.btn-confirm-cancel {
    background-color: #f5f5f5;
    color: #272727;
}

.btn-confirm-cancel:hover {
    background-color: #e8e8e8;
}

.btn-confirm-ok {
    background-color: #297eff;
    color: #ffffff;
}

.btn-confirm-ok:hover {
    background-color: #1d6de6;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(41, 126, 255, 0.3);
}
`;
document.head.appendChild(style);

