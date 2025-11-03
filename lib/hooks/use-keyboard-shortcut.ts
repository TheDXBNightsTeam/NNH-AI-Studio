import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description?: string;
  category?: string;
  disabled?: boolean;
}

interface UseKeyboardShortcutOptions {
  enableInInput?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

function isInputElement(element: Element): boolean {
  const tagName = element.tagName.toLowerCase();
  const isContentEditable = element.getAttribute('contenteditable') === 'true';
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    isContentEditable
  );
}

function getModifierKey(): 'Cmd' | 'Ctrl' {
  return typeof navigator !== 'undefined' &&
    navigator.platform.toLowerCase().includes('mac')
    ? 'Cmd'
    : 'Ctrl';
}

export function useKeyboardShortcut(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutOptions = {}
) {
  const {
    enableInInput = false,
    preventDefault = true,
    stopPropagation = false,
  } = options;

  const shortcutsRef = useRef(shortcuts);

  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enableInInput && isInputElement(event.target as Element)) {
        return;
      }

      const isMac = getModifierKey() === 'Cmd';
      const modifierKey = isMac ? event.metaKey : event.ctrlKey;

      for (const shortcut of shortcutsRef.current) {
        if (shortcut.disabled) continue;

        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        const exactCtrlMatch = shortcut.ctrlKey
          ? isMac
            ? event.metaKey
            : event.ctrlKey
          : true;
        const exactMetaMatch = shortcut.metaKey ? modifierKey : true;
        const exactShiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const exactAltMatch = shortcut.altKey ? event.altKey : !event.altKey;

        if (
          keyMatch &&
          exactCtrlMatch &&
          exactMetaMatch &&
          exactShiftMatch &&
          exactAltMatch
        ) {
          if (preventDefault) {
            event.preventDefault();
          }
          if (stopPropagation) {
            event.stopPropagation();
          }
          shortcut.action();
          break;
        }
      }
    },
    [enableInInput, preventDefault, stopPropagation]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export function useSequenceShortcut(
  sequence: string[],
  action: () => void,
  options: { timeout?: number; disabled?: boolean } = {}
) {
  const { timeout = 1000, disabled = false } = options;
  const sequenceRef = useRef<string[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isInputElement(event.target as Element)) {
        return;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      sequenceRef.current.push(event.key.toLowerCase());

      if (sequenceRef.current.length > sequence.length) {
        sequenceRef.current.shift();
      }

      if (
        sequenceRef.current.length === sequence.length &&
        sequenceRef.current.every((key, index) => key === sequence[index].toLowerCase())
      ) {
        event.preventDefault();
        action();
        sequenceRef.current = [];
      } else {
        timeoutRef.current = setTimeout(() => {
          sequenceRef.current = [];
        }, timeout);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [sequence, action, timeout, disabled]);
}

export { getModifierKey };

