import { Component, OnDestroy, OnInit } from '@angular/core';
import { finalize, Observable, Subscription, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { PopoverController } from '@ionic/angular';

//Generacion de PDF
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { PDFDocument } from 'pdf-lib';


import { FirestoreService } from '../../../services/firestore.service';
import { InteraccionService } from '../../../services/interaccion.service';
import { VentaService } from '../../../services/venta.service';
import { Venta, Paths, ProductoVenta, InvProducto, TransaccionProducto, DetVentaProducto} from '../../../models/models';
import { PopsetclientComponent } from '../../componentes/popsetclient/popsetclient.component';
import { SriService } from '../../../services/sri.service';

import { AngularFireStorage } from '@angular/fire/compat/storage';

import domtoimage from 'dom-to-image';
import { NotificacionesService } from '../../../services/notificaciones.service';
import { ComprobanteRecibidoSri } from 'src/app/models/sriResponse';
import { catchError, map, retry } from 'rxjs/operators';
import { autorizaComprobante } from 'src/app/models/sriAutoriza';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-venta',
  templateUrl: './venta.component.html',
  styleUrls: ['./venta.component.scss'],
})
export class VentaComponent implements OnInit, OnDestroy {

  venta: Venta;
  suscriberVenta: Subscription; 
  suscriberEmail: Subscription; 
  suscriberFile: Subscription; 
  suscriberApiRecepcion: Subscription; 
  suscriberApiAutorizacion: Subscription; 
  vuelto: number = 0;
  pago: number = 0;
  serie: string = '0';
  precioBonificacion: number = 0;
  precio_venta: number = 0;

  iva: boolean = false;
  formasPago: string[] = ['Efectivo', 'Transferencia', 'Tarjeta', 'Otros'];
  pagoSeleccionado: string = '0';
  otros: boolean = true;
  detalle: string = '';
  encabezados = ['Boni','Código', 'Descripción','Lote y Fecha C.', 'Stock', 'Cantidad', 'Precio', 'Total'];
  
  headerTable = ['Cod. Principal', 'Cod. Auxiliar', 'Cant.', 'Descripción', 'Detalle Adicional', 'Precio Unitario', 'Descuento', 'Precio Total'];

  infoTributaria = environment.infoTributaria;

  respuestaSri: string = '';
  autorizacion: string = '';

  elementType: "canvas" | "img" | "svg" = 'svg';
  // TODO LA FACTURA 15 CON LA CLAVE DE ACCESO GENERAR PDF 1601202301010366335700120011000000000151601015414
  value = '1231231231321';
  format: "" | "CODE128" | "CODE128A" | "CODE128B" | "CODE128C" | "EAN" | "UPC" | "EAN8" | "EAN5" | "EAN2" | "CODE39" | "ITF14" | "MSI" | "MSI10" | "MSI11" | "MSI1010" | "MSI1110" | "pharmacode" | "codabar" = 'CODE128';
  lineColor = '#000000';
  width = 5;
  height = 30;
  displayValue = false;
  fontOptions = '';
  font = 'times';
  textAlign = 'center';
  textPosition = 'bottom';
  textMargin = 2;
  fontSize = 25;
  background = '#ffffff';

  codigoBarras: any;
  fileTmp: any;
  pdf: any;
  comprobanteRecibido: boolean = false;

  get values(): string[] {
    return this.value.split('\n')
  }
  
  constructor(private ventaService: VentaService,
              private firestoreService: FirestoreService,
              private interaccionService: InteraccionService,
              private popoverController: PopoverController,
              private sriService: SriService,
              private storage: AngularFireStorage,
              private notificacionesService: NotificacionesService,
              private http: HttpClient) {
     
        this.venta = this.ventaService.getVenta();
        this.suscriberVenta = this.ventaService.getVentaChanges().subscribe( res => {
              this.venta = res;
              this.addProducto();
              this.calcularValores();
              this.changePago();
              this.obtenerSerie();
              
              this.precio_venta = this.venta.productos[0].producto.producto.precio_venta;
            });
            this.addProducto();
            this.calcularValores();
            console.log('Bienvenido a la factura')
          }
  
  ngOnInit() {}

  metodoPago(evt: any){
    this.pagoSeleccionado = evt.target.value;
  }

  ionViewDidEnter(){
    this.obtenerSerie();
    console.log('Obtuve la serie');
    console.log(this.serie);
  }


