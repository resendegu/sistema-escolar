const functions = require('firebase-functions');
const admin = require('firebase-admin')
admin.initializeApp()

exports.verificadorDeAcesso = functions.https.onCall((data, context) => {
    try {
        if (context.auth.token.master == true) {
            return true
        } else if (context.auth.token[data.acesso] == true) {
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
    if (context.auth.token.master == true) {
        return admin.database().ref(`sistemaEscolar/listaDeUsuarios/${data.uid}/acessos/${data.acesso}`).set(data.checked).then(() => {
                return admin.database().ref(`sistemaEscolar/listaDeUsuarios/${data.uid}/acessos/`).once('value').then((snapshot) => {
                    return admin.auth().setCustomUserClaims(data.uid, snapshot.val())
                    .then(() => {
                        if (data.checked) {
                            return {acesso: 'Acesso concedido!'}
                        } else {
                            return {acesso: 'Acesso removido!'}
                        }
                    })
                })    
        }).catch(error => {
            console.log(error)
            throw new functions.https.HttpsError('unknown', error.message)
        })
    } else {
        throw new functions.https.HttpsError('permission-denied', 'Você não têm permissão para realizar esta ação.')
    }
    
    
})

exports.apagaContas = functions.https.onCall((data, context) => {
    if (context.auth.token.master == true) {
        return admin.auth().deleteUser(data.uid).then(function() {
            return {answer: 'Usuário deletado com sucesso.'}
        }).catch(function(error) {
            throw new functions.https.HttpsError('unknown', error.message)
        })
    } else {
        throw new functions.https.HttpsError('permission-denied', 'Você não tem permissão para executar essa ação')
    }
})

exports.deletaUsersAutomatico = functions.auth.user().onDelete((user) => {
    console.log(user)
    admin.database().ref(`sistemaEscolar/listaDeUsuarios/${user.uid}`).remove().then(() => {
        admin.database().ref(`sistemaEscolar/usuarios/${user.uid}`).remove().then(() => {
            return {ok: 'user deleted'}
        }).catch(error => {
            throw new functions.https.HttpsError('unknown', error.message)
        })
    }).catch(error => {
        throw new functions.https.HttpsError('unknown', error.message)
    })
})

exports.cadastroUser = functions.auth.user().onCreate((user) => { 
    var dadosNoBanco = admin.database().ref(`sistemaEscolar/usuarios/${user.uid}/`)
    var listaDeUsers = admin.database().ref(`sistemaEscolar/listaDeUsuarios`)
    var usuariosMaster = admin.database().ref('sistemaEscolar/usuariosMaster')

    dadosNoBanco.set({
        nome: user.displayName,
        email: user.email
    }).then(() => {

    }).catch(error =>{
        throw new functions.https.HttpsError('unknown', error.message)
    })

    listaDeUsers.child(user.uid).set({
        acessos: {
            master: false,
            adm: false,
            financeiro: false,
            professores: false
        },
        email: user.email
    }).then(() => {

    }).catch(error => {
        throw new functions.https.HttpsError('unknown', error.message)
    })
    
    usuariosMaster.once('value', (snapshot) => {
        var acessosObj = {
            acessos: {
                master: false,
                adm: false,
                financeiro: false,
                professores: false
            }
        }
        var lista = snapshot.val()
        if (lista.indexOf(user.email) != -1) {
            listaDeUsers.child(user.uid + '/acessos/master').set(true).then(() => {

            }).catch(error => {
                throw new functions.https.HttpsError('unknown', error.message)
            })
            acessosObj = {
                master: true,
                adm: false,
                financeiro: false,
                professores: false
            }
        }
        admin.auth().setCustomUserClaims(user.uid, acessosObj).then(() => {

        }).catch(error => {
            throw new functions.https.HttpsError('unknown', error.message)
        })
    })
})