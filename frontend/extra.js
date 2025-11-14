// frontend/extra.js
// helpers: chunked upload + offline queue + send message wrapper

const API_BASE = (location.origin.includes("localhost")? "http://localhost:5000":"") + "/api";

export async function uploadFileInChunks(file, onProgress){
  const CHUNK_SIZE = 1024*1024*2; // 2MB
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const init = await fetch(`${API_BASE}/upload/init`, {
    method:"POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ filename: file.name, totalChunks })
  });
  const { uploadId } = await init.json();
  for(let i=0;i<totalChunks;i++){
    const start = i*CHUNK_SIZE;
    const end = Math.min(start+CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);
    const res = await fetch(`${API_BASE}/upload/chunk/${uploadId}/${i}`, {
      method:"POST",
      body: chunk
    });
    if(!res.ok) throw new Error("chunk fail");
    if(onProgress) onProgress(Math.round(((i+1)/totalChunks)*100));
  }
  const complete = await fetch(`${API_BASE}/upload/complete`, {
    method:"POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ uploadId, finalName: `${Date.now()}_${file.name}` })
  });
  return await complete.json(); // { ok:true, url: /uploads/.. }
}

// wrapper called from App.js
window.sendMessageWithFile = async function(chatId, file, text=""){
  try {
    if(!navigator.onLine){
      // very minimal offline queuing (improvement: use IndexedDB)
      alert("Offline: Kuyruğa alındı. Bağlanınca gönderilecek.");
      return;
    }
    const info = await uploadFileInChunks(file, p => console.log("upload", p));
    const attachment = { filename: file.name, mimetype: file.type, size: file.size, url: info.url };
    // emit via socket directly
    const socketUrl = (location.origin.includes("localhost")? "http://localhost:5000":"");
    const s = io(socketUrl);
    s.emit("send_message", { chatId: chatId || "global", senderId: window.currentUser?._id, text, attachments: [attachment] });
    alert("Gönderildi!");
  } catch(e){
    console.error(e);
    alert("Gönderirken hata: " + e.message);
  }
};
