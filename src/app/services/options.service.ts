import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OptionsService {


  solutiontypeVisible = true;
  geoExtVisible = true;
  solutionGoalVisible = true;
  ecosystemVisible = true;
  dataVisible = true;
  publicValVisible = true;
  regiHazardVisible = true;
  toolsVisible = true;
  solutionVisible= true;

  textFilter = '';

  solutiontype = {
    governanceAndInstitutional: false,
    economicAndFinance: false,
    physicalAndTechnological: false,
    natureBasedSolutionsAndEcosystemBasedApproaches: false,
    knowledgeAndBehaviouralChange: false
  };
  
  

  ecosystemServices = [
    //Regulation and Maintenance Services
    { name: 'Regulation and Maintenance Services', active: false, section: true, result: 'ec01', class: 'color1' },
    { name: 'Flood Protection', active: false, section: false, result: 'ec02' },
    { name: 'Water Purification', active: false, section: false, result: 'ec03' },
    { name: 'Water Retention', active: false, section: false, result: 'ec04'},
    { name: 'Filtering Wastes or Sequestering Pollutants', active: false, section: false, result: 'ec05'},
    { name: 'Control of Erosion Risk', active: false, section: false, result: 'ec06' },
    { name: 'Microclimate Regulation', active: false, section: false, result: 'ec07' },
    { name: 'Coastal Protection', active: false, section: false, result: 'ec08'},
    { name: 'Global Climate Regulation (terrestrial)', active: false, section: false, result: 'ec09'},
    { name: 'Hazard Mitigation', active: false, section: false, result: 'ec10' },
    { name: 'Fire Protection', active: false, section: false, result: 'ec11' },
    { name: 'Pest Control', active: false, section: false, result: 'ec12'},
    { name: 'Disease Control', active: false, section: false, result: 'ec13'},
    { name: 'Sustainable Disposal of Wastes', active: false, section: false, result: 'ec14' },
    { name: 'Decomposing Waste', active: false, section: false, result: 'ec15'},
    { name: 'Maintenance of Nursery Population and Habitat', active: false, section: false, result: 'ec16'},
    // Provisioning Services
    { name: 'Provisioning Services', active: false, section: true, result: 'ec17', class: 'color2' },
    { name: 'Agro-biomass Growing', active: false, section: false, result: 'ec18' },
    { name: 'Biomass Growing', active: false, section: false, result: 'ec19' },
    // Cultural Services
    { name: 'Cultural Services', active: false, section: true, result: 'ec20', class: 'color3' },
    { name: 'Education and Information', active: false, section: false, result: 'ec21' },
    { name: 'Reduction in Damage Costs', active: false, section: false, result: 'ec22' }
  ];

  dataCategories = [
    { name: 'Meteorological Geographical Features', active: false, icon: 'cloud', result: 'd01', class: 'color1' },
    { name: 'Environmental Monitoring Facilities', active: false, icon: 'desktop', result: 'd02', class: 'color6' },
    { name: 'Population Distribution - Demography', active: false, icon: 'users', result: 'd03', class: 'color5' },
    { name: 'Atmospheric Conditions', active: false, icon: 'thermometer-empty', result: 'd04', class: 'color4' },
    { name: 'Natural Risk Zones', active: false, icon: 'info ', result: 'd05', class: 'color2' },
    { name: 'Transport Networks', active: false, icon: 'road', result: 'd06', class: 'color3' },
    { name: 'Protected Sites', active: false, icon: 'map-marker', result: 'd07', class: 'color7' },
    { name: 'Orthoimagery', active: false, icon: 'file-image-o', result: 'd08', class: 'color8' },
    { name: 'Elevation', active: false, icon: 'area-chart', result: 'd09', class: 'color9' },
    { name: 'Land Use', active: false, icon: 'th-large', result: 'd10', class: 'color10' },
    { name: 'Land Cover', active: false, icon: 'globe', result: 'd11', class: 'color11' },
    { name: 'Geology', active: false, icon: 'map', result: 'd12', class: 'color12' },
    { name: 'Hydrography', active: false, icon: 'tint', result: 'd13', class: 'color13' },
    { name: 'Soil', active: false, icon: 'circle-o', result: 'd14', class: 'color14' }
  
  ];


  hazardss = {
    r01: false,
    r02: false,
    r03: false,
    r04: false
  };

  toolsPlatforms =[
    //Mapping and Visualization Tools
    { name: 'Mapping and Visualization Tools',  active: false, section: true, result: 'tp01', class: 'color1' },
    { name: 'Web map application',  active: false, section: false, result: 'tp02' },
    { name: 'Geoportal', active: false, section: false, result: 'tp03'},
    { name: 'Story map', active: false, section: false, result: 'tp04'},
    { name: 'Map viewer', active: false, section: false, result: 'tp05'},
    { name: 'Web portal', active: false, section: false, result: 'tp06'},
    //Software and Modeling Tools
    { name: 'Software and Modeling Tools',  active: false, section: true, result: 'tp07', class: 'color2' },
    { name: 'Software',  active: false, section: false, result: 'tp08'},
    { name: 'Decision support tool', active: false, section: false, result: 'tp09'  },
    { name: 'Hydrological design tool', active: false, section: false, result: 'tp10'},
    { name: 'Machine Learning/IoT/Extended Reality (XR)', active: false, section: false, result: 'tp11'},
    { name: 'Software (fire modelling)', active: false, section: false, result: 'tp12'},
    { name: 'Data analysis tools', active: false, section: false, result: 'tp13'},
    //Planning and Management Documents
    { name: 'Planning and Management Documents',  active: false, section: true, result: 'tp14', class: 'color3' },
    { name: 'Master plan/ Action plan',  active: false, section: false, result: 'tp15'},
    { name: 'Support program', active: false, section: false, result: 'tp16'  },
    //Data Management Platforms
    { name: 'Data Management Platforms',  active: false, section: true, result: 'tp17', class: 'color4' },
    { name: 'Website (video)',  active: false, section: false, result: 'tp18'},
    { name: 'Project website', active: false, section: false, result: 'tp19'  },
    { name: 'Data portal', active: false, section: false, result: 'tp20'},
    { name: 'Sensor network', active: false, section: false, result: 'tp21'}
  ];
  solutionGoals =[
    { name: '1 - Water Management and Flood Prevention', number: 1, active: false, icon: 'bars', result: 's01', class: 'color1' },
    { name: '2 - Community Engagement and Advocacy', number: 2, active: false, icon: 'leaf', result: 's02', class: 'color2' },
    { name: '3 - Nature Conservation and Biodiversity', number: 3, active: false, icon: 'fire', result: 's03', class: 'color3' },
    { name: '4 - Climate Risk Identification and Adaptation', number: 4, active: false, icon: 'balance-scale', result: 's04', class: 'color4' },
    { name: '5 - Pollution Reduction and Environmental Enhancement', number: 5, active: false, icon: 'eye', result: 's05', class: 'color5' },
    { name: '6 - Forest Fire Reduction and Management', number: 6, active: false, icon: 'eur', result: 's06', class: 'color6' },
    { name: '7 - Urban Planning', number: 7, active: false, icon: 'users', result: 's07', class: 'color7' },
    { name: '8 - Other Solutions', number: 8, active: false, icon: 'square', result: 's08', class: 'color8' }
    
  ];

  solutionGoalExpanded = {
    '1': ' Water Management and Flood Prevention',
    '1.1': 'Flood prevention',
    '1.2': 'Groundwater protection',
    '1.3': 'Hydrological balance',
    '1.4': 'Water quality enhancemen',
    '2': ' Community Engagement and Advocacy',
    '2.1': 'Advocacy and awareness',
    '2.2': 'Community engagement',
    '2.3': 'Territory resilience enhancement',
    '2.4': 'Decision-making tools implementation',
    '2.5': 'Planning and resource allocation',
    '2.6': 'Policy coherence ensurement',
    '2.7': 'Effectiveness and efficiency Enhancement',
    '2.8': 'Cultural preservation',
    '2.9': 'Vulnerable group identification',
    '3': ' Nature Conservation and Biodiversity',
    '3.1': 'Nature conservation',
    '3.2': 'Wetland restoration',
    '3.3': 'NbS potentiality enhancement',
    '3.4': 'Coastal protection',
    '4': ' Climate Risk Identification and Adaptation',
    '4.1': 'Drought mitigation',
    '4.2': 'Erosion reduction',
    '4.3': 'Heat stress mitigation',
    '4.4': 'Vulnerable areas identification',
    '4.5': 'Tools evaluation',
    '4.6': 'Adaptation measures evaluation',
    '4.7': 'Risk and impact assessment',
    '5': ' Pollution Reduction and Environmental Enhancement',
    '5.1': 'Pollution reduction',
    '5.2': 'CO2 retention',
    '5.3': 'Waste reduction',
    '5.4': 'Recycling',
    '6': ' Forest Fire Reduction and Management',
    '6.1': 'Forest fire prevention',
    '6.2': 'Sustainable land use',
    '6.3': 'Forest management',
    '7': ' Urban Planning',
    '7.1': 'Urban farming',
    '7.2': 'Economic protection',
    '7.3': 'Sustainable landuse',
    '8': ' Other Solutions',
    '8.1': 'Disease mitigation',
    '8.2': 'Pest and disease control measures',
    '8.3': 'Data gathering'
  };

  constructor() {}

}
