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
        console.log(error)
        throw new functions.https.HttpsError('permission-denied', 'Você não tem permissão para acesso. Você deve contatar um Administrador Master do sistema para liberação de acessos.', error)
        
    }
    
})

exports.liberaERemoveAcessos = functions.https.onCall((data, context) => {
    if (context.auth.token.master == true) {
        return admin.database().ref(`sistemaEscolar/listaDeUsuarios/${data.uid}/acessos/${data.acesso}`).set(data.checked).then(() => {
                return admin.database().ref(`sistemaEscolar/listaDeUsuarios/${data.uid}/acessos/`).once('value').then((snapshot) => {
                    return admin.auth().setCustomUserClaims(data.uid, snapshot.val())
                    .then(() => {
                        if (data.checked) {
                            console.log(admin.firestore.Timestamp.now().toDate())
                            if (data.acesso == 'professores') {
                                return admin.auth().getUser(data.uid).then(user => {
                                    return admin.database().ref(`sistemaEscolar/listaDeProfessores/${data.uid}/`)
                                    .set({nome: user.displayName, email: user.email, timestamp: admin.firestore.Timestamp.now()}).then(() => {
                                        return {acesso: 'Acesso concedido'}
                                    }).catch(error => {
                                        throw new functions.https.HttpsError('unknown', error.message, error)
                                    })
                                }) 
                            } else {
                                return {acesso: 'Acesso concedido!'}
                            }
                            
                        } else {
                            if (data.acesso == 'professores') {
                                return admin.database().ref(`sistemaEscolar/listaDeProfessores/${data.uid}/`)
                                .remove().then(() => {
                                    return {acesso: 'Acesso removido'}
                                }).catch(error => {
                                    throw new functions.https.HttpsError('unknown', error.message, error)
                                })
                            } else {
                                return {acesso: 'Acesso removido!'}
                            }
                            
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
            console.log('ok deleted')
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
        email: user.email,
        timestamp: admin.firestore.Timestamp.now()
    }).then(() => {

    }).catch(error =>{
        throw new functions.https.HttpsError('unknown', error.message)
    })

    listaDeUsers.child(user.uid).set({
        acessos: {
            master: false,
            adm: false,
            secretaria: false,
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
                secretaria: false,
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
                secretria: false,
                professores: false
            }
        }
        admin.auth().setCustomUserClaims(user.uid, acessosObj).then(() => {

        }).catch(error => {
            throw new functions.https.HttpsError('unknown', error.message)
        })
    })
})

exports.cadastraTurma = functions.https.onCall((data, context) => {
    console.log(data)
})

exports.cadastraAniversarios = functions.database.ref('sistemaEscolar/usuarios/{uid}/dataNascimento').onWrite((snapshot, context) => {
    console.log('aqui', snapshot.after.val())
    var data = snapshot.after.val()
    admin.auth().getUserByEmail(data.email).then((user) => {
        admin.database().ref('sistemaEscolar/aniversarios/' + (data.mes - 1)).push({
            nome: user.displayName,
            email: user.email,
            dataNascimento: {dia: data.dia, mes: data.mes, ano: data.ano}
        }).then(() => {
            return {message: 'Aniversario cadastrado'}
        }).catch(error => {
            throw new functions.https.HttpsError('unknown', error.message, error)
        })
    }).catch(error => {
        throw new functions.https.HttpsError('unknown', error.message, error)
    })
})