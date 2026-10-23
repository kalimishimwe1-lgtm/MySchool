/* =========================================================
   NOCTURNE
   MAIN JAVASCRIPT
========================================================= */


/* =========================================================
   YOUTUBE API KEY
========================================================= */

/*
   PUT YOUR YOUTUBE DATA API v3 KEY HERE.

   Example:

   const YOUTUBE_API_KEY = "AIzaSy........";

   DO NOT SEND YOUR KEY TO ME.
*/

const YOUTUBE_API_KEY =
    "PASTE_YOUR_API_KEY_HERE";


/* =========================================================
   ADMIN DETAILS
========================================================= */

/*
   PUT THE SAME EMAIL AND PASSWORD HERE
   THAT YOU WILL ENTER IN THE ADMIN WINDOW.

   Example:

   const ADMIN_ACCOUNTS = [
       {
           email: "myemail@gmail.com",
           password: "MyPassword123"
       }
   ];
*/

const ADMIN_ACCOUNTS = [

    {
        email: "YOUR_ADMIN_EMAIL@example.com",
        password: "YOUR_ADMIN_PASSWORD"
    }

];


const ADMIN_CHEAT_CODE =
    "DAMON THE PATRIOT";


/* =========================================================
   TRENDING REGIONS
========================================================= */

const TRENDING_REGIONS = [
    "US",
    "GB",
    "KR",
    "JP",
    "BR",
    "NG",
    "RW"
];


/* =========================================================
   STATE
========================================================= */

let currentUser = null;

let adminLoggedIn = false;

let youtubePlayer = null;

let youtubeReady = false;

let currentSong = null;

let currentQueue = [];

let currentSongIndex = -1;

let trendingSongs = [];

let searchResults = [];

let adminSongs = [];

let progressTimer = null;


/* =========================================================
   DOM SHORTCUT
========================================================= */

function $(id) {
    return document.getElementById(id);
}


/* =========================================================
   DOM ELEMENTS
========================================================= */

const loginScreen =
    $("loginScreen");

const app =
    $("app");

const loginTab =
    $("loginTab");

const registerTab =
    $("registerTab");

const loginForm =
    $("loginForm");

const registerForm =
    $("registerForm");

const loginEmail =
    $("loginEmail");

const loginPassword =
    $("loginPassword");

const registerName =
    $("registerName");

const registerEmail =
    $("registerEmail");

const registerPassword =
    $("registerPassword");

const loginMessage =
    $("loginMessage");

const userButton =
    $("userButton");

const userInitial =
    $("userInitial");

const userMenu =
    $("userMenu");

const userNameDisplay =
    $("userNameDisplay");

const logoutButton =
    $("logoutButton");

const searchInput =
    $("searchInput");

const searchButton =
    $("searchButton");

const resultsGrid =
    $("resultsGrid");

const trendingGrid =
    $("trendingGrid");

const playerCover =
    $("playerCover");

const playerTitle =
    $("playerTitle");

const playerArtist =
    $("playerArtist");

const previousButton =
    $("previousButton");

const playButton =
    $("playButton");

const nextButton =
    $("nextButton");

const currentTime =
    $("currentTime");

const duration =
    $("duration");

const progressBar =
    $("progressBar");

const volumeBar =
    $("volumeBar");

const youtubePlayerContainer =
    $("youtubePlayerContainer");

const adminTrigger =
    $("adminTrigger");

const adminModal =
    $("adminModal");

const closeAdminModal =
    $("closeAdminModal");

const adminCodeForm =
    $("adminCodeForm");

const adminMessage =
    $("adminMessage");

const adminDashboard =
    $("adminDashboard");

const closeAdminDashboard =
    $("closeAdminDashboard");

const addSongButton =
    $("addSongButton");

const managePostsButton =
    $("managePostsButton");

const musicStudioButton =
    $("musicStudioButton");

const videoStudioButton =
    $("videoStudioButton");

const addSongModal =
    $("addSongModal");

const closeSongModal =
    $("closeSongModal");

const addSongForm =
    $("addSongForm");


