let token = localStorage.getItem('token');
let currentUser = null;
let currentPage = 'home';

// Route mapping
const routes = {
  '/hub': 'home',
  '/account': 'account',
  '/history': 'history',
  '/friends': 'friends',
  '/create-room': 'create',
  '/schedule': 'schedule',
  '/settings': 'settings',
  '/login': 'login',
  '/join': 'join'
};

// ==================== ROUTER ====================

function router() {
  const path = window.location.pathname;

  // Not authenticated
  if (!token) {
    if (path !== '/login') {
      window.history.replaceState({}, '', '/login');
    }
    showLogin();
    return;
  }

  // Authenticated
  // Redirect login or root to hub
  if (path === '/login' || path === '/') {
    navigate('/hub');
    return;
  }

  showMainApp();

  // Determine page from route mapping, fallback to 'home'
  let page = routes[path];
  if (!page) {
    // Unknown route, redirect to hub
    navigate('/hub');
    return;
  }

  showPage(page);
}

function navigate(path) {
  window.history.pushState({}, '', path);
  router();
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Setup router for back/forward navigation
  window.addEventListener('popstate', router);
  
  // Clear messages on typing
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  if (usernameInput && passwordInput) {
    usernameInput.addEventListener('input', clearMessages);
    passwordInput.addEventListener('input', clearMessages);
  }
  
  // Check auth state and route
  if (token) {
    try {
      await loadCurrentUser();
      router();
    } catch {
      token = null;
      currentUser = null;
      localStorage.removeItem('token');
      router();
    }
  } else {
    router();
  }
});

function clearMessages() {
  document.getElementById('login-error').classList.add('hidden');
  document.getElementById('login-success').classList.add('hidden');
}

// ==================== AUTH ====================

async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('login-error');
  const successDiv = document.getElementById('login-success');

  // Clear previous messages
  errorDiv.classList.add('hidden');
  successDiv.classList.add('hidden');

  try {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      token = data.token;
      currentUser = {
        id: data.user_id || '',
        username: data.user,
        displayName: data.display_name,
        avatar: data.avatar,
      };
      localStorage.setItem('token', token);
      // Show success message briefly before entering app
      successDiv.textContent = 'Login successful!';
      successDiv.classList.remove('hidden');
      setTimeout(async () => {
        await loadCurrentUser();
        navigate('/hub');
      }, 500);
    } else {
      errorDiv.textContent = data.error || 'Login failed';
      errorDiv.classList.remove('hidden');
    }
  } catch (err) {
    errorDiv.textContent = 'Connection error';
    errorDiv.classList.remove('hidden');
  }
}

async function register() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('login-error');
  const successDiv = document.getElementById('login-success');

  // Clear previous messages
  errorDiv.classList.add('hidden');
  successDiv.classList.add('hidden');

  if (username.length < 3 || password.length < 6) {
    errorDiv.textContent = 'Username min 3 chars, password min 6';
    errorDiv.classList.remove('hidden');
    return;
  }

  try {
    const res = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, display_name: username }),
    });
    const data = await res.json();
    if (res.ok) {
      token = data.token;
      currentUser = { username: data.user };
      localStorage.setItem('token', token);
      successDiv.textContent = 'Account created! Login successful...';
      successDiv.classList.remove('hidden');
      setTimeout(async () => {
        await loadCurrentUser();
        navigate('/hub');
      }, 500);
    } else {
      errorDiv.textContent = data.error || 'Registration failed';
      errorDiv.classList.remove('hidden');
    }
  } catch (err) {
    errorDiv.textContent = 'Connection error';
    errorDiv.classList.remove('hidden');
  }
}

async function loadCurrentUser() {
  const res = await api('/api/me');
  if (!res.ok) throw new Error('Unauthorized');
  currentUser = await res.json();
  updateSidebar();
  fetchUsers();
}

function logout() {
  token = null;
  currentUser = null;
  localStorage.removeItem('token');
  navigate('/login');
}

function showLogin() {
  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('main-app').style.display = 'none';
}

function showMainApp() {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('main-app').style.display = 'flex';
}

// ==================== NAVIGATION ====================

function showPage(page) {
  // Update menu
  document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
  document.getElementById(`menu-${page}`).classList.add('active');

  // Update pages
  document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  currentPage = page;

  if (page === 'home') loadFeed();
  if (page === 'history') loadHistory();
  if (page === 'friends') loadFriends();
  if (page === 'schedule') loadScheduledVideos();
}

