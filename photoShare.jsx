import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Switch, Redirect
} from 'react-router-dom';
import {
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@material-ui/core';
import './styles/main.css';
import axios from 'axios';

// import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/UserDetail';
import UserList from './components/userList/UserList';
import UserPhotos from './components/userPhotos/UserPhotos';
import LoginRegister from "./components/LoginRegister/LoginRegister";
import FavoritePhotos from "./components/favoritePhotos/FavoritePhotos";

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      topBarText: "Photo Sharing",
      loginUser: "",
    }
  }

  componentDidMount() {
    let userId = window.sessionStorage.getItem("userId");
    console.log("Session UserID: " + userId)
    if (!this.state.loginUser && userId) {
      axios.get("/user/" + userId)
      .then((response) => {
        let user = response.data;
        this.setState({ loginUser: user });
      })
      .catch((error) => {
        console.log(error.response);
      })
    }
  }

  userIsLoggedIn = () => {
    return (this.state.loginUser || window.sessionStorage.getItem("userId"));
  }

  switchPage = (text) => {
    this.setState({ topBarText: text });
  }

  userLogin = (user) => {
    this.setState({ loginUser: user });
    if (user) {
      window.sessionStorage.setItem("userId", user._id);
    } else {
      window.sessionStorage.clear();
    }
  }

  render() {
    return (
      <HashRouter>
      <div>
      <Grid container spacing={8}>
        <Grid item xs={12}>
          <TopBar
            topBarText={this.state.topBarText}
            userLogin={this.userLogin}
            loginUser={this.state.loginUser}
          />
        </Grid>
        <div className="cs142-main-topbar-buffer"/>
        <Grid item sm={3}>
          <Paper  className="cs142-main-grid-item">
            {this.userIsLoggedIn() ? (
              <UserList />
            ) : (
              <List component="nav">
                <ListItem>
                  <ListItemText primary="Login to view your friend list" />
                </ListItem>
                <Divider />
              </List>
            )}
          </Paper>
        </Grid>
        <Grid item sm={9}>
          <Paper className="cs142-main-grid-item" elevation={0}>
            <Switch>
              <Route exact path="/"
                render={ props => <LoginRegister {...props} userLogin={this.userLogin}/> }
              />
              <Route path="/login-register"
                render={ props => <LoginRegister {...props} userLogin={this.userLogin}/> }
              />
              {this.userIsLoggedIn() ? (
                <Route path="/users/:userId"
                  render={ props => <UserDetail {...props} switchPage={this.switchPage}/> }
                />
              ) : (
                <Redirect path="/users/:userId" to="/login-register" />
              )}
              {this.userIsLoggedIn() ? (
                <Route path="/photos/:userId"
                  render ={ props => <UserPhotos {...props} switchPage={this.switchPage}/> }
                />
              ) : (
                <Redirect path="/photos/:userId" to="/login-register" />
              )}
              {this.userIsLoggedIn() ? (
                <Route path="/users" component={UserList}  />
              ) : (
                <Redirect path="/users" to="/login-register" />
              )}
              {this.userIsLoggedIn() ? (
                <Route path="/favorites"
                  render={ props => <FavoritePhotos {...props} switchPage={this.switchPage}/> }
                />
              ) : (
                <Redirect path="/favorites" to="/login-register" />
              )}
            </Switch>
          </Paper>
        </Grid>
      </Grid>
      </div>
    </HashRouter>
    );
  }
}

ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);