/* =========================================================
   HELPERS
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function normalizeEmail(email) {

    return String(email || "")
        .trim()
        .toLowerCase();
}


function hasYouTubeKey() {

    return (
        YOUTUBE_API_KEY &&
        YOUTUBE_API_KEY.trim() !== "" &&
        YOUTUBE_API_KEY !==
            "PASTE_YOUR_API_KEY_HERE"
    );
}


function youtubeThumbnail(videoId) {

    return (
        "https://i.ytimg.com/vi/" +
        videoId +
        "/hqdefault.jpg"
    );
}


function showToast(message) {

    let toast =
        $("nocturneToast");

    if (!toast) {

        toast =
            document.createElement("div");

        toast.id =
            "nocturneToast";

        Object.assign(
            toast.style,
            {
                position: "fixed",
                left: "50%",
                bottom: "110px",
                transform: "translateX(-50%)",
                zIndex: "99999",
                padding: "12px 20px",
                background: "#151515",
                color: "#fff",
                border: "1px solid rgba(255,255,255,.15)",
                borderRadius: "10px",
                fontFamily: "Poppins, sans-serif",
                fontSize: "12px",
                boxShadow: "0 15px 50px rgba(0,0,0,.6)",
                opacity: "0",
                transition: "opacity .25s"
            }
        );

        document.body.appendChild(toast);
    }

    toast.textContent =
        message;

    toast.style.opacity =
        "1";

    clearTimeout(
        toast._timer
    );

    toast._timer =
        setTimeout(
            () => {
                toast.style.opacity = "0";
            },
            3500
        );
}


/* =========================================================
   LOGIN / REGISTER
========================================================= */

function getUsers() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "nocturneUsers"
            )
        ) || [];

    } catch {

        return [];
    }
}


function saveUsers(users) {

    localStorage.setItem(
        "nocturneUsers",
        JSON.stringify(users)
    );
}


async function hashPassword(password) {

    const data =
        new TextEncoder()
            .encode(password);

    const buffer =
        await crypto.subtle.digest(
            "SHA-256",
            data
        );

    return Array.from(
        new Uint8Array(buffer)
    )
        .map(
            byte =>
                byte
                    .toString(16)
                    .padStart(2, "0")
        )
        .join("");
}


function setLoginMessage(
    message,
    success = false
) {

    if (!loginMessage) {
        return;
    }

    loginMessage.textContent =
        message;

    loginMessage.style.color =
        success
            ? "#9cffb0"
            : "#ff7185";
}


/* LOGIN TAB */

loginTab?.addEventListener(
    "click",
    () => {

        loginTab.classList.add(
            "active"
        );

        registerTab?.classList.remove(
            "active"
        );

        loginForm?.classList.remove(
            "hidden"
        );

        registerForm?.classList.add(
            "hidden"
        );

        setLoginMessage("");
    }
);


/* REGISTER TAB */

registerTab?.addEventListener(
    "click",
    () => {

        registerTab.classList.add(
            "active"
        );

        loginTab?.classList.remove(
            "active"
        );

        registerForm?.classList.remove(
            "hidden"
        );

        loginForm?.classList.add(
            "hidden"
        );

        setLoginMessage("");
    }
);


/* REGISTER */

registerForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        const name =
            registerName.value.trim();

        const email =
            normalizeEmail(
                registerEmail.value
            );

        const password =
            registerPassword.value;

        if (
            !name ||
            !email ||
            !password
        ) {

            setLoginMessage(
                "Please complete every field."
            );

            return;
        }

        if (
            password.length < 6
        ) {

            setLoginMessage(
                "Password must contain at least 6 characters."
            );

            return;
        }

        const users =
            getUsers();

        const exists =
            users.some(
                user =>
                    normalizeEmail(
                        user.email
                    ) === email
            );

        if (exists) {

            setLoginMessage(
                "That email is already registered."
            );

            return;
        }

        const passwordHash =
            await hashPassword(
                password
            );

        users.push({

            id: Date.now(),

            name,

            email,

            passwordHash

        });

        saveUsers(
            users
        );

        registerForm.reset();

        setLoginMessage(
            "Account created successfully.",
            true
        );

        setTimeout(
            () => {

                loginTab?.click();

                if (loginEmail) {
                    loginEmail.value =
                        email;
                }

            },
            600
        );
    }
);


/* LOGIN */

loginForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        const email =
            normalizeEmail(
                loginEmail.value
            );

        const password =
            loginPassword.value;

        const users =
            getUsers();

        const passwordHash =
            await hashPassword(
                password
            );

        const user =
            users.find(
                item =>
                    normalizeEmail(
                        item.email
                    ) === email &&
                    item.passwordHash ===
                        passwordHash
            );

        if (!user) {

            setLoginMessage(
                "Incorrect email or password."
            );

            return;
        }

        currentUser =
            user;

        localStorage.setItem(
            "nocturneSession",
            JSON.stringify(user)
        );

        showApp();
    }
);


