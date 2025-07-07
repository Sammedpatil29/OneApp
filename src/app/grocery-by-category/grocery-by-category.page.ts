import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonInfiniteScroll, IonLabel, IonItem, IonList, IonModal, IonSpinner } from '@ionic/angular/standalone';
import { arrowBack, personCircle } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { NavController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { GroceryService } from '../services/grocery.service';

@Component({
  selector: 'app-grocery-by-category',
  templateUrl: './grocery-by-category.page.html',
  styleUrls: ['./grocery-by-category.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonModal, IonList, IonItem, IonLabel, IonInfiniteScroll, IonIcon, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class GroceryByCategoryPage implements OnInit {
token: any
cartItems: any;
groceryList: any;
filteredGroceryList: any;
showCart: boolean = false;
isLoading: boolean = false;

  constructor(private navCtrl: NavController,private authService: AuthService,
      private groceryService: GroceryService) {
    addIcons({arrowBack,personCircle}); 
   }

  ngOnInit() {
    this.authService
      .getToken()
      .then((token) => {
        this.token = token;
        console.log('Token:', this.token);
        this.getGroceryList();
        this.getcartItems();
      })
      .catch((error) => {
        console.error('Failed to get token:', error);
      });
  }

  goBack() {
    this.navCtrl.back()
  }

  getcartItems(){
  let params = {
      "token": this.token
  }
  this.cartItems = []
  this.groceryService.getCartItems(params).subscribe((res:any)=> {
    console.log(res.length)
    if(res.length == 0){
      this.cartItems = []
      this.showCart = false
    } else {
      this.showCart = true
      this.cartItems = res[0]
      this.countItemsInCart()
    console.log(this.cartItems)
    }
  })
}

 getGroceryList() {
    let params = {
      token: this.token,
    };
    this.isLoading = true;
    this.groceryService.getGroceryList(params).subscribe(
      (res) => {
        this.groceryList = res;
        this.filteredGroceryList = this.groceryList;
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
      }
    );
  }

  totalItems = 0
countItemsInCart(){
  let temp: any[] = []
  this.totalItems = 0
  this.cartItems.items.forEach((item:any) => {
    temp.push(item.quantity)
  });
  for(let i = 0; i < temp.length; i++){
    this.totalItems = this.totalItems + temp[i]
  }
  console.log(this.totalItems)
}

addItemToCart(id:any){
  let newItem = {
    id: 5,
    item: 5,
    status: 'Available',
    available: '',
    quantity: 1,
    item_details: this.filteredGroceryList[id]
  }
  this.cartItems.items.push(newItem)
  this.countItemsInCart()
  console.log(this.cartItems.items)
}

cartIncludes(itemId: string): boolean {
  return this.cartItems?.items?.some((cartItem:any) => cartItem?.item_details?.id === itemId) ?? false;
}

openCart() {
    this.navCtrl.navigateForward('/layout/cart')
  }

  increment(id:any){
    let quantity = this.cartItems.items[id].quantity
    this.cartItems.items[id].quantity = quantity + 1
    this.countItemsInCart()
  }

  decrement(id:any){
    let quantity = this.cartItems.items[id].quantity
    if(quantity === 1){
      this.cartItems.items.splice(id, 1);
      console.log(this.cartItems.items)
      this.countItemsInCart()
    }
    if(quantity != 0){
      this.cartItems.items[id].quantity = quantity - 1
      this.countItemsInCart()
    }
  }

}
