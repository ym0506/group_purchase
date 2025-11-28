/**
 * 공구글 작성하기 JavaScript - 기본 구조
 */

// 상태바 시간 업데이트
function updateStatusTime() {
    const timeElement = document.querySelector('.status-time');
    if (timeElement) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeElement.textContent = `${hours}:${minutes}`;
    }
}

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    updateStatusTime();

    // 다음 버튼
    const nextBtn = document.querySelector('.btn-next');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            // 필수 입력 필드 가져오기
            const nameInput = document.querySelector('.form-row:nth-child(1) .form-input');
            const contentTextarea = document.querySelector('.form-textarea');

            const name = nameInput?.value.trim() || '';
            const content = contentTextarea?.value.trim() || '';

            // 유효성 검사
            if (!name) {
                if (window.toast) {
                    window.toast.error('공구명을 입력해주세요.');
                } else {
                    alert('공구명을 입력해주세요.');
                }
                nameInput?.focus();
                return;
            }

            if (!content) {
                if (window.toast) {
                    window.toast.error('공구 내용을 입력해주세요.');
                } else {
                    alert('공구 내용을 입력해주세요.');
                }
                contentTextarea?.focus();
                return;
            }

            // 기존 formData 가져오기 (이미지 URL 포함)
            const existingData = JSON.parse(sessionStorage.getItem('createPostFormData') || '{}');

            console.log('📝 [Step 1] Existing data:', existingData);

            // sessionStorage에 데이터 저장
            const formData = {
                ...existingData, // 기존 데이터 유지 (이미지 URL 등)
                name: name,
                title: name, // title도 저장
                quantity: document.querySelector('.form-row:nth-child(2) .form-input')?.value || '',
                content: content,
                description: content, // description도 저장
                people: document.querySelector('.people-input')?.value || '',
                price: document.querySelector('.price-input')?.value || ''
            };

            console.log('💾 [Step 1] Saving formData:', formData);
            sessionStorage.setItem('createPostFormData', JSON.stringify(formData));

            // 저장 확인
            const saved = sessionStorage.getItem('createPostFormData');
            console.log('✅ [Step 1] Saved to sessionStorage:', saved);

            // 다음 단계로 이동
            window.location.href = './create-post-step2.html';
        });
    }

    // 이미지 업로드 기능 초기화
    initImageUpload();

    // AI 요약 기능 초기화
    initAISummary();
});

/**
 * 이미지 업로드 기능 초기화
 */
function initImageUpload() {
    const uploadBox = document.querySelector('.image-upload-box');
    if (!uploadBox) return;

    // 숨겨진 파일 input 생성
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/jpeg,image/jpg,image/png,image/webp';
    fileInput.style.display = 'none';
    fileInput.id = 'imageFileInput';

    // 업로드 섹션에 추가
    const uploadSection = uploadBox.parentElement;
    if (uploadSection) {
        uploadSection.appendChild(fileInput);
    }

    // 업로드 박스 클릭 시 파일 선택 창 열기
    uploadBox.addEventListener('click', () => {
        fileInput.click();
    });

    // 파일 선택 시 처리
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImageUpload(file, uploadBox);
        }
    });

    // 드래그 앤 드롭 지원
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = '#297eff';
        uploadBox.style.backgroundColor = '#f5f8ff';
    });

    uploadBox.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = '#d9d9d9';
        uploadBox.style.backgroundColor = '#fafafa';
    });

    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = '#d9d9d9';
        uploadBox.style.backgroundColor = '#fafafa';

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageUpload(file, uploadBox);
        } else {
            if (window.toast) {
                window.toast.error('이미지 파일만 업로드 가능합니다.');
            } else {
                alert('이미지 파일만 업로드 가능합니다.');
            }
        }
    });
}

/**
 * 이미지 업로드 처리
 * @param {File} file - 업로드할 이미지 파일
 * @param {HTMLElement} uploadBox - 업로드 박스 요소
 */
