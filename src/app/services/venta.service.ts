import { Injectable} from '@angular/core';
import { NumeroVenta, Venta, Paths, ProductoVenta, NotaCredito, InvProducto, TransaccionProducto, NumeroNota } from '../models/models';
import { LocalstorageService } from './localstorage.service';
import { FirestoreService } from './firestore.service';
import { finalize, map, Subject } from 'rxjs';
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
    numero: 1,
    urlPDF: ''
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
        numero: null,
        urlPDF: ''
      }
      this.venta.numero = (await this.getNumerVenta()).numero
      this.venta$.next(this.venta);
  }

  getVenta() {
      return this.venta;
  }

  getVentaChanges() {
    this.venta$.next(this.venta);
    return this.venta$.asObservable();
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
  async saveVentaTerminada(numFactura: string) {
      if (this.venta.productos.length) {
        this.venta.fecha = new Date();
        this.venta.numeroFactura = numFactura;
        const path = Paths.ventas;
        
        this.firestoreService.createDocumentID<Venta>(this.venta, path,this.venta.id).then( res => {
          this.venta.productos.forEach(async item => {

          const transproducto: TransaccionProducto = {
            numero_factura: numFactura,
            proveedor: this.venta.cliente.nombre,
            ruc: this.venta.cliente.ruc,
            cantidad: item.cantidad,
            um: item.producto.um,
            producto: item.producto.producto,
            fecha_transaccion: new Date(),
            tipo_transaccion: 'Egreso de stock'

          };
          const path = `${Paths.transacciones}${item.producto.producto.codigo}/Kardex`;
          await this.firestoreService.createDocument<TransaccionProducto>(transproducto, path);  
        });
          this.setNumberVenta();
          this.disminuirStock();
          this.interaccionService.showToast('Venta guardada con éxito');
          this.resetVenta();
          this.interaccionService.dismissLoading();
          }).catch( err => {
            console.log('error localstorageService.setDoc -> ', err);
          }) 
        }

  }
  async saveNotaCreditoTerminada(notaCredito: NotaCredito) {
      if (notaCredito.productos.length) {
        const path = Paths.notasCredito;
        
        this.firestoreService.createDocumentID<NotaCredito>(notaCredito, path,notaCredito.id).then( res => {
            notaCredito.productos.forEach(item => {
            const transproducto: TransaccionProducto = {
              numero_factura: notaCredito.numeroFactura,
              numero_nota_credito: notaCredito.numeroNotaCredito,
              proveedor: notaCredito.cliente.nombre,
              ruc: notaCredito.cliente.ruc,
              cantidad: item.cantidad,
              um: item.producto.um,
              producto: item.producto.producto,
              fecha_transaccion: new Date(),
              tipo_transaccion: 'Ingreso de stock'
            };
            
            const path = `${Paths.transacciones}${item.producto.producto.codigo}/Kardex`;
            this.firestoreService.createDocument<TransaccionProducto>(transproducto, path).then(res => {
            });
            
          });
          this.devolverInventario(notaCredito.productos);
          this.interaccionService.dismissLoading();
          this.interaccionService.showToast('Nota de credito guardada con éxito');
            
          }).catch( err => {
            console.log('error localstorageService.setDoc -> ', err);
          }) 
        }

  }

  devolverInventario(productos: ProductoVenta[]){
    const path = Paths.inventario;

    //Se encuentra los items repetidos para sumarlos y devolverlos en un nuevo arreglo
    const miCarritoSinDuplicados = productos.reduce((acumulador:ProductoVenta[], valorActual) => {

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

    productos = miCarritoSinDuplicados;
    
    productos.forEach( async item => {

    //Obtenemos la fotografia del documento para extraer la data  
    const docSnap = await this.firestoreService.getDocument<InvProducto>(`${path}${item.producto.producto.codigo}`);

    //Obtener la data del documento
    const productoResultado = docSnap.data();

    item.producto.cantidad = productoResultado.cantidad;

    const updateDoc = {
      cantidad: item.producto.cantidad + item.cantidad
    };

    await this.firestoreService.updateDocumentID(updateDoc, path, item.producto.producto.codigo);

    });
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
