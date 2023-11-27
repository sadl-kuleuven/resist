import { Injectable } from '@angular/core';
// import cases from '../../assets/cases.json';
import { OptionsService } from './options.service';
import { NutsService } from './nuts.service';
import { icon, marker, geoJSON } from 'leaflet';
import { NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CasesService {

  public allCases: any = null;
  public filteredCases: any;
  public allFilteredCases: any;
  public filteredCasesMapJSON = '';
  public activeGeometries = null;

  private textFilter = '';
  private geoExtentFilter = [];
  private scopeFilter = null;
  private regiHazardFilter = null;
  private dataCategoryFilter = [];
  private ogcTrendFilter = [];
  private toolsPlatformsFilter = [];
  private natureSolutionFilter = [];

  public selectedCase = null;

  public pagination = 1;

  public lastBounds = null;

  private isFilteredCasesChanged = false;
  public filteredCasesChange: Subject<boolean> = new Subject<boolean>();

  public resultCases = {
    solutiontype: {
      naturebased: 0,
      grey: 0,
      technological: 0,
      nontechnological: 0
    },
    
    solutionGoal: {
      t01: 0,
      t02: 0,
      t03: 0,
      t04: 0,
      t05: 0,
      t06: 0,
      t07: 0,
      t08: 0,
      t09: 0,
      t10: 0
    },
    trendWatch: {
      w01: 0,
      w02: 0,
      w03: 0,
      w04: 0,
      w05: 0,
      w06: 0,
      w07: 0,
      w08: 0
    },
    emerging: {
      e01: 0,
      e02: 0,
      e03: 0,
      e04: 0,
      e05: 0
    },
    /*
    publicValue: {
      p01: 0,
      p02: 0,
      p03: 0,
      p04: 0,
      p05: 0,
      p06: 0,
      p07: 0,
      p08: 0,
      p09: 0,
      p10: 0,
      p11: 0,
      p12: 0,
      p13: 0,
      p14: 0,
      p15: 0,
      p16: 0,
      p17: 0,
      p18: 0
    },
    */

    hazardss: {
      r01: 0,
      r02: 0,
      r03: 0,
      r04: 0
    },
    
    tools: {
      tp01: 0,
      tp02: 0,
      tp03: 0,
      tp04: 0,
      tp05: 0,
      tp06: 0,
      tp07: 0,
      tp08: 0,
      tp09: 0
    }, 

    solution: {
      s01: 0,
      s02: 0,
      s03: 0,
      s04: 0,
      s05: 0,
      s06: 0,
      s07: 0,
      s08: 0,
      s09: 0
    },

  };


  constructor(public tas: OptionsService, public ns: NutsService, private zone: NgZone, private http: HttpClient) {

    this.getJSON().subscribe(data => {
      this.allCases = data;
      this.filteredCases = data;

      this.calculateResults();

      this.filteredCases.forEach(c => {
        c.features = [];
        let feat = null;
        c.geographic_extent.forEach(ge => {
          switch (ge.length) {
            case 1: // NUTS 0
              feat = this.ns.getFeatureByNUTSID(ge[0]);
              c.feature = feat;
              if (feat) {
                c.features.push(feat);
              }
              break;
            case 2: // NUTS 1
              feat = this.ns.getFeatureByNUTSID(ge[1]);
              c.feature = feat;
              if (feat) {
                c.features.push(feat);
              }
              break;
            case 3: // NUTS 2
              feat = this.ns.getFeatureByNUTSID(ge[2]);
              c.feature = feat;
              if (feat) {
                c.features.push(feat);
              }
              break;
            case 4: // NUTS 3
              feat = this.ns.getFeatureByNUTSID(ge[3]);
              c.feature = feat;
              if (feat) {
                c.features.push(feat);
              }
              break;
            case 5: // LAU
              feat = this.ns.getFeatureByNUTSID(ge[3]);  // LAU - no geometries in LAU
              c.feature = feat;
              if (feat) {
                c.features.push(feat);
              }
              break;
          }
        });
      });

      this.applyFilters();

      this.addMarkersCollection();


    });
  }

  public getJSON(): Observable<any> {
    return this.http.get(environment.cases_json_url);
  }

  applyAllFilters() {
    this.filterByText();
    this.filterByGeoExtent();
    this.filterBySolutionType();
    this.filterByDataCategory();
    this.filterByEcosystemService();
    this.filterByRegionHazard();
    this.filterByToolsPlatforms();
    this.filterByNatureSolution();
    this.filterByMapExtent(this.lastBounds);
  }

  filterByText(txt = null) {
    this.textFilter = txt;
    if (this.textFilter == null) {
      this.textFilter = this.tas.textFilter;
    }
    this.applyFilters();
  }

  filterByGeoExtent() {
    this.geoExtentFilter = [];
    this.ns.nuts0Active.forEach(a => {
      this.geoExtentFilter.push(a.NUTS_ID);
    });
    this.ns.nuts1Active.forEach(a => {
      this.geoExtentFilter.push(a.NUTS_ID);
    });
    this.ns.nuts2Active.forEach(a => {
      this.geoExtentFilter.push(a.NUTS_ID);
    });
    this.ns.nuts3Active.forEach(a => {
      this.geoExtentFilter.push(a.NUTS_ID);
    });
    this.applyFilters();
  }

  filterBySolutionType(sc = null) {
    if (sc == null) {
      if (this.tas.solutiontype.naturebased) {
        this.scopeFilter = 'naturebased';
      } else if (this.tas.solutiontype.grey) {
        this.scopeFilter = 'grey';
      } else if (this.tas.solutiontype.technological) {
        this.scopeFilter = 'technological';
      } else if (this.tas.solutiontype.nontechnological) {
        this.scopeFilter = 'nontechnological';
      }
    } else {
      if (sc === 'naturebased') {
        this.tas.solutiontype.naturebased = true;
        this.tas.solutiontype.grey = false;
        this.tas.solutiontype.technological = false;
        this.tas.solutiontype.nontechnological = false;
      } else if (sc === 'grey') {
        this.tas.solutiontype.naturebased = false;
        this.tas.solutiontype.grey = true;
        this.tas.solutiontype.technological = false;
        this.tas.solutiontype.nontechnological = false;
      } else if (sc === 'technological') {
        this.tas.solutiontype.naturebased = false;
        this.tas.solutiontype.grey = false;
        this.tas.solutiontype.technological = true;
        this.tas.solutiontype.nontechnological = false;
      } else if (sc === 'nontechnological') {
        this.tas.solutiontype.naturebased = false;
        this.tas.solutiontype.grey = false;
        this.tas.solutiontype.technological = false;
        this.tas.solutiontype.nontechnological = true;
      } else {
        this.tas.solutiontype.naturebased = false;
        this.tas.solutiontype.grey = false;
        this.tas.solutiontype.technological = false;
        this.tas.solutiontype.nontechnological = false;
      }
      this.scopeFilter = sc;
    }
    this.applyFilters();
  }
  


  filterByDataCategory() {
    this.dataCategoryFilter = [];
    this.tas.dataCategories.forEach(a => {
      if (a.active) {
        this.dataCategoryFilter.push(a.name);
      }
    });
    this.applyFilters();
  }

  filterByEcosystemService() {
    this.ogcTrendFilter = [];
    this.tas.ecosystemServices.forEach(a => {
      if (a.active) {
        this.ogcTrendFilter.push(a.name);
      }
    });

    this.applyFilters();
  }
/*
  filterBysolutionGoal() {
    this.solutionGoalFilter = [];
    this.tas.solutionGoals.forEach(a => {
      if (a.active) {
        this.solutionGoalFilter.push(a.number);
      }
    });
    this.applyFilters();
  }
*/
  filterByRegionHazard(tr = null) {
    if (tr == null) {
      if (this.tas.hazardss.r01) {
        this.regiHazardFilter = 1;
      } else if (this.tas.hazardss.r02) {
        this.regiHazardFilter = 2;
      } else if (this.tas.hazardss.r03) {
        this.regiHazardFilter = 3;
      } else if (this.tas.hazardss.r04) {
        this.regiHazardFilter = 4;
      }
    } else {
      if (tr === 1) {
        this.tas.hazardss.r01 = true;
        this.tas.hazardss.r02 = false;
        this.tas.hazardss.r03 = false;
        this.tas.hazardss.r04 = false;
      } else if (tr === 2) {
        this.tas.hazardss.r01 = false;
        this.tas.hazardss.r02 = true;
        this.tas.hazardss.r03 = false;
        this.tas.hazardss.r04 = false;
      } else if (tr === 3) {
        this.tas.hazardss.r01 = false;
        this.tas.hazardss.r02 = false;
        this.tas.hazardss.r03 = true;
        this.tas.hazardss.r04 = false;
      } else if (tr === 4) {
        this.tas.hazardss.r01 = false;
        this.tas.hazardss.r02 = false;
        this.tas.hazardss.r03 = false;
        this.tas.hazardss.r04 = true;
      } else {
        this.tas.hazardss.r01 = false;
        this.tas.hazardss.r02 = false;
        this.tas.hazardss.r03 = false;
        this.tas.hazardss.r04 = false;
      }

      this.regiHazardFilter = tr;
    }
    this.applyFilters();
  }
/*
  filterByPublicValue() {
    this.publicValueFilter = [];
    this.tas.publicValue.forEach(a => {
      if (a.active) {
        this.publicValueFilter.push(a.name);
      }
    });
    this.applyFilters();
  }
*/
  filterByToolsPlatforms() {
    this.toolsPlatformsFilter= [];
    this.tas.toolsPlatforms.forEach(a => {
      if (a.active) {
        this.toolsPlatformsFilter.push(a.name);
      }
    });
    this.applyFilters();
  }

  filterByNatureSolution() {
    this.natureSolutionFilter= [];
    this.tas.natureSolution.forEach(a => {
      if (a.active) {
        this.natureSolutionFilter.push(a.name);
      }
    });
    this.applyFilters();
  }


  applyFilters() {
    this.pagination = 1;
    this.selectedCase = null;

    if (this.allCases) {
      this.filteredCases = this.allCases;

      // console.log('Filtering by text: ' + this.textFilter);
      if (this.textFilter) {
        // tslint:disable-next-line:max-line-length
        this.filteredCases = this.filteredCases.filter(c => c.solution_name.toLowerCase().includes(this.textFilter.toLowerCase()) || c.description.toLowerCase().includes(this.textFilter.toLowerCase()));
      }

      // console.log('Filtering by geoExtentFilter: ' + this.geoExtentFilter);
      if (this.geoExtentFilter.length > 0) {
        const filterGeo = [];
        this.filteredCases.forEach(fc => {
          fc.geographic_extent.forEach(em => {
            em.forEach(dimension => {
              this.geoExtentFilter.forEach(f => {
                if (dimension === f) {
                  if (!filterGeo.includes(fc)) {
                    filterGeo.push(fc);
                  }
                }
              });
            });
          });
        });
        this.filteredCases = filterGeo;

      }

      // console.log('Filtering by theme area: ' + this.solutionGoalFilter);
/*
      if (this.solutionGoalFilter.length > 0) {
        const filterGoals = [];
        this.filteredCases.forEach(fc => {
          fc.solution_goal.forEach(ta => {
            this.solutionGoalFilter.forEach(t => {
              if (Math.floor(ta) === t) {
                if (!filterGoals.includes(fc)) {
                  filterGoals.push(fc);
                }
              }
            });
          });
        });
        this.filteredCases = filterGoals;
      }
*/
      // console.log('Filtering by emerging tech: ' + this.dataCategoryFilter);

      if (this.dataCategoryFilter.length > 0) {
        const filterEmerging = [];
        this.filteredCases.forEach(fc => {
          fc.data_categories.forEach(em => {
            this.dataCategoryFilter.forEach(f => {
              if (em === f) {
                if (!filterEmerging.includes(fc)) {
                  filterEmerging.push(fc);
                }
              }
            });
          });
        });
        this.filteredCases = filterEmerging;
      }
            // console.log('Filtering by nature solution: ' + this.natureSolutionFilter);
            if (this.toolsPlatformsFilter.length > 0) {
              const filterTools = [];
              this.filteredCases.forEach(fc => {
                fc.tools_platforms.forEach(em => {
                  this.toolsPlatformsFilter.forEach(f => {
                    if (em === f) {
                      if (!filterTools.includes(fc)) {
                        filterTools.push(fc);
                      }
                    }
                  });
                });
              });
              this.filteredCases = filterTools;
            }


            if (this.natureSolutionFilter.length > 0) {
              const filterSolution = [];
              this.filteredCases.forEach(fc => {
                fc.solution_goals.forEach(em => {
                  this.natureSolutionFilter.forEach(f => {
                    if (em === f) {
                      if (!filterSolution.includes(fc)) {
                        filterSolution.push(fc);
                      }
                    }
                  });
                });
              });
              this.filteredCases = filterSolution;
            }

      // console.log('Filtering by OGC: ' + this.ogcTrendFilter);

      if (this.ogcTrendFilter.length > 0) {
        const filterOGC = [];
        this.filteredCases.forEach(fc => {
          fc.ecosystem_service.forEach(em => {
            this.ogcTrendFilter.forEach(f => {
              if (em === f) {
                if (!filterOGC.includes(fc)) {
                  filterOGC.push(fc);
                }
              }
            });
          });
        });

        this.filteredCases = filterOGC;
      }

      // console.log('Filtering by public Value: ' + this.publicValueFilter);
      /*
      if (this.publicValueFilter.length > 0) {
        const filterPV = [];
        this.filteredCases.forEach(fc => {
          fc.public_value[0].forEach(pv0 => {
            this.publicValueFilter.forEach(f => {
              if (pv0 === f) {
                if (!filterPV.includes(fc)) {
                  filterPV.push(fc);
                }
              }
            });
          });
          fc.public_value[1].forEach(pv1 => {
            this.publicValueFilter.forEach(f => {
              if (pv1 === f) {
                if (!filterPV.includes(fc)) {
                  filterPV.push(fc);
                }
              }
            });
          });
          fc.public_value[2].forEach(pv2 => {
            this.publicValueFilter.forEach(f => {
              if (pv2 === f) {
                if (!filterPV.includes(fc)) {
                  filterPV.push(fc);
                }
              }
            });
          });
        });
        this.filteredCases = filterPV;
      }
      */

      // console.log("filters")

      // console.log('Filtering by technology hazardss: ' + this.regiHazardFilter);
      if (this.regiHazardFilter) {
        this.filteredCases = this.filteredCases.filter(c => c.region_hazard_level === this.regiHazardFilter);
      }

      // console.log('Filtering by solutiontype: ' + this.scopeFilter);
      if (this.scopeFilter && this.scopeFilter != 'all') {
        this.filteredCases = this.filteredCases.filter(c => c.solution_type === this.scopeFilter);
      }

      this.allFilteredCases = this.filteredCases;

      this.addMarkersCollection();
      this.calculateResults();

      // this.filteredCasesChange.next(!this.isFilteredCasesChanged);
    }

  }

  

  applyFiltersText(toFilter) {
    if (this.textFilter) {
      // tslint:disable-next-line:max-line-length
      toFilter = toFilter.filter(c => c.solution_name.toLowerCase().includes(this.textFilter.toLowerCase()) || c.description.toLowerCase().includes(this.textFilter.toLowerCase()));
    }
    return toFilter;
  }

  applyFiltersGeo(toFilter) {
    if (this.geoExtentFilter.length > 0) {
      const filterGeo = [];
      toFilter.forEach(fc => {
        fc.geographic_extent.forEach(em => {
          em.forEach(dimension => {
            this.geoExtentFilter.forEach(f => {
              if (dimension === f) {
                if (!filterGeo.includes(fc)) {
                  filterGeo.push(fc);
                }
              }
            });
          });
        });
      });
      return filterGeo;
    } else {
      return toFilter;
    }
  }
/*
  applyFilterssolutionGoal(toFilter) {
    if (this.solutionGoalFilter.length > 0) {
      const filterGoals = [];
      toFilter.forEach(fc => {
        fc.solution_goal.forEach(ta => {
          this.solutionGoalFilter.forEach(t => {
            if (Math.floor(ta) === t) {
              if (!filterGoals.includes(fc)) {
                filterGoals.push(fc);
              }
            }
          });
        });
      });
      return filterGoals;
    } else {
      return toFilter;
    }
  }
*/
  applyFiltersEmergingTech(toFilter) {
    if (this.dataCategoryFilter.length > 0) {
      const filterEmerging = [];
      toFilter.forEach(fc => {
        fc.data_categories.forEach(em => {
          this.dataCategoryFilter.forEach(f => {
            if (em === f) {
              if (!filterEmerging.includes(fc)) {
                filterEmerging.push(fc);
              }
            }
          });
        });
      });
      return filterEmerging;
    } else {
      return toFilter;
    }
  }

  applyFiltersToolsPlatforms(toFilter) {
    if (this.toolsPlatformsFilter.length > 0) {
      const filterTools = [];
      toFilter.forEach(fc => {
        fc.tools_platforms.forEach(em => {
          this.toolsPlatformsFilter.forEach(f => {
            if (em === f) {
              if (!filterTools.includes(fc)) {
                filterTools.push(fc);
              }
            }
          });
        });
      });
      return filterTools;
    } else {
      return toFilter;
    }
  }

  applyFiltersNatureSolution(toFilter) {
    if (this.natureSolutionFilter.length > 0) {
      const filterSolution = [];
      toFilter.forEach(fc => {
        fc.solution_goals.forEach(em => {
          this.natureSolutionFilter.forEach(f => {
            if (em === f) {
              if (!filterSolution.includes(fc)) {
                filterSolution.push(fc);
              }
            }
          });
        });
      });
      return filterSolution;
    } else {
      return toFilter;
    }
  }

  applyFiltersOGC(toFilter) {
    if (this.ogcTrendFilter.length > 0) {
      const filterOGC = [];
      toFilter.forEach(fc => {
        fc.ecosystem_service.forEach(em => {
          this.ogcTrendFilter.forEach(f => {
            if (em === f) {
              if (!filterOGC.includes(fc)) {
                filterOGC.push(fc);
              }
            }
          });
        });
      });
      return filterOGC;
    } else {
      return toFilter;
    }
  }
/*
  applyFiltersPublicValue(toFilter) {
    if (this.publicValueFilter.length > 0) {
      const filterPV = [];
      toFilter.forEach(fc => {
        fc.public_value[0].forEach(pv0 => {
          this.publicValueFilter.forEach(f => {
            if (pv0 === f) {
              if (!filterPV.includes(fc)) {
                filterPV.push(fc);
              }
            }
          });
        });
        fc.public_value[1].forEach(pv1 => {
          this.publicValueFilter.forEach(f => {
            if (pv1 === f) {
              if (!filterPV.includes(fc)) {
                filterPV.push(fc);
              }
            }
          });
        });
        fc.public_value[2].forEach(pv2 => {
          this.publicValueFilter.forEach(f => {
            if (pv2 === f) {
              if (!filterPV.includes(fc)) {
                filterPV.push(fc);
              }
            }
          });
        });
      });
      return filterPV;
    } else {
      return toFilter;
    }
  }
*/
  applyFiltersTechReady(toFilter) {
    if (this.regiHazardFilter && this.regiHazardFilter != 0) {
      toFilter = toFilter.filter(c => c.region_hazard_level === this.regiHazardFilter);
    }
    return toFilter;
  }

  applyFiltersScope(toFilter) {
    if (this.scopeFilter && this.scopeFilter != 'all') {
      toFilter = toFilter.filter(c => c.solution_type === this.scopeFilter);
    }
    return toFilter;
  }

  addMarkersCollection() {
    this.ns.updateNUTSActive();

    this.filteredCasesMapJSON = '{"type": "FeatureCollection","features": [';
    let i = 0;
    if (this.filteredCases) {
      this.filteredCases.forEach((c, indexFC) => {
        if (c.features && c.features.length > 0) {
          c.features.forEach(feat => {

            if (this.geoExtentFilter.length > 0) {
              this.geoExtentFilter.forEach(geoFilter => {
                if (feat && feat.id.includes(geoFilter)) {
                  c.featureIndex = i++;

                  if (this.selectedCase && c.solution_name === this.selectedCase.solution_name) {
                    this.filteredCasesMapJSON += '{"properties": {"solution_name": "' + c.solution_name + '", "index": "' + indexFC + '", "color": "green","description": "' + c.description.slice(0, 100) + '[...]"},"type": "Feature","geometry": {"type": "Point","coordinates": [' + feat.geometry.coordinates[0] + ', ' + feat.geometry.coordinates[1] + ']}},';
                  } else {
                    this.filteredCasesMapJSON += '{"properties": {"solution_name": "' + c.solution_name + '", "index": "' + indexFC + '", "color": "blue","description": "' + c.description.slice(0, 100) + '[...]"},"type": "Feature","geometry": {"type": "Point","coordinates": [' + feat.geometry.coordinates[0] + ', ' + feat.geometry.coordinates[1] + ']}},';
                  }
                }
              });
            } else {
              if (feat) {
                c.featureIndex = i++;

                if (this.selectedCase && c.solution_name === this.selectedCase.solution_name) {
                  this.filteredCasesMapJSON += '{"properties": {"solution_name": "' + c.solution_name + '", "index": "' + indexFC + '", "color": "green","description": "' + c.description.slice(0, 100) + '[...]"},"type": "Feature","geometry": {"type": "Point","coordinates": [' + feat.geometry.coordinates[0] + ', ' + feat.geometry.coordinates[1] + ']}},';
                } else {
                  this.filteredCasesMapJSON += '{"properties": {"solution_name": "' + c.solution_name + '", "index": "' + indexFC + '", "color": "blue","description": "' + c.description.slice(0, 100) + '[...]"},"type": "Feature","geometry": {"type": "Point","coordinates": [' + feat.geometry.coordinates[0] + ', ' + feat.geometry.coordinates[1] + ']}},';

                }
              }
            }
          });
        }
      });
    }

    this.filteredCasesMapJSON += ']';
    this.filteredCasesMapJSON = this.filteredCasesMapJSON.replace(']}},]', ']}}]}');

    this.filteredCasesChange.next(!this.isFilteredCasesChanged);

  }

  calculateResults() {

    if (this.allCases) {

      this.resultCases.solutiontype = {
        naturebased : 0,
        grey: 0,
        technological: 0,
        nontechnological: 0
      };
      
      this.resultCases.solutionGoal = {
        t01: 0,
        t02: 0,
        t03: 0,
        t04: 0,
        t05: 0,
        t06: 0,
        t07: 0,
        t08: 0,
        t09: 0,
        t10: 0
      };
      this.resultCases.trendWatch = {
        w01: 0,
        w02: 0,
        w03: 0,
        w04: 0,
        w05: 0,
        w06: 0,
        w07: 0,
        w08: 0
      };
      this.resultCases.emerging = {
        e01: 0,
        e02: 0,
        e03: 0,
        e04: 0,
        e05: 0
      };

      this.resultCases.hazardss = {
        r01: 0,
        r02: 0,
        r03: 0,
        r04: 0
      };

      this.resultCases.tools= {
        tp01: 0,
        tp02: 0,
        tp03: 0,
        tp04: 0,
        tp05: 0,
        tp06: 0,
        tp07: 0,
        tp08: 0,
        tp09: 0
      }, 

      this.resultCases.solution = {
        s01: 0,
        s02: 0,
        s03: 0,
        s04: 0,
        s05: 0,
        s06: 0,
        s07: 0,
        s08: 0,
        s09: 0
      };


      let casesScope = this.allCases;

      casesScope = this.applyFiltersText(casesScope);
      casesScope = this.applyFiltersGeo(casesScope);
      casesScope = this.applyFiltersEmergingTech(casesScope);
      casesScope = this.applyFiltersOGC(casesScope);
      casesScope = this.applyFiltersTechReady(casesScope);
      casesScope = this.applyFiltersToolsPlatforms(casesScope);
      casesScope = this.applyFiltersNatureSolution(casesScope);

      casesScope.forEach(c => {
        if (c.solution_type) {
          if (c.solution_type === 'naturebased') {
            this.resultCases.solutiontype.naturebased++;
          } else if (c.solution_type === 'grey') {
            this.resultCases.solutiontype.grey++;
          } else if (c.solution_type === 'technological') {
            this.resultCases.solutiontype.technological++;
          } else if (c.solution_type === 'nontechnological') {
            this.resultCases.solutiontype.nontechnological++;
          }
        }
      });

      let casesTrend = this.allCases;

      casesTrend = this.applyFiltersText(casesTrend);
      casesTrend = this.applyFiltersGeo(casesTrend);
      casesTrend = this.applyFiltersTechReady(casesTrend);
      casesTrend = this.applyFiltersEmergingTech(casesTrend);
      casesTrend = this.applyFiltersScope(casesTrend);
      casesTrend = this. applyFiltersToolsPlatforms(casesTrend);
      casesTrend = this.applyFiltersNatureSolution(casesTrend);

      casesTrend.forEach(c => {
        if (c.ecosystem_service.includes('Water Retention')) {
          this.resultCases.trendWatch.w01++;
        }
        if (c.ecosystem_service.includes('Biodiversity Conservation')) {
          this.resultCases.trendWatch.w02++;
        }
        if (c.ecosystem_service.includes('Pollution Control')) {
          this.resultCases.trendWatch.w03++;
        }
        if (c.ecosystem_service.includes('Flood Control')) {
          this.resultCases.trendWatch.w04++;
        }
        if (c.ecosystem_service.includes('Sustainable Forestry')) {
          this.resultCases.trendWatch.w05++;
        }
      });

      let casesData = this.allCases;

      casesData = this.applyFiltersText(casesData);
      casesData = this.applyFiltersGeo(casesData);
      casesData = this.applyFiltersOGC(casesData);
      casesData = this.applyFiltersTechReady(casesData);
      casesData = this.applyFiltersScope(casesData);
      casesData = this.applyFiltersToolsPlatforms(casesData);
      casesData = this.applyFiltersNatureSolution(casesData);

      casesData.forEach(c => {
        if (c.data_categories.includes('Geospatial Data')) {
          this.resultCases.emerging.e01++;
        }
        if (c.data_categories.includes('Hydrological Data')) {
          this.resultCases.emerging.e02++;
        }
        if (c.data_categories.includes('Meteorological Data')) {
          this.resultCases.emerging.e03++;
        }
        if (c.data_categories.includes('Statistical and Population Data')) {
          this.resultCases.emerging.e04++;
        }
        if (c.data_categories.includes('Land Use Data')) {
          this.resultCases.emerging.e05++;
        }
      });

      let casesRegionHazard = this.allCases;

      casesRegionHazard = this.applyFiltersText(casesRegionHazard);
      casesRegionHazard = this.applyFiltersGeo(casesRegionHazard);
      casesRegionHazard = this.applyFiltersEmergingTech(casesRegionHazard);
      casesRegionHazard = this.applyFiltersOGC(casesRegionHazard);
      casesRegionHazard = this.applyFiltersScope(casesRegionHazard);
      casesRegionHazard = this.applyFiltersToolsPlatforms(casesRegionHazard);
      casesRegionHazard = this.applyFiltersNatureSolution(casesRegionHazard);

      casesRegionHazard.forEach(c => {
        if (c.region_hazard_level === 1) {
          this.resultCases.hazardss.r01++;
        } else if (c.region_hazard_level === 2) {
          this.resultCases.hazardss.r02++;
        } else if (c.region_hazard_level === 3) {
          this.resultCases.hazardss.r03++;
        } else if (c.region_hazard_level === 4) {
          this.resultCases.hazardss.r04++;
        }
      });

      let casesToolsPlatforms = this.allCases;

      casesToolsPlatforms = this.applyFiltersText(casesToolsPlatforms);
      casesToolsPlatforms = this.applyFiltersGeo(casesToolsPlatforms);
      casesToolsPlatforms = this.applyFiltersEmergingTech(casesToolsPlatforms);
      casesToolsPlatforms = this.applyFiltersOGC(casesToolsPlatforms);
      casesToolsPlatforms = this.applyFiltersTechReady(casesToolsPlatforms);
      casesToolsPlatforms = this.applyFiltersScope(casesToolsPlatforms);
      casesToolsPlatforms = this.applyFiltersNatureSolution(casesToolsPlatforms);

      casesToolsPlatforms.forEach(c => {
        if (c.tools_platforms.includes('Web Application')) {
          this.resultCases.tools.tp01++;
        }
        if (c.tools_platforms.includes('Data Portal')) {
          this.resultCases.tools.tp02++;
        }
        if (c.tools_platforms.includes('Mapping and Visualization Tools')) {
          this.resultCases.tools.tp03++;
        }
        if (c.tools_platforms.includes('Modeling Tools')) {
          this.resultCases.tools.tp04++;
        }
        if (c.tools_platforms.includes('Other Tools')) {
          this.resultCases.tools.tp05++;
        }
      });

      let casesNatureSolution = this.allCases;

      casesNatureSolution = this.applyFiltersText(casesNatureSolution);
      casesNatureSolution = this.applyFiltersGeo(casesNatureSolution);
      casesNatureSolution = this.applyFiltersEmergingTech(casesNatureSolution);
      casesNatureSolution = this.applyFiltersOGC(casesNatureSolution);
      casesNatureSolution = this.applyFiltersTechReady(casesNatureSolution);
      casesNatureSolution = this.applyFiltersScope(casesNatureSolution);
      casesNatureSolution = this.applyFiltersToolsPlatforms(casesNatureSolution);
    

      casesNatureSolution.forEach(c => {
        if (c.solution_goals.includes('Flood Prevention')) {
          this.resultCases.solution.s01++;
        }
        if (c.solution_goals.includes('Nature Conservation')) {
          this.resultCases.solution.s02++;
        }
        if (c.solution_goals.includes('Pollution Reduction')) {
          this.resultCases.solution.s03++;
        }
        if (c.solution_goals.includes('Hydrological Balance')) {
          this.resultCases.solution.s04++;
        }
        if (c.solution_goals.includes('Advocacy and Awareness')) {
          this.resultCases.solution.s05++;
        }
        if (c.solution_goals.includes('Economic Protection')) {
          this.resultCases.solution.s06++;
        }
        if (c.solution_goals.includes('Community Engagement')) {
          this.resultCases.solution.s07++;
        }
        if (c.solution_goals.includes('Sustainable Land Use')) {
          this.resultCases.solution.s08++;
        }
        if (c.solution_goals.includes('Biomass Management')) {
          this.resultCases.solution.s09++;
        }
      });
    }
  }

  clearFilters() {
    this.filteredCases = this.allCases;
    this.tas.dataCategories.forEach(a => {
      a.active = false;
    });
    this.tas.ecosystemServices.forEach(a => {
      a.active = false;
    });

    this.tas.toolsPlatforms.forEach(a => {
      a.active = false;
    });
    this.tas.natureSolution.forEach(a => {
      a.active = false;
    });

    this.ns.nuts0Active = [];
    this.ns.nuts1Active = [];
    this.ns.nuts2Active = [];
    this.ns.nuts3Active = [];

    this.textFilter = '';
    this.geoExtentFilter = [];
    this.scopeFilter = null;
    this.regiHazardFilter = null;
    this.dataCategoryFilter = [];
    this.ogcTrendFilter = [];
    this.toolsPlatformsFilter = [];
    this.natureSolutionFilter = [];


    this.applyFilters();
    this.calculateResults();

    this.addMarkersCollection();

    

  }

  filterByMapExtent(bounds) {
    if (bounds) {
      this.lastBounds = bounds;
      this.filteredCases = this.allFilteredCases;
      const filtered = [];

      this.filteredCases.forEach(c => {
        c.features.forEach(f => {
          if (bounds.contains([f.geometry.coordinates[1], f.geometry.coordinates[0]])) {
            if (!filtered.includes(c)) {
              filtered.push(c);
            }
          }
        });
      });

      this.filteredCases = [...filtered];

      this.calculateResults();
      this.addMarkersCollection();
    }
  }


}
