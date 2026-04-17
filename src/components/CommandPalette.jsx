import { useState, useEffect } from 'react'
import { Command as CmdkRoot, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from 'cmdk'
import { Plus, Search, User, CheckCircle, ArrowRight, Settings, Home } from 'lucide-react'

export function CommandPalette({ tickets, onAction }) {
  const [open, setOpen] = useState(false)
  const [recentTickets, setRecentTickets] = useState([])

  useEffect(() => {
    // Open command palette with Cmd+K or Ctrl+K
    const down = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    // Get recent tickets for quick access
    if (tickets && tickets.length > 0) {
      const sorted = [...tickets].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      ).slice(0, 5)
      setRecentTickets(sorted)
    }
  }, [tickets])

  return (
    <>
      <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
        <span>Press</span>
        <kbd className="px-2 py-1 bg-muted rounded-md font-mono text-xs">⌘K</kbd>
        <span>to open command palette</span>
      </div>

      <CmdkRoot loop shouldFilter={false}>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            
            {/* Quick Actions */}
            <CommandGroup heading="Quick Actions">
              <CommandItem 
                onSelect={() => onAction('create_ticket')}
                className="cursor-pointer"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Ticket
                <kbd className="ml-auto px-2 py-1 bg-muted rounded-md font-mono text-xs">N</kbd>
              </CommandItem>
              
              <CommandItem 
                onSelect={() => onAction('assign_vendor')}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                Assign Vendor
                <kbd className="ml-auto px-2 py-1 bg-muted rounded-md font-mono text-xs">A</kbd>
              </CommandItem>
              
              <CommandItem 
                onSelect={() => onAction('change_status')}
                className="cursor-pointer"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Change Status
                <kbd className="ml-auto px-2 py-1 bg-muted rounded-md font-mono text-xs">S</kbd>
              </CommandItem>
              
              <CommandItem 
                onSelect={() => onAction('view_units')}
                className="cursor-pointer"
              >
                <Home className="mr-2 h-4 w-4" />
                View Units
                <kbd className="ml-auto px-2 py-1 bg-muted rounded-md font-mono text-xs">U</kbd>
              </CommandItem>
            </CommandGroup>

            {/* Search */}
            <CommandSeparator />
            <CommandGroup heading="Search">
              <CommandInput 
                placeholder="Search tickets..." 
                className="mt-2"
              />
            </CommandGroup>

            {/* Recent Tickets */}
            {recentTickets.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Recent Tickets">
                  {recentTickets.map((ticket) => (
                    <CommandItem 
                      key={ticket.id}
                      onSelect={() => onAction('view_ticket', ticket)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${getUrgencyColor(ticket.urgency).split(' ')[0]}`} />
                        <span>Unit {ticket.unit}</span>
                        <span className="text-muted-foreground truncate">{ticket.issue_raw}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {/* Settings */}
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem 
                onSelect={() => onAction('toggle_theme')}
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                Toggle Theme
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </CmdkRoot>
    </>
  )
}

function getUrgencyColor(urgency) {
  const colors = {
    EMERGENCY: 'bg-red-500',
    HIGH: 'bg-orange-500',
    MEDIUM: 'bg-yellow-500',
    LOW: 'bg-green-500',
  }
  return colors[urgency] || colors.MEDIUM
}
