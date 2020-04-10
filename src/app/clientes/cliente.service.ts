import { Injectable } from '@angular/core';
import { formatDate, DatePipe } from '@angular/common';
import { Cliente } from './cliente';
import { Region } from './region';
import { of, Observable, throwError } from 'rxjs';
import { HttpClient, HttpRequest, HttpEvent } from '@angular/common/http';
import { map, catchError, tap } from 'rxjs/operators';

import { Router } from '@angular/router';

import { URL_BACKEND } from '../config/config';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private urlEndPoint: string = URL_BACKEND + '/api/clientes';

  // No se necesita mas, ya que se creo la clase token.interceptor que se encarga de agregar esta authorization.
  // private httpHeaders = new HttpHeaders({'Content-Type': 'application/json'})

  constructor(private http:HttpClient,
              private router: Router) { }

// No se necesita mas, ya que se creo la clase token.interceptor que se encarga de agregar esta authorization.
  // private agregarAuthorizationHeader() {
  //   //Metodo que sera llamado en cada peticion hacia las rutas protegidas
  //   let token = this.authService.token;
  //   if(token != null) {
  //     //httpHeaders es inmutable, se crea una nueva instancia
  //     return this.httpHeaders.append('Authorization', 'Bearer ' + token);
  //   }
  //   return this.httpHeaders;
  // }

// No se necesita mas, ya que se creo la clase auth.interceptor realiza esta funcionalidad.
  // private isNotAutorizado(e): boolean {
  //   if(e.status == 401) { //No autorizado
  //     if(this.authService.isAuthenticated()){
  //       //Verifico si el 401 no se debe a que expiro el token en el BK
  //       //y en ese caso, se debe cerrar sesion.
  //       this.authService.logout();
  //     }
  //     this.router.navigate(['/login']);
  //     return true;
  //   }
  //
  //   if(e.status == 403) { //Acceso denegado
  //     Swal.fire({
  //       title: 'Acceso denegado',
  //       text: `Hola ${this.authService.usuario.username} no tienes acceso a este recurso!`,
  //       icon: 'warning'
  //     });
  //     this.router.navigate(['/clientes']);
  //     return true;
  //   }
  //
  //   return false;
  // }

  getRegiones(): Observable<Region[]> {
    return this.http.get<Region[]>(this.urlEndPoint + '/regiones');
  }

  getClientes(page: number): Observable<any> {
    return this.http.get(this.urlEndPoint + '/page/' + page).pipe(
      tap( (response: any) => {
        console.log('ClienteService: tap 1');
        (response.content as Cliente[]).forEach(cliente => {
          console.log(cliente.nombre);
        });
      }),
      map( (response: any) => {
        (response.content as Cliente[]).map(cliente => {
          //Pasamos el nombre a mayusculas
          cliente.nombre = cliente.nombre.toUpperCase();
          //let datePipe = new DatePipe('es');
          //cliente.createAt = datePipe.transform(cliente.createAt, 'EEEE dd, MMMM yyyy');
          // alternativa a datePipe
          //cliente.createAt = formatDate(cliente.createAt, 'dd-MM-yyyy','en-US');
          return cliente;
        });
        return response;
      }),
      tap ( response => {
        console.log('ClienteService: tap 2');
        (response.content as Cliente[]).forEach(cliente => {
          console.log(cliente.nombre);
        });
      })
    );
  }

  create(cliente: Cliente): Observable<Cliente> {
    return this.http.post<any>(this.urlEndPoint, cliente).pipe(
      map( (response: any) => response.cliente as Cliente),
      catchError(e => {
        //VER AUTH.INTERCEPTOR
        // if(this.isNotAutorizado(e)){
        //   return throwError(e);
        // }

        if(e.status == 400) {
          return throwError(e);
        }
        if(e.error.mensaje){
          console.error(e.error.mensaje);
        }
        return throwError(e);
      })
    );
  }

  getCliente(id): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.urlEndPoint}/${id}`).pipe(
      catchError(e => {
        if(e.status != 401 && e.error.mensaje) {
          this.router.navigate(['/clientes']);
          console.error(e.error.mensaje);
        }
        return throwError(e);
      })
    );
  }

  update(cliente: Cliente):Observable<Cliente> {
    return this.http.put<any>(`${this.urlEndPoint}/${cliente.id}`, cliente).pipe(
      map( (response: any) => response.cliente as Cliente),
      catchError(e => {

        if(e.status == 400) {
          return throwError(e);
        }

        if(e.error.mensaje){
          console.error(e.error.mensaje);
        }
        return throwError(e);
      })
    );
  }

  delete(id: number): Observable<Cliente> {
    return this.http.delete<Cliente>(`${this.urlEndPoint}/${id}`).pipe(
      catchError(e => {
        if(e.error.mensaje){
          console.error(e.error.mensaje);
        }
        return throwError(e);
      })
    );
  }

  subirFoto(archivo: File, id): Observable<HttpEvent<{}>> {
    let formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("id", id);

    // No se necesita mas, ya que se creo la clase token.interceptor que se encarga de agregar esta authorization.
    // //Creamos un nuevo headers porque el atributo de la clase ya tiene el content-Type
    // // y aca vamos a mandar un FormData
    // let httpHeaders = new HttpHeaders();
    // let token = this.authService.token;
    // if(token != null) {
    //   httpHeaders = httpHeaders.append('Authorization', 'Bearer ' + token);
    // }

    const req = new HttpRequest('POST', `${this.urlEndPoint}/upload`, formData, {
      reportProgress: true
      // headers: httpHeaders
    });

    return this.http.request(req);

  }
}
