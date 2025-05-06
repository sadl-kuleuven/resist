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
import { map } from 'rxjs/operators'; 

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
  private typeFilter = [];
  private regiHazardFilter = [];
  private dataCategoryFilter = [];
  private ecosystemServicesFilter = [];
  private toolsPlatformsFilter = [];
  private solutionGoalFilter = [];
  private projectAffiliationFilter = null;
  private solutionStatusFilter = null;


  public selectedCase = null;

  public pagination = 1;

  public lastBounds = null;

  private isFilteredCasesChanged = false;
  public filteredCasesChange: Subject<boolean> = new Subject<boolean>();

  

  public resultCases = {

    //solutiontype: {
      //governanceAndInstitutional: 0,
     // economicAndFinance: 0,
     // physicalAndTechnological: 0,
     // natureBasedSolutionsAndEcosystemBasedApproaches: 0,
     // knowledgeAndBehaviouralChange: 0
    //},
    
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

    solutionTypes: {
      st01: 0,
      st02: 0,
      st03: 0,
      st04: 0,
      st05: 0
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
      d14: 0,
      d15: 0,
      d16: 0,
      d17: 0,
      d18: 0,
      d19: 0,
      d20: 0,
      d21: 0,
      d22: 0,
      d23: 0,
      d24: 0,
      d25: 0,
      d26: 0,
      d27: 0,
      d28: 0,
      d29: 0,
      d30: 0,
      d31: 0,
      d32: 0,
      d33: 0,
      d34: 0

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

    projectAffiliation: {
      RESIST: 0,
      nonRESIST: 0
    },

    solutionStatus: {
      Implemented: 0,
      InDevelopment: 0,
      Planned: 0,
      Proposed: 0,
      Pilot: 0,
      Deprecated: 0
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
    this.filterByProjectAffiliation();
    this.filterBySolutionStatus();
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
/*
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
        this.typeFilter = 'Knowledge and Behavioural Change';
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
  */

  filterBySolutionType() {
    this.typeFilter = [];
    this.tas.solutionTypes.forEach(a => {
      if (a.active) {
        this.typeFilter.push(a.name);
      }
    });
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

  filterByRegionHazard() {
    this.regiHazardFilter = [];
    this.tas.hazardss.forEach(a => {
      if (a.active) {
        this.regiHazardFilter.push(a.name);
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

  //filterByProjectAffiliation() {
   // this.projectAffiliationFilter = [];
    //this.tas.projectAffiliation.forEach(a => {
     // if (a.active) {
     //   this.projectAffiliationFilter.push(a.name);
     // }
    //});
   // this.applyFilters();
 // }

  filterByProjectAffiliation(sc = null) {
    if (sc == null) {
      if (this.tas.projectAffiliation.RESIST) {
        this.projectAffiliationFilter = 'RESIST';
      } else if (this.tas.projectAffiliation.nonRESIST) {
        this.projectAffiliationFilter = 'Non-RESIST';
      }
    } else {
      if (sc === 'RESIST') {
        this.tas.projectAffiliation.RESIST = true;
        this.tas.projectAffiliation.nonRESIST = false;
      } else if (sc === 'nonRESIST') {
        this.tas.projectAffiliation.RESIST = false;
        this.tas.projectAffiliation.nonRESIST = true;
      } else {
        this.tas.projectAffiliation.RESIST = false;
        this.tas.projectAffiliation.nonRESIST = false;
      }
      this.projectAffiliationFilter = sc;
    }
    this.applyFilters();
  }

  filterBySolutionStatus(status = null) {
    if (status == null) {
      if (this.tas.solutionStatus.Implemented) {
        this.solutionStatusFilter = 'Implemented';
      } else if (this.tas.solutionStatus.InDevelopment) {
        this.solutionStatusFilter = 'In Development';
      } else if (this.tas.solutionStatus.Planned) {
        this.solutionStatusFilter = 'Planned';
      } else if (this.tas.solutionStatus.Proposed) {
        this.solutionStatusFilter = 'Proposed';
      } else if (this.tas.solutionStatus.Pilot) {
        this.solutionStatusFilter = 'Pilot';
      } else if (this.tas.solutionStatus.Deprecated) {
        this.solutionStatusFilter = 'Deprecated';
      }
    } else {
      this.tas.solutionStatus.Implemented = (status === 'Implemented');
      this.tas.solutionStatus.InDevelopment = (status === 'In Development');
      this.tas.solutionStatus.Planned = (status === 'Planned');
      this.tas.solutionStatus.Proposed = (status === 'Proposed');
      this.tas.solutionStatus.Pilot = (status === 'Pilot');
      this.tas.solutionStatus.Deprecated = (status === 'Deprecated');
      
      this.solutionStatusFilter = status;
    }
    this.applyFilters();
  }


/*

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
*/

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

      // console.log('Filtering by technology hazardss: ' + this.regiHazardFilter);


      if (this.regiHazardFilter.length > 0) {
        const filterHazard = [];
        this.filteredCases.forEach(fc => {
          fc.region_hazard_level.forEach(ha => {
            this.regiHazardFilter.forEach(f => {
              if (ha === f) {
                if (!filterHazard.includes(fc)) {
                  filterHazard.push(fc);
                }
              }
            });
          });
        });
        this.filteredCases = filterHazard;
      }

      // console.log('Filtering by solution types: ' + this.typeFilter);


      if (this.typeFilter.length > 0) {
        const filterType = [];
        this.filteredCases.forEach(fc => {
          fc.solution_type.forEach(sty => {
            this.typeFilter.forEach(f => {
              if (sty === f) {
                if (!filterType.includes(fc)) {
                  filterType.push(fc);
                }
              }
            });
          });
        });
        this.filteredCases = filterType;
      }

      // New code for filtering by project affiliation
      /*if (this.projectAffiliationFilter.length > 0) {
        const filterAffiliation = [];
        this.filteredCases.forEach(fc => {
          this.projectAffiliationFilter.forEach(f => {
            if (fc.project_affiliation === f) {  // Assuming `project_affiliation` is a property in each case
              if (!filterAffiliation.includes(fc)) {
                filterAffiliation.push(fc);
              }
            }
          });
        });
        this.filteredCases = filterAffiliation;
      }

*/
      




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

      // console.log('Filtering by projectaffiliationfilter: ' + this.projectAffiliationFilter);
      if (this.projectAffiliationFilter && this.projectAffiliationFilter != 'all') {
        this.filteredCases = this.filteredCases.filter(c => c.project_affiliation === this.projectAffiliationFilter);
      }

      // Filtering by solution status
      if (this.solutionStatusFilter && this.solutionStatusFilter != 'all') {
        this.filteredCases = this.filteredCases.filter(c => c.solution_status === this.solutionStatusFilter);
      }


      



   /*

      // console.log('Filtering by technology hazardss: ' + this.regiHazardFilter);
      if (this.regiHazardFilter) {
        this.filteredCases = this.filteredCases.filter(c => c.region_hazard_level === this.regiHazardFilter);
      }

      

      // console.log('Filtering by solutiontype: ' + this.typeFilter);
      if (this.typeFilter && this.typeFilter != 'all') {
        this.filteredCases = this.filteredCases.filter(c => c.solution_type === this.typeFilter);
      }
*/
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

  applyFiltersTechReady(toFilter) {
    if (this.regiHazardFilter.length > 0) {
      const filterHazard = [];
      toFilter.forEach(fc => {
        fc.region_hazard_level.forEach(ha => {
          this.regiHazardFilter.forEach(f => {
            if (ha=== f) {
              if (!filterHazard.includes(fc)) {
                filterHazard.push(fc);
              }
            }
          });
        });
      });
      return filterHazard;
    } else {
      return toFilter;
    }
  }

 /* applyFiltersProjectAffiliation(toFilter) {
    if (this.projectAffiliationFilter.length > 0) {
      const filterAffiliation = [];
      toFilter.forEach(fc => {
        this.projectAffiliationFilter.forEach(f => {
          if (fc.project_affiliation === f) {  // Assuming `project_affiliation` is a property in each case
            if (!filterAffiliation.includes(fc)) {
              filterAffiliation.push(fc);
            }
          }
        });
      });
      return filterAffiliation;
    } else {
      return toFilter;
    }
  }
*/

applyFiltersProjectAffiliation(toFilter) {
  if (this.projectAffiliationFilter && this.projectAffiliationFilter != 'all') {
    toFilter = toFilter.filter(c => c.project_affiliation === this.projectAffiliationFilter);
  }
  return toFilter;
}


// Apply solution status filter
applyFiltersSolutionStatus(toFilter){
if (this.solutionStatusFilter && this.solutionStatusFilter != 'all') {
  toFilter = toFilter.filter(c => c.solution_status === this.solutionStatusFilter);
}

return toFilter;
}

  
  applyFiltersType(toFilter) {
    if (this.typeFilter.length > 0) {
      const filterType = [];
      toFilter.forEach(fc => {
        fc.solution_type.forEach(sty => {
          this.typeFilter.forEach(f => {
            if (sty=== f) {
              if (!filterType.includes(fc)) {
                filterType.push(fc);
              }
            }
          });
        });
      });
      return filterType;
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



  /*
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
*/

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

      this.resultCases.solutionTypes = {
        st01 : 0,
        st02: 0,
        st03: 0,
        st04: 0,
        st05: 0
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
        d14: 0,
        d15: 0,
        d16: 0,
        d17: 0,
        d18: 0,
        d19: 0,
        d20: 0,
        d21: 0,
        d22: 0,
        d23: 0,
        d24: 0,
        d25: 0,
        d26: 0,
        d27: 0,
        d28: 0,
        d29: 0,
        d30: 0,
        d31: 0,
        d32: 0,
        d33: 0,
        d34: 0
      },

      this.resultCases.hazardss = {
        r01: 0,
        r02: 0,
        r03: 0,
        r04: 0,
        r05: 0
      },

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
      },

      this.resultCases.projectAffiliation = {
        RESIST: 0,
        nonRESIST: 0
      },

      this.resultCases.solutionStatus = {
        Implemented: 0,
        InDevelopment: 0,
        Planned: 0,
        Proposed: 0,
        Pilot: 0,
        Deprecated: 0
      };




      let casesType = this.allCases;

      casesType = this.applyFiltersText(casesType);
      casesType = this.applyFiltersGeo(casesType);
      casesType = this.applyFiltersDataCategory(casesType);
      casesType = this.applyFiltersEcosystemServices(casesType);
      casesType = this.applyFiltersTechReady(casesType);
      casesType = this.applyFiltersToolsPlatforms(casesType);
      casesType = this.applyFiltersSolutionGoals(casesType);
      casesType = this.applyFiltersProjectAffiliation(casesType);
      casesType = this.applyFiltersSolutionStatus(casesType); 


      casesType.forEach(c => {
        if (c.solution_type.includes('Governance and Institutional')) {
          this.resultCases.solutionTypes.st01++;
        }
        if (c.solution_type.includes('Economic and Finance')) {
          this.resultCases.solutionTypes.st02++;
        }
        if (c.solution_type.includes('Physical and Technological')) {
          this.resultCases.solutionTypes.st03++;
        }
        if (c.solution_type.includes('Nature Based Solutions and Ecosystem-based Approaches')) {
          this.resultCases.solutionTypes.st04++;
        }
        if (c.solution_type.includes('Knowledge and Behavioural Change')) {
          this.resultCases.solutionTypes.st05++;
        }
      });

      let casesEcosystem = this.allCases;

      casesEcosystem = this.applyFiltersText(casesEcosystem);
      casesEcosystem = this.applyFiltersGeo(casesEcosystem);
      casesEcosystem = this.applyFiltersTechReady(casesEcosystem);
      casesEcosystem = this.applyFiltersDataCategory(casesEcosystem);
      casesEcosystem = this.applyFiltersType(casesEcosystem);
      casesEcosystem = this. applyFiltersToolsPlatforms(casesEcosystem);
      casesEcosystem = this.applyFiltersSolutionGoals(casesEcosystem);
      casesEcosystem = this.applyFiltersProjectAffiliation(casesEcosystem);
      casesEcosystem = this.applyFiltersSolutionStatus(casesEcosystem); 

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
      casesData = this.applyFiltersProjectAffiliation(casesData);
      casesData = this.applyFiltersSolutionStatus(casesData); 
      
      

      casesData.forEach(c => {
        if (c.data_categories.includes('Meteorological geographical features')) {
          this.resultCases.dataCategories.d01++;
        }
        if (c.data_categories.includes('Environmental monitoring facilities')) {
          this.resultCases.dataCategories.d02++;
        }
        if (c.data_categories.includes('Population distribution - demography')) {
          this.resultCases.dataCategories.d03++;
        }
        if (c.data_categories.includes('Atmospheric conditions')) {
          this.resultCases.dataCategories.d04++;
        }
        if (c.data_categories.includes('Natural risk zones')) {
          this.resultCases.dataCategories.d05++;
        }
        if (c.data_categories.includes('Transport networks')) {
          this.resultCases.dataCategories.d06++;
        }
        if (c.data_categories.includes('Protected sites')) {
          this.resultCases.dataCategories.d07++;
        }
        if (c.data_categories.includes('Orthoimagery')) {
          this.resultCases.dataCategories.d08++;
        }
        if (c.data_categories.includes('Elevation')) {
          this.resultCases.dataCategories.d09++;
        }
        if (c.data_categories.includes('Land use')) {
          this.resultCases.dataCategories.d10++;
        }
        if (c.data_categories.includes('Land cover')) {
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
        if (c.data_categories.includes('Addresses')) {
          this.resultCases.dataCategories.d15++;
        }
        if (c.data_categories.includes('Administrative units')) {
          this.resultCases.dataCategories.d16++;
        }
        if (c.data_categories.includes('Cadastral parcels')) {
          this.resultCases.dataCategories.d17++;
        }
        if (c.data_categories.includes('Geographical grid systems')) {
          this.resultCases.dataCategories.d18++;
        }
        if (c.data_categories.includes('Geographical names')) {
          this.resultCases.dataCategories.d19++;
        }
        if (c.data_categories.includes('Coordinate reference systems')) {
          this.resultCases.dataCategories.d20++;
        }
        if (c.data_categories.includes('Agricultural and aquaculture facilities')) {
          this.resultCases.dataCategories.d21++;
        }
        if (c.data_categories.includes('Area management/restriction/regulation zones and reporting units')) {
          this.resultCases.dataCategories.d22++;
        }
        if (c.data_categories.includes('Bio-geographical regions')) {
          this.resultCases.dataCategories.d23++;
        }
        if (c.data_categories.includes('Buildings')) {
          this.resultCases.dataCategories.d24++;
        }
        if (c.data_categories.includes('Energy resources')) {
          this.resultCases.dataCategories.d25++;
        }
        if (c.data_categories.includes('Habitats and biotopes')) {
          this.resultCases.dataCategories.d26++;
        }
        if (c.data_categories.includes('Human health and safety')) {
          this.resultCases.dataCategories.d27++;
        }
        if (c.data_categories.includes('Mineral resources')) {
          this.resultCases.dataCategories.d28++;
        }
        if (c.data_categories.includes('Oceanographic geographical features')) {
          this.resultCases.dataCategories.d29++;
        }
        if (c.data_categories.includes('Production and industrial facilities')) {
          this.resultCases.dataCategories.d30++;
        }
        if (c.data_categories.includes('Species distribution')) {
          this.resultCases.dataCategories.d31++;
        }
        if (c.data_categories.includes('Sea regions')) {
          this.resultCases.dataCategories.d32++;
        }
        if (c.data_categories.includes('Statistical units')) {
          this.resultCases.dataCategories.d33++;
        }
        if (c.data_categories.includes('Utility and governmental services')) {
          this.resultCases.dataCategories.d34++;
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
      casesRegionHazard = this.applyFiltersProjectAffiliation(casesRegionHazard);
      casesRegionHazard = this.applyFiltersSolutionStatus(casesRegionHazard);

      casesRegionHazard.forEach(c => {
        if (c.region_hazard_level.includes('Floods')) {
          this.resultCases.hazardss.r01++;
        }
        if (c.region_hazard_level.includes('Droughts')) {
          this.resultCases.hazardss.r02++;
        }
        if (c.region_hazard_level.includes('Wildfire')) {
          this.resultCases.hazardss.r03++;
        }
        if (c.region_hazard_level.includes('Heatwaves')) {
          this.resultCases.hazardss.r04++;
        }
        if (c.region_hazard_level.includes('Soil Erosion')) {
          this.resultCases.hazardss.r05++;
        }
      });


      let casesProjectAffiliation = this.allCases;

      casesProjectAffiliation = this.applyFiltersText(casesProjectAffiliation);
      casesProjectAffiliation = this.applyFiltersGeo(casesProjectAffiliation);
      casesProjectAffiliation = this.applyFiltersDataCategory(casesProjectAffiliation);
      casesProjectAffiliation = this.applyFiltersEcosystemServices(casesProjectAffiliation);
      casesProjectAffiliation = this.applyFiltersTechReady(casesProjectAffiliation);
      casesProjectAffiliation = this.applyFiltersType(casesProjectAffiliation);
      casesProjectAffiliation = this.applyFiltersToolsPlatforms(casesProjectAffiliation);
      casesProjectAffiliation = this.applyFiltersSolutionGoals(casesProjectAffiliation);
      casesProjectAffiliation= this.applyFiltersSolutionStatus(casesProjectAffiliation);

      casesProjectAffiliation.forEach(c => {
        if (c.project_affiliation === 'RESIST') {
            this.resultCases.projectAffiliation.RESIST++;
        } else if (c.project_affiliation === 'Non-RESIST') {
            this.resultCases.projectAffiliation.nonRESIST++;
        }
    });

    let casesStatus = this.allCases;

    casesStatus = this.applyFiltersText(casesStatus);
    casesStatus = this.applyFiltersGeo(casesStatus);
    casesStatus = this.applyFiltersDataCategory(casesStatus);
    casesStatus = this.applyFiltersEcosystemServices(casesStatus);
    casesStatus = this.applyFiltersTechReady(casesStatus);
    casesStatus = this.applyFiltersType(casesStatus);
    casesStatus = this.applyFiltersToolsPlatforms(casesStatus);
    casesStatus = this.applyFiltersSolutionGoals(casesStatus);
    casesStatus = this.applyFiltersProjectAffiliation(casesStatus);

    casesStatus.forEach(c => {
      // Count by solution status
      if (c.solution_status === 'Implemented') {
        this.resultCases.solutionStatus.Implemented++;
      } else if (c.solution_status === 'In Development') {
        this.resultCases.solutionStatus.InDevelopment++;
      } else if (c.solution_status === 'Planned') {
        this.resultCases.solutionStatus.Planned++;
      } else if (c.solution_status === 'Proposed') {
        this.resultCases.solutionStatus.Proposed++;
      } else if (c.solution_status === 'Pilot') {
        this.resultCases.solutionStatus.Pilot++;
      } else if (c.solution_status === 'Deprecated') {
        this.resultCases.solutionStatus.Deprecated++;
      }
    });

    

    

      /*

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
        
        */

      let casesToolsPlatforms = this.allCases;

      casesToolsPlatforms = this.applyFiltersText(casesToolsPlatforms);
      casesToolsPlatforms = this.applyFiltersGeo(casesToolsPlatforms);
      casesToolsPlatforms = this.applyFiltersDataCategory(casesToolsPlatforms);
      casesToolsPlatforms = this.applyFiltersEcosystemServices(casesToolsPlatforms);
      casesToolsPlatforms = this.applyFiltersTechReady(casesToolsPlatforms);
      casesToolsPlatforms = this.applyFiltersType(casesToolsPlatforms);
      casesToolsPlatforms = this.applyFiltersSolutionGoals(casesToolsPlatforms);
      casesToolsPlatforms = this.applyFiltersProjectAffiliation(casesToolsPlatforms);
      casesToolsPlatforms = this.applyFiltersSolutionStatus(casesToolsPlatforms);

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
      casesSolutionGoals = this.applyFiltersProjectAffiliation(casesSolutionGoals);
      casesSolutionGoals = this.applyFiltersSolutionStatus(casesSolutionGoals);

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
    this.filteredCases = [...this.allCases];


    this.tas.dataCategories.forEach(a => {
      a.active = false;
    });
    this.filteredCases = this.allCases;
    this.tas.hazardss.forEach(a => {
      a.active = false;
    });
    this.filteredCases = this.allCases;
    this.tas.solutionTypes.forEach(a => {
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
    this.regiHazardFilter = [];
    this.dataCategoryFilter = [];
    this.ecosystemServicesFilter = [];
    this.toolsPlatformsFilter = [];
    this.solutionGoalFilter = [];
    this.projectAffiliationFilter = null;
    this.solutionStatusFilter = null;



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
