import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  checkmarkCircle, timeOutline, bicycleOutline, homeOutline, 
  receiptOutline, chevronBackOutline, chatbubbleEllipsesOutline,
  cubeOutline, checkmarkDoneCircleOutline, closeCircleOutline
} from 'ionicons/icons';
import { ActivatedRoute, Router } from '@angular/router';
import { GroceryService } from 'src/app/services/grocery.service';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorComponent } from "src/app/components/error/error.component";

@Component({
  selector: 'app-grocery-order-details',
  templateUrl: './grocery-order-details.page.html',
  styleUrls: ['./grocery-order-details.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ErrorComponent]
})
export class GroceryOrderDetailsPage implements OnInit {

  orderId:any;
  token:any;
  currentRoute: any;
  // Mock Data matching your JSON Response
  orderDetails:any = {}
  isLoading: boolean = false;
  isError: boolean = false;
  // backButtonSubscription: any;
  
  // {
  //   "id": "14",
  //   "user_id": 4,
  //   "status": "confirmed", // Change this to 'delivered', 'cancelled', 'preparing' to test UI
  //   "createdAt": "2026-02-04T17:16:23.502Z",
  //   "address": "Home - 123, Green Street, Bengaluru",
  //   "payment_details": {
  //       "mode": "cod"
  //   },
  //   "cart_items": [
  //       {
  //           "name": "Potato",
  //           "image": "https://res.cloudinary.com/dvwggnqnw/image/upload/v1770195830/potato_wvontb.png",
  //           "weight": "1 kg",
  //           "quantity": 1,
  //           "sellingPrice": 35,
  //           "total": 35
  //       },
  //       {
  //           "name": "Broccoli",
  //           "image": "https://res.cloudinary.com/dvwggnqnw/image/upload/v1770196191/brocolli_vj1lsw.png",
  //           "weight": "1 pc",
  //           "quantity": 1,
  //           "sellingPrice": 45,
  //           "total": 45
  //       }
  //   ],
  //   "bill_details": {
  //       "itemTotal": "80.00",
  //       "handlingCharge": "3.00",
  //       "deliveryFee": "30.00",
  //       "toPay": "113.00",
  //       "totalSavings": "15.00"
  //   }
  // };

  timeline:any = []
  
  // [
  //   { status: 'confirmed', title: 'Order Confirmed', icon: 'checkmark-circle', active: false },
  //   { status: 'preparing', title: 'Being Prepared', icon: 'cube-outline', active: false },
  //   { status: 'out_for_delivery', title: 'Out for Delivery', icon: 'bicycle-outline', active: false },
  //   { status: 'delivered', title: 'Delivered', icon: 'home-outline', active: false }
  // ];

  constructor(private navCtrl: NavController, private route: ActivatedRoute, private router: Router, private groceryService: GroceryService, private authServcie: AuthService, private platform: Platform) { 
    addIcons({ 
      checkmarkCircle, timeOutline, bicycleOutline, homeOutline, 
      receiptOutline, chevronBackOutline, chatbubbleEllipsesOutline,
      cubeOutline, checkmarkDoneCircleOutline, closeCircleOutline
    });
  }

  async ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('id');
  this.currentRoute = history.state?.from;


    this.token = await this.authServcie.getToken();
    this.getOrderDetails()
  }

  // ionViewDidEnter() {
  //   this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(9999, () => {
  //     this.goBack();
  //   });
  // }

  // ionViewWillLeave() {
  //   this.backButtonSubscription?.unsubscribe();
  // }

  updateTimeline() {
    // Basic logic to activate timeline steps based on current status
    const statusMap: any = { 'confirmed': 0, 'preparing': 1, 'out_for_delivery': 2, 'delivered': 3 };
    const currentStepIndex = statusMap[this.orderDetails.status] || 0;

    this.timeline.forEach((step:any, index:any) => {
      step.active = index <= currentStepIndex;
    });
  }

  getStatusColor(status: string) {
    switch(status) {
      case 'confirmed': return 'primary';
      case 'preparing': return 'warning';
      case 'out_for_delivery': return 'tertiary';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'medium';
    }
  }

  getStatusText(status: string) {
  // Add this check to prevent the 'undefined' error
  if (!status) return 'LOADING...'; 
  
  return status.replace(/_/g, ' ').toUpperCase();
}

  getOrderDetails(){
    this.isLoading = true;
    this.isError = false;
    this.groceryService.getOrderById(this.token, this.orderId).subscribe((res:any)=>{
      this.orderDetails = res.data;
      this.isLoading = false
      this.updateTimeline();
    }, error => {
      this.isLoading = false;
      this.isError = true;
    })
  }

  doRefresh(event:any) {
    setTimeout(() => {
      this.getOrderDetails();
      event.target.complete();
    }, 500);
  }

  goBack() {
    if(this.currentRoute == 'history') {
      this.navCtrl.back();
    } else {
      this.navCtrl.navigateRoot('/layout/example/home');
    }
  }
}