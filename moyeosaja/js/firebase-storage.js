/**
 * Firebase Storage 이미지 업로드 서비스
 */

// Firebase 초기화 (Firebase 프로젝트 설정 필요)
let firebaseStorage = null;
let storageRef = null;

/**
 * Firebase Storage 초기화
 * Firebase 프로젝트 설정이 필요합니다.
 * 
 * Firebase Console에서 다음 정보를 가져와야 합니다:
 * 1. Firebase Console (https://console.firebase.google.com) 접속
 * 2. 프로젝트 설정 > 일반 탭
 * 3. "내 앱" 섹션에서 웹 앱 추가 또는 기존 앱의 설정 정보 확인
 * 4. Firebase 프로젝트 설정 정보 가져오기
 */
function initFirebaseStorage() {
    // Firebase SDK가 로드되었는지 확인
    if (typeof firebase === 'undefined') {
        console.warn('⚠️ Firebase SDK가 로드되지 않았습니다. Firebase Storage를 사용할 수 없습니다.');
        return false;
    }

    try {
        // Firebase 프로젝트 설정
        // Firebase CLI로 확인한 정보:
        // - Project Number: 296899354710
        // - App ID: 1:296899354710:web:fcf0d584b294b8a9505bf7
        
        // apiKey는 Firebase Console에서만 가져올 수 있으므로
        // localStorage에서 설정 정보를 확인하거나 기본값 사용
        let firebaseConfig = null;
        
        // localStorage에서 Firebase 설정 정보 확인
        if (typeof window !== 'undefined' && window.localStorage) {
            const storedConfig = localStorage.getItem('firebase_config');
            if (storedConfig) {
                try {
                    firebaseConfig = JSON.parse(storedConfig);
                    console.log('💡 localStorage에서 Firebase 설정 로드');
                } catch (e) {
                    console.warn('⚠️ localStorage의 Firebase 설정 파싱 실패');
                }
            }
        }
        
        // 설정이 없으면 기본값 사용 (apiKey는 Firebase Console에서 가져와야 함)
        if (!firebaseConfig) {
            firebaseConfig = {
                apiKey: localStorage.getItem('firebase_api_key') || "AIzaSyDummyKey", // localStorage 또는 Firebase Console에서 가져오기
                authDomain: "login-baa7f.firebaseapp.com",
                projectId: "login-baa7f",
                storageBucket: "login-baa7f.appspot.com",
                messagingSenderId: "296899354710", // Project Number
                appId: "1:296899354710:web:fcf0d584b294b8a9505bf7"
            };
            
            // apiKey가 더미 키인 경우 경고
            if (firebaseConfig.apiKey === "AIzaSyDummyKey") {
                console.warn('⚠️ Firebase apiKey가 설정되지 않았습니다.');
                console.warn('💡 Firebase Console에서 apiKey를 가져와서 설정하세요:');
                console.warn('   1. https://console.firebase.google.com/project/login-baa7f/settings/general 접속');
                console.warn('   2. "내 앱" 섹션에서 웹 앱의 설정 정보 확인');
                console.warn('   3. apiKey를 복사하여 브라우저 콘솔에서 다음 명령어 실행:');
                console.warn('      localStorage.setItem("firebase_api_key", "실제_API_KEY")');
                return false;
            }
        }

        // 이미 초기화되어 있는지 확인
        let app;
        try {
            app = firebase.app();
        } catch (e) {
            // 앱이 없으면 초기화
            app = firebase.initializeApp(firebaseConfig);
        }

        firebaseStorage = firebase.storage();
        storageRef = firebaseStorage.ref();
        
        console.log('✅ Firebase Storage 초기화 완료');
        return true;
    } catch (error) {
        console.error('❌ Firebase Storage 초기화 실패:', error);
        console.warn('💡 Firebase Storage를 사용하려면 Firebase 프로젝트 설정이 필요합니다.');
        return false;
    }
}

/**
 * 이미지를 Firebase Storage에 업로드
 * @param {File} file - 업로드할 이미지 파일
 * @param {string} folder - 저장할 폴더 경로 (예: 'posts', 'profiles')
 * @returns {Promise<string>} - 업로드된 이미지의 다운로드 URL
 */
async function uploadImageToFirebase(file, folder = 'posts') {
    // Firebase Storage가 초기화되지 않았으면 초기화 시도
    if (!firebaseStorage) {
        const initialized = initFirebaseStorage();
        if (!initialized) {
            throw new Error('Firebase Storage를 초기화할 수 없습니다.');
        }
    }

    try {
        // 고유한 파일명 생성 (타임스탬프 + 랜덤 문자열)
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const fileName = `${folder}/${timestamp}_${randomString}.${fileExtension}`;

        console.log('📤 Firebase Storage 업로드 시작:', {
            fileName,
            fileSize: (file.size / 1024 / 1024).toFixed(2) + 'MB',
            fileType: file.type
        });

        // Firebase Storage에 업로드
        const fileRef = storageRef.child(fileName);
        const uploadTask = fileRef.put(file);

        // 업로드 진행률 모니터링
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`📊 업로드 진행률: ${progress.toFixed(1)}%`);
            },
            (error) => {
                console.error('❌ Firebase Storage 업로드 실패:', error);
                throw error;
            }
        );

        // 업로드 완료 후 다운로드 URL 가져오기
        const snapshot = await uploadTask;
        const downloadURL = await snapshot.ref.getDownloadURL();

        console.log('✅ Firebase Storage 업로드 성공:', {
            fileName,
            downloadURL: downloadURL.substring(0, 100) + '...'
        });

        return downloadURL;
    } catch (error) {
        console.error('❌ Firebase Storage 업로드 오류:', error);
        throw error;
    }
}

/**
 * 이미지 업로드 (Firebase Storage 우선, 실패 시 base64 fallback)
 * @param {File} file - 업로드할 이미지 파일
 * @param {string} folder - 저장할 폴더 경로
 * @returns {Promise<string>} - 이미지 URL (Firebase Storage URL 또는 base64)
 */
async function uploadImageWithFallback(file, folder = 'posts') {
    try {
        // Firebase Storage에 업로드 시도
        const firebaseUrl = await uploadImageToFirebase(file, folder);
        return firebaseUrl;
    } catch (error) {
        console.warn('⚠️ Firebase Storage 업로드 실패, base64 사용:', error);
        
        // Firebase Storage 업로드 실패 시 base64로 fallback
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve(e.target.result); // base64 데이터 URL
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

// 전역으로 사용할 수 있도록 export
if (typeof window !== 'undefined') {
    window.firebaseStorageService = {
        init: initFirebaseStorage,
        uploadImage: uploadImageToFirebase,
        uploadImageWithFallback: uploadImageWithFallback
    };
}