/* =========================================================
   APP SESSION
========================================================= */

function showApp() {

    loginScreen?.classList.add(
        "hidden"
    );

    app?.classList.remove(
        "hidden"
    );

    updateUserUI();

    loadAdminSongs();

    renderAdminSongs();

    loadYouTubeAPI();

    loadTrendingSongs();
}


function showLoginScreen() {

    app?.classList.add(
        "hidden"
    );

    loginScreen?.classList.remove(
        "hidden"
    );

    currentUser =
        null;

    adminLoggedIn =
        false;

    if (
        youtubePlayer &&
        youtubeReady
    ) {

        try {
            youtubePlayer.stopVideo();
        } catch {}
    }

    hideYouTubePlayer();
}


function restoreSession() {

    try {

        const session =
            JSON.parse(
                localStorage.getItem(
                    "nocturneSession"
                )
            );

        if (
            session &&
            session.email
        ) {

            currentUser =
                session;

            showApp();

        } else {

            showLoginScreen();
        }

    } catch {

        showLoginScreen();
    }
}


function updateUserUI() {

    if (!currentUser) {
        return;
    }

    const name =
        currentUser.name ||
        "User";

    if (userNameDisplay) {

        userNameDisplay.textContent =
            name;
    }

    if (userInitial) {

        userInitial.textContent =
            name
                .charAt(0)
                .toUpperCase();
    }
}


/* LOGOUT */

logoutButton?.addEventListener(
    "click",
    () => {

        localStorage.removeItem(
            "nocturneSession"
        );

        userMenu?.classList.add(
            "hidden"
        );

        showLoginScreen();
    }
);


/* USER MENU */

userButton?.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        userMenu?.classList.toggle(
            "hidden"
        );
    }
);


document.addEventListener(
    "click",
    event => {

        if (
            userMenu &&
            userButton &&
            !userMenu.contains(
                event.target
            ) &&
            !userButton.contains(
                event.target
            )
        ) {

            userMenu.classList.add(
                "hidden"
            );
        }
    }
);


/* =========================================================
   YOUTUBE IFRAME API
========================================================= */

function loadYouTubeAPI() {

    if (!youtubePlayerContainer) {
        return;
    }

    /*
       NEVER use display:none for the YouTube iframe.
       It stays tiny until the user selects a song.
    */

    Object.assign(
        youtubePlayerContainer.style,
        {
            display: "block",
            width: "1px",
            height: "1px",
            opacity: "0",
            visibility: "hidden",
            pointerEvents: "none"
        }
    );

    if (
        window.YT &&
        window.YT.Player
    ) {

        initializeYouTubePlayer();

        return;
    }

    window.onYouTubeIframeAPIReady =
        initializeYouTubePlayer;

    if (
        !document.querySelector(
            'script[src="https://www.youtube.com/iframe_api"]'
        )
    ) {

        const script =
            document.createElement(
                "script"
            );

        script.src =
            "https://www.youtube.com/iframe_api";

        document.head.appendChild(
            script
        );
    }
}


function initializeYouTubePlayer() {

    if (
        youtubePlayer ||
        !youtubePlayerContainer
    ) {
        return;
    }

    youtubePlayer =
        new YT.Player(
            "youtubePlayerContainer",
            {

                width: "360",

                height: "203",

                playerVars: {

                    autoplay: 0,

                    controls: 1,

                    rel: 0,

                    modestbranding: 1,

                    playsinline: 1
                },

                events: {

                    onReady:
                        event => {

                            youtubeReady =
                                true;

                            event.target
                                .setVolume(
                                    Number(
                                        volumeBar?.value ||
                                        80
                                    )
                                );

                            startProgressTimer();
                        },

                    onStateChange:
                        onPlayerStateChange,

                    onError:
                        onPlayerError
                }
            }
        );
}


function showYouTubePlayer() {

    if (
        !youtubePlayerContainer
    ) {
        return;
    }

    Object.assign(
        youtubePlayerContainer.style,
        {
            display: "block",
            position: "fixed",
            right: "20px",
            bottom: "95px",
            width: "360px",
            height: "203px",
            opacity: "1",
            visibility: "visible",
            pointerEvents: "auto",
            zIndex: "9998",
            background: "#000",
            borderRadius: "12px",
            overflow: "hidden"
        }
    );
}


