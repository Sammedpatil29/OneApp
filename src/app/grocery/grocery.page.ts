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
import { Subject } from 'rxjs';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';
import { forkJoin } from 'rxjs'
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
  cartItems: any = {
    2: 3,
    4: 5,
  };
  cartItems1: { [itemId: number]: number } = {};
  keys: any = Object.keys(this.cartItems);
  miniBanner: any;

  cartItemCount: any;
  Categories: any;
  private updateCart$ = new Subject<any>();
  private destroy$ = new Subject<void>();

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private authService: AuthService,
    private groceryService: GroceryService
  ) {}

  ngOnInit() {
    this.keys = Object.keys(this.cartItems1).map((key) => Number(key));
    console.log(this.keys);
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
        this.updateCart$
          .pipe(
            debounceTime(500), // Optional: avoid rapid firing
            switchMap((params) => this.groceryService.updateCartItems(params)),
            takeUntil(this.destroy$)
          )
          .subscribe({
            next: (res: any) => {
              console.log('✅ Cart updated:', res);
              this.cartItems1 = Object.entries(res).reduce(
                (acc: any, [key, value]) => {
                  acc[+key] = value; // Convert string key to number
                  return acc;
                },
                {} as { [key: number]: number }
              );
              this.keys = Object.keys(this.cartItems1).map((key) =>
                Number(key)
              );
              console.log(this.cartItems1);
              if (Object.keys(this.cartItems1).length > 0) {
                this.showCart = true;
              } else {
                this.showCart = false;
              }
            },
            error: (err) => {
              console.error('❌ Error updating cart:', err);
            },
          });

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

   ionViewWillEnter() {
    this.cartItems1 = this.groceryService.getCartItems1()
    console.log(this.cartItems1)
    this.keys = Object.keys(this.cartItems1).map((key) => Number(key));
    this.totalItems = Object.values(this.cartItems1).reduce(
      (sum, qty) => sum + qty,
      0
    );
    if (this.totalItems > 0) {
      this.showCart = true;
    } else {
      this.showCart = false;
    }
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
    this.navCtrl.navigateForward('/layout/cart');
  }

  increment(id: any) {
    console.log(id);
    console.log(this.cartItems1[id]);
    this.cartItems1[id] += 1;
    let values:any = this.cartItems1
    this.groceryService.updateCartItems1(values)
    console.log(this.cartItems1);
    this.keys = Object.keys(this.cartItems1).map((key) => Number(key));
    this.totalItems = Object.values(this.cartItems1).reduce(
      (sum, qty) => sum + qty,
      0
    );
    if (this.totalItems > 0) {
      this.showCart = true;
    } else {
      this.showCart = false;
    }

    let params = {
      token: this.token,
      item: this.cartItems1,
    };
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
    if (this.cartItems1[id] == 1) {
      delete this.cartItems1[id];
      this.keys = Object.keys(this.cartItems1).map((key) => Number(key));
    } else {
      console.log(id);
      console.log(this.cartItems1[id]);
      this.cartItems1[id] -= 1;
      let values:any = this.cartItems1
    this.groceryService.updateCartItems1(values)
      console.log(this.cartItems1);
      this.keys = Object.keys(this.cartItems1).map((key) => Number(key));
    }
    this.totalItems = Object.values(this.cartItems1).reduce(
      (sum, qty) => sum + qty,
      0
    );
    if (this.totalItems > 0) {
      this.showCart = true;
    } else {
      this.showCart = false;
    }

    let params = {
      token: this.token,
      item: this.cartItems1,
    };
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

  getcartItems() {
    let params = {
      token: this.token,
    };
    this.cartItems = [];
    this.groceryService.getCartItems(params).subscribe((res: any) => {
      console.log(res.length);
      if (res.length == 0) {
        this.cartItems = [];
        let params = {
          token: this.token,
        };
        this.groceryService.createCart(params).subscribe(
          (res) => {
            console.log('cart created');
          },
          (error) => {
            console.log('error creating cart');
          }
        );
        this.showCart = false;
      } else {
        this.showCart = true;
        this.cartItems = res[0];
        this.countItemsInCart();
        console.log(this.cartItems);
      }
    });
  }

  cartIncludes(itemId: string): boolean {
    return (
      this.cartItems?.items?.some(
        (cartItem: any) =>
          cartItem?.item_details?.id === itemId && cartItem?.quantity !== 0
      ) ?? false
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

  addItemToCart(id: any) {
    this.cartItems1[id] = 1;
    this.keys = Object.keys(this.cartItems1).map((key) => Number(key));
    console.log(this.cartItems1);
    let values:any = this.cartItems1
    this.groceryService.updateCartItems1(values)
    console.log(id);
    this.totalItems = Object.values(this.cartItems1).reduce(
      (sum, qty) => sum + qty,
      0
    );
    if (this.totalItems > 0) {
      this.showCart = true;
    } else {
      this.showCart = false;
    }
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
    let params = {
      token: this.token,
      item: this.cartItems1,
    };
    this.updateCart$.next(params);
    // this.countItemsInCart()
    // console.log(this.cartItems.items)
  }

  goToGrocerybyCategory() {
    this.navCtrl.navigateForward('layout/grocery-by-category');
  }

  goTo(route:any) {
    this.navCtrl.navigateForward(`${route}`);
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
      this.cartItems1 = res;
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
      categories: this.groceryService.getCategories(),
      miniBanner: this.groceryService.getBanner('mini')
    }).subscribe({
      next: (res: any) => {
        // Handle grocery list
        this.groceryList = res.groceryList;
        this.filteredGroceryList = this.groceryList;
        this.Categories = res.categories
        this.miniBanner = res.miniBanner
        // Handle updated cart
        console.log('items updated in cart');
        this.cartItems1 = res.cartUpdate;
        let value:any = this.cartItems1
        this.groceryService.updateCartItems1(value)
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
      error: (err) => {
        console.error('Error in one of the requests', err);
        this.isLoading = false;
      }
    });
  }

  goToSpecialCategory(route:any){
    this.navCtrl.navigateForward(`/layout/grocery-special/${route}`)
  }
}
