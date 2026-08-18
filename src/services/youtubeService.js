const API_KEY = 'AIzaSyAT7fV0WnZlFm8TqGUoiYWXBFxfFUCjFvY'
const BASE_URL = 'https://www.googleapis.com/youtube/v3'

export const searchSongs = async (query) => {
  const res = await fetch(
    `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=20&key=${API_KEY}`
  )
  const data = await res.json()
  if (!data.items) return []
  return data.items
    .filter(item => item.id?.videoId)
    .map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.medium?.url ?? '',
    }))
}

export const getRecommendations = async (songIds) => {
  if (!songIds.length) return []
  const seedId = songIds[Math.floor(Math.random() * songIds.length)]
  const res = await fetch(
    `${BASE_URL}/search?part=snippet&relatedToVideoId=${seedId}&type=video&maxResults=15&key=${API_KEY}`
  )
  const data = await res.json()
  if (!data.items) return []
  return data.items
    .filter(item => item.id?.videoId)
    .map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.medium?.url ?? '',
    }))
}