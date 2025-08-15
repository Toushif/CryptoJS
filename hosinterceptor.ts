import { Injectable} from '@angular/core';

import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';

import { Router } from '@angular/router';

import { formatDate } from '@angular/common';

import { throwError, Observable } from 'rxjs';

import { CommunicationService } from './communication.services';

import { JWTService } from './jwt.service';

import { AUTH_URL } from '../constants/api-constant';

import { switchMap, catchError } from 'rxjs/operators';

 

@Injectable()

export class HozXhrInterceptor implements HttpInterceptor {

 

    constructor(

        private jwtService: JWTService,

        private router: Router,

        private communicationService: CommunicationService) {

        this.checkTimeFrameExpiry();

    }

 

 

    checkTimeFrameExpiry() {

        this.communicationService.getTimeFrameData().subscribe(userType => {

            if (userType && userType.periodData) {

                const currentDate = formatDate(new Date(), 'MM/dd/yyyy', 'en-US');

                const presentWeek = userType.periodData.find(val => {

                    return val.periodCaption === "Present Week";

                })

                const expireDate = presentWeek.periodEndValue;

                if(expireDate < currentDate) {

                    this.router.navigate(['/signout'], { state: {sessionError: true} });

                    return;

                }

            }

        })

    }

 

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

 

        if (

            request.url.includes('.json') ||

            request.url === AUTH_URL

        ) {

            return next.handle(request);

        }

 

        if (this.jwtService.isExpire()) {

            return this.jwtService.refreshToken().pipe(switchMap((data) => {

                    request = request.clone({

                        setHeaders: {

                            // This is where you can use your various tokens

                            'hoz-jwt': `${this.jwtService.getJWTtoken()}`

                        },

                        withCredentials: true

                    });

                return next.handle(request);

            }));

        }

 

        request = request.clone({

            setHeaders: {

                // This is where you can use your various tokens

                'hoz-jwt': `${this.jwtService.getJWTtoken()}`

            },

            withCredentials: true

        });

 

        return next.handle(request).pipe(catchError(error => {

            // intercept the respons error and displace it to the console . Stop the Loader and message shown

            // return the error to the method that called it

            return throwError(error);

        }));

 

    }

}