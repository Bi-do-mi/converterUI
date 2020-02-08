export class Valute {
  id: string;
  numCode: number;
  charCode: string;
  nominal: number;
  name: string;
  value: number;


  constructor(charCode?: string, nominal?: number, name?: string, value?: number,
              numCode?: number, id?: string) {
    this.charCode = charCode;
    this.nominal = nominal;
    this.name = name;
    this.value = value;
    this.numCode = numCode;
    this.id = id;
  }
}
