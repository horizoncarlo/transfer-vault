const imageMaxWidth = 300;
const imageMaxHeight = 300;

let state = {
  bodyReady: false,
  showProgress: false,
  uploadProgress: 0,
  hasUploads: false,
  images: [],
  files: []
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
  
  Alpine.effect(() => {
    state.hasUploads = state.images?.length > 0 || state.files?.length > 0;
  });
}

function clearUploads() {
  state.images = [];
  state.files = [];
}

function handleFiles(event) {
  // Get a list of files depending on our source
  let files = null;
  
  // Drag and drop from something like a file explorer
  if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
    files = event.dataTransfer.files;
  }
  // Native file upload
  else if (event.target && event.target.files && event.target.files.length > 0) {
    files = event.target.files;
  }
  else {
    // TODO Error on unknown drag & drop type
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
      sendFile(file, reader.result);
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

function sendFile(file, data) {
  if (isImage(file.type)) {
    state.images.push({ file: file, data: data });
  }
  else {
    state.files.push({ file: file, data: data });
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
