/**
 * app.visualization.js
 *
 * Author: Nadja Zollo
 * Date: 26.07.13
 */

/*jslint
 browser: true,
 continue: true,
 devel: true,
 indent: 2,
 maxerr: 50,
 newcap: true,
 nomen: true,
 plusplus: true,
 regexp: true,
 sloppy: true,
 vars: false,
 white: true
 */

/* global $, app, d3 */  //Information for JSLint about global variables


// Creating the namespace of this module: app.visualization
app.visualization = (function () {
  'use strict';
  var
    // A configuration map with values that do not change after module initialization
    configMap = {
      rendered_html : app.util.renderTemplate('app.visualization')
    },
    // A map that will hold values which change dynamically
    stateMap = {},
    // A map that will hold cached jQuery selection objects
    jqueryMap = {},
    setJqueryMap,
    bindUIActions,
    subscribeEvents,
    dataToSingleView,
    getSingleViewData,
    makeVisualization,
    fetchUserSelection,
    addSelectOptions,
    showAlert,
    initModule
    ;

  // Populates the jqueryMap with jQuery selection objects.
  // That way we can use the jqueryMap with its cached elements instead constantly
  // calling jQuery for searching through the DOM for elements.
  setJqueryMap = function () {
    var $templateContainer;
    $templateContainer = configMap.$template_container;
    jqueryMap = {
      $template_container : $templateContainer,
      $welcomePane        : $templateContainer.find('#welcome'),
      $singleTab          : $templateContainer.find('a[href="#single"][data-toggle="tab"]'),
      $singlePane         : $templateContainer.find('#single'),
      $pairTab            : $templateContainer.find('a[href="#pair"][data-toggle="tab"]'),
      $pairPane           : $templateContainer.find('#pair'),
      $overallPane        : $templateContainer.find('#all'),
      $loadDataBtn        : $templateContainer.find('#fetch'),
      $alert_div          : $templateContainer.find('.alert-div')
    };
  };


  // Convenient function for binding user interface events
  // cf. code snippet at [as per August 7, 2013]:
  // * http://css-tricks.com/how-do-you-structure-javascript-the-module-pattern-edition/
  // TODO Tab functionality must not be working if the user has not selected a training id.
  bindUIActions = function () {
    jqueryMap.$singleTab.on('shown', function (e) {
      // TODO Make visualization work for user only and then update dynamically with db data.
      var user = app.model.user.getCurrentUser();
      app.data.lookupSingleCollectivity(user.name);
    });
    jqueryMap.$pairTab.on('shown', fetchUserSelection);

  };

  // Convenient function for subscribing to global custom events.
  // The **jquery.event.gevent.js plugin** provides the global custom events functionality.
  subscribeEvents = function () {
    $.gevent.subscribe(jqueryMap.$template_container, 'singleDataAvailable', dataToSingleView);
    $.gevent.subscribe(jqueryMap.$pairPane, 'allUserSelection', addSelectOptions);
  };

  // BEGIN function **dataToSingleView**
  // Handles the global custom event **singleDataAvailable** which is published when
  // the function **app.data.lookupSingleCollectivity** was a successful database query.
  // The data returned from the database is an array and always structured in the following manner:
  // * [ [username, topic1, [optional subtopics], categorycolor ], [username, topic2, [optional subtopics], categorycolor ], .... ]
  // This represents a structure which we want to use for a D3 force-layout visualization.
  // For example, a **username** always represents a **source** and a **topic** is always a **target** but
  // can also be a **source** if there is a **subtopic** which in turn is a **target**.
  // Therefore the data needs to be processed so that we can draw **nodes** and **links** according to
  // the **source** and **target** relations.
  dataToSingleView = function (event, db_data) {
//    console.log("data", db_data);
//    console.log("data.data", db_data.data);
//    console.log("data.data[0]", db_data.data[0]);
    var
      i = 0,
      j = 1,
      links = [],
      data = db_data.data
      ;

    for (i; i < data.length; i++) {
      links.push({source : data[i][0], target : data[i][1], color : data[i][3]});
      if (data[i][2].length > 0) {
        links.push({source : data[i][1], target : data[i][2][0], color : data[i][3]});
        for (j; j < data[i][2].length; j++) {
          links.push({source : data[i][2][j - 1], target : data[i][2][j], color : data[i][3]});
        }
      }
    }
    stateMap.singleViewData = links;
//    console.log("stateMap ", stateMap.singleViewData);
    // TODO Find a way to update the visualization - this way, we create always a new visalization on top
    makeVisualization();
  }; // END function **dataToSingleView**



  getSingleViewData = function () {
    return stateMap.singleViewData;
  };



  // BEGIN function **makeVisualization**
  // This is taken and adapted from the example at [as per August 7, 2013]:
  // * http://bl.ocks.org/mbostock/2706022
  // Some minor customizations include the color values of the nodes, which are retrieved from the
  // data array and a different value for the radius of the user node.
  makeVisualization = function () {
    var
      user = app.model.user.getCurrentUser(),
      nodes = {},
//      links,
      links = getSingleViewData(),

      width,
      height,
      force,
      svg,
      link,
      node,
      tick,
      mouseover,
      mouseout
      ;

    console.log("links", links);
    tick = function () {
      link
        .attr("x1", function (d) {
          return d.source.x;
        })
        .attr("y1", function (d) {
          return d.source.y;
        })
        .attr("x2", function (d) {
          return d.target.x;
        })
        .attr("y2", function (d) {
          return d.target.y;
        });

      node
        .attr("transform", function (d) {
          return "translate(" + d.x + "," + d.y + ")";
        });
    };

    mouseover = function () {
      d3.select(this).select("circle").transition()
        .duration(750)
        .attr("r", function (d, i) {
          if (d.name === user.name) {
            return 34;
          }
          return 26;
        });
    };

    mouseout = function () {
      d3.select(this).select("circle").transition()
        .duration(750)
        .attr("r", function (d, i) {
          if (d.name === user.name) {
            return 26;
          }
          return 18;
        });
    };


    nodes[user.name] = {name : user.name};


    // Compute the distinct nodes from the links.
    links.forEach(function (link) {
      link.source = nodes[link.source] || (nodes[link.source] = {name : link.source, color : link.color});
      link.target = nodes[link.target] || (nodes[link.target] = {name : link.target, color : link.color});
    });

    width = 760;
    height = 450;

    force = d3.layout.force()
      .nodes(d3.values(nodes))
      .links(links)
      .size([width, height])
      .linkDistance(100)
      .charge(-400)
      .on("tick", tick)
      .start();

    svg = d3.select("#single").append("svg")
      .attr("width", width)
      .attr("height", height);


    link = svg.selectAll(".link")
      .data(force.links())
      .enter().append("line")
      .attr("class", "link");

    node = svg.selectAll(".node")
      .data(force.nodes())
      .enter().append("g")
      .attr("class", "node")
      .on("mouseover", mouseover)
      .on("mouseout", mouseout)
      .call(force.drag);

    node.append("circle")
      .attr("r", function (d, i) {
        if (d.name === user.name) {
          return 26;
        }
        return 18;
      })
      .style("fill", function (d, i) {
        if (d.name === user.name) {
          return "#ccc";
        }
        return d.color;
      });
    node.append("text")
      .attr("x", 22)
      .attr("dy", ".35em")
      .text(function (d) {
        return d.name;
      });
  }; // END function **makeVisualization**



  // BEGIN function **fetchUserSelection**
  // Handles the event when the user opens the **Pair Up** tab.
  // Gets the current user and training id and calls the function
  // **app.data.lookupAllUserNodes** to fetch all other users in order
  // make them selectable.
  fetchUserSelection = function () {
    var
      user,
      trainingID
      ;
    user = app.model.user.getCurrentUser();
    trainingID = app.model.training.getCurrentTrainingID();
    if (trainingID === null || trainingID === undefined) {
      showAlert();
    } else {
      jqueryMap.$alert_div.find('.alert').alert('close');
      app.data.lookupAllUserNodes(user.name, trainingID);
    }
  }; // END function **fetchUserSelection**


  // BEGIN function **addSelectOptions**
  // Handles the global custom event **allUserSelection** which is published when
  // the function **app.data.lookupAllUserNodes** was a successful database query.
  // The database returns the names of all users that attend the same training as the
  // current user and for every username we create a select option within the
  // **Pair Up** pane.
  // See **app.visualization.handlebars** for details of the DOM elements'structure.
  addSelectOptions = function (event, userSelection) {
    var
      i,
      userList = userSelection.data
      ;
//    console.log("userListlength", userList.length);
    jqueryMap.$userSelect = jqueryMap.$pairPane.find('#users');
    for (i = 0; i < userList.length; i++) {
      jqueryMap.$userSelect.append('<option>' + userList[i] + '</option>');
    }
  };

  //TODO Remove redundancy: duplicate code in app.topic_input.js Module
  showAlert = function () {
    jqueryMap.$alert_div.append([
      '<div class="alert alert-danger fade in">',
      '<button type="button" class="close" data-dismiss="alert">×</button>',
      'Please, select a Trainings-ID.',
      '</div>'
    ].join('\n'));
  };

  // Configures and initializes the module.
  initModule = function ($container) {
    // Find the target container within which the template is going to be rendered.
    configMap.$template_container = $container;
    // Insert the rendered template.
    configMap.$template_container.html(configMap.rendered_html);
    stateMap.singleViewData = [];
    // After the template is in place, jQuery selection objects can be set
    setJqueryMap();
    // and the module can be bound to browser events
    bindUIActions();
    // and to global custom events.
    subscribeEvents();
  };

  // Return the public method **initModule**
  return {
    initModule : initModule
  };

}());