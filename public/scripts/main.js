// References:
// https://docs.aws.amazon.com/AmazonS3/latest/dev/cors.html
// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/
// https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-example-creating-buckets.html
// https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/building-sdk-for-browsers.html
// https://medium.com/@javidgon/amazon-s3-pros-cons-and-how-to-use-it-with-javascript-701fffc89154
// https://www.npmjs.com/package/aws-sdk
// https://stackoverflow.com/questions/14589577/access-files-on-amazon-s3-using-html5-javascript

setStoredField('accessKeyId')
setStoredField('secretAccessKey')
setStoredField('regionName')
setStoredField('bucketName')

var bucketName;

function getS3() {
    var accessKeyIdInput = document.querySelector('#accessKeyId');
    var secretAccessKeyInput = document.querySelector('#secretAccessKey');
    var regionNameInput = document.querySelector('#regionName');
    var bucketNameInput = document.querySelector('#bucketName');
    localStorage.setItem('accessKeyId', accessKeyIdInput.value);
    localStorage.setItem('secretAccessKey', secretAccessKeyInput.value);
    localStorage.setItem('regionName', regionNameInput.value);
    localStorage.setItem('bucketName', bucketNameInput.value);
    var bucketName = bucketNameInput.value;

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
function getTightHtml(template) {
    return template.join('');
}

function getFolderListItemsHtml(data) {
    return data.CommonPrefixes.map(function (commonPrefix) {
        // console.log('commonPrefix: ' + commonPrefix);
        // console.log('commonPrefix.Prefix: ' + commonPrefix.Prefix);
        var prefix = commonPrefix.Prefix;
        var folderName = decodeURIComponent(prefix.substring(0, prefix.length - 1));
        var shortFolderName = folderName.substring(folderName.lastIndexOf('/') + 1);
        // console.log('albumName: ' + albumName);
        return getHtml([
            '<li>',
            //   '<span onclick="deleteAlbum(\'' + albumName + '\')">X</span>',
            '<span onclick="viewFolderContents(\'' + folderName + '/\')">',
            '[' + shortFolderName + ']',
            '</span>',
            '</li>'
        ]);
    });
}
function getFileListItemsHtml(data) {
    return data.Contents.map(function (record) {
        var fileName = decodeURIComponent(record.Key);
        var shortFileName = fileName.substring(fileName.lastIndexOf('/') + 1);
        if (shortFileName.length === 0) return null;
        return getHtml([
            '<li>',
            //   '<span onclick="deleteFile(\'' + fileName + '\')">X</span>',
            '<span onclick="viewImage(\'' + fileName + '\')">',
            shortFileName,
            '</span>',
            '</li>'
        ]);
    });
}

function getBreadcrumb(folderName) {
    // TODO: Make this recursive.
    console.log('method: getBreadcrumb');
    console.log('folderName: ' + folderName);
    if (folderName.endsWith('/')) folderName = folderName.substring(0, folderName.length - 1);
    console.log('folderName: ' + folderName);
    var shortFolderName = folderName.substring(folderName.lastIndexOf('/') + 1);
    console.log('shortFolderName: [' + shortFolderName + ']');
    // TODO: Don't just replace. This won't work if the path repeats (e.g. /people/friends/people/friends).
    var parent = folderName.replace(shortFolderName, '');
    console.log('parent: [' + parent + ']');
    var breadcrumb = getTightHtml([
        '<span onclick="viewFolderContents(\'' + parent + '\')">',
        parent,
        '</span>',
        shortFolderName
    ]);
    return '<p>' + breadcrumb + '</p>';
}

function viewFolderContents(folderName) {
    s3 = getS3();
    s3.listObjects({ Delimiter: '/', Prefix: folderName }, function (err, data) {
        if (err) {
            return alert('There was an error listing your files: ' + err.message);
        } else {
            var folders = getFolderListItemsHtml(data);
            var files = getFileListItemsHtml(data);
            var message = folders.length + files.length ?
                getHtml([
                    '<p>Click on an file name or folder name to view it.</p>'
                    // '<p>Click on the X to delete the folder.</p>'
                ]) :
                '<p>You do not have any files.';
            var breadcrumb = getBreadcrumb(folderName);
            var htmlFoldersTemplate =
                [
                    message,
                    breadcrumb,
                    '<ul>',
                    getHtml(folders),
                    getHtml(files),
                    '</ul>'
                    //   '<button onclick="createAlbum(prompt(\'Enter Album Name:\'))">',
                    //     'Create New Album',
                    //   '</button>'
                ]
            var htmlTableTemplate = [
                '<div id=\"path\"></div>',
                '<table>',
                '<tr>',
                '<td style="vertical-align:top">',
                '<div id=\"folders\"></div>',
                '</td>',
                '<td style="vertical-align:top">',
                '<img id=\"image\"></img>',
                '</td>',
                '</tr>',
                '</table>'
            ]
            document.getElementById('app').innerHTML = getHtml(htmlTableTemplate);
            document.getElementById('folders').innerHTML = getHtml(htmlFoldersTemplate);
        }
    });
}

function viewImage(fileName) {
    var bucketNameInput = document.querySelector('#bucketName');
    var imageCtl = document.querySelector('#image')
    imageCtl.src = null;
    imageCtl.alt = "Loading...";
    console.log(bucketNameInput.value);
    console.log(encodeURIComponent(fileName));
    s3 = getS3();
    s3.getObject({
        Bucket: bucketNameInput.value,
        Key: fileName
    }, function (err, file) {
        if (err) {
            console.log(err);
        } else {
            imageCtl.src = "data:image/png;base64," + encode(file.Body);
        }
    });
}

function encode(data) {
    var str = data.reduce(function (a, b) { return a + String.fromCharCode(b) }, '');
    return btoa(str).replace(/.{76}(?=.)/g, '$&\n');
}

