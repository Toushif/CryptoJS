import { Injectable } from '@angular/core';

import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

import { Observable , of} from 'rxjs';

import { map, catchError } from 'rxjs/operators';

import { Mock_Environment, Mule_Service_URL, Upload_Service_URL, Json_Server_URL } from '../constants/api-constant';

import { PAM_API } from '../constants/relative-api-constants';

import { APIRelativePath } from '../interfaces/api-relative-path';

import { NameValuePair } from '../interfaces/name-value-pair';

 

@Injectable({

    providedIn: 'root'

})

export class HttpService {

    cookie: string;

    pageLoading: boolean = true;

    PAM_Mule: string = Mule_Service_URL;

    Sparrow: string = Upload_Service_URL;

    PAM_Dummy: string = Json_Server_URL;

 

 

    constructor(private http: HttpClient) {}

 

    get<T>(apiName: string, additionalHeaders?: NameValuePair[]): Observable<T> {

        const url = this.getUrl(apiName);

 

        return this.getApiData(url, additionalHeaders);

    }

 

 

    post<T>(apiName: string, formData: any[] | any, additionalHeaders?: NameValuePair[]): Observable<T> {

        const url = this.getUrl(apiName);

        if(Mock_Environment) {

            return this.getApiData(url, null);

        } else {

            return this.postApiData(url, formData, additionalHeaders, apiName);

        }

    }

 

    put<T>(apiName: string, formData: any[], additionalHeaders?: NameValuePair[]): Observable<T> {

        const url = this.getUrl(apiName);

 

        if(Mock_Environment) {

            return this.getApiData(url, null);

        } else {

            return this.putApiData(url, formData, additionalHeaders);

        }

    }

 

    delete<T>(apiName: string, formData: any[]): Observable<T> {

        const url = this.getUrl(apiName);

 

        if(Mock_Environment) {

            return this.getApiData(url, null);

        } else {

            return this.deleteApiData(url, formData);

        }

    }

 

    private getApiData(url: string, headerValues: NameValuePair[]): Observable<any> {

        const headers: HttpHeaders = this.getHttpHeaders(headerValues);

 

        return this.http.get(url, { headers : headers })

            .pipe(

                map(response => {

                    return response;

                })

            )

    }

 

    private postApiData(url: string, params: any[] | any, headerValues: NameValuePair[], apiName?: string): Observable<any> {

        const postData = apiName !== 'uploadFile' ? this.formatParamData(params) : params;

        const headers: HttpHeaders = this.getHttpHeaders(headerValues);

        let options;

        if(apiName === 'filedownload'|| apiName === 'downloadTemplate') {

            options = {

                headers,

                'responseType': 'blob'

            }

        } else {

            options = { headers }

        }

        return this.http.post<any>(url, postData, options)

            .pipe(

                map(response => {

                    return response;

                })

            )

    }

 

    private putApiData(url: string, params: any[], headerValues: NameValuePair[]): Observable<any> {

        const postData = this.formatParamData(params);

        const headers: HttpHeaders = this.getHttpHeaders(headerValues);

 

        return this.http.put<any>(url, postData, { headers : headers })

            .pipe(

                map(response => {

                    return response;

                })

            )

    }

 

    private deleteApiData(url: string, params: any[]): Observable<any> {

        const deleteData = this.formatParamData(params);

 

        return this.http.delete<any>(url, deleteData)

            .pipe(

                map(response => {

                    return response;

                })

            )

    }

 

    public getHttpHeaders(headerValues: NameValuePair[]): HttpHeaders {

        let headers = new HttpHeaders();

        const defaultHeader: NameValuePair[] = [

            {

                Name: 'Content-type',

                Value: 'application/json'

            }

        ]

        headerValues = headerValues || defaultHeader;

        if(headerValues && headerValues.length > 0) {

            for(let i = 0; i < headerValues.length; i++) {

                if(headerValues[i].Value !== undefined) {

                    headers = headers.set(headerValues[i].Name, headerValues[i].Value);

                }

            }

        }

        return headers;

    }

 

    private formatParamData(params: any[] | any) {

        let postData = {}, deepObject = [];

        const param = params[0];

        if(param && params.length > 0) {

            if('Name' in param) {

                for(let i = 0; i < params.length; i++) {

                    postData[params[i].Name] = params[i].Value;

                }

            } else {

                for(let i = 0; i < params.length; i++) {

                    for(let j in params[i]) {

                        postData[params[i][j]['Name']] = params[i][j]['Value'];

                    }

                    deepObject.push({...postData});

                    postData = {};

                }

                return deepObject;

            }

        }

        return postData;

    }

 

    public getUrl(apiName: string): string {

        const api = PAM_API.find(

            item => {

                return (item.ApiName === apiName);

            }

        );

        const url = this.getApiUrl(api);

        return url;

    }

 

    private extendHeader(a: any, b: any): any {

        for (const key in b) {

            if (b.hasOwnProperty(key)) {

                a[key] = b[key];

            }

        }

        return a;

    }

 

    private getApiUrl(api: APIRelativePath): string {

        let url: unknown;

        if(Mock_Environment) {

            url = Json_Server_URL.concat(api.MockUrl);

        } else {

            url = this[api.Type].concat(api.RelativeUrl);

        }

        return url as string;

    }

 

    public setCookie(cname: string, cvalue: string): void {

        let d = new Date();

        const domain = window.location.hostname;

        const name = cname + '=';

        d.setTime(d.getTime() + (5*60*1000));

        let expires = "expires="+ d.toUTCString();

        document.cookie = name + cvalue;

        document.cookie = expires;

        document.cookie = "domain=" + domain;

    }

 

    public checkCookie(name: string): boolean {

    let username = this.getCookie(name);

    if (username !== undefined) {

        return true;

    }

    return false;

    }

 

    public getCookie(cname: any): string {

        const name = cname + '=';

        const decodedCookie = decodeURIComponent(document.cookie);

        const ca = decodedCookie.split(';');

        for (let citem of ca) {

            let c = citem;

            while (c.charAt(0) === ' ') {

                c = c.substring(1);

            }

            if (c.indexOf(name) === 0) {

                this.cookie = c.substring(name.length, c.length);

            }

        }

        // console.log("getCookie document.cookiee", this.cookie);

        return document.cookie ? this.cookie : null;

    }

 

    public getCookieImage(imageUrl: string) {

        // console.log("getCookieImage", imageUrl);

       

        return this.http.get(imageUrl, { withCredentials: true }).pipe(

            map(res => {

                this.setCookie('name', res['data'].JwtToken);

                return this.checkCookie('name') ? res : {}

            }),

            catchError(err => of(err))

        );

    }

 

    public eraseCookie(): void {

        document.cookie =  'username=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

    }

 

    private handleErrorMsg(error: any) {

        const err = error.message || error.error || error;

        if (err === error) {

            return err;

        } else {

            if (!err) {

                return 'Some error occurred. Please try again.';

            } else if (

                error &&

                error.error &&

                error.error.statusmessage &&

                error.error.statusmessage === 'Record can not be deleted'

            ) {

                return error.error.statusmessage;

            } else {

                return 'Some error occurred. Please try again.';

            }

        }

    }

}