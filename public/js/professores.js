var secretariaRef = firebase.database().ref('sistemaEscolar/secretaria')
var numerosRef = firebase.database().ref('sistemaEscolar/numeros')
var aniversariosRef = firebase.database().ref('sistemaEscolar/aniversarios')
var listaDeUsuariosRef = firebase.database().ref('sistemaEscolar/listaDeUsuarios')
var listaDeProfessores = firebase.database().ref('sistemaEscolar/listaDeProfessores')
var turmasRef = firebase.database().ref('sistemaEscolar/turmas')
var ultimaMatriculaRef = firebase.database().ref('sistemaEscolar/ultimaMatricula')
var alunosRef = firebase.database().ref('sistemaEscolar/alunos')
var followUpRef = firebase.database().ref('sistemaEscolar/followUp')
var transfereAlunos = firebase.functions().httpsCallable('transfereAlunos')
var usuarioRef = firebase.database().ref('sistemaEscolar/usuarios')

var loader = document.getElementById('loader')
var loaderMsg = document.getElementById('loaderMsg')

$(function () {
    $('[data-toggle="tooltip"]').tooltip()
  })

  $(function () {
    $('[data-toggle="popover"]').popover()
  })
var turmasProf
var alunos
firebase.auth().onAuthStateChanged((user) => {
    update()
    if (user == null) {
        loader.style.display = 'none'
        AstNotif.dialog('Login não identificado', 'Você não está logado, vá para a tela de <a href="../login.html">login</a> para logar ou se cadastrar.')
    } else {
        usuarioRef.child(user.uid).once('value').then(snapshot => {
            let dadosUser = snapshot.val()
            if (dadosUser.professor != undefined) {
                turmasProf = dadosUser.professor.turmas
                for (const turma in turmasProf) {
                    if (Object.hasOwnProperty.call(turmasProf, turma)) {
                        const bool = turmasProf[turma];
                        if (bool) {
                            document.getElementById('listaTurmasProf').innerHTML = `<button class="list-group-item list-group-item-action" onclick="document.getElementById('btnAbaTurmas').click(),abreTurma('${turma}')">Turma ${turma}</button>`
                        }
                    }
                }
            }
        }).catch(error => {
            AstNotif.dialog('Erro', error.message)
            console.log(error)
        })
        loader.style.display = 'block'
        loaderMsg.innerText = 'Buscando informações do usuário...'
        try {
            if (user.photoURL != null) {
                document.getElementById('profilePic').src = user.photoURL
                document.getElementById('username').innerHTML = "Olá,<br>" + user.displayName.split(' ')[0]
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
            loader.style.display = 'none'
        })
    }
    
})

function carregaListaDeAlunos(filtro='') {
    console.log(filtro)
    loader.style.display = 'block'
    loaderMsg.innerText = 'Carregando lista de alunos...'
    let listaAlunos = document.getElementById('listaAlunos')
    if (filtro == '') {
        document.getElementById('listaAlunos').innerHTML = ''
        alunosRef.on('value', (snapshot) => {
            alunos = snapshot.val()
            for (const matricula in alunos) {
                if (Object.hasOwnProperty.call(alunos, matricula)) {
                    const aluno = alunos[matricula];
                    document.getElementById('listaAlunos').innerHTML += `<button class="list-group-item list-group-item-action" onclick="abreDadosDoAluno('${matricula}')">${matricula}: ${aluno.nomeAluno} (${aluno.turmaAluno})</button>`
                }
            }
            loader.style.display = 'none'
        })
    } else {
        document.getElementById('listaAlunos').innerHTML = ''
        alunosRef.orderByChild(tipoDeBusca).equalTo(filtro).once('value').then(snapshot => {
            alunos = snapshot.val()
            for (const matricula in alunos) {
                if (Object.hasOwnProperty.call(alunos, matricula)) {
                    const aluno = alunos[matricula];
                    document.getElementById('listaAlunos').innerHTML += `<button class="list-group-item list-group-item-action" onclick="abreDadosDoAluno('${matricula}')">${matricula}: ${aluno.nomeAluno} (${aluno.turmaAluno})</button>`
                }
            }
            loader.style.display = 'none'
        }).catch(error => {
            console.log(error)
            AstNotif.dialog('Erro', error.message)
        })
    }
    
}

