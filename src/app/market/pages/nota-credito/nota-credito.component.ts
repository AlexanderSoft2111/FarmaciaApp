import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Cliente, Paths, Venta, ProductoVenta, NotaCredito, TransaccionProducto, DetVentaProducto, DetNotaCreditoProducto, InvProducto, NumeroNota } from '../../../models/models';
import { Router } from '@angular/router';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize, map, Subscription, throwError } from 'rxjs';

//componentes Ionic
import { PopoverController } from '@ionic/angular';

//Componentes
import { PopsetclientComponent } from '../../componentes/popsetclient/popsetclient.component';
import { VentaService } from '../../../services/venta.service';
import { FirestoreService } from '../../../services/firestore.service';
import { InteraccionService } from '../../../services/interaccion.service';
import { MatTableDataSource } from '@angular/material/table';

//Barra de codigos
import domtoimage from 'dom-to-image';

//Generacion de PDF
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { PDFDocument } from 'pdf-lib';
import { NotificacionesService } from '../../../services/notificaciones.service';
import { SriService } from '../../../services/sri.service';
import { ComprobanteRecibidoSri } from '../../../models/sriResponse';
import { autorizaComprobante } from '../../../models/sriAutoriza';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { retry, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-nota-credito',
  templateUrl: './nota-credito.component.html',
  styleUrls: ['./nota-credito.component.scss'],
})
export class NotaCreditoComponent implements OnInit {
  
  infoTributaria = environment.infoTributaria;
  fecha = new Date();
  fechaEmi = null;
  cliente: Cliente;
  serie: string = '';
  numeroNota: number = 0;
  motivo: string = '';
  estab: string = '';
  ptoEmi: string = '';
  serieFactura: string = '';
  productos: ProductoVenta[];
  venta: Venta;
  iva: boolean = false;
  notaCredito: NotaCredito;
  descuento: number = 0;
  
  displayedColumns: string[] = ['Acciones','codigo','descripcion','lote','cantidad','um','precio_unitario','descuento','total'];
  dataSource: MatTableDataSource<ProductoVenta>;
  campos = [
    {campo: 'codigo',label: 'Código'},  
    {campo: 'descripcion',label: 'Descripción'},  
    {campo: 'lote',label: 'Lote'},
    {campo: 'cantidad',label: 'Cantidad'},   
    {campo: 'um',label: 'UM'}, 
    {campo: 'precio_unitario',label: 'Precio Unitario'},  
    {campo: 'descuento',label: 'Descuento'},  
    {campo: 'total',label: 'Total'},  
    
  ];

  codigoBarras:any;
  pdf: any;

  elementType: "canvas" | "img" | "svg" = 'svg';
  // TODO LA FACTURA 15 CON LA CLAVE DE ACCESO GENERAR PDF 1601202301010366335700120011000000000151601015414
  value = '';
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
  headerTable = ['Cod. Principal', 'Cod. Auxiliar', 'Cant.', 'Descripción', 'Detalle Adicional', 'Precio Unitario', 'Descuento', 'Precio Total'];
  suscriberFile: Subscription; 
  suscriberEmail: Subscription; 
  suscriberApiRecepcion: Subscription; 
  suscriberApiAutorizacion: Subscription; 


  get values(): string[] {
    return this.value.split('\n')
  }
  
  constructor(private popoverController: PopoverController,
              private ventaService: VentaService,
              private firestoreService: FirestoreService,
              private interaccionService: InteraccionService,
              private route: Router,
              private storage: AngularFireStorage,
              private notificacionesService: NotificacionesService,
              private sriService: SriService,
              private http: HttpClient) {
                const path = Paths.numeroNotaCredito;
                this.firestoreService.getDocumentChanges<NumeroNota>(path).subscribe(res => {
                  this.numeroNota = res.numero + 1;
                  this.obtenerSerie();
                });
               }
    
  ngOnInit() {

  }

  buscar(ruc: string) {

    if(ruc !== ''){
      const numFactura = `${this.estab}-${this.ptoEmi}-${this.serieFactura}`

      const path = Paths.ventas;

      this.firestoreService.getCollectionQuery<any>(path,'numeroFactura',numFactura).subscribe( ([res]) => {
        
        if (res) {
          const fecha = res.fecha;
          const {seconds} = fecha; //Para capturar la fecha de una marca de tiempo de firebase hay que desestructurar los segundos
          this.fechaEmi = new Date(seconds * 1000);//Luego los multiplicamos por mil para obtener la fecha exacta en un objeto Date
          this.venta = res;
          this.productos = res.productos;

          this.productos.forEach(producto => producto.descuento = this.descuento);
          this.dataSource = new MatTableDataSource(this.productos);
        } 
          else{
          return
          }
        });
        
        


    } else {
      this.interaccionService.showToast('Ingrese por favor el código a buscar');
      this.dataSource = null;
    }

  }