function hideYouTubePlayer() {

    if (
        !youtubePlayerContainer
    ) {
        return;
    }

    Object.assign(
        youtubePlayerContainer.style,
        {
            display: "block",
            position: "fixed",
            right: "0",
            bottom: "0",
            width: "1px",
            height: "1px",
            opacity: "0",
            visibility: "hidden",
            pointerEvents: "none"
        }
    );
}


function onPlayerStateChange(
    event
) {

    if (!window.YT) {
        return;
    }

    if (
        event.data ===
        YT.PlayerState.PLAYING
    ) {

        playButton.textContent =
            "❚❚";

        showYouTubePlayer();

    } else if (
        event.data ===
        YT.PlayerState.PAUSED
    ) {

        playButton.textContent =
            "▶";

    } else if (
        event.data ===
        YT.PlayerState.ENDED
    ) {

        playButton.textContent =
            "▶";

        playNextSong();
    }
}


function onPlayerError(
    event
) {

    console.error(
        "YouTube player error:",
        event.data
    );

    const errors = {

        2:
            "Invalid YouTube video.",

        5:
            "YouTube player could not load.",

        100:
            "This video no longer exists.",

        101:
            "This video cannot be embedded.",

        150:
            "This video cannot be embedded."
    };

    showToast(
        errors[event.data] ||
        "This YouTube video cannot be played."
    );
}


/* =========================================================
   SEARCH
========================================================= */

searchButton?.addEventListener(
    "click",
    () => {

        searchYouTube(
            searchInput?.value || ""
        );
    }
);


searchInput?.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            searchYouTube(
                searchInput.value
            );
        }
    }
);


async function searchYouTube(
    query
) {

    query =
        query.trim();

    if (!query) {

        showToast(
            "Type a song or artist first."
        );

        return;
    }

    if (!hasYouTubeKey()) {

        showToast(
            "Add your YouTube API key to script.js."
        );

        return;
    }

    searchButton.disabled =
        true;

    searchButton.textContent =
        "SEARCHING...";

    try {

        const params =
            new URLSearchParams({

                part:
                    "snippet",

                q:
                    query,

                type:
                    "video",

                videoCategoryId:
                    "10",

                videoEmbeddable:
                    "true",

                videoSyndicated:
                    "true",

                maxResults:
                    "20",

                key:
                    YOUTUBE_API_KEY
            });


        const response =
            await fetch(
                "https://www.googleapis.com/youtube/v3/search?" +
                params.toString()
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data?.error?.message ||
                "YouTube search failed."
            );
        }


        searchResults =
            (data.items || [])
                .filter(
                    item =>
                        item.id?.videoId
                )
                .map(
                    item => ({

                        videoId:
                            item.id.videoId,

                        title:
                            item.snippet.title,

                        artist:
                            item.snippet.channelTitle,

                        thumbnail:
                            item.snippet
                                .thumbnails
                                ?.high
                                ?.url ||
                            item.snippet
                                .thumbnails
                                ?.medium
                                ?.url ||
                            youtubeThumbnail(
                                item.id.videoId
                            )
                    })
                );


        renderSongGrid(
            resultsGrid,
            searchResults,
            "No music results found."
        );


        document
            .getElementById(
                "searchResultsArea"
            )
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });


    } catch (error) {

        console.error(error);

        renderMessage(
            resultsGrid,
            "Search failed. Check your YouTube API key and quota."
        );

    } finally {

        searchButton.disabled =
            false;

        searchButton.textContent =
            "SEARCH";
    }
}


/* =========================================================
   TRENDING
========================================================= */

async function loadTrendingSongs() {

    if (!hasYouTubeKey()) {

        renderMessage(
            trendingGrid,
            "Add your YouTube API key in script.js to load trending music."
        );

        return;
    }

    try {

        const requests =
            TRENDING_REGIONS.map(
                async region => {

                    const params =
                        new URLSearchParams({

                            part:
                                "snippet,statistics",

                            chart:
                                "mostPopular",

                            regionCode:
                                region,

                            videoCategoryId:
                                "10",

                            maxResults:
                                "8",

                            key:
                                YOUTUBE_API_KEY
                        });


                    const response =
                        await fetch(
                            "https://www.googleapis.com/youtube/v3/videos?" +
                            params.toString()
                        );


                    return response.json();
                }
            );


        const responses =
            await Promise.all(
                requests
            );


        const unique =
            new Map();


        responses.forEach(
            data => {

                (data.items || [])
                    .forEach(
                        item => {

                            if (
                                item.id &&
                                !unique.has(
                                    item.id
                                )
                            ) {

                                unique.set(
                                    item.id,
                                    {

                                        videoId:
                                            item.id,

                                        title:
                                            item.snippet.title,

                                        artist:
                                            item.snippet.channelTitle,

                                        thumbnail:
                                            item.snippet
                                                .thumbnails
                                                ?.high
                                                ?.url ||
                                            item.snippet
                                                .thumbnails
                                                ?.medium
                                                ?.url ||
                                            youtubeThumbnail(
                                                item.id
                                            )
                                    }
                                );
                            }
                        }
                    );
            }
        );


        trendingSongs =
            shuffleArray(
                [...unique.values()]
            ).slice(
                0,
                18
            );


        renderSongGrid(
            trendingGrid,
            trendingSongs,
            "No trending songs found."
        );


    } catch (error) {

        console.error(error);

        renderMessage(
            trendingGrid,
            "Unable to load trending music."
        );
    }
}


