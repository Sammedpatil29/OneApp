import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonSearchbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonIcon, IonGrid, IonRow, IonCol } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { buildOutline, home, receiptOutline, personCircleOutline,briefcaseOutline,constructOutline,library,personCircle,person,search,bag,cube,radio,playCircle} from 'ionicons/icons';
import { NodataComponent } from "../nodata/nodata.component";
import { LocationService } from 'src/app/services/location.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  imports: [IonCol, IonRow, IonGrid, IonIcon, FormsModule, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard, IonSearchbar, IonHeader, IonToolbar, IonTitle, NodataComponent, CommonModule]
})
export class SearchComponent  implements OnInit {
  placeholder = 'Search'
  searchData = []
  allServices: any;
  searchTerm = ''
  filteredServices = [
    {
        "title": "Food",
        "subtitle": "Order Now",
        "img": "https://example.com/img.jpg",
        "offers": "Flat 20%",
        "width": "50%",
        "route": "food",
        "category": "Essential Services",
        "city": ["Athani"],
        "status": "active",
        "className": {}
    }
  ]

  constructor(private locationService: LocationService, private router: Router) { 
        addIcons({home,buildOutline,receiptOutline,personCircleOutline,briefcaseOutline,constructOutline,library,personCircle,person,search,bag,cube,radio,playCircle});
        this.getServices()
  }

  ngOnInit() {
  }

  getServices(){
    this.locationService.getData().subscribe((res)=> {
          this.allServices = res
      })
  }

  filterServices(event:any){
    this.searchTerm = event.detail.value
    if(this.searchTerm == '') {
      this.filteredServices = []
    } else {
    this.filteredServices = this.allServices.filter((item:any)=> item.title.toLowerCase().includes(this.searchTerm.toLowerCase()) || item.category.toLowerCase().includes(this.searchTerm.toLowerCase()))
    console.log(this.filteredServices)
    }
  }

  dummy(event:any){
console.log(event.title)
  }

  navigateTo(route:any){
    console.log(`/layout/${route}`)
    this.router.navigate([`/layout/${route}`])
  }

}
