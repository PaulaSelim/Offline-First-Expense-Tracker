import { computed, Signal } from '@angular/core';
import { authData } from './auth.state';
import { User } from '../api/authApi/authApi.model';

export const user: Signal<User | null> = computed(
  () => authData()?.data.user ?? null,
);
