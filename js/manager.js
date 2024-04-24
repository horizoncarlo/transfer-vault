const imageMaxWidth = 800;
const imageMaxHeight = 800;

let state = {
  bodyReady: false,
  showProgress: false,
  uploadProgress: 0
}

function init() {
  if (isMobileSize()) {
    addCSSLink('mobile-css', './css/mobile.css');
  }
  
  document.addEventListener('alpine:initialized', () => {
    alpineInit();
  });
}
init();

function alpineInit() {
  state = Alpine.reactive(state);
}

function handleFiles(event) {
  // Get our list of files from either the drag & drop or native file upload
  let files = null;
  if (event.dataTransfer && event.dataTransfer.files) {
    files = event.dataTransfer.files;
  }
  else if (event.target && event.target.files) {
    files = event.target.files;
  }
  
  if (files) {
    state.showProgress = true;
    state.uploadProgress = 0;
    
    const promises = [];
    for (let i = 0; i < files.length; i++) {
      promises.push(readFile(files[i]));
    }
    
    Promise.allSettled(promises).then(res => {
      state.showProgress = false;
    }).catch(err => {
      // TODO Error
    })
  }
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      processFile(file, reader.result);
      resolve();
    }
    
    reader.onerror = (e) => {
      // TODO Error
      reject(e);
    }
    
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        state.uploadProgress = ((e.loaded / e.total) * 100).toFixed(2);
      }
    }
    
    // Start our reader based on our file type
    if (isImage(file.type)) {
      reader.readAsDataURL(file);
    }
    else {
      reader.readAsArrayBuffer(file);
    }
  });
}

function processFile(file, data) {
  // If weren't not an image we can just send the file along right away
  if (!isImage(file.type)) {
    sendFile(file, data);
    return;
  }
  // Otherwise determine if we need to resize the image
  else {
    const image = new Image();
    image.src = data;
    
    image.onload = function() {
      const width = image.width;
      const height = image.height;
      const needResize = (width > imageMaxWidth) || (height > imageMaxHeight);
      
      // If we don't need to resize just send along the file
      if (!needResize) {
        sendFile(file, data);
        return;
      }
      
      // Otherwise scale but maintain the aspect ratio
      let newWidth, newHeight;
      if (width > height) {
        newHeight = height * (imageMaxWidth / width);
        newWidth = imageMaxWidth;
      }
      else {
        newWidth = width * (imageMaxHeight / height);
        newHeight = imageMaxHeight;
      }
      
      // Apply to the canvas and send along the scaled result
      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      const context = canvas.getContext('2d');
      context.drawImage(this, 0, 0, newWidth, newHeight);
      
      sendFile(file, canvas.toDataURL(file.type));
    }
    
    image.onerror = (e) => {
      // TODO Error
    }
  }
}

function sendFile(file, data) {
  if (isImage(file.type)) {
    const img = document.createElement('img');
    img.classList.add('preview-image');
    img.src = data;
    document.getElementById('preview').appendChild(img);
  }
  else {
    const text = document.createElement('div');
    text.innerText = file.name + ' (' + (file.size/1000).toFixed(1) + 'kb)';
    document.getElementById('preview').appendChild(text);
  }
  
  console.log("Would send file of size", file.size);
  return;
  
	var formData = new FormData();

	formData.append('imageData', fileData);

	$.ajax({
		type: 'POST',
		url: '/your/upload/url',
		data: formData,
		contentType: false,
		processData: false,
		success: function (data) {
			if (data.success) {
				alert('Your file was successfully uploaded!');
			} else {
				alert('There was an error uploading your file!');
			}
		},
		error: function (data) {
			alert('There was an error uploading your file!');
		}
	});
  
  /*
  // TODO: On NodeJS side
  server.on('request', (req, res) => {

  if(req.url === '/' && req.method == 'GET') {
      return res.end(fs.readFileSync(__dirname + '/index.html'))
  }

  if(req.url=== '/upload' && req.method == 'POST') {
      const query = new URLSearchParams(req.url);
          const fileName = query.get(‘/upload?fileName’);

      req.on('data', chunk => {
          fs.appendFileSync(fileName, chunk); // append to a file on the disk
      })


      return res.end('Yay! File is uploaded.')
  }
  })
  */
}
