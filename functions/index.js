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


exports.verificadorDeAcesso = functions.https.onCall((data, context) => {
    try {
        if (context.auth.token.acessos.master == true) {
            return true
        } else if (context.auth.token.acessos[data.acesso] == true) {
            return true
        } else {
            throw new functions.https.HttpsError('permission-denied', 'Acesso não liberado.')
        }
    } catch (error) {
        throw new functions.https.HttpsError('permission-denied', 'Você não tem permissão para acesso. Você deve contatar um Administrador Master do sistema para liberação de acessos.')
    }
    
    console.log(context)
    

    let dados = data
    return admin.database().ref(`sistemaEscolar/usuarios/${dados.email}/admin`).once('value')
    .then(snapshot => {
        if (snapshot.exists() && snapshot.val() == dados.uid /**&& dados.provider == 'google.com'**/) {
            return {uid: snapshot.val()}
        } else {
            
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
                            throw new functions.https.HttpsError('permission-denied', 'Você não possui permissão de admin master')
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

exports.liberaERemoveAcessos = functions.https.onCall((data, context) => {
    console.log(context)
    return admin.database().ref(`sistemaEscolar/usuarios/${data.email}/acessos/${data.acesso}`).set(data.checked)
    .then(() => {
        if (data.checked) {
            return {acesso: 'Acesso concedido!'}
        } else {
            return {acesso: 'Acesso removido!'}
        }
    }).catch(error => {
        console.log(error)
        throw new functions.https.HttpsError('unknown', 'Erro')
        
    })
    
})

exports.apagaContas = functions.https.onCall((data, context) => {

})