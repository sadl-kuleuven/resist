import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OptionsService {


  solutiontypeVisible = true;
  geoExtVisible = true;
  solutionGoalVisible = true;
  ecosystemVisible = true;
  trendVisible = true;
  publicValVisible = true;
  regiHazardVisible = true;
  toolsVisible = true;
  natureVisible= true;

  textFilter = '';

  solutiontype = {
    naturebased: false,
    grey: false,
    technological: false,
    nontechnological: false
  };
  

  ecosystemServices = [
    { name: 'Water Retention', active: false, icon: 'tint', result: 'w01', class: 'color1' },
    { name: 'Biodiversity Conservation', active: false, icon: 'globe', result: 'w02', class: 'color2' },
    { name: 'Pollution Control', active: false, icon: 'flask', result: 'w03', class: 'color3' },
    { name: 'Flood Control', active: false, icon: 'home', result: 'w04', class: 'color4' },
    { name: 'Sustainable Forestry', active: false, icon: 'tree', result: 'w05', class: 'color5' }
  ];

  dataCategories = [
    { name: 'Geospatial Data', active: false, icon: 'map-marker', result: 'e01', class: 'color1' },
    { name: 'Hydrological Data', active: false, icon: 'tint', result: 'e02', class: 'color2' },
    { name: 'Meteorological Data', active: false, icon: 'cloud', result: 'e03', class: 'color3' },
    { name: 'Statistical and Population Data', active: false, icon: 'bar-chart', result: 'e04', class: 'color4' },
    { name: 'Land Use Data', active: false, icon: 'square', result: 'e05', class: 'color5' }
  
  ];


  hazardss = {
    r01: false,
    r02: false,
    r03: false,
    r04: false
  };

  toolsPlatforms =[
    { name: 'Web Application', active: false, icon: 'laptop ', result: 'tp01', class: 'color1' },
    { name: 'Data Portal', active: false, icon: 'database', result: 'tp02', class: 'color2' },
    { name: 'Mapping and Visualization Tools', active: false, icon: 'map-o', result: 'tp03', class: 'color3' },
    { name: 'Modeling Tools', active: false, icon: 'desktop ', result: 'tp04', class: 'color4' },
    { name: 'Other Tools', active: false, icon: 'cogs ', result: 'tp05', class: 'color5' }
  ];
  natureSolution =[
    { name: 'Flood Prevention', active: false, icon: 'bars', result: 's01', class: 'color1' },
    { name: 'Nature Conservation', active: false, icon: 'leaf', result: 's02', class: 'color2' },
    { name: 'Pollution Reduction', active: false, icon: 'fire', result: 's03', class: 'color3' },
    { name: 'Hydrological Balance', active: false, icon: 'balance-scale', result: 's04', class: 'color4' },
    { name: 'Advocacy and Awareness', active: false, icon: 'eye', result: 's05', class: 'color5' },
    { name: 'Economic Protection', active: false, icon: 'eur', result: 's06', class: 'color6' },
    { name: 'Community Engagement', active: false, icon: 'users', result: 's07', class: 'color7' },
    { name: 'Sustainable Land Use', active: false, icon: 'square', result: 's08', class: 'color8' },
    { name: 'Biomass Management', active: false, icon: 'pagelines', result: 's09', class: 'color9' }
  ];

  constructor() {}

}
