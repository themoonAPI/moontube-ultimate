function extractID(input) {
  const reg = /(?:v=|youtu\.be\/|embed\/|shorts\/)([^&?#]+)/;
  const match = input.match(reg);
  return match ? match[1] : input.trim();
}

const player = document.getElementById('player');

document.getElementById('play-btn').addEventListener('click', playVideo);

document.getElementById('search-input').addEventListener('keypress', e => {
  if (e.key === 'Enter') playVideo();
});

function playVideo() {
  const input = document.getElementById('search-input').value.trim();
  const id = extractID(input);
  if (id) {
    player.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&enablejsapi=1`;
  }
}

// Add control buttons dynamically after player loads
player.onload = () => {
  if (!document.getElementById('fullscreen-btn')) {
    const controls = document.createElement('div');
    controls.className = 'video-controls';
    controls.innerHTML = `
      <button id="fullscreen-btn">Full Screen</button>
      <button id="exit-fullscreen" class="hidden">Exit Full Screen</button>
      <button id="close-video">Close Video</button>
    `;
    document.querySelector('.player-container').appendChild(controls);

    document.getElementById('fullscreen-btn').onclick = () => {
      player.requestFullscreen();
      document.getElementById('fullscreen-btn').classList.add('hidden');
      document.getElementById('exit-fullscreen').classList.remove('hidden');
    };

    document.getElementById('exit-fullscreen').onclick = () => {
      document.exitFullscreen();
      document.getElementById('exit-fullscreen').classList.add('hidden');
      document.getElementById('fullscreen-btn').classList.remove('hidden');
    };

    document.getElementById('close-video').onclick = () => {
      player.src = '';
      controls.remove();
    };
  }
};

// Intro logic
document.getElementById('enter-btn').addEventListener('click', () => {
  document.getElementById('intro').classList.add('intro-fade');
  const music = document.getElementById('bg-music');
  if (music) {
    music.volume = 0.3;
    music.play();
  }
  setTimeout(() => {
    document.getElementById('intro').style.display = 'none';
    document.getElementById('main').classList.remove('hidden');
  }, 3000);
});
