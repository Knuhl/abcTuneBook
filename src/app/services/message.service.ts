import { Injectable, isDevMode } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private logSubject = new Subject<Log>();

  get logs(): Observable<Log> {
    return this.logSubject;
  }

  constructor(private toastr: ToastrService) {
    this.logSubject.subscribe(log => {
      switch (log.level) {
        case LogLevel.Info:
          this.toastr.info(log.msg);
          break;
        case LogLevel.Warn:
          this.toastr.warning(log.msg);
          break;
        case LogLevel.Error:
          this.toastr.error(log.msg);
          break;
        default: break;
      }
    });

    if (isDevMode()) {
      this.logSubject.subscribe(log => console.log(log.level + ': ' + log.msg, log.addionalInfo));
      this.trace('running in dev mode');
    }
  }

  trace(msg: string, ...optionalParams: any[]) {
    this.log(LogLevel.Trace, msg, ...optionalParams);
  }

  debug(msg: string, ...optionalParams: any[]) {
    this.log(LogLevel.Debug, msg, ...optionalParams);
  }

  info(msg: string, ...optionalParams: any[]) {
    this.log(LogLevel.Info, msg, ...optionalParams);
  }

  warn(msg: string, ...optionalParams: any[]) {
    this.log(LogLevel.Warn, msg, ...optionalParams);
  }

  error(msg: string, ...optionalParams: any[]) {
    this.log(LogLevel.Error, msg, ...optionalParams);
  }

  log(level: LogLevel, msg: string, ...optionalParams: any[]) {
    this.logSubject.next(new Log(level, msg, ...optionalParams));
  }
}

enum LogLevel {
  Trace = 'TRACE',
  Debug = 'DEBUG',
  Info = 'INFO',
  Warn = 'WARN',
  Error = 'ERROR'
}

class Log {
  level: LogLevel;
  msg: string;
  addionalInfo: any[];

  constructor(level: LogLevel, msg: string, ...optionalParams: any[]) {
    this.level = level;
    this.msg = msg;
    this.addionalInfo = optionalParams;
  }
}
