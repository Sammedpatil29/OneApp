import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-grocery-order-details',
  templateUrl: './grocery-order-details.page.html',
  styleUrls: ['./grocery-order-details.page.scss'],
  standalone: true,
  imports: [IonIcon, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class GroceryOrderDetailsPage implements OnInit {

  routeSource: any;
  expandBillSummary: boolean = false
  expandItemDetails: boolean = false
  headerBg: any;
  headerColor: any;
  orderDetails: any = {
    "id": 46,
    "type": "grocery",
    "title": "Grocery Order",
    "otp": "4357",
    "raider_details": {
  "raider_id": "RD123456",
  "name": "Amit Sharma",
  "phone": "+91-9876543210",
  "photo_url": "https://example.com/images/raiders/amit.jpg",
  "vehicle_number": "MH12AB1234",
  "vehicle_type": "Bike",
  "current_location": {
    "latitude": 19.0760,
    "longitude": 72.8777
  },
  "assigned_time": "2025-10-10T16:45:00Z",
  "estimated_arrival": "2025-10-10T17:15:00Z",
  "status": "on_the_way"
},
    "created_at": "2025-10-08T09:47:06.589229+05:30",
    "status": [
        {
            status: 'created',
            date: 'Fri Oct 10 2025 16:54:10 GMT+0530 (India Standard Time)'
        },
        {
            status: 'accepted',
            date: 'Fri Oct 10 2025 17:00:14 GMT+0530 (India Standard Time)'
        },
        {
            status: 'packed',
            date: 'Fri Oct 10 2025 17:00:14 GMT+0530 (India Standard Time)'
        },
        {
            status: 'assigned',
            date: 'Fri Oct 10 2025 17:00:14 GMT+0530 (India Standard Time)'
        },
        {
            status: 'outfordelivery',
            date: 'Fri Oct 10 2025 17:00:14 GMT+0530 (India Standard Time)'
        },
        {
            status: 'reached',
            date: 'Fri Oct 10 2025 17:00:14 GMT+0530 (India Standard Time)'
        },
        // {
        //     status: 'delivered',
        //     date: 'Fri Oct 10 2025 17:10:14 GMT+0530 (India Standard Time)'
        // },
        // {
        //     status: 'cancelled',
        //     date: 'Fri Oct 10 2025 17:10:14 GMT+0530 (India Standard Time)'
        // },
    ],
    "details": "{\"savings\": 154, \"finalCost\": 1159, \"totalPrice\": \"\", \"customerName\": \"\", \"mobileNumber\": \"\", \"email\": \"\", \"orderId\": \"ORD1759821929359-6160\", \"custLocation\": null, \"type\": \"delivery\", \"transactionId\": \"\", \"itemsCount\": 6, \"deliveryCharges\": 0, \"lateNightFees\": 0, \"surcharge\": 0, \"promoDiscount\": 0, \"paymentMode\": \"cod\", \"paymentStatus\": \"\", \"assignedTo\": \"\", \"items\": [{\"id\": 69, \"item\": 3, \"item_details\": {\"id\": 3, \"name\": \"Whole Wheat Bread\", \"category\": \"Bakery\", \"description\": \"Soft whole wheat sandwich bread\", \"brand\": \"Harvest Gold\", \"quantity\": {\"unit\": \"grams\", \"amount\": \"400\"}, \"price\": {\"mrp\": 45, \"ourPrice\": 40}, \"discount\": {\"type\": \"\", \"amount\": 5}, \"stock\": 78, \"image_url\": \"https://res.cloudinary.com/dvwggnqnw/image/upload/v1750090231/9_nwgqfh.png\", \"category_image\": null, \"category_tag\": [], \"is_available\": true, \"rating\": 4.6, \"created_at\": \"2025-06-14T23:04:24.884888+05:30\", \"updated_at\": \"2025-10-10T12:12:56.439638+05:30\", \"tags\": [\"grocery\"]}, \"quantity\": 1, \"available\": true, \"status\": \"Available\"}, {\"id\": 1139, \"item\": 3, \"item_details\": {\"id\": 3, \"name\": \"Whole Wheat Bread\", \"category\": \"Bakery\", \"description\": \"Soft whole wheat sandwich bread\", \"brand\": \"Harvest Gold\", \"quantity\": {\"unit\": \"grams\", \"amount\": \"400\"}, \"price\": {\"mrp\": 45, \"ourPrice\": 40}, \"discount\": {\"type\": \"\", \"amount\": 5}, \"stock\": 78, \"image_url\": \"https://res.cloudinary.com/dvwggnqnw/image/upload/v1750090231/9_nwgqfh.png\", \"category_image\": null, \"category_tag\": [], \"is_available\": true, \"rating\": 4.6, \"created_at\": \"2025-06-14T23:04:24.884888+05:30\", \"updated_at\": \"2025-10-10T12:12:56.439638+05:30\", \"tags\": [\"grocery\"]}, \"quantity\": 1, \"available\": true, \"status\": \"Available\"}, {\"id\": 1140, \"item\": 4, \"item_details\": {\"id\": 4, \"name\": \"Full Cream Milk\", \"category\": \"Dairy\", \"description\": \"Pasteurized full cream milk\", \"brand\": \"Amul\", \"quantity\": {\"unit\": \"liter\", \"amount\": 1}, \"price\": {\"mrp\": 68, \"ourPrice\": 65}, \"discount\": {\"type\": \"\", \"amount\": 3}, \"stock\": 193, \"image_url\": \"https://res.cloudinary.com/dvwggnqnw/image/upload/v1750090231/10_t8zsiu.png\", \"category_image\": null, \"category_tag\": [], \"is_available\": true, \"rating\": 4.6, \"created_at\": \"2025-06-14T23:05:05.762523+05:30\", \"updated_at\": \"2025-10-10T12:12:56.723321+05:30\", \"tags\": [\"grocery\"]}, \"quantity\": 1, \"available\": true, \"status\": \"Available\"}, {\"id\": 1141, \"item\": 5, \"item_details\": {\"id\": 5, \"name\": \"Basmati Rice\", \"category\": \"Grains\", \"description\": \"Premium aged basmati rice\", \"brand\": \"India Gate\", \"quantity\": {\"unit\": \"kg\", \"amount\": 5}, \"price\": {\"mrp\": 720, \"ourPrice\": 645}, \"discount\": {\"type\": \"\", \"amount\": 10}, \"stock\": 53, \"image_url\": \"https://res.cloudinary.com/dvwggnqnw/image/upload/v1750090231/11_pfzoam.png\", \"category_image\": null, \"category_tag\": [], \"is_available\": true, \"rating\": 4.6, \"created_at\": \"2025-06-14T23:06:18.182051+05:30\", \"updated_at\": \"2025-10-10T12:12:56.991729+05:30\", \"tags\": [\"grocery\"]}, \"quantity\": 1, \"available\": true, \"status\": \"Available\"}, {\"id\": 1145, \"item\": 3, \"item_details\": {\"id\": 3, \"name\": \"Whole Wheat Bread\", \"category\": \"Bakery\", \"description\": \"Soft whole wheat sandwich bread\", \"brand\": \"Harvest Gold\", \"quantity\": {\"unit\": \"grams\", \"amount\": \"400\"}, \"price\": {\"mrp\": 45, \"ourPrice\": 40}, \"discount\": {\"type\": \"\", \"amount\": 5}, \"stock\": 78, \"image_url\": \"https://res.cloudinary.com/dvwggnqnw/image/upload/v1750090231/9_nwgqfh.png\", \"category_image\": null, \"category_tag\": [], \"is_available\": true, \"rating\": 4.6, \"created_at\": \"2025-06-14T23:04:24.884888+05:30\", \"updated_at\": \"2025-10-10T12:12:56.439638+05:30\", \"tags\": [\"grocery\"]}, \"quantity\": 1, \"available\": true, \"status\": \"Available\"}, {\"id\": 1146, \"item\": 4, \"item_details\": {\"id\": 4, \"name\": \"Full Cream Milk\", \"category\": \"Dairy\", \"description\": \"Pasteurized full cream milk\", \"brand\": \"Amul\", \"quantity\": {\"unit\": \"liter\", \"amount\": 1}, \"price\": {\"mrp\": 68, \"ourPrice\": 65}, \"discount\": {\"type\": \"\", \"amount\": 3}, \"stock\": 193, \"image_url\": \"https://res.cloudinary.com/dvwggnqnw/image/upload/v1750090231/10_t8zsiu.png\", \"category_image\": null, \"category_tag\": [], \"is_available\": true, \"rating\": 4.6, \"created_at\": \"2025-06-14T23:05:05.762523+05:30\", \"updated_at\": \"2025-10-10T12:12:56.723321+05:30\", \"tags\": [\"grocery\"]}, \"quantity\": 1, \"available\": true, \"status\": \"Available\"}, {\"id\": 1147, \"item\": 5, \"item_details\": {\"id\": 5, \"name\": \"Basmati Rice\", \"category\": \"Grains\", \"description\": \"Premium aged basmati rice\", \"brand\": \"India Gate\", \"quantity\": {\"unit\": \"kg\", \"amount\": 5}, \"price\": {\"mrp\": 720, \"ourPrice\": 645}, \"discount\": {\"type\": \"\", \"amount\": 10}, \"stock\": 53, \"image_url\": \"https://res.cloudinary.com/dvwggnqnw/image/upload/v1750090231/11_pfzoam.png\", \"category_image\": null, \"category_tag\": [], \"is_available\": true, \"rating\": 4.6, \"created_at\": \"2025-06-14T23:06:18.182051+05:30\", \"updated_at\": \"2025-10-10T12:12:56.991729+05:30\", \"tags\": [\"grocery\"]}, \"quantity\": 1, \"available\": true, \"status\": \"Available\"}, {\"id\": 77, \"item\": 5, \"item_details\": {\"id\": 5, \"name\": \"Basmati Rice\", \"category\": \"Grains\", \"description\": \"Premium aged basmati rice\", \"brand\": \"India Gate\", \"quantity\": {\"unit\": \"kg\", \"amount\": 5}, \"price\": {\"mrp\": 720, \"ourPrice\": 645}, \"discount\": {\"type\": \"\", \"amount\": 10}, \"stock\": 53, \"image_url\": \"https://res.cloudinary.com/dvwggnqnw/image/upload/v1750090231/11_pfzoam.png\", \"category_image\": null, \"category_tag\": [], \"is_available\": true, \"rating\": 4.6, \"created_at\": \"2025-06-14T23:06:18.182051+05:30\", \"updated_at\": \"2025-10-10T12:12:56.991729+05:30\", \"tags\": [\"grocery\"]}, \"quantity\": 1, \"available\": true, \"status\": \"Available\"}, {\"id\": 80, \"item\": 10, \"item_details\": {\"id\": 10, \"name\": \"Tomato Ketchup\", \"category\": \"Condiments\", \"description\": \"Thick and tasty tomato ketchup\", \"brand\": \"Kissan\", \"quantity\": {\"unit\": \"grams\", \"amount\": 500}, \"price\": {\"mrp\": 110, \"ourPrice\": 99}, \"discount\": {\"type\": \"\", \"amount\": 10}, \"stock\": 68, \"image_url\": \"https://res.cloudinary.com/dvwggnqnw/image/upload/v1750090230/15_qimmpr.png\", \"category_image\": null, \"category_tag\": [], \"is_available\": true, \"rating\": 4.6, \"created_at\": \"2025-06-14T23:09:46.573327+05:30\", \"updated_at\": \"2025-10-10T12:12:57.245520+05:30\", \"tags\": [\"grocery\"]}, \"quantity\": 1, \"available\": true, \"status\": \"Available\"}, {\"id\": 68, \"item\": 11, \"item_details\": {\"id\": 11, \"name\": \"Green Tea Bags\", \"category\": \"Beverages\", \"description\": \"Detox green tea with antioxidants\", \"brand\": \"Tetley\", \"quantity\": {\"unit\": \"bags\", \"amount\": 25}, \"price\": {\"mrp\": 165, \"ourPrice\": 150}, \"discount\": {\"type\": \"\", \"amount\": 9}, \"stock\": 41, \"image_url\": \"https://res.cloudinary.com/dvwggnqnw/image/upload/v1750090230/16_rygkoh.png\", \"category_image\": null, \"category_tag\": [], \"is_available\": true, \"rating\": 4.6, \"created_at\": \"2025-06-14T23:10:33.745300+05:30\", \"updated_at\": \"2025-10-10T12:12:57.514041+05:30\", \"tags\": [\"grocery\"]}, \"quantity\": 2, \"available\": true, \"status\": \"Available\"}, {\"id\": 75, \"item\": 4, \"item_details\": {\"id\": 4, \"name\": \"Full Cream Milk\", \"category\": \"Dairy\", \"description\": \"Pasteurized full cream milk\", \"brand\": \"Amul\", \"quantity\": {\"unit\": \"liter\", \"amount\": 1}, \"price\": {\"mrp\": 68, \"ourPrice\": 65}, \"discount\": {\"type\": \"\", \"amount\": 3}, \"stock\": 193, \"image_url\": \"https://res.cloudinary.com/dvwggnqnw/image/upload/v1750090231/10_t8zsiu.png\", \"category_image\": null, \"category_tag\": [], \"is_available\": true, \"rating\": 4.6, \"created_at\": \"2025-06-14T23:05:05.762523+05:30\", \"updated_at\": \"2025-10-10T12:12:56.723321+05:30\", \"tags\": [\"grocery\"]}, \"quantity\": 1, \"available\": true, \"status\": \"Available\"}]}",
    "user": 12
}

map:any = {
  'created': 'Order Created',
  'accepted': 'Order Getting Packed',
  'packed': 'Order is Packed',
  'assigned': 'Raider Assigned',
  'outfordelivery': 'Out For Delivery',
  'reached': 'Reached',
  'delivered': 'Delivered',
  'cancelled': 'Order Cancelled'
}

endStatus = ['delivered', 'cancelled']
  itemDetails: any;

  constructor(private navCtrl: NavController, private router: Router) { 
    const navigation = this.router.getCurrentNavigation();
  if (navigation?.extras?.state) {
    const data = navigation.extras.state['orderDetails'];
    this.routeSource = navigation.extras.state['from']
    // this.orderDetails = {}
    // this.orderDetails = data
    console.log(this.orderDetails)
  }
  }

  ngOnInit() {
    this.itemDetails = JSON.parse(this.orderDetails.details)
  }

  goBack(){
    if(this.routeSource == 'order-details'){
        this.navCtrl.navigateBack('/layout/example/home')
    } else {
        this.navCtrl.back()
    }
  }

  orderStatus(status:any){
    return this.map[status]
  }

  onScroll(event: any) {
    const scrollTop = event.detail.scrollTop;
    const maxScroll = 150; // point at which it becomes fully white

    // Calculate opacity between 0 and 1
    let opacity = Math.min(scrollTop / maxScroll, 1);

    this.headerBg = `rgba(0, 128, 0, ${opacity})`;
    this.headerColor = `rgba(255, 255, 255, ${opacity})`;
  }

  openSupport(orderId:any){
    this.navCtrl.navigateForward('layout/example/support', {
      state: {
        activeTab: 'second',
        showForm: true,
        orderId: orderId
      }
    })
  }

}