  calcular(){
    let total = 0;
    this.productos.forEach(producto => {
      producto.precio = producto.cantidad * producto.producto.producto.precio_venta;
      total = total + ((producto.cantidad * producto.producto.producto.precio_venta) - producto.descuento);
    });
    this.venta.subtotal_sin_iva = total;
    this.venta.total = total;

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

  delete( producto: ProductoVenta){
    
    let i = this.productos.indexOf(producto);
    this.productos.splice(i,1);
    this.venta.productos = this.productos;
    this.dataSource = new MatTableDataSource(this.productos); 
 
  }

  async registrar(serieNota: string){

  
      const arrDetalle: DetNotaCreditoProducto[] = [];
  
      this.productos.forEach( producto => {
        const productoDetalle: DetNotaCreditoProducto = {
          codigoInterno: producto.producto.producto.codigo,
          codigoAdicional: producto.producto.producto.codigo,
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

      const estructuraNotaCredito = await this.sriService.p_generar_nota_credito_xml(serieNota, this.venta,this.cliente, arrDetalle, this.motivo, this.fechaEmi);
      if (estructuraNotaCredito) {
        this.value = this.sriService.claveAcceso;
        const factBase64 = btoa(estructuraNotaCredito);
        this.suscriberApiRecepcion = this.enviarNotaCreditoSri(factBase64).
        subscribe({
          next: ({recibido, clave}) => {
            if(recibido === 'RECIBIDA'){
              setTimeout(() => {
                this.suscriberApiAutorizacion = this.autorizarNotaCreditoSri(clave).
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
            }, error: (err) => {
              console.log('Error al enviar el comprobante');
              console.log(err);
            }
        }); 
      }
  
  }
  
  enviarNotaCreditoSri(facBase64: string){
    const urlFirma = environment.firmaP12;
    const passFirma = environment.passFirma;
    const urlEnviarComp = `${environment.urlApiSriRecibirComprobante}/api/validarComprobanteXmlAPI`;

    return this.http.post<ComprobanteRecibidoSri>(urlEnviarComp,{
      xmlBase64: facBase64,
      firmaP12: urlFirma,
      passFirma: passFirma,
      tipoDocumento: 'Nota de Crédito'
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


  autorizarNotaCreditoSri(claveAcceso: string){
    
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
      const numNotaCredito = `${this.infoTributaria.estab}-${this.infoTributaria.ptoEmi}-${this.serie}${this.numeroNota}`;
      const numFactura = `${this.estab}-${this.ptoEmi}-${this.serieFactura}`
      this.productos.forEach(producto => {
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
      doc.text("NOTA DE CRÉDITO", 128, 30);   
  
      //Contenedor de la informacion de direccion
      doc.rect(15,70,95,45);
      doc.text(this.infoTributaria.razonSocial, 20, 75);   
      doc.text(this.infoTributaria.nombreComercial, 20, 82);   


      doc.setFontSize(8); //RUC
      doc.setFont('times','normal',400);
      doc.text(this.infoTributaria.ruc, 150, 20);   
      doc.text(numNotaCredito, 150, 40); //
      doc.text(this.value, 120, 53);   
      doc.text("PRODUCCION", 150, 70); //AMBIENTE   
      doc.text("NORMAL", 150, 78); //EMISIÓN   
      doc.text(this.infoTributaria.dirMatriz.toUpperCase(), 43, 92);    
      doc.text(this.infoTributaria.dirMatriz.toUpperCase(), 43, 100);    
      doc.text('', 43, 97);  
      doc.text('NO', 80, 113);   
      doc.text(this.venta.cliente.nombre.toUpperCase(), 70, 125);      
      doc.text(this.venta.cliente.ruc, 170, 125);
      doc.text(`${new Date().toLocaleDateString()}`, 70, 130);       
      doc.text('FACTURA', 70, 135);
      doc.text(numFactura, 85, 135);
      doc.text(this.motivo.toUpperCase(), 70, 140);
      doc.text(`${new Date(this.fechaEmi).toLocaleDateString()}` , 175, 135);



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
      doc.rect(15,120,180,21);
      doc.text("Razón Social / Nombres y Apellidos:", 18, 125); 
      doc.text("Fecha de Emisión:", 18, 130); 
      doc.text("Comprobante que se modifica:", 18, 135); 
      doc.text("Fecha de Emisión (Comprobante a modificar):", 115, 135);   
      doc.text("Identificación:", 135, 125); 
      doc.text("Rázon de Modificación:", 18, 140); 
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
      
      //Contenedor de lo informacion adicional
      doc.rect(15,210 + coordY,95,55);
      doc.setFont('times','normal',700);
      doc.text('Cod Cliente', 18, 228 + coordY);   
      doc.text("Dirección", 18, 236 + coordY);  
      doc.text("Teléfono", 18, 244 + coordY);    
      doc.text("Email", 18, 252 + coordY);  
      
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
      const path = 'NotasCredito';
      const nombreArchivo = `NotaCredito_${numNotaCredito}.pdf`;
     //Obtiene la ruta del archivo 
      const fileURL = URL.createObjectURL(file);
      const urlPdf = await this.uploadFile(file,path,nombreArchivo);
      console.log(urlPdf);
      this.notaCredito.urlPDF = urlPdf;
      //Estructura del email
      this.pdf = {
        name: nombreArchivo,
        docUrl: urlPdf,
        para: this.venta.cliente.email,
        cliente: this.venta.cliente.nombre,
        numDocumento: numNotaCredito,
        tipoDocumento: 'Nota de Crédito'
      } 
      setTimeout(() => {
        this.sendEmail(this.pdf);
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
    
  async saveNotaCredito(){

      if (!this.cliente) {
        this.interaccionService.showToast('Debe ingresar los datos del cliente');
        return;
      }

      if (this.motivo === '') {
        this.interaccionService.showToast('Debe ingresar el motivo por el cual se realiza la Nota de Crédito');
        return;
      };

      if (!this.productos) {
        this.interaccionService.showToast('Los productos no pueden estar vacíos');
        return;
      };
      
      this.interaccionService.preguntaAlert('Alerta', 
      '¿Terminar y guardar la nota de crédito?').then( async res => {
          if (res) {
            this.initNotaCredito();
            if (this.notaCredito.total > 0) {
              
              await this.interaccionService.presentLoading();
              await this.registrar(this.serie + this.numeroNota);
                
            } else {
              
              this.interaccionService.showToast('No se aceptan valores negativos en la nota de crédito', 3000);
            }
          }
      }); 
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
     this.cliente = cliente;

   }
  }

  obtenerSerie(){
    if(this.numeroNota < 10){
      this.serie = '00000000'
      console.log('serie', this.serie);
    } else if (this.numeroNota < 100) {
      this.serie = '0000000'
    } else if (this.numeroNota < 1000) {
      this.serie = '000000'
    } else if (this.numeroNota < 10000) {
      this.serie = '00000'
    } else if (this.numeroNota < 100000) {
      this.serie = '0000'
    } else if (this.numeroNota < 1000000) {
      this.serie = '000'
    } else if (this.numeroNota < 10000000) {
      this.serie = '00'
    } else if (this.numeroNota < 100000000) {
      this.serie = '0'
    }  
    console.log(this.serie + this.numeroNota);
  }

  resetNotaCredito(){
    this.venta   = null;
    this.cliente = null;
    this.motivo  = '';
    this.estab   = '';
    this.ptoEmi  = '';
    this.serieFactura = '';
    this.dataSource = null;
    this.iva = false;
    this.route.navigateByUrl('/market/notas-credito');
  }

  async sendEmail(pdf: any){
    await this.ventaService.saveNotaCreditoTerminada(this.notaCredito);
    this.resetNotaCredito();
    this.suscriberEmail = this.notificacionesService.sendEmail(pdf).subscribe(async(res) => {
      if(res.ok){


          const path = 'NotaCredito/';
          const id = 'numeroNotaCredito';
          const updateDoc: NumeroNota = {
            numero: this.numeroNota
          }
          this.firestoreService.createDocumentID(updateDoc, path, id).then( () => {
          }).catch( error => {
            console.log('error -> setNumberNotaCredito() ', error);
          })

      }

    });
  }

  initNotaCredito(){
    this.notaCredito = {
      cliente: this.cliente,
      productos: this.productos,
      subtotal_sin_iva: this.venta.subtotal_sin_iva,
      subtotal_con_iva: this.venta.subtotal_con_iva,
      iva: this.venta.iva,
      total: this.venta.total,
      fecha: new Date(),
      id: this.firestoreService.createIdDoc(),
      numeroNotaCredito: `${this.estab}-${this.ptoEmi}-${this.serie}${this.numeroNota}`,
      numeroFactura: `${this.estab}-${this.ptoEmi}-${this.serieFactura}`,
      motivo: this.motivo,
      urlPDF: ''
    }    
  }

}
