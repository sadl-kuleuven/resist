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
    domain: ['#61751a', '#AE2012', '#CA6702', '#EE9B00', '#E9D8A6', '#94D2BD', '#0A9396', '#005F73', '#002E3D', '#002229']
  };
  colorScheme5 = {
    domain: ['#61751a', '#EE9B00', '#E9D8A6', '#94D2BD', '#002E3D']
  };

  solutiontypeGraph = [];
  solutionGoalGraph = [];
  ecosystemGraph = [];
  trendGraph = [];
  pvGraph = [];
  hazardGraph = [];
  toolsGraph = [];
  goalGraph = [];

  @ViewChild('filters') filters: ElementRef;
 // toolsGraph: { name: string; series: { name: string; value: any; }[]; }[];

  constructor(public cs: CasesService, public ns: NutsService, public tas: OptionsService, private route: ActivatedRoute) { }

  ngOnInit(): void {

    this.solutiontypeGraph = [
      {
        'name': 'Solution Type',
        'series': [
          {
            'name': 'Nature-based ',
            'value': this.cs.resultCases.solutiontype.naturebased 
          },
          {
            'name': 'Grey',
            'value': this.cs.resultCases.solutiontype.grey
          },
          {
            'name': 'Technological',
            'value': this.cs.resultCases.solutiontype.technological
          },
          {
            'name': 'Non-technological',
            'value': this.cs.resultCases.solutiontype.nontechnological
          }

        ]
      }
    ];
    /*
    this.solutionGoalGraph = [
      {
        'name': 'Solution Goal',
        'series': [
          {
            'name': '1 - Flood Prevention ',
            'value': this.cs.resultCases.solutionGoal.t01
          },
          {
            'name': '2 - Nature conservation',
            'value': this.cs.resultCases.solutionGoal.t02
          },
          {
            'name': '3 - Pollution reduction  ',
            'value': this.cs.resultCases.solutionGoal.t03
          },
          {
            'name': '4 - Hydrological balance',
            'value': this.cs.resultCases.solutionGoal.t04
          },
          {
            'name': '5 - Advocacy and awareness',
            'value': this.cs.resultCases.solutionGoal.t05
          },
          {
            'name': '6 - Economic protection ',
            'value': this.cs.resultCases.solutionGoal.t06
          },
          {
            'name': '7 - Community engagement',
            'value': this.cs.resultCases.solutionGoal.t07
          },
          {
            'name': '8 - Sustainable land use',
            'value': this.cs.resultCases.solutionGoal.t08
          },
          {
            'name': '9 - Biomass management',
            'value': this.cs.resultCases.solutionGoal.t09
          },
          {
            'name': '10 - Social protection',
            'value': this.cs.resultCases.solutionGoal.t10
          }
        ]
      }
    ];
*/
    this.ecosystemGraph = [
      {
        'name': 'ecosystem',
        'series': [
          {
            'name': 'Water Retention',
            'value': this.cs.resultCases.trendWatch.w01
          },
          {
            'name': 'Biodiversity Conservation',
            'value': this.cs.resultCases.trendWatch.w02
          },
          {
            'name': 'Pollution Control',
            'value': this.cs.resultCases.trendWatch.w03
          },
          {
            'name': 'Flood Control',
            'value': this.cs.resultCases.trendWatch.w04
          },
          {
            'name': 'Sustainable Forestry',
            'value': this.cs.resultCases.trendWatch.w05
          }

        ]
      }
    ];
    this.trendGraph = [
      {
        'name': 'Data Categories',
        'series': [
          {
            'name': 'Geospatial Data',
            'value': this.cs.resultCases.emerging.e01
          },
          {
            'name': 'Hydrological Data',
            'value': this.cs.resultCases.emerging.e02
          },
          {
            'name': 'Meteorological Data',
            'value': this.cs.resultCases.emerging.e03
          },
          {
            'name': 'Statistical and Population Data',
            'value': this.cs.resultCases.emerging.e04
          },
          {
            'name': 'Land Use Data',
            'value': this.cs.resultCases.emerging.e05
          },
 
        ]
      }
    ];
     /*
    this.pvGraph = [
      {
        'name': 'Public value type',
        'series': [
          {
            'name': 'Operational',
            'value': this.cs.resultCases.publicValue.p01
          },
          {
            'name': 'Political',
            'value': this.cs.resultCases.publicValue.p06
          },
          {
            'name': 'Social',
            'value': this.cs.resultCases.publicValue.p13
          }
        ]
      }
    ];
    */
    this.hazardGraph = [
      {
        'name': 'Region Hazards',
        'series': [
          {
            'name': 'Flood',
            'value': this.cs.resultCases.hazardss.r01
          },
          {
            'name': 'Drought',
            'value': this.cs.resultCases.hazardss.r02
          },
          {
            'name': 'Wildfire',
            'value': this.cs.resultCases.hazardss.r03
          },
          {
            'name': 'Heat Stress',
            'value': this.cs.resultCases.hazardss.r04
          }
        ]
      }
    ];
    this.toolsGraph = [
      {
        'name': 'tools/platforms',
        'series': [
          {
            'name': 'Web Application',
            'value': this.cs.resultCases.tools.tp01
          },
          {
            'name': 'Data Portal',
            'value': this.cs.resultCases.tools.tp02
          },
          {
            'name': 'Mapping and Visualization Tools',
            'value': this.cs.resultCases.tools.tp03
          },
          {
            'name': 'Modeling Tools',
            'value': this.cs.resultCases.tools.tp04
          },
          {
            'name': 'Other Tools',
            'value': this.cs.resultCases.tools.tp05
          },
        ]
      }
    ];

    this.goalGraph = [
      {
        'name': 'Solution Goals',
        'series': [
          {
            'name': 'Flood Prevention',
            'value': this.cs.resultCases.solution.s01
          },
          {
            'name': 'Nature Conservation',
            'value': this.cs.resultCases.solution.s02
          },
          {
            'name': 'Pollution Reduction ',
            'value': this.cs.resultCases.solution.s03
          },
          {
            'name': 'Hydrological Balance',
            'value': this.cs.resultCases.solution.s04
          },
          {
            'name': 'Advocacy and Awareness',
            'value': this.cs.resultCases.solution.s05
          },
          {
            'name': 'Economic Protection ',
            'value': this.cs.resultCases.solution.s06
          },
          {
            'name': 'Community Engagement',
            'value': this.cs.resultCases.solution.s07
          },
          {
            'name': 'Sustainable Land Use',
            'value': this.cs.resultCases.solution.s08
          },
          {
            'name': 'Biomass Management',
            'value': this.cs.resultCases.solution.s09

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
              'name': 'Nature-based ',
              'value': this.cs.resultCases.solutiontype.naturebased 
            },
            {
              'name': 'Grey',
              'value': this.cs.resultCases.solutiontype.grey
            },
            {
              'name': 'Technological',
              'value': this.cs.resultCases.solutiontype.technological
            },
            {
              'name': 'Non-technological',
              'value': this.cs.resultCases.solutiontype.nontechnological
            }
          ]
        }
      ];
      /*
      this.solutionGoalGraph = [
        {
          'name': 'Solution Goal',
          'series': [
            {
              'name': '1 - Flood Prevention ',
              'value': this.cs.resultCases.solutionGoal.t01
            },
            {
              'name': '2 - Nature conservation',
              'value': this.cs.resultCases.solutionGoal.t02
            },
            {
              'name': '3 - Pollution reduction ',
              'value': this.cs.resultCases.solutionGoal.t03
            },
            {
              'name': '4 - Hydrological balance',
              'value': this.cs.resultCases.solutionGoal.t04
            },
            {
              'name': '5 - Advocacy and awareness',
              'value': this.cs.resultCases.solutionGoal.t05
            },
            {
              'name': '6 - Economic protection ',
              'value': this.cs.resultCases.solutionGoal.t06
            },
            {
              'name': '7 - Community engagement',
              'value': this.cs.resultCases.solutionGoal.t07
            },
            {
              'name': '8 - Sustainable land use',
              'value': this.cs.resultCases.solutionGoal.t08
            },
            {
              'name': '9 - Biomass management',
              'value': this.cs.resultCases.solutionGoal.t09
            },
            {
              'name': '10 - Social protection',
              'value': this.cs.resultCases.solutionGoal.t10
            }
          ]
        }
      ];
      */

      this.ecosystemGraph = [
        {
          'name': 'ecosystem',
          'series': [
            {
              'name': 'Water Retention',
              'value': this.cs.resultCases.trendWatch.w01
            },
            {
              'name': 'Biodiversity Conservation',
              'value': this.cs.resultCases.trendWatch.w02
            },
            {
              'name': 'Pollution Control',
              'value': this.cs.resultCases.trendWatch.w03
            },
            {
              'name': 'Flood Control',
              'value': this.cs.resultCases.trendWatch.w04
            },
            {
              'name': 'Sustainable Forestry',
              'value': this.cs.resultCases.trendWatch.w05
            }
          ]
        }
      ];

      this.trendGraph = [
        {
          'name': 'Data Categories',
          'series': [
            {
              'name': 'Geospatial Data',
              'value': this.cs.resultCases.emerging.e01
            },
            {
              'name': 'Hydrological Data',
              'value': this.cs.resultCases.emerging.e02
            },
            {
              'name': 'Meteorological Data',
              'value': this.cs.resultCases.emerging.e03
            },
            {
              'name': 'Statistical and Population Data',
              'value': this.cs.resultCases.emerging.e04
            },
            {
              'name': 'Land Use Data',
              'value': this.cs.resultCases.emerging.e05
            },
          ]
        }
      ];
       /*
      this.pvGraph = [
        {
          'name': 'Public value type',
          'series': [
            {
              'name': 'Operational',
              'value': this.cs.resultCases.publicValue.p01
            },
            {
              'name': 'Political',
              'value': this.cs.resultCases.publicValue.p06
            },
            {
              'name': 'Social',
              'value': this.cs.resultCases.publicValue.p13
            }
          ]
        }
      ];
      */
      this.hazardGraph = [
        {
          'name': 'Region Hazards',
          'series': [
            {
              'name': 'Flood',
              'value': this.cs.resultCases.hazardss.r01
            },
            {
              'name': 'Drought',
              'value': this.cs.resultCases.hazardss.r02
            },
            {
              'name': 'Wildfire',
              'value': this.cs.resultCases.hazardss.r03
            },
            {
              'name': 'Heat Stress',
              'value': this.cs.resultCases.hazardss.r04
            }
          ]
        }
      ];
      this.toolsGraph = [
        {
          'name': 'tools/platforms',
          'series': [
            {
              'name': 'Web Application',
              'value': this.cs.resultCases.tools.tp01
            },
            {
              'name': 'Data Portal',
              'value': this.cs.resultCases.tools.tp02
            },
            {
              'name': 'Mapping and Visualization Tools',
              'value': this.cs.resultCases.tools.tp03
            },
            {
              'name': 'Modeling Tools',
              'value': this.cs.resultCases.tools.tp04
            },
            {
              'name': 'Other Tools',
              'value': this.cs.resultCases.tools.tp05
            },
          ]
        }
      ];
      this.goalGraph = [
        {
          'name': 'Solution Goals',
          'series': [
            {
              'name': 'Flood Prevention',
              'value': this.cs.resultCases.solution.s01
            },
            {
              'name': 'Nature Conservation',
              'value': this.cs.resultCases.solution.s02
            },
            {
              'name': 'Pollution Reduction ',
              'value': this.cs.resultCases.solution.s03
            },
            {
              'name': 'Hydrological Balance',
              'value': this.cs.resultCases.solution.s04
            },
            {
              'name': 'Advocacy and Awareness',
              'value': this.cs.resultCases.solution.s05
            },
            {
              'name': 'Economic Protection ',
              'value': this.cs.resultCases.solution.s06
            },
            {
              'name': 'Community Engagement',
              'value': this.cs.resultCases.solution.s07
            },
            {
              'name': 'Sustainable Land Use',
              'value': this.cs.resultCases.solution.s08
            },
            {
              'name': 'Biomass Management',
              'value': this.cs.resultCases.solution.s09
  
            }
          ]
        }
      ];


    });

  }

  ngAfterViewInit() {
    const width = this.filters.nativeElement.offsetWidth;
    this.view = [width - 15, 50];
  }

