
var secretariaRef = firebase.database().ref('sistemaEscolar/secretaria')
var numerosRef = firebase.database().ref('sistemaEscolar/numeros')
var aniversariosRef = firebase.database().ref('sistemaEscolar/aniversarios')
var listaDeUsuariosRef = firebase.database().ref('sistemaEscolar/listaDeUsuarios')
var listaDeProfessores = firebase.database().ref('sistemaEscolar/listaDeProfessores')
var turmasRef = firebase.database().ref('sistemaEscolar/turmas')
var ultimaMatriculaRef = firebase.database().ref('sistemaEscolar/ultimaMatricula')
var alunosRef = firebase.database().ref('sistemaEscolar/alunos')
var alunosDesativadosRef = firebase.database().ref('sistemaEscolar/alunosDesativados')
var followUpRef = firebase.database().ref('sistemaEscolar/followUp')
var transfereAlunos = firebase.functions().httpsCallable('transfereAlunos')
var usuarioRef = firebase.database().ref('sistemaEscolar/usuarios')
var desempenhoRef = firebase.database().ref('sistemaEscolar/notasDesempenho/referencia')

var loader = document.getElementById('loader')
var loaderMsg = document.getElementById('loaderMsg')

$(function () {
    $('[data-toggle="tooltip"]').tooltip()
  })

  $(function () {
    $('[data-toggle="popover"]').popover()
  })
var turmasProf
var dadosAluno
var registroAcademico
firebase.auth().onAuthStateChanged(async (user) => {
    
    if (user == null) {
        loaderRun()
        
        abrirModal('modal', 'Login do aluno',
            `
            <div class="container">
                <h3>Seja bem-vindo!</h3>
                <h6>Para acessar o seu portal, digite seu e-mail e sua senha, cadastradas na secretaria da escola.</h6>
                <form id="areaLogin">
                    <div class="form-row">
                    <div class="form-group col-md-6">
                        <label for="inputEmail4">Email</label>
                        <input type="email" name="usuario" class="form-control" id="usuario" placeholder="Email">
                        <a style="cursor: pointer;" id="esqueceuSenha" class="text-center" data-toggle="tooltip" data-placement="right" title="Digite seu e-mail no campo, e clique aqui para que possamos te ajudar.">Esqueci minha senha</a>
                    </div>
                    <div class="form-group col-md-6">
                        <label for="inputPassword4">Senha</label>
                        <input type="password" name="senha" class="form-control" id="inputPassword4" placeholder="Senha">
                    </div>
                    <button type="submit" class="btn btn-primary btn-block" id="btnEntrar">Entrar no portal</button>
                    <br><br>
                    
                </form>
            </div>
            `,
            `<button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`
        )
        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        })

        document.getElementById('esqueceuSenha').addEventListener('click', (e) => {
            let email = document.getElementById('usuario').value
            if(email == "" || email.indexOf('@') == -1) {
                AstNotif.dialog('Erro', 'Por favor, digite seu e-mail corretamente.')
            } else {
                loaderRun(true, 'Enviando email de verificação')
                firebase.auth().sendPasswordResetEmail(email)
                .then(() => {
                   loaderRun()
                   AstNotif.dialog('Sucesso', 'Acabamos de enviar um e-mail com um link para redefinição da sua senha. Confira sua Caixa de Entrada ou SPAM.')
                })
                .catch((error) => {
                    let errorCode = error.code;
                    let errorMessage = error.message;
                    AstNotif.dialog('Erro', errorMessage)
                    console.log(error)
                });
            }
        })
    
        document.querySelector('#areaLogin').addEventListener('submit', (e) => {
            loaderRun(true, 'Conectando ao portal...')
            e.preventDefault()
            const formData = new FormData(e.target);
            var senha = formData.get('senha')
            var email = formData.get('usuario')
            firebase.auth().useDeviceLanguage();

            firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
                .then(() => {
                    loaderRun(true, 'Autenticando aluno...')
                    // Existing and future Auth states are now persisted in the current
                    // session only. Closing the window would clear any existing state even
                    // if a user forgets to sign out.
                    // ...
                    // New sign-in will be persisted with session persistence.
                    return firebase.auth().signInWithEmailAndPassword(email, senha);
                }).then((result) => {
                    loaderRun()
                    $('#modal').modal('hide')
                })
                .catch((error) => {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    AstNotif.dialog('Erro', error.message)
                    loaderRun()
                });

        })
        
    } else {
        registroAcademico = user.uid

        let snapshot = await alunosRef.child(user.uid).once('value')
        snapshot = snapshot.exists() ? snapshot : (await alunosDesativadosRef.child(user.uid + '/dadosAluno').once('value'))
        console.log(snapshot.val())
        dadosAluno = snapshot.val()
        console.log(dadosAluno.historicoEscolar)
        lastTabUsed()
        try {
            document.getElementById('cursosConcluidos').innerText = dadosAluno.historicoEscolar == undefined ? null : Object.keys(dadosAluno.historicoEscolar).length
        } catch (error) {
            console.log(error)
        }
        
        loaderRun(true, 'Buscando informações do usuário...')
        try {
            document.getElementById('username').innerHTML = "Olá,<br>" + user.displayName.split(' ')[0]
            if (user.photoURL != null) {
                document.getElementById('profilePic').src = user.photoURL
            } 
        } catch (error) {
            console.log(error)
        }


        aniversariosRef.on('value', snapshot => {
            loader.style.display = 'block'
            var meses = snapshot.val()
            var dataLocal = new Date()
            var mesAtual = dataLocal.getMonth()
            document.getElementById('listaAniversarios').innerHTML = ''
            for (const key in meses[mesAtual]) {
                if (meses[mesAtual].hasOwnProperty(key)) {
                    const aniversario = meses[mesAtual][key];
                    document.getElementById('listaAniversarios').innerHTML += `<button class="list-group-item list-group-item-action">${aniversario.nome} no dia ${aniversario.dataNascimento.dia}</button>`
                }
            }
            loaderRun()
        })
        
    }
    
})

//Funções da aba Dados e Notas
var tipoDeBusca = 'nomeAluno'
function alteraTipoDeBusca(tipo) {
    tipoDeBusca = tipo
}

async function atualizaDadosAluno() {
    let snapshot = await alunosRef.child(registroAcademico).once('value')
        snapshot = snapshot.exists() ? snapshot : (await alunosDesativadosRef.child(registroAcademico + '/dadosAluno').once('value'))
        console.log(snapshot.val())
        dadosAluno = snapshot.val()
}

