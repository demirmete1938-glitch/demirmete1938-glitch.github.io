const root = document.getElementById("root");
let currentUserId = "KULLANICI_ID"; 
const adminPassword = "192892828#+#??#?#(#¿(##?(#+2928292829)";

// Animasyon fonksiyonu
function animateElement(el,type){
  if(type==="fade"){ el.classList.add("fade-enter"); setTimeout(()=>el.classList.add("fade-enter-active"),10);}
  if(type==="slide-left"){ el.classList.add("slide-left"); setTimeout(()=>el.classList.add("slide-left-active"),10);}
}

// Login ekranı
function showLoginScreen(){
  root.innerHTML = `
    <div style="text-align:center;margin-top:50px;">
      <h1>MeteGram Giriş</h1>
      <input id="username" placeholder="Kullanıcı Adı"><br><br>
      <input id="password" type="password" placeholder="Şifre"><br><br>
      <button id="loginBtn" class="button">Giriş Yap</button>
      <p style="margin-top:20px; font-size:14px;">
        Kurucu musun? <span id="adminLink" style="color:#3897f0; cursor:pointer;">Buyur kral, geç gir</span>
      </p>
    </div>
  `;

  document.getElementById("loginBtn").onclick = async ()=>{
    const username=document.getElementById("username").value;
    const password=document.getElementById("password").value;
    const res = await fetch("http://localhost:5000/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username,password})});
    if(res.ok){ const user = await res.json(); currentUserId = user._id; showUserInterface();}
    else alert("Kullanıcı adı veya şifre hatalı kral!");
  };

  document.getElementById("adminLink").onclick = ()=> showAdminLogin();
}

// Kullanıcı arayüzü
function showUserInterface(){
  root.innerHTML=`
    <div class="navbar"><h1>MeteGram</h1><div>🔔 ✉️</div></div>
    <div id="storyContainer"></div>
    <div id="profile"></div>
    <div class="feed" id="feed"></div>
  `;
  animateElement(root,"fade");
  loadStories(); loadProfile(); loadFeed(); loadExploreButton();
}

// Admin login
function showAdminLogin(){
  const pwd = prompt("Kurucu şifresini gir kral:");
  if(pwd===adminPassword) showAdminPanel();
  else alert("Şifre yanlış kral!");
}

// Admin paneli
function showAdminPanel(){
  root.innerHTML = `
    <h1>MeteGram Kurucu Paneli</h1>
    <div><input id="userId" placeholder="Kullanıcı ID"><button id="deleteUser" class="button">Kullanıcıyı Sil</button></div>
    <div><input id="targetId" placeholder="Kullanıcı ID"><input id="followers" placeholder="Takipçi miktarı"><button id="boostFollowers" class="button">Takipçi Bas</button></div>
  `;
  animateElement(root,"slide-left");
  document.getElementById("deleteUser").onclick = async ()=>{
    const userId = document.getElementById("userId").value;
    await fetch("http://localhost:5000/founder/delete-user",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId,role:"founder"})});
    alert("Kullanıcı silindi kral!");
  };
  document.getElementById("boostFollowers").onclick = async ()=>{
    const targetId=document.getElementById("targetId").value;
    const amount=Number(document.getElementById("followers").value);
    await fetch("http://localhost:5000/founder/boost-followers",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:targetId,amount,role:"founder"})});
    alert("Takipçi artırıldı kral!");
  };
}

// Profile
async function loadProfile(){
  const profileEl=document.getElementById("profile");
  const res=await fetch(`http://localhost:5000/login`); // basit demo
  profileEl.innerHTML=`<h3>Kullanıcı: ${currentUserId}</h3>`;
}

// Feed
async function loadFeed(){
  const feedEl=document.getElementById("feed");
  const res=await fetch("http://localhost:5000/feed");
  const posts=await res.json();
  feedEl.innerHTML="";
  posts.forEach(p=>{
    const postEl=document.createElement("div");
    postEl.className="post";
    postEl.style.opacity=0; postEl.style.transform="translateY(20px)"; postEl.style.transition="all 0.4s ease";
    postEl.innerHTML=`<div class="post-header"><strong>${p.userId.username}</strong></div><img src="${p.image}" alt="post"><div class="post-footer">❤️ ${p.likes}</div>`;
    feedEl.appendChild(postEl);
    setTimeout(()=>{postEl.style.opacity=1; postEl.style.transform="translateY(0)";},50);
  });
}

// Story
async function loadStories(){
  const container=document.getElementById("storyContainer");
  const res=await fetch("http://localhost:5000/story/feed");
  const stories=await res.json();
  container.innerHTML="";
  stories.forEach(s=>{
    const storyEl=document.createElement("div");
    storyEl.style.minWidth="60px"; storyEl.style.marginRight="10px"; storyEl.style.textAlign="center";
    storyEl.style.scrollSnapAlign="center"; storyEl.style.transition="transform 0.3s, box-shadow 0.3s";
    storyEl.innerHTML=`<img src="${s.image}" style="width:60px;height:60px;border-radius:50%;border:2px solid #3897f0"><p style="font-size:12px">${s.userId.username}</p>`;
    storyEl.onmouseenter=()=>{storyEl.style.transform="scale(1.1)"; storyEl.style.boxShadow="0 4px 8px rgba(0,0,0,0.2)";};
    storyEl.onmouseleave=()=>{storyEl.style.transform="scale(1)"; storyEl.style.boxShadow="none";};
    container.appendChild(storyEl);
  });
}

// Keşfet butonu
function loadExploreButton(){
  const btn=document.createElement("button");
  btn.textContent="Keşfet"; btn.className="button";
  btn.onclick=async ()=>{
    const res=await fetch("http://localhost:5000/explore");
    const posts=await res.json();
    const feedEl=document.getElementById("feed");
    feedEl.innerHTML="<h2>Keşfet</h2>";
    posts.forEach(p=>{
      const postEl=document.createElement("div"); postEl.className="post";
      postEl.style.opacity=0; postEl.style.transform="translateY(20px)"; postEl.style.transition="all 0.4s ease";
      postEl.innerHTML=`<div class="post-header"><strong>${p.userId.username}</strong></div><img src="${p.image}" alt="post"><div class="post-footer">❤️ ${p.likes}</div>`;
      feedEl.appendChild(postEl);
      setTimeout(()=>{postEl.style.opacity=1; postEl.style.transform="translateY(0)";},50);
    });
  };
  document.querySelector(".navbar div").appendChild(btn);
}

// Başlangıç
showLoginScreen();
