import React from 'react';
import { Source, Layer } from 'react-map-gl';
import { Feature, LineString } from '@turf/helpers';

const PathLine: React.FC<{ path: Feature<LineString> }> = ({ path }) => {
  return (
    <Source
      id='pathData'
      type='geojson'
      data={ path }
    >
      <Layer
        id='path'
        type="line"
        source='pathData'
        layout={{
          'line-join': 'round',
          'line-cap': 'round'
        }}
        paint={{
          'line-color': '#0261c8',
          'line-width': 2
        }}
      />
    </Source>
);
}

export default PathLine
