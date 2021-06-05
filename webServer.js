"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var async = require('async');

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');

// Load fs
const fs = require("fs");

// Load necessary Express middleware modules
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');

var express = require('express');
var app = express();
// Add middleware to Express
app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/cs142project6', { useNewUrlParser: true, useUnifiedTopology: true });

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));


app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.countDocuments({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send("User is not logged in.");
        return;
    }
    User.find({}, function (err, users) {
        if (err) {
            console.error(err.message);
            return;
        }
        let userList = users;
        async.forEachOf(userList, function (user, key, callback) {
            userList[key] = {
                _id: user._id,
                first_name: user.first_name,
                last_name: user.last_name
            };
            callback();
        }, function (err) {
            if (err) {
                console.error(err.message);
                return;
            }
            response.status(200).send(userList);
        });
    });
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send("User is not logged in.");
        return;
    }
    var id = request.params.id;
    User.findOne({_id: id}, function (err, user) {
        if (err) {
            console.log('User with _id:' + id + ' not found.');
            response.status(400).send('Not found');
            return;
        }
        let retUser = {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            location: user.location,
            description: user.description,
            occupation: user.occupation
        };
        response.status(200).send(retUser);
    });
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send("User is not logged in.");
        return;
    }
    var id = request.params.id;
    Photo.find({user_id: id}, function (err, photos) {
        if (err) {
            console.log('Photos for user with _id:' + id + ' not found.');
            response.status(400).send('Not found');
            return;
        }
        let photoList = JSON.parse(JSON.stringify(photos));
        async.forEachOf(photoList, function (photo, photoKey, photoCallback) {
            photoList[photoKey] = {
                _id: photo._id,
                file_name: photo.file_name,
                date_time: photo.date_time,
                user_id: photo.user_id,
                comments: photo.comments,
                liked_by_users: photo.liked_by_users,
                favored_by_users: photo.favored_by_users
            };

            async.forEachOf(photo.comments, function (comm, commKey, commCallback) {
                let commUser = User.findOne({_id: comm.user_id}, function (err, user) {
                    if (err) {
                        console.log('User with _id:' + user._id + ' not found for comments.');
                        response.status(400).send('Not found');
                        return;
                    }
                });
                commUser.then( function (user) {
                    photoList[photoKey].comments[commKey] = {
                        _id: comm._id,
                        date_time: comm.date_time,
                        user: {_id: user._id, first_name: user.first_name, last_name: user.last_name},
                        comment: comm.comment
                    }
                    commCallback();
                });
            }, function (err) {
                if (err) {
                    console.error(err.message);
                    return;
                }
                photoCallback();
            });

        }, function (err) {
            if (err) {
                console.error(err.message);
                return;
            }
            response.status(200).send(photoList);
        });
    });
});

/*
 * URL /admin/login - Handle user login
 */
app.post('/admin/login', function (request, response) {
    console.log(request.session.cookie);

    let loginUserName = request.body.login_name;
    let loginPassword = request.body.password;
    User.findOne({login_name: loginUserName}, function (err, user) {
        if (err || !user) {
            console.log('User with login_name:' + loginUserName + ' not found.');
            response.status(400).send(loginUserName + ' Not Found');
            return;
        }
        if (loginPassword != user.password) {
            response.status(400).send("Password Incorrect");
            return;
        }
        request.session.login_name = loginUserName;
        request.session.user_id = user._id;
        let retUser = {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            location: user.location,
            description: user.description,
            occupation: user.occupation
        };
        response.status(200).send(retUser);
    });
});

/*
 * URL /admin/logout - Handle user logout
 */
app.post('/admin/logout', function (request, response) {
    console.log(request.session.cookie);
    request.session.destroy(function(err) {
        if (err) {
          response.status(400).send("Logout Error");
          return;
        }
        response.status(200).send();
    });
});

/*
 * URL /user - User register
 */
app.post('/user', function (request, response) {
    let newUser = request.body;
    User.findOne({login_name: newUser.login_name}, function (err, user) {
        if (user) {
            response.status(400).send("User with " + user.login_name + " already exist.");
            return;
        }
        User.create(newUser, function (err, createdUser) {
            request.session.login_name = createdUser.login_name;
            request.session.user_id = createdUser._id;
            response.status(200).send(createdUser);
        });
    });
});

/*
 * URL /commentsOfPhoto/:photo_id - New comment
 */
app.post('/commentsOfPhoto/:photo_id', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send("User is not logged in.");
        return;
    }
    if (!request.body.comment) {
        response.status(400).send("Comment is empty.");
        return;
    }
    let photoId = request.params.photo_id;
    Photo.findOne({_id: photoId}, function (err, photo) {
        if (err) {
            console.log('Photo with _id:' + photoId + ' not found.');
            response.status(400).send('Not found');
            return;
        }
        let newComment = {
            comment: request.body.comment,
            date_time: new Date(),
            user_id: request.session.user_id
        }
        photo.comments.push(newComment);
        photo.save();
        response.status(200).send();
    });
});