function carregaFrequenciaAluno(registroAcademico, turma) {
    let c = 0
    let divFrequencias = document.getElementById('divFrequencias')
    let qtdeAulasFrequencia = document.getElementById('qtdeAulasFrequencia')
    let qtdeAulas
    turmasRef.child(turma + '/status/qtdeAulas').once('value').then(qtdeDeAulas => {
        qtdeAulasFrequencia.innerText = qtdeDeAulas.val()
        qtdeAulas = qtdeDeAulas.val()

        divFrequencias.innerHTML = 'Nenhuma frequência lançada para este aluno, nesta turma'
        turmasRef.child(turma + '/alunos/' + registroAcademico + '/frequencia').on('child_added', frequencia => {
            console.log(frequencia.val())
            if (c==0) {
                divFrequencias.innerHTML = ''
            }
            if (frequencia.val().turma == turma) {
                let diaFrequencia = frequencia.key.split('T')[0]
                let horaFrequencia = frequencia.key.split('T')[1]
                divFrequencias.innerHTML += `
                <div class="row justify-content-start">
                    <div class="col-auto" style="background-color: rgba(86,61,124,.15);border: 1px solid rgba(86,61,124,.2);">${diaFrequencia.split('-').reverse().join('/')} ás ${horaFrequencia}</div>
                    <div class="col" style="background-color: rgba(86,61,124,.15);border: 1px solid rgba(86,61,124,.2);">Presente</div>
                </div>
                `
                feather.replace()
                $(function () {
                    $('[data-toggle="tooltip"]').tooltip()
                })
            }
            c++
            document.getElementById('totalFrequencias').innerText = c
            console.log(qtdeAulas)
            document.getElementById('porcentagemFrequencia').innerText = ((100*parseInt(c))/parseInt(qtdeAulas)).toFixed(2) + '%'
        })
    }).catch(error => {
        AstNotif.dialog('Erro', error.message)
    })


    
}

function gerarFichaAluno(matricula) {
    document.getElementById('corpoMatricula').innerHTML = `<iframe src="../resources/pdfsProntos/documento.html#fichaCadastral?${matricula}" frameborder="0" width="100%" height="400px" id="fichaPdf" name="fichaPdf"></iframe>`
    $('#matriculaModal').modal({backdrop: 'static'})
}

var dadosResponsaveis = {}
function abreDadosDoAluno(desativado=false) {
    
    document.getElementById('infoDoAluno').style.display = 'block'
    document.getElementById('rolaTelaAbaixoAlunos').style.display = 'block'
    let dados = dadosAluno
    console.log(dados)
    document.getElementById('alunoDesativado').style.display = 'none'
    document.getElementById('secGeraFicha').innerHTML = `<button class="btn btn-outline-primary btn-block" id="btnGeraFicha" onclick="editarDadosAluno('${registroAcademico}')">Ver/Editar meus dados</button><button class="btn btn-outline-primary btn-block" id="btnGeraFicha" onclick="gerarFichaAluno('${registroAcademico}')">Gerar ficha de matrícula em PDF</button>`
   
    carregaFrequenciaAluno(dados.matriculaAluno, dados.turmaAluno)
    carregaHistoricoAluno()
    dadosResponsaveis = dados.responsaveis

    
    
    document.getElementById('mostraNomeAluno').innerText = dados.nomeAluno
    document.getElementById('mostraCpfAluno').innerText = dados.cpfAluno
    document.getElementById('mostraRgAluno').innerText = dados.rgAluno
    document.getElementById('mostraCelularAluno').innerText = dados.celularAluno
    document.getElementById('mostraTelefoneAluno').innerText = dados.telefoneAluno
    document.getElementById('timestampDoAluno').innerText = 'Aluno cadastrado em: ' + new Date(dados.timestamp._seconds * 1000)
    document.getElementById('mostraDataNascimentoAluno').innerText = dados.dataNascimentoAluno.split('-').reverse().join('/');

    let nascimento = dados.dataNascimentoAluno
    
    calcularIdadePrecisa(nascimento).then(function(idade){
        document.getElementById('mostraIdadeAluno').innerText = `${idade.years} anos, ${idade.months} mês(es), e ${idade.days} dias`
    }).catch(function(error){
        AstNotif.dialog('Erro', error.message)
        console.log(error)
    })
    document.getElementById('mostraHoraEDiasAluno').innerText = `Horário de aula: ${dados.horaAluno}`
    document.getElementById('mostraTurmaAluno').innerHTML = dados.turmaAluno
    document.getElementById('mostraEmailAluno').innerText = dados.emailAluno
    document.getElementById('mostraMatriculaAluno').innerText = dados.matriculaAluno
    document.getElementById('mostraEnderecoAluno').innerText = `${dados.enderecoAluno}, ${dados.numeroAluno}, ${dados.bairroAluno}, ${dados.cidadeAluno}, ${dados.estadoAluno}. CEP ${dados.cepAluno}.`
    document.getElementById('rolaTelaAbaixoAlunos').focus()
    document.getElementById('rolaTelaAbaixoAlunos').style.display = 'none'
    turmasRef.child(`${dados.turmaAluno}/alunos/${dados.matriculaAluno}/notas`).on('value', (snapshot) => {
        turmasRef.child(`${dados.turmaAluno}/notas`).once('value').then(notasReferencia => {
            let notas = snapshot.val()
            let referenciaDeNotas = notasReferencia.val()
            if (desativado != false) {
                notas = notasDesativado
            }
            console.log(notas)
            let notasDoAlunoDiv = document.getElementById('notasDoAluno')
            notasDoAlunoDiv.innerHTML = ''
            //let somatorioNotasDiv = document.getElementById('somatorioNotas')
            if (notas == null) {
                notasDoAlunoDiv.innerHTML = 'Nenhuma nota foi lançada para este aluno<br>'
            }
            if (referenciaDeNotas == null) {
                notasDoAlunoDiv.innerHTML = 'Você não distribuiu notas para esta turma. Se aparecerem notas aqui abaixo, elas podem ter sido lançadas por outro professor.<br>'
            }
            let somatorioNotas = 0
            for (const nomeNota in notas) {
                if (Object.hasOwnProperty.call(notas, nomeNota)) {
                    const valorNota = notas[nomeNota];
                    try {
                        const barra = (100*valorNota)/referenciaDeNotas[nomeNota]
                        somatorioNotas += valorNota
                        notasDoAlunoDiv.innerHTML += `
                        
                        <small id="nomeNota${nomeNota}"><b>${nomeNota}</b>: ${valorNota}</small><small id="notaReferencia">/${referenciaDeNotas[nomeNota] == undefined ? 'Nota não lançada': referenciaDeNotas[nomeNota]}</small>
                        <div class="progress mb-3" style="height: 10px">
                        <div class="progress-bar bg-primary" role="progressbar" style="width: ${barra}%" aria-valuenow="${valorNota}" aria-valuemin="0" aria-valuemax="${referenciaDeNotas[nomeNota]}">${valorNota}</div>
                        </div>
                        `
                    } catch (error) {
                        console.log(error)
                        somatorioNotas += valorNota
                        notasDoAlunoDiv.innerHTML += `
                        
                        <small id="nomeNota${nomeNota}"><b>${nomeNota}</b>: ${valorNota}</small><small id="notaReferencia">/?</small>
                        <div class="progress mb-3" style="height: 10px">
                        <div class="progress-bar bg-primary" role="progressbar" style="width: 0%" aria-valuenow="${valorNota}" aria-valuemin="0" aria-valuemax="?">${valorNota}</div>
                        </div>
                        `
                    }
                   
                    
                }
            }
            let cor
            if (somatorioNotas >= 80) {
                cor = 'green'
            } else if (somatorioNotas <= 79 && somatorioNotas >= 60) {
                cor = 'gold'
            } else {
                cor = 'red'
            }
            notasDoAlunoDiv.innerHTML += `<div id="somatorioNotas">Somatório: <b style="color: ${cor}">${somatorioNotas}</b>/100</div>`

            
        }).catch(error => {
            AstNotif.dialog('Erro', error.message)
            console.log(error)
        })
        
        
    })


    turmasRef.child(`${dados.turmaAluno}/alunos/${dados.matriculaAluno}/desempenho`).on('value', (desempenho) => {
        desempenhoRef.once('value').then(referenciaDesempenho => {
            let notas = desempenho.val()
            let referenciaDeNotas = referenciaDesempenho.val()
            console.log(notas)
            let notasDoAlunoDiv = document.getElementById('desempenhoAluno')
            notasDoAlunoDiv.innerHTML = ''
            //let somatorioNotasDiv = document.getElementById('somatorioNotas')
            if (notas == null) {
                notasDoAlunoDiv.innerHTML = 'Nenhuma nota de desempenho foi lançada para este aluno'
            }
            let somatorioNotas = 0
            for (const nomeNota in notas) {
                if (Object.hasOwnProperty.call(notas, nomeNota)) {
                    const valorNota = notas[nomeNota];
                    const barra = (100*valorNota)/referenciaDeNotas[nomeNota]
                    somatorioNotas += valorNota
                    notasDoAlunoDiv.innerHTML += `
                    
                    <small id="nomeDesempenho${nomeNota}"><b>${nomeNota}</b>: ${valorNota}</small><small id="notaReferencia">/${referenciaDeNotas[nomeNota]}</small>
                    <div class="progress mb-3" style="height: 10px">
                    <div class="progress-bar bg-primary" role="progressbar" style="width: ${barra}%" aria-valuenow="${valorNota}" aria-valuemin="0" aria-valuemax="${referenciaDeNotas[nomeNota]}">${valorNota}</div>
                    </div>
                    `
                    
                }
            }
            
            notasDoAlunoDiv.innerHTML += `<div id="somatorioNotas">Somatório: <b>${somatorioNotas}</b></div>`

            
        }).catch(error => {
            AstNotif.dialog('Erro', error.message)
            console.log(error)
        })
        
    })
}



