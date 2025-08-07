import { Signal, signal, WritableSignal } from '@angular/core';

const _isAppOnline: WritableSignal<boolean> = signal<boolean>(true);
export const isAppOnline: Signal<boolean> = _isAppOnline.asReadonly();
const _syncError: WritableSignal<string | null> = signal<string | null>(null);
export const syncError: Signal<string | null> = _syncError.asReadonly();

export const setSyncError: (error: string | null) => void = (
  error: string | null,
): void => {
  _syncError.set(error);
};

export const setAppOnlineStatus: (status: boolean) => void = (
  status: boolean,
): void => {
  _isAppOnline.set(status);
};
