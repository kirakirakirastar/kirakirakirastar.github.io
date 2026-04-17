import { nextTick } from 'vue'

/**
 * Hook to stabilize Task List layout after DOM updates.
 * This is the 'Nuclear function' to catch and fix rendering desyncs in SPA.
 */
export const useTaskListStabilizer = () => {
  /**
   * Scans and fixes task list item layouts.
   * Ensures that markers and content are correctly placed in their grid columns.
   */
  const stabilize = async () => {
    await nextTick()
    
    const items = document.querySelectorAll('.task-list-item') as NodeListOf<HTMLElement>
    
    items.forEach(item => {
      // 1. Force Grid Layout (JS override for total stability)
      item.style.display = 'grid'
      item.style.gridTemplateColumns = '2rem 1fr'
      item.style.alignItems = 'start'
      item.style.position = 'relative'
      item.style.paddingLeft = '0'
      item.style.listStyleType = 'none'

      // 2. Identify children and correct their positioning
      const children = Array.from(item.children) as HTMLElement[]
      
      children.forEach(child => {
        const isInput = child.tagName === 'INPUT' && (child as HTMLInputElement).type === 'checkbox'
        const isLabel = child.tagName === 'LABEL'
        
        if (isInput || isLabel) {
          // Marker Column
          child.style.gridColumn = '1'
          child.style.display = 'flex'
          child.style.alignItems = 'center'
          child.style.justifyContent = 'center'
          child.style.width = '2rem'
          child.style.margin = '0'
        } else {
          // Content Column
          child.style.gridColumn = '2'
          child.style.width = '100%'
          child.style.display = 'block'
          child.style.margin = '0'
        }
      })
    })
  }

  return { stabilize }
}