function historicoAluno() {
    abrirModal('modal', 'Histórico escolar', 
            `
            <div class="container-xl">
            <div class="table-responsive">
              <div class="table-wrapper">
                <div class="table-title">
                  <div class="row">
                    <div class="col-sm-6">
                      <h2>Histórico <b>Escolar</b></h2>
                    </div>
                    <div class="col-sm-6">
                      <!--<a href="#" class="btn btn-success" onclick="carregaListaDeAlunos()">&nbsp; <span class="feather-24" data-feather="refresh-cw"></span><span>Atualizar lista</span></a>
                      <a href="#deleteEmployeeModal" class="btn btn-danger" data-toggle="modal">&nbsp;<span class="feather-24" data-feather="trash"></span> <span>Delete</span></a>-->						
                    </div>
                  </div>
                </div>
                <table class="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>
                        <span class="custom-checkbox">
                          <input type="checkbox" id="selectAll">
                          <label for="selectAll"></label>
                        </span>
                      </th>
                      <th><a href="#" id="ordenaTurma">Turma</a></th>
                      <th><a href="#" id="ordenaData">Data de fechamento</a></th>
                      <th><a href="#" id="ordenaNota">Somatório das notas</a></th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody id="listaHistorico">
                    
                  </tbody>
                </table>
                
              </div>
            </div>
          </div>    

            `, `<button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`
        )
        let listaHistorico = document.getElementById('listaHistorico')
        listaHistorico.innerHTML = `
        <tr>
            <td>
               
            </td>
            <td></td>
            <td>Você ainda não possui nenhum histórico escolar disponível.</td>
            <td><b></b></td>
            <td>
                
            </td>
        </tr>
        `
        let c = 0
    alunosRef.child(registroAcademico + '/historicoEscolar').on('child_added', (registro) => {
        
        c++
        let dataFechamento = new Date(registro.val().timestamp._seconds * 1000)
        let notas = registro.val().infoAluno.notas
        let somatorioNota = 0
        for (const nomeNota in notas) {
            if (Object.hasOwnProperty.call(notas, nomeNota)) {
                const nota = notas[nomeNota];
                somatorioNota += nota
            }
        }

        if (c == 1) {
            listaHistorico.innerHTML = ``
        }
        listaHistorico.innerHTML += `
        <tr>
            <td>
                <span class="custom-checkbox">
                    <input type="checkbox" id="checkbox${c}" name="options[]" value="1">
                    <label for="checkbox${c}"></label>
                </span>
            </td>
            <td>${registro.val().turma}</td>
            <td>${dataFechamento.getDate()}/${dataFechamento.getMonth() + 1}/${dataFechamento.getFullYear()}</td>
            <td><b>${somatorioNota}</b>/100</td>
            <td>
                <a id="emiteBoletim${c}" onclick="emiteBoletim('${registroAcademico}', '${registro.key}')" class="action" data-toggle="modal"><i data-feather="file-text" data-toggle="tooltip" title="Emitir boletim"></i></a>
                <a href="#" id="verHistorico${c}" class="edit" data-toggle="modal"><i data-feather="eye" data-toggle="tooltip" title="Visualizar dados"></i></a>
            </td>
        </tr>
        `
        document.querySelector('#verHistorico' + c).addEventListener('click', (e) => {
            e.preventDefault()
            visualizarDadosDoHistorico(registro.val())
        })

        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        })
        feather.replace()
        loaderRun()
        ativaCheckboxes()
    })

    alunosDesativadosRef.child(registroAcademico + '/dadosAluno/historicoEscolar').on('child_added', (registro) => {
        
        c++
        let dataFechamento = new Date(registro.val().timestamp._seconds * 1000)
        let notas = registro.val().infoAluno.notas
        let somatorioNota = 0
        for (const nomeNota in notas) {
            if (Object.hasOwnProperty.call(notas, nomeNota)) {
                const nota = notas[nomeNota];
                somatorioNota += nota
            }
        }

        if (c == 1) {
            listaHistorico.innerHTML = ``
        }
        listaHistorico.innerHTML += `
        <tr>
            <td>
                <span class="custom-checkbox">
                    <input type="checkbox" id="checkbox${c}" name="options[]" value="1">
                    <label for="checkbox${c}"></label>
                </span>
            </td>
            <td>${registro.val().turma}</td>
            <td>${dataFechamento.getDate()}/${dataFechamento.getMonth() + 1}/${dataFechamento.getFullYear()}</td>
            <td><b>${somatorioNota}</b>/100</td>
            <td>
                <a id="emiteBoletim${c}" onclick="emiteBoletim('${registroAcademico}', '${registro.key}')" class="action" data-toggle="modal"><i data-feather="file-text" data-toggle="tooltip" title="Emitir boletim"></i></a>
                <a href="#" id="verHistorico${c}" class="edit" data-toggle="modal"><i data-feather="eye" data-toggle="tooltip" title="Visualizar dados"></i></a>
            </td>
        </tr>
        `
        document.querySelector('#verHistorico' + c).addEventListener('click', (e) => {
            e.preventDefault()
            visualizarDadosDoHistorico(registro.val())
        })

        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        })
        feather.replace()
        loaderRun()
        ativaCheckboxes()
    })
}

