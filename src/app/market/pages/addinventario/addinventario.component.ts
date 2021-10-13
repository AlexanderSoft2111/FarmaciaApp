import { Component, OnInit, ViewChild} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Paths, Producto, InvProducto } from '../../../models/models';
import { FirestoreService } from '../../../services/firestore.service';
import { ActivatedRoute, Router } from '@angular/router';
import { InteraccionService } from '../../../services/interaccion.service';
import { IonInput } from '@ionic/angular';
import { Subject} from 'rxjs';
import { debounceTime } from 'rxjs/operators';


@Component({
  selector: 'app-addinventario',
  templateUrl: './addinventario.component.html',
  styleUrls: ['./addinventario.component.scss'],
})
export class AddinventarioComponent implements OnInit{

  articuloForm = this.fb.group({
    codigo: [{value: '', disabled: true}, Validators.required, ],
    descripcion: ['', Validators.required],
    lote: ['', [Validators.required]],
    precio_compra: [null, [Validators.required, Validators.min(0)]],
    precio_venta: [null, [Validators.required, Validators.min(0)]],
    fecha_caducidad: [null, Validators.required],
    fecha_elaboracion: [null],
  });

  codigoProducto = '';
  producto: Producto = null;
  invProducto: InvProducto = null;
  titulo = 'Nuevo Artículo';
  descripcion = 'Agregar nuevo artículo';
  debouncer: Subject<string> = new Subject();
  update: boolean = false;

  
  @ViewChild('codigo') codigoInput: IonInput;
  

  constructor(private fb: FormBuilder,
              private firestoreService: FirestoreService,
              private activatedRoute: ActivatedRoute,
              private interaccionService: InteraccionService,
              private router: Router) { 
                this.codigoProducto = this.activatedRoute.snapshot.paramMap.get('id');
                console.log('id -> ',  this.codigoProducto);

              }

  ngOnInit() {

    //Colocamos el foco en el input
      this.focusInputCodigo();

      //Se inicializa un observable para hacer la busqueda cada cierto tiempo
      
   this.debouncer
      .pipe(debounceTime(300))
      .subscribe( valor => {
        this.findProducto(valor);
      }); 
     
  }

  campoNoValido(campo: string): boolean{
     return this.articuloForm.controls[campo].errors &&
            this.articuloForm.controls[campo].touched;
  }

  focusInputCodigo() {
      setTimeout( () => { 
        this.codigoInput.setFocus();
      }, 500); 
      
  }


  changeCodigo() {
     this.articuloForm.controls['codigo'].setValue(this.codigoProducto);

       this.debouncer.next(this.codigoProducto); 

      
  }

   onSubmit() {

    if(this.articuloForm.invalid){
      this.articuloForm.markAllAsTouched;
      
    } else {

          if (this.articuloForm.controls['codigo'].value === null) {
              this.interaccionService.showToast('Ingresa el código del producto');
              return;
          }

          if(this.update){
            this.actualizarProducto();
          } else{

            let newArticulo: Producto = {
  
              codigo: this.articuloForm.controls['codigo'].value,
              descripcion: this.articuloForm.controls['descripcion'].value,
              lote: this.articuloForm.controls['lote'].value,
              precio_compra: this.articuloForm.controls['precio_compra'].value,
              precio_venta: this.articuloForm.controls['precio_venta'].value,
              fecha_caducidad: this.articuloForm.controls['fecha_caducidad'].value,
              fecha_elaboracion: this.articuloForm.controls['fecha_elaboracion'].value,
              fecha_creacion: new Date(),
              descuento: false
            };
  
           let invProducto: InvProducto = {
              cantidad: null,
              um: 'CJ',
              producto: newArticulo,
              fecha_ingreso: new Date()
            }
  
            const path = Paths.productos;
            this.firestoreService.createDocumentID<Producto>(newArticulo, path, newArticulo.codigo).then( () => {
                  this.interaccionService.showToast('Guardado con éxito');
                  this.resetForm();
                  this.update = false;
                  this.codigoProducto = '';
                }); 
                this.firestoreService.createDocumentID<InvProducto>(invProducto, Paths.inventario, newArticulo.codigo).then( () => {});    
                newArticulo = {
                  codigo: '',
                  descripcion: '',
                  lote: '',
                  precio_compra: null,
                  precio_venta: null,
                  fecha_caducidad: new Date(),
                  fecha_elaboracion: new Date(),
                  fecha_creacion: new Date(),
                  descuento: false
                }; 

                invProducto = {
                  cantidad: null,
                  um: 'CJ',
                  producto: newArticulo,
                  fecha_ingreso: new Date()
                }
            }
        }
  }

