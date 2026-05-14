'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import PolaroidCard from './PolaroidCard'

type Props = {
  id: string
  name: string
  handle: string
  photoUrl: string
  status: 'interested' | 'not_interested' | 'dated' | 'matched' | 'together'
  score?: number
  communityRating?: number
  rotation?: number
  href?: string
}

export default function SortableCard({ id, ...props }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 50 : undefined,
        touchAction: 'none',
      }}
      {...attributes}
      {...listeners}
    >
      <PolaroidCard {...props} href={undefined} />
    </div>
  )
}
