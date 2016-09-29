/**
 * app.model.js
 *
 * This file is part of **Cohesion Catalyst prototype** (working title) project
 * and created during June 10 - September 10, 2013 within the context of the bachelor thesis
 * * * ---------------------------------------------------
 *     "Konzeption und Umsetzung einer Web-Applikation zur
 *      visuellen Exploration von Multikollektivitaet"
 * * * ---------------------------------------------------
 * at Beuth Hochschule fuer Technik Berlin, University of Applied Sciences.
 * Author: Nadja Zollo, Matrikelnr. 763962, nadja.zollo@gmail.com
 * Date: 01.07.13
 *
 * Purpose: The **app.model.js module** is independent from the user interface and
 * provides logic and data management for the browser feature modules.
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

/* global $, app,  */

// Creating the namespace of this module: app.model
app.model = (function () {
 // 'use strict';
  var
    // A makeshift solution to provide the **app.topic_input.handlebars** template with data.
    // In the future this needs to be replaced with a database query.
    templateData = app.dummy.getTemplateData(),
    // A map that will hold values which change dynamically
    stateMap = {
      anonymous_user : null,
      current_user   : null,
      current_trainingID : null
    },
    createUser,
    user,
    training,
    topic,
    initModule;

  // Creates a user object
  createUser = function (user_data) {
    var
      userObject,
      name = user_data.name,
      email = user_data.email,
      password = user_data.password
      ;

    userObject = Object.create(this);
    userObject.name = name;
    userObject.email = email;
    userObject.password = password;
    return userObject;
  };

  // The **app.model.user** API definition closure, i.e. **user** has its own namespace within the **app.model** module.
  // --------------------------
  // Provides public getter and setter methods for the current user object and manages the data
  // and calls to the database to accomplish sign up, login and logout of a user.
  user = (function () {
    var
      getCurrentUser,
      setCurrentUser,
      isTaken,
      signUp,
      logIn,
      logOut
      ;

    getCurrentUser = function () {
      return stateMap.current_user;
    };

    setCurrentUser = function (user) {
      stateMap.current_user = user;
    };

    // TODO Implement a function to check if username or email already exist
    isTaken = function (username) {
//      var temp = app.data.lookupUsername(username);
//     console.log("istaken " , temp );
//      return true;
      // return app.data.userNameExists(username);
      //return true;
    };


    // Signs up a new user.
    // Creates a new user object with the given userdata and calls **app.data.createUserNode** function
    signUp = function (credentials) {
      // TODO: Check if username and email already exist
      // app.data.lookupUsername(credentials.name);
      stateMap.current_user = createUser({
        name     : credentials.name,
        email    : credentials.email,
        password : credentials.password
      });
      app.data.createUserNode(stateMap.current_user);
    };


    // Delegates the login handling to the **app.data.lookupUserNode** function which in turn
    // will publish a global custom event **userLogin** after a successful database query.
    logIn = function (credentials) {
      console.log("Login clicked.");
      app.data.lookupUserNode(credentials);
    };

    // Reverts the current user object to an anonymous user object.
    // This function publishes the global custom event **userLogout** which is
    // subscribed by the **app.shell** module
    logOut = function () {
      stateMap.current_user = stateMap.anonymous_user;
      $.gevent.publish('userLogout');
    };

    // The app.model.user API public methods to export
    return{
      getCurrentUser : getCurrentUser,
      setCurrentUser : setCurrentUser,
      isTaken        : isTaken,
      signUp         : signUp,
      logIn          : logIn,
      logOut         : logOut
    };

  }());


  // **app.model.topic** API definition closure, i.e. **topic** has its own namespace within the **app.model** module.
  // -----------------------
  // Provides a public method to process the data received from the user input.
  topic = (function () {

    var processInputData;

    // Structures the data and builds a clause in **Neo4j Cypher Syntax** in order
    // to create the nodes and relationships in the **Neo4j** database.
    // Passes the prepared data to the **app.data.createTopicNodesWithRel** function.
    processInputData = function (user, category, input) {
      var
        i,
        thisTopicValue,
        thisTopic,
        nodeToCreate,
        parentTopic,
        parentTopicValue,
        hasSubtopicRel,
        taggedAsRel,
        identifiesWithRel,
        nodes = [],
        relationships = [],
        paramList = {
          "topic" : "topic",
          "tag"   : category.toLowerCase(),
          "name"  : user.name
        },
        createClause = []
        ;

      for (i = 0; i < input.length; i++) {
        if (input[i].hasOwnProperty('isSubtopicOf')) {
          thisTopicValue = input[i].topic;
          parentTopicValue = input[i].isSubtopicOf;
          thisTopic = app.util.replaceSpecialChars(thisTopicValue).toLowerCase().split(' ').join('_');
          parentTopic = app.util.replaceSpecialChars(parentTopicValue).toLowerCase().split(' ').join('_');
          nodeToCreate = '(' + thisTopic + '{topic:{' + thisTopic + '}, type:{topic}})';
          hasSubtopicRel = parentTopic + '-[:HAS_SUBTOPIC]->' + thisTopic;
          taggedAsRel = thisTopic + '-[:TAGGED_AS]->category';
          nodes.push(nodeToCreate);
          relationships.push(hasSubtopicRel, taggedAsRel);
          // to dynamically add new properties to the paramList-Object we use square bracket notation here
          paramList[thisTopic] = thisTopicValue;
        }
        else {
          thisTopicValue = input[i].topic;
          thisTopic = app.util.replaceSpecialChars(thisTopicValue).toLowerCase().split(' ').join('_');
          nodeToCreate = '(' + thisTopic + '{topic:{' + thisTopic + '}, type:{topic}})';
          taggedAsRel = thisTopic + '-[:TAGGED_AS]->category';
          identifiesWithRel = 'user-[:IDENTIFIES_WITH]->' + thisTopic;
          nodes.push(nodeToCreate);
          relationships.push(taggedAsRel, identifiesWithRel);
          // to dynamically add new properties to the paramList-Object we use square bracket notation here
          paramList[thisTopic] = thisTopicValue;
        }
      }
      console.log("nodes ", nodes.join(', '));
      console.log("relationships ", relationships.join(', '));
      //console.log("params ", paramList.join(', '));
      console.dir(paramList);
      createClause.push(nodes.join(', '), relationships.join(', '));
      app.data.createTopicNodesWithRel(createClause.join(', '), paramList);
    };

    // Return the **app.model.topic** API public methods
    return {
      processInputData : processInputData
    };
  }());

  // **app.model.training** API definition closure, i.e. **training** has its own namespace within the **app.model** module.
  // --------------------------
  // Provides public methods concerning the cross cultural training model.
  // At this stage of development we use an existing trainings node in the **Neo4j** database
  // to create a relationship between the current user and the training.
  // In the future this needs to be enhanced so that we are able to create new training obejcts.
  training = (function () {
    var
      currentTraining = {},
      commitTrainingID,
      getCurrentTrainingID,
      paramList;

    commitTrainingID = function (training, user) {
      paramList = {
        "id"   : training.id,
        "name" : user.name
      };
      // pass user data to the **app.data.js** module
      app.data.createTrainingRel(paramList);

      stateMap.current_trainingID = training.id;
//      console.log("trainingID ", stateMap.current_trainingID);
    };

    getCurrentTrainingID = function(){
      return stateMap.current_trainingID;
    };

    // Return the **app.model.training** API public methods
    return {
      commitTrainingID : commitTrainingID,
      getCurrentTrainingID : getCurrentTrainingID
    };

  }());



  // Configures and initializes the module
  initModule = function () {
    // Initialize anonymous person
    stateMap.anonymous_user = createUser({
      name     : 'anonymous',
      email    : 'unknown',
      password : 'unknown'
    });

    stateMap.current_user = stateMap.anonymous_user;

  };

  // Return the public methods **templateData** and **initModule** as well
  // as the public objects **user**, **training**, **topic**
  return {
    templateData : templateData,
    initModule   : initModule,
    user         : user,
    training     : training,
    topic        : topic
  };

}());