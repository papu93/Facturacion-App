import { Component, OnInit } from '@angular/core';
import { Cliente } from './cliente';
import { Region } from './region';
import { ClienteService } from './cliente.service';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {

  public cliente: Cliente = new Cliente();
  regiones: Region[];
  public titulo:string = "Crear Cliente";

  public errores: string[];

  constructor(private clienteService: ClienteService,
              private router: Router,
              private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.cargarCliente();
    this.cargarRegiones();
  }

  cargarCliente(): void {
    this.activatedRoute.params.subscribe(params => {
      let id = params['id'];
      if(id) {
        this.clienteService.getCliente(id).subscribe( (cliente) => this.cliente = cliente);
      }
    });
  }

  cargarRegiones(): void {
    this.clienteService.getRegiones().subscribe(regiones => this.regiones = regiones);
  }

  create(): void {
    console.log(this.cliente);
    this.clienteService.create(this.cliente).subscribe(
      cliente => {
        this.router.navigate(['/clientes']);
        Swal.fire({
          title: 'Nuevo cliente',
          text: `Cliente ${cliente.nombre} creado con éxito!`,
          icon: 'success'
        })
      },
      err => {
        this.errores = err.error.errors as string[];
        console.error('Código del error desde el backend: ' + err.status);
        console.error(err.error.errors);
      }
    );
  }

  update(): void {
    console.log(this.cliente);
    this.cliente.facturas = null; //No es necesario editar sus facturas
    this.clienteService.update(this.cliente)
    .subscribe (cliente => {
      this.router.navigate(['/clientes']);
      Swal.fire({
        title: 'Cliente actualizado',
        text: `Cliente ${cliente.nombre} actualizado con éxito!`,
        icon: 'success'
      })
    },
    err => {
      this.errores = err.error.errors as string[];
      console.error('Código del error desde el backend: ' + err.status);
      console.error(err.error.errors);
    });
  }

  compararRegion(o1: Region, o2:Region):boolean {
    // o1: Es el objeto que corresponde a la iteracion del for
    // o2: Es el objeto que tiene asociado el cliente
    //Si alguno de los objetos es null, devuelve false. Si no, devuelve si son iguales o no.
    if(o1 === undefined && o2 === undefined) {
      //Esto es para seleccionar el mensaje de seleccionar
      return true;
    }

    return o1 === null || o2 === null || o1 === undefined || o2 === undefined ? false : o1.id === o2.id;
  }
}
