var rps = {
    'ptrChatEntryZone' : document.getElementById('chat-form'),
    'ptrChatDisplayZone' : document.querySelector('.chat-history'),
    ptrResetButton: "",
    'control' : 1, // the id of the controlling player
    'db' : '',
    'me' : {
        'name': "",
        'id': -1
    },

    db: "",

    com: {
        players: [ { name: "", choice: ""  }, { name: "", choice: "" }],
        chat: [ { ts: moment().format("X"), who: "rps", text: "Game starting" }],
        history: [],
        state: "fresh",
        waitingForPlayer: 0,
    },

    comTemplate: "",

    'fireBaseConfig' : {
        apiKey: "AIzaSyCBWHV-dS9yN-ULjRItoa0ObQkjVlrZmBQ",
        authDomain: "rpsgame-694b2.firebaseapp.com",
        databaseURL: "https://rpsgame-694b2.firebaseio.com",
        storageBucket: "rpsgame-694b2.appspot.com",
        messagingSenderId: "90127503692"
    },

    startup : function() {
        console.log("Starting RPS game.");
        //rps.comTemplate = JSON.stringify( rps.com );
        rps.comTemplate = rps.com;
        console.log( rps.comTemplate );

        firebase.initializeApp(rps.fireBaseConfig);
        console.log('Firebase initialized.');
        rps.db = firebase.database();
        rps.ptrResetButton = document.querySelector('#reset-button');
        rps.ptrResetButton.addEventListener("click", rps.resetGameData );

        rps.ptrSignInButton = document.getElementById("sign-in");
        rps.ptrSignInButton.addEventListener("click", rps.signIn );

        rps.ptrLoginName = document.getElementById("login-name");
        rps.ptrLoginName.addEventListener("keypress", rps.signIn );

        ptrChatDisplayZone = document.querySelector('.chat-history');

        rps.db.ref("/waitingForPlayer").on("value", rps.setWaitingForPlayer );
    },

    setWaitingForPlayer: function( snap ) {
        rps.com.waitingForPlayer = snap.val();
        console.log( rps.com );
        console.log( rps.comTemplate );
        console.log( "Now waiting for player: " + rps.com.waitingForPlayer );
    },

    signIn: function(e) {
        var key = e.charCode || e.which;
        if (key !== 13) {
            return false;
        }
        var name = this.value
        this.value = "";
        console.log( "Signing in user: ", name );
        var player = {};
        var pid = rps.com.waitingForPlayer;

        player.name = name;
        player.id = pid;

        rps.com.players[pid] = player;
        console.log( "Player: " + player );
        rps.db.ref("/players/" + pid ).set( player );
        rps.com.waitingForPlayer++;
        rps.db.ref("/waitingForPlayer").set( rps.com.waitingForPlayer );
        e.preventDefault();
    },

    resetGameData: function(e) {
        e.preventDefault();
        console.log( "Resetting game data.");
        rps.com.waitingForPlayer = 0;

        console.log( rps.comTemplate );
        console.log( rps.com );
        rps.db.ref().set( rps.comTemplate );
        ptrChatDisplayZone.text = "";
    }
}

window.onload = function() {
    rps.startup();
}
