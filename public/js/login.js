var listaUsersRef = firebase.database().ref('sistemaEscolar/listaDeUsuarios')
var ui = new firebaseui.auth.AuthUI(firebase.auth())
var loader = document.getElementById('loader')
//firebase.auth().signInWithEmailAndPassword('gustavo@teste.com', 'galo1234')
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
      }
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInSuccessUrl: 'login.html',
    signInOptions: [
      // Leave the lines as is for the providers you want to offer your users.
      {
        provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
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
            document.getElementById('loginContainer').style.display = 'none'
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
            document.getElementById('loginContainer').style.display = 'block'
            loader.style.visibility = 'hidden';
        }
    })
//})

function liberaAreaCadastro(abre=true) {
    if (abre) {
        document.getElementById('cadastroNovoUsuario').style.display = 'block'
        document.getElementById('btnEntrar').style.display = 'none'
        document.getElementById('btnEntrar').disabled = true
        document.getElementById('btnCadastrar').disabled = false
        document.getElementById('cadastrarEntrar').style.display = 'none'
    } else {
        document.getElementById('cadastroNovoUsuario').style.display = 'none'
        document.getElementById('btnEntrar').style.display = 'block'
        document.getElementById('btnEntrar').disabled = false
        document.getElementById('btnCadastrar').disabled = true
        document.getElementById('cadastrarEntrar').style.display = 'block'
        document.getElementById('senhaRepetida').value = ''
        
    }
}

document.querySelector('#areaLogin').addEventListener('submit', (e) => {
    loader.style.display = 'block'
    e.preventDefault()
    const formData = new FormData(e.target);
    console.log(formData.get('email'))
    // Now you can use formData.get('foo'), for example.
    // Don't forget e.preventDefault() if you want to stop normal form .submission
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
  .then(function() {
      if (formData.get('dataNascimento') == '' || formData.get('nome') == '') {
        loader.style.visibility = 'hidden';
        AstNotif.notify('Dados incompletos', 'Digite todos os dados obrigatórios corretamente')
      } else {
        if (formData.get('senhaRepetida') != '') {
            if (formData.get('senhaRepetida') == formData.get('senha')) {
                loader.style.visibility = 'hidden';
                return firebase.auth().createUserWithEmailAndPassword(formData.get('email'), formData.get('senha'))
            } else {
                loader.style.visibility = 'hidden';
                AstNotif.notify('As senhas não conferem', 'Digite a senha novamente')
            }
            
        } else {
            loader.style.visibility = 'hidden';
            return firebase.auth().signInWithEmailAndPassword(formData.get('email'), formData.get('senha'));
        }
      }
    
    
  })
  .catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    if (error.message == 'The email address is already in use by another account.') {
        AstNotif.dialog('Erro', 'Este email já está cadastrado.')
    } else {
        AstNotif.dialog('Erro', error.message)
    }
    loader.style.visibility = 'hidden';
  });
});
function entrar() {
    
}


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