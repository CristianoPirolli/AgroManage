import { Icon } from '@/components/ui/Icon';

type RowActionsProps = {
  label: string;
  onEdit: () => void;
  onDelete: () => void;
};

export function RowActions({ label, onEdit, onDelete }: RowActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      <button type="button" onClick={onEdit} aria-label={`Editar ${label}`} title="Editar" className="icon-btn">
        <Icon name="edit" className="size-4" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Excluir ${label}`}
        title="Excluir"
        className="icon-btn icon-btn-danger"
      >
        <Icon name="trash" className="size-4" />
      </button>
    </div>
  );
}
