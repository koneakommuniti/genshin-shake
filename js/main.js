const APP_URL = "https://koneakommuniti.github.io/faruzan1/";
const TOTAL_WALLPAPERS = 98;
const GAME_TIME = 8;
const SHAKES_TO_WIN = 60;
const SHAKE_THRESHOLD = 2;
const SHAKE_TIMEOUT = 100;
const UNLOCKS_PER_SESSIONS = 4;

let shakeEvent, shakeCount, wallpapersUnlocked, totalRetries = 0, firstLoad = true;
let tikSound, timeupSound;

/* App Init */

function initLandingPage() {
    
    gaPageView(window.location.href, 'Home');

    if(firstLoad) {
        localStorage.clear();
        firstLoad = false;
    }

    initAudio();

    let preloadImagesList = ['img/logo.png', 'img/bg-symbol-light.png', 'img/btn-dark.png', 'img/paimon-landing.gif']
    if(canUseWebP() == true) {
        preloadImagesList = ['img/logo.png', 'img/bg-symbol-light.png', 'img/btn-dark.png', 'img/paimon-landing.webp'];
    }

    preloadImages(preloadImagesList, () => {
        
        document.getElementById('main').classList.remove('main-dark');
        document.getElementById('main').classList.add('main-light');

        document.getElementById('landing-view').innerHTML = "";
        document.getElementById('instructions-view').innerHTML = "";
        document.getElementById('shake-view').innerHTML = "";
        document.getElementById('result-view').innerHTML = "";
        document.getElementById('reward-view').innerHTML = "";
        document.getElementById('reward-collection-view').innerHTML = "";

        document.getElementById('landing-view').style.display = "block";
        document.getElementById('instructions-view').style.display = "none";
        document.getElementById('shake-view').style.display = "none";
        document.getElementById('result-view').style.display = "none";
        document.getElementById('reward-view').style.display = "none";
        document.getElementById('reward-collection-view').style.display = "none";

        let iDiv = '<img src="img/logo.png" class="logo unselectable">';
        iDiv += '<p class="title-light unselectable">Welcome Traveler! <br>Are you ready to shake and reveal your wallpaper?</p>';
        iDiv += '<a id="ready-button" class="btn-dark unselectable" onclick="showInstructionsView();" >I am ready</a>';
        iDiv += '<picture class="unselectable"><source srcset="img/paimon-landing.webp" type="image/webp"><source srcset="img/paimon-landing.gif" type="image/gif"><img src="paimon-landing.gif" class="animated-character"></picture>'
        document.getElementById('landing-view').innerHTML = iDiv;

        preloadImagesList = ['img/bg-symbol-dark.png', 'img/btn-light.png', 'img/phone-shake-dark.png', 'img/paimon-shake.gif'];
        if(canUseWebP() == true) {
            preloadImagesList = ['img/bg-symbol-dark.png', 'img/btn-light.png', 'img/phone-shake-dark.png', 'img/paimon-shake.webp'];
        }

        preloadImages(preloadImagesList);
    });

}

/* Instructions View */

function showInstructionsView() {

    gaPageView(window.location.href, 'Instructions');

    unlockAudio(); // On First Tap

    document.getElementById('main').classList.remove('main-light');
    document.getElementById('main').classList.add('main-dark');

    let iDiv = '<img src="img/logo.png" class="logo unselectable">';
    iDiv += '<p class="title-dark unselectable">Shake your phone <br>up and down.</p>';
    iDiv += '<p class="subtitle-dark unselectable">Get at least ' + SHAKES_TO_WIN + ' shakes within ' + GAME_TIME + ' seconds and reveal your wallpaper!</p>';
    iDiv += '<p class="p-dark unselectable">Sound on for timer notifications 🔊</p>';
    iDiv += '<img src="img/phone-shake-dark.png" class="phone-shake unselectable">';
    iDiv += '<a id="start-button" class="btn-light unselectable" onclick="getMotionPermission();" >Start now</a>';
    iDiv += '<p id="permission-denied-copy" class="permission-denied-copy unselectable"></p>';
    
    document.getElementById('instructions-view').innerHTML = iDiv;
    document.getElementById('landing-view').style.display = "none";
    document.getElementById('instructions-view').style.display = "block";
}

/* Shake View */