  ngOnDestroy() {
    if (this.suscriberVenta) {
      this.suscriberVenta.unsubscribe();
    }
    if (this.suscriberEmail) {
      this.suscriberEmail.unsubscribe();
    }
    if (this.suscriberFile) {
      this.suscriberFile.unsubscribe();
    }
    if (this.suscriberApiRecepcion) {
      this.suscriberApiRecepcion.unsubscribe();
    }
    if (this.suscriberApiAutorizacion) {
      this.suscriberApiAutorizacion.unsubscribe();
    }
  }

  async facturar() {
    const numFactura = this.serie + this.venta.numero;

    const arrDetalle: DetVentaProducto[] = [];

    this.venta.productos.forEach( producto => {
      const productoDetalle: DetVentaProducto = {
        codigoPrincipal: producto.producto.producto.codigo,
        codigoAuxiliar: producto.producto.producto.codigo,
        descripcion: producto.producto.producto.descripcion,
        cantidad: producto.cantidad,
        precioUnitario: Number(producto.producto.producto.precio_venta.toFixed(2)),
        descuento: 0,
        precioTotalSinImpuesto: Number(producto.precio.toFixed(2)),
        impuestos: {
          impuesto:  {
            codigo: 2,
            codigoPorcentaje: 0,
            tarifa: 0,
            baseImponible: Number(producto.precio.toFixed(2)),
            valor: Number(producto.precio.toFixed(2)),
          }
        }
      };

      arrDetalle.push(productoDetalle);
    });

    const estructuraFactura = await this.sriService.p_generar_factura_xml(numFactura, this.venta, arrDetalle);
    if (estructuraFactura) {
      this.value = this.sriService.claveAcceso;
      const factBase64 = btoa(estructuraFactura);
      
      this.suscriberApiRecepcion = this.enviarFacturaSri(factBase64).
      subscribe({
        next: (resp) => {
          console.log('respuesta', resp);
            if(resp.recibido === 'RECIBIDA'){
              setTimeout(() => {
                    this.suscriberApiAutorizacion = this.autorizarFacturaSri(this.value).
                    subscribe({
                      next: async (res) => {
                        if(res[0] === 'AUTORIZADO'){
                          this.generarPDF();
                        }
                      },
                      error: (err) => {
                        console.log('Error al autorizar el comprobante');
                        console.log(err);
                      },
                      complete: () => console.info('complete') 
                    })
              }, 4000); 

            }
        },
        error: (err) => {
          console.log('Error al enviar el comprobante');
          console.log(err);
        }
      })  
    }
  }

  enviarFacturaSri(facBase64: string){
    const urlFirma = environment.firmaP12;
    const passFirma = environment.passFirma;
    const urlEnviarComp = `${environment.urlApiSriRecibirComprobante}/api/validarComprobanteXmlAPI`;

    return this.http.post<ComprobanteRecibidoSri>(urlEnviarComp,{
      xmlBase64: facBase64,
      firmaP12: urlFirma,
      passFirma: passFirma,
      tipoDocumento: 'factura'
    }).pipe(
      map( res => {
        console.log(res);
        return {
          recibido: res.data.sriResponse.respuestaRecepcionComprobante.estado[0],
          clave: res.data.claveAcceso 
        }
      }),
      retry(3)
      ,
      catchError(err => {
        this.interaccionService.dismissLoading();
        return this.manejoErrorEnvioComprobante(err);
      })
    );
  }

   manejoErrorEnvioComprobante(error: HttpErrorResponse){
    console.log('sucedio un error en el envío del comprobante');
    this.interaccionService.preguntaAlert('Error',error.message);
    return throwError('error');
  }
   
  manejoErrorAutorizarComprobante(error: HttpErrorResponse){
    console.log('sucedio un error al autorizar el comprobante');
    this.interaccionService.preguntaAlert('Error',error.message);
    return throwError('error');
  }

  autorizarFacturaSri(claveAcceso: string){
    
    const urlAutorComp = `${environment.urlApiSriAutorizarComprobante}/api/autorizacionComprobanteAPI`;
    return this.http.post<autorizaComprobante>(urlAutorComp,{
      claveAcceso: claveAcceso,
      ambiente: 2
    }).pipe(
      map( res => {
        console.log(res);
        return res.data.sriResponse.respuestaAutorizacionComprobante.autorizaciones[0].autorizacion[0].estado
      }),
      retry(3)
      ,
      catchError(err => {
        this.interaccionService.dismissLoading();
        return this.manejoErrorAutorizarComprobante(err);
      })
    );
  }


