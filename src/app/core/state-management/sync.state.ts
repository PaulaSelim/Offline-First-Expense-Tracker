import { computed, Signal, signal, WritableSignal } from '@angular/core';

const _isAppOnline: WritableSignal<boolean> = signal<boolean>(true);
export const isAppOnline: Signal<boolean> = _isAppOnline.asReadonly();

const _syncError: WritableSignal<string | null> = signal<string | null>(null);
export const syncError: Signal<string | null> = _syncError.asReadonly();

const _isSyncing: WritableSignal<boolean> = signal(false);
export const isSyncing: Signal<boolean> = _isSyncing.asReadonly();

const _syncProgress: WritableSignal<number> = signal(0);
export const syncProgress: Signal<number> = _syncProgress.asReadonly();

const _totalItems: WritableSignal<number> = signal(0);
export const totalItems: Signal<number> = _totalItems.asReadonly();

const _failedItems: WritableSignal<number> = signal(0);
export const failedItems: Signal<number> = _failedItems.asReadonly();

export const hasFailedItems: Signal<boolean> = computed(
  () => _failedItems() > 0,
);

export const setAppOnlineStatus: (status: boolean) => void = (
  status: boolean,
): void => {
  _isAppOnline.set(status);
};

export const setSyncError: (error: string | null) => void = (
  error: string | null,
): void => {
  _syncError.set(error);
};

export const setIsSyncing: (value: boolean) => void = (
  value: boolean,
): void => {
  _isSyncing.set(value);
};

export const setSyncProgress: (value: number) => void = (
  value: number,
): void => {
  _syncProgress.set(value);
};

export const setTotalItems: (value: number) => void = (value: number): void => {
  _totalItems.set(value);
};

export const setFailedItems: (value: number) => void = (
  value: number,
): void => {
  _failedItems.set(value);
};
