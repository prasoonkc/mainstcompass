import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import { CATEGORY_CONFIG } from '../lib/constants';

function MapUpdater({ center }) {
  const map = useMap();
  map.setView([center.lat, center.lng], 13);
  return null;
}

export function BusinessMap({ location, businesses }) {
  return (
    <div className="self-start overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-card">
      <div className="border-b border-ink/10 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss">Map view</p>
        <h3 className="mt-1 text-xl font-semibold">Businesses around {location.label}</h3>
      </div>
      <div className="h-[28rem]">
        <MapContainer center={[location.lat, location.lng]} zoom={13} scrollWheelZoom className="h-full w-full">
          <MapUpdater center={location} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {businesses.map((business) => (
            <CircleMarker
              key={business.id}
              center={[business.lat, business.lng]}
              pathOptions={{
                color: CATEGORY_CONFIG[business.category]?.color || '#1f7a5c',
                fillColor: CATEGORY_CONFIG[business.category]?.color || '#1f7a5c',
                fillOpacity: 0.9,
              }}
              radius={9}
            >
              <Popup>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="font-semibold">{business.name}</p>
                    <p>{CATEGORY_CONFIG[business.category]?.label}</p>
                  </div>
                  <p>{business.address}</p>
                  <p>{business.rating} stars • {business.reviewCount} reviews</p>
                  {business.deal ? <p>Deal: {business.deal.title}</p> : null}
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
