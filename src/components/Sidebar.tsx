import { useState, useMemo } from 'react';
import { departments, CATEGORY_LABELS, CATEGORY_COLORS, type Department, type DeptCategory } from '../data/departments';

interface SidebarProps {
  selectedDept: Department | null;
  onSelectDept: (dept: Department) => void;
}

const CATEGORY_TABS: { key: DeptCategory | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'policy', label: '政策局' },
  { key: 'enforcement', label: '執法' },
  { key: 'infrastructure', label: '基建' },
  { key: 'environment', label: '環境' },
  { key: 'social', label: '民生' },
];

const DEPT_ICONS: Record<string, string> = {
  'transport-logistics': '🚢',
  'devb': '🏗️',
  'enb': '🌿',
  'security': '🛡️',
  'police': '👮',
  'fire': '🚒',
  'customs': '⚓',
  'immigration': '🛂',
  'transport-dept': '🚦',
  'highways': '🛣️',
  'lands': '🗺️',
  'drainage': '🌊',
  'water': '💧',
  'epd': '♻️',
  'afcd': '🌳',
  'dh': '🏥',
  'obs': '🌦️',
  'lcsd': '🏟️',
  'planning': '📐',
  'marine': '⛵',
};

export default function Sidebar({ selectedDept, onSelectDept }: SidebarProps) {
  const [activeCategory, setActiveCategory] = useState<DeptCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return departments.filter(d => {
      const matchCat = activeCategory === 'all' || d.category === activeCategory;
      const q = search.toLowerCase();
      const matchSearch = !q || d.nameZh.includes(q) || d.nameEn.toLowerCase().includes(q) || d.shortZh.includes(q);
      return matchCat && matchSearch;
    });
  }, [activeCategory, search]);

  const grouped = useMemo(() => {
    const groups: Partial<Record<DeptCategory, Department[]>> = {};
    filtered.forEach(d => {
      if (!groups[d.category]) groups[d.category] = [];
      groups[d.category]!.push(d);
    });
    return groups;
  }, [filtered]);

  const categoryOrder: DeptCategory[] = ['policy', 'enforcement', 'infrastructure', 'environment', 'social', 'admin'];

  return (
    <div className="flex flex-col h-full" style={{ background: '#07091a' }}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b" style={{ borderColor: '#182840' }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-sm flex items-center justify-center text-xs font-bold"
               style={{ background: '#00c8ff', color: '#000d12' }}>香港</div>
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#00c8ff', fontFamily: "'JetBrains Mono', monospace" }}>
            HK
          </span>
          <div className="flex items-center gap-1 ml-auto">
            <div className="w-1.5 h-1.5 rounded-full cctv-live-dot" style={{ background: '#22c55e' }} />
            <span className="text-xs" style={{ color: '#22c55e', fontFamily: "'JetBrains Mono', monospace" }}>LIVE</span>
          </div>
        </div>
        <div className="text-sm font-medium" style={{ color: '#dde4f0' }}>部門操作儀表板</div>
        <div className="text-xs mt-0.5" style={{ color: '#506070' }}>Department Dashboard</div>
      </div>

      {/* Search */}
      <div className="flex-shrink-0 px-3 py-2 border-b" style={{ borderColor: '#182840' }}>
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#506070' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜尋部門..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded outline-none"
            style={{
              background: '#0c1228',
              border: '1px solid #182840',
              color: '#dde4f0',
              fontFamily: "'Noto Sans HK', sans-serif",
            }}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex-shrink-0 flex overflow-x-auto border-b" style={{ borderColor: '#182840' }}>
        {CATEGORY_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveCategory(tab.key as DeptCategory | 'all')}
            className="flex-shrink-0 px-3 py-2 text-xs transition-colors"
            style={{
              color: activeCategory === tab.key ? '#00c8ff' : '#506070',
              borderBottom: activeCategory === tab.key ? '2px solid #00c8ff' : '2px solid transparent',
              background: 'transparent',
              fontFamily: "'Noto Sans HK', sans-serif",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex-shrink-0 px-3 py-1.5 border-b flex gap-4" style={{ borderColor: '#182840', background: '#0c1228' }}>
        <div className="flex items-center gap-1.5">
          <span className="text-xs" style={{ color: '#506070', fontFamily: "'JetBrains Mono', monospace" }}>
            DEPT
          </span>
          <span className="text-xs font-semibold" style={{ color: '#00c8ff', fontFamily: "'JetBrains Mono', monospace" }}>
            {filtered.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs" style={{ color: '#506070', fontFamily: "'JetBrains Mono', monospace" }}>
            CCTV
          </span>
          <span className="text-xs font-semibold" style={{ color: '#f59e0b', fontFamily: "'JetBrains Mono', monospace" }}>
            {filtered.reduce((a, d) => a + d.cctvCameras.length, 0)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs" style={{ color: '#506070', fontFamily: "'JetBrains Mono', monospace" }}>
            LAYERS
          </span>
          <span className="text-xs font-semibold" style={{ color: '#22c55e', fontFamily: "'JetBrains Mono', monospace" }}>
            {filtered.reduce((a, d) => a + d.dataLayers.length, 0)}
          </span>
        </div>
      </div>

      {/* Department List */}
      <div className="flex-1 overflow-y-auto">
        {categoryOrder.map(cat => {
          const depts = grouped[cat];
          if (!depts || depts.length === 0) return null;
          return (
            <div key={cat}>
              {activeCategory === 'all' && (
                <div className="px-3 py-1.5 text-xs font-semibold tracking-wider sticky top-0 z-10"
                     style={{ background: '#0c1228', color: CATEGORY_COLORS[cat], borderBottom: '1px solid #182840' }}>
                  {CATEGORY_LABELS[cat]}
                </div>
              )}
              {depts.map(dept => (
                <DeptItem
                  key={dept.id}
                  dept={dept}
                  isSelected={selectedDept?.id === dept.id}
                  icon={DEPT_ICONS[dept.id] || '🏛️'}
                  onClick={() => onSelectDept(dept)}
                />
              ))}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <span className="text-2xl">🔍</span>
            <span className="text-xs" style={{ color: '#506070' }}>找不到相關部門</span>
          </div>
        )}
      </div>
    </div>
  );
}

function DeptItem({ dept, isSelected, icon, onClick }: {
  dept: Department;
  isSelected: boolean;
  icon: string;
  onClick: () => void;
}) {
  const onlineCount = dept.cctvCameras.filter(c => c.status === 'online').length;

  return (
    <button
      onClick={onClick}
      className="dept-item w-full text-left px-3 py-2.5 border-b border-transparent"
      style={{
        borderBottomColor: '#0f1a2e',
        background: isSelected ? '#0d1f38' : 'transparent',
        borderLeft: isSelected ? `2px solid ${dept.color}` : '2px solid transparent',
      }}
    >
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 flex-shrink-0 rounded flex items-center justify-center text-base"
             style={{ background: isSelected ? `${dept.color}22` : '#0c1228' }}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm font-medium truncate" style={{ color: isSelected ? dept.color : '#dde4f0' }}>
              {dept.nameZh}
            </span>
            <span className="flex-shrink-0 px-1 py-px text-xs rounded" style={{
              background: `${CATEGORY_COLORS[dept.category]}22`,
              color: CATEGORY_COLORS[dept.category],
              fontSize: '10px',
            }}>
              {dept.categoryLabel}
            </span>
          </div>
          <div className="text-xs truncate mb-1" style={{ color: '#506070' }}>
            {dept.nameEn}
          </div>
          <div className="flex items-center gap-3">
            {dept.cctvCameras.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs" style={{ color: '#506070', fontFamily: "'JetBrains Mono', monospace" }}>CAM</span>
                <span className="text-xs font-medium" style={{ color: onlineCount > 0 ? '#22c55e' : '#506070', fontFamily: "'JetBrains Mono', monospace" }}>
                  {onlineCount}/{dept.cctvCameras.length}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span className="text-xs" style={{ color: '#506070', fontFamily: "'JetBrains Mono', monospace" }}>LYR</span>
              <span className="text-xs font-medium" style={{ color: '#00c8ff', fontFamily: "'JetBrains Mono', monospace" }}>
                {dept.dataLayers.length}
              </span>
            </div>
          </div>
        </div>
        <svg className="w-3.5 h-3.5 flex-shrink-0 mt-2" style={{ color: isSelected ? dept.color : '#182840' }}
             fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
