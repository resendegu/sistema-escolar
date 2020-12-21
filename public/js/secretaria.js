var secretariaRef = firebase.database().ref('sistemaEscolar/secretaria')
var numerosRef = firebase.database().ref('sistemaEscolar/numeros')
var aniversariosRef = firebase.database().ref('sistemaEscolar/aniversarios')
var listaDeUsuariosRef = firebase.database().ref('sistemaEscolar/listaDeUsuarios')
var listaDeProfessores = firebase.database().ref('sistemaEscolar/listaDeProfessores')
var turmasRef = firebase.database().ref('sistemaEscolar/turmas')

firebase.auth().onAuthStateChanged((user) => {
    try {
        document.getElementById('profilePic').src = user.photoURL
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
    })

    aniversariosRef.on('value', (snapshot) => {
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
    })
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
    console.log('carregando')
    var professorTurmaSelect = document.getElementById('professorTurma')
    listaDeProfessores.on('value', (snapshot) => {
        let professores = snapshot.val()
        professorTurmaSelect.innerHTML = '<option selected hidden>Escolha o(a) professor(a)...</option>'
        for (const uid in professores) {
            if (Object.hasOwnProperty.call(professores, uid)) {
                const professor = professores[uid];
                professorTurmaSelect.innerHTML += `<option value="${uid}">${professor.nome} (${professor.email})</option>`
            }
        }
    })
}
function professorReferencia(uid) {
    console.log(uid)
    professor = uid
}

// Função de cadastro de turma no banco de dados
function cadastrarTurma(confima=false) {
    var cadastraTurma = firebase.functions().httpsCallable('cadastraTurma')
    cadastraTurma({codigoSala: codPadrao, professor: professor, diasDaSemana: diasDaSemana, livros: books, nivelTurma: nivelTurma, faixaTurma: faixaEtaria, hora: horarioCurso})
    .then(function(result) {
        console.log(result)
        AstNotif.dialog('Sucesso', result.data.answer)
    }).catch(function(error) {
        AstNotif.dialog('Erro', error.message)
        console.log(error)
    })
}

// Funções da aba de turmas da secretaria
function carregaTurmas() {
    var selectTurmas = document.getElementById('selectTurmas')
    turmasRef.once('value', (snapshot) => {
        selectTurmas.innerHTML = '<option selected hidden>Escolha uma turma...</option>'
        var turmas = snapshot.val()
        for (const cod in turmas) {
            if (Object.hasOwnProperty.call(turmas, cod)) {
                const infoDaTurma = turmas[cod];
                selectTurmas.innerHTML += `<option value="${cod}">Turma ${cod} (Prof. ${infoDaTurma.professor[0].nome})</option>`
            }
        }
    })
}

function abreTurma(cod) {
    turmasRef.child(cod).once('value', (snapshot) => {
        // TODO: Mostrar na tela as informações da turma
        console.log(snapshot.val())
    })
}