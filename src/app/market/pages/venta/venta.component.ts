import { Component, OnDestroy, OnInit } from '@angular/core';
import { async, finalize, Subscription } from 'rxjs';
import { PopoverController } from '@ionic/angular';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { PDFDocument } from 'pdf-lib';



import { FirestoreService } from '../../../services/firestore.service';
import { InteraccionService } from '../../../services/interaccion.service';
import { VentaService } from '../../../services/venta.service';
import { Venta, Paths, ProductoVenta, InvProducto, TransaccionProducto } from '../../../models/models';
import { PopsetclientComponent } from '../../componentes/popsetclient/popsetclient.component';
import { SriService } from '../../../services/sri.service';

import { AngularFireStorage } from '@angular/fire/compat/storage';

import domtoimage from 'dom-to-image';
import { NotificacionesService } from '../../../services/notificaciones.service';


@Component({
  selector: 'app-venta',
  templateUrl: './venta.component.html',
  styleUrls: ['./venta.component.scss'],
})
export class VentaComponent implements OnInit, OnDestroy {

  venta: Venta;
  suscriberVenta: Subscription; 
  vuelto: number = 0;
  pago: number = 0;
  serie: string = '0';
  precioBonificacion: number = 0;
  precio_venta: number = 0;
  estructuraFactura: any;
  para: string = '';

  iva: boolean = false;
  detalle: string = '';
  encabezados = ['Boni','Código', 'Descripción','Lote y Fecha C.', 'Stock', 'Cantidad', 'Precio', 'Total'];
  
  headerTable = ['Cod. Principal', 'Cod. Auxiliar', 'Cant.', 'Descripción', 'Detalle Adicional', 'Precio Unitario', 'Descuento', 'Precio Total'];

  infoTributaria = {
    ambiente: '1',
    tipoEmision: '1',
    razonSocial: 'MORAN VIDAL JUAN PABLO',
    nombreComercial: 'AZUDIST',
    ruc: '0103663357001',
    claveAcceso: '2110201101179214673900110020010000000011234567813',
    codDoc: '01',
    estab: '002',
    ptoEmi: '001',
    secuencial: '000000001',
    dirMatriz: 'Camino del tejar 4-30 camino a las pencas',
  }

  
  elementType: "canvas" | "img" | "svg" = 'svg';
  value = this.infoTributaria.claveAcceso;
  format: "" | "CODE128" | "CODE128A" | "CODE128B" | "CODE128C" | "EAN" | "UPC" | "EAN8" | "EAN5" | "EAN2" | "CODE39" | "ITF14" | "MSI" | "MSI10" | "MSI11" | "MSI1010" | "MSI1110" | "pharmacode" | "codabar" = 'CODE128';
  lineColor = '#000000';
  width = 70;
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

  get values(): string[] {
    return this.value.split('\n')
 
  }
  
  constructor(private ventaService: VentaService,
              private firestoreService: FirestoreService,
              private interaccionService: InteraccionService,
              private popoverController: PopoverController,
              private sriService: SriService,
              private storage: AngularFireStorage,
              private notificacionesService: NotificacionesService) {
     
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
  }

  ngOnInit() {}


  ngOnDestroy() {
    if (this.suscriberVenta) {
      this.suscriberVenta.unsubscribe();
    }
  }


