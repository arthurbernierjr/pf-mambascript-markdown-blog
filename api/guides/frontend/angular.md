---
title: "Angular Fundamentals"
subTitle: "The Enterprise-Ready Framework"
excerpt: "Angular gives you everything you need out of the box."
featureImage: "/img/angular.png"
date: "2026-02-01"
order: 752
---

# Explanation

## Why Angular?

Angular is a full-featured framework maintained by Google. Unlike React or Vue which are libraries, Angular provides everything: routing, forms, HTTP client, testing, and more. It's opinionated, which means less decision fatigue.

Think of Angular as a complete toolkit:
- Everything included
- Strong conventions
- TypeScript by default
- Enterprise-ready

### Key Concepts

- **Components**: Building blocks with template, style, and logic
- **Modules**: Containers for related components and services
- **Services**: Shared logic and data
- **Dependency Injection**: Automatic service instantiation
- **Observables**: Async data streams with RxJS

### Angular vs React/Vue

| Feature | Angular | React | Vue |
|---------|---------|-------|-----|
| Type | Framework | Library | Framework |
| Language | TypeScript | JavaScript | JavaScript |
| Data binding | Two-way | One-way | Both |
| Learning curve | Steep | Moderate | Gentle |
| CLI | Powerful | Basic | Good |

---

# Demonstration

## Example 1: Component Basics

```typescript
// counter.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <div class="counter">
      <h1>Count: {{ count }}</h1>
      <p>Double: {{ doubleCount }}</p>

      <button (click)="decrement()">-</button>
      <button (click)="reset()">Reset</button>
      <button (click)="increment()">+</button>
    </div>
  `,
  styles: [`
    .counter {
      text-align: center;
      padding: 20px;
    }
    button {
      margin: 0 5px;
      padding: 10px 20px;
    }
  `]
})
export class CounterComponent {
  count = 0;

  get doubleCount(): number {
    return this.count * 2;
  }

  increment(): void {
    this.count++;
  }

  decrement(): void {
    this.count--;
  }

  reset(): void {
    this.count = 0;
  }
}
```

## Example 2: Services and Dependency Injection

```typescript
// user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api/users';
  private usersSubject = new BehaviorSubject<User[]>([]);

  users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      tap(users => this.usersSubject.next(users))
    );
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user).pipe(
      tap(newUser => {
        const current = this.usersSubject.value;
        this.usersSubject.next([...current, newUser]);
      })
    );
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const current = this.usersSubject.value;
        this.usersSubject.next(current.filter(u => u.id !== id));
      })
    );
  }
}

// user-list.component.ts
import { Component, OnInit } from '@angular/core';
import { UserService, User } from './user.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-list',
  template: `
    <div *ngIf="loading">Loading...</div>
    <div *ngIf="error">{{ error }}</div>

    <ul *ngIf="users$ | async as users">
      <li *ngFor="let user of users">
        {{ user.name }} ({{ user.email }})
        <button (click)="deleteUser(user.id)">Delete</button>
      </li>
    </ul>
  `
})
export class UserListComponent implements OnInit {
  users$: Observable<User[]>;
  loading = true;
  error: string | null = null;

  constructor(private userService: UserService) {
    this.users$ = this.userService.users$;
  }

  ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: () => this.loading = false,
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  deleteUser(id: number): void {
    this.userService.deleteUser(id).subscribe();
  }
}
```

## Example 3: Reactive Forms

```typescript
// user-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from './user.service';

