

(function() {
    "use strict";
    /*jslint browser: true*/
    /*jslint devel: true*/
    let baseApiAddress = "https://dilmac.be/farmingSimulator/src/php/";
    /* Vorige lijn aanpassen naar de locatie op jouw domein! */

    let alertEl = document.getElementById("loginverification");
    const lblRegister = document.getElementById("lblregister"); 
    const lblLogin = document.getElementById("lbllogin");
    let registerForm = document.querySelector('.lgn');
    let loginForm = document.querySelector('.rgst');
    let btnCreateAccount = document.getElementById("btnTestRegister");
    const nameRegister = document.getElementById("nameregister");
    const passwordRegister = document.getElementById("pwdregister");
    let unknown = 0;

   
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

    btnCreateAccount.addEventListener("click", function(){

    })

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
                    alertEl.innerHTML = "Login mislukt : deze naam/paswoord combinatie bestaat niet"
                    // return, zodat de rest van de fetch niet verder uitgevoerd wordt
                    return;
                }

                // de verwerking van de data
                var list = responseData.data;

                if (list.length > 0) {
                    // list bevat minstens 1 itemproperty met waarde
                    // we nemen het eerste
                    console.log("Gebruikersgevens ok : ID = " + list[0].ID)
                    
                    window.location.href = "game.html";
                } else {
                   
                    unknown++;
                    
                }

            })
            .catch(function(error) {
                // verwerk de fout
               
                console.log("fout : " + error)
            });
    }

    function addApiGebruikers() {
        // de producten van de server opvragen en weergeven dmv de alerter functie
        let url = baseApiAddress + "register.php";

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
    document.getElementById("btnTestLogin").addEventListener("click", function(event) {
        
        getApiGebruiker();
        if (unknown > 0) {
            event.preventDefault()
            alertEl.innerHTML = "Login mislukt : deze naam/paswoord combinatie bestaat niet"
        }

    });

    document.getElementById("btnTestRegister").addEventListener("click", function(event) {
        if (nameRegister.value && passwordRegister.value != "") {
            addApiGebruikers()       
        }
        else{
            event.preventDefault()
           
        }
       
    });



})();