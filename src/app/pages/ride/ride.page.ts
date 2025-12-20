import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonSearchbar, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack } from 'ionicons/icons';
import { library, playCircle, radio, search, home, cube, bag, receiptOutline, person, personCircle, personCircleOutline, constructOutline, briefcaseOutline, buildOutline } from 'ionicons/icons';
import { NavController } from '@ionic/angular';
import { RideSelectionComponent } from "src/app/components/ride-selection/ride-selection.component";
import { LocationService } from 'src/app/services/location.service';

@Component({
  selector: 'app-ride',
  templateUrl: './ride.page.html',
  styleUrls: ['./ride.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonSearchbar, IonIcon, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, RideSelectionComponent]
})
export class RidePage implements OnInit, AfterViewInit {
@ViewChild('autocompleteInput') autocompleteInput!: ElementRef<HTMLInputElement>;
@ViewChild('dropInput') dropInput!: ElementRef<HTMLInputElement>;
  selectedInput: any = 'Drop'
  pickup:any = ''
  drop:any = ''
  pickupCoords:any;
  dropCoords:any;
  dropLocation:any;
  pickupLocation:any;
  isAddressSelected: boolean = false
  isLoading: boolean = false

  polygonCoords: google.maps.LatLngLiteral[] = [
    { lat: 16.721, lng: 75.051 },
    { lat: 16.722, lng: 75.070 },
    { lat: 16.728, lng: 75.068 },
    { lat: 16.727, lng: 75.050 }
  ];
  inputValue = '';
  filteredPredictions: {
    name: string;
    formatted_address: string;
    geometry: { location: { lat: number; lng: number } };
  }[] = [];

  filteredPredictionsOut: {
    name: string;
    formatted_address: string;
    geometry: { location: { lat: number; lng: number } };
  }[] = [];

  private autocompleteService = new google.maps.places.AutocompleteService();
  private placesService!: google.maps.places.PlacesService;
  private polygon!: google.maps.Polygon;

  userHistory: any = [
    {
      "name": "Vegan Cafe",
      "formatted_address": "123 Main St, Manhattan, NY 10001, USA",
      "geometry": {
        "location": {
          lat: 40.7127753,
          lng: -74.0059728
        }
      }
    },
    {
      "name": "Sunrise Bakery",
      "formatted_address": "456 Broadway, Brooklyn, NY 11211, USA",
      "geometry": {
        "location": {
          lat: 40.7121,
          lng: -73.9555
        }
      }
    },
    {
      "name": "GreenLeaf Market",
      "formatted_address": "789 Flatbush Ave, Brooklyn, NY 11226, USA",
      "geometry": {
        "location": {
          lat: 40.6469,
          lng: -73.9578
        }
      }
    },
    {
      "name": "Juice & Smoothie Bar",
      "formatted_address": "321 5th Ave, New York, NY 10016, USA",
      "geometry": {
        "location": {
          lat: 40.7465,
          lng: -73.9847
        }
      }
    },
    {
      "name": "Nature's Bowl",
      "formatted_address": "555 Hudson St, New York, NY 10014, USA",
      "geometry": {
        "location": {
          lat: 40.7359,
          lng: -74.0061
        }
      }
    },
    {
      "name": "Herbal Café",
      "formatted_address": "12 Avenue B, New York, NY 10009, USA",
      "geometry": {
        "location": {
          lat: 40.7233,
          lng: -73.9805
        }
      }
    },
    {
      "name": "Vita Organics",
      "formatted_address": "88 7th Ave, New York, NY 10011, USA",
      "geometry": {
        "location": {
          lat: 40.7396,
          lng: -73.9997
        }
      }
    },
    {
      "name": "Whole Foodies",
      "formatted_address": "160 W 24th St, New York, NY 10011, USA",
      "geometry": {
        "location": {
          lat: 40.7442,
          lng: -73.9955
        }
      }
    },
    {
      "name": "Organic Treats",
      "formatted_address": "33 St Marks Pl, New York, NY 10003, USA",
      "geometry": {
        "location": {
          lat: 40.7296,
          lng: -73.9871
        }
      }
    },
    {
      "name": "Healthy Harvest",
      "formatted_address": "420 Lexington Ave, New York, NY 10170, USA",
      "geometry": {
        "location": {
          lat: 40.7517,
          lng: -73.9763
        }
      }
    }
  ]


  constructor(private navCtrl: NavController, private ngZone: NgZone, private locationService: LocationService) {
    addIcons({arrowBack,home,buildOutline,receiptOutline,personCircleOutline,briefcaseOutline,constructOutline,library,personCircle,person,search,bag,cube,radio,playCircle});
   }

  async ngOnInit() {
    this.isLoading = true
    const current = await this.locationService.getCurrentPosition()
    console.log(current)
   
    if(current){
      this.pickup = "Your Location"
      this.pickupLocation = {
        name: 'Your Location',
        address: '',
        coords: {
          lat: current.coords.coords.latitude,
          lng: current.coords.coords.longitude
        }
      }
      this.tripData.origin = this.pickupLocation
      this.isLoading = false
    } else {
      alert('location permission denied')
      this.isLoading = false
    }
  }

 

//   {
//     "coords": {
//         "timestamp": 1760598716431,
//         "coords": {
//             "accuracy": 3708.511002521809,
//             "latitude": 12.8248053,
//             "longitude": 77.6879585,
//             "altitude": null,
//             "altitudeAccuracy": null,
//             "heading": null,
//             "speed": null
//         }
//     },
//     "address": ""
// }

  goBack(){
    this.navCtrl.back()
  }

  tripData = {
      "origin": '',
      "drop": ''
    }
  setPickupDropbyHistory(data:any){
    
    if(this.selectedInput == "Pickup"){
      this.pickup = `${data.name} - ${data.formatted_address}`
      this.pickupCoords = {
        lat: data.geometry.location.lat,
        lng: data.geometry.location.lng,
      }
      this.pickupLocation = {
        name: data.name,
        address: data.formatted_address,
        coords: this.pickupCoords
      }
      this.tripData.origin = this.pickupLocation
      if(this.drop == ''){
        this.selectedInput = "Drop"
      } else {
        this.navCtrl.navigateForward('/layout/ride-selection-page', {
          state: {
            data: this.tripData
          }
        })
      }
    } else {
      
      this.drop = `${data.name} - ${data.formatted_address}`
      this.dropCoords = {
        lat: data.geometry.location.lat,
        lng: data.geometry.location.lng,
      }
      this.dropLocation = {
        name: data.name,
        address: data.formatted_address,
        coords: this.dropCoords
      }
      this.tripData.drop = this.dropLocation
      if(this.pickup == ''){
        this.selectedInput = "Pickup"
      } else {
        this.navCtrl.navigateForward('/layout/ride-selection-page', {
          state: {
            data: this.tripData
          }
        })
      }
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.dropInput.nativeElement.focus();
    });
    // Wait for google.maps to be available
    if (!(window as any).google || !(google.maps && google.maps.places)) {
      console.error('Google Maps or Places library not loaded.');
      return;
    }

    console.log('Google Maps loaded, initializing services.');

    this.autocompleteService = new google.maps.places.AutocompleteService();

    // Create dummy map element for places service
    const mapDiv = document.createElement('div');
    mapDiv.style.display = 'none';
    document.body.appendChild(mapDiv);
    const map = new google.maps.Map(mapDiv);
    this.placesService = new google.maps.places.PlacesService(map);

    // Define polygon
    const polygonCoords: google.maps.LatLngLiteral[] = [
        {
            lat: 16.734104849994047,
            lng: 75.05205138360644
        },
        {
            lat: 16.73369387020915,
            lng: 75.05050643121386
        },
        {
            lat: 16.73657071008989,
            lng: 75.04604323541308
        },
        {
            lat: 16.732132138943395,
            lng: 75.0447128597417
        },
        {
            lat: 16.7316184087561,
            lng: 75.0424812618413
        },
        {
            lat: 16.730088126755223,
            lng: 75.04177181755686
        },
        {
            lat: 16.72841398545857,
            lng: 75.04335834418917
        },
        {
            lat: 16.726257551643595,
            lng: 75.0438491884389
        },
        {
            lat: 16.726403969005577,
            lng: 75.04536731874133
        },
        {
            lat: 16.72562821257917,
            lng: 75.04548533593798
        },
        {
            lat: 16.723809539444744,
            lng: 75.04548533593798
        },
        {
            lat: 16.71750056147832,
            lng: 75.04578574334765
        },
        {
            lat: 16.717654692091298,
            lng: 75.04477723275805
        },
        {
            lat: 16.716498709458545,
            lng: 75.04517419969226
        },
        {
            lat: 16.715057574633803,
            lng: 75.04455729161883
        },
        {
            lat: 16.714583616149646,
            lng: 75.04532172118807
        },
        {
            lat: 16.71542492376014,
            lng: 75.04591448938037
        },
        {
            lat: 16.711294132008202,
            lng: 75.05059226190234
        },
        {
            lat: 16.709808001288184,
            lng: 75.05209161674166
        },
        {
            lat: 16.706472192963027,
            lng: 75.05221768056536
        },
        {
            lat: 16.704294958939602,
            lng: 75.05359901820803
        },
        {
            lat: 16.706392554161923,
            lng: 75.0549803558507
        },
        {
            lat: 16.7107392427215,
            lng: 75.05587084924365
        },
        {
            lat: 16.71068786400223,
            lng: 75.05737288629199
        },
        {
            lat: 16.707856875193816,
            lng: 75.05754454766894
        },
        {
            lat: 16.7078388923721,
            lng: 75.05926116143847
        },
        {
            lat: 16.708944190517236,
            lng: 75.05929334794665
        },
        {
            lat: 16.709001349863748,
            lng: 75.06149275933886
        },
        {
            lat: 16.7107392427215,
            lng: 75.06350978051806
        },
        {
            lat: 16.705991790658622,
            lng: 75.06480796968127
        },
        {
            lat: 16.706193135889265,
            lng: 75.06558765431429
        },
        {
            lat: 16.705017495107235,
            lng: 75.06621713524247
        },
        {
            lat: 16.705091354205877,
            lng: 75.06702548598433
        },
        {
            lat: 16.705485697083773,
            lng: 75.06714015041972
        },
        {
            lat: 16.705390643826167,
            lng: 75.06762697135592
        },
        {
            lat: 16.70527246943987,
            lng: 75.06835384999896
        },
        {
            lat: 16.705215951229267,
            lng: 75.06924166118289
        },
        {
            lat: 16.704156231682543,
            lng: 75.06997055148268
        },
        {
            lat: 16.702898529624107,
            lng: 75.07079792914475
        },
        {
            lat: 16.699441692922672,
            lng: 75.07131417056108
        },
        {
            lat: 16.699447955073694,
            lng: 75.07169093710864
        },
        {
            lat: 16.700699658599643,
            lng: 75.07219582104618
        },
        {
            lat: 16.701181639743147,
            lng: 75.07311345085064
        },
        {
            lat: 16.70164306720707,
            lng: 75.07250758593464
        },
        {
            lat: 16.70313761086503,
            lng: 75.07309197222376
        },
        {
            lat: 16.704478001694028,
            lng: 75.07221187239075
        },
        {
            lat: 16.705633414890166,
            lng: 75.07404616808081
        },
        {
            lat: 16.7073231700134,
            lng: 75.07405656164075
        },
        {
            lat: 16.70703993958234,
            lng: 75.07209284936572
        },
        {
            lat: 16.710040490954373,
            lng: 75.07346614038134
        },
        {
            lat: 16.71478784230752,
            lng: 75.07260783349658
        },
        {
            lat: 16.714407647523835,
            lng: 75.0754402462163
        },
        {
            lat: 16.715368408555975,
            lng: 75.07548316156054
        },
        {
            lat: 16.716362559931852,
            lng: 75.07371290361071
        },
        {
            lat: 16.717027893488662,
            lng: 75.07685645257617
        },
        {
            lat: 16.718692501643023,
            lng: 75.07773621713305
        },
        {
            lat: 16.72221690183278,
            lng: 75.07685108815814
        },
        {
            lat: 16.721035258880637,
            lng: 75.07892711793566
        },
        {
            lat: 16.721733970380477,
            lng: 75.08106752072955
        },
        {
            lat: 16.724056140208326,
            lng: 75.08050425683642
        },
        {
            lat: 16.728166105980854,
            lng: 75.07844432031298
        },
        {
            lat: 16.729043957499268,
            lng: 75.08094615077162
        },
        {
            lat: 16.728559598447053,
            lng: 75.08592483361745
        },
        {
            lat: 16.73067033211383,
            lng: 75.0875022239753
        },
        {
            lat: 16.731686789133466,
            lng: 75.09078125592815
        },
        {
            lat: 16.731812469995507,
            lng: 75.09230107046925
        },
        {
            lat: 16.732355051133144,
            lng: 75.09468195202963
        },
        {
            lat: 16.733421631985838,
            lng: 75.0949707105584
        },
        {
            lat: 16.735484827161876,
            lng: 75.09539894395594
        },
        {
            lat: 16.735184896830816,
            lng: 75.09206135589658
        },
        {
            lat: 16.734162222541105,
            lng: 75.08884607355604
        },
        {
            lat: 16.73348264070347,
            lng: 75.08491133579547
        },
        {
            lat: 16.731054909364524,
            lng: 75.08249210899258
        },
        {
            lat: 16.731586300573486,
            lng: 75.08116273914958
        },
        {
            lat: 16.73026536524928,
            lng: 75.08070341085578
        },
        {
            lat: 16.72956090547798,
            lng: 75.07866694366122
        },
        {
            lat: 16.729476138948996,
            lng: 75.07713003789569
        },
        {
            lat: 16.72838187673607,
            lng: 75.07568700944567
        },
        {
            lat: 16.728823692282347,
            lng: 75.07320864831591
        },
        {
            lat: 16.732111589762486,
            lng: 75.07054789697314
        },
        {
            lat: 16.733508929016757,
            lng: 75.06350978051806
        },
        {
            lat: 16.736786471330014,
            lng: 75.06529076730395
        },
        {
            lat: 16.740885888466465,
            lng: 75.06672843133593
        },
        {
            lat: 16.739293393540695,
            lng: 75.06407840882922
        },
        {
            lat: 16.737996270900556,
            lng: 75.06235374843264
        },
        {
            lat: 16.739021126946596,
            lng: 75.06185217534686
        },
        {
            lat: 16.739098183569208,
            lng: 75.06024821435595
        },
        {
            lat: 16.73947832911852,
            lng: 75.05769743358279
        },
        {
            lat: 16.737094701249244,
            lng: 75.0567988935628
        },
        {
            lat: 16.736467966556344,
            lng: 75.0556991878667
        },
        {
            lat: 16.734084301025856,
            lng: 75.05784495507861
        }
    ];
    this.polygon = new google.maps.Polygon({ paths: polygonCoords });

    console.log('AutocompleteService, PlacesService, and polygon are set up.');
  }

   onInputChange(type:any) {
    console.log('Input changed:', this.inputValue);
    let input;
    if(type == 'pickup'){
      input = this.pickup.trim();
    } else {
      input = this.drop.trim();
    }
    if (!input) {
      this.filteredPredictions = [];
      return;
    }

    this.autocompleteService.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: 'in' }
      },
      (predictions, status) => {
        console.log('getPlacePredictions status:', status, 'predictions:', predictions);
        if (
          status !== google.maps.places.PlacesServiceStatus.OK ||
          !predictions ||
          predictions.length === 0
        ) {
          this.ngZone.run(() => {
            this.filteredPredictions = [];
          });
          return;
        }

        const detailPromises = predictions.map(prediction => {
          return new Promise<any>((resolve) => {
            this.placesService.getDetails({ placeId: prediction.place_id }, (place:any, status2) => {
              console.log('getDetails for', prediction.description, 'status:', status2, 'place:', place);
              if (
                status2 === google.maps.places.PlacesServiceStatus.OK &&
                place.geometry?.location &&
                place.name &&
                place.formatted_address
              ) {
                const loc = place.geometry.location;
                const isInside = google.maps.geometry.poly.containsLocation(loc, this.polygon);
                console.log('Is inside polygon?', isInside, 'for place', place.name);

                if (isInside) {
                  resolve({
                    name: place.name,
                    formatted_address: place.formatted_address,
                    geometry: {
                      location: {
                        lat: loc.lat(),
                        lng: loc.lng()
                      }
                    }
                  });
                } else {
                  resolve(null);
                }
              } else {
                resolve(null);
              }
            });
          });
        });

        const detailPromises1 = predictions.map(prediction => {
          return new Promise<any>((resolve) => {
            this.placesService.getDetails({ placeId: prediction.place_id }, (place:any, status2) => {
              console.log('getDetails for', prediction.description, 'status:', status2, 'place:', place);
              if (
                status2 === google.maps.places.PlacesServiceStatus.OK &&
                place.geometry?.location &&
                place.name &&
                place.formatted_address
              ) {
                const loc = place.geometry.location;
                const isInside = google.maps.geometry.poly.containsLocation(loc, this.polygon);
                console.log('Is inside polygon?', isInside, 'for place', place.name);

                if (isInside) {
                 resolve(null);
                } else {
                  resolve({
                    name: place.name,
                    formatted_address: place.formatted_address,
                    geometry: {
                      location: {
                        lat: loc.lat(),
                        lng: loc.lng()
                      }
                    }
                  });
                }
              } else {
                resolve(null);
              }
            });
          });
        });

        Promise.all(detailPromises).then(results => {
          const valid = results.filter(r => r !== null);
          console.log('Final valid results:', valid);
          this.ngZone.run(() => {
            this.filteredPredictions = valid as any[];
          });
        });

        Promise.all(detailPromises1).then(results => {
          const valid = results.filter(r => r !== null);
          console.log('Final valid results:', valid);
          this.ngZone.run(() => {
            this.filteredPredictionsOut = valid as any[];
          });
        });
      }
    );
  }
}