  generarPDF(){
    const htmlDiv = document.getElementById( 'contenido' );
  
    domtoimage.toPng( htmlDiv ).then( async ( canvas ) => { 
      let imgData = new Image();
      imgData.src = canvas;
      this.codigoBarras = imgData;
      const doc = new jsPDF();
      const dataBody = [];
      const numFactura = `${this.infoTributaria.ptoEmi}-${this.infoTributaria.estab}-${this.serie}${this.venta.numero}`;
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
      doc.text("Información Adicional", 40, 220);
  
      //Contenedor de la informacion de direccion
      doc.rect(15,70,95,45);
      doc.text(this.infoTributaria.nombreComercial, 20, 75);   

      doc.setFontSize(10); 
      doc.text("Forma de Pago", 35, 274);   
      doc.text("Valor", 80, 274);   
      doc.setFont('times','normal',400);
      doc.text(this.venta.total.toFixed(2), 82, 280);

      doc.setFontSize(9); 
      doc.text(this.venta.subtotal_sin_iva.toFixed(2), 185, 214,{align: 'left'});
      doc.text(this.venta.subtotal_sin_iva.toFixed(2), 185, 234, {align: 'left'});
      doc.text(this.venta.iva.toFixed(2), 185, 249, {align: 'left'});
      doc.text(this.venta.total.toFixed(2), 185, 264, {align: 'left'}); 

      doc.setFontSize(8); //RUC
      doc.setFont('times','normal',400);
      doc.text(this.infoTributaria.ruc, 150, 20);   
      doc.text(numFactura, 150, 40);
      doc.text(this.infoTributaria.claveAcceso, 120, 53);   
      doc.text("PRUEBA", 150, 70); //AMBIENTE   
      doc.text("NORMAL", 150, 78); //EMISIÓN   
      doc.text(this.infoTributaria.dirMatriz.toUpperCase(), 43, 82);    
      doc.text(this.infoTributaria.dirMatriz.toUpperCase(), 43, 90);    
      doc.text('', 43, 97);  
      doc.text('NO', 43, 110);   
      doc.text(this.venta.cliente.nombre.toUpperCase(), 70, 125);      
      doc.text(`${new Date().toLocaleDateString()}`, 70, 135);       
      doc.text(this.venta.cliente.ruc, 170, 125);
      doc.text(this.venta.cliente.codCliente, 45, 228);   
      doc.text(this.venta.cliente.direccion.toUpperCase(), 45, 236);
      doc.text(this.venta.cliente.telefono, 45, 244);
      doc.text(this.venta.cliente.email, 45, 252);
      doc.text(this.detalle.toUpperCase(), 45, 260);

      doc.setFont('times','normal',700);
      doc.text("R.U.C:", 118, 20);   
      doc.text("No.", 118, 40);
      doc.text("NÚMERO DE AUTORIZACIÓN", 118, 48); //NÚMERO DE AUTORIZACIÓN
      doc.text("AMBIENTE:", 118, 70); //AMBIENTE   
      doc.text("EMISIÓN:", 118, 78); //EMISIÓN   
      doc.text("CLAVE DE ACCESO:", 118, 86); //CLAVE DE ACCESO
      doc.text("Dir Matriz:", 18, 82); 
      doc.text("Dir Sucursal:", 18, 90); 
      doc.text("Contribuyente", 18, 97); 
      doc.text("Regimen RIMPE", 18, 100); 
      doc.text("OBLIGADO A", 18, 107); 
      doc.text("LLEVAR", 18, 110); 
      doc.text("CONTABILIDAD:", 18, 113);
      
      //Contenedor de la Razon social
      doc.rect(15,120,180,20);
      doc.text("Razón Social / Nombres y Apellidos:", 18, 125); 
      doc.text("Fecha de Emisión:", 18, 135); 
      doc.text("Identificación:", 135, 125); 
      doc.text("Guía de Remisión:", 135, 135); 
      doc.addImage(this.codigoBarras,118,90,70,20);

      //Contenedor de lo informacion adicional
      doc.rect(15,210,95,55);
      doc.text('Cod Cliente', 18, 228);   
      doc.text("Dirección", 18, 236);  
      doc.text("Teléfono", 18, 244);    
      doc.text("Email", 18, 252);  
      doc.text('Pago Diferido', 18, 260);
      
      //Contenedor de los totales
      doc.rect(115,210,58,5); doc.rect(173,210,22,5);
      doc.rect(115,215,58,5); doc.rect(173,215,22,5);
      doc.rect(115,220,58,5); doc.rect(173,220,22,5);
      doc.rect(115,225,58,5); doc.rect(173,225,22,5);
      doc.rect(115,230,58,5); doc.rect(173,230,22,5);
      doc.rect(115,235,58,5); doc.rect(173,235,22,5);
      doc.rect(115,240,58,5); doc.rect(173,240,22,5);
      doc.rect(115,245,58,5); doc.rect(173,245,22,5);
      doc.rect(115,250,58,5); doc.rect(173,250,22,5);
      doc.rect(115,255,58,5); doc.rect(173,255,22,5);
      doc.rect(115,260,58,5); doc.rect(173,260,22,5);
      doc.text("SUBTOTAL 12%", 116,214);     
      doc.text("SUBTOTAL 0%", 116, 219);     
      doc.text("SUBTOTAL no objeto de IVA", 116, 224);     
      doc.text("SUBTOTAL Exento de IVA", 116, 229);     
      doc.text("SUBTOTAL SIN IMPUESTOS", 116, 234);     
      doc.text("DESCUENTO", 116, 239);         
      doc.text("ICE", 116, 244);         
      doc.text("IVA 12%", 116, 249);      
      doc.text("IRBPNR", 116, 254);    
      doc.text("PROPINA", 116, 259);    
      doc.text("VALOR TOTAL $", 116, 264);

      doc.setFontSize(7); //No.
      doc.setFont('times','normal',400);

      //Contenedor de la forma de pago
      doc.rect(15,270,60,6); doc.rect(75,270,20,6);
      doc.rect(15,276,60,5); doc.rect(75,276,20,5);
      doc.text('SIN UTILIZACIÓN DEL SISTEMA FINANCIERO', 18, 280);
      doc.text(this.infoTributaria.claveAcceso, 125, 110); //CLAVE DE ACCESO   

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
      const nombreArchivo = `Factura_${numFactura}`;
      //Obtiene la ruta del archivo 
      //const fileURL = URL.createObjectURL(file);

      const urlPdf = await this.uploadFile(file,path,nombreArchivo);
      
      //Estructura del email
      const pdf = {
        name: nombreArchivo,
        docUrl: urlPdf,
        para: this.para,
        cliente: this.venta.cliente.nombre,
        numFactura
      }

      //Enviamos correo
      this.sendEmail(pdf);

      
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
          ref.getDownloadURL().subscribe( res => {
            const downloadUrl = res;
            resolve(downloadUrl);
            return;
          });
        })
      ).subscribe();
    })

  }

  sendEmail(pdf: any){
    this.notificacionesService.sendEmail(pdf).subscribe((res) => {
      console.log(res);

    });
  }


  async facturar() {
   /*  console.log('facturar() -> ', this.venta);
    const estructuraFactura = await this.sriService.p_generar_factura_xml();
    this.estructuraFactura = estructuraFactura; */
    const pdf = this.generarPDF();
    //if (estructuraFactura) {
      //console.log('xml -> ', estructuraFactura);
      //console.log(estructuraFactura.factura._id);
    //}

    /* const res = await this.interaccionService.preguntaAlert('Alerta', 
    '¿Seguro desea facturar la venta actual?');
    if (res) {
        await this.interaccionService.presentLoading('Facturando...')
        this.venta.ruc = this.venta.cliente.ruc;
        let indexsToRemove: number[] = [];
        this.venta.productos.forEach( (producto, index) => {
            if (!producto.producto.descripcion && !producto.producto.codigo || !producto.cantidad) {
              indexsToRemove.push(index);
            }
        });
        indexsToRemove.reverse();
        indexsToRemove.forEach(index => {
          this.venta.productos.splice(index, 1);
        });
        const uid = await this.ventaService.getUidVenta();
        const path = 'Usuarios/' + uid + '/facturas';
        await this.firestoreService.createDocumentID(this.venta, path, this.venta.id).catch( error => {
              this.interaccionService.dismissLoading();
              this.interaccionService.showToast('Error al guardar la factura');
        });
        this.interaccionService.dismissLoading();
        this.interaccionService.showToast('Factura guardada con éxito');
        this.ventaService.resetVenta();
        this.router.navigate(['/']);
    }
     */
  }

  
  async saveVenta() {
    if (!this.venta.total) {
      this.interaccionService.showToast('No se ha registrado ningún producto');
      return;
    };

    if (this.venta.cliente.nombre === '') {
      this.interaccionService.showToast('Debe ingresar los datos del cliente');
      return;
    }
    
    this.interaccionService.preguntaAlert('Alerta', 
    '¿Terminar y guardar la venta actual?').then( async res => {
        if (res) {
            this.venta.detalle = this.detalle;
            
            if (this.pago >= this.venta.total) {
             
              this.para = this.venta.cliente.email;
              this.venta.productos.forEach(item => {

                if(item.producto.producto.codigo !== ''){

                  const transproducto: TransaccionProducto = {
                    numero_factura: this.serie + this.venta.numero,
                    proveedor: this.venta.cliente.nombre,
                    ruc: this.venta.cliente.ruc,
                    cantidad: item.cantidad,
                    um: item.producto.um,
                    producto: item.producto.producto,
                    fecha_transaccion: `${new Date().toLocaleString()}`,
                    tipo_transaccion: 'Egreso de stock'
                  };
                  
                  const path = `${Paths.transacciones}${item.producto.producto.codigo}/Kardex`;
                  this.firestoreService.createDocument<TransaccionProducto>(transproducto, path);  
                } else { return}
                
              });
              this.generarPDF();
              await this.ventaService.saveVentaTerminada();
              
              this.pago = 0;
              this.vuelto = 0;
            } else {
              
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
