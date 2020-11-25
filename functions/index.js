const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
   functions.logger.info("Hello logs!", {structuredData: true});
   response.send("Hello from Firebase!");
});


exports.verificadorDeAcesso = functions.https.onRequest((request, response) => {
    let dados = JSON.parse(request.body)
    return admin.database().ref(`sistemaEscolar/usuarios/${dados.email}/admin`).once('value')
    .then(snapshot => {
        if (snapshot.exists() && snapshot.val() == dados.uid) {
            var data = JSON.stringify(snapshot.val())
            console.log('oi')
            response.status(200).send(snapshot.val())
        } else {
            response.status(403).send('Deu ruim')
        }
    })
})