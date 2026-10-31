
const $ = (id) => document.getElementById(id);

const player = $("player");
const searchInput = $("search-input");
const searchForm = $("search-form");

let currentVideo = null;

let queue = loadData("moontube_queue");
let favorites = loadData("moontube_favorites");
let history = loadData("moontube_history");

let musicEnabled = true;

function loadData(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function saveData() {
    localStorage.setItem("moontube_queue", JSON.stringify(queue));
    localStorage.setItem("moontube_favorites", JSON.stringify(favorites));
    localStorage.setItem("moontube_history", JSON.stringify(history));
}

// VIDEO URL EXTRACTION

function extractID(input) {
    input = input.trim();

    if (!input) return null;

    let id = null;

    try {
        if (input.includes("youtube.com") || input.includes("youtu.be")) {
            const url = new URL(
                input.startsWith("http") ? input : `https://${input}`
            );

            if (url.hostname === "youtu.be") {
                id = url.pathname.split("/")[1];
            } else if (
                ["youtube.com", "www.youtube.com", "m.youtube.com",
                 "youtube-nocookie.com", "www.youtube-nocookie.com"].includes(url.hostname)
            ) {
                id = url.searchParams.get("v") ||
                    url.pathname.match(/\/(?:embed|shorts|live)\/([^/]+)/)?.[1];
            }
        } else {
            id = input;
        }
    } catch {
        return null;
    }

    return /^[a-zA-Z0-9_-]{11}$/.test(id || "") ? id : null;
}

// NOTIFICATIONS

function notify(message) {
    const notification = $("notification");
    const text = $("notification-message");

    if (!notification || !text) return;

    text.textContent = message;
    notification.classList.remove("hidden");

    clearTimeout(notify.timer);

    notify.timer = setTimeout(() => {
        notification.classList.add("hidden");
    }, 2800);
}

// STATUS

function setStatus(message) {
    const status = $("connection-text");
    if (status) status.textContent = message;
}

// VIDEO PLAYBACK

function playVideo(input = searchInput.value) {
    const id = extractID(input);

    if (!id) {
        notify("Please enter a valid YouTube video URL or ID.");
        searchInput.focus();
        return;
    }

    currentVideo = id;

    player.src =
        `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&enablejsapi=1`;

    $("player-placeholder").classList.add("hidden");
    $("player-loading").classList.remove("hidden");

    $("video-title").textContent = `YouTube Video ${id}`;
    $("video-description").textContent = "Currently playing on MoonTube.";

    setStatus("Loading video");

    addToHistory(id);
    updateFavoriteButton();

    searchInput.value = "";

    notify("Loading your video.");
}

searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    playVideo();
});

player.addEventListener("load", () => {
    if (!currentVideo) return;

    $("player-loading").classList.add("hidden");
    setStatus("Video loaded");
});

// VIDEO CONTROLS

const fullscreenButton = document.createElement("button");
fullscreenButton.id = "fullscreen-btn";
fullscreenButton.className = "action-button";
fullscreenButton.textContent = "Full Screen";

const closeButton = document.createElement("button");
closeButton.id = "close-video";
closeButton.className = "action-button";
closeButton.textContent = "Close Video";

$("favorite-btn").parentElement.append(fullscreenButton, closeButton);

