<template>
  <div class="flex flex-col gap-2">
    <div 
      class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-3 sm:p-3.5 rounded-2xl border border-slate-100 dark:border-white/5 transition-all duration-300 group/item relative shadow-sm cursor-default"
      :class="[
        getPriorityColor(todo.priority),
        todo.status === 'completed' ? 'bg-emerald-500/5 opacity-75' : 
        todo.status === 'failed' ? 'bg-red-500/5 opacity-75' : 
        'bg-white dark:bg-slate-800/60 hover:border-primary/20 hover:bg-white dark:hover:bg-slate-700/50',
        todo.is_bundle ? 'ring-1 ring-primary/20 ring-offset-2 dark:ring-offset-slate-900 shadow-lg' : ''
      ]"
    >
      <!-- Bundle Expand/Collapse -->
      <button 
        v-if="todo.is_bundle && todo.children?.length"
        @click="isExpanded = !isExpanded"
        class="absolute -left-2 top-1/2 -translate-y-1/2 w-5 h-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center shadow-md z-[20] hover:scale-110 transition-transform"
      >
        <svg 
          class="w-3 h-3 text-primary transition-transform duration-300"
          :class="isExpanded ? 'rotate-180' : 'rotate-90'"
          fill="currentColor" viewBox="0 0 20 20"
        >
          <path d="M10 12a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 9.586l3.293-3.293a1 1 0 111.414 1.414l-4 4A1 1 0 0110 12z" />
        </svg>
      </button>

    <!-- Priority Color Bar (Interactive) -->
    <div 
      @click="handleCyclePriority"
      class="absolute left-0 top-0 bottom-0 w-1.5 cursor-pointer hover:w-2.5 transition-all group/prio z-10 rounded-l-2xl"
      :title="'点击切换优先级: ' + todo.priority"
    >
      <div class="h-full w-full opacity-0 group-hover/prio:opacity-20 bg-slate-400"></div>
    </div>

    <!-- Component Row 1: Checkbox + Name -->
    <div class="flex items-center gap-3 w-full sm:flex-1 min-w-0">
      <button 
        @click="handleToggleStatus"
        class="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-colors shadow-sm"
        :class="{
          'bg-primary border-2 border-primary text-white': todo.status === 'completed',
          'bg-red-100 dark:bg-red-900/50 border-2 border-red-400 text-red-500': todo.status === 'failed',
          'border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-primary': todo.status === 'pending'
        }"
      >
        <svg v-if="todo.status === 'completed'" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
        </svg>
        <svg v-else-if="todo.status === 'failed'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      
      <div class="flex-1 min-w-0 flex flex-col justify-center">
        <template v-if="!isEditing">
          <span 
            @dblclick="startEditing"
            class="text-sm font-medium transition-all truncate block cursor-text select-none"
            :class="{ 
              'text-slate-700 dark:text-slate-200': todo.status === 'pending',
              'text-slate-400 line-through decoration-slate-400': todo.status === 'completed',
              'text-red-700 dark:text-red-400 line-through decoration-red-400/50': todo.status === 'failed'
            }"
          >
            <span class="flex items-center gap-1.5 flex-wrap">
              <svg v-if="todo.is_private" class="w-3.5 h-3.5 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
              {{ todo.text }}
              
              <!-- Series Stats Badge (Dual Mode: Rate + Streak) -->
              <span 
                v-if="seriesStats" 
                class="flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-tight shrink-0 transition-all duration-500"
                :class="[
                  seriesStats.isPerfect 
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' 
                    : 'bg-red-100 text-red-600 dark:bg-red-900/30',
                  seriesStats.streak >= 7 ? 'ring-1 ring-emerald-500 animate-pulse' : ''
                ]"
                :title="`历史达成: ${seriesStats.rate}% | 当前连击: ${seriesStats.streak}天`"
              >
                <span>{{ seriesStats.rate }}%</span>
                <span v-if="seriesStats.streak > 0" class="opacity-30">·</span>
                <span v-if="seriesStats.streak > 0" class="flex items-center gap-0.5">
                  <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.334-.398-1.817a1 1 0 00-1.514-.857 4.028 4.028 0 00-1.159 1.44c-.123.242-.231.503-.316.773a6.996 6.996 0 00-.104 2.101 5.996 5.996 0 001.623 3.31c.8.835 1.602 1.134 2.751 1.134 1.554 0 2.302-1 2.302-2.302 0-1.085-.353-2.084-.353-3.133 0-1.272.21-2.287.898-3.676a10.377 10.377 0 00.577-1.485 1.13 1.13 0 00.073-.499c0-.179-.033-.341-.09-.488z" clip-rule="evenodd"></path></svg>
                  {{ seriesStats.streak }}
                </span>
              </span>

              <!-- Settlement Indicator -->
              <div 
                v-if="seriesStats?.isFinished" 
                @click.stop="emit('show-report', { todo, stats: seriesStats })"
                class="bg-amber-100 dark:bg-amber-900/30 text-amber-600 px-1.5 py-0.5 rounded text-[10px] uppercase font-black ml-1 cursor-pointer hover:bg-amber-200 transition-colors"
                title="点击查看总结报告"
              >
                已结算
              </div>
            </span>
          </span>
          <div class="flex items-center gap-2 mt-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
            <span class="text-[9px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
              创建: {{ formatDateSimple(todo.created_at) }}
            </span>
            <span v-if="todo.updated_at && todo.updated_at !== todo.created_at" class="text-[9px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
              更新: {{ formatDateSimple(todo.updated_at) }}
            </span>
          </div>
        </template>
        <div v-else class="py-1 flex items-center gap-2">
           <input 
            v-model="tempText"
            @keyup.enter="saveEdit"
            @keyup.esc="cancelEdit"
            type="text"
            class="flex-1 min-w-0 bg-white dark:bg-slate-800 border border-primary/30 dark:border-primary/20 rounded-lg px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary shadow-sm"
            autofocus
          />
          <select 
            v-model="tempPriority"
            class="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-xs outline-none cursor-pointer text-slate-600 dark:text-slate-300 w-24"
          >
            <option value="high">🔴 紧急</option>
            <option value="medium">🟡 普通</option>
            <option value="low">🔵 轻松</option>
          </select>
        </div>
        </div>
      </div>

      <!-- Bundle Progress Bar (Sub-progress) -->
      <div v-if="todo.is_bundle && seriesStats?.sub_progress" class="w-full mt-auto pt-3 border-t border-slate-100/50 dark:border-white/5">
         <div class="flex items-center justify-between mb-1.5 px-1">
            <span class="text-[9px] font-black text-slate-400 uppercase tracking-tighter">关卡总体进度: {{ seriesStats.sub_progress.completed }}/{{ seriesStats.sub_progress.total }}</span>
            <span class="text-[9px] font-bold text-primary">{{ seriesStats.sub_progress.percent }}%</span>
         </div>
         <div class="w-full h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div 
              class="h-full bg-primary transition-all duration-700 ease-out shadow-[0_0_8px_rgba(99,102,241,0.5)]"
              :style="{ width: `${seriesStats.sub_progress.percent}%` }"
            ></div>
         </div>
      </div>
    </div>

    <!-- Component Row 2: Dates + Actions -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-1 sm:mt-0 pl-9 sm:pl-0 sm:ml-auto">
      <!-- Dates Section -->
      <div class="flex-1 sm:flex-initial">
         <template v-if="!isEditing">
           <div @dblclick="startEditing" v-if="todo.start_date || todo.due_date" class="text-[10px] sm:text-[11px] tracking-wide flex items-center gap-1 cursor-pointer whitespace-nowrap p-1 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg transition-colors" :class="getDateClass(todo)">
              <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"></path></svg>
              <span class="truncate">{{ formatDateRange(todo.start_date, todo.due_date) }}</span>
           </div>
         </template>
         <div v-else class="flex flex-col gap-2 p-1.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-white/5">
            <div class="grid grid-cols-[Auto_1fr] items-center gap-x-2 gap-y-1.5">
               <span class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">本次任务</span>
               <div class="flex items-center gap-1">
                 <input v-model="tempStartDate" type="date" class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-lg px-1.5 py-1 text-[10px] outline-none [color-scheme:dark] w-full" />
                 <span class="text-slate-300">→</span>
                 <input v-model="tempDueDate" type="date" class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-lg px-1.5 py-1 text-[10px] outline-none [color-scheme:dark] w-full" />
               </div>
               
               <template v-if="tempRecurrence !== 'none'">
                 <span class="text-[9px] font-black text-primary uppercase tracking-wider">周期截止</span>
                 <div class="flex items-center gap-2">
                   <input v-model="tempRecurrenceUntil" type="date" class="flex-1 bg-white dark:bg-slate-800 border-2 border-primary/20 dark:border-primary/20 rounded-xl px-2 py-1 text-[11px] font-bold outline-none [color-scheme:dark] shadow-sm focus:border-primary" />
                   <button @click="tempRecurrenceUntil = null" class="px-2 py-1 bg-slate-100 dark:bg-slate-700/50 text-[10px] text-slate-400 hover:text-red-500 rounded-lg transition-colors">不设限</button>
                 </div>
               </template>
            </div>
         </div>
      </div>

      <!-- Refined Action Group (Unified Stack) -->
      <div class="flex sm:flex-col items-center gap-1 ml-auto shrink-0 self-center sm:self-stretch justify-center pr-1 sm:pr-0">
        <div class="flex sm:flex-col items-center gap-1 p-1 bg-slate-100/50 dark:bg-slate-900/40 rounded-xl border border-slate-200/50 dark:border-white/5">
          <!-- Recurrence -->
          <div class="relative" ref="containerRef">
            <button 
              @click.stop="showRecurrenceMenu = !showRecurrenceMenu"
              class="p-2 transition-all rounded-lg hover:bg-white dark:hover:bg-slate-700 shadow-sm sm:shadow-none"
              :class="[
                (isEditing ? tempRecurrence : todo.recurrence) !== 'none' 
                  ? 'text-primary bg-white dark:bg-slate-700' 
                  : 'text-slate-400 hover:text-primary'
              ]"
              :title="'重复设置: ' + recurrenceLabel(isEditing ? tempRecurrence : (todo.recurrence || 'none'))"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </button>

            <!-- Recurrence Popover (Teleported to avoid clipping) -->
            <Teleport to="body">
              <Transition name="fade-scale">
                <div v-if="showRecurrenceMenu" class="fixed inset-0 z-[9998] bg-slate-900/40 backdrop-blur-sm sm:hidden" @click="showRecurrenceMenu = false"></div>
              </Transition>
              <Transition name="fade-scale">
                <div 
                  v-if="showRecurrenceMenu" 
                  ref="popoverRef"
                  class="fixed w-[300px] sm:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-[9999] p-4 flex flex-col gap-4"
                  :style="popoverStyle"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <div class="w-1.5 h-4 bg-primary rounded-full"></div>
                      <span class="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">设置循环方式</span>
                    </div>
                    <button @click="showRecurrenceMenu = false" class="text-slate-300 hover:text-slate-600 dark:hover:text-white transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>

                  <!-- Frequency Selection -->
                  <div class="grid grid-cols-2 gap-2">
                    <button 
                      v-for="opt in ['none', 'daily', 'weekly', 'monthly']" 
                      :key="opt"
                      @click="isEditing ? (tempRecurrence = opt) : handleCycleRecurrenceSpecific(opt)"
                      class="px-3 py-2.5 rounded-xl text-[11px] font-black border transition-all flex items-center justify-center gap-2"
                      :class="(isEditing ? tempRecurrence : todo.recurrence) === opt ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-white/5 text-slate-500 hover:border-primary/40'"
                    >
                      <span v-if="(isEditing ? tempRecurrence : todo.recurrence) === opt" class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                      {{ recurrenceLabel(opt) }}
                    </button>
                  </div>

                  <!-- End Condition Info -->
                  <div v-if="(isEditing ? tempRecurrence : todo.recurrence) !== 'none'" class="flex flex-col gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
                     <div class="flex items-center justify-between">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">系列终止于</span>
                        <button 
                          v-if="isEditing && tempDueDate"
                          @click="tempRecurrenceUntil = tempDueDate"
                          class="text-[9px] text-primary font-bold hover:underline"
                        >
                          同步截止日
                        </button>
                     </div>
                     
                     <div v-if="isEditing" class="flex items-center gap-2">
                       <input 
                         type="date" 
                         v-model="tempRecurrenceUntil" 
                         class="flex-1 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-[11px] font-bold outline-none focus:border-primary dark:[color-scheme:dark]"
                       />
                       <button @click="tempRecurrenceUntil = null" class="w-8 h-8 flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl hover:bg-red-100 transition-colors">
                         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
                       </button>
                     </div>
                     <div v-else class="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                        <span class="opacity-60 font-medium">系统将在 </span>
                        <span class="text-primary">{{ todo.recurrence_until || todo.due_date || '未设置' }}</span>
                        <span class="opacity-60 font-medium"> 之后停止循环</span>
                     </div>
                  </div>
                </div>
              </Transition>
            </Teleport>
          </div>

          <div class="w-full sm:w-4 h-px sm:h-px bg-slate-200 dark:bg-white/10 mx-0.5 sm:my-0.5"></div>

          <!-- Edit / Save Actions -->
          <template v-if="isEditing">
            <button @click="saveEdit" class="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all" title="保存">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
            </button>
            <button @click="cancelEdit" class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="取消">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </template>

          <template v-else>
            <button v-if="todo.status === 'pending'" @click="startEditing" class="p-2 text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all" title="编辑">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </button>
            
            <button @click="emit('remove')" class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="删除">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </template>
        </div>

        <!-- Postpone / Fail / Retry (Only in non-edit) -->
        <div v-if="!isEditing" class="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
           <div v-if="todo.status === 'pending'" class="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden p-0.5">
              <button @click="emit('postpone', 1)" class="px-1.5 py-1 text-[9px] font-black text-slate-500 hover:text-primary hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all">1D</button>
              <button @click="emit('postpone', 3)" class="px-1.5 py-1 text-[9px] font-black text-slate-500 hover:text-primary hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all border-l border-slate-200 dark:border-white/5">3D</button>
              <button @click="emit('postpone', 7)" class="px-1.5 py-1 text-[9px] font-black text-slate-500 hover:text-primary hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all border-l border-slate-200 dark:border-white/5">1W</button>
            </div>
            <button v-if="todo.status === 'failed'" @click="emit('retry')" class="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all" title="重试">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            </button>
            <button v-if="todo.status === 'pending'" @click="emit('fail')" class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="失败">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
      </div>
    </div>

    <!-- Recursive Children Display -->
    <transition name="fade-slide">
      <div v-if="isExpanded && todo.children?.length" class="ml-4 pl-4 border-l-2 border-slate-100 dark:border-white/5 flex flex-col gap-2 mt-1">
        <TodoItem 
          v-for="child in todo.children" 
          :key="child.id"
          :todo="child"
          :is-editing="false"
          v-bind="$attrs"
        />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import dayjs from 'dayjs'
