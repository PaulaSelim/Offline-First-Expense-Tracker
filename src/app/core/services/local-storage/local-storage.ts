import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorage {
  getItem<T = string>(key: string): T | null {
    const value: string | null = localStorage.getItem(key);
    try {
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return value as unknown as T;
    }
  }

  setItem<T = string>(key: string, value: T): void {
    const stringValue: string =
      typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, stringValue);
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }

  hasItem(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}
