$('.hide-chat-box').click(function(){
    $('.chat-content').slideToggle();
    let botaoAbre = document.getElementById('abreChat')
    let botaoFecha = document.getElementById('fechaChat')
    if (botaoAbre.style.visibility == 'visible') {
        botaoAbre.style.visibility = 'hidden'
        botaoFecha.style.visibility = 'visible'
    } else {
        botaoAbre.style.visibility = 'visible'
        botaoFecha.style.visibility = 'hidden'
    }
});
$('#fechaChat').click()

var chatsRef = firebase.database().ref('sistemaEscolar/chats')
function carregaListaChats() {
    let listaChats = document.getElementById('listaChats')
    listaChats.innerHTML = `
        <li class="nav-item">
            <a class="nav-link" href="#" onclick="carregaChat('geral')" data-toggle="tooltip" data-placement="top" title="Apenas funcionários cadastrados corretamente no sistema têm acesso à este chat">
            <span data-feather="message-square"></span>
            geral
            </a>
        </li>`
    chatsRef.on('child_added', (snapshot) => {
        if (snapshot.key != 'geral') {
            listaChats.innerHTML += `
        <li class="nav-item">
            <a class="nav-link" href="#" id="chat${snapshot.key}" onclick="carregaChat('${snapshot.key}')">
            <span data-feather="message-square"></span>
            ${snapshot.key}
            </a>
        </li>
        `
        feather.replace()
        }
    })
}


var chat = 'geral'
function carregaChat(chatConectado='geral', primeiravez=false) {
    let nomeChat = document.getElementById('nomeChat')
    let mensagensChat = document.getElementById('mensagensChat')

    if (primeiravez == false) {
        $('#abreChat').click()
    }

    nomeChat.innerText = chatConectado
    chatsRef.child(chat).off('child_added')
    chat = chatConectado

    mensagensChat.innerHTML = ''
    chatsRef.child(chatConectado).on('child_added', (snapshot) => {
        console.log(snapshot.val())
        let mensagem = snapshot.val()
        let tipo = mensagem.tipo
        if (mensagem.foto == undefined) {
            mensagem.foto = '../images/profile_placeholder.png'
        }
        let user = usuarioAtual()
        
        if (tipo == 'imagem') {
            
        } else if (tipo == 'anexo') {

        } else if (tipo == undefined) {
            if (user.email == mensagem.email) {
                mensagensChat.innerHTML += `
                <li class="pl-2 pr-2 bg-primary rounded text-white text-center send-msg mb-1" id="${snapshot.key}">
                    ${mensagem.mensagem}
                </li>
                `
            } else {
                mensagensChat.innerHTML += `
                <li class="p-1 rounded mb-1" id="${snapshot.key}">
                    <div class="receive-msg">
                        <img src="${mensagem.foto}">
                        <div class="receive-msg-desc  text-center mt-1 ml-1 pl-2 pr-2">
                            <b>${mensagem.nome}</b>
                            <p class="pl-2 pr-2 rounded">${mensagem.mensagem}</p>
                        </div>
                    </div>
                </li>
                `
            }
        }
        
        window.location.href='#' + snapshot.key;
        feather.replace()
    })
    
}
carregaListaChats()

carregaChat('geral', true)

    chatsRef.child(chat).on('child_changed', (snapshot) => {
        console.log(snapshot.val())
        AstNotif.notify('Chat' + chatConectado, `${snapshot.val().nome} diz: ${snapshot.val().mensagem}`, 'agora')
    })


document.querySelector('#enviaMsgChat').addEventListener('submit', (e) => {
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
    
    const dados = new FormData(e.target);
    let mensagem = dados.get('txtMsg')
    if (mensagem != '') {
        let user = usuarioAtual()
        let corpo = {
            email: user.email,
            mensagem: mensagem,
            nome: user.displayName,
            foto: user.photoURL
        }
        chatsRef.child(chat).push(corpo).then(() =>{
            document.getElementById('txtMsg').value = ''
        }).catch(error => {
            AstNotif.dialog('Erro', error.message)
        })
    }
    return false
})
function mensagemRapida(msg) {
    let user = usuarioAtual()
    if (msg == 'like') {
        chatsRef.child(chat).push({
            mensagem: '<span data-feather="thumbs-up" aria-hidden="true"></span>',
            foto: user.photoURL,
            nome: user.displayName,
            email: user.email
        }).then(() =>{
            document.getElementById('txtMsg').value = ''
        }).catch(error => {
            AstNotif.dialog('Erro', error.message)
        })
    }
}

