var teste
firebase.auth().onAuthStateChanged((user) => {
    var dados = {email: user.email.replaceAll('@', '-').replaceAll('.', '_'), uid: user.uid}
    fetch('http://localhost:5000/verificadorDeAcesso', {
        body: JSON.stringify(dados),
        method: 'POST',
        mode: 'no-cors'
    }).then(response => {
       console.log(response)
    }).catch(error => {
        console.log(error)
    })
    if (user != null) {
        // Carrega painel do usuário
        console.log('oi')
    } else  {
        console.log('oi')
    }
})
    