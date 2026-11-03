import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// leaflet-routing-machine UMD bundle expects global window.L in ESM environments
if (typeof window !== 'undefined') {
  (window as unknown as { L: typeof L }).L = L;
}

export default L;

