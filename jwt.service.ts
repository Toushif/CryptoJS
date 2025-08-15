import { Injectable } from '@angular/core';

import { formatDate } from '@angular/common';

import { HttpService } from './http.services'

import { CommunicationService } from './communication.services';

import { AUTH_URL } from '../constants/api-constant';

 

@Injectable({

    providedIn: 'root'

})

export class JWTService {

 

   constructor(private httpService: HttpService, private communicationService: CommunicationService) {}

    storeToken: string;

    getJWTtoken(): string {

        return this.httpService.getCookie('name');

    }

 

 

    getFirstName(): string {

        return this.httpService.getCookie('firstname');

    }

 

    getParsedJwt(token?: string): any {

        token = token || this.getJWTtoken();

        if (!token) {

            return null;

        }

        var base64Url = token.split('.')[1];

        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

        var jsonPayload = decodeURIComponent(

            atob(base64)

                .split('')

                .map(function(c) {

                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);

                })

                .join('')

        );

 

        return JSON.parse(jsonPayload);

    }

 

    isExpire(token?: string): boolean {

       let expired = false;

        const jwtToken = this.getParsedJwt(token);

        //console.log(jwtToken)

        expired = !jwtToken ? true : Math.round(new Date().getTime() / 1000) >= jwtToken.exp ? true : false;

        //console.log(jwtToken.exp);

        //console.log(Math.round(new Date().getTime() / 1000));

        //console.log(expired);

        return expired;

    }

 

    refreshToken() {

        this.httpService.eraseCookie();

        // console.log("refreshToken", AUTH_URL, this.httpService.checkCookie('name'), document.cookie);

        return this.httpService.getCookieImage(AUTH_URL);

    }

 

    // isSessionExpire(): boolean {

    //     this.communicationService.getTimeFrameData().map(userType => {

    //         if (userType && userType.periodData) {

    //             const currentDate = formatDate(new Date(), 'MM/dd/yyyy', 'en-US');

    //             const presentWeek = userType.periodData.find(val => {

    //                 return val.periodCaption === "Present Week";

    //             })

    //             const expireDate = presentWeek.periodEndValue;

    //             if(expireDate < currentDate) {

    //                 return true;

    //             }

    //         }

    //     })

    //     return false;

    // }

}