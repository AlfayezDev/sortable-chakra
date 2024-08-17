import { Card, CardProps } from '@chakra-ui/react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

// Updated SortableCard component
interface SortableCardProps extends CardProps {
  id: string;
}

export const SortableCard: React.FC<SortableCardProps> = ({
  id,
  children,
  ...props
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.8 : 1,
    ...props.style,
  };

  return (
    <Card
      ref={setNodeRef}
      {...props}
      style={style}
      {...attributes}
      {...listeners}
    >
      {children}
    </Card>
  );
};
