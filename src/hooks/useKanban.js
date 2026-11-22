import { useContext } from 'react';
import { KanbanContext } from '../context/KanbanContext.jsx';

export function useKanban() {
  const context = useContext(KanbanContext);
  if (!context) throw new Error('useKanban harus dipakai di dalam <KanbanProvider>.');
  return context;
}
