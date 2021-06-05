import React from 'react';
import {
  Typography,
  Button,
  Divider,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import './userPhotos.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbUpOutlinedIcon from '@material-ui/icons/ThumbUpOutlined';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { MentionsInput, Mention } from 'react-mentions';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';

/**
 * Define UserPhotoCard, a React component of CS142 project #7
 * Creating such a class so that new comments can be added to
 * the photo card where users click the "ADD A COMMENT" button.
 */
class UserPhotoCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newComment: "",
      openDialog: false,
      openTagInput: false,
      isLiked: props.isLiked,
      isFavorite: props.isFavorite,
      allUsers: "",
      tagMentionsInput: "",
      crop: {
        unit: "%",
        width: "",
        height: "",
      },
    };
    axios.get("/user/mention")
      .then((response) => {
        this.setState({allUsers: response.data});
      })
      .catch((error) => {
        console.log(error.response);
      })
  }

  commentHandler(event, photoId) {
    event.preventDefault();
    console.log("Add a comment to photoId: ", photoId);
    axios
      .post("/commentsOfPhoto/" + photoId, {
        comment: this.state.newComment
      })
      .then((response) => {
        console.log("New comment: ", response);
        this.setState({newComment: ""});
        this.props.updatePage();
      })
      .catch((error) => {
        console.log(error.response);
      })
  }

  textFieldHandler(stateField) {
    this.setState(stateField);
  }

  likeHandler(photoId) {
    console.log("Have a like for photoId: ", photoId);
    axios.post("/like/" + photoId, {
        isLiked: !this.state.isLiked
      })
      .then((response) => {
        console.log("Like: ", response);
        this.setState({isLiked: !this.state.isLiked});
        this.props.updatePage();
      })
      .catch((error) => {
        console.log(error.response);
      })
  }

  favoriteHandler(photoId) {
    console.log("Favorite for photoId: ", photoId);
    axios.post("/favorite/" + photoId, {
        isFavorite: true
      })
      .then((response) => {
        console.log("Favorite: ", response);
        this.setState({isFavorite: true});
        this.props.updatePage();
      })
      .catch((error) => {
        console.log(error.response);
      })
  }

  dragHandler(crop) {
    // console.log("Crop Width = " + this.state.crop.width);
    // console.log("Crop Height = " + this.state.crop.height);
    // console.log("Crop X = " + this.state.crop.x);
    // console.log("Crop Y = " + this.state.crop.y);
    this.setState({crop: crop});
  }

  addTagHandler(id, name, photoId) {
    console.log("ID: " + id);
    console.log("Name: " + name);
    axios.post("/tagsOfPhoto/" + photoId, {
        x: this.state.crop.x, // X position of the photo
        y: this.state.crop.y, // Y position of the photo
        width: this.state.crop.width, // Width of the tag
        height: this.state.crop.height, // Height of the tag
        tagged_user_name: name, // Full name of tagged user
        tagged_user_id: id, // Tagged user ID
        added_by_user_id: window.sessionStorage.getItem("userId")
      })
      .then((response) => {
        console.log("Add tag: ", response);
        this.setState({
            openTagInput: false,
            crop: {unit: "%", width: "", height: "",}
        });
        this.props.updatePage();
      })
      .catch((error) => {
        console.log(error.response);
      })
  }

  removeTagHandler(photoId, index) {
    console.log("photoId: " + photoId);
    console.log("index: " + index);
    axios.post("/removeTag/" + photoId, {
        index: index
      })
      .then((response) => {
        console.log("Remove tag: ", response);
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
            <Card className = "cs142-photo-card">
                <CardHeader
                    title={photo.file_name}
                    subheader={photo.date_time}
                />
                <CardMedia>
                <ReactCrop
                    src={"/images/" + photo.file_name}
                    onChange={ (crop) => this.dragHandler(crop) }
                    onDragStart={ () => {this.setState({openTagInput: false});} }
                    onDragEnd={ () => {this.setState({openTagInput: true});} }
                    crop={this.state.crop}
                >
                    {photo.tags && photo.tags.length !== 0 && (
                        photo.tags.map(
                            (tag, index) => (
                                <div key={index}>
                                    <Tooltip
                                        interactive
                                        title={
                                            <Link
                                                to={"/users/" + tag.tagged_user_id}
                                                style={{color: "white"}}
                                            >
                                                {tag.tagged_user_name}
                                            </Link>
                                        }
                                    >
                                        <div
                                            style={{
                                                left: tag.x,
                                                top: tag.y,
                                                width: tag.width,
                                                height: tag.height,
                                                position: "absolute",
                                                border: "2px dashed white"}}
                                        >
                                        </div>
                                    </Tooltip>
                                    {tag.added_by_user_id === window.sessionStorage.getItem("userId") && (
                                        <div
                                            style={{
                                                left: tag.x + tag.width - 35,
                                                top: tag.y - 5,
                                                position: "absolute"}}
                                        >
                                            <IconButton color="secondary" onClick={ () => this.removeTagHandler(photo._id, index) }>
                                                <HighlightOffIcon />
                                            </IconButton>
                                        </div>
                                    )}
                                </div>
                            )
                        )
                    )}
                    {this.state.openTagInput && this.state.crop.width > 10 && this.state.crop.height > 10 && (
                        <div style={{
                            left: this.state.crop.x,
                            top: this.state.crop.y + this.state.crop.height,
                            width: this.state.crop.width,
                            position: "absolute"}}
                        >
                            <MentionsInput
                                value={this.state.tagMentionsInput}
                                onChange={ (event) => {this.setState({tagMentionsInput: event.target.value});} }
                                singleLine
                                style={{backgroundColor: 'white'}}
                            >
                                <Mention
                                    trigger=""
                                    data={this.state.allUsers}
                                    onAdd={
                                        (id, name) => {
                                            this.addTagHandler(id, name, photo._id);
                                            this.setState({tagMentionsInput: ""});
                                        }
                                    }
                                />
                            </MentionsInput>
                        </div>
                    )}
                </ReactCrop>
                </CardMedia>
                <CardContent>
                    {photo.comments && photo.comments.map((comment) => {
                    return (
                        <div key={comment._id}>
                        <Grid container key={comment._id}>
                            <Grid item xs={12}>
                            <Typography variant="body1">
                                {comment.date_time + " "}
                                <Link to={"/users/" + comment.user._id}>
                                {comment.user.first_name + " " + comment.user.last_name}
                                </Link>
                            </Typography>
                            </Grid>
                            <Grid item>
                            <Typography variant="body2">
                                {comment.comment}
                            </Typography>
                            </Grid>
                        </Grid>
                        <Divider />
                        </div>
                    );
                    })}
                    <div className = "cs142-photo-new-comment">
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={ () => {this.setState({openDialog: true});} }
                    >
                        Add a Comment
                    </Button>
                    {this.state.isFavorite ? (
                        <IconButton
                            aria-label="Favorite"
                            disabled
                        >
                            <FavoriteIcon color="secondary"/>
                        </IconButton>
                    ) : (
                        <IconButton
                            color="default"
                            aria-label="Favorite"
                            onClick={ () => this.favoriteHandler(photo._id) }
                        >
                            <FavoriteBorderIcon />
                        </IconButton>
                    )}
                    {this.state.isLiked ? (
                        <IconButton
                            color="primary"
                            aria-label="Like"
                            onClick={ () => this.likeHandler(photo._id) }
                        >
                            <ThumbUpIcon />
                            {photo.liked_by_users.length !== 0 && (
                                <Typography variant="h6" color="primary">
                                    <div>&nbsp;{photo.liked_by_users.length}</div>
                                </Typography>
                            )}
                        </IconButton>
                    ) : (
                        <IconButton
                            color="default"
                            aria-label="Like"
                            onClick={ () => this.likeHandler(photo._id) }
                        >
                            <ThumbUpOutlinedIcon />
                            {photo.liked_by_users.length !== 0 && (
                                <Typography variant="h6" color="primary">
                                    <div>&nbsp;{photo.liked_by_users.length}</div>
                                </Typography>
                            )}
                        </IconButton>
                    )}
                    <Dialog
                        fullWidth
                        open={this.state.openDialog}
                        onClose={ () => {this.setState({openDialog: false});} }
                        aria-labelledby="form-dialog-title"
                    >
                        <DialogTitle id="form-dialog-title">Create a new comment for photo {photo.file_name}</DialogTitle>
                        <form onSubmit={ (event) => this.commentHandler(event, photo._id) }>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                type="text"
                                value={this.state.newComment}
                                onChange={ (event) => this.textFieldHandler({ newComment: event.target.value }) }
                                fullWidth
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={ () => {this.setState({openDialog: false}); this.setState({newComment: ""});} }
                                color="primary"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                onClick={ () => {this.setState({openDialog: false});} }
                                color="primary"
                            >
                                Add
                            </Button>
                        </DialogActions>
                        </form>
                    </Dialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
  }
}

export default UserPhotoCard;
