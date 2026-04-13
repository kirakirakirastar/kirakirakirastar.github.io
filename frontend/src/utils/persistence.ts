import type { PiniaPluginContext } from 'pinia'

/**
 * A simple Pinia plugin for state persistence in localStorage.
 * Usage: add { persist: true } or { persist: { key: 'custom-key' } } to your store definition.
 */
export function persistencePlugin({ store, options }: PiniaPluginContext) {
  if (options.persist) {
    const key = typeof options.persist === 'object' && options.persist.key 
      ? options.persist.key 
      : `persist-${store.$id}`
    
    // 1. Hydrate from localStorage
    const savedState = localStorage.getItem(key)
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        
        // Check for expiration (Optional: 24h)
        if (parsed._timestamp && Date.now() - parsed._timestamp > 24 * 60 * 60 * 1000) {
          localStorage.removeItem(key)
        } else {
          store.$patch(parsed)
        }
      } catch (e) {
        console.error(`Failed to hydrate store ${store.$id}:`, e)
      }
    }

    // 2. Subscribe to changes and save
    store.$subscribe((_mutation, state) => {
      try {
        const toSave = { ...state, _timestamp: Date.now() }
        localStorage.setItem(key, JSON.stringify(toSave))
      } catch (e) {
        console.error(`Failed to persist store ${store.$id}:`, e)
      }
    })
  }
}

// Extend Pinia's DefineStoreOptions to support the persist option
declare module 'pinia' {
  export interface DefineStoreOptionsBase<S, Store> {
    persist?: boolean | { key?: string }
  }
}
