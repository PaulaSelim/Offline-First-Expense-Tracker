import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { GroupApiService } from './groupApi.service';

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
});
