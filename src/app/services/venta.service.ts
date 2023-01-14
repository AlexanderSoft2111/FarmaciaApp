import { Injectable} from '@angular/core';
import { NumeroVenta, Venta, Paths, ProductoVenta } from '../models/models';
import { LocalstorageService } from './localstorage.service';
import { FirestoreService } from './firestore.service';
import { Subject } from 'rxjs';
import { InteraccionService } from './interaccion.service';


@Injectable({
  providedIn: 'root'
})
export class VentaService {

  venta: Venta;
  ventas: Venta[] = [];
  venta$ = new Subject<Venta>();
  ventas$ = new Subject<Venta[]>();
  pathLocal = 'venta';
  numeroVenta: NumeroVenta;

  pruebaVenta = {
    productos: [],
    cliente: {
      id: '',
      nombre: '',
      ruc: '',
      direccion: '',
      telefono: '',
      email: '',
      codCliente: ''
    },
    subtotal_sin_iva: 0,
    subtotal_con_iva: 0,
    iva: 0,
    total: 0,
    fecha: new Date(),
    id: this.firestoreService.createIdDoc(),
    numero: 1
  }


  constructor(private localstorageService: LocalstorageService,
              private firestoreService: FirestoreService,
              private interaccionService: InteraccionService) {
        this.setVenta();
        this.getVentas();
   }

  setVenta() {
     this.localstorageService.getDoc(this.pathLocal).then( async (res) => {
        if (res) {
          this.venta = this.pruebaVenta;
          this.venta.numero = (await this.getNumerVenta()).numero
          this.venta$.next(this.venta);
        } else {
          this.initVenta();     
          }
      }); 
  }

  saveVenta() {
      this.localstorageService.setDoc(this.pathLocal, this.venta);
      this.venta$.next(this.venta); 
  }

  async initVenta() {
      this.venta = {
        productos: [],
        cliente: {
          id: '',
          nombre: '',
          ruc: '',
          direccion: '',
          telefono: '',
          email: '',
          codCliente: '',
        },
        subtotal_sin_iva: 0,
        subtotal_con_iva: 0,
        iva: 0,
        total: 0,
        fecha: new Date(),
        id: this.firestoreService.createIdDoc(),
        numero: null
      }
      this.venta.numero = (await this.getNumerVenta()).numero
      this.venta$.next(this.venta);
  }

  getVenta() {
      return this.venta
  }

  getVentaChanges() {
    this.venta$.next(this.venta);
    return this.venta$.asObservable();
  }

  getVentasChanges() {
    this.ventas$.next(this.ventas);
    return this.ventas$.asObservable();
  }

  getNumerVenta(): Promise<NumeroVenta> {
    return new Promise((resolve) => {
        const path = Paths.numeroVenta;
        this.firestoreService.getDocument<NumeroVenta>(path).then ( res => {
            if (res.exists) {
                this.numeroVenta = res.data();
                this.numeroVenta.numero ++;
            } else {
                this.numeroVenta = {
                   numero: 1,
                }
            }
            resolve(this.numeroVenta);
            return;
        })
    });

  }

  setNumberVenta() {
      const path = 'Numeroventa/';
      const id = 'numeroventa';
      const updateDoc: NumeroVenta = {
        numero: this.venta.numero
      }
      this.firestoreService.createDocumentID(updateDoc, path, id).then( () => {
      }).catch( error => {
        console.log('error -> setNumberVenta() ', error);
      })
  }

  resetVenta() {
     this.initVenta();
     this.saveVenta();
  }

  // Guarda la venta final
  async saveVentaTerminada() {
      if (this.venta.productos.length) {
         await this.interaccionService.presentLoading();
          this.disminuirStock();
          this.venta.fecha = new Date();
          const path = `${Paths.ventas}${this.venta.cliente.ruc}/Facturas`;
          
          this.firestoreService.createDocumentID<Venta>(this.venta, path,this.venta.id).then( res => {
            this.interaccionService.showToast('Venta guardada con éxito');
            this.setNumberVenta();
            this.resetVenta();
            this.interaccionService.dismissLoading();
          }).catch( err => {
            console.log('error localstorageService.setDoc -> ', err);
          })
        }

  }

  async getVentas() {
      const path = Paths.ventas;
      this.localstorageService.getDoc(path).then( async (res) => {
          if (res) {
              this.ventas = res;
              this.ventas$.next(this.ventas);
          }
      }); 

      
  }

  disminuirStock() {

         
      //Se encuentra los items repetidos para sumarlos y devolverlos en un nuevo arreglo
      const miCarritoSinDuplicados = this.venta.productos.reduce((acumulador:ProductoVenta[], valorActual) => {

        const elementoYaExiste = acumulador.find(elemento => elemento.producto.producto.codigo === valorActual.producto.producto.codigo);
        if (elementoYaExiste) {
          return acumulador.map((elemento) => {
            if (elemento.producto.producto.codigo === valorActual.producto.producto.codigo) {
              return {
                ...elemento,
                cantidad: elemento.cantidad + valorActual.cantidad
              }
            }
      
            return elemento;
          });
        }
        return [...acumulador,valorActual];
      }, []);
    
      this.venta.productos = miCarritoSinDuplicados

      const path = Paths.inventario;

      //Se realiza la actualización del stock de cada item del arreglo de productos
    
      this.venta.productos.forEach( item => {
  
             if (item.producto.producto.codigo && item.producto.cantidad) {
                if (item.producto.producto.codigo === 'xxxx') { return};
                const updateDoc = {
                  cantidad: item.producto.cantidad - item.cantidad
                };  
                this.firestoreService.updateDocumentID(updateDoc, path, item.producto.producto.codigo).catch( error => {
                   console.log('error disminuirStock() -> ', error);
                })
            }  
      }); 

      //Hay que resetear el arreglo y establecerlo en 1 inicializado para poder inicializar nuevamente la venta
      
      const productoVenta = {
        cantidad: 1,
        precio: 0,
        producto: {
          cantidad: 0,
          um: 'CJ',
          descripcion: '',
          fecha_ingreso: new Date(),
          producto: {
            codigo: '',
            descripcion: '',
            lote: '',
            precio_compra: 0,
            precio_venta: 0,
            descuento: false,
            fecha_caducidad: '',
            fecha_elaboracion: new Date(),
            fecha_creacion: `${new Date().toLocaleString()}`
          },
          detalle: ''
        },
      }
      this.venta.productos = [];
      this.venta.productos.push(productoVenta);
     
  }

  resetReport() {
     const path = Paths.ventas;  
     this.ventas = [];
     this.ventas$.next(this.ventas);
  }

}
