setStoredField('accessKeyId')
setStoredField('secretAccessKey')
setStoredField('regionName')
setStoredField('bucketName')
setStoredField('delimiter')
setStoredField('prefix')

var albumBucketName;

function getS3() {
  var accessKeyIdInput = document.querySelector('#accessKeyId');
  var secretAccessKeyInput = document.querySelector('#secretAccessKey');
  var regionNameInput = document.querySelector('#regionName');
  var bucketNameInput = document.querySelector('#bucketName');
  localStorage.setItem('accessKeyId', accessKeyIdInput.value);
  localStorage.setItem('secretAccessKey', secretAccessKeyInput.value);
  localStorage.setItem('regionName', regionNameInput.value);
  localStorage.setItem('bucketName', bucketNameInput.value);
  var albumBucketName = bucketNameInput.value;

  // Regions available: https://docs.aws.amazon.com/general/latest/gr/rande.html
  AWS.config.update(
    {
      accessKeyId: accessKeyIdInput.value,
      secretAccessKey: secretAccessKeyInput.value
    });
  AWS.config.region = regionNameInput.value;

  var s3 = new AWS.S3(
    {
      apiVersion: '2006-03-01',
      params: { Bucket: bucketNameInput.value },
      // endpoint: 'https://'+regionNameInput.value+'.amazonaws.com/'
    });
  return s3;
}

function setStoredField(id, ) {
  if (localStorage.getItem(id)) {
    var inputField = document.querySelector('#' + id);
    inputField.value = localStorage.getItem(id);
  }
}

function getHtml(template) {
  return template.join('\n');
}

function getFolderListItemsHtml(data) {
  return data.CommonPrefixes.map(function (commonPrefix) {
    console.log('commonPrefix: ' + commonPrefix);
    console.log('commonPrefix.Prefix: ' + commonPrefix.Prefix);
    var prefix = commonPrefix.Prefix;
    var albumName = decodeURIComponent(prefix.replace('/', ''));
    console.log('albumName: ' + albumName);
    return getHtml([
      '<li>',
      //   '<span onclick="deleteAlbum(\'' + albumName + '\')">X</span>',
      '<span onclick="viewAlbum(\'' + albumName + '\')">',
      albumName,
      '</span>',
      '</li>'
    ]);
  });
}

function listAlbums() {
  s3 = getS3();
  s3.listObjects({ Delimiter: '/' }, function (err, data) {
    if (err) {
      return alert('There was an error listing your albums: ' + err.message);
    } else {
      var albums = getFolderListItemsHtml(data);
      var message = albums.length ?
        getHtml([
          '<p>Click on an album name to view it.</p>'
          // '<p>Click on the X to delete the album.</p>'
        ]) :
        '<p>You do not have any albums. Please Create album.';
      var htmlTemplate =
        [
          '<h2>Albums</h2>',
          message,
          '<ul>',
          getHtml(albums),
          '</ul>'
          //   '<button onclick="createAlbum(prompt(\'Enter Album Name:\'))">',
          //     'Create New Album',
          //   '</button>'
        ]
      document.getElementById('app').innerHTML = getHtml(htmlTemplate);
    }
  });
}

function viewAlbum(albumName) {
  var albumPhotosKey = encodeURIComponent(albumName) + '/';
  console.log('albumPhotosKey: ' + albumPhotosKey);
  s3.listObjects({ Prefix: albumPhotosKey }, function (err, data) {
    if (err) {
      return alert('There was an error viewing your album: ' + err.message);
    }
    // `this` references the AWS.Response instance that represents the response
    var href = this.request.httpRequest.endpoint.href;
    var bucketUrl = href + albumBucketName + '/';
    //console.log(data);
    var photos = data.Contents.map(function (photo) {
      var photoKey = photo.Key;
      var photoUrl = bucketUrl + encodeURIComponent(photoKey);
      return getHtml([
        '<span>',
        '<div>',
        '<img style="width:128px;height:128px;" src="' + photoUrl + '"/>',
        '</div>',
        '<div>',
        '<span onclick="deletePhoto(\'' + albumName + "','" + photoKey + '\')">',
        'X',
        '</span>',
        '<span>',
        photoKey.replace(albumPhotosKey, ''),
        '</span>',
        '</div>',
        '</span>',
      ]);
    });

    var albums = getFolderListItemsHtml(data);
    console.log(albums);

    var message = photos.length ?
      '<p>Click on the X to delete the photo</p>' :
      '<p>You do not have any photos in this album. Please add photos.</p>';
    var htmlFilesTemplate = [
      '<h2>',
      'Album: ' + albumName,
      '</h2>',
      message,
      '<div>',
      getHtml(photos),
      '</div>',
      '<input id="photoupload" type="file" accept="image/*">',
      '<button id="addphoto" onclick="addPhoto(\'' + albumName + '\')">',
      'Add Photo',
      '</button>',
      '<button onclick="listAlbums()">',
      'Back To Albums',
      '</button>',
    ]

    var htmlTableTemplate = [
      '<table>',
      '<tr>',
      '<td>',
      '<div id=\"folders\"></div>',
      '</td>',
      '<td>',
      '<div id=\"files\"></div>',
      '</td>',
      '</tr>',
      '</table>'
    ]
    document.getElementById('app').innerHTML = getHtml(htmlTableTemplate);
    document.getElementById('files').innerHTML = getHtml(htmlFilesTemplate);

  });
}

function doStuff() {
  s3 = getS3();
  var delimiterInput = document.querySelector('#delimiter');
  var prefixInput = document.querySelector('#prefix');
  localStorage.setItem('delimiter', delimiterInput.value);
  localStorage.setItem('prefix', prefixInput.value);

  s3.listObjectsV2({ Delimiter: delimiterInput.value, Prefix: prefixInput.value }, function (err, data) {
    if (err) {
      console.log(err);
    }
    else {
      console.log(data);
    }
  });

  //   s3.listObjectsV2({Prefix: albumPhotosKey}, function(err, data)
  //   {
  //     if (err) 
  //     {
  //         console.log(err);
  //     } 
  //     else 
  //     {
  //         console.log(data);
  //     }
  // });

  //     s3.listObjectsV2(function (err, data)
  //     {
  //         if (err) 
  //         {
  //             console.log(err);
  //         } 
  //         else 
  //         {
  //             console.log(data);
  //         }
  //     });
}
