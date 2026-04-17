import { Filter, X } from 'lucide-react'
import { getStatusColor } from '../lib/utils'

export function UnitView({ tickets, onTicketClick, onClose }) {
  const units = [...new Set(tickets.map(t => t.unit))].sort()
  
  return (
    <div className="fixed inset-0 bg-background/95 z-40 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Unit View</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-4 bg-card p-4 rounded-lg border">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-medium">Show:</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="unitFilter" defaultChecked className="accent-primary" />
            <span className="text-sm">All Tickets</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="unitFilter" className="accent-primary" />
            <span className="text-sm">Open Only</span>
          </label>
        </div>

        {/* Units Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {units.map(unit => {
            const unitTickets = tickets.filter(t => t.unit === unit)
            const openCount = unitTickets.filter(t => 
              !['completed', 'closed'].includes(t.status)
            ).length
            
            return (
              <div 
                key={unit}
                onClick={() => onTicketClick(unit)}
                className="bg-card border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold">Unit {unit}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${openCount > 0 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'}`}>
                    {openCount} Open
                  </span>
                </div>

                {/* Recent Tickets */}
                <div className="space-y-2">
                  {unitTickets.slice(0, 3).map(ticket => (
                    <div key={ticket.id} className="flex items-center gap-2 text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      <span className="text-muted-foreground truncate flex-1">{ticket.issue_raw}</span>
                    </div>
                  ))}
                  
                  {unitTickets.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{unitTickets.length - 3} more tickets
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {units.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tickets found</p>
          </div>
        )}
      </div>
    </div>
  )
}