/*
 * URL /photos/new - Upload new photos
 */
app.post('/photos/new', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send("User is not logged in.");
        return;
    }

    processFormBody(request, response, function (err) {
        if (err || !request.file) {
            response.status(400).send("Error on file.");
            return;
        }
        // request.file has the following properties of interest
        //      fieldname      - Should be 'uploadedphoto' since that is what we sent
        //      originalname:  - The name of the file the user uploaded
        //      mimetype:      - The mimetype of the image (e.g. 'image/jpeg',  'image/png')
        //      buffer:        - A node Buffer containing the contents of the file
        //      size:          - The size of the file in bytes
        if (request.file.fieldname !== "uploadedphoto") {
            response.status(400).send("Invalid fieldname");
            return;
        }
        if (!request.file.mimetype.includes("image")) {
            response.status(400).send("Invalid file type");
            return;            
        }
        // We need to create the file in the directory "images" under an unique name. We make
        // the original file name unique by adding a unique prefix with a timestamp.
        const timestamp = new Date().valueOf();
        const filename = 'U' +  String(timestamp) + request.file.originalname;
    
        fs.writeFile("./images/" + filename, request.file.buffer, function (err) {
            if (err) {
                response.status(400).send("WriteFile failure");
                return;
            }
            let uploadPhoto = {
                file_name: filename,
                date_time: timestamp,
                user_id: request.session.user_id,
                comments: []
            }
            Photo.create(uploadPhoto, function(err, createdPhoto) {
                response.status(200).send(createdPhoto);
            });
        });
    });
});

/*
 * URL /like - Photo Like Votes
 */
app.post('/like/:photo_id', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send("User is not logged in.");
        return;
    }

    let photoId = request.params.photo_id;
    let curUserId = request.session.user_id;
    Photo.findOne({_id: photoId}, function (err, photo) {
        if (err) {
            console.log('Photo with _id:' + photoId + ' not found.');
            response.status(400).send('Not found');
            return;
        }
        let userIndex = photo.liked_by_users.indexOf(curUserId);
        if (request.body.isLiked) {
            if (userIndex < 0) {
                // Add userId to the like list
                photo.liked_by_users.push(curUserId);
            }
        } else {
            if (userIndex >= 0) {
                // Remove userId from the like list
                photo.liked_by_users.splice(userIndex, 1);
            }
        }
        photo.save();
        response.status(200).send();
    });
});

/*
 * URL /favorite - Photo Favorite
 */
app.post('/favorite/:photo_id', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send("User is not logged in.");
        return;
    }

    let photoId = request.params.photo_id;
    let curUserId = request.session.user_id;
    Photo.findOne({_id: photoId}, function (err, photo) {
        if (err) {
            console.log('Photo with _id:' + photoId + ' not found.');
            response.status(400).send('Not found');
            return;
        }
        let userIndex = photo.favored_by_users.indexOf(curUserId);
        if (request.body.isFavorite) {
            if (userIndex < 0) {
                // Add userId to the favorite list
                photo.favored_by_users.push(curUserId);
            }
        } else {
            if (userIndex >= 0) {
                // Remove userId from the favorite list
                photo.favored_by_users.splice(userIndex, 1);
            }
        }
        photo.save();
        response.status(200).send();
    });

    User.findOne({_id: curUserId}, function (err, user) {
        if (err) {
            console.log('user with _id:' + curUserId + ' not found.');
            response.status(400).send('Not found');
            return;
        }
        let photoIndex = user.favorite_photos.indexOf(photoId);
        if (request.body.isFavorite) {
            if (photoIndex < 0) {
                // Add photoId to the favorite list
                user.favorite_photos.push(photoId);
            }
        } else {
            if (photoIndex >= 0) {
                // Remove photoId from the favorite list
                user.favorite_photos.splice(photoIndex, 1);
            }
        }
        user.save();
        response.status(200).send();
    });
});

/*
 * URL /favorites - Return photos favored by login user.
 */
app.get('/favorites', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send("User is not logged in.");
        return;
    }
    var id = request.session.user_id;
    User.findOne({_id: id}, function (err, user) {
        if (err) {
            console.log('User with _id:' + id + ' not found.');
            response.status(400).send('Not found');
            return;
        }
        let favoritePhotoIds = user.favorite_photos;
        let favoritePhotos = [];
        async.each(favoritePhotoIds, function (photoId, photoCallback) {
            Photo.findOne({_id: photoId}, function (err, photo) {
                if (err) {
                    console.log('Photo with _id:' + photoId + ' not found.');
                    response.status(400).send('Not found');
                    return;
                }
                favoritePhotos.push({
                    _id: photo._id,
                    file_name: photo.file_name,
                    date_time: photo.date_time,
                });
                photoCallback();
            });
        }, function (err) {
            if (err) {
                console.error(err.message);
                return;
            }
            response.status(200).send(favoritePhotos);
        });
    });
});

var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});


