import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService,
              private router: Router) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    //Primero validamos si esta autenticado, para que no se ejecuten los 2 guards
    if(!this.authService.isAuthenticated()){
      //Si no esta autenticado, no es necesario verificar el rol, porque no tiene
      this.router.navigate(['/login']);
      return false;
    }

    //Obtiene el rol que se va a validar, definido en appModele
    let role = next.data['role'] as string;
    console.log(role);
    if(this.authService.hasRole(role)){
      return true;
    }
    Swal.fire({
      title: 'Acceso denegado',
      text: `Hola ${this.authService.usuario.username} no tienes acceso a este recurso!`,
      icon: 'warning'
    });
    this.router.navigate(['/clientes']);
    return false;
  }
}
