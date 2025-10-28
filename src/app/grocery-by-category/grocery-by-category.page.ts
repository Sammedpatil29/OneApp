import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonInfiniteScroll,
  IonLabel,
  IonItem,
  IonList,
  IonModal,
  IonSpinner,
  IonSearchbar,
} from '@ionic/angular/standalone';
import { arrowBack, personCircle } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { NavController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { GroceryService } from '../services/grocery.service';
import { Subject } from 'rxjs';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';
import { forkJoin } from 'rxjs'
@Component({
  selector: 'app-grocery-by-category',
  templateUrl: './grocery-by-category.page.html',
  styleUrls: ['./grocery-by-category.page.scss'],
  standalone: true,
  imports: [
    IonSearchbar,
    IonSpinner,
    IonModal,
    IonList,
    IonItem,
    IonLabel,
    IonInfiniteScroll,
    IonIcon,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class GroceryByCategoryPage implements OnInit {
  token: any;
  cartItems: any = [
    {
      id: 2,
      quantity: 2
    },
    {
      id: 3,
      quantity: 1
    },
    {
      id: 5,
      quantity: 4
    }
  ]

  cartItems1: {[itemId: number]: number} = {}
  keys: any = Object.keys(this.cartItems)
  groceryList: any;
  filteredGroceryList: any;
  showCart: boolean = false;
  isLoading: boolean = false;
  Categories:any;
  currentCategory: any;

   private updateCart$ = new Subject<any>();
    private destroy$ = new Subject<void>();

  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private groceryService: GroceryService
  ) {
    addIcons({ arrowBack, personCircle });
  }

  ngOnInit() {
         this.keys = Object.keys(this.cartItems1).map(key => Number(key));
    this.cartItems1 = this.groceryService.getCartItems1()
    this.authService
      .getToken()
      .then((token) => {
        this.token = token;
        console.log('Token:', this.token);
        this.updateCart$
            .pipe(
              debounceTime(500), // Optional: avoid rapid firing
              switchMap((params) =>
                this.groceryService.updateCartItems(params)
              ),
              takeUntil(this.destroy$)
            )
            .subscribe({
              next: (res:any) => {
                console.log('✅ Cart updated:', res);
                this.cartItems1 = Object.entries(res).reduce((acc:any, [key, value]) => {
        acc[+key] = value; // Convert string key to number
        return acc;
      }, {} as { [key: number]: number });
      this.keys = Object.keys(this.cartItems1).map(key => Number(key));
      console.log(this.cartItems1)
              },
              error: (err) => {
                console.error('❌ Error updating cart:', err);
              }
            });
      
        //     let params = {
        //   "token": 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMiwicGhvbmUiOiIrOTE3NDA2OTg0MzA4IiwidXNlcl9uYW1lIjoiU2FtbWVkIFBhdGlsIFZJIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTgyMTc2NjJ9.J2j66IfijcfkojEV-TBbfmiDKKTGD9b7amWRbZ4ldxQ',
        // }
        let params = {
          token: this.token,
        };
        // this.updateCart$.next(params);
        this.combineGroceryAndCart(params);
      })
      .catch((error) => {
        console.error('Failed to get token:', error);
      });
  }

  goBack() {
    this.navCtrl.back();
  }

  getcartItems() {
    let params = {
      token: this.token,
    };
    this.cartItems = [];
    this.groceryService.getCartItems(params).subscribe((res: any) => {
      console.log(res.length);
      if (res.length == 0) {
        this.cartItems = [];
        this.showCart = false;
      } else {
        this.showCart = true;
        this.cartItems = res[0];
        this.countItemsInCart();
        console.log(this.cartItems);
      }
    });
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

  totalItems = 0;
  countItemsInCart() {
    let temp: any[] = [];
    this.totalItems = 0;
    this.cartItems.items.forEach((item: any) => {
      temp.push(item.quantity);
    });
    for (let i = 0; i < temp.length; i++) {
      this.totalItems = this.totalItems + temp[i];
    }
    console.log(this.totalItems);
  }

  addItemToCart(id:any){
  this.cartItems1[id] = 1
  this.keys = Object.keys(this.cartItems1).map(key => Number(key));
  console.log(this.cartItems1)
  let values:any = this.cartItems1
    this.groceryService.updateCartItems1(values)
  console.log(id)
  this.totalItems = Object.values(this.cartItems1).reduce((sum, qty) => sum + qty, 0);
  if(this.totalItems > 0){
    this.showCart = true
  } else {
    this.showCart = false
  }

   let params = {
    "token": 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMiwicGhvbmUiOiIrOTE3NDA2OTg0MzA4IiwidXNlcl9uYW1lIjoiU2FtbWVkIFBhdGlsIFZJIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTgyMTc2NjJ9.J2j66IfijcfkojEV-TBbfmiDKKTGD9b7amWRbZ4ldxQ',
    "item": this.cartItems1
  }
  this.updateCart$.next(params);
  // let itemsInCart = this.cartItems?.items.length
  // console.log(itemsInCart)
  // let temp: any[] = []
  // this.cartItems?.items.forEach((item:any) => {
  //   temp.push(item.id)
  // });
  // const max = Math.max(...temp);
  // let newItemforLocal = {
  //   id: max + 1,
  //   item: max + 1,
  //   item_details: item,
  //   quantity: 1
  // }
  // console.log(newItemforLocal.id)
  // this.cartItems.items.push(newItemforLocal)
  //  let newItem = {
  //   item: id,
  //   quantity: 1
  // }
  // let params = {
  //   "token": this.token,
  //   "items": [newItem]
  // }
  // this.groceryService.updateCartItems(params).subscribe((res)=>{
  //   console.log('items updated in cart')
  // })
  // this.countItemsInCart()
  // console.log(this.cartItems.items)
}

  cartIncludes(itemId: string): boolean {
    return (
      this.cartItems?.items?.some(
        (cartItem: any) => cartItem?.item_details?.id === itemId
      ) ?? false
    );
  }

  openCart() {
    this.navCtrl.navigateForward('/layout/cart');
  }

  increment(id: any) {
    console.log(id)
    console.log(this.cartItems1[id])
    this.cartItems1[id] += 1
    let values:any = this.cartItems1
    this.groceryService.updateCartItems1(values)
    console.log(this.cartItems1)
    this.keys = Object.keys(this.cartItems1).map(key => Number(key));
    this.totalItems = Object.values(this.cartItems1).reduce((sum, qty) => sum + qty, 0);
  if(this.totalItems > 0){
    this.showCart = true
  } else {
    this.showCart = false
  }

   let params = {
    "token": 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMiwicGhvbmUiOiIrOTE3NDA2OTg0MzA4IiwidXNlcl9uYW1lIjoiU2FtbWVkIFBhdGlsIFZJIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTgyMTc2NjJ9.J2j66IfijcfkojEV-TBbfmiDKKTGD9b7amWRbZ4ldxQ',
    "item": this.cartItems1
  }
  this.updateCart$.next(params);
  // console.log(id);
  // const index = this.cartItems.items.findIndex((item: any) => item.id === id);
  // if (index !== -1) {
  //   const currentItem = this.cartItems.items[index];
  //   const availableStock = currentItem.item_details.stock;
  //   const currentQty = currentItem.quantity;

  //   if (currentQty < availableStock) {
  //     currentItem.quantity += 1;

  //     const updateItem = {
  //       item: currentItem.item_details.id,
  //       quantity: currentItem.quantity
  //     };

  //     this.countItemsInCart();
  //     this.updateCartItems(updateItem);
  //   } else {
  //     console.log('⚠️ Cannot add more. Stock limit reached.');
  //     // Optionally show toast or alert to user
  //   }
  // } else {
  //   console.log('❌ Item not found');
  // }
}

  decrement(id: any) {
    if(this.cartItems1[id] == 1){
      delete this.cartItems1[id]
      this.keys = Object.keys(this.cartItems1).map(key => Number(key));
    } else {
      console.log(id)
    console.log(this.cartItems1[id])
    this.cartItems1[id] -= 1
    let values:any = this.cartItems1
    this.groceryService.updateCartItems1(values)
    console.log(this.cartItems1)
    this.keys = Object.keys(this.cartItems1).map(key => Number(key));
    }
    this.totalItems = Object.values(this.cartItems1).reduce((sum, qty) => sum + qty, 0);
  if(this.totalItems > 0){
    this.showCart = true
  } else {
    this.showCart = false
  }

   let params = {
    "token": 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMiwicGhvbmUiOiIrOTE3NDA2OTg0MzA4IiwidXNlcl9uYW1lIjoiU2FtbWVkIFBhdGlsIFZJIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTgyMTc2NjJ9.J2j66IfijcfkojEV-TBbfmiDKKTGD9b7amWRbZ4ldxQ',
    "item": this.cartItems1
  }
  this.updateCart$.next(params);
  // console.log(id);
  // const index = this.cartItems.items.findIndex((item: any) => item.id === id);
  // if (index !== -1) {
  //   const currentItem = this.cartItems.items[index];

  //   if (currentItem.quantity > 0) {
  //     currentItem.quantity -= 1;

  //     const updateItem = {
  //       item: currentItem.item_details.id,
  //       quantity: currentItem.quantity
  //     };

  //     // Remove item from cart if quantity is now 0
  //     if (currentItem.quantity === 0) {
  //       this.cartItems.items.splice(index, 1);
  //     }

  //     this.countItemsInCart();
  //     this.updateCartItems(updateItem);
  //   } else {
  //     console.log('⚠️ Quantity is already zero');
  //   }
  // } else {
  //   console.log('❌ Item not found');
  // }
}

  updateCartItems(updateItem: any) {
    let result = this.cartItems.items.filter((item: any) => {
      console.log(item);
      return item.quantity === 0;
    });
    console.log(result);
    let params = {
      token: this.token,
      items: [updateItem],
    };
    console.log(params);
    this.groceryService.updateCartItems(params).subscribe((res: any) => {
      console.log('items updated in cart');
      // this.cartItems = res
      // console.log(this.cartItems)
    });
  }

  combineGroceryAndCart(updateItem: any) {
      const groceryParams = {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMiwicGhvbmUiOiIrOTE3NDA2OTg0MzA4IiwidXNlcl9uYW1lIjoiU2FtbWVkIFBhdGlsIFZJIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTgyMTc2NjJ9.J2j66IfijcfkojEV-TBbfmiDKKTGD9b7amWRbZ4ldxQ",
      };
  
      const cartParams = {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMiwicGhvbmUiOiIrOTE3NDA2OTg0MzA4IiwidXNlcl9uYW1lIjoiU2FtbWVkIFBhdGlsIFZJIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTgyMTc2NjJ9.J2j66IfijcfkojEV-TBbfmiDKKTGD9b7amWRbZ4ldxQ",
        items: [updateItem],
      };
  
      this.isLoading = true;
  
      forkJoin({
        groceryList: this.groceryService.getGroceryList(groceryParams),
        cartUpdate: this.groceryService.updateCartItems(cartParams),
        categories: this.groceryService.getCategories()
      }).subscribe({
        next: (res: any) => {
          // Handle grocery list
          this.groceryList = res.groceryList;
          this.filteredGroceryList = this.groceryList;
          this.Categories = res.categories
          this.currentCategory = this.Categories[0].category_name
          // Handle updated cart
          console.log('items updated in cart');
          this.cartItems1 = res.cartUpdate;
  
          this.keys = Object.keys(this.cartItems1).map((key) =>
            Number(key)
          );
          this.totalItems = Object.values(this.cartItems1).reduce(
        (sum, qty) => sum + qty,
        0
      );
          console.log(this.cartItems1);
            if (this.totalItems > 0) {
            this.showCart = true;
          } else {
            this.showCart = false;
          }
  
          this.isLoading = false;
        },
        error: (err:any) => {
          console.error('Error in one of the requests', err);
          this.isLoading = false;
        }
      });
    }
}
