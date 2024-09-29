import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import ImageryLayer from '@arcgis/core/layers/ImageryLayer';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  mapView: MapView | any;
  userLocationGraphic: Graphic | any;
  initialUserLocationSet: boolean = false; // Flag untuk cek apakah lokasi pengguna pertama sudah di-set
  selectedBasemap: string = 'topo-vector'; // Default basemap
  basemaps: any[] = [
    { value: 'topo-vector', label: 'Topographic' },
    { value: 'streets', label: 'Streets' },
    { value: 'satellite', label: 'Satellite' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'terrain', label: 'Terrain' },
    { value: 'dark-gray', label: 'Dark Gray' },
    { value: 'oceans', label: 'Oceans' }
  ];

  constructor() { }

  async ngOnInit() {
    const map = new Map({
      basemap: this.selectedBasemap, // Basemap awal
    });

    this.mapView = new MapView({
      container: 'container',
      map: map,
      zoom: 10, // Zoom untuk fokus di area yang diinginkan
      center: [-7.758391153446039, 110.37287184338194],
    });

    // Layer informasi cuaca
    let weatherServiceFL = new ImageryLayer({ url: WeatherServiceUrl });
    map.add(weatherServiceFL);

    // Update lokasi pengguna secara periodik
    await this.updateUserLocationOnMap();
    setInterval(this.updateUserLocationOnMap.bind(this), 10000);

    // Tambahkan marker cuaca
    this.addWeatherMarker();
  }

  // Menggunakan plugin Capacitor Geolocation untuk mendapatkan lokasi pengguna
  async getLocationService(): Promise<number[]> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition((resp) => {
        resolve([resp.coords.latitude, resp.coords.longitude]);
      });
    });
  }

  async updateUserLocationOnMap() {
    let latLng = await this.getLocationService();
    let geom = new Point({ latitude: latLng[0], longitude: latLng[1] });

    if (this.userLocationGraphic) {
      // Update lokasi marker pengguna tanpa mengubah pusat peta
      this.userLocationGraphic.geometry = geom;
    } else {
      // Buat marker pengguna jika belum ada
      this.userLocationGraphic = new Graphic({
        symbol: new SimpleMarkerSymbol({
          color: 'red',
          size: '10px',
          outline: {
            color: 'white',
            width: 2,
          },
        }),
        geometry: geom,
      });
      this.mapView.graphics.add(this.userLocationGraphic);

      // Hanya memusatkan peta ke lokasi pengguna saat pertama kali di-load
      if (!this.initialUserLocationSet) {
        this.mapView.center = geom;
        this.mapView.zoom = 14; // Bisa disesuaikan jika diperlukan
        this.initialUserLocationSet = true; // Flag untuk mencegah reset saat pembaruan lokasi berikutnya
      }
    }
  }

  changeBasemap() {
    this.mapView.map.basemap = this.selectedBasemap;
  }

  // Fungsi untuk menambahkan marker di area cuaca tertentu
  addWeatherMarker() {
    let weatherPoint = new Point({
      latitude: 40.98459970225305, // Lokasi yang tertutup cuaca
      longitude:  -81.54566570100829,
    });

    let weatherMarker = new Graphic({
      geometry: weatherPoint,
      symbol: new SimpleMarkerSymbol({
        color: 'blue',
        size: '25px',
        outline: {
          color: 'white',
          width: 2,
        },
      }),
    });

    this.mapView.graphics.add(weatherMarker);
  }
}

const WeatherServiceUrl = 'https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity_time/ImageServer';
