import http from './http'

export const notesApi = {
  list: (params?: any) => http.get('/notes', { params }),
  create: (data: any) => http.post('/notes', data),
  get: (id: number) => http.get(`/notes/${id}`),
  update: (id: number, data: any) => http.put(`/notes/${id}`, data),
  delete: (id: number) => http.delete(`/notes/${id}`),
  archives: () => http.get('/notes/archives'),
  tags: () => http.get('/notes/tags'),
}
