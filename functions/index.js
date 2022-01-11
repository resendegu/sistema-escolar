const functions = require('firebase-functions');
const admin = require('firebase-admin');
const path = require('path');
const { auth } = require('firebase-admin');
const { HttpsError } = require('firebase-functions/lib/providers/https');
const { firebaseConfig } = require('firebase-functions');
const { https } = require('firebase-functions');
const { info } = require('firebase-functions/lib/logger');
const { Merchant } = require('steplix-emv-qrcps');
const { Constants } = Merchant;
const QRCode = require('qrcode')
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
                        return admin.database().ref(`sistemaEscolar/registroGeral`).push({operacao: 'Concessão e remoção de acessos aos usuários', timestamp: admin.firestore.Timestamp.now(), userCreator: context.auth.uid, dados: data}).then(() => {
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
                        }).catch(error => {
                            throw new functions.https.HttpsError('unknown', error.message, error)
                        })

                        
                        
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
            return admin.database().ref(`sistemaEscolar/registroGeral`).push({operacao: 'Conta deletada', timestamp: admin.firestore.Timestamp.now(), userCreator: context.auth.uid, dados: data}).then(() => {
                return {answer: 'Usuário deletado com sucesso.'}
            }).catch(error => {
                throw new functions.https.HttpsError('unknown', error.message, error)
            })
            
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

exports.criaContaAluno = functions.database.ref('sistemaEscolar/alunos/{registro}').onWrite((snapshot, context) => {
    var aluno = snapshot.after.val()
    admin.auth().createUser({
        uid: aluno.matriculaAluno,
        email: aluno.emailAluno,
        emailVerified: false,
        password: aluno.senhaAluno,
        displayName: aluno.nomeAluno,
        phoneNumber: "+55" + aluno.celularAluno
    }).then(() => {

    }).catch(error => {
        throw new functions.https.HttpsError('unknown', error.message, error)
    })
})

exports.modificaSenhaContaAluno = functions.database.ref('sistemaEscolar/alunos/{matricula}/senhaAluno').onUpdate((snapshot, context) => {
    async function start() {
        let senhaAluno = snapshot.after.val();
        let matricula = context.params.matricula;
        let firestoreRef = admin.firestore().collection('mail');
        let dadosAluno = await admin.database().ref('sistemaEscolar/alunos/' + matricula).once('value');
        let nomeEscola = await admin.database().ref('sistemaEscolar/infoEscola/dadosBasicos/nomeEscola').once('value');
        let user = await admin.auth().getUserByEmail(dadosAluno.val().emailAluno)
        let emailContent = {
            to: dadosAluno.val().emailAluno,
            message: {
                subject: `${nomeEscola.val()}: Senha alterada no portal do Aluno`,
                text: `Sua nova senha para login no portal do aluno é ${senhaAluno}. Em caso de dificuldades entre em contato com sua escola para maiores informações. Sistemas ProjetoX.`,
                html: `<h3>Olá ${dadosAluno.val().nomeAluno.split(' ')[0]}!</h3><p>O sistema detectou uma mudança na sua senha do portal do aluno e sua nova senha para login no portal do aluno é <b>${senhaAluno}</b>.</p><p>Em caso de dificuldades <b>entre em contato com sua escola para maiores informações</b>.</p><p>Sistemas ProjetoX.</p>`
            }
        }

        admin.auth().updateUser(user.uid, {password: senhaAluno}).then((newUser) => {
            firestoreRef.add(emailContent).then(() => {
                console.log('Queued email for delivery to ' + dadosAluno.val().emailAluno)
            }).catch(error => {
                console.error(error)
                throw new Error(error.message)
            })
        }).catch(error => {
            console.error(error)
            throw new Error(error.message)
        })
    }

    start(() => {
        return 'Function ended';
    }).catch(error => {
        throw new Error(error.message)
    })
      
})

exports.cadastroUser = functions.auth.user().onCreate((user) => {
    console.log(user.displayName) 
    var dadosNoBanco = admin.database().ref(`sistemaEscolar/usuarios/${user.uid}/`)
    var listaDeUsers = admin.database().ref(`sistemaEscolar/listaDeUsuarios`)
    var usuariosMaster = admin.database().ref('sistemaEscolar/usuariosMaster')
    let firestoreRef = admin.firestore().collection('mail');

    admin.auth().generateEmailVerificationLink(user.email).then(value => {
        functions.logger.log(value)
        let emailContent = {
            to: user.email,
            message: {
                subject: `Verificação de segurança do Sistema Escolar`,
                text: `Clique no link para verificar seu e-mail no sistema escolar`,
                html: `
                    <p>Olá, ${user.displayName || 'usuário'}</p>
                    <p>Clique neste link para verificar seu endereço de e-mail.</p>
                    <p><a href="${value}">${value}</a></p>
                    <p>Se você não solicitou a verificação deste endereço, ignore este e-mail.</p>
                    <p>Obrigado,</p>
                    <p>Equipe do GrupoProX</p>
                `
            }
        }
        firestoreRef.add(emailContent).then(() => {
            console.log('Queued email for delivery to ' + user.email)
        }).catch(error => {
            console.error(error)
        })
    }).catch(error => {
        functions.logger.log(error)
    })

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
            professores: false,
            aluno: false
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
                professores: false,
                aluno: false
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
                professores: false,
                aluno: false
            }
        } else if (user.uid.length == 5){
            listaDeUsers.child(user.uid + '/acessos/aluno').set(true).then(() => {

            }).catch(error => {
                throw new functions.https.HttpsError('unknown', error.message)
            })
            acessosObj = {
                master: false,
                adm: false,
                secretria: false,
                professores: false,
                aluno: true,
            }
        }
        admin.auth().setCustomUserClaims(user.uid, acessosObj).then(() => {

        }).catch(error => {
            throw new functions.https.HttpsError('unknown', error.message)
        })
    })
})

