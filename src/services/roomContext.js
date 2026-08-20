let currentRoomId = null

export const setCurrentRoomId = (roomId) => {
  currentRoomId = roomId
}

export const getCurrentRoomId = () => currentRoomId

export const roomPath = (subpath) => {
  if (!currentRoomId) {
    throw new Error('No room selected yet')
  }
  return `rooms/${currentRoomId}/${subpath}`
}