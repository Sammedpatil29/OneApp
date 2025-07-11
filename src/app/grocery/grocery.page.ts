import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonCard,
  IonModal,
  IonButton,
  IonButtons,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonCardSubtitle,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonInput,
  IonSpinner,
} from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { GroceryService } from '../services/grocery.service';
import { AuthService } from '../services/auth.service';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { Router } from '@angular/router';
import { NodataComponent } from '../components/nodata/nodata.component';

@Component({
  selector: 'app-grocery',
  templateUrl: './grocery.page.html',
  styleUrls: ['./grocery.page.scss'],
  standalone: true,
  imports: [
    IonSpinner,
    IonInput,
    IonItem,
    IonInfiniteScrollContent,
    IonInfiniteScroll,
    IonCardSubtitle,
    IonRefresherContent,
    IonRefresher,
    IonIcon,
    IonButtons,
    IonButton,
    IonModal,
    IonCard,
    IonSearchbar,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    NodataComponent,
  ],
})
export class GroceryPage implements OnInit {
  address = '';
  label = '';
  token: any;
  groceryList: any;
  data: any;
  filteredGroceryList: any;
  isModalOpen: boolean = false;
  isLoading: boolean = false;
  showCart: boolean = false;
  clickedItem: any;
  searchedItems: any = [];
  searchTerm = '';
  cartItems: any;
  cartItemCount:any;
  constructor(
    private navCtrl: NavController,
    private router: Router,
    private authService: AuthService,
    private groceryService: GroceryService
  ) {}

  ngOnInit() {
    const locationData = localStorage.getItem('location');
    if (locationData) {
      const location = JSON.parse(locationData);
      this.address = location.address;
      this.label = location.label;
    }
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

  backToHome() {
    this.navCtrl.navigateBack('/layout/example/home');
  }

  openMap() {
    this.navCtrl.navigateForward('/layout/map');
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

  onIonInfinite(event: InfiniteScrollCustomEvent) {
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }

  change() {
    console.log('fbfbrhybbhdf');
  }

  startSearch() {
    this.isModalOpen = true;
  }

  handleModalClose() {
    this.isModalOpen = false;
    this.clickedItem = [];
  }

  searchResult() {
    const query = this.searchTerm.trim().toLowerCase();
    if (query.length == 0) {
      this.searchedItems = [];
    } else {
      this.searchedItems = this.groceryList.filter((item: any) => {
        return (
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        );
      });
      console.log(this.searchedItems);
    }
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


  getcartItems(){
  let params = {
      "token": this.token
  }
  this.cartItems = []
  this.groceryService.getCartItems(params).subscribe((res:any)=> {
    console.log(res.length)
    if(res.length == 0){
      this.cartItems = []
      let params = {
        "token" : this.token
      }
      this.groceryService.createCart(params).subscribe((res)=>{
        console.log('cart created')
      }, error => {
        console.log('error creating cart')
      })
      this.showCart = false
    } else {
      this.showCart = true
      this.cartItems = res[0]
      this.countItemsInCart()
    console.log(this.cartItems)
    }
  })
}

cartIncludes(itemId: string): boolean {
  return this.cartItems?.items?.some((cartItem:any) => cartItem?.item_details?.id === itemId && cartItem?.quantity !== 0) ?? false;
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
  let itemsInCart = this.cartItems?.items.length
  console.log(itemsInCart)
  let temp: any[] = []
  this.cartItems?.items.forEach((item:any) => {
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

goToGrocerybyCategory(){
  this.navCtrl.navigateForward('layout/grocery-by-category')
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
