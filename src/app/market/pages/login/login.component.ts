
import { Component, Input, OnInit, ViewChild, NgModule } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FireAuthService } from '../../../services/fire-auth.service';
import { InteraccionService } from '../../../services/interaccion.service';
import { Producto } from '../../../models/models';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  
  userForm: UntypedFormGroup = this.fb.group({
    email: ['',[Validators.required, Validators.email]],
    contrasena: ['',[Validators.required, Validators.minLength(6)]]
  });
  
  constructor(private fb:UntypedFormBuilder,
    private fireAuthService:FireAuthService,
    private route:Router,
    private interaccionService:InteraccionService) { }
    
    user = {
      email: '',
      contrasena: ''
    }
    
    //@ViewChild('password') passwordInput;
    
    ngOnInit() {
      
    }
    
    ingresar(){
      this.user.email = this.userForm.controls.email.value;
      this.user.contrasena = this.userForm.controls.contrasena.value;
      this.fireAuthService.login(this.user.email, this.user.contrasena).then( res => {
        this.route.navigate(['/market/inventario']);
        this.userForm.reset();
        this.mostrarContrasena();
        this.interaccionService.showToast('Bienvenidos');
      }).catch( () => {
        this.interaccionService.showToast("Usuario o contraseña incorrectos");
      });
      this.obtener();
    }
    
    mostrarContrasena(){
      
      //apuntamos al elemnto html para cambiar su tipo
    let password = document.getElementById('password') as HTMLInputElement

    if(password.type === 'password'){
      password.type = 'text';
    } else{
      password.type = 'password';
    }
  }



  campoNoValido(campo: string){
    return this.userForm.controls[campo].errors &&
            this.userForm.controls[campo].touched;
  }

  async obtener(){
    const uid = await this.fireAuthService.getUid();
    console.log(uid);
  }

  onKeyPress(){
      this.ingresar();
  }

}