function showShakeView() {

    gaPageView(window.location.href, 'Game');

    shakeCount = 0;
    shakeEvent = new Shake({
        threshold: SHAKE_THRESHOLD, // Shake Strength Threshold
        timeout: SHAKE_TIMEOUT      // Frequency of event generation in milliseconds
    });
    window.addEventListener('shake', shakeEventDidOccur, false);
    window.addEventListener('devicemotion', () => {});
    shakeEvent.start();

    let iDiv = '<img src="img/logo.png" class="logo unselectable">';
    iDiv += '<div id="countdown-container" class="countdown-container">';
    iDiv += '<div id="countdown" class="countdown"><p class="countdown-number unselectable" >GO!</p></div>';
    iDiv += '<svg class="countdown-svg">';
    iDiv += '<circle class="circle-behind" r="70" cx="80" cy="80"></circle>';
    iDiv += '<circle id="circle" class="circle" r="70" cx="80" cy="80"></circle>';
    iDiv += '</svg></div>';
    iDiv += '<picture class="unselectable"><source srcset="img/paimon-shake.webp" type="image/webp"><source srcset="img/paimon-shake.gif" type="image/gif"><img src="paimon-shake.gif" class="animated-character" style="margin-top: -20px;"></picture>'
    
    document.getElementById('shake-view').innerHTML = iDiv;
    document.getElementById('instructions-view').style.display = "none";
    document.getElementById('shake-view').style.display = "block";

    let countdownElement = document.getElementById("countdown");
    countdownElement.classList.add('go-animation');

    let initialTimeout = setTimeout(function() {

        countdownElement.classList.remove('go-animation');
        void countdownElement.offsetWidth; //https://betterprogramming.pub/how-to-restart-a-css-animation-with-javascript-and-what-is-the-dom-reflow-a86e8b6df00f
        clearTimeout(initialTimeout);
        
        var countdown = GAME_TIME;
        countdownElement.innerHTML = '<p class="countdown-number unselectable">'+countdown+'</p>';
        countdownElement.classList.add('countdown-animation');
        document.getElementById('circle').classList.add('circle-animation');

        playSound('tick');

        let timer = setInterval(function() {
            countdown--;
            countdownElement.innerHTML = '<p class="countdown-number unselectable">'+countdown+'</p>';

            countdownElement.classList.remove('countdown-animation');
            void countdownElement.offsetWidth;
            countdownElement.classList.add('countdown-animation');

            playSound('tick');

            if(countdown == 0) {
                document.getElementById('countdown-container').innerHTML = "";
                clearInterval(timer);

                window.removeEventListener('shake', shakeEventDidOccur, false);
                window.removeEventListener('devicemotion', () => {});
                shakeEvent.stop();

                playSound('timeup');

                showResultView();
            }
        }, 1000);

    }, 2000);


    let preloadImagesList = ['img/paimon-happy.gif', 'img/paimon-sad.gif'];
    if(canUseWebP() == true) {
        preloadImagesList = ['img/paimon-happy.webp', 'img/paimon-sad.webp'];
    }

    preloadImages(preloadImagesList);
}

function getMotionPermission() {

    if (typeof DeviceMotionEvent != undefined && typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
        .then(permissionState => {
            if (permissionState === 'granted') {
                gaEvent('motion-permission-granted', '');
                showShakeView();
            }
            else {
                gaEvent('motion-permission-denied', '');
                document.getElementById('start-button').style.display = "none";
                document.getElementById('permission-denied-copy').innerHTML = "<br>In order to play, you need to grant access to device motion. If you are using iOS, please go to Settings > Safari > Advanced > Website Data and tap on 'Remove All Website Data' and start the app again.";
                document.getElementById('permission-denied-copy').style.display = "block";
            }
        })
        .catch(console.error);
    } else {
        // handle regular non iOS 13+ devices
        showShakeView();
    }
}

function shakeEventDidOccur () {
    shakeCount++;
}

/* Result View */

