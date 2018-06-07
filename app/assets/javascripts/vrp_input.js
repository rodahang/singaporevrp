require([
  "esri/Map",
  "esri/views/MapView",

  "esri/tasks/Geoprocessor",

  "esri/widgets/Expand",
  "esri/widgets/BasemapGallery",

  "esri/layers/GraphicsLayer",
  "esri/Graphic",
  "esri/geometry/Point",

  "dojo/domReady!"
], function(
  Map, MapView,
  Geoprocessor,
  Expand,BasemapGallery,
  GraphicsLayer, Graphic, Point
) {
  var map, mapview;

  // Graphic Layers
  var homeGraphicLayer;

  // Component Vars
  var hasOders = false, hasDepots = false, hasTrucks = false;

  // GeoProccessor
  var vnusVRPGP = new Geoprocessor(window.config.VRP_GP_URL);

  map = new Map({
      basemap: "dark-gray",
  });

  /************************************************************
   * Set the Map instance to the map property in a MapView.
   ************************************************************/
  mapview = new MapView({
    map: map,  // References a Map instance
    container: "vrp-mapview",  // References the ID of a DOM element
    zoom: 11,
    center: [103.8021433,1.3727412]
  });

  mapview.when(function() {
    // init graphic layers
    homeGraphicLayer = new GraphicsLayer();
    map.add(homeGraphicLayer);
  });


  var basemapGallery = new BasemapGallery({
      view: mapview,
      container: document.createElement("div")
    });

  var bgExpand = new Expand({
        view: mapview,
        content: basemapGallery.container,
        expandIconClass: "esri-icon-basemap"
      });

  mapview.ui.add(bgExpand, "top-right");

  VRPStorageHelper.activate();

  // public functions
  showPoints = function() { 
    homeGraphicLayer.removeAll();

    var ordersFromLocalStorage = VRPStorageHelper.getOrdersJSONArray();
    var depotsFromLocalStorage = VRPStorageHelper.getDepotsJSONArray();

    if (ordersFromLocalStorage) {
      hasOders = true;
      showOrdersTable(ordersFromLocalStorage); // show order tables
      
      ordersFromLocalStorage.forEach(function(addedOrderPoint) { // show points on map
            var orderedPointGraphic = new Graphic({
                geometry: new Point(addedOrderPoint.x, addedOrderPoint.y),
                symbol: window.config.stopPictureMarkerSymbol
            });
            // console.log('addedOrderPoint',orderedPointGraphic);
            homeGraphicLayer.add(orderedPointGraphic);
        });
    } else hasOders = false;

    if (depotsFromLocalStorage) { //add depot points
      hasDepots = true;
      showDepotsTable(depotsFromLocalStorage); //show depot tables

      depotsFromLocalStorage.forEach(function(addedDepotPoint) { // show points on map
          var depotPointGraphic = new Graphic({
              geometry: new Point(addedDepotPoint.x, addedDepotPoint.y),
              symbol: window.config.originPictureMarkerSymbol
          });
          homeGraphicLayer.add(depotPointGraphic);
      });
    } else hasDepots = false;
  }

  showOrdersTable = function(ordersArr) {
    
    $('#orderInputPanel .upload-div-vrp').hide(); //hide drag panel

    var tablehtml = '<table> <tbody>';
    ordersArr.forEach(function(addedOrderPoint) {  // add items on table
      tablehtml += '<tr>';
      tablehtml += '<td>' + addedOrderPoint.NAME + '</td>';
      tablehtml += '<td>' +  addedOrderPoint.DeliveryQuantities + '</td>';
      tablehtml += '<td>' + addedOrderPoint.TimeWindowStart1 + ' - ' + addedOrderPoint.TimeWindowEnd1 + '</td>';
      tablehtml += '<td>' + addedOrderPoint.ServiceTime + '</td>';
      tablehtml += '<td>  <i class="fa fa-pencil"></i>&nbsp;&nbsp;&nbsp;<i class="fa fa-trash"></i></td>';
      tablehtml += '</tr>';
    });
    tablehtml += '</tbody> </table>';

    $('#orderInputPanel .items-orders').html(tablehtml);
    $('#orderInputPanel .inputs-table').show(); //show table panel
    checkButtons('#orderInputPanel');
  }

  showDepotsTable = function(depotsArr) {
    $('#depotInputPanel .upload-div-vrp').hide(); //hide drag panel

    var tablehtml = '<table> <tbody>';
    depotsArr.forEach(function(addedDepotPoint) {  // add items on table
      tablehtml += '<tr>';
      // tablehtml += '<td>' + addedDepotPoint.NAME + '</td>';
      tablehtml += '<td> Central Warehouse</td>';
      tablehtml += '<td>' + addedDepotPoint.TimeWindowStart1 + ' - ' + addedDepotPoint.TimeWindowEnd1 + '</td>';
      tablehtml += '<td>  <i class="fa fa-pencil"></i>&nbsp;&nbsp;&nbsp;<i class="fa fa-trash"></i></td>';
      tablehtml += '</tr>';
    });
    tablehtml += '</tbody> </table>';

    $('#depotInputPanel .items-orders').html(tablehtml);
    $('#depotInputPanel .inputs-table').show(); //show table panel
    checkButtons('#depotInputPanel');
  }

  showTrucksTable = function(trucksArr) {
    if (trucksArr == undefined) {
      trucksArr = VRPStorageHelper.getTrucksJSONArray();
      if (trucksArr.length == 0) {
        hasTrucks = false;
        return;
      }
    }
    hasTrucks = true;
    
    $('#truckInputPanel .upload-div-vrp').hide(); //hide drag panel

    var tablehtml = '<table> <tbody>';
    trucksArr.forEach(function(addedTruck) {  // add items on table
      tablehtml += '<tr>';
      tablehtml += '<td>' + addedTruck.Name + '</td>';
      tablehtml += '<td>' + addedTruck.Capacities + '</td>';
      tablehtml += '<td>' + addedTruck.EarliestStartTime + ' - </td>';
      tablehtml += '<td>' + addedTruck.MaxTotalDistance + '</td>';
      tablehtml += '<td>' + addedTruck.MaxOrderCount + '</td>';
      tablehtml += '<td>' + addedTruck.MaxTotalTime + '</td>';
      tablehtml += '<td>  <i class="fa fa-pencil"></i>&nbsp;&nbsp;&nbsp;<i class="fa fa-trash"></i></td>';
      tablehtml += '</tr>';
    });
    tablehtml += '</tbody> </table>';

    $('#truckInputPanel .items-orders').html(tablehtml);
    $('#truckInputPanel .inputs-table').show(); //show table panel
    checkButtons('#truckInputPanel');
  }

  var directions = null; storesResults = null; routesResults = null, unassignedStopsResults = null; // solve VRP VARS
  solveVRP = function() {
    var missingInfo = [];
    var trucksArr = VRPStorageHelper.getTrucksJSONArray();
    var ordersArr = VRPStorageHelper.getOrdersJSONArray();
    var depotsArr = VRPStorageHelper.getDepotsJSONArray();


    if (trucksArr.length == 0)
        missingInfo.push('truck');
    if(ordersArr.length == 0)
        missingInfo.push('order');
    if (depotsArr == 0) 
        missingInfo.push('depot');

    directions = null; storesResults = null; routesResults = null, unassignedStopsResults = null;

    if (missingInfo.length == 0) {
      var routeConfigParam = jQuery.extend(true, {}, window.config.Routes);
      routeConfigParam.features = VRPHelper.JSONToRouteFeatureJSONArray(trucksArr);

      var orderConfigParam = jQuery.extend(true, {}, window.config.Orders);
      orderConfigParam.features = VRPHelper.JSONToOrderFeatureJSONArray(ordersArr).slice();

      var depotConfigParam = jQuery.extend(true, {}, window.config.Depot);
      depotConfigParam.features = VRPHelper.JSONToDepotFeatureJSONArray(depotsArr).slice();

      var routeRenewalConfigParam = jQuery.extend(true, {}, window.config.RouteRenewals);
      routeRenewalConfigParam.features = getRouteRenewal(trucksArr);

      clearGraphics();

      var params = {Routes: JSON.stringify(routeConfigParam), 
                Orders : JSON.stringify(orderConfigParam), 
                Depots: JSON.stringify(depotConfigParam),
                Route_Renewals: JSON.stringify(routeRenewalConfigParam)};

      vnusVRPGP.execute(params).then(showVRPResults);
      var routeTempSymbol;
      function showVRPResults(response) {
        // console.log('showVRPResults',response.results);
        directions = response.results[0].value.features;
        routesResults = response.results[1].value.features;
        storesResults = response.results[2].value.features;
        unassignedStopsResults = response.results[3].value.features;


        localStorage.setItem(window.config.directionsKey, JSON.stringify(directions));
        localStorage.setItem(window.config.routesResultsKey, JSON.stringify(routesResults));
        localStorage.setItem(window.config.storesResultsKey, JSON.stringify(storesResults));
        localStorage.setItem(window.config.unassignedStopsResultsKey, JSON.stringify(unassignedStopsResults));
      }
    }
  }

  function clearGraphics() {
    // remove routeGraphics
  }

  function getRouteRenewal(trucksArr) {
    routeRenewalArr = [];
    trucksArr.forEach(function(truckJson) {
        routeRenewalFeatureJson = jQuery.extend(true, {}, window.config.RouteRenewalsFeatureFormat);
        routeRenewalFeatureJson.attributes.RouteName = truckJson.Name;
        routeRenewalArr.push(routeRenewalFeatureJson);
    });
    return routeRenewalArr;
  }

  //  UI BUTTONS EVENT HANDLER
  var currentTab = '#orderInputPanel';
  checkButtons();
  addOrders = function() {
    $('#vrpInputTab a[href="#orderInputPanel"]').tab('show');
  }

  addDepots = function() {
    $('#vrpInputTab a[href="#depotInputPanel"]').tab('show');
  }

  addTrucks = function() {
    $('#vrpInputTab a[href="#truckInputPanel"]').tab('show');
  }

  useDefault = function() {
      localStorage.setItem(window.config.ordersKey, ordersString);
      localStorage.setItem(window.config.depotsKey, depotString);
      localStorage.setItem(window.config.trucksKey, truckString);
      showPoints();
      showTrucksTable();
  }

  function checkButtons() {
    var ref_this = $("ul#vrpInputTab li.active");
    if (currentTab !== '#truckInputPanel' && !hasTrucks) $('.addTrucksBtn').show(); 
    else $('.addTrucksBtn').hide();

    if (currentTab !== '#depotInputPanel' && !hasDepots) $('.addDepotsBtn').show(); 
    else $('.addDepotsBtn').hide();

    if (currentTab !== '#orderInputPanel' && !hasOders) $('.addOrdersBtn').show(); 
    else $('.addOrdersBtn').hide();

    if (hasOders && hasDepots && hasTrucks) {
      $('.solveVRPBtn').show(); 
      $('.useDfaultBtn').hide(); 
    } else {
      $('.solveVRPBtn').hide(); 
      $('.useDfaultBtn').show(); 
    }
  }

  // EVENTS
  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    currentTab = e.target.hash;
    checkButtons();
  })
});