/* =========================================================
   SONG CARDS
========================================================= */

function renderSongGrid(
    container,
    songs,
    emptyMessage
) {

    if (!container) {
        return;
    }

    container.innerHTML =
        "";

    if (
        !songs ||
        !songs.length
    ) {

        renderMessage(
            container,
            emptyMessage
        );

        return;
    }


    songs.forEach(
        (song, index) => {

            container.appendChild(
                createSongCard(
                    song,
                    index,
                    songs
                )
            );
        }
    );
}


function createSongCard(
    song,
    index,
    queue
) {

    const card =
        document.createElement(
            "article"
        );

    card.className =
        "song-card";


    const thumbnail =
        song.thumbnail ||
        youtubeThumbnail(
            song.videoId
        );


    card.innerHTML = `

        <div class="song-image">

            <img
                src="${escapeHTML(thumbnail)}"
                alt="${escapeHTML(song.title)}"
                loading="lazy"
            >

            <button
                class="song-play"
                type="button"
            >
                ▶
            </button>

        </div>


        <div class="song-info">

            <h3>
                ${escapeHTML(
                    song.title
                )}
            </h3>

            <p>
                ${escapeHTML(
                    song.artist
                )}
            </p>

        </div>
    `;


    card.addEventListener(
        "click",
        () => {

            currentQueue =
                queue;

            currentSongIndex =
                index;

            playSong(
                song
            );
        }
    );


    return card;
}


function renderMessage(
    container,
    message
) {

    if (!container) {
        return;
    }

    container.innerHTML = `

        <div class="empty-state">
            ${escapeHTML(message)}
        </div>
    `;
}


/* =========================================================
   PLAY SONG
========================================================= */

function playSong(
    song
) {

    if (
        !song ||
        !song.videoId
    ) {

        showToast(
            "This song has no valid YouTube video."
        );

        return;
    }


    currentSong =
        song;


    playerTitle.textContent =
        song.title ||
        "Unknown Song";


    playerArtist.textContent =
        song.artist ||
        "Unknown Artist";


    playerCover.src =
        song.thumbnail ||
        youtubeThumbnail(
            song.videoId
        );


    showYouTubePlayer();


    if (
        !youtubePlayer ||
        !youtubeReady
    ) {

        loadYouTubeAPI();

        showToast(
            "Loading YouTube player..."
        );


        let attempts =
            0;


        const wait =
            setInterval(
                () => {

                    attempts++;


                    if (
                        youtubeReady &&
                        youtubePlayer
                    ) {

                        clearInterval(
                            wait
                        );

                        loadVideo(
                            song.videoId
                        );
                    }


                    if (
                        attempts > 30
                    ) {

                        clearInterval(
                            wait
                        );

                        showToast(
                            "YouTube player could not initialize."
                        );
                    }

                },
                300
            );


        return;
    }


    loadVideo(
        song.videoId
    );
}


function loadVideo(
    videoId
) {

    try {

        showYouTubePlayer();


        youtubePlayer.loadVideoById(
            videoId
        );


    } catch (error) {

        console.error(error);

        showToast(
            "Unable to play this YouTube video."
        );
    }
}


/* =========================================================
   PLAYER CONTROLS
========================================================= */

playButton?.addEventListener(
    "click",
    () => {

        if (
            !youtubePlayer ||
            !youtubeReady
        ) {

            if (currentSong) {

                playSong(
                    currentSong
                );

            } else {

                showToast(
                    "Choose a song first."
                );
            }

            return;
        }


        const state =
            youtubePlayer.getPlayerState();


        if (
            state ===
            YT.PlayerState.PLAYING
        ) {

            youtubePlayer.pauseVideo();

        } else {

            youtubePlayer.playVideo();
        }
    }
);