function showResultView() {

    let iDiv = '<img src="img/logo.png" class="logo unselectable">';
    if(shakeCount >= SHAKES_TO_WIN) {
        
        document.getElementById('main').classList.remove('main-dark');
        document.getElementById('main').classList.add('main-light');
        
        gaEvent('result-displayed', 'Success', shakeCount);

        iDiv += '<p class="title-light unselectable">Well done! <br>Paimon is happy for you! </p>';
        iDiv += '<p class="subtitle-light unselectable">You\'ve gotten ' + shakeCount + ' shakes. Tweet to share your results!</p>';
        iDiv += '<a class="btn-dark unselectable" onclick="showRewardView();" >Reveal wallpaper</a>';
        iDiv += '<a class="btn-light unselectable" onclick="prepopulateTweet(\'win\');" style="margin-top: 10px;">Tweet to share</a>';
        iDiv += '<picture class="unselectable"><source srcset="img/paimon-happy.webp" type="image/webp"><source srcset="img/paimon-happy.gif" type="image/gif"><img src="paimon-happy.gif" class="animated-character" style="margin-top: -20px;"></picture>'
    }
    else {

        document.getElementById('main').classList.remove('main-light');
        document.getElementById('main').classList.add('main-dark');
        
        gaEvent('result-displayed', 'Fail', shakeCount);

        iDiv += '<p class="title-dark unselectable">Almost there, <br>try a bit harder!</p>';
        iDiv += '<p class="subtitle-dark unselectable">You did not get ' + SHAKES_TO_WIN + ' shakes. Shake harder!</p>';
        iDiv += '<a class="btn-light unselectable" onclick="initLandingPage();">Try again</a>';
        iDiv += '<a class="btn-dark unselectable" onclick="prepopulateTweet(\'lose\');" style="margin-top: 10px;">Tweet to share</a>';
        iDiv += '<picture class="unselectable"><source srcset="img/paimon-sad.webp" type="image/webp"><source srcset="img/paimon-sad.gif" type="image/gif"><img src="paimon-sad.gif" class="animated-character unselectable" style="margin-top: -20px;"></picture>'
    }

    document.getElementById('result-view').innerHTML = iDiv;
    document.getElementById('shake-view').style.display = "none";
    document.getElementById('result-view').style.display = "block";
}

/* Reward View */