function enviarImagem(confirma=false) {
    if (confirma) {
        
    } else {
        $('#fechaChat').click()
        abrirModal('modal', 'Enviar uma imagem', 
         `Cuidado para não extrapolar e enviar imagens muito grandes ao servidor, pois você pode exceder a cota de armazenamento e banda, e poderá pagar por isso. Use com moderação :-)
         <br>
        
        <div class="form-group">
            <label for="exampleFormControlInput1">Enviar uma imagem de um link da internet:</label>
            <input type="url" class="form-control" id="exampleFormControlInput1" placeholder="Cole o link direto da imagem...">
        </div>
        <br> Ou<br><br>
        <div class="form-group">
            <label for="exampleFormControlFile1">Envie uma imagem do seu dispositivo para os servidores:</label>
            <!-- Drag and Drop -->
              <div id="drop-area">
                <form class="my-form">
                  <p>Arraste e solte os arquivos para enviar (upload)</p> ou
                  <input type="file" id="fileElem" multiple onchange="handleFiles(this.files)">
                  
                  <label class="button" for="fileElem">Escolher arquivos</label>
                </form>
                <div class="progress" style="position: relative;">
                  <div class="progress-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" id="progress">0%</div>
                </div>
              </div>
        </div>
         `,
         `<button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`
        )
    }
}

function enviarAnexo(confirma=false) {
    $('#fechaChat').click()
    if (confirma) {
        
    } else {
        abrirModal('modal', 'Enviar um anexo', 
         `Cuidado para não extrapolar e enviar anexos muito grandes ao servidor, pois você pode exceder a cota de armazenamento e banda, e poderá pagar por isso. Use com moderação :-)
         <br><br>
         <div class="form-group">
            <label for="exampleFormControlFile1">Envie um arquivo do seu dispositivo para os servidores:</label>
            <!-- Drag and Drop -->
              <div id="drop-area">
                <form class="my-form">
                  <p>Arraste e solte os arquivos para enviar (upload)</p> ou
                  <input type="file" id="fileElem" multiple onchange="handleFiles(this.files)">
                  
                  <label class="button" for="fileElem">Escolher arquivos</label>
                </form>
                <div class="progress" style="position: relative;">
                  <div class="progress-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" id="progress">0%</div>
                </div>
              </div>
        </div>
         `,
         `<button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`
        )
    }
}

function criarChat(confirma=false) {
    if (confirma) {
        loader.style.display = 'block'
        loaderMsg.innerHTML = 'Criando canal de chat...'
        let nome = document.getElementById('nomeNovoChat').value
        let user = usuarioAtual()
        chatsRef.child(nome).once('value').then(snapshot => {
            if(snapshot.exists()) {
                AstNotif.dialog('Opa...', 'Um chat com o mesmo nome já existe. Tente usar outro nome.')
                loader.style.display = 'none'
            } else {
                chatsRef.child(nome).push({
                    nome: 'Chat criado!', 
                    email: user.email,
                    mensagem: 'O chat foi criado. Envie mensagens!'
                }).then(() => {
                    loader.style.display = 'none'
                    AstNotif.notify('Sucesso', `O chat ${nome}, foi criado. Envie Mensagens!`)
                    $('#modal').modal('hide')
                    carregaChat(nome)
                }).catch(error => {
                    AstNotif.dialog('Erro', error.message)
                    loader.style.display = 'none'
                })
            }
        }).catch(error => {
            AstNotif.dialog('Erro', error.message)
        })
    } else {
        abrirModal('modal', 'Criar um novo canal de chat', 
            `
                Dê um nome que já não esteja cadastrado para o chat:
                <div class="form-group">
                    <label for="exampleFormControlInput1">Nome do chat:</label>
                    <input type="url" class="form-control" id="nomeNovoChat" placeholder="Crie um nome para o chat...">
                </div>

            `,
            `<button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button> <button type="button" class="btn btn-primary" onclick="criarChat(true)">Criar chat</button>`
        )
    }
}

var configChatEstado = 'fechado'
function configChat() {
    let mensagensChat = document.getElementById('mensagensChat')
    if (configChatEstado == 'fechado') {
        configChatEstado = 'aberto'
        let botaoAbre = document.getElementById('abreChat')
        if (botaoAbre.style.visibility == 'visible') {
            $('#abreChat').click()
        }
        mensagensChat.innerHTML = `
        <li class="pl-2 pr-2 bg-primary rounded text-white text-center float-left send-msg mb-1">
            Opções do chat
        </li>
        <br><br>
        <button type="button" class="btn btn-sm btn-danger" onclick="excluirChat()">Excluir chat</button>
        `
    } else {
        configChatEstado = 'fechado'
        carregaChat(chat)
    }
    
}

function excluirChat(confirma=false) {
    if (confirma) {
        loader.style.display = 'block'
        loaderMsg.innerText = 'Excluido chat...'
        chatsRef.child(chat).remove().then(() => {
            loader.style.display = 'none'
            AstNotif.notify('Sucesso', 'O chat foi excluído')
            carregaListaChats()
            carregaChat('geral')
            document.getElementById('ast-dialog-bg').remove()
        }).catch(error => {
            document.getElementById('ast-dialog-bg').remove()
            AstNotif.dialog('Erro', error.message)
            loader.style.display = 'none'
            
        })
    } else {
        AstNotif.dialog('Atenção', 'Você está prestes a excluir o chat ' + chat + '. Todas as mensagens serão perdidas. Você confirma esta ação? <br><br><button type="button" class="btn btn-sm btn-danger" onclick="excluirChat(true)">Sim, excluir o chat</button>', {positive: 'Cancelar', negative: ''})
    }
}