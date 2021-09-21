const basemaps = {"Basemap": L.tileLayer('http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg').addTo(map)};

const cisc_march_2019 = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {"name": "Miami-Dade Airport"},
            "geometry": {
                "coordinates": [-80.275151, 25.795301],
                "type": "Point",
            },
        },
        {
            "type": "Feature",
            "properties": {"name": "Florida International University - Casacuba Center, MARC Building"},
            "geometry": {
                "coordinates": [-80.373043, 25.754371],
                "type": "Point",
            },
        },
        {
            "type": "Feature",
            "properties": {"name": "La Quinta West"},
            "geometry": {
                "coordinates": [-80.338578, 25.799071],
                "type": "Point",
            },
        },
        {
            "type": "Feature",
            "properties": {"name": "Atlanta Georgia Airport"},
            "geometry": {
                "coordinates": [-84.434902, 33.644542],
                "type": "Point",
            },
        },
    ],
};
const drcap2019 = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {"name": "27 Charcos"},
            "geometry": {
                "coordinates": [-70.819213, 19.734485],
                "type": "Point",
            },
        },

        {
            "type": "Feature",
            "properties": {"name": "Hatillo"},
            "geometry": {
                "coordinates": [-70.201398, 19.030929],
                "type": "Point",
            },
        },

        {
            "type": "Feature",
            "properties": {"name": "COE"},
            "geometry": {
                "coordinates": [-69.923653, 18.488675],
                "type": "Point",
            },
        },

        {
            "type": "Feature",
            "properties": {"name": "Park by Temple"},
            "geometry": {
                "coordinates": [-69.918357, 18.466926],
                "type": "Point",
            },
        },

        {
            "type": "Feature",
            "properties": {"name": "Santo Domingo Temple and MTC"},
            "geometry": {
                "coordinates": [-69.917135, 18.466622],
                "type": "Point",
            },
        },

        {
            "type": "Feature",
            "properties": {"name": "INDRHI"},
            "geometry": {
                "coordinates": [-69.926256, 18.450202],
                "type": "Point",
            },
        },

        {
            "type": "Feature",
            "properties": {"name": "Jardines del Teatro"},
            "geometry": {
                "coordinates": [-69.910303, 18.469293],
                "type": "Point",
            },
        },
        {
            "type": "Feature",
            "properties": {"name": "Food Truck Place"},
            "geometry": {
                "coordinates": [-69.905779, 18.468840],
                "type": "Point",
            },
        },

        {
            "type": "Feature",
            "properties": {"name": "El Conuco Restaurant"},
            "geometry": {
                "coordinates": [-69.900948, 18.465057],
                "type": "Point",
            },
        },

        {
            "type": "Feature",
            "properties": {"name": "Cathedral Santa Maria La Menor"},
            "geometry": {
                "coordinates": [-69.883879, 18.473259],
                "type": "Point",
            },
        },

        {
            "type": "Feature",
            "properties": {"name": "Melia Caribe Resort"},
            "geometry": {
                "coordinates": [-68.415120, 18.672043],
                "type": "Point",
            },
        },
        {
            "type": "Feature",
            "properties": {"name": "Ft Lauderdale Int Airport"},
            "geometry": {
                "coordinates": [-80.145223, 26.071527],
                "type": "Point",
            },
        },
    ],
};
const byu = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {"name": "BYU"},
            "geometry": {
                "coordinates": [-111.649085, 40.250192],
                "type": "Point",
            },
        },
    ],
};
const childhood = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {"name": "Stake Center"},
            "geometry": {
                "coordinates": [-111.714242, 33.372623],
                "type": "Point",
            },
        },
        {
            "type": "Feature",
            "properties": {"name": "High School"},
            "geometry": {
                "coordinates": [-111.714242, 33.372623],
                "type": "Point",
            },
        },
        {
            "type": "Feature",
            "properties": {"name": "Gilbert AZ Temple"},
            "geometry": {
                "coordinates": [-111.737325, 33.291224],
                "type": "Point",
            },
        },
        {
            "type": "Feature",
            "properties": {"name": "Mesa AZ Temple"},
            "geometry": {
                "coordinates": [-111.819668, 33.412670],
                "type": "Point",
            },
        },
    ],
};


const mission_firenze_layer = L.geoJSON(mission_firenze, {onEachFeature: onEachFeature});
const mission_genova_layer = L.geoJSON(mission_genova, {onEachFeature: onEachFeature});
const mission_ancona_layer = L.geoJSON(mission_ancona, {onEachFeature: onEachFeature});
const mission_milan_layer = L.geoJSON(mission_milan, {onEachFeature: onEachFeature});
const mission = L.layerGroup([mission_firenze_layer, mission_genova_layer, mission_ancona_layer, mission_milan_layer]).addTo(map);

const trips = {
    "Cuba Infrastructure Competition 3/2019": L.geoJSON(cisc_march_2019, {onEachFeature: onEachFeature}).addTo(map),
    "Dominican Republic Capstone 1/2019": L.geoJSON(drcap2019, {onEachFeature: onEachFeature}).addTo(map),
    "School at BYU 2014-2020": L.geoJSON(byu, {onEachFeature: onEachFeature}).addTo(map),
    "Italy Milan Mission 2015": mission,
    "Growing up in Arizona": L.geoJSON(childhood, {onEachFeature: onEachFeature}).addTo(map),
};

L.control.layers(basemaps, trips).addTo(map);