localVideo = document.getElementById('localVideo');
remoteVideo = document.getElementById('remoteVideo');

var constraints = {
    video: true,
    audio: true,
};
navigator.getUserMedia(constraints, gotStream, logError);

  function gotStream(stream) {
    var video = document.querySelector('video');
    video.src = window.URL.createObjectURL(stream);
  }

  function logError(error) { }