import { X, Phone, MapPin, Clock, User as UserIcon } from 'lucide-react'
import { calculateSLATimeRemaining, formatSLATime, getUrgencyColor, getStatusColor } from '../lib/utils'

export function TicketDetailPanel({ ticket, onClose, onUpdate }) {
  const slaInfo = calculateSLATimeRemaining(ticket)
  
  if (!ticket) return null

  const statusOptions = [
    'incoming',
    'triaged', 
    'dispatched',
    'completed',
    'closed'
  ]

  const urgencyOptions = ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']
  
  const tradeTypes = ['HVAC', 'Plumbing', 'Electrical', 'General', 'Other']

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-card shadow-xl z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Ticket Details</h2>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* SLA Timer - Prominent */}
        <div className={`p-4 rounded-lg ${slaInfo?.isBreached ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-500' : 'bg-muted'}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">SLA Time Remaining</span>
            <span className={`text-xl font-bold font-mono ${slaInfo?.isBreached ? 'text-red-600 dark:text-red-400 animate-pulse' : ''}`}>
              {formatSLATime(slaInfo)}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 flex-wrap">
          <select 
            value={ticket.status || 'incoming'}
            onChange={(e) => onUpdate(ticket.id, { status: e.target.value })}
            className={`px-3 py-2 text-sm rounded-md border bg-background ${getStatusColor(ticket.status)} cursor-pointer`}
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select 
            value={ticket.urgency || 'MEDIUM'}
            onChange={(e) => onUpdate(ticket.id, { urgency: e.target.value })}
            className={`px-3 py-2 text-sm rounded-md border bg-background ${getUrgencyColor(ticket.urgency)} cursor-pointer`}
          >
            {urgencyOptions.map(urgency => (
              <option key={urgency} value={urgency}>{urgency}</option>
            ))}
          </select>

          <select 
            value={ticket.trade_type || 'General'}
            onChange={(e) => onUpdate(ticket.id, { trade_type: e.target.value })}
            className="px-3 py-2 text-sm rounded-md border bg-background cursor-pointer"
          >
            {tradeTypes.map(trade => (
              <option key={trade} value={trade}>{trade}</option>
            ))}
          </select>
        </div>

        {/* Ticket Info */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-1">Unit</label>
            <input 
              type="text"
              value={ticket.unit || ''}
              onChange={(e) => onUpdate(ticket.id, { unit: e.target.value })}
              className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-1">Issue Description</label>
            <textarea 
              value={ticket.issue_raw || ''}
              onChange={(e) => onUpdate(ticket.id, { issue_raw: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-1">Tenant Phone</label>
            <input 
              type="tel"
              value={ticket.tenant_phone || ''}
              onChange={(e) => onUpdate(ticket.id, { tenant_phone: e.target.value })}
              className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-1">Created At</label>
            <p className="px-3 py-2 rounded-md bg-muted text-sm">
              {new Date(ticket.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Tenant Info Sidebar */}
        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <UserIcon className="w-4 h-4" />
            Tenant Information
          </h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{ticket.tenant_phone || 'No phone on file'}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>Unit {ticket.unit}</span>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>Ticket created: {new Date(ticket.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-semibold mb-4">Notes</h3>
          <textarea 
            placeholder="Add notes about this ticket..."
            rows={3}
            className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
          />
        </div>
      </div>
    </div>
  )
}
