/** Extract YouTube video id from common URL shapes (watch, short, embed, youtu.be). */
export function getYouTubeId(url: string): string | null {
  const patterns = [
    /[?&]v=([^"&?/\s]{11})/i,
    /youtu\.be\/([^"&?/\s]{11})/i,
    /youtube\.com\/embed\/([^"&?/\s]{11})/i,
    /youtube\.com\/shorts\/([^"&?/\s]{11})/i,
    /youtube\.com\/v\/([^"&?/\s]{11})/i,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}
