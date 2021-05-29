import React from 'react';
import {
  Typography,
  Button,
  Divider,
  Grid,
} from '@material-ui/core';
import './userPhotos.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import UserPhotoCard from "./UserPhotoCard";

/**
 * Define UserPhotos, a React component of CS142 project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      curUser: "",
      photos: "",
    };
    let userId = props.match.params.userId;
    axios.get("/photosOfUser/" + userId)
      .then((response) => {
        this.setState({ photos: response.data });
      })
      .catch((error) => {
        console.log(error.response);
      })
    axios.get("/user/" + userId)
      .then((response) => {
        let user = response.data;
        this.setState({ curUser: user });
        this.props.switchPage("Photos of " + user.first_name + " " + user.last_name);
      })
      .catch((error) => {
        console.log(error.response);
      })
  }

  updatePage = () => {
    axios.get("/photosOfUser/" + this.state.curUser._id)
      .then((response) => {
        this.setState({ photos: response.data });
      })
      .catch((error) => {
        console.log(error.response);
      })
  }

  getPhotos(user, photos) {
    if (photos.length === 0) {
      return (<Typography variant="h5" color="inherit" gutterBottom> No Photo Found! </Typography>);
    }
    let photoCards = [];
    for (let index = 0; index < photos.length; index++) {
      const photo = photos[index];
      photoCards.push(
        <UserPhotoCard
          updatePage={this.updatePage}
          photo={photo}
          key={photo._id}
        />
      );
    }
    return photoCards;
  }

  render() {
    let user = this.state.curUser;
    return (
      <div>
          <Button
            variant="contained"
            color="default"
            size="large"
            startIcon={<ExitToAppIcon />}
            component={Link}
            to={"/users/" + user._id}
          > 
            Back to Profile
          </Button>
        <Divider />
        <Divider />
        <Grid container alignItems="stretch">
          {this.getPhotos(user, this.state.photos)}
        </Grid>
      </div>
    );
  }
}

export default UserPhotos;
