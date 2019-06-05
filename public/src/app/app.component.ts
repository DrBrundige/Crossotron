import { Component, OnInit } from '@angular/core';
import { HttpService } from './http.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
    words = [];
    count: number
    pattern: any
    live = false
    err: string;

    constructor(private _service: HttpService) { }

    ngOnInit() {
        console.log("Component initialized");
        this.getAllWords()
        this.pattern = ""
    }

    getWords() {
        if (this.pattern == "") {
            this.err = "ERROR! Please provide a search pattern"
            this.words = []
            this.live = false
        } else if(this.pattern.length > 15){
            this.err = "ERROR! Pattern may be no longer than fifteen characters!"
            this.words = []
            this.live = false
        } else {
            console.log("Getting words with pattern " + this.pattern);
            let observable = this._service.getOne(this.pattern);
            observable.subscribe(data => {

                if (data['message'] == false) {
                    console.log("Error:", data['err'])
                    this.err = data['err']
                    this.live = false
                } else {
                    console.log("Got our words!", data)
                    this.words = data['words']
                    this.live = true
                    this.err = ""
                }
            });
        }
    }

    getAllWords() {

        let observable = this._service.getAll();
        observable.subscribe(data => {
            if (data['message'] == false) {
                console.log("Error retrieving all words:", data['err'])
                this.count = -1
            } else {
                console.log("Got our words!", data)
                this.count = data['words'].length
            }
        });
    }

    clearWords() {
        this.words = []
        this.live = false
        this.err = ""

    }
}
