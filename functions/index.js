const functions = require('firebase-functions');
const admin = require('firebase-admin')
admin.initializeApp()

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.verificadorDeAcesso = functions.https.onRequest((request, response) => {
    let dados = JSON.parse(request.body)
    return admin.database().ref(`sistemaEscolar/usuarios/${dados.email}/admin`).once('value')
    .then(snapshot => {
        if (snapshot.exists() && snapshot.val() == dados.uid /**&& dados.provider == 'google.com'**/) {
            response.status(200).send(snapshot.val())
        } else {
            response.status(403).send()
            var dadosNoBanco = admin.database().ref(`sistemaEscolar/usuarios/${dados.email}/`)
            var listaDeUsers = admin.database().ref(`sistemaEscolar/listaDeUsuarios`)
            dadosNoBanco.once('value')
            .then(dadosUser => {
                console.log(dadosUser.val().acessos)
                if (dadosUser.val().acessos == undefined) {
                    dadosNoBanco.child('acessos').set({
                        adm: false,
                        financeiro: false,
                        professores: false
                    }).then(() => {
                        listaDeUsers.push({email: dados.email, emailNormal: dados.emailNormal}).then(() => {

                        }).catch(error => {
                            console.log(error)
                        })
                    }).catch(error => {
                        console.log(error)
                    })
                }
            })
        }
    })
})