  generarPDF(){

    const htmlDiv = document.getElementById( 'contenido' );

    domtoimage.toPng( htmlDiv ).then( async ( canvas ) => { 
      let imgData = new Image();
      imgData.src = canvas;
      this.codigoBarras = imgData;
      const doc = new jsPDF();
      const dataBody = [];
      const numFactura = `${this.infoTributaria.estab}-${this.infoTributaria.ptoEmi}-${this.serie}${this.venta.numero}`;
      this.venta.productos.forEach(producto => {
        if(producto.producto.producto.codigo !== ''){
          const data = [
            producto.producto.producto.codigo,
            producto.producto.producto.codigoAux,
            producto.cantidad,producto.producto.descripcion,
            `${producto.producto.producto.lote} | ${producto.producto.producto.fecha_caducidad}`,
            producto.producto.producto.precio_venta.toFixed(2),
            '0',
            producto.precio.toFixed(2)
          ]
        dataBody.push(data);
        } 
        else { return}
      });
  
      //Contenedor Logo de empresa
      doc.addImage('../../assets/img/LogoAzudist.jpg','JPG',15,15,95,50)
 
      //Contenedor del RUC
      doc.rect(115,15,80,100);
      doc.setFontSize(11); //factura
      doc.setFont('times','normal',700);
      doc.text("FACTURA", 128, 30);   
  
      //Contenedor de la informacion de direccion
      doc.rect(15,70,95,45);
      doc.text(this.infoTributaria.razonSocial, 20, 75);   
      doc.text(this.infoTributaria.nombreComercial, 20, 82);   


      doc.setFontSize(8); //RUC
      doc.setFont('times','normal',400);
      doc.text(this.infoTributaria.ruc, 150, 20);   
      doc.text(numFactura, 150, 40); //
      doc.text(this.value, 120, 53);   
      doc.text("PRODUCCION", 150, 70); //AMBIENTE   
      doc.text("NORMAL", 150, 78); //EMISIÓN   
      doc.text(this.infoTributaria.dirMatriz.toUpperCase(), 43, 92);    
      doc.text(this.infoTributaria.dirMatriz.toUpperCase(), 43, 100);    
      doc.text('', 43, 97);  
      doc.text('NO', 80, 113);   
      doc.text(this.venta.cliente.nombre.toUpperCase(), 70, 125);      
      doc.text(`${new Date().toLocaleDateString()}`, 70, 135);                     
      doc.text(this.venta.cliente.ruc, 170, 125);
  


      doc.setFont('times','normal',700);
      doc.text("R.U.C:", 118, 20);   
      doc.text("No.", 118, 40);
      doc.text("NÚMERO DE AUTORIZACIÓN", 118, 48); //NÚMERO DE AUTORIZACIÓN
      doc.text("AMBIENTE:", 118, 70); //AMBIENTE   
      doc.text("EMISIÓN:", 118, 78); //EMISIÓN   
      doc.text("CLAVE DE ACCESO:", 118, 86); //CLAVE DE ACCESO
      doc.text("Dir Matriz:", 18, 92); 
      doc.text("Dir Sucursal:", 18, 100); 
      doc.text("Contribuyente Regimen RIMPE", 18, 107); 
      doc.text("OBLIGADO A LLEVAR CONTABILIDAD:", 18, 113);
      
      //Contenedor de la Razon social
      doc.rect(15,120,180,20);
      doc.text("Razón Social / Nombres y Apellidos:", 18, 125); 
      doc.text("Fecha de Emisión:", 18, 135); 
      doc.text("Identificación:", 135, 125); 
      doc.text("Guía de Remisión:", 135, 135); 
      doc.addImage(this.codigoBarras,118,90,70,20);

      doc.setFontSize(7); //No.
      doc.setFont('times','normal',400);
      doc.text(this.value, 118, 110); //CLAVE DE ACCESO   
      
      let coordY = 0;

      autoTable(doc, {
        head: [this.headerTable],
        body: dataBody,
        theme: 'plain',
        startY: 145,
        margin: 15,
        headStyles: {fillColor: [255,255,255], lineColor: [0,0,0], textColor: 'black', lineWidth: 0.2, fontSize: 8, fontStyle: 'bold', font: 'times'},
        bodyStyles: {fillColor: [255,255,255] ,lineColor: [0,0,0], textColor: 'black', lineWidth: 0.2, fontSize: 7, fontStyle: 'normal', font: 'times'},
        columnStyles: {'Descripción': {cellWidth: 120}}
      })

      if(dataBody.length <= 10){
        coordY = 10
      } else if(dataBody.length <= 20){
        doc.addPage(); coordY = -200;
      } else if(dataBody.length <= 50){
        coordY = 10;
      } else if(dataBody.length <= 60){
        doc.addPage(); coordY = -200;
      } else if(dataBody.length <= 90){
        coordY = 10;
      } else if(dataBody.length <= 100){
        doc.addPage(); coordY = -200;
      }

      //Titulo información adicional
      doc.setFontSize(11); //factura
      doc.setFont('times','normal',700);
      doc.text("Información Adicional", 40, 220 + coordY);

      doc.setFontSize(10); 
      doc.text("Forma de Pago", 35, 274 + coordY);   
      doc.text("Valor", 80, 274 + coordY);  

      doc.setFont('times','normal',400);
      doc.setFontSize(9); 
      doc.text(this.venta.subtotal_sin_iva.toFixed(2), 185, 214 + coordY,{align: 'left'});
      doc.text(this.venta.subtotal_sin_iva.toFixed(2), 185, 234 + coordY, {align: 'left'});
      doc.text(this.venta.iva.toFixed(2), 185, 249 + coordY, {align: 'left'});
      doc.text(this.venta.total.toFixed(2), 185, 264 + coordY, {align: 'left'}); 
      
      
      doc.setFontSize(8);
      doc.text(this.venta.total.toFixed(2), 82, 280 + coordY);
      doc.text(this.venta.cliente.codCliente, 45, 228 + coordY);   
      doc.text(this.venta.cliente.direccion.toUpperCase(), 45, 236 + coordY);
      doc.text(this.venta.cliente.telefono, 45, 244 + coordY);
      doc.text(this.venta.cliente.email, 45, 252 + coordY);
      doc.text(this.detalle.toUpperCase(), 45, 260 + coordY);

      //Contenedor de lo informacion adicional
      doc.rect(15,210 + coordY,95,55);
      doc.setFont('times','normal',700);
      doc.text('Cod Cliente', 18, 228 + coordY);   
      doc.text("Dirección", 18, 236 + coordY);  
      doc.text("Teléfono", 18, 244 + coordY);    
      doc.text("Email", 18, 252 + coordY);  
      doc.text('Pago Diferido', 18, 260 + coordY);

      //Contenedor de los totales
      doc.rect(115,210 + coordY,58,5); doc.rect(173,210 + coordY,22,5);
      doc.rect(115,215 + coordY,58,5); doc.rect(173,215 + coordY,22,5);
      doc.rect(115,220 + coordY,58,5); doc.rect(173,220 + coordY,22,5);
      doc.rect(115,225 + coordY,58,5); doc.rect(173,225 + coordY,22,5);
      doc.rect(115,230 + coordY,58,5); doc.rect(173,230 + coordY,22,5);
      doc.rect(115,235 + coordY,58,5); doc.rect(173,235 + coordY,22,5);
      doc.rect(115,240 + coordY,58,5); doc.rect(173,240 + coordY,22,5);
      doc.rect(115,245 + coordY,58,5); doc.rect(173,245 + coordY,22,5);
      doc.rect(115,250 + coordY,58,5); doc.rect(173,250 + coordY,22,5);
      doc.rect(115,255 + coordY,58,5); doc.rect(173,255 + coordY,22,5);
      doc.rect(115,260 + coordY,58,5); doc.rect(173,260 + coordY,22,5);
      doc.text("SUBTOTAL 12%", 116,214 + coordY);     
      doc.text("SUBTOTAL 0%", 116, 219 + coordY);     
      doc.text("SUBTOTAL no objeto de IVA", 116, 224 + coordY);     
      doc.text("SUBTOTAL Exento de IVA", 116, 229 + coordY);     
      doc.text("SUBTOTAL SIN IMPUESTOS", 116, 234 + coordY);     
      doc.text("DESCUENTO", 116, 239 + coordY);         
      doc.text("ICE", 116, 244 + coordY);         
      doc.text("IVA 12%", 116, 249 + coordY);      
      doc.text("IRBPNR", 116, 254 + coordY);    
      doc.text("PROPINA", 116, 259 + coordY);    
      doc.text("VALOR TOTAL $", 116, 264 + coordY);

      //Contenedor de la forma de pago
      doc.setFontSize(7); //No.
      doc.setFont('times','normal',400); 
      doc.rect(15,270 + coordY,60,6); doc.rect(75,270 + coordY,20,6);
      doc.rect(15,276 + coordY,60,5); doc.rect(75,276 + coordY,20,5);
      doc.text('SIN UTILIZACIÓN DEL SISTEMA FINANCIERO', 18, 280 + coordY);

      //pdf-lib
      //Para fusionar un pdf existente con el que creó (ya sea usando jspdf, como arriba, o pdf-lib), 
      //importe pdf-lib en su archivo de componentes

      const arrayB = doc.output('arraybuffer') //Creacion de matriz del PDF actual para transformar
      
      const pdfDoc = await PDFDocument.create(); //Creaciòn de un nuevo documento

      const firstDoc = await PDFDocument.load(arrayB); //Cargar del pdf creado anteriormente con la otra libreria

      //Convierta el firstDoc en páginas y copie cada página en pdfDoc
      const firstPage = await pdfDoc.copyPages(firstDoc, firstDoc.getPageIndices());
      firstPage.forEach((page) => pdfDoc.addPage(page));

      //Ahora su pdfDoc tiene todas las páginas del primer pdf y luego todas las páginas del segundo pdf, 
      //puede descargar el pdf final.
      const pdfBytes = await pdfDoc.save();

      //Obtiene el archivo pdf creado
      const file = new Blob([pdfBytes], { type: 'application/pdf' });
      const path = 'Facturas';
      const nombreArchivo = `Factura_${numFactura}.pdf`;
      //Obtiene la ruta del archivo 
      const fileURL = URL.createObjectURL(file);

      const urlPdf = await this.uploadFile(file,path,nombreArchivo);
      this.venta.urlPDF = urlPdf;
      //Estructura del email
       this.pdf = {
        name: nombreArchivo,
        docUrl: urlPdf,
        para: this.venta.cliente.email,
        cliente: this.venta.cliente.nombre,
        numDocumento: numFactura,
        tipoDocumento: 'Factura'
      }
      setTimeout(() => {
        this.sendEmail(this.pdf, numFactura);
      }, 2000); 

    }).catch( ( error ) => {
      console.error('Error: ', error);
    });
  }


  
  uploadFile(file: any, path: string, nombre: string): Promise<string>{

    return new Promise(resolve => {
      
      const filePath = path + '/' + nombre; //La ruta en donde se debe guardar
      const ref = this.storage.ref(filePath);
      const task = ref.put(file);
      task.snapshotChanges().pipe(
        finalize( () => {
          this.suscriberFile = ref.getDownloadURL().subscribe( res => {
            const downloadUrl = res;
            resolve(downloadUrl);
            return;
          });
        })
      ).subscribe();
    })

  }

