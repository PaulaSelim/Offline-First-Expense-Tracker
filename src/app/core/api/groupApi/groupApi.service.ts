import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  GroupRequest,
  GroupListResponse,
  GroupResponse,
  GroupMemberResponse,
  GroupMemberRequest,
  GroupRole,
  GroupMemberDataResponse,
} from './groupApi.model';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class GroupApiService {
  constructor(private http: HttpClient) {}

  createGroup(data: GroupRequest): Observable<GroupResponse> {
    return this.http.post<GroupResponse>(`${environment.apiUrl}/groups`, data);
  }

  getGroups(): Observable<GroupListResponse> {
    return this.http.get<GroupListResponse>(`${environment.apiUrl}/groups`);
  }

  getGroupById(group_id: string): Observable<GroupResponse> {
    return this.http.get<GroupResponse>(
      `${environment.apiUrl}/groups/${group_id}`,
    );
  }

  updateGroup(group_id: string, data: GroupRequest): Observable<GroupResponse> {
    return this.http.put<GroupResponse>(
      `${environment.apiUrl}/groups/${group_id}`,
      data,
    );
  }

  getGroupMembers(group_id: string): Observable<GroupMemberResponse> {
    return this.http.get<GroupMemberResponse>(
      `${environment.apiUrl}/groups/${group_id}/members`,
    );
  }

  addGroupMember(
    group_id: string,
    member_data: GroupMemberRequest,
  ): Observable<GroupMemberDataResponse> {
    return this.http.post<GroupMemberDataResponse>(
      `${environment.apiUrl}/groups/${group_id}/members`,
      member_data,
    );
  }

  updateGroupMemberRole(
    group_id: string,
    member_id: string,
    role: GroupRole,
  ): Observable<void> {
    return this.http.put<void>(
      `${environment.apiUrl}/groups/${group_id}/members/${member_id}/role`,
      { role },
    );
  }

  removeGroupMember(group_id: string, member_id: string): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/groups/${group_id}/members/${member_id}`,
    );
  }

  deleteGroup(group_id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/groups/${group_id}`);
  }
}
