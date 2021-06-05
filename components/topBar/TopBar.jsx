import React from 'react';
import {
  AppBar,
  Grid,
  Toolbar,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@material-ui/core';
import './TopBar.css';
import axios from 'axios';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import AddPhotoAlternateIcon from '@material-ui/icons/AddPhotoAlternate';
import FavoriteIcon from '@material-ui/icons/Favorite';

/**
 * Define TopBar, a React component of CS142 project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      topBarText: this.props.topBarText,
      versionInfo: "",
      openDialog: false
    }
    axios.get("/test/info")
      .then((response) => {
        this.setState({versionInfo: response.data});
      })
      .catch((error) => {
        console.log(error.response);
      })
  }

  componentDidUpdate(prevProps) {
    if (prevProps.topBarText !== this.props.topBarText) {
      this.setState({ topBarText: this.props.topBarText });
    }
  }

  logoutHandler() {
    this.props.userLogin("");
  }

  //this function is called when user presses the update button
  uploadButtonClickedHandler = (e) => {
    e.preventDefault();
    if (this.uploadInput.files.length > 0) {
      // Create a DOM form and add the file to it under the name uploadedphoto
      const domForm = new FormData();
      domForm.append('uploadedphoto', this.uploadInput.files[0]);
      axios.post('/photos/new', domForm)
        .then((res) => {
          console.log(res);
          window.location.href = "#/users/" + this.props.loginUser._id;
        })
        .catch(err => console.log(`POST ERR: ${err}`));
    }
  }

  render() {
    return (
      <AppBar className="cs142-topbar-appBar" position="absolute">
        <Toolbar>
          {this.props.loginUser ? (
            <Grid container direction="row" justify="space-between">
              <Typography variant="h5" color="inherit">
              Hi {this.props.loginUser.first_name}
              </Typography>
              {/* <Typography variant="h6" color="inherit">
                  Version: {this.state.versionInfo.version}
              </Typography> */}
              <Typography variant="h5" color="inherit">
                  {this.state.topBarText}
              </Typography>
              <div>
                <span className="cs142-topbar-button">
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    startIcon={<FavoriteIcon />}
                    href={"/photo-share.html#/favorites/"}
                  >
                      Favorite Photos
                  </Button>
                </span>
                <span className="cs142-topbar-button">
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddPhotoAlternateIcon />}
                    onClick={ () => {this.setState({openDialog: true});} }
                  >
                    Add Photo
                  </Button>

                  <Dialog
                    fullWidth
                    open={this.state.openDialog}
                    onClose={ () => {this.setState({openDialog: false});} }
                    aria-labelledby="form-dialog-title"
                  >
                    <DialogTitle id="form-dialog-title">Upload a new photo</DialogTitle>
                    <form onSubmit={this.uploadButtonClickedHandler}>
                      <DialogContent>
                        <input type="file" accept="image/*" ref={(domFileRef) => { this.uploadInput = domFileRef; }} />
                      </DialogContent>
                      <DialogActions>
                        <Button
                          onClick={ () => {this.setState({openDialog: false});} }
                          color="primary"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          onClick={ () => {this.setState({openDialog: false});} }
                          color="primary"
                        >
                          Upload
                        </Button>
                      </DialogActions>
                    </form>
                  </Dialog>
                </span>
                <span className="cs142-topbar-button">
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<ExitToAppIcon />}
                    onClick={ () => this.logoutHandler() }
                  >
                      Log out
                  </Button>
                </span>
              </div>
            </Grid>
          ) : (
            <Typography variant="h5" color="inherit">
              Please Login
            </Typography>
          )}
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