// ==================== API HELPERS ====================

async function api(endpoint, method = 'GET', body = null) {
  const opts = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(endpoint, opts);
  return res;
}

async function fetchUsers() {
  const res = await api('/api/users');
  if (!res.ok) {
    console.error('Failed to fetch users');
    return [];
  }
  const users = await res.json();
  return users || [];
}

// ==================== HOME FEED ====================

async function loadFeed() {
  const res = await api('/api/feed');
  const videos = await res.json();
  const list = document.getElementById('feed-list');
  list.innerHTML = '';

  if (videos.length === 0) {
    list.innerHTML = '<p style="color:#888">No public videos yet. Create a room and upload a video!</p>';
    return;
  }

  videos.forEach(v => {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.innerHTML = `
      <video src="${v.video_path}" controls></video>
      <div class="video-info">
        <div class="video-title">${escapeHTML(v.room_name)}</div>
        <div class="video-meta">
          <span>👤 ${escapeHTML(v.owner_name)}</span>
          <span>🕒 ${new Date(v.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    `;
    // Click to open room modal
    card.onclick = () => openRoomModal(v.room_id);
    list.appendChild(card);
  });
}

// ==================== HISTORY ====================

async function loadHistory() {
  const [watchRes, roomsRes] = await Promise.all([
    api('/api/history/watch'),
    api('/api/history/rooms'),
  ]);
  const watchHistory = await watchRes.json();
  const roomHistory = await roomsRes.json();

  // Watch history
  const watchList = document.getElementById('watch-history-list');
  watchList.innerHTML = '';
  if (watchHistory.length === 0) {
    watchList.innerHTML = '<p style="color:#888">No watch history</p>';
  } else {
    watchHistory.forEach(h => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `
        <div class="history-info">
          <div class="history-title">${escapeHTML(h.room_name)}</div>
          <div class="history-time">Watched at ${new Date(h.watched_at).toLocaleString()}</div>
        </div>
        <button class="btn" onclick="openRoomModal('${h.room_id}')">Rejoin</button>
      `;
      watchList.appendChild(div);
    });
  }

  // Room history
  const roomList = document.getElementById('room-history-list');
  roomList.innerHTML = '';
  if (roomHistory.length === 0) {
    roomList.innerHTML = '<p style="color:#888">No room history</p>';
  } else {
    roomHistory.forEach(r => {
      const div = document.createElement('div');
      div.className = 'room-item';
      div.innerHTML = `
        <div class="room-info">
          <div class="room-title">${escapeHTML(r.name)}</div>
          <div class="room-meta">${r.video_path ? 'Has video' : 'No video'}</div>
        </div>
        <button class="btn" onclick="openRoomModal('${r.id}')">Enter</button>
      `;
      roomList.appendChild(div);
    });
  }
}

// ==================== FRIENDS ====================

async function loadFriends() {
  const [friendsRes, pendingRes] = await Promise.all([
    api('/api/friends'),
    api('/api/friends/requests'),
  ]);
  const friends = await friendsRes.json();
  const pending = await pendingRes.json();

  // Friends list
  const friendsList = document.getElementById('friends-list');
  friendsList.innerHTML = '';
  if (friends.length === 0) {
    friendsList.innerHTML = '<p style="color:#888">No friends yet</p>';
  } else {
    friends.forEach(f => {
      const div = document.createElement('div');
      div.className = 'friend-item';
      div.innerHTML = `
        <div class="avatar">${escapeHTML(f.friend_name.charAt(0).toUpperCase())}</div>
        <div class="friend-info" style="flex:1;">
          <div>${escapeHTML(f.friend_name)}</div>
        </div>
      `;
      friendsList.appendChild(div);
    });
  }

  // Pending requests
  const pendingDiv = document.getElementById('friend-requests');
  pendingDiv.innerHTML = '';
  if (pending.length === 0) {
    pendingDiv.innerHTML = '<p style="color:#666; font-size:0.9em;">No pending requests</p>';
  } else {
    pending.forEach(req => {
      const div = document.createElement('div');
      div.className = 'friend-request';
      div.innerHTML = `
        <div>Request from: ${escapeHTML(req.from_user_id)}</div>
        <div class="request-actions">
          <button class="btn" onclick="acceptFriendRequest('${req.from_user_id}')">Accept</button>
          <button class="btn btn-outline" onclick="rejectFriendRequest('${req.from_user_id}')">Reject</button>
        </div>
      `;
      pendingDiv.appendChild(div);
    });
  }
}

