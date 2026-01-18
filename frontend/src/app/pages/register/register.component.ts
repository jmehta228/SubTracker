import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  error = '';
  showPassword = false;
  isLoading = false;

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  onRegister(): void {
    const username = this.username.trim();
    const email = this.email.trim().toLowerCase();

    if (!username || !email || !this.password) {
      this.error = 'All fields are required';
      return;
    }

    if (this.password.length < 8) {
      this.error = 'Password must be at least 8 characters';
      return;
    }

    this.error = '';
    this.isLoading = true;

    this.authService.register(email, this.password, username).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('userId', res.userId);
        localStorage.setItem('userEmail', res.email ?? email);
        localStorage.setItem('username', res.username ?? username);
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        console.error('Registration failed', err);
        this.error = err.status === 0
          ? 'Unable to reach the server. Make sure the backend is running on http://localhost:4000.'
          : (err.error?.error || err.error?.message || 'Registration failed. Try again.');
        this.isLoading = false;
      }
    });
  }
}
