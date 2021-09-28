const MapApp = (function () {
    "use strict"

    // Basemaps
    const URL_OPENSTREETMAP = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    const ATTRIBUTION_OPEN_STREET_MAP = {attribution: '&copy <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
    const URL_STAMEN_TERRAIN = "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg"
    const URL_STAMEN_WATERCOLOR = "https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg"
    const basemaps = {
        "Open Street Maps": L.tileLayer(URL_OPENSTREETMAP, ATTRIBUTION_OPEN_STREET_MAP),
        "Stamen Water Color": L.tileLayer(URL_STAMEN_WATERCOLOR),
        "Stamen Terrain": L.tileLayer(URL_STAMEN_TERRAIN),
        "ESRI World Imagery": L.esri.basemapLayer('Imagery'),
        "ESRI Labeled World Imagery": L.layerGroup([L.esri.basemapLayer('Imagery'), L.esri.basemapLayer('ImageryLabels')]),
        "ESRI Terrain": L.esri.basemapLayer('Terrain'),
        "ESRI Labeled Terrain": L.layerGroup([L.esri.basemapLayer('Terrain'), L.esri.basemapLayer('ImageryLabels')]),
    }
    // URLs and Paths
    const DIV_MAP = "map"
    const URL_STATICGJ = "/static/geojson/"
    const URL_MYGEOJSONS = `${URL_STATICGJ}directory.json`
    const URL_ESRI_COUNTRY_LIST = `${URL_STATICGJ}esri-countries-service.json`
    // Config JSONS
    const TIME_LAYER_CONFIGS = {
        name: 'time',
        requestTimefromCapabilities: true,
        updateTimeDimension: true,
        updateTimeDimensionMode: 'replace',
        cache: 20,
    }
    const MAP_INIT_CONFIGS = {
        zoom: 2,
        minZoom: 2,
        zoomSnap: .5,
        boxZoom: true,
        crs: L.CRS.EPSG4326,
        maxBounds: L.latLngBounds(L.latLng(-100.0, -270.0), L.latLng(100.0, 270.0)),
        center: [0, 0],
        timeDimension: true,
        timeDimensionControl: true,
        timeDimensionControlOptions: {
            position: "bottomleft",
            autoPlay: true,
            loopButton: true,
            backwardButton: true,
            forwardButton: true,
            timeSliderDragUpdate: true,
            minSpeed: 2,
            maxSpeed: 6,
            speedStep: 1,
        },
    }

    const URL_UCAR_GFS = "https://thredds.ucar.edu/thredds/wms/grib/NCEP/GFS/Global_0p25deg/Best"
    const AUTOFILL_GFS = {
        url: URL_UCAR_GFS,
        layer: "Temperature_surface",
        min: 225,
        max: 350,
        color: "boxfill/alg2",
    }
    const AUTOFILL_GESDISC = {
        url: "https://giovanni.gsfc.nasa.gov/giovanni/daac-bin/wms_ag4",
        layer: "Time-Averaged.GLDAS_NOAH025_3H_2_1_Tair_f_inst"
    }

    // Get JSON from URL
    const SELECT_MYGEOJSON = document.getElementById("select-geojson")
    const INPUT_JSON_URL = document.getElementById("input-json-url")
    // ESRI Services
    const INPUT_SEARCH_COUNTRY = document.getElementById("esri-country-input")
    const URL_ESRI_COUNTRY_SERVICE = "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/World__Countries_Generalized_analysis_trim/FeatureServer/0"
    let layerEsriCountry = null
    const DATALIST_ESRI_COUNTRIES = document.getElementById("list-esri-countries")
    const BTN_SHOW_ESRI_COUNTRY = document.getElementById("btn-show-esri-country")
    // Find Location
    const BTN_FIND_LOCATION = document.getElementById("btn-find-location")
    const INPUT_FIND_LATITUDE = document.getElementById("input-find-lat")
    const INPUT_FIND_LONGITUDE = document.getElementById("input-find-lon")
    let LAYER_FIND_MARKER = null;
    // WMS Buttons and Inputs
    const BTN_GET_WMS = document.getElementById("btn-get-wms")
    const BTN_GET_WMS_TIME = document.getElementById("btn-get-wms-time")
    const BTN_GET_LEGEND = document.getElementById("btn-get-legend")
    const INPUT_WMS_URL = document.getElementById("endpoint")
    const INPUT_WMS_LAYER = document.getElementById("layer")
    const INPUT_WMS_COLOR = document.getElementById("styles")
    const INPUT_WMS_MIN = document.getElementById("csmin")
    const INPUT_WMS_MAX = document.getElementById("csmax")
    const INPUT_WMS_OPAC = document.getElementById("input-wms-opacity")
    // Draw/Edit GeoJSON
    const INPUT_EDIT_JSON = document.getElementById("textarea-json")
    const BTN_GET_JSON = document.getElementById("btn-get-json")
    const BTN_EDIT_JSON = document.getElementById("json-submit")
    const BTN_SAVE_JSON = document.getElementById("json-save")

    let LAYER_GEOJSON = L.geoJSON()
    let LAYER_WMS = null
    let LAYER_DRAW = new L.FeatureGroup()
    let layerControl
    let drawControl = new L.Control.Draw({
        edit: {
            featureGroup: LAYER_DRAW
        }
    })
    let map
    const legend = L.control({position: 'bottomright'})
    legend.onAdd = () => {
        let div = L.DomUtil.create('div')
        let url = `${INPUT_WMS_URL.value}?REQUEST=GetLegendGraphic&LAYER=${INPUT_WMS_LAYER.value}&PALETTE=${INPUT_WMS_COLOR.value.replace('boxfill/', '')}&COLORSCALERANGE=${INPUT_WMS_MIN.value},${INPUT_WMS_MAX.value}`
        div.innerHTML = `<img src="${url}" alt="legend" style="width:100% float:right">`
        return div
    }
    const latLonPopUp = L.control({position: 'bottomleft'})
    let latLonDivElement
    latLonPopUp.onAdd = () => {
        return L.DomUtil.create('div', 'mouse-position')
    }

    const init = function () {
        map = L.map(DIV_MAP, MAP_INIT_CONFIGS)
        basemaps[Object.keys(basemaps)[0]].addTo(map)

        layerControl = L.control.layers(basemaps, {"Drawn Items": LAYER_DRAW.addTo(map)}, {collapsed: false})
        layerControl.addTo(map)

        map.addControl(drawControl)
        initClickEvents()
        initDrawEvents()

        latLonPopUp.addTo(map)
        latLonDivElement = document.getElementsByClassName("mouse-position")[0]
        map.on("mousemove", event => {
            latLonDivElement.innerHTML = `Lat: ${event.latlng.lat.toFixed(5)}, Lon: ${event.latlng.lng.toFixed(5)}`
        })

        readGeoJsonDirectory()
        readEsriCountryList()
    }

    const initDrawEvents = function () {
        map.on("draw:created", function (event) {
            LAYER_DRAW.addLayer(event.layer)
            updateJsonDisplay()
        })
        map.on("draw:edited", function (event) {
            updateJsonDisplay()
        })
        map.on("draw:deleted", function (event) {
            updateJsonDisplay()
        })
    }
    const initClickEvents = function () {
        SELECT_MYGEOJSON.addEventListener("change", () => {
            addGeoJSON(`${URL_STATICGJ}${SELECT_MYGEOJSON.value}`, SELECT_MYGEOJSON.options[SELECT_MYGEOJSON.selectedIndex].text)
        })
        BTN_GET_JSON.addEventListener("click", () => {
            addGeoJSON(INPUT_JSON_URL.value, "Provided JSON URL")
        })
        BTN_EDIT_JSON.addEventListener("click", () => {
            addInputJson(JSON.parse(INPUT_EDIT_JSON.value))
        })
        BTN_SAVE_JSON.addEventListener("click", () => {
            let link = document.createElement('a')
            link.setAttribute('href', encodeURI(`data:text/csvcharset=utf-8,${INPUT_EDIT_JSON.value}`))
            link.setAttribute('target', '_blank')
            link.setAttribute('download', 'drawn_geojson.json')
            document.body.appendChild(link)
            link.click()
            link.remove()
        })
        BTN_GET_LEGEND.addEventListener("click", () => {
            addLegend()
        })
        INPUT_WMS_OPAC.addEventListener("change", () => {
            if (LAYER_WMS === null) return
            LAYER_WMS.setOpacity(INPUT_WMS_OPAC.value)
        })
        BTN_SHOW_ESRI_COUNTRY.addEventListener("click", () => {
            esriCountryService()
        })
        BTN_FIND_LOCATION.addEventListener("click", () => {
            findLocation()
        })
    }
    const findLocation = function () {
        if (LAYER_FIND_MARKER !== null) {
            layerControl.removeLayer(LAYER_FIND_MARKER)
            map.removeLayer(LAYER_FIND_MARKER)
        }
        LAYER_FIND_MARKER = L.marker([INPUT_FIND_LATITUDE.value, INPUT_FIND_LONGITUDE.value]).addTo(map)
        LAYER_FIND_MARKER.bindPopup(`I am at Lat: ${INPUT_FIND_LATITUDE.value} and Lon: ${INPUT_FIND_LONGITUDE.value}`)
        layerControl.addOverlay(LAYER_FIND_MARKER, "Found Location")
        map.flyTo([INPUT_FIND_LATITUDE.value, INPUT_FIND_LONGITUDE.value], 5)
    }

    const readGeoJsonDirectory = function () {
        fetch(URL_MYGEOJSONS)
            .then(response => {
                return response.json()
            })
            .then(directory => {
                for (let entry in directory) {
                    SELECT_MYGEOJSON.innerHTML += `<option value="${directory[entry]}">${entry}</option>`
                }
            })
    }
    const readEsriCountryList = function () {
        fetch(URL_ESRI_COUNTRY_LIST)
            .then(response => {
                return response.json()
            })
            .then(countryList => {
                countryList.forEach(country => {
                    DATALIST_ESRI_COUNTRIES.innerHTML += `<option value="${country}"/>`
                })
            })
    }
    const esriCountryService = function () {
        if (layerEsriCountry !== null) {
            layerControl.removeLayer(layerEsriCountry)
            map.removeLayer(layerEsriCountry)
        }
        let countryName = INPUT_SEARCH_COUNTRY.value

        layerEsriCountry = L.esri.featureLayer({
            url: URL_ESRI_COUNTRY_SERVICE,
            style: {
                color: 'rgba(0,0,0,1)',
                opacity: 1,
                weight: 1,
                fillColor: 'rgba(0,0,0,0)',
                fillOpacity: 'rgba(0,0,0,0)'
            },
            outSR: 4326,
            where: `NAME='${countryName}'`,
        })
        layerControl.addOverlay(layerEsriCountry, `ESRI Living Atlas: ${countryName}`)
        layerEsriCountry.addTo(map)
        layerEsriCountry.query().where(`NAME='${countryName}'`).bounds((error, latLngBounds, response) => {
            map.flyToBounds(latLngBounds)
        })
    }
    const removeGeoJSON = function () {
        layerControl.removeLayer(LAYER_GEOJSON)
        map.removeLayer(LAYER_GEOJSON)
    }

    const addGeoJSON = function (url, title) {
        if (url === "") {
            return
        }
        fetch(url)
            .then(response => {
                return response.json()
            })
            .then(gjson => {
                removeGeoJSON()
                LAYER_GEOJSON = L.geoJSON(gjson).addTo(map)
                layerControl.addOverlay(LAYER_GEOJSON, title)
            })
            .catch(error => {
                console.log(error)
                alert("unable to add geojson to map")
            })
    }

    const removeWMS = function () {
        if (LAYER_WMS !== null) {
            layerControl.removeLayer(LAYER_WMS)
            map.removeLayer(LAYER_WMS)
        }
    }

    const addWMS = function (url, layer, title, time) {
        removeWMS()
        const wmsOptions = {
            version: "1.3.0",
            layers: layer,
            format: "image/png",
            transparent: true,
            crossOrigin: false,
            useCache: true,
        }
        if (INPUT_WMS_MIN.value !== "" && INPUT_WMS_MAX.value !== "") {
            wmsOptions["colorscalerange"] = `${INPUT_WMS_MIN.value},${INPUT_WMS_MAX.value}`
        }
        if (INPUT_WMS_COLOR.value !== "") {
            wmsOptions["styles"] = INPUT_WMS_COLOR.value
        }
        if (time) LAYER_WMS = L.timeDimension.layer.wms(L.tileLayer.wms(url, wmsOptions), TIME_LAYER_CONFIGS).addTo(map)
        else LAYER_WMS = L.tileLayer.wms(url, wmsOptions).addTo(map)
        layerControl.addOverlay(LAYER_WMS, (title ? title : layer))
    }

    const addWMSLayer = (event) => {
        event.preventDefault()
        removeWMS()
        const wmsOptions = {
            layers: event.target.layer.value,
            version: event.target.version.value,
            format: "image/png",
            transparent: true,
            crossOrigin: false,
            width: event.target.width.value,
            height: event.target.height.value,
            srs: event.target.srs.value
        }
        if (event.target.styles.value) wmsOptions['styles'] = event.target.styles.value
        if (event.target.csmin.value && event.target.csmax.value) wmsOptions['colorscalerange'] = `${event.target.csmin.value},${event.target.csmax.value}`

        LAYER_WMS = L.tileLayer.wms(event.target.endpoint.value, wmsOptions)
        if (event.target.time.value) LAYER_WMS = L.timeDimension.layer.wms(LAYER_WMS, TIME_LAYER_CONFIGS)
        LAYER_WMS.addTo(map)
        layerControl.addOverlay(LAYER_WMS, (event.target.layer.value))
    }

    const addLegend = function () {
        legend.addTo(map)
    }

    const updateJsonDisplay = function () {
        INPUT_EDIT_JSON.value = JSON.stringify(LAYER_DRAW.toGeoJSON(), null, 2)
    }

    const addInputJson = function (json) {
        LAYER_DRAW.clearLayers()
        LAYER_DRAW.addLayer(L.geoJSON(json))
    }

    const autofillWmsInputs = function (config) {
        if (config === "gfs") {
            INPUT_WMS_URL.value = AUTOFILL_GFS.url
        } else if (config === "gfs-temp") {
            INPUT_WMS_URL.value = AUTOFILL_GFS.url
            INPUT_WMS_LAYER.value = AUTOFILL_GFS.layer
            INPUT_WMS_MIN.value = AUTOFILL_GFS.min
            INPUT_WMS_MAX.value = AUTOFILL_GFS.max
            INPUT_WMS_COLOR.value = AUTOFILL_GFS.color
            document.getElementById("time").checked = true
        } else if (config === 'gesdisc') {
            INPUT_WMS_URL.value = AUTOFILL_GESDISC.url
            INPUT_WMS_LAYER.value = AUTOFILL_GESDISC.layer
        }
    }

    return {
        init,
        autofillWmsInputs,
        addWMSLayer,
    }

}())
MapApp.init()