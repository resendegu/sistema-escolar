var listaUsersRef = firebase.database().ref('sistemaEscolar/listaDeUsuarios')
var ui = new firebaseui.auth.AuthUI(firebase.auth())
var loader = document.getElementById('loader')
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
        loader.style.visibility = 'hidden';
      }
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInSuccessUrl: 'login.html',
    signInOptions: [
      // Leave the lines as is for the providers you want to offer your users.
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      {
        provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
        signInMethod: firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
        requireDisplayName: true
      }
    ],
    // Terms of service url.
    tosUrl: '',
    // Privacy policy url.
    privacyPolicyUrl: ''
};

//document.addEventListener('DOMContentLoaded', function() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            document.getElementById('logado').style.visibility = 'visible'
            document.getElementById('nome').innerText = user.displayName
            if (user.photoURL) {
                document.getElementById('foto').src = user.photoURL
            }
            document.getElementById('email').innerText = user.email
            var verificadorDeAcesso = firebase.functions().httpsCallable('verificadorDeAcesso')
            verificadorDeAcesso({acesso: 'master'}).then(function(result) {
                console.log(result)
                loader.style.visibility = 'hidden'
                document.getElementById('painelAdm').style.display = 'block'
                
            }).catch(function(error) {
                loader.style.visibility = 'hidden'
                document.getElementById('painelAdm').remove()
            })
        } else {
            ui.start("#firebaseui-auth-container", uiConfig)
        }
    })
//})

function sair() {
    firebase.auth().signOut().then(function() {
        AstNotif.toast("Bye bye!");
        document.getElementById('logado').style.visibility = 'hidden'
    }).catch(function(error) {
        AstNotif.dialog("Erro ao sair", error.message);
    })
}

function listaUsuarios() {
    listaUsersRef.on('value', snapshot => {
        var corpo = `<div class="overflow-auto" style="height: 120px;">
        <div class="list-group" id="arquivos">`
        var lista = []
        var i = 0
        for (const key in snapshot.val()) {
            if (snapshot.val().hasOwnProperty(key)) {
                const child = snapshot.val()[key];
                lista.push(child.email)
                corpo += `<button id="${i}" class="list-group-item list-group-item-action" onclick="acessaUsuario('${key}')">${child.email}</button>`
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

function acessaUsuario(uid) {
    let acoesUser = document.getElementById('acoesUser')
    listaUsersRef.child(uid).on('value', (snapshot) => {
        var dados = snapshot.val()
        acoesUser.innerHTML = `
        <h6>Gerenciamento de usuários</h6>
        Marque as caixas para liberar os acessos para ${dados.email}
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
                    <input type="checkbox" ${checked} onclick="liberaAcesso('${uid}', '${acesso}', this.checked)">
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
            <br>
                <button type="button" class="btn btn-danger" onclick="apagarConta('${uid}')">Remover e apagar esta conta</button>
            </div>
        </div>`
    })

}

function liberaAcesso(uid, acesso, checked) {
    if (acesso == 'master') {
        var confirma = confirm('Você está modificando um acesso de administrador master do sistema. Você deseja continuar?')
        if (confirma) {
            var liberaERemoveAcessos = firebase.functions().httpsCallable('liberaERemoveAcessos')

            liberaERemoveAcessos({uid: uid, acesso: acesso, checked: checked}).then(function(result) {
                AstNotif.notify(result.data.acesso, '')
            })
        } else {
            acessaUsuario(uid)
        }
    } else {
        var liberaERemoveAcessos = firebase.functions().httpsCallable('liberaERemoveAcessos')

        liberaERemoveAcessos({uid: uid, acesso: acesso, checked: checked}).then(function(result) {
            AstNotif.notify(result.data.acesso, '')
        })
    }

    
}

function apagarConta(uid, sure=false) {
    if (sure == true) {
        var apagaContas = firebase.functions().httpsCallable('apagaContas')
        apagaContas({uid: uid}).then(function(result) {
            document.getElementById('ast-dialog-bg').remove()
            AstNotif.dialog('Sucesso', result.data.answer)
        }).catch(function(error) {
            document.getElementById('ast-dialog-bg').remove()
            AstNotif.dialog('Erro', error.message)
        })
    } else {
        AstNotif.dialog('Confirmação', `Você têm certeza que deseja apagar este usuário, os dados serão mantidos mas esta conta perderá acesso à todas as áreas que foram designadas. <br><br> <button type="button" class="btn btn-danger" onclick="apagarConta('${uid}', true)">Apagar esta conta agora</button>`, {positive: 'Voltar', negative: ''})
    }
}