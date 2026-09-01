import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type MutableRefObject,
} from 'react';
import L from 'leaflet';
import type { Department } from '../data/departments';

// Fix default icon paths broken by bundlers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type DrawMode =
  | null
  | 'polyline'
  | 'polygon-transparent'
  | 'polygon-solid'
  | 'marker'
  | 'select';

type MapSurface =
  | 'lands-2d'
  | 'lands-3d'
  | 'satellite'
  | 'dark'
  | 'google-2d'
  | 'google-3d';

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  imageUrl?: string;
  color: string;
}

interface MarkerModalData {
  lat: number;
  lng: number;
}

interface MapViewProps {
  selectedDept: Department | null;
  activeLayers: Record<string, boolean>;
}

interface GoogleMapsApi {
  maps: any;
}

const HK_CENTER: [number, number] = [22.3193, 114.1694];
const HK_ZOOM = 12;
const LANDS_3D_URL = 'https://3d.map.gov.hk/mapviewer/app/?l=zh-HK';
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() ?? '';
const GOOGLE_MAPS_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID?.trim() ?? '';
const GOOGLE_MAPS_3D_MAP_ID =
  import.meta.env.VITE_GOOGLE_MAPS_3D_MAP_ID?.trim() ?? GOOGLE_MAPS_MAP_ID;

let googleMapsApiPromise: Promise<GoogleMapsApi> | null = null;

function loadGoogleMapsApi(apiKey: string): Promise<GoogleMapsApi> {
  if (!apiKey) {
    return Promise.reject(new Error('尚未設定 Google Maps API key。'));
  }

  const globalWindow = window as Window &
    typeof globalThis & {
      google?: GoogleMapsApi;
      [key: string]: unknown;
    };

  if (globalWindow.google?.maps) {
    return Promise.resolve(globalWindow.google);
  }

  if (googleMapsApiPromise) {
    return googleMapsApiPromise;
  }

  googleMapsApiPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      'script[data-google-maps-loader="true"]'
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (globalWindow.google?.maps) {
          resolve(globalWindow.google);
          return;
        }
        googleMapsApiPromise = null;
        reject(new Error('Google Maps API 已載入，但地圖物件不可用。'));
      });
      existingScript.addEventListener('error', () => {
        googleMapsApiPromise = null;
        reject(new Error('Google Maps API 載入失敗。'));
      });
      return;
    }

    const callbackName = `__googleMapsInit_${Date.now()}`;
    globalWindow[callbackName] = () => {
      if (globalWindow.google?.maps) {
        resolve(globalWindow.google);
      } else {
        googleMapsApiPromise = null;
        reject(new Error('Google Maps API 初始化失敗。'));
      }
      delete globalWindow[callbackName];
    };

    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.dataset.googleMapsLoader = 'true';
    script.onerror = () => {
      googleMapsApiPromise = null;
      delete globalWindow[callbackName];
      reject(new Error('Google Maps API 載入失敗。'));
    };

    const params = new URLSearchParams({
      key: apiKey,
      v: 'weekly',
      loading: 'async',
      language: 'zh-TW',
      region: 'HK',
      callback: callbackName,
    });

    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    document.head.appendChild(script);
  });

  return googleMapsApiPromise;
}

function toGoogleCenter(center: [number, number]) {
  return { lat: center[0], lng: center[1] };
}

function mapZoomTo3DRange(zoom: number) {
  return Math.max(1800, 220000 / Math.pow(2, zoom - 7));
}

function getCameraStatusLabel(status: string) {
  if (status === 'online') return '運作中';
  if (status === 'offline') return '離線';
  return '維護中';
}

function getCameraStatusColor(status: string) {
  if (status === 'online') return '#22c55e';
  if (status === 'offline') return '#f43f5e';
  return '#f59e0b';
}

