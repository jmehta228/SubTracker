import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  identifier = '';
  password = '';
  error = '';
  showPassword = false;
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    const identifier = this.identifier.trim();
    if (!identifier || !this.password) {
      this.error = 'Email/username and password are required';
      return;
    }

    this.error = '';
    this.isLoading = true;

    this.authService.login(identifier, this.password).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('userId', res.userId);
        const email = res.email ?? (identifier.includes('@') ? identifier : null);
        if (typeof email === 'string' && email.trim()) {
          localStorage.setItem('userEmail', email);
        } else {
          localStorage.removeItem('userEmail');
        }
        const username = res.username ?? (!identifier.includes('@') ? identifier : null);
        if (typeof username === 'string' && username.trim()) {
          localStorage.setItem('username', username.trim());
        } else {
          localStorage.removeItem('username');
        }
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error(err);
        this.error = err.status === 0
          ? 'Unable to reach the server. Make sure the backend is running on http://localhost:4000.'
          : (err.error?.error || 'Invalid email/username or password');
        this.isLoading = false;
      }
    });
  }
}
