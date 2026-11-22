import { useCallback, useEffect, useRef, useState } from 'react';

/** Mencari kartu yang posisinya tepat di bawah kursor; kartu yang diseret diabaikan. */
function findBeforeTaskId(clientY, container, draggingId) {
  const cards = container.querySelectorAll('[data-task-id]');
  for (const card of cards) {
    if (card.dataset.taskId === draggingId) continue;
    const rect = card.getBoundingClientRect();
    if (clientY < rect.top + rect.height / 2) return card.dataset.taskId;
  }
  return null;
}

/**
 * Drag & drop memakai HTML5 Drag and Drop API bawaan browser (tanpa library).
 *
 * `onDrop({ taskId, toColumnId, beforeTaskId })` dipanggil saat kartu dilepas.
 * `container` pada handler kolom adalah elemen kolom itu sendiri (e.currentTarget).
 */
export function useDragAndDrop(onDrop) {
  const dragIdRef = useRef(null);
  const timerRef = useRef(null);
  const onDropRef = useRef(onDrop);
  const [draggingId, setDraggingId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null); // { columnId, beforeTaskId }

  useEffect(() => {
    onDropRef.current = onDrop;
  }, [onDrop]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const reset = useCallback(() => {
    clearTimeout(timerRef.current);
    dragIdRef.current = null;
    setDraggingId(null);
    setDropTarget(null);
  }, []);

  const handleDragStart = useCallback((event, taskId) => {
    dragIdRef.current = taskId;
    event.dataTransfer.effectAllowed = 'move';
    try {
      // Firefox mensyaratkan data diisi agar drag dapat dimulai.
      event.dataTransfer.setData('text/plain', taskId);
    } catch {
      /* diabaikan */
    }
    // Perubahan tampilan ditunda supaya tidak membatalkan drag di beberapa browser.
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (dragIdRef.current === taskId) setDraggingId(taskId);
    }, 0);
  }, []);

  const handleDragOver = useCallback((event, columnId) => {
    const taskId = dragIdRef.current;
    if (!taskId) return; // bukan drag kartu (mis. file atau teks dari luar)
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const beforeTaskId = findBeforeTaskId(event.clientY, event.currentTarget, taskId);
    setDropTarget((prev) =>
      prev && prev.columnId === columnId && prev.beforeTaskId === beforeTaskId
        ? prev
        : { columnId, beforeTaskId },
    );
  }, []);

  const handleDragLeave = useCallback((event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setDropTarget(null);
  }, []);

  const handleDrop = useCallback(
    (event, columnId) => {
      const taskId = dragIdRef.current;
      if (!taskId) return;
      event.preventDefault();
      const beforeTaskId = findBeforeTaskId(event.clientY, event.currentTarget, taskId);
      reset();
      onDropRef.current({ taskId, toColumnId: columnId, beforeTaskId });
    },
    [reset],
  );

  return {
    draggingId,
    dropTarget,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd: reset,
  };
}
