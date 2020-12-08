var secretariaRef = firebase.database().ref('sistemaEscolar/secretaria')
var numerosRef = firebase.database().ref('sistemaEscolar/numeros')

function abreDashboard() {
    
}

firebase.auth().onAuthStateChanged((user) => {
    try {
        document.getElementById('profilePic').src = user.photoURL
    } catch (error) {
        console.log(error)
    }
    var alunosCadastradosNum = document.getElementById('alunosCadastradosNum')
    var alunosMatriculadosNum = document.getElementById('alunosMatriculadosNum')
    var alunosDesativadosNum = document.getElementById('alunosDesativadosNum')
    numerosRef.on('value', (snapshot) => {
        var numeros = snapshot.val()
        var tabelaSemanal = numeros.tabelaSemanal
        
        alunosCadastradosNum.innerText = numeros.alunosCadastrados
        alunosMatriculadosNum.innerText = numeros.alunosMatriculados
        alunosDesativadosNum.innerText = numeros.alunosDesativados

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
})
        