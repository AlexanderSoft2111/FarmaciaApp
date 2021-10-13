import { Component, OnInit, ViewChild} from '@angular/core';
import { jsPDF } from "jspdf";
import domtoimage from 'dom-to-image';
import { FormBuilder, Validators } from '@angular/forms';



@Component({
  selector: 'app-generar-codigo',
  templateUrl: './generar-codigo.component.html',
  styleUrls: ['./generar-codigo.component.scss'],
})
export class GenerarCodigoComponent implements OnInit {

  articuloForm = this.fb.group({
    codigo: ['', Validators.required],
  
  });

  campoinValido = false;

  codigo = '';
  titulo = 'Nuevo Código';
  descripcion = 'Generar nuevo código';
  ocultar = false;
  elementType: "canvas" | "img" | "svg" = 'svg';
  value = '';
  format: "" | "CODE128" | "CODE128A" | "CODE128B" | "CODE128C" | "EAN" | "UPC" | "EAN8" | "EAN5" | "EAN2" | "CODE39" | "ITF14" | "MSI" | "MSI10" | "MSI11" | "MSI1010" | "MSI1110" | "pharmacode" | "codabar" = 'CODE128';
  lineColor = '#000000';
  width = 2;
  height = 100;
  displayValue = true;
  fontOptions = '';
  font = 'monospace';
  textAlign = 'center';
  textPosition = 'bottom';
  textMargin = 2;
  fontSize = 20;
  background = '#ffffff';
  margin = 10;
  marginTop = 10;
  marginBottom = 10;
  marginLeft = 10;
  marginRight = 10;
  numeroImpresion = 0;

  get values(): string[] {
    return this.value.split('\n')
 
    
  }
  codeList: string[] = [
    '', 'CODE128',
    'CODE128A', 'CODE128B', 'CODE128C',
    'UPC', 'EAN8', 'EAN5', 'EAN2',
    'CODE39',
    'ITF14',
    'MSI', 'MSI10', 'MSI11', 'MSI1010', 'MSI1110',
    'pharmacode',
    'codabar'
  ];

  selectedValue: string;
  
  numeros = [
    {value: 3, viewValue: '3'},
    {value: 6, viewValue: '6'},
    {value: 9, viewValue: '9'},
    {value: 12, viewValue: '12'},
    {value: 15, viewValue: '15'},
    {value: 18, viewValue: '18'},
    {value: 21, viewValue: '21'},
  ];
  

  constructor(private fb:FormBuilder) { }

  ngOnInit() {
  
  }

  posicion(pos){
      this.numeroImpresion = pos;
      this.campoinValido = false;  
  }

  valuechangeInput(){
    this.value = this.articuloForm.controls.codigo.value;
  }

