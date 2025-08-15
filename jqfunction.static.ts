import { Router } from '@angular/router';

import { JWTService } from '../services/jwt.service';

import CryptoJS from '../../../../crypto.js';

import { appConstants } from '../constants/global.constant';

 

export class StoreSession {

              userData: any;

              constructor(

                             private jwtService: JWTService,

                            private router: Router) { }

 

    public Encryption(key: string, message: string): void {

              const isEncryptedKey = this._decryptKey(key);

              const encryptedKey = isEncryptedKey || this._encrypt(key);

              const encryptedMsg = this._encrypt(message);

 

              let session = [];

              const exitSession = this.sessionKeys;

              if(exitSession) {

                             const isKey = exitSession.find(val => key === this._decrypt(val, key + '-key'));

                             if(!isKey) {

                                           session.push(encryptedKey);

                                           session =  [...new Set([...exitSession, ...session])];

                             } else {

                                           session =  [...new Set([...exitSession])];

                             }

              } else {

                             session.push(encryptedKey);

              }

 

                          sessionStorage.setItem(appConstants.STORAGE_KEY_SESSION_KEYS, JSON.stringify(session));

              sessionStorage.setItem(encryptedKey, encryptedMsg);

    }

 

    public Decryption(key: string): string {

                             let decryptedTxt = null;

                             const encryptedKey = this._decryptKey(key);

                             if(encryptedKey) {

                                           const encryptedTxt = sessionStorage.getItem(encryptedKey);

                                           decryptedTxt = this._decrypt(encryptedTxt, key);

                             }

                             return decryptedTxt;

    }

 

    public RemoveItem(key: string): void {

              const encryptedKey = this._decryptKey(key);

              sessionStorage.removeItem(encryptedKey);

 

              let session = this.sessionKeys;

              if(session) {

                            const isKey = session.find(val => key === this._decrypt(val, key + '-key2'));

                            isKey ? session.splice(session.indexOf(isKey), 1) : '';

                              sessionStorage.setItem(appConstants.STORAGE_KEY_SESSION_KEYS, JSON.stringify(session));

              }

    }

 

    private _encrypt(message: string): string {

              const cryptoKey: string = this._getKey();

              const encryptedObj: any = CryptoJS.AES.encrypt(message, cryptoKey);

              return encryptedObj.toString();

    }

 

    private _decrypt(encodedTxt: string, keyStr: string = ''): string {

        try {

            const key: string = this._getKey(),

                  decrypted: any = CryptoJS.AES.decrypt(encodedTxt, key),

                  cryptoUTF: any = CryptoJS.enc.Utf8,

                  decryptedStr: string = decrypted.toString(cryptoUTF);

 

            this.jwtService.storeToken = key;

            return decryptedStr;

        } catch {

            const key: string = this._getKey(),

                  token: string = this.jwtService.storeToken,

                  error: string = 'Error in Decryption ' + keyStr;

 

            setTimeout(_=> this.router.navigate(['error'], { state: {sessionError: key !== token} } ));

            throw new Error(error);

        }

    }

 

    private _decryptKey(key: string): string {

              const session = this.sessionKeys;

              return Object.keys(sessionStorage).filter(val=> session && session.indexOf(val) > -1).find(val => key === this._decrypt(val, key + '-key-main'));

    }

 

    private _getKey(): string {

              const t = this.jwtService.getJWTtoken();

              let z=[], a=1, b=1, s = t.split(''), j, f = this.jwtService.getFirstName();

 

                             for(let i = 0; i < t.length; i++) {

                                           if(i) {

                                                          if(i===a) {

                                                                        if(b%2) {

                                                                                      z.push(i); a=i+2; b=b+1;

                                                                        } else {

                                                                                      z.push(i); a=i+3; b=b+1;

                                                                        }

                                                          }

                                           } else {

                                                          z.push(i); a=i+2; b=b+1;

                                           }

                             }

 

                             for (var i = z.length -1; i >= 0; i--)

                                           s.splice(z[i], 1);

 

                             j = s.join('');

                             f = f.split(' ').join('');

                             j = f.charAt(f.length - 1) + j + f.charAt(0);

 

                             return j;

    }

 

    get sessionKeys() {

              return JSON.parse(sessionStorage.getItem(appConstants.STORAGE_KEY_SESSION_KEYS));

    }

 

}