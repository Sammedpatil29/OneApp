import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonCard } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { library, playCircle, radio, search, helpCircleOutline,timeOutline,helpCircle,homeSharp,searchOutline,time,homeOutline, home, person } from 'ionicons/icons';
import { register } from 'swiper/element/bundle';

register();
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports:[IonTabs, IonTabBar, IonTabButton, IonIcon]
})
export class NavbarComponent  implements OnInit {


  orders: any = [
    {
      orderId: '37364643764'
    },
    {
      orderId: '78374'
    }
  ] 

  constructor(private router: Router) { 
    addIcons({ home,search,helpCircleOutline,timeOutline,helpCircle,homeSharp,searchOutline,time,homeOutline,radio,library,person,playCircle });
  }

  ngOnInit() {}

  onOrderClick(orderId: any){
    alert(`clicked on ${orderId}`)
  }

  goToHome(){
    this.router.navigate(['/layout/example/home']);
  }

}