  actualizarProducto(){
    console.log('se ejecuto actualizando');
    let newArticulo: Producto = {
      codigo: this.articuloForm.controls['codigo'].value,
      descripcion: this.articuloForm.controls['descripcion'].value,
      lote: this.articuloForm.controls['lote'].value,
      precio_compra: this.articuloForm.controls['precio_compra'].value,
      precio_venta: this.articuloForm.controls['precio_venta'].value,
      fecha_caducidad: this.articuloForm.controls['fecha_caducidad'].value,
      fecha_elaboracion: this.articuloForm.controls['fecha_elaboracion'].value,
      fecha_creacion: new Date(),
      descuento: false
    };

   let invProducto: InvProducto = {
      cantidad: this.invProducto.cantidad,
      um: 'CJ',
      producto: newArticulo,
      fecha_ingreso: new Date()
    }
    this.firestoreService.updateDocumentID<InvProducto>(invProducto, Paths.inventario, invProducto.producto.codigo).then( () => {});  
    this.firestoreService.updateDocumentID<Producto>(newArticulo,Paths.productos,newArticulo.codigo).then(() => {
      this.interaccionService.showToast('Se actualizo con éxito');
      this.resetForm();
    });

    
    if (this.titulo === 'Editar Artículo') {
      setTimeout(() => {
        this.router.navigate(['market/inventario']);
      }, 500);
    }
  }

  findProducto(id: string) {
    
     if(this.codigoProducto === '') {
        this.resetForm();
        this.update = false;
     } else{

       const path = Paths.inventario + id;
       const desubscribirnos = this.firestoreService.getDocumentChanges<InvProducto>(path).subscribe( res => {
           if (res) {
               this.update = true;
               this.titulo = 'Editar Artículo';
               this.descripcion = 'Editar artículo existente';
               this.invProducto = res;
               this.articuloForm.controls['codigo'].setValue(this.invProducto.producto.codigo);
               this.articuloForm.controls['descripcion'].setValue(this.invProducto.producto.descripcion);
               this.articuloForm.controls['lote'].setValue(this.invProducto.producto.lote);
               this.articuloForm.controls['precio_compra'].setValue(this.invProducto.producto.precio_compra);
               this.articuloForm.controls['precio_venta'].setValue(this.invProducto.producto.precio_venta);
               this.articuloForm.controls['fecha_caducidad'].setValue(this.invProducto.producto.fecha_caducidad);
               this.articuloForm.controls['fecha_elaboracion'].setValue(this.invProducto.producto.fecha_elaboracion);
             } else {
               console.log('no existe producto', this.invProducto);
 
               this.update = false;
               this.invProducto = null;
               this.titulo = 'Nuevo Artículo';
               this.descripcion = 'Agregar nuevo artículo';
               this.resetBusqueda();
             }
             desubscribirnos.unsubscribe();
           });
      
     }
          
  }

  resetForm() {    

    this.articuloForm.reset();
    this.codigoProducto = '';
    this.invProducto = null;
  }

  resetBusqueda(){
    this.articuloForm.controls['descripcion'].setValue('');
    this.articuloForm.controls['lote'].setValue('');
    this.articuloForm.controls['precio_compra'].setValue('');
    this.articuloForm.controls['precio_venta'].setValue('');
    this.articuloForm.controls['fecha_caducidad'].setValue('');
    this.articuloForm.controls['fecha_elaboracion'].setValue('');
  }



}
