var demad_map;
var center_coord;
var zone_selected = 0;
var city_selected = "manhattan"
var accData = [['ID', 'Demand']]
var acc2Data = [['ID', 'predict']]
var map2;
var heatmap;
var heatmapData;
var polyline = [];
var polyline2;
var stationIds = [[2,244],[4,244], [10,244]];
var lineCoordinates = [
    [{lat: 1.405526256480268, lng: 103.91330881308866},
    {lat: 1.283337027754498, lng: 103.8219849635441}],
    [{lat: 1.4384750895304514, lng: 103.70937510395528},
        {lat: 1.283337027754498, lng: 103.8219849635441}],
        [{lat: 1.319651, lng: 103.764444},
            {lat: 1.283337027754498, lng: 103.8219849635441}]
];
var lineCoordinates2 = [
    {lat: 1.4384750895304514, lng: 103.70937510395528},
    {lat: 1.283337027754498, lng: 103.8219849635441}
];

var manhattan_center_coord = {lat: 40.78928978708174, lng: -73.96156428542177};
var singapore_center_coord = {lat: 1.3699186781713397, lng: 103.8112600763408};

demad_map = window.demad_map;

var myCharts = [];
var ispause = true; // Use to set playpause state of simulator
var isswitch = false;

// Custom html-css element
class myDivider extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // Create the child elements
    const firstDiv = document.createElement('div');
    firstDiv.style.height = "50px";
    firstDiv.style.width = "1px"; 
    firstDiv.style.borderRight = "1px solid rgb(150, 150, 150)";
    firstDiv.style.marginLeft = "20px";
    firstDiv.style.display = "inline-block";

    const secondDiv = document.createElement('div');
    secondDiv.style.height = "50px";
    secondDiv.style.width = "1px"; 
    secondDiv.style.borderLeft = "1px solid rgb(150, 150, 150)";
    secondDiv.style.marginRight = "20px";
    secondDiv.style.display = "inline-block";

    // Append the child elements to the custom element
    this.appendChild(firstDiv);
    this.appendChild(secondDiv);

    this.style.whiteSpace = "nowrap";
  }
}

// Register the custom element
customElements.define('my-divider', myDivider);
// End Custom html-css element //////////

function updateLabel(update_date, update_time) {
  document.getElementById("update_date").innerHTML = update_date;
  document.getElementById("update_time").innerHTML = update_time;
}

// const summaryValues = {
//   summary1: undefined,
//   summary2: undefined,
//   summary3: undefined,
//   summary4: undefined
// };

// To reset chart display.
// 'chart2' naming might change in the future or might use multiple charts
function resetChart() {
  if (myCharts["chart2"] != undefined || myCharts["chart2"] != null) {
    myCharts["chart2"].clearChart();
    document.getElementById("chartoverlay").style.display = "none";
  }
}

function update_summary_labels(msg) {
  var summarylabels = document.getElementsByClassName("dp_summary_container");
  for (let i = 0; i < summarylabels.length; i++) {
    summarylabels[i].style.display = "flex";
  }

  const elements = document.getElementsByClassName("extend_summary");
  if (city_selected === "manhattan") {
    for (let i = 0; i < elements.length; i++) {
      elements[i].style.display = "none";
    }

    document.getElementById("summary1_label").innerHTML = "Demand";
    document.getElementById("summary1").innerHTML = msg.total_actual_demand_24h;

    document.getElementById("summary2_label").innerHTML = "MEDIAN OF RELATIVE ERROR";
    document.getElementById("summary2").innerHTML = msg.relative_error_median;
  }
  else if (city_selected === "singapore") {

    for(let i = 0; i < elements.length; i++) {
      elements[i].style.display = "block";
    }

    document.getElementById("summary1_label").innerHTML = "MAE";
    document.getElementById("summary1").innerHTML = msg.mae;

    document.getElementById("summary2_label").innerHTML = "Median Demand";
    document.getElementById("summary2").innerHTML = msg.median;

    document.getElementById("summary3_label").innerHTML = "Netflow";

    var summary3Element = document.getElementById("summary3");
    //if (summaryValues[summary3] === undefined) { summaryValues[summary3] = msg.netflow;}
    if (msg.netflow >= 0) {
      summary3Element.style.color = "#92D050"; // increased netflow, make text green
    }
    else //if (summaryValues[summary3] > msg.netflow)
    {
      summary3Element.style.color = "#FF3B3B"; // decreased netflow, make text red
    }
    // else {
    //   summary3Element.style.color = "white"; // same netflow, make text white
    // }
    summary3Element.innerHTML = msg.netflow;

    document.getElementById("summary4_label").innerHTML = "Correlation";
    document.getElementById("summary4").innerHTML = msg.correlation;
  }
}