   async sendEmail(pdf: any, numFactura: string){

    await this.ventaService.saveVentaTerminada(numFactura);
    this.suscriberEmail = this.notificacionesService.sendEmail(pdf).subscribe(() => {});
  }
  
  async saveVenta() {
    if (this.venta.productos.length < 1) {
      this.interaccionService.showToast('No se ha registrado ningún producto');
      return;
    };

    if (this.venta.cliente.nombre === '') {
      this.interaccionService.showToast('Debe ingresar los datos del cliente');
      return;
    }

    if (this.venta.vendedor === '') {
      this.interaccionService.showToast('Debe ingresar el nombre del vendedor');
      return;
    }
    
    if (this.pagoSeleccionado === '0') {
      this.interaccionService.showToast('Debe escoger un método de pago');
      return;
    }
    
    this.interaccionService.preguntaAlert('Alerta', '¿Terminar y guardar la venta actual?').then( async res => {
        if (res) {
          
          if (this.pago >= this.venta.total) {
              this.venta.detalle = this.detalle;
              this.venta.formaPago = this.pagoSeleccionado;
              this.venta.vendedor = this.venta.vendedor.toUpperCase();
              this.venta.productos.pop();  
                await this.interaccionService.presentLoading();
                await this.facturar();
                this.pago = 0;
                this.vuelto = 0;
              }
              else {
                this.interaccionService.showToast('El valor pagado es menor el total de la venta', 3000);
              }
            } 
    });
  }



