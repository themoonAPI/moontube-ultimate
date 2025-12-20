// Sample popular videos (embeds from youtube-nocookie – bypasses many filters)
const popularVideos = [
  {title: "Popular Music Mix 2025", id: "dQw4w9WgXcQ"},
  {title: "Gaming Highlights", id: "9bZkp7q19f0"},
  {title: "Relaxing Space Ambient", id: "DWcJFNfVjYE"},
  // Add 50+ more real video IDs for ultimate grid
];

const grid = document.getElementById('video-grid');

// Load popular
popularVideos.forEach(v => addVideo(v.title, v.id));

function addVideo(title, id) {
  const card = document.createElement('div');
  card.className = 'video-card';
  card.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}" allowfullscreen></iframe><p>${title}</p>`;
  grid.appendChild(card);
}

// Search
document.getElementById('search').oninput = e => {
  const query = e.target.value;
  if (query) {
    const id = extractID(query);
    if (id) addVideo("Searched Video", id);
  }
};

function extractID(url) {
  const reg = /(?:v=|youtu\.be\/|embed\/)([^&?#]+)/;
  const match = url.match(reg);
  return match ? match[1] : url.trim();
}

// Intro
document.getElementById('enter-btn').onclick = () => {
  document.getElementById('intro').classList.add('intro-fade');
  document.getElementById('bg-music').volume = 0.3;
  setTimeout(() => {
    document.getElementById('intro').style.display = 'none';
    document.getElementById('main').classList.remove('hidden');
  }, 3000);
};
