import React from 'react';
import {
  Divider,
  List,
  ListItem,
  ListItemText
}
from '@material-ui/core';
import './userList.css';
import { Link } from 'react-router-dom';
import axios from 'axios';

/**
 * Define UserList, a React component of CS142 project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allUsers: "",
    }
    axios.get("/user/list")
      .then((response) => {
        this.setState({allUsers: response.data});
      })
      .catch((error) => {
        console.log(error.response);
      })
  }

  render() {
    return (
      <div>
        <List component="nav">
          {this.state.allUsers && this.state.allUsers.map((user) => {
            return (
              <div key={user._id}>
                <ListItem
                  button
                  component={Link}
                  to={"/users/" + user._id}
                >
                  <ListItemText primary={user.first_name + " " + user.last_name} />
                </ListItem>
                <Divider />
              </div>
            );
          })}
        </List>
      </div>
    );
  }
}

export default UserList;
