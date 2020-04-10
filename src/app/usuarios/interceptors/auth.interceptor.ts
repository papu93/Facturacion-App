import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { AuthService } from '../auth.service';
import Swal from 'sweetalert2';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

/** Pass untouched request through to the next request handler. */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService,
              private router: Router) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {

      return next.handle(req).pipe(
        catchError(e => {
          if(e.status == 401) { //No autorizado
            if(this.authService.isAuthenticated()){
              //Verifico si el 401 no se debe a que expiro el token en el BK
              //y en ese caso, se debe cerrar sesion.
              this.authService.logout();
            }
            this.router.navigate(['/login']);
          }

          if(e.status == 403) { //Acceso denegado
            Swal.fire({
              title: 'Acceso denegado',
              text: `Hola ${this.authService.usuario.username} no tienes acceso a este recurso!`,
              icon: 'warning'
            });
            this.router.navigate(['/clientes']);
          }
          return throwError(e);
        })
      );
    }
  }
