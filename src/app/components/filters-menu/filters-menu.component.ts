import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CasesService } from '../../services/cases.service';
import { NutsService } from '../../services/nuts.service';
import { OptionsService } from '../../services/options.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-filters-menu',
  templateUrl: './filters-menu.component.html',
  styleUrls: ['./filters-menu.component.css']
})
export class FiltersMenuComponent implements OnInit, AfterViewInit {

 // textFilter = '';

  model0NUTS = null;
  model1NUTS = null;
  model2NUTS = null;
  model3NUTS = null;

  focus = true;

  view = [250, 50];

  // options
  /*   showXAxis: boolean = true;
    showYAxis: boolean = true; */
  gradient = false;
  showLegend = false;
  showXAxisLabel = false;
  showYAxisLabel = false;

  isURLCopied = false;

  colorScheme10 = {
    domain: ['#1b252e', '#b11dc4', '#d18776', '#999dae', '#2d7887', '#295aa8', '#d1b762', '#cb5c0d', '#e01010', '#4e11a9', "#20e20b", "#4e6657", "#dbde10", "#c5d4d7"]
  };
  colorScheme5 = {
    domain: ['#295aa8', '#d1b762', '#cb5c0d', '#e01010', '#4e11a9']
  };

  solutiontypeGraph = [];
  solutionGoalGraph = [];
  ecosystemGraph = [];
  dataGraph = [];
  hazardGraph = [];
  toolsGraph = [];
  projectAffiliationGraph = [];
  solutionStatusGraph = [];

  @ViewChild('filters') filters: ElementRef;
 // toolsGraph: { name: string; series: { name: string; value: any; }[]; }[];

  constructor(public cs: CasesService, public ns: NutsService, public tas: OptionsService, private route: ActivatedRoute) { }

