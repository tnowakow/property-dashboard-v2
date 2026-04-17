import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// SLA time limits in hours
export const SLA_LIMITS = {
  EMERGENCY: 1,
  HIGH: 4,
  MEDIUM: 24,
  LOW: 72,
}

export function calculateSLATimeRemaining(ticket) {
  if (!ticket.created_at) return null
  
  const created = new Date(ticket.created_at)
  const now = new Date()
  const hoursElapsed = (now - created) / (1000 * 60 * 60)
  
  const urgency = ticket.urgency || 'MEDIUM'
  const limitHours = SLA_LIMITS[urgency] || SLA_LIMITS.MEDIUM
  
  const hoursRemaining = limitHours - hoursElapsed
  
  return {
    hoursRemaining,
    isBreached: hoursRemaining <= 0,
    urgency,
  }
}

export function formatSLATime(slaInfo) {
  if (!slaInfo) return 'N/A'
  
  if (slaInfo.isBreached) {
    return 'BREACHED'
  }
  
  const hours = Math.floor(Math.max(0, slaInfo.hoursRemaining))
  const minutes = Math.round((Math.max(0, slaInfo.hoursRemaining) - hours) * 60)
  
  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h remaining`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m remaining`
  } else {
    return `${minutes}m remaining`
  }
}

export function getUrgencyColor(urgency) {
  const colors = {
    EMERGENCY: 'bg-red-500 text-white',
    HIGH: 'bg-orange-500 text-white',
    MEDIUM: 'bg-yellow-500 text-black',
    LOW: 'bg-green-500 text-white',
  }
  return colors[urgency] || colors.MEDIUM
}

export function getUrgencyBorder(urgency) {
  const borders = {
    EMERGENCY: 'border-red-500',
    HIGH: 'border-orange-500',
    MEDIUM: 'border-yellow-500',
    LOW: 'border-green-500',
  }
  return borders[urgency] || borders.MEDIUM
}

export function getStatusColor(status) {
  const colors = {
    incoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    triaged: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    dispatched: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  }
  return colors[status] || colors.incoming
}

export function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
