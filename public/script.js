const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "3030"
}); 

var getUserMedia =                
navigator.getUserMedia ||
navigator.webkitGetUserMedia ||
navigator.mozGetUserMedia;


let myVideoStream;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;                                 //my video stream
    addVideoStream(myVideo, stream);

    peer.on("call", call => {
        call.answer(stream);                               //answer other user's call
        const video = document.createElement("video");
        call.on("stream", userVideoStream => {             // add video stream from other user
            addVideoStream(video, userVideoStream)
        })
    })
    
    socket.on('user-connected', userId => {
        // user is joining`
        setTimeout(() => {
        // user joined
        connectToNewUser(userId, stream)
        }, 1000)
    })

    
})



peer.on("open", id => {                          //id automatically generated
    socket.emit("join-room", ROOM_ID, id);
})


const connectToNewUser = (userId, stream) => {
    console.log(stream);

    const call = peer.call(userId, stream);        //send my stream //calling other user
    const video = document.createElement("video"); //creat new video element for other user in their browser
    call.on("stream", userVideoStream => {         
        addVideoStream(video, userVideoStream)
    })
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
    })
    videoGrid.append(video);
}

let text = $("input");

    $("html").keydown((e) => {
        if (e.which == 13 && text.val().length !== 0) {                 //13 listens to enter key command 
            socket.emit("message", text.val());                         //socket.emit means SEND socket.on means RECEIVE
            text.val("");                                               //clears input after pressing enter key
        }
    })
    
    socket.on("createMessage", message => {
        console.log(message);
        $(".messages").append(`<li class="message"><b>user</b><br />${message}</li>`)        //receive incoming message from server and display on frontend
    })


const scrollToBottom = () => {                                           //to ensure chat window has a scroll function
    let d = $(".main__chat_window");
    d.scrollTop(d.prop("scrollHeight"));
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
        <i class="fas fa-microphone"></i>
        <span>Mute</span>
    `

    document.querySelector(".main__mute_button").innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
        <i class="unmute fas fa-microphone-slash"></i>
        <span>Unmute</span>
    `

    document.querySelector(".main__mute_button").innerHTML = html;
}

const playStop = () => {
    console.log("object");
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    } else {
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setStopVideo = () => {
    const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
    `

    document.querySelector(".main__video_button").innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
    `

    document.querySelector(".main__video_button").innerHTML = html;
}