function updateHeatmap(region_gps, msg) {
  var no_demand = true;
  region_count = 66;
  
  heatmapData = [];

  if (heatmap) {
    heatmap.setMap(null);
    heatmap.setData([]);
  }

  var keys = Object.keys(region_gps);

  if (zone_selected) {
    no_demand = false;
    var loc_plot = {
      location: new google.maps.LatLng(region_gps[selectedZoneId].lat, region_gps[selectedZoneId].lng),
      weight: msg[selectedZoneId]
    };
    heatmapData.push(loc_plot);
  }
  else {
    for (i of keys) {
      region = i;
      
      if (msg[region] > 0) {
        no_demand = false;
        // console.log(msg[region]);
        var loc_plot = {
          location: new google.maps.LatLng(region_gps[i].lat, region_gps[i].lng),
          weight: msg[region]};
        heatmapData.push(loc_plot);
      }
    }
  }

  if (no_demand) {
    eatmapData = [];
  }
  
  // typeof(heatmapData);
  heatmap = new google.maps.visualization.HeatmapLayer({
    data: heatmapData,
    dissipating: false,
    radius : 0.009,
    opacity : 0.7,
    options:"{maxIntensity: 5}"
  });
  heatmap.setMap(demad_map);
}

google.charts.load('current',{packages:['corechart']});
google.charts.setOnLoadCallback(drawChart);

