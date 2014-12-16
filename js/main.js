/**
 * Created by Sara on 12/1/14.
 */

var songs;

//template variable
var genreLinkTemplate, songLinkTemplate, songInfoTemplate;

$(document).ready(function() {

    //get references to DOM elements
    var contentDiv = $("#content");
    var songInfoDiv = $("#info");
    var browseDiv = $("#browse");
    var genreDiv = $("#genres");
    var playlistDiv = $("#playlist");
    var resultsDiv = $("#searchResults");
    var musicProgress = $('#musicProgress');
    var soundStatus = $('#soundStatus');
    var timeDiv = $('#soundTime');
    var audioTag = document.querySelector('#audioThing');

    var playing = false;
    var playlist = [];
    var current = 0;
    var chosenPlaylist = playlist[current];
    //waits for all the functions in the argument list to finish
    //doing the done half

    function updateCurrent(){
        chosenPlaylist = playlist[current];
    };

    function timeMeter(){
        setInterval(function() {
            if(playing) {
                musicProgress.val(  audioTag.currentTime / audioTag.duration * 100);
                timeDiv.html(Math.ceil(audioTag.currentTime) + "/" + Math.ceil(audioTag.duration));
                soundStatus.html("Playing");
            }

            if (audioTag.currentTime == audioTag.duration){
                if (current < playlist.length-1){
                    audioTag.pause();
                    audioTag.currentTime = 0;
                    console.log(audioTag.currentTime);
                    current += 1;
                    audioTag.src=playlist[current];
                    audioTag.play();
                }}

        }, 100)
    }


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

            //store data
            songs = data[0].songs;

            //append starting state
            genreDiv.html( genreLinkTemplate( data[0].genres));
            browseDiv.html( songLinkTemplate( data[0]));

        });
    //whenever you click a songlink in the content div
    $(".container").on("click", ".songLink", function(){
        //this is what was clicked
        //we can get anything with data on the element by using "data"
        //then the name after the dash
        var songId = $(this).data('id');
        //get the book object using underscore to find the result
        var songInfo = _.findWhere(songs, {id: songId});
        /*var song = _.findWhere(songs, {id:$(this).data('id')});
       console.log(song.imgFile);*/

        //Using the template add into the book info div
        songInfoDiv.html(songInfoTemplate(songInfo));
        //"<img src='" + this.data('img') + "' />" +


    });

    $(".container").on("click", ".add", function() {

        var myAudio = $(this).data('audio');
        console.log(myAudio);
        //myAudio.play();
        playlist.push(myAudio);
        console.log(playlist);

        var song = _.findWhere(songs, {id:$(this).data('id')});
        playlistDiv.append("<br />" + song.title + "<input type='button' class='remove' value = 'X'/>");
    });


    $(".container").on("click",".play", function(){
        playing = true;

        updateCurrent();
        audioTag.src = playlist[current];
        audioTag.load();
        console.log(audioTag);
        audioTag.play();

        timeMeter();
    });

    $(".container").on("click", ".pause", function(){
        playing = false;
        audioTag.pause();
        soundStatus.html("Paused");
    });

    $(".container").on("click", ".remove", function(){

    });

    $(".container").on("click", "#changeSound", function(){
        if (current < playlist.length-1){
        playing = true;
        audioTag.pause();
        audioTag.currentTime = 0;
        current += 1;
        audioTag.src=playlist[current];
        audioTag.play();
        timeMeter();
        }

    })

    $(".container").on("click", "#previous", function(){
        if (current > 0){
            playing = true;
            audioTag.pause();
            audioTag.currentTime = 0;
            current -= 1;
            audioTag.src=playlist[current];
            audioTag.play();
            timeMeter();
        }
    });

    //Whenever you click on a genrelink in the container div
    $(".container").on("click", ".genreLink", function() {

        console.log("genreRun");
        //the textual name of the genre we're looking for
        var genreToFind = $(this).html();
        //an object to hold our results
        var results = {};
        //put the results onto a books property of an object
        results.songs = _.where(songs, { genre: genreToFind });
        console.log(results);
        console.log(genreToFind);
        //use the home template to show our results
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
});

//I'm making a change to test github!