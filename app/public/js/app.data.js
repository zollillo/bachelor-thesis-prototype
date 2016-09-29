/**
 * app.data.js
 *
 * This file is part of **Cohesion Catalyst prototype** (working title) project
 * and created during June 10 - September 10, 2013 within the context of the bachelor thesis
 * * * ---------------------------------------------------
 *     "Konzeption und Umsetzung einer Web-Applikation zur
 *      visuellen Exploration von Multikollektivitaet"
 * * * ---------------------------------------------------
 * at Beuth Hochschule fuer Technik Berlin, University of Applied Sciences.
 * Author: Nadja Zollo, Matrikelnr. 763962, nadja.zollo@gmail.com
 * Date: 14.07.13
 *
 * Purpose: The **app.data.js module** manages the connections and queries to the **Neo4j** database server.
 * All data communicated between the client and server flows through this module.
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


// Creating the namespace of this module: app.data
app.data = (function () {

  var
    URL_TO_NEO4J_DB = "http://localhost:7474/db/data",
    CYPHER_ENDPOINT = "/cypher",
    createUserNode,
    lookupUserNode,
    lookupAllUserNodes,
    lookupUsername,
    createTopicNodesWithRel,
    createTrainingRel,
    lookupSingleCollectivity,
    usernameExists,
    initModule
    ;

  // BEGIN function **createUserNode**
  createUserNode = function (user) {
    var
      cql,
      query,
      params
      ;

    // Cypher Query Language
    cql = [
      'CREATE (node { type:{type}, name:{username}, email:{email}, password:{password} })',
      'RETURN node.name, node.email, node.password;'
    ].join('\n');
    console.log("query ", cql);

    params = {
      "type"     : "user",
      "username" : user.name,
      "email"    : user.email,
      "password" : user.password
    };
    console.log("params ", params);

    query = {
      "query"  : cql,
      "params" : params
    };
    console.log("cql ", query);

    $.ajax({
      type        : "POST",
      accepts     : "application/json",
      url         : URL_TO_NEO4J_DB + CYPHER_ENDPOINT,
      dataType    : "json",
      contentType : "application/json",
      data        : JSON.stringify(query),
      success     : function (result, textStatus, xhr) {
        var user;
        user = {
          name     : result.data[0][0],
          email    : result.data[0][1],
          password : result.data[0][2]
        };
        console.log("POST textStatus: " + textStatus);
        // publish a global custom event using the jQuery global custom event plugin jquery.event.gevent.js
        // subscriber of this event is the app.shell.js module which in turn completes the login
        $.gevent.publish('userLogin', user);
      },
      error       : function (xhr, textStatus) {
        console.log("POST textStatus: " + textStatus);
      },
      complete    : function () {
      }
    }); // End ajax()
  }; // END createUserNode()



  // BEGIN lookupUserNode()
  lookupUserNode = function (credentials) {
    var
      cql,
      params,
      query
      ;

    // Cypher Query Language
    cql = [
      'START n=node:node_auto_index(type="user")',
      'WHERE n.name={userdata} AND n.password={password}',
      'OR n.email={userdata} AND n.password={password}',
      'RETURN n.name, n.email, n.password'
    ].join('\n');

    params = {
      "userdata" : credentials.userdata,
      "password" : credentials.password
    };

    query = {
      "query"  : cql,
      "params" : params
    };

    $.ajax({
      type        : "POST",
      accepts     : "application/json",
      url         : URL_TO_NEO4J_DB + CYPHER_ENDPOINT,
      dataType    : "json",
      contentType : "application/json",
      data        : JSON.stringify(query),
      statusCode  : {
        404 : function () {
          console.log("Response 404 - Not found!");
        },
        200 : function () {
          console.log("Response 200 - OK");
        }
      },
      success     : function (result, textStatus, xhr) {
        console.log("POST textStatus: " + textStatus);
        console.dir(result);
        var user;
        if (result.data.length > 0) {
          user = {
            name     : result.data[0][0],
            email    : result.data[0][1],
            password : result.data[0][2]
          };
          $.gevent.publish('userLogin', user);
        } else {
          $.gevent.publish('loginError');
        }
      },
      error       : function (xhr, textStatus) {
        console.log("POST textStatus: " + textStatus);
      },
      complete    : function () {
      }
    }); // End ajax()
  }; // END lookupUserNode()



  // BEGIN lookupAllUserNodes()
  lookupAllUserNodes = function (username, trainingID) {
    var
      cql,
      query,
      params
      ;

    // Cypher Query Language
    cql = [
    'START training=node:node_auto_index(type={type})',
    'MATCH (user)-[r:ATTENDS_CCT]->(training)',
    'WHERE training.id={id} AND NOT(user.name={name})',
    'RETURN user.name'
    ].join('\n');

    params = {
      "type" : "cct",
      "id"   : trainingID,
      "name" : username
    };

    query = {
      "query"  : cql,
      "params" : params
    };
    console.log("lookupAllUserNodes-Query ", query);

    $.ajax({
      type        : "POST",
      accepts     : "application/json",
      url         : URL_TO_NEO4J_DB + CYPHER_ENDPOINT,
      dataType    : "json",
      contentType : "application/json",
      data        : JSON.stringify(query),
      statusCode  : {
        404 : function () {
          console.log("Response 404 - Not found!");
        },
        200 : function () {
          console.log("Response 200 - OK");
        }
      },
      success     : function (result, textStatus, xhr) {
        console.log("POST textStatus: " + textStatus);
        $.gevent.publish('allUserSelection', result);
        console.dir(result);
      },
      error       : function (xhr, textStatus) {
        console.log("POST textStatus: " + textStatus);
      },
      complete    : function () {
      }
    }); // End ajax()
  }; // END function **lookupAllUserNodes()**


  // BEGIN function **createTrainingRel**
  // Creates the relationship between the current user and the selected training.
  // We know that a user already exists (i.e. a user node in the Neo4j database)
  // because only a logged-in user is able to select a training session.
  // And for now we assume that there is also an existing training node in the Neo4j database
  // created by the administrator.
  // In the future this should be improved in order to create the node of a training that does not yet exist.
  createTrainingRel = function (params) {
    var
      cql,
      query
      ;

    // Cypher Query Language
    cql = [
      'START user=node:node_auto_index(name={name}),',
      'training=node:node_auto_index(id={id})',
      'CREATE UNIQUE (user)-[:ATTENDS_CCT]->(training)',
      'RETURN training.id;'
    ].join('\n');

    query = {
      "query"  : cql,
      "params" : params
    };
    console.log("query", query);
    $.ajax({
      type        : "POST",
      accepts     : "application/json",
      url         : URL_TO_NEO4J_DB + CYPHER_ENDPOINT,
      dataType    : "json",
      contentType : "application/json",
      data        : JSON.stringify(query),
      success     : function (result, textStatus, xhr) {
        console.log("POST textStatus: " + textStatus);
        console.dir(result);
      },
      error       : function (xhr, textStatus) {
        console.log("POST textStatus: " + textStatus);
      },
      complete    : function () {
      }
    }); // End ajax()
  }; // END **createTrainingRel**



  // BEGIN **createTopicNodesWithRel**
  createTopicNodesWithRel = function (cqlCreateClause, params) {
    var
      cql,
      query
      ;

    // Cypher Query Language
    cql = [
      'START category=node:node_auto_index(type="category"),',
      'user=node:node_auto_index(type="user")',
      'WHERE category.tag={tag} AND user.name={name}',
      'CREATE' + cqlCreateClause + ' ',
      'RETURN category.tag, user.name;'
    ].join('\n');

    console.log("cypher ", cql);
    console.log("cqlstring ", cqlCreateClause);

    query = {
      "query"  : cql,
      "params" : params
    };
    console.log("query", query);

    $.ajax({
      type        : "POST",
      accepts     : "application/json",
      url         : URL_TO_NEO4J_DB + CYPHER_ENDPOINT,
      dataType    : "json",
      contentType : "application/json",
      data        : JSON.stringify(query),
      success     : function (result, textStatus, xhr) {
        console.log("POST textStatus: " + textStatus);
        console.dir(result);
        var user;
        user = result.data[0][1];
        lookupSingleCollectivity(user);
      },
      error       : function (xhr, textStatus) {
        console.log("POST textStatus: " + textStatus);
      },
      complete    : function () {
      }
    }); // End ajax()
  }; // END function **createTopicNodesWithRel**



  // BEGIN function **lookupSingleCollectivity**
  lookupSingleCollectivity = function (user) {
    var
      cql,
      params,
      query
      ;

    // Cypher Query Language
    cql = [
      'START user=node:node_auto_index(name={name})',
      'MATCH (user)-[r:IDENTIFIES_WITH]->(topic)-[:TAGGED_AS]->(category)',
      'WITH user, topic, category',
      'MATCH (topic)-[?:HAS_SUBTOPIC*]->(subtopic)',
      'RETURN user.name, topic.topic, COLLECT(subtopic.topic), category.color;'
    ].join('\n');

    params = {
      "name" : user
    };

    query = {
      "query"  : cql,
      "params" : params
    };

    console.log("lookupSingleCollectivity-Query", query);
    $.ajax({
      type        : "POST",
      accepts     : "application/json",
      url         : URL_TO_NEO4J_DB + CYPHER_ENDPOINT,
      dataType    : "json",
      contentType : "application/json",
      data        : JSON.stringify(query),
      success     : function (result, textStatus, xhr) {
        console.log("POST textStatus: " + textStatus);
        console.log("lookupSingleCollectivity-result: ", result);
        console.log("lookupSingleCollectivity-result.data: ", result.data);
        $.gevent.publish('singleDataAvailable', result);
      },
      error       : function (xhr, textStatus) {
        console.log("POST textStatus: " + textStatus);
      },
      complete    : function () {
      }
    });// End ajax()
  }; // END function **lookupSingleCollectivity**



  // BEGIN function **lookupUsername**
  lookupUsername = function (username) {
    var
      ajaxRequest,
      cql,
      query,
      params
      ;

    // Cypher Query Language
    cql = [
      'START node = node(*)',
      'WHERE has(node.name) AND node.name! = {username}',
      'RETURN COUNT (node)'
    ].join('\n');

    params = {
      "username" : username
    };

    query = {
      "query"  : cql,
      "params" : params
    };
    console.log("cql ", query);
    ajaxRequest = $.ajax({
      type        : "POST",
      accepts     : "application/json",
      url         : URL_TO_NEO4J_DB + CYPHER_ENDPOINT,
      dataType    : "json",
      contentType : "application/json",
      data        : JSON.stringify(query),
      statusCode  : {
        404 : function () {
          console.log("Response 404 - Not found!");
        },
        200 : function () {
          console.log("Response 200 - OK");
        }
      },
      success     : function (result, textStatus, xhr) {
        console.log("POST textStatus: " + textStatus);
        // TODO Handle the result to reflect that a user with this name already exists
        var user = result.data[0][0];
        usernameExists(user);
        console.log("******user******: " + user);
        if (user) {
          console.log("true: " + user);
          console.log("true: " + username);
          return true;
        } else {
          console.log("false");
          return false;
        }
      },
      error       : function (xhr, textStatus) {
        console.log("POST textStatus: " + textStatus);
      },
      complete    : function () {
      }
    });// End ajax()

    ajaxRequest.done(function (msg) {
      var user = msg.data[0][0];
      console.dir(msg);
      console.log(JSON.stringify(msg));

    });
    //console.log("usernameExists", usernameExists.valueOf());
    //return usernameExists;
  };

  // TODO Make it work correctly
  usernameExists = function (username) {
    var existing;
    if (!username) {
      existing = false;
    } else {
      existing = true;
    }
    return existing;
  };


  // The function **initModule** does not do anything.
  // But the module has to be available so that the **app.js module** invokes it
  // before the initialization of the **app.model,js module** or the **app.shell.js module**
  initModule = function () {
  };

  // Return the public methods
  return {
    createUserNode           : createUserNode,
    lookupUserNode           : lookupUserNode,
    lookupAllUserNodes       : lookupAllUserNodes,
    createTrainingRel        : createTrainingRel,
    createTopicNodesWithRel  : createTopicNodesWithRel,
    userNameExists           : usernameExists,
    lookupUsername           : lookupUsername,
    lookupSingleCollectivity : lookupSingleCollectivity,
    initModule               : initModule
  };

}());