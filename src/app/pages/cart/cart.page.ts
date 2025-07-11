import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonFooter, IonCardSubtitle, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { arrowBack } from 'ionicons/icons';
import { GroceryService } from 'src/app/services/grocery.service';
import { AuthService } from 'src/app/services/auth.service';
// import Cashfree from 'cashfree-pg-sdk-javascript';
// import * as Cashfree from 'cashfree-pg-sdk-javascript';

declare global {
  interface Window {
    CashfreePay: any;
  }
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonCardSubtitle, IonFooter, IonIcon, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class CartPage implements OnInit {

  cartItems: any;
  token: any;
  isLoading: boolean = false
  deliveryCharge = 30

  constructor(private router: Router, private navCtrl: NavController, private groceryService: GroceryService, private authService: AuthService) { 
    addIcons({arrowBack}); 
  }

  ngOnInit() {
    this.authService
      .getToken()
      .then((token) => {
        this.token = token;
        console.log('Token:', this.token);
        this.getcartItems()
      })
      .catch((error) => {
        console.error('Failed to get token:', error);
      });
  }

   goBack() {
    this.navCtrl.back()
  }

filtereditem:any
getcartItems(){
  let params = {
      "token": this.token
  }
  this.isLoading = true
  this.groceryService.getCartItems(params).subscribe((res:any)=> {
    this.cartItems = res[0]
    // console.log(this.cartItems)
    //  this.filtereditem = res[0].items.filter((item:any)=> item.quantity != 0)
    // this.cartItems = items
    console.log(this.cartItems)
    this.isLoading = false
    this.countItemsInCart()
  }, error => {
    this.isLoading = false
  })
  
}

getNewItemPrice(quantity:any, price:any){
  return Number(quantity)*Number(price)
}

totalItemPrice:any;
totalCartItemsPrice(){
  let temp: number[] = []
  this.cartItems?.items.forEach((item:any) => {
    let price = Number(item.quantity) * Number(item.item_details.price.ourPrice)
    temp.push(price)
  })
  this.totalItemPrice = 0
  for(let i=0; i< temp.length; i++){
    this.totalItemPrice = this.totalItemPrice + temp[i]
  }
  return this.totalItemPrice
}

finalHandlingCharges = 0
handlingCharges = 0
calculateHandlingCharges(){
 this.handlingCharges = Number(this.totalItems) * 3
 this.finalHandlingCharges = this.handlingCharges
 if(this.handlingCharges > 10){
  return this.finalHandlingCharges = 10
 } else {
  return this.finalHandlingCharges
 }
 
}

setDeliveryCharge(){
  if(this.totalItemPrice > 199) {
    this.deliveryCharge = 0
    return this.deliveryCharge
  } else {
    return this.deliveryCharge = 30
  }
}

  totalItems = 0
countItemsInCart(){
  let temp: any[] = []
  this.totalItems = 0
  console.log(this.cartItems.items)
  this.cartItems.items.forEach((item:any) => {
    temp.push(item.quantity)
  });
  for(let i = 0; i < temp.length; i++){
    this.totalItems = this.totalItems + temp[i]
  }
  console.log(this.totalItems)
}

finalPayableAmount(){
  return this.totalCartItemsPrice() + this.calculateHandlingCharges() + this.setDeliveryCharge()
}

 increment(id: any) {
  console.log(id);
  const index = this.cartItems.items.findIndex((item: any) => item.id === id);
  if (index !== -1) {
    const currentItem = this.cartItems.items[index];
    const availableStock = currentItem.item_details.stock;
    const currentQty = currentItem.quantity;

    if (currentQty < availableStock) {
      currentItem.quantity += 1;

      const updateItem = {
        item: currentItem.item_details.id,
        quantity: currentItem.quantity
      };

      this.countItemsInCart();
      this.updateCartItems(updateItem);
    } else {
      console.log('⚠️ Cannot add more. Stock limit reached.');
      // Optionally show toast or alert to user
    }
  } else {
    console.log('❌ Item not found');
  }
}


  decrement(id: any) {
  console.log(id);
  if(this.totalItems == 0){
      this.navCtrl.navigateBack('layout/grocery')
  }
  const index = this.cartItems.items.findIndex((item: any) => item.id === id);
  if (index !== -1) {
    const currentItem = this.cartItems.items[index];

    if (currentItem.quantity > 0) {
      currentItem.quantity -= 1;

      const updateItem = {
        item: currentItem.item_details.id,
        quantity: currentItem.quantity
      };

      // Remove item from cart if quantity is now 0
      if (currentItem.quantity === 0) {
        this.cartItems.items.splice(index, 1);
      }

      this.countItemsInCart();
      this.updateCartItems(updateItem);
    } else {
      console.log('⚠️ Quantity is already zero');
    }
  } else {
    console.log('❌ Item not found');
  }
}

updateCartItems(updateItem:any){
  let result = this.cartItems.items.filter((item: any) => {
  console.log(item);
  return item.quantity === 0;
});
  console.log(result)
  let params = {
    "token": this.token,
    "items": [updateItem]
  }
  console.log(params)
  this.groceryService.updateCartItems(params).subscribe((res:any)=>{
    console.log('items updated in cart')
    // this.cartItems = res
    // console.log(this.cartItems)
  })
}

addItemToCart(id:any, item:any){
  let itemsInCart = this.cartItems.items.length
  console.log(itemsInCart)
  let temp: any[] = []
  this.cartItems.items.forEach((item:any) => {
    temp.push(item.id)
  });
  const max = Math.max(...temp);
  let newItemforLocal = {
    id: max + 1,
    item: max + 1,
    item_details: item,
    quantity: 1
  }
  console.log(newItemforLocal.id)
  this.cartItems.items.push(newItemforLocal)
   let newItem = {
    item: id,
    quantity: 1
  }
  let params = {
    "token": this.token,
    "items": [newItem]
  }
  this.groceryService.updateCartItems(params).subscribe((res)=>{
    console.log('items updated in cart')
  })
  // this.cartItems.items.push(newItem)
  // this.cartItemsApi = this.cartItems
  this.countItemsInCart()
  console.log(this.cartItems.items)
}

}
