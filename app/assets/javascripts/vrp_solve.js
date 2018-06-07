require([
  "esri/Map",
  "esri/views/MapView",

  "esri/tasks/Geoprocessor",

  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/PictureMarkerSymbol",
  "esri/symbols/TextSymbol",

  "esri/widgets/Expand",
  "esri/widgets/BasemapGallery",

  "esri/layers/GraphicsLayer",
  "esri/Graphic",
  "esri/geometry/Point",

  "esri/config",

  "dojo/domReady!"
], function(
  Map, MapView,
  Geoprocessor,
  SimpleLineSymbol, PictureMarkerSymbol, TextSymbol,
  Expand,BasemapGallery,
  GraphicsLayer, Graphic, Point,
  esriConfig
) {

  var map, mapview;

  // GraphicsLayer
  var routesGraphicLayer, stopLabelGraphicLayer, homeGraphicLayer;

  // trucks
  var truckColors = {};

  // GeoProccessor
  var vnusVRPGP = new Geoprocessor(window.config.VRP_GP_URL);

  // vrpResults
  var directionsResults = [], routesResults = [], storesResults = [], unassignedStopsResults = [];
  var trucksArr , ordersArr , depotsArr;

  var expandLevel = 0, routeCtr = 1, solveFromTo = 0;

  var toSolveRoute = [];

  // pointJson
  var stopOrderJson = {}, truckInfoJSON = {};

  map = new Map({
      basemap: "dark-gray",
  });

  /************************************************************
   * Set the Map instance to the map property in a MapView.
   ************************************************************/
  mapview = new MapView({
    map: map,  // References a Map instance
    container: "vrp-mapview",  // References the ID of a DOM element
    zoom: 12,
    center: [103.8021433,1.3727412]
  });

  mapview.when(function() {
    // init graphic layers
    routesGraphicLayer = new GraphicsLayer();
    map.add(routesGraphicLayer);

    homeGraphicLayer = new GraphicsLayer();
    map.add(homeGraphicLayer);

    stopLabelGraphicLayer = new GraphicsLayer();
    map.add(stopLabelGraphicLayer);

    esriConfig.request.timeout = 600000; //10 minutes

    $('#loadingModal').modal({
        keyboard: false,
        backdrop: 'static',
        show: false
    })
    solveVRP();
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

  function initStops(ordersArray) {
    ordersArray.forEach(function(orderJson) {
        stopOrderJson[orderJson.NAME] = {
            "x": orderJson.x,
            "y": orderJson.y
        };
    });
  }

  function initDepot(depotsArr) {
    //add depot points
    depotsArr.forEach(function(depot) {
        var depotPointGraphic = new Graphic({
            geometry: new Point(depot.x, depot.y),
            symbol: window.config.originPictureMarkerSymbol
        });
        homeGraphicLayer.add(depotPointGraphic);
    });
  }

  function getRouteRenewal(trucksArr) {
    routeRenewalArr = [];
    truckInfoJSON  = {};
    trucksArr.forEach(function(truckJson) {
        routeRenewalFeatureJson = jQuery.extend(true, {}, window.config.RouteRenewalsFeatureFormat);
        truckInfoJSON[truckJson.Name] = {};
        truckInfoJSON[truckJson.Name].MaxTotalTravelTime = truckJson.MaxTotalTravelTime;
        truckInfoJSON[truckJson.Name].Capacities = truckJson.Capacities;
        routeRenewalFeatureJson.attributes.RouteName = truckJson.Name;
        routeRenewalArr.push(routeRenewalFeatureJson);
    });
    return routeRenewalArr;
  }

  function getRouteRenewal2(trucksArr) {
    routeRenewalArr = [];
    // truckInfoJSON  = {};
    trucksArr.forEach(function(truckJson) {
        routeRenewalFeatureJson = jQuery.extend(true, {}, window.config.RouteRenewalsFeatureFormat);
        truckInfoJSON[truckJson.Name].MaxTotalTravelTime = truckJson.MaxTotalTravelTime;
        truckInfoJSON[truckJson.Name].Capacities = truckJson.Capacities;
        routeRenewalFeatureJson.attributes.RouteName = truckJson.Name;
        routeRenewalArr.push(routeRenewalFeatureJson);
    });
    return routeRenewalArr;
  }

  function solvePerRoute(routeName, storePoints) {
      var missingInfo = [];
      //get route
      var routeItemArr = [];
      routeItemArr.push(getRouteByName(routeName));

      // routeItemArr = VRPStorageHelper.getTrucksJSONArray();
      // storePoints = VRPStorageHelper.getOrdersJSONArray();

      if (routeItemArr.length == 0)
        missingInfo.push('truck');
      if(storePoints.length == 0)
          missingInfo.push('order');
      if (depotsArr == 0) 
          missingInfo.push('depot');

      if (missingInfo.length == 0) {
        $('#loadingModal').modal('show');
        var routeConfigParam = jQuery.extend(true, {}, window.config.Routes);
        routeConfigParam.features = VRPHelper.JSONToRouteFeatureJSONArray(routeItemArr);

        var orderConfigParam = jQuery.extend(true, {}, window.config.Orders);
        orderConfigParam.features = VRPHelper.JSONToOrderFeatureJSONArray(storePoints).slice();

        var depotConfigParam = jQuery.extend(true, {}, window.config.Depot);
        depotConfigParam.features = VRPHelper.JSONToDepotFeatureJSONArray(depotsArr).slice();

        var routeRenewalConfigParam = jQuery.extend(true, {}, window.config.RouteRenewals);
        routeRenewalConfigParam.features = getRouteRenewal2(routeItemArr);

        var params = {Routes: JSON.stringify(routeConfigParam), 
                Orders : JSON.stringify(orderConfigParam), 
                Depots: JSON.stringify(depotConfigParam),
                Route_Renewals: JSON.stringify(routeRenewalConfigParam)};


        vnusVRPGP.execute(params).then(vrpSolveRouteItem);

        function vrpSolveRouteItem(response) {
             solveFromTo += 1;
            var routesItemResults = response.results[1].value.features;
            var storesItemResults = response.results[2].value.features;
            var unassignedStopsItemResults = response.results[3].value.features;

            //overwrite the route 
            // routesResults.forEach(function(resultRoute) {
            //   if (resultRoute.attributes.Name == routeName) {
            //     resultRoute.attributes = resultRoute.attributes;
            //   }
            // });

            var routesResultsLengthCtr = routesResults.length;
            while (routesResultsLengthCtr--) {
                if (routesResults[routesResultsLengthCtr].attributes.Name == routeName) { 
                    routesResults.splice(routesResultsLengthCtr, 1);
                } 
            }
            routesItemResults.forEach(function(routesItemResult) {
              routesResults.push(routesItemResult);
            });
            //remove all stores from truck
            var storesLenghtCtr = storesResults.length;
            while (storesLenghtCtr--) {
                if (storesResults[storesLenghtCtr].attributes.RouteName == routeName) { 
                    storesResults.splice(storesLenghtCtr, 1);
                } 
            }

            storesItemResults.forEach(function(storesItemResult) {
              storesResults.push(storesItemResult);
            });

            //show routes 
            if (solveFromTo == 2) {
              routesGraphicLayer.removeAll();
              homeGraphicLayer.removeAll();
              stopLabelGraphicLayer.removeAll();

              $('#loadingModal').modal('hide');
              //remove the div
              // $(".results-container").empty();
              var routeTempSymbol;
              routesResults.forEach(function(resultRoute) {
                  routeColor = truckColors[resultRoute.attributes.Name].color;

                  routeTempSymbol = jQuery.extend(true, {}, window.config.routeLineSymbol);
                  routeTempSymbol.color = routeColor;
                  var routeLineGraphic = new Graphic({
                      geometry: resultRoute.geometry,
                      symbol: routeTempSymbol,
                      attributes: resultRoute.attributes
                  });
                  routesGraphicLayer.add(routeLineGraphic);
                  // routeCtr++;
                  if (toSolveRoute.includes(resultRoute.attributes.Name)) {
                    addRouteItem(resultRoute,true);
                  }
              });
              if (routesResults.length > 1) {
                initEventsRouteSolve();
              }
            }
        }
      }
  }

  function solveVRP() {
    var missingInfo = [];
     trucksArr = VRPStorageHelper.getTrucksJSONArray();
     ordersArr = VRPStorageHelper.getOrdersJSONArray();
     depotsArr = VRPStorageHelper.getDepotsJSONArray();

    if (trucksArr.length == 0)
        missingInfo.push('truck');
    if(ordersArr.length == 0)
        missingInfo.push('order');
    if (depotsArr == 0) 
        missingInfo.push('depot');

    directions = null; storesResults = null; routesResults = null, unassignedStopsResults = null;

    if (missingInfo.length == 0) {
      $('#loadingModal').modal('show');
      var routeConfigParam = jQuery.extend(true, {}, window.config.Routes);
      routeConfigParam.features = VRPHelper.JSONToRouteFeatureJSONArray(trucksArr);

      var orderConfigParam = jQuery.extend(true, {}, window.config.Orders);
      orderConfigParam.features = VRPHelper.JSONToOrderFeatureJSONArray(ordersArr).slice();

      var depotConfigParam = jQuery.extend(true, {}, window.config.Depot);
      depotConfigParam.features = VRPHelper.JSONToDepotFeatureJSONArray(depotsArr).slice();

      var routeRenewalConfigParam = jQuery.extend(true, {}, window.config.RouteRenewals);
      routeRenewalConfigParam.features = getRouteRenewal(trucksArr);

      var params = {Routes: JSON.stringify(routeConfigParam), 
                Orders : JSON.stringify(orderConfigParam), 
                Depots: JSON.stringify(depotConfigParam),
                Route_Renewals: JSON.stringify(routeRenewalConfigParam)};

      vnusVRPGP.execute(params).then(showVRPResults);
      var routeTempSymbol;

      function showVRPResults(response) {
        $('#loadingModal').modal('hide');
        expand();
        initStops(ordersArr);
        initDepot(depotsArr);
         $('.results-container').html('');

        directionsResults = response.results[0].value.features;
        routesResults = response.results[1].value.features;
        storesResults = response.results[2].value.features;
        unassignedStopsResults = response.results[3].value.features;


        var routeTempSymbol, routeColor;
        truckColors = {};
        routeCtr = 0;
        routesResults.forEach(function(resultRoute) {
            routeColor = window.config.routeColorPaletteArray[routeCtr % 21];
            truckColors[resultRoute.attributes.Name] = {};
            truckColors[resultRoute.attributes.Name].color = routeColor;

            routeTempSymbol = jQuery.extend(true, {}, window.config.routeLineSymbol);
            routeTempSymbol.color = routeColor;
            var routeLineGraphic = new Graphic({
                geometry: resultRoute.geometry,
                symbol: routeTempSymbol,
                attributes: resultRoute.attributes
            });
            routesGraphicLayer.add(routeLineGraphic);
            routeCtr++;
            addRouteItem(resultRoute);
        });

        if (routesResults.length > 1) {
          initEventsRouteSolve();
        }
      }
    }
  }

  function initEventsRouteSolve() {
    $('.results-container .stops-container').sortable({
            connectWith: '.results-container .stops-container',
            update: function( event, ui ) {

              if (ui.sender != null) {
                solveFromTo = 0;
                //new position = event.target
                //previous container = ui.sender[0]

                var transferToRoute = event.target.id;
                var transferFromRoute = ui.sender[0].id;

                //solve new route  (TO)
                var storesToRoute = $('#'+transferToRoute).find('.stop-box');
                var storesToArr = [], storeItem = {};
                var routeToName = transferToRoute.split('stopcon_')[1];

                for (var storeCtr = 0; storeCtr < storesToRoute.length; storeCtr++) {
                  storeItem = getOrderbyName(storesToRoute[storeCtr].id);
                  storeItem.AssignmentRule = 1;
                  storeItem.RouteName = routeToName;
                  storeItem.Sequence = storeCtr+1;
                  storesToArr.push(storeItem);
                };

                //from
                var storesFromRoute = $('#'+transferFromRoute).find('.stop-box');
                var storesFromArr = [];
                var routeFromName = transferFromRoute.split('stopcon_')[1];

                for (var storeCtr = 0; storeCtr < storesFromRoute.length; storeCtr++) {
                  storeItem = getOrderbyName(storesFromRoute[storeCtr].id);
                  storeItem.AssignmentRule = 1;
                  storeItem.RouteName = routeFromName;
                  storeItem.Sequence = storeCtr+1;
                  storesFromArr.push(storeItem);
                };

                // console.log('storesToArr',storesToArr);
                // console.log('storesFromArr',storesFromArr);

                toSolveRoute = [];
                toSolveRoute.push(routeToName);
                toSolveRoute.push(routeFromName);

                solvePerRoute(routeToName,storesToArr);
                solvePerRoute(routeFromName,storesFromArr);
                  //get stops
                  // getOrderbyName('test');

              };
            }
          });
           $('[data-toggle="tooltip"]').tooltip();
  }

  function addRouteItem(routeFeatureInfo,isRefresh) {
    var routeName = routeFeatureInfo.attributes.Name;
    var routeColor = truckColors[routeName].color;

    var totalTime = routeFeatureInfo.attributes.TotalTime;
    var totalTimePercentate = parseInt(totalTime/truckInfoJSON[routeName].MaxTotalTravelTime * 100);
    var innerHtml = '';
    if (isRefresh) {
      $(".route_"+routeName)[0].innerHTML = '';
    } else {
      innerHtml = '<div class="result-route route_'+routeName+'">';
    }
    var truckToolTipInfo = 'data-toggle="tooltip" data-html="true" title="Max Total Time: '+ truckInfoJSON[routeName].MaxTotalTravelTime+' <br> Total Travel Time : '+ parseInt(totalTime)+' <br> Time Utilisation: '+ totalTimePercentate+'%"';
    innerHtml += '<div class="result-left" '+truckToolTipInfo+'>';
    innerHtml += '<div style="width: 100px; float: left;">' + routeName  + '</div>';
    innerHtml += '<div> <img src="/timeutil.png" style="width: 16px;"></img> <label><b>'+totalTimePercentate+'%</b></label> </div> </div>'
    innerHtml += '<div class="result-right">';

    var routeTrips = VRPHelper.getRouteTripJSON(routeFeatureInfo.attributes, storesResults);
    var routeTrip;
    var lastDepartTime = 0;

    innerHtml += '<div class="item-stops-container">';

    // line background color //rgba(' +routeColor[0] + ',' + routeColor[1] + ',' + routeColor[2] + ',' + routeColor[3] + ')
    innerHtml += '<div class="before-line" style="border-top-color: rgba(' +routeColor[0] + ',' + routeColor[1] + ',' + routeColor[2] + ',1);"></div>';

    innerHtml += '<div class="stops-container" id="stopcon_'+ routeName + '">';

    var spaceTime = 0, stopTime = 0;
    var percentageVal = 100 / 10;
    var totalPercentage = 0;
    var widthPercentage = 0;
    var truckCapacity = truckInfoJSON[routeName].Capacities;
    // var totalTime = TotalTime;
    for(var tripKey in routeTrips) {
      routeTrip = routeTrips[tripKey];

      for(var stopKey in routeTrip) {
        if (routeTrip[stopKey].StopType) {

          if (parseFloat(routeTrip[stopKey].PickupQuantities) == 0) {
              // End Travel (back at depot)

              spaceTime = routeTrip[stopKey].ArriveTime - lastDepartTime;
              widthPercentage = ((spaceTime/1000/60) / 600) * 100;
              innerHtml += '<div class="space-box" style="width: '+ widthPercentage +'%;"> </div>';
              
              totalPercentage = (100-((600 - totalTime) / 600) * 100) ; 

              // innerHtml += '<div class="end-box" style="width: '+ (100 - totalPercentage) +'%;">';
              if (routeCtr%2 ==0) {
                innerHtml += '<div class="end-box" style="width: '+ (100 - totalPercentage) +'%; background-color: rgb(234, 242, 255)">';
              } else {
                innerHtml += '<div class="end-box" style="width: '+ (100 - totalPercentage) +'%; background-color: rgb(242, 247, 255)">';
              }
              
              innerHtml += '<div class="depot-box" style="background-color:rgb(' +routeColor[0] + ',' + routeColor[1] + ',' + routeColor[2] + ')"><i class="fa fa-flag-checkered" aria-hidden="true"></i></div>';
              innerHtml += ' </div>';
          } else {
            var capacityPercentage = parseFloat(routeTrip[stopKey].PickupQuantities)/truckCapacity * 100;
            var capacityToolTip = 'data-toggle="tooltip" data-html="true" title="Truck Capacity: '+ truckCapacity+' <br> Picked-up Quantities: '+ parseFloat(routeTrip[stopKey].PickupQuantities)+'"';
            //background: linear-gradient(left, black 50%, white 50%);

              if (lastDepartTime == 0) {
                lastDepartTime = routeTrip[stopKey].DepartTime;
              } else {
                //calculate time from last depart time to arrival
                spaceTime = routeTrip[stopKey].ArriveTime - lastDepartTime;
                innerHtml += '<div class="space-box" style="width: '+ ((spaceTime/1000)/60) /percentageVal  +'%;"> </div>';
              }

              var backgroundPercent = '';
              if (routeCtr%2 ==0) {
                backgroundPercent = 'background: -webkit-linear-gradient(rgb(234, 242, 255) '+ (100-capacityPercentage)+'%, rgb(' +routeColor[0] + ',' + routeColor[1] + ',' + routeColor[2] + ') '+ capacityPercentage+'%);'
              } else {
                backgroundPercent = 'background: -webkit-linear-gradient(rgb(242, 247, 255) '+ (100-capacityPercentage)+'%, rgb(' +routeColor[0] + ',' + routeColor[1] + ',' + routeColor[2] + ') '+ capacityPercentage+'%);';
              }

              stopTime = routeTrip[stopKey].DepartTime - routeTrip[stopKey].ArriveTime;
              widthPercentage = ((stopTime/1000/60) / 600) * 100;

              // innerHtml += '<div class="depot-box" style="background-color:rgb(' +routeColor[0] + ',' + routeColor[1] + ',' + routeColor[2] + ');width: '+ widthPercentage +'%;"><i class="fa fa-truck" aria-hidden="true"></i></div>';
              innerHtml += '<div class="depot-box" style="' + backgroundPercent+' width: '+ widthPercentage +'%; " '+ capacityToolTip +'><i class="fa fa-truck" aria-hidden="true"></i></div>';
          }
        } else {
          // normal stops
          //calculate time from last depart time to arrival
          spaceTime = routeTrip[stopKey].ArriveTime - lastDepartTime;
          stopTime = routeTrip[stopKey].DepartTime - routeTrip[stopKey].ArriveTime;
          var stopID = routeTrip[stopKey].Name;

          widthPercentage = ((spaceTime/1000/60) / 600) * 100;
          innerHtml += '<div class="space-box" style="width: '+ widthPercentage +'%;" id="'+stopID+ '"> </div>';

          widthPercentage = ((stopTime/1000/60) / 600) * 100;
          innerHtml += '<div  id="'+stopID+ '"" class="stop-box" style="color:rgb(' +routeColor[0] + ',' + routeColor[1] + ',' + routeColor[2] +'); width: '+ ( ((stopTime/1000)/60) / percentageVal  ) +'%;"> '+ stopKey + '</div>';

          lastDepartTime = routeTrip[stopKey].DepartTime;


          // add stop point
          var stopTextSymbol = jQuery.extend(true, {}, window.config.stopTextSymbol);
          stopTextSymbol.text = routeTrip[stopKey].Sequence;

          var stopLabelGraphic = new Graphic({
              geometry: new Point(stopOrderJson[routeTrip[stopKey].Name].x,stopOrderJson[routeTrip[stopKey].Name].y),
              symbol: stopTextSymbol
          });

          stopLabelGraphic.popupTemplate = {
              title: "Stop " + routeTrip[stopKey].Sequence + " at " + routeTrip[stopKey].Name,
              content: "Delivered by: " + routeName 
              + '<br>Delivered Quantities: '  + parseInt(routeTrip[stopKey].DeliveryQuantities) 
              + '<br>Arrive Time: '  + VRPHelper.convertTimeStampToDateTime(routeTrip[stopKey].ArriveTime) 
              + '<br>Depart Time: '  + VRPHelper.convertTimeStampToDateTime(routeTrip[stopKey].DepartTime) 
          };
          stopLabelGraphicLayer.add(stopLabelGraphic);

          var stopPointSymbol = jQuery.extend(true, {}, window.config.markerSymbol);
          
          var colorNewPoint = [routeColor[0],routeColor[1],routeColor[2]];
          stopPointSymbol.color = colorNewPoint;
          var orderedPointGraphic = new Graphic({
              geometry: new Point(stopOrderJson[routeTrip[stopKey].Name].x,stopOrderJson[routeTrip[stopKey].Name].y),
              symbol: stopPointSymbol
          });
          homeGraphicLayer.add(orderedPointGraphic);
        }
      }
    }

    innerHtml +='</div>';

    

    if (isRefresh) {
      innerHtml += '</div>';
      $(".route_"+routeName)[0].innerHTML = innerHtml;
      // $(".route_"+routeName).append(innerHtml);
    } else {
      innerHtml += '</div> </div>';
      $('.results-container').append(innerHtml);
    }

    
  }

  // public function
  expand = function() {
    if (expandLevel == 0) {
      $('.vrp-map').css("height", "55%");
      $('.vrp-results').css("height", "45%");
      mapview.zoom = 11;
      $('.collapse-btn').prop('disabled', false);
      expandLevel++;
    } else if(expandLevel == 1) {
        expandLevel++;
        $('.vrp-map').css("height", "35%");
        $('.vrp-results').css("height", "65%");
        $('.expand-btn').prop('disabled', true);
        mapview.zoom = 10;
    }
  }

  collapse = function () {
    if (expandLevel == 1) {
      $('.vrp-map').css("height", "calc(100% - 35px)");
      mapview.zoom = 12;
      expandLevel--;
      $('.collapse-btn').prop('disabled', true);
      $('.expand-btn').prop('disabled', false);
    } else if(expandLevel == 2) {
      $('.vrp-map').css("height", "55%");
      $('.vrp-results').css("height", "45%");
      mapview.zoom = 11;
      expandLevel--;
      $('.expand-btn').prop('disabled', false);
    }
  }


  function getOrderbyName(storeName) {
    var store = {};
    var BreakException = {};

    try {
      ordersArr.forEach(function(orderJson) {
        if (orderJson.NAME == storeName) {
          store = orderJson;
          throw BreakException;
        }
      });
    } catch (e) {
      if (e !== BreakException) throw e;
    }

    // console.log('getOrderbyName',store);
    return store;
  }

  function getRouteByName(routeName) {
    var route = {};
    var BreakException = {};

    try {
      trucksArr.forEach(function(truckJson) {
        if (truckJson.Name == routeName) {
          route = truckJson;
          throw BreakException;
        }
      });
    } catch (e) {
      if (e !== BreakException) throw e;
    }

    // console.log('getRouteByName',route);
    return route;
  }
});