import { uploadImageToSupabase } from './supabaseData'

export const uploadApi = {
  image: (file: File, isPrivate: boolean = false, bucket: string = 'images') => uploadImageToSupabase(file, isPrivate, bucket),
}
