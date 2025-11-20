/**
 * 공구글 작성하기 3단계 JavaScript
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

    // 이전 단계 데이터 복원
    const savedData = JSON.parse(sessionStorage.getItem('createPostFormData') || '{}');

    // 카테고리 버튼
    const categoryButtons = document.querySelectorAll('.btn-category');
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
        });
    });

    // 태그 추가
    const addTagBtn = document.querySelector('.btn-add-tag');
    const tagInput = document.querySelector('#tagInput');
    const tagList = document.querySelector('.tag-list');

    if (addTagBtn && tagInput && tagList) {
        addTagBtn.addEventListener('click', () => {
            const tagText = tagInput.value.trim();
            if (tagText) {
                const tagItem = document.createElement('div');
                tagItem.className = 'tag-item';
                tagItem.innerHTML = `
                    ${tagText}
                    <button type="button" class="tag-remove">×</button>
                `;
                tagList.appendChild(tagItem);
                tagInput.value = '';

                // 태그 삭제 이벤트
                tagItem.querySelector('.tag-remove').addEventListener('click', () => {
                    tagItem.remove();
                });
            }
        });
    }

    // 태그 삭제
    document.querySelectorAll('.tag-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.tag-item').remove();
        });
    });

    // 다음 버튼
    const nextBtn = document.querySelector('.btn-next');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const selectedCategories = Array.from(document.querySelectorAll('.btn-category.active'))
                .map(btn => btn.dataset.category);

            const tags = Array.from(document.querySelectorAll('.tag-item'))
                .map(item => item.textContent.replace('×', '').trim());

            const formData = {
                ...savedData,
                categories: selectedCategories,
                tags: tags
            };
            sessionStorage.setItem('createPostFormData', JSON.stringify(formData));
            window.location.href = './create-post-step4.html';
        });
    }
});

