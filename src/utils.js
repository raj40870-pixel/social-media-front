export const getValidImageUrl = (url) => {
  if (!url) return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  
  // If it's a Google Drive link, convert to direct image link using lh3.googleusercontent.com
  // This is the most reliable way to bypass Google Drive's HTML redirect pages for images
  const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }
  
  const driveIdMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
  if (url.includes('drive.google.com') && driveIdMatch && driveIdMatch[1]) {
     return `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}`;
  }

  // If it's an Imgur link (but not a direct image link), try to fix it
  if (url.includes('imgur.com') && !url.includes('i.imgur.com')) {
    const imgurMatch = url.match(/imgur\.com\/([a-zA-Z0-9]+)$/);
    if (imgurMatch && imgurMatch[1]) {
      return `https://i.imgur.com/${imgurMatch[1]}.jpg`;
    }
  }

  return url;
};
