"use client";

import { useEffect } from "react";

export function CopyProtection() {
  useEffect(() => {
    // Desabilitar clique direito
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Desabilitar teclas de atalho (Ctrl+C, Ctrl+U, etc)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'u' || e.key === 'i' || e.key === 's' || e.key === 'j')) ||
        (e.metaKey && (e.key === 'c' || e.key === 'u' || e.key === 'i' || e.key === 's' || e.key === 'j'))
      ) {
        e.preventDefault();
      }
    };

    // Desabilitar arrastar imagens (reforço do CSS)
    const handleDragStart = (e: DragEvent) => {
      if ((e.target as HTMLElement).tagName === 'IMG') {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return null;
}
