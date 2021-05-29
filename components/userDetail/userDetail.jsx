import React from 'react';
import {
  Divider,
  Typography,
  Button
} from '@material-ui/core';
import './userDetail.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PhotoIcon from '@material-ui/icons/Photo';

/**
 * Define UserDetail, a React component of CS142 project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      curUser: "",
    };
    let userId = props.match.params.userId;
    axios.get("/user/" + userId)
      .then((response) => {
        let user = response.data;
        this.setState({ curUser: user });
        this.props.switchPage("Profile of " + user.first_name + " " + user.last_name);
      })
      .catch((error) => {
        console.log(error.response);
      })
  }

  componentDidUpdate() {
    let userId = this.props.match.params.userId;
    if (this.state.curUser._id !== userId) {
      axios.get("/user/" + userId)
      .then((response) => {
        let user = response.data;
        this.setState({ curUser: user });
        this.props.switchPage("Profile of " + user.first_name + " " + user.last_name);
      })
      .catch((error) => {
        console.log(error.response);
      })
    }
  }

  render() {
    let user = this.state.curUser;
    let userFullName = user.first_name + " " + user.last_name;
    let location = user.location;
    let occupation = user.occupation;
    let description = user.description;
    return (
      <div>
        <Typography variant="h5" color="inherit" gutterBottom> {userFullName} </Typography>
        <Divider />
        <Divider />
        <Typography variant="body1" gutterBottom> <b>Location:</b> {location} </Typography>
        <Typography variant="body1" gutterBottom> <b>Occupation:</b> {occupation} </Typography>
        <Typography variant="body1" gutterBottom> <b>Description:</b> {description} </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<PhotoIcon />}
          component={Link}
          to={"/photos/" + user._id}
        > 
          View Photos
        </Button>
      </div>
    );
  }
}

export default UserDetail;
