/**
 * 공구글 작성하기 2단계 JavaScript
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

// 미리보기 업데이트 함수
function updatePreview(savedData) {
    console.log('🔍 [Step 2] Preview Update - savedData:', savedData);

    // 사용자 정보 가져오기
    const userName = localStorage.getItem('nickname') || '사용자';
    console.log('👤 [Step 2] User name:', userName);

    // 미리보기 업데이트
    const authorName = document.querySelector('.author-name');
    const previewTitle = document.querySelector('.preview-title');
    const previewDescription = document.querySelector('.preview-description');
    const previewImage = document.querySelector('.preview-image img');

    if (authorName) {
        authorName.textContent = `${userName} >`;
        console.log('✅ [Step 2] Author name updated:', authorName.textContent);
    }

    // Step 1에서 'name' 키로 저장됨
    if (previewTitle && (savedData.name || savedData.title)) {
        previewTitle.textContent = savedData.name || savedData.title;
        console.log('✅ [Step 2] Title updated:', previewTitle.textContent);
    } else {
        console.warn('⚠️ [Step 2] No title found in savedData');
    }

    // Step 1에서 'content' 키로 저장됨
    if (previewDescription && (savedData.content || savedData.description)) {
        previewDescription.textContent = savedData.content || savedData.description;
        console.log('✅ [Step 2] Description updated:', previewDescription.textContent);
    } else {
        console.warn('⚠️ [Step 2] No description found in savedData');
    }

    if (previewImage) {
        if (savedData.imageUrl) {
            previewImage.src = savedData.imageUrl;
            previewImage.alt = (savedData.name || savedData.title) || '공구 상품';
            previewImage.style.display = 'block';
            previewImage.style.width = '100%';
            previewImage.style.height = '100%';
            previewImage.style.objectFit = 'cover';
            console.log('✅ [Step 2] Image updated:', savedData.imageUrl.substring(0, 50) + '...');
            console.log('✅ [Step 2] Image element:', previewImage);
            console.log('✅ [Step 2] Image src length:', savedData.imageUrl.length);
        } else {
            console.warn('⚠️ [Step 2] No image URL found in savedData');
            previewImage.style.display = 'none';
        }
    } else {
        console.error('❌ [Step 2] Preview image element not found!');
        console.log('Available elements:', document.querySelectorAll('.preview-image'));
    }
}

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    updateStatusTime();

    // 이전 단계 데이터 복원
    const savedData = JSON.parse(sessionStorage.getItem('createPostFormData') || '{}');

    // 미리보기 업데이트
    updatePreview(savedData);

    // 다음 버튼
    const nextBtn = document.querySelector('.btn-next');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const formData = {
                ...savedData,
                meetDate: document.querySelector('#meeting-date')?.value || '',
                meetTime: document.querySelector('#meeting-time')?.value || '',
                meetLocation: document.querySelector('#meeting-location')?.value || ''
            };
            sessionStorage.setItem('createPostFormData', JSON.stringify(formData));
            window.location.href = './create-post-step3.html';
        });
    }
});

