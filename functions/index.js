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


exports.verificadorDeAcesso = functions.https.onCall((data, context) => {
    const dados = data
    admin.database().ref(`sistemaEscolar/usuarios/${dados.email}/admin`).once('value').then(value => {
        if (value.exists() && value.val() == dados.uid) {
            console.log(value.val())
            let val = value.val()
            return val
        } else {
            throw new functions.https.HttpsError('permission-denied', 'Você não possui permissão para acessar.')
        }
    })
    
})