function drawChart(region_gps, msg) {
  if (msg == undefined) return;
  if (isswitch) {
    isswitch = false;
    return;
  }
  
  var no_demand = true
  var maxSize = 24;
  region_count = 66

  // create initial chart
  if (myCharts["chart2"] === undefined || myCharts["chart2"] === null) {
    myCharts["chart2"] = new google.visualization.LineChart(document.getElementById('myChart'));

    google.visualization.events.addListener(myCharts["chart2"], 'ready', function () {
      //Google visualization chart manipulation
      var chartArea = myCharts["chart2"].getChartLayoutInterface().getChartAreaBoundingBox();
      var svg = myCharts["chart2"].getContainer().getElementsByTagName('svg')[0];
  
      // Draw the prediction horizon box on the chart
      var rect = document.createElementNS(svg.namespaceURI, 'rect');
      rect.setAttribute('id', 'chart-rect');
      rect.setAttribute('x', chartArea.left + 21 * (chartArea.width / 24));
      rect.setAttribute('y', chartArea.top);
      rect.setAttribute('width', (chartArea.width / 24) * 3);
      rect.setAttribute('height', chartArea.height);
      rect.setAttribute('fill', 'rgba(255, 255, 0, 0.35)'); // Change the fill color and opacity
      rect.setAttribute('stroke', 'none'); // Remove the stroke
      svg.append(rect);
  
      // Define the SVG filter
      var filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
      filter.setAttribute('id', 'glow1');
  
      var filter2 = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
      filter2.setAttribute('id', 'glow2');
  
      var feGaussianBlur1 = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
      feGaussianBlur1.setAttribute('result', 'blurOut');
      feGaussianBlur1.setAttribute('in', 'offOut');
      feGaussianBlur1.setAttribute('stdDeviation', '1.2');
  
      filter.appendChild(feGaussianBlur1);
  
      var feGaussianBlur2 = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
      feGaussianBlur2.setAttribute('result', 'blurOut');
      feGaussianBlur2.setAttribute('in', 'offOut');
      feGaussianBlur2.setAttribute('stdDeviation', '1.2');
  
      filter2.appendChild(feGaussianBlur2);

      // Append the filter to the chart SVG element
      var svgElement = myCharts["chart2"].getContainer().getElementsByTagName('svg')[0];
      svgElement.append(filter);
      svgElement.append(filter2);
  
      // Apply the filter to the path elements in the chart
      var pathElements = svgElement.getElementsByTagName('path');
      if (pathElements[3]) pathElements[3].setAttribute('filter', 'url(#glow2)');
      if (pathElements[2]) pathElements[2].setAttribute('filter', 'url(#glow1)');
    });
  } else {
    resetChart(); // clear chart data instead of making new chart
  }
    
  // if (region_gps) {
  //     var keys = Object.keys(region_gps);

  //     for (i of keys)  {
  //         // accuracy = "accuracy_"+i
  //         region = i

  //         no_demand = false;
  //         // console.log(region_gps[i]);
  //         var acc_plot = [i,msg[region]]
  //         accData.push(acc_plot);
  //     }

  //     accData.sort(function(a, b) {
  //         return b[1] - a[1];
  //       });
  //     const top_twenty = accData.slice(0, 16);
  //     // console.log(accData);
  //     // console.log(top_twenty);
  // update_date = msg.actual_timestamp.split(" ")[0];
  
  //Get the timestamp
  predicted_timestamp = msg.predicted_timestamp.split(" ")[1];

  //Split the date into DD:MM:YY
  var parts = msg.predicted_timestamp.split(" ")[0].split('/');

  //Set the time variable for plotting
  var time1 = new Date(parts[2], parts[1] - 1, parts[0]);
  time1.setHours(predicted_timestamp.split(":")[0], 0, 0, 0); // Set the hours, minutes, seconds, and milliseconds
  var acc_plot2 = [time1, msg.predicted_total_demand];
  acc2Data.push(acc_plot2);

  if (acc2Data.length > maxSize) {
    acc2Data.splice(1, 1);
  }

  var data = google.visualization.arrayToDataTable(acc2Data);

  // console.log(msg.actual_total_demand);
  if (msg.actual_total_demand !== undefined) {

    //Get the timestamp
    actual_timestamp = msg.actual_timestamp.split(" ")[1];
    
    //Split the date into DD:MM:YY
    var parts = msg.actual_timestamp.split(" ")[0].split('/');
    
    //Set the time variable for plotting
    var time = new Date(parts[2], parts[1] - 1, parts[0]);
    time.setHours(actual_timestamp.split(":")[0], 0, 0, 0); // Set the hours, minutes, seconds, and milliseconds

    var acc_plot = [time,msg.actual_total_demand]
    accData.push(acc_plot);
    
    if (accData.length > maxSize) {
      accData.splice(1, 1);
    }
    
    var data1 = google.visualization.arrayToDataTable(accData);

    try
    {
      var data = google.visualization.data.join(data, data1, 'left', [[0, 0]], [1], [1]);
      data.setColumnLabel(1, 'predicted demand');
      data.setColumnLabel(2, 'true demand');
    } catch {

    }
  }

  // Get the view window options
  var lastRow = data.getNumberOfRows() - 1; // Get the index of the last data point
  var lastTime = data.getValue(lastRow, 0); // Get the time of the last data point
  var twentyFourTime = new Date(lastTime.getTime() - (24 * 60 * 60 * 1000)); // Get the time of the 24th data point

  // Define the time range you're interested in
  var startTime = twentyFourTime;
  var endTime = lastTime;

  // Find the rows that fall within the specified time range
  var joinedRowsInRange = [];

  for (var i = 0; i < data.getNumberOfRows(); i++)
  {
    var timeValue = data.getValue(i, 0);
    if (timeValue >= startTime && timeValue <= endTime) {
      joinedRowsInRange.push(i);
    }
  }

  // Find the maximum y-value in the rows that fall within the specified time range
  var maxYValue = -Infinity;
  if (joinedRowsInRange.length > 1) {
    for (var i = 0; i < joinedRowsInRange.length; i++) {
      if (msg.actual_total_demand !== undefined) {
        var yValue = data.getValue(joinedRowsInRange[i], 2);
        if (yValue > maxYValue) {
          maxYValue = yValue;
        }
      }
    }
  }

  // Set Graph Options
  var options = {
    backgroundColor: '#231F20', //background color of the chart
    //colors: ['#4DD0E1'], //set the data series colors to different colors
    textStyle: { color: '#ffffff' },

    title: "Demand Forecasting\n",
    titleTextStyle: {
      fontSize: 18,
      color: '#ffffff'
    },

    legend: { position: 'right' },
    legendTextStyle: { color: '#ffffff' },
    
    curveType: 'function',
    pointShape: 'circle',
    pointSize: 6,
    lineWidth: 3,

    //overwrite options for individual lines
    series: {
      0: { //predit demand line
        color: '#FFA800',
      },
      1: { //actual demand line
        color: '#01FFFA',
      },
    },

    //areaOpacity: 0.2, // set the opacity of the area under the line to 0.5

    hAxis: {
      title: 'Time',
      titleTextStyle: { color: '#ffffff' },
      textStyle: { color: '#ffffff' }, // set the color of the x-axis label to white
      viewWindow: {
        min: twentyFourTime,
        max: lastTime
      },
      gridlines: {
        count: 6,
        units: { 
          hours: { format: ['HH:mm', 'ha'] }
        }
      }
    },

    vAxis: {
      title: 'Demand',
      titleTextStyle: { color: '#ffffff' },
      textStyle: { color: '#ffffff' },// set the color of the x-axis label to white
      gridlines: { count: 5 }
    },

    tooltip: {
      trigger: 'selection', 
      isHtml: false,
    },
    // your other options here
  };

  //Draw
  //var chart = new google.visualization.BarChart(document.getElementById('myChart'));
  // var chart2 = new google.visualization.LineChart(document.getElementById('myChart')); //// moved to start of function

  myCharts["chart2"].draw(data, options);
  document.getElementById("chartoverlay").style.display = "block";

  // Geting highest Y value and setting selection (for tooltip)
  var rowIndex = -1;
  var colIndex = -1;
  if (joinedRowsInRange.length > 1) {
    for (var i = 0; i < joinedRowsInRange.length; i++) {
      if (data.getValue(joinedRowsInRange[i], 2) === maxYValue) {
        rowIndex = i;
        colIndex = 2; // Assuming y is the second column (index 1)
        break;
      }
    }

    if (rowIndex >= 0 && colIndex >= 0 && data.getNumberOfRows() > 3) {
      // Set the selection to the specified chart element
      myCharts["chart2"].setSelection([{row: rowIndex, column: colIndex}]);
    }
  }
  //chart2.draw(data2, options);
  //chart3.draw(data, options);
}