async function handleImageUpload(file, uploadBox) {
    // 파일 크기 검증 (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        if (window.toast) {
            window.toast.error('이미지 크기는 5MB 이하여야 합니다.');
        } else {
            alert('이미지 크기는 5MB 이하여야 합니다.');
        }
        return;
    }

    // 파일 타입 검증
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        if (window.toast) {
            window.toast.error('JPG, PNG, WebP 형식만 지원합니다.');
        } else {
            alert('JPG, PNG, WebP 형식만 지원합니다.');
        }
        return;
    }

    try {
        // 로딩 상태 표시
        uploadBox.style.opacity = '0.6';
        uploadBox.style.pointerEvents = 'none';

        // 이미지 미리보기
        const imageUrl = await createImagePreview(file);

        // 업로드 박스 업데이트
        updateUploadBox(uploadBox, imageUrl);

        // 이미지 URL을 sessionStorage에 저장
        const formData = JSON.parse(sessionStorage.getItem('createPostFormData') || '{}');
        formData.imageUrl = imageUrl;
        formData.imageFile = file.name; // 파일명 저장
        
        // base64 이미지 크기 확인 (5MB 이상이면 경고)
        if (imageUrl.startsWith('data:image')) {
            const base64Length = imageUrl.length;
            const sizeInMB = (base64Length * 3) / 4 / 1024 / 1024; // base64는 약 33% 더 큼
            console.log('이미지 크기:', sizeInMB.toFixed(2), 'MB');
            
            if (sizeInMB > 5) {
                console.warn('⚠️ 이미지가 너무 큽니다. 백엔드에서 처리하지 못할 수 있습니다.');
                if (window.toast) {
                    window.toast.warning('이미지가 너무 큽니다. 더 작은 이미지를 사용해주세요.');
                }
            }
        }
        
        sessionStorage.setItem('createPostFormData', JSON.stringify(formData));

        if (window.toast) {
            window.toast.success('이미지가 업로드되었습니다.');
        }

        // 실제 프로덕션에서는 외부 스토리지(AWS S3, Cloudinary 등)에 업로드하여 URL 받아오기
        // await uploadImageToStorage(file);
    } catch (error) {
        console.error('이미지 업로드 오류:', error);
        if (window.toast) {
            window.toast.error('이미지 업로드에 실패했습니다.');
        } else {
            alert('이미지 업로드에 실패했습니다.');
        }
        uploadBox.style.opacity = '1';
        uploadBox.style.pointerEvents = 'auto';
    }
}

/**
 * 이미지 미리보기 생성
 * @param {File} file - 이미지 파일
 * @returns {Promise<string>} 이미지 URL (base64 또는 외부 URL)
 */
function createImagePreview(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            resolve(e.target.result); // base64 데이터 URL
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsDataURL(file);
    });
}

/**
 * 업로드 박스 업데이트 (이미지 미리보기 표시)
 * @param {HTMLElement} uploadBox - 업로드 박스 요소
 * @param {string} imageUrl - 이미지 URL
 */
function updateUploadBox(uploadBox, imageUrl) {
    // 기존 내용 제거
    uploadBox.innerHTML = '';

    // 이미지 미리보기 추가
    const img = document.createElement('img');
    img.src = imageUrl;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '20px';

    // 삭제 버튼 추가
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'image-delete-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.style.position = 'absolute';
    deleteBtn.style.top = '10px';
    deleteBtn.style.right = '10px';
    deleteBtn.style.width = '32px';
    deleteBtn.style.height = '32px';
    deleteBtn.style.borderRadius = '50%';
    deleteBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    deleteBtn.style.color = 'white';
    deleteBtn.style.border = 'none';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.style.fontSize = '24px';
    deleteBtn.style.display = 'flex';
    deleteBtn.style.alignItems = 'center';
    deleteBtn.style.justifyContent = 'center';
    deleteBtn.style.zIndex = '10';

    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetUploadBox(uploadBox);
    });

    uploadBox.style.position = 'relative';
    uploadBox.appendChild(img);
    uploadBox.appendChild(deleteBtn);
    uploadBox.style.opacity = '1';
    uploadBox.style.pointerEvents = 'auto';
}

/**
 * 업로드 박스 초기화
 * @param {HTMLElement} uploadBox - 업로드 박스 요소
 */
