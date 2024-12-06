 document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const previewSection = document.getElementById('previewSection');
    const originalPreview = document.getElementById('originalPreview');
    const compressedPreview = document.getElementById('compressedPreview');
    const originalSize = document.getElementById('originalSize');
    const compressedSize = document.getElementById('compressedSize');
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const downloadBtn = document.getElementById('downloadBtn');

    let originalFile = null;
    let compressedFile = null;

    // 处理上传区域的点击事件
    uploadArea.addEventListener('click', () => {
        imageInput.click();
    });

    // 处理拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#007AFF';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#DEDEDE';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#DEDEDE';
        const file = e.dataTransfer.files[0];
        if (file && file.type.match('image.*')) {
            handleImageUpload(file);
        }
    });

    // 处理文件选择
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImageUpload(file);
        }
    });

    // 处理质量滑块变化
    qualitySlider.addEventListener('input', (e) => {
        // 实时更新显示的质量百分比
        qualityValue.textContent = `${e.target.value}%`;
        console.log('滑块值改变:', e.target.value); // 调试日志
    });

    qualitySlider.addEventListener('change', async (e) => {
        console.log('开始处理压缩...'); // 调试日志
        
        if (!originalFile) {
            console.log('没有原始文件！'); // 调试日志
            return;
        }

        const quality = parseInt(e.target.value) / 100;
        console.log('压缩质量:', quality); // 调试日志

        try {
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                quality: quality,
                initialQuality: quality // 添加这个选项
            };

            console.log('压缩配置:', options); // 调试日志
            console.log('原始文件大小:', originalFile.size); // 调试日志

            // 重新压缩图片
            const newCompressedFile = await imageCompression(originalFile, options);
            console.log('压缩后文件大小:', newCompressedFile.size); // 调试日志

            // 更新压缩后的预览图
            const compressedURL = URL.createObjectURL(newCompressedFile);
            compressedPreview.src = compressedURL;
            
            // 更新文件大小信息
            compressedSize.textContent = formatFileSize(newCompressedFile.size);
            
            // 保存压缩后的文件
            compressedFile = newCompressedFile;

            console.log('压缩完成！'); // 调试日志
        } catch (error) {
            console.error('压缩过程出错:', error);
            alert('压缩图片时发生错误，请重试');
        }
    });

    // 处理图片上传
    async function handleImageUpload(file) {
        console.log('开始处理上传的图片'); // 调试日志
        originalFile = file;
        console.log('原始文件已保存，大小:', file.size); // 调试日志
        
        // 显示原始图片预览
        originalPreview.src = URL.createObjectURL(file);
        originalSize.textContent = formatFileSize(file.size);
        
        // 使用初始质量值进行压缩
        const initialQuality = qualitySlider.value / 100;
        console.log('初始压缩质量:', initialQuality); // 调试日志
        
        // 压缩图片
        await compressImage(file, initialQuality);
        
        // 显示预览区域
        previewSection.style.display = 'block';
    }

   // 压缩图片
   async function compressImage(file, quality) {
    try {
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            quality: quality
        };

        compressedFile = await imageCompression(file, options);
        compressedPreview.src = URL.createObjectURL(compressedFile);
        compressedSize.textContent = formatFileSize(compressedFile.size);
    } catch (error) {
        console.error('压缩失败:', error);
    }
}

    // 处理下载
    downloadBtn.addEventListener('click', () => {
        if (compressedFile) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(compressedFile);
            link.download = `compressed_${originalFile.name}`;
            link.click();
        }
    });

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}); 