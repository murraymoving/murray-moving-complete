import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';

interface ServiceAreaMapProps {
  className?: string;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function ServiceAreaMap({ className = '' }: ServiceAreaMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (window.google) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      window.initMap = () => {
        setMapLoaded(true);
        initializeMap();
      };

      script.onerror = () => {
        console.error('Failed to load Google Maps script');
      };

      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.google) return;

      // Murray Moving location in Chesterfield, NJ
      const murrayLocation = { lat: 40.1425, lng: -74.6107 };

      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 10,
        center: murrayLocation,
        mapTypeId: 'roadmap',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // Add marker for Murray Moving location
      new window.google.maps.Marker({
        position: murrayLocation,
        map: map,
        title: 'Murray Moving - Chesterfield, NJ',
        icon: {
          url: '/favicon-32x32.png',
          scaledSize: new window.google.maps.Size(32, 32),
        }
      });

      // Define service area (approximate 50-mile radius around Chesterfield)
      const serviceAreaCircle = new window.google.maps.Circle({
        strokeColor: '#16a34a',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#16a34a',
        fillOpacity: 0.15,
        map: map,
        center: murrayLocation,
        radius: 80467, // 50 miles in meters
      });

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 250px;">
            <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px;">Murray Moving</h3>
            <p style="margin: 0 0 5px 0; color: #6b7280;">Professional Moving Services</p>
            <p style="margin: 0 0 5px 0; color: #6b7280;">📍 Chesterfield, NJ 08515</p>
            <p style="margin: 0 0 10px 0; color: #6b7280;">📞 (609) 724-4445</p>
            <p style="margin: 0; color: #16a34a; font-size: 12px;"><strong>Service Area:</strong> 50-mile radius</p>
          </div>
        `
      });

      // Show info window when marker is clicked
      new window.google.maps.Marker({
        position: murrayLocation,
        map: map,
        title: 'Murray Moving - Chesterfield, NJ',
        icon: {
          url: '/favicon-32x32.png',
          scaledSize: new window.google.maps.Size(32, 32),
        }
      }).addListener('click', () => {
        infoWindow.open(map, this);
      });

      // Add major cities within service area
      const serviceAreas = [
        { name: 'Trenton', position: { lat: 40.2206, lng: -74.7563 } },
        { name: 'Princeton', position: { lat: 40.3573, lng: -74.6672 } },
        { name: 'Hamilton', position: { lat: 40.2298, lng: -74.6918 } },
        { name: 'Bordentown', position: { lat: 40.1462, lng: -74.7113 } },
        { name: 'Hightstown', position: { lat: 40.2698, lng: -74.5240 } },
        { name: 'East Windsor', position: { lat: 40.2662, lng: -74.5157 } },
        { name: 'Robbinsville', position: { lat: 40.2162, lng: -74.6129 } },
      ];

      serviceAreas.forEach(area => {
        new window.google.maps.Marker({
          position: area.position,
          map: map,
          title: `We serve ${area.name}`,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: '#16a34a',
            fillOpacity: 0.8,
            strokeWeight: 1,
            strokeColor: '#ffffff'
          }
        });
      });
    };

    loadGoogleMapsScript();
  }, []);

  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Service Area</h3>
        <div className="bg-gray-100 rounded-lg p-6">
          <p className="text-gray-600 mb-4">Interactive map will be available once Google Maps API key is configured.</p>
          <div className="text-left">
            <h4 className="font-semibold text-gray-900 mb-2">We Serve:</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• Chesterfield, NJ (Headquarters)</li>
              <li>• Trenton & surrounding areas</li>
              <li>• Princeton & Mercer County</li>
              <li>• Hamilton Township</li>
              <li>• Bordentown & Burlington County</li>
              <li>• And within 50-mile radius</li>
            </ul>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="p-6 pb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Service Area</h3>
        <p className="text-gray-600 text-sm">
          We proudly serve Chesterfield, NJ and surrounding areas within a 50-mile radius
        </p>
      </div>
      <div 
        ref={mapRef} 
        className="w-full h-96 bg-gray-200"
        style={{ minHeight: '384px' }}
      />
      <div className="p-4 bg-gray-50 text-xs text-gray-500">
        <p>📍 Headquarters: Chesterfield, NJ 08515 | 📞 (609) 724-4445</p>
      </div>
    </Card>
  );
}