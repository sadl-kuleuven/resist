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
  private techReadyFilter = null;
  private emergingTechFilter = [];
  private ogcTrendFilter = [];
  private themeAreaFilter = [];
  private publicValueFilter = [];
  private toolsPlatformsFilter = [];
  private natureSolutionFilter = [];

  public selectedCase = null;

  public pagination = 1;

  public lastBounds = null;

  private isFilteredCasesChanged = false;
  public filteredCasesChange: Subject<boolean> = new Subject<boolean>();

  public resultCases = {
    scope: {
      local: 0,
      regional: 0
    },
    themeArea: {
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
      e05: 0,
      e06: 0,
      e07: 0,
      e08: 0,
      e09: 0
    },
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
    readiness: {
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
    this.filterByScope();
    this.filterByEmergingTech();
    this.filterByOGCTrend();
    this.filterByThemeArea();
    this.filterByTechReady();
    this.filterByPublicValue();
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

  filterByScope(sc = null) {
    if (sc == null) {
      if (this.tas.scope.local) {
        this.scopeFilter = 'local';
      } else if (this.tas.scope.regional) {
        this.scopeFilter = 'regional';
      }
    } else {
      if (sc === 'local') {
        this.tas.scope.local = true;
        this.tas.scope.regional = false;
      } else if (sc === 'regional') {
        this.tas.scope.local = false;
        this.tas.scope.regional = true;
      } else {
        this.tas.scope.local = false;
        this.tas.scope.regional = false;
      }
      this.scopeFilter = sc;
    }
    this.applyFilters();
  }

  filterByEmergingTech() {
    this.emergingTechFilter = [];
    this.tas.emergingTech.forEach(a => {
      if (a.active) {
        this.emergingTechFilter.push(a.name);
      }
    });
    this.applyFilters();
  }

  filterByOGCTrend() {
    this.ogcTrendFilter = [];
    this.tas.ogcAreas.forEach(a => {
      if (a.active) {
        this.ogcTrendFilter.push(a.name);
      }
    });

    this.applyFilters();
  }

  filterByThemeArea() {
    this.themeAreaFilter = [];
    this.tas.thematicAreas.forEach(a => {
      if (a.active) {
        this.themeAreaFilter.push(a.number);
      }
    });
    this.applyFilters();
  }

  filterByTechReady(tr = null) {
    if (tr == null) {
      if (this.tas.readiness.r01) {
        this.techReadyFilter = 1;
      } else if (this.tas.readiness.r02) {
        this.techReadyFilter = 2;
      } else if (this.tas.readiness.r03) {
        this.techReadyFilter = 3;
      } else if (this.tas.readiness.r04) {
        this.techReadyFilter = 4;
      }
    } else {
      if (tr === 1) {
        this.tas.readiness.r01 = true;
        this.tas.readiness.r02 = false;
        this.tas.readiness.r03 = false;
        this.tas.readiness.r04 = false;
      } else if (tr === 2) {
        this.tas.readiness.r01 = false;
        this.tas.readiness.r02 = true;
        this.tas.readiness.r03 = false;
        this.tas.readiness.r04 = false;
      } else if (tr === 3) {
        this.tas.readiness.r01 = false;
        this.tas.readiness.r02 = false;
        this.tas.readiness.r03 = true;
        this.tas.readiness.r04 = false;
      } else if (tr === 4) {
        this.tas.readiness.r01 = false;
        this.tas.readiness.r02 = false;
        this.tas.readiness.r03 = false;
        this.tas.readiness.r04 = true;
      } else {
        this.tas.readiness.r01 = false;
        this.tas.readiness.r02 = false;
        this.tas.readiness.r03 = false;
        this.tas.readiness.r04 = false;
      }

      this.techReadyFilter = tr;
    }
    this.applyFilters();
  }

  filterByPublicValue() {
    this.publicValueFilter = [];
    this.tas.publicValue.forEach(a => {
      if (a.active) {
        this.publicValueFilter.push(a.name);
      }
    });
    this.applyFilters();
  }

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
        this.filteredCases = this.filteredCases.filter(c => c.name.toLowerCase().includes(this.textFilter.toLowerCase()) || c.description.toLowerCase().includes(this.textFilter.toLowerCase()));
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

      // console.log('Filtering by theme area: ' + this.themeAreaFilter);

      if (this.themeAreaFilter.length > 0) {
        const filterTheme = [];
        this.filteredCases.forEach(fc => {
          fc.theme_area.forEach(ta => {
            this.themeAreaFilter.forEach(t => {
              if (Math.floor(ta) === t) {
                if (!filterTheme.includes(fc)) {
                  filterTheme.push(fc);
                }
              }
            });
          });
        });
        this.filteredCases = filterTheme;
      }

      // console.log('Filtering by emerging tech: ' + this.emergingTechFilter);

      if (this.emergingTechFilter.length > 0) {
        const filterEmerging = [];
        this.filteredCases.forEach(fc => {
          fc.emerging_tech.forEach(em => {
            this.emergingTechFilter.forEach(f => {
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
                fc.nature_solution.forEach(em => {
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
          fc.tech_trend.forEach(em => {
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

      // console.log("filters")

      // console.log('Filtering by technology readiness: ' + this.techReadyFilter);
      if (this.techReadyFilter) {
        this.filteredCases = this.filteredCases.filter(c => c.tech_readiness_level === this.techReadyFilter);
      }

      // console.log('Filtering by scope: ' + this.scopeFilter);
      if (this.scopeFilter && this.scopeFilter != 'all') {
        this.filteredCases = this.filteredCases.filter(c => c.scope === this.scopeFilter);
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
      toFilter = toFilter.filter(c => c.name.toLowerCase().includes(this.textFilter.toLowerCase()) || c.description.toLowerCase().includes(this.textFilter.toLowerCase()));
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

  applyFiltersThemeArea(toFilter) {
    if (this.themeAreaFilter.length > 0) {
      const filterTheme = [];
      toFilter.forEach(fc => {
        fc.theme_area.forEach(ta => {
          this.themeAreaFilter.forEach(t => {
            if (Math.floor(ta) === t) {
              if (!filterTheme.includes(fc)) {
                filterTheme.push(fc);
              }
            }
          });
        });
      });
      return filterTheme;
    } else {
      return toFilter;
    }
  }

  applyFiltersEmergingTech(toFilter) {
    if (this.emergingTechFilter.length > 0) {
      const filterEmerging = [];
      toFilter.forEach(fc => {
        fc.emerging_tech.forEach(em => {
          this.emergingTechFilter.forEach(f => {
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
        fc.nature_solution.forEach(em => {
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
        fc.tech_trend.forEach(em => {
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

  applyFiltersTechReady(toFilter) {
    if (this.techReadyFilter && this.techReadyFilter != 0) {
      toFilter = toFilter.filter(c => c.tech_readiness_level === this.techReadyFilter);
    }
    return toFilter;
  }

  applyFiltersScope(toFilter) {
    if (this.scopeFilter && this.scopeFilter != 'all') {
      toFilter = toFilter.filter(c => c.scope === this.scopeFilter);
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

                  if (this.selectedCase && c.name === this.selectedCase.name) {
                    this.filteredCasesMapJSON += '{"properties": {"name": "' + c.name + '", "index": "' + indexFC + '", "color": "green","description": "' + c.description.slice(0, 100) + '[...]"},"type": "Feature","geometry": {"type": "Point","coordinates": [' + feat.geometry.coordinates[0] + ', ' + feat.geometry.coordinates[1] + ']}},';
                  } else {
                    this.filteredCasesMapJSON += '{"properties": {"name": "' + c.name + '", "index": "' + indexFC + '", "color": "blue","description": "' + c.description.slice(0, 100) + '[...]"},"type": "Feature","geometry": {"type": "Point","coordinates": [' + feat.geometry.coordinates[0] + ', ' + feat.geometry.coordinates[1] + ']}},';
                  }
                }
              });
            } else {
              if (feat) {
                c.featureIndex = i++;

                if (this.selectedCase && c.name === this.selectedCase.name) {
                  this.filteredCasesMapJSON += '{"properties": {"name": "' + c.name + '", "index": "' + indexFC + '", "color": "green","description": "' + c.description.slice(0, 100) + '[...]"},"type": "Feature","geometry": {"type": "Point","coordinates": [' + feat.geometry.coordinates[0] + ', ' + feat.geometry.coordinates[1] + ']}},';
                } else {
                  this.filteredCasesMapJSON += '{"properties": {"name": "' + c.name + '", "index": "' + indexFC + '", "color": "blue","description": "' + c.description.slice(0, 100) + '[...]"},"type": "Feature","geometry": {"type": "Point","coordinates": [' + feat.geometry.coordinates[0] + ', ' + feat.geometry.coordinates[1] + ']}},';

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

      this.resultCases.scope = {
        local: 0,
        regional: 0
      };
      this.resultCases.themeArea = {
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
        e05: 0,
        e06: 0,
        e07: 0,
        e08: 0,
        e09: 0
      };
      this.resultCases.publicValue = {
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
      };
      this.resultCases.readiness = {
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
      casesScope = this.applyFiltersThemeArea(casesScope);
      casesScope = this.applyFiltersEmergingTech(casesScope);
      casesScope = this.applyFiltersOGC(casesScope);
      casesScope = this.applyFiltersPublicValue(casesScope);
      casesScope = this.applyFiltersTechReady(casesScope);
      casesScope = this.applyFiltersToolsPlatforms(casesScope);
      casesScope = this.applyFiltersNatureSolution(casesScope);

      casesScope.forEach(c => {
        if (c.scope && c.scope === 'local') {
          this.resultCases.scope.local++;
        } else if (c.scope && c.scope === 'regional') {
          this.resultCases.scope.regional++;
        }
      });

      let casesThemeArea = this.allCases;

      casesThemeArea = this.applyFiltersText(casesThemeArea);
      casesThemeArea = this.applyFiltersGeo(casesThemeArea);
      casesThemeArea = this.applyFiltersEmergingTech(casesThemeArea);
      casesThemeArea = this.applyFiltersOGC(casesThemeArea);
      casesThemeArea = this.applyFiltersPublicValue(casesThemeArea);
      casesThemeArea = this.applyFiltersTechReady(casesThemeArea);
      casesThemeArea = this.applyFiltersScope(casesThemeArea);
      casesThemeArea = this.applyFiltersToolsPlatforms(casesThemeArea);
      casesThemeArea = this.applyFiltersNatureSolution(casesThemeArea);

      let uniqueAreas = [];
      // subsections of thematic areas can be repeated
      casesThemeArea.forEach(c => {
        uniqueAreas = [];
        c.theme_area.forEach(ta => {
          if (!uniqueAreas.includes(Math.floor(ta))) {
            uniqueAreas.push(Math.floor(ta));
          }
        });

        uniqueAreas.forEach(ta => {
          switch (Math.floor(ta)) {
            case 1:
              this.resultCases.themeArea.t01++;
              break;
            case 2:
              this.resultCases.themeArea.t02++;
              break;
            case 3:
              this.resultCases.themeArea.t03++;
              break;
            case 4:
              this.resultCases.themeArea.t04++;
              break;
            case 5:
              this.resultCases.themeArea.t05++;
              break;
            case 6:
              this.resultCases.themeArea.t06++;
              break;
            case 7:
              this.resultCases.themeArea.t07++;
              break;
            case 8:
              this.resultCases.themeArea.t08++;
              break;
            case 9:
              this.resultCases.themeArea.t09++;
              break;
            case 10:
              this.resultCases.themeArea.t10++;
              break;
          }
        });
      });

      let casesTrend = this.allCases;

      casesTrend = this.applyFiltersText(casesTrend);
      casesTrend = this.applyFiltersGeo(casesTrend);
      casesTrend = this.applyFiltersPublicValue(casesTrend);
      casesTrend = this.applyFiltersTechReady(casesTrend);
      casesTrend = this.applyFiltersThemeArea(casesTrend);
      casesTrend = this.applyFiltersEmergingTech(casesTrend);
      casesTrend = this.applyFiltersScope(casesTrend);
      casesTrend = this. applyFiltersToolsPlatforms(casesTrend);
      casesTrend = this.applyFiltersNatureSolution(casesTrend);

      casesTrend.forEach(c => {
        if (c.tech_trend.includes('Location & Position')) {
          this.resultCases.trendWatch.w01++;
        }
        if (c.tech_trend.includes('Spatial-Temporal Models')) {
          this.resultCases.trendWatch.w02++;
        }
        if (c.tech_trend.includes('Data Science')) {
          this.resultCases.trendWatch.w03++;
        }
        if (c.tech_trend.includes('Human Interfaces')) {
          this.resultCases.trendWatch.w04++;
        }
        if (c.tech_trend.includes('Physical Geosciences')) {
          this.resultCases.trendWatch.w05++;
        }
        if (c.tech_trend.includes('Societal Geosciences')) {
          this.resultCases.trendWatch.w06++;
        }
        if (c.tech_trend.includes('Sensing and Observations')) {
          this.resultCases.trendWatch.w07++;
        }
        if (c.tech_trend.includes('Computer Engineering')) {
          this.resultCases.trendWatch.w08++;
        }
      });

      let casesEmerging = this.allCases;

      casesEmerging = this.applyFiltersText(casesEmerging);
      casesEmerging = this.applyFiltersGeo(casesEmerging);
      casesEmerging = this.applyFiltersThemeArea(casesEmerging);
      casesEmerging = this.applyFiltersOGC(casesEmerging);
      casesEmerging = this.applyFiltersPublicValue(casesEmerging);
      casesEmerging = this.applyFiltersTechReady(casesEmerging);
      casesEmerging = this.applyFiltersScope(casesEmerging);
      casesEmerging = this.applyFiltersToolsPlatforms(casesEmerging);
      casesEmerging = this.applyFiltersNatureSolution(casesEmerging);

      casesEmerging.forEach(c => {
        if (c.emerging_tech.includes('Artificial Intelligence and Machine Learning')) {
          this.resultCases.emerging.e01++;
        }
        if (c.emerging_tech.includes('Cloud Native Computing')) {
          this.resultCases.emerging.e02++;
        }
        if (c.emerging_tech.includes('Edge Computing')) {
          this.resultCases.emerging.e03++;
        }
        if (c.emerging_tech.includes('Blockchain')) {
          this.resultCases.emerging.e04++;
        }
        if (c.emerging_tech.includes('Immersive Visualisation(VR, MR, AR)')) {
          this.resultCases.emerging.e05++;
        }
        if (c.emerging_tech.includes('Connected Autonomous Vehicles')) {
          this.resultCases.emerging.e06++;
        }
        if (c.emerging_tech.includes('UxS / Drones')) {
          this.resultCases.emerging.e07++;
        }
        if (c.emerging_tech.includes('Urban Digital Twins')) {
          this.resultCases.emerging.e08++;
        }
        if (c.emerging_tech.includes('5G Cellular')) {
          this.resultCases.emerging.e09++;
        }
      });

      let casesPV = this.allCases;

      casesPV = this.applyFiltersText(casesPV);
      casesPV = this.applyFiltersGeo(casesPV);
      casesPV = this.applyFiltersThemeArea(casesPV);
      casesPV = this.applyFiltersEmergingTech(casesPV);
      casesPV = this.applyFiltersOGC(casesPV);
      casesPV = this.applyFiltersTechReady(casesPV);
      casesPV = this.applyFiltersScope(casesPV);
      casesPV = this.applyFiltersToolsPlatforms(casesPV);
      casesPV = this.applyFiltersNatureSolution(casesPV);

      casesPV.forEach(c => {
        let pvOp = false;
        let pvPol = false;
        let pvSoc = false;

        // Operational
        if (c.public_value[0].includes('Collaboration')) {
          this.resultCases.publicValue.p02++;
          pvOp = true;
        }
        if (c.public_value[0].includes('Effectiveness')) {
          this.resultCases.publicValue.p03++;
          pvOp = true;
        }
        if (c.public_value[0].includes('Efficiency')) {
          this.resultCases.publicValue.p04++;
          pvOp = true;
        }
        if (c.public_value[0].includes('User-Oriented')) {
          this.resultCases.publicValue.p05++;
          pvOp = true;
        }
        // Political
        if (c.public_value[1].includes('Transparency')) {
          this.resultCases.publicValue.p07++;
          pvPol = true;
        }
        if (c.public_value[1].includes('Accountability')) {
          this.resultCases.publicValue.p08++;
          pvPol = true;
        }
        if (c.public_value[1].includes('Citizen Participation')) {
          this.resultCases.publicValue.p09++;
          pvPol = true;
        }
        if (c.public_value[1].includes('Equity in accessibility')) {
          this.resultCases.publicValue.p10++;
          pvPol = true;
        }
        if (c.public_value[1].includes('Openness')) {
          this.resultCases.publicValue.p11++;
          pvPol = true;
        }
        if (c.public_value[1].includes('Economic Development')) {
          this.resultCases.publicValue.p12++;
          pvPol = true;
        }
        // Social
        if (c.public_value[2].includes('Trust')) {
          this.resultCases.publicValue.p14++;
          pvSoc = true;
        }
        if (c.public_value[2].includes('Self Development')) {
          this.resultCases.publicValue.p15++;
          pvSoc = true;
        }
        if (c.public_value[2].includes('Quality of life')) {
          this.resultCases.publicValue.p16++;
          pvSoc = true;
        }
        if (c.public_value[2].includes('Inclusiveness')) {
          this.resultCases.publicValue.p17++;
          pvSoc = true;
        }
        if (c.public_value[2].includes('Environmental sustainability')) {
          this.resultCases.publicValue.p18++;
          pvSoc = true;
        }

        if (pvOp) {
          this.resultCases.publicValue.p01++;
        }
        if (pvPol) {
          this.resultCases.publicValue.p06++;
        }
        if (pvSoc) {
          this.resultCases.publicValue.p13++;
        }
      });

      let casesTechReady = this.allCases;

      casesTechReady = this.applyFiltersText(casesTechReady);
      casesTechReady = this.applyFiltersGeo(casesTechReady);
      casesTechReady = this.applyFiltersThemeArea(casesTechReady);
      casesTechReady = this.applyFiltersEmergingTech(casesTechReady);
      casesTechReady = this.applyFiltersOGC(casesTechReady);
      casesTechReady = this.applyFiltersPublicValue(casesTechReady);
      casesTechReady = this.applyFiltersScope(casesTechReady);
      casesTechReady = this.applyFiltersToolsPlatforms(casesTechReady);
      casesTechReady = this.applyFiltersNatureSolution(casesTechReady);

      casesTechReady.forEach(c => {
        if (c.tech_readiness_level === 1) {
          this.resultCases.readiness.r01++;
        } else if (c.tech_readiness_level === 2) {
          this.resultCases.readiness.r02++;
        } else if (c.tech_readiness_level === 3) {
          this.resultCases.readiness.r03++;
        } else if (c.tech_readiness_level === 4) {
          this.resultCases.readiness.r04++;
        }
      });

      let casesToolsPlatforms = this.allCases;

      casesToolsPlatforms = this.applyFiltersText(casesToolsPlatforms);
      casesToolsPlatforms = this.applyFiltersGeo(casesToolsPlatforms);
      casesToolsPlatforms = this.applyFiltersThemeArea(casesToolsPlatforms);
      casesToolsPlatforms = this.applyFiltersEmergingTech(casesToolsPlatforms);
      casesToolsPlatforms = this.applyFiltersOGC(casesToolsPlatforms);
      casesToolsPlatforms = this.applyFiltersTechReady(casesToolsPlatforms);
      casesToolsPlatforms = this.applyFiltersPublicValue(casesToolsPlatforms);
      casesToolsPlatforms = this.applyFiltersScope(casesToolsPlatforms);
      casesToolsPlatforms = this.applyFiltersNatureSolution(casesToolsPlatforms);

      casesToolsPlatforms.forEach(c => {
        if (c.tools_platforms.includes('Green Infrastructure')) {
          this.resultCases.tools.tp01++;
        }
        if (c.tools_platforms.includes('Ecosystem Restoration')) {
          this.resultCases.tools.tp02++;
        }
        if (c.tools_platforms.includes('Sustainable Agriculture')) {
          this.resultCases.tools.tp03++;
        }
        if (c.tools_platforms.includes('Sustainable Land Management')) {
          this.resultCases.tools.tp04++;
        }
        if (c.tools_platforms.includes('Nature-Based Tourism')) {
          this.resultCases.tools.tp05++;
        }
        if (c.tools_platforms.includes('Biodiversity Conservation')) {
          this.resultCases.tools.tp06++;
        }
        if (c.tools_platforms.includes('Renewable energy')) {
          this.resultCases.tools.tp07++;
        }
        if (c.tools_platforms.includes('Nature-Based Flood Management')) {
          this.resultCases.tools.tp08++;
        }
        if (c.tools_platforms.includes('Reforestation and Afforestation')) {
          this.resultCases.tools.tp09++;
        }
      });

      let casesNatureSolution = this.allCases;

      casesNatureSolution = this.applyFiltersText(casesNatureSolution);
      casesNatureSolution = this.applyFiltersGeo(casesNatureSolution);
      casesNatureSolution = this.applyFiltersThemeArea(casesNatureSolution);
      casesNatureSolution = this.applyFiltersEmergingTech(casesNatureSolution);
      casesNatureSolution = this.applyFiltersOGC(casesNatureSolution);
      casesNatureSolution = this.applyFiltersTechReady(casesNatureSolution);
      casesNatureSolution = this.applyFiltersPublicValue(casesNatureSolution);
      casesNatureSolution = this.applyFiltersScope(casesNatureSolution);
      casesNatureSolution = this.applyFiltersToolsPlatforms(casesNatureSolution);
    

      casesNatureSolution.forEach(c => {
        if (c.nature_solution.includes('Green Infrastructure')) {
          this.resultCases.solution.s01++;
        }
        if (c.nature_solution.includes('Ecosystem Restoration')) {
          this.resultCases.solution.s02++;
        }
        if (c.nature_solution.includes('Sustainable Agriculture')) {
          this.resultCases.solution.s03++;
        }
        if (c.nature_solution.includes('Sustainable Land Management')) {
          this.resultCases.solution.s04++;
        }
        if (c.nature_solution.includes('Nature-Based Tourism')) {
          this.resultCases.solution.s05++;
        }
        if (c.nature_solution.includes('Biodiversity Conservation')) {
          this.resultCases.solution.s06++;
        }
        if (c.nature_solution.includes('Renewable energy')) {
          this.resultCases.solution.s07++;
        }
        if (c.nature_solution.includes('Nature-Based Flood Management')) {
          this.resultCases.solution.s08++;
        }
        if (c.nature_solution.includes('Reforestation and Afforestation')) {
          this.resultCases.solution.s09++;
        }
      });
    }
  }

  clearFilters() {
    this.filteredCases = this.allCases;
    this.tas.emergingTech.forEach(a => {
      a.active = false;
    });
    this.tas.ogcAreas.forEach(a => {
      a.active = false;
    });
    this.tas.thematicAreas.forEach(a => {
      a.active = false;
    });
    this.tas.publicValue.forEach(pv => {
      pv.active = false;
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
    this.techReadyFilter = null;
    this.emergingTechFilter = [];
    this.ogcTrendFilter = [];
    this.themeAreaFilter = [];
    this.publicValueFilter = [];
    this.toolsPlatformsFilter = [];
    this.natureSolutionFilter = [];


    this.applyFilters();
    this.calculateResults();

    this.addMarkersCollection();

    // this.filteredCasesChange.next(!this.isFilteredCasesChanged);

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
