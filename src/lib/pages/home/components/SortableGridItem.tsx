import { GridItemProps, GridItem } from '@chakra-ui/react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

interface SortableGridItemProps extends GridItemProps {
  id: string;
}

export const SortableGridItem: React.FC<SortableGridItemProps> = ({
  id,
  children,
  ...props
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...props.style,
  };

  return (
    <GridItem
      ref={setNodeRef}
      {...props}
      style={style}
      {...attributes}
      {...listeners}
    >
      {children}
    </GridItem>
  );
};
