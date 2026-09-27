export const isVideo = (url: string): boolean => {
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'mpeg', 'mpg'];
  const parts = url.toLowerCase().split('.');
  const ext = parts.length > 1 ? parts.pop() : '';
  return videoExtensions.includes(ext || '');
}
