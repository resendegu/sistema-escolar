var secretariaRef = firebase.database().ref('sistemaEscolar/secretaria')
var numerosRef = firebase.database().ref('sistemaEscolar/numeros')
var aniversariosRef = firebase.database().ref('sistemaEscolar/aniversarios')


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
        
        alunosCadastradosNum.innerText = numeros.alunosCadastrados
        alunosMatriculadosNum.innerText = numeros.alunosMatriculados
        alunosDesativadosNum.innerText = numeros.alunosDesativados
        turmasCadastradasNum.innerText = numeros.turmasCadastradas

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
                        const numeroDeAlunos = horarios[horario];
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
                document.getElementById('listaAniversarios').innerHTML += `<button class="list-group-item list-group-item-action">${aniversario.nome} no dia ${aniversario.dia}</button>`
            }
        }
        
        for (const mes in meses) {
            if (meses.hasOwnProperty(mes)) {
                const listaAniversarios = meses[mes];
                
            }
        }
    })
})

// Funções para cadastro de turmas
var nivelTurma = ''
var faixaEtaria = ''
var livros = {1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false}
var diaDaSemana = ''
var horarioCurso = ''
var codPadrao = ''
function nivel(niv) {
    console.log(niv)
    nivelTurma = niv
    let botoesNiveis = ['B', 'I', 'A', 'KIDS']
    for (const i in botoesNiveis) {
        const id = botoesNiveis[i]
        document.getElementById(id).style.display = 'none'
    }
    document.getElementById(niv).style.display = 'block'
    junta()
}

function faixa(faix) {
    console.log(faix)
    faixaEtaria = faix
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

function diaSemana(dia) {
    console.log(dia)
    switch (dia) {
        case '0':
            diaDaSemana = 'SUN'
            break;
        case '1':
            diaDaSemana = 'MON'
            break;
        case '2':
            diaDaSemana = 'TUE'
            break;
        case '3':
            diaDaSemana = 'WED'
            break;
        case '4':
            diaDaSemana = 'THU'
            break;
        case '5':
            diaDaSemana = 'FRI'
            break;
        case '6':
            diaDaSemana = 'SAT'
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

function junta() {
    codPadrao = nivelTurma + faixaEtaria
    for (const livro in livros) {
        if (livros.hasOwnProperty(livro)) {
            const checked = livros[livro];
            if (checked) {
                codPadrao = codPadrao + livro
            }
        }
    }
    codPadrao = codPadrao + '-' + diaDaSemana + horarioCurso
    document.getElementById('codigoNivel').innerText = codPadrao
    console.log(codPadrao.length)
    if (codPadrao.length >= 9) {
        document.getElementById('btnCadastrarTurma').disabled = false
    } else {
        document.getElementById('btnCadastrarTurma').disabled = true
    }
}
var professor
function professorReferencia(email) {
    console.log(email)
    professor = email
}

// Função de cadastro de turma no banco de dados
function cadastrarTurma(confima=false) {
    var cadastraTurma = firebase.functions().httpsCallable('cadastraTurma')
    cadastraTurma({codigoSala: codPadrao, professor: professor})
}