
firebase.auth().onAuthStateChanged((user) => {
    validaAcesso(user)
})

function validaAcesso(user) {
    //var dados = {email: user.email.replaceAll('@', '-').replaceAll('.', '_'), uid: user.uid}
    const checkInfos = firebase.functions().httpsCallable('verificadorDeAcesso')
    checkInfos({email: user.email.replaceAll('@', '-').replaceAll('.', '_'), uid: user.uid}).then(result => {
        console.log(result.data)
    }).catch(error => {
        console.log(error)
    })
}
    