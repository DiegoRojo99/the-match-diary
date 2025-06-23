import React, { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import { OSM } from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Icon, Style } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { MapStadium } from '@/types/map';
import 'ol/ol.css';

type StadiumMapProps = {
  stadiums: MapStadium[];
};

const StadiumMap: React.FC<StadiumMapProps> = ({ stadiums }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapObjectRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const tileLayer = new TileLayer({
      source: new OSM(),
    });

    const vectorSource = new VectorSource();

    stadiums.forEach((stadium) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([stadium.longitude, stadium.latitude])),
        name: stadium.name,
      });

      feature.setStyle(
        new Style({
          image: new Icon({
            src: stadium.crestUrl,
            height: 24,
            width: 24,
          }),
        })
      );

      vectorSource.addFeature(feature);
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    const map = new Map({
      target: mapRef.current,
      layers: [tileLayer, vectorLayer],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
      }),
    });

    mapObjectRef.current = map;

    return () => {
      map.setTarget(undefined); // cleanup
    };
  }, [stadiums]);

  return (
    <div 
      ref={mapRef} 
      style={{ width: '100%', minHeight: '75vh', height: '100%', margin: '0 auto', borderRadius: '8px' }} 
    />);
};

export default StadiumMap;