var turmas
// Funções da aba de turmas da secretaria
function carregaTurmas() {
    alunosSelecionadosTurma = {}
    document.getElementById("areaInfoTurma").style.visibility = 'hidden'
    loader.style.display = 'block'
    loaderMsg.innerText = 'Carregando informações das turmas...'
    var selectTurmas = document.getElementById('selectTurmas')
    for (const turma in turmasProf) {
        if (Object.hasOwnProperty.call(turmasProf, turma)) {
            const bool = turmasProf[turma];
            if (bool) {
                turmasRef.child(turma).once('value').then(snapshot => {
                    selectTurmas.innerHTML = '<option selected hidden>Escolha uma turma...</option>'
                    let infoDaTurma = snapshot.val()
                    if (infoDaTurma.professor == undefined) {
                        var profReferencia = 'Não cadastrado'
                    } else {
                        var profReferencia = infoDaTurma.professor[0].nome
                    }
                    selectTurmas.innerHTML += `<option value="${snapshot.key}">Turma ${snapshot.key} (Prof. ${profReferencia})</option>`
                    document.getElementById('selectTurmas').style.visibility = 'visible'
                    loader.style.display = 'none'
                }).catch(error => {
                    loader.style.display = 'none'
                    console.error(error)
                    AstNotif.dialog('Erro', error.message)
                })
            }
        }
    }
    
}

var alunosSelecionadosTurma = {}


function carregaListaDeAlunosDaTurma(turma, filtro='') {
    
    tipoDeBusca = 'nome'
    alunosSelecionadosTurma.codTurma = turma
    console.log(filtro)
    loader.style.display = 'block'
    loaderMsg.innerText = 'Carregando lista de alunos...'
    let listaAlunos = document.getElementById('listaAlunos')
    if (filtro == '') {
        document.getElementById('listaAlunosDaTurma').innerHTML = ''
        turmasRef.child(turma + '/alunos').once('value').then(snapshot => {
            alunos = snapshot.val()
            for (const matricula in alunos) {
                if (Object.hasOwnProperty.call(alunos, matricula)) {
                    const aluno = alunos[matricula];
                    document.getElementById('listaAlunosDaTurma').innerHTML += `<div class="row"><div class="col-1" ><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="checkbox" name="${matricula}" onclick="this.checked ? alunosSelecionadosTurma[${matricula}] = '${aluno.nome}' : alunosSelecionadosTurma[${matricula}] = '', verificaAlunosSelecionados()"></div><div class="col-md"><button class="list-group-item list-group-item-action" onclick="document.getElementById('btnAbaAlunos').click(), document.getElementById('btnAbaAlunosResponsivo').click(), abreDadosDoAluno('${matricula}'), setTimeout( function() {document.getElementById('rolaTelaAbaixoAlunos').style.display = 'block', document.getElementById('rolaTelaAbaixoAlunos').focus(), document.getElementById('rolaTelaAbaixoAlunos').style.display = 'none'}, 300 ); "> ${matricula}: ${aluno.nome}</button></div></div>`
                }
                
            }
            loader.style.display = 'none'
        }).catch(error => {
            console.log(error)
            AstNotif.dialog('Erro', error.message)
        })
    } else {
        document.getElementById('listaAlunosDaTurma').innerHTML = ''
        turmasRef.child(turma + '/alunos').orderByChild('nome').equalTo(filtro).once('value').then(snapshot => {
            alunos = snapshot.val()
            for (const matricula in alunos) {
                if (Object.hasOwnProperty.call(alunos, matricula)) {
                    const aluno = alunos[matricula];
                    document.getElementById('listaAlunosDaTurma').innerHTML += `<div class="row"><div class="col-sm-1"><input type="checkbox" name="${matricula}" onclick="this.checked ? alunosSelecionadosTurma[${matricula}] = '${aluno.nome}' : alunosSelecionadosTurma[${matricula}] = '', verificaAlunosSelecionados()"></div><div class="col-md"><button class="list-group-item list-group-item-action" onclick="document.getElementById('btnAbaAlunos').click(), document.getElementById('btnAbaAlunosResponsivo').click(), abreDadosDoAluno('${matricula}') "> ${matricula}: ${aluno.nome}</button></div></div>`
                }
            }
            loader.style.display = 'none'
        }).catch(error => {
            console.log(error)
            AstNotif.dialog('Erro', error.message)
        })
    }
    
}