/*
  tickSubgroups(i) {

    if (i > 0 && i <= 4) {
      // tslint:disable-next-line:max-line-length
      this.tas.publicValue[0].active = this.tas.publicValue[1].active && this.tas.publicValue[2].active && this.tas.publicValue[3].active && this.tas.publicValue[4].active;
    } else if (i > 5 && i <= 11) {
      // tslint:disable-next-line:max-line-length
      this.tas.publicValue[5].active = this.tas.publicValue[6].active && this.tas.publicValue[7].active && this.tas.publicValue[8].active && this.tas.publicValue[9].active && this.tas.publicValue[10].active && this.tas.publicValue[11].active;
    } else if (i > 12 && i <= 17) {
      // tslint:disable-next-line:max-line-length
      this.tas.publicValue[12].active = this.tas.publicValue[13].active && this.tas.publicValue[14].active && this.tas.publicValue[15].active && this.tas.publicValue[16].active && this.tas[17].active;
    }

    if (i === 0 || i === 5 || i === 12) {
      let sectionActive = false;
      this.tas.publicValue.forEach(pv => {
        if (pv.section && pv.active) {
          sectionActive = true;
        } else if (pv.section && !pv.active) {
          sectionActive = false;
        } else if (!pv.section && sectionActive) {
          pv.active = true;
        } else if (!pv.section && !sectionActive) {
          pv.active = false;
        }
      });
    }

    this.cs.filterByPublicValue();
  }
*/
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

    if (this.tas.solutiontype.naturebased) {
      params += 'solutiontype=naturebased&';
    } else if (this.tas.solutiontype.grey) {
      params += 'solutiontype=grey&';
    } else if (this.tas.solutiontype.technological) {
      params += 'solutiontype=technological&';
    } else if (this.tas.solutiontype.nontechnological) {
      params += 'solutiontype=nontechnological&';
    }
    

    this.tas.ecosystemServices.forEach(tec => {
      if (tec.active) {
        params += 'tec=' + tec.result + '&';
      }
    });
    this.tas.dataCategories.forEach(em => {
      if (em.active) {
        params += 'em=' + em.result + '&';
      }
    });
    this.tas.toolsPlatforms.forEach(to => {
      if (to.active) {
        params += 'to=' + to.result + '&';
      }
    });
    this.tas.natureSolution.forEach(na => {
      if (na.active) {
        params += 'na=' + na.result + '&';
      }
    });
  
    if (this.tas.hazardss.r01) {
      params += 'ready=r01&';
    } else if (this.tas.hazardss.r02) {
      params += 'ready=r02&';
    } else if (this.tas.hazardss.r03) {
      params += 'ready=r03&';
    } else if (this.tas.hazardss.r04) {
      params += 'ready=r04&';
    }

 


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