nextButton?.addEventListener(
    "click",
    playNextSong
);


previousButton?.addEventListener(
    "click",
    playPreviousSong
);


function playNextSong() {

    if (
        !currentQueue.length
    ) {
        return;
    }


    currentSongIndex++;


    if (
        currentSongIndex >=
        currentQueue.length
    ) {

        currentSongIndex =
            0;
    }


    playSong(
        currentQueue[
            currentSongIndex
        ]
    );
}


function playPreviousSong() {

    if (
        !currentQueue.length
    ) {
        return;
    }


    currentSongIndex--;


    if (
        currentSongIndex < 0
    ) {

        currentSongIndex =
            currentQueue.length - 1;
    }


    playSong(
        currentQueue[
            currentSongIndex
        ]
    );
}


/* =========================================================
   PROGRESS
========================================================= */

function startProgressTimer() {

    clearInterval(
        progressTimer
    );


    progressTimer =
        setInterval(
            updateProgress,
            500
        );
}


function updateProgress() {

    if (
        !youtubeReady ||
        !youtubePlayer
    ) {
        return;
    }


    try {

        const total =
            youtubePlayer.getDuration();

        const current =
            youtubePlayer.getCurrentTime();


        if (
            !total ||
            total <= 0
        ) {
            return;
        }


        progressBar.value =
            (current / total) *
            100;


        currentTime.textContent =
            formatTime(
                current
            );


        duration.textContent =
            formatTime(
                total
            );


    } catch {}
}


function formatTime(
    seconds
) {

    seconds =
        Math.floor(
            Number(seconds) || 0
        );


    const minutes =
        Math.floor(
            seconds / 60
        );


    const secondsLeft =
        seconds % 60;


    return (
        minutes +
        ":" +
        String(
            secondsLeft
        ).padStart(
            2,
            "0"
        )
    );
}


progressBar?.addEventListener(
    "input",
    () => {

        if (
            !youtubeReady ||
            !youtubePlayer
        ) {
            return;
        }


        const total =
            youtubePlayer.getDuration();


        if (!total) {
            return;
        }


        const newTime =
            (
                Number(
                    progressBar.value
                ) /
                100
            ) *
            total;


        youtubePlayer.seekTo(
            newTime,
            true
        );
    }
);


/* VOLUME */

volumeBar?.addEventListener(
    "input",
    () => {

        if (
            youtubeReady &&
            youtubePlayer
        ) {

            youtubePlayer.setVolume(
                Number(
                    volumeBar.value
                )
            );
        }
    }
);


/* =========================================================
   ADMIN MODAL
========================================================= */

function resetAdminModal() {

    adminCodeForm.innerHTML = `

        <input
            id="adminCode"
            type="text"
            placeholder="Enter access code"
            autocomplete="off"
            required
        >

        <button
            class="primary-button"
            type="submit"
        >
            ENTER
        </button>
    `;


    adminMessage.textContent =
        "";


    adminCodeForm.onsubmit =
        verifyAdminCode;
}


adminTrigger?.addEventListener(
    "click",
    () => {

        resetAdminModal();

        adminModal.classList.remove(
            "hidden"
        );
    }
);


closeAdminModal?.addEventListener(
    "click",
    () => {

        adminModal.classList.add(
            "hidden"
        );
    }
);


/* =========================================================
   ADMIN CODE
========================================================= */

function verifyAdminCode(
    event
) {

    event.preventDefault();


    const entered =
        $("adminCode")
            ?.value
            .trim()
            .replace(
                /\s+/g,
                " "
            )
            .toUpperCase();


    const expected =
        ADMIN_CHEAT_CODE
            .trim()
            .replace(
                /\s+/g,
                " "
            )
            .toUpperCase();


    if (
        entered !==
        expected
    ) {

        adminMessage.textContent =
            "Invalid access code.";

        adminMessage.style.color =
            "#ff7185";

        return;
    }


    showAdminCredentials();
}


/* =========================================================
   ADMIN CREDENTIALS
========================================================= */

function showAdminCredentials() {

    adminCodeForm.innerHTML = `

        <input
            id="adminEmail"
            type="email"
            placeholder="Admin email"
            autocomplete="username"
            required
        >

        <input
            id="adminPassword"
            type="password"
            placeholder="Admin password"
            autocomplete="current-password"
            required
        >

        <button
            class="primary-button"
            type="submit"
        >
            VERIFY ADMIN
        </button>
    `;


    adminMessage.textContent =
        "Access code accepted.";


    adminMessage.style.color =
        "#9cffb0";


    adminCodeForm.onsubmit =
        verifyAdminCredentials;
}


