import React from 'react';
import {
  Card,
  CardHeader,
  CardMedia,
  Dialog,
  DialogTitle,
  IconButton,
} from '@material-ui/core';
import './favoritePhotos.css';
import axios from 'axios';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';


/**
 * Define FavoritePhotoCard, a React component of CS142 project #8
 */
class FavoritePhotoCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        openDialog: false,
    };
  }

  removeFavorite(event, photoId) {
    event.preventDefault();
    console.log("Unfavorite for photoId: ", photoId);
    axios
      .post("/favorite/" + photoId, {
        isFavorite: false
      })
      .then((response) => {
        console.log("Unfavorite: ", response);
        this.props.updatePage();
      })
      .catch((error) => {
        console.log(error.response);
      })
  }

  render() {
    let photo = this.props.photo;
    return (
        <div>
            <Card className="cs142-favorite-thumbnail">
                <CardHeader
                    className="cs142-favorite-header"
                    action={
                        <IconButton size="small" onClick={ (event) => this.removeFavorite(event, photo._id) }>
                            <HighlightOffIcon />
                        </IconButton>
                    }
                />
                <CardMedia
                    component="img"
                    image={"/images/" + photo.file_name}
                    onClick={ () => {this.setState({openDialog: true});} }
                />
                <Dialog
                    fullWidth
                    open={this.state.openDialog}
                    onClose={ () => {this.setState({openDialog: false});} }
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">{photo.date_time}</DialogTitle>
                    <img src={"/images/" + photo.file_name} />
                </Dialog>
            </Card>
        </div>
    );
  }
}

export default FavoritePhotoCard;
