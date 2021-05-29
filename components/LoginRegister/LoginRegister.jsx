import React from 'react';
import {
  Grid,
  Typography,
  TextField,
  Button
} from '@material-ui/core';
import './LoginRegister.css';
import axios from 'axios';

/**
 * Define LoginRegister, a React component of CS142 project #7
 */
class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginError: "",
      registerError: "",
      loginUserName: "",
      loginPassword: "",
      registerUserName: "",
      registerPassword: "",
      verifyPassword: "",
      firstName: "",
      lastName: "",
      location: "",
      description: "",
      occupation: "",
    };
  }

  componentDidMount() {
    // We should not have user logged in
    // when this component is mounted
    this.props.userLogin("");
  }

  loginHandler(event) {
    event.preventDefault();
    console.log("Login: ", event);

    axios
      .post("/admin/login", {
        login_name: this.state.loginUserName,
        password: this.state.loginPassword
      })
      .then((response) => {
        console.log("Login succeed: ", response);
        this.setState({loginError: ""});
        let loginUser = response.data;
        this.props.userLogin(loginUser);
        window.location.href = "#/users/" + loginUser._id;
      })
      .catch((error) => {
        console.log("Login fail: ", error);
        this.setState({loginError: error.response.data});
      })
  }

  registerHandler(event) {
    if (this.state.verifyPassword != this.state.registerPassword) {
      this.setState({registerError: "Passwords are different"});
      return;
    }
    event.preventDefault();
    console.log("Register: ", event);

    axios
      .post("/user", {
        login_name: this.state.registerUserName,
        password: this.state.registerPassword,
        first_name: this.state.firstName,
        last_name: this.state.lastName,
        location: this.state.location,
        description: this.state.description,
        occupation: this.state.occupation,
      })
      .then((response) => {
        console.log("Register succeed: ", response);
        this.setState({registerError: ""});
        let registerUser = response.data;
        this.props.userLogin(registerUser);
        window.location.href = "#/users/" + registerUser._id;
      })
      .catch((error) => {
        console.log("Register fail: ", error);
        this.setState({registerError: error.response.data});
      })
  }

  textFieldHandler(stateField) {
    this.setState(stateField);
  }

  render() {
    return (
      <Grid container justify="space-evenly">
        <Grid item>
          <Typography variant="h6" color="inherit">
            Current User
          </Typography>
          <Typography variant="body2" color="error">
            {this.state.loginError}
          </Typography>
          <form onSubmit={ (event) => this.loginHandler(event) }>
            <div className="cs142-text-field">
              <TextField
                required
                variant="outlined"
                label="User Name"
                type="text"
                value={this.state.loginUserName}
                onChange={ (event) => this.textFieldHandler({ loginUserName: event.target.value }) }
              />
            </div>
            <div className="cs142-text-field">
              <TextField
                required
                variant="outlined"
                label="Password"
                type="password"
                value={this.state.loginPassword}
                onChange={ (event) => this.textFieldHandler({ loginPassword: event.target.value }) }
              />
            </div>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
            >
              Login
            </Button>
          </form>
        </Grid>

        <Grid item>
          <Typography variant="h6">
            New User
          </Typography>
          <Typography variant="body2" color="error">
            {this.state.registerError}
          </Typography>
          <form onSubmit={ (event) => this.registerHandler(event) }>
            <div className="cs142-text-field">
                <TextField
                  required
                  variant="outlined"
                  label="User Name"
                  type="text"
                  value={this.state.registerUserName}
                  onChange={ (event) => this.textFieldHandler({ registerUserName: event.target.value }) }
                />
              </div>
              <div className="cs142-text-field">
                <TextField
                  required
                  variant="outlined"
                  label="Password"
                  type="password"
                  value={this.state.registerPassword}
                  onChange={ (event) => this.textFieldHandler({ registerPassword: event.target.value }) }
                />
              </div>
              <div className="cs142-text-field">
                <TextField
                  required
                  variant="outlined"
                  label="Verify Password"
                  type="password"
                  value={this.state.verifyPassword}
                  error={this.state.verifyPassword != this.state.registerPassword}
                  onChange={ (event) => this.textFieldHandler({ verifyPassword: event.target.value }) }
                />
              </div>
              <Typography variant="body1">
                Introduce yourself
              </Typography>
              <div className="cs142-text-field">
                <TextField
                  required
                  variant="outlined"
                  label="First Name"
                  type="text"
                  value={this.state.firstName}
                  onChange={ (event) => this.textFieldHandler({ firstName: event.target.value }) }
                />
              </div>
              <div className="cs142-text-field">
                <TextField
                  required
                  variant="outlined"
                  label="Last Name"
                  type="text"
                  value={this.state.lastName}
                  onChange={ (event) => this.textFieldHandler({ lastName: event.target.value }) }
                />
              </div>
              <div className="cs142-text-field">
                <TextField
                  variant="outlined"
                  label="Location"
                  type="text"
                  value={this.state.location}
                  onChange={ (event) => this.textFieldHandler({ location: event.target.value }) }
                />
              </div>
              <div className="cs142-text-field">
                <TextField
                  variant="outlined"
                  label="Description"
                  type="text"
                  value={this.state.description}
                  onChange={ (event) => this.textFieldHandler({ description: event.target.value }) }
                />
              </div>
              <div className="cs142-text-field">
                <TextField
                  variant="outlined"
                  label="Occupation"
                  type="text"
                  value={this.state.occupation}
                  onChange={ (event) => this.textFieldHandler({ occupation: event.target.value }) }
                />
              </div>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
              >
                Register Me
              </Button>
          </form>
        </Grid>
      </Grid>
    );
  }
}

export default LoginRegister;