function resetUploadBox(uploadBox) {
    uploadBox.innerHTML = `
        <div class="upload-icon">+</div>
        <p class="upload-text">이미지 업로드</p>
    `;
    uploadBox.style.position = 'static';

    // 파일 input 초기화
    const fileInput = document.getElementById('imageFileInput');
    if (fileInput) {
        fileInput.value = '';
    }

    // sessionStorage에서 이미지 정보 제거
    const formData = JSON.parse(sessionStorage.getItem('createPostFormData') || '{}');
    delete formData.imageUrl;
    delete formData.imageFile;
    sessionStorage.setItem('createPostFormData', JSON.stringify(formData));
}

/**
 * AI 요약 기능 초기화
 */
function initAISummary() {
    const aiBtn = document.querySelector('.ai-summary-btn');
    const textarea = document.querySelector('.form-textarea');
    const toggleSwitch = document.querySelector('.toggle-switch');

    if (!aiBtn || !textarea) return;

    // AI 요약 버튼 클릭
    aiBtn.addEventListener('click', async () => {
        const content = textarea.value.trim();

        if (!content) {
            if (window.toast) {
                window.toast.error('먼저 공구 내용을 입력해주세요.');
            } else {
                alert('먼저 공구 내용을 입력해주세요.');
            }
            return;
        }

        await generateAISummary(content, textarea, aiBtn);
    });

    // 토글 스위치 클릭
    if (toggleSwitch) {
        toggleSwitch.addEventListener('click', () => {
            toggleSwitch.classList.toggle('active');
        });
    }
}

/**
 * AI 요약 생성
 * @param {string} content - 원본 내용
 * @param {HTMLElement} textarea - 텍스트 영역 요소
 * @param {HTMLElement} aiBtn - AI 버튼 요소
 */
async function generateAISummary(content, textarea, aiBtn) {
    // 로딩 상태
    const originalText = aiBtn.textContent;
    aiBtn.disabled = true;
    aiBtn.textContent = '요약 중...';
    aiBtn.style.opacity = '0.6';

    try {
        // 실제로는 백엔드 AI API 호출
        // const summary = await window.apiService.generateAISummary(content);

        // 현재는 간단한 클라이언트 사이드 요약 로직
        // (실제 프로덕션에서는 백엔드 AI API 사용)
        const summary = await generateSimpleSummary(content);

        // 토글이 켜져 있으면 자동 적용
        const toggleSwitch = document.querySelector('.toggle-switch');
        const autoApply = toggleSwitch && toggleSwitch.classList.contains('active');

        if (autoApply) {
            textarea.value = summary;
            if (window.toast) {
                window.toast.success('AI 요약이 적용되었습니다.');
            }
        } else {
            // 모달이나 알림으로 요약 결과 표시
            const shouldApply = confirm(`AI 요약 결과:\n\n${summary}\n\n이 내용을 적용하시겠습니까?`);
            if (shouldApply) {
                textarea.value = summary;
                if (window.toast) {
                    window.toast.success('AI 요약이 적용되었습니다.');
                }
            }
        }

        // 요약 결과를 sessionStorage에 저장
        const formData = JSON.parse(sessionStorage.getItem('createPostFormData') || '{}');
        formData.aiSummary = summary;
        formData.originalContent = content;
        sessionStorage.setItem('createPostFormData', JSON.stringify(formData));

    } catch (error) {
        console.error('AI 요약 오류:', error);
        if (window.toast) {
            window.toast.error('AI 요약 생성에 실패했습니다.');
        } else {
            alert('AI 요약 생성에 실패했습니다.');
        }
    } finally {
        // 버튼 원래 상태로
        aiBtn.disabled = false;
        aiBtn.textContent = originalText;
        aiBtn.style.opacity = '1';
    }
}

/**
 * AI 텍스트 정제 (백엔드 API 호출)
 * @param {string} content - 원본 내용
 * @returns {Promise<string>} 정제된 내용
 */
async function generateSimpleSummary(content) {
    try {
        // 백엔드 AI API 호출: POST /api/ai/refine
        const refinedContent = await window.apiService.refineContent(content);
        return refinedContent;
    } catch (error) {
        console.error('AI 정제 API 호출 실패:', error);
        // API 실패 시 원본 반환
        throw new Error('AI 정제에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
}