function emiteBoletim(matricula, chave) {
    document.getElementById('corpoBoletim').innerHTML = `<iframe src="../resources/pdfsProntos/documento.html#boletim?${matricula}?${chave}" frameborder="0" width="100%" height="300px" id="boletimPdf" name="boletimPdf"></iframe>`
    $('#boletimModal').modal({backdrop: 'static'})
}

function visualizarDadosDoHistorico(info) {
    console.log(info)
    $('#modal').modal('hide')
    let referenciaDeNotas = info.infoAluno.notasReferencia
    document.getElementById('mostraTurmaAluno').innerText = info.turma
    document.getElementById('notasDoAluno').innerHTML = ''
    let somatorioNotas = 0
    for (const nomeNota in info.infoAluno.notas) {
        if (Object.hasOwnProperty.call(info.infoAluno.notas, nomeNota)) {
            const nota = info.infoAluno.notas[nomeNota];
            const barra = (100*nota)/referenciaDeNotas[nomeNota]
            somatorioNotas += nota
            
            document.getElementById('notasDoAluno').innerHTML += `
                <small id="nomeNota${nomeNota}"><b>${nomeNota}</b>: ${nota}</small><small id="notaReferencia">/${referenciaDeNotas[nomeNota]}</small>
                <div class="progress mb-3" style="height: 10px">
                <div class="progress-bar bg-primary" role="progressbar" style="width: ${barra}%" aria-valuenow="${nota}" aria-valuemin="0" aria-valuemax="${referenciaDeNotas[nomeNota]}">${nota}</div>
                </div>
            `
        }
    }
    document.getElementById('notasDoAluno').innerHTML += `<div id="somatorioNotas">Somatório: <b>${somatorioNotas}</b></div>`

    somatorioNotas = 0
    document.getElementById('desempenhoAluno').innerHTML = ''
    for (const nomeNota in info.infoAluno.desempenho) {
        if (Object.hasOwnProperty.call(info.infoAluno.desempenho, nomeNota)) {
            const valorNota = info.infoAluno.desempenho[nomeNota];
            
            somatorioNotas += valorNota
            document.getElementById('desempenhoAluno').innerHTML += `
            
            <small id="nomeDesempenho${nomeNota}"><b>${nomeNota}</b>: ${valorNota}</small>
            <br><br>
            `
            
        }
    }
    
    document.getElementById('desempenhoAluno').innerHTML += `<div id="somatorioNotas">Somatório: <b>${somatorioNotas}</b></div>`

    document.getElementById('divFrequencias').innerHTML = ''
    for (const data in info.infoAluno.frequencia) {
        if (Object.hasOwnProperty.call(info.infoAluno.frequencia, data)) {
            let diaFrequencia = data.split('T')[0]
            let horaFrequencia = data.split('T')[1]

            document.getElementById('divFrequencias').innerHTML += `
            <div class="row justify-content-start">
                <div class="col-auto" style="background-color: rgba(86,61,124,.15);border: 1px solid rgba(86,61,124,.2);">${diaFrequencia.split('-').reverse().join('/')} ás ${horaFrequencia}</div>
                <div class="col-auto" style="background-color: rgba(86,61,124,.15);border: 1px solid rgba(86,61,124,.2);">Presente</div>
            </div>
            `
            
        }
    }

    document.getElementById('rolaTelaAbaixoAlunos').style.display = 'block'
    document.getElementById('rolaTelaAbaixoAlunos').focus()
    document.getElementById('rolaTelaAbaixoAlunos').style.display = 'none'

    AstNotif.notify('Notas carregadas...', 'Agora você está visualizando as notas do período que você escolheu.', 'agora', {length: 15000})
}