@Component({
  selector: 'app-user-form',
  template: `
    <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label for="name">Name</label>
        <input id="name" formControlName="name">
        <div *ngIf="userForm.get('name')?.errors?.['required'] && userForm.get('name')?.touched"
             class="error">
          Name is required
        </div>
        <div *ngIf="userForm.get('name')?.errors?.['minlength']"
             class="error">
          Name must be at least 2 characters
        </div>
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input id="email" type="email" formControlName="email">
        <div *ngIf="userForm.get('email')?.errors?.['required'] && userForm.get('email')?.touched"
             class="error">
          Email is required
        </div>
        <div *ngIf="userForm.get('email')?.errors?.['email']"
             class="error">
          Invalid email format
        </div>
      </div>

      <div class="form-group">
        <label for="role">Role</label>
        <select id="role" formControlName="role">
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
        </select>
      </div>

      <button type="submit" [disabled]="userForm.invalid || submitting">
        {{ submitting ? 'Saving...' : 'Save' }}
      </button>
    </form>

    <pre>{{ userForm.value | json }}</pre>
  `
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['user']
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.userForm.valid) {
      this.submitting = true;
      this.userService.createUser(this.userForm.value).subscribe({
        next: () => {
          this.userForm.reset({ role: 'user' });
          this.submitting = false;
        },
        error: () => {
          this.submitting = false;
        }
      });
    }
  }
}
```

## Example 4: Routing

```typescript
// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'users', component: UserListComponent, canActivate: [AuthGuard] },
  { path: 'users/:id', component: UserDetailComponent, canActivate: [AuthGuard] },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard]
  },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

// user-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService, User } from './user.service';

@Component({
  selector: 'app-user-detail',
  template: `
    <div *ngIf="user">
      <h1>{{ user.name }}</h1>
      <p>{{ user.email }}</p>
      <button (click)="goBack()">Back</button>
    </div>
  `
})
export class UserDetailComponent implements OnInit {
  user: User | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.userService.getUser(id).subscribe(user => this.user = user);
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
```

**Key Takeaways:**
- Components combine template, style, and logic
- Services handle shared data and business logic
- Dependency injection manages service instances
- Reactive forms provide powerful validation
- RxJS observables handle async operations

---

# Imitation

### Challenge 1: Create a Search Component

**Task:** Build a search component with debounced input.

<details>
<summary>Solution</summary>

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  template: `
    <input [formControl]="searchControl" placeholder="Search...">
    <div *ngIf="loading">Searching...</div>
    <ul>
      <li *ngFor="let result of results">{{ result }}</li>
    </ul>
  `
})
export class SearchComponent implements OnInit, OnDestroy {
  searchControl = new FormControl('');
  results: string[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      if (query) {
        this.search(query);
      }
    });
  }

  search(query: string): void {
    this.loading = true;
    // Simulate API call
    setTimeout(() => {
      this.results = ['Result 1', 'Result 2'].filter(r =>
        r.toLowerCase().includes(query.toLowerCase())
      );
      this.loading = false;
    }, 500);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

</details>

### Challenge 2: Create a Modal Service

**Task:** Build a reusable modal service.

<details>
<summary>Solution</summary>

```typescript
// modal.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ModalConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  private modalSubject = new BehaviorSubject<ModalConfig | null>(null);
  private resolveFunc: ((value: boolean) => void) | null = null;

  modal$ = this.modalSubject.asObservable();

  confirm(config: ModalConfig): Promise<boolean> {
    this.modalSubject.next({
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      ...config
    });

    return new Promise(resolve => {
      this.resolveFunc = resolve;
    });
  }

  close(result: boolean): void {
    this.modalSubject.next(null);
    if (this.resolveFunc) {
      this.resolveFunc(result);
      this.resolveFunc = null;
    }
  }
}

// Usage
const confirmed = await this.modalService.confirm({
  title: 'Delete User',
  message: 'Are you sure you want to delete this user?'
});
```

</details>

---

# Practice

### Exercise 1: Todo App
**Difficulty:** Beginner

Build a todo app with:
- Add, complete, delete todos
- Filter by status (all, active, completed)
- Persist to localStorage
- Animations

### Exercise 2: Dashboard
**Difficulty:** Advanced

Create a dashboard with:
- Multiple lazy-loaded modules
- Auth guard protection
- Data visualization components
- Real-time updates with WebSocket

---

## Summary

**What you learned:**
- Angular component architecture
- Services and dependency injection
- Reactive forms with validation
- Routing and navigation
- RxJS observables for async

**Next Steps:**
- Read: [Svelte Fundamentals](/api/guides/frontend/svelte)
- Practice: Build a CRUD app
- Deploy: Use Angular CLI for production build

---

## Resources

- [Angular Documentation](https://angular.io/docs)
- [Angular University](https://angular-university.io/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
