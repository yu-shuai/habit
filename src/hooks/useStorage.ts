import { useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useStorage = () => {
  /**
   * 上传文件到指定路径并返回公共 URL
   */
  const uploadFile = useCallback(async (
    bucket: string,
    path: string,
    file: File | Blob
  ): Promise<string | null> => {
    try {
      // 1. 执行上传
      // 如果路径已存在，upsert: true 会覆盖它（适用于头像更新）
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          upsert: true,
          contentType: file.type
        });

      if (error) {
        console.error('Storage upload error:', error.message);
        return null;
      }

      // 2. 获取公共 URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (err) {
      console.error('Unexpected storage error:', err);
      return null;
    }
  }, []);

  /**
   * 上传头像的便捷方法
   */
  const uploadAvatar = useCallback(async (userId: string, file: File): Promise<string | null> => {
    // 头像路径固定，每次上传都会覆盖旧的
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar.${fileExt}`;
    return uploadFile('habit', filePath, file);
  }, [uploadFile]);

  /**
   * 上传打卡图片的便捷方法
   */
  const uploadPostImage = useCallback(async (userId: string, file: File | Blob): Promise<string | null> => {
    // 打卡图片使用时间戳，避免冲突
    // 兼容 Blob 类型（Blob 没有 name 属性）
    const fileName = (file as File).name || 'image.png';
    const fileExt = fileName.split('.').pop() || 'png';
    const filePath = `${userId}/posts/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    return uploadFile('habit', filePath, file);
  }, [uploadFile]);


  return { uploadFile, uploadAvatar, uploadPostImage };
};