function showRewardView() {

    let totalUnlocked = 0;
    let allItemsUnlocked = false;
    let unlockedItemIndex = -1;

    var weights = [0.91, 0.09]; // 90-10 probability ratio
    var sets = [1, 2]; // 1-83 is Set 1, 83 to 98 is Set 2
    let setIndex = weigthedRandom(weights, sets);

    if (typeof(Storage) !== "undefined") {

        if(localStorage.getItem("wallpapersUnlocked") !== null) {

            let lockedItems = [];
            let lockedItemsSet1 = [];
            let lockedItemsSet2 = [];
            let wallpaperItems = JSON.parse(localStorage.getItem("wallpapersUnlocked"));

            for(let i = 0; i < wallpaperItems.length; i++) {
                if(wallpaperItems[i] == 1) {
                    totalUnlocked++;
                } else {

                    lockedItems.push(i);
                    if(i < 83) {
                        lockedItemsSet1.push(i);
                    } else if(i >= 83) {
                        lockedItemsSet2.push(i);
                    }
                }
            }

            if(setIndex == 1) {

                if(lockedItemsSet1.length != 0) {

                    unlockedItemIndex = randomInteger(0, lockedItemsSet1.length-1);
                    unlockedItemIndex = lockedItemsSet1[unlockedItemIndex];
                    
                    wallpaperItems[unlockedItemIndex] = 1;
                    totalUnlocked++;
                    localStorage.wallpapersUnlocked = JSON.stringify(wallpaperItems);

                }
                else {

                    // Check if Set 2 has any locked items left to unlock
                    if(lockedItemsSet2.length != 0) {

                        unlockedItemIndex = randomInteger(0, lockedItemsSet2.length-1);
                        unlockedItemIndex = lockedItemsSet2[unlockedItemIndex];
                        
                        wallpaperItems[unlockedItemIndex] = 1;
                        totalUnlocked++;
                        localStorage.wallpapersUnlocked = JSON.stringify(wallpaperItems);
                    }
                    else {
                        allItemsUnlocked = true;
                    }

                }
                
            } else if(setIndex == 2) {
                
                if(lockedItemsSet2.length != 0) {

                    unlockedItemIndex = randomInteger(0, lockedItemsSet2.length-1);
                    unlockedItemIndex = lockedItemsSet2[unlockedItemIndex];
                    
                    wallpaperItems[unlockedItemIndex] = 1;
                    totalUnlocked++;
                    localStorage.wallpapersUnlocked = JSON.stringify(wallpaperItems);

                }
                else {

                    // Check if Set 1 has any locked items left to unlock
                    if(lockedItemsSet1.length != 0) {

                        unlockedItemIndex = randomInteger(0, lockedItemsSet1.length-1);
                        unlockedItemIndex = lockedItemsSet1[unlockedItemIndex];
                        
                        wallpaperItems[unlockedItemIndex] = 1;
                        totalUnlocked++;
                        localStorage.wallpapersUnlocked = JSON.stringify(wallpaperItems);
                    }
                    else {
                        allItemsUnlocked = true;
                    }

                }

            }

        }
        else {

            let wallpaperItems = [];
            for (let i = 0; i < TOTAL_WALLPAPERS; i++) {
                wallpaperItems[i] = 0;
            }

            // Generate random as per probability
            if (setIndex == 1) {
                unlockedItemIndex = randomInteger(0, 84-1); // 0-84 have 80% probablity
            } else if(setIndex == 2) {
                unlockedItemIndex = randomInteger(84, TOTAL_WALLPAPERS); // 0-98 have 20% probablity
            }

            wallpaperItems[unlockedItemIndex] = 1;
            totalUnlocked++;
            localStorage.wallpapersUnlocked = JSON.stringify(wallpaperItems);
        }
    }

    gaEvent('reward-unlocked', (unlockedItemIndex + 1));

    let iDiv = '<img src="img/logo.png" class="logo unselectable">';
    if(!allItemsUnlocked) {
        iDiv += '<p class="title-light unselectable">Hurray! You have unlocked ' + totalUnlocked + ' of ' + TOTAL_WALLPAPERS + ' wallpapers.</p>';
        iDiv += '<p class="subtitle-light unselectable">Tap to open and save the wallpaper to your phone.</p>';
        iDiv += '<div class="wallpaper-thumb-container">';
        iDiv += '<a class="unselectable" onClick="showWallpaperModal(' + (unlockedItemIndex + 1) + ');">';
        iDiv += '<img class="wallpaper-thumb-light unselectable" src="img/wallpapers/thumbs/' + (unlockedItemIndex + 1) + '.jpg"></img>';
        iDiv += '</a></div>';
        iDiv += '<a class="btn-dark unselectable" onclick="seeAllCollection();" style="margin-top:30px;">See all collection</a>';
    }
    else {
        iDiv += '<p class="title-light unselectable">You have already unlocked ' + totalUnlocked + ' of ' + TOTAL_WALLPAPERS + ' Wallpapers.</p>';
        iDiv += '<p class="subtitle-light unselectable">Checkout the entire collection now!</p>';
        iDiv += '<a class="btn-dark unselectable" onclick="seeAllCollection();" >See all collection</a>';
    }  

    if((totalRetries + 1) < UNLOCKS_PER_SESSIONS) {
        iDiv += '<a class="btn-dark unselectable" onclick="unlockMore();" style="margin-top: 60px;">Unlock more</a>';
    }
    iDiv += '<a class="btn-light unselectable" onclick="prepopulateTweet(\'win\');" style="margin-top: 10px;">Tweet to share</a>';

    document.getElementById('reward-view').innerHTML = iDiv;
    document.getElementById('result-view').style.display = "none";
    document.getElementById('reward-view').style.display = "block";
}

function showWallpaperModal(imageName) {

    var modal = document.getElementById("modal");
    modal.style.display = "block";

    var modalImg = document.getElementById("modal-image");
    modalImg.src = 'img/wallpapers/'+ imageName + '.jpg';

    var span = document.getElementsByClassName("modal-close-btn")[0];
    span.onclick = function() { 
        modal.style.display = "none";
    }
}

function unlockMore() {
    totalRetries++;
    initLandingPage();
}

/* Reward Collection View */

