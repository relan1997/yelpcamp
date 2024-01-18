mapboxgl.accessToken =mapBoxToken;
  const map = new mapboxgl.Map({
	container: 'map', // container ID
	style: 'mapbox://styles/mapbox/streets-v12', // style URL
	center: c.geometry.coordinates, // starting position [lng, lat]
	zoom: 9// starting zoom
  });

new mapboxgl.Marker()
  .setLngLat(c.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({offset: 25})
    .setHTML(
        `<h3>${c.title}</h3><p>${c.location}</p>`
    )
  )
  .addTo(map)