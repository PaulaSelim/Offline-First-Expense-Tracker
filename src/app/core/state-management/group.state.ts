import { signal, WritableSignal, Signal } from '@angular/core';
import { Group, GroupMember, Pagination } from '../api/groupApi/groupApi.model';

// === Signals ===

const _groups: WritableSignal<Group[]> = signal([]);
const _selectedGroup: WritableSignal<Group | null> = signal(null);
const _groupMembers: WritableSignal<GroupMember[]> = signal([]);
const _groupPagination: WritableSignal<Pagination | null> = signal(null);
const _fetchedGroups: WritableSignal<Set<string>> = signal(new Set());
const _groupLoading: WritableSignal<boolean> = signal(false);
const _groupError: WritableSignal<string | null> = signal(null);

// === Readonly Access ===

export const groups: Signal<Group[]> = _groups.asReadonly();
export const selectedGroup: Signal<Group | null> = _selectedGroup.asReadonly();
export const groupMembers: Signal<GroupMember[]> = _groupMembers.asReadonly();
export const groupPagination: Signal<Pagination | null> =
  _groupPagination.asReadonly();
export const fetchedGroups: Signal<Set<string>> = _fetchedGroups.asReadonly();

export const groupLoading: Signal<boolean> = _groupLoading.asReadonly();
export const groupError: Signal<string | null> = _groupError.asReadonly();

export const setGroups: (value: Group[]) => void = (value: Group[]) =>
  _groups.set(value);

export const setSelectedGroup: (value: Group | null) => void = (
  value: Group | null,
) => _selectedGroup.set(value);

export const setGroupMembers: (value: GroupMember[]) => void = (
  value: GroupMember[],
) => _groupMembers.set(value);

export const setGroupPagination: (value: Pagination | null) => void = (
  value: Pagination | null,
) => _groupPagination.set(value);

export const setGroupLoading: (value: boolean) => void = (value: boolean) =>
  _groupLoading.set(value);

export const setGroupError: (value: string | null) => void = (
  value: string | null,
) => _groupError.set(value);

export const addFetchedGroup: (groupId: string) => void = (groupId: string) => {
  const currentSet: Set<string> = _fetchedGroups();
  currentSet.add(groupId);
  _fetchedGroups.set(currentSet);
};

export const removeFetchedGroup: (groupId: string) => void = (
  groupId: string,
) => {
  const currentSet: Set<string> = _fetchedGroups();
  currentSet.delete(groupId);
  _fetchedGroups.set(currentSet);
};

export const clearFetchedGroups: () => void = () => {
  _fetchedGroups.set(new Set());
};
export const resetGroupState: () => void = () => {
  _groups.set([]);
  _selectedGroup.set(null);
  _groupMembers.set([]);
  _groupPagination.set(null);
  _groupLoading.set(false);
  _groupError.set(null);
};
