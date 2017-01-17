
var rps = {
    'ptrChatEntryZone': document.getElementById('chat-form'),
    'ptrChatDisplayZone': document.querySelector('.chat-history'),
    'control': 1,   // the id of the controlling player
    'db': '',

    'fireBaseConfig': {
      apiKey: "AIzaSyCBWHV-dS9yN-ULjRItoa0ObQkjVlrZmBQ",
      authDomain: "rpsgame-694b2.firebaseapp.com",
      databaseURL: "https://rpsgame-694b2.firebaseio.com",
      storageBucket: "rpsgame-694b2.appspot.com",
      messagingSenderId: "90127503692"
    },

    'payload' : { 'rps': {
            'players': 0,
            'player': [ {
                'name': "",
                'choice': ""
            }, {
                'name': "",
                'choice': ""
            } ],
            'score': {
                'player1': 0,
                'player2': 0
            },
            'chat': [ 'Are you ready to play?',
                      'You betchya I am!' ],
            'guests': [ ]
        }
    },

    'startup': function() {
        console.log( "Starting RPS game.");

        firebase.initializeApp(rps.fireBaseConfig);
        console.log( 'Firebase initialized.' );
        rps.db = firebase.database();

        rps.db.ref().set( rps.payload );

        rps.db.ref('/rps').on('value', rps.liveUpdate );

        rps.ptrChatEntryZone = document.getElementById('chat-form' );
        rps.ptrChatEntryZone.addEventListener( "keypress", rps.chatEnter );

        rps.ptrLoginName = document.getElementById("login-name");
        rps.ptrLoginName.addEventListener("keypress", rps.logInName );
    },

    'logInName': function(e) {
        var key = e.charCode ;//|| e.which;
        if ( key !== 13 ) return;
        var name = this.value;
        console.log( this );
        this.value = "";

        players = rps.payload.rps.players;
        if ( players >= 2 ) {
            alert( "Sorry, only two players at a time.");
            return false;
        }
        rps.payload.rps.players = players;

        rps.payload.rps.player[players].name = name;
        rps.payload.rps.players++;

        rps.dump();
        rps.updateDB();
        e.preventDefault();
    },

    'dump': function() {
        console.log( rps.payload );
    },

    'updateDB': function() {
        rps.db.ref().set( rps.payload );
    },

    'chatEnter': function chatOut(e) {
        var key = e.charCode; // || e.which;
        if ( key !== 13 ) return;
        var chatString = this.value;
        console.log( chatString );
        this.value = "";
        rps.payload.rps.chat.push( chatString );
        rps.db.ref().set( rps.payload );

    },

    'liveUpdate': function(snapshot) {
        console.log( 'Live update.' );
        console.log( snapshot );  ///////// Having trouble getting the values back from firebase.
    }
}

window.onload = function() {
    console.log( "Starting" );
    rps.startup();
}
