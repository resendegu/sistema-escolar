const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { auth } = require('firebase-admin');
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
    /**{codigoSala: codPadrao, professor: professor, diasDaSemana: diasDaSemana, livros: books, nivelTurma: nivelTurma, faixaTurma: faixaEtaria, hora: horarioCurso} */
    console.log(data)
    if (context.auth.token.master == true || context.auth.token.secretaria == true) {
        var dados = data
        var horario
        if (dados.hora >= 12 && dados.hora <= 17) {
            horario = 'Tarde'
        } else if (dados.hora >= 18 && dados.hora <= 23) {
            horario = 'Noite'
        } else if (dados.hora >= 5 && dados.hora <= 11) {
            horario = 'Manha'
        } else {
            throw new functions.https.HttpsError('invalid-argument', 'Você deve passar um horário válido')
        }
        return admin.auth().getUser(data.professor).then(function(user) {
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
                            return {answer: 'Turma cadastrada com sucesso.'}
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
        
    } else {
        throw new functions.https.HttpsError('permission-denied', 'Você não possui permissão para fazer alterações nesta área.')
    }
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
        }).catch(function(error){
            throw new functions.https.HttpsError('unknown', error.message, error)
        })
    } else {
        throw new functions.https.HttpsError('permission-denied', 'Você não possui permissão para fazer alterações nesta área.')
    }

})

exports.cadastraAluno = functions.https.onCall((data, context) => {
    if (context.auth.token.master == true || context.auth.token.secretaria == true) {
        let dadosAluno = data.dados
        dadosAluno.timestamp = admin.firestore.Timestamp.now()
            return admin.database().ref('sistemaEscolar/alunos').child(dadosAluno.matriculaAluno).once('value').then(alunoRecord => {
                if (alunoRecord.exists()) {
                    throw new functions.https.HttpsError('already-exists', 'Este número de matrícula já consta no sistema. Por favor, clique no botão azul no início deste formulário para atualizar o número de matrícula, para gerar um novo número de matrícula.')
                }
                return admin.database().ref('sistemaEscolar/alunos/' + dadosAluno.matriculaAluno).set(dadosAluno).then(() => {
                    return admin.database().ref('sistemaEscolar/turmas').child(dadosAluno.turmaAluno + '/alunos').child(dadosAluno.matriculaAluno).set({nome: dadosAluno.nomeAluno, prof: dadosAluno.profAluno, notas: {prova1: 0, prova2: 0, fala: 0, audicao: 0, leitura: 0, escrita: 0, atividadesExtras: 0}}).then(() => {
                        return admin.database().ref('sistemaEscolar/ultimaMatricula').set(dadosAluno.matriculaAluno).then(() => {
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
                                    throw new functions.https.HttpsError('already-exists', 'Já existe. isso pode ser um erro')
                                }
                                
                            })
                            let horaEDias = dadosAluno.horaEDiasAluno.split(',') // Output: ['20h', 'MON', 'WED' ...]
                                    let hora = horaEDias[0]
                                    hora = hora.split('h')
                                    hora = Number(hora[0])
                                    var horario
                                    if (hora >= 12 && hora <= 17) {
                                        horario = 'Tarde'
                                    } else if (hora >= 18 && hora <= 23) {
                                        horario = 'Noite'
                                    } else if (hora >= 4 && hora <= 11) {
                                        horario = 'Manha'
                                    }
                                    let dias = horaEDias.slice(1)
                                    for (const index in dias) {
                                        if (Object.hasOwnProperty.call(dias, index)) {
                                            const dia = dias[index];
                                            admin.database().ref('sistemaEscolar/numeros/tabelaSemanal/' + dia + '/' + horario).transaction(function(current_value){
                                                if (current_value === null){
                                                    return 1
                                                } else {
                                                    return current_value + 1
                                                }
                                            }, function(error, comitted, snapshot){
                                                if (error) {
                                                    throw new functions.https.HttpsError(error.code, error.message, error)
                                                } else if(!comitted) {
                                                    throw new functions.https.HttpsError('already-exists', 'Já existe. isso pode ser um erro')
                                                }
                                            })
                                        }
                                    }
                                    return {answer: 'Aluno cadastrado e distribuído nas turmas e nos professores com sucesso!'}
                            
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
        throw new functions.https.HttpsError('permission-denied', 'Você não possui permissão para fazer alterações nesta área.')
    }
})

exports.timestamp = functions.https.onCall((data, context) => {
    if (context.auth.token.master == true || context.auth.token.secretaria == true ||  context.auth.token.professores == true || context.auth.token.adm == true) {
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
        let turmaAtual = dados.codTurma
        let turmaParaTransferir = dados.codTurmaParaTransferir
        let alunos = {} //Aqui onde será guardado os alunos e os dados dos mesmos, da turma para serem transferidos para outra turma
        var timestamp = admin.firestore.Timestamp.now()
        
        return admin.database().ref(`sistemaEscolar/turmas/${turmaAtual}/alunos/`).once('value').then(snapshot => {
            let alunosTurma = snapshot.val()
            for (const matricula in dados) {
                if (Object.hasOwnProperty.call(dados, matricula)) {
                    const nomeAluno = dados[matricula];
                    if (matricula == 'codTurma' || matricula == 'codTurmaParaTransferir') {

                    } else {
                        alunos[formataNumMatricula(matricula)] = alunosTurma[formataNumMatricula(matricula)]
                    }
                    
                }
            }
            
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
                                                    admin.database().ref(`sistemaEscolar/alunos/${matricula}/historico/`).push({dados: {matricula: matricula, dadosAluno: dadosAluno, turmaAtual: turmaAtual, turmaParaQualFoiTransferido: turmaParaTransferir}, timestamp: timestamp, operacao: 'Transferência de alunos'}).then(() =>{

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
        return admin.database().ref(`sistemaEscolar/turmas/${turma}`).remove().then(() => {
            return {answer: 'A turma e todos os seus registros foram excluídos com sucesso.'}
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
                        await admin.database().ref(`sistemaEscolar/alunos/${matricula}`).once('value').then(snapshot => {
                            dadosAluno = snapshot.val()
                            console.log(dadosAluno)

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