import { onClickOutside } from '@vueuse/core'
import type { Todo } from '@/api/types'
import { useGadgetStore } from '@/stores/gadgets'

const props = defineProps<{
  todo: any // Cast to any to handle children & stats
  isEditing: boolean
}>()

const gadgetStore = useGadgetStore()
const seriesStats = computed(() => gadgetStore.getSeriesStats(props.todo))
const isExpanded = ref(true)

const emit = defineEmits(['toggle-status', 'cycle-priority', 'cycle-recurrence', 'postpone', 'fail', 'retry', 'remove', 'start-edit', 'cancel-edit', 'save-edit', 'show-report'])

const tempText = ref(props.todo.text)
const tempPriority = ref(props.todo.priority || 'medium')
const tempStartDate = ref(props.todo.start_date || '')
const tempDueDate = ref(props.todo.due_date || '')
const tempRecurrence = ref(props.todo.recurrence || 'none')
const tempRecurrenceUntil = ref<string | null>(props.todo.recurrence_until || null)
const showRecurrenceMenu = ref(false)

const containerRef = ref<HTMLElement | null>(null)
const popoverRef = ref<HTMLElement | null>(null)
const popoverStyle = ref<Record<string, string>>({ top: '0px', left: '0px' })

// @ts-ignore
onClickOutside(containerRef, () => showRecurrenceMenu.value = false, { ignore: [popoverRef] })

