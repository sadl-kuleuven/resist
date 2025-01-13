import * as L from 'leaflet';

declare module 'leaflet' {
  namespace gridLayer {
    function googleMutant(options: any): L.GridLayer;
  }
}