function followUpAluno(matricula) {
    
    if (matricula == '00000' || matricula == '') {
        AstNotif.dialog('Atenção', 'Você deve clicar em um aluno para descrever um follow up.')
        loaderRun()
    } else {
        followUpRef.on('value', (snapshot) => {
            const aluno = alunos[matricula]
            let id
            let followUpSalvos
            if (snapshot.exists() == false) {
                id = 0
            } else {
                followUpSalvos = snapshot.val()
                for (const idFollow in followUpSalvos) {
                    if (Object.hasOwnProperty.call(followUpSalvos, idFollow)) {
                        const followUp = followUpSalvos[idFollow];
                        id = Number(idFollow) + 1
                    }
                }
            }
            abrirModal('modal', 'Adicionar um Follow Up', `
                <form id="adicionarFollowUpAluno" >
                    <label>Nome: ${aluno.nomeAluno}</label> | <label>Matrícula: ${aluno.matriculaAluno}</label>

                    <div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <span class="input-group-text" id="basic-addon3">ID do FollowUp</span>
                        </div>
                        <input type="text" class="form-control" id="idFollowUpAluno" name="idFollowUpAluno" aria-describedby="basic-addon3" readonly value="${id}">
                    </div>
                    <div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <span class="input-group-text" id="tituloFollowUpAluno" >Título</span>
                        </div>
                        <input type="text" class="form-control" name="tituloFollowUpAluno" id="basic-url" aria-describedby="basic-addon3">
                    </div>
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <span class="input-group-text">Descrição</span>
                        </div>
                        <textarea class="form-control" aria-label="With textarea" name="descricaoFollowUp"></textarea>
                    </div>
                    <br>
                    <button class="btn btn-primary" type="submit" id="salvarFollowUpAluno">Salvar Follow Up</button>
                    <input type="text" name="matriculaFollowUp" id="matriculaFollowUp" value="${aluno.matriculaAluno}" style="display: none">
                    <input type="text" name="nomeFollowUp" id="nomeFollowUp" value="${aluno.nomeAluno}" style="display: none">
                </form>`,
                `<button class="btn btn-secondary" data-dismiss="modal">Cancelar</button><button class="btn btn-primary" data-dismiss="modal" onclick="carregaFollowUps('${aluno.matriculaAluno}')">Ver todos os Follow Up do aluno</button>`
            )
            document.querySelector('#adicionarFollowUpAluno').addEventListener('submit', (e) => {
                e.preventDefault()
                loaderRun(true, 'Carregando dados do FollowUp...')
                const dados = new FormData(e.target);
                let dadosFollowUp = {}
                dadosFollowUp.nome = dados.get('nomeFollowUp')
                dadosFollowUp.matricula = dados.get('matriculaFollowUp')
                dadosFollowUp.descricao = dados.get('descricaoFollowUp')
                dadosFollowUp.titulo = dados.get('tituloFollowUpAluno')
                dadosFollowUp.id = dados.get('idFollowUpAluno')
                dadosFollowUp.autor = usuarioAtual().displayName
                console.log(dadosFollowUp)
                followUpRef.child(dadosFollowUp.id).set(dadosFollowUp).then(() => {
                    AstNotif.notify('Sucesso', 'O FollowUp foi salvo com sucesso.', 'agora', {length: -1})
                    loaderRun()
                }).catch(error =>{
                    AstNotif.dialog('Erro', error.message)
                    console.log(error)
                    loaderRun()
                })
            })
        })
        
    }
}

function mostraDadosResponsaveis() {
    function mostraResponsaveisCadastrados() {
        abrirModal('modal', 'Ver dados dos responsáveis', 
        `
        <section id="mostraResponsaveis">

        </section>
        
        `, 
        `<button class="btn btn-secondary" data-dismiss="modal">Fechar</button>`
    )
        let responsaveis = dadosResponsaveis
        let sectionResponsaveis = document.getElementById('mostraResponsaveis')
        console.log(responsaveis)
        sectionResponsaveis.innerHTML = ''
        for (const i in responsaveis) {
            if (Object.hasOwnProperty.call(responsaveis, i)) {
                const responsavel = responsaveis[i];
                sectionResponsaveis.innerHTML += `
                <div class="form-row border border-success rounded">
                
                <div class="form-group col-md-4">
                    <label for="inputAddress">Responsável</label>
                    <input type="text" class="form-control" id="nome${i}" name="nome" placeholder="Nome" onblur="maiusculo(this)" disabled value="${responsavel.nome}">
                </div>
                <div class="form-group col-md-2">
                    <label for="inputAddress">Relação</label>
                    
                    <input type="text" class="form-control form-control-md" value="${responsavel.relacao}" name="relacao" id="relacao${i}" disabled>
                </div>
                <div class="form-group col-md-3">
                    <label for="inputAddress">Número Celular</label>
                    <input type="text" class="form-control" id="celular${i}" value="${responsavel.celular}" name="celular" placeholder="Celular" disabled>
                </div>
                
                <div class="form-group col-md-5">
                    <label for="inputPassword4">Email</label>
                    <input type="email" class="form-control" id="email${i}" value="${responsavel.email}" name="email" placeholder="Email" disabled>
                </div>
                
                <div class="form-group col-auto">
                    <label for="inputEmail4">RG</label>
                    <input type="text" class="form-control" id="rg${i}" value="${responsavel.rg}" name="rg" placeholder="RG" disabled>
                </div>
                
                <div class="form-group col-auto">
                    <label for="inputPassword4">CPF</label>
                    <input type="text" class="form-control" id="cpf${i}" value="${responsavel.cpf}" name="cpf" placeholder="CPF" onchange="verificaCPF(this)" disabled>
                    <small id="cpfHelp3" class="form-text text-muted">Digite um CPF válido, existe um algoritmo de validação neste campo.</small>
                </div>
                    <div class="custom-control custom-checkbox">
                    &nbsp;&nbsp;
                        <input type="checkbox" class="custom-control-input" ${responsavel.pedagogico ? 'checked' : null} disabled id="pedagogico${i}" name="pedagogico">
                        <label class="custom-control-label" for="pedagogico${i}">Responsável pedagógico</label>
                    </div>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <div class="custom-control custom-checkbox">
                        <input type="checkbox" class="custom-control-input" ${responsavel.financeiro ? 'checked' : null} disabled id="financeiro${i}" name="financeiro">
                        <label class="custom-control-label" for="financeiro${i}">Responsável financeiro</label>
                    </div>
                </div>
                <br>
                `

                // for (const id in responsavel) {
                //     if (Object.hasOwnProperty.call(responsavel, id)) {
                //         const value = responsavel[id];
                //         console.log(value)
                //         document.getElementById(id + i).value = value
                //         if (id == 'pedagogico' || id == 'financeiro') {
                //             document.getElementById(id + i).checked = value
                //         }
                //     }
                // }
            }
        }
        escutaEditaResp()
    }
    
    mostraResponsaveisCadastrados()
      
}

