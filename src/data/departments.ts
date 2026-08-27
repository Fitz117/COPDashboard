export type DeptCategory = 'policy' | 'enforcement' | 'infrastructure' | 'environment' | 'social' | 'admin';

export interface CCTVCamera {
  id: string;
  name: string;
  nameZh: string;
  location: string;
  lat: number;
  lng: number;
  status: 'online' | 'offline' | 'maintenance';
  thumbnailSeed: number;
}

export interface DataLayer {
  id: string;
  nameZh: string;
  nameEn: string;
  type: 'points' | 'lines' | 'polygons';
  color: string;
  visible: boolean;
  count: number;
  description: string;
}

export interface Department {
  id: string;
  nameZh: string;
  nameEn: string;
  shortZh: string;
  category: DeptCategory;
  categoryLabel: string;
  phone: string;
  fax?: string;
  address: string;
  website: string;
  description: string;
  color: string;
  cctvCameras: CCTVCamera[];
  dataLayers: DataLayer[];
  mapCenter: [number, number];
  mapZoom: number;
}

export const CATEGORY_LABELS: Record<DeptCategory, string> = {
  policy: '政策局',
  enforcement: '執法機構',
  infrastructure: '基礎建設',
  environment: '環境生態',
  social: '社會民生',
  admin: '行政管理',
};

export const CATEGORY_COLORS: Record<DeptCategory, string> = {
  policy: '#00c8ff',
  enforcement: '#f43f5e',
  infrastructure: '#f59e0b',
  environment: '#22c55e',
  social: '#a855f7',
  admin: '#64748b',
};

