import { Injectable } from '@angular/core';
import nutsJSON from '../../assets/nuts-labels-sorted.json';
import nutsJSONFeatures from '../../assets/NUTS_LB_2021_3035.json';

import nutsLevel0 from '../../assets/NUTS_RG_01M_2021_4326_LEVL_0.json';
import nutsLevel1 from '../../assets/NUTS_RG_01M_2021_4326_LEVL_1.json';
import nutsLevel2 from '../../assets/NUTS_RG_01M_2021_4326_LEVL_2.json';
import nutsLevel3 from '../../assets/NUTS_RG_01M_2021_4326_LEVL_3.json';
import lauLevel from '../../assets/LAU_CODES.json';

@Injectable({
  providedIn: 'root'
})
export class NutsService {

  nuts = nutsJSON;
  nutsFeatures = nutsJSONFeatures;
  nuts0Labels = [];
  nuts1Labels = [];
  nuts2Labels = [];
  nuts3Labels = [];

  nuts0Active = [];
  nuts1Active = [];
  nuts2Active = [];
  nuts3Active = [];

  nutsActiveGeometry = {
    'type': 'FeatureCollection',
    'features': []
  };

  nuts0Geometry: any = nutsLevel0;
  nuts1Geometry: any = nutsLevel1;
  nuts2Geometry: any = nutsLevel2;
  nuts3Geometry: any = nutsLevel3;

  lauCodes: any = lauLevel;

  nuts0GeometryHash = {};
  nuts1GeometryHash = {};
  nuts2GeometryHash = {};
  nuts3GeometryHash = {};

  lauNamesHash = {};

  constructor() {

    // Sort by latin name
    // this.nuts.sort((a, b) => a.NAME_ENGLISH > b.NAME_ENGLISH && 1 || (a.NAME_LATN > b.NAME_LATN && 1 || -1));

    /*     console.log('NUTS sorted: ');
        console.log(this.nuts); */

    this.nuts.forEach(n => {
      // console.log(n.NUTS_ID);
      if (n.NUTS_ID.length === 2) { // NUTS 0
        this.nuts0Labels.push({
          NUTS_ID: n.NUTS_ID, CNTR_CODE: n.CNTR_CODE,
          NAME_LATN: n.NAME_LATN, NUTS_NAME: n.NUTS_NAME, NAME_ENGLISH: n.NAME_ENGLISH
        })
      } else if (n.NUTS_ID.length === 3) { // NUTS 1
        this.nuts1Labels.push({
          NUTS_ID: n.NUTS_ID, CNTR_CODE: n.CNTR_CODE,
          NAME_LATN: n.NAME_LATN, NUTS_NAME: n.NUTS_NAME, NAME_ENGLISH: n.NAME_ENGLISH
        })
      } else if (n.NUTS_ID.length === 4) { // NUTS 2
        this.nuts2Labels.push({
          NUTS_ID: n.NUTS_ID, CNTR_CODE: n.CNTR_CODE,
          NAME_LATN: n.NAME_LATN, NUTS_NAME: n.NUTS_NAME, NAME_ENGLISH: n.NAME_ENGLISH
        })
      } else if (n.NUTS_ID.length > 4) { // NUTS 3
        this.nuts3Labels.push({
          NUTS_ID: n.NUTS_ID, CNTR_CODE: n.CNTR_CODE,
          NAME_LATN: n.NAME_LATN, NUTS_NAME: n.NUTS_NAME, NAME_ENGLISH: n.NAME_ENGLISH
        })
      }
    });

    // this.nuts0Labels.sort((a, b) => a.NAME_ENGLISH > b.NAME_ENGLISH && 1 || -1 );

    this.nuts1Labels.sort((a, b) => a.NAME_ENGLISH > b.NAME_ENGLISH && 1 || (a.NAME_LATN > b.NAME_LATN && 1 || -1));
    this.nuts2Labels.sort((a, b) => a.NAME_ENGLISH > b.NAME_ENGLISH && 1 || (a.NAME_LATN > b.NAME_LATN && 1 || -1));
    this.nuts3Labels.sort((a, b) => a.NAME_ENGLISH > b.NAME_ENGLISH && 1 || (a.NAME_LATN > b.NAME_LATN && 1 || -1));


    this.nutsFeatures.features.forEach(f => {
      if (f.properties.LEVL_CODE === 0) {
        this.nuts0GeometryHash[f.properties.NUTS_ID] = f;
      } else if (f.properties.LEVL_CODE === 1) {
        this.nuts1GeometryHash[f.properties.NUTS_ID] = f;
      } else if (f.properties.LEVL_CODE === 2) {
        this.nuts2GeometryHash[f.properties.NUTS_ID] = f;
      } else if (f.properties.LEVL_CODE === 3) {
        this.nuts3GeometryHash[f.properties.NUTS_ID] = f;
      }
    });

    this.lauCodes.forEach(f => {
      this.lauNamesHash[f.CNTR_LAU_CODE] = f.LAU_LABEL;
    });

  }

  addGeometriesToHash() {
    this.nuts0Geometry.features.forEach(f => {
      this.nuts0GeometryHash[f.id] = f;
    });

    this.nuts1Geometry.features.forEach(f => {
      this.nuts1GeometryHash[f.id] = f;
    });

    this.nuts2Geometry.features.forEach(f => {
      this.nuts2GeometryHash[f.id] = f;
    });

    this.nuts3Geometry.features.forEach(f => {
      this.nuts3GeometryHash[f.id] = f;
    });
  }


  getFeatureByNUTSID(nutsID): any { // Feature is a point
    let nuts = null;
    this.nutsFeatures.features.forEach(n => {
      if (n.properties.NUTS_ID === nutsID) {
        nuts = n;
      }
    });
    return nuts;
  }

  updateNUTSActive() {
   // console.log('update NUTS active');

    // this.resetGeometryColors();

    this.nutsActiveGeometry = {
      'type': 'FeatureCollection',
      'features': []
    };

    this.nuts0Active.forEach(n => {
      let g = this.nuts0GeometryHash[n.NUTS_ID];
      g.properties.stroke = '#0A6158';
      this.nutsActiveGeometry.features.push(g);
    });

    this.nuts1Active.forEach(n => {
      let g = this.nuts1GeometryHash[n.NUTS_ID];
      g.properties.stroke = '#0E8F82';
      this.nutsActiveGeometry.features.push(g);
    });

    this.nuts2Active.forEach(n => {
      let g = this.nuts2GeometryHash[n.NUTS_ID];
      g.properties.stroke = '#12B5A5';
      this.nutsActiveGeometry.features.push(g);
    });

    this.nuts3Active.forEach(n => {
      let g = this.nuts3GeometryHash[n.NUTS_ID];
      g.properties.stroke = '#18F5DF';
      this.nutsActiveGeometry.features.push(g);
    });

  }

}