export default function MapView({ selectedDept, activeLayers }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const google2DContainerRef = useRef<HTMLDivElement>(null);
  const google3DContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup>(new L.FeatureGroup());
  const tempPointsRef = useRef<L.LatLng[]>([]);
  const tempLayerRef = useRef<L.Layer | null>(null);
  const tempMarkersRef = useRef<L.Marker[]>([]);
  const deptMarkersRef = useRef<L.LayerGroup>(L.layerGroup());
  const mapMarkersLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const basemapLayerRef = useRef<L.TileLayer | null>(null);
  // 標籤圖層因 CORS 問題已移除
  const googleMapRef = useRef<any>(null);
  const googleInfoWindowRef = useRef<any>(null);
  const googleMarkersRef = useRef<any[]>([]);
  const google3DMapRef = useRef<any>(null);

  const [drawMode, setDrawMode] = useState<DrawMode>(null);
  const [markerModal, setMarkerModal] = useState<MarkerModalData | null>(null);
  const [markerTitle, setMarkerTitle] = useState('');
  const [markerColor, setMarkerColor] = useState('#00c8ff');
  const [markerImage, setMarkerImage] = useState<string | null>(null);
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);
  const [fillColor, setFillColor] = useState('#00c8ff');
  const [strokeColor, setStrokeColor] = useState('#00c8ff');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [mapSurface, setMapSurface] = useState<MapSurface>('lands-2d');
  const [googleError, setGoogleError] = useState<string | null>(null);
  const drawModeRef = useRef<DrawMode>(null);
  const fillColorRef = useRef(fillColor);
  const strokeColorRef = useRef(strokeColor);
  const strokeWidthRef = useRef(strokeWidth);

  const isGoogleSurface =
    mapSurface === 'google-2d' || mapSurface === 'google-3d';
  const isReadOnlySurface = isGoogleSurface || mapSurface === 'lands-3d';
  const googleUnavailableMessage = !GOOGLE_MAPS_API_KEY
    ? '請先設定 VITE_GOOGLE_MAPS_API_KEY，才能切換到 Google 地圖。'
    : googleError;

  useEffect(() => {
    drawModeRef.current = drawMode;
  }, [drawMode]);

  useEffect(() => {
    fillColorRef.current = fillColor;
  }, [fillColor]);

  useEffect(() => {
    strokeColorRef.current = strokeColor;
  }, [strokeColor]);

  useEffect(() => {
    strokeWidthRef.current = strokeWidth;
  }, [strokeWidth]);

  const clearGoogleMarkers = useCallback(() => {
    googleMarkersRef.current.forEach(marker => {
      if (typeof marker.setMap === 'function') {
        marker.setMap(null);
      } else {
        marker.map = null;
      }
    });
    googleMarkersRef.current = [];
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: HK_CENTER,
      zoom: HK_ZOOM,
      zoomControl: false,
      attributionControl: true,
    });

    const hkLayer = L.tileLayer(
      'https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz/basemap/wgs84/{z}/{x}/{y}.png',
      {
        attribution: '© <a href="https://www.geodata.gov.hk">地政總署</a>',
        maxZoom: 19,
        crossOrigin: true,
      }
    );
    hkLayer.addTo(map);
    basemapLayerRef.current = hkLayer;

    // 標籤圖層因 CORS 問題已移除

    drawnItemsRef.current.addTo(map);
    deptMarkersRef.current.addTo(map);
    mapMarkersLayerRef.current.addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.scale({ position: 'bottomright', imperial: false }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      const mode = drawModeRef.current;
      if (
        mode === 'polyline' ||
        mode === 'polygon-transparent' ||
        mode === 'polygon-solid'
      ) {
        tempPointsRef.current.push(e.latlng);
        updateTempShape(map, mode, tempLayerRef, tempPointsRef, tempMarkersRef);
        const vm = L.circleMarker(e.latlng, {
          radius: 4,
          color: '#00c8ff',
          fillColor: '#00c8ff',
          fillOpacity: 1,
          weight: 1,
        }).addTo(map);
        tempMarkersRef.current.push(vm as unknown as L.Marker);
      } else if (mode === 'marker') {
        setMarkerModal({ lat: e.latlng.lat, lng: e.latlng.lng });
        setMarkerTitle('');
        setMarkerImage(null);
      }
    });

    map.on('dblclick', (e: L.LeafletMouseEvent) => {
      const mode = drawModeRef.current;
      if (
        (mode === 'polyline' ||
          mode === 'polygon-transparent' ||
          mode === 'polygon-solid') &&
        tempPointsRef.current.length >= 2
      ) {
        e.originalEvent.preventDefault();
        finishShape(
          map,
          mode,
          drawnItemsRef,
          tempLayerRef,
          tempPointsRef,
          tempMarkersRef,
          strokeColorRef,
          fillColorRef,
          strokeWidthRef
        );
        setDrawMode(null);
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const container = mapRef.current.getContainer();

    if (drawMode && drawMode !== 'select') {
      container.style.cursor = 'crosshair';
      if (drawMode !== 'marker') {
        mapRef.current.doubleClickZoom.disable();
      }
    } else {
      container.style.cursor = '';
      mapRef.current.doubleClickZoom.enable();
      if (tempLayerRef.current && mapRef.current) {
        mapRef.current.removeLayer(tempLayerRef.current);
        tempLayerRef.current = null;
      }
      tempMarkersRef.current.forEach(marker => mapRef.current?.removeLayer(marker));
      tempMarkersRef.current = [];
      tempPointsRef.current = [];
    }
  }, [drawMode]);

  useEffect(() => {
    if (isReadOnlySurface && drawMode) {
      setDrawMode(null);
    }
  }, [drawMode, isReadOnlySurface]);

  // Switch Leaflet basemap
  useEffect(() => {
    if (!mapRef.current) return;
    if (
      mapSurface === 'google-2d' ||
      mapSurface === 'google-3d' ||
      mapSurface === 'lands-3d'
    ) {
      return;
    }

    const map = mapRef.current;

    if (basemapLayerRef.current) map.removeLayer(basemapLayerRef.current);
    // 標籤圖層因 CORS 問題已移除，不再需要移除

    let newBase: L.TileLayer;
    if (mapSurface === 'lands-2d') {
      newBase = L.tileLayer(
        'https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz/basemap/wgs84/{z}/{x}/{y}.png',
        {
          attribution: '© <a href="https://www.geodata.gov.hk">地政總署</a>',
          maxZoom: 19,
          crossOrigin: true,
        }
      );
    } else if (mapSurface === 'satellite') {
      newBase = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: '© Esri', maxZoom: 19 }
      );
    } else {
      newBase = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        { attribution: '© CartoDB', maxZoom: 19, subdomains: 'abcd' }
      );
    }

    newBase.addTo(map);
    basemapLayerRef.current = newBase;

    // 標籤圖層因 CORS 問題已移除
  }, [mapSurface]);

  // Fly to selected department on Leaflet
  useEffect(() => {
    if (!mapRef.current || !selectedDept) return;
    mapRef.current.flyTo(selectedDept.mapCenter, selectedDept.mapZoom, {
      duration: 1.5,
    });

    deptMarkersRef.current.clearLayers();
    selectedDept.cctvCameras.forEach(cam => {
      const camIcon = L.divIcon({
        html: `
          <div style="
            width:28px;height:28px;border-radius:50%;
            background:${getCameraStatusColor(cam.status)};
            border:2px solid #0c1228;
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 0 8px ${cam.status === 'online' ? '#22c55e88' : '#00000088'};
            font-size:12px;
          ">📹</div>
        `,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      const marker = L.marker([cam.lat, cam.lng], { icon: camIcon });
      marker.bindPopup(
        `
          <div style="font-family:'Noto Sans HK',sans-serif;min-width:180px;">
            <div style="font-size:12px;font-weight:600;color:#dde4f0;margin-bottom:4px;">${cam.nameZh}</div>
            <div style="font-size:11px;color:#506070;margin-bottom:6px;">${cam.name}</div>
            <div style="display:flex;align-items:center;gap:6px;">
              <div style="width:8px;height:8px;border-radius:50%;background:${getCameraStatusColor(cam.status)};"></div>
              <span style="font-size:11px;color:${getCameraStatusColor(cam.status)};">${getCameraStatusLabel(cam.status)}</span>
            </div>
            <div style="font-size:10px;color:#506070;margin-top:4px;font-family:'JetBrains Mono',monospace;">${cam.lat.toFixed(4)}, ${cam.lng.toFixed(4)}</div>
          </div>
        `,
        { maxWidth: 220 }
      );
      deptMarkersRef.current.addLayer(marker);
    });
  }, [selectedDept]);

  // Google 2D map
  useEffect(() => {
    if (mapSurface !== 'google-2d') return;
    if (!google2DContainerRef.current) return;

    let cancelled = false;

    void (async () => {
      if (!GOOGLE_MAPS_API_KEY) {
        setGoogleError('Google Maps API key 未設定');
        return;
      }

      try {
        setGoogleError(null);
        const google = await loadGoogleMapsApi(GOOGLE_MAPS_API_KEY);
        const { Map } = await google.maps.importLibrary('maps');
        if (cancelled) return;

        const center = toGoogleCenter(selectedDept?.mapCenter ?? HK_CENTER);
        const zoom = selectedDept?.mapZoom ?? HK_ZOOM;

        if (!googleMapRef.current) {
          googleMapRef.current = new Map(google2DContainerRef.current, {
            center,
            zoom,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            gestureHandling: 'greedy',
            mapId: GOOGLE_MAPS_MAP_ID || undefined,
          });
          googleInfoWindowRef.current = new google.maps.InfoWindow();
        } else {
          googleMapRef.current.setCenter(center);
          googleMapRef.current.setZoom(zoom);
        }

        clearGoogleMarkers();

        if (selectedDept) {
          selectedDept.cctvCameras.forEach(cam => {
            const marker = new google.maps.Marker({
              map: googleMapRef.current,
              position: { lat: cam.lat, lng: cam.lng },
              title: cam.nameZh,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: getCameraStatusColor(cam.status),
                fillOpacity: 1,
                strokeColor: '#0c1228',
                strokeWeight: 2,
                scale: 9,
              },
            });

            marker.addListener('click', () => {
              googleInfoWindowRef.current.setContent(`
                <div style="font-family:'Noto Sans HK',sans-serif;min-width:180px;">
                  <div style="font-size:12px;font-weight:600;color:#111827;margin-bottom:4px;">${cam.nameZh}</div>
                  <div style="font-size:11px;color:#64748b;margin-bottom:6px;">${cam.name}</div>
                  <div style="display:flex;align-items:center;gap:6px;">
                    <div style="width:8px;height:8px;border-radius:50%;background:${getCameraStatusColor(cam.status)};"></div>
                    <span style="font-size:11px;color:${getCameraStatusColor(cam.status)};">${getCameraStatusLabel(cam.status)}</span>
                  </div>
                  <div style="font-size:10px;color:#64748b;margin-top:4px;font-family:'JetBrains Mono',monospace;">${cam.lat.toFixed(4)}, ${cam.lng.toFixed(4)}</div>
                </div>
              `);
              googleInfoWindowRef.current.open({
                map: googleMapRef.current,
                anchor: marker,
              });
            });

            googleMarkersRef.current.push(marker);
          });
        }
      } catch (error) {
        if (!cancelled) {
          setGoogleError(
            error instanceof Error ? error.message : 'Google 地圖載入失敗。'
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mapSurface, selectedDept, clearGoogleMarkers]);

  // Google 3D map
  useEffect(() => {
    if (mapSurface !== 'google-3d') return;
    if (!google3DContainerRef.current) return;

    let cancelled = false;

    void (async () => {
      if (!GOOGLE_MAPS_API_KEY) {
      setGoogleError('Google Maps API key 未設定');
      return;
    }

      try {
        setGoogleError(null);
        const google = await loadGoogleMapsApi(GOOGLE_MAPS_API_KEY);
        const { Map3DElement } = await google.maps.importLibrary('maps3d');
        if (cancelled) return;

        const center = selectedDept?.mapCenter ?? HK_CENTER;
        const range = mapZoomTo3DRange(selectedDept?.mapZoom ?? HK_ZOOM);

        const map3D = new Map3DElement({
          center: {
            lat: center[0],
            lng: center[1],
            altitude: 0,
          },
          range,
          tilt: 58,
          heading: 12,
          mode: 'HYBRID',
          language: 'zh-TW',
          region: 'HK',
          mapId: GOOGLE_MAPS_3D_MAP_ID || undefined,
        }) as HTMLElement & {
          center?: unknown;
          range?: number;
          tilt?: number;
          heading?: number;
        };

        map3D.style.width = '100%';
        map3D.style.height = '100%';
        google3DContainerRef.current.innerHTML = '';
        google3DContainerRef.current.appendChild(map3D);
        google3DMapRef.current = map3D;
      } catch (error) {
        if (!cancelled) {
          setGoogleError(
            error instanceof Error ? error.message : 'Google 3D 地圖載入失敗。'
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mapSurface, selectedDept]);

  const addMarkerToMap = useCallback((data: MapMarker) => {
    if (!mapRef.current) return;

    const icon = L.divIcon({
      html: `
        <div style="
          padding:4px 8px;
          background:#0c1228;
          border:2px solid ${data.color};
          border-radius:2px;
          font-family:'Noto Sans HK',sans-serif;
          font-size:11px;
          color:${data.color};
          white-space:nowrap;
          box-shadow:0 2px 8px rgba(0,0,0,0.8);
          position:relative;
        ">
          ${data.title || '標示'}
          <div style="
            position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);
            width:0;height:0;
            border-left:4px solid transparent;
            border-right:4px solid transparent;
            border-top:6px solid ${data.color};
          "></div>
        </div>
      `,
      className: '',
      iconAnchor: [0, 28],
    });
    const marker = L.marker([data.lat, data.lng], { icon });
    marker.bindPopup(
      `
        <div style="font-family:'Noto Sans HK',sans-serif;">
          ${data.imageUrl ? `<img src="${data.imageUrl}" style="width:100%;border-radius:2px;margin-bottom:6px;max-height:120px;object-fit:cover;" />` : ''}
          <div style="font-size:13px;font-weight:600;color:#dde4f0;">${data.title || '標示'}</div>
          <div style="font-size:10px;color:#506070;font-family:'JetBrains Mono',monospace;margin-top:2px;">${data.lat.toFixed(5)}, ${data.lng.toFixed(5)}</div>
          <button onclick="this.closest('.leaflet-popup').remove()" style="
            margin-top:6px;padding:2px 8px;font-size:10px;
            background:#f43f5e22;border:1px solid #f43f5e;color:#f43f5e;
            border-radius:2px;cursor:pointer;
          ">移除標示</button>
        </div>
      `,
      { maxWidth: 220 }
    );
    marker.on('popupopen', () => {
      const button = document.querySelector<HTMLButtonElement>('.leaflet-popup button');
      if (button) {
        button.onclick = () => {
          mapMarkersLayerRef.current.removeLayer(marker);
          setMapMarkers(prev => prev.filter(item => item.id !== data.id));
        };
      }
    });
    mapMarkersLayerRef.current.addLayer(marker);
  }, []);

  function handleConfirmMarker() {
    if (!markerModal) return;

    const newMarker: MapMarker = {
      id: Date.now().toString(),
      lat: markerModal.lat,
      lng: markerModal.lng,
      title: markerTitle || '標示',
      imageUrl: markerImage || undefined,
      color: markerColor,
    };
    setMapMarkers(prev => [...prev, newMarker]);
    addMarkerToMap(newMarker);
    setMarkerModal(null);
    setMarkerTitle('');
    setMarkerImage(null);
  }

  function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      setMarkerImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function clearAll() {
    drawnItemsRef.current.clearLayers();
    mapMarkersLayerRef.current.clearLayers();
    setMapMarkers([]);
  }

  const DRAW_BUTTONS = [
    { mode: 'select' as DrawMode, icon: '↖', label: '選取' },
    { mode: 'polyline' as DrawMode, icon: '╱', label: '繪製線' },
    { mode: 'polygon-transparent' as DrawMode, icon: '□', label: '透明多邊形' },
    { mode: 'polygon-solid' as DrawMode, icon: '■', label: '實色多邊形' },
    { mode: 'marker' as DrawMode, icon: '📍', label: '新增標示' },
  ];

  return (
    <div className="flex flex-col h-full relative" style={{ background: '#07091a' }}>
      <div
        className="flex-shrink-0 overflow-x-auto border-b"
        style={{ borderColor: '#182840', background: '#0c1228' }}
      >
        <div className="flex min-w-max flex-wrap items-center gap-2 px-3 py-2">
          {/* 地圖類型下拉式選單 */}
          <div className="relative">
            <select
              value={mapSurface}
              onChange={e => setMapSurface(e.target.value as MapSurface)}
              className="appearance-none pl-3 pr-8 py-1 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-cyan-400"
              style={{
                borderColor: '#182840',
                background: mapSurface === 'lands-2d' ? '#182840' : 'transparent',
                color: mapSurface === 'lands-2d' ? '#00c8ff' : '#506070',
                fontFamily: "'Noto Sans HK', sans-serif",
              }}
            >
              <option value="lands-2d">LANDS 2D</option>
              <option value="lands-3d">LANDS 3D</option>
              <option value="satellite">衛星</option>
              <option value="dark">夜間</option>
              <option value="google-2d">Google 2D</option>
              <option value="google-3d">Google 3D</option>
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          <div className="w-px h-5 self-center" style={{ background: '#182840' }} />

          {DRAW_BUTTONS.map(button => (
            <button
              key={button.mode}
              onClick={() => setDrawMode(drawMode === button.mode ? null : button.mode)}
              className="draw-btn px-2 py-1 text-xs rounded border"
              style={{
                borderColor: '#182840',
                opacity: isReadOnlySurface ? 0.35 : 1,
                cursor: isReadOnlySurface ? 'not-allowed' : 'pointer',
              }}
              title={
                isReadOnlySurface
                  ? '目前地圖模式暫不支援站內繪圖'
                  : button.label
              }
              disabled={isReadOnlySurface}
            >
              <span
                className={drawMode === button.mode ? 'text-cyan-400' : ''}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {button.icon}
              </span>
            </button>
          ))}

          {drawMode && drawMode !== 'select' && drawMode !== 'marker' && (
            <>
              <div className="w-px h-5 self-center" style={{ background: '#182840' }} />
              <div className="flex items-center gap-1.5">
                {drawMode !== 'polyline' && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs" style={{ color: '#506070' }}>
                      填
                    </span>
                    <input
                      type="color"
                      value={fillColor}
                      onChange={e => setFillColor(e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border-0"
                      style={{ background: 'none' }}
                    />
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <span className="text-xs" style={{ color: '#506070' }}>
                    邊
                  </span>
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={e => setStrokeColor(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer border-0"
                    style={{ background: 'none' }}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs" style={{ color: '#506070' }}>
                    粗
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    value={strokeWidth}
                    onChange={e => setStrokeWidth(Number(e.target.value))}
                    className="w-12 h-1"
                  />
                  <span
                    className="text-xs w-3"
                    style={{
                      color: '#00c8ff',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {strokeWidth}
                  </span>
                </div>
              </div>
            </>
          )}

          {isReadOnlySurface && (
            <span className="text-xs whitespace-nowrap" style={{ color: '#f59e0b' }}>
              目前地圖模式提供瀏覽與定位，繪圖請切回 Lands 2D / 衛星 / 夜間。
            </span>
          )}

          <div className="flex-1 min-w-4" />

          <button
            onClick={() => setShowLayerPanel(prev => !prev)}
            className="draw-btn px-2 py-1 text-xs rounded border flex items-center gap-1"
            style={{
              borderColor: '#182840',
              color: showLayerPanel ? '#00c8ff' : '#506070',
            }}
          >
            <span>圖層</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </button>

          <button
            onClick={clearAll}
            className="px-2 py-1 text-xs rounded border transition-colors"
            style={{
              borderColor: '#f43f5e44',
              color: '#f43f5e',
              background: 'transparent',
            }}
          >
            清除
          </button>
        </div>
      </div>

      {drawMode && drawMode !== 'select' && !isReadOnlySurface && (
        <div
          className="flex-shrink-0 px-3 py-1.5 flex items-center gap-2"
          style={{
            background: '#00c8ff11',
            borderBottom: '1px solid #00c8ff33',
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full cctv-live-dot"
            style={{ background: '#00c8ff' }}
          />
          <span className="text-xs" style={{ color: '#00c8ff' }}>
            {drawMode === 'polyline' && '繪製模式：線條 — 點擊地圖新增頂點，雙擊完成'}
            {drawMode === 'polygon-transparent' &&
              '繪製模式：半透明多邊形 — 點擊地圖新增頂點，雙擊完成'}
            {drawMode === 'polygon-solid' &&
              '繪製模式：實色多邊形 — 點擊地圖新增頂點，雙擊完成'}
            {drawMode === 'marker' && '標示模式：點擊地圖位置以新增標示'}
          </span>
          <button
            onClick={() => setDrawMode(null)}
            className="ml-auto text-xs"
            style={{ color: '#506070' }}
          >
            取消
          </button>
        </div>
      )}

      <div className="flex-1 relative">
        <div
          ref={containerRef}
          className={`absolute inset-0 ${isReadOnlySurface ? 'hidden' : ''}`}
        />
        {/* Lands 3D 使用另開新視窗方式，避免 iframe 嵌入限制 */}
        {mapSurface === 'lands-3d' && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: '#07091a' }}
          >
            <button
              onClick={() => window.open(LANDS_3D_URL, '_blank', 'noopener,noreferrer')}
              className="px-6 py-3 text-sm rounded border"
              style={{
                background: 'rgba(7,9,26,0.85)',
                borderColor: '#182840',
                color: '#00c8ff',
              }}
            >
              Lands 3D 無法嵌入，請點擊這裡開啟
            </button>
          </div>
        )}
        <div
          ref={google2DContainerRef}
          className={`absolute inset-0 ${mapSurface === 'google-2d' ? '' : 'hidden'}`}
        />
        <div
          ref={google3DContainerRef}
          className={`absolute inset-0 google-map-host ${mapSurface === 'google-3d' ? '' : 'hidden'}`}
        />

        {showLayerPanel && (
          <div
            className="absolute right-0 top-0 bottom-0 w-64 overflow-y-auto shadow-2xl z-50"
            style={{ background: '#0c1228', borderLeft: '1px solid #182840' }}
          >
            <div
              className="px-3 py-2.5 flex items-center justify-between border-b sticky top-0"
              style={{ borderColor: '#182840', background: '#0c1228' }}
            >
              <span className="text-xs font-semibold" style={{ color: '#dde4f0' }}>
                圖層控制
              </span>
              <button onClick={() => setShowLayerPanel(false)} style={{ color: '#506070' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <LayerPanelContent activeLayers={activeLayers} />
          </div>
        )}

        {isGoogleSurface && googleUnavailableMessage && (
          <div className="absolute inset-0 z-40 flex items-center justify-center p-6">
            <div
              className="max-w-md rounded-lg p-4"
              style={{
                background: 'rgba(12,18,40,0.92)',
                border: '1px solid #182840',
                boxShadow: '0 18px 40px rgba(0,0,0,0.45)',
              }}
            >
              <div className="text-sm font-semibold mb-2" style={{ color: '#dde4f0' }}>
                Google 地圖尚未就緒
              </div>
              <p className="text-xs leading-6" style={{ color: '#94a3b8' }}>
                {googleUnavailableMessage}
              </p>
              <div
                className="mt-3 text-xs"
                style={{
                  color: '#00c8ff',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                VITE_GOOGLE_MAPS_API_KEY
                {mapSurface === 'google-3d' ? ' / VITE_GOOGLE_MAPS_3D_MAP_ID' : ''}
              </div>
            </div>
          </div>
        )}

        <div
          className="absolute bottom-8 left-3 z-40 flex items-center gap-1.5 px-2 py-1 rounded"
          style={{
            background: 'rgba(7,9,26,0.85)',
            border: '1px solid #182840',
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full cctv-live-dot"
            style={{ background: '#22c55e' }}
          />
          <span
            className="text-xs"
            style={{
              color: '#506070',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {mapSurface.toUpperCase()} · {selectedDept ? selectedDept.shortZh : 'OVERVIEW'}
          </span>
        </div>

        {mapMarkers.length > 0 && (
          <div
            className="absolute top-3 right-3 z-40 px-2 py-1 rounded flex items-center gap-1.5"
            style={{
              background: 'rgba(7,9,26,0.85)',
              border: '1px solid #182840',
            }}
          >
            <span
              className="text-xs"
              style={{
                color: '#f59e0b',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              📍 {mapMarkers.length}
            </span>
          </div>
        )}
      </div>

      {markerModal && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)' }}
        >
          <div
            className="rounded p-4 w-72 shadow-2xl"
            style={{ background: '#0c1228', border: '1px solid #182840' }}
          >
            <div className="text-sm font-semibold mb-3" style={{ color: '#dde4f0' }}>
              新增地圖標示
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#506070' }}>
                  標示名稱
                </label>
                <input
                  type="text"
                  value={markerTitle}
                  onChange={e => setMarkerTitle(e.target.value)}
                  placeholder="輸入標示名稱..."
                  className="w-full px-2 py-1.5 text-xs rounded outline-none"
                  style={{
                    background: '#111e3c',
                    border: '1px solid #182840',
                    color: '#dde4f0',
                  }}
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs mb-1 block" style={{ color: '#506070' }}>
                  標示顏色
                </label>
                <div className="flex gap-2 flex-wrap">
                  {['#00c8ff', '#22c55e', '#f59e0b', '#f43f5e', '#a855f7', '#ffffff'].map(
                    color => (
                      <button
                        key={color}
                        onClick={() => setMarkerColor(color)}
                        className="w-6 h-6 rounded"
                        style={{
                          background: color,
                          border:
                            markerColor === color
                              ? '2px solid #fff'
                              : '2px solid transparent',
                        }}
                      />
                    )
                  )}
                  <input
                    type="color"
                    value={markerColor}
                    onChange={e => setMarkerColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs mb-1 block" style={{ color: '#506070' }}>
                  插入圖片（可選）
                </label>
                {markerImage ? (
                  <div className="relative rounded overflow-hidden" style={{ height: '80px' }}>
                    <img src={markerImage} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setMarkerImage(null)}
                      className="absolute top-1 right-1 px-1 py-px text-xs rounded"
                      style={{ background: 'rgba(0,0,0,0.7)', color: '#f43f5e' }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label
                    className="flex items-center justify-center gap-2 py-3 rounded cursor-pointer transition-colors"
                    style={{ border: '1px dashed #182840', color: '#506070' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#00c8ff')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#182840')}
                  >
                    <span className="text-lg">🖼️</span>
                    <span className="text-xs">點擊上載圖片</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>

              <div className="text-xs p-2 rounded" style={{ background: '#111e3c', color: '#506070' }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {markerModal.lat.toFixed(5)}, {markerModal.lng.toFixed(5)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setMarkerModal(null)}
                className="flex-1 py-1.5 text-xs rounded border"
                style={{ borderColor: '#182840', color: '#506070' }}
              >
                取消
              </button>
              <button
                onClick={handleConfirmMarker}
                className="flex-1 py-1.5 text-xs rounded font-medium"
                style={{ background: '#00c8ff', color: '#000d12' }}
              >
                新增標示
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function updateTempShape(
  map: L.Map,
  mode: DrawMode,
  tempLayerRef: MutableRefObject<L.Layer | null>,
  tempPointsRef: MutableRefObject<L.LatLng[]>,
  tempMarkersRef: MutableRefObject<L.Marker[]>
) {
  if (tempLayerRef.current) {
    map.removeLayer(tempLayerRef.current);
    tempLayerRef.current = null;
  }

  const points = tempPointsRef.current;
  if (points.length < 2) return;

  const fillColor = '#00c8ff';
  const strokeColor = '#00c8ff';

  if (mode === 'polyline') {
    tempLayerRef.current = L.polyline(points, {
      color: strokeColor,
      weight: 2,
      dashArray: '5,5',
      opacity: 0.7,
    }).addTo(map);
  } else if (mode === 'polygon-transparent') {
    tempLayerRef.current = L.polygon(points, {
      color: strokeColor,
      fillColor,
      fillOpacity: 0.25,
      weight: 2,
      dashArray: '5,5',
    }).addTo(map);
  } else if (mode === 'polygon-solid') {
    tempLayerRef.current = L.polygon(points, {
      color: strokeColor,
      fillColor,
      fillOpacity: 0.75,
      weight: 2,
      dashArray: '5,5',
    }).addTo(map);
  }

  void tempMarkersRef;
}

function finishShape(
  map: L.Map,
  mode: DrawMode,
  drawnItemsRef: MutableRefObject<L.FeatureGroup>,
  tempLayerRef: MutableRefObject<L.Layer | null>,
  tempPointsRef: MutableRefObject<L.LatLng[]>,
  tempMarkersRef: MutableRefObject<L.Marker[]>,
  strokeColorRef: MutableRefObject<string>,
  fillColorRef: MutableRefObject<string>,
  strokeWidthRef: MutableRefObject<number>
) {
  if (tempLayerRef.current) {
    map.removeLayer(tempLayerRef.current);
    tempLayerRef.current = null;
  }
  tempMarkersRef.current.forEach(marker => map.removeLayer(marker));
  tempMarkersRef.current = [];

  const points = [...tempPointsRef.current];
  tempPointsRef.current = [];
  if (points.length < 2) return;

  let layer: L.Layer;
  if (mode === 'polyline') {
    layer = L.polyline(points, {
      color: strokeColorRef.current,
      weight: strokeWidthRef.current,
      opacity: 0.9,
    });
  } else if (mode === 'polygon-transparent') {
    layer = L.polygon(points, {
      color: strokeColorRef.current,
      fillColor: fillColorRef.current,
      fillOpacity: 0.25,
      weight: strokeWidthRef.current,
    });
  } else {
    layer = L.polygon(points, {
      color: strokeColorRef.current,
      fillColor: fillColorRef.current,
      fillOpacity: 0.75,
      weight: strokeWidthRef.current,
    });
  }

  layer.on('click', () => {
    drawnItemsRef.current.removeLayer(layer);
  });

  drawnItemsRef.current.addLayer(layer);
}

function LayerPanelContent({ activeLayers }: { activeLayers: Record<string, boolean> }) {
  const activeCount = Object.values(activeLayers).filter(Boolean).length;

  return (
    <div className="p-3">
      <div className="text-xs mb-2" style={{ color: '#506070' }}>
        {activeCount} 個圖層已啟用
      </div>
      <div className="space-y-1">
        {Object.entries(activeLayers).map(([key, visible]) => {
          const [, layerId] = key.split('::');
          return (
            <div key={key} className="flex items-center gap-2 py-1">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: visible ? '#22c55e' : '#182840' }}
              />
              <span
                className="text-xs truncate flex-1"
                style={{ color: visible ? '#dde4f0' : '#506070' }}
              >
                {layerId}
              </span>
            </div>
          );
        })}
        {Object.keys(activeLayers).length === 0 && (
          <p className="text-xs" style={{ color: '#506070' }}>
            請先選取部門並啟用圖層
          </p>
        )}
      </div>
    </div>
  );
}
