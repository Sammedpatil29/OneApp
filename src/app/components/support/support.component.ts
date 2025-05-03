import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonSearchbar, IonTitle } from "@ionic/angular/standalone";
import { NodataComponent } from "../nodata/nodata.component";

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, NodataComponent]
})
export class SupportComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
