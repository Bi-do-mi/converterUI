import {Injectable} from '@angular/core';
import {NgxSpinnerService} from 'ngx-spinner';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {finalize, first, map} from 'rxjs/operators';
import {DaylyCurs} from '../Models/DaylyCurs';
import {Valute} from '../Models/Valute';
import {BehaviorSubject} from 'rxjs';
import {Convertation} from '../Models/Convertation';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentCurs$ = new BehaviorSubject<DaylyCurs>(new DaylyCurs());
  currentCurs = this.currentCurs$.asObservable();

  constructor(
    private spinner: NgxSpinnerService,
    private http: HttpClient
  ) {
  }

  login(credentials) {
    let notFinished = true;
    setTimeout(() => {
      if (notFinished) {
        this.spinner.show();
      }
    }, 10);
    const url = '/api/sign_in?login=' + credentials.login +
      '&password=' + credentials.password;
    return this.http.get(url, {responseType: 'text'})
      .pipe(first(), finalize(() => {
        notFinished = false;
        this.spinner.hide();
      }), map((data) => {
        const ruValute = new Valute('RUB', 1,
          'Российский рубль', 1, 643, '111');
        const curs: DaylyCurs = JSON.parse(data);
        curs.valute.push(ruValute);
        this.currentCurs$.next(curs);
        return data;
      }));
  }

  // используется в обход процесса авторизации если заходить
  // прямиком на стр конвертера
  getCurs() {
    let notFinished = true;
    setTimeout(() => {
      if (notFinished) {
        this.spinner.show();
      }
    }, 10);
    const url = '/api/get_curs';
    return this.http.get(url, {responseType: 'text'})
      .pipe(first(), finalize(() => {
        notFinished = false;
        this.spinner.hide();
      }), map((data) => {
        const ruValute = new Valute('RUB', 1,
          'Российский рубль', 1, 643, '111');
        const curs: DaylyCurs = JSON.parse(data);
        curs.valute.push(ruValute);
        this.currentCurs$.next(curs);
      }));
  }

  saveConvertation(conv: Convertation) {
    const url = '/api/save_convertation';
    return this.http.post(url, conv);
  }

  findConvertations(conv: Convertation) {
    const url = '/api/find_convertations';
    return this.http.post(url, conv);
  }
}
