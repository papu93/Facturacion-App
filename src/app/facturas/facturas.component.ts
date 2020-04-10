import { Component, OnInit } from '@angular/core';
import { Factura } from './models/factura';
import { ClienteService } from '../clientes/cliente.service';
import { ActivatedRoute } from '@angular/router';
import { FacturaService } from './services/factura.service';
import { Producto } from './models/producto';
import { ItemFactura } from './models/item-factura';

import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, flatMap} from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material';

import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-facturas',
  templateUrl: './facturas.component.html'
})
export class FacturasComponent implements OnInit {

  titulo: string = 'Nueva Factura';
  factura: Factura = new Factura();

  autoCompleteControl = new FormControl();
  productosFiltrados: Observable<Producto[]>;

  constructor(private clienteService: ClienteService,
              private facturaService: FacturaService,
              private router: Router,
              private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      let clienteId = +params.get('clienteId');
      this.clienteService.getCliente(clienteId).subscribe(cliente => this.factura.cliente = cliente);
    });

    this.productosFiltrados = this.autoCompleteControl.valueChanges
      .pipe(
        //Si es string, devuelve el valor, sino es Producto y devuelve el nombre
        map(value => typeof value === 'string' ? value : value.nombre),

        //FlatMap convierte un observable en otro
        flatMap(value => value ? this._filter(value) : []) //Verificamos que exista value
      );
  }

  private _filter(value: string): Observable<Producto[]> {
    const filterValue = value.toLowerCase();

    return this.facturaService.filtrarProductos(filterValue);
  }

  mostrarNombre(producto?: Producto): string | undefined {
    return producto ? producto.nombre : undefined;
  }

  seleccionarProducto(event: MatAutocompleteSelectedEvent): void {
    /* Este metodo agrega el producto seleccionado a un nuevo item o incrementa si ya existe**/
    let producto = event.option.value as Producto;
    console.log(producto);

    if(this.existeItem(producto.id)) {
      //Si ya existe, solo incrementamos la cantidad
      this.incrementaCantidad(producto.id);
    } else {
      // Creamos el item con el seleccionado y lo agregamos a Factura
      let nuevoItem = new ItemFactura();
      nuevoItem.producto = producto;
      this.factura.items.push(nuevoItem);
    }

    //Reseteamos variables de la vista
    this.autoCompleteControl.setValue('');
    event.option.focus();
    event.option.deselect();
  }

  actualizarCantidad(id:number, event:any):void {
  /* Actualiza el atributo cantidad en el item, de acuerdo a lo ingresado**/
    let cantidad:number = event.target.value as number;

    if(cantidad == 0) { //Si la cantidad es 0, eliminamos el item
      return this.eliminarItemFactura(id);
    }

    //Buscamos el producto por el id, y le actualizamos la cantidad
    this.factura.items = this.factura.items.map((item:ItemFactura) => {
      if(id === item.producto.id) {
        item.cantidad = cantidad;
      }
      return item;
    });
  }

  existeItem(id:number):boolean {
  /* Verifica si un producto ya fue agregado a un item **/
    let existe = false;
    this.factura.items.forEach((item: ItemFactura) => {
      if(id === item.producto.id) {
        existe = true;
      }
    });
    return existe;
  }

  incrementaCantidad(id:number): void {
    //Buscamos el producto por el id, y le incremetanos la cantidad
    this.factura.items = this.factura.items.map((item:ItemFactura) => {
      if(id === item.producto.id) {
        ++item.cantidad; //Incrementamos la cantidad
      }
      return item;
    });
  }

  eliminarItemFactura(id: number): void {
    this.factura.items = this.factura.items.filter((item: ItemFactura) => id !== item.producto.id);
  }

  create(facturaForm): void {
    console.log(this.factura);

    if(this.factura.items.length == 0) {
      this.autoCompleteControl.setErrors({'invalid':true});
    }

    //Valido los datos del form y que tenga items cargados
    if(facturaForm.form.valid && this.factura.items.length > 0) {

      this.facturaService.create(this.factura).subscribe(factura => {
        Swal.fire({
          title: this.titulo,
          text: `Factura ${this.factura.descripcion} creada con éxito!`,
          icon: 'success'
        });
        this.router.navigate(['/facturas', factura.id]);
      });
    }

  }
}
