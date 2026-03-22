import { PlayCircle } from "lucide-react"

// Extracts YouTube video ID from various URL formats (youtu.be, youtube.com/watch, youtube.com/embed)
const getYouTubeId = (url) => {
  if (!url) return null
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

// Renders a YouTube iframe embed or HTML5 video player based on the URL type
const VideoPlayer = ({ url, title }) => {
  if (!url) {
    return (
      <div className="w-full aspect-video bg-[#DBEAFE] rounded-lg flex flex-col items-center justify-center">
        <PlayCircle className="w-12 h-12 text-[#2563EB] mb-2" />
        <p className="text-sm text-[#6B7280]">No video URL provided</p>
      </div>
    )
  }

  const youtubeId = getYouTubeId(url)

  if (youtubeId) {
    return (
      <div className="w-full aspect-video rounded-lg overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title={title || "Video"}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
      <video
        src={url}
        title={title || "Video"}
        className="w-full h-full"
        controls
      />
    </div>
  )
}

export default VideoPlayer
