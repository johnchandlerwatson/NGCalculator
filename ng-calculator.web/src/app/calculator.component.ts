import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/apiservice'
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Operation, OperationCharacterMap } from '../common/Operation'
import { HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import ICalculationResponse from '../common/calculationResponse';

@Component({
  selector: 'calculator',
  standalone: true,
  templateUrl: './calculator.component.html',
  styleUrl: './calculator.component.css',
  imports: [
    FormsModule,
    HttpClientModule,
    CommonModule
  ],
  providers: [
    ApiService,
    HttpClient
  ]
})

export class CalculatorComponent {

  constructor(private _api: ApiService) {
  }

  async ngOnInit() {
    this._initBoot();

    this._api.get('/').subscribe((response) => {
      if ((response.status == 200)) {
        this.hasHistory = true;

        this._api.get('calculation/latest')?.subscribe((response) => {
          this._currentCalculationId = Number.parseInt(response.body!.toString()) + 1
        })
      }
    })
  }

  private _originalValue: number | null = null;
  private _currentValue: number = 0;
  private _total: number = 0;
  private _operation: Operation | null = null;
  private _currentCalculationId: number | null = 0;
  public valueDisplay: string | null = null;
  public placeholder: string = 'hello :)';
  public hasHistory: boolean = false;

  public calculateTotal() {
    switch (this._operation) {
      case Operation.Add:
        this._total = this._originalValue! + this._currentValue;
        break;
      case Operation.Subtract:
        this._total = this._originalValue! - this._currentValue;
        break;
      case Operation.Multiply:
        this._total = this._originalValue! * this._currentValue;
        break;
      case Operation.Divide:
        this._total = this._originalValue! / this._currentValue;
        break;
    }
  }
  public add() {
    this._operation = Operation.Add;
    this._allowNewNumber();
  }

  public subtract() {
    this._operation = Operation.Subtract;
    this._allowNewNumber();
  }

  public multiply() {
    this._operation = Operation.Multiply;
    this._allowNewNumber();
  }

  public divide() {
    this._operation = Operation.Divide;
    this._allowNewNumber();
  }

  private _allowNewNumber() {
    this._originalValue = this._currentValue;
    this._currentValue = 0;
  }

  public equal() {
    this.calculateTotal();
    this.valueDisplay = this._total.toLocaleString();
    this._saveCalculation();

    this._currentValue = this._total;
    this._operation = null;
    this._originalValue = null;
  }

  private _saveCalculation() {
    type Nullable<T> = T | null;
    type CalculationRequest = {
      display: Nullable<string>;
      total: number;
    };
    let operationCharacter = new OperationCharacterMap().map(this._operation!);
    let payload: CalculationRequest = {
      display: `${this._originalValue}${operationCharacter}${this._currentValue}=${this._total}`,
      total: this._total
    }
    this._api.post('calculation', payload).subscribe({
      next: (response) => {
        let calculation = response.body as ICalculationResponse;
        if (calculation) {
          this._currentCalculationId = calculation.id + 1
        }
      }
    })
  }

  public print(number: number) {
    if (this._currentValue == 0) {
      this._currentValue = number;
    } else if (this.valueDisplay?.endsWith('.')) {
      this._currentValue = Number(this.valueDisplay + number.toString())
    } else {
      this._currentValue = Number(this._currentValue + number.toString());
    }
    this.valueDisplay = this._currentValue.toLocaleString()
  }

  public addDecimal() {
    if (!this.valueDisplay?.includes('.')) {
      this.valueDisplay = this._currentValue + '.';
    }
  }

  public changePositivity() {
    this._currentValue = this._currentValue * -1;
  }

  public getPercentage() {
    this._currentValue = this._currentValue * .01;
  }

  public clearTotal() {
    this._currentValue = 0;
    this._total = 0;
    this.valueDisplay = '0';
    this._operation = null;
  }

  private _delay(duration: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, duration);
    });
  }

  private _initBoot() {
    const numberOfCharacters = 15;
    const delayPerCharacter = 200;
    Promise.resolve()
      .then(() => this._delay(700))
      .then(() => this.placeholder = 'hello ;)')
      .then(() => this._delay(500))
      .then(() => this.placeholder = 'hello :)')
      .then(() => this._delay(500))
      .then(() => {
        this.placeholder = 'booting';
        let self = this;
        (function addChar() {
          setTimeout(function() {
            self.placeholder += '.'
            if (self.placeholder.length <= numberOfCharacters) addChar();
          }, delayPerCharacter)
        })();
      })
      .then(() => this._delay(numberOfCharacters * delayPerCharacter))
      .then(() => {
          this.placeholder = '888888888888888'
          this.valueDisplay = '0'
        });
  }

  private _getHistory(id: number) {
    this._api.get(`calculation/${id}`)?.subscribe({
      next: (response) => {
        let calculation = response.body as ICalculationResponse;
        if (calculation) {
          this.valueDisplay = calculation.display ?? '0'
          this._currentValue = calculation.total
          this._currentCalculationId = calculation.id
        }
      },
      error: (e) => {
        console.log(e)
      }
    })
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this._currentCalculationId && (event.key == "ArrowUp" || event.key == "ArrowDown")) {
      let calculationId = event.key == "ArrowUp"
        ? this._currentCalculationId - 1
        : this._currentCalculationId + 1;
      this._getHistory(calculationId)
    }
  }
}