function verificaAlunosSelecionados() {
    let c = 0
    for (const matricula in alunosSelecionadosTurma) {
        if (Object.hasOwnProperty.call(alunosSelecionadosTurma, matricula)) {
            const nome = alunosSelecionadosTurma[matricula];
            
            if (matricula == 'codTurma') {
                
            } else if (nome != "") {
                c++
            }
            console.log(c)
            if (c == 0) {
                document.getElementById('btnTransfereAlunosTurma').disabled = true
                document.getElementById('btnDesativaAlunos').disabled = true
            } else {
                document.getElementById('btnTransfereAlunosTurma').disabled = false
                document.getElementById('btnDesativaAlunos').disabled = false
            }
        }
    }
    
}

function abreTurma(cod) {
    loader.style.display = 'block'
    loaderMsg.innerText = 'Abrindo turma...'
    carregaListaDeAlunosDaTurma(cod)
    var codigoDaTurmaLabel = document.getElementById('codigoDaTurma')
    var areaInfoTurma = document.getElementById('areaInfoTurma')
    turmasRef.child(cod).on('value', (snapshot) => {
        // TODO: Mostrar na tela as informações da turma
        console.log(snapshot.val())
        let dadosDaTurma = snapshot.val()
        codigoDaTurmaLabel.innerText = dadosDaTurma.codigoSala
        areaInfoTurma.style.visibility = 'visible'
        
        // Área separação KIDS, TEENS, ADULTS
        var faixa
        if (dadosDaTurma.faixaTurma == 'A') {
            faixa = 'ADULTS'
        } else if(dadosDaTurma.faixaTurma == 'T') {
            faixa = 'TEENS'
        } else {
            faixa = dadosDaTurma.faixaTurma
        }
        document.getElementById('mostraFaixa').innerHTML = `<a class="list-group-item list-group-item-action active" data-toggle="list" role="tab">${faixa}</a>`
        // Mostra dias de aula da turma
        document.getElementById('mostraDiasTurma').innerText = 'Dia(s) de Aula:'
        for (const key in dadosDaTurma.diasDaSemana) {
            if (Object.hasOwnProperty.call(dadosDaTurma.diasDaSemana, key)) {
                const dia = dadosDaTurma.diasDaSemana[key];
                document.getElementById('mostraDiasTurma').innerText += ' ' + dia + ' '
            }
        }
        document.getElementById('mostraHorarioTurma').innerText = 'Horário de aula: '+ dadosDaTurma.hora + 'h'
        
        document.getElementById('mostraLivrosTurma').innerText = 'Livros cadastrados: '
        for (const key in dadosDaTurma.livros) {
            if (Object.hasOwnProperty.call(dadosDaTurma.livros, key)) {
                const numLivro = dadosDaTurma.livros[key];
                document.getElementById('mostraLivrosTurma').innerText += ` Book ${numLivro} |`
            }
        }

        document.getElementById('timestampTurmaCadastrada').innerText = 'Turma cadastrada em:  ' + new Date(dadosDaTurma.timestamp._seconds * 1000)

        document.getElementById('mostraProfessoresCadastrados').innerHTML = `<ul class="items" id="ulProfCadastrados"></ul>`
        for (const key in dadosDaTurma.professor) {
            if (Object.hasOwnProperty.call(dadosDaTurma.professor, key)) {
                const professor = dadosDaTurma.professor[key];
                document.getElementById('ulProfCadastrados').innerHTML += `
                    <li class="item-dismissible">${professor.nome} (${professor.email})</li>
                `
            }
        }
        loader.style.display = 'none'
        
    })
}