async function sendFriendRequest() {
  const toUserId = document.getElementById('friend-user-id').value;
  if (!toUserId) return;

  const res = await api('/api/friends/request', 'POST', { to_user_id: toUserId });
  if (res.ok) {
    alert('Request sent');
    loadFriends();
  } else {
    const err = await res.text();
    alert('Error: ' + err);
  }
}

async function acceptFriendRequest(fromUserId) {
  const res = await api('/api/friends/accept', 'POST', { from_user_id: fromUserId });
  if (res.ok) loadFriends();
}

async function rejectFriendRequest(fromUserId) {
  const res = await api('/api/friends/reject', 'POST', { from_user_id: fromUserId });
  if (res.ok) loadFriends();
}

// ==================== CREATE ROOM ====================

async function createRoom() {
  const name = document.getElementById('new-room-name').value;
  const visibility = document.querySelector('input[name="visibility"]:checked').value;
  const msgDiv = document.getElementById('create-room-msg');

  const res = await api('/api/rooms', 'POST', { name, visibility });
  if (res.ok) {
    const room = await res.json();
    msgDiv.textContent = 'Room created! ID: ' + room.id;
    msgDiv.classList.remove('hidden');
    setTimeout(() => msgDiv.classList.add('hidden'), 3000);
    openRoomModal(room.id);
  } else {
    msgDiv.textContent = 'Failed to create room';
    msgDiv.classList.remove('hidden');
  }
}

// ==================== SCHEDULED VIDEOS ====================

async function loadScheduledVideos() {
  const res = await api('/api/schedule');
  if (!res.ok) {
    console.error('Failed to load scheduled videos');
    return;
  }
  const videos = await res.json();
  scheduledVideos = videos;
  const list = document.getElementById('scheduled-list');
  list.innerHTML = '';

  if (videos.length === 0) {
    list.innerHTML = '<p style="color:#888;">No scheduled videos</p>';
    return;
  }

  videos.forEach(v => {
    const card = document.createElement('div');
    card.className = `scheduled-video-card ${v.is_played ? 'played' : ''}`;
    card.innerHTML = `
      <div class="scheduled-info">
        <div>
          <div class="scheduled-title">${escapeHTML(v.title)}</div>
          <div class="scheduled-time">${new Date(v.scheduled_for).toLocaleString()}</div>
        </div>
        <div class="scheduled-actions">
          <button class="btn" onclick="playScheduledVideo('${v.id}')">▶️ Watch</button>
        </div>
      </div>
    `;
    list.appendChild(card);
  });
}

async function playScheduledVideo(id) {
  try {
    // Create a room for this video
    const roomRes = await api('/api/rooms', 'POST', { name: `Scheduled Video ${id.substring(0, 8)}` });
    if (roomRes.ok) {
      const room = await roomRes.json();
      // Update the scheduled video as played
      await fetch(`/api/schedule/${id}/play`, 'POST').catch(err => {
        console.error('Failed to mark as played:', err);
      });
      // Open room modal to play
      openRoomModal(room.id);
    } else {
      alert('Failed to create room');
    }
  } catch (err) {
    console.error('Error playing scheduled video:', err);
    alert('Failed to play video');
  }
}

// ==================== ROOM MODAL ====================

let currentRoom = null;
let ws = null;
let roomPoll = null;
let currentVideoTime = 0;
let videoDuration = 0;
let isPlaying = false;
let isPaused = false;
let videoUpdateInterval = null;
let scheduledVideos = [];

async function openRoomModal(roomId) {
  currentRoom = { id: roomId };
  const modal = document.getElementById('room-modal');
  modal.style.display = 'flex';

  // Join WebSocket
  if (ws) ws.close();
  const wsURL = `ws://${location.host}/ws?user_id=${currentUser.id}`;
  ws = new WebSocket(wsURL);

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'join', room_id: roomId, text: currentUser.display_name || currentUser.username }));
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'chat') {
      appendChatMessage(data.from, data.text, data.time);
    } else if (data.type === 'system') {
      appendSystemMessage(data.text);
    } else if (data.type === 'video_change') {
      const video = document.getElementById('modal-video');
      video.src = data.video;
      loadRoomInfo(roomId);
    }
  };

  ws.onclose = () => {
    appendSystemMessage('Disconnected from room');
    if (roomPoll) clearInterval(roomPoll);
  };

  // Load room info
  await loadRoomInfo(roomId);
  
  // Start polling room state
  if (roomPoll) clearInterval(roomPoll);
  roomPoll = setInterval(async () => {
    try {
      const res = await api(`/api/rooms/${roomId}`);
      if (res.ok) {
        const room = await res.json();
        updateRoomState(room);
      }
    } catch (err) {
      console.error('Polling error:', err);
    }
  }, 2000); // Poll every 2 seconds

  // Load room chat history
  try {
    const res = await api(`/api/rooms/${roomId}/messages`);
    const messages = await res.json();
    const chatDiv = document.getElementById('room-chat');
    chatDiv.innerHTML = '';
    messages.forEach(m => {
      appendChatMessage(m.sender_name || 'Unknown', m.content, '');
    });
  } catch (err) {
    console.error('Failed to load messages:', err);
  }
}

