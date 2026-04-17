import { calculateSLATimeRemaining, formatSLATime, getUrgencyColor, getUrgencyBorder, getStatusColor } from '../lib/utils'

export function TicketCard({ ticket, onClick }) {
  const slaInfo = calculateSLATimeRemaining(ticket)
  
  return (
    <div 
      onClick={() => onClick(ticket)}
      className={`group relative p-4 bg-card border-l-4 rounded-r-lg cursor-pointer hover:shadow-md transition-all duration-200 ${getUrgencyBorder(ticket.urgency)}`}
    >
      {/* Urgency Badge */}
      <div className="flex items-start justify-between mb-2">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(ticket.urgency)}`}>
          {ticket.urgency}
        </span>
        
        {/* SLA Timer */}
        <div className="flex items-center gap-2">
          <span className={`text-sm font-mono ${slaInfo?.isBreached ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-muted-foreground'}`}>
            {formatSLATime(slaInfo)}
          </span>
        </div>
      </div>

      {/* Unit & Issue */}
      <div className="mb-2">
        <h3 className="font-semibold text-lg">Unit {ticket.unit}</h3>
        <p className="text-muted-foreground text-sm line-clamp-2">{ticket.issue_raw}</p>
      </div>

      {/* Trade Type & Status */}
      <div className="flex items-center gap-2 mb-2">
        <span className="px-2 py-1 bg-secondary rounded-md text-xs font-medium">
          {ticket.trade_type || 'General'}
        </span>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
          {ticket.status}
        </span>
      </div>

      {/* Tenant Info */}
      {ticket.tenant_phone && (
        <div className="text-xs text-muted-foreground">
          Phone: {ticket.tenant_phone}
        </div>
      )}

      {/* Created Date */}
      <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
        Created: {new Date(ticket.created_at).toLocaleString()}
      </div>

      {/* Hover indicator */}
      <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary opacity-0 group-hover:opacity-20 transition-opacity" />
    </div>
  )
}