function preencheEndereco(numCep) {
    loader.style.display = 'block'
    loaderMsg.innerText = 'Buscando enderenço com o CEP...'
    let enderecoAluno = document.getElementById('enderecoAluno')
    let bairroAluno = document.getElementById('bairroAluno')
    let cidadeAluno = document.getElementById('cidadeAluno')
    let cepAluno = document.getElementById('cepAluno')
    let estadoAluno = document.getElementById('estadoAluno')
    getAddress(numCep).then(function(result){
        if (result.street == undefined) {
            AstNotif.dialog('Erro ao buscar CEP', 'Verifique o CEP digitado e tente novamente.')
        } else {
            enderecoAluno.value = result.street
            bairroAluno.value = result.neighborhood
            cidadeAluno.value = result.city
            estadoAluno.value = result.state
            document.getElementById('numeroAluno').focus()
            AstNotif.toast('Dados de endereço preenchidos com sucesso!')
        }
        loader.style.display = 'none'
        
    }).catch(function(error){
        AstNotif.dialog('Erro ao buscar CEP', error.message)
        console.log(error)
        loader.style.display = 'none'
    })
}

//Funções da aba Alunos
var tipoDeBusca = 'nomeAluno'
function alteraTipoDeBusca(tipo) {
    tipoDeBusca = tipo
}