function editarDadosAluno(matricula) {
    let aluno = dadosAluno

    abrirModal('modal', 'Ver e Editar dados de ' + aluno.nomeAluno, `
    <form id="formEditaAluno" onkeydown="return event.key != 'Enter';">
        <label class="h6">Dados pessoais</label>
        
        <div class="form-row">
        <div class="form-group col-auto">
            <label for="inputEmail4">Telefone (fixo)</label>
            <input type="phone" onkeypress="$(this).mask('(00) 0000-00009')" class="form-control" id="telefoneAluno" name="telefoneAluno" placeholder="Número">
        </div>
        
        <div class="form-group col-auto">
            <label for="inputPassword4">Celular</label>
            <input type="phone" class="form-control" id="celularAluno" name="celularAluno" placeholder="Número" onkeypress="$(this).mask('00000000009')" required>
            <small id="senhaHelp" class="form-text text-muted">Digite o DDD seguido do número (Ex.: 31999999999)</small>
        </div>
        
        <div class="form-group col-md-5">
            <label for="inputPassword4">Email</label>
            <input type="email" readonly class="form-control" id="emailAluno" name="emailAluno" placeholder="Email" required>
        </div>
        </div>
        <div class="form-row">
        <div class="form-group col-md-3">
            <label for="inputEmail4">Senha de acesso ao portal</label>
            <div class="input-group mb-3">
            <div class="input-group-prepend">
                <div class="input-group-text">
                <input type="checkbox" aria-label="Mostra e esconde a senha" onclick="this.checked ? (document.getElementById('senhaAluno').type = 'text'):(document.getElementById('senhaAluno').type = 'password')">
                </div>
            </div>
            <input type="password" class="form-control" id="senhaAluno" name="senhaAluno" placeholder="Senha" required>
            </div>
            <small id="senhaHelp" class="form-text text-muted">A senha precisa ter no mínimo 6 caracteres.</small>
        </div>
        
        </div>
        <hr>
        <label class="h6">Dados de endereço</label>
        <div class="form-row col-md-4">
        <label for="inputZip">CEP (somente números)</label>
        <input type="text" class="form-control" id="cepAluno" name="cepAluno" placeholder="CEP" onchange="preencheEndereco(this.value)" onkeypress="$(this).mask('00.000-000')">
        <small id="emailHelp" class="form-text text-muted">O CEP é opcional, mas quando inserido preenche o endereço automaticamente.</small>
        </div>
        <div class="form-row">
        <div class="form-group col-md-5">
            <label for="inputAddress2">Rua</label>
            <input type="text" class="form-control" id="enderecoAluno" name="enderecoAluno" placeholder="Endereço">
        </div>
        <div class="form-group col-md-1">
            <label for="inputAddress2">Número</label>
            <input type="number" class="form-control" id="numeroAluno" name="numeroAluno" placeholder="Núm.">
        </div>
        <div class="form-group col-md-2">
            <label for="inputCity">Bairro</label>
            <input type="text" class="form-control" id="bairroAluno"name="bairroAluno" placeholder="Bairro">
        </div>
        <div class="form-group col-md-2">
            <label for="inputState">Cidade</label>
            <input type="text" class="form-control" id="cidadeAluno" name="cidadeAluno" placeholder="Cidade">
        </div>
        <div class="form-group col-md-1">
            <label for="inputState">Estado</label>
            <input type="text" class="form-control" id="estadoAluno" name="estadoAluno" placeholder="Estado">
        </div>
        </div>
        <hr>
        <label class="h6">Dados opcionais</label>
                <div class="form-row col-auto">
                  <label for="inputZip">"Qual o seu objetivo ao adquirir o curso?"</label>
                  <input type="text" class="form-control" id="objetivoAluno" name="objetivoAluno" placeholder="Descreva...">
                </div>
                <br>
                <div class="form-row col-auto">
                  <label for="inputZip">"Toma remédios controlados? Se sim, qual e com que frequência?"</label>
                  <input type="text" class="form-control" id="remedioAluno" name="remedioAluno" placeholder="Descreva...">
                </div>
                <br>
                <div class="form-row col-auto">
                  <label for="inputZip">"Possui alguma alergia? Se sim qual?"</label>
                  <input type="text" class="form-control" id="alergiaAluno" name="alergiaAluno" placeholder="Descreva...">
                </div>
                <br>
                <div class="form-row col-auto">
                  <label for="inputZip">"Possui intolerância a algum alimento? Se sim qual?"</label>
                  <input type="text" class="form-control" id="intoleranciaAluno" name="intoleranciaAluno" placeholder="Descreva...">
                </div>
                <br>
                <div class="form-row col-auto">
                  <label for="inputZip">"Qual curso está fazendo atualmente?"</label>
                  <input type="text" class="form-control" id="cursoAtualmenteAluno" name="cursoAtualmenteAluno" placeholder="Descreva...">
                </div>
                <br>
                
                <div class="form-row col-auto">
                  <label for="marketing">"Como conheceu a escola?"</label>
                  <select class="form-control" name="marketing" id="marketing">
                    <option selected hidden>Escolha...</option>
                    <option value="Jornal">Jornal</option>
                    <option value="Internet">Internet</option>
                    <option value="Redes Sociais">Redes Sociais</option>
                    <option value="Eventos">Eventos</option>
                    <option value="Indicação">Indicação</option>
                    <option value="Outdoors/Panfletos">Outdoors/Panfletos</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <br>
                <div class="form-row col-auto">
                  <label for="vencimento">Data preferencial para vencimento</label>
                  <select class="form-control" name="vencimento" id="vencimento">
                    <option selected hidden>Escolha...</option>
                    
                  </select>
                </div>
                
                <br>
                <div class="form-row col-auto">
                  <label for="inputZip">Outras observações...</label>
                  <input type="text" class="form-control" id="observacoesAluno" name="observacoesAluno" placeholder="Descreva...">
                </div>
                <br>
                <label><b>Dias e horários disponíveis:</b></label>
                <div class="form-row">
                  <div class=" col-md-2">
                    <div class="custom-control custom-checkbox">
                      
                      <label  for="segunda">Segunda-feira</label>
                    </div>
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="segundaHora1" name="segundaHora1" placeholder="Horário">
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="segundaHora2" name="segundaHora2" placeholder="Horário">
                  </div>
                </div>
                <hr>
                <div class="form-row">
                  <div class=" col-md-2">
                    <div class="custom-control custom-checkbox">
                      
                      <label for="terca">Terça-feira</label>
                    </div>
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="tercaHora1" name="tercaHora1" placeholder="Horário">
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="tercaHora2" name="tercaHora2" placeholder="Horário">
                  </div>
                </div>
                <hr>
                <div class="form-row">
                  <div class=" col-md-2">
                    <div class="custom-control custom-checkbox">
                      
                      <label  for="quarta">Quarta-feira</label>
                    </div>
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="quartaHora1" name="quartaHora1" placeholder="Horário">
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="quartaHora2" name="quartaHora2" placeholder="Horário">
                  </div>
                </div>
                <hr>
                <div class="form-row">
                  <div class=" col-md-2">
                    <div class="custom-control custom-checkbox">
                      
                      <label  for="quinta">Quinta-feira</label>
                    </div>
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="quintaHora1" name="quintaHora1" placeholder="Horário">
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="quintaHora2" name="quintaHora2" placeholder="Horário">
                  </div>
                </div>
                <hr>
                <div class="form-row">
                  <div class=" col-md-2">
                    <div class="custom-control custom-checkbox">
                      
                      <label  for="sexta">Sexta-feira</label>
                    </div>
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="sextaHora1" name="sextaHora1" placeholder="Horário">
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="sextaHora2" name="sextaHora2" placeholder="Horário">
                  </div>
                </div>
                <hr>
                <div class="form-row">
                  <div class=" col-md-2">
                    <div class="custom-control custom-checkbox">
                      
                      <label  for="sabado">Sábado</label>
                    </div>
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="sabadoHora1" name="sabadoHora1" placeholder="Horário">
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="sabadoHora2" name="sabadoHora2" placeholder="Horário">
                  </div>
                </div>
                <hr>
                <div class="form-row">
                  <div class=" col-md-2">
                    <div class="custom-control custom-checkbox">
                      
                      <label  for="domingo">Domingo</label>
                    </div>
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="domingoHora1" name="domingoHora1" placeholder="Horário">
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="domingoHora2" name="domingoHora2" placeholder="Horário">
                  </div>
                </div>
                
                  <br>
                  
                  
        <button type="submit" class="btn btn-primary btn-block">Salvar dados</button>
        <hr>
        <h6>Dados dos responsáveis</h6>
        <label>Para editar os dados dos responsáveis você deve abrir a ficha do aluno</label>
        <section id="responsaveis">

        </section>
    </form>
    `, '<button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>');
    
    for (let i = 0; i < 28; i++) {
        let opt = document.createElement('option')
        opt.value = i + 1
        opt.innerHTML = i + 1
        document.getElementById('vencimento').appendChild(opt)                 
    }

    let formEditaAluno = document.getElementById('formEditaAluno');
    let campos = $('#formEditaAluno').serializeArray();
    console.log(campos)
    
    let responsaveis = aluno.responsaveis
        let sectionResponsaveis = document.getElementById('responsaveis')
        console.log(responsaveis)
        sectionResponsaveis.innerHTML = ''
        for (const i in responsaveis) {
            if (Object.hasOwnProperty.call(responsaveis, i)) {
                const responsavel = responsaveis[i];
                sectionResponsaveis.innerHTML += `
                <div class="form-row border border-success rounded">
                
                <div class="form-group col-md-4">
                    <label for="inputAddress">Responsável</label>
                    <input type="text" class="form-control" id="nome${i}" name="nome" placeholder="Nome" onblur="maiusculo(this)" disabled value="${responsavel.nome}">
                </div>
                <div class="form-group col-md-2">
                    <label for="inputAddress">Relação</label>
                    
                    <input type="text" class="form-control form-control-md" value="${responsavel.relacao}" name="relacao" id="relacao${i}" disabled>
                    
                </div>
                <div class="form-group col-md-3">
                    <label for="inputAddress">Número Celular</label>
                    <input type="text" class="form-control" id="celular${i}" value="${responsavel.celular}" name="celular" placeholder="Celular" disabled>
                </div>
                
                <div class="form-group col-md-5">
                    <label for="inputPassword4">Email</label>
                    <input type="email" class="form-control" id="email${i}" value="${responsavel.email}" name="email" placeholder="Email" disabled>
                </div>
                
                <div class="form-group col-auto">
                    <label for="inputEmail4">RG</label>
                    <input type="text" class="form-control" id="rg${i}" value="${responsavel.rg}" name="rg" placeholder="RG" disabled>
                </div>
                
                <div class="form-group col-auto">
                    <label for="inputPassword4">CPF</label>
                    <input type="text" class="form-control" id="cpf${i}" value="${responsavel.cpf}" name="cpf" placeholder="CPF" onchange="verificaCPF(this)" disabled>
                    <small id="cpfHelp3" class="form-text text-muted">Digite um CPF válido, existe um algoritmo de validação neste campo.</small>
                </div>
                <div class="custom-control custom-checkbox">
                    &nbsp;&nbsp;
                        <input type="checkbox" class="custom-control-input" ${responsavel.pedagogico ? 'checked' : null} disabled id="pedagogico${i}" name="pedagogico">
                        <label class="custom-control-label" for="pedagogico${i}">Responsável pedagógico</label>
                    </div>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <div class="custom-control custom-checkbox">
                        <input type="checkbox" class="custom-control-input" ${responsavel.financeiro ? 'checked' : null} disabled id="financeiro${i}" name="financeiro">
                        <label class="custom-control-label" for="financeiro${i}">Responsável financeiro</label>
                    </div>
                </div>
                <br>
                `

                // for (const id in responsavel) {
                //     if (Object.hasOwnProperty.call(responsavel, id)) {
                //         const value = responsavel[id];
                //         console.log(value)
                //         document.getElementById(id + i).value = value
                //         if (id == 'pedagogico' || id == 'financeiro') {
                //             document.getElementById(id + i).checked = value
                //         }
                //     }
                // }
            }
        }

    for (const key in campos) {
        if (Object.hasOwnProperty.call(campos, key)) {
            const element = campos[key];
            console.log(element)
            console.log(aluno[element.name])
            try {
                if (element.name == 'imagemAluno') {
                    document.getElementById(aluno[element.name]).checked = true;
                } else if (aluno[element.name] != 'on') {
                    document.getElementById(element.name).checked = false
                }
                document.getElementById(element.name).value = aluno[element.name] == undefined ? null : aluno[element.name] ;
                
            } catch (error) {
                console.log(error)
            }
           
            
            
                
        }
    }
    
    formEditaAluno.addEventListener('submit', (e) => {
        e.preventDefault();
        campos = $('#formEditaAluno').serializeArray();
        console.log(campos)
        let alunoObjNew = {}
        for (const key in campos) {
            if (Object.hasOwnProperty.call(campos, key)) {
                const element = campos[key];
                alunoObjNew[element.name] = element.value
            }
        }
        console.log(alunoObjNew)
        alunosRef.child(registroAcademico).update(alunoObjNew).then(() => {
            AstNotif.notify('Sucesso', 'Dados alterados com sucesso.')
            $('#modal').modal('hide');
            atualizaDadosAluno();
        }).catch(error => {
            AstNotif.dialog('Erro', error.message)
            console.log(error)
        })
    })
}

