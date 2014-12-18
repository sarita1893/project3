/**
 * Created by Sara on 12/1/14.
 */

var songs;

//template variables
var genreLinkTemplate, songLinkTemplate, songInfoTemplate;

$(document).ready(function() {

    //get references to DOM elements
    var contentDiv = $("#content");
    var songInfoDiv = $("#info");
    var browseDiv = $("#browse");
    var genreDiv = $("#genres");
    var gameDiv = $("#games");
    var playlistDiv = $("#playlist");
    var resultsDiv = $("#searchResults");
    var musicProgress = $('#musicProgress');
    var soundStatus = $('#soundStatus');
    var timeDiv = $('#soundTime');
    var audioTag = document.querySelector('#audioThing');

    //other global variables
    var genreClick = false;
    var gameClick = false;
    var firstPlay = true;
    var playing = false;
    var playlist = [];
    var current = 0;
    var chosenPlaylist = playlist[current];
    var playOrder = 0;


    //My functions

    //This function updates the playlist whenever the play button is pressed
    function updateCurrent(){
        chosenPlaylist = playlist[current];
    };

    //This function allows the input range to get a new reference to the audioTag whenever it's changed
    function timeMeter(){
        setInterval(function() {
            if(playing) {
                musicProgress.val(  audioTag.currentTime / audioTag.duration * 100);
                timeDiv.html((Math.floor(audioTag.currentTime/60)) + ":" + (Math.ceil(audioTag.currentTime % 60))
                            + " / " + (Math.floor(audioTag.duration/60)) + ":" + (Math.ceil(audioTag.duration % 60)));
                soundStatus.html("Playing");
            }

            //This part of the function makes sure that the music will switch to the next one in the playstlist
            //when the song is ended.
            if (audioTag.currentTime == audioTag.duration){
                if (current < playlist.length-1){
                    audioTag.pause();
                    audioTag.currentTime = 0;
                    current += 1;
                    audioTag.src=playlist[current].audioFile;
                    audioTag.play();

                    updateInfo();
                }}

        }, 100)
    }

    //This function updates all information on the screen so that it will pertain to the current song
    function updateInfo(){
        var newPic = playlist[current].imgFile;
        var newText = playlist[current].infoText;
        var newTitle = playlist[current].title;

        $("#gameInfoDiv").html("<img src='" + newPic + "' />" + newText);
        $("#soundTitle").html(newTitle);

        songInfoDiv.html(songInfoTemplate(playlist[current]));
    }

    //AJAX and templates

    $.when(
            $.ajax("components/components.html"), //load component data
            $.getJSON('data/songs2.json') // load data data
    ).done(function( templateData, data){

            //wrap the template content in the jquery object
            var templates = $(templateData[0]);

            //compile templates
            genreLinkTemplate = Handlebars.compile( templates.find("#genreLinks").html());
            songLinkTemplate = Handlebars.compile( templates.find("#songHomeLinks").html());
            songInfoTemplate = Handlebars.compile( templates.find("#songInfo").html());
            gameLinkTemplate = Handlebars.compile( templates.find("#gameLinks").html());
            gameInfoTemplate = Handlebars.compile( templates.find ("#gameInfo").html());

            //store data
            songs = data[0].songs;

            //append starting state
            genreDiv.html( genreLinkTemplate( data[0].genres));
            browseDiv.html( songLinkTemplate( data[0]));
            gameDiv.html( gameLinkTemplate( data[0].games));

        });

    //Where things are clicked upon

    //This finds the object from the JSON and pushes it into a playlist array
    $(".container").on("click", ".add", function() {

        var audioId = $(this).data('id');
        var audioInfo = _.findWhere(songs, {id: audioId});

        playlist.push(audioInfo);

        //This part puts the title and button onto the DOM. The div has a order property which shows where
        //it is in the list and where the audio is in the array
        var song = _.findWhere(songs, {id:$(this).data('id')});
        playlistDiv.append("<div id='play" + playOrder + "'>" + "<br />" + song.title +
                           "<input type='button' class='remove' value = 'X' data-order = '" + playOrder + "'/>"
                            + "</div>");
        playOrder += 1;
    });

    //This handles the actual playing of songs using all previously defined functions.
    //After updating, it pulls the currently selected object from the playlist and uses its
    //audio file information as a source. It then changes the audioTag source to match.
    //It only grabs the information the first time, since all subsequent loads are done by
    //the next and previous buttons
    $(".container").on("click",".play", function(){
        playing = true;

        updateCurrent();

        if (firstPlay){
        var newAudio = playlist[current].audioFile;
        audioTag.src = newAudio;
        audioTag.load();
        firstPlay = false;
        }

        audioTag.play();

        updateInfo();

        timeMeter();
    });

    //The pause button grabs the audio tag (and whatever's loaded in it) and pauses it.
    $(".container").on("click", ".pause", function(){
        playing = false;
        audioTag.pause();
        soundStatus.html("Paused");
    });

    //This runs when the remove buttons are clicked. It grabs the number defined in the "playOrder" variable
    //from the "add" function. With this, it makes a new variable which is equal to the Div in the playlist's
    //ID. It then grabs that div and removes it. It also uses the number to remove the object at that point
    //in the array
    $(".container").on("click", ".remove", function(){
        var removeItem = $(this).data('order');
        var divCount = "play" + removeItem;
        var divId = $("#" + divCount);

        divId.remove();
        playlist.splice(removeItem, 1);
        console.log(playlist);

    });

    //This happens when the next button is clicked. It pauses any music playing, sets its time to 0,
    // then changes the "current" variable so that when the playlist[current] source is reloaded, it
    //will be pulling from a different object. It then updates the info and the range using predefined functions
    $(".container").on("click", "#changeSound", function(){
        if (current < playlist.length-1){
        playing = true;
        audioTag.pause();
        audioTag.currentTime = 0;
        current += 1;
        audioTag.src=playlist[current].audioFile;
        audioTag.play();
        updateInfo();
        timeMeter();
        }

    })

    //the previous button is the same as the next button. Just with a different change to the current.
    $(".container").on("click", "#previous", function(){
        if (current > 0){
            playing = true;
            audioTag.pause();
            audioTag.currentTime = 0;
            current -= 1;
            audioTag.src=playlist[current].audioFile;
            audioTag.play();
            updateInfo();
            timeMeter();
        }
    });

    //Whenever you click on a genrelink in the container div
    $(".container").on("click", ".genreLink", function() {
        //the textual name of the genre we're looking for
        var genreToFind = $(this).html();
        //an object to hold our results
        var results = {};
        //put the results onto a songs property of an object
        results.songs = _.where(songs, { genre: genreToFind });
        console.log(results);
        console.log(genreToFind);
        //use the home template to show our results
        resultsDiv.html( songLinkTemplate( results));
    });

    //This works the same as the genre link, just for the games
    $(".container").on("click", ".gameLink", function() {
        var gameToFind = $(this).html();
        var results = {};
        results.songs = _.where(songs, { game: gameToFind });
        resultsDiv.html( songLinkTemplate( results));

    });

    //search field
    $("#btnSearch").click(function() {
        console.log("searchRun");
        var searchTerm = $("#txtSearch").val();

        var results = {};

        //will only search titles and exact match names
        results.songs = _.filter(songs, function(item){
            //index of will return something greater than -1 if it finds it
            return (item.title.toUpperCase().indexOf(searchTerm.toUpperCase()) != -1);
        })

        resultsDiv.html(songLinkTemplate(results));
    })

    //This causes clicking the Genres: header to have all of the genre links appear or disappear
    //Likewise, if the Games: header is clicked, the genrelinks disappear
    $("#genreHead").click(function() {
       if (genreClick == false) {
           $(".genreLink").show("slow");
           $(".gameLink").hide("slow");
           genreClick = true;
           gameClick = false;
       } else if (genreClick) {
           $(".genreLink").hide("slow");
           genreClick = false;
       }
    })

    //The same as above, but pertaining to the Games header
    $("#gameHead").click(function(){
        if (gameClick == false) {
            $(".gameLink").show("slow");
            $(".genreLink").hide("slow");
            gameClick = true
            genreClick = false;
        } else if (gameClick) {
            $(".gameLink").hide("slow");
            gameClick = false;
        }
    })

    //This attempts to make the range input actually change the current time, allowing the user to
    //switch to a different point in the song. It works for exactly one song ("Fighting"), but the currentTime
    //REFUSES to change for the others. It's strange and unusual, but should in theory work.
    musicProgress.change( function(){
        var sliderPlace = musicProgress.val();
        console.log("slider val " + sliderPlace);
        var adjustedPlace = (sliderPlace * audioTag.duration) / 100;
        console.log("adjusted " + adjustedPlace);

        audioTag.currentTime = adjustedPlace;

        console.log("current " + audioTag.currentTime);

        timeMeter();
    })
});
