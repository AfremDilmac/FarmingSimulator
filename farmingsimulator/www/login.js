(function() {
    "use strict";
    /*jslint browser: true*/
    /*jslint devel: true*/
    let baseApiAddress = "https://dilmac.be/wm/api/api/";
    /* Vorige lijn aanpassen naar de locatie op jouw domein! */
    const lblRegister = document.getElementById("lblregister");
    const lblLogin = document.getElementById("lbllogin");
    let registerForm = document.querySelector('.lgn');
    let loginForm = document.querySelector('.rgst');
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

    lblRegister.addEventListener("click", function(){
        registerForm.style.display = "none";
        loginForm.style.display = "block";

    });

    lblLogin.addEventListener("click", function(){
        registerForm.style.display = "block";
        loginForm.style.display = "none";
    })

    function getApiGebruiker() {
        // een ONVEILIGE manier om gebruikersgegevens te testen

        let url = baseApiAddress + "LOGIN.php";
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
                    console.log("Login mislukt : deze naam/paswoord combinatie bestaat niet");
                  
                    // return, zodat de rest van de fetch niet verder uitgevoerd wordt
                    return;
                }

                // de verwerking van de data
                var list = responseData.data;

                if (list.length > 0) {
                    // list bevat minstens 1 itemproperty met waarde
                    // we nemen het eerste
                    console.log("Gebruikersgevens ok : ID = " + list[0].ID);
                    window.location.href = "game.html";
                } else {
                    console.log("Login failed : this login/password combination does not exist");
                }

            })
            .catch(function(error) {
                // verwerk de fout
                console.log("fout : " + error)
            });
    }

    function addApiGebruiker() {
        // de producten van de server opvragen en weergeven dmv de alerter functie
        let url = baseApiAddress + "REGISTERadd.php";

        // body data type must match "Content-Type" header
        opties.body = JSON.stringify({
            NAME: document.getElementById("nameregister").value,
            PW: document.getElementById("pwdregister").value,
            format: "json"
        });
        console.log(opties.body);
        // test de api
        fetch(url, opties)
            .then(function(response) {
                console.log('Response: ' + response.body);
            })
            .catch(function(err) {
                console.log('Error: ' + err);
            });
    }

    // EventListeners
    document.getElementById("btnTestLogin").addEventListener("click", function() {
        getApiGebruiker();
    });

    document.getElementById("btnTestRegister").addEventListener("click", function() {
        addApiGebruiker();
    });

})();