import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonApp, IonRouterOutlet, IonText, IonCardTitle } from '@ionic/angular/standalone';
import { LocationService } from 'src/app/services/location.service';
import { AuthService } from 'src/app/services/auth.service';
import { Platform } from '@ionic/angular';
import { RegisterFcmService } from 'src/app/services/register-fcm.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.page.html',
  styleUrls: ['./layout.page.scss'],
  standalone: true,
  imports: [IonCardTitle, IonRouterOutlet, IonApp, CommonModule, FormsModule]
})
export class LayoutPage implements OnInit {
  isDragging = false;
  offsetX = 0;
  offsetY = 0;
  token: any
  addresses: any = []
  params: any
  profileData: any;

   constructor(private locationService: LocationService, private authService: AuthService, private platform: Platform, private registarFcm: RegisterFcmService, private profileService: ProfileService) {}

 async ngOnInit() {
  const current = await this.locationService.getCurrentPosition()
  console.log(current)
    const orderBubble = document.querySelector('.orderBubble') as HTMLElement;
    this.token = await this.authService.getToken().then((res:any)=> {
      console.log(res)
        this.token = res
        this.params = {"token": this.token}
        const locationData = localStorage.getItem('location')
    console.log(locationData)
    if(locationData == null){
      setTimeout(()=>{
        let params = {
        "token": this.token
      }
      console.log(params)
      this.locationService.getAddressesList(this.params).subscribe((res)=> {
          this.addresses = res;
          if(this.addresses){
            let data = {
              lat: this.addresses[0].lat,
              lng: this.addresses[0].lng,
              address: this.addresses[0].address,
              id: this.addresses[0].id,
              label: this.addresses[0].label
            }
            console.log(data)
            localStorage.setItem('location', JSON.stringify(data))
          } 
      })
      },50)
    }
        console.log('token',this.token)
    })
    // Set the initial position (you can dynamically adjust this)
    // orderBubble.style.left = '20px';  // Set initial left position
    // orderBubble.style.top = '150px';
  }

  getProfileData(){
  console.log('triggered')
  let params = {
    "token": this.token
  }
 this.profileService.getProfileData(params).subscribe({
  next: (res) => {
    this.profileData = res;
  error: (error:any) => {
    alert('Error while fetching data');
    console.error(error);
  }}
});
}

  startDrag(event: MouseEvent | TouchEvent, element: HTMLElement) {
    // Check if the event is touch or mouse and get the appropriate coordinates
    if (event instanceof MouseEvent) {
      this.offsetX = event.clientX - element.getBoundingClientRect().left;
      this.offsetY = event.clientY - element.getBoundingClientRect().top;
    } else if (event instanceof TouchEvent) {
      this.offsetX = event.touches[0].clientX - element.getBoundingClientRect().left;
      this.offsetY = event.touches[0].clientY - element.getBoundingClientRect().top;
    }

    this.isDragging = true;

    // Bind mousemove and mouseup events to window
    window.addEventListener('mousemove', this.dragMove);
    window.addEventListener('mouseup', this.stopDrag);
    window.addEventListener('touchmove', this.dragMove);
    window.addEventListener('touchend', this.stopDrag);
  }

  dragMove = (event: MouseEvent | TouchEvent) => {
    if (this.isDragging) {
      const element = document.querySelector('.orderBubble') as HTMLElement;

      if (event instanceof MouseEvent) {
        element.style.left = event.clientX - this.offsetX + 'px';
        element.style.top = event.clientY - this.offsetY + 'px';
      } else if (event instanceof TouchEvent) {
        element.style.left = event.touches[0].clientX - this.offsetX + 'px';
        element.style.top = event.touches[0].clientY - this.offsetY + 'px';
      }
    }
  };

  stopDrag = () => {
    this.isDragging = false;
    window.removeEventListener('mousemove', this.dragMove);
    window.removeEventListener('mouseup', this.stopDrag);
    window.removeEventListener('touchmove', this.dragMove);
    window.removeEventListener('touchend', this.stopDrag);
  };

  

}
