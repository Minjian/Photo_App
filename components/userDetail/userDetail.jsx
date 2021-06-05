import React from 'react';
import {
  Divider,
  Typography,
  Button,
  Card,
  CardMedia,
  CardActionArea
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
      recentPhotoName: "",
      commentPhotoName: "",
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

    axios.get("/photosOfUser/" + userId)
      .then((response) => {
        let photos = response.data;
        if (photos && photos.length !== 0) {
          photos.sort(this.compareRecentPhotos);
          this.setState({ recentPhotoName: photos[0].file_name });

          photos.sort(this.compareCommentPhotos);
          this.setState({ commentPhotoName: photos[0].file_name });
        }
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

      axios.get("/photosOfUser/" + userId)
      .then((response) => {
        let photos = response.data;
        if (photos && photos.length !== 0) {
          photos.sort(this.compareRecentPhotos);
          this.setState({ recentPhotoName: photos[0].file_name });

          photos.sort(this.compareCommentPhotos);
          this.setState({ commentPhotoName: photos[0].file_name });
        }
      })
      .catch((error) => {
        console.log(error.response);
      })
    }
  }

  compareRecentPhotos(photoA, photoB) {
    return (photoA.date_time < photoB.date_time ? 1 : -1);
  }

  compareCommentPhotos(photoA, photoB) {
    return (photoA.comments.length < photoB.comments.length ? 1 : -1);
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
        <div className="cs142-details-extend">
          <Typography variant="body1" gutterBottom> <b>Your Most Recently Uploaded Photo:</b></Typography>
          {this.state.recentPhotoName && (
            <Card className="cs142-details-thumbnail">
              <CardActionArea
                component={Link}
                to={"/photos/" + user._id}
              >
              <CardMedia
                component="img"
                image={"/images/" + this.state.recentPhotoName}
              />
              </CardActionArea>
            </Card>
          )}
          <Typography variant="body1" gutterBottom> <b>Your Photo with Most Comments:</b></Typography>
          {this.state.commentPhotoName && (
            <Card className="cs142-details-thumbnail">
              <CardActionArea
                component={Link}
                to={"/photos/" + user._id}
              >
              <CardMedia
                component="img"
                image={"/images/" + this.state.commentPhotoName}
              />
              </CardActionArea>
            </Card>
          )}
        </div>
      </div>
    );
  }
}

export default UserDetail;
