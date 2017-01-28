var rps = {
    ptrName: '',
    ptrPromise: '',
    playerCount: 0,
    state: "init",
    readOnly: false,
    com: {
        data: {
            users: [],
            state: "ready",
            playerCount: 0,
            selectCount: 0,
            chatHistory: [
                {
                    ts: moment().format('X'),
                    who: "Welcome",
                    text: "Enter a message to talk to your opponent."
                }, {
                    ts: moment().format('X'),
                    who: "Welcome",
                    text: "Press 'RESET GAME DATA' and refresh pages to reset the game completly"
                }, {
                    ts: moment().format('X'),
                    who: "Welcome",
                    text: "Your player is in green, select an icon to play"
                }
            ],
            players: [
                {
                    id: 0,
                    name: "",
                    player: "",
                    selection: ""
                }, {
                    id: 1,
                    name: "",
                    player: "",
                    selection: ""
                }
            ]
        }
    },
    me: {
        name: "",
        player: ""
    },

    ptrName: "",
    ptrName: "",
    ptrPromise: "",
    ptrLoginButton: "",
    ptrWarning: "",
    ptrLoginSection: "",
    ptrLoggedIn: "",
    ptrResetButton: "",
    ptrGameInProgress: "",
    ptrPromise: "",
    ptrLoginButton: "",
    ptrWarning: "",
    ptrLoginSection: "",
    ptrLoggedIn: "",
    ptrResetButton: "",
    ptrGameInProgress: "",
    ptrPlayerName: [
        "", ""
    ],
    ptrWeapons: "",
    ptrChatDisplayZone: "",
    ptrChatInput: "",
    ptrZone1: "",
    ptrZone2: "",
    ptrZone3: "",
    ptrRounds: "",
    ptrWins: "",
    ptrLosses: "",
    ptrTies: "",
    selection: [
        "", ""
    ],
    comTemplate: "",
    rounds: 5,
    wins: 0,
    losses: 0,
    ties: 0,
    scoreing: {
        'rock-paper': 1,
        'paper-scissors': 1,
        'scissors-rock': 1,
        'paper-rock': 0,
        'rock-scissors': 0,
        'scissors-paper': 0,
        'paper-paper': -1,
        'scissors-scissors': -1,
        'rock-rock': -1
    },

    'fireBaseConfig': {
        apiKey: "AIzaSyCBWHV-dS9yN-ULjRItoa0ObQkjVlrZmBQ",
        authDomain: "rpsgame-694b2.firebaseapp.com",
        databaseURL: "https://rpsgame-694b2.firebaseio.com",
        storageBucket: "rpsgame-694b2.appspot.com",
        messagingSenderId: "90127503692"
    },

    startup: function() {
        console.log("Function: startup");
        // Here is the one-time grab of all the document elements that we'll be using.
        rps.ptrName = document.getElementById('name');
        rps.ptrPromise = document.getElementById('promise');
        rps.ptrLoginButton = document.getElementById('login-button');
        rps.ptrWarning = document.getElementById('you-must-promise');
        rps.ptrLoginSection = document.getElementById("login-section");
        rps.ptrLoggedIn = document.querySelectorAll(".logged-in");
        rps.ptrResetButton = document.getElementById("reset-data");
        rps.ptrGameInProgress = document.getElementById("game-in-progress");

        rps.ptrPlayerName[0] = document.querySelector(".zone1 .player-name");
        rps.ptrPlayerName[1] = document.querySelector(".zone3 .player-name");
        rps.ptrWeapons = document.getElementById("weapons");
        rps.ptrChatDisplayZone = document.getElementById("chat-box");
        rps.ptrChatInput = document.getElementById("chat-input");
        rps.ptrZone1 = document.querySelector(".zone1");
        rps.ptrZone2 = document.querySelector(".zone2");
        rps.ptrZone3 = document.querySelector(".zone3");
        rps.ptrRounds = document.querySelector(".rounds");
        rps.ptrWins = document.querySelector(".wins");
        rps.ptrLosses = document.querySelector(".losses");
        rps.ptrTies = document.querySelector(".ties");

        rps.ptrRounds.innerHTML = rps.rounds;

        firebase.initializeApp(rps.fireBaseConfig);
        rps.db = firebase.database();
        console.log('Firebase initialized.');

        rps.ptrName.addEventListener('keypress', rps.nameEntered);
        rps.ptrLoginButton.addEventListener("click", rps.nameEntered);
        rps.ptrResetButton.addEventListener("click", rps.resetData);
        rps.ptrChatInput.addEventListener("keypress", rps.chatEntered);

        /* Grab a copy of the empty com object so we can reset the firebase
         * data if requested.  (There must be a better way to do this)
         */
        comTemplate = JSON.parse(JSON.stringify(rps.com));

        /* The data names below will be "watched", any changes to these elements
         * in the firebase database will be automatically reflected in the
         * json object named rps.com.data.{name-of-the-watched-value}
         *
         * Additionally, any value that is set with rps.set() while being
         * watched with rps.watch() will automatically be updated in all places;
         * Player1 browser, player2 browser and in the firebase database.
         *
         * This provides a convienient means to manage the important data
         * elements globally and with simplicity.
         */
        rps.watch("playerCount");
        rps.watch("state");
        rps.watch("users");
        rps.watch("selectCount");
        rps.watch("players/0");
        rps.watch("players/1");
        /* The data elements below will have a function associated with the
         * data element if firebase.  When the firebase value changes the
         * callback that is bound to that value by this function will be called.
         */
        rps.actOn("players/0/name", rps.setName1);
        rps.actOn("players/1/name", rps.setName2);
        rps.actOn("selectCount", rps.selectCountChanged);

        rps.db.ref("/data/chatHistory").on("child_added", rps.newChatLine);
        rps.db.ref('/data/players/0/selection').on("value", function(snap) {
            rps.selection[0] = snap.val()
        });
        rps.db.ref('/data/players/1/selection').on("value", function(snap) {
            rps.selection[1] = snap.val()
        });
    },
    /* This is an important "setter" that stores data in the "/data" already
     * in the firebase database.  This can be used in conjunction with the
     * watch() method, together they provide a means to manage global game
     * data.  "watched" values are immediately replicated in all client
     * instances when altered in the database via the set method.
     */
    set: function(key, value) {
        rps.db.ref("/data/" + key).set(value);
        rps.setGetLog("Set:", key, value);
    },
    /* This is essentially a "getter" method that will watch a specified
     * elements under the "/data" area of the database.  If a change is
     * noted this method will replicate the new data into the client's
     * rps.com.data.{name-of-the-watched-value} object.
     *
     * Watched values may be scalars or json objects.   :-)
     */
    watch: function(key) {
        rps.db.ref("/data/" + key).on("value", function(snap) {
            rps.com.data[key] = snap.val();
            rps.setGetLog("Get:", key, snap.val());
            console.log(rps.com.data);
        });
    },
    /* This logs set/get actions to the console.  It's a separate
     * method so that it can be turned off in a single place when
     * I no longer need it.
     */
    setGetLog: function(action, key, value) {
        console.log("SG:", action, key, value);
    },
    /* OK, a thing of beauty is a joy forever. . .
     * actOn: Using the same method as the watch method, we'll "watch" for changes on
     * individual data elements and act (callback) on any change.
     */
    actOn: function(key, callback) {
        rps.db.ref("/data/" + key).on("value", callback);
    },

    setName1: function() {
        var snap = arguments[0];
        rps.ptrPlayerName[0].innerHTML = snap.val();
    },

    setName2: function() {
        var snap = arguments[0];
        rps.ptrPlayerName[1].innerHTML = snap.val();
    },

    selectCountChanged: function() {
        var snap = arguments[0];
        var selectCount = snap.val();

        switch (selectCount) {
            case 0:
                // noop
                break;
            case 1:
                // noop
                break;
            case 2:
                rps.generateResults();
                rps.set("selectCount", 0);
                break;
        }
    },

    resetCounts: function() {
        rps.ptrWins.innerHTML = 0;
        rps.ptrLosses.innerHTML = 0;
        rps.ptrTies.innerHTML = 0;
        rps.ptrRounds = rps.rounds;
    },

    generateResults: function() {
        console.log("generateResults:", rps.com.data);
        var mySelection;
        var yourSelection;

        if (rps.me.id === 0) {
            mySelection = rps.selection[0];
            yourSelection = rps.selection[1];
        } else {
            mySelection = rps.selection[1];
            yourSelection = rps.selection[0];
        }

        console.log("My selection was : " + mySelection);
        console.log("Other selection  : " + yourSelection);

        rps.localChat("Your opponent selected " + yourSelection, "RPS");
        rps.showYourSelection(yourSelection);

        var scoreKey = mySelection + "-" + yourSelection;

        var result = rps.scoreing[scoreKey];

        switch (result) {
            case - 1:
                // Tie
                console.log("TIE");
                rps.localChat("Tie", "RPS");
                rps.ptrTies.innerHTML = ++rps.ties;
                break;
            case 0:
                // I won
                console.log("I WON");
                rps.localChat("You won", "RPS");
                rps.ptrWins.innerHTML = ++rps.wins;
                break;
            case 1:
                // You won
                console.log("YOU WON");
                rps.localChat("You lost", "RPS");
                rps.ptrLosses.innerHTML = ++rps.losses;
                break;
        }

        rps.ptrRounds.innerHTML = --rps.rounds;

        if (rps.rounds === 0) {
            rps.gameOver();
        } else {
            setTimeout(rps.nextRound, 2000);
        }
    },

    gameOver: function() {
        rps.cleanUpForTheNextRound();
        rps.localChat("GAME OVER");
        var message;
        rps.disableAllIcons();

        if (rps.wins === rps.losses) {
            rps.localChat("It was a tie game.", "RPS");
        } else {
            if (rps.wins > rps.losses) {
                rps.localChat("You were the winner.", "RPS");
                $("#modal-message").text( "You were the winner!")
            } else {
                rps.localChat("You were the loser.", "RPS");
                $("#modal-message").text( "You were the loser!")
            }
        }
        $("#myModal").modal();
        rps.resetData();
        rps.resetCounts();
        rps.cleanUpForTheNextRound();
        $('#myModal').on('hidden.bs.modal', function () {
            location.reload();
        })
    },

    nextRound: function() {
        rps.cleanUpForTheNextRound();
    },

    showYourSelection: function(selected) {
        var ptrMyIcons = document.querySelectorAll(".enemy img");
        Array.from(ptrMyIcons).forEach(p => p.classList.add("dim"));
        var ptrSelected = document.querySelector(".enemy img[data-what='" + selected + "']")
        console.log("PTRSELECTED: ", ptrSelected);
        ptrSelected.classList.remove("dim");
    },

    localChat: function(text, pWho) {
        var who = pWho || rps.me.name;
        var msg = document.createElement("span");
        msg.innerHTML = "<i><b>" + who + ": </b>" + text + "</i><br>";
        rps.ptrChatDisplayZone.appendChild(msg);
        rps.ptrChatDisplayZone.scrollTop = rps.ptrChatDisplayZone.scrollHeight;
    },

    newChatLine: function() {
        var snap = arguments[0].val();
        var msg = document.createElement("span");
        msg.innerHTML = "<b>" + snap.who + ": </b>" + snap.text + "<br>";
        rps.ptrChatDisplayZone.appendChild(msg);
        rps.ptrChatDisplayZone.scrollTop = rps.ptrChatDisplayZone.scrollHeight;
    },

    updateState: function(snap) {
        var newState = snap.val();
        rps.state = newState;
        console.log("State of play is now: " + newState);
    },

    initializeData: function(snap) {
        var com = snap.val();
        console.log("initializeData: ", com);
        rps.state = com.data.state;
        rps.com.data.playerCount = com.data.playerCount;

        rps.db.ref().off("value");
    },

    resetData: function() {
        console.log("Resetting firebase game data.");
        rps.db.ref().set(comTemplate);
    },

    chatEntered: function(e) {
        var key = e.charCode || e.which;
        if (e.type = "keypress" && key != 13)
            return;
        var text = this.value;
        this.value = "";
        rps.addChat(text);
    },

    addChat(text, who) {
        var sender = who || rps.me.name;
        console.log("Chat entered: ", text);
        rps.db.ref("/data/chatHistory").push({who: sender, ts: moment().format("X"), text: text});
    },

    nameEntered: function(e) {
        var key = e.charCode || e.which;

        if (e.type === 'keypress' && key !== 13) {
            return false;
        }
        console.log("nameEntered");

        if (rps.com.data.state === "gameOn") { // Game is already in progress, display only
            rps.ptrGameInProgress.style.display = "block";
            rps.readOnly = true;
            return false;
        }

        var name = rps.ptrName.value;
        var promise = rps.ptrPromise.checked;
        console.log("Name = " + name, ", Promise = ", promise);
        if (promise === false) {
            rps.ptrWarning.style.display = "block";
            return false;
        }
        rps.ptrLoginSection.style.display = "none";
        Array.from(rps.ptrLoggedIn).forEach(d => d.style.display = "block");
        rps.ptrResetButton.classList.remove("disabled");

        rps.me.name = name;
        rps.me.id = rps.com.data.playerCount;
        rps.me.player = "player" + (rps.me.id + 1);

        if (rps.me.id === 0) {
            rps.ptrZone1.classList.add("my-zone");
            rps.ptrZone3.classList.add("enemy");
        } else {
            rps.ptrZone3.classList.add("my-zone");
            rps.ptrZone1.classList.add("enemy");
        }

        rps.activateIcons();

        rps.set("playerCount", ++rps.com.data.playerCount);
        rps.set("players/" + rps.me.id, rps.me);

        if (rps.com.data.state === "ready") {
            rps.set("state", "Player1");
        } else if (rps.com.data.state === "Player1") {
            rps.set("state", "gameOn");
        }
        e.preventDefault();
    },

    activateIcons: function() {
        var ptrIconsAll = document.querySelectorAll(".my-zone img");
        Array.from(ptrIconsAll).forEach(i => i.addEventListener("click", rps.weaponSelected));
    },

    disableAllIcons: function() {
        var ptrMyIcons = document.querySelectorAll(".weapons img");
        Array.from(ptrMyIcons).forEach(p => p.removeEventListener("click", rps.weaponSelected));
        Array.from(ptrMyIcons).forEach(p => p.classList.remove("dim"));
    },

    weaponSelected: function(e) {
        var ptrMyIcons = document.querySelectorAll(".my-zone img");
        Array.from(ptrMyIcons).forEach(p => p.removeEventListener("click", rps.weaponSelected));
        Array.from(ptrMyIcons).forEach(p => p.classList.add("dim"));
        this.classList.remove("dim");
        console.log(this);
        rps.localChat(rps.me.name + " Selected " + this.dataset.what, "RPS");
        rps.set("players/" + rps.me.id + "/selection", this.dataset.what);
        rps.set("selectCount", ++rps.com.data.selectCount);
    },

    cleanUpForTheNextRound() {
        var ptrIcons = document.querySelectorAll(".my-zone img, .enemy img");
        Array.from(ptrIcons).forEach(p => p.classList.remove("dim"));
        rps.activateIcons();
    }
}

window.onload = function() {
    console.log("Starting rps game.")
    rps.startup();
}
