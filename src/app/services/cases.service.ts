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
  private typeFilter = null;
  private regiHazardFilter = null;
  private dataCategoryFilter = [];
  private ecosystemServicesFilter = [];
  private toolsPlatformsFilter = [];
  private solutionGoalFilter = [];

  public selectedCase = null;

  public pagination = 1;

  public lastBounds = null;

  private isFilteredCasesChanged = false;
  public filteredCasesChange: Subject<boolean> = new Subject<boolean>();

  public resultCases = {
    solutiontype: {
      governanceAndInstitutional: 0,
      economicAndFinance: 0,
      physicalAndTechnological: 0,
      natureBasedSolutionsAndEcosystemBasedApproaches: 0,
      knowledgeAndBehaviouralChange: 0
    },
    
    solutionGoal: {
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
    ecosystemServices: {
      ec01: 0,
      ec02: 0,
      ec03: 0,
      ec04: 0,
      ec05: 0,
      ec06: 0,
      ec07: 0,
      ec08: 0,
      ec09: 0,
      ec10: 0,
      ec11: 0,
      ec12: 0,
      ec13: 0,
      ec14: 0,
      ec15: 0,
      ec16: 0,
      ec17: 0,
      ec18: 0,
      ec19: 0,
      ec20: 0,
      ec21: 0,
      ec22: 0
    },
    dataCategories: {
      d01: 0,
      d02: 0,
      d03: 0,
      d04: 0,
      d05: 0,
      d06: 0,
      d07: 0,
      d08: 0,
      d09: 0,
      d10: 0,
      d11: 0,
      d12: 0,
      d13: 0,
      d14: 0
    },


    hazardss: {
      r01: 0,
      r02: 0,
      r03: 0,
      r04: 0,
      r05: 0
    },
    
    toolsPlatforms: {
      tp01: 0,
      tp02: 0,
      tp03: 0,
      tp04: 0,
      tp05: 0,
      tp06: 0,
      tp07: 0,
      tp08: 0,
      tp09: 0,
      tp10: 0,
      tp11: 0,
      tp12: 0,
      tp13: 0,
      tp14: 0,
      tp15: 0,
      tp16: 0,
      tp17: 0,
      tp18: 0,
      tp19: 0,
      tp20: 0,
      tp21: 0
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
    this.filterBySolutionGoals();
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
      if (this.tas.solutiontype.governanceAndInstitutional) {
        this.typeFilter = 'Governance and Institutional';
      } else if (this.tas.solutiontype.economicAndFinance) {
        this.typeFilter = 'Economic and Finance';
      } else if (this.tas.solutiontype.physicalAndTechnological) {
        this.typeFilter = 'Physical and Technological';
      } else if (this.tas.solutiontype.natureBasedSolutionsAndEcosystemBasedApproaches) {
        this.typeFilter = 'Nature Based Solutions and Ecosystem-based Approaches';
      } else if (this.tas.solutiontype.knowledgeAndBehaviouralChange) {
        this.typeFilter = 'Knowledge and Behavioural change';
      }
    } else {
      if (sc === 'governanceAndInstitutional') {
        this.tas.solutiontype.governanceAndInstitutional = true;
        this.tas.solutiontype.economicAndFinance = false;
        this.tas.solutiontype.physicalAndTechnological= false;
        this.tas.solutiontype.natureBasedSolutionsAndEcosystemBasedApproaches = false;
        this.tas.solutiontype.knowledgeAndBehaviouralChange = false;
      } else if (sc === 'economicAndFinance') {
        this.tas.solutiontype.governanceAndInstitutional = false;
        this.tas.solutiontype.economicAndFinance = true;
        this.tas.solutiontype.physicalAndTechnological= false;
        this.tas.solutiontype.natureBasedSolutionsAndEcosystemBasedApproaches = false;
        this.tas.solutiontype.knowledgeAndBehaviouralChange = false;
      } else if (sc === 'physicalAndTechnological') {
        this.tas.solutiontype.governanceAndInstitutional = false;
        this.tas.solutiontype.economicAndFinance = false;
        this.tas.solutiontype.physicalAndTechnological= true;
        this.tas.solutiontype.natureBasedSolutionsAndEcosystemBasedApproaches = false;
        this.tas.solutiontype.knowledgeAndBehaviouralChange = false;
      } else if (sc === 'natureBasedSolutionsAndEcosystemBasedApproaches') {
        this.tas.solutiontype.governanceAndInstitutional = false;
        this.tas.solutiontype.economicAndFinance = false;
        this.tas.solutiontype.physicalAndTechnological= false;
        this.tas.solutiontype.natureBasedSolutionsAndEcosystemBasedApproaches = true;
        this.tas.solutiontype.knowledgeAndBehaviouralChange = false;
      } else if (sc === 'knowledgeAndBehaviouralChange') {
        this.tas.solutiontype.governanceAndInstitutional = false;
        this.tas.solutiontype.economicAndFinance = false;
        this.tas.solutiontype.physicalAndTechnological= false;
        this.tas.solutiontype.natureBasedSolutionsAndEcosystemBasedApproaches = true;  
        this.tas.solutiontype.knowledgeAndBehaviouralChange = true;
      } else {
        this.tas.solutiontype.governanceAndInstitutional = false;
        this.tas.solutiontype.economicAndFinance = false;
        this.tas.solutiontype.physicalAndTechnological= false;
        this.tas.solutiontype.natureBasedSolutionsAndEcosystemBasedApproaches = false;
        this.tas.solutiontype.knowledgeAndBehaviouralChange = false;
      }
      this.typeFilter = sc;
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
    this.ecosystemServicesFilter = [];
    this.tas.ecosystemServices.forEach(a => {
      if (a.active) {
        this.ecosystemServicesFilter.push(a.name);
      }
    });

    this.applyFilters();
  }

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
      }else if (this.tas.hazardss.r05) {
        this.regiHazardFilter = 5;
      }
    } else {
      if (tr === 1) {
        this.tas.hazardss.r01 = true;
        this.tas.hazardss.r02 = false;
        this.tas.hazardss.r03 = false;
        this.tas.hazardss.r04 = false;
        this.tas.hazardss.r05 = false;
      } else if (tr === 2) {
        this.tas.hazardss.r01 = false;
        this.tas.hazardss.r02 = true;
        this.tas.hazardss.r03 = false;
        this.tas.hazardss.r04 = false;
        this.tas.hazardss.r05 = false;
      } else if (tr === 3) {
        this.tas.hazardss.r01 = false;
        this.tas.hazardss.r02 = false;
        this.tas.hazardss.r03 = true;
        this.tas.hazardss.r04 = false;
        this.tas.hazardss.r05 = false;
      } else if (tr === 4) {
        this.tas.hazardss.r01 = false;
        this.tas.hazardss.r02 = false;
        this.tas.hazardss.r03 = false;
        this.tas.hazardss.r04 = true;
        this.tas.hazardss.r05 = false;
      } else if (tr === 5) {
        this.tas.hazardss.r01 = false;
        this.tas.hazardss.r02 = false;
        this.tas.hazardss.r03 = false;
        this.tas.hazardss.r04 = false;
        this.tas.hazardss.r05 = true;
      } else {
        this.tas.hazardss.r01 = false;
        this.tas.hazardss.r02 = false;
        this.tas.hazardss.r03 = false;
        this.tas.hazardss.r04 = false;
        this.tas.hazardss.r05 = false;
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

  filterBySolutionGoals() {
    this.solutionGoalFilter= [];
    this.tas.solutionGoals.forEach(a => {
      if (a.active) {
        this.solutionGoalFilter.push(a.number);
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


      // console.log('Filtering by data cat: ' + this.dataCategoryFilter);

      if (this.dataCategoryFilter.length > 0) {
        const filterData = [];
        this.filteredCases.forEach(fc => {
          fc.data_categories.forEach(da => {
            this.dataCategoryFilter.forEach(f => {
              if (da === f) {
                if (!filterData.includes(fc)) {
                  filterData.push(fc);
                }
              }
            });
          });
        });
        this.filteredCases = filterData;
      }
            // console.log('Filtering by tools/platform: ' + this.toolsPlatformsFilter);
            if (this.toolsPlatformsFilter.length > 0) {
              const filterTools = [];
              this.filteredCases.forEach(fc => {
                fc.tools_platforms[0].forEach(too0 => {
                  this.toolsPlatformsFilter.forEach(f => {
                    if (too0 === f) {
                      if (!filterTools.includes(fc)) {
                        filterTools.push(fc);
                      }
                    }
                  });
                });
                fc.tools_platforms[1].forEach(too1 => {
                 this.toolsPlatformsFilter.forEach(f => {
                  if (too1 === f) {
                    if (!filterTools.includes(fc)) {
                      filterTools.push(fc);
                    }
                   }
                 });
                });
                fc.tools_platforms[2].forEach(too2 => {
                 this.toolsPlatformsFilter.forEach(f => {
                 if (too2 === f) {
                  if (!filterTools.includes(fc)) {
                    filterTools.push(fc);
                  }
                 }
               });
              });
                fc.tools_platforms[3].forEach(too3 => {
                this.toolsPlatformsFilter.forEach(f => {
                 if (too3 === f) {
                 if (!filterTools.includes(fc)) {
                   filterTools.push(fc);
                 }
                }
              });
             });
            });
              this.filteredCases = filterTools;
          }


            if (this.solutionGoalFilter.length > 0) {
              const filterSolution = [];
              this.filteredCases.forEach(fc => {
                fc.solution_goals.forEach(sol => {
                  this.solutionGoalFilter.forEach(s => {
                    if (Math.floor(sol) === s) {
                      if (!filterSolution.includes(fc)) {
                        filterSolution.push(fc);
                      }
                    }
                  });
                });
              });
              this.filteredCases = filterSolution;
            }

      // console.log('Filtering by ecosystem service: ' + this.ecosystemServicesFilter);

      if (this.ecosystemServicesFilter.length > 0) {
        const filterECO = [];
        this.filteredCases.forEach(fc => {
          fc.ecosystem_service[0].forEach(eco0 => {
            this.ecosystemServicesFilter.forEach(f => {
              if (eco0 === f) {
                if (!filterECO.includes(fc)) {
                  filterECO.push(fc);
                }
              }
            });
          });
        fc.ecosystem_service[1].forEach(eco1 => {
          this.ecosystemServicesFilter.forEach(f => {
            if (eco1 === f) {
              if (!filterECO.includes(fc)) {
                filterECO.push(fc);
              }
            }
          });
        });
        fc.ecosystem_service[2].forEach(eco2 => {
          this.ecosystemServicesFilter.forEach(f => {
            if (eco2 === f) {
              if (!filterECO.includes(fc)) {
                filterECO.push(fc);
              }
            }
          });
        });
      });

        this.filteredCases = filterECO;
      }



   

      // console.log('Filtering by technology hazardss: ' + this.regiHazardFilter);
      if (this.regiHazardFilter) {
        this.filteredCases = this.filteredCases.filter(c => c.region_hazard_level === this.regiHazardFilter);
      }

      // console.log('Filtering by solutiontype: ' + this.typeFilter);
      if (this.typeFilter && this.typeFilter != 'all') {
        this.filteredCases = this.filteredCases.filter(c => c.solution_type === this.typeFilter);
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

  applyFiltersDataCategory(toFilter) {
    if (this.dataCategoryFilter.length > 0) {
      const filterData = [];
      toFilter.forEach(fc => {
        fc.data_categories.forEach(da => {
          this.dataCategoryFilter.forEach(f => {
            if (da=== f) {
              if (!filterData.includes(fc)) {
                filterData.push(fc);
              }
            }
          });
        });
      });
      return filterData;
    } else {
      return toFilter;
    }
  }

  applyFiltersToolsPlatforms(toFilter) {
    if (this.toolsPlatformsFilter.length > 0) {
      const filterTools = [];
      toFilter.forEach(fc => {
        fc.tools_platforms[0].forEach(too0 => {
          this.toolsPlatformsFilter.forEach(f => {
            if (too0 === f) {
              if (!filterTools.includes(fc)) {
                filterTools.push(fc);
              }
            }
          });
        });
        fc.tools_platforms[1].forEach(too1 => {
          this.toolsPlatformsFilter.forEach(f => {
            if (too1 === f) {
              if (!filterTools.includes(fc)) {
                filterTools.push(fc);
              }
            }
          });
        });
        fc.tools_platforms[2].forEach(too2 => {
          this.toolsPlatformsFilter.forEach(f => {
            if (too2 === f) {
              if (!filterTools.includes(fc)) {
                filterTools.push(fc);
              }
            }
          });
        });
        fc.tools_platforms[3].forEach(too3 => {
          this.toolsPlatformsFilter.forEach(f => {
            if (too3 === f) {
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

  applyFiltersSolutionGoals(toFilter) {
    if (this.solutionGoalFilter.length > 0) {
      const filterSolution = [];
      toFilter.forEach(fc => {
        fc.solution_goals.forEach(sol => {
          this.solutionGoalFilter.forEach(s => {
            if (Math.floor(sol) === s) {
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

  applyFiltersEcosystemServices(toFilter) {
    if (this.ecosystemServicesFilter.length > 0) {
      const filterECO = [];
      toFilter.forEach(fc => {
        fc.ecosystem_service[0].forEach(eco0 => {
          this.ecosystemServicesFilter.forEach(f => {
            if (eco0 === f) {
              if (!filterECO.includes(fc)) {
                filterECO.push(fc);
              }
            }
          });
        });
        fc.ecosystem_service[1].forEach(eco1 => {
          this.ecosystemServicesFilter.forEach(f => {
            if (eco1 === f) {
              if (!filterECO.includes(fc)) {
                filterECO.push(fc);
              }
            }
          });
        });
        fc.ecosystem_service[2].forEach(eco2 => {
          this.ecosystemServicesFilter.forEach(f => {
            if (eco2 === f) {
              if (!filterECO.includes(fc)) {
                filterECO.push(fc);
              }
            }
          });
        });
      });
      return filterECO;
    } else {
      return toFilter;
    }
  }

  applyFiltersTechReady(toFilter) {
    if (this.regiHazardFilter && this.regiHazardFilter != 0) {
      toFilter = toFilter.filter(c => c.region_hazard_level === this.regiHazardFilter);
    }
    return toFilter;
  }

  applyFiltersType(toFilter) {
    if (this.typeFilter && this.typeFilter != 'all') {
      toFilter = toFilter.filter(c => c.solution_type === this.typeFilter);
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
        governanceAndInstitutional : 0,
        economicAndFinance: 0,
        physicalAndTechnological: 0,
        natureBasedSolutionsAndEcosystemBasedApproaches: 0,
        knowledgeAndBehaviouralChange: 0
      };
      
      this.resultCases.solutionGoal = {
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
      this.resultCases.ecosystemServices = {
        ec01: 0,
        ec02: 0,
        ec03: 0,
        ec04: 0,
        ec05: 0,
        ec06: 0,
        ec07: 0,
        ec08: 0,
        ec09: 0,
        ec10: 0,
        ec11: 0,
        ec12: 0,
        ec13: 0,
        ec14: 0,
        ec15: 0,
        ec16: 0,
        ec17: 0,
        ec18: 0,
        ec19: 0,
        ec20: 0,
        ec21: 0,
        ec22: 0
      },
      this.resultCases.dataCategories = {
        d01: 0,
        d02: 0,
        d03: 0,
        d04: 0,
        d05: 0,
        d06: 0,
        d07: 0,
        d08: 0,
        d09: 0,
        d10: 0,
        d11: 0,
        d12: 0,
        d13: 0,
        d14: 0
      },

      this.resultCases.hazardss = {
        r01: 0,
        r02: 0,
        r03: 0,
        r04: 0,
        r05: 0
      };

      this.resultCases.toolsPlatforms= {
        tp01: 0,
        tp02: 0,
        tp03: 0,
        tp04: 0,
        tp05: 0,
        tp06: 0,
        tp07: 0,
        tp08: 0,
        tp09: 0,
        tp10: 0,
        tp11: 0,
        tp12: 0,
        tp13: 0,
        tp14: 0,
        tp15: 0,
        tp16: 0,
        tp17: 0,
        tp18: 0,
        tp19: 0,
        tp20: 0,
        tp21: 0
      };




      let casesType = this.allCases;

      casesType = this.applyFiltersText(casesType);
      casesType = this.applyFiltersGeo(casesType);
      casesType = this.applyFiltersDataCategory(casesType);
      casesType = this.applyFiltersEcosystemServices(casesType);
      casesType = this.applyFiltersTechReady(casesType);
      casesType = this.applyFiltersToolsPlatforms(casesType);
      casesType = this.applyFiltersSolutionGoals(casesType);

      casesType.forEach(c => {
        if (c.solution_type) {
          if (c.solution_type === 'Governance and Institutional') {
            this.resultCases.solutiontype.governanceAndInstitutional++;
          } else if (c.solution_type === 'Economic and Finance') {
            this.resultCases.solutiontype.economicAndFinance++;
          } else if (c.solution_type === 'Physical and Technological') {
            this.resultCases.solutiontype.physicalAndTechnological++;
          } else if (c.solution_type === 'Nature Based Solutions and Ecosystem-based Approaches') {
            this.resultCases.solutiontype.natureBasedSolutionsAndEcosystemBasedApproaches++;
          } else if (c.solution_type === 'Knowledge and Behavioural change') {
            this.resultCases.solutiontype.knowledgeAndBehaviouralChange++;
        }
      }});

      let casesEcosystem = this.allCases;

      casesEcosystem = this.applyFiltersText(casesEcosystem);
      casesEcosystem = this.applyFiltersGeo(casesEcosystem);
      casesEcosystem = this.applyFiltersTechReady(casesEcosystem);
      casesEcosystem = this.applyFiltersDataCategory(casesEcosystem);
      casesEcosystem = this.applyFiltersType(casesEcosystem);
      casesEcosystem = this. applyFiltersToolsPlatforms(casesEcosystem);
      casesEcosystem = this.applyFiltersSolutionGoals(casesEcosystem);

      casesEcosystem.forEach(c => {
        let ecoReg = false;
        let ecoPro = false;
        let ecoCul = false;

        //  Regulation and Maintenance Services
        if (c.ecosystem_service[0].includes('Flood Protection')) {
          this.resultCases.ecosystemServices.ec02++;
          ecoReg = true;
        }
        if (c.ecosystem_service[0].includes('Water Purification')) {
          this.resultCases.ecosystemServices.ec03++;
          ecoReg = true;
        }
        if (c.ecosystem_service[0].includes('Water Retention')) {
          this.resultCases.ecosystemServices.ec04++;
          ecoReg = true;
        }
        if (c.ecosystem_service[0].includes('Filtering Wastes or Sequestering Pollutants')) {
          this.resultCases.ecosystemServices.ec05++;
          ecoReg = true;
        }
        if (c.ecosystem_service[0].includes('Control of Erosion Risk')) {
          this.resultCases.ecosystemServices.ec06++;
          ecoReg = true;
        }
        if (c.ecosystem_service[0].includes('Microclimate Regulation')) {
          this.resultCases.ecosystemServices.ec07++;
          ecoReg = true;
        }
        if (c.ecosystem_service[0].includes('Coastal Protection')) {
          this.resultCases.ecosystemServices.ec08++;
          ecoReg = true;
        }
        if (c.ecosystem_service[0].includes('Global Climate Regulation (terrestrial)')) {
          this.resultCases.ecosystemServices.ec09++;
          ecoReg = true;
        }
        if (c.ecosystem_service[0].includes('Hazard Mitigation')) {
          this.resultCases.ecosystemServices.ec10++;
          ecoReg = true;
        }
        if (c.ecosystem_service[0].includes('Fire Protection')) {
          this.resultCases.ecosystemServices.ec11++;
          ecoReg = true;
        }
        if (c.ecosystem_service[0].includes('Pest Control')) {
          this.resultCases.ecosystemServices.ec12++;
          ecoReg = true;
        }
        if (c.ecosystem_service[0].includes('Disease Control')) {
          this.resultCases.ecosystemServices.ec13++;
          ecoReg = true;
        }
        if (c.ecosystem_service[0].includes('Sustainable Disposal of Wastes')) {
          this.resultCases.ecosystemServices.ec14++;
          ecoReg = true;
        }
        if (c.ecosystem_service[0].includes('Decomposing Waste')) {
          this.resultCases.ecosystemServices.ec15++;
          ecoReg = true;
        }
        if (c.ecosystem_service[0].includes('Maintenance of Nursery Population and Habitat')) {
          this.resultCases.ecosystemServices.ec16++;
          ecoReg = true;
        }
        
        // Provisioning Services
        if (c.ecosystem_service[1].includes('Agro-biomass Growing')) {
          this.resultCases.ecosystemServices.ec18++;
          ecoPro = true;
        }
        if (c.ecosystem_service[1].includes('Biomass Growing')) {
          this.resultCases.ecosystemServices.ec19++;
          ecoPro = true;
        }

        // Cultural Services
        if (c.ecosystem_service[2].includes('Education and Information')) {
          this.resultCases.ecosystemServices.ec21++;
          ecoCul= true;
        }
        if (c.ecosystem_service[2].includes('Reduction in Damage Costs')) {
          this.resultCases.ecosystemServices.ec22++;
          ecoCul = true;
        }

        if (ecoReg) {
          this.resultCases.ecosystemServices.ec01++;
        }
        if (ecoPro) {
          this.resultCases.ecosystemServices.ec17++;
        }
        if (ecoCul) {
          this.resultCases.ecosystemServices.ec20++;
        }
      });

      let casesData = this.allCases;

      casesData = this.applyFiltersText(casesData);
      casesData = this.applyFiltersGeo(casesData);
      casesData = this.applyFiltersEcosystemServices(casesData);
      casesData = this.applyFiltersTechReady(casesData);
      casesData = this.applyFiltersType(casesData);
      casesData = this.applyFiltersToolsPlatforms(casesData);
      casesData = this.applyFiltersSolutionGoals(casesData);

      casesData.forEach(c => {
        if (c.data_categories.includes('Meteorological Geographical Features')) {
          this.resultCases.dataCategories.d01++;
        }
        if (c.data_categories.includes('Environmental Monitoring Facilities')) {
          this.resultCases.dataCategories.d02++;
        }
        if (c.data_categories.includes('Population Distribution - Demography')) {
          this.resultCases.dataCategories.d03++;
        }
        if (c.data_categories.includes('Atmospheric Conditions')) {
          this.resultCases.dataCategories.d04++;
        }
        if (c.data_categories.includes('Natural Risk Zones')) {
          this.resultCases.dataCategories.d05++;
        }
        if (c.data_categories.includes('Transport Networks')) {
          this.resultCases.dataCategories.d06++;
        }
        if (c.data_categories.includes('Protected Sites')) {
          this.resultCases.dataCategories.d07++;
        }
        if (c.data_categories.includes('Orthoimagery')) {
          this.resultCases.dataCategories.d08++;
        }
        if (c.data_categories.includes('Elevation')) {
          this.resultCases.dataCategories.d09++;
        }
        if (c.data_categories.includes('Land Use')) {
          this.resultCases.dataCategories.d10++;
        }
        if (c.data_categories.includes('Land Cover')) {
          this.resultCases.dataCategories.d11++;
        }
        if (c.data_categories.includes('Geology')) {
          this.resultCases.dataCategories.d12++;
        }
        if (c.data_categories.includes('Hydrography')) {
          this.resultCases.dataCategories.d13++;
        }
        if (c.data_categories.includes('Soil')) {
          this.resultCases.dataCategories.d14++;
        }
      });

      let casesRegionHazard = this.allCases;

      casesRegionHazard = this.applyFiltersText(casesRegionHazard);
      casesRegionHazard = this.applyFiltersGeo(casesRegionHazard);
      casesRegionHazard = this.applyFiltersDataCategory(casesRegionHazard);
      casesRegionHazard = this.applyFiltersEcosystemServices(casesRegionHazard);
      casesRegionHazard = this.applyFiltersType(casesRegionHazard);
      casesRegionHazard = this.applyFiltersToolsPlatforms(casesRegionHazard);
      casesRegionHazard = this.applyFiltersSolutionGoals(casesRegionHazard);

      casesRegionHazard.forEach(c => {
        if (c.region_hazard_level === 1) {
          this.resultCases.hazardss.r01++;
        } else if (c.region_hazard_level === 2) {
          this.resultCases.hazardss.r02++;
        } else if (c.region_hazard_level === 3) {
          this.resultCases.hazardss.r03++;
        } else if (c.region_hazard_level === 4) {
          this.resultCases.hazardss.r04++;
        } else if (c.region_hazard_level === 5) {
          this.resultCases.hazardss.r05++;
        }
      });

      let casesToolsPlatforms = this.allCases;

      casesToolsPlatforms = this.applyFiltersText(casesToolsPlatforms);
      casesToolsPlatforms = this.applyFiltersGeo(casesToolsPlatforms);
      casesToolsPlatforms = this.applyFiltersDataCategory(casesToolsPlatforms);
      casesToolsPlatforms = this.applyFiltersEcosystemServices(casesToolsPlatforms);
      casesToolsPlatforms = this.applyFiltersTechReady(casesToolsPlatforms);
      casesToolsPlatforms = this.applyFiltersType(casesToolsPlatforms);
      casesToolsPlatforms = this.applyFiltersSolutionGoals(casesToolsPlatforms);


      casesToolsPlatforms.forEach(c => {
        let tooMap = false;
        let tooSoft = false;
        let tooPlan = false;
        let tooData = false;

        // Mapping and Visualization Tools
       if (c.tools_platforms[0] && c.tools_platforms[0].includes('Web map application')) {
          this.resultCases.toolsPlatforms.tp02++;
          tooMap = true;
        }
        if (c.tools_platforms[0] && c.tools_platforms[0].includes('Geoportal')) {
          this.resultCases.toolsPlatforms.tp03++;
          tooMap = true;
        }
        if (c.tools_platforms[0] && c.tools_platforms[0].includes('Story map')) {
          this.resultCases.toolsPlatforms.tp04++;
          tooMap = true;
        }
        if (c.tools_platforms[0] && c.tools_platforms[0].includes('Map viewer')) {
          this.resultCases.toolsPlatforms.tp05++;
          tooMap = true;
        }
        if (c.tools_platforms[0] && c.tools_platforms[0].includes('Web portal')) {
          this.resultCases.toolsPlatforms.tp06++;
          tooMap = true;
        }
        // Software and Modeling Tools
        if (c.tools_platforms[1] && c.tools_platforms[1].includes('Software')) {
          this.resultCases.toolsPlatforms.tp08++;
          tooSoft = true;
        }
        if (c.tools_platforms[1] && c.tools_platforms[1].includes('Decision support tool')) {
          this.resultCases.toolsPlatforms.tp09++;
          tooSoft = true;
        }
        if (c.tools_platforms[1] && c.tools_platforms[1].includes('Hydrological design tool')) {
          this.resultCases.toolsPlatforms.tp10++;
          tooSoft = true;
        }
        if (c.tools_platforms[1] && c.tools_platforms[1].includes('Machine Learning/IoT/Extended Reality (XR)')) {
          this.resultCases.toolsPlatforms.tp11++;
          tooSoft = true;
        }
        if (c.tools_platforms[1] && c.tools_platforms[1].includes('Software (Fire modelling)')) {
          this.resultCases.toolsPlatforms.tp12++;
          tooSoft = true;
        }
        if (c.tools_platforms[1] && c.tools_platforms[1].includes('Data analysis tools')) {
          this.resultCases.toolsPlatforms.tp13++;
          tooSoft = true;
        }
        // Planning and Management Documents
        if (c.tools_platforms[2] && c.tools_platforms[2].includes('Master plan/ Action plan')) {
          this.resultCases.toolsPlatforms.tp15++;
          tooPlan = true;
        }
        if (c.tools_platforms[2] && c.tools_platforms[2].includes('Support program')) {
          this.resultCases.toolsPlatforms.tp16++;
          tooPlan = true;
        }
        // Data Management Platforms
        if (c.tools_platforms[3] && c.tools_platforms[3].includes('Website (video)')) {
          this.resultCases.toolsPlatforms.tp18++;
          tooData = true;
        }
        if (c.tools_platforms[3] && c.tools_platforms[3].includes('Project website')) {
          this.resultCases.toolsPlatforms.tp19++;
          tooData = true;
        }
        if (c.tools_platforms[3] && c.tools_platforms[3].includes('Data portal')) {
          this.resultCases.toolsPlatforms.tp20++;
          tooData = true;
        }
        if (c.tools_platforms[3] && c.tools_platforms[3].includes('Sensor network')) {
          this.resultCases.toolsPlatforms.tp21++;
          tooData = true;
        }


        if (tooMap) {
          this.resultCases.toolsPlatforms.tp01++;
        }
        if (tooSoft) {
          this.resultCases.toolsPlatforms.tp07++;
        }
        if (tooPlan) {
          this.resultCases.toolsPlatforms.tp14++;
        }
        if (tooData) {
          this.resultCases.toolsPlatforms.tp17++;
        }
      });

      let casesSolutionGoals = this.allCases;

      casesSolutionGoals = this.applyFiltersText(casesSolutionGoals);
      casesSolutionGoals = this.applyFiltersGeo(casesSolutionGoals);
      casesSolutionGoals = this.applyFiltersDataCategory(casesSolutionGoals);
      casesSolutionGoals = this.applyFiltersEcosystemServices(casesSolutionGoals);
      casesSolutionGoals = this.applyFiltersTechReady(casesSolutionGoals);
      casesSolutionGoals = this.applyFiltersType(casesSolutionGoals);
      casesSolutionGoals = this.applyFiltersToolsPlatforms(casesSolutionGoals);

      let uniqueSolutions = [];
      // subsections of solution goals can be repeated
      casesSolutionGoals.forEach(c => {
        uniqueSolutions = [];
        c.solution_goals.forEach(sol => {
          if (!uniqueSolutions.includes(Math.floor(sol))) {
            uniqueSolutions.push(Math.floor(sol));
          }
        });

        uniqueSolutions.forEach(sol => {
          switch (Math.floor(sol)) {
            case 1:
              this.resultCases.solutionGoal.s01++;
              break;
            case 2:
              this.resultCases.solutionGoal.s02++;
              break;
            case 3:
              this.resultCases.solutionGoal.s03++;
              break;
            case 4:
              this.resultCases.solutionGoal.s04++;
              break;
            case 5:
              this.resultCases.solutionGoal.s05++;
              break;
            case 6:
              this.resultCases.solutionGoal.s06++;
              break;
            case 7:
              this.resultCases.solutionGoal.s07++;
              break;
            case 8:
              this.resultCases.solutionGoal.s08++;
              break;
            case 9:
              this.resultCases.solutionGoal.s09++;
              break;
          }
        });
      })
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

    this.tas.toolsPlatforms.forEach(too => {
      too.active = false;
    });
    this.tas.solutionGoals.forEach(a => {
      a.active = false;
    });

    this.ns.nuts0Active = [];
    this.ns.nuts1Active = [];
    this.ns.nuts2Active = [];
    this.ns.nuts3Active = [];

    this.textFilter = '';
    this.geoExtentFilter = [];
    this.typeFilter = null;
    this.regiHazardFilter = null;
    this.dataCategoryFilter = [];
    this.ecosystemServicesFilter = [];
    this.toolsPlatformsFilter = [];
    this.solutionGoalFilter = [];


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
