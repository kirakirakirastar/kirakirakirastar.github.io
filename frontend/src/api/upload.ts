import http from './http'

export const uploadApi = {
  image: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return http.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}
