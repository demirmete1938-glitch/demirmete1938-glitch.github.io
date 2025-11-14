// frontend/App.js
import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";
const API = location.origin.includes("http") && location.origin.includes("localhost") ? "http://localhost:5000/api" : "/api";
const socket = io((location.origin.includes("localhost") ? "http://localhost:5000" : location.origin));

let currentUser = null;

const ui = {
  loginBtn: document.getElementById("loginBtn"),
  registerBtn: document.getElementById("registerBtn"),
  showRegisterBtn: document.getElementById("showRegisterBtn"),
  showLoginBtn: document.getElementById("showLoginBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  founderLoginBtn: document.getElementById("founderLoginBtn"),
  content: document.getElementById("content"),
  mainApp: document.getElementById("mainApp"),
  profileName: document.getElementById("profileName"),
  profilePic: document.getElementById("profilePic"),
  followers: document.getElementById("followers"),
  following: document.getElementById("following")
};

ui.showRegisterBtn.addEventListener("click", ()=>{ document.getElementById("loginDiv").style.display="none"; document.getElementById("registerDiv").style.display="block"; });
ui.showLoginBtn.addEventListener("click", ()=>{ document.getElementById("registerDiv").style.display="none"; document.getElementById("loginDiv").style.display="block"; });

ui.loginBtn.addEventListener("click", async ()=>{
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const res = await fetch(`${API}/auth/login`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ username, password }) });
  if(res.ok){
    const user = await res.json();
    currentUser = user;
    onLogin();
  } else {
    document.getElementById("loginMsg").textContent = await res.text();
  }
});

ui.registerBtn.addEventListener("click", async ()=>{
  const username = document.getElementById("regUsername").value;
  const password = document.getElementById("regPassword").value;
  const res = await fetch(`${API}/auth/register`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ username, password }) });
  if(res.ok){
    document.getElementById("regMsg").textContent = "Kayıt başarılı, giriş yapabilirsiniz";
    document.getElementById("registerDiv").style.display="none";
    document.getElementById("loginDiv").style.display="block";
  } else {
    document.getElementById("regMsg").textContent = await res.text();
  }
});

ui.logoutBtn.addEventListener("click", ()=>{
  currentUser = null;
  document.getElementById("mainApp").style.display="none";
  document.getElementById("authBox").style.display = "block";
  ui.logoutBtn.style.display = "none";
  document.getElementById("currentUser").textContent = "Misafir";
});

ui.founderLoginBtn.addEventListener("click", async ()=>{
  const pw = prompt("Kurucu şifresini gir:");
  const res = await fetch(`${API}/admin/login`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ password: pw }) });
  const data = await res.json();
  if(res.ok && data.ok) alert("Kurucu giriş başarılı");
  else alert("Hatalı şifre");
});

// navigation buttons
document.getElementById("feedBtn").addEventListener("click", loadFeed);
document.getElementById("reelsBtn").addEventListener("click", loadReels);
document.getElementById("chatBtn").addEventListener("click", openChat);
document.getElementById("discoverBtn").addEventListener("click", loadDiscover);

function onLogin(){
  document.getElementById("authBox").style.display = "none";
  document.getElementById("mainApp").style.display = "block";
  ui.logoutBtn.style.display = "inline-block";
  document.getElementById("currentUser").textContent = currentUser.username;
  ui.profileName.textContent = currentUser.username;
  ui.followers.textContent = `Takipçi: ${currentUser.followers || 0}`;
  ui.following.textContent = `Takip Edilen: ${currentUser.following?.length || 0}`;
  loadFeed();
}

// feed
async function loadFeed(){
  const res = await fetch(`${API}/posts/feed`);
  const posts = await res.json();
  const main = document.getElementById("mainApp");
  main.innerHTML = "<h3>Feed</h3>";
  posts.forEach(p=>{
    const el = document.createElement("div");
    el.className = "post";
    el.innerHTML = `<b>${p.userId?.username || 'Anon'}</b><p>${p.caption || ""}</p>${p.image? `<img src="${(location.origin.includes("localhost")? "http://localhost:5000":"")}${p.image}" alt="post" />` : "" }<div><button onclick='likePost("${p._id}")'>Beğen (${p.likes})</button></div>`;
    main.appendChild(el);
  });
}

window.likePost = async (id)=>{
  await fetch(`${API}/posts/like`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ postId: id })});
  loadFeed();
};

// reels
async function loadReels(){
  const res = await fetch(`${API}/reels/feed`);
  const reels = await res.json();
  const main = document.getElementById("mainApp");
  main.innerHTML = "<h3>Reels</h3>";
  reels.forEach(r=>{
    const el = document.createElement("div");
    el.className = "reel";
    el.innerHTML = `<b>${r.userId?.username || 'Anon'}</b><p>${r.caption||""}</p>
      <video src="${(location.origin.includes("localhost")? "http://localhost:5000":"")}${r.videoUrl}" controls playsinline preload="metadata" style="width:100%"></video>
      <div><button onclick='likeReel("${r._id}")'>Beğen (${r.likes})</button></div>`;
    main.appendChild(el);
  });
}
window.likeReel = async (id)=>{
  await fetch(`${API}/reels/like`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ reelId: id })});
  loadReels();
};

// chat (simple UI + socket)
let currentChatId = null;
function openChat(){
  const main = document.getElementById("mainApp");
  main.innerHTML = `<div class="chatBox"><div id="messages" style="height:300px;overflow:auto"></div>
    <input id="msgText" placeholder="mesaj..."><input id="fileInput" type="file" accept="image/*,video/*,image/gif">
    <button id="sendBtn">Gönder</button></div>`;
  document.getElementById("sendBtn").addEventListener("click", async ()=>{
    const text = document.getElementById("msgText").value;
    const file = document.getElementById("fileInput").files[0];
    if(file){
      // delegate to extra.js upload helper
      window.sendMessageWithFile(currentUser._id || currentUser._id, file, text);
    } else {
      socket.emit("send_message", { chatId: currentUser._id || "global", senderId: currentUser._id, text, attachments: [] });
    }
    document.getElementById("msgText").value="";
  });

  socket.emit("join_room", currentUser._id || "global");
  socket.on("receive_message", (msg) => {
    const box = document.getElementById("messages");
    const d = document.createElement("div");
    d.textContent = `${msg.senderId}: ${msg.text}`;
    if(msg.attachments && msg.attachments.length){
      msg.attachments.forEach(a=>{
        if(a.mimetype.startsWith("image")) {
          d.innerHTML += `<div><img src="${(location.origin.includes("localhost")? "http://localhost:5000":"")}${a.url}" style="max-width:140px"></div>`;
        } else if(a.mimetype.startsWith("video")){
          d.innerHTML += `<div><video src="${(location.origin.includes("localhost")? "http://localhost:5000":"")}${a.url}" controls style="max-width:220px"></video></div>`;
        }
      });
    }
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
  });
}

// discover
async function loadDiscover(){ loadFeed(); }
