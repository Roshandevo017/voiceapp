const socket = io();
let localStream;
let peers = {};

async function joinRoom() {

 const username = document.getElementById("username").value;
 const room = document.getElementById("room").value;

 localStream = await navigator.mediaDevices.getUserMedia({
  audio:{
   echoCancellation:true,
   noiseSuppression:true,
   autoGainControl:false
  }
 });

 socket.emit("join", {username, room});

 socket.on("user-joined", async (id)=>{

   const pc = createPeer(id);
   localStream.getTracks().forEach(track=>{
     pc.addTrack(track, localStream);
   });

   const offer = await pc.createOffer();
   await pc.setLocalDescription(offer);

   socket.emit("offer",{offer,id});
 });

 socket.on("offer", async(data)=>{
   const pc = createPeer(data.id);

   localStream.getTracks().forEach(track=>{
     pc.addTrack(track, localStream);
   });

   await pc.setRemoteDescription(data.offer);
   const answer = await pc.createAnswer();
   await pc.setLocalDescription(answer);

   socket.emit("answer",{answer,id:data.id});
 });

 socket.on("answer",(data)=>{
   peers[data.id].setRemoteDescription(data.answer);
 });

 socket.on("candidate",(data)=>{
   peers[data.id].addIceCandidate(data.candidate);
 });
}

function createPeer(id){

 const pc = new RTCPeerConnection();

 pc.ontrack=(e)=>{
   const audio=document.createElement("audio");
   audio.srcObject=e.streams[0];
   audio.autoplay=true;
   audio.playsInline=true;
   document.body.appendChild(audio);
 };

 pc.onicecandidate=(e)=>{
   if(e.candidate){
    socket.emit("candidate",{candidate:e.candidate,id});
   }
 };

 peers[id]=pc;
 return pc;
}
