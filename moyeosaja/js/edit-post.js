/**
 * 공구글 수정하기 JavaScript
 */

// 상태바 시간 업데이트
function updateStatusTime() {
    const timeElement = document.querySelector('.status-time');
    if (timeElement) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeElement.textContent = `${hours}:${minutes}`;

        setInterval(() => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            timeElement.textContent = `${hours}:${minutes}`;
        }, 60000);
    }
}

// 전역 변수
let currentPostId = null;
let originalPostData = null;

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    updateStatusTime();

    // URL에서 postId 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    currentPostId = urlParams.get('postId');

    if (!currentPostId) {
        console.error('게시글 ID가 없습니다.');
        if (window.toast) {
            window.toast.error('게시글 ID가 없습니다.');
        } else {
            alert('게시글 ID가 없습니다.');
        }
        window.location.href = './my-posts.html';
        return;
    }

    // 게시글 데이터 로드
    loadPostData(currentPostId);

    // 이미지 업로드 기능 초기화
    initImageUpload();

    // 가격 계산 (1인당 가격 자동 계산)
    const totalPriceInput = document.getElementById('postTotalPrice');
    const targetParticipantsInput = document.getElementById('postTargetParticipants');
    const perPersonPriceElement = document.getElementById('perPersonPrice');

    function calculatePerPersonPrice() {
        const totalPrice = parseInt(totalPriceInput.value.replace(/,/g, '')) || 0;
        const targetParticipants = parseInt(targetParticipantsInput.value) || 1;
        const perPersonPrice = Math.floor(totalPrice / targetParticipants);
        perPersonPriceElement.textContent = `1인당 ${perPersonPrice.toLocaleString()}원`;
    }

    if (totalPriceInput && targetParticipantsInput) {
        totalPriceInput.addEventListener('input', calculatePerPersonPrice);
        targetParticipantsInput.addEventListener('input', calculatePerPersonPrice);
    }

    // 총 금액 입력 시 콤마 자동 추가
    if (totalPriceInput) {
        totalPriceInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/,/g, '');
            if (value) {
                e.target.value = parseInt(value).toLocaleString() + '원';
            }
        });
    }

    // 폼 제출 처리
    const form = document.getElementById('editPostForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleSubmit();
        });
    }

    // 취소 버튼
    const cancelBtn = document.getElementById('btnCancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', async () => {
            const confirmed = window.confirmDialog 
                ? await window.confirmDialog.show('수정을 취소하시겠습니까?\n변경사항이 저장되지 않습니다.', '수정 취소')
                : confirm('수정을 취소하시겠습니까?\n변경사항이 저장되지 않습니다.');
            if (confirmed) {
                window.location.href = './my-posts.html';
            }
        });
    }
});

/**
 * 게시글 데이터 로드
 * @param {string} postId - 게시글 ID
 */
async function loadPostData(postId) {
    try {
        console.log('게시글 데이터 로드 시작:', postId);

        // 로딩 상태 표시
        if (window.loadingManager) {
            window.loadingManager.show('게시글 정보를 불러오는 중...');
        }

        // 게시글 상세 정보 가져오기
        const postData = await window.apiService.getPostDetail(postId);
        console.log('게시글 데이터 로드 성공:', postData);

        originalPostData = postData;

        // 폼에 데이터 채우기
        populateForm(postData);

        if (window.loadingManager) {
            window.loadingManager.hide();
        }
    } catch (error) {
        console.error('게시글 데이터 로드 실패:', error);
        
        if (window.loadingManager) {
            window.loadingManager.hide();
        }

        if (window.toast) {
            window.toast.error(error.message || '게시글 정보를 불러올 수 없습니다.');
        } else {
            console.error('게시글 정보를 불러올 수 없습니다:', error);
        }

        // 에러 시 내 공구글 페이지로 이동
        setTimeout(() => {
            window.location.href = './my-posts.html';
        }, 2000);
    }
}

/**
 * 폼에 데이터 채우기
 * @param {Object} postData - 게시글 데이터
 */
function populateForm(postData) {
    // 제목
    const titleInput = document.getElementById('postTitle');
    if (titleInput) {
        titleInput.value = postData.title || '';
    }

    // 설명
    const descriptionInput = document.getElementById('postDescription');
    if (descriptionInput) {
        descriptionInput.value = postData.description || '';
    }

    // 목표 인원
    const targetParticipantsInput = document.getElementById('postTargetParticipants');
    if (targetParticipantsInput) {
        targetParticipantsInput.value = postData.target_participants || 4;
    }

    // 총 금액
    const totalPriceInput = document.getElementById('postTotalPrice');
    if (totalPriceInput) {
        totalPriceInput.value = (postData.total_price || 0).toLocaleString() + '원';
    }

    // 1인당 가격 계산
    const perPersonPriceElement = document.getElementById('perPersonPrice');
    if (perPersonPriceElement) {
        const perPersonPrice = postData.per_person_price || Math.floor((postData.total_price || 0) / (postData.target_participants || 1));
        perPersonPriceElement.textContent = `1인당 ${perPersonPrice.toLocaleString()}원`;
    }

    // 이미지
    const imageUrl = postData.main_image_url;
    if (imageUrl) {
        const uploadBox = document.getElementById('imageUploadBox');
        if (uploadBox) {
            updateUploadBox(uploadBox, imageUrl);
        }
    }

    // 수량 (백엔드에 수량 필드가 있으면 사용)
    const quantityInput = document.getElementById('postQuantity');
    if (quantityInput && postData.quantity) {
        quantityInput.value = postData.quantity;
    }
}

