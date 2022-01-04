(function() {
    "use strict";
    /*jslint browser: true*/
    /*jslint devel: true*/
    let baseApiAddress = "https://dilmac.be/farmingSimulator/src/php/";
    /* Vorige lijn aanpassen naar de locatie op jouw domein! */

    let alertEl = document.getElementById("alert");
    let opties = {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "omit" // include, *same-origin, omit
            /* Opgelet : volgende headers niet toevoegen :
               JSON triggert de pre-flight mode, waardoor de toegang op
               deze manier niet meer zal lukken.
            */
            /*, headers: {
            	"Content-Type": "application/json",
            	"Accept": "application/json"
            }*/
    };

    function getApiGebruiker() {
        // een ONVEILIGE manier om gebruikersgegevens te testen

        let url = baseApiAddress + "login.php";
        // onze php api verwacht een paar parameters
        // we voegen deze toe aan de body van de opties

        // body data type must match "Content-Type" header
        opties.body = JSON.stringify({
            name: document.getElementById("login").value,
            password: document.getElementById("pwd").value,
            format: "json"
        });

        // test de api
        fetch(url, opties)
            .then(function(response) {
                return response.json();
            })
            .then(function(responseData) {
                // test status van de response        
                if (responseData.status < 200 || responseData.status > 299) {
                    // login faalde, boodschap weergeven
                    // Hier kan je ook een groter onderscheid maken tussen de verschillende vormen van login falen.
                    console.log("Login mislukt : deze naam/paswoord combinatie bestaat niet")
                    // return, zodat de rest van de fetch niet verder uitgevoerd wordt
                    return;
                }

                // de verwerking van de data
                var list = responseData.data;

                if (list.length > 0) {
                    // list bevat minstens 1 itemproperty met waarde
                    // we nemen het eerste
                    console.log("Gebruikersgevens ok : ID = " + list[0].ID)
<<<<<<< HEAD:farmingsimulator_build/dist/users.js
                    window.location.href = "game.html";
=======
                    window.location.href = "/dist/index.html";
>>>>>>> parent of cd7e218 (commit register + login css):farmingsimulator_build/src/users.js
                } else {
                    console.log("Login failed : this login/password combination does not exist");
                }

            })
            .catch(function(error) {
                // verwerk de fout
               
                console.log("fout : " + error)
            });
    }

    // EventListeners
    document.getElementById("btnTestLogin").addEventListener("click", function(event) {
        
        getApiGebruiker();
    });



})();