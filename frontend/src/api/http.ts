import axios from 'axios'

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
export const apiOrigin = apiBaseUrl.replace(/\/api\/v1\/?$/, '')

export const resolveAssetUrl = (url: string) => {
  if (!url) return ''
  if (/^https?:\/\//.test(url)) return url
  return `${apiOrigin}${url.startsWith('/') ? url : `/${url}`}`
}

const http = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
})

http.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 0) {
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res.data
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default http
