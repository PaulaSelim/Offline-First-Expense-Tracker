import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { GroupApiService } from './groupApi.service';
import { GroupRole } from './groupApi.model';

describe('GroupApiService', () => {
  let service: GroupApiService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiUrl}/groups`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GroupApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
      ],
    });

    service = TestBed.inject(GroupApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a group', () => {
    const mockRequest = { name: 'Test Group', description: 'desc' };
    const mockResponse = {
      data: {
        group: {
          id: '1',
          ...mockRequest,
          created_by: 'user',
          created_at: '',
          updated_at: '',
          member_count: 1,
        },
      },
    };
    service.createGroup(mockRequest).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });
    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should get groups', () => {
    const mockResponse = {
      data: {
        groups: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      },
    };
    service.getGroups().subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });
    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get group by id', () => {
    const groupId = '1';
    const mockResponse = {
      data: {
        group: {
          id: groupId,
          name: 'Test',
          description: '',
          created_by: '',
          created_at: '',
          updated_at: '',
          member_count: 1,
        },
      },
    };
    service.getGroupById(groupId).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });
    const req = httpMock.expectOne(`${baseUrl}/${groupId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should update a group', () => {
    const groupId = '1';
    const mockRequest = { name: 'Updated', description: 'desc' };
    const mockResponse = {
      data: {
        group: {
          id: groupId,
          ...mockRequest,
          created_by: '',
          created_at: '',
          updated_at: '',
          member_count: 1,
        },
      },
    };
    service.updateGroup(groupId, mockRequest).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });
    const req = httpMock.expectOne(`${baseUrl}/${groupId}`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse);
  });

  it('should get group members', () => {
    const groupId = '1';
    const mockResponse = {
      data: {
        members: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      },
    };
    service.getGroupMembers(groupId).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });
    const req = httpMock.expectOne(`${baseUrl}/${groupId}/members`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should add a group member', () => {
    const groupId = '1';
    const memberRequest = { email: 'test@test.com', role: GroupRole.MEMBER };
    const mockResponse = {
      data: {
        member: {
          id: '2',
          email: memberRequest.email,
          username: 'user',
          role: GroupRole.MEMBER,
        },
      },
    };
    service.addGroupMember(groupId, memberRequest).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });
    const req = httpMock.expectOne(`${baseUrl}/${groupId}/members`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should delete a group', () => {
    const groupId = '1';
    service.deleteGroup(groupId).subscribe((res) => {
      expect(res).toBeNull();
    });
    const req = httpMock.expectOne(`${baseUrl}/${groupId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
