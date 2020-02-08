import {Component, OnInit} from '@angular/core';
import {UserService} from '../../Services/user.service';
import {DaylyCurs} from '../../Models/DaylyCurs';
import {FormControl} from '@angular/forms';
import {Valute} from '../../Models/Valute';
import {Convertation} from '../../Models/Convertation';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter
} from '@angular/material-moment-adapter';
import * as moment from 'moment';
import {SnackBarService} from "../../Services/snack-bar.service";

@Component({
  selector: 'app-converter',
  templateUrl: './converter.component.html',
  styleUrls: ['./converter.component.scss'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ru-RU'},
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
  ],
})
export class ConverterComponent implements OnInit {
  dc: DaylyCurs;
  firstLabel: string;
  secondLabel: string;
  firstFindLabel: string;
  secondFindLabel: string;
  firstSelectCtrl = new FormControl();
  secondSelectCtrl = new FormControl();
  firstFindSelectCtrl = new FormControl();
  secondFindSelectCtrl = new FormControl();
  firstInputCtrl = new FormControl();
  secondInputCtrl = new FormControl();
  firstCurrentValute: Valute;
  secondCurrentValute: Valute;
  date = new FormControl((new Date()).toISOString());
  displayedColumns: string[] = [
    'sourceCurrency',
    'targetCurrency',
    'sourceAmount',
    'calculatedAmount',
    'date'];
  dataSource: Convertation[];

  constructor(private userService: UserService,
              private snackBarService: SnackBarService) {
  }

  ngOnInit() {
    this.userService.currentCurs.subscribe(data => {
      this.dc = data;
      if (this.firstSelectCtrl && this.dc.valute) {
        this.firstSelectCtrl.setValue(this.dc.valute.filter(v => {
          return v.charCode === 'RUB';
        })[0].name);
        this.secondSelectCtrl.setValue(this.dc.valute.filter(v => {
          return v.charCode === 'USD';
        })[0].name);
        this.firstFindSelectCtrl.setValue(this.dc.valute.filter(v => {
          return v.charCode === 'RUB';
        })[0].name);
        this.secondFindSelectCtrl.setValue(this.dc.valute.filter(v => {
          return v.charCode === 'USD';
        })[0].name);
      }
    });
    this.userService.getCurs().subscribe();


    this.firstSelectCtrl.valueChanges.subscribe((name: string) => {
      if (this.dc && this.dc.valute.length > 0) {
        this.dc.valute.forEach(valute => {
          if (valute.name === name) {
            this.firstCurrentValute = valute;
            this.firstLabel = valute.charCode;
            this.firstInputCtrl.reset();
            this.secondInputCtrl.reset();
          }
        });
      }
    });

    this.secondSelectCtrl.valueChanges.subscribe((name: string) => {
      if (this.dc && this.dc.valute.length > 0) {
        this.dc.valute.forEach(valute => {
          if (valute.name === name) {
            this.secondCurrentValute = valute;
            this.secondLabel = valute.charCode;
            this.firstInputCtrl.reset();
            this.secondInputCtrl.reset();
          }
        });
      }
    });

    this.firstFindSelectCtrl.valueChanges.subscribe((name: string) => {
      if (this.dc && this.dc.valute.length > 0) {
        this.dc.valute.forEach(valute => {
          if (valute.name === name) {
            this.firstFindLabel = valute.charCode;
          }
        });
      }
    });

    this.secondFindSelectCtrl.valueChanges.subscribe((name: string) => {
      if (this.dc && this.dc.valute.length > 0) {
        this.dc.valute.forEach(valute => {
          if (valute.name === name) {
            this.secondFindLabel = valute.charCode;
          }
        });
      }
    });
  }

  calculate(firstAmont?: number, secondAmont?: number) {
    if (firstAmont) {
      this.secondInputCtrl.reset();
      if (this.firstCurrentValute && this.secondCurrentValute) {
        this.secondInputCtrl.setValue(parseFloat('' +
          (firstAmont * this.firstCurrentValute.value
            / this.firstCurrentValute.nominal / this.secondCurrentValute.value
            / this.secondCurrentValute.nominal)).toFixed(3));
        // console.log('firstAmont');
      }
    }
    if (secondAmont) {
      this.firstInputCtrl.reset();
      if (this.firstCurrentValute && this.secondCurrentValute) {
        this.firstInputCtrl.setValue(parseFloat('' +
          (secondAmont * this.secondCurrentValute.value
            / this.secondCurrentValute.nominal / this.firstCurrentValute.value
            / this.firstCurrentValute.nominal)).toFixed(3));
        // console.log('secondAmont');
      }
    }
  }

  convert() {
    if (this.firstInputCtrl.value && this.secondInputCtrl.value) {
      setTimeout(() => {
        const conv = new Convertation();
        conv.sourceCurrency = this.firstCurrentValute.charCode;
        conv.targetCurrency = this.secondCurrentValute.charCode;
        conv.sourceAmount = this.firstInputCtrl.value;
        conv.calculatedAmount = this.secondInputCtrl.value;
        conv.date = this.dc.date;
        this.userService.saveConvertation(conv).subscribe(data => {
          // console.log(JSON.stringify(data));
        });
      }, 700);
    }
  }

  findConvertation() {
    if (this.date.value) {
      const requestConv = new Convertation();
      requestConv.date = moment(this.date.value).format('DD.MM.YYYY');
      requestConv.sourceCurrency = this.firstFindLabel;
      requestConv.targetCurrency = this.secondFindLabel;
      this.userService.findConvertations(requestConv)
        .subscribe((data: Array<Convertation>) => {
          this.snackBarService.close();
          this.dataSource = data;
          if (data.length === 0) {
            this.snackBarService.success(
              'По заданным условиям нет данных', 'OK');
          }
        });
    }
  }

}