function verifyAdminCredentials(
    event
) {

    event.preventDefault();


    const email =
        normalizeEmail(
            $("adminEmail")
                ?.value
        );


    const password =
        $("adminPassword")
            ?.value ||
        "";


    const valid =
        ADMIN_ACCOUNTS.some(
            account =>
                normalizeEmail(
                    account.email
                ) === email &&
                String(
                    account.password
                ) === password
        );


    if (!valid) {

        adminMessage.textContent =
            "Admin email or password is incorrect.";

        adminMessage.style.color =
            "#ff7185";

        return;
    }


    adminLoggedIn =
        true;


    adminModal.classList.add(
        "hidden"
    );


    openAdminDashboard();


    showToast(
        "ADMIN ACCESS GRANTED"
    );
}


/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function openAdminDashboard() {

    if (!adminLoggedIn) {
        return;
    }


    adminDashboard.classList.remove(
        "hidden"
    );
}


closeAdminDashboard?.addEventListener(
    "click",
    () => {

        adminDashboard.classList.add(
            "hidden"
        );
    }
);


/* =========================================================
   ADMIN SONG STORAGE
========================================================= */

function loadAdminSongs() {

    try {

        adminSongs =
            JSON.parse(
                localStorage.getItem(
                    "nocturneAdminSongs"
                )
            ) || [];

    } catch {

        adminSongs = [];
    }
}


function saveAdminSongs() {

    localStorage.setItem(
        "nocturneAdminSongs",
        JSON.stringify(
            adminSongs
        )
    );
}


/* =========================================================
   ADD SONG
========================================================= */

addSongButton?.addEventListener(
    "click",
    () => {

        if (!adminLoggedIn) {

            showToast(
                "Admin access required."
            );

            return;
        }


        addSongModal.classList.remove(
            "hidden"
        );
    }
);


closeSongModal?.addEventListener(
    "click",
    () => {

        addSongModal.classList.add(
            "hidden"
        );
    }
);


addSongForm?.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        if (!adminLoggedIn) {
            return;
        }


        const title =
            $("songName")
                ?.value
                .trim();


        const artist =
            $("songArtist")
                ?.value
                .trim();


        const youtubeURL =
            $("songYoutube")
                ?.value
                .trim();


        const videoId =
            extractYouTubeVideoId(
                youtubeURL
            );


        if (
            !title ||
            !artist ||
            !videoId
        ) {

            showToast(
                "Enter a valid song, artist and YouTube URL."
            );

            return;
        }


        const song = {

            id:
                Date.now(),

            title,

            artist,

            videoId,

            thumbnail:
                youtubeThumbnail(
                    videoId
                )
        };


        adminSongs.unshift(
            song
        );


        saveAdminSongs();


        renderAdminSongs();


        addSongForm.reset();


        addSongModal.classList.add(
            "hidden"
        );


        showToast(
            "SONG PUBLISHED"
        );
    }
);


/* =========================================================
   RENDER ADMIN SONGS
========================================================= */

function renderAdminSongs() {

    loadAdminSongs();


    const section =
        $("adminPublishedSection");


    const grid =
        $("adminPublishedGrid");


    if (
        !adminSongs.length
    ) {

        section?.classList.add(
            "hidden"
        );

        return;
    }


    section?.classList.remove(
        "hidden"
    );


    renderSongGrid(
        grid,
        adminSongs,
        "No releases yet."
    );
}


/* =========================================================
   YOUTUBE URL PARSER
========================================================= */

function extractYouTubeVideoId(
    value
) {

    if (!value) {
        return null;
    }


    const input =
        value.trim();


    /* DIRECT VIDEO ID */

    if (
        /^[a-zA-Z0-9_-]{11}$/
            .test(input)
    ) {

        return input;
    }


    try {

        const url =
            new URL(input);


        const hostname =
            url.hostname
                .toLowerCase();


        /* youtu.be */

        if (
            hostname ===
                "youtu.be" ||
            hostname ===
                "www.youtu.be"
        ) {

            return (
                url.pathname
                    .split("/")
                    .filter(
                        Boolean
                    )[0] ||
                null
            );
        }


        /* youtube.com */

        if (
            hostname.includes(
                "youtube.com"
            )
        ) {

            const watchID =
                url.searchParams.get(
                    "v"
                );


            if (watchID) {
                return watchID;
            }


            const parts =
                url.pathname
                    .split("/")
                    .filter(
                        Boolean
                    );


            const embedIndex =
                parts.indexOf(
                    "embed"
                );


            if (
                embedIndex !== -1 &&
                parts[
                    embedIndex + 1
                ]
            ) {

                return parts[
                    embedIndex + 1
                ];
            }


            const shortsIndex =
                parts.indexOf(
                    "shorts"
                );


            if (
                shortsIndex !== -1 &&
                parts[
                    shortsIndex + 1
                ]
            ) {

                return parts[
                    shortsIndex + 1
                ];
            }
        }

    } catch {

        return null;
    }


    return null;
}


