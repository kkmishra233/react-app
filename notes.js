import React, { Component } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import {
  Button,
  Collapse,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  UncontrolledDropdown
} from "reactstrap";
import "./App.css";
import Plugins from "./components/Plugins/Plugins";
import Profile from "./components/Profile";
import Deck from "./Job/Deck";
import Secured from "./keycloak_login";
import ErrorComponent from "./ErrorComponent";
import SecPopUp from './components/SecPopUp/SecPopUp';
import DirectionsBoatIcon from "@material-ui/icons/DirectionsBoat";

class App extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false,
      isLoading: false,
      isAuthed: false,
      token: "",
      name: "",
      keycloak: null
    };

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      this.getUserData(code);
    }

    this.logout = this.logout.bind(this);
  }

  getUserData(code) {
    let headers = { "Content-Type": "application/json" };
    fetch(`/api/auth/git_login/?code=${code}`, { headers, method: "GET" }).then(res => {
      if (res.status < 500) {
        res.json().then(data => {
          localStorage.setItem("token", data.token);
          localStorage.setItem("username", data.user.username);
          localStorage.setItem("name", data.user.name);
          this.setState({
            isAuthed: true,
            token: data.token
          });
        });
      }
    });
  }

  onLogin(token, name, keycloak) {
    this.setState({
      isAuthed: true,
      token,
      name,
      keycloak
    });
  }

  getAuth() {
    const { isAuthed, token } = this.state;
    return {
      isAuthed,
      token
    };
  }

  PrivateRoute({ element: Element, ...rest }) {
    const { isAuthed, isLoading } = this.state;
    if (isLoading) {
      return <em>Loading...</em>;
    } else if (!isAuthed) {
      const redirectTo = `/keycloak-login/${encodeURIComponent(window.location.pathname)}`;
      return <Navigate to={redirectTo} />;
    } else {
      return <Element {...rest} />;
    }
  }

  toggle() {
    this.setState({ isOpen: !this.state.isOpen });
  }

  logout() {
    localStorage.clear();
    this.setState({ isAuthed: false, token: "", name: "", keycloak: null });
  }

  render() {
    return (
      <Router>
        <div>
          <Navbar color="light" light expand="md">
            <NavbarBrand href="/">App Name</NavbarBrand>
            <NavbarToggler onClick={this.toggle} />
            <Collapse isOpen={this.state.isOpen} navbar>
              <Nav className="ml-auto" navbar>
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret>
                    Options
                  </DropdownToggle>
                  <DropdownMenu right>
                    <DropdownItem>Profile</DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem onClick={this.logout}>Logout</DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </Nav>
            </Collapse>
          </Navbar>
          <Routes>
            <Route path="/" element={<Deck />} />
            <Route path="/plugins" element={<Plugins />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/secured" element={<Secured />} />
            <Route path="/error" element={<ErrorComponent />} />
            <Route path="/popup" element={<SecPopUp />} />
            <Route path="/keycloak-login/*" element={<DirectionsBoatIcon />} />
            {/* Use the PrivateRoute component to protect routes */}
            <Route
              path="/protected"
              element={<this.PrivateRoute element={Profile} />}
            />
          </Routes>
        </div>
      </Router>
    );
  }
}

export default App;
