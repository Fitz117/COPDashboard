import { useState } from 'react';
import type { Department, DataLayer } from '../data/departments';
import { CATEGORY_COLORS } from '../data/departments';

interface DepartmentDetailProps {
  dept: Department;
  onClose: () => void;
  onLayerToggle: (deptId: string, layerId: string, visible: boolean) => void;
  activeLayers: Record<string, boolean>;
}

const STATUS_COLORS = {
  online: '#22c55e',
  offline: '#f43f5e',
  maintenance: '#f59e0b',
};

const STATUS_LABELS = {
  online: '運作中',
  offline: '離線',
  maintenance: '維護中',
};

export default function DepartmentDetail({ dept, onClose, onLayerToggle, activeLayers }: DepartmentDetailProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'cctv' | 'layers'>('info');
  const [selectedCam, setSelectedCam] = useState<string | null>(null);

  const onlineCams = dept.cctvCameras.filter(c => c.status === 'online');
  const catColor = CATEGORY_COLORS[dept.category];

  return (
    <div className="flex flex-col h-full" style={{ background: '#07091a' }}>
      {/* Header */}
      <div className="flex-shrink-0 border-b" style={{ borderColor: '#182840', borderLeft: `3px solid ${dept.color}` }}>
        <div className="px-3 py-2 flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1 rounded transition-colors"
            style={{ color: '#506070' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#00c8ff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#506070')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate" style={{ color: dept.color }}>
              {dept.nameZh}
            </div>
            <div className="text-xs truncate" style={{ color: '#506070' }}>{dept.nameEn}</div>
          </div>
          <span className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                style={{ background: `${catColor}22`, color: catColor }}>
            {dept.categoryLabel}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex border-t" style={{ borderColor: '#182840' }}>
          {[
            { key: 'info', label: '基本資料' },
            { key: 'cctv', label: `CCTV (${dept.cctvCameras.length})` },
            { key: 'layers', label: `圖層 (${dept.dataLayers.length})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'info' | 'cctv' | 'layers')}
              className="flex-1 py-2 text-xs transition-colors"
              style={{
                color: activeTab === tab.key ? '#00c8ff' : '#506070',
                borderBottom: activeTab === tab.key ? '2px solid #00c8ff' : '2px solid transparent',
                background: 'transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'info' && <InfoTab dept={dept} />}
        {activeTab === 'cctv' && (
          <CCTVTab
            dept={dept}
            selectedCam={selectedCam}
            onSelectCam={setSelectedCam}
          />
        )}
        {activeTab === 'layers' && (
          <LayersTab
            dept={dept}
            activeLayers={activeLayers}
            onLayerToggle={onLayerToggle}
          />
        )}
      </div>
    </div>
  );
}

function InfoTab({ dept }: { dept: Department }) {
  return (
    <div className="p-3 space-y-3">
      <div className="p-3 rounded" style={{ background: '#0c1228', border: '1px solid #182840' }}>
        <div className="text-xs mb-2" style={{ color: '#506070' }}>部門簡介</div>
        <p className="text-xs leading-relaxed" style={{ color: '#c4cfe0' }}>{dept.description}</p>
      </div>

      <div className="space-y-2">
        <InfoRow icon="📞" label="電話" value={dept.phone} />
        {dept.fax && <InfoRow icon="📠" label="傳真" value={dept.fax} />}
        <InfoRow icon="📍" label="地址" value={dept.address} />
        <InfoRow
          icon="🌐"
          label="網站"
          value={dept.website.replace('https://', '')}
          onClick={() => window.open(dept.website, '_blank')}
          isLink
        />
      </div>

      <div className="p-3 rounded" style={{ background: '#0c1228', border: '1px solid #182840' }}>
        <div className="text-xs mb-2" style={{ color: '#506070' }}>資源摘要</div>
        <div className="grid grid-cols-2 gap-2">
          <StatCard label="CCTV 鏡頭" value={dept.cctvCameras.length} unit="個" color="#00c8ff" />
          <StatCard label="在線鏡頭" value={dept.cctvCameras.filter(c => c.status === 'online').length} unit="個" color="#22c55e" />
          <StatCard label="數據圖層" value={dept.dataLayers.length} unit="層" color="#f59e0b" />
          <StatCard
            label="數據記錄"
            value={dept.dataLayers.reduce((a, l) => a + l.count, 0).toLocaleString()}
            unit="筆"
            color="#a855f7"
          />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, onClick, isLink }: {
  icon: string; label: string; value: string; onClick?: () => void; isLink?: boolean;
}) {
  return (
    <div className="flex gap-2.5 p-2 rounded" style={{ background: '#0c1228', border: '1px solid #182840' }}>
      <span className="text-base flex-shrink-0 w-5 text-center">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs mb-0.5" style={{ color: '#506070' }}>{label}</div>
        <div
          className={`text-xs ${isLink ? 'cursor-pointer underline-offset-2' : ''}`}
          style={{ color: isLink ? '#00c8ff' : '#dde4f0', textDecoration: isLink ? 'underline' : 'none' }}
          onClick={onClick}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, unit, color }: {
  label: string; value: string | number; unit: string; color: string;
}) {
  return (
    <div className="p-2 rounded" style={{ background: `${color}11`, border: `1px solid ${color}33` }}>
      <div className="text-xs mb-0.5" style={{ color: '#506070' }}>{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-base font-bold" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
        <span className="text-xs" style={{ color: `${color}99` }}>{unit}</span>
      </div>
    </div>
  );
}

function CCTVTab({ dept, selectedCam, onSelectCam }: {
  dept: Department;
  selectedCam: string | null;
  onSelectCam: (id: string | null) => void;
}) {
  if (dept.cctvCameras.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <span className="text-2xl">📵</span>
        <span className="text-xs" style={{ color: '#506070' }}>此部門暫無 CCTV 鏡頭資料</span>
      </div>
    );
  }

  const selected = selectedCam ? dept.cctvCameras.find(c => c.id === selectedCam) : null;

  return (
    <div className="p-3 space-y-3">
      {/* Selected camera enlarged */}
      {selected && (
        <div className="space-y-2">
          <div className="relative rounded overflow-hidden cctv-scan"
               style={{ border: '1px solid #182840', aspectRatio: '16/9' }}>
            <img
              src={`https://picsum.photos/seed/${selected.thumbnailSeed}/640/360`}
              alt={selected.nameZh}
              className="w-full h-full object-cover"
              style={{ filter: 'saturate(0.5) brightness(0.7) hue-rotate(180deg)' }}
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent 30%, transparent 70%, rgba(0,0,0,0.5))' }} />
            <div className="absolute top-2 left-2 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full cctv-live-dot" style={{ background: STATUS_COLORS[selected.status] }} />
              <span className="text-xs px-1.5 py-px rounded"
                    style={{ background: 'rgba(0,0,0,0.7)', color: Status_COLOR_TEXT(selected.status), fontFamily: "'JetBrains Mono', monospace" }}>
                {STATUS_LABELS[selected.status]}
              </span>
            </div>
            <div className="absolute bottom-2 left-2 right-2">
              <div className="text-sm font-medium" style={{ color: '#dde4f0', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                {selected.nameZh}
              </div>
              <div className="text-xs" style={{ color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}>
                {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}
              </div>
            </div>
            <div className="absolute top-2 right-2 flex gap-1">
              <button
                onClick={() => onSelectCam(null)}
                className="p-1 rounded"
                style={{ background: 'rgba(0,0,0,0.7)', color: '#dde4f0' }}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Scanline overlay */}
            <div className="absolute inset-0 pointer-events-none"
                 style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,200,255,0.02) 2px, rgba(0,200,255,0.02) 4px)' }} />
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 gap-2">
        {dept.cctvCameras.map(cam => (
          <button
            key={cam.id}
            onClick={() => onSelectCam(cam.id === selectedCam ? null : cam.id)}
            className="relative rounded overflow-hidden text-left transition-all"
            style={{
              border: cam.id === selectedCam ? '1px solid #00c8ff' : '1px solid #182840',
              aspectRatio: '16/9',
              opacity: cam.status === 'offline' ? 0.5 : 1,
            }}
          >
            <img
              src={`https://picsum.photos/seed/${cam.thumbnailSeed}/320/180`}
              alt={cam.nameZh}
              className="w-full h-full object-cover"
              style={{ filter: 'saturate(0.4) brightness(0.65) hue-rotate(180deg)' }}
            />
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.3)' }} />
            <div className="absolute top-1 left-1 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLORS[cam.status] }} />
            </div>
            <div className="absolute bottom-1 left-1 right-1">
              <div className="text-xs truncate" style={{ color: '#dde4f0', fontSize: '10px', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
                {cam.nameZh}
              </div>
            </div>
            {cam.status === 'offline' && (
              <div className="absolute inset-0 flex items-center justify-center"
                   style={{ background: 'rgba(0,0,0,0.6)' }}>
                <span className="text-xs" style={{ color: '#f43f5e', fontFamily: "'JetBrains Mono', monospace" }}>NO SIGNAL</span>
              </div>
            )}
            {/* scanline */}
            <div className="absolute inset-0 pointer-events-none"
                 style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 4px)' }} />
          </button>
        ))}
      </div>
    </div>
  );
}

function Status_COLOR_TEXT(status: string) {
  if (status === 'online') return '#22c55e';
  if (status === 'offline') return '#f43f5e';
  return '#f59e0b';
}

function LayersTab({ dept, activeLayers, onLayerToggle }: {
  dept: Department;
  activeLayers: Record<string, boolean>;
  onLayerToggle: (deptId: string, layerId: string, visible: boolean) => void;
}) {
  const typeIcons: Record<string, string> = {
    points: '⬤',
    lines: '━',
    polygons: '▬',
  };

  const typeLabels: Record<string, string> = {
    points: '點位資料',
    lines: '線型資料',
    polygons: '面型資料',
  };

  return (
    <div className="p-3 space-y-2">
      <div className="text-xs mb-3" style={{ color: '#506070' }}>
        點擊切換圖層顯示，資料將在右側地圖上呈現。
      </div>
      {dept.dataLayers.map(layer => {
        const layerKey = `${dept.id}::${layer.id}`;
        const isActive = activeLayers[layerKey] ?? layer.visible;
        return (
          <button
            key={layer.id}
            onClick={() => onLayerToggle(dept.id, layer.id, !isActive)}
            className="w-full p-2.5 rounded text-left transition-all"
            style={{
              background: isActive ? `${layer.color}11` : '#0c1228',
              border: `1px solid ${isActive ? layer.color + '44' : '#182840'}`,
            }}
          >
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 flex-shrink-0 rounded flex items-center justify-center text-sm"
                   style={{ background: isActive ? `${layer.color}22` : '#111e3c', color: layer.color }}>
                {typeIcons[layer.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-xs font-medium" style={{ color: isActive ? layer.color : '#94a3b8' }}>
                    {layer.nameZh}
                  </span>
                  <div className="flex-shrink-0">
                    <div className="w-8 h-4 rounded-full transition-colors relative"
                         style={{ background: isActive ? layer.color : '#182840' }}>
                      <div className="absolute top-0.5 h-3 w-3 rounded-full transition-all"
                           style={{ background: '#fff', left: isActive ? '18px' : '2px' }} />
                    </div>
                  </div>
                </div>
                <div className="text-xs" style={{ color: '#506070' }}>{layer.description}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-1.5 py-px rounded" style={{
                    background: '#111e3c',
                    color: '#506070',
                    fontSize: '10px',
                  }}>
                    {typeLabels[layer.type]}
                  </span>
                  <span className="text-xs" style={{ color: '#506070', fontFamily: "'JetBrains Mono', monospace" }}>
                    {layer.count.toLocaleString()} 筆
                  </span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