  generarPdf() {


    if(this.articuloForm.invalid){
      this.articuloForm.markAllAsTouched;
    }
    
    if(this.numeroImpresion > 0){
      this.campoinValido = false; 
        var htmlDiv = document.getElementById( 'contenido' );
          domtoimage.toPng( htmlDiv ).then( ( canvas ) => {
          var imgData = new Image();
          imgData.src = canvas;
          let doc = new jsPDF();
          doc.setFontSize(30);
          doc.setTextColor(126,0,46);
          doc.text('Minimercado AppMarket',50,12);

          switch (this.numeroImpresion) {
            case 3:
              doc.addImage(imgData,10,20,60,30);
              doc.addImage(imgData,75,20,60,30);
              doc.addImage(imgData,140,20,60,30);
                  break;
            case 6:
              doc.addImage(imgData,10,20,60,30);
              doc.addImage(imgData,75,20,60,30);
              doc.addImage(imgData,140,20,60,30);
              doc.addImage(imgData,10,60,60,30);
              doc.addImage(imgData,75,60,60,30);
              doc.addImage(imgData,140,60,60,30);
              break;
    
            case 9:
              doc.addImage(imgData,10,20,60,30);
              doc.addImage(imgData,75,20,60,30);
              doc.addImage(imgData,140,20,60,30);
              doc.addImage(imgData,10,60,60,30);
              doc.addImage(imgData,75,60,60,30);
              doc.addImage(imgData,140,60,60,30);
              doc.addImage(imgData,10,100,60,30);
              doc.addImage(imgData,75,100,60,30);
              doc.addImage(imgData,140,100,60,30);
              break;
    
              case 12:
                doc.addImage(imgData,10,20,60,30);
                doc.addImage(imgData,75,20,60,30);
                doc.addImage(imgData,140,20,60,30);
                doc.addImage(imgData,10,60,60,30);
                doc.addImage(imgData,75,60,60,30);
                doc.addImage(imgData,140,60,60,30);
                doc.addImage(imgData,10,100,60,30);
                doc.addImage(imgData,75,100,60,30);
                doc.addImage(imgData,140,100,60,30);
                doc.addImage(imgData,10,140,60,30);
                doc.addImage(imgData,75,140,60,30);
                doc.addImage(imgData,140,140,60,30);
                break;
    
              case 15:
                doc.addImage(imgData,10,20,60,30);
                doc.addImage(imgData,75,20,60,30);
                doc.addImage(imgData,140,20,60,30);
                doc.addImage(imgData,10,60,60,30);
                doc.addImage(imgData,75,60,60,30);
                doc.addImage(imgData,140,60,60,30);
                doc.addImage(imgData,10,100,60,30);
                doc.addImage(imgData,75,100,60,30);
                doc.addImage(imgData,140,100,60,30);
                doc.addImage(imgData,10,140,60,30);
                doc.addImage(imgData,75,140,60,30);
                doc.addImage(imgData,140,140,60,30);
                doc.addImage(imgData,10,180,60,30);
                doc.addImage(imgData,75,180,60,30);
                doc.addImage(imgData,140,180,60,30);
                break;
    
              case 18:
                  doc.addImage(imgData,10,20,60,30);
                  doc.addImage(imgData,75,20,60,30);
                  doc.addImage(imgData,140,20,60,30);
                  doc.addImage(imgData,10,60,60,30);
                  doc.addImage(imgData,75,60,60,30);
                  doc.addImage(imgData,140,60,60,30);
                  doc.addImage(imgData,10,100,60,30);
                  doc.addImage(imgData,75,100,60,30);
                  doc.addImage(imgData,140,100,60,30);
                  doc.addImage(imgData,10,140,60,30);
                  doc.addImage(imgData,75,140,60,30);
                  doc.addImage(imgData,140,140,60,30);
                  doc.addImage(imgData,10,180,60,30);
                  doc.addImage(imgData,75,180,60,30);
                  doc.addImage(imgData,140,180,60,30);
                  doc.addImage(imgData,10,220,60,30);
                  doc.addImage(imgData,75,220,60,30);
                  doc.addImage(imgData,140,220,60,30);
                  break;
    
              case 21:
                  doc.addImage(imgData,10,20,60,30);
                  doc.addImage(imgData,75,20,60,30);
                  doc.addImage(imgData,140,20,60,30);
                  doc.addImage(imgData,10,60,60,30);
                  doc.addImage(imgData,75,60,60,30);
                  doc.addImage(imgData,140,60,60,30);
                  doc.addImage(imgData,10,100,60,30);
                  doc.addImage(imgData,75,100,60,30);
                  doc.addImage(imgData,140,100,60,30);
                  doc.addImage(imgData,10,140,60,30);
                  doc.addImage(imgData,75,140,60,30);
                  doc.addImage(imgData,140,140,60,30);
                  doc.addImage(imgData,10,180,60,30);
                  doc.addImage(imgData,75,180,60,30);
                  doc.addImage(imgData,140,180,60,30);
                  doc.addImage(imgData,10,220,60,30);
                  doc.addImage(imgData,75,220,60,30);
                  doc.addImage(imgData,140,220,60,30);
                  doc.addImage(imgData,10,260,60,30);
                  doc.addImage(imgData,75,260,60,30);
                  doc.addImage(imgData,140,260,60,30);
                  break;
          }
        this.articuloForm.reset();
        this.value = ''; 
        doc.save('doc.pdf');
   
      }).catch( ( error ) => {
          console.error('Error: ', error);
      });
      }
      
    if(this.numeroImpresion <= 0)  {
          this.campoinValido = true; 
          console.log(this.campoinValido)
      }
  
  }

  campoNoValido(campo: string){
    return  this.articuloForm.controls[campo].errors &&
      this.articuloForm.controls[campo].touched;
  }


}