function carregaFollowUps(matricula='') {
    loaderRun(true, 'Carregando Follow Up...')
    followUpRef.orderByChild('matricula').equalTo(matricula).once('value').then(snapshot => {
        abrirModal('modal', `FollowUp(s) cadastrado(s)`,
            `
            <label id="nomeAlunoDoFollowUp"></label>
            <div class="overflow-auto" style="height: fit-content; max-height: 280px;">
                <div class="list-group" id="listaFollowUpAluno">

                </div>
            </div>
            `
            , `<button class="btn btn-secondary" data-dismiss="modal">Cancelar</button>`
        )
        let listaFollowUpAluno = document.getElementById('listaFollowUpAluno')
        listaFollowUpAluno.innerHTML = ''
        for (const id in snapshot.val()) {
            if (Object.hasOwnProperty.call(snapshot.val(), id)) {
                const followUp = snapshot.val()[id];
                document.getElementById('nomeAlunoDoFollowUp').innerText = followUp.nome + ' | ' + followUp.matricula
                listaFollowUpAluno.innerHTML += `<button class="list-group-item list-group-item-action" onclick="verFollowUp('${id}')"><b>Título:</b> ${followUp.titulo}</button>`
            }
        }
        loaderRun()
    }).catch((error) => {
        console.log(error)
        AstNotif.dialog('Erro', error.message)
        loaderRun()
    })
}