var dadosResponsaveis = {}
function abreDadosDoAluno(matricula, desativado=false, notasDesativado=false) {
    carregaHistoricoAluno(matricula)
    document.getElementById('infoDoAluno').style.display = 'block'
    document.getElementById('rolaTelaAbaixoAlunos').style.display = 'block'
    let dados
    if (desativado != false) {
        dados = desativado
        document.getElementById('alunoDesativado').style.display = 'block'
    } else {
        dados = alunos[matricula]
        document.getElementById('alunoDesativado').style.display = 'none'
    }
    dadosResponsaveis = {
        nomeResponsavelAluno1: dados.nomeResponsavelAluno1,
        relacaoAluno1: dados.relacaoAluno1,
        numeroComercialResponsavel1: dados.numeroComercialResponsavel1,
        numeroCelularResponsavel1: dados.numeroCelularResponsavel1,
        rgResponsavel1: dados.rgResponsavel1,
        cpfResponsavel1: dados.cpfResponsavel1,
        // Dados de Filiação responsável 2
        nomeResponsavelAluno2: dados.nomeResponsavelAluno2,
        relacaoAluno2: dados.relacaoAluno2,
        numeroComercialResponsavel2: dados.numeroComercialResponsavel2,
        numeroCelularResponsavel2: dados.numeroCelularResponsavel2,
        rgResponsavel2: dados.rgResponsavel2,
        cpfResponsavel2: dados.cpfResponsavel2,
        // Dados de Filiação Responsável financeiro
        nomeResponsavelFinanceiroAluno: dados.nomeResponsavelFinanceiroAluno,
        relacaoFinanceiroAluno: dados.relacaoFinanceiroAluno,
        numeroComercialFinanceiroAluno: dados.numeroComercialFinanceiroAluno,
        numeroCelularFinanceiroAluno: dados.numeroCelularFinanceiroAluno,
        rgFinanceiroAluno: dados.rgFinanceiroAluno,
        cpfFinanceiroAluno: dados.cpfFinanceiroAluno,
        // Dados de Filiação responsável pedagógico/didático
        nomeResponsavelPedagogicoAluno: dados.nomeResponsavelPedagogicoAluno,
        relacaoPedagogicoAluno: dados.relacaoPedagogicoAluno,
        numeroComercialPedagogicoAluno: dados.numeroComercialPedagogicoAluno,
        numeroCelularPedagogicoAluno: dados.numeroCelularPedagogicoAluno,
        rgPedagogicoAluno: dados.rgPedagogicoAluno,
        cpfPedgogicoAluno: dados.cpfPedgogicoAluno
    }

    
    
    document.getElementById('mostraNomeAluno').innerText = dados.nomeAluno
    document.getElementById('mostraCpfAluno').innerText = dados.cpfAluno
    document.getElementById('mostraRgAluno').innerText = dados.rgAluno
    document.getElementById('mostraCelularAluno').innerText = dados.celularAluno
    document.getElementById('mostraTelefoneAluno').innerText = dados.telefoneAluno
    document.getElementById('timestampDoAluno').innerText = 'Aluno cadastrado em: ' + new Date(dados.timestamp._seconds * 1000)
    document.getElementById('mostraDataNascimentoAluno').innerText = dados.dataNascimentoAluno

    let nascimento = dados.dataNascimentoAluno.split('-')
    let nascimentoObj = new Date()
    nascimentoObj.setDate(Number(nascimento[2]))
    nascimentoObj.setFullYear(Number(nascimento[0]))
    nascimentoObj.setMonth(Number(nascimento[1]) - 1)
    calcularIdadePrecisa(nascimentoObj).then(function(idade){
        document.getElementById('mostraIdadeAluno').innerText = `${idade.years} anos, ${idade.months} mês(es), e ${idade.days} dias`
    }).catch(function(error){
        AstNotif.dialog('Erro', error.message)
        console.log(error)
    })
    document.getElementById('mostraHoraEDiasAluno').innerText = dados.horaEDiasAluno
    document.getElementById('mostraTurmaAluno').innerHTML = dados.turmaAluno
    document.getElementById('mostraEmailAluno').innerText = dados.emailAluno
    document.getElementById('mostraMatriculaAluno').innerText = dados.matriculaAluno
    document.getElementById('mostraEnderecoAluno').innerText = `${dados.enderecoAluno}, ${dados.numeroAluno}, ${dados.bairroAluno}, ${dados.cidadeAluno}, ${dados.estadoAluno}. CEP ${dados.cepAluno}.`
    document.getElementById('rolaTelaAbaixoAlunos').focus()
    document.getElementById('rolaTelaAbaixoAlunos').style.display = 'none'
    turmasRef.child(`${dados.turmaAluno}/alunos/${matricula}/notas`).once('value').then(snapshot => {
        let notas = snapshot.val()
        if (desativado != false) {
            notas = notasDesativado
        }
        console.log(notas)
        document.getElementById('pontosAudicao').innerText = notas.audicao
        document.getElementById('pontosFala').innerText = notas.fala
        document.getElementById('pontosEscrita').innerText = notas.escrita
        document.getElementById('pontosLeitura').innerText = notas.leitura
        document.getElementById('barraPontosAudicao').style.width = notas.audicao * 20 + '%'
        document.getElementById('barraPontosFala').style.width = notas.fala * 20 + '%'
        document.getElementById('barraPontosEscrita').style.width = notas.escrita * 20 + '%'
        document.getElementById('barraPontosLeitura').style.width = notas.leitura * 20 + '%'
    }).catch(error => {
        AstNotif.dialog('Erro', error.message)
        console.log(error)
    })
}