  estado(index: number){
   

   if(this.venta.productos[index].producto.producto.descuento !== false){
    this.venta.productos[index].producto.producto.precio_venta = this.precioBonificacion;
    this.venta.productos[index].producto.producto.codigoAux = 'Bonificacion';
  } else {
    this.venta.productos[index].producto.producto.precio_venta = this.precio_venta;
  } 
  this.calcularValores();
   
  }

  obtenerSerie(){
    if(this.venta.numero < 10){
      this.serie = '00000000'
    } else if (this.venta.numero < 100) {
      this.serie = '0000000'
    } else if (this.venta.numero < 1000) {
      this.serie = '000000'
    } else if (this.venta.numero < 10000) {
      this.serie = '00000'
    } else if (this.venta.numero < 100000) {
      this.serie = '0000'
    } else if (this.venta.numero < 1000000) {
      this.serie = '000'
    } else if (this.venta.numero < 10000000) {
      this.serie = '00'
    } else if (this.venta.numero < 100000000) {
      this.serie = '0'
    }  
  }

  async setCliente() {
      const popover = await this.popoverController.create({
        component: PopsetclientComponent,
        cssClass: 'popoverCssCliente',
        translucent: false,
        backdropDismiss: true,
        componentProps: {venta: true},
        mode: 'ios'
      });
     await popover.present();
     const { data } = await popover.onWillDismiss();
     if (data) {
      
       const cliente = data.cliente;
       this.venta.cliente = cliente;
       this.ventaService.saveVenta();
     }
  }

