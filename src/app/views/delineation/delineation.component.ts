import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import * as esri from 'esri-leaflet'; // Import the esri-leaflet library
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-delineation',
  templateUrl: './delineation.component.html',
  styleUrls: ['./delineation.component.css']
})
export class DelineationComponent implements OnInit {
  map: L.Map;
  pilot_name: string;
  region_name: string;
  geojsonUrls = [
    'assets/geojson/Oriketo_new.geojson',
    //'assets/geojson/RAU_LINE.geojson'
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.pilot_name = 'Oriketo';  // Example pilot name
      this.region_name = 'Southwest Finland';  // Example region name
      
      this.loadMap();
    });
  }

  loadMap(): void {
    this.map = L.map('map').setView([0, 0], 13); // Initialize with a default view

    // Define base layers
    const openStreetMapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    const esriWorldImageryLayer = esri.basemapLayer('Imagery');

    // Add default base layer
    openStreetMapLayer.addTo(this.map);

    

    // Add layer control
    L.control.layers({
      'OpenStreetMap': openStreetMapLayer,
      'Esri World Imagery': esriWorldImageryLayer
    }).addTo(this.map);

 

     // Add scale bar
     L.control.scale({
      imperial: false  // This disables the imperial units (feet)
    }).addTo(this.map);
  
    let bounds = L.latLngBounds([]);
  
    const fetchPromises = this.geojsonUrls.map(url =>
      fetch(url)
        .then(response => response.json())
        .then(data => {
          L.geoJSON(data, {
            style: function (feature) {
              return { color: feature.properties.color || 'blue' };
            },
            onEachFeature: (feature, layer) => {
              if (feature.geometry) {
                if (feature.geometry.type === 'Polygon') {
                  const latLngs = feature.geometry.coordinates[0].map(coord => L.latLng(coord[1], coord[0]));
                  bounds.extend(L.latLngBounds(latLngs));
                } else if (feature.geometry.type === 'MultiPolygon') {
                  feature.geometry.coordinates.forEach(polygon => {
                    const latLngs = polygon[0].map(coord => L.latLng(coord[1], coord[0]));
                    bounds.extend(L.latLngBounds(latLngs));
                  });
                }
              }
            }
          }).addTo(this.map);
        })
        .catch(error => console.error('Error loading GeoJSON:', error))
    );
  
    Promise.all(fetchPromises).then(() => {
      if (bounds.isValid()) {
        this.map.fitBounds(bounds, { padding: [100, 100] });
        const zoom = this.map.getZoom(); 
        this.map.setZoom(zoom - 1); 
      }
    });
  }



  goBack(): void {
    window.history.back(); // Navigate back to the previous page
  }

  hoverButton(event: MouseEvent): void {
    const button = event.currentTarget as HTMLButtonElement;
    button.style.backgroundColor = 'black'; // Change background color on hover
    button.style.color = 'white'; // Change text color on hover
    button.style.transform = 'scale(1.1)'; // Slightly enlarge the button on hover
  }

  unhoverButton(event: MouseEvent): void {
    const button = event.currentTarget as HTMLButtonElement;
    button.style.backgroundColor = '#007bff'; // Revert background color
    button.style.color = 'white'; // Revert text color
    button.style.transform = 'scale(1)'; // Revert button size
  }
}