watch(showRecurrenceMenu, async (val) => {
  if (val && containerRef.value) {
    await nextTick()
    const rect = containerRef.value.getBoundingClientRect()
    const isSmallScreen = window.innerWidth < 640
    
    if (isSmallScreen) {
      // Center on mobile
      popoverStyle.value = {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        position: 'fixed'
      }
    } else {
      // Position above button on desktop
      popoverStyle.value = {
        top: `${rect.top - 12}px`,
        left: `${rect.right}px`,
        transform: 'translate(-100%, -100%)',
        position: 'fixed'
      }
    }
  }
})

// Sync internal state if updated externally (like via priority bar click)
watch(() => props.todo.priority, (newPrio) => {
  if (props.isEditing) {
    tempPriority.value = newPrio || 'medium'
  }
})

const startEditing = () => {
  tempText.value = props.todo.text
  tempPriority.value = props.todo.priority || 'medium'
  tempStartDate.value = props.todo.start_date || ''
  tempDueDate.value = props.todo.due_date || ''
  tempRecurrence.value = props.todo.recurrence || 'none'
  tempRecurrenceUntil.value = props.todo.recurrence_until || null
  showRecurrenceMenu.value = false
  emit('start-edit', props.todo.id)
}

const cancelEdit = () => {
  emit('cancel-edit')
}

