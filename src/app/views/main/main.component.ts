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




  iconsData = {
    'Meteorological Geographical Features': 'map-marker',
    'Environmental Monitoring Facilities': 'tint',
    'Population Distribution - Demography': 'cloud',
    'Atmospheric Conditions': 'bar-chart',
    'Natural Risk Zones': 'square',
    'Transport Networks': 'road',
    'Protected Sites': 'map-marker',
    'Orthoimagery': 'file-image-o',
    'Elevation': 'area-chart',
    'Land Use': 'th-large',
    'Land Cover': 'globe',
    'Geology': 'map',
    'Hydrography': 'tint',
    'Soil': 'circle-o'
  };

  iconsHazard = {
    'Floods': 'map-marker',
    'Droughts': 'tint',
    'Wildfire': 'cloud',
    'Heatwaves': 'bar-chart',
    'Soil Erosion': 'square',

  }

  iconsSolution = {
    '1 - Water Management and Flood Prevention' : 'bars',
    '2 - Community Engagement and Advocacy' : 'leaf',
    '3 - Nature Conservation and Biodiversity' : 'eur',
    '4 - Climate Risk Identification and Adaptation' : 'balance-scale',
    '5 - Pollution Reduction and Environmental Enhancement' : 'eye',
    '6 - Forest Fire Reduction and Management' : 'fire',
    '7 - Urban Planning' : 'users',
    '8 - Other Solutions' : 'square'
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

          /*


          if (params.solutiontype) {
            this.tas.solutiontypeVisible = false;
          
            if (params.solutiontype === 'Governance and Institutional ') {
              this.tas.solutiontype.governanceAndInstitutional = true;
              this.tas.solutiontype.economicAndFinance = false;
              this.tas.solutiontype.physicalAndTechnological = false;
              this.tas.solutiontype.natureBasedSolutionsAndEcosystemBasedApproaches = false;
              this.tas.solutiontype.knowledgeAndBehaviouralChange = false;
            } else if (params.solutiontype === 'Economic and Finance') {
              this.tas.solutiontype.governanceAndInstitutional = false;
              this.tas.solutiontype.economicAndFinance = true;
              this.tas.solutiontype.physicalAndTechnological = false;
              this.tas.solutiontype.natureBasedSolutionsAndEcosystemBasedApproaches = false;
              this.tas.solutiontype.knowledgeAndBehaviouralChange = false;
            } else if (params.solutiontype === 'Physical and Technological') {
              this.tas.solutiontype.governanceAndInstitutional = false;
              this.tas.solutiontype.economicAndFinance = false;
              this.tas.solutiontype.physicalAndTechnological = true;
              this.tas.solutiontype.natureBasedSolutionsAndEcosystemBasedApproaches = false;
              this.tas.solutiontype.knowledgeAndBehaviouralChange = false;
            } else if (params.solutiontype === 'Nature Based Solutions and Ecosystem-based Approaches') {
              this.tas.solutiontype.governanceAndInstitutional = false;
              this.tas.solutiontype.economicAndFinance = false;
              this.tas.solutiontype.physicalAndTechnological = false;
              this.tas.solutiontype.natureBasedSolutionsAndEcosystemBasedApproaches = true;
              this.tas.solutiontype.knowledgeAndBehaviouralChange = false;
            } else if (params.solutiontype === 'Knowledge and Behavioural change') {
              this.tas.solutiontype.governanceAndInstitutional = false;
              this.tas.solutiontype.economicAndFinance = false;
              this.tas.solutiontype.physicalAndTechnological = false;
              this.tas.solutiontype.natureBasedSolutionsAndEcosystemBasedApproaches = false;
              this.tas.solutiontype.knowledgeAndBehaviouralChange = true;
            }
          }

          */

          if (params.sty) {
            this.tas.solutiontypeVisible = false;

            this.tas.solutionTypes.forEach(sty => {
              if (typeof params.sty === 'string') {
                if (sty.result === params.sty) {
                  sty.active = true;
                }
              } else {
                params.sty.forEach(p => {
                  if (sty.result === p) {
                    sty.active = true;
                  }
                });
              }
            });
          }

        

          if (params.eco) {
            this.tas.ecosystemVisible = false;

            this.tas.ecosystemServices.forEach(eco => {
              if (typeof params.eco === 'string') {
                if (eco.result === params.eco) {
                  eco.active = true;
                }
              } else {
                params.eco.forEach(p => {
                  if (eco.result === p) {
                    eco.active = true;
                  }
                });
              }
            });
          }

          if (params.da) {
            this.tas.dataVisible = false;

            this.tas.dataCategories.forEach(da => {
              if (typeof params.da === 'string') {
                if (da.result === params.da) {
                  da.active = true;
                }
              } else {
                params.da.forEach(p => {
                  if (da.result === p) {
                    da.active = true;
                  }
                });
              }
            });
          }

          if (params.too) {
            this.tas.toolsVisible = false;

            this.tas.toolsPlatforms.forEach(too => {
              if (typeof params.too === 'string') {
                if (too.result === params.too) {
                  too.active = true;
                }
              } else {
                params.too.forEach(p => {
                  if (too.result === p) {
                    too.active = true;
                  }
                });
              }
            });
          }
          if (params.sol) {
            this.tas.solutionVisible = false;

            this.tas.solutionGoals.forEach(sol => {
              if (typeof params.sol === 'string') {
                if (sol.result === params.sol) {
                  sol.active = true;
                }
              } else {
                params.sol.forEach(p => {
                  if (sol.result === p) {
                    sol.active = true;
                  }
                });
              }
            });
          }

          if (params.ha) {
            this.tas.regiHazardVisible = false;

            this.tas.hazardss.forEach(ha => {
              if (typeof params.ha === 'string') {
                if (ha.result === params.ha) {
                  ha.active = true;
                }
              } else {
                params.ha.forEach(p => {
                  if (ha.result === p) {
                    ha.active = true;
                  }
                });
              }
            });
          }
          /*
        


          if (params.ready) {
            this.tas.regiHazardVisible = false;

            if (params.ready === 'r01') {
              this.tas.hazardss.r01 = true;
              this.tas.hazardss.r02 = false;
              this.tas.hazardss.r03 = false;
              this.tas.hazardss.r04 = false;
              this.tas.hazardss.r05 = false;
            } else if (params.ready === 'r02') {
              this.tas.hazardss.r01 = false;
              this.tas.hazardss.r02 = true;
              this.tas.hazardss.r03 = false;
              this.tas.hazardss.r04 = false;
              this.tas.hazardss.r05 = false;
            } else if (params.ready === 'r03') {
              this.tas.hazardss.r01 = false;
              this.tas.hazardss.r02 = false;
              this.tas.hazardss.r03 = true;
              this.tas.hazardss.r04 = false;
              this.tas.hazardss.r05 = false;
            } else if (params.ready === 'r04') {
              this.tas.hazardss.r01 = false;
              this.tas.hazardss.r02 = false;
              this.tas.hazardss.r03 = false;
              this.tas.hazardss.r04 = true;
              this.tas.hazardss.r05 = false;
            }else if (params.ready === 'r05') {
              this.tas.hazardss.r01 = false;
              this.tas.hazardss.r02 = false;
              this.tas.hazardss.r03 = false;
              this.tas.hazardss.r04 = false;
              this.tas.hazardss.r05 = true;
            }
          }
          */

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
            map.setMaxZoom(14);
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
                          color: 'red'
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
                          color: 'red'
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
                        color: 'red'
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
  
    let csv = 'SOLUTION_NAME,PILOT_NAME,REGION_NAME,REGION_HAZARD_LEVEL,DESCRIPTION,GEOGRAPHIC_EXTENT,SOLUTION_TYPE,SOLUTION_GOALS,ECOSYSTEM_SERVICE,DATA_CATEGORIES,TOOLS_PLATFORMS,DATA,TOO_Web map application,TOO_Geoportal,TOO_Story map,TOO_Map viewer,TOO_Web portal,TOO_Software,TOO_Decision support tool,TOO_Hydrological design tool,TOO_Machine Learning/IoT/Extended Reality (XR),TOO_Software (fire modelling),TOO_Data analysis tools,TOO_Master plan/ Action plan,TOO_Support program,TOO_Website (video),TOO_Project website,TOO_Data portal,TOO_Sensor network\n';
  
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
  
      //Mapping and Visualization Tools
      if (c.tools_platforms[0].includes('Web map application')) {
        csv += '1,';
      } else {
        csv += '0,';
      }
      if (c.tools_platforms[0].includes('Geoportal')) {
        csv += '1,';
      } else {
        csv += '0,';
      }
      if (c.tools_platforms[0].includes('Story map')) {
        csv += '1,';
      } else {
        csv += '0,';
      }
      if (c.tools_platforms[0].includes('Map viewer')) {
        csv += '1,';
      } else {
        csv += '0,';
      }
      if (c.tools_platforms[0].includes('Web portal')) {
        csv += '1,';
      } else {
        csv += '0,';
      }
      //Software and Modeling Tools
      if (c.tools_platforms[1].includes('Software')) {
        csv += '1,';
      } else {
        csv += '0,';
      }
      if (c.tools_platforms[1].includes('Decision support tool')) {
        csv += '1,';
      } else {
        csv += '0,';
      }
      if (c.tools_platforms[1].includes('Hydrological design tool')) {
        csv += '1,';
      } else {
        csv += '0,';
      }
      if (c.tools_platforms[1].includes('Machine Learning/IoT/Extended Reality (XR)')) {
        csv += '1,';
      } else {
        csv += '0,';
      }
      if (c.tools_platforms[1].includes('Software (fire modelling)')) {
        csv += '1,';
      } else {
        csv += '0,';
      }
      if (c.tools_platforms[1].includes('Data analysis tools')) {
        csv += '1,';
      } else {
        csv += '0,';
      }
      //Planning and Management Documents
      if (c.tools_platforms[2].includes('Master plan/ Action plan')) {
        csv += '1,';
      } else {
        csv += '0,';
      }
      if (c.tools_platforms[2].includes('Support program')) {
        csv += '1,';
      } else {
        csv += '0,';
      }
      //Data Management Platforms
      if (c.tools_platforms[3].includes('Website (video)')) {
        csv += '1,';
      } else {
        csv += '0,';
      }
      if (c.tools_platforms[3].includes('Project website')) {
        csv += '1,';
      } else {
        csv += '0,';
      }
      if (c.tools_platforms[3].includes('Data portal')) {
        csv += '1,';
      } else {
        csv += '0,';
      }
      if (c.tools_platforms[3].includes('Sensor network')) {
        csv += '1,';
      } else {
        csv += '0,';
      }

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
