let basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { // map background
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

let map = L.map('map', { // Map Object
  center: [40.7606, -111.8881],
  zoom: 5
});

basemap.addTo(map); // once map is created, add the base layer

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) { // collect data and then...
  function styleInfo(feature) {
    return { // this just returns the style info (line 54)
      opacity: 1,
      fillOpacity: 0.6,
      fillColor: getColor(feature.geometry.coordinates[2]),
      color: 'black',
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.3
    }
  }

  function getColor(depth) { // color of marker based on depth of earthquake
    switch (true) {
      case depth > 90:
        return "red";
      case depth > 70:
        return "orange";
      case depth > 50:
        return "gold";
      case depth > 30:
        return "yellow";
      case depth > 10:
        return "lightgreen";
      default:
        return "darkseagreen"
    }
  }

  function getRadius(magnitude) { // radius of marker based on magnitude
    if (magnitude <= 1) { // the really small ones are hard to see, so i put a floor of 2 for the size
      return 2;
    } else {
    return magnitude * 3 // anything greater than one will be at minimum a size of 3, so a floor of 2 will not make the scale incorrect
  }};

  // Add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng); // creates a circleMarker for each feature
    },
    style: styleInfo, // This is where we use the styleInfo function, which will call the feature
    onEachFeature: function (feature, layer) { // creating popup
      layer.bindPopup('Magnitude: ' + feature.properties.mag + '<br>Location: ' + feature.properties.place + '<br>Depth: ' + feature.geometry.coordinates[2] + 'km')
    }
  }).addTo(map); // ...finally, add to map

  let legend = L.control({   // create legend control object
    position: "bottomright"
  });

  legend.onAdd = function () { // the specifics
    let div = L.DomUtil.create("div", "legend"); // gives us our html object to work with
    let depth = [0,10,30,50,70,90]; // for use in coloring and populating the legend
    div.innerHTML += "<h3>Legend </h3>   <h4>(Depth in KM)</h4>" // Legend header
    for (i = 0; i< depth.length; i++) { // for each depth...
      let out = '<i style="background:' + getColor(depth[i] + 1) + '"></i> ' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
      div.innerHTML += out; // ... add it to the legend
    };

    return div;
  };
  legend.addTo(map) // put it on the map
});
