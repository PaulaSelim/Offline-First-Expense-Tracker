import { computed, signal, Signal, WritableSignal } from '@angular/core';
import { AuthenticationResponse, User } from '../api/authApi/authApi.model';

const _authData: WritableSignal<AuthenticationResponse | null> = signal(null);
const _authLoading: WritableSignal<boolean> = signal(false);
const _authError: WritableSignal<string | null> = signal(null);

export const authData: Signal<AuthenticationResponse | null> =
  _authData.asReadonly();
export const authLoading: Signal<boolean> = _authLoading.asReadonly();
export const authError: Signal<string | null> = _authError.asReadonly();

export const setAuthData: (value: AuthenticationResponse | null) => void = (
  value: AuthenticationResponse | null,
) => {
  _authData.set(value);
};

export const setAuthLoading: (value: boolean) => void = (value: boolean) => {
  _authLoading.set(value);
};

export const setAuthError: (value: string | null) => void = (
  value: string | null,
) => {
  _authError.set(value);
};

export const user: Signal<User | null> = computed(
  () => authData()?.data.user ?? null,
);

export const resetAuthState: () => void = () => {
  _authData.set(null);
  _authLoading.set(false);
  _authError.set(null);
};

export const userName: Signal<string> = computed(() => user()?.username ?? '');
export const userEmail: Signal<string> = computed(() => user()?.email ?? '');
export const userId: Signal<string> = computed(() => user()?.id ?? '');
export const userCreatedAt: Signal<string | undefined> = computed(
  () => user()?.created_at,
);
export const userUpdatedAt: Signal<string | undefined> = computed(
  () => user()?.updated_at,
);
