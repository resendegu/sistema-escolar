
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
    