function seeAllCollection() {

    let iDiv = '<img src="img/logo.png" class="logo unselectable">';
    iDiv += '<p class="title-light unselectable">Wallpaper collection</p>';
    
    iDiv += '<div class="collection-thumbs-container">';

    let allLocked = false;
    if (typeof(Storage) !== "undefined") {
        if(localStorage.getItem("wallpapersUnlocked") !== null) {
            let wallpaperItems = JSON.parse(localStorage.getItem("wallpapersUnlocked"));
            for(let i = 0; i < TOTAL_WALLPAPERS; i++) {
                if(wallpaperItems[i] == 1) {
                    iDiv += '<div class="collection-thumb-contianer"><a class="unselectable" onClick="showWallpaperModal('+(i+1)+')" ><img class="collection-thumb-light unselectable" src="img/wallpapers/thumbs/' + (i+1) + '.jpg"></img></a></div>';
                }
                else {
                    iDiv += '<div class="collection-thumb-contianer"><div class="collection-thumb-overlay"></div><a class="unselectable"><img class="collection-thumb-light unselectable" src="img/wallpapers/thumbs/' + (i+1) + '.jpg"></img></a></div>';
                }
            }
        }
        else {
            allLocked = true;
        }
    }
    else {
        allLocked = true;
    }
    

    if(allLocked)
    {
        for(let i = 0; i < TOTAL_WALLPAPERS; i++) {
            iDiv += '<div class="collection-thumb-contianer"><div class="collection-thumb-overlay"></div><a class="unselectable"><img class="collection-thumb-light unselectable" src="img/wallpapers/thumbs/' + (i+1) + '.jpg"></img></a></div>';
        }
    }

    iDiv += '</div>';
    iDiv += '<a class="btn-dark unselectable" onclick="hideCollectionView();" style="margin-bottom:40px;" >Go back</a>';

    document.getElementById('reward-collection-view').innerHTML = iDiv;
    document.getElementById('reward-view').style.display = "none";
    document.getElementById('reward-collection-view').style.display = "block";
}

function hideCollectionView() {
    document.getElementById('reward-collection-view').style.display = "none";
    document.getElementById('reward-view').style.display = "block";
}

/* Utils */

function prepopulateTweet(result) {
    gaEvent('tweet-button-clicked', '');
    if (result == "win") {
        window.location.href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent("Hey fellow Travelers, I just received a wallpaper! Want one too? Click and shake to try your luck! " + APP_URL);
    }
    else if(result == "lose")  {
        window.location.href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent("Oh nooo!! I didn’t get the wallpaper Paimon prepared for me! 😭 Click to shake and may your luck be better than mine! " + APP_URL);
    }
}

function preloadImages(list, callback) {
    let loaded = 0;
    for(let i = 0; i < list.length; i++) {
        img = new Image();
        img.onload = () => {
            if (++loaded == list.length && callback) {
                callback();
            }
        };
        img.onerror = (err) => {
            console.log(err);
        };
        img.src = list[i];
    }
}

function canUseWebP() {
    var elem = document.createElement('canvas');
    if (!!(elem.getContext && elem.getContext('2d'))) {
        // was able or not to get WebP representation
        return elem.toDataURL('image/webp').indexOf('data:image/webp') == 0;
    }
    // very old browser like IE 8, canvas not supported
    return false;
}

function weigthedRandom(weightsArray, itemsArray) {
    var num = Math.random(),
        s = 0,
        lastIndex = weightsArray.length - 1;

    for (var i = 0; i < lastIndex; ++i) {
        s += weightsArray[i];
        if (num < s) {
            return itemsArray[i];
        }
    }

    return itemsArray[lastIndex];
}

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* Audio */

function initAudio() {
    tikSound = new Audio('audio/tik.mp3');
    timeupSound = new Audio('audio/timeup.mp3');
    tikSound.volume = 0;
    timeupSound.volume = 0;
    tikSound.preload = "auto";
    timeupSound.preload = "auto";
}

function unlockAudio() {

    tikSound.play();
    tikSound.pause();
    tikSound.currentTime = 1;

    timeupSound.play();
    timeupSound.pause();
    timeupSound.currentTime = 1;
}

function playSound(name) {
    if(name == 'tick') {
        tikSound.currentTime = 0;
        tikSound.volume = 1;
        tikSound.play();
    }
    else if(name == 'timeup') {
        timeupSound.currentTime = 0;
        timeupSound.volume = 1;
        timeupSound.play();
    }
}
