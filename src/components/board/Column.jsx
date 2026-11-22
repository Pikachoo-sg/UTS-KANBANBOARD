import { Fragment } from 'react';
import Button from '../ui/Button.jsx';
import TaskCard from './TaskCard.jsx';

export default function Column({
  column,
  tasks,
  total,
  isFiltering,
  canDelete,
  dnd,
  onAddTask,
  onRename,
  onDelete,
  onOpenTask,
  onEditTask,
  onDeleteTask,
}) {
  const isDropTarget = dnd.dropTarget?.columnId === column.id;
  const beforeId = isDropTarget ? dnd.dropTarget.beforeTaskId : undefined;
  const isDone = column.category === 'done';

  return (
    <section
      className={`column ${isDropTarget ? 'column--over' : ''}`}
      aria-label={`Kolom ${column.name}`}
      data-testid="column"
      data-column-id={column.id}
      onDragOver={(event) => dnd.handleDragOver(event, column.id)}
      onDragLeave={dnd.handleDragLeave}
      onDrop={(event) => dnd.handleDrop(event, column.id)}
    >
      <header className="column__header">
        <span className={`dot dot--${column.category}`} aria-hidden="true" />
        <h2 className="column__title" title={column.name}>
          {column.name}
        </h2>
        <span
          className="column__count"
          data-testid="column-count"
          aria-label={isFiltering ? `${tasks.length} dari ${total} tugas` : `${total} tugas`}
        >
          {isFiltering ? `${tasks.length}/${total}` : total}
        </span>
        <span className="column__tools">
          <Button variant="ghost" size="sm" icon="plus" aria-label={`Tambah tugas ke ${column.name}`} onClick={onAddTask} />
          <Button variant="ghost" size="sm" icon="edit" aria-label={`Ubah kolom ${column.name}`} onClick={onRename} />
          <Button
            variant="ghost"
            size="sm"
            icon="trash"
            aria-label={`Hapus kolom ${column.name}`}
            title={canDelete ? undefined : 'Board harus memiliki minimal satu kolom'}
            disabled={!canDelete}
            onClick={onDelete}
          />
        </span>
      </header>

      <div className="column__body">
        {tasks.map((task) => (
          <Fragment key={task.id}>
            {beforeId === task.id ? <div className="drop-indicator" data-testid="drop-indicator" /> : null}
            <TaskCard
              task={task}
              isDone={isDone}
              isDragging={dnd.draggingId === task.id}
              onOpen={() => onOpenTask(task.id)}
              onEdit={() => onEditTask(task.id)}
              onDelete={() => onDeleteTask(task.id)}
              onDragStart={dnd.handleDragStart}
              onDragEnd={dnd.handleDragEnd}
            />
          </Fragment>
        ))}
        {isDropTarget && beforeId === null ? <div className="drop-indicator" data-testid="drop-indicator" /> : null}

        {tasks.length === 0 && !isDropTarget ? (
          <div className="column__empty">{isFiltering && total > 0 ? 'Tidak ada tugas yang cocok' : 'Belum ada tugas'}</div>
        ) : null}
      </div>
    </section>
  );
}
