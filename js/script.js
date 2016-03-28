window.addEventListener('DOMContentLoaded', function(){
      var HTMLBallonElement;
      var collision;
      var tabScore = [];
      var score = 0;
      var scorre = document.getElementById("score");
      var scoreAdverse = document.getElementById("scoreAdv");
      var stopDetection;
      var requeteBallon;
      var victoire = 0;
      var defaite = 0;
      var partieJoue = 0;
      var detectionWinner = true;
      var preventBugScore = true;
      var requeteTableau = true;

  		// var socket = io.connect('http://ballonsblows.herokuapp.com');
      var socket = io.connect('http://192.168.0.30:1010');

      socket.emit('mySocketForConnect', {message:'texte d\'exemple'});
      socket.on('socketStored', function(data){
        $('.nbrConnection').text(data.message);
        console.log(data.message);
      });

     /////////////////Click du formulaire de l'inscription////////////////
     socket.emit
        $('#formSub').on('submit', function(event){
          event.preventDefault();
          $.ajax({
           type: "POST",
           url: "/sub", // Effectue post vers "/sub" 
           data: $("#formSub").serialize(), 
           success: function(data)
           {
               fct(data); //Contient le "message" envoyé par le serveur et effectue la fonction "fct()"
           }
         });
      });
      var fct = function(datas) {
        if(datas.indication == "Le compte existe déjà, veuillez en choisir un autre :"){ //datas.indication contient le message envoyé par le serveur
          $('input[name="username"]').text('');
        }else{
          socket.emit('souscription', {champs2 : $('input[name="usernameSub"]').val()}); //Si le compte n'existe pas et qu'il s'agit bien d'une création, effectue un emit de "ready".
          $('#pseudo').text($('input[name="usernameSub"]').val());
          setTimeout(function(){
            $('#connexion').css('display','none');
            $('#subscription').css('display','none');
            $('#affichageScore').css('display','block');
            socket.emit('ready', {champs2 : $('input[name="usernameSub"]').val()}); // Si tout est ok, effectue un emit vers "ready"
            socket.emit('verification', datas.indication); 
          },1500);
        }
          $('#message').text(datas.indication);
          setTimeout(function(){
            $('#message').text('');
          }, 2000);
       };


       /////////////////Click du formulaire de connexion////////////////
        $('#formLog').on('submit', function(event){
          event.preventDefault();
          $.ajax({
           type: "POST",
           url: "/connect", // Effectue post vers "/connect"
           data: $("#formLog").serialize(),
           success: function(data)
           {
               fct2(data); //Contient le "message" envoyé par le serveur et effectue la fonction "fct2()"
           }
         });
      });

      var fct2 = function(datas) {
        if(datas.indication == 'Aucun compte trouvée à ce nom.'){ //datas.indication contient le message envoyé par le serveur
        }else{
          socket.emit('login', {champs2 : $('input[name="usernameLog"]').val()}); //Si le compte existe  et qu'il s'agit bien d'une connexion, effectue un emit de "login".
          $('#pseudo').text(datas.indication.substr(9));
           //affiche le pseudo sur l'écran client
          setTimeout(function(){
            $('#connexion').css('display','none');
            $('#subscription').css('display','none');
            $('#affichageScore').css('display','block');
            socket.emit('ready', {champs2 : $('input[name="usernameLog"]').val()}); // Si tout est ok, effectue un emit vers "ready"
            socket.emit('verification', datas.indication); 
          },1500);
        }
          $('#message').text(datas.indication);
          setTimeout(function(){
            $('#message').text('');
          }, 2000);
       };

       //Affiche le pseudo de l'adversaire dans le cas d'une connection ou d'une inscription
        socket.on('afficheEnnemieSub', function(data){
          $('#Object0').addClass('masque');
          $('#foePseudo').text(data.champs2);
          $('#imgFoe').css('display','block');
          socket.emit('pseudoAdverse', {foeNickname :  $('#foePseudo').text()})
        });

        socket.on('afficheEnnemieLog', function(data){
          $('#foePseudo').text(data.champs2);
          $('#imgFoe').css('display','block');
          socket.emit('pseudoAdverse', {foeNickname : $('#foePseudo').text()});
        });

         ////////////////////////////////////////////CREATION DE MON VISEUR//////////////////////////////////////////

        socket.on('creerMonViseur', function(data){
         HTMLScopeElement = window.document.getElementById(data.id);
        if(!HTMLScopeElement){
          var HTMLScopeElement = window.document.createElement('img');
          HTMLScopeElement.setAttribute("src", "img/scope1.png");
          HTMLScopeElement.id = data.id;
          HTMLScopeElement.style.zIndex = 1;
          window.document.body.appendChild(HTMLScopeElement);
        }

      window.addEventListener('mousemove', function(event){
        HTMLScopeElement.style.top = (event.clientY - (parseFloat(HTMLScopeElement.style.height)/2)) + 'px';
        HTMLScopeElement.style.left = (event.clientX - (parseFloat(HTMLScopeElement.style.width)/2)) + 'px';

        // Affichage changement position de mon viseur  //
        socket.emit('changementPositionDeMonViseur',{
          id : HTMLScopeElement.id,
          top : HTMLScopeElement.style.top,
          left : HTMLScopeElement.style.left
        });

        
          function collisionBallons(){
            if(parseInt(HTMLScopeElement.style.left) >= parseInt(HTMLBallonElement.style.left) + parseInt(HTMLBallonElement.style.width)
              || parseInt(HTMLScopeElement.style.left) + parseInt(HTMLScopeElement.style.width) <= parseInt(HTMLBallonElement.style.left)
              || parseInt(HTMLScopeElement.style.top) >= parseInt(HTMLBallonElement.style.top) + parseInt(HTMLBallonElement.style.height)
              || parseInt(HTMLScopeElement.style.top) + parseInt(HTMLScopeElement.style.height) <= parseInt(HTMLBallonElement.style.top)){
              collision = false;
              return false;
            } else {
              collision = true;
              return true;
            }
          };
          
          collisionBallons();
       

      });

        HTMLScopeElement.style.top = data.top;
        HTMLScopeElement.style.left = data.left;
        HTMLScopeElement.style.width = data.width;
        HTMLScopeElement.style.height = data.height;
        HTMLScopeElement.style.position = data.position;   
      });
      ////////////////////////////////////////////CREATION DU VISEUR ADVERSE//////////////////////////////////////////

      socket.on('creerSonViseur', function(data){

      var HTMLScopeElement = window.document.getElementById(data.id);
      if(!HTMLScopeElement){
        var HTMLScopeElement = window.document.createElement('img');
        HTMLScopeElement.setAttribute("src", "img/scope2.png");
        HTMLScopeElement.id = data.id;
        HTMLScopeElement.style.zIndex = 1;

        window.document.body.appendChild(HTMLScopeElement);
      }
      HTMLScopeElement.style.top = data.top;
          HTMLScopeElement.style.left = data.left;
          HTMLScopeElement.style.width = data.width;
          HTMLScopeElement.style.height = data.height;
          HTMLScopeElement.style.position = data.position;
    });


      // Affichage changement position viseur adverse //

      socket.on('changementPositionDeSonViseur', function(data){
      var HTMLScopeElement = window.document.getElementById(data.id);
      if(HTMLScopeElement){
        HTMLScopeElement.style.top = data.top;
        HTMLScopeElement.style.left = data.left;
      };
    });



      //////////////////////////////////////////// CREATION DU VISEUR N°2 SUR ECRAN ADVERSE //////////////////////////////////////////
  		socket.on('creerLesAutresViseurs', function(data){
  			for(index in data){
  				var HTMLScopeElement = window.document.getElementById(data[index].id);
  				if(!HTMLScopeElement){
  					var HTMLScopeElement = window.document.createElement('img');
  					HTMLScopeElement.setAttribute("src", "img/scope2.png");
            HTMLScopeElement.style.zIndex = 1;
  					HTMLScopeElement.id = data[index].id;
  					window.document.body.appendChild(HTMLScopeElement);
  				}
  				 HTMLScopeElement.style.top =  data[index].top;
          HTMLScopeElement.style.left =  data[index].left;
          HTMLScopeElement.style.width =  data[index].width;
          HTMLScopeElement.style.height =  data[index].height;
          HTMLScopeElement.style.position =  data[index].position;
          HTMLScopeElement.style.backgroundColor =  data[index].backgroundColor;
  			}
  		});



      //////////////////////////////////////////// SUPPRESSION DU VISUER //////////////////////////////////////////
    
      socket.on('detruireViseur', function(data){
          var HTMLScopeElement = window.document.getElementById(data.id);
          if(HTMLScopeElement){
            HTMLScopeElement.remove();
          };
      }); 


    socket.on('apparitionMesBallons', function(data){
      stopDetection = true;
      requeteBallon = true;
      for(index in data){
         HTMLBallonElement = window.document.getElementById(data[index].id);
        if(!HTMLBallonElement){
            HTMLBallonElement = window.document.createElement('img');
            HTMLBallonElement.id = data[index].id;
            HTMLBallonElement.style.position = data[index].position;
            HTMLBallonElement.style.height = data[index].height;
            HTMLBallonElement.style.width = data[index].width;
            HTMLBallonElement.style.display = data[index].display;
            window.document.body.appendChild(HTMLBallonElement);

          }
      }   
    });
      socket.on('positionMesBallons', function(data){
        HTMLBallonElement.setAttribute("src", data[index].backgroundImage);
        HTMLBallonElement.style.top = data[index].top;
        HTMLBallonElement.style.left = data[index].left;
      });

      document.onclick = function(){
        if(collision){
          if(stopDetection){
            HTMLBallonElement.remove();
            score = score + 1;
            stopDetection = false;
            socket.emit('detectionParPersonne', {detection : stopDetection});
            if(requeteBallon){
              socket.emit('disparitionBallons', {
                score
              });
              requeteBallon = false;
              socket.emit('requeteParPersonne', {requete : requeteBallon});
            }
          }
          scorre.innerHTML = score;
        }
      };

      socket.on('cleanDetection', function(data){
        stopDetection = false;
      });

      socket.on('cleanRequete', function(data){
        requeteBallon = false;
      });

      socket.on('verificationDone', function(data){
        alert('Désolé, la partie est actuellement complète. Veuillez réessayer ultérieurement.');
        window.location.reload();
      });
      
      socket.on('disparitionAllBallons', function(data){
        setTimeout(function(){
          $('#toRemove').css('display', 'none');
        }, 500);
          HTMLBallonElement.remove();
          scoreAdverse.innerHTML = data.score;
      });
      $('#subscript').click(function(){
        preventBugScore = true;
        $('#subscription').css('display','block');
        $('#connexion').css('display','none');
        $('#affichageScore').css('display','none');
        $("#scoreBoard").css('display','none');
      });
      $('#connect').click(function(){
        preventBugScore = true;
        $('#subscription').css('display','none');
        $('#connexion').css('display','block');
        $('#affichageScore').css('display','none');
        $("#scoreBoard").css('display','none');
      });

      $('#scores').click(function(){
        socket.emit('efface',{rien:'rien'});
        if(preventBugScore){
          $('#scoreBoard').css('display','block');
          $('#subscription').css('display','none');
          $('#connexion').css('display','none');
          $('#affichageScore').css('display','none');
          socket.on('effaceBien', function(data){
            $.ajax({
             type: "POST",
             url: "/afficheScore", // Effectue post vers "/afficheScore" 
             data: $("#formSub").serialize(), 
             success: function(data)
             {
                console.log(data.dataScore.length);
                if(requeteTableau){
                  for(var i = 0;i<data.dataScore.length;i++){
                    $('#list').append("<tr class='personne"+i+"'></tr>");
                    $('.personne' + i).append('<td class="'+i+'">"' + data.dataScore[i].username +'"</td>');
                    $('.personne' + i).append('<td class="'+i+'">"' + data.dataScore[i].Victoire +'"</td>');
                    $('.personne' + i).append('<td class="'+i+'">"' + data.dataScore[i].Defaite +'"</td>');
                    $('.personne' + i).append('<td class="'+i+'">"' + data.dataScore[i].partieJoue +'"</td>');
                    requeteTableau = false;
                  }
                }
                for(var i = 0;i<data.dataScore.length;i++){
                    $('td' + i).text(data.dataScore[i].username);
                    $('td' + i).text(data.dataScore[i].Victoire);
                    $('td' + i).text(data.dataScore[i].Defaite);
                    $('td' + i).text(data.dataScore[i].partieJoue);
                  }
              }   
            });
          });
          $('.scoreBoard').css('display', 'block');
          preventBugScore = false;
        }
      });


      socket.on('startGame', function(data){
        var msg = $('#foePseudo').text();
        socket.emit('launchGame', msg);
      });

       socket.on('stopGame', function(data){
        socket.emit('storeScore', {information : $('#pseudo').text()});
        alert("Fin de la partie. Le vainqueur est : " + data);
        location.reload();
      });

      setInterval(function(){
        if(score == 5){
          if(detectionWinner){
            var ratio = {
              gagnant:$('#pseudo').text(),
              perdant:$('#foePseudo').text()
            }
            console.log(ratio)
            socket.emit("endGame", {ratio});
            detectionWinner = false;
          }
        }
      }, 500);

      socket.on('full', function(data){
        alert('Trop de personne connecté simultanément. Veuillez attendre la fin de la partie.')
        location.reload();
      });
  	});