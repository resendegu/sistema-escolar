<<<<<<< HEAD
firebase.auth().signInWithEmailAndPassword('guresende13@gmail.com', 'galo1234')
firebase.auth().onAuthStateChanged((user) => {
    validaAcesso(user)
})

function validaAcesso(user) {
    //var dados = {email: user.email.replaceAll('@', '-').replaceAll('.', '_'), uid: user.uid}
    const checkInfos = firebase.functions().httpsCallable('verificadorDeAcesso')
    
}
const checkInfos = firebase.functions().httpsCallable('verificadorDeAcesso')
checkInfos().then(result => {
    console.log(result)
}).catch(error => {
    console.log(error)
})
    
=======
document.addEventListener('DOMContentLoaded', function () {
    let user = usuarioAtual()
    if (user != null) {
        // Carrega painel do usuário
    } else if () {
        
    }
})
>>>>>>> parent of a26276d... alterações backend fracassos
