import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { LocalStorage } from './local-storage';

describe('LocalStorage', () => {
  let service: LocalStorage;
  let mockLocalStorage: { [key: string]: string } = {};

  beforeEach(() => {
    mockLocalStorage = {};

    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      return mockLocalStorage[key] || null;
    });

    spyOn(localStorage, 'setItem').and.callFake(
      (key: string, value: string) => {
        mockLocalStorage[key] = value;
      },
    );

    spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
      delete mockLocalStorage[key];
    });

    spyOn(localStorage, 'clear').and.callFake(() => {
      mockLocalStorage = {};
    });

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(LocalStorage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setItem', () => {
    it('should store string values', () => {
      service.setItem('testKey', 'testValue');
      expect(localStorage.setItem).toHaveBeenCalledWith('testKey', 'testValue');
      expect(mockLocalStorage['testKey']).toBe('testValue');
    });

    it('should store object values as JSON', () => {
      const testObject = { name: 'John', age: 30 };
      service.setItem('testObject', testObject);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'testObject',
        JSON.stringify(testObject),
      );
      expect(mockLocalStorage['testObject']).toBe(JSON.stringify(testObject));
    });

    it('should store array values as JSON', () => {
      const testArray = [1, 2, 3];
      service.setItem('testArray', testArray);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'testArray',
        JSON.stringify(testArray),
      );
      expect(mockLocalStorage['testArray']).toBe(JSON.stringify(testArray));
    });

    it('should store boolean values as JSON', () => {
      service.setItem('testBoolean', true);
      expect(localStorage.setItem).toHaveBeenCalledWith('testBoolean', 'true');
      expect(mockLocalStorage['testBoolean']).toBe('true');
    });
  });

  describe('getItem', () => {
    it('should retrieve string values', () => {
      mockLocalStorage['testKey'] = 'testValue';
      const result = service.getItem('testKey');
      expect(result).toBe('testValue');
      expect(localStorage.getItem).toHaveBeenCalledWith('testKey');
    });

    it('should retrieve and parse object values', () => {
      const testObject = { name: 'John', age: 30 };
      mockLocalStorage['testObject'] = JSON.stringify(testObject);
      const result = service.getItem<typeof testObject>('testObject');
      expect(result).toEqual(testObject);
    });

    it('should retrieve and parse array values', () => {
      const testArray = [1, 2, 3];
      mockLocalStorage['testArray'] = JSON.stringify(testArray);
      const result = service.getItem<typeof testArray>('testArray');
      expect(result).toEqual(testArray);
    });

    it('should retrieve and parse boolean values', () => {
      mockLocalStorage['testBoolean'] = 'true';
      const result = service.getItem<boolean>('testBoolean');
      expect(result).toBe(true);
    });

    it('should return null for non-existent keys', () => {
      const result = service.getItem('nonExistentKey');
      expect(result).toBeNull();
    });

    it('should handle malformed JSON gracefully', () => {
      mockLocalStorage['malformedJson'] = '{invalid json}';
      const result = service.getItem('malformedJson');
      expect(result).toBe('{invalid json}');
    });

    it('should return null when localStorage returns null', () => {
      const result = service.getItem('nullKey');
      expect(result).toBeNull();
    });
  });

  describe('removeItem', () => {
    it('should remove items from localStorage', () => {
      mockLocalStorage['testKey'] = 'testValue';
      service.removeItem('testKey');
      expect(localStorage.removeItem).toHaveBeenCalledWith('testKey');
      expect(mockLocalStorage['testKey']).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('should clear all items from localStorage', () => {
      mockLocalStorage['key1'] = 'value1';
      mockLocalStorage['key2'] = 'value2';
      service.clear();
      expect(localStorage.clear).toHaveBeenCalled();
      expect(Object.keys(mockLocalStorage).length).toBe(0);
    });
  });

  describe('hasItem', () => {
    it('should return true for existing keys', () => {
      mockLocalStorage['existingKey'] = 'value';
      const result = service.hasItem('existingKey');
      expect(result).toBe(true);
      expect(localStorage.getItem).toHaveBeenCalledWith('existingKey');
    });

    it('should return false for non-existent keys', () => {
      const result = service.hasItem('nonExistentKey');
      expect(result).toBe(false);
      expect(localStorage.getItem).toHaveBeenCalledWith('nonExistentKey');
    });

    it('should return false for keys with null values', () => {
      const result = service.hasItem('nullKey');
      expect(result).toBe(false);
    });
  });
});
