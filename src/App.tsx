import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import DepartmentDetail from './components/DepartmentDetail';
import MapView from './components/MapView';
import type { Department } from './data/departments';

export default function App() {
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({});
  const [sidebarWidth] = useState(340);

  const handleSelectDept = useCallback((dept: Department) => {
    setSelectedDept(dept);
    // Initialize dept layer visibility from dept defaults
    const initial: Record<string, boolean> = {};
    dept.dataLayers.forEach(layer => {
      const key = `${dept.id}::${layer.id}`;
      if (!(key in activeLayers)) {
        initial[key] = layer.visible;
      }
    });
    setActiveLayers(prev => ({ ...prev, ...initial }));
  }, [activeLayers]);

  const handleLayerToggle = useCallback((deptId: string, layerId: string, visible: boolean) => {
    const key = `${deptId}::${layerId}`;
    setActiveLayers(prev => ({ ...prev, [key]: visible }));
  }, []);

  return (
    <div className="flex h-full w-full overflow-hidden" style={{ background: '#07091a' }}>
      {/* Left Sidebar */}
      <div
        className="flex-shrink-0 flex flex-col overflow-hidden border-r"
        style={{ width: sidebarWidth, borderColor: '#182840' }}
      >
        {selectedDept ? (
          <DepartmentDetail
            dept={selectedDept}
            onClose={() => setSelectedDept(null)}
            onLayerToggle={handleLayerToggle}
            activeLayers={activeLayers}
          />
        ) : (
          <Sidebar
            selectedDept={selectedDept}
            onSelectDept={handleSelectDept}
          />
        )}
      </div>

      {/* Right Map Panel */}
      <div className="flex-1 overflow-hidden">
        <MapView
          selectedDept={selectedDept}
          activeLayers={activeLayers}
        />
      </div>
    </div>
  );
}
