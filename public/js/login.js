var listaUsersRef = firebase.database().ref('sistemaEscolar/listaDeUsuarios')
var ui = new firebaseui.auth.AuthUI(firebase.auth())

var uiConfig = {
    callbacks: {
      signInSuccessWithAuthResult: function(authResult, redirectUrl) {
        // User successfully signed in.
        // Return type determines whether we continue the redirect automatically
        // or whether we leave that to developer to handle.
        return true;
      },
      uiShown: function() {
        // The widget is rendered.
        // Hide the loader.
        document.getElementById('loader').style.display = 'none';
      }
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInSuccessUrl: 'login.html',
    signInOptions: [
      // Leave the lines as is for the providers you want to offer your users.
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    ],
    // Terms of service url.
    tosUrl: '',
    // Privacy policy url.
    privacyPolicyUrl: ''
};

document.addEventListener('DOMContentLoaded', function() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            document.getElementById('logado').style.visibility = 'visible'
            document.getElementById('nome').innerText = user.displayName
            if (user.photoURL) {
                document.getElementById('foto').src = user.photoURL
            }
            document.getElementById('email').innerText = user.email
            var dados = {email: user.email.replaceAll('@', '-').replaceAll('.', '_'), uid: user.uid, provider: user.providerData.providerId, emailNormal: user.email}
            fetch('http://localhost:5000/verificadorDeAcesso', {
                body: JSON.stringify(dados),
                method: 'POST',
                mode: 'no-cors'
            }).then(response => {
                if (response.status == 200) {
                    document.getElementById('painelAdm').style.display = 'block'

                } else {
                    document.getElementById('painelAdm').remove()
                }
                console.log(response)
            }).catch(error => {
                console.log(error)
            })
        } else {
            ui.start("#firebaseui-auth-container", uiConfig)
        }
    })
})

function sair() {
    firebase.auth().signOut().then(function() {
        AstNotif.toast("Bye bye!");
        document.getElementById('logado').style.visibility = 'hidden'
    }).catch(function(error) {
        AstNotif.dialog("Erro ao sair", error.message);
    })
}

function listaUsuarios() {
    listaUsersRef.once('value').then(snapshot => {
        var corpo = `<div class="overflow-auto" style="height: 170px;">
        <div class="list-group" id="arquivos">`
        var lista = []
        var i = 0
        for (const key in snapshot.val()) {
            if (snapshot.val().hasOwnProperty(key)) {
                const child = snapshot.val()[key];
                lista.push(child.email)
                corpo += `<button id="0" class="list-group-item list-group-item-action" onclick="acessaUsuario('${child.email}')">${child.emailNormal}</button>`
                i++ 
            }
        }
        corpo += '</div></div><div id="acoesUser"></div>'
        abrirModal(
            'modal',
            'Usuários cadastrados no sistema',
            corpo,
            '<button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>'
        )
    }).catch(error => {
        console.log(error)
        ASTNotif.dialog('Ocorreu um erro', error.message)
    })
}

function acessaUsuario(email) {
    let acoesUser = document.getElementById('acoesUser')
    let usuariosRef = firebase.database().ref('sistemaEscolar/usuarios')
    usuariosRef.child(email).once('value').then(snapshot => {
        acoesUser.innerHTML = `Aqui vai as funções para o email ${email}`
    })

}
