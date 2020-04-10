import { Component } from '@angular/core';
import { AuthService } from '../usuarios/auth.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  title: string = 'App Angular - Spring';

  constructor(public authService: AuthService,
              private router: Router) {}

  logout(): void {
    let username = this.authService.usuario.username;
    this.authService.logout();
    Swal.fire({
      title: 'Logout',
      text: `Hola ${username}, has cerrado sesión con éxito!`,
      icon: 'success'
    });
    this.router.navigate(['/login']);
  }
}
