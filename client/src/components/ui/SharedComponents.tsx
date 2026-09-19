import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import type { TaskStatus, Priority } from '../../types';

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
};

const STATUS_CLASSES: Record<TaskStatus, string> = {
  TODO: 'badge-todo',
  IN_PROGRESS: 'badge-in-progress',
  IN_REVIEW: 'badge-in-review',
  DONE: 'badge-done',
};

const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

const PRIORITY_CLASSES: Record<Priority, string> = {
  LOW: 'priority-low',
  MEDIUM: 'priority-medium',
  HIGH: 'priority-high',
  CRITICAL: 'priority-critical',
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={`badge ${STATUS_CLASSES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`badge ${PRIORITY_CLASSES[priority]}`}>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="neu-sm rounded-2xl p-6">
        <div className="w-10 h-10 rounded-full border-4 border-holst-navy-900/10 border-t-holst-blue animate-spin" />
      </div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="neu rounded-2xl p-12 flex flex-col items-center justify-center text-center">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-holst-sand" />
        <span className="text-holst-sand text-lg">&#10022;</span>
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-holst-sand" />
      </div>
      <p className="font-accent italic text-holst-navy-800/50 text-sm max-w-xs">
        {message}
      </p>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-holst-navy-900">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-holst-navy-800/40 font-accent mt-1">
            {subtitle}
          </p>
        )}
        <div className="mt-3 h-0.5 w-10 bg-gradient-to-r from-holst-sand to-transparent rounded-full" />
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`neu rounded-2xl p-6 ${
        hover ? 'transition-shadow duration-300 hover:shadow-[8px_8px_16px_#d1ccc0]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

interface NeuSelectOption {
  value: string;
  label: string;
}

interface NeuSelectProps {
  options: NeuSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function NeuSelect({ options, value, onChange, placeholder, className = '' }: NeuSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selected = options.find((o) => o.value === value);
  const displayLabel = selected ? selected.label : placeholder || 'Select...';

  const close = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, close]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        close();
        buttonRef.current?.focus();
      }
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close]);

  const handleButtonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(true);
      setFocusedIndex(0);
    }
  };

  const handleOptionKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(Math.min(index + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(Math.max(index - 1, 0));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(options[index].value);
      close();
      buttonRef.current?.focus();
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleButtonKeyDown}
        className="neu flex items-center gap-2 px-4 py-2.5 rounded-xl font-body text-sm text-holst-navy-900 min-w-[160px] justify-between transition-shadow duration-200"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={!selected ? 'text-holst-navy-800/40' : ''}>
          {displayLabel}
        </span>
        <ChevronDown
          size={14}
          className={`text-holst-navy-800/40 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div
          className="absolute z-50 mt-2 w-full min-w-[160px] neu rounded-xl py-1 animate-slide-down"
          role="listbox"
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                close();
                buttonRef.current?.focus();
              }}
              onKeyDown={(e) => handleOptionKeyDown(e, index)}
              className={`w-full px-4 py-2.5 text-left font-body text-sm transition-colors duration-150 ${
                option.value === value
                  ? 'text-holst-blue font-medium bg-holst-blue/5'
                  : 'text-holst-navy-800 hover:bg-holst-navy-800/5'
              } ${focusedIndex === index ? 'bg-holst-navy-800/5' : ''}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
