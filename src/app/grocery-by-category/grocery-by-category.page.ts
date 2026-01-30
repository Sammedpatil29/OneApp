import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonSearchbar, IonIcon, IonButtons, IonButton, IonSkeletonText, IonBackButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline, cartOutline, add, remove } from 'ionicons/icons';
import { Router } from '@angular/router';
import { GroceryService } from '../services/grocery.service';
import { AuthService } from '../services/auth.service';
import { ProductCardComponent } from "../components/product-card/product-card.component";
import { NavController } from '@ionic/angular';
import { ErrorComponent } from "../components/error/error.component";

@Component({
  selector: 'app-grocery-by-category',
  templateUrl: './grocery-by-category.page.html',
  styleUrls: ['./grocery-by-category.page.scss'],
  standalone: true,
  imports: [IonBackButton, IonSkeletonText, IonButton, IonButtons, IonIcon, IonSearchbar, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, ProductCardComponent, ErrorComponent]
})
export class GroceryByCategoryPage implements OnInit {

  selectedCategory = 'Veggies'; // Default active category

  // Sidebar Data
  categories:any = []
  cartItems: any[] = [];
  token: any;
  isLoading: boolean = false;
  isError: boolean = false;
  
  // [
  //   { id: 'veggies', name: 'Vegetables', img: 'https://cdn-icons-png.flaticon.com/512/2329/2329865.png' },
  //   { id: 'fruits', name: 'Fruits', img: 'https://cdn-icons-png.flaticon.com/512/1625/1625048.png' },
  //   { id: 'dairy', name: 'Dairy & Bread', img: 'https://cdn-icons-png.flaticon.com/512/3050/3050158.png' },
  //   { id: 'snacks', name: 'Munchies', img: 'https://cdn-icons-png.flaticon.com/512/2553/2553691.png' },
  //   { id: 'drinks', name: 'Cold Drinks', img: 'https://cdn-icons-png.flaticon.com/512/2405/2405479.png' },
  //   { id: 'instant', name: 'Instant Food', img: 'https://cdn-icons-png.flaticon.com/512/135/135620.png' },
  //   { id: 'tea', name: 'Tea & Coffee', img: 'https://cdn-icons-png.flaticon.com/512/633/633652.png' },
  //   { id: 'bakery', name: 'Bakery', img: 'https://cdn-icons-png.flaticon.com/512/992/992747.png' },
  //   { id: 'frozen', name: 'Frozen Food', img: 'https://cdn-icons-png.flaticon.com/512/2372/2372134.png' },
  // ];

  // Dummy Products Data
  products:any = []
  
  // [
  //   { id: 1, stock: '', name: 'Fresh Tomato', weight: '500g', price: 24, oldPrice: 30, discount: 20, img: 'https://cdn-icons-png.flaticon.com/512/1202/1202125.png' },
  //   { id: 2, stock: '', name: 'Red Onion', weight: '1kg', price: 45, oldPrice: 60, discount: 25, img: 'https://cdn-icons-png.flaticon.com/512/765/765580.png' },
  //   { id: 3, stock: '', name: 'Potato', weight: '1kg', price: 35, oldPrice: 40, discount: 0, img: 'https://cdn-icons-png.flaticon.com/512/765/765544.png' },
  //   { id: 4, stock: '', name: 'Carrot', weight: '500g', price: 30, oldPrice: 40, discount: 10, img: 'https://cdn-icons-png.flaticon.com/512/2329/2329954.png' },
  //   { id: 5, stock: '', name: 'Broccoli', weight: '1pc', price: 60, oldPrice: 80, discount: 15, img: 'https://cdn-icons-png.flaticon.com/512/2329/2329905.png' },
  //   { id: 6, stock: '', name: 'Spinach', weight: '1 bunch', price: 15, oldPrice: 20, discount: 0, img: 'https://cdn-icons-png.flaticon.com/512/2329/2329937.png' },
  // ];

  constructor(private router: Router, private groceryService: GroceryService, private authService: AuthService, private cdr: ChangeDetectorRef, private navCtrl: NavController) { 
    addIcons({ searchOutline, cartOutline, add, remove });

    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['category']) {
      const catName = navigation.extras.state['category'];
      this.selectedCategory = catName
      console.log(this.selectedCategory);
    }
  }

  async ngOnInit() {
    this.token = await this.authService.getToken();

    this.groceryService.cart$.subscribe((items) => {
      this.cartItems = items;
      console.log('🛒 UI Cart Updated:', this.cartItems);

      // Force UI Update
      this.cdr.detectChanges();
    });

    this.getCategories();
  }

  selectCategory(id: string) {
    this.selectedCategory = id;
    this.getProductsByCat();
    // In real app: Fetch products for this ID here
  }

  // Helper to get display name
  getCategoryName() {
    return this.categories.find((c:any) => c.id === this.selectedCategory)?.name;
  }

  getCategories(){
    let params = {
      selectedCategory: this.selectedCategory
    }
    this.isLoading = true;
    this.isError = false;
    this.groceryService.getCategories(params).subscribe((res:any)=>{
      console.log('Categories:', res);
      this.categories = res.data.categories;
      this.products = res.data.products;
      this.selectCategory(this.selectedCategory);
      this.isLoading = false;
    }, error => {
      this.isLoading = false;
      this.isError = true;
    })
  }

  getProductsByCat(){
    let params = {
      selectedCategory: this.selectedCategory
    }
    this.groceryService.getProductsByCategory(params).subscribe((res:any)=>{
      console.log('Products by Category:', res);
      this.products = res.data.products;
    })
  }

  goToDetails(product?: any) {
    this.router.navigate([`/layout/grocery-layout/grocery-item-details/${product?.id}`], {
      state: { productId: product?.id }
    });
  }

  increase(productId: any) {
    this.groceryService.increaseQty(productId, this.token).subscribe({
      next: () => console.log('Increase Success'),
      error: (err) => console.error('API Failed', err),
    });
  }

  decrease(productId: any) {
    this.groceryService.decreaseQty(productId, this.token)?.subscribe({
      next: () => console.log('Decrease Success'),
      error: (err) => console.error('API Failed', err),
    });
  }

  // --- HELPERS ---

  getQty(productId: any): number {
    if (!this.cartItems || this.cartItems.length === 0) return 0;

    // Robust Match: Convert both to String
    const item = this.cartItems.find(
      (i: any) => String(i.productId) === String(productId),
    );

    return item ? item.quantity : 0;
  }

  gotoSearch() {
    this.router.navigate(['/layout/grocery-layout/grocery-search']);
  }

  back() {
    this.navCtrl.back();
  }

}