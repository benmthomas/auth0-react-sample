import React from "react";
import { Router, Route, Switch } from "react-router-dom";
import { Container } from "reactstrap";

import Loading from "./components/Loading";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./views/Home";
import Profile from "./views/Profile";
import ExternalApi from "./views/ExternalApi";
import { useAuth0 } from "@auth0/auth0-react";
import history from "./utils/history";
import AWS from 'aws-sdk';


// styles
import "./App.css";

// fontawesome
import initFontAwesome from "./utils/initFontAwesome";
initFontAwesome();




const App = () => {
  const { isLoading, error, getIdTokenClaims } = useAuth0();
  const setupAWSToken = async () => {
    try {
      const idToken = await getIdTokenClaims({
        // audience: `https://re-open.us.auth0.com/api/v2/`,
        // domain: "re-open.us.auth0.com",
        // clientId: "yRSmeQRkIaGLEpFyExaZvtEmiOsoYN4b",
        // audience: "https://re-open.us.auth0.com/api/v2/",
        // appOrigin: "http://local.reopen:3000",
        // scope: "read:current_user",
      });
      
      console.log("ID TOKEN:")
      console.log(idToken)

      // Set the region where your identity pool exists (us-east-1, eu-west-1)
      AWS.config.region = 'us-east-1';
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: "us-east-1:03b82a84-885e-4ef9-9636-8a9abb310b9d",
        Logins: {
          // "re-open.us.auth0.com": idToken,
          "cognito-idp.us-east-1.amazonaws.com/us-east-1_JvrGCQrim": idToken,
        },
      });

      // Create the DynamoDB service object
      var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
      // Call DynamoDB to retrieve the list of tables
      ddb.listTables({Limit: 10}, function(err, data) {
        if (err) {
          console.log("Error", err.code);
        } else {
          console.log("Table names are ", data.TableNames);
        }
      });

    } catch (error) {
      console.log(error);
    }
  };
  setupAWSToken();


  // const getAuthToken = async () => {
  //   try {
  //     return await getAccessTokenSilently({
  
  //       // scope: "read:current_user",
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  
  // getAuthToken().then((token) => {
  //   console.log("ACCESS TOKEN:");
  //   console.log(token);
  
  //   // Set the region where your identity pool exists (us-east-1, eu-west-1)
  //   AWS.config.region = "us-east-1";
  //   AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  //     IdentityPoolId: "us-east-1:03b82a84-885e-4ef9-9636-8a9abb310b9d",
  //     Logins: {
  //       "re-open.us.auth0.com": token,
  //     },
  //   });
  // });

  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Router history={history}>
      <div id="app" className="d-flex flex-column h-100">
        <NavBar />
        <Container className="flex-grow-1 mt-5">
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/profile" component={Profile} />
            <Route path="/external-api" component={ExternalApi} />
          </Switch>
        </Container>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