const saveEdit = () => {
  if (!tempText.value.trim()) return
  emit('save-edit', {
    text: tempText.value.trim(),
    priority: tempPriority.value,
    start_date: tempStartDate.value || null,
    due_date: tempDueDate.value || null,
    recurrence: tempRecurrence.value,
    recurrence_until: tempRecurrenceUntil.value || null
  })
}

const handleToggleStatus = () => emit('toggle-status')
const handleCyclePriority = () => emit('cycle-priority')
const handleCycleRecurrence = () => emit('cycle-recurrence')
const handleCycleRecurrenceSpecific = (type: string) => {
  emit('save-edit', { ...props.todo, recurrence: type })
  showRecurrenceMenu.value = false
}

const recurrenceLabel = (r: string) => {
  if (r === 'none') return '不重复'
  if (r === 'daily') return '每日'
  if (r === 'weekly') return '每周'
  if (r === 'monthly') return '每月'
  return r
}

const getPriorityColor = (priority: string | null | undefined) => {
  const p = (priority || 'medium').toLowerCase()
  if (p === 'high') return 'border-l-4 !border-l-red-500'
  if (p === 'medium') return 'border-l-4 !border-l-amber-400'
  if (p === 'low') return 'border-l-4 !border-l-blue-400'
  return 'border-l-4 !border-l-slate-300'
}

