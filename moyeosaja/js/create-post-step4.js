/**
 * 공구글 작성하기 4단계 JavaScript
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
    // 사용자 정보 가져오기
    const userName = localStorage.getItem('nickname') || '사용자';

    // 미리보기 업데이트
    const authorName = document.querySelector('.author-name');
    const previewTitle = document.querySelector('.preview-title');
    const previewDescription = document.querySelector('.preview-description');
    const previewImage = document.querySelector('.preview-image img');

    if (authorName) {
        authorName.textContent = `${userName} >`;
    }

    // Step 1에서 'name' 키로 저장됨
    if (previewTitle && (savedData.name || savedData.title)) {
        previewTitle.textContent = savedData.name || savedData.title;
    }

    // Step 1에서 'content' 키로 저장됨
    if (previewDescription && (savedData.content || savedData.description)) {
        previewDescription.textContent = savedData.content || savedData.description;
    }

    if (previewImage && savedData.imageUrl) {
        previewImage.src = savedData.imageUrl;
        previewImage.alt = (savedData.name || savedData.title) || '공구 상품';
    }
}

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    updateStatusTime();

    // 이전 단계 데이터 복원
    const savedData = JSON.parse(sessionStorage.getItem('createPostFormData') || '{}');

    // 미리보기 업데이트
    updatePreview(savedData);

    // 작성하기 버튼
    const submitBtn = document.querySelector('.btn-submit');

    if (submitBtn) {
        submitBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            // 이전 단계 데이터 복원
            const savedData = JSON.parse(sessionStorage.getItem('createPostFormData') || '{}');

            const formData = {
                ...savedData,
                deadline: document.querySelector('#deadline')?.value || ''
            };

            console.log('공구글 작성 시작:', formData);

            // 버튼 로딩 상태
            submitBtn.disabled = true;
            submitBtn.textContent = '작성 중...';

            try {
                // 이미지 URL 가져오기 (sessionStorage에서)
                const imageUrl = formData.imageUrl || formData.image || null;

                console.log('이미지 URL 확인:', {
                    imageUrl,
                    hasImageUrl: !!imageUrl,
                    imageUrlLength: imageUrl ? imageUrl.length : 0,
                    isBase64: imageUrl ? imageUrl.startsWith('data:image') : false,
                    preview: imageUrl ? imageUrl.substring(0, 100) + '...' : null
                });

                // 백엔드 API 호출: 게시글 작성
                // 백엔드는 imageUrls 배열 형식으로 저장하므로 배열로 전송
                const postData = {
                    post_type: formData.category || 'group',
                    title: formData.name || formData.title || '소금빵',
                    description: formData.content || formData.description || '소금빵 실수로 너무 많이 사버렸는데 같이 나눠먹어요',
                    // 백엔드가 imageUrls 배열을 사용하므로 배열로 전송
                    imageUrls: imageUrl ? [imageUrl] : [], // base64 데이터 URL을 배열로 전송
                    // 하위 호환성을 위해 main_image_url도 함께 전송
                    main_image_url: imageUrl || null,
                    total_price: parseInt(formData.totalPrice) || 30000,
                    target_participants: parseInt(formData.people) || 4,
                    per_person_price: Math.floor((parseInt(formData.totalPrice) || 30000) / (parseInt(formData.people) || 4)),
                    pickup_datetime: formData.pickupDate || '2025-11-05T18:00:00',
                    end_date: formData.deadline || '2025-11-06T23:59:59',
                    pickup_location_text: formData.location || '한서대학교 학생회관 앞'
                };

                console.log('📤 백엔드 전송 데이터:', {
                    ...postData,
                    main_image_url: postData.main_image_url ? 
                        (postData.main_image_url.substring(0, 100) + '... (base64 데이터)') : 
                        null,
                    main_image_url_length: postData.main_image_url ? postData.main_image_url.length : 0,
                    imageUrls: postData.imageUrls ? 
                        (postData.imageUrls.length > 0 ? 
                            [`${postData.imageUrls[0].substring(0, 100)}... (base64, 길이: ${postData.imageUrls[0].length})`] : 
                            []) : 
                        []
                });

                // 실제 백엔드 API 호출
                const response = await window.apiService.createPost(postData);
                
                console.log('📥 백엔드 응답:', {
                    ...response,
                    main_image_url: response.main_image_url ? 
                        (response.main_image_url.substring(0, 100) + '...') : 
                        null,
                    imageUrls: response.imageUrls ? 
                        (response.imageUrls.length > 0 ? 
                            [`${response.imageUrls[0].substring(0, 100)}... (길이: ${response.imageUrls[0].length})`] : 
                            []) : 
                        [],
                    imageUrls_length: response.imageUrls ? response.imageUrls.length : 0
                });
                
                // 이미지가 저장되지 않은 경우 경고
                if (!response.imageUrls || response.imageUrls.length === 0) {
                    console.warn('⚠️ 백엔드 응답에 이미지가 없습니다. 전송한 이미지:', {
                        전송_imageUrls: postData.imageUrls,
                        전송_main_image_url: postData.main_image_url ? '있음' : '없음'
                    });
                }

                console.log('공구글 작성 성공:', response);

                // sessionStorage에 완료 데이터 저장 (완료 페이지에서 표시용)
                sessionStorage.setItem('postTitle', postData.title);
                sessionStorage.setItem('postPeople', postData.target_participants);
                sessionStorage.setItem('postLocation', postData.pickup_location_text);
                sessionStorage.setItem('postDeadline', postData.end_date);
                sessionStorage.setItem('createdPostId', response.post_id);

                // 완료 페이지로 이동
                window.location.href = './create-post-complete.html';
            } catch (error) {
                console.error('공구글 작성 실패:', error);

                // 403 에러 (인증 필요) 처리
                if (error.message && error.message.includes('403')) {
                    if (window.toast) {
                        window.toast.error('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
                    }

                    // 2초 후 로그인 페이지로 이동
                    setTimeout(() => {
                        window.location.href = './login.html';
                    }, 2000);
                    return;
                }

                if (window.toast) {
                    window.toast.error(error.message || '공구글 작성에 실패했습니다.');
                } else {
                    alert(error.message || '공구글 작성에 실패했습니다.');
                }

                // 버튼 원래 상태로
                submitBtn.disabled = false;
                submitBtn.textContent = '작성 완료하기';
            }
        });
    }
});

