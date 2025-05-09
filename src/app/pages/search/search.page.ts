import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { SearchComponent } from "../../components/search/search.component";

@Component({
  selector: 'app-searchPage',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, SearchComponent]
})
export class SearchPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