fullscreenButton.addEventListener("click", async () => {
    const wrapper = document.querySelector(".player-wrapper");

    try {
        if (!document.fullscreenElement) {
            await wrapper.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    } catch {
        notify("Fullscreen is unavailable.");
    }
});

document.addEventListener("fullscreenchange", () => {
    fullscreenButton.textContent = document.fullscreenElement
        ? "Exit Full Screen"
        : "Full Screen";
});

closeButton.addEventListener("click", () => {
    player.src = "";
    currentVideo = null;

    $("player-loading").classList.add("hidden");
    $("player-placeholder").classList.remove("hidden");

    $("video-title").textContent = "Nothing playing yet";
    $("video-description").textContent =
        "Your selected video information will appear here.";

    setStatus("Ready to watch");
    updateFavoriteButton();

    notify("Video closed.");
});

// HISTORY

function addToHistory(id) {
    history = history.filter(video => video !== id);

    history.unshift(id);
    history = history.slice(0, 30);

    saveData();
    renderLists();
}

// FAVORITES

function updateFavoriteButton() {
    if (!currentVideo) {
        $("favorite-btn").textContent = "Add to Favorites";
        return;
    }

    $("favorite-btn").textContent = favorites.includes(currentVideo)
        ? "Remove Favorite"
        : "Add to Favorites";
}

$("favorite-btn").addEventListener("click", () => {
    if (!currentVideo) {
        notify("Play a video first.");
        return;
    }

    if (favorites.includes(currentVideo)) {
        favorites = favorites.filter(id => id !== currentVideo);
        notify("Removed from favorites.");
    } else {
        favorites.unshift(currentVideo);
        notify("Added to favorites.");
    }

    saveData();
    updateFavoriteButton();
    renderLists();
});

// WATCH QUEUE

$("queue-add-btn").addEventListener("click", () => {
    if (!currentVideo) {
        notify("Play a video first.");
        return;
    }

    if (queue.includes(currentVideo)) {
        notify("This video is already in your queue.");
        return;
    }

    queue.push(currentVideo);

    saveData();
    renderLists();

    notify("Added to your watch queue.");
});

$("clear-queue-btn").addEventListener("click", () => {
    queue = [];
    saveData();
    renderLists();
    notify("Watch queue cleared.");
});

$("clear-history-btn").addEventListener("click", () => {
    history = [];
    saveData();
    renderLists();
    notify("Viewing history cleared.");
});

// LIST RENDERING

function createVideoCard(id, collection) {
    const card = document.createElement("div");
    card.className = "video-card";

    const thumbnail = document.createElement("img");
    thumbnail.src = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
    thumbnail.alt = "Video thumbnail";
    thumbnail.loading = "lazy";

    const details = document.createElement("div");
    details.className = "video-card-details";

    const title = document.createElement("h3");
    title.textContent = `YouTube Video ${id}`;

    const description = document.createElement("p");
    description.textContent = "YouTube video";

    details.append(title, description);

    const actions = document.createElement("div");
    actions.className = "video-card-actions";

    const watchButton = document.createElement("button");
    watchButton.textContent = "Watch";
    watchButton.className = "action-button";

    watchButton.addEventListener("click", () => {
        playVideo(id);
        showPage("home-view");
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.className = "action-button";

    removeButton.addEventListener("click", () => {
        if (collection === "queue") {
            queue = queue.filter(video => video !== id);
        } else if (collection === "favorites") {
            favorites = favorites.filter(video => video !== id);
        } else {
            history = history.filter(video => video !== id);
        }

        saveData();
        renderLists();
        updateFavoriteButton();

        notify("Video removed.");
    });

    actions.append(watchButton, removeButton);
    card.append(thumbnail, details, actions);

    return card;
}

function renderCollection(elementId, collection, type) {
    const container = $(elementId);

    if (!container) return;

    container.replaceChildren();

    if (collection.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-state";

        const heading = document.createElement("h3");
        heading.textContent = "Nothing here yet";

        const description = document.createElement("p");
        description.textContent = "Videos you save will appear here.";

        empty.append(heading, description);
        container.append(empty);
        return;
    }

    collection.forEach(id => {
        container.append(createVideoCard(id, type));
    });
}

function renderLists() {
    renderCollection("queue-list", queue, "queue");
    renderCollection("queue-page-list", queue, "queue");

    renderCollection("recent-list", history, "history");
    renderCollection("history-page-list", history, "history");

    renderCollection("favorites-list", favorites, "favorites");
}

// NAVIGATION

const pages = {
    "home-view": "home-btn",
    "explore-view": "explore-btn",
    "favorites-view": "favorites-btn",
    "history-view": "recent-btn",
    "queue-view": "queue-btn"
};

function showPage(pageId) {
    document.querySelectorAll(".page-view").forEach(page => {
        page.classList.remove("active-view");
    });

    document.querySelectorAll(".sidebar-link").forEach(button => {
        button.classList.remove("active");
    });

    const page = $(pageId);

    if (page) {
        page.classList.add("active-view");
    }

    const button = $(pages[pageId]);

    if (button) {
        button.classList.add("active");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

Object.entries(pages).forEach(([pageId, buttonId]) => {
    $(buttonId)?.addEventListener("click", () => {
        showPage(pageId);
    });
});

$("home-btn").addEventListener("click", () => {
    showPage("home-view");
});

$("hero-search-btn").addEventListener("click", () => {
    searchInput.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
});

$("explore-play-btn").addEventListener("click", () => {
    searchInput.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// SIDEBAR SHORTCUTS

$("home-btn").addEventListener("click", () => {
    showPage("home-view");
});

$("recent-btn").addEventListener("click", () => {
    showPage("history-view");
});

$("queue-btn").addEventListener("click", () => {
    showPage("queue-view");
});

// MUSIC

const music = $("bg-music");

$("enter-btn").addEventListener("click", async () => {
    const intro = $("intro");

    intro.classList.add("intro-fade");

    if (music) {
        music.volume = 0.3;

        try {
            await music.play();
        } catch {
            musicEnabled = false;
        }
    }

    setTimeout(() => {
        intro.style.display = "none";
        $("main").classList.remove("hidden");
    }, 1200);
});

$("music-toggle").addEventListener("click", () => {
    if (!music) return;

    if (music.paused) {
        music.play().then(() => {
            musicEnabled = true;
            $("music-toggle").textContent = "Music On";
        }).catch(() => {
            notify("Music could not be played.");
        });
    } else {
        music.pause();
        musicEnabled = false;
        $("music-toggle").textContent = "Music Off";
    }
});

// INITIALIZATION

renderLists();
updateFavoriteButton();
setStatus("Ready to watch");

