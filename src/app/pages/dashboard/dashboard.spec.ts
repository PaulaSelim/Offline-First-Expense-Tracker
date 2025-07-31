import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Dashboard } from './dashboard';

import { Todo } from '../../core/api/todo/todo.model';
import { signal } from '@angular/core';
import { AuthFacade } from '../../service/auth/auth.service';
import { TodoFacade } from '../../service/todo/todo.service';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let mockTodoFacade: jasmine.SpyObj<TodoFacade>;
  let mockAuthFacade: jasmine.SpyObj<AuthFacade>;

  const mockTodos: Todo[] = [
    {
      id: '1',
      name: 'Test Todo 1',
      description: 'Description 1',
      completed: false,
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z',
    },
    {
      id: '2',
      name: 'Test Todo 2',
      description: 'Description 2',
      completed: true,
      createdAt: '2024-01-02T10:00:00Z',
      updatedAt: '2024-01-02T10:00:00Z',
    },
  ];

  beforeEach(async () => {
    mockTodoFacade = jasmine.createSpyObj('TodoFacade', [
      'loadTodos',
      'addTodo',
      'deleteTodo',
      'updateTodo',
      'getTodos',
      'getTotalTodos',
      'getCompletedTodos',
      'getPendingTodos',
    ]);
    mockTodoFacade.getTodos.and.returnValue(signal(mockTodos));
    mockTodoFacade.getTotalTodos.and.returnValue(mockTodos.length);
    mockTodoFacade.getCompletedTodos.and.returnValue(
      mockTodos.filter((t) => t.completed).length,
    );
    mockTodoFacade.getPendingTodos.and.returnValue(
      mockTodos.filter((t) => !t.completed).length,
    );

    mockAuthFacade = jasmine.createSpyObj('AuthFacade', ['getCurretUsername']);
    mockAuthFacade.getCurretUsername.and.returnValue(signal('testuser'));

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([
          { path: '', component: {} as any },
          { path: 'edit/:id', component: {} as any },
        ]),
        { provide: TodoFacade, useValue: mockTodoFacade },
        { provide: AuthFacade, useValue: mockAuthFacade },
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get todo list from TodoFacade', () => {
    expect(component.todoList()).toEqual(mockTodos);
  });

  it('should get username from AuthFacade', () => {
    expect(component.username()).toBe('testuser');
  });

  it('should handle guest username', () => {
    mockAuthFacade.getCurretUsername.and.returnValue(signal('Guest'));

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;

    expect(component.username()).toBe('Guest');
  });

  it('should call addTodo with correct parameters', () => {
    const name = 'New Todo';
    const description = 'New Description';

    component.onAdd(name, description);

    expect(mockTodoFacade.addTodo).toHaveBeenCalledWith(name, description);
  });

  it('should handle empty todo list', () => {
    const emptyTodos: Todo[] = [];
    mockTodoFacade.getTodos.and.returnValue(signal(emptyTodos));
    mockTodoFacade.getTotalTodos.and.returnValue(0);
    mockTodoFacade.getCompletedTodos.and.returnValue(0);
    mockTodoFacade.getPendingTodos.and.returnValue(0);

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;

    expect(component.todoList()).toEqual([]);
  });

  it('should call onAdd with empty strings', () => {
    component.onAdd('', '');

    expect(mockTodoFacade.addTodo).toHaveBeenCalledWith('', '');
  });
});
