import { Camera, CheckCircle, Clock } from 'lucide-react'
import { calculateSLATimeRemaining, formatSLATime, getUrgencyColor, getUrgencyBorder, getStatusColor } from '../lib/utils'

export function MobileTechnicianView({ tickets, onUpdate }) {
  const assignedTickets = tickets.filter(t => 
    t.status === 'dispatched' || t.status === 'triaged'
  )

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10">
        <h1 className="text-lg font-bold">My Tickets</h1>
        <p className="text-sm opacity-90">{assignedTickets.length} assigned</p>
      </div>

      {/* Ticket List */}
      <div className="p-4 space-y-4">
        {assignedTickets.map(ticket => {
          const slaInfo = calculateSLATimeRemaining(ticket)
          
          return (
            <div 
              key={ticket.id}
              className={`bg-card border-l-4 rounded-r-lg p-4 ${getUrgencyBorder(ticket.urgency)}`}
            >
              {/* Unit & Urgency */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">Unit {ticket.unit}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(ticket.urgency)}`}>
                  {ticket.urgency}
                </span>
              </div>

              {/* Issue */}
              <p className="text-muted-foreground mb-3">{ticket.issue_raw}</p>

              {/* Trade Type & SLA */}
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-1 bg-secondary rounded-md text-xs font-medium">
                  {ticket.trade_type || 'General'}
                </span>
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className={`text-sm ${slaInfo?.isBreached ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {formatSLATime(slaInfo)}
                </span>
              </div>

              {/* Tenant Info */}
              {ticket.tenant_phone && (
                <p className="text-sm text-muted-foreground mb-4">
                  Tenant: {ticket.tenant_phone}
                </p>
              )}

              {/* Quick Actions */}
              <div className="flex gap-2 flex-wrap">
                <button 
                  onClick={() => onUpdate(ticket.id, { status: 'completed' })}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Complete
                </button>

                <button 
                  onClick={() => onUpdate(ticket.id, { status: 'dispatched' })}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  In Progress
                </button>

                <button 
                  onClick={() => onUpdate(ticket.id, { status: 'waiting' })}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  Waiting
                </button>

                <button 
                  onClick={() => alert('Photo upload coming soon!')}
                  className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-lg transition-colors"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>
            </div>
          )
        })}

        {/* Empty State */}
        {assignedTickets.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-muted-foreground">No assigned tickets</p>
            <p className="text-sm text-muted-foreground mt-2">You're all caught up!</p>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => alert('Photo upload coming soon!')}
        className="fixed bottom-6 right-6 bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow"
      >
        <Camera className="w-6 h-6" />
      </button>
    </div>
  )
}
