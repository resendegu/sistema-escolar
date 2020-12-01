var listaUsersRef = firebase.database().ref('sistemaEscolar/listaDeUsuarios')
var ui = new firebaseui.auth.AuthUI(firebase.auth())
//firebase.auth().signInWithEmailAndPassword('guresende13@gmail.com', 'galo1234')
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
                corpo += `<button id="${i}" class="list-group-item list-group-item-action" onclick="acessaUsuario('${child.email}', '${child.emailNormal}')">${child.emailNormal}</button>`
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

function acessaUsuario(email, emailNormal) {
    let acoesUser = document.getElementById('acoesUser')
    let usuariosRef = firebase.database().ref('sistemaEscolar/usuarios')
    usuariosRef.child(email).on('value', (snapshot) => {
        var dados = snapshot.val()
        acoesUser.innerHTML = `
        <h6>Gerenciamento de usuários</h6>
        Marque os acessos que deseja dar à esta conta
        <div class="row">
            <div class="col">
                <div class="input-group mb-3">
                    <div class="input-group-prepend">`

        for (let acesso in dados.acessos) {
            if (dados.acessos.hasOwnProperty(acesso)) {
                let status = dados.acessos[acesso];
                console.log(acesso, status)
                var acessoText
                if (acesso == 'adm') {
                    acessoText = 'administração'
                } else {
                    acessoText = acesso
                }
                var checked = ''
                if (status == true) {
                    checked = 'checked'
                }
                acoesUser.innerHTML += `
                <div class="input-group-text">
                    <input type="checkbox" ${checked} onclick="liberaAcesso('${email}', '${acesso}', this.checked)">
                    &nbsp; Acesso ${acessoText}
                </div>
                `
            }
        }
        
        acoesUser.innerHTML += `
            </div>
            </div>
            </div>
            <div class="col">
                <button type="button" class="btn btn-danger" onclick="apagarConta('${emailNormal}')">Remover e apagar esta conta</button>
            </div>
        </div>`
    })

}

function liberaAcesso(email, acesso, checked) {
    firebase.database().ref(`sistemaEscolar/usuarios/${email}/acessos/${acesso}`).set(checked)
    .then(() => {
        if (checked) {
            AstNotif.notify('Acesso liberado!', 'Acesso concedido com sucesso.')
        } else {
            AstNotif.notify('Acesso removido!', 'Acesso removido com sucesso.')
        }
        
    }).catch(error => {
        ASTNotif.dialog('Erro', error.message)
        console.log(error)
    })
}

function apagarConta(email, sure=false) {
    if (sure == true) {
        
    } else {
        AstNotif.dialog('Confirmação', `Você têm certeza que deseja apagar o usuário ${email}, os dados serão mantidos mas esta conta perderá acesso à todas as áreas que foram designadas. <br><br> <button type="button" class="btn btn-danger" onclick="apagarConta('${email}', true)">Apagar esta conta agora</button>`, {positive: 'Voltar', negative: ''})
    }
}