  ngOnInit(): void {

    this.solutiontypeGraph = [
      {
        'name': 'Solution Type',
        'series': [
          {
            'name': 'Governance and Institutional',
            'value': this.cs.resultCases.solutionTypes.st01
          },
          {
            'name': 'Economic and Finance',
            'value': this.cs.resultCases.solutionTypes.st02
          },
          {
            'name': 'Physical and Technological',
            'value': this.cs.resultCases.solutionTypes.st03
          },
          {
            'name': 'Nature Based Solutions and Ecosystem-based Approaches',
            'value': this.cs.resultCases.solutionTypes.st04
          },
          {
            'name': 'Knowledge and Behavioural Change',
            'value': this.cs.resultCases.solutionTypes.st05
          }

        ]
      }
    ];

    this.ecosystemGraph = [
      {
        'name': 'Supported Ecosystem Services',
        'series': [
          {
            'name': ' Regulation and Maintainance Services',
            'value': this.cs.resultCases.ecosystemServices.ec01
          },
          {
            'name': 'Provisioning Services',
            'value': this.cs.resultCases.ecosystemServices.ec17
          },
          {
            'name': 'Cultural Services',
            'value': this.cs.resultCases.ecosystemServices.ec20
          }

        ]
      }
    ];
    this.dataGraph = [
      {
        'name': 'Data Categories',
        'series': [
          {
            'name': 'Meteorological geographical features',
            'value': this.cs.resultCases.dataCategories.d01
          },
          {
            'name': 'Environmental monitoring facilities',
            'value': this.cs.resultCases.dataCategories.d02
          },
          {
            'name': 'Population distribution - demography',
            'value': this.cs.resultCases.dataCategories.d03
          },
          {
            'name': 'Atmospheric conditions',
            'value': this.cs.resultCases.dataCategories.d04
          },
          {
            'name': 'Natural risk zones',
            'value': this.cs.resultCases.dataCategories.d05
          },
          {
            'name': 'Transport networks',
            'value': this.cs.resultCases.dataCategories.d06
          },
          {
            'name': 'Protected sites',
            'value': this.cs.resultCases.dataCategories.d07
          },
          {
            'name': 'Orthoimagery',
            'value': this.cs.resultCases.dataCategories.d08
          },
          {
            'name': 'Elevation',
            'value': this.cs.resultCases.dataCategories.d09
          },
          {
            'name': 'Land use',
            'value': this.cs.resultCases.dataCategories.d10
          },
          {
            'name': 'Land cover',
            'value': this.cs.resultCases.dataCategories.d11
          },
          {
            'name': 'Geology',
            'value': this.cs.resultCases.dataCategories.d12
          },
          {
            'name': 'Hydrography',
            'value': this.cs.resultCases.dataCategories.d13
          },
          {
            'name': 'Soil',
            'value': this.cs.resultCases.dataCategories.d14
          },
          {
            'name': 'Addresses',
            'value': this.cs.resultCases.dataCategories.d15
          },
          {
            'name': 'Administrative units',
            'value': this.cs.resultCases.dataCategories.d16
          },
          {
            'name': 'Cadastral parcels',
            'value': this.cs.resultCases.dataCategories.d17
          },
          {
            'name': 'Geographical grid systems',
            'value': this.cs.resultCases.dataCategories.d18
          },
          {
            'name': 'Geographical names',
            'value': this.cs.resultCases.dataCategories.d19
          },
          {
            'name': 'Coordinate reference systems',
            'value': this.cs.resultCases.dataCategories.d20
          },
          {
            'name': 'Agricultural and aquaculture facilities',
            'value': this.cs.resultCases.dataCategories.d21
          },
          {
            'name': 'Area management/restriction/regulation zones and reporting units',
            'value': this.cs.resultCases.dataCategories.d22
          },
          {
            'name': 'Bio-geographical regions',
            'value': this.cs.resultCases.dataCategories.d23
          },
          {
            'name': 'Buildings',
            'value': this.cs.resultCases.dataCategories.d24
          },
          {
            'name': 'Energy resources',
            'value': this.cs.resultCases.dataCategories.d25
          },
          {
            'name': 'Habitats and biotopes',
            'value': this.cs.resultCases.dataCategories.d26
          },
          {
            'name': 'Human health and safety',
            'value': this.cs.resultCases.dataCategories.d27
          },
          {
            'name': 'Mineral resources',
            'value': this.cs.resultCases.dataCategories.d28
          },
          {
            'name': ' Oceanographic geographical features',
            'value': this.cs.resultCases.dataCategories.d29
          },
          {
            'name': 'Production and industrial facilities',
            'value': this.cs.resultCases.dataCategories.d30
          },
          {
            'name': 'Species distribution',
            'value': this.cs.resultCases.dataCategories.d31
          },
          {
            'name': 'Sea regions',
            'value': this.cs.resultCases.dataCategories.d32
          },
          {
            'name': 'Statistical units',
            'value': this.cs.resultCases.dataCategories.d33
          },
          {
            'name': 'Utility and governmental services',
            'value': this.cs.resultCases.dataCategories.d34
          },
        ]
      }
    ];

    
    this.hazardGraph = [
      {
        'name': 'Region-specific Hazards',
        'series': [
          {
            'name': 'Floods',
            'value': this.cs.resultCases.hazardss.r01
          },
          {
            'name': 'Droughts',
            'value': this.cs.resultCases.hazardss.r02
          },
          {
            'name': 'Wildfire',
            'value': this.cs.resultCases.hazardss.r03
          },
          {
            'name': 'Heatwaves',
            'value': this.cs.resultCases.hazardss.r04
          },
          {
            'name': 'Soil Erosion',
            'value': this.cs.resultCases.hazardss.r05
          }
        ]
      }
    ];

    this.toolsGraph = [
      {
        'name': 'Tools/Platforms',
        'series': [
          {
            'name': 'Mapping and Visualization Tools',
            'value': this.cs.resultCases.toolsPlatforms.tp01
          },
          {
            'name': 'Software and Modeling Tools',
            'value': this.cs.resultCases.toolsPlatforms.tp07
          },
          {
            'name': 'Planning and Management Documents',
            'value': this.cs.resultCases.toolsPlatforms.tp14
          },
          {
            'name': 'Data Management Platforms',
            'value': this.cs.resultCases.toolsPlatforms.tp17
          },
        ]
      }
    ];

    this.solutionGoalGraph = [
      {
        'name': 'Solution Goals',
        'series': [
          {
            'name': '1 - Water Management and Flood Prevention',
            'value': this.cs.resultCases.solutionGoal.s01
          },
          {
            'name': '2 - Community Engagement and Advocacy',
            'value': this.cs.resultCases.solutionGoal.s02
          },
          {
            'name': '3 - Nature Conservation and Biodiversity',
            'value': this.cs.resultCases.solutionGoal.s03
          },
          {
            'name': '4 - Climate Risk Identification and Adaptation',
            'value': this.cs.resultCases.solutionGoal.s04
          },
          {
            'name': '5 - Pollution Reduction and Environmental Enhancement',
            'value': this.cs.resultCases.solutionGoal.s05
          },
          {
            'name': '6 - Forest Fire Reduction and Management',
            'value': this.cs.resultCases.solutionGoal.s06
          },
          {
            'name': '7 - Urban Planning',
            'value': this.cs.resultCases.solutionGoal.s07
          },
          {
            'name': '8 - Other Solutions',
            'value': this.cs.resultCases.solutionGoal.s08
          },
        ]
      }
    ];

    this.projectAffiliationGraph = [
      {
        'name': 'Project Affiliation',
        'series': [
          {
            'name': 'RESIST',
            'value': this.cs.resultCases.projectAffiliation.RESIST
          },
          {
            'name': 'Non-RESIST',
            'value': this.cs.resultCases.projectAffiliation.nonRESIST
          }
        ]
      }
    ];

    this.solutionStatusGraph = [
      {
        'name': 'Solution Status',
        'series': [
          {
            'name': 'Implemented',
            'value': this.cs.resultCases.solutionStatus.Implemented
          },
          {
            'name': 'In Development',
            'value': this.cs.resultCases.solutionStatus.InDevelopment
          },
          {
            'name': 'Planned',
            'value': this.cs.resultCases.solutionStatus.Planned
          },
          {
            'name': 'Proposed',
            'value': this.cs.resultCases.solutionStatus.Proposed
          },
          {
            'name': 'Pilot',
            'value': this.cs.resultCases.solutionStatus.Pilot
          },
          {
            'name': 'Deprecated',
            'value': this.cs.resultCases.solutionStatus.Deprecated
          }
        ]
      }
    ];
    



    // refresh graphs
    this.cs.filteredCasesChange.subscribe(() => {
      this.solutiontypeGraph = [
        {
          'name': 'Solution Type',
          'series': [
            {
              'name': 'Governance and Institutional',
              'value': this.cs.resultCases.solutionTypes.st01
            },
            {
              'name': 'Economic and Finance',
              'value': this.cs.resultCases.solutionTypes.st02
            },
            {
              'name': 'Physical and Technological',
              'value': this.cs.resultCases.solutionTypes.st03
            },
            {
              'name': 'Nature Based Solutions and Ecosystem-based Approaches',
              'value': this.cs.resultCases.solutionTypes.st04
            },
            {
              'name': 'Knowledge and Behavioural Change',
              'value': this.cs.resultCases.solutionTypes.st05
            }
  
          ]
        }
      ];

      this.ecosystemGraph = [
        {
          'name': 'Supported Ecosystem Services',
          'series': [
            {
              'name': ' Regulation and Maintainance Services',
              'value': this.cs.resultCases.ecosystemServices.ec01
            },
            {
              'name': 'Provisioning Services',
              'value': this.cs.resultCases.ecosystemServices.ec17
            },
            {
              'name': 'Cultural Services',
              'value': this.cs.resultCases.ecosystemServices.ec20
            }
  
          ]
        }
      ];

      this.dataGraph = [
        {
          'name': 'Data Categories',
        'series': [
          {
            'name': 'Meteorological geographical features',
            'value': this.cs.resultCases.dataCategories.d01
          },
          {
            'name': 'Environmental monitoring facilities',
            'value': this.cs.resultCases.dataCategories.d02
          },
          {
            'name': 'Population distribution - demography',
            'value': this.cs.resultCases.dataCategories.d03
          },
          {
            'name': 'Atmospheric conditions',
            'value': this.cs.resultCases.dataCategories.d04
          },
          {
            'name': 'Natural risk zones',
            'value': this.cs.resultCases.dataCategories.d05
          },
          {
            'name': 'Transport networks',
            'value': this.cs.resultCases.dataCategories.d06
          },
          {
            'name': 'Protected sites',
            'value': this.cs.resultCases.dataCategories.d07
          },
          {
            'name': 'Orthoimagery',
            'value': this.cs.resultCases.dataCategories.d08
          },
          {
            'name': 'Elevation',
            'value': this.cs.resultCases.dataCategories.d09
          },
          {
            'name': 'Land use',
            'value': this.cs.resultCases.dataCategories.d10
          },
          {
            'name': 'Land cover',
            'value': this.cs.resultCases.dataCategories.d11
          },
          {
            'name': 'Geology',
            'value': this.cs.resultCases.dataCategories.d12
          },
          {
            'name': 'Hydrography',
            'value': this.cs.resultCases.dataCategories.d13
          },
          {
            'name': 'Soil',
            'value': this.cs.resultCases.dataCategories.d14
          },
          {
            'name': 'Addresses',
            'value': this.cs.resultCases.dataCategories.d15
          },
          {
            'name': 'Administrative units',
            'value': this.cs.resultCases.dataCategories.d16
          },
          {
            'name': 'Cadastral parcels',
            'value': this.cs.resultCases.dataCategories.d17
          },
          {
            'name': 'Geographical grid systems',
            'value': this.cs.resultCases.dataCategories.d18
          },
          {
            'name': 'Geographical names',
            'value': this.cs.resultCases.dataCategories.d19
          },
          {
            'name': 'Coordinate reference systems',
            'value': this.cs.resultCases.dataCategories.d20
          },
          {
            'name': 'Agricultural and aquaculture facilities',
            'value': this.cs.resultCases.dataCategories.d21
          },
          {
            'name': 'Area management/restriction/regulation zones and reporting units',
            'value': this.cs.resultCases.dataCategories.d22
          },
          {
            'name': 'Bio-geographical regions',
            'value': this.cs.resultCases.dataCategories.d23
          },
          {
            'name': 'Buildings',
            'value': this.cs.resultCases.dataCategories.d24
          },
          {
            'name': 'Energy resources',
            'value': this.cs.resultCases.dataCategories.d25
          },
          {
            'name': 'Habitats and biotopes',
            'value': this.cs.resultCases.dataCategories.d26
          },
          {
            'name': 'Human health and safety',
            'value': this.cs.resultCases.dataCategories.d27
          },
          {
            'name': 'Mineral resources',
            'value': this.cs.resultCases.dataCategories.d28
          },
          {
            'name': ' Oceanographic geographical features',
            'value': this.cs.resultCases.dataCategories.d29
          },
          {
            'name': 'Production and industrial facilities',
            'value': this.cs.resultCases.dataCategories.d30
          },
          {
            'name': 'Species distribution',
            'value': this.cs.resultCases.dataCategories.d31
          },
          {
            'name': 'Sea regions',
            'value': this.cs.resultCases.dataCategories.d32
          },
          {
            'name': 'Statistical units',
            'value': this.cs.resultCases.dataCategories.d33
          },
          {
            'name': 'Utility and governmental services',
            'value': this.cs.resultCases.dataCategories.d34
          },
        ]
      }
    ];

      this.hazardGraph = [
        {
          'name': 'Region-specific Hazards',
          'series': [
            {
              'name': 'Floods',
              'value': this.cs.resultCases.hazardss.r01
            },
            {
              'name': 'Droughts',
              'value': this.cs.resultCases.hazardss.r02
            },
            {
              'name': 'Wildfire',
              'value': this.cs.resultCases.hazardss.r03
            },
            {
              'name': 'Heatwaves',
              'value': this.cs.resultCases.hazardss.r04
            },
            {
              'name': 'Soil Erosion',
              'value': this.cs.resultCases.hazardss.r05
            }
          ]
        }
      ];

      this.projectAffiliationGraph = [
        {
          'name': 'Project Affiliation',
          'series': [
            {
              'name': 'RESIST',
              'value': this.cs.resultCases.projectAffiliation.RESIST
            },
            {
              'name': 'Non-RESIST',
              'value': this.cs.resultCases.projectAffiliation.nonRESIST
            }
          ]
        }
      ];

      this.solutionStatusGraph = [
        {
          'name': 'Solution Status',
          'series': [
            {
              'name': 'Implemented',
              'value': this.cs.resultCases.solutionStatus.Implemented
            },
            {
              'name': 'In Development',
              'value': this.cs.resultCases.solutionStatus.InDevelopment
            },
            {
              'name': 'Planned',
              'value': this.cs.resultCases.solutionStatus.Planned
            },
            {
              'name': 'Proposed',
              'value': this.cs.resultCases.solutionStatus.Proposed
            },
            {
              'name': 'Pilot',
              'value': this.cs.resultCases.solutionStatus.Pilot
            },
            {
              'name': 'Deprecated',
              'value': this.cs.resultCases.solutionStatus.Deprecated
            }
          ]
        }
      ];
      

      this.toolsGraph = [
        {
          'name': 'Tools/Platforms',
          'series': [
            {
              'name': 'Mapping and Visualization Tools',
              'value': this.cs.resultCases.toolsPlatforms.tp01
            },
            {
              'name': 'Software and Modeling Tools',
              'value': this.cs.resultCases.toolsPlatforms.tp07
            },
            {
              'name': 'Planning and Management Documents',
              'value': this.cs.resultCases.toolsPlatforms.tp14
            },
            {
              'name': 'Data Management Platforms',
              'value': this.cs.resultCases.toolsPlatforms.tp17
            },
          ]
        }
      ];


      this.solutionGoalGraph = [
        {
          'name': 'Solution Goals',
          'series': [
            {
              'name': '1 - Water Management and Flood Prevention',
              'value': this.cs.resultCases.solutionGoal.s01
            },
            {
              'name': '2 - Community Engagement and Advocacy',
              'value': this.cs.resultCases.solutionGoal.s02
            },
            {
              'name': '3 - Nature Conservation and Biodiversity',
              'value': this.cs.resultCases.solutionGoal.s03
            },
            {
              'name': '4 - Climate Risk Identification and Adaptation',
              'value': this.cs.resultCases.solutionGoal.s04
            },
            {
              'name': '5 - Pollution Reduction and Environmental Enhancement',
              'value': this.cs.resultCases.solutionGoal.s05
            },
            {
              'name': '6 - Forest Fire Reduction and Management',
              'value': this.cs.resultCases.solutionGoal.s06
            },
            {
              'name': '7 - Urban Planning',
              'value': this.cs.resultCases.solutionGoal.s07
            },
            {
              'name': '8 - Other Solutions',
              'value': this.cs.resultCases.solutionGoal.s08
            },
          ]
        }
      ];


    });

  }

