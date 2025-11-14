import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";
const socket = io("http://localhost:5000");

let currentUserId = null;
let currentUserName = null;

// Login
async function login(){
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  
  const res = await fetch("http://localhost:5000/login",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({username,password})
  });

  const msgDiv = document.getElementById("loginMsg");
  if(res.status===200){
    const user = await res.json();
    currentUserId = user._id;
    currentUserName = user.username;
    document.getElementById("currentUser").textContent = user.username;
    document.getElementById("loginDiv").style.display="none";
    document.getElementById("registerDiv").style.display="none";
    document.getElementById("mainDiv").style.display="block";
    loadProfile(user);
    loadFeed();
  }else{
    const text = await res.text();
    msgDiv.textContent = text;
  }
}

document.getElementById("loginBtn").onclick = login;

// Register
document.getElementById("registerBtn").onclick = async ()=>{
  const username = document.getElementById("regUsername").value;
  const password = document.getElementById("regPassword").value;
  const res = await fetch("http://localhost:5000/register",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({username,password})
  });
  const msgDiv = document.getElementById("regMsg");
  if(res.status===200){
    const user = await res.json();
    msgDiv.textContent = "Kayıt başarılı! Giriş yapabilirsiniz.";
    document.getElementById("registerDiv").style.display="none";
    document.getElementById("loginDiv").style.display="block";
  }else{
    const text = await res.text();
    msgDiv.textContent = text;
  }
};

// Logout
document.getElementById("logoutBtn").onclick = ()=>{
  currentUserId = null;
  currentUserName = null;
  document.getElementById("mainDiv").style.display="none";
  document.getElementById("loginDiv").style.display="block";
};

// Load user profile info
function loadProfile(user){
  document.getElementById("profilePic").src = user.profilePic || "https://via.placeholder.com/150";
  document.getElementById("followers").textContent = `Takipçi: ${user.followers}`;
  document.getElementById("following").textContent = `Takip Edilen: ${user.following.length}`;
}

// Feed
async function loadFeed(){
  const res = await fetch("http://localhost:5000/feed");
  const posts = await res.json();
  const content = document.getElementById("mainDiv");
  content.innerHTML="<h3>Feed</h3>";
  posts.forEach(p=>{
    const div = document.createElement("div");
    div.className = "post";
    div.innerHTML = `<b>${p.userId.username}</b><p>${p.caption}</p>
                     <img src="${p.image}" width="100%">
                     <button onclick='likePost("${p._id}")'>Beğen (${p.likes})</button>`;
    content.appendChild(div);
  });
}

window.likePost = async (id)=>{
  await fetch("http://localhost:5000/post/like",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({postId:id})
  });
  alert("Post beğenildi!");
};

// Reels
document.getElementById("reelsBtn").onclick = async ()=>{
  const res = await fetch("http://localhost:5000/reel/feed");
  const reels = await res.json();
  const content = document.getElementById("mainDiv");
  content.innerHTML="<h3>Reels</h3>";
  reels.forEach(r=>{
    const div = document.createElement("div");
    div.className = "reel";
    div.innerHTML = `<b>${r.userId.username}</b><p>${r.caption}</p>
                     <video src="${r.videoUrl}" controls width="100%" autoplay loop muted></video>
                     <button onclick='likeReel("${r._id}")'>Beğen (${r.likes})</button>`;
    content.appendChild(div);
  });
});

window.likeReel = async (id)=>{
  await fetch("http://localhost:5000/reel/like",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({reelId:id})
  });
  alert("Reel beğenildi!");
};

// Chat
document.getElementById("chatBtn").onclick = ()=>{
  const content = document.getElementById("mainDiv");
  content.innerHTML = `<h3>Chat</h3>
                       <div id='messages' style='max-height:400px;overflow-y:auto;'></div>
                       <input id='msgInput' placeholder='Mesaj...'>
                       <button id='sendMsg'>Gönder</button>`;
  
  socket.emit("join_chat", currentUserId);

  socket.on("receive_message",(msg)=>{
    const div = document.createElement("div");
    div.className = "chatMsg";
    div.textContent = `${msg.senderId}: ${msg.text}`;
    document.getElementById("messages").appendChild(div);
  });

  document.getElementById("sendMsg").onclick = ()=>{
    const text = document.getElementById("msgInput").value;
    if(!text) return;
    socket.emit("send_message",{ chatId:currentUserId, senderId:currentUserId, text });
    document.getElementById("msgInput").value="";
  };
};

// Founder login (modal)
document.getElementById("founderLoginBtn").onclick = ()=>{
  const pass = prompt("Kurucu şifresini gir:");
  if(pass === "192892828#+#??#?#(#¿(##?(#+2928292829"){
    alert("Kurucu giriş başarılı!");
    // Admin panel açılabilir burada
  }else{
    alert("Hatalı şifre kral!");
  }
};

// Keşfet (basit örnek)
document.getElementById("discoverBtn").onclick = async ()=>{
  const res = await fetch("http://localhost:5000/feed"); // şimdilik tüm postlar
  const posts = await res.json();
  const content = document.getElementById("mainDiv");
  content.innerHTML="<h3>Keşfet</h3>";
  posts.forEach(p=>{
    const div = document.createElement("div");
    div.className = "post";
    div.innerHTML = `<b>${p.userId.username}</b><p>${p.caption}</p>
                     <img src="${p.image}" width="100%">`;
    content.appendChild(div);
  });
};
