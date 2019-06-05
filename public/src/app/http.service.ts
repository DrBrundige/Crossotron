import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class HttpService {
    constructor(private _http: HttpClient) {
        console.log("Initializing HTTP Service");
    }

    getAll() {
        return this._http.get(`/xwords/`);
    }
    getOne(str: string) {
        return this._http.get(`/xwords/str/${str}`);
    }
}
