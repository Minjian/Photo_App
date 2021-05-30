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
} from '@material-ui/core';
import './userPhotos.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbUpOutlinedIcon from '@material-ui/icons/ThumbUpOutlined';

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
      isLiked: props.isLiked
    };
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
    axios
      .post("/like/" + photoId, {
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

  render() {
    let photo = this.props.photo;
    return (
        <div>
            <Card className = "cs142-photo-card">
                <CardHeader
                    title={photo.file_name}
                    subheader={photo.date_time}
                />
                <CardMedia
                    component="img"
                    image={"/images/" + photo.file_name}
                />
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