const formatDueDate = (dateStr: string) => {
  const diffDays = dayjs(dateStr).startOf('day').diff(dayjs().startOf('day'), 'day')
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '明天'
  if (diffDays === -1) return '昨天'
  return dayjs(dateStr).format('MM-DD')
}

const formatDateRange = (start?: string | null, end?: string | null) => {
  if (!start && !end) return ''
  if (start && end) {
    if (start === end) return formatDueDate(end)
    return `${formatDueDate(start)} 至 ${formatDueDate(end)}`
  }
  if (end) return formatDueDate(end)
  return `${formatDueDate(start!)} 起`
}

const getDateClass = (todo: any) => {
  if (todo.status === 'completed') return 'text-slate-400 dark:text-slate-500'
  if (todo.status === 'failed') return 'text-red-500 font-semibold'
  if (!todo.due_date) return 'text-slate-500 dark:text-slate-400'
  
  const diffDays = dayjs(todo.due_date).startOf('day').diff(dayjs().startOf('day'), 'day')
  if (diffDays < 0) return 'text-red-500 font-semibold'
  if (diffDays === 0) return 'text-orange-500 font-semibold'
  if (diffDays === 1) return 'text-amber-500'
  return 'text-slate-500 dark:text-slate-400'
}

const formatDateSimple = (date: string) => dayjs(date).format('MM-DD HH:mm')
</script>
