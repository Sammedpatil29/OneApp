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

cartIncludes(itemId: string): boolean {
  return this.cartItems?.items?.some((cartItem:any) => cartItem?.item_details?.id === itemId) ?? false;
}

openCart() {
    this.navCtrl.navigateForward('/layout/cart')
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

}
