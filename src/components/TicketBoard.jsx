import { useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TicketCard } from './TicketCard'

function SortableTicket({ ticket, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: ticket.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <TicketCard ticket={ticket} onClick={onClick} />
    </div>
  )
}

export function TicketBoard({ tickets, onTicketClick }) {
  const [orderedTickets, setOrderedTickets] = useState(tickets)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event) {
    const { active, over } = event

    if (active.id !== over?.id) {
      setOrderedTickets((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  // Sync with external tickets when they change
  if (tickets.length !== orderedTickets.length || 
      !tickets.every((t, i) => t.id === orderedTickets[i]?.id)) {
    setOrderedTickets(tickets)
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      sensors={sensors}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={orderedTickets.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orderedTickets.map(ticket => (
            <SortableTicket 
              key={ticket.id} 
              ticket={ticket} 
              onClick={onTicketClick}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
