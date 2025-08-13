import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthApiService } from '../../core/api/authApi/authApi.service';
import { ToastrService } from 'ngx-toastr';
import {
  LoginRequest,
  RegisterRequest,
  AuthenticationResponse,
  AuthenticationTokens,
} from '../../core/api/authApi/authApi.model';
import { AuthFacade } from './auth.facade';
import { TokenState } from '../../core/services/token-state/token.state';
import { RxdbService } from '../../core/state-management/RxDB/rxdb.service';
import { UserDBState } from '../../core/state-management/RxDB/user/userDB.state';
import { GroupDBState } from '../../core/state-management/RxDB/group/groupDB.state';
import { ExpensesDBState } from '../../core/state-management/RxDB/expenses/expensesDB.state';
import { SyncQueueDBState } from '../../core/state-management/RxDB/sync-queue/sync-queueDB.state';
import { SyncApiService } from '../../core/api/syncApi/syncApi.service';

describe('AuthFacade', () => {
  let service: AuthFacade;
  let mockAuthApi: jasmine.SpyObj<AuthApiService>;
  let mockToast: jasmine.SpyObj<ToastrService>;
  let mockTokenState: jasmine.SpyObj<TokenState>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockRxdbService: jasmine.SpyObj<RxdbService>;
  let mockUserDB: jasmine.SpyObj<UserDBState>;
  let mockGroupDB: jasmine.SpyObj<GroupDBState>;
  let mockExpensesDB: jasmine.SpyObj<ExpensesDBState>;
  let mockSyncQueueDB: jasmine.SpyObj<SyncQueueDBState>;
  let mockSyncApi: jasmine.SpyObj<SyncApiService>;

  const mockResponse: AuthenticationResponse = {
    data: {
      token: 'mock-token',
      refresh_token: 'mock-refresh',
      user: {
        id: '1',
        username: 'testuser',
        email: 'test@test.com',
      },
    },
  };

  beforeEach(async () => {
    // Create spies for all dependencies
    const authApiSpy = jasmine.createSpyObj('AuthApiService', [
      'login',
      'register',
      'refreshToken',
      'getProfile',
    ]);
    const toastSpy = jasmine.createSpyObj('ToastrService', [
      'success',
      'error',
      'info',
      'warning',
    ]);
    const tokenStateSpy = jasmine.createSpyObj('TokenState', [
      'setTokens',
      'clearTokens',
      'getAccessToken',
      'getRefreshToken',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const rxdbServiceSpy = jasmine.createSpyObj('RxdbService', ['database'], {
      databaseReady$: of({}),
    });
    const userDBSpy = jasmine.createSpyObj('UserDBState', [
      'addOrUpdateUser$',
      'removeUser$',
      'getUser$',
    ]);
    const groupDBSpy = jasmine.createSpyObj('GroupDBState', [
      'removeAllGroups$',
    ]);
    const expensesDBSpy = jasmine.createSpyObj('ExpensesDBState', [
      'removeAllExpenses$',
    ]);
    const syncQueueDBSpy = jasmine.createSpyObj('SyncQueueDBState', [
      'clearQueue$',
    ]);
    const syncApiSpy = jasmine.createSpyObj('SyncApiService', ['ping']);

    // Setup default return values for database operations
    userDBSpy.addOrUpdateUser$.and.returnValue(of(void 0));
    userDBSpy.removeUser$.and.returnValue(of(void 0));
    userDBSpy.getUser$.and.returnValue(of(null));
    groupDBSpy.removeAllGroups$.and.returnValue(of(void 0));
    expensesDBSpy.removeAllExpenses$.and.returnValue(of(void 0));
    syncQueueDBSpy.clearQueue$.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      providers: [
        AuthFacade,
        { provide: AuthApiService, useValue: authApiSpy },
        { provide: ToastrService, useValue: toastSpy },
        { provide: TokenState, useValue: tokenStateSpy },
        { provide: Router, useValue: routerSpy },
        { provide: RxdbService, useValue: rxdbServiceSpy },
        { provide: UserDBState, useValue: userDBSpy },
        { provide: GroupDBState, useValue: groupDBSpy },
        { provide: ExpensesDBState, useValue: expensesDBSpy },
        { provide: SyncQueueDBState, useValue: syncQueueDBSpy },
        { provide: SyncApiService, useValue: syncApiSpy },
        provideZonelessChangeDetection(),
        provideHttpClient(),
      ],
    }).compileComponents();

    service = TestBed.inject(AuthFacade);
    mockAuthApi = TestBed.inject(
      AuthApiService,
    ) as jasmine.SpyObj<AuthApiService>;
    mockToast = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
    mockTokenState = TestBed.inject(TokenState) as jasmine.SpyObj<TokenState>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockRxdbService = TestBed.inject(
      RxdbService,
    ) as jasmine.SpyObj<RxdbService>;
    mockUserDB = TestBed.inject(UserDBState) as jasmine.SpyObj<UserDBState>;
    mockGroupDB = TestBed.inject(GroupDBState) as jasmine.SpyObj<GroupDBState>;
    mockExpensesDB = TestBed.inject(
      ExpensesDBState,
    ) as jasmine.SpyObj<ExpensesDBState>;
    mockSyncQueueDB = TestBed.inject(
      SyncQueueDBState,
    ) as jasmine.SpyObj<SyncQueueDBState>;
    mockSyncApi = TestBed.inject(
      SyncApiService,
    ) as jasmine.SpyObj<SyncApiService>;
  });

  describe('login', () => {
    const loginData: LoginRequest = { email: 'test', password: 'password' };

    it('should call login API and handle success', async () => {
      mockAuthApi.login.and.returnValue(of(mockResponse));

      service.login(loginData);

      // Wait for async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(mockAuthApi.login).toHaveBeenCalledWith(loginData);
      expect(mockTokenState.setTokens).toHaveBeenCalledWith(
        'mock-token',
        'mock-refresh',
      );
      expect(mockUserDB.addOrUpdateUser$).toHaveBeenCalledWith(
        mockResponse.data.user,
      );
      expect(mockToast.success).toHaveBeenCalledWith('Login successful!');
      expect(mockRouter.navigate).toHaveBeenCalled();
    });

    it('should handle database error during login', async () => {
      mockAuthApi.login.and.returnValue(of(mockResponse));
      mockUserDB.addOrUpdateUser$.and.returnValue(
        throwError(() => new Error('DB Error')),
      );

      service.login(loginData);

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockAuthApi.login).toHaveBeenCalledWith(loginData);
      expect(mockTokenState.setTokens).toHaveBeenCalledWith(
        'mock-token',
        'mock-refresh',
      );
      expect(mockToast.error).toHaveBeenCalledWith('Login Failed!', 'DB Error');
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        service.ROUTER_LINKS.LOGIN,
      ]);
    });
  });

  describe('register', () => {
    const registerData: RegisterRequest = {
      username: 'test',
      password: 'password',
      email: 'test@test.com',
    };

    it('should call register API and handle success', async () => {
      mockAuthApi.register.and.returnValue(of(mockResponse));

      service.register(registerData);

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockAuthApi.register).toHaveBeenCalledWith(registerData);
      expect(mockToast.success).toHaveBeenCalledWith(
        'Registration successful!',
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        service.ROUTER_LINKS.LOGIN,
      ]);
    });
  });

  describe('computed signal methods', () => {
    it('should return signals', () => {
      expect(typeof service.getCurrentUser()).toBe('function');
      expect(typeof service.getCurrentUsername()).toBe('function');
      expect(typeof service.isAuthenticated()).toBe('function');
      expect(typeof service.isLoading()).toBe('function');
      expect(typeof service.getError()).toBe('function');
    });
  });

  describe('logout', () => {
    it('should clear tokens and auth state when confirmed', async () => {
      spyOn(service, 'confirmLogout').and.returnValue(true);
      spyOn(service, 'clearDB');

      await service.logout();

      expect(service.clearDB).toHaveBeenCalled();
      expect(mockTokenState.clearTokens).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith('Logout successful!');
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        service.ROUTER_LINKS.LOGIN,
      ]);
    });

    it('should not logout when not confirmed', async () => {
      spyOn(service, 'confirmLogout').and.returnValue(false);
      spyOn(service, 'clearDB');

      await service.logout();

      expect(service.clearDB).not.toHaveBeenCalled();
      expect(mockTokenState.clearTokens).not.toHaveBeenCalled();
      expect(mockToast.success).not.toHaveBeenCalled();
    });
  });

  describe('setError', () => {
    it('should not throw error when calling setError', () => {
      expect(() => service.setError('some error')).not.toThrow();
    });
  });

  describe('refreshToken', () => {
    it('should set new tokens if refresh succeeds', async () => {
      const refreshToken = 'mock-refresh';
      const newTokens: AuthenticationTokens = {
        token: 'new-token',
        refresh_token: 'new-refresh',
      };
      mockAuthApi.refreshToken.and.returnValue(of(newTokens));

      await service.refreshToken(refreshToken);

      expect(mockAuthApi.refreshToken).toHaveBeenCalledWith(refreshToken);
      expect(mockTokenState.setTokens).toHaveBeenCalledWith(
        'new-token',
        'new-refresh',
      );
    });

    it('should clear tokens if refresh fails', async () => {
      const refreshToken = 'mock-refresh';
      mockAuthApi.refreshToken.and.returnValue(
        throwError(() => new Error('Refresh failed')),
      );

      await service.refreshToken(refreshToken);

      expect(mockTokenState.clearTokens).toHaveBeenCalled();
    });
  });

  describe('getToken', () => {
    it('should return access token and call refresh', () => {
      mockTokenState.getAccessToken.and.returnValue('existing-token');
      mockTokenState.getRefreshToken.and.returnValue('existing-refresh');
      spyOn(service, 'refreshToken').and.returnValue(Promise.resolve());

      const token = service.getToken();

      expect(token).toBe('existing-token');
      expect(service.refreshToken).toHaveBeenCalledWith('existing-refresh');
    });
  });

  describe('clearDB', () => {
    it('should call remove methods on all database states', () => {
      service.clearDB();

      expect(mockUserDB.removeUser$).toHaveBeenCalled();
      expect(mockGroupDB.removeAllGroups$).toHaveBeenCalled();
      expect(mockExpensesDB.removeAllExpenses$).toHaveBeenCalled();
      expect(mockSyncQueueDB.clearQueue$).toHaveBeenCalled();
    });
  });
});
