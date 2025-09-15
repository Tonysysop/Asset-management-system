import React, { useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

interface DropdownMenuProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
  direction?: 'left' | 'right';
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children, trigger, direction = 'left' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (isOpen && triggerRef.current && menuRef.current) {
      const { top, left, right, height } = triggerRef.current.getBoundingClientRect();
      menuRef.current.style.top = `${top + height}px`;
      if (direction === 'left') {
        menuRef.current.style.left = `${left}px`;
      } else {
        menuRef.current.style.left = `${right - menuRef.current.offsetWidth}px`;
      }
    }
  }, [isOpen, direction]);

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div ref={triggerRef} onClick={handleTriggerClick} role="button" tabIndex={0}>
      {trigger}
      {isOpen && createPortal(
        <div ref={menuRef} className="absolute z-50" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>,
        document.body
      )}
    </div>
  );
};

export default DropdownMenu;