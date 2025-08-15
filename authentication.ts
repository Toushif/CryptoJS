import { Injectable, OnDestroy } from '@angular/core';

import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';

import { Subscription } from 'rxjs';

import { AppSettings, AUTH_URL, SUPERVISOR_USER, TEMP_SUPERVISOR_USER, PROCESSOR_USER, COBDADMIN_USER, COBDUSER_USER, GET_TIME_FRAME, MANAGE_USERS } from '../constants/api-constant';

import { UserInfo } from './userInfo.service';

import { JqFunctions } from '../static-class/jqfunctions.static';

import { CommunicationService } from './communication.services';

import { JWTService } from './jwt.service';

import { appConstants } from '../constants/global.constant';

import { ArrayConstants } from '../constants/array-constants';

import { userRoles } from '../constants/json-constants';

import { StoreSession } from '../static-class/store';

 

@Injectable()

export class AuthenticationService implements Resolve<any> {

    arrayConstants: any = ArrayConstants;

    sessionStore: any;

 

    constructor(

        private router: Router,

        private userInfo: UserInfo,

        private communicationService: CommunicationService,

        private jwtService: JWTService) {

        this.sessionStore = new StoreSession(this.jwtService, this.router);

    }

 

    resolve(activatedRoute: ActivatedRouteSnapshot): Promise<any> {

        this.userInfo._imageUrl = AUTH_URL;

        this.userInfo._timeFrameUrl = GET_TIME_FRAME;

        this.userInfo._manageUsersUrl = MANAGE_USERS;

        this.userInfo._serviceUrl = AUTH_URL;

        this.communicationService.displayLoader(true);

        if (this.sessionStore.Decryption(this.userInfo._storageKey) && this.sessionStore.Decryption(this.userInfo._storageKeyManageUsers)) {

            const data = this.userInfo._currentUserFromStorage();

            return this.launchApp(data);

        } else {

            JqFunctions.deleteLocalStorage();

            return this.initCurrentUser();

        }

    }

 

    initCurrentUser(): Promise<any> {

        return this.userInfo._getCookieImage().then(

            (data) => {

                return this.userInfo._getUser().then(

                    data => {

                        return this.launchApp(data);

                    },

                    error => {

                        console.error("Service User error:", error);

                        this.gotoErrorPage();

                    }

                );

            },

            error => {

                console.error("Error:", error);

                this.gotoErrorPage();

            }

        );

    }

 

    launchApp(data: any) {

 

        const forgeRockRoles = [];

        let access = false, resultRoles = [];

       

        const manageUsersData = this.userInfo._getUsersFromStorage();

        if(manageUsersData && manageUsersData.assignments && manageUsersData.assignments.length > 0) {

            const entitlements = manageUsersData.assignments;

            entitlements.some(val => {

                if(val.name === 'ApplicationLevel' && val.platform === 'PAM' && val.action.includes('Access')) {

                    access = true;

                    return true;

                }

            })

        }

 

        if(manageUsersData && manageUsersData['userRole'] && access) {

            const roles = manageUsersData['userRole'].split(',');

            roles.forEach(val => {

                const role = val.substring(manageUsersData['userRole'].indexOf('_')+1, manageUsersData['userRole'].length);

                forgeRockRoles.push(role.toLowerCase());

            })

 

            forgeRockRoles.forEach(role => {

                this.arrayConstants.UserRoles.some(val => {

                    if(role === val.toLowerCase().replace('\\', '')) {

                        resultRoles.push(role);

                        return true;

                    }

                })

            })

           

            if(resultRoles.length > 0) {

                let rolesCamelCase = [];

                resultRoles.forEach(roles => {

                    for(let val in userRoles) {

                        if(val === roles) {

                            rolesCamelCase.push(userRoles[val]);

                            break;

                        }

                    }

                })

               

                return this.setApplicationData(data, rolesCamelCase.join(', '));

            } else {

                this.gotoErrorPage();

            }

        } else {

            this.gotoErrorPage();

        }

 

    }

 

    private setApplicationData(data: any, role: string): Promise<string> {

        this.communicationService.setUserInfo(data);

        this.communicationService.setAccessType(role);

        this.communicationService.setTimeFrameData(this.userInfo._timeFramerFromStorage());

        this.communicationService.setAssetData(this.userInfo._assetTypeFromStorage());

        this.communicationService.displayLoader(false);

        return new Promise(resolve => resolve(appConstants.SUCCESS));

    }

 

    gotoErrorPage(): Promise<string> {

        this.communicationService.displayLoader(false);

        JqFunctions.deleteLocalStorage();

        this.router.navigate(['error'], { state: {sessionError: false} });

        return new Promise(resolve => resolve('Error'));

    }

}