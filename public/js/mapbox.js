/* eslint-disable */

export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoid29sZmJyYW5kIiwiYSI6ImNrNzF0MGpieDA2dHEzb3AxZWczc251OXIifQ.EmA5yeVWebw5vjkLrTDMBw';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/wolfbrand/ck71t5ue50pzs1hmszulzan5r',
    scrollZoom: false
  });

  const bounds = new mapboxgl.LngLatBounds();
  locations.forEach(loc => {
    const el = document.createElement('div');
    el.className = 'marker';
    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Add corrdinates to the map bounds
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
};
