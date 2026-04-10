import http from './http'

export const hobbiesApi = {
  list: (params?: any) => http.get('/hobbies', { params }),
  create: (data: any) => http.post('/hobbies', data),
  get: (id: number) => http.get(`/hobbies/${id}`),
  update: (id: number, data: any) => http.put(`/hobbies/${id}`, data),
  delete: (id: number) => http.delete(`/hobbies/${id}`),
  stats: () => http.get('/hobbies/stats'),
}
