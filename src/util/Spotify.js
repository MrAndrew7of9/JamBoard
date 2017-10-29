
const clientID = '78272ce624b84226a22f0f3dc2111fa0';
const redirectURI = 'http://localhost:3000/';
let userAccessToken;

const Spotify = {

  savePlaylist(playlistName, trackURIs) {
    if(!playlistName || !trackURIs) {
      return;
    }
    let access_token = userAccessToken;
    let headers = {
      Authorization: `Bearer ${access_token}`
    };
    let postHeaders = {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json"
    };
    let userID;
    let playlistID;
    if(!userID) {
      userID = this.getUserID(headers);
    };
    if (userID && !playlistID) {
      playlistID = this.getPlaylistID(postHeaders, userID, playlistName);
    };
    if (userID && playlistID) {
      this.savePlaylistTracks(postHeaders, trackURIs, playlistID, userID);
    };
  },//end savePlaylist method

    getUserID(headers) {//fetch user id
      fetch(`https://api.spotify.com/v1/me`,
        {
          headers: headers
        }
      ).then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Request failed!');
      }, networkError => console.log(networkError.message)
    ).then(jsonResponse => {
      if(jsonResponse.id) {
        return jsonResponse.id;
      }//for some reason the userID isn't saved to be used by next fetch, but the following console log shows the actual value, why?
    })
  },//end getUserID
//the userID is not being returned to use in the following fetch statements
  //as the post userID in the POST url is 'undefined'
  //fetch POST to save/create a playlist to the user's account

  getPlaylistID(postHeaders, userID, playlistName) {
      fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, { //userID is undefined
        method: 'POST',
        headers: postHeaders,
        body: JSON.stringify({
          name: playlistName,
        }),
    }).then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('POST playlist request failed!');
    }, networkError => console.log(networkError.message)
  ).then(jsonResponse => {
    if (jsonResponse.id) {
      return jsonResponse.id;
    }
  })
},//end getPlaylistID method

//fetch POST to add tracks to the playlist
  savePlaylistTracks(postHeaders, trackURIs, playlistID, userID) {
    fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`, {
       method: 'POST',
       headers: postHeaders,
       body: JSON.stringify({
         id: playlistID,
         uris: trackURIs,
       }),
  }).then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error('POST tracks request failed!');
  }, networkError => console.log(networkError.message)
  ).then(jsonResponse => {
    console.log(`The respose from savePlaylistTracks is: ${jsonResponse}`);
  })
},//end savePlaylist method

  searchSpotify(searchTerm) {
    if (!userAccessToken) {
      this.getAccessToken();
    };
    console.log(userAccessToken);
    return fetch(`https://api.spotify.com/v1/search?q=${searchTerm}&type=track`,
      {
        headers: {Authorization: `Bearer ${userAccessToken}`}
      }
    ).then(response => {
      if (response.ok) {
        return response.json();
      }
      console.log("request failed");
    }, networkError => console.log(networkError.message)
  ).then(jsonResponse => {
    console.log(jsonResponse);
    if (jsonResponse.tracks) {
      return jsonResponse.tracks.items.map(track => ({
        ID: track.id,
        Name: track.name,
        Artist: track.artists[0].name,
        Album: track.album.name,
        URI: track.uri,
      }))
    }
  }).catch(error => {
  console.log(error);
});
},//end search method

  getAccessToken() {
    if(userAccessToken) {
      return new Promise(resolve => resolve(userAccessToken));
    }
      const urlAccessToken = window.location.href.match(/access_token=([^&]*)/);
      const urlExpiresIn = window.location.href.match(/expires_in=([^&]*)/);
      if (urlAccessToken && urlExpiresIn) {
        userAccessToken = urlAccessToken[1];
        let expiresIn = urlExpiresIn[1];
        window.setTimeout(() => userAccessToken = '', expiresIn * 1000);
        window.history.pushState('Access Token', null, '/');
      } else {
      window.location = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
      //reccomend adding a state to ensure to ensure valitity
      //possible add scopes for more functionality
      //redirect to sign in page & asks permission to modify user playlists
      }
    }
  //add a method that saves user's playlist to their Spotify account
  };//end spotify object

export default Spotify;
