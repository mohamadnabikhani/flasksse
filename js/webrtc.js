var localVideo;
var remoteVideo;
var peerConnection;
var uuid;
var localStream;
var xhr = new XMLHttpRequest();

var peerConnectionConfig = {
    'iceServers': [
        {'urls': 'stun:stun.services.mozilla.com'},
        {'urls': 'stun:stun.l.google.com:19302'},
    ]
};

var source = new EventSource("{{ url_for('sse.stream') }}");
source.addEventListener('greeting', function(event) {
    var data = JSON.parse(event.data);
    if (data.room_id == chat_room_id){
        var newElement = document.createElement("li");
        newElement.textContent = "message: " + "one calling you";
        eventList.appendChild(newElement);
    }
    }, false);

source.addEventListener('error', function(event) {
                alert("Failed to connect to event stream. Is Redis running?");
            }, false);


function pageReady() {
    uuid = uuid();

    localVideo = document.getElementById('localVideo');
    remoteVideo = document.getElementById('remoteVideo');

    // serverConnection = new WebSocket('wss://' + window.location.hostname + ':8443');
    // serverConnection.onmessage = gotMessageFromServer;
    // var source = new EventSource("{{ url_for('sse.stream') }}");


    var constraints = {
        video: true,
        audio: true,
    };

    if(navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(constraints).then(getUserMediaSuccess).catch(errorHandler);
    } else {
        alert('Your browser does not support getUserMedia API');
    }
}

function getUserMediaSuccess(stream) {
    localStream = stream;
    localVideo.src = window.URL.createObjectURL(stream);
}

function start(isCaller) {
    peerConnection = new RTCPeerConnection(peerConnectionConfig);
    peerConnection.onicecandidate = gotIceCandidate;
    peerConnection.onaddstream = gotRemoteStream;
    peerConnection.addStream(localStream);

    if(isCaller) {
        peerConnection.createOffer().then(createdDescription).catch(errorHandler);
    }
}

function gotMessageFromServer(message) {
    if(!peerConnection) start(false);

    var signal = JSON.parse(message.data);

    // Ignore messages from ourself
    if(signal.uuid == uuid) return;

    if(signal.sdp) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(function() {
            // Only create answers in response to offers
            if(signal.sdp.type == 'offer') {
                peerConnection.createAnswer().then(createdDescription).catch(errorHandler);
            }
        }).catch(errorHandler);
    } else if(signal.ice) {
        peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(errorHandler);
    }
}

function gotIceCandidate(event) {
    if(event.candidate != null) {
        serverConnection.send(JSON.stringify({'ice': event.candidate, 'uuid': uuid}));
    }
}

function createdDescription(description) {
    console.log('got description');

    peerConnection.setLocalDescription(description).then(function() {
        // serverConnection.send(JSON.stringify({'sdp': peerConnection.localDescription, 'uuid': uuid}));
        xhr.onreadystatechange = function () {
              if(this.readyState == 4 && this.status == 200){

              }
            };
        var data = new FormData();
        data.append('sdp', peerConnection.localDescription);
        data.append( 'uuid', uuid);
        xhr.open("POST","/sendsdp",true);
        xhr.send(data);

    }).catch(errorHandler);
}

function gotRemoteStream(event) {
    console.log('got remote stream');
    remoteVideo.src = window.URL.createObjectURL(event.stream);
}

function errorHandler(error) {
    console.log(error);
}

// Taken from http://stackoverflow.com/a/105074/515584
// Strictly speaking, it's not a real UUID, but it gets the job done here
function uuid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
