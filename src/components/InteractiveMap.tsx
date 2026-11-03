import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from '../utils/leafletSetup';
import 'leaflet-routing-machine';
import {
  Clock,
  Compass,
  Layers,
  LocateFixed,
  Navigation,
  Plus,
  Minus,
  Route as RouteIcon,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCategoryMeta, getIconSvgString } from '../utils/icons';
import { formatDistance } from '../utils/geo';
import { getOsmTileConfig, OSM_TILE_LAYERS } from '../utils/osm';
import { useDeviceTier } from '../utils/useDeviceTier';

export const InteractiveMap: React.FC = () => {
  const {
    branding,
    locations,
    currentUser,
    selectedCategory,
    selectedLocation,
    setSelectedLocationId,
    hoveredLocationId,
    osmLayerStyle,
    setOsmLayerStyle,
    mapFocusTarget,
    flyToCoords,
    userCoords,
    gpsSource,
    isLocatingGps,
    locateMyGps,
    activeRoute,
    updateRouteMetrics,
    clearActiveRoute,
  } = useApp();

  const deviceTier = useDeviceTier();
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userAccuracyCircleRef = useRef<L.Circle | null>(null);
  const routingControlRef = useRef<L.Routing.Control | null>(null);
  const fallbackLineRef = useRef<L.Polyline | null>(null);
  const deviceTierRef = useRef(deviceTier);
  deviceTierRef.current = deviceTier;

  const filteredLocations = useMemo(() => {
    if (selectedCategory === 'all') return locations;
    return locations.filter((l) => l.category === selectedCategory);
  }, [locations, selectedCategory]);

  // 1. Initialize Leaflet Map with Official OpenStreetMap Tiles + ResizeObserver
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [branding.defaultCenter.lat, branding.defaultCenter.lng],
      zoom: branding.defaultCenter.zoom,
      zoomControl: false,
    });

    const osmCfg = getOsmTileConfig(osmLayerStyle);
    tileLayerRef.current = L.tileLayer(osmCfg.url, {
      attribution: osmCfg.attribution,
      maxZoom: osmCfg.maxZoom,
      subdomains: osmCfg.subdomains ?? 'abc',
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCursorCoords({
        lat: Number(e.latlng.lat.toFixed(5)),
        lng: Number(e.latlng.lng.toFixed(5)),
      });
    });

    // Automatically recalculate OSM tile viewport whenever layout shifts across devices
    const ro = new ResizeObserver(() => {
      map.invalidateSize({ animate: false });
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
      markersLayerRef.current = null;
      radiusCircleRef.current = null;
      userMarkerRef.current = null;
      userAccuracyCircleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Dynamic OpenStreetMap Layer Switching (Standard / Humanitarian / Topo)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }
    const osmCfg = getOsmTileConfig(osmLayerStyle);
    tileLayerRef.current = L.tileLayer(osmCfg.url, {
      attribution: osmCfg.attribution,
      maxZoom: osmCfg.maxZoom,
      subdomains: osmCfg.subdomains ?? 'abc',
    }).addTo(map);
  }, [osmLayerStyle]);

  // 3. Programmatic flyTo when mapFocusTarget changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapFocusTarget) return;
    map.flyTo([mapFocusTarget.lat, mapFocusTarget.lng], mapFocusTarget.zoom ?? 15, {
      duration: 0.75,
    });
  }, [mapFocusTarget]);

  // 4. Render Prominent User Position Icon Marker + Accuracy Circle + "📍 Posisi Anda" Label
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const userSvgIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    `;

    const gpsIcon = L.divIcon({
      className: 'user-gps-marker',
      html: `
        <div class="gps-user-wrapper" title="Posisi Anda Saat Ini">
          <div class="gps-dot-container">
            <div class="gps-pulse"></div>
            <div class="gps-core">
              ${userSvgIcon}
            </div>
            <div class="gps-direction-dot"></div>
          </div>
          <div class="gps-user-label">📍 Posisi Anda</div>
        </div>
      `,
      iconSize: [128, 74],
      iconAnchor: [64, 28],
    });

    const sourceLabel =
      gpsSource === 'browser-gps'
        ? 'GPS Perangkat Aktif'
        : gpsSource === 'demo-teleport'
        ? 'Titik Simulasi Demo Juri'
        : 'Titik Posisi Awal Kota Langsa';

    const popupHtml = `
      <div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:190px;padding:2px;">
        <div style="font-size:11px;font-weight:800;color:#059669;text-transform:uppercase;letter-spacing:0.04em;">
          📍 Titik Posisi Anda Saat Ini
        </div>
        <div style="font-size:12px;font-weight:800;color:#0f172a;margin-top:2px;">
          ${currentUser ? currentUser.name : 'Pengunjung Wisata'}
        </div>
        <div style="font-size:10.5px;font-weight:600;color:#475569;margin-top:2px;">
          ${sourceLabel}
        </div>
        <div style="font-family:monospace;font-size:10px;font-weight:700;color:#0f172a;background:#f1f5f9;padding:3px 6px;border-radius:6px;margin-top:5px;">
          Lat: ${userCoords.lat.toFixed(6)}<br/>Lng: ${userCoords.lng.toFixed(6)}
        </div>
      </div>
    `;

    if (!userMarkerRef.current || !map.hasLayer(userMarkerRef.current)) {
      userMarkerRef.current = L.marker([userCoords.lat, userCoords.lng], {
        icon: gpsIcon,
        zIndexOffset: 2500,
      })
        .bindPopup(popupHtml, { offset: [0, -16] })
        .addTo(map);
    } else {
      userMarkerRef.current.setLatLng([userCoords.lat, userCoords.lng]);
      userMarkerRef.current.setIcon(gpsIcon);
      userMarkerRef.current.setPopupContent(popupHtml);
    }

    if (!userAccuracyCircleRef.current || !map.hasLayer(userAccuracyCircleRef.current)) {
      userAccuracyCircleRef.current = L.circle([userCoords.lat, userCoords.lng], {
        radius: 110,
        color: '#10b981',
        weight: 2,
        dashArray: '5 5',
        fillColor: '#10b981',
        fillOpacity: 0.14,
      }).addTo(map);
    } else {
      userAccuracyCircleRef.current.setLatLng([userCoords.lat, userCoords.lng]);
    }
  }, [currentUser, gpsSource, userCoords]);

  // 5. Render Tourism Spot Markers + Hover Highlight + Geofence Radius Circle
  useEffect(() => {
    const map = mapRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
      radiusCircleRef.current = null;
    }

    const unlockedSet = new Set(currentUser?.unlockedLocationIds ?? []);

    filteredLocations.forEach((spot) => {
      const isUnlocked = unlockedSet.has(spot.id);
      const isSelected = selectedLocation?.id === spot.id;
      const isHovered = hoveredLocationId === spot.id;
      const catMeta = getCategoryMeta(spot.category);
      const pinColor = isSelected
        ? branding.primaryColor
        : isHovered
        ? branding.accentColor
        : isUnlocked
        ? branding.primaryColor
        : catMeta.defaultColor;

      const iconName = spot.pinIcon || branding.categoryIcons[spot.category] || 'map-pin';
      const svgMarkup = getIconSvgString(iconName, '#ffffff', 19);

      const pinHtml = `
        <div class="pin-wrapper ${isSelected ? 'is-selected' : ''} ${
        isHovered ? 'is-hovered' : ''
      }">
          <div style="position:relative;">
            <div class="pin-bubble" style="background:${pinColor};">
              <div class="pin-bubble-inner">${svgMarkup}</div>
            </div>
            ${
              isUnlocked
                ? `<div class="pin-unlocked-badge" title="Wilayah Terbuka">✓</div>`
                : ''
            }
          </div>
          <div class="pin-label">${spot.name}</div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-tourism-marker',
        html: pinHtml,
        iconSize: [148, 70],
        iconAnchor: [74, 50],
      });

      const marker = L.marker([spot.lat, spot.lng], {
        icon: customIcon,
        zIndexOffset: isSelected || isHovered ? 900 : isUnlocked ? 400 : 100,
      });

      marker.on('click', () => {
        setSelectedLocationId(spot.id);
        const tier = deviceTierRef.current;
        if (tier === 'mobile') {
          // Offset south on mobile so marker sits above bottom sheet
          map.flyTo([spot.lat - 0.0032, spot.lng], Math.max(map.getZoom(), 15), {
            duration: 0.65,
          });
        } else {
          map.flyTo([spot.lat, spot.lng], Math.max(map.getZoom(), 15), {
            duration: 0.65,
          });
        }
      });

      marker.addTo(layer);
    });

    if (selectedLocation) {
      radiusCircleRef.current = L.circle([selectedLocation.lat, selectedLocation.lng], {
        radius: selectedLocation.radiusMeters,
        color: branding.primaryColor,
        weight: 2.2,
        dashArray: '6 6',
        fillColor: branding.primaryColor,
        fillOpacity: 0.14,
      }).addTo(map);
    }
  }, [
    branding.accentColor,
    branding.categoryIcons,
    branding.primaryColor,
    currentUser?.unlockedLocationIds,
    filteredLocations,
    hoveredLocationId,
    selectedLocation,
    setSelectedLocationId,
  ]);

  // 6. OpenStreetMap Road Routing (OSRM via Leaflet Routing Machine + Fallback)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (routingControlRef.current) {
      try {
        map.removeControl(routingControlRef.current);
      } catch {
        // ignore
      }
      routingControlRef.current = null;
    }
    if (fallbackLineRef.current) {
      fallbackLineRef.current.remove();
      fallbackLineRef.current = null;
    }

    if (!activeRoute) return;

    const fromLatLng = L.latLng(activeRoute.from.lat, activeRoute.from.lng);
    const toLatLng = L.latLng(activeRoute.to.lat, activeRoute.to.lng);

    fallbackLineRef.current = L.polyline([fromLatLng, toLatLng], {
      color: branding.primaryColor,
      weight: 5,
      opacity: 0.78,
      dashArray: '10, 10',
    }).addTo(map);

    const padBottom = deviceTierRef.current === 'mobile' ? 250 : 90;
    map.fitBounds(L.latLngBounds([fromLatLng, toLatLng]), {
      paddingTopLeft: [50, 110],
      paddingBottomRight: [50, padBottom],
    });

    try {
      const control = L.Routing.control({
        waypoints: [fromLatLng, toLatLng],
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: false,
        showAlternatives: false,
        show: false,
        createMarker: () => null,
        lineOptions: {
          styles: [
            { color: '#ffffff', opacity: 0.92, weight: 9 },
            { color: branding.primaryColor, opacity: 0.96, weight: 6 },
          ],
          extendToWaypoints: true,
          missingRouteTolerance: 0,
        },
      });

      control.on('routesfound', (e) => {
        if (fallbackLineRef.current) {
          fallbackLineRef.current.remove();
          fallbackLineRef.current = null;
        }
        const best = e.routes?.[0];
        if (best?.summary) {
          updateRouteMetrics(
            Math.round(best.summary.totalDistance),
            Math.max(1, Math.round(best.summary.totalTime / 60)),
            false
          );
        }
      });

      control.on('routingerror', () => {
        updateRouteMetrics(
          activeRoute.distanceMeters,
          activeRoute.durationMinutes,
          true
        );
      });

      control.addTo(map);
      routingControlRef.current = control;
    } catch {
      // Fallback line remains drawn
    }

    return () => {
      if (routingControlRef.current && mapRef.current) {
        try {
          mapRef.current.removeControl(routingControlRef.current);
        } catch {
          // ignore
        }
        routingControlRef.current = null;
      }
      if (fallbackLineRef.current) {
        fallbackLineRef.current.remove();
        fallbackLineRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeRoute?.destinationId,
    activeRoute?.from.lat,
    activeRoute?.from.lng,
    activeRoute?.to.lat,
    activeRoute?.to.lng,
    branding.primaryColor,
  ]);

  const currentOsmLayer = getOsmTileConfig(osmLayerStyle);

  return (
    <div className="relative h-full w-full flex-1 select-none overflow-hidden bg-slate-200">
      {/* OpenStreetMap Interactive Canvas */}
      <div ref={containerRef} className="h-full w-full z-0" />

      {/* Active Route Floating Navigation HUD (Device-positioned) */}
      {activeRoute && (
        <div className="pointer-events-auto absolute inset-x-3 top-[116px] md:inset-x-auto md:left-1/2 md:top-4 md:w-[380px] md:-translate-x-1/2 z-[450] animate-pop-in">
          <div className="flex items-center justify-between gap-2.5 rounded-2xl border border-white/15 bg-[#071A3E]/95 px-3.5 py-2.5 text-white shadow-floating backdrop-blur-md">
            <div className="flex min-w-0 items-center gap-2.5">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-950 font-bold"
                style={{ backgroundColor: branding.accentColor }}
              >
                <Navigation className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-white">
                  Rute OSM → {activeRoute.destinationName}
                </p>
                <div className="mt-0.5 flex items-center gap-3 text-[11px] font-semibold text-amber-300">
                  <span className="inline-flex items-center gap-1">
                    <RouteIcon className="h-3 w-3" />
                    {formatDistance(activeRoute.distanceMeters)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />~{activeRoute.durationMinutes} menit
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={clearActiveRoute}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white transition hover:bg-white/25"
              title="Hapus Rute"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top-Right (Tablet/Desktop) OpenStreetMap Style Switcher */}
      <div
        className={`hidden md:flex pointer-events-auto absolute top-4 z-[450] items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white/95 p-1.5 shadow-floating backdrop-blur-md transition-all ${
          deviceTier === 'tablet' && selectedLocation ? 'right-[390px]' : 'right-4'
        }`}
      >
        {OSM_TILE_LAYERS.map((layer) => {
          const active = osmLayerStyle === layer.id;
          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => setOsmLayerStyle(layer.id)}
              title={layer.description}
              className={`rounded-xl px-2.5 py-1.5 text-[11px] font-extrabold transition ${
                active
                  ? 'text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              style={active ? { backgroundColor: branding.primaryColor } : undefined}
            >
              {layer.shortName}
            </button>
          );
        })}
      </div>

      {/* Desktop Bottom-Left Live OpenStreetMap Telemetry HUD + Quick Focus User Location */}
      <div className="hidden lg:flex pointer-events-auto absolute bottom-4 left-4 z-[440] items-center gap-2 rounded-xl border border-slate-200/90 bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-floating backdrop-blur-md">
        <span
          className="h-2 w-2 rounded-full animate-pulse"
          style={{ backgroundColor: branding.primaryColor }}
        />
        <span className="font-extrabold text-slate-900">{currentOsmLayer.name}</span>
        <span className="text-slate-300">|</span>
        <button
          type="button"
          onClick={() => {
            flyToCoords(userCoords.lat, userCoords.lng, 16);
            userMarkerRef.current?.openPopup();
          }}
          className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-0.5 text-[10.5px] font-extrabold text-blue-700 transition hover:bg-blue-100"
          title="Pusatkan ke Titik Lokasi Anda"
        >
          <span>📍 Lokasi Anda ({userCoords.lat.toFixed(4)}, {userCoords.lng.toFixed(4)})</span>
        </button>
        {cursorCoords && (
          <>
            <span className="text-slate-300">|</span>
            <span className="font-mono text-[10px] text-slate-500">
              Kursor: {cursorCoords.lat}, {cursorCoords.lng}
            </span>
          </>
        )}
      </div>

      {/* Right-Side Map Controls (Zoom, OSM Layer Popover on Mobile, Reset Kota, My GPS)
          Hidden on mobile when BottomSheet is open to prevent overlapping */}
      <div
        className={`pointer-events-auto absolute z-[440] flex-col items-end gap-2 transition-all duration-300 ${
          deviceTier === 'mobile'
            ? selectedLocation
              ? 'hidden'
              : 'flex right-3 bottom-[84px]'
            : deviceTier === 'tablet'
            ? selectedLocation
              ? 'flex right-[390px] bottom-6'
              : 'flex right-4 bottom-28'
            : 'flex right-4 bottom-6'
        }`}
      >
        {/* Mobile OSM Layer Switcher Button */}
        <div className="relative md:hidden">
          <button
            type="button"
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            title="Gaya Peta OpenStreetMap"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-floating active:scale-95"
          >
            <Layers className="h-5 w-5" />
          </button>

          {showLayerMenu && (
            <div className="absolute bottom-0 right-12 mr-1 w-44 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-floating animate-pop-in">
              <p className="px-2 py-1 text-[9.5px] font-extrabold uppercase text-slate-500">
                Peta OpenStreetMap
              </p>
              {OSM_TILE_LAYERS.map((layer) => (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => {
                    setOsmLayerStyle(layer.id);
                    setShowLayerMenu(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs font-bold ${
                    osmLayerStyle === layer.id
                      ? 'text-white'
                      : 'text-slate-800 hover:bg-slate-100'
                  }`}
                  style={
                    osmLayerStyle === layer.id
                      ? { backgroundColor: branding.primaryColor }
                      : undefined
                  }
                >
                  <span>{layer.shortName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tablet & Desktop Zoom Buttons */}
        <div className="hidden md:flex w-10 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-floating">
          <button
            type="button"
            onClick={() => mapRef.current?.zoomIn()}
            title="Perbesar Peta"
            className="flex h-10 w-10 items-center justify-center border-b border-slate-100 text-slate-800 transition hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => mapRef.current?.zoomOut()}
            title="Perkecil Peta"
            className="flex h-10 w-10 items-center justify-center text-slate-800 transition hover:bg-slate-50"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() =>
            flyToCoords(
              branding.defaultCenter.lat,
              branding.defaultCenter.lng,
              branding.defaultCenter.zoom
            )
          }
          title="Pusatkan Wilayah Kota"
          className="flex h-11 w-11 md:h-10 md:w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-floating transition hover:bg-slate-50 active:scale-95"
        >
          <Compass className="h-5 w-5 md:h-4 md:w-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            flyToCoords(userCoords.lat, userCoords.lng, 16);
            userMarkerRef.current?.openPopup();
            locateMyGps();
          }}
          disabled={isLocatingGps}
          title="Ke Titik Posisi Saya (GPS)"
          className="flex h-11 w-11 md:h-10 md:w-10 items-center justify-center rounded-2xl border-2 border-emerald-600 bg-emerald-600 text-white shadow-floating transition hover:bg-emerald-700 active:scale-95"
        >
          <LocateFixed
            className={`h-5 w-5 md:h-4 md:w-4 ${isLocatingGps ? 'animate-spin' : ''}`}
          />
        </button>
      </div>
    </div>
  );
};
