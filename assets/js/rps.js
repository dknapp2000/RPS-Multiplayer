
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
            chatHistory: [ {
                ts: moment().format('X'),
                who: "RPS",
                text: "Would you like to play a game?"
            }]
        }
    },
    me: { name: "", player: ""},

    ptrName: "",
    ptrPromise: "",
    ptrLoginButton: "",
    ptrWarning: "",
    ptrLoginSection: "",
    ptrLoggedIn: "",
    ptrResetButton: "",
    ptrGameInProgress: "",

    comTemplate: "",

    'fireBaseConfig' : {
        apiKey: "AIzaSyCBWHV-dS9yN-ULjRItoa0ObQkjVlrZmBQ",
        authDomain: "rpsgame-694b2.firebaseapp.com",
        databaseURL: "https://rpsgame-694b2.firebaseio.com",
        storageBucket: "rpsgame-694b2.appspot.com",
        messagingSenderId: "90127503692"
    },

    startup: function() {
        console.log( "Function: startup");
        ptrName = document.getElementById('name');
        ptrPromise = document.getElementById('promise');
        ptrLoginButton = document.getElementById('login-button');
        ptrWarning = document.getElementById( 'you-must-promise' );
        ptrLoginSection = document.getElementById("login-section" );
        ptrLoggedIn = document.querySelectorAll(".logged-in");
        ptrResetButton = document.getElementById( "reset-data" );
        ptrGameInProgress = document.getElementById( "game-in-progress" );

        firebase.initializeApp(rps.fireBaseConfig);
        rps.db = firebase.database();
        console.log('Firebase initialized.');

        ptrName.addEventListener('keypress', rps.nameEntered );
        ptrLoginButton.addEventListener( "click", rps.nameEntered );
        ptrResetButton.addEventListener( "click", rps.resetData );

        // Grab a copy of the empty com object so we can reset the firebase data if requested.
        comTemplate = JSON.parse( JSON.stringify( rps.com ) );
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
        rps.watch( "playerCount" );
        rps.watch( "state" );
        rps.watch( "users" );
    },
    /* This is an important "setter" that stores data in the "/data" already
     * in the firebase database.  This can be used in conjunction with the
     * watch() method, together they provide a means to manage global game
     * data.  "watched" values are immediately replicated in all client
     * instances when altered in the database via the set method.
     */
    set: function( key, value ) {
        rps.db.ref("/data/" + key ).set( value );
        rps.setGetLog( "Set:", key, value );
    },
    /* This is essentially a "getter" method that will watch a specified
     * elements under the "/data" area of the database.  If a change is
     * noted this method will replicate the new data into the client's
     * rps.com.data.{name-of-the-watched-value} object.
     *
     * Watched values may be scalars or json objects.   :-)
     */
    watch: function( key ) {
        rps.db.ref("/data/" + key).on("value", function( snap ) {
            rps.com.data[key] = snap.val();
            rps.setGetLog( "Get:", key, snap.val());
        });
    },

    setGetLog: function( action, key, value ) {
        console.log( "SG:", action, key, value );
    },

    updateState: function( snap ) {
        var newState = snap.val();
        rps.state = newState;
        console.log( "State of play is now: " + newState );
    },

    initializeData: function( snap ) {
        var com = snap.val();
        console.log( "initializeData: ", com );
        rps.state = com.data.state;
        rps.com.data.playerCount = com.data.playerCount;

        rps.db.ref().off("value");
    },

    resetData: function() {
        console.log( "Resetting firebase game data." );
        rps.db.ref().set( comTemplate );
    },

    nameEntered: function(e) {
        var key = e.charCode || e.which;
        console.log( "nameEntered" );

        if ( e.type === 'keypress' && key !== 13) {
            return false;
        }
        if ( rps.com.data.state === "gameOn" ) {  // Game is already in progress, display only
            ptrGameInProgress.style.display = "block";
            rps.readOnly = true;
            return false;
        }

        var name = ptrName.value;
        var promise = ptrPromise.checked;
        console.log( "Name = " + name, ", Promise = ", promise );
        if ( promise  === false ) {
            ptrWarning.style.display = "block";
            return false;
        }
        ptrLoginSection.style.display = "none";
        Array.from( ptrLoggedIn ).forEach( d => d.style.display = "block" );
        ptrResetButton.classList.remove("disabled");

        rps.me.name = name;
        rps.me.id = rps.com.data.playerCount;
        rps.set("playerCount", ++rps.com.data.playerCount );
        rps.set("players/" + rps.me.id, rps.me );

        if ( rps.com.data.state === "ready" ) {
            rps.set( "state", "Player1" );
        } else if ( rps.com.data.state === "Player1" ) {
            rps.set( "state", "gameOn" );
        }
        e.preventDefault();
    }
}

window.onload = function() {
    console.log( "Starting rps game.")
    rps.startup();
}
