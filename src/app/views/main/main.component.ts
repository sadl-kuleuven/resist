import { Component, OnInit, Inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CasesService } from '../../services/cases.service';
import { NutsService } from '../../services/nuts.service';
import { OptionsService } from '../../services/options.service';
import nutsJSON from '../../../assets/nuts-labels.json';
import { DOCUMENT } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FiltersMenuComponent } from '../../components/filters-menu/filters-menu.component';
import { ActivatedRoute } from '@angular/router';
// Import Leaflet library
import * as L from 'leaflet';
import 'leaflet.markercluster';




@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, AfterViewInit {
  @ViewChild('contentSelect') contentSelectDiv: ElementRef;  // Reference to modal content for "no case selected"

  
 private selectedCaseMarkerLayer: L.LayerGroup = L.layerGroup();

  // Slider and state variables
  simpleSlider = 40;
  doubleSlider = [20, 60];
  state_default = true;
  focus: any;

  // NUTS region labels (loaded from JSON asset)
  nuts: any = nutsJSON;
  nuts0Labels = [];
  nuts1Labels = [];
  nuts2Labels = [];
  nuts3Labels = [];

  // Selected case indices and pagination
  selectedCaseMap = -1;
  selectedIndex = -1;
  pageLength = 3;
  pinnedCase: any = null;

  // Map state and view toggles
  map: L.Map;                         // Leaflet map instance
  mapBounds: L.LatLngBounds = null;
  mapZoom: number = null;
  listMapVisible = 1;                 // 1 = split view, 0 = list only, 2 = map only

  // Flags for collapsing sections in UI
  collapseSelDesc = true;
  collapsePinDesc = true;
  collapseLocSelDesc = true;
  collapseLocPinDesc = true;

  // Map layers for markers and regions
  markersLayer: L.Layer = null;       // Layer for case markers (points)
  geojsonLayer: L.Layer = null;       // Layer for active NUTS regions (polygons/highlights)

  // UI feedback and tooltip messages
  loadingMap = true;
  tooltipMsg = 'For sharing your current view, click here to copy URL to your clipboard';
  showCopiedMsg = false;
  showDownloadMsg = false;

  // Query params handling
  public params = false;
  paramsObj: any = null;

  // Icons mapping for categories (e.g., hazard, solution) – for use in template
  iconsData = {
    'Meteorological geographical features': 'cloud',
    'Environmental monitoring facilities': 'desktop',
    'Population distribution - demography': 'users',
    'Atmospheric conditions': 'thermometer-empty',
    'Natural risk zones': 'info',
    'Transport networks': 'road',
    'Protected sites': 'map-marker',
    'Orthoimagery': 'file-image-o',
    'Elevation': 'area-chart',
    'Land use': 'th-large',
    'Land cover': 'globe',
    'Geology': 'map',
    'Hydrography': 'tint',
    'Soil': 'circle-o',
    'Addresses': 'address-book',
    'Administrative units': 'globe',
    'Cadastral parcels': 'th-large',
    'Geographical grid systems': 'th',
    'Geographical names': 'language',
    'Coordinate reference systems': 'location-arrow',
    'Agricultural and aquaculture facilities': 'map-marker',
    'Area management/restriction/regulation zones and reporting units': 'ban',
    'Bio-geographical regions': 'pagelines',
    'Buildings': 'home',
    'Energy resources': 'globe',
    'Habitats and biotopes': 'map',
    'Human health and safety': 'heartbeat',
    'Mineral resources': 'diamond',
    'Oceanographic geographical features': 'area-chart',
    'Production and industrial facilities': 'industry',
    'Species distribution': 'globe',
    'Sea regions': 'map',
    'Statistical units': 'bar-chart',
    'Utility and governmental servicess': 'circle-o'
  };

  iconsHazard = {
    'Floods': 'bolt',
    'Droughts': 'tint',
    'Wildfire': 'fire',
    'Heatwaves': 'thermometer-three-quarters',
    'Soil Erosion': 'info'
  };

  iconsSolution = {
    '1 - Water Management and Flood Prevention': 'bars',
    '2 - Community Engagement and Advocacy': 'users',
    '3 - Nature Conservation and Biodiversity': 'leaf',
    '4 - Climate Risk Identification and Adaptation': 'sun-o',
    '5 - Pollution Reduction and Environmental Enhancement': 'arrow-down',
    '6 - Forest Fire Reduction and Management': 'fire-extinguisher',
    '7 - Urban Planning': 'building-o',
    '8 - Other Solutions': 'circle-o-notch'
  };

  constructor(
    public cs: CasesService,
    public ns: NutsService,
    public tas: OptionsService,
    private modalService: NgbModal,
    private filtersComponent: FiltersMenuComponent,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private _document: Document
  ) {
    this.loadingMap = true;
    // Parse URL query parameters for state restoration (filters, page, etc.)
    this.route.queryParams.subscribe(params => {
      if (params && Object.keys(params).length > 0) {
        this.cs.clearFilters();
        this.params = true;
        this.paramsObj = params;

        // Restore text filter from URL (if present)
        if (params.txt) {
          this.tas.textFilter = params.txt.replace('+', ' ');
        }

        // Restore geographic (NUTS) filters from URL
        if (params.n0) {
          this.tas.geoExtVisible = false;
          if (typeof params.n0 === 'string') {
            this.ns.nuts0Labels.forEach(n => {
              if (params.n0 === n.NUTS_ID) {
                this.ns.nuts0Active.push(n);
              }
            });
          } else {
            params.n0.forEach(p => {
              this.ns.nuts0Labels.forEach(n => {
                if (p === n.NUTS_ID) {
                  this.ns.nuts0Active.push(n);
                }
              });
            });
          }
        }
        if (params.n1) {
          this.tas.geoExtVisible = false;
          if (typeof params.n1 === 'string') {
            this.ns.nuts1Labels.forEach(n => {
              if (params.n1 === n.NUTS_ID) {
                this.ns.nuts1Active.push(n);
              }
            });
          } else {
            params.n1.forEach(p => {
              this.ns.nuts1Labels.forEach(n => {
                if (p === n.NUTS_ID) {
                  this.ns.nuts1Active.push(n);
                }
              });
            });
          }
        }
        if (params.n2) {
          this.tas.geoExtVisible = false;
          if (typeof params.n2 === 'string') {
            this.ns.nuts2Labels.forEach(n => {
              if (params.n2 === n.NUTS_ID) {
                this.ns.nuts2Active.push(n);
              }
            });
          } else {
            params.n2.forEach(p => {
              this.ns.nuts2Labels.forEach(n => {
                if (p === n.NUTS_ID) {
                  this.ns.nuts2Active.push(n);
                }
              });
            });
          }
        }
        if (params.n3) {
          this.tas.geoExtVisible = false;
          if (typeof params.n3 === 'string') {
            this.ns.nuts3Labels.forEach(n => {
              if (params.n3 === n.NUTS_ID) {
                this.ns.nuts3Active.push(n);
              }
            });
          } else {
            params.n3.forEach(p => {
              this.ns.nuts3Labels.forEach(n => {
                if (p === n.NUTS_ID) {
                  this.ns.nuts3Active.push(n);
                }
              });
            });
          }
        }

        // (Additional URL filter parameters like solutiontype, etc., would be handled here if present)
        // Restore page number if present
        if (params.page) {
          this.cs.pagination = parseInt(params.page, 10);
        }
        // (If a selected case was indicated in URL, handle it here if implemented)
      }
    });
  }

  ngOnInit() {
    // Initialize NUTS label lists for filter menus
    this.nuts.forEach((n: { NUTS_ID: string; CNTR_CODE: any; NAME_LATN: any; NUTS_NAME: any }) => {
      if (n.NUTS_ID.length === 2) {        // NUTS 0 (Countries)
        this.nuts0Labels.push({ ...n, active: false });
      } else if (n.NUTS_ID.length === 3) { // NUTS 1
        this.nuts1Labels.push({ ...n, active: false });
      } else if (n.NUTS_ID.length === 4) { // NUTS 2
        this.nuts2Labels.push({ ...n, active: false });
      } else if (n.NUTS_ID.length > 4) {   // NUTS 3
        this.nuts3Labels.push({ ...n, active: false });
      }
    });
  }

  ngAfterViewInit() {
    // Initialize Leaflet map on the div with id="mapContainer"
    this.map = L.map('mapContainer', {
      zoomControl: true,
      attributionControl: false
    }).setView([50, 10], 4);
    this.map.setMaxZoom(14);
    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // If URL provided map bounds (nelat, nelng, swlat, swlng), fit the map to those bounds
    this.setBoundsFromURL();

    // Add initial markers and region highlights (if data already available)
    this.refreshMapLayers();

    // Listen for changes in filtered cases to update map markers and highlights
    this.cs.filteredCasesChange.subscribe(() => {
      this.tooltipMsg = 'For sharing your current view, click here to copy URL to your clipboard';
      this.loadingMap = true;
      // Refresh markers and region layers based on updated filtered data
      this.refreshMapLayers();
      this.loadingMap = false;

       // ✅ Apply selected case from URL if present
      const selectedId = this.route.snapshot.queryParamMap.get('sc');
      if (selectedId && !this.cs.selectedCase) {
        const found = this.cs.filteredCases.find(c => c._id?.$oid === selectedId);
        if (found) {
          this.cs.selectedCase = found;
          this.updateMarkerSel(); // Will also zoom and update UI
        }
      }
    });

    // Handle map zoom end: update bounds/zoom and filter cases by map extent
    this.map.on('zoomend', () => {
      if (this.listMapVisible !== 0) {
        this.mapBounds = this.map.getBounds();
        this.mapZoom = this.map.getZoom();
        this.cs.filterByMapExtent(this.mapBounds);
        // Remove current markers/regions for a clean update (will be re-added via filteredCasesChange event)
        if (this.markersLayer) {
          this.map.removeLayer(this.markersLayer);
          this.markersLayer = null;
        }
        if (this.geojsonLayer) {
          this.map.removeLayer(this.geojsonLayer);
          this.geojsonLayer = null;
        }
      }
    });

    // Handle map move end: update bounds/zoom and filter cases by map extent
    this.map.on('moveend', () => {
      if (this.listMapVisible !== 0) {
        this.mapBounds = this.map.getBounds();
        this.mapZoom = this.map.getZoom();
        this.cs.filterByMapExtent(this.mapBounds);
        if (this.markersLayer) {
          this.map.removeLayer(this.markersLayer);
          this.markersLayer = null;
        }
        if (this.geojsonLayer) {
          this.map.removeLayer(this.geojsonLayer);
          this.geojsonLayer = null;
        }
      }
    });

    

    

    // Add custom control button to zoom to selected case bounds
    const zoomToCaseControl = new L.Control({ position: 'topright' }) as L.Control;
    zoomToCaseControl.onAdd = (map: L.Map) => {
      const controlDiv = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
      const controlBtn = L.DomUtil.create('a', '', controlDiv) as HTMLAnchorElement;  // 👈 Cast as anchor
      controlBtn.href = '#';  // ✅ Now this works
      controlBtn.title = 'Zoom to selected case';
      controlBtn.innerHTML = `<i class="fa fa-crosshairs"></i>`;
      // Prevent clicks from propagating to the map (so map drag is not triggered)
      L.DomEvent.on(controlBtn, 'click', (evt: Event) => {
      L.DomEvent.stopPropagation(evt);
      L.DomEvent.preventDefault(evt);

      if (this.cs.selectedCase) {
        // 🔄 Clear previous highlight marker layer
        if (this.selectedCaseMarkerLayer) {
          this.map.removeLayer(this.selectedCaseMarkerLayer);
        }

        const markers: L.Marker[] = [];

        this.cs.selectedCase.features?.forEach(f => {
          if (f.geometry && f.geometry.coordinates) {
            const [lon, lat] = f.geometry.coordinates;

            const marker = L.marker([lat, lon], {
              icon: L.icon({
                iconUrl: 'assets/marker-icon.png',  // ✅ Customize this path or icon
                iconSize: [24, 36],
                iconAnchor: [12, 36]
              })
            });

            markers.push(marker);
          }
        });

          if (markers.length > 0) {
            this.selectedCaseMarkerLayer = L.layerGroup(markers).addTo(this.map);

            if (markers.length === 1) {
              const latlng = markers[0].getLatLng();

              // Center on the marker
              this.map.setView(latlng, 14, { animate: true });

              // Shift view slightly left so marker isn’t hidden by UI
              setTimeout(() => {
                this.map.panBy([300, 0], { animate: true }); 
              }, 400);
            } else {
              const group = L.featureGroup(markers);
              this.map.fitBounds(group.getBounds(), {
                padding: [40, 40],
                maxZoom: 14
              });
            }
          }
      } else {
        this.modalService.open(this.contentSelectDiv, { size: 'sm' });
      }
    });
      return controlDiv;
    };
    zoomToCaseControl.addTo(this.map);
  }

  /** 
   * Update (or initialize) the map markers and region highlight layers 
   * based on the current filtered cases and active NUTS regions.
   */
  private refreshMapLayers(): void {
    // Remove existing markers layer and region layer (if any) before adding new ones
    if (this.markersLayer) {
      this.map.removeLayer(this.markersLayer);
      this.markersLayer = null;
    }
    if (this.geojsonLayer) {
      this.map.removeLayer(this.geojsonLayer);
      this.geojsonLayer = null;
    }

    // If there are filtered cases, add them as markers on the map
      if (this.cs.filteredCases && this.cs.filteredCases.length > 0) {
      const clusterGroup = L.markerClusterGroup({
       disableClusteringAtZoom: 12,
       iconCreateFunction: (cluster) => {
        return L.divIcon({
        html: `<div class="custom-cluster">${cluster.getChildCount()}</div>`,
        className: 'custom-cluster-icon',
        iconSize: L.point(40, 40)
      });
    }
  });

    this.cs.filteredCases.forEach((c, index) => {
      if (c.features && c.features.length > 0) {
        const coord = c.features[0].geometry.coordinates;
        const latlng = L.latLng(coord[1], coord[0]);

        const isSelected = this.cs.selectedCase && this.cs.selectedCase._id?.$oid === c._id?.$oid;
        const marker = L.marker(latlng, {
          title: c.solution_name,
          icon: L.icon({
            iconUrl: isSelected ? 'assets/marker-icon.png' : 'assets/marker-icon-current.png',
            iconSize: [24, 36],
            iconAnchor: [12, 36]
          })
        }).bindPopup(`<b>${c.solution_name}</b><br>${c.description.slice(0, 100)} [...]`);

        marker.on('click', () => {
          this.cs.selectedCase = c;
          this.selectedIndex = index;
          this.updateMarkerSel();
        });

        clusterGroup.addLayer(marker);
      }
    });

    this.map.addLayer(clusterGroup);
    this.map.fitBounds(clusterGroup.getBounds(), {
      paddingTopLeft: [0, 0],
      paddingBottomRight: [500, 0], // shifts focus right
      maxZoom: 4 // prevents zooming in too much
    });
  }

    // Add active NUTS region geometry highlights (if any regions are active)
    if (this.ns.nutsActiveGeometry && this.ns.nutsActiveGeometry.features && this.ns.nutsActiveGeometry.features.length > 0) {
      this.geojsonLayer = L.geoJSON(this.ns.nutsActiveGeometry as GeoJSON.FeatureCollection, {
        style: feature => ({
          color: feature.properties?.stroke || '#3388ff',
          fillColor: feature.properties?.stroke || '#3388ff',
          weight: 1,
          fillOpacity: 0.2
        })
      }).addTo(this.map);
    }

    // (Optional: call NutsService to update any URL hash or state if needed)
    // this.ns.addGeometriesToHash();
  }

  /**
   * If map bounds (north-east and south-west coordinates) are provided in URL parameters, 
   * fit the map view to those bounds. Also restore pagination if present.
   */
  private setBoundsFromURL(): void {
    if (this.paramsObj && this.paramsObj.nelat && this.paramsObj.nelng && this.paramsObj.swlat && this.paramsObj.swlng) {
      const ne = [parseFloat(this.paramsObj.nelat), parseFloat(this.paramsObj.nelng)] as [number, number];
      const sw = [parseFloat(this.paramsObj.swlat), parseFloat(this.paramsObj.swlng)] as [number, number];
      this.map.fitBounds([ sw, ne ]);
    }
    // (Pagination restored in constructor if provided; selected case could be handled here if needed)
  }

  // --- UI Interaction Methods --- //

  updateModels() {
    // Trigger filtering when geographic region filters are removed (to refresh list/map)
    this.ns.nuts0Active = [...this.ns.nuts0Active];
    this.ns.nuts1Active = [...this.ns.nuts1Active];
    this.ns.nuts2Active = [...this.ns.nuts2Active];
    this.ns.nuts3Active = [...this.ns.nuts3Active];
    this.cs.filterByGeoExtent();
  }

  clickCard(i: number) {
    // User clicks a case card in the list -> select that case and update map/list state
    this.tooltipMsg = 'For sharing your current view, click here to copy URL to your clipboard';
    const caseIndex = i + (this.cs.pagination - 1) * this.pageLength;
    this.cs.selectedCase = this.cs.filteredCases[caseIndex];
    this.updateMarkerSel();
    this.selectedIndex = caseIndex;
    // Optionally center map on the selected case's first feature:
    // if (this.cs.selectedCase && this.cs.selectedCase.features?.[0]) {
    //   const coord = this.cs.selectedCase.features[0].geometry.coordinates;
    //   this.map.setView([coord[1], coord[0]], 9, { animate: true });
    // }
  }

  changePageToSelected() {
    // If a case is selected, change pagination so that the selected case's page is shown
    if (this.cs.selectedCase != null) {
      let caseI = 0;
      this.cs.filteredCases.forEach(element => {
        caseI++;
        if (element.featureIndex === this.cs.selectedCase.featureIndex) {
          this.cs.pagination = Math.ceil(caseI / this.pageLength);
        }
      });
    }
  }

  updateMarkerSel() {
    // Update marker collections in CasesService and adjust pagination for selected case
    this.cs.addMarkersCollection();
    this.changePageToSelected();
    this.refreshMapLayers();
    this.collapseSelDesc = true;
    this.collapsePinDesc = true;
    this.collapseLocSelDesc = true;
    this.collapseLocPinDesc = true;
  }

  openModalAbout(content: any) {
    // Open "About" modal dialog
    this.modalService.open(content, { size: 'lg' });
  }

  openModalWarning(content: any) {
    // Handle pinning/unpinning of a case with a warning modal if needed
    if (this.pinnedCase != null) {
      // A case is already pinned, prompt user (content might contain a warning message)
      this.modalService.open(content, { size: 'sm' });
    } else {
      // Pin the currently selected case
      this.pinnedCase = this.cs.selectedCase;
      this.cs.selectedCase = null;
      this.updateMarkerSel();
    }
  }

  shareState() {
    // Copy current filter and map state to URL (for sharing)
    this.filtersComponent.copyURLConfig(this.cs.selectedCase, this.pinnedCase, this.mapBounds, this.mapZoom);
    this.tooltipMsg = 'URL copied to your clipboard!';
    this.showCopiedMsg = true;
    setTimeout(() => { this.showCopiedMsg = false; }, 2000);
  }

  dowloadCasesJSON() {
    // Export filtered cases as JSON file
    this.showDownloadMsg = true;
    const sJson = JSON.stringify(this.cs.filteredCases);
    const blob = new Blob([sJson], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resist-filtered-cases.json';
    // If Safari, target blank to download with random filename
    if (navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1) {
      a.setAttribute('target', '_blank');
    }
    setTimeout(() => { a.click(); }, 1000);
    setTimeout(() => {
      this.showDownloadMsg = false;
      window.URL.revokeObjectURL(url);
      a.remove();
    }, 2000);
  }

  dowloadCasesCSV() {
    // Export filtered cases as CSV file
    this.showDownloadMsg = true;
    let csv = 'SOLUTION_NAME,PILOT_NAME,REGION_NAME,REGION_HAZARD_LEVEL,DESCRIPTION,GEOGRAPHIC_EXTENT,SOLUTION_TYPE,SOLUTION_GOALS,ECOSYSTEM_SERVICE,DATA_CATEGORIES,TOOLS_PLATFORMS,DATA,TOO_Web map application,TOO_Geoportal,TOO_Story map,TOO_Map viewer,TOO_Web portal,TOO_Software,TOO_Decision support tool,TOO_Hydrological design tool,TOO_Machine Learning/IoT/Extended Reality (XR),TOO_Software (fire modelling),TOO_Data analysis tools,TOO_Master plan/ Action plan,TOO_Support program,TOO_Website (video),TOO_Project website,TOO_Data portal,TOO_Sensor network\n';
    this.cs.filteredCases.forEach(c => {
      // Wrap text fields in quotes and separate by commas
      csv += `"${c.solution_name}",`;
      csv += `"${c.pilot_name}",`;
      csv += `"${c.region_name}",`;
      csv += `${c.region_hazard_level},`;
      csv += `"${c.description}",`;
      // Geographic extent (array of coordinates) joined with "; "
      let geographicExtentString = '';
      c.geographic_extent.forEach(extent => {
        geographicExtentString += extent.join('-') + '; ';
      });
      geographicExtentString = geographicExtentString.slice(0, -2);
      csv += `"${geographicExtentString}",`;
      csv += `"${c.solution_type}",`;
      csv += `"${c.solution_goals.join(', ')}",`;
      csv += `"${c.ecosystem_service.join(', ')}",`;
      csv += `"${c.data_categories}",`;
      csv += `"${c.tools_platforms}",`;
      // Data: list all data items with type/format/link
      const dataItems = c.data.map(item => `Type: ${item.type}, Format: ${item.format}, Link: ${item.link}`);
      csv += `"${dataItems.join('; ')}",`;
      // Mapping and Visualization Tools (group 0 of tools_platforms)
      csv += c.tools_platforms[0].includes('Web map application') ? '1,' : '0,';
      csv += c.tools_platforms[0].includes('Geoportal') ? '1,' : '0,';
      csv += c.tools_platforms[0].includes('Story map') ? '1,' : '0,';
      csv += c.tools_platforms[0].includes('Map viewer') ? '1,' : '0,';
      csv += c.tools_platforms[0].includes('Web portal') ? '1,' : '0,';
      // Software and Modeling Tools (group 1)
      csv += c.tools_platforms[1].includes('Software') ? '1,' : '0,';
      csv += c.tools_platforms[1].includes('Decision support tool') ? '1,' : '0,';
      csv += c.tools_platforms[1].includes('Hydrological design tool') ? '1,' : '0,';
      csv += c.tools_platforms[1].includes('Machine Learning/IoT/Extended Reality (XR)') ? '1,' : '0,';
      csv += c.tools_platforms[1].includes('Software (fire modelling)') ? '1,' : '0,';
      csv += c.tools_platforms[1].includes('Data analysis tools') ? '1,' : '0,';
      // Planning and Management Documents (group 2)
      csv += c.tools_platforms[2].includes('Master plan/ Action plan') ? '1,' : '0,';
      csv += c.tools_platforms[2].includes('Support program') ? '1,' : '0,';
      // Data Management Platforms (group 3)
      csv += c.tools_platforms[3].includes('Website (video)') ? '1,' : '0,';
      csv += c.tools_platforms[3].includes('Project website') ? '1,' : '0,';
      csv += c.tools_platforms[3].includes('Data portal') ? '1,' : '0,';
      csv += c.tools_platforms[3].includes('Sensor network') ? '1,' : '0,';
      csv = csv.slice(0, -1); // remove trailing comma for this line
      csv += '\n';
    });
    // Trigger CSV download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resist-filtered-cases.csv';
    if (navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1) {
      a.setAttribute('target', '_blank');
    }
    a.click();
    setTimeout(() => {
      this.showDownloadMsg = false;
      window.URL.revokeObjectURL(url);
      a.remove();
    }, 2000);
  }
}
