import { ReactNode } from 'react';

export interface DetailProps {
  label: string;
  value: string;
}

export interface DialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  tone?: 'default' | 'danger';
  children?: ReactNode;
}

export interface StepperProps {
  currentStep: 1 | 2 | 3;
}