  addProducto() {
    if (this.venta) {
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

    
       if (!this.venta.productos.length) {
          this.venta.productos.push(productoVenta);
      } else {
          if (this.venta.productos[this.venta.productos.length - 1].producto.producto.codigo.length) {
              this.venta.productos.push(productoVenta);
          }  
      } 

    }
    this.setFocusNewProducto();
  }

  changeCodigo(ev: any, index: number) {
  
      if (ev.detail.value.length > 2) {
        this.findProducto(ev.detail.value, index);
      }
  }

  findProducto(id: string, index: number) {
    const path = Paths.inventario + id;

    this.firestoreService.getDocumentFromCache<InvProducto>(path).then( res => {
        if (res) {
            this.addProductoWithCode(res, index);
        } else {
           return
        }
    })
  }

  setFocusNewProducto() {
        setTimeout(() => {
          const inputs = document.getElementsByClassName("codigo") as any;
 
          if (inputs.length) {
            inputs[inputs.length -1].setFocus();
          }
        }, 500);
  }

  clearInput() {
      this.venta.productos[this.venta.productos.length - 1].producto.producto.codigo = '';
      this.setFocusNewProducto();
  }

  // Añade un producto a la venta con el codigo escaneado
  // Aumenta la cantidad del producto si al escanear es el mismo producto
  // que ya existe
  addProductoWithCode(newproducto: InvProducto, index: number) {
      const productoExist = this.venta.productos.find( producto => {
       
             return  producto.producto.producto.codigo === newproducto.producto.codigo;
      });
      
      this.venta.productos[index].producto = newproducto;
          this.ventaService.saveVenta();
          this.addProducto();
  }


  addCantidad(producto: ProductoVenta) {
    producto.cantidad ++;
    this.ventaService.saveVenta();
  }

  removeCantidad(producto: ProductoVenta) {
      if (producto.cantidad) {
        producto.cantidad --;
        this.ventaService.saveVenta();
      }
  }

  changeCantidad(producto: ProductoVenta, index: number) {
      if (producto.cantidad === 0) {
          this.venta.productos.splice(index, 1);
          this.ventaService.saveVenta();
          return;
        }
        this.calcularValores();
      producto.precio = producto.cantidad * producto.producto.producto.precio_venta;

  }

  calcularValores() {
      if (this.venta) {
        this.venta.total = 0;
        this.venta.subtotal_con_iva = 0;
        this.venta.subtotal_sin_iva = 0;
        this.venta.iva = 0;
        this.venta.productos.forEach( item => {
              item.precio = item.cantidad * item.producto.producto.precio_venta;
              this.venta.total = this.venta.total + item.precio;
              
                this.venta.subtotal_sin_iva = this.venta.subtotal_sin_iva + item.precio;
              
        });
      }
  }


  resetVenta() {
     this.interaccionService.preguntaAlert('Alerta', 
            '¿Seguro que desea resetear la venta actual?').then( res => {
                if (res) {
                  this.ventaService.resetVenta();
                }
            })
  }

  changePago() {
      if (this.pago >= this.venta.total) {
            this.vuelto = this.pago - this.venta.total;
      } else {
        this.vuelto = 0;
      }
  }


  calcularIva(){
    if(!this.iva){
      this.venta.iva = this.venta.total * 0.12;
      this.venta.total += this.venta.iva;
    } else{
      this.venta.total -= this.venta.iva;
      this.venta.iva = 0;
    }
  }



}
