// YouTube embed section — lazy-loaded iframe for product video

interface VideoSectionProps {
  videoUrl?: string | null;
}

export default function VideoSection({ videoUrl }: VideoSectionProps) {
  if (!videoUrl) return null;

  // Extract YouTube video ID from various URL formats
  const getYouTubeId = (url: string): string | null => {
    const match = url.match(
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
    );
    return match ? match[1] : null;
  };

  const videoId = getYouTubeId(videoUrl);
  if (!videoId) return null;

  return (
    <section id="video" className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-green-900 text-center mb-8">
          Quy Trình Sản Xuất
        </h2>
        <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?loading=lazy`}
            title="Video giới thiệu Long Nhãn Hưng Yên"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
      </div>
    </section>
  );
}