exports.cadastraTurma = functions.https.onCall(async (data, context) => {
    /**{codigoSala: codPadrao, professor: professor, diasDaSemana: diasDaSemana, livros: books, hora: horarioCurso} */
    console.log(data)
    if (context.auth.token.master == true || context.auth.token.secretaria == true) {
        var dados = data
        if (dados.hasOwnProperty('codTurmaAtual')) {
            let turma = dados.codTurmaAtual
            return admin.database().ref(`sistemaEscolar/turmas/${turma}/professor/0`).once('value').then(snapshot => {
                if (snapshot.val()) {
                    throw new HttpsError('cancelled', 'Operação cancelada! Desconecte todos os professores desta turma antes de editar a turma', )
                }
                return admin.database().ref(`sistemaEscolar/turmas/${turma}`).once('value').then(async (turmaFire) => {
                    let dadosTurmaAtual = turmaFire.val()
                    

                    async function atualizaAlunos() {
                        Object.keys(dadosTurmaAtual.alunos).map(async (matricula) => {
                            await admin.database().ref('sistemaEscolar/alunos/' + matricula + '/turmaAluno').set(dados.codigoSala)
                        })
                        return ;
                    }

                    if (Object.keys(dadosTurmaAtual.alunos).length > 0) {
                        await atualizaAlunos();
                    }

                    // Essa parte se repete com as funções de baixo
                    return admin.database().ref(`sistemaEscolar/turmas/${turma}`).remove().then(() => {
                        return admin.database().ref(`sistemaEscolar/registroGeral`).push({operacao: 'Edição das informações de turma do sistema', timestamp: admin.firestore.Timestamp.now(), userCreator: context.auth.uid, dados: {codTurma: turma}}).then(() => {
                            var horario
                    let hora = dados.hora.indexOf('_') == -1 ? dados.hora : dados.hora.split('_')[0]
                    if (hora >= 12 && hora <= 17) {
                        horario = 'Tarde'
                    } else if (hora >= 18 && hora <= 23) {
                        horario = 'Noite'
                    } else if (hora >= 5 && hora <= 11) {
                        horario = 'Manha'
                    } else {
                        throw new functions.https.HttpsError('invalid-argument', 'Você deve passar um horário válido')
                    }
                    return admin.auth().getUserByEmail(data.professor).then(function(user) {
                        dados.professor = [{nome: user.displayName, email: user.email}]
                        dados.timestamp = admin.firestore.Timestamp.now()
                        dados.id = dados.codigoSala
                        return admin.database().ref(`sistemaEscolar/usuarios/${user.uid}/professor/turmas/${data.codigoSala}`).set(true).then(() => {
                            return admin.database().ref(`sistemaEscolar/turmas/${data.codigoSala}/`).once('value').then(snapshot =>{
                                if (snapshot.exists() == false) {
                                    Object.assign(dadosTurmaAtual, dados)
                                    return admin.database().ref(`sistemaEscolar/turmas/${data.codigoSala}/`).set(dadosTurmaAtual).then(() => {
                                        admin.database().ref(`sistemaEscolar/numeros/turmasCadastradas`).transaction(function (current_value) {
                                            return (current_value || 0) + 1
                                        }).catch(function (error) {
                                            throw new functions.https.HttpsError('unknown', error.message, error)
                                        })
                                        return admin.database().ref(`sistemaEscolar/registroGeral`).push({operacao: 'Cadastro de Turma', timestamp: admin.firestore.Timestamp.now(), userCreator: context.auth.uid, dados: dados}).then(() => {
                                            return {answer: 'A turma e todos os seus registros foram alterados com sucesso.'}
                                        }).catch(error => {
                                            throw new functions.https.HttpsError('unknown', error.message, error)
                                        })
                                        
                                        }).catch(error => {
                                            throw new functions.https.HttpsError(error.code, error.message, error)
                                        })
                                } else {
                                    throw new functions.https.HttpsError('already-exists', 'Uma turma com o mesmo código já foi criada.')
                                }
                                
                            })
                        }).catch(error => {
                            throw new functions.https.HttpsError('unknown', error.message, error)
                        })
                        
                            
                    }).catch(function(error) {
                        throw new functions.https.HttpsError('unknown', error.message, error)
                    })
                            
                        }).catch(error => {
                            throw new functions.https.HttpsError('unknown', error.message, error)
                        })
        
                        
                    }).catch(error => {
                        throw new functions.https.HttpsError('unknown', error.message, error)
                    })
                    
                    
                }).catch(error => {
                    throw new functions.https.HttpsError('unknown', error.message, error)
                })
                
                
            }).catch(error => {
                throw new functions.https.HttpsError('unknown', error.message, error)
            })




        } else {
            data.id = data.codigoSala
            var horario
            let hora = dados.hora.indexOf('_') == -1 ? dados.hora : dados.hora.split('_')[0]
            if (hora >= 12 && hora <= 17) {
                horario = 'Tarde'
            } else if (hora >= 18 && hora <= 23) {
                horario = 'Noite'
            } else if (hora >= 5 && hora <= 11) {
                horario = 'Manha'
            } else {
                throw new functions.https.HttpsError('invalid-argument', 'Você deve passar um horário válido')
            }
            return admin.auth().getUserByEmail(data.professor).then(function(user) {
                dados.professor = [{nome: user.displayName, email: user.email}]
                dados.timestamp = admin.firestore.Timestamp.now()
                return admin.database().ref(`sistemaEscolar/usuarios/${user.uid}/professor/turmas/${data.codigoSala}`).set(true).then(() => {
                    return admin.database().ref(`sistemaEscolar/turmas/${data.codigoSala}/`).once('value').then(snapshot =>{
                        if (snapshot.exists() == false) {
                            return admin.database().ref(`sistemaEscolar/turmas/${data.codigoSala}/`).set(dados).then(() => {
                                admin.database().ref(`sistemaEscolar/numeros/turmasCadastradas`).transaction(function (current_value) {
                                    return (current_value || 0) + 1
                                }).catch(function (error) {
                                    throw new functions.https.HttpsError('unknown', error.message, error)
                                })
                                return admin.database().ref(`sistemaEscolar/registroGeral`).push({operacao: 'Cadastro de Turma', timestamp: admin.firestore.Timestamp.now(), userCreator: context.auth.uid, dados: dados}).then(() => {
                                    return {answer: 'Turma cadastrada com sucesso.'}
                                }).catch(error => {
                                    throw new functions.https.HttpsError('unknown', error.message, error)
                                })
                                
                                }).catch(error => {
                                    throw new functions.https.HttpsError(error.code, error.message, error)
                                })
                        } else {
                            throw new functions.https.HttpsError('already-exists', 'Uma turma com o mesmo código já foi criada.')
                        }
                        
                    })
                }).catch(error => {
                    throw new functions.https.HttpsError('unknown', error.message, error)
                })
                
                    
            }).catch(function(error) {
                throw new functions.https.HttpsError('unknown', error.message, error)
            })
        }
        
        
    } else {
        throw new functions.https.HttpsError('permission-denied', 'Você não possui permissão para fazer alterações nesta área.')
    }
})