/* =========================================================
   MANAGE POSTS
========================================================= */

managePostsButton?.addEventListener(
    "click",
    () => {

        if (!adminLoggedIn) {
            return;
        }

        openManagePosts();
    }
);


function openManagePosts() {

    const old =
        $("adminPostsModal");


    old?.remove();


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "adminPostsModal";


    modal.className =
        "modal";


    modal.innerHTML = `

        <div class="modal-box">

            <button
                id="closePostsModal"
                class="close-modal"
                type="button"
            >
                ×
            </button>

            <span class="section-label">
                POSTS
            </span>

            <h2>
                MANAGE POSTS
            </h2>

            <div id="adminPostsList"></div>

        </div>
    `;


    document.body.appendChild(
        modal
    );


    const list =
        $("adminPostsList");


    if (
        !adminSongs.length
    ) {

        list.innerHTML = `

            <div class="empty-state">
                No posts yet.
            </div>
        `;

    } else {

        adminSongs.forEach(
            (song, index) => {

                const row =
                    document.createElement(
                        "div"
                    );


                row.style.display =
                    "flex";

                row.style.alignItems =
                    "center";

                row.style.justifyContent =
                    "space-between";

                row.style.gap =
                    "15px";

                row.style.padding =
                    "14px 0";

                row.style.borderBottom =
                    "1px solid rgba(255,255,255,.08)";


                row.innerHTML = `

                    <div>

                        <strong>
                            ${escapeHTML(
                                song.title
                            )}
                        </strong>

                        <br>

                        <small style="color:#666">
                            ${escapeHTML(
                                song.artist
                            )}
                        </small>

                    </div>


                    <button
                        class="danger-button"
                        data-index="${index}"
                        type="button"
                    >
                        DELETE
                    </button>
                `;


                list.appendChild(
                    row
                );
            }
        );
    }


    $("closePostsModal")
        ?.addEventListener(
            "click",
            () => {
                modal.remove();
            }
        );


    list
        ?.querySelectorAll(
            ".danger-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const index =
                            Number(
                                button
                                    .dataset
                                    .index
                            );


                        adminSongs.splice(
                            index,
                            1
                        );


                        saveAdminSongs();


                        renderAdminSongs();


                        modal.remove();


                        showToast(
                            "POST DELETED"
                        );
                    }
                );
            }
        );
}


/* =========================================================
   STUDIO BUTTONS
========================================================= */

musicStudioButton?.addEventListener(
    "click",
    () => {

        showToast(
            "Music Studio will be added in the next stage."
        );
    }
);


videoStudioButton?.addEventListener(
    "click",
    () => {

        showToast(
            "Video Studio will be added in the next stage."
        );
    }
);


/* =========================================================
   MODAL OUTSIDE CLICK
========================================================= */

[
    adminModal,
    adminDashboard,
    addSongModal
].forEach(
    modal => {

        modal?.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    modal
                ) {

                    modal.classList.add(
                        "hidden"
                    );
                }
            }
        );
    }
);


/* =========================================================
   NAVIGATION
========================================================= */

document
    .querySelectorAll(
        ".nav-link"
    )
    .forEach(
        link => {

            link.addEventListener(
                "click",
                event => {

                    const href =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        !href ||
                        !href.startsWith("#")
                    ) {
                        return;
                    }


                    const target =
                        document.querySelector(
                            href
                        );


                    if (target) {

                        event.preventDefault();

                        target.scrollIntoView({
                            behavior:
                                "smooth",
                            block:
                                "start"
                        });
                    }
                }
            );
        }
    );


/* =========================================================
   START
========================================================= */

function startNocturne() {

    hideYouTubePlayer();

    restoreSession();
}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startNocturne
    );

} else {

    startNocturne();
}