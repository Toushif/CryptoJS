import { Injectable } from '@angular/core';

import { BehaviorSubject, Subject, Observable } from 'rxjs';

 

 

@Injectable()

export class CommunicationService {

    private loggedin = new BehaviorSubject(null);

    private timeframe = new BehaviorSubject(null);

    private userInfo = new BehaviorSubject<any>(null);

    private loader = new BehaviorSubject<boolean>(false);

    private logger = new Subject<any>();

    private accessType = new BehaviorSubject(null);

    private btSubScreen = new BehaviorSubject(null);

    private gridData = new BehaviorSubject(null);

    private pxToRemMul = new BehaviorSubject<number>(null);

    public assetType = new BehaviorSubject<string>(null);

    public retrieveNotes = new Subject();

 

    constructor() { }

 

    setAccessType(accessType) {

        this.accessType.next(accessType);

    }

 

    getAccessType(): Observable<string> {

        return this.accessType.asObservable();

    }

 

    getLoggedInType(): Observable<boolean> {

        return this.loggedin.asObservable();

    }

 

    setLoggedinType(type: boolean): void {

        this.loggedin.next(type);

    }

 

    getTimeFrameData(): Observable<any> {

        return this.timeframe.asObservable();

    }

 

    setTimeFrameData(data: any): void {

        this.timeframe.next(data);

    }

 

    getAssetData(): Observable<string> {

        return this.assetType.asObservable();

    }

 

    setAssetData(data: string): void {

        this.assetType.next(data);

    }

 

    getBTSubScreen(): Observable<string> {

        return this.btSubScreen.asObservable();

    }

 

    setBTSubScreen(data: string): void {

        this.btSubScreen.next(data);

    }

 

    clearLoggedinType(): void {

        this.loggedin.next(null);

    }

 

    getUserInfo(): Observable<any> {

        return this.userInfo.asObservable();

    }

 

    setUserInfo(data: any): void {

        this.userInfo.next(data);

    }

 

    clearUserInfo(): void {

        this.userInfo.next(null);

    }

 

    setGridData(data: any): void {

        this.gridData.next(data);

    }

 

    getGridData(): Observable<any> {

        return this.gridData.asObservable();

    }

 

    getLoader(): Observable<boolean> {

        return this.loader.asObservable();

    }

 

    displayLoader(data: boolean): void {

        this.loader.next(data);

    }

 

    clearLoader(): void {

        this.loader.next(false);

    }

 

    getLogger(): Observable<any> {

        return this.logger.asObservable();

    }

 

    setLogger(data): void {

        this.logger.next(data);

    }

 

    clearLogger(): void {

        this.logger.next(false);

    }

 

    getNotes(): Observable<any> {

        return this.retrieveNotes.asObservable();

    }

 

    getPxToRemMultiplier(): Observable<any> {

        return this.pxToRemMul.asObservable();

    }

 

    setPxToRemMultiplier(data: any): void {

        this.pxToRemMul.next(data);

    }

}