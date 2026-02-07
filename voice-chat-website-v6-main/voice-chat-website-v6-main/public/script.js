const socket = io();

let localStream;

let gameAudio = new Audio('game_sound.mp3'); // Example of game sound

// This function handles the voice chat and permissions

document.getElementById("joinBtn").addEventListener("click", async () => {

  try {

    // Request microphone permission only when the user clicks the button

    localStream = await navigator.mediaDevices.getUserMedia({

      audio: { echoCancellation: true, noiseSuppression: true }

    });

    

    // Now the user can join the voice chat room

    const room = roomInput.value.trim();

    const username = usernameInput.value.trim();

    if (!room || !username) return alert("Enter name and room");

    socket.emit("join-room", { room, username });

    

    // Hide the join screen and show the voice chat interface

    joinBox.style.display = "none";

    status.hidden = false;

    roomName.innerText = room;

    // Play game sound

    gameAudio.play();

  } catch (error) {

    console.error("Error accessing microphone:", error);

  }

});

// Socket event to handle user joining the room and voice chat peer connections

socket.on("user-joined", async (data) => {

  // Handle when a user joins, create a peer connection for voice chat

  const pc = createPeer(data.id);

  peers[data.id] = pc;

  const offer = await pc.createOffer();

  await pc.setLocalDescription(offer);

  socket.emit("signal", { type: "offer", payload: offer });

});

// Function to adjust the game audio volume while the voice chat is active

socket.on("voice-chat-started", () => {

  gameAudio.volume = 0.5;  // Lower the game audio when voice chat starts

});

socket.on("voice-chat-ended", () => {

  gameAudio.volume = 1.0;  // Reset game audio when voice chat ends

});