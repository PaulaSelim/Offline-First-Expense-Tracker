import { Signal, signal, WritableSignal } from '@angular/core';

const _isAppOnline: WritableSignal<boolean> = signal<boolean>(true);
export const isAppOnline: Signal<boolean> = _isAppOnline.asReadonly();

export const setAppOnlineStatus: (status: boolean) => void = (
  status: boolean,
): void => {
  _isAppOnline.set(status);
};
