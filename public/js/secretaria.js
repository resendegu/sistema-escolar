var secretariaRef = firebase.database().ref('sistemaEscolar/secretaria')
var numerosRef = firebase.database().ref('sistemaEscolar/numeros')
var aniversariosRef = firebase.database().ref('sistemaEscolar/aniversarios')
var listaDeUsuariosRef = firebase.database().ref('sistemaEscolar/listaDeUsuarios')
var listaDeProfessores = firebase.database().ref('sistemaEscolar/listaDeProfessores')
var turmasRef = firebase.database().ref('sistemaEscolar/turmas')
var ultimaMatriculaRef = firebase.database().ref('sistemaEscolar/ultimaMatricula')
var loader = document.getElementById('loader')

firebase.auth().onAuthStateChanged((user) => {
    if (user == null) {
        loader.style.display = 'none'
        AstNotif.dialog('Login não identificado', 'Você não está logado, vá para a tela de <a href="../login.html">login</a> para logar ou se cadastrar.')
    } else {
        loader.style.display = 'block'
        try {
            if (user.photoURL != null) {
                document.getElementById('profilePic').src = user.photoURL
            } 
        } catch (error) {
            console.log(error)
        }
        var alunosCadastradosNum = document.getElementById('alunosCadastradosNum')
        var alunosMatriculadosNum = document.getElementById('alunosMatriculadosNum')
        var alunosDesativadosNum = document.getElementById('alunosDesativadosNum')
        var turmasCadastradasNum = document.getElementById('turmasCadastradasNum')
        numerosRef.on('value', (snapshot) => {
            var numeros = snapshot.val()
            var tabelaSemanal = numeros.tabelaSemanal
            
            alunosCadastradosNum.innerText = numeros.alunosCadastrados != undefined ? numeros.alunosCadastrados : 0
            alunosMatriculadosNum.innerText = numeros.alunosMatriculados != undefined ? numeros.alunosMatriculados : 0
            alunosDesativadosNum.innerText = numeros.alunosDesativados != undefined ? numeros.alunosDesativados : 0
            turmasCadastradasNum.innerText = numeros.turmasCadastradas != undefined ? numeros.turmasCadastradas : 0

            // Alimenta tabela com os números de alunos em cada semana
            var idCelulaTabela = ''
            var totalManha = document.getElementById('totalManha').innerText = 0
            var totalTarde = document.getElementById('totalTarde').innerText = 0
            var totalNoite = document.getElementById('totalNoite').innerText = 0
            for (const dia in tabelaSemanal) {
                if (tabelaSemanal.hasOwnProperty(dia)) {
                    const horarios = tabelaSemanal[dia];
                    idCelulaTabela += dia
                    for (const horario in horarios) {
                        if (horarios.hasOwnProperty(horario)) {
                            const numeroDeAlunos = horarios[horario]
                            idCelulaTabela += horario
                            document.getElementById(idCelulaTabela).innerText = numeroDeAlunos
                            var numNaTabela = Number(document.getElementById('total' + horario).innerText)
                            numNaTabela += numeroDeAlunos
                            document.getElementById('total' + horario).innerText = numNaTabela
                            idCelulaTabela = dia
                        }
                    }
                    idCelulaTabela = ''
                }
            }
            loader.style.display = 'none'
        })

        aniversariosRef.on('value', (snapshot) => {
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

// Funções para cadastro de turmas
var nivelTurma = ''
var faixaEtaria = ''
var livros = {1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false}
var diaDaSemana = {SUN: false, MON: false, TUE: false, WED: false, THU: false, FRI: false, SAT: false}
var horarioCurso = ''
var codPadrao = ''
function nivel(niv) {
    console.log(niv)
    livros = {1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false}
    nivelTurma = niv
    if (niv == 'B') {
        document.getElementById('livroA5').disabled = true
        document.getElementById('livroA6').disabled = true
        document.getElementById('livroA7').disabled = true
        document.getElementById('livroA8').disabled = true
        document.getElementById('livroA5').checked = false
        document.getElementById('livroA6').checked = false
        document.getElementById('livroA7').checked = false
        document.getElementById('livroA8').checked = false
    }
    if (niv == 'I') {
        document.getElementById('livroA5').disabled = false
        document.getElementById('livroA6').disabled = false
        document.getElementById('livroA7').disabled = true
        document.getElementById('livroA8').disabled = true
        document.getElementById('livroA7').checked = false
        document.getElementById('livroA8').checked = false
    }
    if (niv == 'A') {
        document.getElementById('livroA5').disabled = false
        document.getElementById('livroA6').disabled = false
        document.getElementById('livroA7').disabled = false
        document.getElementById('livroA8').disabled = false
    }
    junta()
}

function faixa(faix) {
    nivelTurma = ''
    faixaEtaria = ''
    livros = {1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false}
    codPadrao = ''

    console.log(faix)
    faixaEtaria = faix
    /**
    let botoesFaixas = ['A', 'T', 'KIDS']
    for (const i in botoesFaixas) {
        const id = botoesFaixas[i]
        document.getElementById(id).style.display = 'none'
    }
    document.getElementById(faix).style.display = 'block'
     */
    
    junta()
    
}

function livro(numLivro, checked) {
    console.log(numLivro, checked)
    if (checked) {
        livros[numLivro] = true
    } else {
        livros[numLivro] = false
    }
    junta()
}

function diaSemana(dia, checked) {
    console.log(dia)
    switch (dia) {
        case '0':
            diaDaSemana.SUN = checked
            break;
        case '1':
            diaDaSemana.MON = checked
            break;
        case '2':
            diaDaSemana.TUE = checked
            break;
        case '3':
            diaDaSemana.WED = checked
            break;
        case '4':
            diaDaSemana.THU = checked
            break;
        case '5':
            diaDaSemana.FRI = checked
            break;
        case '6':
            diaDaSemana.SAT = checked
            break;
        default:
            diaDaSemana = '?'
            break;
    }
    junta()
}

function horario(hora) {
    console.log(hora)
    horarioCurso = hora
    junta()
}
var diasDaSemana = []
var books = []
function junta() {
    codPadrao = nivelTurma + faixaEtaria
    books = []
    for (const livro in livros) {
        if (livros.hasOwnProperty(livro)) {
            const checked = livros[livro];
            if (checked) {
                codPadrao = codPadrao + livro
                books.push(livro)
            }
        }
    }
    codPadrao += '-'
    diasDaSemana = []
    for (const key in diaDaSemana) {
        if (Object.hasOwnProperty.call(diaDaSemana, key)) {
            const check = diaDaSemana[key];
            if (check) {
                codPadrao += key
                diasDaSemana.push(key)
            }
        }
    }
    codPadrao += horarioCurso
    document.getElementById('codigoNivel').innerText = codPadrao
    console.log(codPadrao.length)
    if (codPadrao.length >= 9) {
        document.getElementById('btnCadastrarTurma').disabled = false
    } else {
        document.getElementById('btnCadastrarTurma').disabled = true
    }
}
var professorReferencia

function carregaProfessores() {
    loader.style.display = 'block'
    console.log('carregando')
    var professorTurmaSelect = document.getElementById('professorTurma')
    listaDeProfessores.once('value').then(snapshot => {
        let professores = snapshot.val()
        professorTurmaSelect.innerHTML = '<option selected hidden>Escolha o(a) professor(a)...</option>'
        for (const uid in professores) {
            if (Object.hasOwnProperty.call(professores, uid)) {
                const professor = professores[uid];
                professorTurmaSelect.innerHTML += `<option value="${uid}">${professor.nome} (${professor.email})</option>`
            }
        }
        loader.style.display = 'none'
    }).catch(error => {
        loader.style.display = 'none'
        console.error(error)
        AstNotif.dialog('Erro', error.message)
    })
}
function professorReferencia(uid) {
    console.log(uid)
    professor = uid
}

// Função de cadastro de turma no banco de dados
function cadastrarTurma(confima=false) {
    loader.style.display = 'block'
    //AstNotif.dialog('Aguarde', "<img src='../images/carregamento.gif' width=100px>")
    var cadastraTurma = firebase.functions().httpsCallable('cadastraTurma')
    cadastraTurma({codigoSala: codPadrao, professor: professor, diasDaSemana: diasDaSemana, livros: books, nivelTurma: nivelTurma, faixaTurma: faixaEtaria, hora: horarioCurso})
    .then(function(result) {
        console.log(result)
        AstNotif.dialog('Sucesso', result.data.answer)
        loader.style.display = 'none'
    }).catch(function(error) {
        AstNotif.dialog('Erro', error.message)
        console.log(error)
        loader.style.display = 'none'
    })
}

// Funções da aba de turmas da secretaria
function carregaTurmas() {
    loader.style.display = 'block'
    var selectTurmas = document.getElementById('selectTurmas')
    turmasRef.once('value').then(snapshot => {
        selectTurmas.innerHTML = '<option selected hidden>Escolha uma turma...</option>'
        var turmas = snapshot.val()
        for (const cod in turmas) {
            if (Object.hasOwnProperty.call(turmas, cod)) {
                const infoDaTurma = turmas[cod];
                if (infoDaTurma.professor == undefined) {
                    var profReferencia = 'Não cadastrado'
                } else {
                    var profReferencia = infoDaTurma.professor[0].nome
                }
                selectTurmas.innerHTML += `<option value="${cod}">Turma ${cod} (Prof. ${profReferencia})</option>`
            }
        }
        document.getElementById('selectTurmas').style.visibility = 'visible'
        loader.style.display = 'none'
    }).catch(error => {
        loader.style.display = 'none'
        console.error(error)
        AstNotif.dialog('Erro', error.message)
    })
}

function abreTurma(cod) {
    loader.style.display = 'block'
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

        document.getElementById('mostraProfessoresCadastrados').innerHTML = `<button class="btn btn-primary" onclick="modalAddProfTurma('${cod}')"><span data-feather="user-plus"></span> Adicionar professores</button><ul class="items" id="ulProfCadastrados"></ul>`
        for (const key in dadosDaTurma.professor) {
            if (Object.hasOwnProperty.call(dadosDaTurma.professor, key)) {
                const professor = dadosDaTurma.professor[key];
                document.getElementById('ulProfCadastrados').innerHTML += `
                    <li class="item-dismissible">${professor.nome} (${professor.email})<span class="close" data-toggle="tooltip" data-placement="top" title="Retirar prof. desta turma?" onclick="retiraProf('${professor.email}', '${professor.nome}', '${dadosDaTurma.codigoSala}')">&times;</span></li>
                `
            }
        }
        loader.style.display = 'none'
    })
}

function retiraProf(email, nome, codSala, confirma=false) {
    if (confirma) {
        loader.style.display = 'block'
        document.getElementById('ast-dialog-bg').remove()
        turmasRef.child(codSala).child('professor').once('value', (snapshot) => {
            let listaProf = snapshot.val()
            console.log(listaProf)
            for (const key in listaProf) {
                if (Object.hasOwnProperty.call(listaProf, key)) {
                    const professor = listaProf[key];
                    if (professor.email == email) {
                        listaProf.splice(key, 1)
                        console.log(listaProf)
                    }
                }
            }
            turmasRef.child(codSala).child('professor').set(listaProf).then(() => {
                loader.style.display = 'none'
                AstNotif.notify('Sucesso', 'Professor deletado com sucesso')
            })

        })
    } else {
        AstNotif.dialog('Confirmação', `Você está prestes à retirar o acesso desta turma de ${nome} (${email}). Você confirma esta ação?<br><br> <button type="button" class="btn btn-danger" onclick="retiraProf('${email}', '${nome}', '${codSala}', true)">Sim, confirmo</button>`, {positive: 'Voltar', negative: ''})
    }
}

function modalAddProfTurma(codSala) {
    loader.style.display = 'block'
    AstNotif.dialog('Adicionar professores nesta turma', `
    Por favor, tenha o cuidado de escolher um(a) professor(a) que ainda não está vinculado na turma atual.
    <div class="input-group prepend">
        <div class="input-group-prepend">
        <label class="input-group-text" for="inputGroupSelect01">Prof.</label>
        </div>
        <select class="custom-select" id="selectAddProfessorTurma" onchange="novoProf(this.value, '${codSala}')">
        <option selected hidden>Escolha o(a) professor(a)...</option>
        
        </select>
    </div>
    `, {positive: 'Voltar', negative: ''})
    listaDeProfessores.once('value', (snapshot) => {
        let listaProf = snapshot.val()
        console.log(listaProf)
        for (const key in listaProf) {
            if (Object.hasOwnProperty.call(listaProf, key)) {
                const professor = listaProf[key];
                document.getElementById('selectAddProfessorTurma').innerHTML += `<option value="${professor.email}">${professor.nome} (${professor.email})</option>`
            }
        }
        loader.style.display = 'none'
    })
    
}

function novoProf(email, codSala) {
    loader.style.display = 'block'
    document.getElementById('ast-dialog-bg').remove()
    var addNovoProfTurma = firebase.functions().httpsCallable('addNovoProfTurma')
    addNovoProfTurma({emailProf: email, codSala: codSala})
    .then(function(result) {
        console.log(result)
        AstNotif.dialog('Sucesso', result.data.answer)
        loader.style.display = 'none'
    }).catch(function(error) {
        AstNotif.dialog('Erro', error.message)
        console.log(error)
        loader.style.display = 'none'
    })
}

function preencheEndereco(numCep) {
    loader.style.display = 'block'
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

// Funções do cadastro de alunos
let turmasLocal = {}
function carregaProfsETurmas() {
    turmasLocal = {}
    loader.style.display = 'block'
    let turmaAluno = document.getElementById('turmaAluno')
    let matriculaAluno = document.getElementById('matriculaAluno')
    
    turmasRef.once('value').then(snapshot => {
        turmaAluno.innerHTML = '<option selected hidden>Escolha uma turma...</option>'
        let turmas = snapshot.val()
        turmasLocal = snapshot.val()
        for (const cod in turmas) {
            if (Object.hasOwnProperty.call(turmas, cod)) {
                const infoDaTurma = turmas[cod];
                
                turmaAluno.innerHTML += `<option value="${cod}">${cod}</option>`
            }
        }
        loader.style.display = 'none'
    }).catch(error => {
        loader.style.display = 'none'
        console.error(error)
        AstNotif.dialog('Erro', error.message)
    })
    ultimaMatriculaRef.once('value').then(snapshot => {
        matriculaAluno.value = snapshot.val() + 1
        arrumaNumMatricula()
    }).catch(error => {
        loader.style.display = 'none'
        console.log(error)
        AstNotif.dialog('Erro', error.message)
    })

}

function mostraProfsAlunoESetaTurma(codTurma) {
    if (codTurma != 'Escolha uma turma...') {
    let profAluno = document.getElementById('profAluno')
    let horaEDiasAluno = document.getElementById('horaEDiasAluno')
    profAluno.disabled = false
    profAluno.innerHTML = '<option selected hidden>Escolha um prof.</option>'
    document.getElementById('faixa' + turmasLocal[codTurma].faixaTurma).checked = true
    horaEDiasAluno.value = turmasLocal[codTurma].hora + 'h'
    for (const index in turmasLocal[codTurma].diasDaSemana) {
        if (Object.hasOwnProperty.call(turmasLocal[codTurma].diasDaSemana, index)) {
            const dia = turmasLocal[codTurma].diasDaSemana[index];
            horaEDiasAluno.value += ',' + dia
        }
    }

    for (const index in turmasLocal[codTurma].professor) {
        if (Object.hasOwnProperty.call(turmasLocal[codTurma].professor, index)) {
            const professor = turmasLocal[codTurma].professor[index];
            profAluno.innerHTML += `<option value="${professor.email}">${professor.nome} (${professor.email})</option>`
        }
    }
    if (turmasLocal[codTurma].professor == undefined) {
        profAluno.innerHTML += `<option selected>Não há professores cadastrados na turma</option>`
        profAluno.disabled = true
    }
    }
    
}

function setaRespFinan(num) { 
    let nomeResponsavelFinanceiroAluno = document.getElementById('nomeResponsavelFinanceiroAluno')
    let relacaoFinanceiroAluno = document.getElementById('relacaoFinanceiroAluno')
    let numeroComercialFinanceiroAluno = document.getElementById('numeroComercialFinanceiroAluno')
    let numeroCelularFinanceiroAluno = document.getElementById('numeroCelularFinanceiroAluno')
    nomeResponsavelFinanceiroAluno.value = document.getElementById('nomeResponsavelAluno' + num).value
    relacaoFinanceiroAluno.value = document.getElementById('relacaoAluno' + num).value
    numeroComercialFinanceiroAluno.value = document.getElementById('numeroComercialAluno' + num).value
    numeroCelularFinanceiroAluno.value = document.getElementById('numeroCelularAluno' + num).value

    document.getElementById('nomeResponsavelAluno' + num).focus()
}

document.getElementById('matriculaAluno').addEventListener('change', arrumaNumMatricula)
function arrumaNumMatricula() {
    var input = document.getElementById('matriculaAluno');
    
    input.value="00000"+input.value.replace(/\D/g,'');
    input.value=input.value.slice(-5,-1)+input.value.slice(-1);
}

function verificaCPF(strCPF) {
    let cpfAluno = document.getElementById('cpfAluno')
    var Soma;
    var Resto;
    Soma = 0;
  if (strCPF == "00000000000") {
    AstNotif.dialog('CPF inválido.', 'Digite e Verifique as informações de CPF novamente.')
    cpfAluno.value = ''
  } 

  for (i=1; i<=9; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (11 - i);
  Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11))  Resto = 0;
    if (Resto != parseInt(strCPF.substring(9, 10)) ) {
        AstNotif.dialog('CPF inválido.', 'Digite e Verifique as informações de CPF novamente.')
        cpfAluno.value = ''
    } 

  Soma = 0;
    for (i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (12 - i);
    Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11))  Resto = 0;
    if (Resto != parseInt(strCPF.substring(10, 11) ) ) {
        AstNotif.dialog('CPF inválido.', 'Digite e Verifique as informações de CPF novamente.')
        cpfAluno.value = ''
    } 
    return true;
}

// JS PDF
function criaPDFAluno() {
    const doc = new jsPDF();

    doc.text("Hello, world!", 10, 10);
    doc.save("a4.pdf");
}

// Esperando o submit para o cadastro efetivo
document.querySelector('#formCadastroAluno').addEventListener('submit', (e) => {
    e.preventDefault()
    loader.style.display = 'block'
    const dados = new FormData(e.target);
    var dadosAluno = {}
    // Dados pessoais
    dadosAluno.matriculaAluno = dados.get('matriculaAluno')
    dadosAluno.nomeAluno = dados.get('nomeAluno')
    dadosAluno.dataNascimentoAluno = dados.get('dataNascimentoAluno')
    dadosAluno.telefoneAluno = dados.get('telefoneAluno')
    dadosAluno.celularAluno = dados.get('celularAluno')
    dadosAluno.emailAluno = dados.get('emailAluno')
    dadosAluno.rgAluno = dados.get('rgAluno')
    dadosAluno.cpfAluno = dados.get('cpfAluno')
    // Dados para o curso
    dadosAluno.turmaAluno = dados.get('turmaAluno')
    dadosAluno.profAluno = dados.get('profAluno')
    dadosAluno.horaEDiasAluno = dados.get('horaEDiasAluno')
    dadosAluno.faixaEtaria = dados.get('faixaEtaria')
    // Dados de endereço
    dadosAluno.cepAluno = dados.get('cepAluno')
    dadosAluno.enderecoAluno = dados.get('enderecoAluno')
    dadosAluno.numeroAluno = dados.get('numeroAluno')
    dadosAluno.bairroAluno = dados.get('bairroAluno')
    dadosAluno.cidadeAluno = dados.get('cidadeAluno')
    dadosAluno.estadoAluno = dados.get('estadoAluno')
    // Dados de Filiação Responsavel 1
    dadosAluno.nomeResponsavelAluno1 = dados.get('nomeResponsavelAluno1')
    dadosAluno.relacaoAluno1 = dados.get('relacaoAluno1')
    dadosAluno.numeroComercialResponsavel1 = dados.get('numeroComercialResponsavel1')
    dadosAluno.numeroCelularResponsavel1 = dados.get('numeroCelularResponsavel1')
    dadosAluno.rgResponsavel1 = dados.get('rgResponsavel1')
    dadosAluno.cpfResponsavel1 = dados.get('cpfResponsavel1')
    // Dados de Filiação responsável 2
    dadosAluno.nomeResponsavelAluno2 = dados.get('nomeResponsavelAluno2')
    dadosAluno.relacaoAluno2 = dados.get('relacaoAluno2')
    dadosAluno.numeroComercialResponsavel2 = dados.get('numeroComercialResponsavel2')
    dadosAluno.numeroCelularResponsavel2 = dados.get('numeroCelularResponsavel2')
    dadosAluno.rgResponsavel2 = dados.get('rgResponsavel2')
    dadosAluno.cpfResponsavel2 = dados.get('cpfResponsavel2')
    // Dados de Filiação Responsável financeiro
    dadosAluno.nomeResponsavelFinanceiroAluno = dados.get('nomeResponsavelFinanceiroAluno')
    dadosAluno.relacaoFinanceiroAluno = dados.get('relacaoFinanceiroAluno')
    dadosAluno.numeroComercialFinanceiroAluno = dados.get('numeroComercialFinanceiroAluno')
    dadosAluno.numeroCelularFinanceiroAluno = dados.get('numeroCelularFinanceiroAluno')
    dadosAluno.rgFinanceiroAluno = dados.get('rgFinanceiroAluno')
    dadosAluno.cpfFinanceiroAluno = dados.get('cpfFinanceiroAluno')
    // Dados de Filiação responsável pedagógico/didático
    dadosAluno.nomeResponsavelPedagogicoAluno = dados.get('nomeResponsavelPedagogicoAluno')
    dadosAluno.relacaoPedagogicoAluno = dados.get('relacaoPedagogicoAluno')
    dadosAluno.numeroComercialPedagogicoAluno = dados.get('numeroComercialPedagogicoAluno')
    dadosAluno.numeroCelularPedagogicoAluno = dados.get('numeroCelularPedagogicoAluno')
    dadosAluno.rgPedagogicoAluno = dados.get('rgPedagogicoAluno')
    dadosAluno.cpfPedgogicoAluno = dados.get('cpfPedgogicoAluno')
    // Gera ou não o PDF do aluno
    dadosAluno.geraPDFAluno = dados.get('geraPDFAluno')
    console.log(dadosAluno)
    let cadastraAluno = firebase.functions().httpsCallable('cadastraAluno')
    cadastraAluno({dados: dadosAluno}).then(function(result) {
        loader.style.display = 'none'
        AstNotif.dialog('Sucesso', result.data.answer)
    }).catch(function(error) {
        AstNotif.dialog('Erro', error.message)
        console.log(error)
        loader.style.display = 'none'
    })
})