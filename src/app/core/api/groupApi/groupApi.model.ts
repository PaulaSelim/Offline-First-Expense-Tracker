export interface GroupRequest {
  name: string;
  description: string;
}
export interface GroupResponse {
  data: { group: Group };
}

export interface GroupListResponse {
  data: { groups: Group[]; pagination: Pagination };
}

export interface GroupMemberResponse {
  data: { members: GroupMember[]; pagination: Pagination };
}

export interface GroupMemberDataResponse {
  data: { member: GroupMember };
}

export interface GroupMemberRequest {
  email: string;
  role: GroupRole;
}

export interface GroupMember {
  id: string;
  email: string;
  username: string;
  role: GroupRole;
}

export enum GroupRole {
  ADMIN = 'Admin',
  MEMBER = 'Member',
}
export interface Group {
  id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  member_count: number;
  user_role?: GroupRole;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
