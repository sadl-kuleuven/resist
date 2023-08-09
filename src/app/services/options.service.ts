import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OptionsService {


  scopeVisible = true;
  geoExtVisible = true;
  themAreaVisible = true;
  ogcVisible = true;
  trendVisible = true;
  publicValVisible = true;
  techReadVisible = true;
  natureVisible= true;

  textFilter = '';

  scope = {
    local: false,
    regional: false
  };

  thematicAreas = [
    { name: '1 - General public services', number: 1, active: false, icon: 'road', result: 't01', class: 'color1' },
    { name: '2 - Defence', number: 2, active: false, icon: 'shield', result: 't02', class: 'color2' },
    { name: '3 - Public order and safety', number: 3, active: false, icon: 'fire-extinguisher', result: 't03', class: 'color3' },
    { name: '4 - Economic affairs', number: 4, active: false, icon: 'money', result: 't04', class: 'color4' },
    { name: '5 - Environmental protection', number: 5, active: false, icon: 'tree', result: 't05', class: 'color5' },
    { name: '6 - Housing and community amenities', number: 6, active: false, icon: 'home', result: 't06', class: 'color6' },
    { name: '7 - Health', number: 7, active: false, icon: 'heartbeat', result: 't07', class: 'color7' },
    { name: '8 - Recreation, culture and religion', number: 8, active: false, icon: 'glass', result: 't08', class: 'color8' },
    { name: '9 - Education', number: 9, active: false, icon: 'graduation-cap', result: 't09', class: 'color9' },
    { name: '10 - Social protection', number: 10, active: false, icon: 'street-view', result: 't10', class: 'color10' },
  ];

  ogcAreas = [
    { name: 'Location & Position', active: false, icon: 'map-marker', result: 'w01', class: 'color1' },
    { name: 'Spatial-Temporal Models', active: false, icon: 'map', result: 'w02', class: 'color2' },
    { name: 'Data Science', active: false, icon: 'flask', result: 'w03', class: 'color3' },
    { name: 'Human Interfaces', active: false, icon: 'user', result: 'w04', class: 'color4' },
    { name: 'Physical Geosciences', active: false, icon: 'image', result: 'w05', class: 'color5' },
    { name: 'Societal Geosciences', active: false, icon: 'users', result: 'w06', class: 'color6' },
    { name: 'Sensing and Observations', active: false, icon: 'thermometer', result: 'w07', class: 'color7' },
    { name: 'Computer Engineering', active: false, icon: 'desktop', result: 'w08', class: 'color8' }
  ];

  emergingTech = [
    { name: 'Artificial Intelligence and Machine Learning', active: false, icon: 'cogs', result: 'e01', class: 'color1' },
    { name: 'Cloud Native Computing', active: false, icon: 'cloud', result: 'e02', class: 'color2' },
    { name: 'Edge Computing', active: false, icon: 'laptop', result: 'e03', class: 'color3' },
    { name: 'Blockchain', active: false, icon: 'link', result: 'e04', class: 'color4' },
    { name: 'Immersive Visualisation(VR, MR, AR)', active: false, icon: 'eye', result: 'e05', class: 'color5' },
    { name: 'Connected Autonomous Vehicles', active: false, icon: 'car', result: 'e06', class: 'color6' },
    { name: 'UxS / Drones', active: false, icon: 'paper-plane', result: 'e07', class: 'color7' },
    { name: 'Urban Digital Twins', active: false, icon: 'building', result: 'e08', class: 'color8' },
    { name: '5G Cellular', active: false, icon: 'signal', result: 'e09', class: 'color9' }
  ];

  publicValue = [
    // Operational
    { name: 'Operational', active: false, section: true, result: 'p01', class: 'color1' },
    { name: 'Collaboration', active: false, section: false, result: 'p02' },
    { name: 'Effectiveness', active: false, section: false, result: 'p03' },
    { name: 'Efficiency', active: false, section: false, result: 'p04' },
    { name: 'User-Oriented', active: false, section: false, result: 'p05' },
    // Political
    { name: 'Political', active: false, section: true, result: 'p06', class: 'color2' },
    { name: 'Transparency', active: false, section: false, result: 'p07' },
    { name: 'Accountability', active: false, section: false, result: 'p08' },
    { name: 'Citizen Participation', active: false, section: false, result: 'p09' },
    { name: 'Equity in accessibility', active: false, section: false, result: 'p10' },
    { name: 'Openness', active: false, section: false, result: 'p11' },
    { name: 'Economic Development', active: false, section: false, result: 'p12' },
    // Social
    { name: 'Social', active: false, section: true, result: 'p13', class: 'color3' },
    { name: 'Trust', active: false, section: false, result: 'p14' },
    { name: 'Self Development', active: false, section: false, result: 'p15' },
    { name: 'Quality of life', active: false, section: false, result: 'p16' },
    { name: 'Inclusiveness', active: false, section: false, result: 'p17' },
    { name: 'Environmental sustainability', active: false, section: false, result: 'p18' }

  ];

  themeAreasExpanded = {
    '1': ' General public services',
    '1.1': 'Executive and legislative organs, financial and fiscal affairs, external affairs ',
    '1.2': 'Foreign economic aid',
    '1.3': 'General services',
    '1.4': 'Basic research',
    '1.5': 'R & D General public services',
    '1.6': 'General public services n.e.c.',
    '1.7': 'Public debt transactions',
    '1.8': 'Transfers of a general character between different levels of government',
    '2': ' Defence',
    '2.1': 'Military defence ',
    '2.2': 'Civil defence',
    '2.3': 'Foreign military aid ',
    '2.4': 'R & D Defence ',
    '2.5': 'Defence n.e.c.',
    '3': ' Public order and safety ',
    '3.1': 'Police services',
    '3.2': 'Fire - protection services ',
    '3.3': 'Law courts',
    '3.4': 'Prisons',
    '3.5': 'R & D Public order and safety ',
    '3.6': 'Public order and safety n.e.c.',
    '4': ' Economic affairs',
    '4.1': 'General economic, commercial and labour affairs ',
    '4.2': 'Agriculture, forestry, fishing and hunting',
    '4.3': 'Fuel and energy',
    '4.4': 'Mining, manufacturing and construction',
    '4.5': 'Transport',
    '4.6': 'Communication',
    '4.7': 'Other industries',
    '4.8': 'R & D Economic affairs',
    '4.9': 'Economic affairs n.e.c.',
    '5': ' Environmental protection ',
    '5.1': 'Waste management',
    '5.2': 'Waste water management ',
    '5.3': 'Pollution abatement',
    '5.4': 'Protection of biodiversity and landscape ',
    '5.5': 'R & D Environmental protection',
    '5.6': 'Environmental protection n.e.c.',
    '6': ' Housing and community amenities ',
    '6.1': 'Housing development',
    '6.2': 'Community development',
    '6.3': 'Water supply',
    '6.4': 'Street lighting',
    '6.5': 'R & D Housing and community amenities ',
    '6.6': 'Housing and community amenities n.e.c.',
    '7': ' Health',
    '7.1': 'Medical products, appliances and equipment ',
    '7.2': 'Outpatient services',
    '7.3': 'Hospital services',
    '7.4': 'Public health services',
    '7.5': 'R & D Health',
    '7.6': 'Health n.e.c.',
    '8': ' Recreation, culture and religion',
    '8.1': 'Recreational and sporting services',
    '8.2': 'Cultural services',
    '8.3': 'Broadcasting and publishing services ',
    '8.4': 'Religious and other community services ',
    '8.5': 'R & D Recreation, culture and religion ',
    '8.6': 'Recreation, culture and religion n.e.c.',
    '9': ' Education',
    '9.1': 'Pre - primary and primary education ',
    '9.2': 'Secondary education',
    '9.3': 'Post - secondary non - tertiary education ',
    '9.4': 'Tertiary education',
    '9.5': 'Education not definable by level ',
    '9.6': 'Subsidiary services to education ',
    '9.7': 'R & D Education',
    '9.8': 'Education n.e.c.',
    '10': ' Social protection',
    '10.1': 'Sickness and disability ',
    '10.2': 'Old age',
    '10.3': 'Survivors',
    '10.4': 'Family and children ',
    '10.5': 'Unemployment',
    '10.6': 'Housing',
    '10.7': 'Social exclusion n.e.c. ',
    '10.8': 'R & D Social protection ',
    '10.9': 'Social protection n.e.c.'
  };

  readiness = {
    r01: false,
    r02: false,
    r03: false,
    r04: false
  };

  natureSolution =[
    { name: 'Green Infrastructure', active: false, icon: 'tree', result: 's01', class: 'color1' },
    { name: 'Ecosystem Restoration', active: false, icon: 'cloud', result: 's02', class: 'color2' },
    { name: 'Sustainable Agriculture', active: false, icon: 'laptop', result: 's03', class: 'color3' },
    { name: 'Sustainable Land Management', active: false, icon: 'link', result: 's04', class: 'color4' },
    { name: 'Nature-Based Tourism', active: false, icon: 'eye', result: 's05', class: 'color5' },
    { name: 'Biodiversity Conservation', active: false, icon: 'seeding', result: 's06', class: 'color6' },
    { name: 'Renewable energy', active: false, icon: 'wind', result: 's07', class: 'color7' },
    { name: 'Nature-Based Flood Management', active: false, icon: 'water', result: 's08', class: 'color8' },
    { name: 'Reforestation and Afforestation', active: false, icon: 'trees', result: 's09', class: 'color9' }
  ];

  constructor() {}

}
