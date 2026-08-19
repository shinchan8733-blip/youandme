import { useState, useEffect, useRef } from 'react'
import { addPhoto, observePhotos } from '../../services/photoService'

const MAX_DIMENSION = 1000
const JPEG_QUALITY = 0.7

export default function PhotosView() {
  const [photos, setPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [viewerPhoto, setViewerPhoto] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const unsub = observePhotos(setPhotos)
    return unsub
  }, [])

  const compressImage = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > height && width > MAX_DIMENSION) {
          height = Math.round(height * (MAX_DIMENSION / width))
          width = MAX_DIMENSION
        } else if (height > MAX_DIMENSION) {
          width = Math.round(width * (MAX_DIMENSION / height))
          height = MAX_DIMENSION
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.')
      return
    }
    setUploading(true)
    try {
      const compressed = await compressImage(file)
      await addPhoto(compressed)
    } catch (err) {
      alert('Could not upload that photo. Try a different one.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background px-4 pt-6 pb-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-xl font-bold">Our Photos</h2>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-accent rounded-full text-white text-sm shrink-0"
        >
          {uploading ? 'Uploading...' : '+ Add Photo'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {photos.length === 0 && (
        <p className="text-subtext text-sm text-center mt-10">No photos yet - add your first one 📷</p>
      )}

      <div className="grid grid-cols-3 gap-2">
        {photos.map(photo => (
          <button
            key={photo.id}
            onClick={() => setViewerPhoto(photo)}
            className="aspect-square rounded-lg overflow-hidden bg-surface"
          >
            <img src={photo.imageData} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {viewerPhoto && (
        <div
          onClick={() => setViewerPhoto(null)}
          className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4"
        >
          <img src={viewerPhoto.imageData} alt="" className="max-w-full max-h-[80vh] rounded-lg object-contain" />
          <p className="text-white text-sm mt-3">{viewerPhoto.addedBy}</p>
          <p className="text-subtext text-xs">{new Date(viewerPhoto.createdAt).toLocaleString()}</p>
        </div>
      )}
    </div>
  )
}