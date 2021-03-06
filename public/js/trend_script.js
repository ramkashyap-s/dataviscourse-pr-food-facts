


d3.csv("data/movie_metadata.csv", function (error, movies) {
    if (error) throw error;

    window.excelMovies = movies;
    window.allActors = getActors();
    window.allDirectors = getDirectors();

    //Initialize default values for the actor/director search filter
    updateSearchFilter("actor");

    //Render the plot for the default actor
    window.actorDirectorStats = new ActorDirectorStats("Actor", "Tom Hanks", getMoviesFor("actor", "Tom Hanks"), "imdb_score");
    actorDirectorStats.plot();

    d3.csv("data/correlation_matrix.csv", function (error, rows) {
        if (error) throw error;
        let corrMatrix = new CorrelationMatrix(rows);
        corrMatrix.create();

    });


    //Render the wordCloud for the default actor
    //let wordCloud = new WordCloud(getMoviesFor("actor", "Tom Hanks"));
    //wordCloud.update();

    //Prepare data for scatter plots
    let plotMovies = movies.map((d) => {
        return {"imdb_score": d["imdb_score"], "gross": d["gross"], "num_user_for_reviews": d["num_user_for_reviews"]};
    });

//     window.scPlot = new ScatterPlot();
    // scPlot.plot("num_critic_for_reviews", "movie_facebook_likes", "num_critic_for_reviews", "movie_facebook_likes");

    //Plot gross Vs rating
    // let grossVsRating = new ScatterPlot(plotMovies);
    // grossVsRating.plot("grossVsRating", "gross", "Gross");

    //Plot number of user reviews Vs rating
    // let reviewsVsRating = new ScatterPlot(plotMovies);
    // reviewsVsRating.plot("reviewsVsRating", "num_user_for_reviews", "Number of user reviews");

    /*
    //Plot duration Vs rating
    let durationVsRating = new ScatterPlot(plotMovies);
    durationVsRating.plot("durationVsRating", "duration", "Duration");

    //Plot Facebook likes Vs rating
    let likesVsRating = new ScatterPlot(plotMovies);
    reviewsVsRating.plot("likesVsRating", "movie_facebook_likes", "Facebook likes");
    */
});


/**
 *  Returns a sorted set of all (unique) actors
 */
function getActors() {

    //Get all actors
    let actor1names = excelMovies.map(d => d["actor_1_name"]);
    let actor2names = excelMovies.map(d => d["actor_2_name"]);
    let actor3names = excelMovies.map(d => d["actor_3_name"]);

    //Merge all actors and sort
    let actor123names = actor1names.concat(actor2names, actor3names).sort();

    let actors_set = new Set();
    let currentActor = actor123names[0];
    let currentActorCount = 0;

    for(let actorIndex = 0; actorIndex < actor123names.length; actorIndex++)
    {
        if(currentActor == actor123names[actorIndex])
        {
            currentActorCount++;
            if(currentActorCount == 2)  //Include actor if involved in at least 2 movies
                actors_set.add(currentActor)
        }
        else
        {
            currentActor = actor123names[actorIndex];
            currentActorCount = 1;
        }
    }

    //Drop undefined value
    actors_set.delete(undefined);

    return actors_set;
}

/**
 *  Returns a sorted set of all (unique) directors
 */
function getDirectors() {

    //Get all directors
    let directorNames = excelMovies.map(d => d["director_name"]);
    let directorNames_sorted = directorNames.sort();    //Sort

    let directors_set = new Set();
    let currentDirector = directorNames_sorted[0];
    let currentDirectorCount = 0;

    for(let directorIndex = 0; directorIndex < directorNames_sorted.length; directorIndex++)
    {
        if(currentDirector == directorNames_sorted[directorIndex])
        {
            currentDirectorCount++;
            if(currentDirectorCount == 2)  //Include director if involved in at least 2 movies
                directors_set.add(currentDirector)
        }
        else
        {
            currentDirector = directorNames_sorted[directorIndex];
            currentDirectorCount = 1;
        }
    }

    //Drop undefined value
    directors_set.delete(undefined);

    return directors_set;
}

/**
 *  Returns all movies associated for a given actor/director sorted by year
 */
