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
  const $signupEmail       = $('#signupEmail');
  const $signupPassword    = $('#signupPassword');
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
      $file.html(progress+'% Uploaded!!!');
    });
    uploadTask.then(function(snapshot){
      photoURL = snapshot.metadata.downloadURLs[0];
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
    const email    = $signupEmail.val();
    const password = $signupPassword.val();
    const auth     = firebase.auth();
    /*signing up*/
    const promise = auth.createUserWithEmailAndPassword(email,password);
    promise.catch(function(e){
      console.log(e.message);
    });
    promise.then(function(user){
      console.log(user.uid);
      const dbUid = dbRef.child(user.uid);
      dbUid.push({email:user.email});
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
    });
    promise.then(function(e){
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
      $avatar.attr("src",user.photoURL);
    }else {
      $userName.html("please login!!")
      $logoutBtn.attr("disabled","disabled");
      $editName.attr("disabled","disabled");
      $editAvatar.attr("disabled","disabled");
      $editBtn.attr("disabled","disabled");
    }
  });
  /*edit user*/
  $editBtn.click(function(){
    var user = firebase.auth().currentUser;
    /*get values*/
    const userName = $editName.val();

    const promise = user.updateProfile({
        displayName:userName,
        photoURL:photoURL
    });
    promise.then(function(){
        console.log('update successful');
        user = firebase.auth().currentUser;
        if(user){
          $userName.html(user.displayName);
          $avatar.attr("src",user.photoURL);
        }
    });
  });

  /*input message*/
  $messageField.keypress(function(e){
    var user = firebase.auth().currentUser;

    if(e.keyCode ==13 ){
      var message  = $messageField.val();
      var userName = user.displayName||"Anoymous";
      var avatar   = user.photoURL||'';

      chatRoomRef.push({userName:userName,message:message,avatar:avatar});
      $messageField.val('');
    }
  });
  /*show message*/
  chatRoomRef.limitToLast(10).on('child_added',function(snapshot){
      /*get messages*/
      var data     = snapshot.val();
      var userName = data.userName ||"Anoymous";
      var messages = data.message;
      var avatar   = data.avatar;
      console.log(avatar);
      /*elements with msgs*/
      var $messageLi   = $("<li>");
      var $nameElement = $("<strong></strong>");
      var $chatAvatar      = $('<img heigt ="50px" width = "50px" />');
      $chatAvatar.attr("src",avatar);
      $nameElement.text(userName);
      $messageLi.text(messages).prepend($nameElement).prepend($chatAvatar);

      /*append msgs*/
      $messages.append($messageLi);

      //$messages[0].scrollTop = messages[0].scrollHeight;
  })
});