function followUpAluno(matricula) {
    
    if (matricula == '00000' || matricula == '') {
        AstNotif.dialog('Atenção', 'Você deve clicar em um aluno para descrever um follow up.')
        loader.style.display = 'none'
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
                loader.style.display = 'block'
                loaderMsg.innerText = 'Carregando dados do FollowUp...'
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
                    loader.style.display = 'none'
                }).catch(error =>{
                    AstNotif.dialog('Erro', error.message)
                    console.log(error)
                    loader.style.display = 'none'
                })
            })
        })
        
    }
}

function carregaFollowUps(matricula='') {
    loader.style.display = 'block'
    loaderMsg.innerText = 'Carregando Follow Up...'
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
        loader.style.display = 'none'
    }).catch((error) => {
        console.log(error)
        AstNotif.dialog('Erro', error.message)
        loader.style.display = 'none'
    })
}

function verFollowUp(id) {
    loader.style.display = 'block'
    loaderMsg.innerText = 'Carregando FollowUp...'
    followUpRef.child(id).once('value').then(snapshot => {
        AstNotif.dialog(snapshot.val().titulo, snapshot.val().descricao + ' <br><br> <b>Autor do FollowUp:</b> ' + snapshot.val().autor, {positive: "OK",negative: ''})

        loader.style.display = 'none'
    }).catch(error => {
        AstNotif.dialog('Erro', error.message)
        console.log(error)
        loader.style.display = 'none'
    })
    
}

function carregaHistoricoAluno(matricula) {
    let listaHistoricoAluno = document.getElementById('listaHistoricoAluno')
    listaHistoricoAluno.innerHTML = ''
    try {
        const historico = alunos[matricula].historico
        for (const key in historico) {
            if (Object.hasOwnProperty.call(historico, key)) {
                const infos = historico[key];
                if (infos.operacao == 'Transferência de alunos') {
                    listaHistoricoAluno.innerHTML += `<button class="list-group-item list-group-item-action" onclick="verOperacaoAluno('${matricula}', '${key}')"><b>Operação:</b> ${infos.operacao}: ${infos.dados.turmaAtual} --> ${infos.dados.turmaParaQualFoiTransferido}</button>`
                } else if(infos.operacao == 'Desativação de aluno') {
                    listaHistoricoAluno.innerHTML += `<button class="list-group-item list-group-item-action" onclick="verOperacaoAluno('${matricula}', '${key}')"><b>Operação:</b> ${infos.operacao}: ${infos.dados.turmaAtual} --> Desativado</button>`
                } else if (infos.operacao == 'Reativação de aluno') {
                    listaHistoricoAluno.innerHTML += `<button class="list-group-item list-group-item-action" onclick="verOperacaoAluno('${matricula}', '${key}')"><b>Operação:</b> ${infos.operacao}: Aluno reativado na turma ${infos.dados.turmaAtivacao}</button>`
                }
            }
        }
    } catch (error) {
        const historico = alunosDesativados[matricula].dadosAluno.historico
        for (const key in historico) {
            if (Object.hasOwnProperty.call(historico, key)) {
                const infos = historico[key];
                if (infos.operacao == 'Transferência de alunos') {
                    listaHistoricoAluno.innerHTML += `<button class="list-group-item list-group-item-action" onclick="verOperacaoAluno('${matricula}', '${key}')"><b>Operação:</b> ${infos.operacao}: ${infos.dados.turmaAtual} --> ${infos.dados.turmaParaQualFoiTransferido}</button>`
                } else if(infos.operacao == 'Desativação de aluno') {
                    listaHistoricoAluno.innerHTML += `<button class="list-group-item list-group-item-action" onclick="verOperacaoAluno('${matricula}', '${key}')"><b>Operação:</b> ${infos.operacao}: ${infos.dados.turma} --> Desativado</button>`
                } else if (infos.operacao == 'Reativação de aluno') {
                    listaHistoricoAluno.innerHTML += `<button class="list-group-item list-group-item-action" onclick="verOperacaoAluno('${matricula}', '${key}')"><b>Operação:</b> ${infos.operacao}: Aluno reativado na turma ${infos.dados.turmaAtivacao}</button>`
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