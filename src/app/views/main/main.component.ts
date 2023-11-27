import { Component, OnInit, Inject, Renderer2, ElementRef, ViewChild, AfterContentInit } from '@angular/core';
import { CasesService } from '../../services/cases.service';
import { NutsService } from '../../services/nuts.service';
import { OptionsService } from '../../services/options.service';
import nutsJSON from '../../../assets/nuts-labels.json';
import { createAsExpression } from 'typescript';
import { DOCUMENT } from '@angular/common';
import { NgbModal, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { FiltersMenuComponent } from '../../components/filters-menu/filters-menu.component';
import { ActivatedRoute } from '@angular/router';

declare var $wt: any;
declare var L: any;

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, AfterContentInit {

  @ViewChild('webtoolsMap') webtoolsMapDiv: ElementRef;
  @ViewChild('contentSelect') contentSelectDiv: ElementRef;

  simpleSlider = 40;
  doubleSlider = [20, 60];
  state_default = true;
  focus: any;

  nuts: any = nutsJSON;
  nuts0Labels = [];
  nuts1Labels = [];
  nuts2Labels = [];
  nuts3Labels = [];

  selectedCaseMap = -1;
  selectedIndex = -1;

  pageLength = 3;

  mapBounds = null;
  mapZoom = null;
  pinnedCase: null;

  collapseSelDesc = true;
  collapsePinDesc = true;

  collapseLocSelDesc = true;
  collapseLocPinDesc = true;

  listMapVisible = 1; // 1 is half, 0 - only list, 2 - only map

  iconsServices = {
    'Water Retention': 'tint',
    'Biodiversity Conservation': 'globe',
    'Pollution Control': 'flask',
    'Flood Control': 'home',
    'Sustainable Forestry': 'tree'
  };


  iconsData = {
    'Geospatial Data': 'map-marker',
    'Hydrological Data': 'tint',
    'Meteorological Data': 'cloud',
    'Statistical and Population Data': 'bar-chart',
    'Land Use Data': 'square'
  };
  iconsTools = {
    'Web Application' : 'laptop ',
    'Data Portal' : 'database',
    'Mapping and Visualization Tools' : 'map-o',
    'Modeling Tools' : 'desktop ',
    'Other Tools' : 'cogs '
  };
  iconsNature = {
    'Flood Prevention' : 'bars',
    'Nature Conservation' : 'leaf',
    'Pollution Reduction' : 'fire',
    'Hydrological Balance' : 'balance-scale',
    'Advocacy and Awareness' : 'eye',
    'Economic Protection' : 'eur',
    'Community Engagement' : 'users',
    'Sustainable Land Use' : 'square ',
    'Biomass Management' : 'pagelines'
  };

  data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        label: 'My First dataset',
        backgroundColor: 'rgba(220, 220, 220, 0.2)',
        borderColor: 'rgba(220, 220, 220, 1)',
        pointBackgroundColor: 'rgba(220, 220, 220, 1)',
        pointBorderColor: '#fff',
        data: [40, 20, 12, 39, 10, 80, 40]
      },
      {
        label: 'My Second dataset',
        backgroundColor: 'rgba(151, 187, 205, 0.2)',
        borderColor: 'rgba(151, 187, 205, 1)',
        pointBackgroundColor: 'rgba(151, 187, 205, 1)',
        pointBorderColor: '#fff',
        data: [50, 12, 28, 29, 7, 25, 60]
      }
    ]
  };

  layersControl = null;

  layerGEOJSON = null;
  loadingMap = true;
  webtoolsScript: any;
  markersLayer = null;
  geojsonLayer = null;
  map = null;
  mapLayers = [];

  changes: any;
  tooltipMsg = 'For sharing your current view, click here to copy URL to your clipboard';

  showCopiedMsg = false;
  showDownloadMsg = false;

  public params = false;
  paramsObj = null;


  constructor(public cs: CasesService,
    public ns: NutsService,
    public tas: OptionsService,
    private _renderer2: Renderer2,
    private modalService: NgbModal,
    private filtersComponent: FiltersMenuComponent,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private _document: Document) {

    this.loadingMap = true;

    this.route.queryParams
      .subscribe(params => {

        if (params && Object.keys(params).length > 0) {

          this.cs.clearFilters();

          this.params = true;
          this.paramsObj = params;

          if (params.txt) {
            this.tas.textFilter = params.txt.replace('+', ' ');
          }

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
          if (params.solutiontype) {
            this.tas.solutiontypeVisible = false;
          
            if (params.solutiontype === 'Nature-based') {
              this.tas.solutiontype.naturebased = true;
              this.tas.solutiontype.grey = false;
              this.tas.solutiontype.technological = false;
              this.tas.solutiontype.nontechnological = false;
            } else if (params.solutiontype === 'Grey') {
              this.tas.solutiontype.naturebased = false;
              this.tas.solutiontype.grey = true;
              this.tas.solutiontype.technological = false;
              this.tas.solutiontype.nontechnological = false;
            } else if (params.solutiontype === 'Technological') {
              this.tas.solutiontype.naturebased = false;
              this.tas.solutiontype.grey = false;
              this.tas.solutiontype.technological = true;
              this.tas.solutiontype.nontechnological = false;
            } else if (params.solutiontype === 'Non-technological') {
              this.tas.solutiontype.naturebased = false;
              this.tas.solutiontype.grey = false;
              this.tas.solutiontype.technological = false;
              this.tas.solutiontype.nontechnological = true;
            }
          }

          if (params.tec) {
            this.tas.ecosystemVisible = false;

            this.tas.ecosystemServices.forEach(tec => {
              if (typeof params.tec === 'string') {
                if (tec.result === params.tec) {
                  tec.active = true;
                }
              } else {
                params.tec.forEach(p => {
                  if (tec.result === p) {
                    tec.active = true;
                  }
                });
              }
            });
          }

          if (params.em) {
            this.tas.trendVisible = false;

            this.tas.dataCategories.forEach(em => {
              if (typeof params.em === 'string') {
                if (em.result === params.em) {
                  em.active = true;
                }
              } else {
                params.em.forEach(p => {
                  if (em.result === p) {
                    em.active = true;
                  }
                });
              }
            });
          }

          if (params.to) {
            this.tas.toolsVisible = false;

            this.tas.toolsPlatforms.forEach(to => {
              if (typeof params.to === 'string') {
                if (to.result === params.to) {
                  to.active = true;
                }
              } else {
                params.to.forEach(p => {
                  if (to.result === p) {
                    to.active = true;
                  }
                });
              }
            });
          }
          if (params.so) {
            this.tas.natureVisible = false;

            this.tas.natureSolution.forEach(so => {
              if (typeof params.so === 'string') {
                if (so.result === params.so) {
                  so.active = true;
                }
              } else {
                params.so.forEach(p => {
                  if (so.result === p) {
                    so.active = true;
                  }
                });
              }
            });
          }


          if (params.ready) {
            this.tas.regiHazardVisible = false;

            if (params.ready === 'r01') {
              this.tas.hazardss.r01 = true;
              this.tas.hazardss.r02 = false;
              this.tas.hazardss.r03 = false;
              this.tas.hazardss.r04 = false;
            } else if (params.ready === 'r02') {
              this.tas.hazardss.r01 = false;
              this.tas.hazardss.r02 = true;
              this.tas.hazardss.r03 = false;
              this.tas.hazardss.r04 = false;
            } else if (params.ready === 'r03') {
              this.tas.hazardss.r01 = false;
              this.tas.hazardss.r02 = false;
              this.tas.hazardss.r03 = true;
              this.tas.hazardss.r04 = false;
            } else if (params.ready === 'r04') {
              this.tas.hazardss.r01 = false;
              this.tas.hazardss.r02 = false;
              this.tas.hazardss.r03 = false;
              this.tas.hazardss.r04 = true;
            }
          }

          this.cs.applyAllFilters();

          if (params.page) {
            this.cs.pagination = params.page;
          }

          if (this.cs.filteredCases && this.cs.filteredCases.length > 0) {
            if (params.sc || params.pc) {
              let index = 0;
              this.cs.filteredCases.forEach(c => {
                if (params.sc) {
                  if (c._id.$oid == this.paramsObj.sc) {
                    this.cs.selectedCase = c;
                    this.selectedIndex = index;
                  }
                }
                if (params.pc) {
                  if (c._id.$oid == this.paramsObj.pc) {
                    this.pinnedCase = c;
                  }
                }
                index++;
              });
            }

            if (this.paramsObj && this.paramsObj.nelat) {
              this.map.fitBounds([
                [this.paramsObj.nelat, this.paramsObj.nelng],
                [this.paramsObj.swlat, this.paramsObj.swlng]
              ]);
            }


          } else {
            // first time loading cases
            setTimeout(() => {
              if (params.sc || params.pc) {
                let index = 0;
                this.cs.filteredCases.forEach(c => {
                  if (params.sc) {
                    if (c._id.$oid == this.paramsObj.sc) {
                      this.cs.selectedCase = c;
                      this.selectedIndex = index;
                    }
                  }
                  if (params.pc) {
                    if (c._id.$oid == this.paramsObj.pc) {
                      this.pinnedCase = c;
                    }
                  }
                  index++;
                });
              }
            }, 3000)
          }
        }

      });

  }

  setBoundsFromURL() {
    if (this.paramsObj && this.paramsObj.nelat) {
      this.map.fitBounds([
        [this.paramsObj.nelat, this.paramsObj.nelng],
        [this.paramsObj.swlat, this.paramsObj.swlng]
      ]);
    }



    if (this.paramsObj && this.paramsObj.nelat) {
      this.cs.pagination = this.paramsObj.page;
    }
  }

  ngAfterContentInit(): void {

    // needed to display map
    window.addEventListener('DOMContentLoaded', (event) => {
      this._renderer2.appendChild(this._document.body, this.webtoolsScript);
      window.scrollTo(0, 1000);
    });

    // refresh cases when params
    if (this.params) {
    }

    this.loadMap();
  }

  ngOnInit() {

    this.nuts.forEach((n: { NUTS_ID: string | any[]; CNTR_CODE: any; NAME_LATN: any; NUTS_NAME: any; }) => {
      // console.log(n.NUTS_ID);
      if (n.NUTS_ID.length === 2) { // NUTS 0
        this.nuts0Labels.push({ NUTS_ID: n.NUTS_ID, CNTR_CODE: n.CNTR_CODE, NAME_LATN: n.NAME_LATN, NUTS_NAME: n.NUTS_NAME, active: false })
      } else if (n.NUTS_ID.length === 3) { // NUTS 1
        this.nuts1Labels.push({ NUTS_ID: n.NUTS_ID, CNTR_CODE: n.CNTR_CODE, NAME_LATN: n.NAME_LATN, NUTS_NAME: n.NUTS_NAME, active: false })
      } else if (n.NUTS_ID.length === 4) { // NUTS 2
        this.nuts2Labels.push({ NUTS_ID: n.NUTS_ID, CNTR_CODE: n.CNTR_CODE, NAME_LATN: n.NAME_LATN, NUTS_NAME: n.NUTS_NAME, active: false })
      } else if (n.NUTS_ID.length > 4) { // NUTS 3
        this.nuts3Labels.push({ NUTS_ID: n.NUTS_ID, CNTR_CODE: n.CNTR_CODE, NAME_LATN: n.NAME_LATN, NUTS_NAME: n.NUTS_NAME, active: false })
      }
    });

    this.webtoolsScript = this._renderer2.createElement('script');
    this.webtoolsScript.type = `application/json`;
    this.webtoolsScript.text = `
  {

       "service": "map",
       "version": "3.0",
       "renderTo" : "webtoolsMap",

       "map" : {
          "center" : [50,10],
          "zoom" : 3,
          "height": "80vh"
            },
         "sidebar": {
           "print": false,
           "fullscreen" : false
        }
    }
    `;
  }

  loadMap() {
    setTimeout(() => {
      // console.log('LOAD MAP');
      // tslint:disable-next-line:no-unused-expression
      window.scrollTo(0, 10);
      window.scrollTo(0, 0);
      if (<any>$wt.map) {
        // tslint:disable-next-line:no-unused-expression
        <any>$wt.map.render({
          'sidebar': {
            'print': false
          }
        }).ready((map: any) => {

          if (map) {
            this.map = map;
            map.setMaxZoom(12);
            this.loadingMap = false;

            this.setBoundsFromURL();

            this.markersLayer = map.markers(JSON.parse(this.cs.filteredCasesMapJSON),
              {
                color: 'blue',
                events: {
                  click: (layer) => {
                    const properties = layer.feature.properties;
                    this.cs.selectedCase = this.cs.filteredCases[properties.index];
                    this.selectedIndex = parseInt(properties.index, 10);
                    this.updateMarkerSel();
                    layer.bindPopup(properties.name).openPopup();
                  },
                }
              }).addTo(map);

            this.mapLayers.push(this.markersLayer);

            this.ns.addGeometriesToHash();

            this.map.on('zoomend', () => {
              console.log("ZOOM END")
              if (this.listMapVisible != 0) {
                this.mapBounds = this.map.getBounds();
                this.mapZoom = this.map.getZoom();
                this.cs.filterByMapExtent(this.mapBounds);

                if (this.markersLayer != null) {
                  map.removeLayer(this.markersLayer);
                  this.markersLayer = null;
                }
                if (this.cs.filteredCasesMapJSON.length > 50) {
                  this.markersLayer = map.markers(JSON.parse(this.cs.filteredCasesMapJSON), {

                    group: function (feature) {
                      const prop = feature.properties;
                      if (prop.color === 'blue') {
                        return {
                          name: prop.name,
                          color: 'blue'
                        }
                      } else {
                        return {
                          name: prop.name,
                          color: '#128570'
                        }
                      }
                    },
                    events: {
                      click: (layer) => {
                        const properties = layer.feature.properties;
                        this.cs.selectedCase = this.cs.filteredCases[properties.index];
                        this.selectedIndex = parseInt(properties.index, 10);
                        this.updateMarkerSel();
                        layer.bindPopup(properties.name).openPopup();
                      }
                    }
                  }).addTo(map);
                  this.mapLayers.push(this.markersLayer);
                }
              }
            });

            this.map.on('moveend', () => {
              console.log("MOVE END")
              if (this.listMapVisible != 0) {
                this.mapBounds = this.map.getBounds();
                this.mapZoom = this.map.getZoom();
                this.cs.filterByMapExtent(this.mapBounds);

                if (this.markersLayer != null) {
                  map.removeLayer(this.markersLayer);
                  this.markersLayer = null;
                }
                if (this.cs.filteredCasesMapJSON.length > 50) {
                  this.markersLayer = map.markers(JSON.parse(this.cs.filteredCasesMapJSON), {
                    group: function (feature) {
                      const prop = feature.properties;
                      if (prop.color === 'blue') {
                        return {
                          name: prop.name,
                          color: 'blue'
                        }
                      } else {
                        return {
                          name: prop.name,
                          color: '#128570'
                        }
                      }
                    },
                    events: {
                      click: (layer) => {
                        const properties = layer.feature.properties;
                        this.cs.selectedCase = this.cs.filteredCases[properties.index];
                        this.selectedIndex = parseInt(properties.index, 10);
                        this.updateMarkerSel();
                        layer.bindPopup(properties.name).openPopup();
                      }
                    }
                  }).addTo(map);
                  this.mapLayers.push(this.markersLayer);
                }
              }
            });


            this.cs.filteredCasesChange.subscribe((value) => {
              // let currentZoom = this.map.getZoom();
              this.loadingMap = true;
              this.tooltipMsg = 'For sharing your current view, click here to copy URL to your clipboard';

              if (this.markersLayer != null) {
                map.removeLayer(this.markersLayer);
                this.map.removeLayer(this.markersLayer);
                this.mapLayers.forEach(l => {
                  map.removeLayer(l);
                  this.map.removeLayer(l);
                });
                this.markersLayer = null;
              }
              if (this.geojsonLayer != null) {
                map.removeLayer(this.geojsonLayer);
                this.geojsonLayer = null;
              }

              if (this.cs.filteredCasesMapJSON.length > 50) {
                this.markersLayer = map.markers(JSON.parse(this.cs.filteredCasesMapJSON), {

                  group: function (feature) {
                    const prop = feature.properties;
                    if (prop.color === 'blue') {
                      return {
                        name: prop.name,
                        color: 'blue'
                      }
                    } else {
                      return {
                        name: prop.name,
                        color: '#128570'
                      }
                    }
                  },
                  events: {
                    click: (layer) => {
                      const properties = layer.feature.properties;
                      this.cs.selectedCase = this.cs.filteredCases[properties.index];
                      this.selectedIndex = parseInt(properties.index, 10);
                      this.updateMarkerSel();
                      layer.bindPopup(properties.name).openPopup();
                    }
                  }
                }).addTo(map);
                this.mapLayers.push(this.markersLayer);
              }

              // active NUTS regions
              this.geojsonLayer = map.geojson(this.ns.nutsActiveGeometry, {
                // Styling base from properties feature.
                style: function (feature) {
                  return {
                    fillColor: feature.properties.stroke,
                    color: feature.properties.stroke,
                  }
                }
              }).addTo(map);

              this.loadingMap = false;

            });

            map.menu.add({
              name: 'layers',
              class: 'layer',
              tooltip: 'Show geographic layers',
              panel: {
                name: 'layers',
                class: 'layer',
                collapse: true,
                content: [
                  {
                    group: {
                      title: 'Visualise geographic layers',
                      description: 'Last selected layer will be on top',
                      class: 'myCustomClass'
                    },
                    checkbox: [
                      {
                        label: 'Countries',
                        geojson: [{
                          data: ['assets/NUTS_RG_01M_2021_4326_LEVL_0.json'],
                          options: {
                            color: 'black',
                            style: {
                              weight: 1.2,
                              fillOpacity: 0.05
                            },
                            events: {
                              tooltip: {
                                content: '<b>{NAME_LATN}</b>',
                                options: {
                                  direction: 'top',
                                  sticky: false
                                }
                              }
                            }
                          }
                        }]
                      },
                      {
                        label: 'Regions',
                        geojson: [{
                          data: ['assets/NUTS_RG_01M_2021_4326_LEVL_1.json'],
                          options: {
                            color: 'blue',
                            style: {
                              weight: 1,
                              fillOpacity: 0.05
                            },
                            events: {
                              tooltip: {
                                content: '<b>{NAME_LATN}</b>',
                                options: {
                                  direction: 'top',
                                  sticky: false
                                }
                              }
                            }
                          }
                        }]
                      },
                      {
                        label: 'Sub-regions',
                        geojson: [{
                          data: ['assets/NUTS_RG_01M_2021_4326_LEVL_2.json'],
                          options: {
                            color: 'green',
                            style: {
                              weight: 1,
                              fillOpacity: 0.05
                            },
                            events: {
                              tooltip: {
                                content: '<b>{NAME_LATN}</b>',
                                options: {
                                  direction: 'top',
                                  sticky: false
                                }
                              }
                            }
                          }
                        }]
                      },
                      
                      {
                        label: 'Locals',
                        geojson: [{
                          data: ['assets/NUTS_RG_01M_2021_4326_LEVL_3.json'],
                          options: {
                            color: 'red',
                            style: {
                              weight: 0.5,
                              fillOpacity: 0.05
                            },
                            events: {
                              tooltip: {
                                content: '<b>{NAME_LATN}</b>',
                                options: {
                                  direction: 'top',
                                  sticky: false
                                }
                              }
                            }
                          }
                        }]
                        
                      }
                      
                    ]

                  }
                ],
              }
            });

            // Add a custom button.
            map.menu.add({
              name: 'custom',
              class: 'locate',
              tooltip: 'Zoom to selected case',
              click: (evt) => {
                if (this.cs.selectedCase) {
                  const markers = [];
                  this.cs.selectedCase.features.forEach(f => {
                    markers.push(L.marker([f.geometry.coordinates[1], f.geometry.coordinates[0]]))
                  });
                  const featureGroup = L.featureGroup(markers);
                  map.fitBounds(featureGroup.getBounds());
                } else {
                  this.modalService.open(this.contentSelectDiv, { size: 'sm' });
                }
              }
            });

          }
        })
      } else {
        this.loadMap();
      }
    }, 1000);
  }


  updateModels() { // when removing geografic region
    this.ns.nuts0Active = [... this.ns.nuts0Active];
    this.ns.nuts1Active = [... this.ns.nuts1Active];
    this.ns.nuts2Active = [... this.ns.nuts2Active];
    this.ns.nuts3Active = [... this.ns.nuts3Active];
    this.cs.filterByGeoExtent();
  }

  clickCard(i) {
    this.tooltipMsg = 'For sharing your current view, click here to copy URL to your clipboard';
    this.cs.selectedCase = this.cs.filteredCases[i + (this.cs.pagination - 1) * this.pageLength];
    this.updateMarkerSel();
    this.selectedIndex = i + (this.cs.pagination - 1) * this.pageLength;
    // const coord = this.cs.selectedCase.features[0].geometry.coordinates;
    // this.map.setView([coord[1], coord[0]], 9, { animate: true });
  }

  changePageToSelected() {
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
    this.cs.addMarkersCollection();
    this.changePageToSelected();
    this.collapseSelDesc = true;
    this.collapsePinDesc = true;

    this.collapseLocSelDesc = true;
    this.collapseLocPinDesc = true;
    // console.log(this.cs.selectedCase);
  }

  openModalAbout(content) {
    this.modalService.open(content, { size: 'lg' });
  }

  openModalWarning(content) {
    if (this.pinnedCase != null) {
      this.modalService.open(content, { size: 'sm' });
    } else {
      this.pinnedCase = this.cs.selectedCase;
      this.cs.selectedCase = null;
      this.updateMarkerSel();
    }
  }

  shareState() {
    this.filtersComponent.copyURLConfig(this.cs.selectedCase, this.pinnedCase, this.mapBounds, this.mapZoom);
    this.tooltipMsg = 'URL copied to your clipboard!';
    this.showCopiedMsg = true;
    setTimeout(() => {
      this.showCopiedMsg = false;
    }, 2000);
  }

  dowloadCasesJSON() {
    this.showDownloadMsg = true;
    var sJson = JSON.stringify(this.cs.filteredCases);
    const a = document.createElement('a');
    const blob = new Blob([sJson], { type: 'text/json' }),
      url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = 'resist-filtered-cases.json';

    let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
    if (isSafariBrowser) {  //if Safari open in new window to save file with random filename.
      a.setAttribute("target", "_blank");
    }
    setTimeout(() => {
      a.click();
    }, 1000);

    setTimeout(() => {
      this.showDownloadMsg = false;
      window.URL.revokeObjectURL(url);
      a.remove();
    }, 2000);
  }

  dowloadCasesCSV() {
    this.showDownloadMsg = true;
  
    let csv = 'SOLUTION_NAME,PILOT_NAME,REGION_NAME,REGION_HAZARD_LEVEL,DESCRIPTION,GEOGRAPHIC_EXTENT,SOLUTION_TYPE,SOLUTION_GOALS,ECOSYSTEM_SERVICE,DATA_CATEGORIES,TOOLS_PLATFORMS,DATA,TOOLS\n';
  
    this.cs.filteredCases.forEach(c => {
      csv += `"${c.solution_name}",`;
      csv += `"${c.pilot_name}",`;
      csv += `"${c.region_name}",`;
      csv += `${c.region_hazard_level},`;
      csv += `"${c.description}",`;
      
      
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
  
      
      let dataCategories = c.data.map(dataItem => {
        return `Type: ${dataItem.type}, Format: ${dataItem.format}, Link: ${dataItem.link}`;
      });
      csv += `"${dataCategories.join('; ')}",`;
  
      
      let toolsInfo = c.tools.map(tool => {
        return `Name: ${tool.name}, Description: ${tool.description}, Link: ${tool.link}`;
      });
      csv += `"${toolsInfo.join('; ')}",`; 
  
      csv += '\n';
    });
  
    const a = document.createElement('a');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = 'resist-filtered-cases.csv';
  
    let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
    if (isSafariBrowser) {
      a.setAttribute('target', '_blank');
    }
  
    setTimeout(() => {
      a.click();
    }, 1000);
  
    setTimeout(() => {
      this.showDownloadMsg = false;
      window.URL.revokeObjectURL(url);
      a.remove();
    }, 2000);
  }
  



}
