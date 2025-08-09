import { computed, signal, Signal, WritableSignal } from '@angular/core';

const _isOnline: WritableSignal<boolean> = signal(navigator.onLine);
const _isBackendReachable: WritableSignal<boolean> = signal(false);
const _lastConnectionCheck: WritableSignal<Date> = signal(new Date());

export const isOnline: Signal<boolean> = _isOnline.asReadonly();
export const isBackendReachable: Signal<boolean> =
  _isBackendReachable.asReadonly();
export const lastConnectionCheck: Signal<Date> =
  _lastConnectionCheck.asReadonly();
export const isFullyOnline: Signal<boolean> = computed(
  () => _isOnline() && _isBackendReachable(),
);

export const setIsOnline: (value: boolean) => void = (value: boolean) =>
  _isOnline.set(value);
export const setIsBackendReachable: (value: boolean) => void = (
  value: boolean,
) => _isBackendReachable.set(value);
export const setLastConnectionCheck: (value: Date) => void = (value: Date) =>
  _lastConnectionCheck.set(value);