/**
 * 폼 제출 처리
 */
async function handleSubmit() {
    const submitBtn = document.getElementById('btnSubmit');
    if (!submitBtn) return;

    // 폼 유효성 검사
    if (!validateForm()) {
        return;
    }

    // 버튼 로딩 상태
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '수정 중...';

    try {
        // 폼 데이터 수집
        const formData = collectFormData();

        console.log('게시글 수정 시작:', formData);

        // 백엔드 API 호출: 게시글 수정
        const response = await window.apiService.updatePost(currentPostId, formData);

        console.log('게시글 수정 성공:', response);

        // 성공 메시지
        if (window.toast) {
            window.toast.success('게시글이 수정되었습니다.');
        } else {
            alert('게시글이 수정되었습니다.');
        }

        // 내 공구글 페이지로 이동
        setTimeout(() => {
            window.location.href = './my-posts.html';
        }, 1000);
    } catch (error) {
        console.error('게시글 수정 실패:', error);
        
        if (window.toast) {
            window.toast.error(error.message || '게시글 수정에 실패했습니다.');
        } else {
            alert(error.message || '게시글 수정에 실패했습니다.');
        }

        // 버튼 원래 상태로
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

/**
 * 폼 유효성 검사
 * @returns {boolean} 유효성 검사 통과 여부
 */
function validateForm() {
    const title = document.getElementById('postTitle')?.value.trim();
    const description = document.getElementById('postDescription')?.value.trim();
    const targetParticipants = document.getElementById('postTargetParticipants')?.value;
    const totalPrice = document.getElementById('postTotalPrice')?.value.replace(/,/g, '').replace('원', '');

    if (!title) {
        if (window.toast) {
            window.toast.error('공구 명을 입력해주세요.');
        }
        return false;
    }

    if (!description) {
        if (window.toast) {
            window.toast.error('상세 설명을 입력해주세요.');
        }
        return false;
    }

    if (!targetParticipants || parseInt(targetParticipants) < 2) {
        if (window.toast) {
            window.toast.error('목표 인원은 2명 이상이어야 합니다.');
        }
        return false;
    }

    if (!totalPrice || parseInt(totalPrice) <= 0) {
        if (window.toast) {
            window.toast.error('총 금액을 입력해주세요.');
        }
        return false;
    }

    return true;
}

/**
 * 폼 데이터 수집
 * @returns {Object} 폼 데이터
 */
function collectFormData() {
    const title = document.getElementById('postTitle')?.value.trim();
    const description = document.getElementById('postDescription')?.value.trim();
    const targetParticipants = parseInt(document.getElementById('postTargetParticipants')?.value) || 4;
    const totalPrice = parseInt(document.getElementById('postTotalPrice')?.value.replace(/,/g, '').replace('원', '')) || 0;
    const perPersonPrice = Math.floor(totalPrice / targetParticipants);

    // 이미지 URL 가져오기 (수정된 이미지 또는 기존 이미지)
    const uploadBox = document.getElementById('imageUploadBox');
    let imageUrl = originalPostData?.main_image_url || null;
    
    if (uploadBox) {
        const img = uploadBox.querySelector('img');
        if (img && img.src) {
            imageUrl = img.src;
        }
    }

    return {
        title: title,
        description: description,
        target_participants: targetParticipants,
        total_price: totalPrice,
        per_person_price: perPersonPrice,
        main_image_url: imageUrl || originalPostData?.main_image_url || null
        // 필요한 경우 다른 필드도 추가
        // pickup_datetime: ...,
        // end_date: ...,
        // pickup_location_text: ...
    };
}

/**
 * 이미지 업로드 기능 초기화 (create-post.js와 동일)
 */
function initImageUpload() {
    const uploadBox = document.getElementById('imageUploadBox');
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

        if (window.toast) {
            window.toast.success('이미지가 업로드되었습니다.');
        }
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

    // 기존 이미지로 복원
    if (originalPostData?.main_image_url) {
        updateUploadBox(uploadBox, originalPostData.main_image_url);
    }
}

