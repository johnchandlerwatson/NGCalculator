import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/calculator.config';
import { CalculatorComponent } from './app/calculator.component';

bootstrapApplication(CalculatorComponent, appConfig)
  .catch((err) => console.error(err));
