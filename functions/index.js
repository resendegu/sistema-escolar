const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

<<<<<<< HEAD

exports.verificadorDeAcesso = functions.https.onCall((data, context) => {
    const dados = data
    console.log(context.auth)
    let email = context.auth.token.email
    email = email.replaceAll('@', '-').replaceAll('.', '_')
    admin.database().ref(`sistemaEscolar/usuarios/${email}/admin`).once('value').then(value => {
        if (value.exists() && value.val() == context.auth.uid) {
            console.log(value.val())
            let val = value.val()
            return 'oi'
        } else {
            throw new functions.https.HttpsError('permission-denied', 'Você não possui permissão para acessar.')
        }
    })
    
})
=======
>>>>>>> parent of a26276d... alterações backend fracassos
