var w;

var rps = {
    'ptrChatEntryZone': document.getElementById('chat-form'),
    'ptrChatDisplayZone': document.querySelector('.chat-history'),
    'control': 1, // the id of the controlling player
    'db': '',
    'me': {
        'name': "",
        'id': -1
    },

    'fireBaseConfig': {
        apiKey: "AIzaSyCBWHV-dS9yN-ULjRItoa0ObQkjVlrZmBQ",
        authDomain: "rpsgame-694b2.firebaseapp.com",
        databaseURL: "https://rpsgame-694b2.firebaseio.com",
        storageBucket: "rpsgame-694b2.appspot.com",
        messagingSenderId: "90127503692"
    },

    'rps': {
        'players': 0,
        'state': 'waiting',
        'player': [
            {
                'name': "",
                'choice': ""
            }, {
                'name': "",
                'choice': ""
            }
        ],
        'score': {
            'player1': 0,
            'player2': 0
        },
        'chat': [ { 'who': 'RPS',
                    'text': 'Gamed starting. . .',
                    'timestamp': moment().format("X") }
                ],
        'guests': []
    },

    'startup': function() {
        console.log("Starting RPS game.");

        firebase.initializeApp(rps.fireBaseConfig);
        console.log('Firebase initialized.');
        rps.db = firebase.database();

        // Set up the firebase events
        rps.db.ref('/rps').on('value', rps.liveUpdate);
        rps.db.ref('/rps/chat').on('child_added', rps.chatUpdate);
        rps.db.ref('/state').on('value', rps.stateChange);

        // Identify the DOM elements that we will use
        rps.ptrChatEntryZone = document.getElementById('chat-form');
        rps.ptrChatEntryZone.addEventListener("keypress", rps.chatEnter);

        rps.ptrLoginName = document.getElementById("login-name");
        rps.ptrLoginName.addEventListener("keypress", rps.logInName);

        rps.ptrChatDisplayZone = document.querySelector('.chat-history');
    },

    stateChange: function(snap) {
        var state = snap.val();
        console.log( 'stateChange' );

        switch (state) {
            case 'waiting':
                return false;
                break;
            case 'player1':
                rps.sendChat('rps', 'State = ' + state);
                break;
            case 'playing':
                rps.sendChat('rps', 'State = ' + state);
                break;
        }

    },

    'logInName': function(e) {

        var key = e.charCode; //|| e.which;
        if (key !== 13)
            return;
        var name = this.value;
        console.log(this);
        this.value = "";

        players = rps.rps.players;

        if (players === 0) {
            // Set my local identitiy, player[0] is controls the game
            rps.me.name = name;
            rps.me.id = players;
            // set the first players info in the payload
            rps.rps.players++;
            rps.rps.state = 'player1';
            rps.rps.player[players].name = name;
            //ptrLoginName.disabled = true;

        } else if (players === 1) {
            // set the second players info in the payload
            rps.rps.players++;
            rps.rps.state = 'playing';
            rps.rps.player[players].name = name;

        } else if (players >= 2) {
            alert("Sorry, only two players at a time.");
        }
        e.preventDefault();

        rps.chat(name, "Is player " + rps.rps.players);
        rps.dump();
        rps.updateDB();
    },

    'chat': function(pWho, pText) {
        console.log("chat:", pWho, pText);
        var timestamp = moment().format("X");
        rps.db.ref('/chat').push({'who': pWho, 'text': pText, 'ts': timestamp });
        //rps.db.ref('/chat').push({'who': pWho, 'text': pText });
    },

    'dump': function() {
        console.log(rps.rps);
    },

    'updateDB': function() {
        rps.db.ref().set(rps.rps);
    },

    'liveUpdate': function(snapshot) {
        console.log('Live update.');
        var data = snapshot.val();

        // If no data is returned, then initialize the database
        if (data === null) {
            console.log( "populating the dataset with: ", rps.rps )
            rps.db.ref().set(rps.rps);
            data = rps.rps;
        }

        console.log('FBData:', JSON.stringify(data));
        w = snapshot;

        //rps.chatDisplay( data );
        rps.play(data);
    },

    'play': function(data) {
        var state = data.state;
        console.log("Current state is: " + state);

        if (state === "playing") {
            rps.preparePlayerAreas(data);
        }
    },

    'preparePlayerAreas': function() {},

    'chatEnter': function chatOut(e) {
        var key = e.charCode; // || e.which;
        if (key !== 13)
            return;
        var chatString = this.value;
        this.value = "";
        rps.sendChat(rps.me.name, chatString);
    },

    // Push a chat entry up to the server (the on value with popluate the chatbox)
    sendChat: function(pWho, pText) {
        rps.rps.chat.push({
            who: pWho || 'Unkwn',
            text: pText || ""
        });
        rps.db.ref("/rps/chat").push(rps.rps.chat);
    },

    chatUpdate: function(pSnap) {
        console.log("Entered rps.chatupdate: ", pSnap.val());
        var msg = pSnap.val();

        rps.ptrChatDisplayZone.innerHTML = "";

        for (var i = 0; i < msg.length; i++) {
            console.log(msg[i].who + ":" + msg[i].text);
            var m = document.createElement("span");
            var s = "<b>" + msg[i].who + ": </b>" + msg[i].text + "<br>";
            m.innerHTML = s;
            console.log(m);
            rps.ptrChatDisplayZone.append(m);
        }
    }
}

window.onload = function() {
    console.log("Starting");
    rps.startup();
}
