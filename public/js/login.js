var listaUsersRef = firebase.database().ref('sistemaEscolar/listaDeUsuarios')
var loader = document.getElementById('loader')


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
                document.getElementById('painelAdm').style.display = 'none'
            })
        } else {
            document.getElementById('loginContainer').style.display = 'block'
            loader.style.visibility = 'hidden';
        }
    })


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
    var nome = formData.get('nome')
    var senha = formData.get('senha')
    var senhaRepetida = formData.get('senhaRepetida')
    var dia = formData.get('dia')
    var mes = formData.get('mês')
    var ano = formData.get('ano')
    var email = formData.get('email')
    var foto = formData.get('foto')
    // Now you can use formData.get('foo'), for example.
    // Don't forget e.preventDefault() if you want to stop normal form .submission
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
  .then(function() {
      if (senhaRepetida != '' && (mes == '' || nome == '')) {
        loader.style.visibility = 'hidden';
        throw new Error('Dados incompletos. Digite todos os dados obrigatórios corretamente')
      } else {
        if (senhaRepetida != '') {
            if (senhaRepetida == senha) {
                loader.style.visibility = 'hidden';
                return firebase.auth().createUserWithEmailAndPassword(email, senha)
            } else {
                loader.style.visibility = 'hidden';
                throw new Error('As senhas não conferem. Tente novamente')
            }
            
        } else {
            loader.style.visibility = 'hidden';
            return firebase.auth().signInWithEmailAndPassword(email, senha);
        }
      }
    
    
  }).then(() => {
      if (senhaRepetida != '') {
        var user = firebase.auth().currentUser;
        user.updateProfile({
            displayName: nome
        }).then(function() {
            firebase.database().ref('sistemaEscolar/usuarios/' + user.uid + '/nome').set(nome).then(() => {
              firebase.database().ref('sistemaEscolar/listaDeUsuarios/' + user.uid + '/nome').set(nome).then(() => {
                  firebase.database().ref('sistemaEscolar/usuarios/' + user.uid + '/dataNascimento').set({dia: Number(dia), mes: Number(mes), ano: Number(ano), email: email}).then(() => {
                      firebase.auth().signOut().then(function() {
                        window.location.reload()
                      }).catch(error => {
                        AstNotif.dialog('Erro', error.message)
                        console.log(error)
                      })
                      
                  }).catch(error => {
                      AstNotif.dialog('Erro', error.message)
                      console.log(error)
                  })
                  
              }).catch(error => {
                  AstNotif.dialog('Erro', error.message)
                  console.log(error)
              })
            }).catch(error => {
                AstNotif.dialog('Erro', error.message)
                console.log(error)
            })
            
        }).catch(function(error) {
            AstNotif.dialog('Erro ao atualizar dados do usuário', error.message)
            console.log(error)
        })
      }
    
  })
  .catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    if (error.message == 'The email address is already in use by another account.') {
        AstNotif.dialog('Erro', 'Este email já está cadastrado.')
    } else if (error.message == 'There is no user record corresponding to this identifier. The user may have been deleted.') {
        AstNotif.dialog('Erro', 'Não foi encontrado uma conta com este email. Confira o email ou se cadastre no sistema.')
    } else {
        AstNotif.dialog('Erro', error.message)
        console.log(error)
    }
    loader.style.visibility = 'hidden';
  });
});



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
    }).catch(error =>{
        console.log(error)
    })
}

function acessaUsuario(uid) {
    let acoesUser = document.getElementById('acoesUser')
    listaUsersRef.child(uid).on('value', (snapshot) => {
        const dados = snapshot.val()
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
    var liberaERemoveAcessos = firebase.functions().httpsCallable('liberaERemoveAcessos')
    if (acesso == 'master') {
        var confirma = confirm('Você está modificando um acesso de administrador master do sistema. Você deseja continuar?')
        if (confirma) {
            liberaERemoveAcessos({uid: uid, acesso: acesso, checked: checked}).then(function(result) {
                AstNotif.notify(result.data.acesso, '')
            })
        } else {
            acessaUsuario(uid)
        }
    } else {
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