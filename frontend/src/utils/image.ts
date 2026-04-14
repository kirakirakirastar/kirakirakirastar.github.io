/**
 * 智能图片压缩工具
 * 用于在上传前优化图片体积，平衡画质与性能
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: string;
  skipThreshold?: number; // 小于此字节数的文件不压缩 (单位: bytes)
}

const DEFAULT_OPTIONS: CompressOptions = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 0.85,
  mimeType: 'image/jpeg',
  skipThreshold: 500 * 1024, // 500KB 以下直接直传
};

/**
 * 压缩图片文件
 */
export async function compressImage(file: File, options: CompressOptions = {}): Promise<File | Blob> {
  const settings = { ...DEFAULT_OPTIONS, ...options };

  // 1. 如果文件小于阈值，直接返回原文件，保持 100% 原质
  if (file.size <= (settings.skipThreshold || 0)) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (ev) => {
      const img = new Image();
      img.src = ev.target?.result as string;
      img.onload = () => {
        // 计算缩放比例
        let width = img.width;
        let height = img.height;

        if (width > (settings.maxWidth || 2048) || height > (settings.maxHeight || 2048)) {
          const ratio = Math.min(
            (settings.maxWidth || 2048) / width,
            (settings.maxHeight || 2048) / height
          );
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // 使用 Canvas 进行绘制和采样
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context could not be created'));
          return;
        }

        // 清除背景并绘制（针对 PNG 转 JPEG 的情况设置白色背景）
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // 输出为 Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // 再次确认压缩后是否真的变小了
              if (blob.size < file.size) {
                resolve(blob);
              } else {
                resolve(file); // 如果压缩后反而变大（极少见），则返回原图
              }
            } else {
              reject(new Error('Canvas toBlob failed'));
            }
          },
          settings.mimeType,
          settings.quality
        );
      };
      img.onerror = () => reject(new Error('图片加载失败'));
    };
    reader.onerror = () => reject(new Error('读取文件失败'));
  });
}

/**
 * 将 Blob/File 转为 Base64 字符串 (用于兜底方案)
 */
export function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
