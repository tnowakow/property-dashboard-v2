import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { CommandPalette } from './components/CommandPalette'
import { TicketBoard } from './components/TicketBoard'
import { TicketDetailPanel } from './components/TicketDetailPanel'
import { UnitView } from './components/UnitView'
import { MobileTechnicianView } from './components/MobileTechnicianView'
import { toast } from 'sonner'
import { Moon, Sun, Smartphone, LayoutGrid, Users } from 'lucide-react'

function App() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showUnitView, setShowUnitView] = useState(false)
  const [viewMode, setViewMode] = useState('inbox') // 'inbox' | 'technician'
  const [darkMode, setDarkMode] = useState(false)
  
  // Filters & Sort
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('sla') // 'created' | 'urgency' | 'sla'

  useEffect(() => {
    loadTickets()
    
    // Check for dark mode preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true)
    }
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  async function loadTickets() {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setTickets(data || [])
    } catch (err) {
      console.error('Error loading tickets:', err)
      toast.error('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  async function updateTicket(ticketId, updates) {
    try {
      const { error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', ticketId)
      
      if (error) throw error
      
      // Update local state
      setTickets(prev => prev.map(t => 
        t.id === ticketId ? { ...t, ...updates } : t
      ))
      
      toast.success('Ticket updated')
    } catch (err) {
      console.error('Error updating ticket:', err)
      toast.error('Failed to update ticket')
    }
  }

  function handleAction(action, data = null) {
    switch (action) {
      case 'create_ticket':
        toast.info('Create ticket feature coming soon!')
        break
      case 'assign_vendor':
        toast.info('Vendor assignment coming soon!')
        break
      case 'change_status':
        toast.info('Use the status dropdown in ticket details')
        break
      case 'view_units':
        setShowUnitView(true)
        break
      case 'view_ticket':
        setSelectedTicket(data)
        break
      case 'toggle_theme':
        setDarkMode(!darkMode)
        break
    }
  }

  function handleTicketClick(ticket) {
    setSelectedTicket(ticket)
  }

  // Filter and sort tickets
  const filteredTickets = tickets.filter(ticket => {
    if (statusFilter === 'all') return true
    if (statusFilter === 'new') return ticket.status === 'incoming'
    if (statusFilter === 'in_progress') return ['triaged', 'dispatched'].includes(ticket.status)
    if (statusFilter === 'waiting') return ticket.status === 'waiting'
    if (statusFilter === 'resolved') return ['completed', 'closed'].includes(ticket.status)
    return true
  })

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (sortBy === 'created') {
      return new Date(b.created_at) - new Date(a.created_at)
    } else if (sortBy === 'urgency') {
      const urgencyOrder = { EMERGENCY: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
    } else {
      // Sort by SLA deadline (most urgent first)
      const slaA = a.urgency === 'EMERGENCY' ? 1 : a.urgency === 'HIGH' ? 4 : a.urgency === 'MEDIUM' ? 24 : 72
      const slaB = b.urgency === 'EMERGENCY' ? 1 : b.urgency === 'HIGH' ? 4 : b.urgency === 'MEDIUM' ? 24 : 72
      return slaA - slaB
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p>Loading tickets...</p>
        </div>
      </div>
    )
  }

  // Mobile technician view
  if (viewMode === 'technician') {
    return (
      <>
        <MobileTechnicianView 
          tickets={tickets} 
          onUpdate={updateTicket}
        />
        <button 
          onClick={() => setViewMode('inbox')}
          className="fixed bottom-6 left-6 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg"
        >
          Back to Inbox
        </button>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Property Maintenance Dashboard</h1>
            
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <button 
                onClick={() => setViewMode(viewMode === 'inbox' ? 'technician' : 'inbox')}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title={viewMode === 'inbox' ? 'Technician View' : 'Inbox View'}
              >
                {viewMode === 'inbox' ? (
                  <Smartphone className="w-5 h-5" />
                ) : (
                  <LayoutGrid className="w-5 h-5" />
                )}
              </button>

              {/* Dark Mode Toggle */}
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title={darkMode ? 'Light Mode' : 'Dark Mode'}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Command Palette Hint */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm">
                <kbd className="font-mono">⌘K</kbd>
                <span>Command Palette</span>
              </div>
            </div>
          </div>

          {/* Command Palette Component */}
          <div className="mt-4">
            <CommandPalette tickets={tickets} onAction={handleAction} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters & Sort Bar */}
        <div className="flex flex-wrap items-center gap-4 mb-6 bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Filter:</span>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-md border bg-background text-sm"
            >
              <option value="all">All</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting">Waiting</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sort by:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-md border bg-background text-sm"
            >
              <option value="sla">SLA Deadline</option>
              <option value="urgency">Urgency</option>
              <option value="created">Created Date</option>
            </select>
          </div>

          <div className="ml-auto text-sm text-muted-foreground">
            {sortedTickets.length} tickets showing
          </div>
        </div>

        {/* Tickets Grid with Drag-and-Drop */}
        <TicketBoard tickets={sortedTickets} onTicketClick={handleTicketClick} />

        {/* Empty State */}
        {sortedTickets.length === 0 && (
          <div className="text-center py-12">
            <LayoutGrid className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">No tickets found</p>
            <p className="text-muted-foreground mt-2">Try adjusting your filters</p>
          </div>
        )}
      </main>

      {/* Ticket Detail Panel */}
      {selectedTicket && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSelectedTicket(null)}
          />
          <TicketDetailPanel 
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
            onUpdate={updateTicket}
          />
        </>
      )}

      {/* Unit View Modal */}
      {showUnitView && (
        <UnitView 
          tickets={tickets}
          onTicketClick={(unit) => {
            toast.info(`Showing all tickets for Unit ${unit}`)
            setShowUnitView(false)
          }}
          onClose={() => setShowUnitView(false)}
        />
      )}

      {/* Toast Container */}
    </div>
  )
}

export default App
