import http from './http'

export const journalsApi = {
  list: (params?: any) => http.get('/journals', { params }),
  create: (data: any) => http.post('/journals', data),
  get: (id: number) => http.get(`/journals/${id}`),
  update: (id: number, data: any) => http.put(`/journals/${id}`, data),
  delete: (id: number) => http.delete(`/journals/${id}`),
  archives: () => http.get('/journals/archives'),
}
