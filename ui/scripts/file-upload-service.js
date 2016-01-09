define(function(require) {

  /**
   * Fix issues with Chrome missing a fuction
   */
  XMLHttpRequest.prototype.sendAsBinary = function(datastr) {
    function byteValue(x) {
      return x.charCodeAt(0) & 0xff;
    }
    var ords = Array.prototype.map.call(datastr, byteValue);
    var ui8a = new Uint8Array(ords);
    this.send(ui8a.buffer);
  }

  function createThrobber(img) {
    console.log("createthubmail");
  }

  function FileUpload(img, file) {
    
    var formData = new FormData();
    
    console.log(file);

    formData.append('file', file);

    //for (var i = 0; i < files.length; i++) {
    //  formData.append('file', files[i]);
    //}

    // now post a new XHR request
    var xhr = new XMLHttpRequest();
    
    xhr.open('POST', '/upload', true);
    
    xhr.onload = function () {
      if (xhr.status === 200) {
        console.log('all done: ' + xhr.status);
      } else {
        console.log('Something went terribly wrong...');
      }
    };

    console.log(formData);

    xhr.send(formData);
  }

  function sendFile(file) {
      var uri = "/index.php";
      var xhr = new XMLHttpRequest();
      var fd = new FormData();
      
      xhr.open("POST", "http://localhost:8080/upload", false);

      xhr.onreadystatechange = function() {
          if (xhr.readyState == 4 && xhr.status == 200) {
              // Handle response.
              alert(xhr.responseText); // handle response.
          }
      };

      console.log(file);

      fd.append('picture', file);
      
      // Initiate a multipart/form-data upload
      xhr.send(fd);
  }

  window.onload = function() {
    var dropzone = document.getElementById("dropzone");

    dropzone.ondragover = dropzone.ondragenter = function(event) {
      event.stopPropagation();
      event.preventDefault();
    }

    dropzone.ondrop = function(event) {
      event.stopPropagation();
      event.preventDefault();

      var filesArray = event.dataTransfer.files;
      for (var i=0; i<filesArray.length; i++) {
          sendFile(filesArray[i]);
      }
    }
  }

  return {
    FileUpload:FileUpload,
    sendFile:sendFile
  }

});