  ngAfterViewInit() {
    const width = this.filters.nativeElement.offsetWidth;
    this.view = [width - 15, 50];
  }


  tickSubgroups(i) {

    if (i > 0 && i <= 5) {
      // tslint:disable-next-line:max-line-length
      this.tas.toolsPlatforms[0].active = this.tas.toolsPlatforms[1].active && this.tas.toolsPlatforms[2].active && this.tas.toolsPlatforms[3].active && this.tas.toolsPlatforms[4].active && this.tas.toolsPlatforms[5].active;
    } else if (i > 6 && i <= 12) {
      // tslint:disable-next-line:max-line-length
      this.tas.toolsPlatforms[6].active = this.tas.toolsPlatforms[7].active && this.tas.toolsPlatforms[8].active && this.tas.toolsPlatforms[9].active && this.tas.toolsPlatforms[10].active && this.tas.toolsPlatforms[11].active && this.tas.toolsPlatforms[12].active;
    } else if (i > 13 && i <= 15) {
      // tslint:disable-next-line:max-line-length
      this.tas.toolsPlatforms[13].active = this.tas.toolsPlatforms[14].active && this.tas.toolsPlatforms[15].active;
    } else if (i > 16 && i <= 20) {
      // tslint:disable-next-line:max-line-length
      this.tas.toolsPlatforms[16].active = this.tas.toolsPlatforms[17].active && this.tas.toolsPlatforms[18].active && this.tas.toolsPlatforms[19].active && this.tas.toolsPlatforms[20].active;
    }
    

    if (i === 0 || i === 6 || i === 13 || i === 16) {
      let sectionActive = false;
      this.tas.toolsPlatforms.forEach((too, index) => {
        if (too.section && too.active) {
          sectionActive = true;
        } else if (too.section && !too.active) {
          sectionActive = false;
        } else if (!too.section && sectionActive) {
          too.active = true;
        } else if (!too.section && !sectionActive) {
          too.active = false;
        }
      });
    }
  
    this.cs.filterByToolsPlatforms();
  }
  ticksSubgroups(i) {

    if (i > 0 && i <= 15) {
      // tslint:disable-next-line:max-line-length
      this.tas.ecosystemServices[0].active = this.tas.ecosystemServices[1].active && this.tas.ecosystemServices[2].active && this.tas.ecosystemServices[3].active && this.tas.ecosystemServices[4].active && this.tas.ecosystemServices[5].active && this.tas.ecosystemServices[6].active
      && this.tas.ecosystemServices[7].active && this.tas.ecosystemServices[8].active && this.tas.ecosystemServices[9].active && this.tas.ecosystemServices[10].active && this.tas.ecosystemServices[11].active && this.tas.ecosystemServices[12].active && this.tas.ecosystemServices[13].active
      && this.tas.ecosystemServices[14].active && this.tas.ecosystemServices[15].active;
    } else if (i > 16 && i <= 18) {
      // tslint:disable-next-line:max-line-length
      this.tas.ecosystemServices[16].active = this.tas.ecosystemServices[17].active && this.tas.ecosystemServices[18].active;
    } else if (i > 19 && i <= 21) {
      // tslint:disable-next-line:max-line-length
      this.tas.ecosystemServices[19].active = this.tas.ecosystemServices[20].active && this.tas.ecosystemServices[21].active;
    }
    

    if (i === 0 || i === 16 || i === 19) {
      let sectionActive = false;
      this.tas.ecosystemServices.forEach((eco, index) => {
        if (eco.section && eco.active) {
          sectionActive = true;
        } else if (eco.section && !eco.active) {
          sectionActive = false;
        } else if (!eco.section && sectionActive) {
          eco.active = true;
        } else if (!eco.section && !sectionActive) {
          eco.active = false;
        }
      });
    }
  
    this.cs.filterByToolsPlatforms();
  }



