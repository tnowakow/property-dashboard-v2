// Property Maintenance Dashboard - Backend API Client
// Replaces direct Supabase connection with backend API calls

// Use relative path for same-service deployment, or absolute URL for separate services
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''

console.log('Backend URL:', BACKEND_URL || '(relative paths - same service)')

/**
 * Fetch all tickets from the backend API
 * @param {Object} options - Query options
 * @param {string} options.status - Optional status filter
 * @param {number} options.limit - Maximum number of tickets (default 100)
 * @returns {Promise<Array>} List of ticket objects with adjusted dates for demo freshness
 */
export async function getTickets(options = {}) {
  const { status, limit = 100 } = options
  
  let url = `${BACKEND_URL}/api/tickets?limit=${limit}`
  if (status) {
    url += `&status=${status}`
  }
  
  console.log('Fetching tickets from:', url)
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`)
  }
  
  let data = await response.json()
  
  // Adjust dates to look fresh for demo (Option 1 - frontend adjustment)
  // This makes the demo always look current regardless of when it's viewed
  if (data.tickets && Array.isArray(data.tickets)) {
    data.tickets = adjustDatesForDemo(data.tickets)
  }
  
  console.log('Tickets fetched:', data.count)
  
  return data.tickets || []
}

/**
 * Adjust ticket dates to look fresh for demo purposes
 * Makes tickets appear created within the last 0-72 hours based on urgency
 * @param {Array} tickets - Array of ticket objects
 * @returns {Array} Tickets with adjusted created_at timestamps
 */
function adjustDatesForDemo(tickets) {
  const now = new Date()
  
  return tickets.map(ticket => adjustSingleTicketDate(ticket))
}

/**
 * Adjust a single ticket's date to look fresh for demo purposes
 * @param {Object} ticket - Single ticket object
 * @returns {Object} Ticket with adjusted created_at timestamp
 */
function adjustSingleTicketDate(ticket) {
  const now = new Date()
  
  console.log(`Adjusting date for ticket ${ticket.id}:`, {
    original: ticket.created_at,
    urgency: ticket.urgency,
    status: ticket.status,
    now: now.toISOString(),
  })
  
  // Determine target age based on urgency and status
  let targetHoursAgo
  if (ticket.status === 'completed' || ticket.status === 'closed') {
    // Completed tickets: 2-48 hours ago
    targetHoursAgo = 2 + Math.random() * 46
  } else if (ticket.urgency === 'EMERGENCY') {
    // Emergency: just created (0-1 hour ago)
    targetHoursAgo = Math.random()
  } else if (ticket.urgency === 'HIGH') {
    // High urgency: 1-6 hours ago
    targetHoursAgo = 1 + Math.random() * 5
  } else if (ticket.urgency === 'MEDIUM') {
    // Medium urgency: 6-48 hours ago
    targetHoursAgo = 6 + Math.random() * 42
  } else {
    // Low urgency or default: 12-72 hours ago
    targetHoursAgo = 12 + Math.random() * 60
  }
  
  console.log(`Target age for ${ticket.urgency}/${ticket.status}: ${targetHoursAgo.toFixed(2)} hours ago`)
  
  // Create new timestamp that's targetHoursAgo in the past
  const adjustedCreated = new Date(now.getTime() - targetHoursAgo * 60 * 60 * 1000)
  
  console.log(`Adjusted date: ${adjustedCreated.toISOString()} (${adjustedCreated.toLocaleString()})`)
  
  // Return ticket with adjusted date
  return {
    ...ticket,
    created_at: adjustedCreated.toISOString(),
  }
}

/**
 * Fetch a single ticket by ID
 * @param {string} ticketId - The UUID of the ticket
 * @returns {Promise<Object>} Ticket object
 */
export async function getTicket(ticketId) {
  const url = `${BACKEND_URL}/ticket/${ticketId}`
  
  console.log('Fetching ticket:', url)
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Ticket ${ticketId} not found`)
    }
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`)
  }
  
  return await response.json()
}

/**
 * Update a ticket by ID
 * @param {string} ticketId - The UUID of the ticket to update
 * @param {Object} updates - Dictionary of fields to update
 * @returns {Promise<Object>} Updated ticket object
 */
export async function updateTicket(ticketId, updates) {
  const url = `${BACKEND_URL}/api/tickets/${ticketId}`
  
  console.log('Updating ticket:', ticketId, 'with', updates)
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  })
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Ticket ${ticketId} not found`)
    }
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`)
  }
  
  return await response.json()
}

/**
 * Create a new ticket
 * @param {Object} data - Ticket creation data
 * @param {string} data.unit - Unit number (e.g., "101", "2B")
 * @param {string} data.issue - Description of the maintenance issue
 * @param {string} data.phone - Tenant's phone number
 * @param {string} data.name - Tenant's name
 * @returns {Promise<Object>} Created ticket response with adjusted date for demo freshness
 */
export async function createTicket(data) {
  const url = `${BACKEND_URL}/api/tickets`
  
  console.log('Creating ticket for unit:', data.unit)
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`)
  }
  
  const ticket = await response.json()
  
  // Adjust the created_at date for demo freshness (same logic as getTickets)
  ticket.created_at = adjustSingleTicketDate(ticket).created_at
  
  return ticket
}

/**
 * Health check endpoint
 * @returns {Promise<Object>} Health status
 */
export async function healthCheck() {
  const url = `${BACKEND_URL}/`
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    throw new Error(`Backend health check failed: HTTP ${response.status}`)
  }
  
  return await response.json()
}
