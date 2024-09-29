import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { SimpleMarkerSymbol } from '@arcgis/core/symbols';
import Map from '@arcgis/core/Map';
import Graphic from '@arcgis/core/Graphic';
import MapView from '@arcgis/core/views/MapView';
import Point from '@arcgis/core/geometry/Point';
import ImageryLayer from '@arcgis/core/layers/ImageryLayer';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  mapView: MapView | any;
  userLocationGraphic: Graphic | any;
  map: Map | any;

  constructor() {}

  async ngOnInit() {
    // Buat instance peta dengan basemap default
    this.map = new Map({
      basemap: "topo-vector", // Default basemap
    });

    this.mapView = new MapView({
      container: "container", // ID elemen HTML untuk map
      map: this.map,
      zoom: 8,
    });

    // Tambahkan imagery layer cuaca (optional)
    let weatherServiceFL = new ImageryLayer({ url: WeatherServiceURL });
    this.map.add(weatherServiceFL);

    // Update lokasi pengguna
    await this.updateUserLocationOnMap();
    this.mapView.center = this.userLocationGraphic.geometry as Point;

    // Perbarui lokasi setiap 10 detik
    setInterval(this.updateUserLocationOnMap.bind(this), 10000);

    // Event listener untuk klik kanan di peta
    this.mapView.on("click", (event: any) => {
      if (event.button === 2) { // Klik kanan
        this.showCoordinatesOnRightClick(event.mapPoint);
      }
    });
  }

  // Fungsi untuk menangani perubahan basemap dari dropdown
  onBasemapChange(event: any) {
    const selectedBasemap = event.target.value;
    this.map.basemap = selectedBasemap;
  }

  async getLocationService(): Promise<number[]> {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition((resp) => {
        resolve([resp.coords.latitude, resp.coords.longitude]);
      });
    });
  }

  async updateUserLocationOnMap() {
    let geom = new Point({
      longitude: -78.24908214885481, // Set koordinat manual
      latitude: 40.39682132573387,
    });

    if (this.userLocationGraphic) {
      this.userLocationGraphic.geometry = geom;
    } else {
      this.userLocationGraphic = new Graphic({
        symbol: new SimpleMarkerSymbol(),
        geometry: geom,
      });
      this.mapView.graphics.add(this.userLocationGraphic);
    }
  }

  // Fungsi untuk menampilkan koordinat pada klik kanan
  showCoordinatesOnRightClick(mapPoint: Point) {
    const latitude = mapPoint.latitude;
    const longitude = mapPoint.longitude;
    alert(`Koordinat: Latitude: ${latitude}, Longitude: ${longitude}`);
  }
}

const WeatherServiceURL = 'https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity_time/ImageServer';
