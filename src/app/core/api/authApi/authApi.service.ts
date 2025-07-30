import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  AuthenticationResponse,
  AuthenticationTokens,
  LoginRequest,
  RegisterRequest,
  User,
} from './authApi.model';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class AuthApiService {
  constructor(private http: HttpClient) {}

  login(data: LoginRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(
      `${environment.apiUrl}/users/login`,
      data,
    );
  }

  register(data: RegisterRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(
      `${environment.apiUrl}/users/register`,
      data,
    );
  }
  refreshToken(refresh_token: string): Observable<AuthenticationTokens> {
    return this.http
      .post<{
        data: AuthenticationTokens;
      }>(`${environment.apiUrl}/users/refresh`, { refresh_token })
      .pipe(map((res: { data: AuthenticationTokens }) => res.data));
  }

  getProfile(): Observable<User> {
    return this.http
      .get<{ data: { user: User } }>(`${environment.apiUrl}/users/me`)
      .pipe(map((res: { data: { user: User } }) => res.data.user));
  }
}
