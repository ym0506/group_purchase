/**
 * 폼 UX 개선 스크립트
 * 실시간 검증, 피드백, 애니메이션 등을 제공합니다.
 */

class FormEnhancements {
    constructor() {
        this.init();
    }

    init() {
        // 모든 입력 필드에 실시간 검증 추가
        this.enhanceInputFields();
        this.enhanceFormSubmissions();
    }

    /**
     * 입력 필드 개선
     */
    enhanceInputFields() {
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="tel"], textarea');
        
        inputs.forEach(input => {
            // 포커스 애니메이션
            input.addEventListener('focus', (e) => {
                const group = e.target.closest('.input-group, .form-input-group');
                if (group) {
                    group.classList.add('focused');
                }
            });

            input.addEventListener('blur', (e) => {
                const group = e.target.closest('.input-group, .form-input-group');
                if (group) {
                    group.classList.remove('focused');
                    this.validateField(e.target);
                }
            });

            // 실시간 검증 (입력 중)
            input.addEventListener('input', (e) => {
                this.validateField(e.target, true);
            });
        });
    }

    /**
     * 필드 검증
     */
    validateField(field, isRealTime = false) {
        const value = field.value.trim();
        const type = field.type;
        const group = field.closest('.input-group, .form-input-group');
        
        if (!group) return;

        // 기존 에러 제거
        group.classList.remove('error', 'success');
        const existingError = group.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // 빈 값 체크 (실시간 검증에서는 스킵)
        if (!isRealTime && field.hasAttribute('required') && !value) {
            this.showError(group, field, '필수 입력 항목입니다.');
            return false;
        }

        // 이메일 검증
        if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.showError(group, field, '올바른 이메일 형식이 아닙니다.');
                return false;
            }
        }

        // 비밀번호 검증
        if (type === 'password' && value) {
            if (value.length < 8) {
                this.showError(group, field, '비밀번호는 8자 이상이어야 합니다.');
                return false;
            }
        }

        // 전화번호 검증
        if (type === 'tel' && value) {
            const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
            if (!phoneRegex.test(value.replace(/-/g, ''))) {
                this.showError(group, field, '올바른 전화번호 형식이 아닙니다.');
                return false;
            }
        }

        // 성공 상태 표시
        if (value && !group.classList.contains('error')) {
            group.classList.add('success');
        }

        return true;
    }

    /**
     * 에러 표시
     */
    showError(group, field, message) {
        group.classList.add('error');
        group.classList.remove('success');
        
        // 에러 메시지 추가
        const errorMsg = document.createElement('span');
        errorMsg.className = 'error-message';
        errorMsg.textContent = message;
        group.appendChild(errorMsg);

        // 필드에 에러 클래스 추가
        field.classList.add('error');
        
        // 애니메이션 효과
        field.style.animation = 'none';
        setTimeout(() => {
            field.style.animation = 'shake 0.3s ease';
        }, 10);
    }

    /**
     * 폼 제출 개선
     */
    enhanceFormSubmissions() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                const inputs = form.querySelectorAll('input[required], textarea[required]');
                let isValid = true;

                inputs.forEach(input => {
                    if (!this.validateField(input)) {
                        isValid = false;
                    }
                });

                if (!isValid) {
                    e.preventDefault();
                    // 첫 번째 에러 필드로 스크롤
                    const firstError = form.querySelector('.error input, .error textarea');
                    if (firstError) {
                        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        firstError.focus();
                    }
                }
            });
        });
    }
}

// DOM 로드 시 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new FormEnhancements();
    });
} else {
    new FormEnhancements();
}