// Change playpause button icon depending on state of simulation
function updatePlayPauseButton() {
  const togglePlayPause = document.getElementById("playpause");
  const togglePlayPauseSvg = togglePlayPause.querySelector("svg");
  if (!ispause) {
    //pause icon
    togglePlayPauseSvg.querySelector("path").setAttribute("d", "M5 6.25a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0v-3.5zm3.5 0a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0v-3.5z");
  }
  else {
    //play icon
    togglePlayPauseSvg.querySelector("path").setAttribute("d", "M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z");
  }
}

$(document).ready(function () {
  socket = io.connect();

  updatePlayPauseButton();

  // Elements to hide on page start
  document.getElementById("chartoverlay").style.display = "none";
  var summarylabels = document.getElementsByClassName("dp_summary_container");
  for (let i = 0; i < summarylabels.length; i++) {
    summarylabels[i].style.display = "none";
  }
    
  socket.on("hourly_actual_demand_json", function (msg) {
    update_date = msg.date_time.split(" ")[0];
    update_time = msg.date_time.split(" ")[1];
    update_time = update_time.padStart(5, "0"); //Add leading 0 to time (00:00)
    updateLabel(update_date, update_time);
    updateHeatmap(region_gps, msg);
    //console.log("Socket Date: ", msg.date_time);
  });

  socket.on("graph_data", function (msg) {
    //console.log(msg)
    drawChart(region_gps, msg);
    update_summary_labels(msg);
  });

  $("#playpause").on("click", function() {
    if (ispause) {
      ispause = false;
      console.log("start pressed");
      socket.emit("start");
    }
    else {
      ispause = true;
      console.log("pause pressed");
      socket.emit("pause");
    }
    updatePlayPauseButton();

    // const region_gps = window.region_gps;
  });

  $("#restart").on("click", function() {
    ispause = false;
    console.log("restart pressed");
    socket.emit("pause");
    socket.emit("restart");
    updatePlayPauseButton();

    accData = [['ID', 'Demand']];
    acc2Data = [['ID', 'predict']];
    resetChart();
  });

  $("input[name='bsingapore']").on("click", function() {
    console.log("Singapore pressed");
    socket.emit("singapore");
    initMap(singapore_center_coord);
    region_gps = singapore_region_gps;
  });

  $("input[name='bmanhattan']").on("click", function() {
    console.log("Manhattan pressed");
    socket.emit("manhattan");
    initMap(manhattan_center_coord);
    region_gps = manhattan_region_gps;
  });

  window.onbeforeunload = function() {
    console.log('Page refreshed');
    socket.emit("resubmit");
    socket.emit("pause");
    ispause = true;
    updatePlayPauseButton();
  };
});

