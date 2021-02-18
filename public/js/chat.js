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

var chat = 'geral'
function carregaChat(chatConectado='geral', primeiravez=false) {
    chat = chatConectado
    chatsRef.child(chatConectado).on('child_added', (snapshot) => {
        console.log(snapshot.val())
        let mensagem = snapshot.val()
        let tipo = mensagem.tipo
        if (mensagem.foto == undefined) {
            mensagem.foto = '../images/profile_placeholder.png'
        }
        let user = usuarioAtual()
        let mensagensChat = document.getElementById('mensagensChat')
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
         <br><br>
        
        <div class="form-group">
            <label for="exampleFormControlInput1">Enviar uma imagem de um link da internet:</label>
            <input type="url" class="form-control" id="exampleFormControlInput1" placeholder="Cole o link direto da imagem...">
        </div>
        <br> Ou<br><br>
        <div class="form-group">
            <label for="exampleFormControlFile1">Envie uma imagem do seu dispositivo para os servidores:</label>
            <input type="file" class="form-control-file" id="exampleFormControlFile1">
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
            <input type="file" class="form-control-file" id="exampleFormControlFile1">
        </div>
         `,
         `<button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`
        )
    }
}