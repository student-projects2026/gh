export function formatTime(date: Date | string | number): string {
  const d = typeof date === 'object' ? date : new Date(date)
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hour = d.getHours()
  const minute = d.getMinutes()

  return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}`
}

export function formatDate(date: Date | string | number): string {
  const d = typeof date === 'object' ? date : new Date(date)
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()

  return `${year}-${pad(month)}-${pad(day)}`
}

export function relativeTime(date: Date | string | number): string {
  const d = typeof date === 'object' ? date : new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`
  if (diff < day) return `${Math.floor(diff / hour)}小时前`
  if (diff < 7 * day) return `${Math.floor(diff / day)}天前`

  return formatDate(d)
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

export function throttle<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let lastTime = 0
  return function (this: any, ...args: any[]) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      fn.apply(this, args)
    }
  } as T
}

export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let timer: any
  return function (this: any, ...args: any[]) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  } as T
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

import { showModal as _showModal } from './modal'
export const showModal = _showModal

export function chooseImages(count: number): Promise<string[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = count > 1
    input.onchange = () => {
      const files = Array.from(input.files || []).slice(0, count)
      const urls = files.map((f) => URL.createObjectURL(f))
      resolve(urls)
    }
    input.click()
  })
}
