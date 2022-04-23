// haversine Disctance Function
const haversineDisctance = (pos1, pos2) => {
  const R = 6378137;
  const d2r = Math.PI / 180;

  const dLat = (pos2.lat - pos1.lat) * d2r;
  const dLng = (pos2.lng - pos1.lng) * d2r;
  const lat1 = pos1.lat * d2r;
  const lat2 = pos2.lat * d2r;

  const sin1 = Math.sin(dLat / 2);
  const sin2 = Math.sin(dLng / 2);

  const a = sin1 * sin1 + sin2 * sin2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// initialize the map on the "map" div with a given center and zoom
var map = L.map("mapContainer", {
  center: [38.0737, 46.29656],
  zoom: 13,
  zoomControl: false,
  // https://github.com/Leaflet/Leaflet.fullscreen
  fullscreenControl: true,
  fullscreenControl: {
    pseudoFullscreen: false,
    position: "bottomleft",
  },
});

// map.zoomControl.setPosition("bottomright");
// Instantiate the ZoomBar control..
//
var zoom_bar = new L.Control.ZoomBar({ position: "bottomleft" }).addTo(map);

// Add OpenStreetMap Tile
var OSM = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}",
  {
    foo: "bar",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }
).addTo(map);

// Add a marker
var marker = L.marker([38.0737, 46.29656], {
  title: "My Position",
  draggable: true,
}).addTo(map);

var myIcon1 = L.icon({
  iconUrl: "dist/images/green_flag.png",
  iconSize: [51, 51],
  iconAnchor: [5, 51],
});

var startPoint = L.marker([38.073074, 46.300423], { icon: myIcon1 });

var myIcon2 = L.icon({
  iconUrl: "dist/images/red_flag.png",
  iconSize: [51, 51],
  iconAnchor: [5, 51],
});

// Measuring the Distance between 2 Points
var endPoint = L.marker([38.068479, 46.324498], { icon: myIcon2 }).addTo(map);

var startCoords = startPoint.getLatLng();
var endCoords = endPoint.getLatLng();

var distance = startCoords.distanceTo(endCoords);
var distanceHav = haversineDisctance(endCoords, startCoords);

console.log("Distance is : " + Math.round(distance / 1000) + " km");
console.log(
  "Distance Using Haversine is : " + Math.round(distanceHav / 1000) + " km"
);

// Add a circle shape to the Map
var circle = L.circle([38.062491, 46.290123], {
  color: "red",
  fillColor: "#f03",
  fillOpacity: 0.5,
  radius: 500,
});

// Add a Polygon shape to the Map
var polygon = L.polygon([
  [38.074054, 46.290851],
  [38.075296, 46.291701],
  [38.074054, 46.292793],
]);

// Marker Events
marker.on("dragend", () => {
  console.log("Marker's Position move to : " + marker.getLatLng());
});

// Circle Events
circle.on("click", () => {
  console.log("Current Position of Circle is : " + circle.getLatLng());
});

// Polygon Events
polygon.on("mouseout", () => {
  console.log("Current Position of Polygon is : " + polygon.getCenter());
});

// Add Popups and Tooltips (Method 1)
polygon.bindPopup("I'm a Polygon!");
marker.bindTooltip("My Tooltip Text").openTooltip();

// Add Popups and Tooltips (Method 2)
var popup = L.popup({ className: "mapPopup" });

// Leaflet Browser Print Function
L.control.browserPrint({ position: "topright" }).addTo(map);

// Leaflet BigImage Print
L.control.bigImage({ position: "topright" }).addTo(map);

// Get the Clicked Point's Lat and Long
function onMapClick(e) {
  // popup
  //   .setLatLng(e.latlng)
  //   .setContent(
  //     "You Clicked the map at : <br>" +
  //       e.latlng.toString() +
  //       "<br>UTM: " +
  //       e.latlng.utm()
  //   )
  //   .openOn(map);
  // console.log(e.latlng.lat, e.latlng.lng);
  console.log(
    "You Clicked the map at : " +
      e.latlng.toString() +
      " UTM: " +
      e.latlng.utm()
  );
}

map.on("click", onMapClick);

// Import GeoJSON file