exports.cadastraAniversarios = functions.database.ref('sistemaEscolar/usuarios/{uid}/dataNascimento').onWrite((snapshot, context) => {
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

exports.addNovoProfTurma = functions.https.onCall((data, context) => {
    if (context.auth.token.master == true || context.auth.token.secretaria == true) {
        return admin.auth().getUserByEmail(data.emailProf).then(function(user) {
            return admin.database().ref(`sistemaEscolar/usuarios/${user.uid}/professor/turmas/${data.codSala}`).set(true).then(() => {
                return admin.database().ref('sistemaEscolar/turmas').child(data.codSala).child('professor').once('value').then(snapshot => {
                    var listaProf = snapshot.val()
                    if (listaProf == null) {
                        var listaProf = []
                    }
                    listaProf.push({email: data.emailProf, nome: user.displayName})
                    return admin.database().ref('sistemaEscolar/turmas').child(data.codSala).child('professor').set(listaProf).then(() => {
                        return admin.database().ref(`sistemaEscolar/registroGeral`).push({operacao: 'Professor conectado em uma turma', timestamp: admin.firestore.Timestamp.now(), userCreator: context.auth.uid, dados: data}).then(() => {
                            return {answer: 'Professor adicionado com sucesso'}
                        }).catch(error => {
                            throw new functions.https.HttpsError('unknown', error.message, error)
                        })
                        
                    }).catch(error => {
                        throw new functions.https.HttpsError('unknown', error.message, error)
                    })
               }).catch(error => {
                   throw new functions.https.HttpsError('unknown', error.message, error)
               })
            }).catch(error => {
                throw new functions.https.HttpsError('unknown', error.message, error)
            }) 
        }).catch(function(error){
            throw new functions.https.HttpsError('unknown', error.message, error)
        })
    } else {
        throw new functions.https.HttpsError('permission-denied', 'Você não possui permissão para fazer alterações nesta área.')
    }

})

exports.desconectaProf = functions.database.ref('sistemaEscolar/turmas/{codTurma}/professor/{iProf}').onDelete((snapshot, context) => {
    // context.params = { codTurma: 'KIDS-SAT08', iProf: '1' }
    // context.timestamp = context.timestamp
    
    var turma = context.params.codTurma
    var professor = snapshot.val().email
    return admin.auth().getUserByEmail(professor).then(user => {
        return admin.database().ref(`sistemaEscolar/usuarios/${user.uid}/professor/turmas/${turma}`).remove().then(() => {
            return {answer: 'Professor desconectado!'}
        }).catch(error => {
            throw new HttpsError('unknown', error)
        })
    }).catch(error => {
        throw new HttpsError('not-found', error.message, error)
    })

    
}) 

exports.cadastraAluno = functions.https.onCall(async (data, context) => {
    function formataNumMatricula(num) {
        let numero = num
        numero = "00000" + numero.replace(/\D/g, '');
        numero = numero.slice(-5,-1) + numero.slice(-1);
        return numero
    }
    if (context.auth.token.master == true || context.auth.token.secretaria == true) {
        let dadosAluno = data.dados
        if (dadosAluno.tipoMatricula == 'preMatricula') {
            delete dadosAluno.tipoMatricula
            
            let firestoreRef = admin.firestore().collection('mail');
            let infoEscola = await admin.database().ref('sistemaEscolar/infoEscola/dadosBasicos').once('value')
            let dadosEscola = infoEscola.val()
            const responsavelPedagogico = {email: null}
            try {
                responsavelPedagogico = dadosAluno.responsaveis.find(responsavel => responsavel.pedagogico == true) || dadosAluno.responsaveis[0]
            } catch (error) {
                console.log(error)
            }
            
            

            dadosAluno.timestamp = admin.firestore.Timestamp.now()
            dadosAluno.userCreator = context.auth.uid

            return admin.database().ref('/sistemaEscolar/preMatriculas').push(dadosAluno).then(() => {
                
                return {answer: 'Aluno cadastrado em pré-matrícula com sucesso! Um e-mail será enviado para o aluno e seu responsável pedagógico, informando-os sobre este cadastro.'}
            }).catch(error => {
                throw new functions.https.HttpsError('unknown', error.message, error)
            })

        } else {
            let preMatriculaKey = data.preMatricula
            delete dadosAluno.tipoMatricula
            let contratoConfigurado = data.contratoConfigurado
            let planoOriginal = data.planoOriginal
            let codContrato = !data.codContrato ? admin.database().ref('/').push().key : data.codContrato;
            let contratos = [codContrato]
            let ultimaMatricula = (await admin.database().ref('sistemaEscolar/ultimaMatricula').once('value')).val()
            dadosAluno.matriculaAluno = !dadosAluno.matriculaAluno ? formataNumMatricula(String(Number(ultimaMatricula) + 1)) : dadosAluno.matriculaAluno
            let firestoreRef = admin.firestore().collection('mail');
            let infoEscola = await admin.database().ref('sistemaEscolar/infoEscola/dadosBasicos').once('value')
            let dadosEscola = infoEscola.val()
            let emailContent = {
                to: dadosAluno.emailAluno,
                cc: dadosAluno.emailResponsavelPedagogico || null,
                message: {
                    subject: `${dadosEscola.nomeEscola}`,
                    text: `Olá ${dadosAluno.nomeAluno.split(' ')[0]}, você foi corretamente cadastrado(a) em nosso sistema e está pronto(a) para iniciar essa jornada conosco. Sistemas ProjetoX.`,
                    html: `<h3>Olá ${dadosAluno.nomeAluno.split(' ')[0]}!</h3><p>Você está matriculado(a) no nº de matrícula <b>${dadosAluno.matriculaAluno}</b>, e está pronto(a) para iniciar os estudos conosco. Use seu e-mail e senha cadastrados para acessar o sistema. Só lembrando, sua senha é: <b>${dadosAluno.senhaAluno}</b>. Fique atento aos e-mails, pois sua escola pode utilizar este canal para comunicação com você.</p><p>Em caso de dificuldades <b>entre em contato com a escola para maiores informações</b>.</p><p><b>Dados de contato da escola:</b><br>Telefone: ${dadosEscola.telefoneEscola}<br>E-mail: ${dadosEscola.emailEscola}<br>Endereço: ${dadosEscola.enderecoEscola}</p><p>Sistemas GrupoProX.</p>`
                }
            }
            dadosAluno.userCreator = context.auth.uid
            dadosAluno.contratos = contratos
            dadosAluno.timestamp = admin.firestore.Timestamp.now()
            return admin.database().ref('sistemaEscolar/alunos').child(dadosAluno.matriculaAluno).once('value').then(alunoRecord => {
                if (alunoRecord.exists()) {
                    throw new functions.https.HttpsError('already-exists', 'Este número de matrícula já consta no sistema. Por favor, clique no botão azul no início deste formulário para atualizar o número de matrícula, para gerar um novo número de matrícula.')
                }
                    return admin.database().ref('sistemaEscolar/alunos/' + dadosAluno.matriculaAluno).set(dadosAluno).then(() => {
                        return admin.database().ref('sistemaEscolar/infoEscola/contratos/' + codContrato).set({contratoConfigurado: contratoConfigurado, situacao: 'Vigente', planoOriginal: planoOriginal, matricula: dadosAluno.matriculaAluno, timestamp: admin.firestore.Timestamp.now(), codContrato: codContrato}).then(() => {
                            return admin.database().ref('sistemaEscolar/turmas').child(dadosAluno.turmaAluno + '/alunos').child(dadosAluno.matriculaAluno).set({nome: dadosAluno.nomeAluno, prof: (dadosAluno.emailProfAluno || dadosAluno.profAluno.email)}).then(() => {
                                return admin.database().ref('sistemaEscolar/ultimaMatricula').set(dadosAluno.matriculaAluno).then(() => {
                                    if (preMatriculaKey) {
                                        admin.database().ref('sistemaEscolar/preMatriculas').child(preMatriculaKey).remove().then(() => {

                                        }).catch((error) => {
                                            functions.logger.log(error)
                                        })
                                    }
                                    
                                    
                                    admin.database().ref('sistemaEscolar/numeros/alunosMatriculados').transaction(function (current_value) {
                                        let numAtual = Number(current_value)
                                        if (current_value == null) {
                                            return 1
                                        } else {
                                            return numAtual++
                                        }
                                    }, function(error, comitted, snapshot){
                                        if (error) {
                                            throw new functions.https.HttpsError(error.code, error.message, error)
                                        } else if(!comitted) {
                                            throw new functions.https.HttpsError('already-exists', 'Já existe. Isso pode ser um erro. Tente novamente.')
                                        }
                                        
                                    })

                                    return firestoreRef.add(emailContent).then(() => {
                                        console.log('Queued email for delivery to ' + dadosAluno.emailAluno)
                                        return {answer: 'Aluno cadastrado na matrícula '+ dadosAluno.matriculaAluno + ' com sucesso! Os e-mails foram disparados.', codContrato: codContrato}
                                        
                                    }).catch(error => {
                                        console.error(error)
                                        throw new Error(error.message)
                                    })
                                
                                }).catch(error => {
                                    throw new functions.https.HttpsError('unknown', error.message, error)
                                })
                            }).catch(error => {
                                throw new functions.https.HttpsError('unknown', error.message, error)
                            })
                        }).catch(error => {
                            throw new functions.https.HttpsError('unknown', error.message, error)
                        })
                        
                        }).catch(error => {
                            throw new functions.https.HttpsError('unknown', error.message, error)
                        })
                }).catch(error => {
                    throw new functions.https.HttpsError('unknown', error.message, error)
                })
            }
            
        } else {
            throw new functions.https.HttpsError('permission-denied', 'Você não possui permissão para fazer alterações nesta área.')
        }
    })

    exports.timestamp = functions.https.onCall((data, context) => {
        if (context.auth.token.master == true || context.auth.token.secretaria == true ||  context.auth.token.professores == true || context.auth.token.adm == true || context.auth.token.aluno == true) {
            return {timestamp: admin.firestore.Timestamp.now()}
        } else {
            throw new functions.https.HttpsError('permission-denied', 'Você não tem permissão.')
        }
    })

    exports.transfereAlunos = functions.https.onCall((data, context) => {
        function formataNumMatricula(num) {
            let numero = num
            numero = "00000" + numero.replace(/\D/g, '');
            numero = numero.slice(-5,-1) + numero.slice(-1);
            return numero
        }
        if (context.auth.token.master == true || context.auth.token.secretaria == true) {
            let dados = data
            let turmaAtual = dados.turmaAtual
            let turmaParaTransferir = dados.turmaParaTransferir
            let alunosSelecionados = dados.alunos
            let alunos = {} //Aqui onde será guardado os alunos e os dados dos mesmos, da turma para serem transferidos para outra turma
            var timestamp = admin.firestore.Timestamp.now()
            
            return admin.database().ref(`sistemaEscolar/turmas/${turmaAtual}/alunos/`).once('value').then(snapshot => {
                let alunosTurma = snapshot.val()
                for (const i in alunosSelecionados) {
                    if (Object.hasOwnProperty.call(alunosSelecionados, i)) {
                        const matricula = alunosSelecionados[i];
                        alunos[formataNumMatricula(matricula)] = alunosTurma[formataNumMatricula(matricula)]
                    }
                }
                console.log(alunos)
                
                return admin.database().ref(`sistemaEscolar/turmas/${turmaParaTransferir}/alunos/`).update(alunos).then(() => {
                    async function removeAlunos() {
                        for (const matricula in alunos) {
                            if (Object.hasOwnProperty.call(alunos, matricula)) {
                                const dadosAluno = alunos[matricula];
                                await admin.database().ref(`sistemaEscolar/turmas/${turmaAtual}/historico`).push({dados: {matricula: matricula, dadosAluno: dadosAluno, turmaAtual: turmaAtual, turmaParaQualFoiTransferido: turmaParaTransferir}, timestamp: timestamp, operacao: 'Transferência de alunos'}).then(() => {
                                    admin.database().ref(`sistemaEscolar/turmas/${turmaAtual}/alunos/${matricula}`).remove().then(() => {
                                        admin.database().ref(`sistemaEscolar/turmas/${turmaParaTransferir}/professor/0`).once('value').then(novoProfessor => {
                                            admin.database().ref(`sistemaEscolar/turmas/${turmaParaTransferir}/alunos/${matricula}/prof/`).set(novoProfessor.val()).then(() =>{
                                                admin.database().ref(`sistemaEscolar/alunos/${matricula}/profAluno/`).set(novoProfessor.val()).then(() =>{
                                                    admin.database().ref(`sistemaEscolar/alunos/${matricula}/turmaAluno/`).set(turmaParaTransferir).then(() =>{
                                                        admin.database().ref(`sistemaEscolar/alunos/${matricula}/historico/`).push({dados: {matricula: matricula, dadosAluno: dadosAluno, turmaAtual: turmaAtual, turmaParaQualFoiTransferido: turmaParaTransferir}, timestamp: timestamp, operacao: 'Transferência de alunos', userCreator: context.auth.uid}).then(() =>{

                                                        }).catch(error => {
                                                            throw new functions.https.HttpsError('unknown', error.message, error)
                                                        })
                                                    }).catch(error => {
                                                        throw new functions.https.HttpsError('unknown', error.message, error)
                                                    })
                                                }).catch(error => {
                                                    throw new functions.https.HttpsError('unknown', error.message, error)
                                                })
                                            }).catch(error => {
                                                throw new functions.https.HttpsError('unknown', error.message, error)
                                            })
                                        }).catch(error => {
                                            throw new functions.https.HttpsError('unknown', error.message, error)
                                        })
                                    }).catch(error => {
                                        throw new functions.https.HttpsError('unknown', error.message, error)
                                    })
                                }).catch(error => {
                                    throw new functions.https.HttpsError('unknown', error.message, error)
                                })
                                
                            }
                        }
                    }
                    return removeAlunos().then(() => {
                        return {answer: 'Os alunos foram transferidos para a outra turma com sucesso.'}
                    }).catch(error => {
                        
                        throw new functions.https.HttpsError('unknown', error.message, error)
                    })
                    
                }).catch(error => {
                    throw new functions.https.HttpsError('unknown', error.message, error)
                })
            }).catch(error => {
                throw new functions.https.HttpsError('unknown', error.message, error)
            })

        
    } else {
        throw new functions.https.HttpsError('permission-denied', 'Você não tem permissão.')
    }
})

exports.excluiTurma = functions.https.onCall((data, context) => {
    if (context.auth.token.master == true || context.auth.token.secretaria == true) {
        let turma = data.codTurma
        return admin.database().ref(`sistemaEscolar/turmas/${turma}/professor/0`).once('value').then(snapshot => {
            if (snapshot.val()) {
                throw new HttpsError('cancelled', 'Operação cancelada! Desconecte todos os professores desta turma antes de excluir a turma', )
            }
            return admin.database().ref(`sistemaEscolar/turmas/${turma}`).remove().then(() => {
                return admin.database().ref(`sistemaEscolar/registroGeral`).push({operacao: 'Exclusão de turma do sistema', timestamp: admin.firestore.Timestamp.now(), userCreator: context.auth.uid, dados: {codTurma: turma}}).then(() => {
                    return {answer: 'A turma e todos os seus registros foram excluídos com sucesso.'}
                }).catch(error => {
                    throw new functions.https.HttpsError('unknown', error.message, error)
                })

                
            }).catch(error => {
                throw new functions.https.HttpsError('unknown', error.message, error)
            })
            
        }).catch(error => {
            throw new functions.https.HttpsError('unknown', error.message, error)
        })
        
    } else {
        throw new functions.https.HttpsError('permission-denied', 'Você não possui permissão para fazer alterações nesta área.')
    }
})

exports.ativaDesativaAlunos = functions.https.onCall((data, context) => {
    function formataNumMatricula(num) {
        let numero = num
        numero = "00000" + numero.replace(/\D/g, '');
        numero = numero.slice(-5,-1) + numero.slice(-1);
        return numero
    }
    if (context.auth.token.master == true || context.auth.token.secretaria == true) {
        let alunos = data.alunos
        let turma = data.codTurma
        var timestamp = admin.firestore.Timestamp.now()
        if (data.modo == 'ativa') {
            async function ativaAlunos() {
                let dadosAluno
                let dadosTurma
                for (const matriculaNum in alunos) {
                    if (Object.hasOwnProperty.call(alunos, matriculaNum)) {
                        const nome = alunos[matriculaNum];
                        let matricula = formataNumMatricula(matriculaNum)
                        await admin.database().ref(`sistemaEscolar/alunosDesativados/${matricula}/dadosAluno`).once('value').then(snapshot => {
                            dadosAluno = snapshot.val()
                            console.log(dadosAluno)

                            admin.database().ref(`sistemaEscolar/alunosDesativados/${matricula}/dadosTurma`).once('value').then(snapshotTurma => {
                                dadosTurma = snapshotTurma.val()

                                admin.database().ref(`sistemaEscolar/alunos/${matricula}/`).set(dadosAluno).then(() => {
                                    admin.database().ref(`sistemaEscolar/alunosDesativados/${matricula}`).remove().then(() => {
                                        admin.database().ref(`sistemaEscolar/turmas/${turma}/alunos/${matricula}/`).set(dadosTurma).then(() => {
                                            admin.database().ref(`sistemaEscolar/alunos/${matricula}/historico`).push({dados:{dadosTurma: dadosTurma, turmaAtivacao: turma}, timestamp: timestamp, operacao: 'Reativação de aluno'}).then(() => {
                                                admin.database().ref(`sistemaEscolar/alunos/${matricula}/turmaAluno`).set(turma).then(() => {

                                                }).catch(error => {
                                                    throw new functions.https.HttpsError('unknown', error.message, error)
                                                })

                                            }).catch((error) => {
                                                throw new functions.https.HttpsError('unknown', error.message, error)
                                            })
                                        
                                        }).catch(error => {
                                            throw new functions.https.HttpsError('unknown', error.message, error)
                                        })
                                    }).catch(error => {
                                        throw new functions.https.HttpsError('unknown', error.message, error)
                                    })
                                }).catch(error => {
                                    throw new functions.https.HttpsError('unknown', error.message, error)
                                })
                            }).catch(error => {
                                throw new functions.https.HttpsError('unknown', error.message, error)
                            })
                        }).catch(error => {
                            throw new functions.https.HttpsError('unknown', error.message, error)
                        })
                    }
                }
            }

            return ativaAlunos().then(() => {
                return {answer: 'Os alunos selecionados foram reativados com sucesso.'}
            }).catch(error => {
                throw new functions.https.HttpsError('unknown', error.message, error)
            })
        } else if (data.modo == 'desativa') {
            async function desativaAlunos() {
                let dadosAluno
                let dadosTurma
                for (const matriculaNum in alunos) {
                    if (Object.hasOwnProperty.call(alunos, matriculaNum)) {
                        const nome = alunos[matriculaNum];
                        let matricula = formataNumMatricula(matriculaNum)
                        admin.database().ref(`sistemaEscolar/alunos/${matricula}`).once('value').then(snapshot => {
                            dadosAluno = snapshot.val()
                            console.log(dadosAluno)
                            turma = dadosAluno.turmaAluno
                            admin.database().ref(`sistemaEscolar/turmas/${turma}/alunos/${matricula}/`).once('value').then(snapshotTurma => {
                                dadosTurma = snapshotTurma.val()

                                admin.database().ref(`sistemaEscolar/alunosDesativados/${matricula}/`).set({dadosAluno: dadosAluno, dadosTurma: dadosTurma}).then(() => {
                                    admin.database().ref(`sistemaEscolar/alunos/${matricula}`).remove().then(() => {
                                        admin.database().ref(`sistemaEscolar/turmas/${turma}/alunos/${matricula}/`).remove().then(() => {
                                            admin.database().ref(`sistemaEscolar/alunosDesativados/${matricula}/dadosAluno/historico`).push({dados:{dadosTurma: dadosTurma, turma: turma}, timestamp: timestamp, operacao: 'Desativação de aluno'}).then(() => {

                                            }).catch((error) => {
                                                throw new functions.https.HttpsError('unknown', error.message, error)
                                            })
                                        
                                        }).catch(error => {
                                            throw new functions.https.HttpsError('unknown', error.message, error)
                                        })
                                    }).catch(error => {
                                        throw new functions.https.HttpsError('unknown', error.message, error)
                                    })
                                }).catch(error => {
                                    throw new functions.https.HttpsError('unknown', error.message, error)
                                })
                            }).catch(error => {
                                throw new functions.https.HttpsError('unknown', error.message, error)
                            })
                        }).catch(error => {
                            throw new functions.https.HttpsError('unknown', error.message, error)
                        })
                    }
                }
            }


            return desativaAlunos().then(() => {
                return {answer: 'Os alunos selecionados foram desativados com sucesso.'}
            }).catch(error => {
                throw new functions.https.HttpsError('unknown', error.message, error)
            })
            
            
        } else {
            throw new functions.https.HttpsError('aborted', 'A operação foi abortada pois não foi passado o modo da operação')
        }

    } else {
        throw new functions.https.HttpsError('permission-denied', 'Você não possui permissão para fazer alterações nesta área.')
    }
})

exports.lancarNotas = functions.https.onCall((data, context) => {
    // data: {alunos: {matricula: nomeAluno}, turma: codTurma, notas: {ativ1: 50, ativ2: 50}}
    if (context.auth.token.master == true || context.auth.token.professores == true) {
        function formataNumMatricula(num) {
            let numero = num
            numero = "00000" + numero.replace(/\D/g, '');
            numero = numero.slice(-5,-1) + numero.slice(-1);
            return numero
        }
        var dados = data
        var alunos = dados.alunos
        var turma = dados.turma
        var notas = dados.notas
    
        var alunosTurmaRef = admin.database().ref('sistemaEscolar/turmas/' + turma + '/alunos')
        async function lancar() {
            for (const matricula in alunos) {
                if (Object.hasOwnProperty.call(alunos, matricula)) {
                    const nomeAluno = alunos[matricula];
                    alunosTurmaRef.child(formataNumMatricula(matricula) + '/notas').set(notas).then(() => {
                        return admin.database().ref(`sistemaEscolar/registroGeral`).push({operacao: 'Lançamento de notas', timestamp: admin.firestore.Timestamp.now(), userCreator: context.auth.uid, dados: dados}).then(() => {
                            
                        }).catch(error => {
                            throw new functions.https.HttpsError('unknown', error.message, error)
                        })
                    }).catch(error => {
                        throw new functions.https.HttpsError('unknown', error.message, error)
                    })
                }
            }
        }
        return lancar().then(() => {
            return {answer: 'As notas lançadas com sucesso. Aguarde um momento até que o sistema atualize as notas automaticamente.'}
        }).catch(error => {
            throw new functions.https.HttpsError('unknown', error.message, error)
        })
        
    } else {
        throw new functions.https.HttpsError('permission-denied', 'Você não possui permissão para fazer alterações nesta área.')
    }

})

exports.lancaDesempenhos = functions.database.ref('sistemaEscolar/turmas/{codTurma}/alunos/{matricula}/desempenho').onWrite((snapshot, context)=> {
    // context.timestamp = context.timestamp
    // context.params = { codTurma: 'KIDS-SAT08', matricula: '00001' }

    var notasDesempenho = snapshot.after.val()
    var referencia = {turma: context.params.codTurma, matriculaAluno: context.params.matricula}

    return admin.database().ref(`sistemaEscolar/turmas/${referencia.turma}/notas/Desempenho`).once('value').then(notasDesempenhoTurma => {
        if (notasDesempenhoTurma.exists()) {
            let somatorioDesempenho = 0
            for (const nomeNota in notasDesempenho) {
                if (Object.hasOwnProperty.call(notasDesempenho, nomeNota)) {
                    const valor = notasDesempenho[nomeNota];
                    somatorioDesempenho += valor
                }
            }

            return admin.database().ref(`sistemaEscolar/turmas/${referencia.turma}/alunos/${referencia.matriculaAluno}/notas/Desempenho`).set(somatorioDesempenho).then(() => {
                return 'Somatório de desempenho da matricula '+ referencia.matriculaAluno + ' foi alterado na turma ' + referencia.turma
            }).catch(error => {
                throw new functions.https.HttpsError('unknown', error.message, error)
            })
        } else {
            return 'A turma ' + referencia.turma + 'não possui nota de desepenho distribuída no somatório final das notas. A nota da matricula ' + referencia.matriculaAluno + ' não foi alterada.'
        }
    }).catch(error => {
        throw new functions.https.HttpsError('unknown', error.message, error)
    })
})

exports.fechaTurma = functions.https.onCall((data, context) => {
    function formataNumMatricula(num) {
        let numero = num
        numero = "00000" + numero.replace(/\D/g, '');
        numero = numero.slice(-5,-1) + numero.slice(-1);
        return numero
    }
    if (context.auth.token.master == true || context.auth.token.professores == true) {
        var turma = data
        var turmaRef = admin.database().ref(`sistemaEscolar/turmas/${turma}`)
        var alunosRef = admin.database().ref(`sistemaEscolar/alunos/`)
        var chave = alunosRef.push().key
        return turmaRef.once('value').then(dadosTurma => {
            async function sequenciaDeFechamento(dadosDaTurma) {
                delete dadosDaTurma.historicoEscolar
                turmaRef.child('status/turma').set('fechada').then(()=>{

                }).catch(error => {
                    throw new Error(error.message)
                })

                let aulaEvento = (await turmaRef.child('aulaEvento').once('value')).val()

                turmaRef.child('historicoEscolar/' + chave).set({dadosDaTurma: dadosDaTurma, timestamp: admin.firestore.Timestamp.now(), codTurma: dadosDaTurma.codigoSala, aulaEvento: aulaEvento}).then(() => {

                }).catch(error => {
                    throw new Error(error.message)
                })

                turmaRef.child('frequencia').remove().then(() => {
                    
                }).catch(error => {
                    throw new Error(error.message)
                })

                for (const matricula in dadosDaTurma.alunos) {
                    if (Object.hasOwnProperty.call(dadosDaTurma.alunos, matricula)) {
                        let infoAluno = dadosDaTurma.alunos[matricula];
                        infoAluno.notasReferencia = dadosDaTurma.notas
                        infoAluno.timestamp = admin.firestore.Timestamp.now()
                        infoAluno.codigoSala = dadosDaTurma.codigoSala
                        infoAluno.inicio = dadosDaTurma.status.inicio
                        infoAluno.fim = dadosDaTurma.status.fim
                        infoAluno.qtdeAulas = dadosDaTurma.status.qtdeAulas
                        infoAluno.livros = dadosDaTurma.livros
                        infoAluno.curso = dadosDaTurma.curso
                        infoAluno.nomePeriodo = dadosDaTurma.status.nomePeriodo
                        infoAluno.professor = dadosDaTurma.professor
                        alunosRef.child(formataNumMatricula(matricula) + '/historicoEscolar/' + chave).set({infoAluno: infoAluno, timestamp: admin.firestore.Timestamp.now(), turma: dadosDaTurma.codigoSala, aulaEvento: aulaEvento}).then(() => {

                        }).catch(error => {
                            throw new Error(error.message)
                        })
                        turmaRef.child('alunos/' + formataNumMatricula(matricula)).set({nome: infoAluno.nome}).then(() => {

                        }).catch(error => {
                            throw new Error(error.message)
                        })
                    }
                }
                admin.database().ref(`sistemaEscolar/registroGeral`).push({operacao: 'Fechamento de Turma',  timestamp: admin.firestore.Timestamp.now(), userCreator: context.auth.uid, dados: {codTurma: dadosDaTurma.codigoSala}}).then(() => {
                            
                }).catch(error => {
                    throw new functions.https.HttpsError('unknown', error.message, error)
                })
                await turmaRef.child('aulaEvento').remove()
            }

            return sequenciaDeFechamento(dadosTurma.val()).then(callback => {
                return {answer: 'A sequência de fechamento da turma foi concluída com sucesso.', callback: callback}
            }).catch(error => {
                throw new functions.https.HttpsError('unknown', error.message, error)
            })
        }).catch(error => {
            throw new functions.https.HttpsError('unknown', error.message, error)
        })
    } else {
        throw new functions.https.HttpsError('permission-denied', 'Você não possui permissão para fazer alterações nesta área.')
    }
})

exports.aberturaChamados = functions.database.ref('sistemaEscolar/chamados/{key}').onCreate(async (snapshot, context) => {

    function convertTimestamp(timestamp) {
        let time = new Date(timestamp._seconds * 1000)
    
        return time;
    }

    const priorities = ['Baixa', 'Média', 'Alta', 'Crítica'];
    const emailSuporte = 'suporte@grupoprox.com'
    const key = context.params.key
    let chamado = snapshot.val()
    chamado.timestamp = admin.firestore.Timestamp.now()
    chamado.situacao = 0

    await admin.database().ref('sistemaEscolar/chamados').child(key).set(chamado)

    let imagens = ''
    try {
        if (!chamado.imagens) {
            imagens = 'O solicitante não anexou imagens ao chamado.'
        }
        for (const i in chamado.imagens) {
            if (Object.hasOwnProperty.call(chamado.imagens, i)) {
                const url = chamado.imagens[i];
                imagens += `<a href="${url}" target="_blank">Imagem ${Number(i) + 1}</a><br>`
            }
        }
    } catch (error) {
        console.log(error)
    }

    let firestoreRef = admin.firestore().collection('mail');
    let emailContent = {
        to: emailSuporte,
        cc: chamado.email,
        replyTo: emailSuporte,
        message: {
            subject: `Abertura de chamado: ${chamado.assunto}`,
            text: `Notificação de abertura de chamado no sistema escolar.`,
            html: `
            <h5>Abertura de chamado no sistema escolar</h5>
            <p> 
                <b>Assunto: </b> ${chamado.assunto}
            </p>
            <p> 
                <b>Descrição: </b> ${chamado.descricao}
            </p>
            <p> 
                <b>Usuário solicitante: </b> ${chamado.nome}
            </p>
            <p> 
                <b>Contato do solicitante: </b> ${chamado.email}
            </p>
            <p> 
                <b>Nível de prioridade: </b> ${priorities[chamado.prioridade]}
            </p>
            <p> 
                <b>Data e Hora de Abertura: </b> ${convertTimestamp(chamado.timestamp).toLocaleDateString('pt-br', {timeZone: 'America/Sao_Paulo'})} ás ${convertTimestamp(chamado.timestamp).toLocaleTimeString('pt-BR', {timeZone: 'America/Sao_Paulo'})}
            </p>
            <p><b>Imagens anexadas à solicitação: </b><br>${imagens}</p>
            <br>
            <p>Este é um e-mail gerado automaticamente pelo sistema. <b>O e-mail é direcionado para a equipe de suporte que fará a análise do chamado, sendo que, o solicitante está em cópia (Cc) nesta mensagem</b>.</p><p>Todo o contato para análise e resolução da solicitação será preferencialmente via e-mail para fins de resguardo legal, tanto por parte do solicitante, quanto por parte da empresa administradora do sistema escolar.</p><br><br><p>Sistemas GrupoProX.</p>`
        }
    }

    await firestoreRef.add(emailContent)
    console.log('Email queued for delivery.')
})

exports.montaCalendarioGeral = functions.database.ref('sistemaEscolar/turmas/{turma}/aulaEvento/').onWrite(async (snapshot, context) => {
    let turma = context.params.turma
    let aulaEvento = snapshot.after.val()
    let source = aulaEvento
    let calendarioSnapshot = await admin.database().ref('sistemaEscolar/infoEscola/calendarioGeral').once('value')
    let calendario = calendarioSnapshot.exists() ? calendarioSnapshot.val() : [source]
    if (calendarioSnapshot.exists()) {
        calendario.push(source);
    }


    await admin.database().ref('sistemaEscolar/infoEscola/calendarioGeral').set(calendario)
    
})

exports.removeCalendarios = functions.database.ref('sistemaEscolar/turmas/{turma}/aulaEvento/').onDelete(async (snapshot, context) => {
    let turma = context.params.turma
    let aulaEvento = snapshot.val()
    let calendarioSnapshot = await admin.database().ref('sistemaEscolar/infoEscola/calendarioGeral').once('value')
    let calendarioGeral = calendarioSnapshot.val()
    let calendario = calendarioGeral.filter(source => source.id !== turma)
    
    await admin.database().ref('sistemaEscolar/infoEscola/calendarioGeral').set(calendario)
    
})

exports.geraPix = functions.https.onCall((data, context) => {
    class BrCode {
        constructor(key, amount, name, reference, key_type, city) {
          this.key = key;
          this.amount = amount;
          this.name = name;
          this.reference = reference;
          this.key_type = key_type;
          this.city = city;
        }
      
        static format_text(text) {
          return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        }
      
        formated_name() {
          return this.constructor.format_text(this.name);
        }
      
        formated_city() {
          return this.constructor.format_text(this.city);
        }
      
        formated_amount() {
          return this.amount.replace(',','.').replace(' ','').replace("R$", '');
        }
      
        formated_referance() {
          return this.constructor.format_text(this.reference).replace(' ','');
        }
      
        formated_key() {
          var rkey = this.key;
          var ktype = this.key_type.toLowerCase();
      
          if (ktype == 'telefone' || ktype == 'cnpj' || ktype == "cpf") {
            rkey = rkey.replace(/\D/g,'');
          }
      
          if (ktype == "telefone") {
            rkey = "+55" + rkey
          }
      
          return rkey
        }
      
        generate_qrcp() {
        
          var emvqr = Merchant.buildEMVQR();
            
          emvqr.setPayloadFormatIndicator("01");
          emvqr.setCountryCode("BR")
          emvqr.setMerchantCategoryCode("0000");
          emvqr.setTransactionCurrency("986");
          const merchantAccountInformation = Merchant.buildMerchantAccountInformation();
          merchantAccountInformation.setGloballyUniqueIdentifier("BR.GOV.BCB.PIX");
      
          merchantAccountInformation.addPaymentNetworkSpecific("01", this.formated_key());
      
          emvqr.addMerchantAccountInformation("26", merchantAccountInformation);
      
          if (this.name) {
            emvqr.setMerchantName(this.formated_name());
          }
      
          if (this.city) {
            emvqr.setMerchantCity(this.formated_city());
          }
      
          if (this.amount && this.amount != '') {
            emvqr.setTransactionAmount(this.formated_amount());
          }
      
          const additionalDataFieldTemplate = Merchant.buildAdditionalDataFieldTemplate();
      
          if (this.reference) {
            additionalDataFieldTemplate.setReferenceLabel(this.formated_referance());
          }
          else {
            additionalDataFieldTemplate.setReferenceLabel("***");
          }
      
          emvqr.setAdditionalDataFieldTemplate(additionalDataFieldTemplate);
          let payLoadTEst = emvqr.generatePayload();
          
          return payLoadTEst;
        }
      }
      async function criaCod() {
        const dadosBasicos = (await admin.database().ref('sistemaEscolar/infoEscola/dadosBasicos').once('value')).val();
        const lineCode = new BrCode(dadosBasicos.chavePix, data.valor, dadosBasicos.nomePix, data.descricao, dadosBasicos.tipoChavePix, dadosBasicos.cidadePix);
        console.log(lineCode)
        const code = lineCode.generate_qrcp();
        console.log(code)
        const QR_CODE_SIZE = 400;
        return QRCode.toDataURL(code, {width: QR_CODE_SIZE, height: QR_CODE_SIZE})
            .then(qrcode => {
                    //console.log(qrcode)
                    return qrcode;
                })
            .catch(err => {
                console.error(err)
            })
        
      }
      return criaCod();
      
})

exports.alteracaoDados = functions.database.ref('sistemaEscolar/alunos/{matricula}/{key}').onUpdate((snapshot, context) => {
    
    functions.logger.log(context.params.key)
    functions.logger.log(context.params.matricula)
    functions.logger.log(snapshot.before.val())
    functions.logger.log(snapshot.after.val())
})

// exports.systemUpdate = functions.pubsub.schedule('every sunday 03:00')
//   .timeZone('America/Sao_Paulo') // Users can choose timezone - default is America/Los_Angeles
//   .onRun((context) => {
//     let aniversariantesRef = admin.database().ref('sistemaEscolar/aniversariantes')
//     let alunosRef = admin.database().ref('sistemaEscolar/alunos')
//     let alunosRef = admin.database().ref('sistemaEscolar/alunos')
//   return null;
// });
// exports.adicionaFotoAluno = functions.storage.object().onFinalize(async (object) => {
//     const fileBucket = object.bucket; // The Storage bucket that contains the file.
//     const filePath = object.name; // File path in the bucket.
//     const contentType = object.contentType; // File content type.
//     const metageneration = object.metageneration; // Number of times metadata has been generated. New objects have a value of 1.
//     const metadata = object.metadata; // File metadata.
//     // Exit if this is triggered on a file that is not an image.
//     functions.logger.log(fileBucket)
//     functions.logger.log(filePath);
//     functions.logger.log(path.dirname(filePath));
    
//     if (!contentType.startsWith('image/') && filePath.indexOf('alunos') == -1) {
//         return functions.logger.log('This is not an image.');
        
//     }
//     // Get the file name.
//     functions.logger.log("URL: ", url);
//     const fileName = path.basename(filePath);
//     const matricula = path.dirname(filePath).split('/')[2];
//     functions.logger.log(matricula);
//     return admin.database().ref(`sistemaEscolar/alunos/${matricula}/fotoAluno`).set(url).then(() => {
//         functions.logger.log("Foto adicionada com sucesso!");
//         return {
//             answer: 'Foto adicionada com sucesso.'
//         }
//     }).catch(error => {
//         functions.logger.log(error);
//     })

    
// })