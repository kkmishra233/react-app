import React, { Component } from "react";
import Keycloak from "keycloak-js";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { Spinner } from "reactstrap";
import keycloak_json_file from "./keycloak.json";

class Secured extends Component {
  constructor(props) {
    super(props);
    this.state = { keycloak: null, authenticated: false };
  }

  componentDidMount() {
    const keycloakConfig = {
      realm: keycloak_json_file["realm"],
      url: keycloak_json_file["auth-server-url"],
      clientId: keycloak_json_file["resource"],
      secret: keycloak_json_file["credentials"]["secret"]
    };

    const keycloak = Keycloak({
      realm: keycloakConfig.realm,
      url: keycloakConfig.url,
      "ssl-required": "none",
      clientId: keycloakConfig.clientId,
      credentials: {
        secret: keycloakConfig.secret
      },
      "confidential-port": 0
    });

    keycloak
      .init({ onLoad: "login-required", promiseType: "native" })
      .then(authenticated => {
        if (authenticated) {
          localStorage.setItem("token", keycloak.token);
          localStorage.setItem("keycloak", keycloak);
          localStorage.setItem(
            "name",
            keycloak.tokenParsed.name || keycloak.tokenParsed.preferred_username
          );
          this.props.onLogin(
            keycloak.token,
            keycloak.tokenParsed.given_name,
            keycloak
          );
          this.setState({
            keycloak: keycloak,
            authenticated: authenticated
          });
        } else {
          // Redirect or handle unauthenticated state
          window.location.reload();
        }
      })
      .catch(() => {
        // Handle keycloak initialization error
        console.error("Keycloak initialization failed");
        window.location.reload();
      });

    axios.interceptors.request.use(
      config => {
        if (keycloak.token) {
          return keycloak
            .updateToken(8)
            .then(() => {
              config.headers.Authorization = "Bearer " + keycloak.token;
              localStorage.setItem("token", keycloak.token);
              return config;
            })
            .catch(() => {
              // Handle login failure if token refresh fails
              keycloak.login();
              return Promise.reject("Keycloak token refresh failed");
            });
        }
        return Promise.reject("No Keycloak token available");
      },
      error => {
        // Handle request error
        return Promise.reject(error);
      }
    );
  }

  render() {
    const { authenticated, keycloak } = this.state;
    const redirectTo = this.props.match?.params?.id
      ? decodeURIComponent(this.props.match.params.id)
      : "/deck/ciconfig";

    if (keycloak && authenticated) {
      return <Navigate to={redirectTo} />;
    }

    return (
      <div style={{ padding: "15rem", textAlign: "center" }}>
        <Spinner style={{ width: "5rem", height: "5rem", color: "#000053" }} />
      </div>
    );
  }
}

export default Secured;