function process(feature, layer) {
  let websiteLink = "";

  if (feature.properties.website != null) {
    websiteLink =
      "<a href=" +
      feature.properties.website +
      ' target="_blank">' +
      feature.properties.website +
      "</a>";
  }
  let popupTxt = "<b>" + feature.properties.title + "<b><br/>" + websiteLink;

  let popupObj = layer.bindPopup(popupTxt, {
    className: "mapPopup",
  });

  switch (feature.properties.categories || feature.properties.categoryName) {
    case "Restaurant":
      // layer.setIcon(
      //   L.icon({
      //     iconUrl: "dist/images/green_flag.png",
      //     iconSize: [51, 51],
      //     iconAnchor: [5, 51],
      //   })
      // );
      restaurants.addLayer(layer);
      break;
    case "Park":
      parks.addLayer(layer);
      break;
    case "Bus station":
      busStations.addLayer(layer);
      break;
    case "Transit station":
      transitStations.addLayer(layer);
      break;
    case "Fire station" || "Fire department equipment supplier":
      firetStations.addLayer(layer);
      break;
    case "Hospital":
      hospitals.addLayer(layer);
      break;
    case "University":
      universities.addLayer(layer);
      break;
  }
}

let restaurants = L.layerGroup();
let parks = L.layerGroup();
let busStations = L.layerGroup();
let transitStations = L.layerGroup();
let firetStations = L.layerGroup();
let hospitals = L.layerGroup();
let universities = L.layerGroup();

let geojson = L.geoJson(POI, {
  onEachFeature: process,
});

// -----------------------------------------------------
// Control Layers (First One) --------------------------
// var baseLayers = {
//   Start: startPoint,
//   End: endPoint,
// };

var overlays = {
  Restaurants: restaurants,
  Parks: parks,
  "Bus Stations": busStations,
  "Transit Stations": transitStations,
  "Fire Stations": firetStations,
  Hospitals: hospitals,
  Universities: universities,
  Start: startPoint,
  End: endPoint,
  Shapes: L.layerGroup([polygon, circle]).addTo(map),
};

// L.control.layers(baseLayers, overlays).addTo(map);
// ------------------------------------------------------

// ------------------------------------------------------
// Control Layer (Second one) ---------------------------
var googleMaps = L.tileLayer(
  "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
  {
    attribution: "Map data ©2022 Google, GeoBasis-DE/BKG (©2009)",
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }
);
/*
        h = roads only
        m = standard roadmap
        p = terrain
        r = somehow altered roadmap
        s = satellite only
        t = terrain only
        y = hybrid
        */

//https://leaflet-extras.github.io/leaflet-providers/preview/
var openToMap = L.tileLayer(
  "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  {
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  }
);
var arcGIS = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  }
);
var mapNasa = L.tileLayer(
  "https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}",
  {
    attribution:
      'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System (<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
    minZoom: 1,
    maxZoom: 8,
    format: "jpg",
    time: "",
    tilematrixset: "GoogleMapsCompatible_Level",
  }
);

var baseMaps = {
  OSM: OSM,
  "Google Maps": googleMaps,
  "Open To Map": openToMap,
  ArcGIS: arcGIS,
  "Nasa Map": mapNasa,
};

L.control.layers(baseMaps, overlays).addTo(map);

// -------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------
// Add Map Coordinate Display
map.on("mousemove", function (e) {
  //   console.log(e);
  $(".coordinate").html(
    `Lat: ${e.latlng.lat} Lng: ${e.latlng.lng}<br>UTM: ${e.latlng.utm()}`
  );
});

// Add Leaflet Geolocation Search
L.Control.geocoder({ position: "topleft" }).addTo(map);

// -------------------------------------------------------------------------------------
// ----------------------------------------------------------
// Add Draw Plugin ------------------------------------------
// ----------------------------------------------------------
let drawItems = new L.FeatureGroup();
map.addLayer(drawItems);
let drawControl = new L.Control.Draw({
  edit: {
    featureGroup: drawItems,
  },
});
map.addControl(drawControl);

map.on(L.Draw.Event.CREATED, function (event) {
  var layer = event.layer;
  drawItems.addLayer(layer);
});
// End of Add Draw Plugin -----------------------------------

// Add Leaflet Measure
L.control
  .measure({
    position: "topleft",
    primaryLengthUnit: "kilometers",
    secondaryLengthUnit: "meters",
    primaryAreaUnit: "sqmeters",
    secondaryAreaUnit: undefined,
  })
  .addTo(map);

// add Leaflet-Geoman controls with some options to the map
map.pm.addControls({
  position: "bottomright",
  drawCircle: false,
});
