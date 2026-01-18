// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';

// @Injectable({ providedIn: 'root' })
// export class AuthService {
//   private api = 'http://localhost:4000/api';

//   constructor(private http: HttpClient) {}

//   login(email: string, password: string): Observable<any> {
//     return this.http.post<any>(`${this.api}/login`, { email, password });
//   }

//   register(email: string, password: string): Observable<any> {
//     return this.http.post<any>(`${this.api}/register`, { email, password });
//   }

//   logout() {
//     localStorage.removeItem('token');
//     localStorage.removeItem('userId');
//   }

//   isLoggedIn(): boolean {
//     return !!localStorage.getItem('token');
//   }
// }



import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:4000/api/auth';

  constructor(private http: HttpClient) {}

  login(identifier: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.api}/login`, { identifier, password });
  }

  register(email: string, password: string, username: string): Observable<any> {
    return this.http.post<any>(`${this.api}/register`, { email, password, username });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('username');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