async function loadRoomInfo(roomId) {
  const res = await api(`/api/rooms/${roomId}`);
  if (res.ok) {
    const room = await res.json();
    const video = document.getElementById('modal-video');
    if (room.video_path) {
      video.src = room.video_path;
      video.load();
      updateRoomState(room);
    }
  }
}

function updateRoomState(room) {
  if (!currentRoom || currentRoom.id !== room.id) return;
  
  // Update playback state
  isPlaying = room.is_playing;
  isPaused = room.is_paused;
  currentVideoTime = room.current_time || 0;
  videoDuration = room.duration || 0;

  const video = document.getElementById('modal-video');
  if (video) {
    video.currentTime = currentVideoTime;
    
    if (isPlaying && !isPaused) {
      video.play();
    } else if (!isPlaying) {
      video.pause();
    }
  }

  updatePlayPauseButtons();
  updateVideoTimestamps();
}

function updateRoomUsers() {
  // Update presence display - this would need WebSocket message from server
  const presenceDiv = document.getElementById('room-connection');
  if (presenceDiv) {
    presenceDiv.textContent = 'Connected: 1';
  }
}

function closeRoomModal() {
  const modal = document.getElementById('room-modal');
  modal.style.display = 'none';
  if (ws) ws.close();
  if (roomPoll) clearInterval(roomPoll);
  if (videoUpdateInterval) clearInterval(videoUpdateInterval);
  currentRoom = null;
}

// Video controls
async function togglePlay() {
  if (!currentRoom) return;

  const video = document.getElementById('modal-video');
  if (video.paused) {
    try {
      const res = await api(`/api/rooms/${currentRoom.id}/play`, 'POST');
      if (res.ok) {
        const room = await res.json();
        updateRoomState(room);
      }
    } catch (err) {
      console.error('Play error:', err);
    }
  } else {
    try {
      const res = await api(`/api/rooms/${currentRoom.id}/pause`, 'POST');
      if (res.ok) {
        const room = await res.json();
        updateRoomState(room);
      }
    } catch (err) {
      console.error('Pause error:', err);
    }
  }
}

function seekTo(percent) {
  if (!currentRoom) return;
  const video = document.getElementById('modal-video');
  if (!videoDuration) return;
  
  const newTime = (percent / 100) * videoDuration;
  api(`/api/rooms/${currentRoom.id}/seek`, 'POST', { current_time: newTime })
    .then(res => res.json())
    .then(room => updateRoomState(room))
    .catch(err => console.error('Seek error:', err));
}

function updatePlayPauseButtons() {
  const playBtn = document.getElementById('play-btn');
  const pauseBtn = document.getElementById('pause-btn');
  
  if (playBtn && pauseBtn) {
    if (isPlaying && !isPaused) {
      playBtn.style.display = 'none';
      pauseBtn.style.display = 'inline';
    } else {
      playBtn.style.display = 'inline';
      pauseBtn.style.display = 'none';
    }
  }
}