function Togglegraph(graph) {
  var all_graph= document.getElementsByClassName("toggle_graph");
  for (i = 0; i < all_graph.length; i++) {
    if (all_graph[i].getAttribute( 'id' )==graph) {
      all_graph[i].style.display = "block";
    }
    else {
      all_graph[i].style.display = "none";
    }
  }
}

function initMap(center_coord = manhattan_center_coord, zoom = 12) { 
  const image_charger = {
      url: "/static/images/charging_point.png", // url
      scaledSize: new google.maps.Size(40, 40), // size
    };

  // var center_coord = {lat: 40.78928978708174, lng: -73.96156428542177};                                             

  window.demad_map = new google.maps.Map(document.getElementById('station_map'), {         
    center: center_coord,             
    zoom: zoom,
    mapId: 'f476029de756efd3',
    mapTypeId: 'roadmap'                                         
  });                                                                     

  // window.region_gps = JSON.parse('{{ region_gps|safe }}');                                                                     
}
  
document.addEventListener("DOMContentLoaded", function() {
  const data = JSON.parse(JSON.parse(document.getElementById("json_data").textContent));
  const selectElement = document.getElementById("countrySelect");
  const regionSelectElement = document.getElementById("regionSelect");
  
  // var options = ["Option 1", "Option 2", "Option 3"];
  // const obj = JSON.parse(data);
  // console.log(typeof(obj));
  // console.log(data["singapore"]);
  manhattan_region_gps = data["manhattan"]
  singapore_region_gps = data["singapore"]
  region_gps = manhattan_region_gps
  // Do something with the data here
  regionSwitch();

  selectElement.addEventListener("change", function() {    
    const selectedValue = selectElement.value;
    accData = [['ID', 'Demand']]
    acc2Data = [['ID', 'predict']]
    if (selectedValue == "singapore") {
      city_selected = "singapore";
      console.log("Singapore selected");
      socket.emit("singapore");
      initMap(singapore_center_coord, 11);
      region_gps = singapore_region_gps;
      regionSwitch();
      zone_selected = 0;
    }
    else if (selectedValue == "manhattan") {
      city_selected = "manhattan"
      console.log("Manhattan selected");
      socket.emit("manhattan");
      initMap(manhattan_center_coord, 12);
      region_gps = manhattan_region_gps;
      regionSwitch();
      zone_selected = 0;
    }
    
    isswitch = true;
    resetChart();
    
    ispause = true;
    updatePlayPauseButton();
  });

  regionSelectElement.addEventListener("change", function() {
    console.log("Changing zones");
    accData = [['ID', 'Demand']];
    acc2Data = [['ID', 'predict']];
    selectedZoneId = regionSelectElement.value;
    var zone_center_coord = region_gps[selectedZoneId];
    initMap(zone_center_coord, 14);
    socket.emit("zone", selectedZoneId);
    zone_selected = 1;

    var options = myCharts["chart2"].getOption();
    options.vAxis.viewWindow.max - 2000;
    myCharts["chart2"].setOptions(options);

    var zone_marker = new google.maps.Marker({
      position: zone_center_coord,
      map: demad_map,
      // label: {
      //   text: "Zone "+ selectedValue,
      //   color: "white",
      //   fontSize: "16px",
      //   textAlign: "right",
      //   verticalAlign: "top",
      // //   labelOrigin: new google.maps.Point(0, -30) // move label above the marker
      // },
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
        scaledSize: new google.maps.Size(50,50)
      }
    });
  });
});

function regionSwitch() { 
  var region_dropdown = document.getElementById("regionSelect");
  region_dropdown.innerHTML = "";
  var keys = Object.keys(region_gps);

  var option = document.createElement("option");
  option.text = " ";
  region_dropdown.add(option);

  for (i of keys) {
    region = i;
    
    var option = document.createElement("option");
    option.text = "Zone " + region;
    option.value = region;
    option.style.backgroundColor = "rgb(0, 0, 0)";
    region_dropdown.add(option);
  }
}