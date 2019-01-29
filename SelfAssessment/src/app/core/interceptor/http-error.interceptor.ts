import {
    HttpEvent,
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, TimeoutError, Subject, of } from 'rxjs';
import { timeout, retryWhen, map, switchMap } from 'rxjs/operators';
import { ErrorDialogService } from 'src/app/shared/services/error-dialog.service';
import { Injectable } from '@angular/core';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

    constructor(private dialogService: ErrorDialogService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        return next.handle(request)
            .pipe(
                timeout(3000),
                retryWhen(
                    err =>
                        err.pipe(
                            switchMap(e => {
                                if (e.status === 404) {
                                    throw e;
                                } else {
                                    return this.dialogService.openDialog('Cannot reach server.');
                                }
                            })
                        )
                    )

            );
    }
}