export const departments: Department[] = [
  // Policy Bureaux
  {
    id: 'transport-logistics',
    nameZh: '運輸及物流局',
    nameEn: 'Transport and Logistics Bureau',
    shortZh: '運物局',
    category: 'policy',
    categoryLabel: '政策局',
    phone: '2810 2209',
    address: '香港添馬添美道2號政府總部',
    website: 'https://www.tlb.gov.hk',
    description: '制定香港運輸、物流、航運及航空政策，統籌陸海空交通規劃。',
    color: '#00c8ff',
    mapCenter: [22.3193, 114.1694],
    mapZoom: 12,
    cctvCameras: [
      { id: 'tl-1', name: 'Cross Harbour Tunnel', nameZh: '紅磡海底隧道入口', location: '紅磡', lat: 22.3098, lng: 114.1848, status: 'online', thumbnailSeed: 101 },
      { id: 'tl-2', name: 'Eastern Harbour Crossing', nameZh: '東區海底隧道', location: '鰂魚涌', lat: 22.2855, lng: 114.2178, status: 'online', thumbnailSeed: 102 },
      { id: 'tl-3', name: 'Western Harbour Crossing', nameZh: '西區海底隧道', location: '西九龍', lat: 22.3052, lng: 114.1533, status: 'online', thumbnailSeed: 103 },
      { id: 'tl-4', name: 'Lion Rock Tunnel', nameZh: '獅子山隧道', location: '沙田', lat: 22.3594, lng: 114.1881, status: 'maintenance', thumbnailSeed: 104 },
    ],
    dataLayers: [
      { id: 'tl-traffic', nameZh: '實時交通流量', nameEn: 'Live Traffic Flow', type: 'lines', color: '#00c8ff', visible: true, count: 1240, description: '全港主要道路實時交通速度' },
      { id: 'tl-tunnel', nameZh: '隧道位置', nameEn: 'Tunnel Locations', type: 'points', color: '#f59e0b', visible: true, count: 9, description: '香港所有行車隧道' },
      { id: 'tl-bus', nameZh: '巴士路線', nameEn: 'Bus Routes', type: 'lines', color: '#22c55e', visible: false, count: 742, description: '全港專線小巴及巴士路線' },
      { id: 'tl-port', nameZh: '港口設施', nameEn: 'Port Facilities', type: 'polygons', color: '#a855f7', visible: false, count: 24, description: '香港貨運及客運港口範圍' },
    ],
  },
  {
    id: 'enb',
    nameZh: '環境及生態局',
    nameEn: 'Environment and Ecology Bureau',
    shortZh: '環生局',
    category: 'environment',
    categoryLabel: '環境生態',
    phone: '2810 0777',
    address: '香港添馬添美道2號政府總部',
    website: 'https://www.enb.gov.hk',
    description: '制定環保、自然生態、漁農及廢物管理政策，應對氣候變化挑戰。',
    color: '#22c55e',
    mapCenter: [22.3700, 114.1100],
    mapZoom: 11,
    cctvCameras: [
      { id: 'env-1', name: 'Shing Mun Reservoir', nameZh: '城門水塘', location: '荃灣', lat: 22.3900, lng: 114.1350, status: 'online', thumbnailSeed: 301 },
      { id: 'env-2', name: 'Mai Po Nature Reserve', nameZh: '米埔自然保護區', location: '元朗', lat: 22.4940, lng: 114.0320, status: 'online', thumbnailSeed: 302 },
      { id: 'env-3', name: 'Lantau Country Park', nameZh: '大嶼山郊野公園', location: '大嶼山', lat: 22.2600, lng: 113.9200, status: 'maintenance', thumbnailSeed: 303 },
    ],
    dataLayers: [
      { id: 'env-aqi', nameZh: '空氣質量指數', nameEn: 'Air Quality Index', type: 'points', color: '#22c55e', visible: true, count: 18, description: '全港空氣質量監測站實時數據' },
      { id: 'env-park', nameZh: '郊野公園', nameEn: 'Country Parks', type: 'polygons', color: '#22c55e', visible: true, count: 24, description: '香港郊野公園範圍' },
      { id: 'env-marine', nameZh: '海岸保護區', nameEn: 'Marine Protected Areas', type: 'polygons', color: '#00c8ff', visible: false, count: 8, description: '香港海洋保護區' },
      { id: 'env-waste', nameZh: '廢物收集點', nameEn: 'Waste Collection Points', type: 'points', color: '#f59e0b', visible: false, count: 1580, description: '全港廢物及回收收集點' },
    ],
  },
  {
    id: 'security',
    nameZh: '保安局',
    nameEn: 'Security Bureau',
    shortZh: '保安局',
    category: 'policy',
    categoryLabel: '政策局',
    phone: '2810 2160',
    address: '香港添馬添美道2號政府總部',
    website: 'https://www.sb.gov.hk',
    description: '統籌香港保安政策，監管警務、消防、入境、海關及懲教事務。',
    color: '#f43f5e',
    mapCenter: [22.3193, 114.1694],
    mapZoom: 12,
    cctvCameras: [
      { id: 'sec-1', name: 'Central Government Complex', nameZh: '政府總部', location: '添馬', lat: 22.2817, lng: 114.1672, status: 'online', thumbnailSeed: 401 },
      { id: 'sec-2', name: 'Tamar Security Post', nameZh: '添馬崗守衛亭', location: '添馬', lat: 22.2820, lng: 114.1680, status: 'online', thumbnailSeed: 402 },
    ],
    dataLayers: [
      { id: 'sec-police', nameZh: '警署位置', nameEn: 'Police Stations', type: 'points', color: '#f43f5e', visible: true, count: 72, description: '全港警署及警崗' },
      { id: 'sec-fire', nameZh: '消防局', nameEn: 'Fire Stations', type: 'points', color: '#f59e0b', visible: true, count: 85, description: '全港消防局及救護站' },
    ],
  },
  // Enforcement Agencies
  {
    id: 'police',
    nameZh: '香港警務處',
    nameEn: 'Hong Kong Police Force',
    shortZh: '警務處',
    category: 'enforcement',
    categoryLabel: '執法機構',
    phone: '2860 6111',
    fax: '2527 9458',
    address: '香港灣仔軍器廠街1號警察總部',
    website: 'https://www.police.gov.hk',
    description: '負責維持香港法律秩序、預防及偵查罪行，提供緊急服務（999）。',
    color: '#f43f5e',
    mapCenter: [22.2783, 114.1747],
    mapZoom: 13,
    cctvCameras: [
      { id: 'pol-1', name: 'Causeway Bay', nameZh: '銅鑼灣監控', location: '銅鑼灣', lat: 22.2800, lng: 114.1842, status: 'online', thumbnailSeed: 501 },
      { id: 'pol-2', name: 'Mong Kok', nameZh: '旺角監控', location: '旺角', lat: 22.3191, lng: 114.1694, status: 'online', thumbnailSeed: 502 },
      { id: 'pol-3', name: 'Central', nameZh: '中環監控', location: '中環', lat: 22.2816, lng: 114.1580, status: 'online', thumbnailSeed: 503 },
      { id: 'pol-4', name: 'Tsim Sha Tsui', nameZh: '尖沙咀監控', location: '尖沙咀', lat: 22.2988, lng: 114.1722, status: 'online', thumbnailSeed: 504 },
      { id: 'pol-5', name: 'Wan Chai', nameZh: '灣仔監控', location: '灣仔', lat: 22.2780, lng: 114.1720, status: 'online', thumbnailSeed: 505 },
      { id: 'pol-6', name: 'Sham Shui Po', nameZh: '深水埗監控', location: '深水埗', lat: 22.3300, lng: 114.1620, status: 'maintenance', thumbnailSeed: 506 },
    ],
    dataLayers: [
      { id: 'pol-stations', nameZh: '警署位置', nameEn: 'Police Stations', type: 'points', color: '#f43f5e', visible: true, count: 72, description: '全港警署、分區總部及警崗' },
      { id: 'pol-cctv', nameZh: 'CCTV 監控點', nameEn: 'CCTV Locations', type: 'points', color: '#00c8ff', visible: true, count: 2840, description: '全港公共監控攝影機位置' },
      { id: 'pol-patrol', nameZh: '巡邏區域', nameEn: 'Patrol Districts', type: 'polygons', color: '#f43f5e', visible: false, count: 6, description: '香港六個警察地域範圍' },
      { id: 'pol-crime', nameZh: '罪案統計熱點', nameEn: 'Crime Hotspots', type: 'points', color: '#f59e0b', visible: false, count: 156, description: '近期罪案統計熱點區域' },
    ],
  },
  {
    id: 'fire',
    nameZh: '消防處',
    nameEn: 'Fire Services Department',
    shortZh: '消防處',
    category: 'enforcement',
    categoryLabel: '執法機構',
    phone: '2735 4111',
    address: '香港九龍京士柏道1號消防處總部',
    website: 'https://www.hkfsd.gov.hk',
    description: '提供消防、救援及救護服務，負責危險品及消防安全事務（緊急：999）。',
    color: '#f97316',
    mapCenter: [22.3193, 114.1694],
    mapZoom: 12,
    cctvCameras: [
      { id: 'fsd-1', name: 'HQ Fire Station', nameZh: '京士柏消防局', location: '九龍城', lat: 22.3140, lng: 114.1790, status: 'online', thumbnailSeed: 601 },
      { id: 'fsd-2', name: 'Central Fire Station', nameZh: '中環消防局', location: '中環', lat: 22.2818, lng: 114.1542, status: 'online', thumbnailSeed: 602 },
      { id: 'fsd-3', name: 'Causeway Bay Fire Station', nameZh: '銅鑼灣消防局', location: '銅鑼灣', lat: 22.2826, lng: 114.1879, status: 'online', thumbnailSeed: 603 },
      { id: 'fsd-4', name: 'Tuen Mun Fire Station', nameZh: '屯門消防局', location: '屯門', lat: 22.3900, lng: 113.9770, status: 'offline', thumbnailSeed: 604 },
    ],
    dataLayers: [
      { id: 'fsd-stations', nameZh: '消防局位置', nameEn: 'Fire Stations', type: 'points', color: '#f97316', visible: true, count: 85, description: '全港消防局及救護站' },
      { id: 'fsd-hydrant', nameZh: '消防栓位置', nameEn: 'Fire Hydrants', type: 'points', color: '#f43f5e', visible: false, count: 18420, description: '全港消防供水設施' },
      { id: 'fsd-haz', nameZh: '危險品設施', nameEn: 'Hazmat Sites', type: 'points', color: '#f59e0b', visible: true, count: 234, description: '危險品儲存及處理設施' },
    ],
  },
  {
    id: 'customs',
    nameZh: '香港海關',
    nameEn: 'Customs and Excise Department',
    shortZh: '海關',
    category: 'enforcement',
    categoryLabel: '執法機構',
    phone: '2815 7711',
    address: '香港北角渣華道222號海關總部',
    website: 'https://www.customs.gov.hk',
    description: '執行海關法例、版權保護、毒品走私管制及消費稅徵收。',
    color: '#8b5cf6',
    mapCenter: [22.3193, 114.1694],
    mapZoom: 11,
    cctvCameras: [
      { id: 'cus-1', name: 'Man Kam To', nameZh: '文錦渡管制站', location: '上水', lat: 22.5400, lng: 114.1100, status: 'online', thumbnailSeed: 701 },
      { id: 'cus-2', name: 'Lok Ma Chau', nameZh: '落馬洲管制站', location: '元朗', lat: 22.5100, lng: 114.0730, status: 'online', thumbnailSeed: 702 },
      { id: 'cus-3', name: 'Airport Customs', nameZh: '機場海關', location: '赤鱲角', lat: 22.3080, lng: 113.9190, status: 'online', thumbnailSeed: 703 },
    ],
    dataLayers: [
      { id: 'cus-ports', nameZh: '出入境口岸', nameEn: 'Boundary Crossings', type: 'points', color: '#8b5cf6', visible: true, count: 14, description: '香港所有陸海空出入境口岸' },
      { id: 'cus-free', nameZh: '免稅區', nameEn: 'Free Trade Zones', type: 'polygons', color: '#00c8ff', visible: false, count: 3, description: '香港自由貿易區範圍' },
    ],
  },
  {
    id: 'immigration',
    nameZh: '入境事務處',
    nameEn: 'Immigration Department',
    shortZh: '入境處',
    category: 'enforcement',
    categoryLabel: '執法機構',
    phone: '2824 6111',
    address: '香港灣仔告士打道7號入境事務大樓',
    website: 'https://www.immd.gov.hk',
    description: '處理香港居民及訪客入出境、證件簽發及國籍事宜。',
    color: '#3b82f6',
    mapCenter: [22.2793, 114.1725],
    mapZoom: 13,
    cctvCameras: [
      { id: 'imm-1', name: 'Wan Chai HQ', nameZh: '入境處總部', location: '灣仔', lat: 22.2793, lng: 114.1725, status: 'online', thumbnailSeed: 801 },
      { id: 'imm-2', name: 'Hung Hom Ferry Terminal', nameZh: '紅磡碼頭', location: '紅磡', lat: 22.3018, lng: 114.1833, status: 'online', thumbnailSeed: 802 },
    ],
    dataLayers: [
      { id: 'imm-offices', nameZh: '辦事處', nameEn: 'Offices', type: 'points', color: '#3b82f6', visible: true, count: 38, description: '入境處辦事處及簽證申請中心' },
      { id: 'imm-crossing', nameZh: '入境管制站', nameEn: 'Immigration Checkpoints', type: 'points', color: '#00c8ff', visible: true, count: 14, description: '香港入境管制站位置' },
    ],
  },
  // Infrastructure
  {
    id: 'transport-dept',
    nameZh: '運輸署',
    nameEn: 'Transport Department',
    shortZh: '運輸署',
    category: 'infrastructure',
    categoryLabel: '基礎建設',
    phone: '1823',
    address: '香港九龍長沙灣道303號長沙灣政府合署',
    website: 'https://www.td.gov.hk',
    description: '管理香港公共交通、道路安全、車輛登記及駕駛執照事務。',
    color: '#f59e0b',
    mapCenter: [22.3193, 114.1694],
    mapZoom: 12,
    cctvCameras: [
      { id: 'td-1', name: 'Harcourt Road', nameZh: '夏慤道', location: '金鐘', lat: 22.2795, lng: 114.1665, status: 'online', thumbnailSeed: 901 },
      { id: 'td-2', name: 'Nathan Road', nameZh: '彌敦道', location: '旺角', lat: 22.3163, lng: 114.1698, status: 'online', thumbnailSeed: 902 },
      { id: 'td-3', name: 'Gascoigne Road', nameZh: '加士居道', location: '油麻地', lat: 22.3087, lng: 114.1710, status: 'online', thumbnailSeed: 903 },
      { id: 'td-4', name: 'Tuen Mun Road', nameZh: '屯門公路', location: '青山', lat: 22.3870, lng: 114.0020, status: 'online', thumbnailSeed: 904 },
      { id: 'td-5', name: 'Tolo Highway', nameZh: '吐露港公路', location: '大埔', lat: 22.4380, lng: 114.1800, status: 'maintenance', thumbnailSeed: 905 },
    ],
    dataLayers: [
      { id: 'td-speed', nameZh: '車速攝影機', nameEn: 'Speed Cameras', type: 'points', color: '#f59e0b', visible: true, count: 287, description: '全港固定及流動測速攝影機' },
      { id: 'td-vms', nameZh: '可變信息標誌', nameEn: 'Variable Message Signs', type: 'points', color: '#00c8ff', visible: true, count: 124, description: '道路可變電子告示板' },
      { id: 'td-parking', nameZh: '公共停車場', nameEn: 'Public Car Parks', type: 'points', color: '#22c55e', visible: false, count: 432, description: '政府及私營公共停車場' },
      { id: 'td-signals', nameZh: '交通燈位置', nameEn: 'Traffic Signals', type: 'points', color: '#f43f5e', visible: false, count: 2140, description: '全港交通燈控制點' },
    ],
  },
  {
    id: 'highways',
    nameZh: '路政署',
    nameEn: 'Highways Department',
    shortZh: '路政署',
    category: 'infrastructure',
    categoryLabel: '基礎建設',
    phone: '2988 1111',
    address: '香港將軍澳彩順路3號路政署總部',
    website: 'https://www.hyd.gov.hk',
    description: '負責管理及維修香港道路、橋樑、行人隧道及行車天橋。',
    color: '#f59e0b',
    mapCenter: [22.3193, 114.1694],
    mapZoom: 11,
    cctvCameras: [
      { id: 'hyd-1', name: 'Tsing Ma Bridge', nameZh: '青馬大橋', location: '青嶼幹線', lat: 22.3437, lng: 114.0713, status: 'online', thumbnailSeed: 1001 },
      { id: 'hyd-2', name: 'Ting Kau Bridge', nameZh: '汀九橋', location: '青衣', lat: 22.3647, lng: 114.0963, status: 'online', thumbnailSeed: 1002 },
      { id: 'hyd-3', name: 'Route 3 Tai Lam Tunnel', nameZh: '大欖隧道', location: '元朗', lat: 22.3760, lng: 114.0440, status: 'online', thumbnailSeed: 1003 },
    ],
    dataLayers: [
      { id: 'hyd-roads', nameZh: '主要道路網絡', nameEn: 'Major Road Network', type: 'lines', color: '#f59e0b', visible: true, count: 2100, description: '香港主要幹道及快速公路' },
      { id: 'hyd-bridges', nameZh: '橋樑及高架', nameEn: 'Bridges & Viaducts', type: 'lines', color: '#f97316', visible: true, count: 314, description: '全港主要橋樑及行車天橋' },
      { id: 'hyd-works', nameZh: '道路工程', nameEn: 'Road Works', type: 'points', color: '#f43f5e', visible: true, count: 87, description: '現有道路維修及改善工程' },
    ],
  },
  {
    id: 'lands',
    nameZh: '地政總署',
    nameEn: 'Lands Department',
    shortZh: '地政署',
    category: 'infrastructure',
    categoryLabel: '基礎建設',
    phone: '2867 4111',
    address: '香港九龍旺角砵蘭街303號上海實業中心',
    website: 'https://www.landsd.gov.hk',
    description: '管理香港土地行政、批地、地圖測量及地理空間數據服務。',
    color: '#f59e0b',
    mapCenter: [22.3193, 114.1694],
    mapZoom: 11,
    cctvCameras: [
      { id: 'land-1', name: 'Survey Control', nameZh: '測量控制點監測', location: '維多利亞港', lat: 22.2936, lng: 114.1694, status: 'online', thumbnailSeed: 1101 },
    ],
    dataLayers: [
      { id: 'land-lots', nameZh: '地段邊界', nameEn: 'Land Lots', type: 'polygons', color: '#f59e0b', visible: false, count: 125000, description: '香港地段土地登記邊界' },
      { id: 'land-topo', nameZh: '地形等高線', nameEn: 'Topographic Contours', type: 'lines', color: '#94a3b8', visible: false, count: 48200, description: '香港地形測量等高線' },
      { id: 'land-3d', nameZh: '3D 建築模型', nameEn: '3D Building Models', type: 'polygons', color: '#00c8ff', visible: true, count: 43000, description: '全港建築物3D模型數據' },
    ],
  },
  {
    id: 'drainage',
    nameZh: '渠務署',
    nameEn: 'Drainage Services Department',
    shortZh: '渠務署',
    category: 'infrastructure',
    categoryLabel: '基礎建設',
    phone: '2300 1110',
    address: '香港九龍藍田藍田道8號渠務署大樓',
    website: 'https://www.dsd.gov.hk',
    description: '管理全港排水系統、污水處理廠及防洪設施。',
    color: '#06b6d4',
    mapCenter: [22.3193, 114.1694],
    mapZoom: 11,
    cctvCameras: [
      { id: 'dsd-1', name: 'Stonecutters WWTP', nameZh: '昂船洲污水處理廠', location: '昂船洲', lat: 22.3283, lng: 114.1257, status: 'online', thumbnailSeed: 1201 },
      { id: 'dsd-2', name: 'Shing Mun Channel', nameZh: '城門河', location: '沙田', lat: 22.3920, lng: 114.1870, status: 'online', thumbnailSeed: 1202 },
    ],
    dataLayers: [
      { id: 'dsd-drains', nameZh: '主要排水渠', nameEn: 'Major Drainage Channels', type: 'lines', color: '#06b6d4', visible: true, count: 1840, description: '全港主要明渠及箱涵渠' },
      { id: 'dsd-flood', nameZh: '洪水風險區', nameEn: 'Flood Risk Areas', type: 'polygons', color: '#f59e0b', visible: true, count: 42, description: '易受水浸影響地區' },
      { id: 'dsd-pump', nameZh: '抽水站', nameEn: 'Pumping Stations', type: 'points', color: '#00c8ff', visible: false, count: 128, description: '全港雨水及污水抽水站' },
    ],
  },
  {
    id: 'water',
    nameZh: '水務署',
    nameEn: 'Water Supplies Department',
    shortZh: '水務署',
    category: 'infrastructure',
    categoryLabel: '基礎建設',
    phone: '2824 5000',
    address: '香港九龍何文田聖光里5號',
    website: 'https://www.wsd.gov.hk',
    description: '負責香港食水及沖廁水的供應、集水、淨化及分配。',
    color: '#0ea5e9',
    mapCenter: [22.3700, 114.1100],
    mapZoom: 11,
    cctvCameras: [
      { id: 'wsd-1', name: 'Plover Cove Reservoir', nameZh: '船灣淡水湖', location: '大埔', lat: 22.4900, lng: 114.2700, status: 'online', thumbnailSeed: 1301 },
      { id: 'wsd-2', name: 'High Island Reservoir', nameZh: '萬宜水庫', location: '西貢', lat: 22.3500, lng: 114.3500, status: 'online', thumbnailSeed: 1302 },
      { id: 'wsd-3', name: 'Tai Lam Chung Reservoir', nameZh: '大欖涌水塘', location: '屯門', lat: 22.3820, lng: 114.0010, status: 'online', thumbnailSeed: 1303 },
    ],
    dataLayers: [
      { id: 'wsd-res', nameZh: '水塘位置', nameEn: 'Reservoirs', type: 'polygons', color: '#0ea5e9', visible: true, count: 17, description: '香港17個水塘位置及儲水量' },
      { id: 'wsd-mains', nameZh: '主要輸水管', nameEn: 'Water Mains', type: 'lines', color: '#0ea5e9', visible: false, count: 7200, description: '全港主要食水及沖廁水管道' },
      { id: 'wsd-pump', nameZh: '抽水泵房', nameEn: 'Pumping Stations', type: 'points', color: '#00c8ff', visible: false, count: 84, description: '全港輸水泵房位置' },
    ],
  },
  // Environment
  {
    id: 'afcd',
    nameZh: '漁農自然護理署',
    nameEn: 'Agriculture, Fisheries and Conservation Department',
    shortZh: '漁護署',
    category: 'environment',
    categoryLabel: '環境生態',
    phone: '2708 8885',
    address: '香港九龍長沙灣道303號長沙灣政府合署',
    website: 'https://www.afcd.gov.hk',
    description: '管理郊野公園、海洋公園及動植物保育，推廣可持續漁農業。',
    color: '#16a34a',
    mapCenter: [22.3700, 114.1100],
    mapZoom: 11,
    cctvCameras: [
      { id: 'afcd-1', name: 'Tai Po Kau Forest', nameZh: '大埔滘自然護理區', location: '大埔', lat: 22.4200, lng: 114.1700, status: 'online', thumbnailSeed: 1501 },
      { id: 'afcd-2', name: 'Hoi Ha Wan Marine Park', nameZh: '海下灣海岸公園', location: '西貢', lat: 22.4570, lng: 114.3290, status: 'online', thumbnailSeed: 1502 },
    ],
    dataLayers: [
      { id: 'afcd-park', nameZh: '郊野公園邊界', nameEn: 'Country Park Boundaries', type: 'polygons', color: '#16a34a', visible: true, count: 24, description: '香港郊野公園及特別地區邊界' },
      { id: 'afcd-marine', nameZh: '海岸公園', nameEn: 'Marine Parks', type: 'polygons', color: '#0ea5e9', visible: true, count: 5, description: '香港海岸公園及海岸保護區' },
      { id: 'afcd-wildlife', nameZh: '野生動物監察點', nameEn: 'Wildlife Monitoring', type: 'points', color: '#22c55e', visible: false, count: 142, description: '野生動物活動及監察記錄點' },
    ],
  },
  // Social
  {
    id: 'dh',
    nameZh: '衛生署',
    nameEn: 'Department of Health',
    shortZh: '衛生署',
    category: 'social',
    categoryLabel: '社會民生',
    phone: '2961 8989',
    address: '香港灣仔皇后大道東213號胡忠大廈',
    website: 'https://www.dh.gov.hk',
    description: '負責公共衛生政策、疾病預防及控制、港口衛生及健康服務。',
    color: '#a855f7',
    mapCenter: [22.3193, 114.1694],
    mapZoom: 12,
    cctvCameras: [
      { id: 'dh-1', name: 'HK Reference Laboratory', nameZh: '香港參考化驗室', location: '薄扶林', lat: 22.2740, lng: 114.1330, status: 'online', thumbnailSeed: 1601 },
    ],
    dataLayers: [
      { id: 'dh-clinic', nameZh: '政府門診診所', nameEn: 'Gov. Outpatient Clinics', type: 'points', color: '#a855f7', visible: true, count: 73, description: '全港政府普通科及專科門診' },
      { id: 'dh-maternal', nameZh: '母嬰健康院', nameEn: 'Maternal & Child Health Centres', type: 'points', color: '#ec4899', visible: false, count: 47, description: '全港母嬰健康院' },
    ],
  },
  {
    id: 'obs',
    nameZh: '香港天文台',
    nameEn: 'Hong Kong Observatory',
    shortZh: '天文台',
    category: 'environment',
    categoryLabel: '環境生態',
    phone: '2926 8200',
    address: '香港九龍彌敦道134A號香港天文台',
    website: 'https://www.hko.gov.hk',
    description: '提供氣象預報、氣候監測、地震監測及航空氣象服務。',
    color: '#6366f1',
    mapCenter: [22.3021, 114.1744],
    mapZoom: 12,
    cctvCameras: [
      { id: 'hko-1', name: 'HKO HQ Weather Camera', nameZh: '天文台本部氣象攝影機', location: '九龍城', lat: 22.3021, lng: 114.1744, status: 'online', thumbnailSeed: 1701 },
      { id: 'hko-2', name: 'Waglan Island', nameZh: '橫瀾島氣象站', location: '南丫島東', lat: 22.1820, lng: 114.3030, status: 'online', thumbnailSeed: 1702 },
      { id: 'hko-3', name: 'Cheung Chau Station', nameZh: '長洲氣象站', location: '長洲', lat: 22.2090, lng: 114.0290, status: 'online', thumbnailSeed: 1703 },
    ],
    dataLayers: [
      { id: 'hko-stations', nameZh: '氣象觀測站', nameEn: 'Weather Stations', type: 'points', color: '#6366f1', visible: true, count: 84, description: '全港自動氣象站及氣象站' },
      { id: 'hko-rain', nameZh: '雨量計', nameEn: 'Rain Gauges', type: 'points', color: '#0ea5e9', visible: true, count: 140, description: '全港自動雨量計網絡' },
      { id: 'hko-radar', nameZh: '雷達掃描範圍', nameEn: 'Radar Coverage', type: 'polygons', color: '#6366f1', visible: false, count: 2, description: '天文台雷達掃描範圍' },
      { id: 'hko-seismic', nameZh: '地震監測站', nameEn: 'Seismic Stations', type: 'points', color: '#f43f5e', visible: false, count: 12, description: '香港地震監測網絡' },
    ],
  },
  // Admin
  {
    id: 'planning',
    nameZh: '規劃署',
    nameEn: 'Planning Department',
    shortZh: '規劃署',
    category: 'admin',
    categoryLabel: '行政管理',
    phone: '2231 5000',
    address: '香港九龍何文田佛光街12號規劃署大樓',
    website: 'https://www.pland.gov.hk',
    description: '負責香港城市規劃、土地用途分區及規劃研究，監管規劃申請。',
    color: '#64748b',
    mapCenter: [22.3193, 114.1694],
    mapZoom: 11,
    cctvCameras: [],
    dataLayers: [
      { id: 'plan-ozp', nameZh: '分區計劃大綱圖', nameEn: 'Outline Zoning Plans', type: 'polygons', color: '#64748b', visible: true, count: 142, description: '香港所有法定分區計劃大綱圖' },
      { id: 'plan-dev', nameZh: '發展審批地區', nameEn: 'Development Permission Areas', type: 'polygons', color: '#00c8ff', visible: false, count: 14, description: '新界發展審批地區圖' },
    ],
  },
  {
    id: 'marine',
    nameZh: '海事處',
    nameEn: 'Marine Department',
    shortZh: '海事處',
    category: 'infrastructure',
    categoryLabel: '基礎建設',
    phone: '2233 7801',
    address: '香港灣仔告士打道5號海港政府大樓',
    website: 'https://www.mardep.gov.hk',
    description: '規管香港水域及船隻安全，管理港口及航道，執行航運法規。',
    color: '#0ea5e9',
    mapCenter: [22.2936, 114.1694],
    mapZoom: 12,
    cctvCameras: [
      { id: 'mar-1', name: 'Victoria Harbour West', nameZh: '維多利亞港西面', location: '中環', lat: 22.2936, lng: 114.1550, status: 'online', thumbnailSeed: 1901 },
      { id: 'mar-2', name: 'Victoria Harbour East', nameZh: '維多利亞港東面', location: '鰂魚涌', lat: 22.2870, lng: 114.2160, status: 'online', thumbnailSeed: 1902 },
      { id: 'mar-3', name: 'Kwai Chung Container Terminal', nameZh: '葵涌貨櫃碼頭', location: '葵涌', lat: 22.3600, lng: 114.1250, status: 'online', thumbnailSeed: 1903 },
      { id: 'mar-4', name: 'Aberdeen Typhoon Shelter', nameZh: '香港仔避風塘', location: '香港仔', lat: 22.2471, lng: 114.1530, status: 'online', thumbnailSeed: 1904 },
    ],
    dataLayers: [
      { id: 'mar-vessels', nameZh: 'AIS 船舶位置', nameEn: 'AIS Vessel Positions', type: 'points', color: '#0ea5e9', visible: true, count: 284, description: '香港水域實時船舶AIS位置' },
      { id: 'mar-ferry', nameZh: '渡輪航線', nameEn: 'Ferry Routes', type: 'lines', color: '#00c8ff', visible: true, count: 42, description: '香港渡輪航線及碼頭' },
      { id: 'mar-anchor', nameZh: '錨地及碼頭', nameEn: 'Anchorages & Wharves', type: 'polygons', color: '#94a3b8', visible: false, count: 128, description: '香港錨地、浮筒及碼頭設施' },
    ],
  },
];
