$(document).ready(function(){

    // Initialize Firebase
  var config = {
    apiKey: "AIzaSyC5WWZ1CntmflsxCof0qaIS8cJP_rqUmYw",
    authDomain: "project-249597376816254838.firebaseapp.com",
    databaseURL: "https://project-249597376816254838.firebaseio.com",
    storageBucket: "project-249597376816254838.appspot.com",
    messagingSenderId: "363722609143"
  };
  firebase.initializeApp(config);
  /*var declaration*/
  var photoURL;
  /*--binding dom elements--*/
  const $signupBtn         = $('#signupBtn');
  const $loginEmail        = $('#loginEmail');
  const $loginPassword     = $('#loginPassword');
  const $loginBtn          = $('#loginBtn');
  const $logoutBtn         = $('#logoutBtn');
  const $editName          = $('#editName');
  const $editAvatar        = $('#editAvatar');
  const $editBtn           = $('#editBtn');
  const $file              = $('#file');
  const $userName          = $('#userName');
  const $email             = $('#email');
  const $avatar            = $('#avatar');
  const $messageField      = $('#messageInput');
  const $messages          = $('#messages');
  const $loginLbl          = $('#loginLbl');
  const $loginState        = $('#loginState');
  const $progressbar       = $('#p1');
  const $editOccupation    = $('#editOccupation');
  const $editAge           = $('#editAge');
  const $editDescription   = $('#editDesciption');
  const $age               = $('#age');
  const $occupation        = $('#occupation');
  const $description       = $('#description');
  const $preview           = $('#preview');
  const $send              = $('#send');
  const $uploadMsg         = $('#uploadMsg');
  const $sticker           = $('#sticker');
  const $addSticker        = $('#addSticker');
  const $angry             = $('#angry');
  const $sad               = $('#sad');
  const $happy             = $('#happy');
  const $surprise          = $('#surprise');

  /*--firebase ref--*/
  var storageRef = firebase.storage().ref();
  var chatRoomRef = firebase.database().ref().child('chatroom');
  var dbRef = firebase.database().ref().child('user');

  /*--Avatar upload handler--*/
  function handleFileSelect(event){
    event.stopPropagation();
    event.preventDefault();

    /*get file*/
    var file = event.target.files[0];

    var metadata = {
      'contentType':file.type
    };
    /*uploading*/
    var uploadTask = storageRef.child('images/' +file.name).put(file,metadata);
    uploadTask.on('state_changed',function(snapshot){
      var progress = (snapshot.bytesTransferred/snapshot.totalBytes)*100;
      progress = progress.toFixed();
      $progressbar.addEventListener('mdl-componentupgraded', function() {
        this.MaterialProgress.setProgress(87);
      });
    });
    uploadTask.then(function(snapshot){
      photoURL = snapshot.metadata.downloadURLs[0];
      $preview.attr("src",photoURL);
    }).catch(function(error){
        console.log(error);
    });
  }

  window.onload = function(){
    $editAvatar.change(handleFileSelect);
  }
  //firebase auth
  /*--signup--*/
  $signupBtn.click(function(e){
    /*--get values--*/
    const email    = $loginEmail.val();
    const password = $loginPassword.val();
    const auth     = firebase.auth();
    /*signing up*/
    const promise = auth.createUserWithEmailAndPassword(email,password);
    promise.catch(function(e){
      console.log(e.message);
      $loginLbl.html(e.message);
    });
    promise.then(function(user){
      console.log(user.uid);
      const dbUid = dbRef.child(user.uid);
      dbUid.push({email:user.email});
      $loginLbl.html('sign up successfully');
      window.location = './update.html'
    });
  });
  /*--login--*/
  $loginBtn.click(function(e){
    /*get values*/
    const email    = $loginEmail.val();
    const password = $loginPassword.val();
    const auth     = firebase.auth();
    /*login*/
    const promise = auth.signInWithEmailAndPassword(email,password);
    promise.catch(function(e){
      console.log(e.message);
      $loginLbl.html(e.message);
    });
    promise.then(function(e){
      $loginLbl.html('login successfully');
      window.location = './update.html';
    });
  });
  /*--logout--*/
  $logoutBtn.click(function(){
    const promise = firebase.auth().signOut();
    promise.catch(function(e){
      console.log('signOut error',e.message);
    });
    promise.then(function(){
      window.location = './index.html';
    });
  });
  /*firebase auth checking*/
  firebase.auth().onAuthStateChanged(function(user){
    if(user){
      $userName.html(user.displayName);
      $email.html(user.email);
      console.log(user.photoURL);
      $avatar.attr("src",user.photoURL);
      const dbUid = dbRef.child(user.uid);
      dbUid.on('child_added',function(snapshot){
      var data = snapshot.val();
      var occupation = data.occupation ||'N/A';
      var age = data.age ||'N/A';
      var description = data.description ||'N/A';

      $age.html(age);
      $occupation.html(occupation);
      $description.html(description);
  });
    }else {
      $loginState.html("Please login in oder to enable there functions.")
      $logoutBtn.attr("disabled","disabled");
      $editName.attr("disabled","disabled");
      $editAvatar.attr("disabled","disabled");
      $editOccupation.attr("disabled","disabled");
      $editAge.attr("disabled","disabled");
      $editDescription.attr("disabled","disabled");
      $editBtn.attr("disabled","disabled");
      $messageField.attr("disabled","disabled");

    }
  });
  /*edit user*/
  $editBtn.click(function(){
    var user = firebase.auth().currentUser;
    /*get values*/
    const userName    = $editName.val();
    const occupation  = $editOccupation.val();
    const age         = $editAge.val();
    const description = $editDescription.val();

    const promise = user.updateProfile({
        displayName:userName,
        photoURL:photoURL
    });

    const dbUid = dbRef.child(user.uid).child('info');
    dbUid.update({
      occupation:occupation,
      age:age,
      description:description
    });

    promise.then(function(){
        $uploadMsg.html('update successful');
        if(user){
          $userName.html(user.displayName);
          $avatar.attr("src",user.photoURL);
          $email.html(user.email);
          $editName.val('');
          $editOccupation.val('');
          $editAge.val('');
          $editDescription.val('');
        }
    });
  });


  /*input message*/
  $messageField.keypress(function(e){
    var user = firebase.auth().currentUser;
      if(e.keyCode ==13){
        var message  = $messageField.val();
        var userName = user.displayName||"Anoymous";
        var avatar   = user.photoURL||'';
        var uid      = user.uid;

        chatRoomRef.push({userName:userName,message:message,avatar:avatar,uid:uid});
        $messageField.val('');
        }
    });
  $addSticker.click(function(){
    $sticker.toggleClass("hidden");
    storageRef.child('emojis/surprise.png')
    .getDownloadURL().
    then(function(url){
      $surprise.attr("src",url);
    });
    storageRef.child('emojis/happy.png')
    .getDownloadURL().
    then(function(url){
      $happy.attr("src",url);
    });
    storageRef.child('emojis/angry.png')
    .getDownloadURL().
    then(function(url){
      $angry.attr("src",url);
    });
    storageRef.child('emojis/sad.png')
    .getDownloadURL().
    then(function(url){
      $sad.attr("src",url);
    });
  });

  $surprise.click(function(){
      var user = firebase.auth().currentUser;
      var userName = user.displayName||"Anoymous";
      var avatar   = user.photoURL||'';
      var uid      = user.uid;
      var emoji    = $surprise.attr("src");

      chatRoomRef.push({userName:userName,emoji:emoji,avatar:avatar,uid:uid});
      console.log(emoji);
  })

  $happy.click(function(){
    var user = firebase.auth().currentUser;
    var userName = user.displayName||"Anoymous";
    var avatar   = user.photoURL||'';
    var uid      = user.uid;
    var emoji    = $happy.attr("src");

    chatRoomRef.push({userName:userName,emoji:emoji,avatar:avatar,uid:uid});
    console.log(emoji);
  })
  $sad.click(function(){
    var user = firebase.auth().currentUser;
    var userName = user.displayName||"Anoymous";
    var avatar   = user.photoURL||'';
    var uid      = user.uid;
    var emoji    = $sad.attr("src");

    chatRoomRef.push({userName:userName,emoji:emoji,avatar:avatar,uid:uid});
    console.log(emoji);
  })
  $angry.click(function(){
    var user = firebase.auth().currentUser;
    var userName = user.displayName||"Anoymous";
    var avatar   = user.photoURL||'';
    var uid      = user.uid;
    var emoji    = $angry.attr("src");

    chatRoomRef.push({userName:userName,emoji:emoji,avatar:avatar,uid:uid});
    console.log(emoji);
})
  /*show message*/
  chatRoomRef.limitToLast(10).on('child_added',function(snapshot){
      /*get messages*/
      var user     = firebase.auth().currentUser;
      var data     = snapshot.val();
      var userName = data.userName ||"Anoymous";
      var messages = data.message;
      var avatar   = data.avatar;
      var uid      = data.uid;
      var emoji    = data.emoji;
      /*elements with msgs*/
      var $messageLi   = $("<li>");
      var $nameElement = $("<strong></strong>");
      var $chatAvatar  = $('<img height ="50px" width = "50px"/>');
      var $emojis      = $('<img />');
      $chatAvatar.css("border-radius","100%");
      if(uid===user.uid){
        $chatAvatar.attr("src",avatar);
        $nameElement.text(" :"+userName);
        if(emoji){
          $emojis.attr("src",emoji);
          $messageLi.append($emojis).append($nameElement).append($chatAvatar);
        }else{
          $messageLi.text(messages).append($nameElement).append($chatAvatar);
        }
        $messageLi.attr("key",uid);
        $messageLi.css("text-align","right");
        $chatAvatar.css("margin-left","15px");
        /*append msgs*/
        $messages.append($messageLi);
      }else{
        $chatAvatar.attr("src",avatar);
        $nameElement.text(userName+": ");
        if(emoji){
          $emojis.attr("src",emoji);
          $messageLi.append($emojis).prepend($nameElement).prepend($chatAvatar);
        }else{
          $messageLi.text(messages).prepend($nameElement).prepend($chatAvatar);
        }
        $messageLi.attr("key",uid);
        $messageLi.css("text-align","left");
        $chatAvatar.css("margin-right","15px");
        /*append msgs*/
        $messages.append($messageLi);

      }
      $messages[0].scrollTop = $messages[0].scrollHeight;
    });
});
