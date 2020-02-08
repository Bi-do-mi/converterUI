import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {UserService} from '../../Services/user.service';
import {SnackBarService} from '../../Services/snack-bar.service';
import {HttpErrorResponse} from '@angular/common/http';
import {DaylyCurs} from '../../Models/DaylyCurs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  authorized = false;
  loginForm: FormGroup;
  submitted = false;
  loading = false;
  credentials = {login: '', password: ''};

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private snackBarService: SnackBarService) {
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      login: ['', Validators.email],
      password: ['', Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$')]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      console.log('invalid optionsForm. return');
      return;
    }
    this.loading = true;
    this.credentials.login = this.f.login.value.replace(/\s+/g, '_').toLowerCase();
    this.credentials.password = this.f.password.value || this.f.newPassword.value;
    this.login(this.credentials);
  }

  login(credentials) {
    this.userService.login(this.credentials)
      .subscribe(data => {
          this.loading = false;
          if (data) {
            this.authorized = true;
            this.router.navigate(['/converter',
              {returnUrl: this.router.routerState.snapshot.url}]);
          } else {
            this.snackBarService.error('Неправильный логин или пароль.', 'OK');
          }
        },
        error => {
          this.loading = false;
          if (error instanceof HttpErrorResponse) {
            this.snackBarService.error('Ошибка: Неправильный логин или пароль.', 'OK');
          }
        }
      );
  }
}
