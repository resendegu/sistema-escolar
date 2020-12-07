var secretariaRef = firebase.database().ref('sistemaEscolar/secretaria')


firebase.auth().onAuthStateChanged((user) => {
    var alunosCadastradosNum = document.getElementById('alunosCadastradosNum')
    var alunosMatriculadosNum = document.getElementById('alunosMatriculadosNum')
    var alunosDesativadosNum = document.getElementById('alunosDesativadosNum')
    secretariaRef.on('value', (snapshot) => {
        console.log(snapshot.val())
        var secretaria = snapshot.val()
        alunosCadastradosNum.innerText = secretaria.numeros.alunosCadastrados
        alunosMatriculadosNum.innerText = secretaria.numeros.alunosMatriculados
        alunosDesativadosNum.innerText = secretaria.numeros.alunosDesativados
    })
})
        