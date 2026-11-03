import * as L from 'leaflet';

declare module 'leaflet' {
  namespace Routing {
    interface Waypoint {
      latLng: L.LatLng;
      name?: string;
    }

    interface RouteSummary {
      totalDistance: number;
      totalTime: number;
    }

    interface IRoute {
      name?: string;
      summary: RouteSummary;
      coordinates: L.LatLng[];
    }

    interface RoutesFoundEvent {
      routes: IRoute[];
    }

    interface RoutingControlOptions {
      waypoints?: L.LatLng[];
      routeWhileDragging?: boolean;
      addWaypoints?: boolean;
      draggableWaypoints?: boolean;
      fitSelectedRoutes?: boolean;
      showAlternatives?: boolean;
      show?: boolean;
      collapsible?: boolean;
      lineOptions?: {
        styles?: L.PathOptions[];
        extendToWaypoints?: boolean;
        missingRouteTolerance?: number;
      };
      createMarker?: () => L.Marker | null;
      router?: unknown;
    }

    class Control extends L.Control {
      constructor(options?: RoutingControlOptions);
      setWaypoints(waypoints: L.LatLng[]): this;
      on(type: 'routesfound', fn: (e: RoutesFoundEvent) => void): this;
      on(type: 'routingerror', fn: (e: unknown) => void): this;
      on(type: string, fn: (e: unknown) => void): this;
    }

    function control(options?: RoutingControlOptions): Control;
    function osrmv1(options?: { serviceUrl?: string; profile?: string; timeout?: number }): unknown;
  }
}