function getMoviesFor(actorOrDirector, name) {

    let movies = [];
    let movies_set = new Set();

    if(actorOrDirector == "actor")
    {
        //Extract movies which involve the selected actor
        excelMovies.forEach((movie) => {

            if(!movies_set.has(movie["movie_title"]))   //Avoid movie duplication using set
            {
                if(movie["actor_1_name"] == name || movie["actor_2_name"] == name || movie["actor_3_name"] == name)
                {
                    if(!isNaN(parseInt(movie["title_year"])))
                    {
                        movies_set.add(movie["movie_title"]);
                        movies.push(movie);
                    }
                }
            }
        });
    }
    else
    {
        //Extract movies which involve the selected director
        excelMovies.forEach((movie) => {

            if(!movies_set.has(movie["movie_title"]))   //Avoid movie duplication using set
            {
                if(movie["director_name"] == name)
                {
                    if(!isNaN(parseInt(movie["title_year"])))
                    {
                        movies_set.add(movie["movie_title"]);
                        movies.push(movie);
                    }
                }
            }
        });
    }

    //Sort the movies by year
    movies = (movies).slice().sort(function (movie1, movie2) {

        if(parseInt(movie1["title_year"]) < parseInt(movie2["title_year"]))
            return -1;
        else if(parseInt(movie1["title_year"]) > parseInt(movie2["title_year"]))
            return 1;
        else
            return 0;
    });

    return movies;
}

/**
 *  Call the actor/director search filter updater and update the actor/director update button
 */
function switchActorDirector(choice) {

    updateSearchFilter(choice.value);
    document.getElementById("updateActorDirector").innerText = "Update " + choice.value;
}

/**
 *  Update the actor/director search filter based on actor/director radio button selection
 */
function updateSearchFilter(actorOrDirector) {

    let actorDirectorInput = document.getElementById("actorDirector_name");
    let actorDirectorList = document.getElementById("actorDirector_names");

    //Clear existing values
    actorDirectorInput.value = "";
    actorDirectorList.innerHTML = "";

    let frag = document.createDocumentFragment();

    if(actorOrDirector == "actor")
    {
        for (let actor of allActors)
        {
            let option = document.createElement("option");
            option.textContent = actor;
            option.value = actor;
            frag.appendChild(option);
        }

        //Add actor names to search filter
        document.getElementById("actorDirector_names").appendChild(frag);
        //Update the input placeholder
        actorDirectorInput.setAttribute("placeholder", "Search Actor");
    }
    else
    {
        for (let director of allDirectors)
        {
            let option = document.createElement("option");
            option.textContent = director;
            option.value = director;
            frag.appendChild(option);
        }

        //Add director names to search filter
        document.getElementById("actorDirector_names").appendChild(frag);
        //Update the input placeholder
        actorDirectorInput.setAttribute("placeholder", "Search Director");
    }
}

/**
 *  Update the actor/director trend plot based on selected parameters
 */
function updateTrendPlot() {

    let name = d3.select("#actorDirector_name").node().value;
    let selectedAttribute = d3.select("#attributes").node().value;
    let movies = [];
    let errorMessage = "";
    let errorDiv = document.getElementsByClassName("modal-body")[0];

    if(document.getElementsByName("actorOrDirector")[0].checked)    //If current radio button selection is "Actor"
    {
        if(!name && actorDirectorStats.actorOrDirector == "Actor")  //If name input empty, retrieve name from existing object
            name = actorDirectorStats.name;

        if(allActors.has(name)) //Ensure actor name passed is valid
        {
            movies = getMoviesFor("actor", name).filter((movie) => movie[selectedAttribute]);
            actorDirectorStats = new ActorDirectorStats("Actor", name, movies, selectedAttribute);
            actorDirectorStats.plot();

            //let wordCloud = new WordCloud(movies);
            //wordCloud.update();
        }
        else
        {
            errorMessage = "Invalid Actor name";
            errorDiv.innerText = errorMessage;
            $('#errorModal').modal('show');
        }
    }
    else    //If current radio button selection is "Director"
    {
        if(allDirectors.has(name))  //Ensure director name passed is valid
        {
            movies = getMoviesFor("director", name).filter((movie) => movie[selectedAttribute]);
            actorDirectorStats = new ActorDirectorStats("Director", name, movies, selectedAttribute);
            actorDirectorStats.plot();

            //let wordCloud = new WordCloud(movies);
            //wordCloud.update();
        }
        else
        {
            errorMessage = "Invalid Director name";
            errorDiv.innerText = errorMessage;
            $('#errorModal').modal('show');
        }
    }
}
