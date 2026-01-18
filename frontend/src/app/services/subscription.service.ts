// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable } from 'rxjs';

// @Injectable({ providedIn: 'root' })
// export class SubscriptionService {
//   private api = 'http://localhost:4000/api/subscriptions';

//   constructor(private http: HttpClient) {}

//   addSubscription(userId: string, subscription: any): Observable<any> {
//     const token = localStorage.getItem('token');
//     const headers = new HttpHeaders({
//       Authorization: `Bearer ${token}`
//     });

//     return this.http.post(`${this.api}/${userId}`, subscription, { headers });
//   }

//   getSubscriptions(userId: string): Observable<any> {
//     const token = localStorage.getItem('token');
//     const headers = new HttpHeaders({
//       Authorization: `Bearer ${token}`
//     });

//     return this.http.get(`${this.api}/${userId}`, { headers });
//   }

//   deleteSubscription(subId: string): Observable<any> {
//     const token = localStorage.getItem('token');
//     const headers = new HttpHeaders({
//       Authorization: `Bearer ${token}`
//     });

//     return this.http.delete(`${this.api}/${subId}`, { headers });
//   }
// }

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private api = 'http://localhost:4000/api/subscriptions';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getSubscriptions(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/${userId}`, {
      headers: this.getAuthHeaders()
    });
  }

  addSubscription(userId: string, sub: any): Observable<any> {
    return this.http.post<any>(`${this.api}/${userId}`, sub, {
      headers: this.getAuthHeaders()
    });
  }

  deleteSubscription(id: string): Observable<any> {
    return this.http.delete(`${this.api}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  updateSubscription(id: string, updates: Partial<{ dueDate: string }>): Observable<any> {
    return this.http.put<any>(`${this.api}/${id}`, updates, {
      headers: this.getAuthHeaders()
    });
  }
}
