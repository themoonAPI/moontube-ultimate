// Ultimate MoonTube script.js – full version with intro, search, popular videos, and featured creators (CoryxKenshin, Dhar Mann, SML + more)

const popularVideos = [
  {title: "Relaxing Space Ambient", id: "DWcJFNfVjYE"},
  {title: "Epic Gaming Moments", id: "9bZkp7q19f0"},
  {title: "Funny Compilation", id: "dQw4w9WgXcQ"},
  // Add more popular video IDs if you want
];

const featuredChannels = [
  {name: "CoryxKenshin", channelId: "UCiYcA0gJzg855iFcJ2klOkQ"},
  {name: "Dhar Mann", channelId: "UC_hK9fOxyy_TM8FJGXIyG8Q"},
  {name: "SML", channelId: "UCnSWkrRWNQWNhDusoWr_HXQ"},
  {name: "MrBeast", channelId: "UCX6OQ3DkcsbYNE6H8uQQuVA"},
  {name: "Markiplier", channelId: "UC7_YxT-KID8kRbqZo7MyscQ"},
  {name: "jacksepticeye", channelId: "UCYzPXprvlQOYHI0O0dF9gFg"},
  {name: "PewDiePie", channelId: "UC-lHJZR3Gqxm24_Vd_AJ5Yw"},
  {name: "Dream", channelId: "UCTkXRDQl0luXxVQrRQvusuA"},
  {name: "SSSniperWolf", channelId: "UCpB959t8iPrxQWj7G6n0CTw"},
  {name: "DashieGames", channelId: "UCljYHCQ9FrJ6Qcn0Fme0j6Q"},
  {name: "Berleezy", channelId: "UCpB959t8iPrxQWj7G6n0CTw"}, // placeholder, add real if different
  // Add more creators here for 1000+ later
];

const grid = document.getElementById('video-grid');

// Load popular videos first
popularVideos.forEach(v => addVideo(v.title, v.id));

// Load recent from featured channels
featuredChannels.forEach(channel => loadRecentFromChannel(channel.channelId, channel.name));

async function loadRecentFromChannel(channelId, channelName) {
  const rss = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const proxy = "https://api.allorigins.win/raw?url=";
  try {
    const res = await fetch(proxy + encodeURIComponent(rss));
    const text = await res.text();
    const xml = new DOMParser().parseFromString(text, "text/xml");
    const entries = xml.querySelectorAll("entry");
    Array.from(entries).slice(0, 5).forEach(entry => { // 5 recent per channel
      const title = entry.querySelector("title").textContent;
      const videoId = entry.querySelector("id").textContent.split(":").pop();
      addVideo(`${title} — ${channelName}`, videoId);
    });
  } catch (e) {
    console.log("Failed loading " + channelName);
  }
}

function addVideo(title, id) {
  const card = document.createElement('div');
  card.className = 'video-card';
  card.innerHTML = `
    <iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=0&rel=0" allowfullscreen></iframe>
    <p>${title}</p>
  `;
  grid.appendChild(card);
}

// Search any video
document.getElementById('search').oninput = e => {
  const query = e.target.value.trim();
  if (query) {
    const id = extractID(query);
    if (id) {
      addVideo("Searched: " + query, id);
    }
  }
};

function extractID(input) {
  const reg = /(?:v=|youtu\.be\/|embed\/|shorts\/)([^&?#]+)/;
  const match = input.match(reg);
  return match ? match[1] : input.trim();
}

// Peaceful intro logic
document.getElementById('enter-btn').addEventListener('click', () => {
  const intro = document.getElementById('intro');
  intro.classList.add('intro-fade');
  const music = document.getElementById('bg-music');
  if (music) {
    music.volume = 0.3;
    music.play();
  }
  setTimeout(() => {
    intro.style.display = 'none';
    document.getElementById('main').classList.remove('hidden');
  }, 3000);
});