function updateVideoTimestamps() {
  const video = document.getElementById('modal-video');
  const timestampSpan = document.getElementById('video-timestamp');
  const durationSpan = document.getElementById('video-duration');
  
  if (video) {
    const currentTime = video.currentTime || 0;
    const duration = video.duration || 0;
    
    timestampSpan.textContent = formatTime(currentTime);
    durationSpan.textContent = formatTime(duration);
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const hrs = Math.floor(mins / 60);
  return `${hrs > 0 ? hrs + ':' : ''}${mins % 60}:${secs.toString().padStart(2, '0')}`;
}

// Video element time update
const videoElement = document.getElementById('modal-video');
if (videoElement) {
  videoElement.addEventListener('timeupdate', updateVideoTimestamps);
}

function sendRoomMessage() {
  const input = document.getElementById('room-chat-input');
  const text = input.value.trim();
  if (!text || !ws) return;

  ws.send(JSON.stringify({ type: 'chat', text: text }));
  input.value = '';
}

// Invite
let currentInviteCode = '';

async function generateInvite() {
  if (!currentRoom || !currentRoom.id) return;
  const res = await api(`/api/rooms/${currentRoom.id}/invite`, 'POST');
  if (res.ok) {
    const data = await res.json();
    currentInviteCode = data.code;
    document.getElementById('invite-code-text').textContent = data.code;
    appendSystemMessage(`New invite code generated: ${data.code}`);
  }
}

function copyInviteCode() {
  const code = currentInviteCode || document.getElementById('invite-code-text').textContent;
  if (code && code !== '-') {
    navigator.clipboard.writeText(code).then(() => {
      alert('Invite code copied!');
    });
  }
}

async function joinWithInvite() {
  const code = document.getElementById('invite-code-input').value.trim();
  const msgDiv = document.getElementById('join-msg');
  if (!code) {
    msgDiv.textContent = 'Enter invite code';
    msgDiv.classList.remove('hidden');
    return;
  }

  const res = await api('/api/invite/accept', 'POST', { code });
  if (res.ok) {
    const data = await res.json();
    msgDiv.textContent = 'Joined room!';
    msgDiv.style.color = '#4ade80';
    msgDiv.classList.remove('hidden');
    openRoomModal(data.room_id);
    showPage('home'); // or keep on join page? openRoomModal shows modal
  } else {
    const err = await res.text();
    msgDiv.textContent = 'Error: ' + err;
    msgDiv.style.color = '#e94560';
    msgDiv.classList.remove('hidden');
  }
}

function appendChatMessage(from, text, time) {
  const chat = document.getElementById('room-chat');
  const div = document.createElement('div');
  div.style.cssText = 'margin: 8px 0; padding: 8px; background: #1a1a2e; border-radius: 6px;';
  div.innerHTML = `<strong>${escapeHTML(from)}</strong> <span style="color:#888; font-size:0.8em;">${time}</span><div>${escapeHTML(text)}</div>`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function appendSystemMessage(text) {
  const chat = document.getElementById('room-chat');
  const div = document.createElement('div');
  div.style.cssText = 'text-align:center; color:#888; font-size:0.9em; margin:10px 0; font-style:italic;';
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// ==================== PROFILE ====================

function updateProfile() {
  const displayName = document.getElementById('display-name').value;
  const avatarURL = document.getElementById('avatar-url').value;
  const msg = document.getElementById('profile-msg');

  api('/api/profile', 'POST', { display_name: displayName, avatar_url: avatarURL })
    .then(res => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error('Failed');
      }
    })
    .then(user => {
      currentUser = user;
      localStorage.setItem('user', JSON.stringify(user));
      updateSidebar();
      msg.textContent = 'Profile updated!';
      msg.style.color = '#4ade80';
      msg.classList.remove('hidden');
      setTimeout(() => msg.classList.add('hidden'), 3000);
    })
    .catch(() => {
      msg.textContent = 'Update failed';
      msg.style.color = '#e94560';
      msg.classList.remove('hidden');
    });
}

// ==================== UTILS ====================

function updateSidebar() {
  document.getElementById('sidebar-username').textContent = currentUser ? currentUser.username : 'Guest';
  document.getElementById('sidebar-display').textContent = currentUser ? (currentUser.display_name || '') : '';
  document.getElementById('display-name').value = currentUser ? (currentUser.display_name || '') : '';
  document.getElementById('avatar-url').value = currentUser ? (currentUser.avatar_url || '') : '';
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Settings
function saveSettings() {
  const msg = document.getElementById('settings-msg');
  msg.textContent = 'Settings saved!';
  msg.style.color = '#4ade80';
  msg.classList.remove('hidden');
  setTimeout(() => msg.classList.add('hidden'), 3000);
}

// Enter key handlers
document.getElementById('username')?.addEventListener('keypress', e => { if (e.key === 'Enter') login(); });
document.getElementById('password')?.addEventListener('keypress', e => { if (e.key === 'Enter') login(); });
document.getElementById('room-chat-input')?.addEventListener('keypress', e => { if (e.key === 'Enter') sendRoomMessage(); });
document.getElementById('friend-user-id')?.addEventListener('keypress', e => { if (e.key === 'Enter') sendFriendRequest(); });
