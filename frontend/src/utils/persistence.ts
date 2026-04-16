import type { PiniaPluginContext } from 'pinia'

/**
 * A simple Pinia plugin for state persistence in localStorage.
 * 
 * Usage:
 *   persist: true                          — persist entire store state
 *   persist: { key: 'my-key' }             — persist with custom localStorage key
 *   persist: { paths: ['a', 'b'] }         — persist only the listed state fields
 *   persist: { key: 'k', paths: ['a'] }    — combine both options
 */
export function persistencePlugin({ store, options }: PiniaPluginContext) {
  if (options.persist) {
    const config = typeof options.persist === 'object' ? options.persist : {}
    const key = config.key ?? `persist-${store.$id}`
    const paths: string[] | null = config.paths ?? null

    // Helper: pick only specified paths from state object
    const pickState = (state: Record<string, any>) => {
      if (!paths) return { ...state }
      return Object.fromEntries(paths.map(p => [p, state[p]]))
    }

    // 1. Hydrate from localStorage
    const savedState = localStorage.getItem(key)
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)

        // Optional: discard state older than 24h
        if (parsed._timestamp && Date.now() - parsed._timestamp > 24 * 60 * 60 * 1000) {
          localStorage.removeItem(key)
        } else {
          // Only patch the fields we care about (respects paths filter)
          const { _timestamp, ...data } = parsed
          store.$patch(paths ? Object.fromEntries(paths.filter(p => p in data).map(p => [p, data[p]])) : data)
        }
      } catch (e) {
        console.error(`Failed to hydrate store ${store.$id}:`, e)
      }
    }

    // 2. Subscribe to changes and save
    store.$subscribe((_mutation, state) => {
      try {
        const toSave = { ...pickState(state as Record<string, any>), _timestamp: Date.now() }
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
    persist?: boolean | {
      /** Custom localStorage key (default: "persist-{storeId}") */
      key?: string
      /** If set, only these top-level state fields will be persisted */
      paths?: string[]
    }
  }
}
