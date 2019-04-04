    
// Earthquake data link
var EarthquakeLink = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Tectonic plates link
var TectonicPlatesLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Perform GET request to the Earthquake query URL
d3.json(EarthquakeLink, function(data) {
    // On response send the data.features object to the createFeatures function
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {       

  // Create GeoJSON layer containing features array with earthquakeData object
  // Run onEachFeature function for each piece of data 
  var earthquakes = L.geoJson(earthquakeData, {
    onEachFeature: function (feature, layer){
      layer.bindPopup("<h3>" + feature.properties.place + "<br> Magnitude: " + feature.properties.mag +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    },
    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,
        {radius: getRadius(feature.properties.mag),
          fillColor: getColor(feature.properties.mag),
          fillOpacity: .7,
          stroke: true,
          color: "black",
          weight: .5
      })
    }
  });

  // Sending earthquakes layer to the createMap function
  createMap(earthquakes)
}

function createMap(earthquakes) {

  // Define map layers
  var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/ruchichandra/cjakahzysbllh2rl87e2dg27b/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicnVjaGljaGFuZHJhIiwiYSI6ImNqYzJ2dXlvcDA2a2gycW4zb2RkOXpmZjgifQ.EABSXTlj3gpJcvk8zJL2DQ");

  var outdoorMap = L.tileLayer("https://api.mapbox.com/styles/v1/ruchichandra/cjc2vqswz0efp2rpfjnhunj68/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicnVjaGljaGFuZHJhIiwiYSI6ImNqYzJ2dXlvcDA2a2gycW4zb2RkOXpmZjgifQ.EABSXTlj3gpJcvk8zJL2DQ");

  var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/ruchichandra/cjc2wvic01j3l2rpbfsypf8qk/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicnVjaGljaGFuZHJhIiwiYSI6ImNqYzJ2dXlvcDA2a2gycW4zb2RkOXpmZjgifQ.EABSXTlj3gpJcvk8zJL2DQ");

  

  // Define baseMaps object holding base layers
  var baseMaps = {
    "Satellite Map": satelliteMap,
    "Outdoor Map": outdoorMap,
    "Light Map": lightMap
  };

  // Add tectonic plate layer
  var tectonicPlates = new L.LayerGroup();

  // Create overlay object holding overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    "Tectonic Plates": tectonicPlates
  };

  // Create map, including streetmap and earthquake layers
  var myMap = L.map("map", {
    center: [31.7, -7.09],
    zoom: 2.5,
    layers: [lightMap, earthquakes, tectonicPlates]
  });

   // Add Fault lines data
   d3.json(TectonicPlatesLink, function(plateData) {
     // Add geoJSON data, plus style information
     L.geoJson(plateData, {
       color: "blue",
       weight: 2
     })
     .addTo(tectonicPlates);
   });

  // Create layer control, add baseMaps and overlayMap and layer control
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Create legend
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (myMap) {

    var div = L.DomUtil.create('div', 'info legend'),
              grades = [0, 1, 2, 3, 4, 5],
              labels = [];

  // loop through density intervals, generate colored square label
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };

  legend.addTo(myMap);
}

function getColor(d) {
  return d > 5 ? '#F30' :
  d > 4  ? '#F60' :
  d > 3  ? '#F90' :
  d > 2  ? '#FC0' :
  d > 1   ? '#FF0' :
            '#9F3';
}

function getRadius(value){
  return value*40000
}