  copyURLConfig(selCase = null, pinCase = null, mapBounds = null, mapZoom = null) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';

    let params = '?';

    params += 'page=' + this.cs.pagination + '&';

    if(selCase){
      params += 'sc=' + selCase._id.$oid + '&';
    }

    if (pinCase){
      params += 'pc=' + pinCase._id.$oid + '&';
    }

    if (mapBounds) {
      params += 'nelat=' + mapBounds._northEast.lat + '&';
      params += 'nelng=' + mapBounds._northEast.lng + '&';
      params += 'swlat=' + mapBounds._southWest.lat + '&';
      params += 'swlng=' + mapBounds._southWest.lng + '&';
    }

    if (mapZoom) {
      params += 'mz=' + mapZoom + '&';
    }

    if (this.tas.textFilter) {
      params += 'txt=' + this.tas.textFilter.replace(' ', '+') + '&';
    }

    if (this.ns.nuts0Active.length > 0) {
      this.ns.nuts0Active.forEach(n => {
       params += 'n0=' + n.NUTS_ID + '&';
      });
    }
    if (this.ns.nuts1Active.length > 0) {
      this.ns.nuts1Active.forEach(n => {
       params += 'n1=' + n.NUTS_ID + '&';
      });
    }
    if (this.ns.nuts2Active.length > 0) {
      this.ns.nuts2Active.forEach(n => {
       params += 'n2=' + n.NUTS_ID + '&';
      });
    }
    if (this.ns.nuts3Active.length > 0) {
      this.ns.nuts3Active.forEach(n => {
       params += 'n3=' + n.NUTS_ID + '&';
      });
    }
/*
    if (this.tas.solutiontype.governanceAndInstitutional) {
      params += 'solutiontype=governanceAndInstitutional&';
    } else if (this.tas.solutiontype.economicAndFinance) {
      params += 'solutiontype=economicAndFinance&';
    } else if (this.tas.solutiontype.physicalAndTechnological) {
      params += 'solutiontype=physicalAndTechnological&';
    } else if (this.tas.solutiontype.natureBasedSolutionsAndEcosystemBasedApproaches) {
      params += 'solutiontype=natureBasedSolutionsAndEcosystemBasedApproaches&';
    }else if (this.tas.solutiontype.knowledgeAndBehaviouralChange) {
      params += 'solutiontype=knowledgeAndBehaviouralChange&';
    }
    */
    this.tas.solutionTypes.forEach(sty => {
      if (sty.active) {
        params += 'sty=' + sty.result + '&';
      }
    });

