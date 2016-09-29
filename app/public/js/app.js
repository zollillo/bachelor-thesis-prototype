/**
 * app.js
 *
 * This file is part of **Cohesion Catalyst prototype** (working title) project
 * and created during June 10 - September 10, 2013 within the context of the bachelor thesis
 * * * ---------------------------------------------------
 *     "Konzeption und Umsetzung einer Web-Applikation zur
 *      visuellen Exploration von Multikollektivitaet"
 * * * ---------------------------------------------------
 * at Beuth Hochschule fuer Technik Berlin, University of Applied Sciences.
 * Author: Nadja Zollo, Matrikelnr. 763962, nadja.zollo@gmail.com
 *
 *
 * Purpose: Provides the application's root namespace.
 *
 * This module exports one method, **initModule**, which is a function that initializes the application module.
 *
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

/* global $, app */  //Information for JSLint about global variables

// Creating the namespace of this module: app
var app = (function () {
  'use strict';
  var initModule;

  // Initializes the module and starts the initialization cascade.
  initModule = function ($container) {
    // always ensure Data is initialized before the Model and the Shell
    app.data.initModule();
    app.model.initModule();
    app.shell.initModule($container);

  };

  // Return the public method **initModule**
  return {
    initModule : initModule
  };
}());