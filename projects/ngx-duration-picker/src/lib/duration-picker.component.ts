import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { DurationPickerOptions } from './duration-picker';

@Component({
  selector: 'ngx-duration-picker',  // tslint:disable-line:component-selector
  templateUrl: './duration-picker.component.html',
  styleUrls: ['./duration-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DurationPickerComponent),
      multi: true
    }
  ],
})
export class DurationPickerComponent implements OnInit, ControlValueAccessor {

  @Input() set options(options) {
    this.attachChanges(options);
  }

  private _value: string;

  get value(): string {
    return this._value;
  }

  @Input()
  set value(value: string) {
    this._value = value;
    this.parse();
    this.emitCustomOutput();
  }

  @Output() valueChange = new EventEmitter<string>();
  @Output() customOutput = new EventEmitter<string | number>();

  private _disabled = false;

  get disabled(): boolean {
    return this._disabled;
  }

  @Input()
  set disabled(disabled: boolean) {
    this._disabled = disabled;
  }

  regex: RegExp = /^[\+\-]?P(?!$)(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(?=\d+[HMS])(\d+H)?(\d+M)?(\d+S)?)?$/;

  private _negative = false;
  private _years    = 0;
  private _months   = 0;
  private _weeks    = 0;
  private _days     = 0;
  private _hours    = 0;
  private _minutes  = 0;
  private _seconds  = 0;

  config: DurationPickerOptions = {
    showNegative: false,
    showButtons : true,
    showPreview : true,
    showLetters : true,
    showYears   : true,
    showMonths  : true,
    showWeeks   : true,
    showDays    : true,
    showHours   : true,
    showMinutes : true,
    showSeconds : true,
    zeroValue   : 'PT0S',
    previewFormat: 'ISO',
    customOutputFormat: 'ISO',
    labels: {
      years: 'Y',
      months: 'M',
      weeks: 'W',
      days: 'D',
      hours: 'H',
      minutes: 'M',
      seconds: 'S',
    },
  };

  get preview(): string {
    if (!this.config.previewFormat || this.config.previewFormat.length === 0 || this.config.previewFormat === 'ISO') {
      return this.value;
    }

    return this.injectValuesIntoString(this.config.previewFormat);
  }

  get negative() { return this._negative; }
  set negative(value) {
    this._negative = value;
    this.emitNewValue();
  }

  get years() { return this._years; }
  set years(value) {
    value = this.parseNumber(value) > 0 ? value : 0;
    this._years = value;
    this.emitNewValue();
  }

  get months() { return this._months; }
  set months(value) {
    value = this.parseNumber(value) > 0 ? value : 0;
    this._months = value;
    this.emitNewValue();
  }

  get weeks() { return this._weeks; }
  set weeks(value) {
    value = this.parseNumber(value) > 0 ? value : 0;
    this._weeks = value;
    this.emitNewValue();
  }

  get days() { return this._days; }
  set days(value) {
    value = this.parseNumber(value) > 0 ? value : 0;
    this._days = value;
    this.emitNewValue();
  }

  get hours() { return this._hours; }
  set hours(value) {
    value = this.parseNumber(value) > 0 ? value : 0;
    this._hours = value;
    this.emitNewValue();
  }

  get minutes() { return this._minutes; }
  set minutes(value) {
    value = this.parseNumber(value) > 0 ? value : 0;
    this._minutes = value;
    this.emitNewValue();
  }

  get seconds() { return this._seconds; }
  set seconds(value) {
    value = this.parseNumber(value) > 0 ? value : 0;
    this._seconds = value;
    this.emitNewValue();
  }

  get valueInSeconds() {
    return (this.negative ? -1 : 1) * (
      this.seconds +
      this.minutes * 60 +
      this.hours * 3600 +
      this.days * 86400 +
      this.weeks * 6048000 +
      this.months * 25920000 +
      this.years * 315360000
    );
  }

  get valueInMilliseconds() {
    return this.valueInSeconds * 1000;
  }

  onChange = (_: any) => {};
  onTouched = () => {};

  constructor() { }

  ngOnInit() {
    this.parse();
    this.value = this.generate();
  }

  registerOnChange(fn) {
    this.onChange = fn;
  }

  registerOnTouched(fn) {
    this.onTouched = fn;
  }

  writeValue(value) {
    if (value) {
      this.value = value;
    }
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  parse() {
    if (!this.value) {
      return;
    }

    const match = this.regex.exec(this.value);

    if (!match) {
      console.error(`DurationPicker: invalid initial value: ${this.value}`);
      return;
    }

    this._negative = match[0].startsWith('-');
    this._years    = this.parseNumber(match[1]);
    this._months   = this.parseNumber(match[2]);
    this._weeks    = this.parseNumber(match[3]);
    this._days     = this.parseNumber(match[4]);
    this._hours    = this.parseNumber(match[6]);
    this._minutes  = this.parseNumber(match[7]);
    this._seconds  = this.parseNumber(match[8]);
  }

  parseNumber(value): number {
    return value ? parseInt(value, 10) : 0;
  }

  generate(): string {
    let output = 'P';

    if (this.config.showNegative && this.negative) {
      output = '-' + output;
    }

    if (this.config.showYears && this.years) {
      output += `${this.years}Y`;
    }
    if (this.config.showMonths && this.months) {
      output += `${this.months}M`;
    }
    if (this.config.showWeeks && this.weeks) {
      output += `${this.weeks}W`;
    }
    if (this.config.showDays && this.days) {
      output += `${this.days}D`;
    }
    if (
      (this.config.showHours && this.hours)
      || (this.config.showMinutes && this.minutes)
      || (this.config.showSeconds && this.seconds)
    ) {
      output += 'T';

      if (this.config.showHours && this.hours) {
        output += `${this.hours}H`;
      }
      if (this.config.showMinutes && this.minutes) {
        output += `${this.minutes}M`;
      }
      if (this.config.showSeconds && this.seconds) {
        output += `${this.seconds}S`;
      }
    }

    // if all values are empty, just output null
    if (output === 'P' || output === '-P') {
      output = this.config.zeroValue;
    }

    return output;
  }

  injectValuesIntoString(text: string) {
    return text
      .replace('{{Y}}', `${this.years}`)
      .replace('{{M}}', `${this.months}`)
      .replace('{{W}}', `${this.weeks}`)
      .replace('{{D}}', `${this.days}`)
      .replace('{{h}}', `${this.hours}`)
      .replace('{{m}}', `${this.minutes}`)
      .replace('{{s}}', `${this.seconds}`);
  }

  emitNewValue() {
    this.value = this.generate();
    this.valueChange.emit(this.value);
    this.emitCustomOutput();
    this.onTouched();
    this.onChange(this.value);
  }

  emitCustomOutput() {
    let customOutput: string | number = this.value;

    if (this.config.customOutputFormat && this.config.customOutputFormat.length > 0) {
      switch (this.config.customOutputFormat) {
        case 'ISO': break;
        case 'timestamp': customOutput = this.valueInMilliseconds; break;
        case 'seconds': customOutput = this.valueInSeconds; break;
        default: this.injectValuesIntoString(this.config.customOutputFormat);
      }
    }

    this.customOutput.emit(customOutput);
  }

  // Attach all the changes received in the options object
  attachChanges(options: any): void {
    Object.keys(options).forEach(param => {
      if (this.config.hasOwnProperty(param)) {
        if (typeof (this.config)[param] === 'object') {
          (this.config)[param] = {
            ...(this.config)[param],
            ...options[param]
          };
        } else {
          (this.config)[param] = options[param];
        }
      }
    });
  }
}