    this.tas.ecosystemServices.forEach(eco => {
      if (eco.active) {
        params += 'eco=' + eco.result + '&';
      }
    });
    this.tas.dataCategories.forEach(da => {
      if (da.active) {
        params += 'da=' + da.result + '&';
      }
    });
    this.tas.hazardss.forEach(ha => {
      if (ha.active) {
        params += 'ha=' + ha.result + '&';
      }
    });
    this.tas.toolsPlatforms.forEach(too => {
      if (too.active) {
        params += 'too=' + too.result + '&';
      }
    });
    this.tas.solutionGoals.forEach(sol => {
      if (sol.active) {
        params += 'sol=' + sol.result + '&';
      }
    });

    // Add the new loop for project affiliation
    // this.tas.projectAffiliation.forEach(proj => {
    //   if (proj.active) {
     //    params += 'proj=' + proj.name + '&';
     //  }
    // });

    if (this.tas.projectAffiliation.RESIST) {
      params += 'projectAffiliation.RESIST&';
    } else if (this.tas.projectAffiliation.nonRESIST) {
      params += 'projectAffiliation.nonRESIST&';
    }

    // Solution Status filter
    if (this.tas.solutionStatus.Implemented) {
      params += 'solutionStatus.Implemented&';
    } else if (this.tas.solutionStatus.InDevelopment) {
      params += 'solutionStatus.InDevelopment&';
    } else if (this.tas.solutionStatus.Planned) {
      params += 'solutionStatus.Planned&';
    } else if (this.tas.solutionStatus.Proposed) {
      params += 'solutionStatus.Proposed&';
    } else if (this.tas.solutionStatus.Pilot) {
      params += 'solutionStatus.Pilot&';
    } else if (this.tas.solutionStatus.Deprecated) {
      params += 'solutionStatus.Deprecated&';
    }


    

   

    

  /*
    if (this.tas.hazardss.r01) {
      params += 'ready=r01&';
    } else if (this.tas.hazardss.r02) {
      params += 'ready=r02&';
    } else if (this.tas.hazardss.r03) {
      params += 'ready=r03&';
    } else if (this.tas.hazardss.r04) {
      params += 'ready=r04&';
    }else if (this.tas.hazardss.r05) {
      params += 'ready=r05&';

 */


    selBox.value = environment.base_url + params;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    selBox.setSelectionRange(0, 99999);
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.isURLCopied = true;
  }



}
