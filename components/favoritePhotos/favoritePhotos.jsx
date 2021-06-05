import React from 'react';
import {
  Typography,
  Button,
  Divider,
  Grid,
} from '@material-ui/core';
import './favoritePhotos.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import FavoritePhotoCard from "./favoritePhotoCard";

/**
 * Define FavoritePhotos, a React component of CS142 project #8
 */
class FavoritePhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginUser: "",
      favoritePhotos: []
    };
    axios.get("/user/" + window.sessionStorage.getItem("userId"))
      .then((response) => {
        let user = response.data;
        this.setState({ loginUser: user });
      })
      .catch((error) => {
        console.log(error.response);
      })
    axios.get("/favorites")
      .then((response) => {
        this.setState({ favoritePhotos: response.data });
        this.props.switchPage("Your Favorite Photos");
      })
      .catch((error) => {
        console.log(error.response);
      })
  }

  updatePage = () => {
    axios.get("/favorites")
      .then((response) => {
        this.setState({ favoritePhotos: response.data });
        this.props.switchPage("Your Favorite Photos");
      })
      .catch((error) => {
        console.log(error.response);
      })
  }

  getPhotos(photos) {
    if (photos.length === 0) {
      return (<Typography variant="h6" color="inherit" gutterBottom> No Favorite Photo Found! </Typography>);
    }
    let photoCards = [];
    function comparePhotos(photoA, photoB) {
      return (photoA.date_time < photoB.date_time ? 1 : -1);
    }
    photos.sort(comparePhotos);
    for (let index = 0; index < photos.length; index++) {
      const photo = photos[index];
      photoCards.push(
        <FavoritePhotoCard
          updatePage={this.updatePage}
          photo={photo}
          key={photo._id}
        />
      );
    }
    return photoCards;
  }

  render() {
    return (
      <div>
          <Button
            variant="contained"
            color="default"
            size="large"
            startIcon={<ExitToAppIcon />}
            component={Link}
            to={"/users/" + this.state.loginUser._id}
          > 
            Back to Profile
          </Button>
        <Divider />
        <Divider />
        <Grid container alignItems="stretch">
          {this.getPhotos(this.state.favoritePhotos)}
        </Grid>
      </div>
    );
  }
}

export default FavoritePhotos;
