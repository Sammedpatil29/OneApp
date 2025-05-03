import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonSearchbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonIcon } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { buildOutline, home, receiptOutline, personCircleOutline,briefcaseOutline,constructOutline,library,personCircle,person,search,bag,cube,radio,playCircle} from 'ionicons/icons';
import { NodataComponent } from "../nodata/nodata.component";

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  imports: [IonIcon, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard, IonSearchbar, IonHeader, IonToolbar, IonTitle, NodataComponent]
})
export class SearchComponent  implements OnInit {
  placeholder = 'Search'
  searchData = []

  constructor() { 
        addIcons({home,buildOutline,receiptOutline,personCircleOutline,briefcaseOutline,constructOutline,library,personCircle,person,search,bag,cube,radio,playCircle});
  
  }

  ngOnInit() {
    // setInterval(()=>{
    //   this.placeholder = `search for Cab`
    // }, 10000)
  }

}
