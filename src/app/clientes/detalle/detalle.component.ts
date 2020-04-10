import { Component, OnInit, Input } from '@angular/core';
import { Cliente } from '../cliente';
import { ClienteService } from '../cliente.service';
import { ModalService } from './modal.service';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpEventType } from '@angular/common/http';
import { AuthService } from '../../usuarios/auth.service';
import { FacturaService } from '../../facturas/services/factura.service';
import { Factura } from '../../facturas/models/factura';

import { URL_BACKEND } from '../../config/config';

@Component({
  selector: 'detalle-cliente',
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.css']
})
export class DetalleComponent implements OnInit {

  @Input() cliente: Cliente;
  titulo: string = "Detalle del cliente";
  public fotoSeleccionada: File;
  progreso: number = 0;
  urlBackend: string = URL_BACKEND;

  constructor(private clienteService: ClienteService,
              private facturaService: FacturaService,
              public authService: AuthService,
              public modalService: ModalService) { }

  ngOnInit() {
  }

  seleccionarFoto(event) {
    this.fotoSeleccionada = event.target.files[0];
    this.progreso = 0;
    console.log(this.fotoSeleccionada);
    if(this.fotoSeleccionada.type.indexOf('image') < 0) { //Busca la palabra image. Si no la encuentra, devuelve -1
      Swal.fire({
        title: 'Error seleccionar imagen: ',
        text: 'El archivo debe ser del tipo imagen',
        icon: 'error'
      });
      this.fotoSeleccionada = null; //reiniciamos la variable
    }
  }

  subirFoto(){
    if(!this.fotoSeleccionada){
      Swal.fire({
        title: 'Error Upload: ',
        text: 'Debe seleccionar una foto',
        icon: 'error'
      });
    } else {
      this.clienteService.subirFoto(this.fotoSeleccionada, this.cliente.id).subscribe(
        event => {
          if(event.type === HttpEventType.UploadProgress) {
            this.progreso = Math.round((event.loaded/event.total)*100);
          } else if(event.type === HttpEventType.Response) {
            let response: any = event.body;
            this.cliente = response.cliente as Cliente;

            this.modalService.notificarUpload.emit(this.cliente);
            Swal.fire({
              title: 'La foto se ha subido completamente!',
              text: response.mensaje,
              icon: 'success'
            });
          }
        }
      );
    }
  }

  cerrarModal(){
    this.modalService.cerrarModal();
    this.fotoSeleccionada = null;
    this.progreso = 0;
  }

  delete(factura: Factura):void {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false
    });

    swalWithBootstrapButtons.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar la factura ${factura.descripcion}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, eliminar!',
      cancelButtonText: 'No, cancelar!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        this.facturaService.delete(factura.id).subscribe (
          response => {
            this.cliente.facturas = this.cliente.facturas.filter(f => f !== factura)
            swalWithBootstrapButtons.fire(
              'Factura eliminada!',
              `Factura ${factura.descripcion} eliminada con éxito`,
              'success'
            )
          }
        )
      }
    })
  }
}