function verFollowUp(id) {
    loader.style.display = 'block'
    loaderMsg.innerText = 'Carregando FollowUp...'
    followUpRef.child(id).once('value').then(snapshot => {
        AstNotif.dialog(snapshot.val().titulo, snapshot.val().descricao + ' <br><br> <b>Autor do FollowUp:</b> ' + snapshot.val().autor, {positive: "OK",negative: ''})

        loaderRun()
    }).catch(error => {
        AstNotif.dialog('Erro', error.message)
        console.log(error)
        loaderRun()
    })
    
}

function carregaHistoricoAluno() {
    let listaHistoricoAluno = document.getElementById('listaHistoricoAluno')
    listaHistoricoAluno.innerHTML = ''
    try {
        const historico = dadosAluno.historico
        for (const key in historico) {
            if (Object.hasOwnProperty.call(historico, key)) {
                const infos = historico[key];
                if (infos.operacao == 'Transferência de alunos') {
                    listaHistoricoAluno.innerHTML += `<button class="list-group-item list-group-item-action" onclick="verOperacaoAluno('${registroAcademico}', '${key}')"><b>Operação:</b> ${infos.operacao}: ${infos.dados.turmaAtual} --> ${infos.dados.turmaParaQualFoiTransferido}</button>`
                } else if(infos.operacao == 'Desativação de aluno') {
                    listaHistoricoAluno.innerHTML += `<button class="list-group-item list-group-item-action" onclick="verOperacaoAluno('${registroAcademico}', '${key}')"><b>Operação:</b> ${infos.operacao}: ${infos.dados.turmaAtual} --> Desativado</button>`
                } else if (infos.operacao == 'Reativação de aluno') {
                    listaHistoricoAluno.innerHTML += `<button class="list-group-item list-group-item-action" onclick="verOperacaoAluno('${registroAcademico}', '${key}')"><b>Operação:</b> ${infos.operacao}: Aluno reativado na turma ${infos.dados.turmaAtivacao}</button>`
                }
            }
        }
    } catch (error) {
        console.log(error)
        const historico = alunosDesativados[registroAcademico].dadosAluno.historico
        for (const key in historico) {
            if (Object.hasOwnProperty.call(historico, key)) {
                const infos = historico[key];
                if (infos.operacao == 'Transferência de alunos') {
                    listaHistoricoAluno.innerHTML += `<button class="list-group-item list-group-item-action" onclick="verOperacaoAluno('${registroAcademico}', '${key}')"><b>Operação:</b> ${infos.operacao}: ${infos.dados.turmaAtual} --> ${infos.dados.turmaParaQualFoiTransferido}</button>`
                } else if(infos.operacao == 'Desativação de aluno') {
                    listaHistoricoAluno.innerHTML += `<button class="list-group-item list-group-item-action" onclick="verOperacaoAluno('${registroAcademico}', '${key}')"><b>Operação:</b> ${infos.operacao}: ${infos.dados.turma} --> Desativado</button>`
                } else if (infos.operacao == 'Reativação de aluno') {
                    listaHistoricoAluno.innerHTML += `<button class="list-group-item list-group-item-action" onclick="verOperacaoAluno('${registroAcademico}', '${key}')"><b>Operação:</b> ${infos.operacao}: Aluno reativado na turma ${infos.dados.turmaAtivacao}</button>`
                }
            }
        }
    }
    
}

function verOperacaoAluno(matricula, key) {
    const infos = alunos[matricula].historico[key]
    let corpo = `
        
    `
    abrirModal('modal', 'Visualização da operação ' + infos.operacao, corpo, `<button class="btn btn-secondary" data-dismiss="modal">Fechar</button>`)
}