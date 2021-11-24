var secretariaRef = firebase.database().ref('sistemaEscolar/secretaria')
var numerosRef = firebase.database().ref('sistemaEscolar/numeros')
var aniversariosRef = firebase.database().ref('sistemaEscolar/aniversarios')
var listaDeUsuariosRef = firebase.database().ref('sistemaEscolar/listaDeUsuarios')
var listaDeProfessores = firebase.database().ref('sistemaEscolar/listaDeProfessores')
var turmasRef = firebase.database().ref('sistemaEscolar/turmas')
var ultimaMatriculaRef = firebase.database().ref('sistemaEscolar/ultimaMatricula')
var alunosRef = firebase.database().ref('sistemaEscolar/alunos')
var alunosDesativadosRef = firebase.database().ref('sistemaEscolar/alunosDesativados')
var followUpRef = firebase.database().ref('sistemaEscolar/followUp')
var transfereAlunos = firebase.functions().httpsCallable('transfereAlunos')
var desempenhoRef = firebase.database().ref('sistemaEscolar/notasDesempenho/referencia')
var infoEscolaRef = firebase.database().ref('sistemaEscolar/infoEscola')
var alunosStorageRef = firebase.storage().ref('sistemaEscolar/alunos')
var cursosRef = firebase.database().ref('sistemaEscolar/infoEscola/cursos')
var contratosRef = firebase.database().ref('sistemaEscolar/infoEscola/contratos')
var preMatriculasRef = firebase.database().ref('sistemaEscolar/preMatriculas')

var loader = document.getElementById('loader')
var loaderMsg = document.getElementById('loaderMsg')

$(function () {
    $('[data-toggle="tooltip"]').tooltip()
  })

  $(function () {
    $('[data-toggle="popover"]').popover()
  })



firebase.auth().onAuthStateChanged((user) => {
    
    if (user == null) {
        loaderRun()
        
        abrirModal('modal', 'Login',
            `
            <div class="container">
                <h3>Seja bem-vindo!</h3>
                <h6>Para acessar o sistema, digite seu e-mail e sua senha cadastradas.</h6>
                <form id="areaLogin">
                    <div class="form-row">
                    <div class="form-group col-md-6">
                        <label for="inputEmail4">Email</label>
                        <input type="email" name="usuario" class="form-control" id="usuario" placeholder="Email">
                        <a style="cursor: pointer;" id="esqueceuSenha" class="text-center" data-toggle="tooltip" data-placement="right" title="Digite seu e-mail no campo, e clique aqui para que possamos te ajudar.">Esqueci minha senha</a>
                    </div>
                    <div class="form-group col-md-6">
                        <label for="inputPassword4">Senha</label>
                        <input type="password" name="senha" class="form-control" id="inputPassword4" placeholder="Senha">
                    </div>
                    <button type="submit" class="btn btn-primary btn-block" id="btnEntrar">Entrar no sistema</button>
                    <br><br>
                    
                </form>
            </div>
            `,
            `<button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`
        )
        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        })

        document.getElementById('esqueceuSenha').addEventListener('click', (e) => {
            let email = document.getElementById('usuario').value
            if(email == "" || email.indexOf('@') == -1) {
                AstNotif.dialog('Erro', 'Por favor, digite seu e-mail corretamente.')
            } else {
                loaderRun(true, 'Enviando email de verificação')
                firebase.auth().sendPasswordResetEmail(email)
                .then(() => {
                   loaderRun()
                   AstNotif.dialog('Sucesso', 'Acabamos de enviar um e-mail com um link para redefinição da sua senha. Confira sua Caixa de Entrada ou SPAM.')
                })
                .catch((error) => {
                    let errorCode = error.code;
                    let errorMessage = error.message;
                    AstNotif.dialog('Erro', errorMessage)
                    console.log(error)
                });
            }
        })
    
        document.querySelector('#areaLogin').addEventListener('submit', (e) => {
            loaderRun(true, 'Conectando ao sistema...')
            e.preventDefault()
            const formData = new FormData(e.target);
            var senha = formData.get('senha')
            var email = formData.get('usuario')
            firebase.auth().useDeviceLanguage();

            firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
                .then(() => {
                    loaderRun(true, 'Autenticando usuário...')
                    // Existing and future Auth states are now persisted in the current
                    // session only. Closing the window would clear any existing state even
                    // if a user forgets to sign out.
                    // ...
                    // New sign-in will be persisted with session persistence.
                    return firebase.auth().signInWithEmailAndPassword(email, senha);
                }).then((result) => {
                    loaderRun()
                    $('#modal').modal('hide')
                })
                .catch((error) => {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    AstNotif.dialog('Erro', error.message)
                    loaderRun()
                });

        })
    } else {
        loader.style.display = 'block'
        loaderMsg.innerText = 'Buscando informações do usuário...'

        chamados()
        try {
            document.getElementById('username').innerHTML = "Olá,<br>" + user.displayName.split(' ')[0]
            if (user.photoURL != null) {
                document.getElementById('profilePic').src = user.photoURL
                
            } 
        } catch (error) {
            console.log(error)
        }
        //var alunosCadastradosNum = document.getElementById('alunosCadastradosNum')
        var alunosMatriculadosNum = document.getElementById('alunosMatriculadosNum')
        var alunosDesativadosNum = document.getElementById('alunosDesativadosNum')
        var turmasCadastradasNum = document.getElementById('turmasCadastradasNum')
        alunosRef.on('value', (snapshot) => {
            let students = snapshot.val()
            let c = 0
            for (const matricula in students) {
                if (Object.hasOwnProperty.call(students, matricula)) {
                    const dados = students[matricula];
                    c++
                }
            }
            alunosMatriculadosNum.innerText = c
        })
        turmasRef.on('value', (snapshot) => {
            let classrooms = snapshot.val()
            let c = 0
            for (const matricula in classrooms) {
                if (Object.hasOwnProperty.call(classrooms, matricula)) {
                    const dados = classrooms[matricula];
                    c++
                }
            }
            turmasCadastradasNum.innerText = c
        })
        firebase.database().ref('sistemaEscolar/alunosDesativados').on('value', (snapshot) => {
            let inactiveStudents = snapshot.val()
            let c = 0
            for (const matricula in inactiveStudents) {
                if (Object.hasOwnProperty.call(inactiveStudents, matricula)) {
                    const dados = inactiveStudents[matricula];
                    c++
                }
            }
            alunosDesativadosNum.innerText = c
        })

        firebase.database().ref('sistemaEscolar/infoEscola/calendarioGeral').on('value', (snapshot) => {
            let eventSources = snapshot.val()
            let calendarEl = document.getElementById('calendar');
            let calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'timeGridWeek',
            height: '450px',
            locale: 'pt-br',
            weekNumbers: true,
            dateClick: function(info) {
                console.log(info)
            },
            selectable: true,
            select: function(info) {
                console.log(info)
            },
            hiddenDays: [ 0 ],
            unselectAuto: false,
            // businessHours: [ // specify an array instead
            //   {
            //     daysOfWeek: [ 1, 2, 3, 4, 5  ], // Monday, Tuesday, Wednesday
            //     startTime: '08:00', // 8am
            //     endTime: '18:00' // 6pm
            //   },
            //   {
            //     daysOfWeek: [ 6 ], // Saturday
            //     startTime: '10:00', // 10am
            //     endTime: '16:00' // 4pm
            //   }
            // ],
            nowIndicator: true,
            eventSources: eventSources,

            // customButtons: {
            //   myCustomButton: {
            //       text: 'custom!',
            //       click: function() {
            //         alert('clicked the custom button!');
            //       }
            //     }
            //   },
                headerToolbar: {
                left: 'prevYear prev today next nextYear',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }
            });
            calendar.render();
            handleCalendar()
        })

        

        // numerosRef.on('value', (snapshot) => {
        //     loaderMsg.innerText = 'Buscando informações da dashboard'
        //     var numeros = snapshot.val()
        //     var tabelaSemanal = numeros.tabelaSemanal
            
        //     //alunosCadastradosNum.innerText = numeros.alunosCadastrados != undefined ? numeros.alunosCadastrados : 0
            
        //     //alunosDesativadosNum.innerText = numeros.alunosDesativados != undefined ? numeros.alunosDesativados : 0
        //     //turmasCadastradasNum.innerText = numeros.turmasCadastradas != undefined ? numeros.turmasCadastradas : 0

        //     // Alimenta tabela com os números de alunos em cada semana
        //     var idCelulaTabela = ''
        //     var totalManha = document.getElementById('totalManha').innerText = 0
        //     var totalTarde = document.getElementById('totalTarde').innerText = 0
        //     var totalNoite = document.getElementById('totalNoite').innerText = 0
        //     var totalMON = document.getElementById('totalMON').innerText = 0
        //     var totalTUE = document.getElementById('totalTUE').innerText = 0
        //     var totalWED = document.getElementById('totalWED').innerText = 0
        //     var totalTHU = document.getElementById('totalTHU').innerText = 0
        //     var totalFRI = document.getElementById('totalFRI').innerText = 0
        //     var totalSAT = document.getElementById('totalSAT').innerText = 0
        //     var totalSUN = document.getElementById('totalSUN').innerText = 0
        //     for (const dia in tabelaSemanal) {
        //         if (tabelaSemanal.hasOwnProperty(dia)) {
        //             const horarios = tabelaSemanal[dia];
        //             idCelulaTabela += dia
        //             for (const horario in horarios) {
        //                 if (horarios.hasOwnProperty(horario)) {
        //                     const numeroDeAlunos = horarios[horario]
        //                     idCelulaTabela += horario
        //                     console.log(idCelulaTabela)
        //                     document.getElementById(idCelulaTabela).innerText = numeroDeAlunos
        //                     var numNaTabela = Number(document.getElementById('total' + horario).innerText)
        //                     numNaTabela += numeroDeAlunos
        //                     var numNaTabelaDiario = Number(document.getElementById('total' + dia).innerText)
        //                     numNaTabelaDiario += numeroDeAlunos
        //                     document.getElementById('total' + horario).innerText = numNaTabela
        //                     document.getElementById('total' + dia).innerText = numNaTabelaDiario
        //                     idCelulaTabela = dia
        //                 }
        //             }
        //             idCelulaTabela = ''
        //         }
        //     }
        //     loaderRun()
        // })

        // aniversariosRef.on('value', snapshot => {
        //     loader.style.display = 'block'
        //     var meses = snapshot.val()
        //     var dataLocal = new Date()
        //     var mesAtual = dataLocal.getMonth()
        //     document.getElementById('listaAniversarios').innerHTML = ''
        //     for (const key in meses[mesAtual]) {
        //         if (meses[mesAtual].hasOwnProperty(key)) {
        //             const aniversario = meses[mesAtual][key];
        //             document.getElementById('listaAniversarios').innerHTML += `<button class="list-group-item list-group-item-action">${aniversario.nome} no dia ${aniversario.dataNascimento.dia}</button>`
        //         }
        //     }
        //     loaderRun()
        // })
        loaderRun()
    }
    
})

// Funções para cadastro de turmas



function preparaCadastroTurma() {
    let codTurmaAdd = document.getElementById('codTurmaAdd')

    let codDiasSemana
    let cursosCadastrados
    let livrosCadastrados

    let codCurso
    let horario
    let dias = []
    let livros = [] 

    function geraCod() {
        let codTurma = ''
        if (codCurso != undefined) {
            codTurma += codCurso
        }
        for (const i in livros) {
            if (Object.hasOwnProperty.call(livros, i)) {
                const codLivro = livros[i];
                codTurma += codLivro
            }
        }
        codTurma += '-'
        for (const i in dias) {
            if (Object.hasOwnProperty.call(dias, i)) {
                const dia = dias[i];
                codTurma += dia
            }
        }
        if (horario != undefined) {
            codTurma += horario
        }

        codTurmaAdd.value = codTurma
        console.log(codTurma)
    }

    infoEscolaRef.child('codDiasSemana').on('value', (snapshot) => {
        codDiasSemana = snapshot.val()
    })

    infoEscolaRef.child('livros').on('value', (snapshot) => {
        let listaLivros = document.getElementById('listaLivrosTurma')
        listaLivros.innerHTML = ''
        livrosCadastrados = snapshot.val()
        for (const i in livrosCadastrados) {
            if (Object.hasOwnProperty.call(livrosCadastrados, i)) {
                const livro = livrosCadastrados[i];
                listaLivros.innerHTML += `
                    <tr>
                        <td>
                            <span class="custom-checkbox">
                                <input type="checkbox" id="checkbox${livro.codSistema}" name="livros" value="${livro.codSistema}">
                                <label for="checkbox${livro.codSistema}"></label>
                            </span>
                        </td>
                        <td>${livro.nomeLivro}</td>
                        <td>${livro.codLivro}</td>
                        <td>${livro.idLivro}</td>
                    </tr>
                `
            }
        }
        document.getElementsByName('livros').forEach(livro => {
            livro.addEventListener('input', (e) => {
                if (e.target.checked) {
                    livros.push(livrosCadastrados[Number(e.target.value)].codLivro)
                } else {
                    livros.splice(livros.indexOf(livrosCadastrados[Number(e.target.value)].codLivro), 1)
                }
                geraCod()
                console.log(livros)
            })
        })
    })

    infoEscolaRef.child('cursos').on('value', (snapshot) => {
        let listaCursos = document.getElementById('listaCursosTurma')
        listaCursos.innerHTML = '<option hidden selected>Escolha um curso...</option>'
        cursosCadastrados = snapshot.val()
        for (const i in cursosCadastrados) {
            if (Object.hasOwnProperty.call(cursosCadastrados, i)) {
                const curso = cursosCadastrados[i];
                listaCursos.innerHTML += `
                <option value="${curso.codSistema}">${curso.codCurso} - ${curso.nomeCurso}</option>
                `
            }
        }
    })

    listaDeProfessores.on('value', (snapshot) => {
        let listaProfessoresTurma = document.getElementById('listaProfessoresTurma')
        listaProfessoresTurma.innerHTML = '<option hidden selected>Escolha um professor...</option>'
        for (const key in snapshot.val()) {
            if (Object.hasOwnProperty.call(snapshot.val(), key)) {
                const professor = snapshot.val()[key];
                listaProfessoresTurma.innerHTML += `
                <option value="${professor.nome}|${professor.email}">${professor.nome} (${professor.email})</option>
                `
            }
        }
    })

    document.getElementById('listaCursosTurma').addEventListener('input', (e) => {
        codCurso = cursosCadastrados[e.target.value].codCurso
        geraCod()
        console.log(codCurso)
    })

    document.getElementsByName('dia').forEach(dia => {
        dia.addEventListener('click', (e) => {
            if (e.target.checked) {
                dias.push(codDiasSemana[Number(e.target.value)])
            } else {
                dias.splice(dias.indexOf(codDiasSemana[Number(e.target.value)]), 1)
            }
            geraCod()
            console.log(dias)
        })
    });

    

    document.getElementById('horarioTurma').addEventListener('input', (e) => {
        if (e.target.value.split(':')[1] == '00') {
            horario = e.target.value.split(':')[0]
        } else {
            horario = e.target.value.split(':').join('_')
        }
        geraCod()
        console.log(horario)
    })

    document.getElementById('formCadastroTurma').addEventListener('submit', async (e) => {
        e.preventDefault()
        try {
            loaderRun(true, 'Enviando dados da turma para o servidor...')
            const dados = new FormData(e.target)
            
            let dadosTurma = {}
            dadosTurma.codigoSala = dados.get('codTurmaAdd')
            dadosTurma.professor = dados.get('listaProfessoresTurma').split('|')[1]
            console.log(dadosTurma.professor)
            dadosTurma.diasDaSemana = dados.getAll('dia')
            if (dadosTurma.diasDaSemana.length == 0) {
                throw new Error('Por favor, selecione ao menos um dia para as aulas da turma.')
            }
            
            dadosTurma.livros = dados.getAll('livros')
            if (dadosTurma.livros.length == 0) {
                throw new Error('Por favor, selecione ao menos um livro.') 
            }
            dadosTurma.curso = dados.get('listaCursosTurma')
            dadosTurma.modalidade = dados.get('modalidade')
            dadosTurma.horarioTerminoTurma = dados.get('horarioTerminoTurma')
            if (dados.get('horarioTurma').split(':')[1] == '00') {
                horario = dados.get('horarioTurma').split(':')[0]
            } else {
                horario = dados.get('horarioTurma').split(':').join('_')
            }
            dadosTurma.hora = horario
            
            var cadastraTurma = firebase.functions().httpsCallable('cadastraTurma')
            cadastraTurma(dadosTurma).then(function(result) {
                console.log(result)
                AstNotif.dialog('Sucesso', result.data.answer)
                loaderRun()
                document.getElementById('formCadastroTurma').reset()
            }).catch(function(error) {
                AstNotif.dialog('Erro', error.message)
                console.log(error)
                loaderRun()
            })
        } catch (error) {
            AstNotif.dialog('Erro', error.message)
            loaderRun()
        }
        
    })
}



//Aba de turmas
let turmaAberta
let dadosTurmaAberta
async function turmas() {
    let turmas
    let alunosSelecionados = []
    let alunosTurma
    
    carregaTurmas()

    let selectTurmas = document.getElementById('selectTurmas')

    selectTurmas.addEventListener('change', (e) => {
        abreTurma(e.target.value)
        
    })

    let btnEditarTurma = document.getElementById('btnEditarTurma')

    btnEditarTurma.addEventListener('click', edicaoTurmas)

    function edicaoTurmas() {
        abrirModal('modal', 'Editar informações da turma', `
            <label class="h3">Editar informações da turma</label>
            <form id="formEditarTurma">
            <div class="form-group row">
                <label for="codTurmaAdd" class="col-sm-3 col-form-label col-form-label-lg">Código da Turma*</label>
                <div class="col-sm-auto">
                <input type="text" required class="form-control form-control-lg" id="codTurmaAdd" name="codTurmaAdd" placeholder="Código da Turma" value="${dadosTurmaAberta.codigoSala}">
                <small id="codHelp" class="form-text text-muted">O código de turma será gerado automaticamente a medida que você inserir os dados. Mas você pode editar o código aqui caso seja necessário.</small>
                </div>
            </div>
            <div class="form-group row">
                <div class="col-auto my-1">
                <label class="mr-sm-2" for="listaCursosTurma">Curso*</label>
                <select required class="custom-select mr-sm-2" id="listaCursosTurma" name="listaCursosTurma">
                    <option hidden selected>Escolha um curso...</option>
                    
                </select>
                </div>
                <div class="col-auto my-1">
                    <label class="mr-sm-2" for="listaProfessoresTurma">Professor(a) Referência*</label>
                    <select required class="custom-select mr-sm-2" id="listaProfessoresTurma" name="listaProfessoresTurma">
        
                      
                    </select>
                </div>
                
                
            </div>
            <div class="form-group row">
                <div class="col-auto my-1">
                <label class="mr-sm-2" for="horarioTurma">Hr. Início*</label>
                <input class="form-control" required type="time" name="horarioTurma" value="${dadosTurmaAberta.hora.indexOf('_') == -1 ? dadosTurmaAberta.hora + ':00' : dadosTurmaAberta.hora.split('_')[0] + ':' + dadosTurmaAberta.hora.split('_')[1]}" id="horarioTurma">
                </div>
                <div class="col-auto my-1">
                <label class="mr-sm-2" for="horarioTurma">Hr. Fim</label>
                <input class="form-control" value="${dadosTurmaAberta.horarioTerminoTurma}" type="time" name="horarioTerminoTurma" id="horarioTerminoTurma">
                </div>
                <div class="col-auto my-1">
                <label class="mr-sm-2">Modalidade de Ensino*</label>
                <div class="custom-control custom-radio">
                    <input type="radio" id="presencial" ${dadosTurmaAberta.modalidade == "presencial" && 'checked'} value="presencial"  name="modalidade" class="custom-control-input">
                    <label class="custom-control-label" for="presencial">Ensino Presencial</label>
                </div>
                <div class="custom-control custom-radio">
                    <input type="radio" id="ead" ${dadosTurmaAberta.modalidade == "ead" && 'checked'} value="ead" name="modalidade" class="custom-control-input">
                    <label class="custom-control-label" for="ead">Ensino à Distância (EaD)</label>
                </div>
                </div>
                
                
            </div>
            <div class="form-group row">
                <label class="mr-sm-2">Dias de Aula:</label>
            </div>
            <div class="form-group row">
                <div class="col-auto my-1">
                <div class="custom-control custom-checkbox mr-sm-2">
                    <input type="checkbox" value="0" ${dadosTurmaAberta.diasDaSemana.indexOf('0') != -1 && 'checked'} class="custom-control-input" id="diaDomingo" name="dia">
                    <label class="custom-control-label" for="diaDomingo">Domingo</label>
                </div>
                </div>
                <div class="col-auto my-1">
                <div class="custom-control custom-checkbox mr-sm-2">
                    <input type="checkbox" value="1" ${dadosTurmaAberta.diasDaSemana.indexOf('1') != -1 && 'checked'} class="custom-control-input" id="diaSegunda" name="dia">
                    <label class="custom-control-label" for="diaSegunda">Segunda</label>
                </div>
                </div>
                <div class="col-auto my-1">
                <div class="custom-control custom-checkbox mr-sm-2">
                    <input type="checkbox" value="2" ${dadosTurmaAberta.diasDaSemana.indexOf('2') != -1 && 'checked'} class="custom-control-input" id="diaTerca" name="dia">
                    <label class="custom-control-label" for="diaTerca">Terça</label>
                </div>
                </div>
                <div class="col-auto my-1">
                <div class="custom-control custom-checkbox mr-sm-2">
                    <input type="checkbox" value="3" ${dadosTurmaAberta.diasDaSemana.indexOf('3') != -1 && 'checked'} class="custom-control-input" id="diaQuarta" name="dia">
                    <label class="custom-control-label" for="diaQuarta">Quarta</label>
                </div>
                </div>
                <div class="col-auto my-1">
                <div class="custom-control custom-checkbox mr-sm-2">
                    <input type="checkbox" value="4" ${dadosTurmaAberta.diasDaSemana.indexOf('4') != -1 && 'checked'} class="custom-control-input" id="diaQuinta" name="dia">
                    <label class="custom-control-label" for="diaQuinta">Quinta</label>
                </div>
                </div>
                <div class="col-auto my-1">
                <div class="custom-control custom-checkbox mr-sm-2">
                    <input type="checkbox" value="5" ${dadosTurmaAberta.diasDaSemana.indexOf('5') != -1 && 'checked'} class="custom-control-input" id="diaSexta" name="dia">
                    <label class="custom-control-label" for="diaSexta">Sexta</label>
                </div>
                </div>
                <div class="col-auto my-1">
                <div class="custom-control custom-checkbox mr-sm-2">
                    <input type="checkbox" value="6" ${dadosTurmaAberta.diasDaSemana.indexOf('6') != -1 && 'checked'} class="custom-control-input" id="diaSabado" name="dia">
                    <label class="custom-control-label" for="diaSabado">Sábado</label>
                </div>
                </div>
            </div>
            <div class="container-xl">
                <div class="table-responsive">
                <div class="table-wrapper">
                    <div class="table-title">
                    <div class="row">
                        <div class="col-sm-6">
                        <h2>Escolha os <b>livros</b></h2>
                        </div>
                        
                    </div>
                    </div>
                    <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                        <th>
                            
                        </th>
                        <th>Nome do Livro</th>
                        <th>Código</th>
                        <th>Identificação</th>
                        
                        </tr>
                    </thead>
                    <tbody id="listaLivrosTurma">
                        <tr>
                        <td>
                            <span class="custom-checkbox">
                            <input type="checkbox" id="checkbox1" name="livros" value="1">
                            <label for="checkbox1"></label>
                            </span>
                        </td>
                        <td>Book 1</td>
                        <td>1</td>
                        
                        </tr>
                    </tbody>
                    </table>
                    
                </div>
                </div>
            </div>
            <button class="btn btn-primary btn-block" type="submit">Editar informações</button>
            </form>
        `, `<button data-dismiss="modal" class="btn btn-secondary">Fechar</button>`)

        let codTurmaAdd = document.getElementById('codTurmaAdd')
        let codigoTurmaAtual = turmaAberta

        let codDiasSemana
        let cursosCadastrados
        let livrosCadastrados

        let codCurso
        let horario = dadosTurmaAberta.hora.indexOf('_') == -1 ? dadosTurmaAberta.hora + ':00' : dadosTurmaAberta.hora.split('_')[0] + ':' + dadosTurmaAberta.hora.split('_')[1]
        let dias = []
        let livros = []

        function geraCod() {
            let codTurma = ''
            if (codCurso != undefined) {
                codTurma += codCurso
            }
            for (const i in livros) {
                if (Object.hasOwnProperty.call(livros, i)) {
                    const codLivro = livros[i];
                    codTurma += codLivro
                }
            }
            codTurma += '-'
            for (const i in dias) {
                if (Object.hasOwnProperty.call(dias, i)) {
                    const dia = dias[i];
                    codTurma += dia
                }
            }
            if (horario != undefined) {
                codTurma += horario
            }

            codTurmaAdd.value = codTurma
            console.log(codTurma)
        }

        infoEscolaRef.child('codDiasSemana').on('value', (snapshot) => {
            codDiasSemana = snapshot.val()
            dadosTurmaAberta.diasDaSemana.map((dia) => {
                dias.push(codDiasSemana[Number(dia)])
            })
            
        })

        infoEscolaRef.child('livros').on('value', (snapshot) => {
            let listaLivros = document.getElementById('listaLivrosTurma')
            listaLivros.innerHTML = ''
            livrosCadastrados = snapshot.val()
            for (const i in livrosCadastrados) {
                if (Object.hasOwnProperty.call(livrosCadastrados, i)) {
                    const livro = livrosCadastrados[i];
                    listaLivros.innerHTML += `
                        <tr>
                            <td>
                                <span class="custom-checkbox">
                                    <input type="checkbox" id="checkbox${livro.codSistema}" name="livros" value="${livro.codSistema}" ${dadosTurmaAberta.livros.indexOf(livro.codSistema) != -1 && 'checked'}>
                                    <label for="checkbox${livro.codSistema}"></label>
                                </span>
                            </td>
                            <td>${livro.nomeLivro}</td>
                            <td>${livro.codLivro}</td>
                            <td>${livro.idLivro}</td>
                        </tr>
                    `
                    if (dadosTurmaAberta.livros.indexOf(livro.codSistema) != -1) {
                        livros.push(livrosCadastrados[Number(livro.codSistema)].codLivro)
                    }
                    
                }
            }
            document.getElementsByName('livros').forEach(livro => {
                livro.addEventListener('input', (e) => {
                    if (e.target.checked) {
                        livros.push(livrosCadastrados[Number(e.target.value)].codLivro)
                    } else {
                        livros.splice(livros.indexOf(livrosCadastrados[Number(e.target.value)].codLivro), 1)
                    }
                    geraCod()
                    console.log(livros)
                })
            })
        })

        infoEscolaRef.child('cursos').on('value', (snapshot) => {
            let listaCursos = document.getElementById('listaCursosTurma')
            listaCursos.innerHTML = '<option hidden selected>Escolha um curso...</option>'
            cursosCadastrados = snapshot.val()
            for (const i in cursosCadastrados) {
                if (Object.hasOwnProperty.call(cursosCadastrados, i)) {
                    const curso = cursosCadastrados[i];
                    listaCursos.innerHTML += `
                    <option value="${curso.codSistema}" ${dadosTurmaAberta.curso == curso.codSistema && 'selected'}>${curso.codCurso} - ${curso.nomeCurso}</option>
                    `
                    if (dadosTurmaAberta.curso == curso.codSistema) {
                        codCurso = curso.codCurso
                    }
                }
            }
            
        })

        listaDeProfessores.on('value', (snapshot) => {
            let listaProfessoresTurma = document.getElementById('listaProfessoresTurma')
            for (const key in snapshot.val()) {
                if (Object.hasOwnProperty.call(snapshot.val(), key)) {
                    const professor = snapshot.val()[key];
                    listaProfessoresTurma.innerHTML += `
                    <option value="${professor.nome}|${professor.email}">${professor.nome} (${professor.email})</option>
                    `
                }
            }
        })

       

        document.getElementById('listaCursosTurma').addEventListener('input', (e) => {
            codCurso = cursosCadastrados[e.target.value].codCurso
            geraCod()
            console.log(codCurso)
        })

        document.getElementsByName('dia').forEach(dia => {
            dia.addEventListener('click', (e) => {
                if (e.target.checked) {
                    dias.push(codDiasSemana[Number(e.target.value)])
                } else {
                    dias.splice(dias.indexOf(codDiasSemana[Number(e.target.value)]), 1)
                }
                geraCod()
                console.log(dias)
            })
        });

        

        document.getElementById('horarioTurma').addEventListener('input', (e) => {
            if (e.target.value.split(':')[1] == '00') {
                horario = e.target.value.split(':')[0]
            } else {
                horario = e.target.value.split(':').join('_')
            }
            geraCod()
            console.log(horario)
        })

        document.getElementById('formEditarTurma').addEventListener('submit', async (e) => {
            e.preventDefault()
            const confirm = await ui.confirm('Antes de continuar, certifique se você desconectou todos os professores antes de editar a turma. Você está realizando uma operação sensível. Você confirma a edição das informações da turma?');

            if (confirm) {
                try {
                    loaderRun(true, 'Enviando dados da turma para o servidor...')
                    const dados = new FormData(e.target)
                    
                    let dadosTurma = {}
                    dadosTurma.codTurmaAtual = codigoTurmaAtual
                    dadosTurma.codigoSala = dados.get('codTurmaAdd')
                    dadosTurma.professor = dados.get('listaProfessoresTurma').split('|')[1]
                    console.log(dadosTurma.professor)
                    dadosTurma.diasDaSemana = dados.getAll('dia')
                    if (dadosTurma.diasDaSemana.length == 0) {
                        throw new Error('Por favor, selecione ao menos um dia para as aulas da turma.')
                    }
                    
                    dadosTurma.livros = dados.getAll('livros')
                    if (dadosTurma.livros.length == 0) {
                        throw new Error('Por favor, selecione ao menos um livro.') 
                    }
                    dadosTurma.curso = dados.get('listaCursosTurma')
                    dadosTurma.modalidade = dados.get('modalidade')
                    dadosTurma.horarioTerminoTurma = dados.get('horarioTerminoTurma')
                    if (dados.get('horarioTurma').split(':')[1] == '00') {
                        horario = dados.get('horarioTurma').split(':')[0]
                    } else {
                        horario = dados.get('horarioTurma').split(':').join('_')
                    }
                    dadosTurma.hora = horario
                    
                    var cadastraTurma = firebase.functions().httpsCallable('cadastraTurma')
                    cadastraTurma(dadosTurma).then(function(result) {
                        console.log(result)
                        AstNotif.dialog('Sucesso', result.data.answer)
                        loaderRun()
                        document.getElementById('formEditarTurma').reset()
                    }).catch(function(error) {
                        AstNotif.dialog('Erro', error.message)
                        console.log(error)
                        loaderRun()
                    })
                } catch (error) {
                    AstNotif.dialog('Erro', error.message)
                    loaderRun()
                }
            }
            
            
        })
    }

    function carregaTurmas() {
        loader.style.display = 'block'
        loaderMsg.innerText = 'Carregando informações das turmas...'
        turmasRef.once('value').then(snapshot => {
            selectTurmas.innerHTML = '<option selected hidden>Escolha uma turma...</option>'
            turmas = snapshot.val()
            let selected = false
            for (const cod in turmas) {
                if (Object.hasOwnProperty.call(turmas, cod)) {
                    const infoDaTurma = turmas[cod];
                    if (infoDaTurma.professor == undefined) {
                        var profReferencia = 'Não cadastrado'
                    } else {
                        var profReferencia = infoDaTurma.professor[0].nome
                    }
                    if (turmaAberta != undefined) {
                        selected = 'selected'
                    } else {
                        selected = null
                    }
                    selectTurmas.innerHTML += `<option ${selected} value="${cod}">Turma ${cod} (Prof. ${profReferencia})</option>`
                }
            }
            document.getElementById('selectTurmas').style.visibility = 'visible'
            loaderRun()

        }).catch(error => {
            loaderRun()
            console.error(error)
            AstNotif.dialog('Erro', error.message)
        })


    }

    document.getElementById('btnTransfereAlunosTurma').addEventListener('click', transfereAlunosConfirma)
    function transfereAlunosConfirma() {
        let nomes = ''
        if (alunosSelecionados.length == 0) {
            AstNotif.dialog('Opa', 'Você esqueceu de selecionar alunos. Volte e escolha os alunos que deseja transferir.')
        } else {
            for (const i in alunosSelecionados) {
                if (Object.hasOwnProperty.call(alunosSelecionados, i)) {
                    const matricula = alunosSelecionados[i];
                    console.log(matricula, alunosTurma)
                    try {
                        const aluno = alunosTurma[matricula].nome
                        nomes += formataNumMatricula(matricula) + ': ' + aluno + '<br>'
                    } catch (error) {
                        alunosSelecionados.splice(i, 1)
                    }
                    
                    
                }
            }
            abrirModal('modal', 'Confirmação', 
            `Você selecionou os alunos listados abaixo da turma ${turmaAberta}. <br> ${nomes} <br><b>Você deseja transferi-los para qual turma?</b><br>(Aviso: As notas e todas as informações atuais do aluno nesta turma serão transferidas.)
            <select class="custom-select" id="selectTurmasTransfere">
                <option selected hidden>Escolha uma turma...</option>
            </select>
            `
            , `<button type="button" data-toggle="tooltip" data-placement="top" title="A operação de transferência ficará gravada no sistema para futuras consultas." class="btn btn-info" id="btnTransfereDaTurma">Transferir</button><button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>`
            )
            $(function () {
                $('[data-toggle="tooltip"]').tooltip()
            })
            let btnTransfereDaTurma = document.getElementById('btnTransfereDaTurma')

            btnTransfereDaTurma.addEventListener('click', transfereDaTurma)

            let selectTurmasTransfere = document.getElementById('selectTurmasTransfere')
            for (const cod in turmas) {
                if (Object.hasOwnProperty.call(turmas, cod) && cod != turmaAberta) {
                    const infoDaTurma = turmas[cod];
                    if (infoDaTurma.professor == undefined) {
                        var profReferencia = 'Não cadastrado'
                    } else {
                        var profReferencia = infoDaTurma.professor[0].nome
                    }
                    selectTurmasTransfere.innerHTML += `<option value="${cod}">Turma ${cod} (Prof. ${profReferencia})</option>`
                }
            }
        }
        
        
    }

    function selecionaTodos(source) {
        let checkboxes = document.getElementsByName('alunosTurma');
        for(var i=0, n=checkboxes.length;i<n;i++) {
            if (source.checked) {
                checkboxes[i].checked = false;
                checkboxes[i].click()
            } else {
                checkboxes[i].checked = true;
                checkboxes[i].click()
            }
            
        }
        
    }

    document.getElementById('btnExcluirTurma').addEventListener('click', (e) => {
        excluirTurma()
    })

    function excluirTurma(confirma=false) {
        if (confirma) {
            loader.style.display = 'block'
            loaderMsg.innerText = 'Excluindo turma...'
            let excluiTurma = firebase.functions().httpsCallable('excluiTurma')
            excluiTurma({codTurma: turmaAberta}).then(function(result) {
                AstNotif.dialog('Sucesso', result.data.answer)
                carregaTurmas()
                areaInfoTurma.style.visibility = 'hidden'
                loaderRun()
            }).catch(function(error) {
                AstNotif.dialog('Erro ' + error.code, error.message)
                console.log(error)
                loaderRun()
            })
        } else {
            console.log(alunosTurma)
            if (!alunosTurma) {
                abrirModal('modal', 'Confirmação', 'Você está prestes à excluir uma turma. Ao excluir uma turma, todo o histórico gravado da turma será excluído! Depois de excluída, você poderá criar uma nova turma com o mesmo ID. Esta ação não pode ser revertida. <br><br> <b>Você têm certeza que deseja excluir esta turma?</b>', '<button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button><button type="button" id="btnExcluirConfirma" class="btn btn-danger" data-dismiss="modal">Excluir</button>')
                let btnExcluirConfirma = document.getElementById('btnExcluirConfirma')
                btnExcluirConfirma.addEventListener('click', () => excluirTurma(true))
            } else {
                abrirModal('modal', 'Calma aí', 'Você não pode excluir uma turma com alunos cadastrados nela. Antes de excluir a turma, transfira os alunos para outra turma, ou desative os alunos.', '<button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>')
            } 
        }
    }
    function transfereDaTurma() {
        loader.style.display = 'block'
        loaderMsg.innerText = 'Transferindo alunos...'
        let selectTurmasTransfere = document.getElementById('selectTurmasTransfere')
        let turmaDestino = selectTurmasTransfere.value
        if (turmaAberta == turmaDestino) {
            AstNotif.dialog('Erro', 'Você deve escolher uma turma diferente da atual para transferência dos alunos.')
            loaderRun()
        } else {
            let dados = {alunos: alunosSelecionados, turmaAtual: turmaAberta, turmaParaTransferir: turmaDestino}
            transfereAlunos(dados).then(function(result){
                AstNotif.dialog('Sucesso', result.data.answer)
                loaderRun()
                carregaTurmas()
                $('#modal').modal('hide')
                document.getElementById('listaAlunosDaTurma').innerHTML = ''
                document.getElementById('ulProfCadastrados').innerHTML = ''
            }).catch(function(error){
                AstNotif.dialog('Erro', error.message)
                console.error(error)
                loaderRun()
            })
        }
    }
    var alunos

    function somaNotas(notas) {
        let somatorio = 0
        for (const nomeNota in notas) {
            if (Object.hasOwnProperty.call(notas, nomeNota)) {
                const nota = notas[nomeNota];
                somatorio = somatorio + nota
            }
        }
        return somatorio;
    }


    function carregaListaDeAlunosDaTurma(alunos, filtro='') {
        loaderRun(true, 'Carregando alunos...')
        let listaAlunosTurma = document.getElementById('listaAlunosTurma')
        listaAlunosTurma.innerHTML = ''
        alunosTurma = alunos
        let c = 0
        for (const matricula in alunos) {
            if (Object.hasOwnProperty.call(alunos, matricula)) {
                const aluno = alunos[matricula];
                listaAlunosTurma.innerHTML += `
                <tr>
                    <td>
                    <span class="custom-checkbox">
                        <input type="checkbox" id="checkbox${c}" name="options[]" value="${matricula}">
                        <label for="checkbox${c}"></label>
                    </span>
                    </td>
                    <td>${aluno.nome}</td>
                    <td>${matricula}</td>
                    <td>${aluno.notas == undefined ? '' : somaNotas(aluno.notas)}</td>
                </tr>
                `
            }
            c++
        }
        loaderRun()
        ativaCheckboxes3()
        feather.replace()
        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        })
        escutaCheckboxesAlunosTurma()
        escutaFormAlunosTurma()
        escutaTransfereUmAluno()

        

        turmasRef.child(turmaAberta + '/status').once('value').then(snapshot => {
            let status = snapshot.val()
            let infoTurma = document.getElementById('infoTurma')
            let btnIniciaPeriodo = document.getElementById('btnIniciaPeriodo')
            let btnFechaPeriodo = document.getElementById('btnFechaPeriodo')
            let btnGeraDiario = document.getElementById('btnGeraDiario')
            if (snapshot.exists()) {
                if (status.turma == 'aberta') {
                    infoTurma.style.color = 'green'
                    infoTurma.innerText = 'Turma Aberta'
                    btnIniciaPeriodo.style.visibility = 'visible'
                    btnFechaPeriodo.style.visibility = 'visible'
                    btnIniciaPeriodo.disabled = true
                    btnFechaPeriodo.disabled = false
                    btnFechaPeriodo.addEventListener('click', () => fechaPeriodo())
                    btnGeraDiario.style.visibility = 'visible'
                    btnGeraDiario.disabled = false

                    btnGeraDiario.addEventListener('click', () => geraDiarioClasse())
                } else {
                    btnGeraDiario.style.visibility = 'visible'
                    btnGeraDiario.disabled = true
                    btnIniciaPeriodo.style.visibility = 'hidden'
                    infoTurma.style.color = 'gold'
                    infoTurma.innerText = 'Turma Fechada'
                    btnIniciaPeriodo.style.visibility = 'visible'
                    btnFechaPeriodo.style.visibility = 'visible'
                    btnIniciaPeriodo.disabled = false
                    btnFechaPeriodo.disabled = true
                    btnIniciaPeriodo.addEventListener('click', () => iniciaPeriodo())
                }
            } else {
                btnGeraDiario.style.visibility = 'hidden'
                btnGeraDiario.disabled = true
                btnFechaPeriodo.style.visibility = 'hidden'
                btnIniciaPeriodo.disabled = false
                btnIniciaPeriodo.style.visibility = 'visible'
                infoTurma.innerText = 'Turma'
                infoTurma.style.color = 'black'
                btnIniciaPeriodo.addEventListener('click', () => iniciaPeriodo())
            }
        })
        
    }

    function geraDiarioClasse() {
        let baseUrl = window.location.origin
        console.log(baseUrl)
        window.open(
            baseUrl + `/resources/pdfsProntos/diario.html#diario?${turmaAberta}`,
            'Diário ' + turmaAberta
        )
    }

    let turma
    let aulaEvento 
    async function iniciaPeriodo(confirma=false, inicio='', fim='', horarioTermino='', nomePeriodo='', qtdeAulas='', eventSource) {
        
        console.log(turmas)
        if (confirma) {
            loader.style.display = 'block'
            loaderMsg.innerText = 'Iniciando turma...'
            if (inicio == '' || fim == '' || nomePeriodo == '') {
                AstNotif.dialog('Você esqueceu alguns dados...', 'Por favor preencha todos os dados pedidos para iniciar a turma')
                loaderRun()
            } else {
                turmasRef.child(turmaAberta + '/status').set({turma: 'aberta', qtdeAulas: qtdeAulas, inicio: inicio, fim: fim, nomePeriodo: nomePeriodo, horarioTermino: horarioTermino}).then( async ()=>{
                    console.log(eventSource)
                    await turmasRef.child(turmaAberta + '/aulaEvento').set(eventSource)
                    $('#modal').modal('hide')
                    AstNotif.notify('Sucesso', 'Turma aberta')
                    abreTurma(turmaAberta)
                    loaderRun()
                }).catch(error => {
                    loaderRun()
                    console.log(error)
                    AstNotif.dialog('Erro', error.message)
                })
            }
        } else {
            abrirModal('modal', 'Confirmação de abertura da turma ' + turmaAberta, `
                Atenção. Você está prestes a iniciar as atividades da turma ${turmaAberta}. Ao iniciar a turma, os professores nela cadastrados poderão lançar notas e frequências para os alunos que estão cadastrados na turma.<br>
                <br>
                <b>Escolha uma data de início e um data com o fim previsto deste semestre, bimestre, ano...</b> (Essas datas não farão com que o sistema abra ou feche as turmas automaticamente.)<br><br>
                Nome do período:
                <input type="text" class="form-control" name="nomePeriodo" id="nomePeriodo">
                <small id="cadastrarEntrar" class="form-text text-muted">
                    O nome do período pode ser por exemplo: 1º Semestre, ou 2º Bimestre ...
                </small>
                <br>Data de início das aulas:
                <input type="date" class="form-control" name="dataInicioPeriodo" id="dataInicioPeriodo">
                <br> Data do fim das aulas (coloque 1 dia a mais do fim previsto):
                <input type="date" class="form-control" name="dataFimPeriodo" id="dataFimPeriodo">
                <br> Horário de término da aula:
                <input type="time" class="form-control" name="terminoAula" id="terminoAula">
                <br> Quantidade de aulas ministradas:
                <input type="number" class="form-control" name="qtdeAulas" id="qtdeAulas">
                <br> Cor do evento:
                <input type="color" class="form-control" name="corEvento" id="corEvento" value="#0008FF">
                
                <br> Cor do texto do evento:
                <input type="color" class="form-control" name="corTexto" id="corTexto" value="#FFFFFF">
                
                <br>
                <h4>Calendário da turma</h4>
                <div id="confCalendar"></div>
    
            `, 
            `<button type="button" data-toggle="tooltip" data-placement="top" title="Iniciar atividades da turma no sistema" class="btn btn-primary" id="modalIniciaPeriodo">Iniciar turma</button><button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>`)
        }
        let lastEventSource
        document.getElementById('modalIniciaPeriodo').addEventListener('click', () => {
            iniciaPeriodo(true, document.getElementById('dataInicioPeriodo').value, document.getElementById('dataFimPeriodo').value, document.getElementById('terminoAula').value, document.getElementById('nomePeriodo').value, document.getElementById('qtdeAulas').value, lastEventSource)
        })

        aulaEvento = [

            // your event source
            {
              events: [ // put the array in the `events` property
                
                {
                  title  : `Aula ${turmaAberta}`,
                  startRecur  : '',
                  endRecur    : '',
                  daysOfWeek: turma.diasDaSemana,
                  startTime: `${turma.hora.indexOf(':') == -1 ? turma.hora + ':00' : turma.hora}`,
                  endTime: `${turma.hora.indexOf(':') == -1 ? Number(turma.hora) + 1 + ':00' : Number(turma.hora) + 1}`,
                  groupId: '',
                  
                },
               
              ],
              color: '#0008FF',     // an option!
              textColor: '#FFFFFF',
              id: turmaAberta,
               // an option!
            }
    
            // any other event sources...
    
          ]
          
          
        let horarioComercial = (await infoEscolaRef.child('dadosBasicos/horarioComercial').once('value')).val()
        console.log(horarioComercial)
        let calendarEl = document.getElementById('confCalendar');
        let calendar
        function calendarRender() {
            calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                height: '450px',
                locale: 'pt-br',
                weekNumbers: true,
                dateClick: function(info) {
                  console.log(info)
                },
                selectable: true,
                select: function(info) {
                  console.log(info)
                },
                unselectAuto: false,
                businessHours: horarioComercial,
                
                // businessHours: [ // specify an array instead
                //   {
                //     daysOfWeek: [ 1, 2, 3, 4, 5  ], // Monday, Tuesday, Wednesday
                //     startTime: '08:00', // 8am
                //     endTime: '18:00' // 6pm
                //   },
                //   {
                //     daysOfWeek: [ 6 ], // Saturday
                //     startTime: '10:00', // 10am
                //     endTime: '16:00' // 4pm
                //   }
                // ],
                nowIndicator: true,
                eventSources: aulaEvento,
      
                // customButtons: {
                //   myCustomButton: {
                //       text: 'custom!',
                //       click: function() {
                //         alert('clicked the custom button!');
                //       }
                //     }
                //   },
                  headerToolbar: {
                    left: 'prevYear prev today next nextYear',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay,listYear'
                  }
              });
              calendar.render();
              lastEventSource = calendar.getEventSourceById(turmaAberta).internalEventSource._raw
              return calendar.getEventSourceById(turmaAberta);
        }
        

        document.getElementById('dataInicioPeriodo').addEventListener('change', (e) => {
            let dataInicio = e.target.value
            aulaEvento[0]['events'][0]['startRecur'] = dataInicio
            let aulas = calendarRender()
            calculaQtdeDeAulas(aulas)
        })
        document.getElementById('dataFimPeriodo').addEventListener('change', (e) => {
            let dataFim = e.target.value
            aulaEvento[0]['events'][0]['endRecur'] = dataFim
            let aulas = calendarRender()
            calculaQtdeDeAulas(aulas)
        })
        document.getElementById('terminoAula').addEventListener('change', (e) => {
            let horario = e.target.value.indexOf(':') == -1 ? e.target.value + ':00' : e.target.value

            aulaEvento[0]['events'][0]['endTime'] = horario
            let aulas = calendarRender()
        })

        document.getElementById('corEvento').addEventListener('change', (e) => {
            let cor = e.target.value
            aulaEvento[0]['color'] = cor
            let aulas = calendarRender()
        })

        document.getElementById('corTexto').addEventListener('change', (e) => {
            let cor = e.target.value
            aulaEvento[0]['textColor'] = cor
            let aulas = calendarRender()
        })

        function calculaQtdeDeAulas(aulas) {
            console.log(aulas)
            let qtdeAulas

            let fieldQtdeAulas = document.getElementById('qtdeAulas')
            fieldQtdeAulas.value = qtdeAulas
        }
    }
    
    function fechaPeriodo() {
            loader.style.display = 'block'
            loaderMsg.innerText = 'Recuperando status da turma...'
            turmasRef.child(turmaAberta + '/status').once('value').then(status => {
                console.log(status)
                console.log(status.val())
                abrirModal('modal', 'Confirmação de fechamento da turma ' + turmaAberta, `
                Atenção. Você está prestes a fechar as atividades da turma ${turmaAberta}. <b>Automaticamente, ao fechar a turma, o sistema irá iniciar uma sequência de processos para a geração de boletins, notas, somatórios finais, frequência, desempenho, entre outros processos parecidos.</b> (Esses processos são realizados nos servidores remotos do sistema para maior segurança e integridade dos dados.)<br>
                Confirme os dados de início, fim, e quantidade de aulas dadas do semestre que foram definidos no processo de abertura desse semestre da turma nos campos abaixo:<br><br>
                Nome do período:
                <input type="text" class="form-control" name="nomePeriodo" id="nomePeriodo" value="${status.val().nomePeriodo}">
                <small id="cadastrarEntrar" class="form-text text-muted">
                    O nome do período pode ser por exemplo: 1º Semestre, ou 2º Bimestre ...
                </small>
                <br>
                <b>Altere as datas de início, fim e quantidade de aulas dadas, se necessário:</b><br>
                Início do período:
                <input type="date" class="form-control" name="dataInicioPeriodo" id="dataInicioPeriodo" value="${status.val().inicio}">
                <br> Fim do período:
                <input type="date" class="form-control" name="dataFimPeriodo" id="dataFimPeriodo" value="${status.val().fim}">
                <br> Quantidade de aulas dadas:
                <input type="number" class="form-control" name="qtdeAulasConfirma" id="qtdeAulasConfirma" value="${status.val().qtdeAulas}">
    
                `, 
                `<button type="button" id="btnFechaTurma" class='btn btn-warning'>Fechar Turma</button><button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>`)
                $(function () {
                    $('[data-toggle="popover"]').popover()
                })
    
                document.querySelector('#btnFechaTurma').addEventListener('click', (e) => {
                    e.preventDefault()
                    loaderRun(true, 'Enviando pedido de fechamento de turma ao servidor...')
                    // Aqui começará o fechamento de turmas
                    let nomePeriodo = document.getElementById('nomePeriodo').value
                    let ini = document.getElementById('dataInicioPeriodo').value
                    let fim = document.getElementById('dataFimPeriodo').value
                    let qtdeAulas = document.getElementById('qtdeAulasConfirma').value
    
                    turmasRef.child(turmaAberta + '/status').set({inicio: ini, fim: fim, qtdeAulas: qtdeAulas, turma: 'aberta', nomePeriodo: nomePeriodo}).then(() => {
                        var fechaTurma = firebase.functions().httpsCallable('fechaTurma')
                        fechaTurma(turmaAberta).then(function(result){
                            $('#modal').modal('hide')
                            setTimeout(() => {
                                loaderRun()
                                AstNotif.dialog('Sucesso', result.data.answer)
                                abreTurma(turmaAberta)
                            }, 1000)
                        }).catch(function(error){
                            AstNotif.dialog('Erro', error.message)
                            console.log(error)
                            loaderRun()
                        })
                    }).catch(error => {
                        AstNotif.dialog('Erro', error.message)
                        loaderRun()
                    })
                    
                })
    
                loaderRun()
            }).catch(error => {
                AstNotif.dialog('Erro', error.message)
                console.log(error)
                loaderRun()
            })
    
    
            
    }

    let btnDistribuiNotas = document.getElementById('btnDistribuiNotas')
    btnDistribuiNotas.addEventListener('click', distribuiNotas)

    function distribuiNotas() {
        loader.style.display = 'block'
        loaderMsg.innerText = 'Buscando notas...'
        abrirModal('modal', 'Distribuição de notas da turma ' + turmaAberta, 
                `Distribua os tipos de notas que você aplicará em sala de aula<br>
                <div class="input-group mb-3">
                    <div class="input-group-prepend">
                        <div class="input-group-text">
                        <input type="checkbox" id="checkboxIncluiDesempenho" aria-label="Incluir Pontos do desempenho" onclick="incluirNotasDesempenho('${turmaAberta}', this)">
                         &nbsp;Incluir pontos do desempenho no somatório da distribuição &nbsp;<span data-feather="help-circle" data-toggle="tooltip" data-placement="right" title="Ao marcar esta caixa, o somatório das notas de desempenho (que são definidas pela secretaria) será adicionado automaticamente ao somatório da distribuição de notas desta turma."></span>
                        </div>
                    </div>
                </div>
                
                <button type="button" data-toggle="tooltip" data-placement="top" title="Adicionar nota" class="btn btn-light btn-sm" onclick="addCampoNotaTurma()"><span data-feather="plus-square"></span></button><br>
                <div class="row"><div class="col-2"><label>Nota</label></div><div class="col-2"><label>Valor</label></div></div>
                <section id="camposNotas"></section>
                <br>
                Total: <label id="somaNotasDistribuidas"></label>/100.0
                `
                , `<button type="button" data-toggle="tooltip" data-placement="top" title="Essas serão as notas que você deverá distribuir durante o período. Você pode alterar as distribuição de notas depois." class="btn btn-primary" onclick="defineNotas()">Definir notas</button><button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>`
            )
            feather.replace()
            contadorNotas = 0
            contadorNotasExtras = 0
            notasDistribuidas = {}
            somatorioDistribuidas = 0
            turmasRef.child(turmaAberta + '/notas').once('value').then(snapshot => {
                
                let notas = snapshot.val()
                if (notas != null) {
                    notasDistribuidas = notas
                }
                
                console.log(notas)
                let c = 0
                for (const nomeNota in notas) {
                    if (Object.hasOwnProperty.call(notas, nomeNota)) {
                        const valor = notas[nomeNota];
                        document.getElementById('camposNotas').innerHTML += `
                        <div class="row" id="linha${c}">
                            <div class="col-2" >
                                <input type="text" class="form-control" id="nomeNota${c}" placeholder="EX ${c + 1}" value="${nomeNota}" ${nomeNota == 'Desempenho' ? ('readonly') : ''}>
                            </div>
                            <div class="col-2">
                                <input type="number" id="valorNota${c}" class="form-control" value="${valor}" onkeyup="somaNotasDistribuidas('${c}')" placeholder="15.5" ${nomeNota == 'Desempenho' ? ('readonly') : ''}>
                            </div>
                            <button type="button" id="removedor${c}" class="btn btn-light btn-sm" onclick="somaNotasDistribuidas('${c}', true), document.getElementById('linha${c}').remove(), contadorNotas--"><span data-feather="x-square"></span></button><br>
                        </div>
                        `
                        if (nomeNota == 'Desempenho') {
                            document.getElementById('removedor' + c).remove()
                            document.getElementById('checkboxIncluiDesempenho').checked = true
                        }
                        somaNotasDistribuidas(c)
                        c++
                    }
                }
                contadorNotas = c
                feather.replace()
               
    
                loaderRun()
            }).catch(error => {
                loaderRun()
                AstNotif.dialog('Erro', error.message)
                console.log(error)
            })
            $(function () {
                $('[data-toggle="tooltip"]').tooltip()
            })
            
    }

    



    function escutaTransfereUmAluno() {
        document.getElementsByName('transfereUmAluno').forEach(btn => {
            btn.addEventListener('click', (e) => {
                console.log(e.target)
            })
        })
    }

    function escutaCheckboxesAlunosTurma() {
        let checkboxes = document.getElementsByName('options[]')
        checkboxes.forEach(elem => {
            elem.addEventListener('click', (e) => {
                console.log(e.target.value)
                let matricula = e.target.value
                let index = alunosSelecionados.indexOf(matricula)
                if (index == -1) {
                    alunosSelecionados.push(matricula)
                } else {
                    alunosSelecionados.splice(index, 1)
                }
                console.log(alunosSelecionados)
            })
            
        })
        
    }

    function escutaFormAlunosTurma() {
        document.getElementById('btnTransfereAlunosTurma').addEventListener('submit', (e) => {
            e.preventDefault()
        })
    }

    function verificaAlunosSelecionados() {
        let c = 0
        for (const matricula in alunosSelecionadosTurma) {
            if (Object.hasOwnProperty.call(alunosSelecionadosTurma, matricula)) {
                const nome = alunosSelecionadosTurma[matricula];
                
                if (matricula == 'codTurma') {
                    
                } else if (nome != "") {
                    c++
                }
                console.log(c)
                if (c == 0) {
                    document.getElementById('btnTransfereAlunosTurma').disabled = true
                    document.getElementById('btnDesativaAlunos').disabled = true
                    document.getElementById('selecTodos').checked = false
                } else {
                    document.getElementById('btnTransfereAlunosTurma').disabled = false
                    document.getElementById('btnDesativaAlunos').disabled = false
                }
            }
        }
        
    }

    function abreTurma(cod) {
        loader.style.display = 'block'
        loaderMsg.innerText = 'Abrindo turma...'
        turmaAberta = cod
        turma = turmas[turmaAberta]
        var codigoDaTurmaLabel = document.getElementById('codigoDaTurma')
        var areaInfoTurma = document.getElementById('areaInfoTurma')
        turmasRef.child(cod).on('value', (snapshot) => {
            // TODO: Mostrar na tela as informações da turma
            console.log(snapshot.val())
            let dadosDaTurma = snapshot.val()
            dadosTurmaAberta = dadosDaTurma
            carregaListaDeAlunosDaTurma(dadosDaTurma.alunos)

            codigoDaTurmaLabel.innerText = dadosDaTurma.codigoSala
            areaInfoTurma.style.visibility = 'visible'
            infoEscolaRef.once('value').then(infoEscola => {
                let livros = infoEscola.val().livros
                let codDiasSemana = infoEscola.val().codDiasSemana
                document.getElementById('mostraDiasTurma').innerText = 'Dia(s) de Aula:'
                for (const key in dadosDaTurma.diasDaSemana) {
                    if (Object.hasOwnProperty.call(dadosDaTurma.diasDaSemana, key)) {
                        const dia = dadosDaTurma.diasDaSemana[key];
                        let diasemana
                        switch(Number(dia)) {
                            case 0:
                                diasemana = 'Domingo'
                                break
                            case 1:
                                diasemana = 'Segunda'
                                break
                            case 2: 
                                diasemana = 'Terça'
                                break
                            case 3:
                                diasemana = 'Quarta'
                                break
                            case 4:
                                diasemana = 'Quinta'
                                break
                            case 5:
                                diasemana = 'Sexta'
                                break
                            case 6:
                                diasemana = 'Sábado'
                                break
                            default:
                                diasemana = ''
                                break
                        }
                        document.getElementById('mostraDiasTurma').innerText += ' | ' + diasemana + ' '
                    }
                    
                }

                document.getElementById('mostraLivrosTurma').innerText = 'Livros cadastrados: '
                for (const key in dadosDaTurma.livros) {
                    if (Object.hasOwnProperty.call(dadosDaTurma.livros, key)) {
                        const numLivro = dadosDaTurma.livros[key];
                        document.getElementById('mostraLivrosTurma').innerText += ` | ${livros[numLivro].idLivro} `
                    }
                }
            }).catch(error => {
                AstNotif.dialog('Erro', error.message)
                console.log(error)
            })
            // Mostra dias de aula da turma
            
            document.getElementById('mostraHorarioTurma').innerText = 'Horário de aula: '+ dadosDaTurma.hora + 'h'
            
            

            document.getElementById('timestampTurmaCadastrada').innerText = 'Turma cadastrada em:  ' + new Date(dadosDaTurma.timestamp._seconds * 1000)

            document.getElementById('mostraProfessoresCadastrados').innerHTML = `<button class="btn btn-primary" onclick="modalAddProfTurma('${cod}')"><span data-feather="user-plus"></span> Adicionar professores</button><ul class="items" id="ulProfCadastrados"></ul>`
            for (const key in dadosDaTurma.professor) {
                if (Object.hasOwnProperty.call(dadosDaTurma.professor, key)) {
                    const professor = dadosDaTurma.professor[key];
                    document.getElementById('ulProfCadastrados').innerHTML += `
                        <li class="item-dismissible">${professor.nome} (${professor.email})<span class="close" data-toggle="tooltip" data-placement="top" title="Retirar prof. desta turma?" onclick="retiraProf('${professor.email}', '${professor.nome}', '${dadosDaTurma.codigoSala}')">&times;</span></li>
                    `
                }
            }
            loaderRun()
            feather.replace()

            carregaCalendario()
        })
    }

    document.getElementById('btnDesativaAlunos').addEventListener('click', (e) => {
        desativaAlunos()
    })
    function desativaAlunos(confirma=false) {
        if (confirma) {
            loader.style.display = 'block'
            loaderMsg.innerText = 'Desativando alunos...'
            let nomes = {}
            
            for (const i in alunosSelecionados) {
                if (Object.hasOwnProperty.call(alunosSelecionados, i)) {
                    const matricula = alunosSelecionados[i];
                    try {
                        nomes[formataNumMatricula(matricula)] = alunosTurma[matricula].nome 
                    } catch (error) {
                        alunosSelecionados.splice(i, 1)
                    }
                    
                }
            }
            let ativaDesativaAlunos = firebase.functions().httpsCallable('ativaDesativaAlunos')
            ativaDesativaAlunos({codTurma: turmaAberta, modo: 'desativa', alunos: nomes}).then(function(result){
                loaderRun()
                AstNotif.dialog('Sucesso', result.data.answer)
                $('#modal').modal('hide')
    
            }).catch(function(error){
                AstNotif.dialog('Erro', error.message)
                loaderRun()
            })
        } else {
            if (alunosSelecionados.length == 0) {
                AstNotif.dialog('Opa', 'Você esqueceu de selecionar os alunos para serem desativados. Volte e selecione-os.')
            } else {
                let nomes = ''
                for (const i in alunosSelecionados) {
                    if (Object.hasOwnProperty.call(alunosSelecionados, i)) {
                        const matricula = alunosSelecionados[i];
                        try {
                            nomes += formataNumMatricula(matricula) + ': ' + alunosTurma[matricula].nome + '<br>'
                        } catch (error) {
                            alunosSelecionados.splice(i, 1)
                        }
                        
                    }
                }
        
                abrirModal('modal', 'Confirmação', 
                `Você está prestes à desativar o(s) aluno(s) que você selecionou da turma ${turmaAberta}.
                    <br>
                    ${nomes}
                    <br><br>
                    A desativação de um aluno consiste em desconectar o aluno das turmas e dos professores,
                    mantendo seu cadastro no sistema, porém inativado. Esta ação não apaga nenhum dado, como histórico, notas,
                    e informações cadastrais do aluno. Você poderá consultar alunos desativados na aba de "Alunos Desativados"
                    da secretaria, bem como reativa-los na mesma aba.
        
                    <br><br><b>Você deseja desativar os alunos selecionados?</b>
                `, 
                `<button type="button" id="btnConfirmaDesativaAlunos" data-toggle="tooltip" data-placement="top" title="A operação de desativação de alunos ficará gravada no sistema para futuras consultas." class="btn btn-warning">Sim, Desativar</button>
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>`
                )
                $(function () {
                    $('[data-toggle="tooltip"]').tooltip()
                })
                document.getElementById('btnConfirmaDesativaAlunos').addEventListener('click', (e) => {
                    desativaAlunos(true)
                })
            }
            
        }
    }

    async function carregaCalendario() {
        let calendarioRef = turmasRef.child(turmaAberta).child('aulaEvento');
        let horarioComercial = (await infoEscolaRef.child('dadosBasicos/horarioComercial').once('value')).val()
        console.log(horarioComercial)
        let calendarEl = document.getElementById('calendarioTurma');
        let calendar
        function calendarRender(eventSources) {
            calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                height: '450px',
                locale: 'pt-br',
                weekNumbers: true,
                dateClick: function(info) {
                  console.log(info)
                },
                selectable: true,
                select: function(info) {
                  console.log(info)
                },
                unselectAuto: false,
                businessHours: horarioComercial,
                
                // businessHours: [ // specify an array instead
                //   {
                //     daysOfWeek: [ 1, 2, 3, 4, 5  ], // Monday, Tuesday, Wednesday
                //     startTime: '08:00', // 8am
                //     endTime: '18:00' // 6pm
                //   },
                //   {
                //     daysOfWeek: [ 6 ], // Saturday
                //     startTime: '10:00', // 10am
                //     endTime: '16:00' // 4pm
                //   }
                // ],
                nowIndicator: true,
                eventSources: eventSources,
      
                // customButtons: {
                //   myCustomButton: {
                //       text: 'custom!',
                //       click: function() {
                //         alert('clicked the custom button!');
                //       }
                //     }
                //   },
                  headerToolbar: {
                    left: 'prevYear prev today next nextYear',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay,listYear'
                  }
              });
              calendar.render();
            //   lastEventSource = calendar.getEventSourceById(turmaAberta).internalEventSource._raw
              return calendar.getEventSourceById(turmaAberta);
        }

        calendarioRef.on('value', (snapshot) => {
            let eventSources = snapshot.val()

            calendarRender(eventSources);
        })
    }
}

function retiraProf(email, nome, codSala, confirma=false) {
    if (confirma) {
        loader.style.display = 'block'
        loaderMsg.innerText = 'Removendo professor da turma...'
        document.getElementById('ast-dialog-bg').style.display = 'none'
        turmasRef.child(codSala).child('professor').once('value', (snapshot) => {
            let listaProf = snapshot.val()
            console.log(listaProf)
            for (const key in listaProf) {
                if (Object.hasOwnProperty.call(listaProf, key)) {
                    const professor = listaProf[key];
                    if (professor.email == email) {
                        listaProf.splice(key, 1)
                        console.log(listaProf)
                    }
                }
            }
            turmasRef.child(codSala).child('professor').set(listaProf).then(() => {
                loaderRun()
                AstNotif.notify('Sucesso', 'Professor deletado com sucesso')
            })

        })
    } else {
        AstNotif.dialog('Confirmação', `Você está prestes à retirar o acesso desta turma de ${nome} (${email}). Você confirma esta ação?<br><br> <button type="button" class="btn btn-danger" onclick="retiraProf('${email}', '${nome}', '${codSala}', true)">Sim, confirmo</button>`, {positive: 'Voltar', negative: ''})
    }
}

function modalAddProfTurma(codSala) {
    loader.style.display = 'block'
    loaderMsg.innerText = 'Aguarde...'
    AstNotif.dialog('Adicionar professores nesta turma', `
    Por favor, tenha o cuidado de escolher um(a) professor(a) que ainda não está vinculado na turma atual.
    <div class="input-group prepend">
        <div class="input-group-prepend">
        <label class="input-group-text" for="inputGroupSelect01">Prof.</label>
        </div>
        <select class="custom-select" id="selectAddProfessorTurma" onchange="novoProf(this.value, '${codSala}')">
        <option selected hidden>Escolha o(a) professor(a)...</option>
        
        </select>
    </div>
    `, {positive: 'Voltar', negative: ''})
    listaDeProfessores.once('value', (snapshot) => {
        let listaProf = snapshot.val()
        console.log(listaProf)
        for (const key in listaProf) {
            if (Object.hasOwnProperty.call(listaProf, key)) {
                const professor = listaProf[key];
                document.getElementById('selectAddProfessorTurma').innerHTML += `<option value="${professor.email}">${professor.nome} (${professor.email})</option>`
            }
        }
        loaderRun()
    })
    
}

function novoProf(email, codSala) {
    loader.style.display = 'block'
    loaderMsg.innerText = 'Adicionando professor na turma...'
    document.getElementById('ast-dialog-bg').remove()
    var addNovoProfTurma = firebase.functions().httpsCallable('addNovoProfTurma')
    addNovoProfTurma({emailProf: email, codSala: codSala})
    .then(function(result) {
        console.log(result)
        AstNotif.dialog('Sucesso', result.data.answer)
        loaderRun()
    }).catch(function(error) {
        AstNotif.dialog('Erro', error.message)
        console.log(error)
        loaderRun()
    })
}


function preencheEndereco(numCep) {
    loader.style.display = 'block'
    loaderMsg.innerText = 'Buscando enderenço com o CEP...'
    let enderecoAluno = document.getElementById('enderecoAluno')
    let bairroAluno = document.getElementById('bairroAluno')
    let cidadeAluno = document.getElementById('cidadeAluno')
    let cepAluno = document.getElementById('cepAluno')
    let estadoAluno = document.getElementById('estadoAluno')
    getAddress(numCep).then(function(result){
        if (result.street == undefined) {
            AstNotif.dialog('Erro ao buscar CEP', 'Verifique o CEP digitado e tente novamente.')
        } else {
            enderecoAluno.value = result.street
            bairroAluno.value = result.neighborhood
            cidadeAluno.value = result.city
            estadoAluno.value = result.state
            document.getElementById('numeroAluno').focus()
            AstNotif.toast('Dados de endereço preenchidos com sucesso!')
        }
        loaderRun()
        
    }).catch(function(error){
        AstNotif.dialog('Erro ao buscar CEP', error.message)
        console.log(error)
        loaderRun()
    })
}

function defineNotas() {
    if (somatorioDistribuidas >  100) {
        AstNotif.dialog('Atenção', 'O somatório das notas ultrapassou 100 pontos. Por favor, faça ajustes na distribuição para que não passe de 100 pontos.')
    } else {
        loader.style.display = 'block'
    loaderMsg.innerText = 'Distribuindo notas...'
    turmasRef.child(turmaAberta + '/notas').set(notasDistribuidas).then(() => {
        loaderRun()
        $('#modal').modal('hide')
        AstNotif.notify('Sucesso', 'Notas distribuídas!')
    }).catch(error => {
        loaderRun()
        AstNotif.dialog('Erro', error.message)
        console.log(error)
    })
    }
    
}

function incluirNotasDesempenho(turma=undefined, elementoCheckbox) {
    console.log(elementoCheckbox)
    if (elementoCheckbox.checked) {
        desempenhoRef.once('value').then(snapshot => {
            let notasDesemp = snapshot.val()
            let somatorioDesemp = 0
            for (const nomeNota in notasDesemp) {
                if (Object.hasOwnProperty.call(notasDesemp, nomeNota)) {
                    const valor = notasDesemp[nomeNota];
                    somatorioDesemp += Number(valor)
                }
            }
            addCampoNotaTurma(somatorioDesemp, 'readonly', true) 
        }).catch(error => {
            AstNotif.dialog('Erro', error.message)
            console.log(error)
        })
        
    } else {
        let c = 0
        while (c < contadorNotas) {
            if (document.getElementById('nomeNota' + c).value == 'Desempenho') {
                somaNotasDistribuidas(c, true) 
                document.getElementById('linha' + c).remove() 
                contadorNotas--
                break
            }
            c++
        }
    }
    
    
}

var contadorNotas = 0
var contadorNotasExtras = 0
function addCampoNotaTurma(valorInicial=0, readonly=false, desempenho=false) {
    let camposNotas = document.getElementById('camposNotas')
    document.getElementById('somaNotasDistribuidas').innerText = 0
    
    if (desempenho) {
        let newField = new DOMParser().parseFromString(`
        <div class="row" id="linha${contadorNotas}">
        <div class="col-2" >
            <input type="text" class="form-control" id="nomeNota${contadorNotas}" placeholder="EX ${contadorNotas + 1}" value="Desempenho" readonly>
        </div>
        <div class="col-2">
            <input type="number" id="valorNota${contadorNotas}" class="form-control" onkeyup="somaNotasDistribuidas('${contadorNotas}')" value="${valorInicial}" placeholder="15.5" readonly>
        </div>
    </div>
       `, 'text/html')
        camposNotas.appendChild(newField.body)
        // camposNotas.innerHTML += 
        // `
        // <div class="row" id="linha${contadorNotas}">
        //     <div class="col-2" >
        //         <input type="text" class="form-control" id="nomeNota${contadorNotas}" placeholder="EX ${contadorNotas + 1}" value="Desempenho" readonly>
        //     </div>
        //     <div class="col-2">
        //         <input type="number" id="valorNota${contadorNotas}" class="form-control" onkeyup="somaNotasDistribuidas('${contadorNotas}')" value="${valorInicial}" placeholder="15.5" readonly>
        //     </div>
        // </div>
        // `
        somaNotasDistribuidas(contadorNotas)
        feather.replace()
        contadorNotas++
        
    } else {
       let newField = new DOMParser().parseFromString(`
       <div class="row" id="linha${contadorNotas}">
            <div class="col-2" >
                <input type="text" class="form-control" id="nomeNota${contadorNotas}" placeholder="EX ${contadorNotas + 1}" value="EX ${contadorNotas + 1}" ${readonly}>
            </div>
            <div class="col-2">
                <input type="number" id="valorNota${contadorNotas}" class="form-control" onkeyup="somaNotasDistribuidas('${contadorNotas}')" value="${valorInicial}" placeholder="15.5" ${readonly}>
            </div>
            <button type="button" class="btn btn-light btn-sm" onclick="somaNotasDistribuidas('${contadorNotas}', true), document.getElementById('linha${contadorNotas}').remove(), contadorNotas--"><span data-feather="x-square"></span></button><br>
        </div>
       `, 'text/html')
       camposNotas.appendChild(newField.body)
        
        feather.replace()
        contadorNotas++
    }
}

function somaNotasDistribuidas(id, subtrai=false) {
    let somaNotasDist = document.getElementById('somaNotasDistribuidas')
    if (subtrai) {
        try {
            notasDistribuidas[document.getElementById('nomeNota' + id).value] = null
        } catch (error) {
            console.log(error)
        }
        
    } else {
        notasDistribuidas[document.getElementById('nomeNota' + id).value] = Number(document.getElementById('valorNota' + id).value)
    }
    try {
        somaNotasDist.innerText = 0
        somatorioDistribuidas = 0
        for (const idValor in notasDistribuidas) {
            if (Object.hasOwnProperty.call(notasDistribuidas, idValor)) {
                const valor = notasDistribuidas[idValor];
                somatorioDistribuidas += Number(valor)
                if (somatorioDistribuidas > 100) {
                    somaNotasDist.style.color = 'red'
                } else {
                    somaNotasDist.style.color = 'black'
                }
            }
        }
        somaNotasDist.innerText = somatorioDistribuidas
    } catch (error) {
        console.log(error)
    }
    
}

// Funções do cadastro de alunos
let turmasLocal = {}
function carregaProfsETurmas(preMatricula=false) {
    turmasLocal = {}
    loader.style.display = 'block'
    loaderMsg.innerText = 'Carregando dados de matrícula, de turmas e professores...'
    let turmaAluno = document.getElementById('turmaAluno')
    let matriculaAluno = document.getElementById('matriculaAluno')
    
    infoEscolaRef.once('value').then(infoEscola => {
        turmasRef.once('value').then(snapshot => {
            let diasDaSemana = infoEscola.val().codDiasSemana
            let cursos = infoEscola.val().cursos

            turmaAluno.innerHTML = '<option selected hidden>Escolha uma turma...</option>'
            let turmas = snapshot.val()
            turmasLocal = snapshot.val()
            console.log(turmas)
            for (const cod in turmas) {
                if (Object.hasOwnProperty.call(turmas, cod)) {
                    const infoDaTurma = turmas[cod];
                    turmaAluno.innerHTML += `<option value="${cod},${cursos[infoDaTurma.curso].codSistema}">${cod} \(${cursos[infoDaTurma.curso].nomeCurso})</option>`
                }
            }
            loaderRun()
        }).catch(error => {
            loaderRun()
            console.error(error)
            AstNotif.dialog('Sistema não configurado', 'Parece que o sistema ainda não foi completamente configurado. Se estiver tendo dificuldades, entre em contato com o suporte.')
        })
        document.getElementById('vencimento').innerHTML = '<option selected hidden>Escolha...</option>'
        for (let i = 0; i < 28; i++) {
            let opt = document.createElement('option')
            opt.value = i + 1
            opt.innerHTML = i + 1
            document.getElementById('vencimento').appendChild(opt)                 
        }
    }).catch(error => {
        loaderRun()
        console.error(error)
        AstNotif.dialog('Erro', error.message)
    })
    
    ultimaMatriculaRef.once('value').then(snapshot => {
        matriculaAluno.value = Number(snapshot.val()) + 1
        arrumaNumMatricula({target: matriculaAluno})
    }).catch(error => {
        loaderRun()
        console.log(error)
        AstNotif.dialog('Erro', error.message)
    })

    if (preMatricula) {
        for (const name in preMatricula) {
            if (Object.hasOwnProperty.call(preMatricula, name)) {
                const value = preMatricula[name];
                try {
                    document.getElementById(name).value = value
                } catch (error) {
                    console.log(error)
                }
                
            }
        }
        AstNotif.notify('Matricular aluno', 'Dados da pré-matrícula foram copiados. Escolha uma turma para o aluno e cadastre-o normalmente.', 'agora', {length: 10000})
    }

}

async function mostraProfsAlunoESetaTurma(codTurma, codCursoSistema) {
    if (codTurma != 'Escolha uma turma...') {
        let horaAluno = document.getElementById('horaAluno')
        let nomeProfAluno = document.getElementById('nomeProfAluno')
        let emailProfAluno = document.getElementById('emailProfAluno')
        let planoAluno = document.getElementById('planoAluno')
        horaAluno.value = turmasLocal[codTurma].hora + 'h'
        nomeProfAluno.value = turmasLocal[codTurma].professor[0].nome
        emailProfAluno.value = turmasLocal[codTurma].professor[0].email
        planoAluno.disabled = false
        let curso = await cursosRef.child(codCursoSistema).once('value')
        let planos = curso.val().planos
        planoAluno.innerHTML = '<option hidden>Escolha um plano...</option>'
        for (const key in planos) {
            if (Object.hasOwnProperty.call(planos, key)) {
                const plano = planos[key];
                planoAluno.innerHTML += `
                    <option value='${key}'>${plano.nomePlano}</option>
                `
            }
        }
        configuraContrato(codCursoSistema)
        
    }
    
}

async function configuraContrato(codCursoSistema) {
    let planoAluno = document.getElementById('planoAluno')
    let curso = await cursosRef.child(codCursoSistema).once('value')
    let planos = curso.val().planos
    planoAluno.addEventListener('change', (e) => {
        let planoKey = e.target.value
        let plano = planos[planoKey]
        abrirModal('modal', `Contrato do aluno`, `
        <form id="configuraContratoAluno">
        <h3>Dados do Curso</h3>
            <div class="form-row">
                <div class="form-group col-md-6">
                    <label for="inputEmail4">Nome do curso</label>
                    <input type="text" class="form-control" id="nomeCursoAdd" name="nomeCursoAdd" value="${plano.nomeCursoAdd}" placeholder="Nome do curso (Ex.: Inglês Básico para Adultos)" readonly>
                    <small id="idCursoHElp" class="form-text text-muted">Identificação que aparece nos boletins e nos demais documentos emitidos pelo sistema.</small>
                </div>
                <div class="form-group col-md-6">
                    <label for="exampleInputEmail1">Código</label>
                    <input type="text" required class="form-control" value="${plano.codCursoAdd}" id="codigoCursoAdd" name="codigoCursoAdd" aria-describedby="nomeEscola" placeholder="Código do Curso" readonly>
                    <small id="nomeEscolaHElp" class="form-text text-muted">Código utilizado para formar os códigos automáticos de turma.</small>  
                </div>
            </div>
            <hr>
            <h3>Dados do Plano</h3>
            <small id="idPlano" class="form-text text-muted">Os dados do plano serão utilizados para geração de boletos no momento da matrícula de um aluno. Todos os valores brutos estão em R$ (BRL - Brazilian Real / Real Brasileiro)</small>
            <div class="form-row">
                <div class="form-group col-md-3">
                    <label for="inputEmail4">Nome do Plano *</label>
                    <input type="text" required class="form-control" id="nomePlano" name="nomePlano" placeholder="Nome do plano (Ex.: Promoção Gold)" readonly>
                    <small id="idPlano" class="form-text text-muted">Este nome ajudará a secretaria a identificar mais os planos para realizar as matrículas de novos estudantes.</small>
                </div>
                <div class="form-group col-md-3">
                    <label for="exampleInputEmail1">Valor integral do Curso *</label>
                    <input type="number" required class="form-control" id="valorCurso" name="valorCurso" aria-describedby="valorCurso" placeholder="Valor do curso" readonly>
                    <small id="nomeEscolaHElp" class="form-text text-muted">Valor integral do curso sem descontos.</small>  
                </div>
                <div class="form-group col-md-3">
                    <label for="inputEmail4">Desconto (%)</label>
                    <input type="number" class="form-control" id="descontoPlano" name="descontoPlano" placeholder="Desconto em % (Ex.: 50)" readonly>
                    <small id="idPlano" class="form-text text-muted">Desconto nesse plano do curso em porcentagem com base no valor integral do curso. (Digite apenas números)</small>
                </div>
                <div class="form-group col-md-3">
                    <label for="exampleInputEmail1">Valor do desconto</label>
                    <input type="text" required class="form-control" id="valorDesconto" name="valorDesconto" aria-describedby="nomeEscola" placeholder="Valor do desconto" readonly>
                    <small id="nomeEscolaHElp" class="form-text text-muted">O valor calculado do desconto aplicado.</small>  
                </div>
            </div>
            <div class="form-row">
                <div class="form-group col-md-3">
                    <label for="exampleInputEmail1">Acréscimo (%)</label>
                    <input type="text" class="form-control" id="acrescimoPlano" name="acrescimoPlano" aria-describedby="nomeEscola" placeholder="Desconto em % (Ex.: 5)" readonly>
                    <small id="nomeEscolaHElp" class="form-text text-muted">Acréscimos nesse plano do curso em porcentagem com base no valor integral do curso. (Digite apenas números)</small>  
                </div>
                <div class="form-group col-md-3">
                    <label for="exampleInputEmail1">Valor do Acréscimo</label>
                    <input type="text" required class="form-control" id="valorAcrescimo" name="valorAcrescimo" aria-describedby="nomeEscola" placeholder="Valor do desconto" readonly>
                    <small id="nomeEscolaHElp" class="form-text text-muted">O valor calculado do acréscimo aplicado.</small>  
                </div>
                <div class="form-group col-md-3">
                    
                </div>
                <div class="form-group col-md-3">
                    <label for="inputEmail4">Valor integral final</label>
                    <input type="number" class="form-control" id="valorFinal" name="valorFinal" placeholder="Valor integral final" readonly>
                    <small id="idPlano" class="form-text text-muted" >Valor integral final calculado do curso utilizando-se deste plano no momento da matrícula.</small>
                </div>
            </div>
            <h5>Parcelas</h5>
            <div class="form-row">
                <div class="form-group col-md-4">
                    <label for="inputEmail4">Nº de parcelas*</label>
                    <input type="number" required class="form-control" id="numeroParcelas" name="numeroParcelas" min="1" max="${plano.numeroMaximoParcelasPlano}" placeholder="Nº de parcelas para pagamento">
                    <small id="idPlano" class="form-text text-muted">O número máximo de parcelas deste plano é de ${plano.numeroMaximoParcelasPlano} parcelas</small>
                </div>
                <div class="form-group col-md-5">
                    <label for="exampleFormControlSelect2">Detalhamento de exemplo utilizando-se o máximo de parcelas</label>
                    <select multiple class="form-control" id="detalhamentoParcelas" name="detalhamentoParcelas">
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option>5</option>
                    </select>
                </div>
            </div>
            <h5>Vencimento</h5>
            <div class="form-row">
                <div class="form-group col-md-2">
                    <label for="exampleFormControlSelect2">Escolha um dia:</label>
                    <select class="form-control" id="diasDeVencimento" name="diasDeVencimento">
                        
                    </select>
                    <small id="idPlano" class="form-text text-muted">Escolha o dia de vencimento do boleto/carnê.</small>
                </div>
                <div class="form-group col-md-2">
                    <label for="exampleFormControlSelect2">Dia escolhido:</label>
                    <input class="form-control" type="text" id="vencimentoEscolhido" name="vencimentoEscolhido" placeholder="Dia escolhido..." readonly>
                    <small class="form-text text-muted">Estas informações aparecerão impressas em cada parcela de pagamento.</small>
                </div>
                <div class="form-group col-md-1"></div>
                <div class="form-group col-md-3">
                    <label for="exampleFormControlSelect2">Escolha quando começará o vencimento:</label>
                    <input type="month" required class="form-control" id="ano-mes" name="ano-mes">
                    <small id="idPlano" class="form-text text-muted">Escolha o mês e o ano para iniciar a geração dos boletos.</small>
                </div>
                
            </div>
            <div class="form-row">
                
                <div class="form-group col-md-10">
                    <label for="exampleFormControlSelect2">Informações e Avisos</label>
                    <input class="form-control" type="text" id="descricaoPlano" name="descricaoPlano" placeholder="Informações e Avisos (Ex.: Em caso de atraso no pagamento será cobrado...)" readonly>
                    <small class="form-text text-muted">Dia do vencimento.</small>
                </div>
                    
            </div>
            
          
          <button type="submit" class="btn btn-primary btn-block">Salvar detalhes do plano e continuar com a matrícula</button>
        </form>
        `, `<button class="btn btn-secondary" data-dismiss="modal">Fechar</button>`)

        for (const id in plano) {
            if (Object.hasOwnProperty.call(plano, id)) {
                const value = plano[id];
                console.log(id, value)
                try {
                    value.length != 1 && typeof value == 'object' ? (
                        value.forEach(item => {
                            let opt = document.createElement('option')
                            opt.value = item
                            opt.innerHTML = item
                            document.getElementById(id).appendChild(opt)
                        })
                    ) : document.getElementById(id).value = value 
                } catch (error) {
                    console.log(error)
                }
                
            }
        }
        if (plano.vencimento == "false") {
            for (let i = 0; i < 28; i++) {
                let opt = document.createElement('option')
                opt.value = i + 1
                opt.innerHTML = i + 1
                document.getElementById('diasDeVencimento').appendChild(opt)                 
            }
        }
        escutaForm(planoKey, plano)
    })

    async function escutaForm(planoKey, plano) {

        function addParcela(dadosParcela='') {
            if (dadosParcela == '') {
                document.getElementById('detalhamentoParcelas').innerHTML = ''
            } else {
                document.getElementById('detalhamentoParcelas').innerHTML += `<option>${dadosParcela}</option>`
            }
            
        }

        let configuraContratoAluno = document.getElementById('configuraContratoAluno')
        configuraContratoAluno.addEventListener('change', async (e) => {
            let dadosForm = $("#configuraContratoAluno").serializeArray()
            let formData = new FormData(configuraContratoAluno)
            // Objeto contendo os dados do plano par enviar ao firebase
            let data = {}
            dadosForm.forEach(field => {
                let values = formData.getAll(field.name)
                values.length == 1 ? data[field.name] = values[0] : data[field.name] = values
            })
            data.vencimentoEscolhido = data.diasDeVencimento
            if (Number(data.numeroParcelas) > Number(plano.numeroMaximoParcelasPlano)) {
                AstNotif.dialog('Parcelamento não permitido', 'Este plano permite apenas o parcelamento em até ' + plano.numeroMaximoParcelasPlano + ' parcelas. Para ter um parcelamento maior, tente usar outro plano compatível com sua necessidade, ou solicite ao setor Administrativo/Financeiro para possível mudança de parcelamento deste plano.')
                data.numeroParcelas = ''
            } else if (data.numeroParcelas < plano.quandoAplicar + 1) {
                AstNotif.dialog('Parcelamento não permitido', `O contrato deve possuir pelo menos ${Number(plano.quandoAplicar) + 1} parcelas. Para outros tipos de parcelamento ou pagamento á vista, tente usar outro plano compatível com sua necessidade, ou solicite ao setor Administrativo/Financeiro para possível mudança de parcelamento deste plano.`)
                data.numeroParcelas = ''
            } else {
                try {
                    data.valorDesconto = (Number(data.valorCurso) * (data.descontoPlano/100)).toFixed(2)
                    data.valorAcrescimo = (Number(data.valorCurso) * (data.acrescimoPlano/100)).toFixed(2)
                    data.valorFinal = (Number(data.valorCurso) + (data.valorAcrescimo - data.valorDesconto)).toFixed(2)
                    addParcela()
                    let saldo = data.valorCurso
                    let saldoAcrescimo = data.valorAcrescimo
                    let saldoDesconto = data.valorDesconto
                    let contadorParcelas = data.numeroParcelas
                    let somaParcelas = 0
                    let valorParcelaGlobal = 0
                    for (let parcela = 0; parcela < data.numeroParcelas; parcela++) {
                        let parcelaText
                        if (plano.distribuirAcrescimosEDescontos == 'on') {
                            
                            
                            let acrescimoParcela 
                            let descontoParcela 
                            let valorParcela
                            parcela == 0 ? valorParcelaGlobal = parseFloat(saldo / contadorParcelas).toFixed(2) : null
                            if (parcela >= plano.quandoAplicar) {
                                // parcela == data.quandoAplicar ? saldo = data.valorFinal - somaParcelas : null
                                parcela == plano.quandoAplicar ? valorParcelaGlobal = parseFloat(saldo / contadorParcelas).toFixed(2) : null
                                valorParcela = valorParcelaGlobal
                                acrescimoParcela = (saldoAcrescimo/contadorParcelas).toFixed(2)
                                descontoParcela = (saldoDesconto/contadorParcelas).toFixed(2)
                                // saldo = (Number(saldo) - valorParcela) - Number(acrescimoParcela - descontoParcela)
                            } else {
                                valorParcela = valorParcelaGlobal
                                
                                // saldo = saldo - valorParcela
                                acrescimoParcela = 0
                                descontoParcela = 0
                            }
                            
                            saldoAcrescimo = saldoAcrescimo - acrescimoParcela
                            saldoDesconto = saldoDesconto - descontoParcela
                            
                            plano.quandoAplicar != undefined ? parcelaText = `Parcela ${parcela + 1}: R$${valorParcela} ${acrescimoParcela != 0 || acrescimoParcela != '' ? '+ R$' + acrescimoParcela : ''} ${descontoParcela != 0 || descontoParcela != '' ? '- R$' + descontoParcela : ''} = R$${(Number(valorParcela) + (acrescimoParcela - descontoParcela)).toFixed(2)}` : null
                            somaParcelas += (Number(valorParcela) + (acrescimoParcela - descontoParcela))
                        } else {
                            parcela == 0 ? saldo = data.valorFinal : null
                             parcelaText = `Parcela ${parcela + 1}:  R$${parseFloat(data.valorFinal / data.numeroParcelas).toFixed(2)}`
                            // saldo = saldo - parseFloat(data.valorFinal / data.numeroMaximoParcelasPlano).toFixed(2)
                            somaParcelas += Number(parseFloat(data.valorFinal / data.numeroParcelas))
                        }
                        saldo = (parcela >= plano.quandoAplicar ? data.valorFinal : data.valorCurso) - somaParcelas
                        console.log(saldo)
                        addParcela(parcelaText)
                        // addParcela(`Saldo: R$${saldo}`)
                        contadorParcelas--
                    }
                    addParcela(`Total: R$${somaParcelas.toFixed(2)}`)
    
                } catch (error) {
                    console.log(error)
                }
            }
            

            for (const id in data) {
                if (Object.hasOwnProperty.call(data, id)) {
                    const value = data[id];
                    document.getElementById(id).value = value
                }
            }
        })

        configuraContratoAluno.addEventListener('submit', (e) => {
            e.preventDefault()
            let dadosForm = $("#configuraContratoAluno").serializeArray()
            let formData = new FormData(configuraContratoAluno)
            // Objeto contendo os dados do plano par enviar ao firebase
            let data = {}
            dadosForm.forEach(field => {
                let values = formData.getAll(field.name)
                values.length == 1 ? data[field.name] = values[0] : data[field.name] = values
            })
            sessionStorage.setItem('contratoConfigurado', JSON.stringify(data))
            sessionStorage.setItem('planoOriginal', JSON.stringify(plano))
            $('#modal').modal('hide')
            
        })
    }
}

function setaRespFinan(num) { 
    let nomeResponsavelFinanceiroAluno = document.getElementById('nomeResponsavelFinanceiroAluno')
    let relacaoFinanceiroAluno = document.getElementById('relacaoFinanceiroAluno')
    let numeroComercialFinanceiroAluno = document.getElementById('numeroComercialFinanceiroAluno')
    let numeroCelularFinanceiroAluno = document.getElementById('numeroCelularFinanceiroAluno')
    let rgResponsavelFinan = document.getElementById('rgFinanceiroAluno')
    let cpfFinanceiroAluno = document.getElementById('cpfFinanceiroAluno')  
    nomeResponsavelFinanceiroAluno.value = document.getElementById('nomeResponsavelAluno' + num).value
    relacaoFinanceiroAluno.value = document.getElementById('relacaoAluno' + num).value
    numeroComercialFinanceiroAluno.value = document.getElementById('numeroComercialResponsavel' + num).value
    numeroCelularFinanceiroAluno.value = document.getElementById('numeroCelularResponsavel' + num).value
    rgResponsavelFinan.value = document.getElementById('rgResponsavel' + num).value
    cpfFinanceiroAluno.value = document.getElementById('cpfResponsavel' + num).value

    document.getElementById('emailResponsavelFinanceiro').focus()
}

function setaRespPedag(num) { 
    let nomeResponsavelFinanceiroAluno = document.getElementById('nomeResponsavelPedagogicoAluno')
    let relacaoFinanceiroAluno = document.getElementById('relacaoPedagogicoAluno')
    let numeroComercialFinanceiroAluno = document.getElementById('numeroComercialPedagogicoAluno')
    let numeroCelularFinanceiroAluno = document.getElementById('numeroCelularPedagogicoAluno')
    let rgResponsavelFinan = document.getElementById('rgPedagogicoAluno')
    let cpfFinanceiroAluno = document.getElementById('cpfPedagogicoAluno')  
    nomeResponsavelFinanceiroAluno.value = document.getElementById('nomeResponsavelAluno' + num).value
    relacaoFinanceiroAluno.value = document.getElementById('relacaoAluno' + num).value
    numeroComercialFinanceiroAluno.value = document.getElementById('numeroComercialResponsavel' + num).value
    numeroCelularFinanceiroAluno.value = document.getElementById('numeroCelularResponsavel' + num).value
    rgResponsavelFinan.value = document.getElementById('rgResponsavel' + num).value
    cpfFinanceiroAluno.value = document.getElementById('cpfResponsavel' + num).value

    document.getElementById('emailResponsavelPedagogico').focus()
}

document.getElementById('matriculaAluno').addEventListener('change', arrumaNumMatricula)
function arrumaNumMatricula(e) {
    var input = e.target;
    
    input.value = "00000" + input.value.replace(/\D/g,'');
    input.value = input.value.slice(-5,-1) + input.value.slice(-1);
}


// JS PDF
function criaPDFAluno() {
    const doc = new jsPDF();

    doc.text("Hello, world!", 10, 10);
    doc.save("a4.pdf");
}

let btnCadastraResponsavel = document.getElementById('cadastraResponsavel')
btnCadastraResponsavel.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopImmediatePropagation()
    e.stopPropagation()
    
    cadastrarResponsavel(false)
})

function cadastrarResponsavel(onlyList=true) {
    
    if (!onlyList) {
        abrirModal('modal', 'Cadastrar responsável', `
        <form id="formCadastraResponsavel">
            <label class="h6">Dados do responsável autorizado</label>
            <div class="form-row border border-success rounded">
            
            <div class="form-group col-md-4">
                <label for="inputAddress">Responsável</label>
                <input type="text" class="form-control" id="nome" name="nome" placeholder="Nome" onblur="maiusculo(this)" required>
            </div>
            <div class="form-group col-md-2">
                <label for="inputAddress">Relação</label>
                <br>
                <select class="form-control form-control-md" name="relacao" id="relacao" >
                <option hidden selected>Escolha...</option>
                <option value="Mãe">Mãe</option>
                <option value="Pai">Pai</option>
                <option value="Tia">Tia</option>
                <option value="Tio">Tio</option>
                <option value="Avó">Avó</option>
                <option value="Avô">Avô</option>
                <option value="Responsável">Responsável</option>
                </select>
            </div>
            <div class="form-group col-md-3">
                <label for="inputAddress">Número Celular</label>
                <input type="text" class="form-control" id="celular" name="celular" placeholder="Celular">
            </div>
            <div class="form-group col-md-5">
                <label for="inputPassword4">Email</label>
                <input type="email" class="form-control" id="email" name="email" placeholder="Email" required>
            </div>
            <div class="form-group col-auto">
                <label for="inputEmail4">RG</label>
                <input type="text" class="form-control" id="rg" name="rg" placeholder="RG" required> 
            </div>
            <div class="form-group col-auto">
                <label for="inputPassword4">CPF</label>
                <input type="text" class="form-control" id="cpf" name="cpf" placeholder="CPF" onchange="verificaCPF(this)" required>
                <small id="cpfHelp3" class="form-text text-muted">Digite um CPF válido, existe um algoritmo de validação neste campo.</small>
            </div>
            
                <div class="custom-control custom-checkbox">
                &nbsp;&nbsp;
                    <input type="checkbox" class="custom-control-input" id="pedagogico" name="pedagogico">
                    <label class="custom-control-label" for="pedagogico">Responsável pedagógico</label>
                </div>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" id="financeiro" name="financeiro">
                    <label class="custom-control-label" for="financeiro">Responsável financeiro</label>
                </div>
            </div>
            <br>
            <button type="submit" class="btn btn-primary btn-block">Cadastrar</button>
        </form>
        `, `<button class="btn btn-secondary" data-dismiss="modal">Fechar</button>`) 

        let formCadastraResponsavel = document.getElementById('formCadastraResponsavel')
        formCadastraResponsavel.addEventListener('submit', (e) => {
            let dadosResponsavel = {}
            e.preventDefault();
            let formData = new FormData(formCadastraResponsavel)
            let dadosForm = $('#formCadastraResponsavel').serializeArray();
            dadosForm.forEach(field => {
                let values = formData.getAll(field.name)
                values.length == 1 ? dadosResponsavel[field.name] = values[0] : dadosResponsavel[field.name] = values
                if (field.name == 'pedagogico' || field.name == 'financeiro') {
                    dadosResponsavel[field.name] = true
                }
            })
            console.log(dadosResponsavel)
            let responsaveis = JSON.parse(sessionStorage.getItem('responsaveis'));
            console.log(responsaveis)
            !responsaveis ? responsaveis = [dadosResponsavel] : responsaveis.push(dadosResponsavel);
            sessionStorage.setItem('responsaveis', JSON.stringify(responsaveis));
            $('#modal').modal('hide');
            mostraResponsaveisCadastrados()
        })
    }
    

    

    mostraResponsaveisCadastrados()

    function mostraResponsaveisCadastrados() {
        let responsaveis = JSON.parse(sessionStorage.getItem('responsaveis'));
        let sectionResponsaveis = document.getElementById('responsaveis')
        console.log(responsaveis)
        sectionResponsaveis.innerHTML = ''
        for (const i in responsaveis) {
            if (Object.hasOwnProperty.call(responsaveis, i)) {
                const responsavel = responsaveis[i];
                sectionResponsaveis.innerHTML += `
                <div class="form-row border border-success rounded">
                
                <div class="form-group col-md-4">
                    <label for="inputAddress">Responsável</label>
                    <input type="text" class="form-control" id="nome${i}" name="nome" placeholder="Nome" onblur="maiusculo(this)" disabled>
                </div>
                <div class="form-group col-md-2">
                    <label for="inputAddress">Relação</label>
                    <br>
                    <select class="form-control form-control-md" name="relacao" id="relacao${i}" disabled>
                    <option hidden selected>Escolha...</option>
                    <option value="Mãe">Mãe</option>
                    <option value="Pai">Pai</option>
                    <option value="Tia">Tia</option>
                    <option value="Tio">Tio</option>
                    <option value="Avó">Avó</option>
                    <option value="Avô">Avô</option>
                    <option value="Responsável">Responsável</option>
                    </select>
                </div>
                <div class="form-group col-md-3">
                    <label for="inputAddress">Número Celular</label>
                    <input type="text" class="form-control" id="celular${i}" name="celular" placeholder="Celular" disabled>
                </div>
                <div class="form-group col-auto">
                    <label for="inputAddress">Editar/Apagar</label>
                    <button class="btn btn-primary form-control" name="editaResp" id="editaResp${i}">Editar</button>
                </div>
                <div class="form-group col-md-5">
                    <label for="inputPassword4">Email</label>
                    <input type="email" class="form-control" id="email${i}" name="email" placeholder="Email" disabled>
                </div>
                
                <div class="form-group col-auto">
                    <label for="inputEmail4">RG</label>
                    <input type="text" class="form-control" id="rg${i}" name="rg" placeholder="RG" disabled>
                </div>
                
                <div class="form-group col-auto">
                    <label for="inputPassword4">CPF</label>
                    <input type="text" class="form-control" id="cpf${i}" name="cpf" placeholder="CPF" onchange="verificaCPF(this)" disabled>
                    <small id="cpfHelp3" class="form-text text-muted">Digite um CPF válido, existe um algoritmo de validação neste campo.</small>
                </div>
                <div class="custom-control custom-checkbox">
                    &nbsp;&nbsp;
                        <input type="checkbox" class="custom-control-input" disabled id="pedagogico${i}" name="pedagogico">
                        <label class="custom-control-label" for="pedagogico${i}">Responsável pedagógico</label>
                    </div>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <div class="custom-control custom-checkbox">
                        <input type="checkbox" class="custom-control-input" disabled id="financeiro${i}" name="financeiro">
                        <label class="custom-control-label" for="financeiro${i}">Responsável financeiro</label>
                    </div>
                </div>
                <br>
                `

                for (const id in responsavel) {
                    if (Object.hasOwnProperty.call(responsavel, id)) {
                        const value = responsavel[id];
                        console.log(value)
                        document.getElementById(id + i).value = value
                        if (id == 'pedagogico' || id == 'financeiro') {
                            document.getElementById(id + i).checked = value
                        }
                    }
                }
            }
        }
        escutaEditaResp()
    }

    function escutaEditaResp() {
        document.getElementsByName('editaResp').forEach(elem => {
            elem.addEventListener('click', (e) => {
                let index = e.target.id.split('editaResp')[1];
                editaResp(index);
            })
        })
    }

    function editaResp(i) {
        let responsaveis = JSON.parse(sessionStorage.getItem('responsaveis'));
        let sectionResponsaveis = document.getElementById('responsaveis')
        let responsavel = responsaveis[i]
        abrirModal('modal', 'Editar dados do responsável', `
        <form id="formEditaResp">
            <label class="h6">Dados do responsável autorizado</label>
            <div class="form-row border border-success rounded">
            
            <div class="form-group col-md-4">
                <label for="inputAddress">Responsável</label>
                <input type="text" class="form-control" id="nome" name="nome" placeholder="Nome" onblur="maiusculo(this)" required>
            </div>
            <div class="form-group col-md-2">
                <label for="inputAddress">Relação</label>
                <br>
                <select class="form-control form-control-md" name="relacao" id="relacao" >
                <option hidden selected>Escolha...</option>
                <option value="Mãe">Mãe</option>
                <option value="Pai">Pai</option>
                <option value="Tia">Tia</option>
                <option value="Tio">Tio</option>
                <option value="Avó">Avó</option>
                <option value="Avô">Avô</option>
                <option value="Responsável">Responsável</option>
                </select>
            </div>
            <div class="form-group col-md-3">
                <label for="inputAddress">Número Celular</label>
                <input type="text" class="form-control" id="celular" name="celular" placeholder="Celular">
            </div>
            <div class="form-group col-md-5">
                <label for="inputPassword4">Email</label>
                <input type="email" class="form-control" id="email" name="email" placeholder="Email" required>
            </div>
            <div class="form-group col-auto">
                <label for="inputEmail4">RG</label>
                <input type="text" class="form-control" id="rg" name="rg" placeholder="RG" required>
            </div>
            <div class="form-group col-auto">
                <label for="inputPassword4">CPF</label>
                <input type="text" class="form-control" id="cpf" name="cpf" placeholder="CPF" onchange="verificaCPF(this)" required>
                <small id="cpfHelp3" class="form-text text-muted">Digite um CPF válido, existe um algoritmo de validação neste campo.</small>
            </div>
            
                <div class="custom-control custom-checkbox">
                &nbsp;&nbsp;
                    <input type="checkbox" class="custom-control-input" id="pedagogico" name="pedagogico">
                    <label class="custom-control-label" for="pedagogico">Responsável pedagógico</label>
                </div>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" id="financeiro" name="financeiro">
                    <label class="custom-control-label" for="financeiro">Responsável financeiro</label>
                </div>
            </div>
            <br>
            <button type="submit" class="btn btn-primary btn-block">Salvar</button>
        </form>
        `, `<button class="btn btn-secondary" data-dismiss="modal">Fechar</button>`)

        for (const field in responsavel) {
            if (Object.hasOwnProperty.call(responsavel, field)) {
                const value = responsavel[field];
                document.getElementById(field).value = value;
                if (field == 'pedagogico' || field == 'financeiro') {
                    document.getElementById(field).checked = true
                }
                
            }
        }

        let formEditaResp = document.getElementById('formEditaResp')
        formEditaResp.addEventListener('submit', (e) => {
            e.preventDefault();
            let dadosResponsavel = {}
            
            let formData = new FormData(formEditaResp)
            let dadosForm = $('#formEditaResp').serializeArray();
            dadosForm.forEach(field => {
                let values = formData.getAll(field.name)
                values.length == 1 ? dadosResponsavel[field.name] = values[0] : dadosResponsavel[field.name] = values
                if (field.name == 'pedagogico' || field.name == 'financeiro') {
                    dadosResponsavel[field.name] = true
                }
            })
            responsaveis[i] = dadosResponsavel
            
            sessionStorage.setItem('responsaveis', JSON.stringify(responsaveis));
            $('#modal').modal('hide');
            mostraResponsaveisCadastrados()
        })
    }
}

// Esperando o submit para o cadastro efetivo
var idadeAluno
var matriculaPDF = ''
let formCadastroAluno = document.querySelector('#formCadastroAluno')
formCadastroAluno.addEventListener('submit', async (e) => {
    e.preventDefault()
    e.stopPropagation();
    loader.style.display = 'block'
    loaderMsg.innerText = 'Processando dados...'
    var dadosAluno = {}
    let dadosForm = $("#formCadastroAluno").serializeArray()
    let formData = new FormData(formCadastroAluno)
    // Objeto contendo os dados do plano par enviar ao firebase
    dadosForm.forEach(field => {
        let values = formData.getAll(field.name)
        values.length == 1 ? dadosAluno[field.name] = values[0] : dadosAluno[field.name] = values
    })
    
    dadosAluno.codCurso = dadosAluno.turmaAluno.split(',')[1]
    dadosAluno.turmaAluno = dadosAluno.turmaAluno.split(',')[0]
    
    function emailRegularExpression(email) {
        var re = /\S+@\S+\.\S+/
        return re.test(email)
    }

    let contratoConfigurado = JSON.parse(sessionStorage.getItem('contratoConfigurado'))
    let planoOriginal = JSON.parse(sessionStorage.getItem('planoOriginal'))
    let responsaveis = JSON.parse(sessionStorage.getItem('responsaveis'))
    console.log(responsaveis)
    dadosAluno.responsaveis = responsaveis
    

    console.log(dadosAluno)
    if (dadosAluno.tipoMatricula == 'matricula') {
        if (dadosAluno.dataNascimentoAluno == '' || dadosAluno.nomeAluno == '') {
            AstNotif.dialog('Confira os campos', 'A data de nascimento do aluno e o nome do aluno são obrigatórios.')
            loaderRun()
        } else if((!responsaveis || responsaveis.length == 0)&& idadeAluno != undefined && idadeAluno.years < 18) {
            AstNotif.dialog('Confira os campos', 'O aluno é menor de idade. É obrigatório adicionar pelo menos um responsável para o aluno.')
            loaderRun()
        } else if ((dadosAluno.emailAluno == '' || emailRegularExpression(dadosAluno.emailAluno) == false) && dadosAluno.tipoMatricula == 'matricula') {
            AstNotif.dialog('Confira o email do aluno', 'O email do aluno é obrigatório. Confira se foi escrito corretamente.')
            loaderRun()
        } else if ((dadosAluno.cpfAluno == '' || dadosAluno.rgAluno == '') && idadeAluno.years >= 18) {
            AstNotif.dialog('Confira os campos', 'Os dados de RG e CPF do aluno não podem estar em branco.')
            loaderRun()
        } else if (dadosAluno.turmaAluno == 'Escolha uma turma...' && dadosAluno.tipoMatricula == 'matricula') {
            AstNotif.dialog('Confira os campos', 'É obrigatório matricular o aluno em uma turma. Se você deseja fazer pré-matricula, vá até o início deste formulário e marque a opção de Pré-matricula.')
            loaderRun()
        } else {
            loaderMsg.innerText = 'Enviando dados para o servidor...'
            let codPreMatricula = sessionStorage.getItem('preMatricula')
            let cadastraAluno = firebase.functions().httpsCallable('cadastraAluno')
            cadastraAluno({dados: dadosAluno, contratoConfigurado: contratoConfigurado, planoOriginal: planoOriginal, preMatricula: codPreMatricula}).then(function(result) {
                sessionStorage.removeItem('contratoConfigurado')
                sessionStorage.removeItem('planoOriginal')
                sessionStorage.removeItem('responsaveis')
                sessionStorage.removeItem('preMatricula')
                loaderRun()
                console.log(result.data)
                AstNotif.notify('Sucesso', result.data.answer, 'agora', {length: 15000})
                
                if (dadosAluno.geraBoleto == 'on') {
                    boleto('geraBoletos', dadosAluno.matriculaAluno, result.data.codContrato)
                }
                if (dadosAluno.geraPDFAluno == 'on') {
                    gerarFichaAluno(dadosAluno.matriculaAluno)
                }
                
                document.getElementById('resetForm').style.visibility = 'visible'
                document.getElementById('resetForm').click()
                carregaProfsETurmas()
            }).catch(function(error) {
                AstNotif.dialog('Erro', error.message)
                console.log(error)
                loaderRun()
            })
        }
    } else {
        loaderMsg.innerText = 'Enviando dados para o servidor...'
        let cadastraAluno = firebase.functions().httpsCallable('cadastraAluno')
        cadastraAluno({dados: dadosAluno, contratoConfigurado: contratoConfigurado, planoOriginal: planoOriginal}).then(function(result) {
            sessionStorage.removeItem('contratoConfigurado')
            sessionStorage.removeItem('planoOriginal')
            sessionStorage.removeItem('responsaveis')
            loaderRun()
            console.log(result.data)
            AstNotif.notify('Sucesso', result.data.answer, 'agora', {length: 15000})
            
            if (dadosAluno.geraBoleto == 'on') {
                boleto('geraBoletos', dadosAluno.matriculaAluno, result.data.codContrato)
            }
            if (dadosAluno.geraPDFAluno == 'on') {
                gerarFichaAluno(dadosAluno.matriculaAluno)
            }
            
            document.getElementById('resetForm').style.visibility = 'visible'
            document.getElementById('resetForm').click()
            carregaProfsETurmas()
        }).catch(function(error) {
            AstNotif.dialog('Erro', error.message)
            console.log(error)
            loaderRun()
        })
    }
    
    
    
})

function boleto(tipo, matricula, codContrato) {
    abrirModal('modal', 'Boleto(s) de pagamento', `
        <iframe src="../resources/pdfsProntos/modeloBoleto.html#${tipo}?${matricula}?${codContrato}" frameborder="0" width="100%" height="400px" id="boletoPdf" name="boletoPdf"></iframe>
    `, `<button type="button" class="btn btn-primary" onclick="window.frames['boletoPdf'].focus(), window.frames['boletoPdf'].print()">Imprimir</button>
    <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`)
}

var diaAtualServidor
function calculaIdade(dataNasc) {
    idadeAluno = 0
    loader.style.display = 'block'
    loaderMsg.innerText = 'Buscando data atual do servidor...'
    console.log(dataNasc)

    
        calcularIdadePrecisa(dataNasc).then(function(idade){
            idadeAluno = idade
            console.log(idadeAluno)
            if (idadeAluno.years < 18) {
                cadastrarResponsavel(false)
            }
            document.getElementById('idadeCalculada').innerText = `Idade: ${idadeAluno.years} ano(s), ${idadeAluno.months} mes(es), ${idadeAluno.days} dia(s)`
            loaderRun()
        }).catch(function(error){
            console.log(error)
        })
        
}

// Drag and Drop
function dragDropCadastroAluno() {
    let dropArea = document.getElementById('drop-area')

;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false)
  })

function preventDefaults(e) {
    e.preventDefault()
    e.stopPropagation()
}

;['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false)
  })
  
  ;['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false)
  })
  
  function highlight(e) {
    dropArea.classList.add('highlight')
  }
  
  function unhighlight(e) {
    dropArea.classList.remove('highlight')
  }
  function handleDrop(e) {
    console.log(e)
    let dt = e.target
    let dataTransfer = e.dataTransfer
    let files = dt.files
    files == undefined ? files = dataTransfer.files : null
    console.log(files)

    let matriculaAluno = document.getElementById('matriculaAluno').value
        if (matriculaAluno != '') {
            let metadados = []
            abrirModal('modal', 'Arquivos da matrícula ' + matriculaAluno, `
            <label class="h6">Arquivos que você selecionou</label>
                <div class="block-list block-list-3" id="mostraArquivosSelecionados">
                    
                </div>
            `, '<button type="button" id="enviarArquivosCadastro" class="btn btn-primary">Enviar Arquivos</button> <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>')
            let mostraArquivos = document.getElementById('mostraArquivosSelecionados')
            let c = 0
            for (const i in files) {
                if (Object.hasOwnProperty.call(files, i)) {
                    const file = files[i];
                    console.log(file)
                    let cpf = ''
                    let endereco = ''
                    let outros = ''
                    if (file.name.indexOf('cpf') != -1 || file.name.indexOf('identidade') != -1 || file.name.indexOf('CPF') != -1 || file.name.indexOf('Identidade') != -1 || file.name.indexOf('IDENTIDADE') != -1 || file.name.indexOf('Cpf') != -1) {
                        cpf = 'checked'
                        metadados[i] = 'cpf'
                    } else if (file.name.indexOf('endereço') != -1 || file.name.indexOf('endereco') != -1 || file.name.indexOf('residência') != -1 || file.name.indexOf('residencia') != -1 || file.name.indexOf('Endereco') != -1 || file.name.indexOf('Endereço') != -1 || file.name.indexOf('ENDERECO') != -1 || file.name.indexOf('ENDEREÇO') != -1 || file.name.indexOf('RESIDENCIA') != -1 || file.name.indexOf('RESIDÊNCIA') != -1 || file.name.indexOf('Residência') != -1 || file.name.indexOf('Residencia') != -1) {
                        endereco = 'checked'
                        metadados[i] = 'endereco'
                    } else {
                        outros = 'checked'
                        metadados[i] = 'outros'
                    }
        
                    mostraArquivos.innerHTML += `
                    <div class="block-list__item">
                        ${Number(i) + 1}<br>
                        <label class="h6">${file.name}</label>
                        <br>
                        <b>Tamanho:</b> ${formatBytes(file.size)}
                        <br>
                        <b>Qual arquivo é este?</b>
                        <br><input type="radio" ${cpf} name="tipo${i}" value="${i}|cpf" id="cpfIdentidade${i}"> Identidade e CPF
                        <br><input type="radio" ${endereco} name="tipo${i}" value="${i}|endereco" id="endereco${i}"> Comprovante de endereço
                        <br><input type="radio" name="tipo${i}" value="${i}|foto3x4" id="foto3x4${i}"> Foto 3x4 do aluno
                        <br><input type="radio" ${outros} name="tipo${i}" value="${i}|outros" id="outros${i}"> Outros
                    </div>
                    `
                    c++
                    
                }
            }
            let c2 = 0
            while (c2 < c) {
                document.getElementsByName('tipo' + c2).forEach(element => {
                    element.addEventListener('change', (e) => {
                        if (e.target.checked == true) {
                            metadados[e.target.value.split('|')[0]] = e.target.value.split('|')[1]
                            console.log(metadados)
                        }
                    })
                });
                c2++
            }
            
            document.getElementById('enviarArquivosCadastro').addEventListener('click', async function(e) {
                for (const i in files) {
                    if (Object.hasOwnProperty.call(files, i)) {
                        const file = files[i];
                        let metadata = {
                            customMetadata: {
                                tipo: metadados[i]
                            }
                        }
                        let path = 'alunos/' + matriculaAluno + '/arquivos/'
                        let pathDatabase = false
                        if (metadados[i] == 'foto3x4') {
                            pathDatabase = 'sistemaEscolar/alunos/' + matriculaAluno + '/fotoAluno'
                        }
                        uploadFile(file, metadata, path, pathDatabase)
                        
                    }
                }
            }) 
        } else {
            AstNotif.dialog('Calma aí!', 'Você tem que definir o número de matricula do aluno para que o sistema saiba onde guardar os arquivos dele. Caso queira obter um novo número de matrícula, clique no botão no início do formulário de cadastro do aluno.')
        }
    }
dropArea.addEventListener('drop', handleDrop, false)
document.getElementById('fileElemCadastroAluno').addEventListener('change', handleDrop)
console.log('sim')
}

function dragDropJaCadastrado() {
    let dropArea = document.getElementById('drop-area-ja-cadastrado')

;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false)
  })

function preventDefaults(e) {
    e.preventDefault()
    e.stopPropagation()
}

;['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false)
  })
  
  ;['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false)
  })
  
  function highlight(e) {
    dropArea.classList.add('highlight')
  }
  
  function unhighlight(e) {
    dropArea.classList.remove('highlight')
  }
  function handleDrop(e) {
    console.log(e)
    let dt = e.target
    let dataTransfer = e.dataTransfer
    let files = dt.files
    files == undefined ? files = dataTransfer.files : null
    console.log(files)

    let matriculaAluno = document.getElementById('mostraMatriculaAluno').innerText
        if (matriculaAluno != '') {
            let metadados = []
            abrirModal('modal', 'Arquivos da matrícula ' + matriculaAluno, `
            <label class="h6">Arquivos que você selecionou</label>
                <div class="block-list block-list-3" id="mostraArquivosSelecionados">
                    
                </div>
            `, '<button type="button" id="enviarArquivosCadastro" class="btn btn-primary">Enviar Arquivos</button> <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>')
            let mostraArquivos = document.getElementById('mostraArquivosSelecionados')
            let c = 0
            for (const i in files) {
                if (Object.hasOwnProperty.call(files, i)) {
                    const file = files[i];
                    console.log(file)
                    let cpf = ''
                    let endereco = ''
                    let outros = ''
                    if (file.name.indexOf('cpf') != -1 || file.name.indexOf('identidade') != -1 || file.name.indexOf('CPF') != -1 || file.name.indexOf('Identidade') != -1 || file.name.indexOf('IDENTIDADE') != -1 || file.name.indexOf('Cpf') != -1) {
                        cpf = 'checked'
                        metadados[i] = 'cpf'
                    } else if (file.name.indexOf('endereço') != -1 || file.name.indexOf('endereco') != -1 || file.name.indexOf('residência') != -1 || file.name.indexOf('residencia') != -1 || file.name.indexOf('Endereco') != -1 || file.name.indexOf('Endereço') != -1 || file.name.indexOf('ENDERECO') != -1 || file.name.indexOf('ENDEREÇO') != -1 || file.name.indexOf('RESIDENCIA') != -1 || file.name.indexOf('RESIDÊNCIA') != -1 || file.name.indexOf('Residência') != -1 || file.name.indexOf('Residencia') != -1) {
                        endereco = 'checked'
                        metadados[i] = 'endereco'
                    } else {
                        outros = 'checked'
                        metadados[i] = 'outros'
                    }
        
                    mostraArquivos.innerHTML += `
                    <div class="block-list__item">
                    ${Number(i) + 1}<br>
                    <label class="h6">${file.name}</label>
                    <br>
                    <b>Tamanho:</b> ${formatBytes(file.size)}
                    <br>
                    <b>Qual arquivo é este?</b>
                    <br><input type="radio" ${cpf} name="tipo${i}" value="${i}|cpf" id="cpfIdentidade${i}"> Identidade e CPF
                    <br><input type="radio" ${endereco} name="tipo${i}" value="${i}|endereco" id="endereco${i}"> Comprovante de endereço
                    <br><input type="radio" name="tipo${i}" value="${i}|foto3x4" id="foto3x4${i}"> Foto 3x4 do aluno
                    <br><input type="radio" ${outros} name="tipo${i}" value="${i}|outros" id="outros${i}"> Outros
                    </div>
                    `
                    c++
                    
                }
            }
            let c2 = 0
            while (c2 < c) {
                document.getElementsByName('tipo' + c2).forEach(element => {
                    element.addEventListener('change', (e) => {
                        if (e.target.checked == true) {
                            metadados[e.target.value.split('|')[0]] = e.target.value.split('|')[1]
                            console.log(metadados)
                        }
                    })
                });
                c2++
            }
            
            document.getElementById('enviarArquivosCadastro').addEventListener('click', async function(e) {
                for (const i in files) {
                    if (Object.hasOwnProperty.call(files, i)) {
                        const file = files[i];
                        let metadata = {
                            customMetadata: {
                                tipo: metadados[i]
                            }
                        }
                        let path = 'alunos/' + matriculaAluno + '/arquivos/'
                        let pathDatabase = 'sistemaEscolar/alunos/' + matriculaAluno + '/fotoAluno'
                        uploadFile(file, metadata, path, pathDatabase)
                        
                    }
                }
            }) 
        } else {
            AstNotif.dialog('Calma aí!', 'Você não acessou um aluno ainda. Acesse o cadastro de um aluno no sistema para que seja possíve fazer o uplodar de arquivos para um aluno cadastrado no sistema.')
        }
    }
dropArea.addEventListener('drop', handleDrop, false)
document.getElementById('fileElemJaCadastrado').addEventListener('change', handleDrop)
console.log('SIM')
}



function uploadFile(file, metadata, path, database=false) {
    console.log(file)
    console.log(metadata)
    loaderRun(true, 'Enviando arquivo')
    /* Exemplo de como se usa metadados customizados apenas para referência
    let metadata = {
        customMetadata: {
            'email': usuario.email
        }
    } */
    var uploadTask = firebase.storage().ref('sistemaEscolar/' + path).child(file.name.split('.')[0]).put(file, metadata)
        // Listen for state changes, errors, and completion of the upload.
    return uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
    function(snapshot) {
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    var progress = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(2);
    console.log('Upload is ' + progress + '% done');
    switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED: // or 'paused'
        console.log('Upload is paused');
        break;
        case firebase.storage.TaskState.RUNNING: // or 'running'
        console.log('Upload is running');
        break;
    }
    }, function(error) {

    // A full list of error codes is available at
    // https://firebase.google.com/docs/storage/web/handle-errors
    switch (error.code) {
    case 'storage/unauthorized':
        // User doesn't have permission to access the object
        AstNotif.dialog('Erro', 'Você não tem permissões para fazer alterações no caminho que está tentando.')
        break;

    case 'storage/canceled':
        // User canceled the upload
        AstNotif.dialog('Upload Cancelado', 'Upload Cancelado.')
        break;


    case 'storage/unknown':
        // Unknown error occurred, inspect error.serverResponse
        AstNotif.dialog('Erro', error.message)
        break;
    }
    }, function() {
    // Upload completed successfully, now we can get the download URL
    uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
        console.log('File available at', downloadURL);
        
        $('#modal').modal('hide')
        if (database != false) {
            firebase.database().ref(database).set(downloadURL).then(() => {
                console.log('Foto atualizada com sucesso')
                loaderRun(false)
                AstNotif.notify("Sucesso", 'Arquivo "' + file.name +  '" enviado aos servidores com sucesso', "<i>agora</i>", {'length': 90000})
            })
        }
    });
        

        
    
    });
}

//Funções da aba Alunos
var tipoDeBusca = 'nomeAluno'
function alteraTipoDeBusca(tipo) {
    tipoDeBusca = tipo
}

function desativarAlunos(confirma=false, codTurma, matricula, nome) {
    if (confirma) {
        let nomesObj = {}
        nomesObj[matricula] = nome
        loaderRun(true, 'Desativando alunos...')
        let ativaDesativaAlunos = firebase.functions().httpsCallable('ativaDesativaAlunos')
        ativaDesativaAlunos({codTurma: codTurma, modo: 'desativa', alunos: nomesObj}).then(function(result){
            loaderRun()
            AstNotif.dialog('Sucesso', result.data.answer)
            $('#modal').modal('hide')

        }).catch(function(error){
            AstNotif.dialog('Erro', error.message)
            loaderRun()
        })
    } else {
        abrirModal('modal', 'Confirmação de desativação do aluno', `
                Você confirma a ação de desativação do(s) aluno(s) escolhido(s)?
                <br><br>
                Esta ação ficará salva no histórico de operações do aluno e da turma para futuras consultas.
        `, `<button type="button" data-toggle="tooltip" data-placement="top" title="Desativar agora" class="btn btn-warning" onclick="desativarAlunos(true, '${codTurma}', '${matricula}', '${nome}')">Desativar</button><button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>`)
        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        })
    }
    
}

function editarDadosAluno(matricula) {
    let aluno = alunos[matricula]

    abrirModal('modal', 'Ver e Editar dados de ' + aluno.nomeAluno, `
    <form id="formEditaAluno" onkeydown="return event.key != 'Enter';">
        <label class="h6">Dados pessoais</label>
        <div class="form-row">
        <div class="form-group col-sm-2">
            <label for="inputEmail4">Matrícula</label>
            <input type="number" class="form-control" id="matriculaAluno" name="matriculaAluno" placeholder="Número de matrícula" required readonly>
        </div>
        <div class="form-group col-md-4">
            <label for="inputPassword4">Nome</label>
            <input type="name" class="form-control" id="nomeAluno" name="nomeAluno" placeholder="Nome" onblur="maiusculo(this)" required>
        </div>
        <div class="form-group col-auto">
            <label for="inputPassword4">Data de nascimento</label>
            <input type="date" class="form-control" id="dataNascimentoAluno" name="dataNascimentoAluno" placeholder="Data" onblur="calculaIdade(this.value)" required>
            
        </div>
        <div class="form-group col-auto">
            <br><br>
            <label for="dataNascimentoAluno" class="text-muted" id="idadeCalculada">Idade:</label>
        </div>
        </div>
        <div class="form-row">
        <div class="form-group col-auto">
            <label for="inputEmail4">Telefone (fixo)</label>
            <input type="phone" onkeypress="$(this).mask('(00) 0000-00009')" class="form-control" id="telefoneAluno" name="telefoneAluno" placeholder="Número">
        </div>
        
        <div class="form-group col-auto">
            <label for="inputPassword4">Celular</label>
            <input type="phone" class="form-control" id="celularAluno" name="celularAluno" placeholder="Número" onkeypress="$(this).mask('00000000009')" required>
            <small id="senhaHelp" class="form-text text-muted">Digite o DDD seguido do número (Ex.: 31999999999)</small>
        </div>
        
        <div class="form-group col-md-5">
            <label for="inputPassword4">Email</label>
            <input type="email" class="form-control" id="emailAluno" name="emailAluno" placeholder="Email" required>
        </div>
        </div>
        <div class="form-row">
        <div class="form-group col-md-3">
            <label for="inputEmail4">Senha de acesso ao portal</label>
            <div class="input-group mb-3">
            <div class="input-group-prepend">
                <div class="input-group-text">
                <input type="checkbox" aria-label="Mostra e esconde a senha" onclick="this.checked ? (document.getElementById('senhaAluno').type = 'text'):(document.getElementById('senhaAluno').type = 'password')">
                </div>
            </div>
            <input type="password" class="form-control" id="senhaAluno" name="senhaAluno" placeholder="Senha" required>
            </div>
            <small id="senhaHelp" class="form-text text-muted">A senha precisa ter no mínimo 6 caracteres.</small>
        </div>
        <div class="form-group col-auto">
            <label for="inputEmail4">RG</label>
            <input type="text" class="form-control" id="rgAluno" name="rgAluno" placeholder="RG" required>
        </div>
        <div class="form-group col-auto">
            <label for="inputPassword4">CPF</label>
            <input type="text" class="form-control" id="cpfAluno" name="cpfAluno" placeholder="CPF" onchange="verificaCPF(this)" required>
            <small id="cpfHelp" class="form-text text-muted">Digite um CPF válido, existe um algoritmo de validação neste campo.</small>
        </div>
        </div>
        <hr>
        <label class="h6">Dados de endereço</label>
        <div class="form-row col-md-4">
        <label for="inputZip">CEP (somente números)</label>
        <input type="text" class="form-control" id="cepAluno" name="cepAluno" placeholder="CEP" onchange="preencheEndereco(this.value)" onkeypress="$(this).mask('00.000-000')">
        <small id="emailHelp" class="form-text text-muted">O CEP é opcional, mas quando inserido preenche o endereço automaticamente.</small>
        </div>
        <div class="form-row">
        <div class="form-group col-md-5">
            <label for="inputAddress2">Rua</label>
            <input type="text" class="form-control" id="enderecoAluno" name="enderecoAluno" placeholder="Endereço">
        </div>
        <div class="form-group col-md-1">
            <label for="inputAddress2">Número</label>
            <input type="number" class="form-control" id="numeroAluno" name="numeroAluno" placeholder="Núm.">
        </div>
        <div class="form-group col-md-2">
            <label for="inputCity">Bairro</label>
            <input type="text" class="form-control" id="bairroAluno"name="bairroAluno" placeholder="Bairro">
        </div>
        <div class="form-group col-md-2">
            <label for="inputState">Cidade</label>
            <input type="text" class="form-control" id="cidadeAluno" name="cidadeAluno" placeholder="Cidade">
        </div>
        <div class="form-group col-md-1">
            <label for="inputState">Estado</label>
            <input type="text" class="form-control" id="estadoAluno" name="estadoAluno" placeholder="Estado">
        </div>
        </div>
        <hr>
        <label class="h6">Dados opcionais</label>
                <div class="form-row col-auto">
                  <label for="inputZip">"Qual o seu objetivo ao adquirir o curso?"</label>
                  <input type="text" class="form-control" id="objetivoAluno" name="objetivoAluno" placeholder="Descreva...">
                </div>
                <br>
                <div class="form-row col-auto">
                  <label for="inputZip">"Toma remédios controlados? Se sim, qual e com que frequência?"</label>
                  <input type="text" class="form-control" id="remedioAluno" name="remedioAluno" placeholder="Descreva...">
                </div>
                <br>
                <div class="form-row col-auto">
                  <label for="inputZip">"Possui alguma alergia? Se sim qual?"</label>
                  <input type="text" class="form-control" id="alergiaAluno" name="alergiaAluno" placeholder="Descreva...">
                </div>
                <br>
                <div class="form-row col-auto">
                  <label for="inputZip">"Possui intolerância a algum alimento? Se sim qual?"</label>
                  <input type="text" class="form-control" id="intoleranciaAluno" name="intoleranciaAluno" placeholder="Descreva...">
                </div>
                <br>
                <div class="form-row col-auto">
                  <label for="inputZip">"Qual curso está fazendo atualmente?"</label>
                  <input type="text" class="form-control" id="cursoAtualmenteAluno" name="cursoAtualmenteAluno" placeholder="Descreva...">
                </div>
                <br>
                
                <div class="form-row col-auto">
                  <label for="marketing">"Como conheceu a escola?"</label>
                  <select class="form-control" name="marketing" id="marketing">
                    <option selected hidden>Escolha...</option>
                    <option value="Jornal">Jornal</option>
                    <option value="Internet">Internet</option>
                    <option value="Redes Sociais">Redes Sociais</option>
                    <option value="Eventos">Eventos</option>
                    <option value="Indicação">Indicação</option>
                    <option value="Outdoors/Panfletos">Outdoors/Panfletos</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <br>
                <div class="form-row col-auto">
                  <label for="vencimento">Data preferencial para vencimento</label>
                  <select class="form-control" name="vencimento" id="vencimento">
                    <option selected hidden>Escolha...</option>
                    
                  </select>
                </div>
                
                <br>
                <div class="form-row col-auto">
                  <label for="inputZip">Outras observações...</label>
                  <input type="text" class="form-control" id="observacoesAluno" name="observacoesAluno" placeholder="Descreva...">
                </div>
                <br>
                <label><b>Dias e horários disponíveis:</b></label>
                <div class="form-row">
                  <div class=" col-md-2">
                    <div class="custom-control custom-checkbox">
                      
                      <label  for="segunda">Segunda-feira</label>
                    </div>
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="segundaHora1" name="segundaHora1" placeholder="Horário">
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="segundaHora2" name="segundaHora2" placeholder="Horário">
                  </div>
                </div>
                <hr>
                <div class="form-row">
                  <div class=" col-md-2">
                    <div class="custom-control custom-checkbox">
                      
                      <label for="terca">Terça-feira</label>
                    </div>
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="tercaHora1" name="tercaHora1" placeholder="Horário">
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="tercaHora2" name="tercaHora2" placeholder="Horário">
                  </div>
                </div>
                <hr>
                <div class="form-row">
                  <div class=" col-md-2">
                    <div class="custom-control custom-checkbox">
                      
                      <label  for="quarta">Quarta-feira</label>
                    </div>
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="quartaHora1" name="quartaHora1" placeholder="Horário">
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="quartaHora2" name="quartaHora2" placeholder="Horário">
                  </div>
                </div>
                <hr>
                <div class="form-row">
                  <div class=" col-md-2">
                    <div class="custom-control custom-checkbox">
                      
                      <label  for="quinta">Quinta-feira</label>
                    </div>
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="quintaHora1" name="quintaHora1" placeholder="Horário">
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="quintaHora2" name="quintaHora2" placeholder="Horário">
                  </div>
                </div>
                <hr>
                <div class="form-row">
                  <div class=" col-md-2">
                    <div class="custom-control custom-checkbox">
                      
                      <label  for="sexta">Sexta-feira</label>
                    </div>
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="sextaHora1" name="sextaHora1" placeholder="Horário">
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="sextaHora2" name="sextaHora2" placeholder="Horário">
                  </div>
                </div>
                <hr>
                <div class="form-row">
                  <div class=" col-md-2">
                    <div class="custom-control custom-checkbox">
                      
                      <label  for="sabado">Sábado</label>
                    </div>
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="sabadoHora1" name="sabadoHora1" placeholder="Horário">
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="sabadoHora2" name="sabadoHora2" placeholder="Horário">
                  </div>
                </div>
                <hr>
                <div class="form-row">
                  <div class=" col-md-2">
                    <div class="custom-control custom-checkbox">
                      
                      <label  for="domingo">Domingo</label>
                    </div>
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="domingoHora1" name="domingoHora1" placeholder="Horário">
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="domingoHora2" name="domingoHora2" placeholder="Horário">
                  </div>
                </div>
                
                  <br>
                  <hr>
                  <div class="form-row col-auto">
                      
                      <label for="autorizaImagemAluno">O aluno autoriza o uso de sua imagem e dados para divulgação? (Marque esta caixa apenas mediante autorização do aluno ou responsável)</label>
                  </div>
                  <div class="form-row col-auto">
                    <div class="custom-control custom-radio custom-control-inline">
                      <input type="radio" id="autorizaImagem" name="imagemAluno" value="autorizaImagem" class="custom-control-input">
                      <label class="custom-control-label" for="autorizaImagem">Autoriza</label>
                    </div>
                    <div class="custom-control custom-radio custom-control-inline">
                      <input type="radio" id="naoAutorizaImagem" checked name="imagemAluno" value="naoAutorizaImagem" class="custom-control-input">
                      <label class="custom-control-label" for="naoAutorizaImagem">Não autoriza</label>
                    </div>
                  </div>
                  
        <button type="submit" class="btn btn-primary btn-block">Salvar dados</button>
        <hr>
        <h6>Dados dos responsáveis</h6>
        <label>Para editar os dados dos responsáveis você deve abrir a ficha do aluno</label>
        <section id="responsaveis">

        </section>
    </form>
    `, '<button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>');
    
    for (let i = 0; i < 28; i++) {
        let opt = document.createElement('option')
        opt.value = i + 1
        opt.innerHTML = i + 1
        document.getElementById('vencimento').appendChild(opt)                 
    }

    let formEditaAluno = document.getElementById('formEditaAluno');
    let campos = $('#formEditaAluno').serializeArray();
    console.log(campos)
    
    let responsaveis = aluno.responsaveis
        let sectionResponsaveis = document.getElementById('responsaveis')
        console.log(responsaveis)
        sectionResponsaveis.innerHTML = ''
        for (const i in responsaveis) {
            if (Object.hasOwnProperty.call(responsaveis, i)) {
                const responsavel = responsaveis[i];
                sectionResponsaveis.innerHTML += `
                <div class="form-row border border-success rounded">
                
                <div class="form-group col-md-4">
                    <label for="inputAddress">Responsável</label>
                    <input type="text" class="form-control" id="nome${i}" name="nome" placeholder="Nome" onblur="maiusculo(this)" disabled value="${responsavel.nome}">
                </div>
                <div class="form-group col-md-2">
                    <label for="inputAddress">Relação</label>
                    
                    <input type="text" class="form-control form-control-md" value="${responsavel.relacao}" name="relacao" id="relacao${i}" disabled>
                    
                </div>
                <div class="form-group col-md-3">
                    <label for="inputAddress">Número Celular</label>
                    <input type="text" class="form-control" id="celular${i}" value="${responsavel.celular}" name="celular" placeholder="Celular" disabled>
                </div>
                
                <div class="form-group col-md-5">
                    <label for="inputPassword4">Email</label>
                    <input type="email" class="form-control" id="email${i}" value="${responsavel.email}" name="email" placeholder="Email" disabled>
                </div>
                
                <div class="form-group col-auto">
                    <label for="inputEmail4">RG</label>
                    <input type="text" class="form-control" id="rg${i}" value="${responsavel.rg}" name="rg" placeholder="RG" disabled>
                </div>
                
                <div class="form-group col-auto">
                    <label for="inputPassword4">CPF</label>
                    <input type="text" class="form-control" id="cpf${i}" value="${responsavel.cpf}" name="cpf" placeholder="CPF" onchange="verificaCPF(this)" disabled>
                    <small id="cpfHelp3" class="form-text text-muted">Digite um CPF válido, existe um algoritmo de validação neste campo.</small>
                </div>
                <div class="custom-control custom-checkbox">
                    &nbsp;&nbsp;
                        <input type="checkbox" class="custom-control-input" ${responsavel.pedagogico ? 'checked' : null} disabled id="pedagogico${i}" name="pedagogico">
                        <label class="custom-control-label" for="pedagogico${i}">Responsável pedagógico</label>
                    </div>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <div class="custom-control custom-checkbox">
                        <input type="checkbox" class="custom-control-input" ${responsavel.financeiro ? 'checked' : null} disabled id="financeiro${i}" name="financeiro">
                        <label class="custom-control-label" for="financeiro${i}">Responsável financeiro</label>
                    </div>
                </div>
                <br>
                `

                // for (const id in responsavel) {
                //     if (Object.hasOwnProperty.call(responsavel, id)) {
                //         const value = responsavel[id];
                //         console.log(value)
                //         document.getElementById(id + i).value = value
                //         if (id == 'pedagogico' || id == 'financeiro') {
                //             document.getElementById(id + i).checked = value
                //         }
                //     }
                // }
            }
        }

    for (const key in campos) {
        if (Object.hasOwnProperty.call(campos, key)) {
            const element = campos[key];
            console.log(element)
            console.log(aluno[element.name])
            try {
                if (element.name == 'imagemAluno') {
                    document.getElementById(aluno[element.name]).checked = true;
                } else if (alunos[element.name] != 'on') {
                    document.getElementById(element.name).checked = false
                }
                document.getElementById(element.name).value = aluno[element.name] == undefined ? null : aluno[element.name] ;
                
            } catch (error) {
                console.log(error)
            }
           
            
            
                
        }
    }
    
    formEditaAluno.addEventListener('submit', (e) => {
        e.preventDefault();
        campos = $('#formEditaAluno').serializeArray();
        console.log(campos)
        let alunoObjNew = {}
        for (const key in campos) {
            if (Object.hasOwnProperty.call(campos, key)) {
                const element = campos[key];
                alunoObjNew[element.name] = element.value
            }
        }
        console.log(alunoObjNew)
        alunosRef.child(alunoObjNew.matriculaAluno).update(alunoObjNew).then(() => {
            AstNotif.notify('Sucesso', 'Dados alterados com sucesso.')
            $('#modal').modal('hide');
            carregaListaDeAlunos();
        }).catch(error => {
            AstNotif.dialog('Erro', error.message)
            console.log(error)
        })
    })
}

function carregaListaDeAlunos(filtro='') {
    console.log(filtro)
    loader.style.display = 'block'
    loaderMsg.innerText = 'Carregando lista de alunos...'
    let listaAlunos = document.getElementById('listaAlunos')
    if (filtro == '') {
        document.getElementById('listaAlunos').innerHTML = ''
        alunosRef.on('value', (snapshot) => {
            alunos = snapshot.val()
            let c = 0
            for (const matricula in alunos) {
                if (Object.hasOwnProperty.call(alunos, matricula)) {
                    const aluno = alunos[matricula];
                    c++
                    document.getElementById('listaAlunos').innerHTML += `
                    <tr>
                        <td>
                            <span class="custom-checkbox">
                            <input type="checkbox" id="checkbox${c}" name="options[]" value="1">
                            <label for="checkbox${c}"></label>
                            </span>
                        </td>
                        <td><a href="#rolaTelaAbaixoAlunos" onclick="abreDadosDoAluno('${matricula}')">${aluno.nomeAluno}</a></td>
                        <td>${matricula}</td>
                        <td>${aluno.turmaAluno}</td>
                        <td>
                            <a href="#" class="edit" data-toggle="tooltip" title="Editar dados" onclick="editarDadosAluno('${matricula}')"><i data-feather="edit" ></i></a>
                            <a href="#checkbox${c}" data-toggle="tooltip" title="Desativar aluno" class="delete" onclick="desativarAlunos(false, '${aluno.turmaAluno}', '${matricula}', '${aluno.nomeAluno}')"><i data-feather="user-x"></i></a>
                        </td>
                    </tr>`
                }
            }
            feather.replace()
            $(function () {
                $('[data-toggle="tooltip"]').tooltip()
            })
            ativaCheckboxes()
            loaderRun()
        })
    } else {
        document.getElementById('listaAlunos').innerHTML = ''
        alunosRef.orderByChild(tipoDeBusca).equalTo(filtro).once('value').then(snapshot => {
            alunos = snapshot.val()
            let c = 0
            for (const matricula in alunos) {
                if (Object.hasOwnProperty.call(alunos, matricula)) {
                    const aluno = alunos[matricula];
                    c++
                    document.getElementById('listaAlunos').innerHTML += `
                    <tr>
                        <td>
                            <span class="custom-checkbox">
                            <input type="checkbox" id="checkbox${c}" name="options[]" value="1">
                            <label for="checkbox${c}"></label>
                            </span>
                        </td>
                        <td><a href="#rolaTelaAbaixoAlunos" onclick="abreDadosDoAluno('${matricula}')">${aluno.nomeAluno}</a></td>
                        <td>${matricula}</td>
                        <td>${aluno.turmaAluno}</td>
                        <td>
                            <a href="#" class="action" onclick="ativarAluno('${matricula}')"><i data-feather="user-check"></i></a>
                            <a href="#deleteEmployeeModal" class="delete" data-toggle="modal" data-toggle="tooltip" title="Deletar aluno" data-toggle="tooltip" title="Reativar Aluno"><i data-feather="trash"></i></a>
                        </td>
                    </tr>`
                }
            }
            feather.replace()
            $(function () {
                $('[data-toggle="tooltip"]').tooltip()
            })
            ativaCheckboxes()
            loaderRun()
        }).catch(error => {
            console.log(error)
            AstNotif.dialog('Erro', error.message)
        })
    }
    
}
function carregaFrequenciaAluno(matricula, turma) {
    let c = 0
    let divFrequencias = document.getElementById('divFrequencias')
    let qtdeAulasFrequencia = document.getElementById('qtdeAulasFrequencia')
    let qtdeAulas
    turmasRef.child(turma + '/status/qtdeAulas').once('value').then(qtdeDeAulas => {
        qtdeAulasFrequencia.innerText = qtdeDeAulas.val()
        qtdeAulas = qtdeDeAulas.val()

        divFrequencias.innerHTML = 'Nenhuma frequência lançada para este aluno, nesta turma'
        turmasRef.child(turma + '/alunos/' + matricula + '/frequencia').on('child_added', frequencia => {
            console.log(frequencia.val())
            if (c==0) {
                divFrequencias.innerHTML = ''
            }
            if (frequencia.val().turma == turma) {
                let diaFrequencia = frequencia.key.split('T')[0]
                let horaFrequencia = frequencia.key.split('T')[1]
                divFrequencias.innerHTML += `
                <div class="row justify-content-start">
                    <div class="col-auto" style="background-color: rgba(86,61,124,.15);border: 1px solid rgba(86,61,124,.2);">${diaFrequencia.split('-').reverse().join('/')} ás ${horaFrequencia}</div>
                    <div class="col" style="background-color: rgba(86,61,124,.15);border: 1px solid rgba(86,61,124,.2);">Presente</div>
                </div>
                `
                feather.replace()
                $(function () {
                    $('[data-toggle="tooltip"]').tooltip()
                })
            }
            c++
            document.getElementById('totalFrequencias').innerText = c
            console.log(qtdeAulas)
            document.getElementById('porcentagemFrequencia').innerText = ((100*parseInt(c))/parseInt(qtdeAulas)).toFixed(2) + '%'
        })
    }).catch(error => {
        AstNotif.dialog('Erro', error.message)
    })


    
}


function chamaDownload(refDown, nome) {
    storageDownload(refDown, nome).then(info => {
        AstNotif.dialog('Sucesso', info.answer + `. Você também pode copiar <a href="${info.url}" target="_blank">este link para download</a>.`)
    }).catch(error => {
        AstNotif.dialog('Error', error)
    })
}

function chamaDelete(ref, nomeArquivo, confirma = false) {
    if (confirma) {
        storageDelete(ref).then(info => {
            AstNotif.notify('Sucesso', info.answer)
            $('#modal').modal('hide')
            carregaArquivosAluno(document.getElementById('mostraMatriculaAluno').innerText)
        }).catch(error => {
            console.log(error)
            AstNotif.dialog('Erro', error.message)
        })
    } else {
        abrirModal('modal', 'Confirmação', `
            Deseja excluir o arquivo "<b>${nomeArquivo}</b>" permanentemente do sistema? (Esta ação não pode ser revertida)
        `, `<button type="button" id="deletaArquivosConfirma" onclick="chamaDelete('${ref}', '${nomeArquivo}', true)" class="btn btn-danger">Deletar arquivo</button> <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>`)
    }
}

async function carregaArquivosAluno(matricula) {
    let listaArquivosAluno = document.getElementById('listaArquivosAluno')
    listaArquivosAluno.innerHTML = ''
    let storageRef = alunosStorageRef.child(matricula + '/arquivos')

    

        // Find all the prefixes and items.
    storageRef.listAll().then(async function(res) {
        res.prefixes.forEach(async function(folderRef) {
        // All the prefixes under listRef.
        // You may call listAll() recursively on them.
        });
        res.items.forEach(async function(itemRef) {
            // All the items under listRef.
            itemRef.getMetadata().then(async function(metadata) {
                console.log(metadata)
                let imagem
                if (metadata.customMetadata.tipo == 'cpf') imagem = '../images/cpf-icon.png'
                else if(metadata.customMetadata.tipo == 'endereco') imagem = '../images/home.png'
                else if(metadata.customMetadata.tipo == 'foto3x4') imagem = await itemRef.getDownloadURL()
                listaArquivosAluno.innerHTML += `
                    <div class="col-lg-3 col-xl-2">
                        <div class="file-man-box">
                        <a class="file-close" onclick="chamaDelete('${metadata.fullPath}', '${metadata.name}')"><i data-feather="x"></i></a>
                        <div class="file-img-box">
                            <img src="${imagem}" alt="icon">
                        </div>
                        <a onclick="chamaDownload('${metadata.fullPath}', '${metadata.name}')" class="file-download" name="downBtns"><i data-feather="download"></i></a>
                        <div class="file-man-title">
                            <h6 class="mb-0 text-overflow" data-toggle="tooltip" data-placement="top" title="${metadata.name}">${metadata.name}</h5>
                            <p class="mb-0"><small>${formatBytes(metadata.size)}</small></p>
                            <p class="mb-0"><small>${metadata.customMetadata.tipo}</small></p>
                        </div>
                        </div>
                    </div>
                `
                feather.replace()
                $(function () {
                    $('[data-toggle="tooltip"]').tooltip()
                })

            }).catch(function(error) {
                console.log(error)
                AstNotif.dialog('Erro', error.message)
            })
            
            console.log(itemRef)
            
        });
    }).catch(function(error) {
        // Uh-oh, an error occurred!
        console.log(error)
        AstNotif.dialog('Erro', error.message)
    });
}
function segundaViaBoleto(matricula, codContrato) {
    let visualizaBoletos = document.getElementById('visualizaBoletos')
    visualizaBoletos.innerHTML = `
    <iframe src="../resources/pdfsProntos/modeloBoleto.html#segundaVia?${matricula}?${codContrato}" frameborder="0" width="100%" height="400px" id="boletoPdf" name="boletoPdf"></iframe>

    <button type="button" class="btn btn-primary" onclick="window.frames['boletoPdf'].focus(), window.frames['boletoPdf'].print()">Imprimir</button>
    
    <button type="button" class="btn btn-secondary" onclick="document.getElementById('visualizaBoletos').innerHTML = ''">Fechar</button>
    `
    
}

function geraBoletoContrato(matricula, codContrato) {
    let visualizaBoletos = document.getElementById('visualizaBoletos')
    visualizaBoletos.innerHTML = `
    <iframe src="../resources/pdfsProntos/modeloBoleto.html#geraBoletos?${matricula}?${codContrato}" frameborder="0" width="100%" height="400px" id="boletoPdf" name="boletoPdf"></iframe>

    <button type="button" class="btn btn-primary" onclick="window.frames['boletoPdf'].focus(), window.frames['boletoPdf'].print()">Imprimir</button>
    
    <button type="button" class="btn btn-secondary" onclick="document.getElementById('visualizaBoletos').innerHTML = ''">Fechar</button>
    `
    
}

async function carregaContratosAluno(matricula) {
    
    let dadosAluno = alunos[matricula]
    dadosAluno = dadosAluno != undefined ? dadosAluno : (await alunosDesativadosRef.child(matricula + '/dadosAluno').once('value')).val()
    let contratos = dadosAluno.contratos
    console.log(contratos)
    let dadosContratos = {}
    
    show()
    async function show() {
        loaderRun(true, 'Carregando contratos do aluno...')
        document.getElementById('visualizaBoletos').innerHTML = ''
        for (const i in contratos) {
            if (Object.hasOwnProperty.call(contratos, i)) {
                const codContrato = contratos[i];
                let data = await contratosRef.child(codContrato).once('value')
                dadosContratos[codContrato] = data.val()
            }
        }
        console.log(dadosAluno, contratos, dadosContratos)
        let listaContratos = document.getElementById('listaContratos')
        listaContratos.innerHTML = ''
        for (const codContrato in dadosContratos) {
            if (Object.hasOwnProperty.call(dadosContratos, codContrato)) {
                const contrato = dadosContratos[codContrato];
                listaContratos.innerHTML += `
                <tr>
                <td>
                  <span class="custom-checkbox">
                    <!-- <input type="checkbox" id="checkbox1" name="options[]" value="1">
                    <label for="checkbox1"></label> -->
                  </span>
                </td>
                <td>${contrato.contratoConfigurado.nomePlano}</td>
                <td>${contrato.contratoConfigurado.nomeCursoAdd}</td>
                <td>${contrato.situacao || ''}</td>
                <td>
                  <a href="#" class="action" onclick="segundaViaBoleto('${matricula}', '${codContrato}')" data-toggle="tooltip" title="Segunda via de boletos"><i data-feather="file-text">&#xE254;</i></a>
                  <a href="#" class="action" data-toggle="tooltip" title="Gerar boletos de pagamento"onclick="geraBoletoContrato('${matricula}', '${codContrato}')"><i data-feather="dollar-sign">&#xE872;</i></a>
                </td>
              </tr>
                `
            }
        }
        loaderRun()
        feather.replace()
        $('[data-toggle="tooltip"]').tooltip()



    }

    
    
    

    document.getElementById('atualizaContratosAlunos').addEventListener('click', (e) => {
        show()
    })
     
}

async function carregaChecklistAluno(matricula, desativado) {
    let checklistAlunoRef
    let checklistAlunoAcompanhamentoRef
    if (desativado) {
        console.log(desativado)
        checklistAlunoRef = alunosDesativadosRef.child(matricula + '/dadosAluno/checklist')
        checklistAlunoAcompanhamentoRef = alunosDesativadosRef.child(matricula + '/dadosAluno/checklistAcompanhamento')
    } else {
        checklistAlunoRef = alunosRef.child(matricula + '/checklist')
        checklistAlunoAcompanhamentoRef = alunosRef.child(matricula + '/checklistAcompanhamento')
    }
    let checklistRef = firebase.database().ref('sistemaEscolar/infoEscola/checklist')
    let checklistAcompanhamentoRef = firebase.database().ref('sistemaEscolar/infoEscola/checklistAcompanhamento')
    let checklistFire = await checklistRef.once('value')
    let checklistAcompanhamentoFire = await checklistAcompanhamentoRef.once('value')
    let checklistSistema = checklistFire.val()
    let checkListSistemaAcompanhamento = checklistAcompanhamentoFire.val()
    let checklistAluno
    let checklistAlunoAcompanhamento

    let checklistSequencial = document.getElementById('checklistSequencial')
    let checklistAcompanhamento = document.getElementById('checklistAcompanhamento')
    
    checklistAlunoRef.once('value', (snapshot) => {
        checklistAluno = snapshot.val()
        sequencial(checklistSistema)
    })

    checklistAlunoAcompanhamentoRef.once('value', (snapshot) => {
        checklistAlunoAcompanhamento = snapshot.val()
        acompanhamento(checkListSistemaAcompanhamento)
    })
    
    
    function sequencial(checklistBase) {
        checklistSequencial.innerHTML = ''
        let c = 0
        for (const key in checklistBase) {
            if (Object.hasOwnProperty.call(checklistBase, key)) {
                const checklist = checklistBase[key];
                checklistSequencial.innerHTML += `
                <h5>${checklist.topicoChecklist}</h5>
                <div class="container">
                    
                    <div id="checkSeq${key}" class="row">
                    
                    </div>
                   
                </div>
                <hr>
                `
                for (let i = 0; i < checklist.qtdeChecklist; i++) {
                    document.getElementById(`checkSeq${key}`).innerHTML += `
                    <div class="custom-control custom-checkbox col-auto">
                        <input type="checkbox" class="custom-control-input" id="${checklist.nomeChecklist}${i}" value="${key},${i},${checklist.nomeChecklist}" name="${checklist.topicoChecklist}">
                        <label class="custom-control-label" for="${checklist.nomeChecklist}${i}">${checklist.nomeChecklist} ${i+1 <= 9 ? '0' + (i+1) : i+1 }</label>
                    </div>
                    `
                    
                }

                
            }
            c++
        }

        console.log(checklistAluno)
        for (const key in checklistAluno) {
            if (Object.hasOwnProperty.call(checklistAluno, key)) {
                const array = checklistAluno[key];

                for (const i in array) {
                    if (Object.hasOwnProperty.call(array, i)) {
                        const element = array[i];
                        console.log(element.name + i)
                        document.getElementById(`${element.value.split(',')[2]}${i}`).checked = true
                    }
                }
                
            }
        }
        escutaForm()
    }

    function acompanhamento(checklistBase) {
        checklistAcompanhamento.innerHTML = ''
        let c = 0
        for (const key in checklistBase) {
            if (Object.hasOwnProperty.call(checklistBase, key)) {
                const checklist = checklistBase[key];
                checklistAcompanhamento.innerHTML += `
                <div id="checkAcomp${key}" class="col" style="margin-bottom: 5px;">
                    <h5>${checklist.topicoChecklist}</h5>
                        
                </div>
                
                `
                for (let i = 0; i < checklist.qtdeChecklist; i++) {
                    document.getElementById(`checkAcomp${key}`).innerHTML += `
                    <div class="custom-control custom-checkbox" style="margin-top: 3px;">
                        <div class="row">
                            <div class="col">
                                <input type="checkbox" class="custom-control-input" id="${checklist.nomeChecklist}${i}checkbox" value="${key},${i},checkbox,${checklist.nomeChecklist}" name="${checklist.topicoChecklist}">
                                <label class="custom-control-label" for="${checklist.nomeChecklist}${i}">${checklist.nomeChecklist} ${i+1 <= 9 ? '0' + (i+1) : i+1 }</label>
                            </div>
                            <div class="col">
                                <input type="checkbox" class="custom-control-input" id="${checklist.nomeChecklist}${i}situacao1" value="${key},${i},situacao1,${checklist.nomeChecklist}" name="${checklist.topicoChecklist}Situacoes">
                                <label class="custom-control-label" for="${checklist.nomeChecklist}${i}situacao1">${checklist.situacao1}</label>
                            </div>
                            <div class="col">
                                <input type="checkbox" class="custom-control-input" id="${checklist.nomeChecklist}${i}situacao2" value="${key},${i},situacao2,${checklist.nomeChecklist}" name="${checklist.topicoChecklist}Situacoes">
                                <label class="custom-control-label" for="${checklist.nomeChecklist}${i}situacao2">${checklist.situacao2}</label>
                            </div>
                            <div class="col">
                                <input type="checkbox" class="custom-control-input" id="${checklist.nomeChecklist}${i}situacao3" value="${key},${i},situacao3,${checklist.nomeChecklist}" name="${checklist.topicoChecklist}Situacoes">
                                <label class="custom-control-label" for="${checklist.nomeChecklist}${i}situacao3">${checklist.situacao3}</label>
                            </div>
                        </div>
                    </div>
                    
                    
                    `
                    
                }
            }
            c++
        }

        for (const key in checklistAlunoAcompanhamento) {
            if (Object.hasOwnProperty.call(checklistAlunoAcompanhamento, key)) {
                const array = checklistAlunoAcompanhamento[key];

                for (const i in array) {
                    if (Object.hasOwnProperty.call(array, i)) {
                        const grupo = array[i];
                        for (const check in grupo) {
                            if (Object.hasOwnProperty.call(grupo, check)) {
                                const element = grupo[check];
                                document.getElementById(`${element.value.split(',')[3]}${i}${element.value.split(',')[2]}`).checked = true
                            }
                        }
                        
                    }
                }
                
            }
        }
        escutaForm()
    }

    function escutaForm() {
        let formChecklistSequencial = document.getElementById('formChecklistSequencial')
        let formChecklistAcompanhamento = document.getElementById('formChecklistAcompanhamento')
        formChecklistSequencial.addEventListener('submit', (e) => {
            e.preventDefault()
        
            let data = new FormData(formChecklistSequencial)
            let dados = $('#formChecklistSequencial').serializeArray();
            console.log(dados)
            dados.length == 0 ? checklistAlunoRef.set(null).then(() => {}) : null;
            dados.forEach(elem => {
                checklistAlunoRef.child(elem.value.split(',')[0] + '/' + elem.value.split(',')[1]).set(elem).then(() => {

                }).catch(error => {
                    AstNotif.dialog('Erro', error.message)
                    console.log(error)
                })
            })
            
        })

        formChecklistAcompanhamento.addEventListener('submit', (e) => {
            e.preventDefault()
       
            let data = new FormData(formChecklistSequencial)
            let dados = $('#formChecklistAcompanhamento').serializeArray();
            console.log(dados)
            let checklists = {}
            dados.length == 0 ? checklistAlunoAcompanhamentoRef.set(null).then(() => {}) : null;
            dados.forEach(elem => {
                checklistAlunoAcompanhamentoRef.child(elem.value.split(',')[0] + '/' + elem.value.split(',')[1] + '/' + elem.value.split(',')[2]).set(elem).then(() => {

                }).catch(error => {
                    AstNotif.dialog('Erro', error.message)
                    console.log(error)
                })
            })
        })
    }
}

async function transferirAluno(matricula, turmaAtual, turmaParaTransferir='') {

    async function transfere(dados) {
        try {
            loaderRun(true, 'Transferindo aluno')
            let result = await transfereAlunos(dados)
            loaderRun()
            AstNotif.notify('Sucesso', result.data.answer)
            $('#modal').modal('hide')
        } catch (error) {
            loaderRun()
            console.log(error)
            AstNotif.dialog(error.message)
        }
        
    }

    if (turmaParaTransferir == '') {
        abrirModal('modal', 'Confirmação', 
            `Você irá transferir o aluno da turma ${turmaAtual}. <b>Você deseja transferi-lo para qual turma?</b><br>(Aviso: As notas e todas as informações atuais do aluno nesta turma serão transferidas.)
            <select class="custom-select" id="selectTurmasTransfere">
                <option selected hidden>Escolha uma turma...</option>
            </select>
            `
            , `<button type="button" data-toggle="tooltip" data-placement="top" title="A operação de transferência ficará gravada no sistema para futuras consultas." class="btn btn-info" id="btnTransfereDaTurma">Transferir</button><button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>`
            )
            $(function () {
                $('[data-toggle="tooltip"]').tooltip()
            })
            let btnTransfereDaTurma = document.getElementById('btnTransfereDaTurma')

            btnTransfereDaTurma.addEventListener('click', (e) => {
                e.preventDefault()
                let dados = {turmaAtual: turmaAtual, turmaParaTransferir: selectTurmasTransfere.value, alunos: {0: matricula}}
                transfere(dados)
            })
            let turmas = (await turmasRef.once('value')).val()
            let selectTurmasTransfere = document.getElementById('selectTurmasTransfere')
            for (const cod in turmas) {
                if (Object.hasOwnProperty.call(turmas, cod) && cod != turmaAtual) {
                    const infoDaTurma = turmas[cod];
                    if (infoDaTurma.professor == undefined) {
                        var profReferencia = 'Não cadastrado'
                    } else {
                        var profReferencia = infoDaTurma.professor[0].nome
                    }
                    selectTurmasTransfere.innerHTML += `<option value="${cod}">Turma ${cod} (Prof. ${profReferencia})</option>`
                }
            }
    }


}

var dadosResponsaveis = {}
function abreDadosDoAluno(matricula, desativado=false, notasDesativado=false) {

    

    carregaHistoricoAluno(matricula)
    carregaArquivosAluno(matricula)
    let dados
    if (desativado != false) {
        dados = desativado
        document.getElementById('alunoDesativado').style.display = 'block'
    } else {
        dados = alunos[matricula]
        document.getElementById('alunoDesativado').style.display = 'none'
    }
    document.getElementById('infoDoAluno').style.display = 'block'
    document.getElementById('rolaTelaAbaixoAlunos').style.display = 'block'
    document.getElementById('secGeraFicha').innerHTML = `<button class="btn btn-outline-primary btn-block" id="btnGeraFicha" onclick="editarDadosAluno('${matricula}')">Ver/Editar dados do aluno</button>
    <button class="btn btn-outline-primary btn-block" id="btnGeraFicha" onclick="gerarFichaAluno('${matricula}')">Gerar ficha de matrícula em PDF</button>
    <button class="btn btn-outline-primary btn-block" id="btnTransfereAluno" onclick="transferirAluno('${matricula}', '${dados.turmaAluno}')">Transferir Aluno</button>
    <button class="btn btn-outline-primary btn-block" id="btnBoletosAluno" data-toggle="modal" data-target="#contratosAluno" onclick="carregaContratosAluno('${matricula}')">Ver contratos/boletos do aluno</button>
    <button class="btn btn-outline-primary btn-block" id="btnBoletosAluno" data-toggle="modal" data-target="#checklistAluno" onclick="carregaChecklistAluno('${matricula}', ${desativado == false ? false : true})">Checklist do Aluno</button>`
    
    carregaFrequenciaAluno(matricula, dados.turmaAluno)
    dadosResponsaveis = dados.responsaveis

    
    dados.fotoAluno != undefined ? document.getElementById('mostraFotoAluno').setAttribute('src', dados.fotoAluno) : document.getElementById('mostraFotoAluno').setAttribute('src', '../images/profile_placeholder.png')
    document.getElementById('mostraNomeAluno').innerText = dados.nomeAluno
    document.getElementById('mostraCpfAluno').innerText = dados.cpfAluno
    document.getElementById('mostraRgAluno').innerText = dados.rgAluno
    document.getElementById('mostraCelularAluno').innerText = dados.celularAluno
    document.getElementById('mostraTelefoneAluno').innerText = dados.telefoneAluno
    document.getElementById('timestampDoAluno').innerText = 'Aluno cadastrado em: ' + new Date(dados.timestamp._seconds * 1000)
    document.getElementById('mostraDataNascimentoAluno').innerText = dados.dataNascimentoAluno.split('-').reverse().join('/');

    let nascimento = dados.dataNascimentoAluno
    
    calcularIdadePrecisa(nascimento).then(function(idade){
        document.getElementById('mostraIdadeAluno').innerText = `${idade.years} anos, ${idade.months} mês(es), e ${idade.days} dias`
    }).catch(function(error){
        AstNotif.dialog('Erro', error.message)
        console.log(error)
    })
    document.getElementById('mostraHoraEDiasAluno').innerText = `Horário atual de aula: ${dados.horaAluno}`
    document.getElementById('mostraTurmaAluno').innerHTML = dados.turmaAluno
    document.getElementById('mostraEmailAluno').innerText = dados.emailAluno
    document.getElementById('mostraMatriculaAluno').innerText = dados.matriculaAluno
    document.getElementById('mostraEnderecoAluno').innerText = `${dados.enderecoAluno}, ${dados.numeroAluno}, ${dados.bairroAluno}, ${dados.cidadeAluno}, ${dados.estadoAluno}. CEP ${dados.cepAluno}.`
    document.getElementById('rolaTelaAbaixoAlunos').focus()
    document.getElementById('rolaTelaAbaixoAlunos').style.display = 'none'
    if (!desativado) {
        turmasRef.child(`${dados.turmaAluno}/alunos/${matricula}/notas`).once('value').then(snapshot => {
            turmasRef.child(`${dados.turmaAluno}/notas`).once('value').then(notasReferencia => {
                let notas = snapshot.val()
                let referenciaDeNotas = notasReferencia.val()
                if (desativado != false) {
                    notas = notasDesativado
                }
                console.log(notas)
                let notasDoAlunoDiv = document.getElementById('notasDoAluno')
                notasDoAlunoDiv.innerHTML = ''
                //let somatorioNotasDiv = document.getElementById('somatorioNotas')
                if (notas == null) {
                    notasDoAlunoDiv.innerHTML = 'Nenhuma nota foi lançada para este aluno'
                }
                let somatorioNotas = 0
                for (const nomeNota in notas) {
                    if (Object.hasOwnProperty.call(notas, nomeNota)) {
                        const valorNota = notas[nomeNota];
                        const barra = (100*valorNota)/referenciaDeNotas[nomeNota]
                        somatorioNotas += valorNota
                        notasDoAlunoDiv.innerHTML += `
                        
                        <small id="nomeNota${nomeNota}"><b>${nomeNota}</b>: ${valorNota}</small><small id="notaReferencia">/${referenciaDeNotas[nomeNota]}</small>
                        <div class="progress mb-3" style="height: 10px">
                        <div class="progress-bar bg-primary" role="progressbar" style="width: ${barra}%" aria-valuenow="${valorNota}" aria-valuemin="0" aria-valuemax="${referenciaDeNotas[nomeNota]}">${valorNota}</div>
                        </div>
                        `
                        
                    }
                }
                notasDoAlunoDiv.innerHTML += `<div id="somatorioNotas">Somatório: <b>${somatorioNotas}</b>/100</div>`

                /*document.getElementById('pontosAudicao').innerText = notas.audicao
                document.getElementById('pontosFala').innerText = notas.fala
                document.getElementById('pontosEscrita').innerText = notas.escrita
                document.getElementById('pontosLeitura').innerText = notas.leitura
                document.getElementById('barraPontosAudicao').style.width = notas.audicao * 20 + '%'
                document.getElementById('barraPontosFala').style.width = notas.fala * 20 + '%'
                document.getElementById('barraPontosEscrita').style.width = notas.escrita * 20 + '%'
                document.getElementById('barraPontosLeitura').style.width = notas.leitura * 20 + '%'*/
            }).catch(error => {
                AstNotif.dialog('Erro', error.message)
                console.log(error)
            })
            
        }).catch(error => {
            AstNotif.dialog('Erro', error.message)
            console.log(error)
        })
    }

    if (!desativado) {
        turmasRef.child(`${dados.turmaAluno}/alunos/${matricula}/desempenho`).on('value', (desempenho) => {
            desempenhoRef.once('value').then(referenciaDesempenho => {
                let notas = desempenho.val()
                let referenciaDeNotas = referenciaDesempenho.val()
                console.log(notas)
                let notasDoAlunoDiv = document.getElementById('desempenhoAluno')
                notasDoAlunoDiv.innerHTML = ''
                //let somatorioNotasDiv = document.getElementById('somatorioNotas')
                if (notas == null) {
                    notasDoAlunoDiv.innerHTML = 'Nenhuma nota de desempenho foi lançada para este aluno'
                }
                let somatorioNotas = 0
                for (const nomeNota in notas) {
                    if (Object.hasOwnProperty.call(notas, nomeNota)) {
                        const valorNota = notas[nomeNota];
                        const barra = (100*valorNota)/referenciaDeNotas[nomeNota]
                        somatorioNotas += valorNota
                        notasDoAlunoDiv.innerHTML += `
                        
                        <small id="nomeDesempenho${nomeNota}"><b>${nomeNota}</b>: ${valorNota}</small><small id="notaReferencia">/${referenciaDeNotas[nomeNota]}</small>
                        <div class="progress mb-3" style="height: 10px">
                        <div class="progress-bar bg-primary" role="progressbar" style="width: ${barra}%" aria-valuenow="${valorNota}" aria-valuemin="0" aria-valuemax="${referenciaDeNotas[nomeNota]}">${valorNota}</div>
                        </div>
                        `
                        
                    }
                }
                
                notasDoAlunoDiv.innerHTML += `<div id="somatorioNotas">Somatório: <b>${somatorioNotas}</b></div>`
    
                
            }).catch(error => {
                AstNotif.dialog('Erro', error.message)
                console.log(error)
            })
            
        })
    }
    
}

function alteraNotasDesempenho(confirma=false) {
    if (confirma) {
        loader.style.display = 'block'
        loaderMsg.innerText = 'Lançando notas dos alunos no sistema...'
        var notasParaLancar = {}
        let c2 = 0
        while (c2 <= contadorNotas) {
            try {
                let index = document.getElementById('nomeNota' + c2).value
                let valor = Number(document.getElementById('valorNota' + c2).value)
                notasParaLancar[index] = valor 
            } catch (error) {
                console.log(error)
            }
            
            c2++
        }

        desempenhoRef.set(notasParaLancar).then(() => {
            $('#modal').modal('hide')
            loaderRun()
            AstNotif.notify('Sucesso', 'Desempenho do aluno alterado com sucesso.')

        }).catch(error => {
            AstNotif.dialog('Erro', error.message)
            loaderRun()
            console.log(error)
        })
    } else {
        loader.style.display = 'block'
        loaderMsg.innerText = 'Buscando notas...'
        
        desempenhoRef.once('value').then(referenciaDesempenho => {
            let notas = referenciaDesempenho.val()

            abrirModal('modal', 'Distribuir notas de referência de desempenho', `
            Ao distribuir essas notas, todos os professores terão de lançar pontos para todos os alunos com cada um dos tópicos que estiverem definidos nesta referência.<br><br>
            <button type="button" data-toggle="tooltip" data-placement="top" title="Adicionar nota" class="btn btn-light btn-sm" onclick="addCampoNota()"><span data-feather="plus-square"></span></button><br>
            <div class="row"><div class="col-2"><label>Nota</label></div><div class="col-2"><label>Valor</label></div></div>
            <section id="camposLancaNotas"></section> 
            `, `<button type="button" data-toggle="tooltip" data-placement="top" title="Distribuir essas notas de referência para que os professores possam fazer lançamentos." class="btn btn-primary" onclick="alteraNotasDesempenho(true)">Distribuir notas</button><button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>`)
            feather.replace()
            contadorNotas = 0
            contadorNotasExtras = 0
            notasDistribuidas = {}
            somatorioDistribuidas = 0
            
            let c = 0
            for (const nomeNota in notas) {
                if (Object.hasOwnProperty.call(notas, nomeNota)) {
                    const valor = notas[nomeNota];
                    document.getElementById('camposLancaNotas').innerHTML += `
                    <div class="row" id="linha${c}">
                        <div class="col-2" >
                            <input type="text" class="form-control" id="nomeNota${c}" placeholder="EX ${c + 1}" value="${nomeNota}">
                        </div>
                        <div class="col-2">
                            <input type="number" id="valorNota${c}" class="form-control" value="${valor}" onkeyup="somaNotasDistribuidas('${c}')" placeholder="15.5">
                        </div>
                        <button type="button" class="btn btn-light btn-sm" onclick="document.getElementById('linha${c}').remove(), contadorNotas--"><span data-feather="x-square"></span></button><br>
                    </div>
                    `
                    c++
                }
            }
            contadorNotas = c
            feather.replace()
           

            loaderRun()
        })

    }
}

var contadorNotas = 0
var contadorNotasExtras = 0
function addCampoNota(extra=false) {
    let camposNotas = document.getElementById('camposLancaNotas')
    
    if (extra) {
        
    } else {
        let newField = new DOMParser().parseFromString(`
        <div class="row" id="linha${contadorNotas}">
            <div class="col-2" >
                <input type="text" class="form-control" id="nomeNota${contadorNotas}" placeholder="EX ${contadorNotas + 1}" value="EX ${contadorNotas + 1}">
            </div>
            <div class="col-2">
                <input type="number" id="valorNota${contadorNotas}" value=0 class="form-control"  placeholder="15.5">
            </div>
            <button type="button" class="btn btn-light btn-sm" onclick="somaNotasDistribuidas('${contadorNotas}', true), document.getElementById('linha${contadorNotas}').remove(), contadorNotas--"><span data-feather="x-square"></span></button><br>
        </div>
        `, 'text/html')
        camposNotas.appendChild(newField.body)
        
        feather.replace()
        contadorNotas++
    }
}

async function historicoAluno(matricula, turma) {
    
    abrirModal('modal', 'Histórico escolar', 
            `
            <div class="container-xl">
            <div class="table-responsive">
              <div class="table-wrapper">
                <div class="table-title">
                  <div class="row">
                    <div class="col-sm-6">
                      <h2>Histórico <b>Escolar</b></h2>
                    </div>
                    <div class="col-sm-6">
                      <!--<a href="#" class="btn btn-success" onclick="carregaListaDeAlunos()">&nbsp; <span class="feather-24" data-feather="refresh-cw"></span><span>Atualizar lista</span></a>
                      <a href="#deleteEmployeeModal" class="btn btn-danger" data-toggle="modal">&nbsp;<span class="feather-24" data-feather="trash"></span> <span>Delete</span></a>-->						
                    </div>
                  </div>
                </div>
                <table class="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>
                        <span class="custom-checkbox">
                          <input type="checkbox" id="selectAll">
                          <label for="selectAll"></label>
                        </span>
                      </th>
                      <th><a href="#" id="ordenaTurma">Turma</a></th>
                      <th><a href="#" id="ordenaData">Data de fechamento</a></th>
                      <th><a href="#" id="ordenaNota">Somatório das notas</a></th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody id="listaHistorico">
                    
                  </tbody>
                </table>
                
              </div>
            </div>
          </div>    

            `, `<button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`
        )
        let listaHistorico = document.getElementById('listaHistorico')
        let c = 0
    let historicoFire = await alunosRef.child(matricula + '/historicoEscolar').once('value')
    historicoFire = historicoFire.exists() ? historicoFire : await alunosDesativadosRef.child(matricula + '/dadosAluno/historicoEscolar').once('value')

    let historico = historicoFire.val()
        
    for (const key in historico) {
        if (Object.hasOwnProperty.call(historico, key)) {
            const registro = historico[key];
            c++
            let dataFechamento = new Date(registro.timestamp._seconds * 1000)
            let notas = registro.infoAluno.notas
            let somatorioNota = 0
            for (const nomeNota in notas) {
                if (Object.hasOwnProperty.call(notas, nomeNota)) {
                    const nota = notas[nomeNota];
                    somatorioNota += nota
                }
            }
            listaHistorico.innerHTML += `
            <tr>
                <td>
                    <span class="custom-checkbox">
                        <input type="checkbox" id="checkbox${c}" name="options[]" value="1">
                        <label for="checkbox${c}"></label>
                    </span>
                </td>
                <td>${registro.turma}</td>
                <td>${dataFechamento.getDate()}/${dataFechamento.getMonth() + 1}/${dataFechamento.getFullYear()}</td>
                <td><b>${somatorioNota}</b>/100</td>
                <td>
                    <a id="emiteBoletim${c}" style="cursor: pointer;" onclick="emiteBoletim('${matricula}', '${key}')" class="action" data-toggle="tooltip" title="Emitir boletim"><i data-feather="file-text"></i></a>
                    
                </td>
            </tr>
            `
            // document.querySelector('#verHistorico' + c).addEventListener('click', (e) => {
            //     e.preventDefault()
            //     visualizarDadosDoHistorico(registro.val())
            // })

            $(function () {
                $('[data-toggle="tooltip"]').tooltip()
            })
            feather.replace()
            loaderRun()
            ativaCheckboxes()
        }
    }

    if (!historicoFire.exists()) {
        listaHistorico.innerHTML += `
            <tr>
                <td>
                    <span class="custom-checkbox">
                        <input type="checkbox" id="checkbox${c}" name="options[]" value="1">
                        <label for="checkbox${c}"></label>
                    </span>
                </td>
                <td></td>
                <td>Nenhum histórico foi encontrado em nossos registros</td>
                <td></td>
                <td>
                   
                </td>
            </tr>
            `
    }
        
}

function emiteBoletim(matricula, chave) {
    document.getElementById('corpoBoletim').innerHTML = `<iframe src="../resources/pdfsProntos/documento.html#boletim?${matricula}?${chave}" frameborder="0" width="100%" height="300px" id="boletimPdf" name="boletimPdf"></iframe>`
    $('#boletimModal').modal({backdrop: 'static'})
}

function visualizarDadosDoHistorico(info) {
    console.log(info)
    $('#modal').modal('hide')
    let referenciaDeNotas = info.infoAluno.notasReferencia
    document.getElementById('mostraTurmaAluno').innerText = info.turma
    document.getElementById('notasDoAluno').innerHTML = ''
    let somatorioNotas = 0
    for (const nomeNota in info.infoAluno.notas) {
        if (Object.hasOwnProperty.call(info.infoAluno.notas, nomeNota)) {
            const nota = info.infoAluno.notas[nomeNota];
            const barra = (100*nota)/referenciaDeNotas[nomeNota]
            somatorioNotas += nota
            
            document.getElementById('notasDoAluno').innerHTML += `
                <small id="nomeNota${nomeNota}"><b>${nomeNota}</b>: ${nota}</small><small id="notaReferencia">/${referenciaDeNotas[nomeNota]}</small>
                <div class="progress mb-3" style="height: 10px">
                <div class="progress-bar bg-primary" role="progressbar" style="width: ${barra}%" aria-valuenow="${nota}" aria-valuemin="0" aria-valuemax="${referenciaDeNotas[nomeNota]}">${nota}</div>
                </div>
            `
        }
    }
    document.getElementById('notasDoAluno').innerHTML += `<div id="somatorioNotas">Somatório: <b>${somatorioNotas}</b></div>`

    somatorioNotas = 0
    document.getElementById('desempenhoAluno').innerHTML = ''
    for (const nomeNota in info.infoAluno.desempenho) {
        if (Object.hasOwnProperty.call(info.infoAluno.desempenho, nomeNota)) {
            const valorNota = info.infoAluno.desempenho[nomeNota];
            
            somatorioNotas += valorNota
            document.getElementById('desempenhoAluno').innerHTML += `
            
            <small id="nomeDesempenho${nomeNota}"><b>${nomeNota}</b>: ${valorNota}</small>
            <br><br>
            `
            
        }
    }
    
    document.getElementById('desempenhoAluno').innerHTML += `<div id="somatorioNotas">Somatório: <b>${somatorioNotas}</b></div>`

    document.getElementById('divFrequencias').innerHTML = ''
    for (const data in info.infoAluno.frequencia) {
        if (Object.hasOwnProperty.call(info.infoAluno.frequencia, data)) {
            let diaFrequencia = data.split('T')[0]
            let horaFrequencia = data.split('T')[1]

            document.getElementById('divFrequencias').innerHTML += `
            <div class="row justify-content-start">
                <div class="col-auto" style="background-color: rgba(86,61,124,.15);border: 1px solid rgba(86,61,124,.2);">${diaFrequencia.split('-').reverse().join('/')} ás ${horaFrequencia}</div>
                <div class="col-auto" style="background-color: rgba(86,61,124,.15);border: 1px solid rgba(86,61,124,.2);">Presente</div>
            </div>
            `
            
        }
    }

    document.getElementById('rolaTelaAbaixoAlunos').style.display = 'block'
    document.getElementById('rolaTelaAbaixoAlunos').focus()
    document.getElementById('rolaTelaAbaixoAlunos').style.display = 'none'

    AstNotif.notify('Notas carregadas...', 'Agora você está visualizando as notas do período que você escolheu.', 'agora', {length: 15000})
}

async function followUpAluno(matricula) {
    
    if (matricula == '00000' || matricula == '') {
        AstNotif.dialog('Atenção', 'Você deve clicar em um aluno para descrever um follow up.')
        loaderRun()
    } else {
        let snapshot = await followUpRef.once('value')
            const aluno = alunos[matricula] != undefined ? alunos[matricula] : (await alunosDesativadosRef.child(matricula + '/dadosAluno').once('value')).val() 
            let id
            let followUpSalvos
            if (snapshot.exists() == false) {
                id = 0
            } else {
                followUpSalvos = snapshot.val()
                for (const idFollow in followUpSalvos) {
                    if (Object.hasOwnProperty.call(followUpSalvos, idFollow)) {
                        const followUp = followUpSalvos[idFollow];
                        id = Number(idFollow) + 1
                    }
                }
            }
            abrirModal('modal', 'Adicionar um Follow Up', `
                <form id="adicionarFollowUpAluno" >
                    <label>Nome: ${aluno.nomeAluno}</label> | <label>Matrícula: ${aluno.matriculaAluno}</label>

                    <div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <span class="input-group-text" id="basic-addon3">ID do FollowUp</span>
                        </div>
                        <input type="text" class="form-control" id="idFollowUpAluno" name="idFollowUpAluno" aria-describedby="basic-addon3" readonly value="${id}">
                    </div>
                    <div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <span class="input-group-text" id="tituloFollowUpAluno" >Título</span>
                        </div>
                        <input type="text" class="form-control" name="tituloFollowUpAluno" id="basic-url" aria-describedby="basic-addon3">
                    </div>
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <span class="input-group-text">Descrição</span>
                        </div>
                        <textarea class="form-control" aria-label="With textarea" name="descricaoFollowUp"></textarea>
                    </div>
                    <br>
                    <button class="btn btn-primary" type="submit" id="salvarFollowUpAluno">Salvar Follow Up</button>
                    <input type="text" name="matriculaFollowUp" id="matriculaFollowUp" value="${aluno.matriculaAluno}" style="display: none">
                    <input type="text" name="nomeFollowUp" id="nomeFollowUp" value="${aluno.nomeAluno}" style="display: none">
                </form>`,
                `<button class="btn btn-secondary" data-dismiss="modal">Cancelar</button><button class="btn btn-primary" data-dismiss="modal" onclick="carregaFollowUps('${aluno.matriculaAluno}')">Ver todos os Follow Up do aluno</button>`
            )
            document.querySelector('#adicionarFollowUpAluno').addEventListener('submit', (e) => {
                e.preventDefault()
                loader.style.display = 'block'
                loaderMsg.innerText = 'Carregando dados do FollowUp...'
                const dados = new FormData(e.target);
                let dadosFollowUp = {}
                dadosFollowUp.nome = dados.get('nomeFollowUp')
                dadosFollowUp.matricula = dados.get('matriculaFollowUp')
                dadosFollowUp.descricao = dados.get('descricaoFollowUp')
                dadosFollowUp.titulo = dados.get('tituloFollowUpAluno')
                dadosFollowUp.id = dados.get('idFollowUpAluno')
                dadosFollowUp.autor = usuarioAtual().displayName
                console.log(dadosFollowUp)
                followUpRef.child(dadosFollowUp.id).set(dadosFollowUp).then(() => {
                    AstNotif.notify('Sucesso', 'O FollowUp foi salvo com sucesso.', 'agora', {length: -1})
                    loaderRun()
                }).catch(error =>{
                    AstNotif.dialog('Erro', error.message)
                    console.log(error)
                    loaderRun()
                })
            })
        
        
    }
}

function carregaFollowUps(matricula='') {
    loader.style.display = 'block'
    loaderMsg.innerText = 'Carregando Follow Up...'
    setTimeout(() => {
        followUpRef.orderByChild('matricula').equalTo(matricula).once('value').then(snapshot => {
            abrirModal('modal', `FollowUp(s) cadastrado(s)`,
                `
                <label id="nomeAlunoDoFollowUp"></label>
                <div class="overflow-auto" style="height: fit-content; max-height: 280px;">
                    <div class="list-group" id="listaFollowUpAluno">
    
                    </div>
                </div>
                `
                , `<button class="btn btn-secondary" data-dismiss="modal">Cancelar</button>`
            )
            let listaFollowUpAluno = document.getElementById('listaFollowUpAluno')
            listaFollowUpAluno.innerHTML = ''
            for (const id in snapshot.val()) {
                if (Object.hasOwnProperty.call(snapshot.val(), id)) {
                    const followUp = snapshot.val()[id];
                    document.getElementById('nomeAlunoDoFollowUp').innerText = followUp.nome + ' | ' + followUp.matricula
                    listaFollowUpAluno.innerHTML += `<button class="list-group-item list-group-item-action" onclick="verFollowUp('${id}')"><b>Título:</b> ${followUp.titulo}</button>`
                }
            }
            loaderRun()
        }).catch((error) => {
            console.log(error)
            AstNotif.dialog('Erro', error.message)
            loaderRun()
        })
    }, 1000)
    
}

function verFollowUp(id) {
    loader.style.display = 'block'
    loaderMsg.innerText = 'Carregando FollowUp...'
    followUpRef.child(id).once('value').then(snapshot => {
        AstNotif.dialog(snapshot.val().titulo, snapshot.val().descricao + ' <br><br> <b>Autor do FollowUp:</b> ' + snapshot.val().autor, {positive: "OK",negative: ''})

        loaderRun()
    }).catch(error => {
        AstNotif.dialog('Erro', error.message)
        console.log(error)
        loaderRun()
    })
    
}

function addResponsavelAutorizado(matricula) {
    abrirModal('modal', 'Adicionar um reponsável autorizado', `
    <form id="formAddResponsavel">
        <label class="h6">Dados do responsável autorizado</label>
        <div class="form-row border border-success rounded">
        
        <div class="form-group col-md-4">
            <label for="inputAddress">Responsável</label>
            <input type="text" class="form-control" id="addResponsavelNome" name="addResponsavelNome" placeholder="Nome" onblur="maiusculo(this)">
        </div>
        <div class="form-group col-md-2">
            <label for="inputAddress">Relação</label>
            <br>
            <select class="form-control form-control-md" name="addResponsavelRelacao" id="addResponsavelRelacao">
            <option hidden selected>Escolha...</option>
            <option value="Mãe">Mãe</option>
            <option value="Pai">Pai</option>
            <option value="Tio/Tia">Tio/Tia</option>
            <option value="Avô/Avó">Avô/Avó</option>
            <option value="Outros">Outros</option>
            </select>
        </div>
        <div class="form-group col-md-2">
            <label for="inputAddress">Número Celular</label>
            <input type="text" class="form-control" id="addResponsavelNumeroCelular" name="addResponsavelNumeroCelular" placeholder="Celular">
        </div>
        <div class="form-group col-md-5">
            <label for="inputPassword4">Email</label>
            <input type="email" class="form-control" id="addResponsavelEmail" name="addResponsavelEmail" placeholder="Email">
        </div>
        <div class="form-group col-auto">
            <label for="inputEmail4">RG</label>
            <input type="text" class="form-control" id="addResponsavelRg" name="addResponsavelRg" placeholder="RG">
        </div>
        <div class="form-group col-auto">
            <label for="inputPassword4">CPF</label>
            <input type="text" class="form-control" id="addResponsavelCpf" name="addResponsavelCpf" placeholder="CPF" onchange="verificaCPF(this)">
            <small id="cpfHelp3" class="form-text text-muted">Digite um CPF válido, existe um algoritmo de validação neste campo.</small>
        </div>
        <div class="custom-control custom-checkbox">
        &nbsp;&nbsp;
            <input type="checkbox" class="custom-control-input" id="pedagogico" name="pedagogico">
            <label class="custom-control-label" for="pedagogico">Responsável pedagógico</label>
        </div>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <div class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input" id="financeiro" name="financeiro">
            <label class="custom-control-label" for="financeiro">Responsável financeiro</label>
        </div>
        </div>
        <button id="addResponsavelAutorizado" class="btn btn-primary float-md-right" type="submit" style="margin-top: 10px;">Adicionar</button>
    </form>
    `, `<button class="btn btn-secondary" data-dismiss="modal">Fechar</button>`);

    document.getElementById('formAddResponsavel').addEventListener('submit', (e) => {
        e.preventDefault();
        const dados = new FormData(e.target);
        let responsavel = {
            nome: dados.get('addResponsavelNome'),
            relacao: dados.get('addResponsavelRelacao'),
            celular: dados.get('addResponsavelNumeroCelular'),
            email: dados.get('addResponsavelEmail'),
            rg: dados.get('addResponsavelRg'),
            cpf: dados.get('addResponsavelCpf'),
            financeiro: dados.get('financeiro') == 'on' ? true : false,
            pedagogico: dados.get('pedagogico') == 'on' ? true : false
        };

        alunosRef.child(matricula).child('responsaveis').push(responsavel).then(() => {
            document.getElementById('formAddResponsavel').reset();
            $('#modal').modal('hide');
            AstNotif.notify('Sucesso', 'Responsável cadastrado com sucesso');
        }).catch(error => {
            AstNotif.dialog('Erro', error.message);
        })
    })
}

// document.getElementById('formBuscaResponsavel').addEventListener('submit', (e) => {
//     e.preventDefault();
//     let respAutorizadosRef = firebase.database().ref('sistemaEscolar/secretaria/responsaveisAutorizados')
//     let dados = new FormData(e.target);
//     let nome = dados.get('nomeBuscaResponsavel');
//     nome = maiusculo(document.getElementById('nomeBuscaResponsavel'))
//     respAutorizadosRef.orderByChild('addResponsavelNome').equalTo(nome).once('value', (resp) => {
//         let dadosResp = resp.val()
//         let dadosResponsavel = []
//         for (const key in dadosResp) {
//             if (Object.hasOwnProperty.call(dadosResp, key)) {
//                 dadosResponsavel.push(dadosResp[key])
//             }
//         }

//         if (dadosResponsaveis.length > 1) {
            
//         } else {
            
//             $('#modalConsultaResponsaveis').modal('hide');
//             abrirModal('modal', 'Responsável', `
//                 <form id="formVerResponsavel">
//                     <label class="h6">Dados do responsável autorizado</label>
//                     <div class="form-row border border-success rounded">
                    
//                     <div class="form-group col-md-4">
//                         <label for="inputAddress">Responsável</label>
//                         <input type="text" class="form-control" id="addResponsavelNome" name="addResponsavelNome" placeholder="Nome" onblur="maiusculo(this)" readonly>
//                     </div>
//                     <div class="form-group col-md-2">
//                         <label for="inputAddress">Relação</label>
//                         <br>
//                         <select class="form-control form-control-md" name="addResponsavelRelacao" id="addResponsavelRelacao" readonly>
//                         <option hidden selected>Escolha...</option>
//                         <option value="Mãe">Mãe</option>
//                         <option value="Pai">Pai</option>
//                         <option value="Tio/Tia">Tio/Tia</option>
//                         <option value="Avô/Avó">Avô/Avó</option>
//                         <option value="Outros">Outros</option>
//                         </select>
//                     </div>
//                     <div class="form-group col-md-3">
//                         <label for="inputAddress">Número Celular</label>
//                         <input type="text" class="form-control" id="addResponsavelNumeroCelular" name="addResponsavelNumeroCelular" placeholder="Celular" readonly>
//                     </div>
//                     <div class="form-group col-md-5">
//                         <label for="inputPassword4">Email</label>
//                         <input type="email" class="form-control" id="addResponsavelEmail" name="addResponsavelEmail" placeholder="Email" readonly>
//                     </div>
//                     <div class="form-group col-auto">
//                         <label for="inputEmail4">RG</label>
//                         <input type="text" class="form-control" id="addResponsavelRg" name="addResponsavelRg" placeholder="RG" readonly>
//                     </div>
//                     <div class="form-group col-auto">
//                         <label for="inputPassword4">CPF</label>
//                         <input type="text" class="form-control" id="addResponsavelCpf" name="addResponsavelCpf" placeholder="CPF" onchange="verificaCPF(this)" readonly>
//                         <small id="cpfHelp3" class="form-text text-muted">Digite um CPF válido, existe um algoritmo de validação neste campo.</small>
//                     </div>
//                     </div>
//                 </form>
//                 <section>
//                     <label class="h6">Dados do aluno</label>
                    
//                     <div class="row form-row">
//                         <div class="form-group col-md-4">
//                             <label for="inputAddress">Nome</label>
//                             <input type="text" class="form-control" id="nomeAlunoRespAutorizado" placeholder="Nome" onblur="maiusculo(this)" readonly>
//                         </div>
//                         <div class="form-group col-md-4">
//                             <label for="inputAddress">Turma</label>
//                             <input type="text" class="form-control" id="turmaAlunoRespAutorizado" placeholder="Turma" readonly>
//                         </div>

//                         <div class="form-group col-md-4">
//                             <br>
//                             <button class="btn btn-primary mt-2" id="abreDadosAlunoRespAutorizado">Abrir dados do aluno</button>
//                         </div>
//                     </div>
//                 </section>
//                 `, `<button class="btn btn-secondary" data-dismiss="modal">Fechar</button>`);
//                 let formElement = document.getElementById('formVerResponsavel');
//                 // let dados = new FormData(formElement);
//                 let matricula
//                 for(let key in dadosResponsavel[0]) {
//                     let field = dadosResponsavel[0][key];
//                     console.log(key, field);
//                     document.getElementById(key).value = field;
//                     if (key == 'matriculaAluno'){
//                         matricula = field
//                         console.log(matricula)
//                         retornaDadosAluno(matricula).then(dadosAluno => {
//                             console.log(dadosAluno)
//                             document.getElementById('nomeAlunoRespAutorizado').value = dadosAluno.nomeAluno
//                             document.getElementById('turmaAlunoRespAutorizado').value = dadosAluno.turmaAluno
//                         }).catch(error => {
//                             AstNotif.dialog('Erro', error.message)
//                         })
//                     } 
//                 }

//                 document.getElementById('abreDadosAlunoRespAutorizado').addEventListener('click', (e) => {
//                     e.preventDefault()
//                     $('#modal').modal('hide')
//                     document.getElementById('btnAbaAlunos').click()
//                     abreDadosDoAluno(matricula)
                    
//                 })

                
                
//         }
//     })
// })

function mostraDadosResponsaveis() {
    

    function mostraResponsaveisCadastrados() {
        abrirModal('modal', 'Ver dados dos responsáveis', 
        `
        <section id="mostraResponsaveis">

        </section>
        
        `, 
        `<button class="btn btn-secondary" data-dismiss="modal">Fechar</button>`
    )
        let responsaveis = dadosResponsaveis
        let sectionResponsaveis = document.getElementById('mostraResponsaveis')
        console.log(responsaveis)
        sectionResponsaveis.innerHTML = ''
        for (const i in responsaveis) {
            if (Object.hasOwnProperty.call(responsaveis, i)) {
                const responsavel = responsaveis[i];
                sectionResponsaveis.innerHTML += `
                <div class="form-row border border-success rounded">
                
                <div class="form-group col-md-4">
                    <label for="inputAddress">Responsável</label>
                    <input type="text" class="form-control" id="nome${i}" name="nome" placeholder="Nome" onblur="maiusculo(this)" disabled value="${responsavel.nome}">
                </div>
                <div class="form-group col-md-2">
                    <label for="inputAddress">Relação</label>
                    
                    <input type="text" class="form-control form-control-md" value="${responsavel.relacao}" name="relacao" id="relacao${i}" disabled>
                </div>
                <div class="form-group col-md-3">
                    <label for="inputAddress">Número Celular</label>
                    <input type="text" class="form-control" id="celular${i}" value="${responsavel.celular}" name="celular" placeholder="Celular" disabled>
                </div>
                <div class="form-group col-auto">
                    <label for="inputAddress">Editar/Apagar</label>
                    <button class="btn btn-primary form-control" name="editaResp" id="editaResp${i}">Editar</button>
                </div>
                <div class="form-group col-md-5">
                    <label for="inputPassword4">Email</label>
                    <input type="email" class="form-control" id="email${i}" value="${responsavel.email}" name="email" placeholder="Email" disabled>
                </div>
                
                <div class="form-group col-auto">
                    <label for="inputEmail4">RG</label>
                    <input type="text" class="form-control" id="rg${i}" value="${responsavel.rg}" name="rg" placeholder="RG" disabled>
                </div>
                
                <div class="form-group col-auto">
                    <label for="inputPassword4">CPF</label>
                    <input type="text" class="form-control" id="cpf${i}" value="${responsavel.cpf}" name="cpf" placeholder="CPF" onchange="verificaCPF(this)" disabled>
                    <small id="cpfHelp3" class="form-text text-muted">Digite um CPF válido, existe um algoritmo de validação neste campo.</small>
                </div>
                    <div class="custom-control custom-checkbox">
                    &nbsp;&nbsp;
                        <input type="checkbox" class="custom-control-input" ${responsavel.pedagogico ? 'checked' : null} disabled id="pedagogico${i}" name="pedagogico">
                        <label class="custom-control-label" for="pedagogico${i}">Responsável pedagógico</label>
                    </div>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <div class="custom-control custom-checkbox">
                        <input type="checkbox" class="custom-control-input" ${responsavel.financeiro ? 'checked' : null} disabled id="financeiro${i}" name="financeiro">
                        <label class="custom-control-label" for="financeiro${i}">Responsável financeiro</label>
                    </div>
                </div>
                <br>
                `

                // for (const id in responsavel) {
                //     if (Object.hasOwnProperty.call(responsavel, id)) {
                //         const value = responsavel[id];
                //         console.log(value)
                //         document.getElementById(id + i).value = value
                //         if (id == 'pedagogico' || id == 'financeiro') {
                //             document.getElementById(id + i).checked = value
                //         }
                //     }
                // }
            }
        }
        escutaEditaResp()
    }
    
    mostraResponsaveisCadastrados()
    function escutaEditaResp() {
        document.getElementsByName('editaResp').forEach(elem => {
            elem.addEventListener('click', (e) => {
                let index = e.target.id.split('editaResp')[1];
                editaResp(index);
            })
        })
    }

    function editaResp(i) {
        let responsaveis = dadosResponsaveis
        let sectionResponsaveis = document.getElementById('mostraResponsaveis')
        let responsavel = responsaveis[i]
        abrirModal('modal', 'Editar dados do responsável', `
        <form id="formEditaResp">
            <label class="h6">Dados do responsável autorizado</label>
            <div class="form-row border border-success rounded">
            
            <div class="form-group col-md-4">
                <label for="inputAddress">Responsável</label>
                <input type="text" class="form-control" id="nome" name="nome" placeholder="Nome" onblur="maiusculo(this)">
            </div>
            <div class="form-group col-md-2">
                <label for="inputAddress">Relação</label>
                <br>
                <select class="form-control form-control-md" name="relacao" id="relacao" >
                <option hidden selected>Escolha...</option>
                <option value="Mãe">Mãe</option>
                <option value="Pai">Pai</option>
                <option value="Tia">Tia</option>
                <option value="Tio">Tio</option>
                <option value="Avó">Avó</option>
                <option value="Avô">Avô</option>
                <option value="Responsável">Responsável</option>
                </select>
            </div>
            <div class="form-group col-md-3">
                <label for="inputAddress">Número Celular</label>
                <input type="text" class="form-control" id="celular" name="celular" placeholder="Celular">
            </div>
            <div class="form-group col-md-5">
                <label for="inputPassword4">Email</label>
                <input type="email" class="form-control" id="email" name="email" placeholder="Email">
            </div>
            <div class="form-group col-auto">
                <label for="inputEmail4">RG</label>
                <input type="text" class="form-control" id="rg" name="rg" placeholder="RG">
            </div>
            <div class="form-group col-auto">
                <label for="inputPassword4">CPF</label>
                <input type="text" class="form-control" id="cpf" name="cpf" placeholder="CPF" onchange="verificaCPF(this)">
                <small id="cpfHelp3" class="form-text text-muted">Digite um CPF válido, existe um algoritmo de validação neste campo.</small>
            </div>
            
                <div class="custom-control custom-checkbox">
                &nbsp;&nbsp;
                    <input type="checkbox" class="custom-control-input" id="pedagogico" name="pedagogico">
                    <label class="custom-control-label" for="pedagogico">Responsável pedagógico</label>
                </div>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" id="financeiro" name="financeiro">
                    <label class="custom-control-label" for="financeiro">Responsável financeiro</label>
                </div>
            </div>
            <br>
            <button type="submit" class="btn btn-primary btn-block">Salvar</button>
        </form>
        `, `<button class="btn btn-secondary" data-dismiss="modal">Fechar</button>`)

        for (const field in responsavel) {
            if (Object.hasOwnProperty.call(responsavel, field)) {
                const value = responsavel[field];
                document.getElementById(field).value = value;
                if (field == 'pedagogico' || field == 'financeiro') {
                    document.getElementById(field).checked = true
                }
                
            }
        }

        let formEditaResp = document.getElementById('formEditaResp')
        formEditaResp.addEventListener('submit', (e) => {
            e.preventDefault();
            let dadosResponsavel = {}
            
            let formData = new FormData(formEditaResp)
            let dadosForm = $('#formEditaResp').serializeArray();
            dadosForm.forEach(field => {
                let values = formData.getAll(field.name)
                values.length == 1 ? dadosResponsavel[field.name] = values[0] : dadosResponsavel[field.name] = values
                if (field.name == 'pedagogico' || field.name == 'financeiro') {
                    dadosResponsavel[field.name] = true
                }
            })
            responsaveis[i] = dadosResponsavel
            
            let matriculaAluno = document.getElementById('mostraMatriculaAluno').innerText
            alunosRef.child(matriculaAluno).child('responsaveis').set(responsaveis).then(() => {
                $('#modal').modal('hide');
                mostraResponsaveisCadastrados()
                AstNotif.notify('Sucesso', 'Responsável editado e salvo com sucesso!', 'agora', {length: 5000})
            }).catch(error => {
                console.log(error)
                AstNotif.dialog('Erro', error.message)
            })

           
        })
    }
}

function carregaHistoricoAluno(matricula) {
    let listaHistoricoAluno = document.getElementById('listaHistoricoAluno')
    listaHistoricoAluno.innerHTML = ''
    try {
        const historico = alunos[matricula].historico
        for (const key in historico) {
            if (Object.hasOwnProperty.call(historico, key)) {
                const infos = historico[key];
                if (infos.operacao == 'Transferência de alunos') {
                    listaHistoricoAluno.innerHTML += `<button class="list-group-item list-group-item-action" onclick="verOperacaoAluno('${matricula}', '${key}')"><b>Operação:</b> ${infos.operacao}: ${infos.dados.turmaAtual} --> ${infos.dados.turmaParaQualFoiTransferido}</button>`
                } else if(infos.operacao == 'Desativação de aluno') {
                    listaHistoricoAluno.innerHTML += `<button class="list-group-item list-group-item-action" onclick="verOperacaoAluno('${matricula}', '${key}')"><b>Operação:</b> ${infos.operacao}: ${infos.dados.turmaAtual} --> Desativado</button>`
                } else if (infos.operacao == 'Reativação de aluno') {
                    listaHistoricoAluno.innerHTML += `<button class="list-group-item list-group-item-action" onclick="verOperacaoAluno('${matricula}', '${key}')"><b>Operação:</b> ${infos.operacao}: Aluno reativado na turma ${infos.dados.turmaAtivacao}</button>`
                }
            }
        }
    } catch (error) {
        const historico = alunosDesativados[matricula].dadosAluno.historico
        for (const key in historico) {
            if (Object.hasOwnProperty.call(historico, key)) {
                const infos = historico[key];
                if (infos.operacao == 'Transferência de alunos') {
                    listaHistoricoAluno.innerHTML += `<button class="list-group-item list-group-item-action" onclick="verOperacaoAluno('${matricula}', '${key}')"><b>Operação:</b> ${infos.operacao}: ${infos.dados.turmaAtual} --> ${infos.dados.turmaParaQualFoiTransferido}</button>`
                } else if(infos.operacao == 'Desativação de aluno') {
                    listaHistoricoAluno.innerHTML += `<button class="list-group-item list-group-item-action" onclick="verOperacaoAluno('${matricula}', '${key}')"><b>Operação:</b> ${infos.operacao}: ${infos.dados.turma} --> Desativado</button>`
                } else if (infos.operacao == 'Reativação de aluno') {
                    listaHistoricoAluno.innerHTML += `<button class="list-group-item list-group-item-action" onclick="verOperacaoAluno('${matricula}', '${key}')"><b>Operação:</b> ${infos.operacao}: Aluno reativado na turma ${infos.dados.turmaAtivacao}</button>`
                }
            }
        }
    }
    
}

function verOperacaoAluno(matricula, key) {
    const infos = alunos[matricula].historico[key]
    let corpo = `
        
    `
    abrirModal('modal', 'Visualização da operação ' + infos.operacao, corpo, `<button class="btn btn-secondary" data-dismiss="modal">Fechar</button>`)
}



function gerarFichaAluno(matricula) {
    document.getElementById('corpoMatricula').innerHTML = `<iframe src="../resources/pdfsProntos/documento.html#fichaCadastral?${matricula}" frameborder="0" width="100%" height="400px" id="fichaPdf" name="fichaPdf"></iframe>`
    $('#matriculaModal').modal({backdrop: 'static'})
}

// Funções de enviar emails
async function abaEmail() {
    let abreEscreveEmail = document.getElementById('abreEscreveEmail')
    let db = firebase.firestore()
    let atualizaEmail = document.getElementById('atualizaEmail')
    let sentTab = document.getElementById('sentTab')
    let emailLengthPage = document.getElementById('emailLengthPage')
    
    abreEscreveEmail.addEventListener('click', handleEmailWriting)

    carregaEmails()

    atualizaEmail.addEventListener('click', (e) => {
        carregaEmails();
    })

    async function lastUpdate() {
        let lastUpdatedEmail = document.getElementById('lastUpdatedEmail')
        let timestampNow = firebase.functions().httpsCallable('timestamp')
        timestampNow().then(function(result) {
            let timestamp = new Date(result.data.timestamp._seconds * 1000)
            lastUpdatedEmail.innerText = timestamp.toLocaleTimeString()
            console.log(timestamp.toLocaleTimeString())
        }).catch(error => {
            console.log(error)
            AstNotif.dialog('Erro', error.message)
        })
    }

    function emailButtons() {
        document.querySelectorAll('.emailButton').forEach(item => {
            item.addEventListener('click', (e) => {
                openEmail(e.target.id)
                
            })
        })
    }

    async function openEmail(id) {
        let mailRef = db.collection('mail').doc(id)
        console.log(id)
        try {
            let doc = await mailRef.get()
            if (doc.exists) {
                console.log("Document data:", doc.data());
                let email = doc.data()
                let endTimeTimestamp = new Date(email.delivery.endTime.seconds * 1000)
                let endTime = `${endTimeTimestamp.toLocaleTimeString()} ${endTimeTimestamp.toLocaleDateString()}`
                let startTimeTimestamp = new Date(email.delivery.startTime.seconds * 1000)
                let startTime = `${startTimeTimestamp.toLocaleTimeString()} ${startTimeTimestamp.toLocaleDateString()}`

                abrirModal('modal', `Email enviado: ${email.message.subject}`, ` 
                <div class="form-group">
                    <label for="toEmail">Para:</label>
                    <input name="to" readonly type="email" value="${email.to}" id="toEmail" class="form-control demo-default selectized" placeholder="Para">
            
                </div>
                
                <div class="form-group">
                    <label for="toEmail">Cc:</label>
                    <input name="cc" readonly id="ccEmail" type="email" class="form-control demo-default selectized" placeholder="Cc" value="${email.cc}">
                </div>
                <div class="form-group">
                    <label for="toEmail">Bcc:</label>
                    <input name="bcc" readonly id="bccEmail" type="email" class="form-control demo-default selectized" placeholder="Bcc" value="${email.bcc}">
                </div>
                <div class="form-group">
                    <label for="toEmail">Assunto:</label>
                    <input name="subject" value="${email.message.subject}" readonly type="text" class="form-control" placeholder="Assunto">
                </div>
                <div class="form-group">
                    <label for="toEmail">Mensagem:</label>
                    <textarea name="message" readonly id="email_message" class="form-control" placeholder="Message" style="height: 120px;">${email.message.text}</textarea>
                </div>
                <div class="form-group">
                    <input type="file" readonly name="attachment">
                </div>
                <div class="container">
                    <h5>Relatório de entrega do e-mail</h5>
                    <ul style="list-style-type:disc">
                        <li>Data e Hora que entrou na fila de envio: ${startTime}</li>
                        <li>Data e Hora que foi entregue: ${endTime}</li>
                        <li>Tentativa(s) de envio: ${email.delivery.attempts}</li>
                        <li>Status do Envio: ${email.delivery.state}</li>
                        <li>ID da mensagem: ${email.delivery.info.messageId}</li>
                    </ul>
                </div>
                `, `<button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`)
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        } catch (error) {
            AstNotif.dialog('Erro', error.message)
        }
        

    }

    async function carregaEmails(limit = 20, listen=true) {
        
        let first = db.collection("mail").orderBy('delivery', 'desc').limit(limit)
        first.get().then(async (querySnapshot) => {
            let emails = [];
            querySnapshot.forEach((doc) => {
                emails.push({data: doc.data(), id: doc.id});
            })

            sentTab.innerHTML = `
                <table class="table table-striped table-hover">
                    <tbody id="sentEmailTable">
                        <tr>
                            <td>
                                <btn class="btn btn-outline-primary">
                                    <input type="checkbox" class="all" title="select all"> Tudo 
                                </btn>
                            </td>
                            <td>
                                <button class="btn btn-light"><i title="delete selected" data-feather="trash"></i></button>
                                
                            </td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>    
                `
            let sentEmailTable = document.getElementById('sentEmailTable')
            emails.forEach(email => {
                console.log(email)
                let endTimeTimestamp = new Date(email.data.delivery.endTime.seconds * 1000)
                let endTime = `${endTimeTimestamp.toLocaleTimeString()} ${endTimeTimestamp.toLocaleDateString()}`
                sentEmailTable.innerHTML += `
                <tr>
                
                    <td>
                        <label>
                            <input type="checkbox">
                        </label> 
                        <a class="name text-truncate emailButton" style="cursor:pointer;" id="${email.id}">${email.data.to}</a>
                    </td>
                     <td>
                        <span class="subject">${email.data.message.subject}</span>
                        <small class="text-muted d-block text-truncate" style="width: 400px;">${email.data.message.text}</small>
                    </td>
                    <td><span class="badge" data-toggle="tooltip" title="Horário que o servidor entregou a mensagem">${endTime}</span> <a style="cursor:pointer;"><span data-feather="eye" data-toggle="tooltip" title="Abrir e-mail"></span></a></td>
                </tr>
                `

            })

            if (emails.length == 0) {
                sentTab.innerHTML = `
                <div class="list-group">
                    <div class="list-group-item">
                        <span class="text-center">Esta caixa está vazia.</span>
                    </div>
                </div>
                `
                emailLengthPage.innerText = '0'
            }
            
            emailLengthPage.innerText = emails.length

            console.log(console.log(emails))
            feather.replace()
            $(function () {
                $('[data-toggle="tooltip"]').tooltip()
            })

            emailButtons()
            lastUpdate()
            listen ? listenEmails() : null;
            
        }).catch((error) => {
            console.log(error)
        });
    }

    async function listenEmails() {
        db.collection("mail")
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === "added") {
                        console.log("New city: ", change.doc.data());
                    }
                    if (change.type === "modified") {
                        console.log("Modified city: ", change.doc.data());
                    }
                    if (change.type === "removed") {
                        console.log("Removed city: ", change.doc.data());
                    }
                });
            });
    }

    async function searchEmails(input) {
        let emails = await alunosRef.orderByChild('emailAluno').startAt(input).limitToFirst(15).once('value')
        console.log(emails.val())
        let alunos = emails.val()
        let lista = []
        for (const matricula in alunos) {
            if (Object.hasOwnProperty.call(alunos, matricula)) {
                const email = alunos[matricula];
                lista.push({name: email.nomeAluno, email: email.emailAluno})
                lista.push({name: email.nomeResponsavelFinanceiroAluno, email: email.emailresponsavelFinanceiro})
                lista.push({name: email.nomeResponsavelPedagogicoAluno, email: email.emailResponsavelPedagogico})
            }
        }
        return lista;
    }

    async function handleEmailWriting(e) {
        
        let emailForm = document.getElementById('emailForm')
        
        

        emailForm.addEventListener('submit', async (e) => {
            e.preventDefault()
            loaderRun(true, 'Enviando dados...')
            
            

            let emailRaw = $("#emailForm").serializeArray()
            let email = {}
            emailRaw.forEach(elem => {
                email[elem.name] = elem.value
            })
            console.log(email)
            let emailContent = {
                to: email.to,
                cc: email.cc,
                bcc: email.bcc,
                message: {
                    subject: email.subject,
                    text: email.message,
                    html: email.message
                },
            }

            db.collection('mail').add(emailContent).then(() => {
                AstNotif.notify('Sucesso', 'Seu email entrou na fila de envio de e-mails e logo será enviado.', 'agora',  {length: 5000})
                $('#escreverEmail').modal('hide')
                loaderRun()
            }).catch(error => {
                console.log(error)
                AstNotif.dialog('Erro', error.message)
                loaderRun()
            })
            
            
            
        })


        $("#toEmail").selectize({
            plugins: ["remove_button"],
            delimiter: ",",
            persist: true,
            load: function(query, callback) {
                var selectize = this
                if (!query.length) return callback();

                searchEmails(query).then(emails => {
                    callback(emails)
                    emails.forEach(email => {
                        selectize.addOption({text: `${email.name}: ${email.email}`, value: email.email})
                    })
                    
                    console.log(emails)
                });

                
            },
            create: function (input) {
                
                return {
                    value: input,
                    text: input,
                };
            },
        });

        $("#ccEmail").selectize({
            plugins: ["remove_button"],
            delimiter: ",",
            persist: true,
            load: function(query, callback) {
                var selectize = this
                if (!query.length) return callback();

                searchEmails(query).then(emails => {
                    callback(emails)
                    emails.forEach(email => {
                        selectize.addOption({text: `${email.name}: ${email.email}`, value: email.email})
                    })
                    
                    console.log(emails)
                });

                
            },
            create: function (input) {
                
                return {
                    value: input,
                    text: input,
                };
            },
        });

        $("#bccEmail").selectize({
            plugins: ["remove_button"],
            delimiter: ",",
            persist: true,
            load: function(query, callback) {
                var selectize = this
                if (!query.length) return callback();

                searchEmails(query).then(emails => {
                    callback(emails)
                    emails.forEach(email => {
                        selectize.addOption({text: `${email.name}: ${email.email}`, value: email.email})
                    })
                    
                    console.log(emails)
                });

                
            },
            create: function (input) {
                
                return {
                    value: input,
                    text: input,
                };
            },
        });
    }
}

// Funções da aba Alunos Desativados
var tipoDeBuscaDesativados = 'dadosAluno/nomeAluno'
var alunosDesativados

document.querySelector('#ordenaNomeDesativados').addEventListener('click', (e) => {
    tipoDeBuscaDesativados = 'dadosAluno/nomeAluno'
    carregaAlunosDesativados()
})
document.querySelector('#ordenaMatriculaDesativados').addEventListener('click', (e) => {
    carregaAlunosDesativados(true)
})
document.querySelector('#ordenaUltimaTurmaDesativados').addEventListener('click', (e) => {
    tipoDeBuscaDesativados = 'dadosAluno/turmaAluno'
    carregaAlunosDesativados()
})

function carregaAlunosDesativados(matricula=false,filtro='', numPrimeiros=20, numUltimos=20) {
    loader.style.display = 'block'
    loaderMsg.innerText = 'Carregando alunos desativados...'
    let alunosDesativadosRef = firebase.database().ref('sistemaEscolar/alunosDesativados')
    let listaAlunosDesativados = document.getElementById('listaAlunosDesativados')
    if (matricula) {
        alunosDesativadosRef = alunosDesativadosRef.orderByValue()
    } else {
        alunosDesativadosRef = alunosDesativadosRef.orderByChild(tipoDeBuscaDesativados)
        console.log(tipoDeBuscaDesativados)
    }
    
    alunosDesativadosRef.once('value').then(snapshot => {
        alunosDesativados = snapshot.val()
        loaderRun()
        let alunos = snapshot.val()
        listaAlunosDesativados.innerHTML = ''
        let c = 0
        for (const matricula in alunos) {
            if (Object.hasOwnProperty.call(alunos, matricula)) {
                const dados = alunos[matricula];
                c++
                listaAlunosDesativados.innerHTML += `
                
                <tr>
                    <td>
                        <span class="custom-checkbox">
                        <input type="checkbox" id="checkbox${c}" name="options[]" value="1">
                        <label for="checkbox${c}"></label>
                        </span>
                    </td>
                    <td><a href="#" onclick="abreDadosDoAlunoDesativado('${matricula}')">${dados.dadosAluno.nomeAluno}</a></td>
                    <td>${matricula}</td>
                    <td>${dados.dadosAluno.turmaAluno}</td>
                    <td>
                        <a href="#" class="action" onclick="ativarAluno('${matricula}')" data-toggle="tooltip" title="Reativar Aluno"><i data-feather="user-check"></i></a>
                        <a href="#deleteEmployeeModal" class="delete" data-toggle="modal" data-toggle="tooltip" title="Deletar aluno"><i data-feather="trash" ></i></a>
                    </td>
                </tr>
                
                
                `
            }
        }
        feather.replace()
        $('[data-toggle="tooltip"]').tooltip();
        ativaCheckboxes()
        

    }).catch(error =>{ 
        AstNotif.dialog('Erro', error.message)
        loaderRun()
    })
    
    
}

function opcoesAlunoDesativado(matricula) {
    let dadosAluno = alunosDesativados[matricula].dadosAluno
    abrirModal('modal', 'Aluno desativado', 
        `
            ${dadosAluno.nomeAluno}, Nº de matrícula: ${matricula}, está desativado(a). 
            Você pode reativá-lo em alguma turma, ou pode simplesmente consultar os dados cadastrados no sistema.
            <br><br>
            <button type="button" class="btn btn-primary" data-dismiss="modal" onclick="abreDadosDoAlunoDesativado('${matricula}')">Ver dados do aluno</button>
            <button type="button" class="btn btn-info" onclick="ativarAluno('${matricula}')" data-toggle="tooltip" data-placement="top" title="A operação de Reativação de aluno ficará gravada no sistema para futuras consultas.">Reativar aluno</button>
        `,
        `<button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`
    )
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })
}

function ativarAluno(matricula, confirma=false) {
    if (confirma) {
        loader.style.display = 'block'
        loaderMsg.innerText = 'Reativando aluno na turma...'
        let ativaDesativaAlunos = firebase.functions().httpsCallable('ativaDesativaAlunos')
        let dadosAluno = alunosDesativados[matricula].dadosAluno
        let aluno = {}
        let selectTurmasAtiva = document.getElementById('selectTurmasAtiva')
        aluno[matricula] = dadosAluno.nomeAluno
        ativaDesativaAlunos({alunos: aluno, codTurma: selectTurmasAtiva.value, modo: 'ativa'}).then(function(result) {
            loaderRun()
            AstNotif.dialog('Sucesso', result.data.answer)
            $('#modal').modal('hide')
            carregaAlunosDesativados()
        }).catch(function(error){
            AstNotif.dialog('Erro', error.message)
            loaderRun()
        })
    } else {
        let dadosAluno = alunosDesativados[matricula].dadosAluno
        $('#modal').modal('hide')
        setTimeout(function(){
            abrirModal('modal', 'Confirmação', 
            `
                Você está prestes a reativar ${dadosAluno.nomeAluno}, Nº de matrícula ${matricula}.<br>
                Antes de ser desativado, este aluno era vinculado à turma ${dadosAluno.turmaAluno}.<br><br>
                <select class="custom-select" id="selectTurmasAtiva">
                    <option selected hidden>Escolha uma turma...</option>
                </select>
            `,
            `<button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button><button type="button" class="btn btn-primary"  onclick="ativarAluno('${matricula}', true)" data-toggle="tooltip" data-placement="top" title="A operação de Reativação de aluno ficará gravada no sistema para futuras consultas.">Reativar aluno</button>`
            )
            let selectTurmasAtiva = document.getElementById('selectTurmasAtiva')
            turmasRef.once('value').then(snapshot => {
                turmas = snapshot.val()
                for (const cod in turmas) {
                    if (Object.hasOwnProperty.call(turmas, cod)) {
                        const infoDaTurma = turmas[cod];
                        if (infoDaTurma.professor == undefined) {
                            var profReferencia = 'Não cadastrado'
                        } else {
                            var profReferencia = infoDaTurma.professor[0].nome
                        }
                        selectTurmasAtiva.innerHTML += `<option value="${cod}">Turma ${cod} (Prof. ${profReferencia})</option>`
                    }
                }
            }).catch(error => {
                AstNotif.dialog('Erro', error.message)
            })

        }, 600);
        
        
    }
    
}

function abreDadosDoAlunoDesativado(matricula) {
    let dadosAluno = alunosDesativados[matricula].dadosAluno
    let notas = alunosDesativados[matricula].dadosTurma.notas
    console.log(dadosAluno)
    document.getElementById('btnAbaAlunos').click()
    abreDadosDoAluno(matricula, dadosAluno, notas)

    
    setTimeout( function() {
        document.getElementById('rolaTelaAbaixoAlunos').style.display = 'block'
        document.getElementById('rolaTelaAbaixoAlunos').focus()
        document.getElementById('rolaTelaAbaixoAlunos').style.display = 'none'
      }, 300 );
    
}

function alteraTipoDeBuscaDesativados(tipo) {
    tipoDeBuscaDesativados = tipo
}

// Aba de Informações da Escola

function dadosInfoEscola() {
    

    let listaLivros = document.getElementById('listaLivros')
    let listaCursos = document.getElementById('listaCursos')
    let listaChecklist = document.getElementById('listaChecklist')
    let listaChecklistAcompanhamento = document.getElementById('listaChecklistAcompanhamento')
    let horarioComercial
    infoEscolaRef.once('value').then(snapshot => {
        document.getElementById('addHorarioComercial').removeEventListener('click', addHorario)
        let dados = snapshot.val()
        if (dados != null) {
            for (const key in dados.dadosBasicos) {
                if (Object.hasOwnProperty.call(dados.dadosBasicos, key)) {
                    const campo = dados.dadosBasicos[key];
                    document.getElementById(key).value = campo
                    
                    if (key == 'permitirDistribuiNotas') {
                       document.getElementById(key).checked = campo 
                    }
                }
            }
            if (dados.dadosBasicos.hasOwnProperty('horarioComercial')) {
                horarioComercial = dados.dadosBasicos.horarioComercial
            } else {
                horarioComercial = []
            }
            
            let divHorarioComercial = document.getElementById('horarioComercial');
            divHorarioComercial.innerHTML = ''

            let c = horarioComercial.length
            horarioComercial.map((horario, i) => {
                divHorarioComercial.innerHTML += `
                <div class="row" id="horarioComercialRow${i}">
                    <div class="col-auto">
                        <div class="form-group">
                            <label class="h5">Horário ${i + 1}</label>
                            <label for="exampleInputPassword1">Dias da semana:</label>
                            <br>
                            <input type="checkbox" id="dom|${i}" value="0" ${horario.daysOfWeek.indexOf('0') != -1 && 'checked'} name="dias|${i}">
                            <label for="dom|${i}">Domingo</label>

                            <input type="checkbox" id="seg|${i}" value="1" ${horario.daysOfWeek.indexOf('1') != -1 && 'checked'} name="dias|${i}">
                            <label for="seg|${i}">Segunda</label>

                            <input type="checkbox" id="ter|${i}" value="2" ${horario.daysOfWeek.indexOf('2') != -1 && 'checked'} name="dias|${i}">
                            <label for="ter|${i}">Terça</label>

                            <input type="checkbox" id="qua|${i}" value="3" ${horario.daysOfWeek.indexOf('3') != -1 && 'checked'} name="dias|${i}">
                            <label for="qua|${i}">Quarta</label>

                            <input type="checkbox" id="qui|${i}" value="4" ${horario.daysOfWeek.indexOf('4') != -1 && 'checked'} name="dias|${i}">
                            <label for="qui|${i}">Quinta</label>

                            <input type="checkbox" id="sex|${i}" value="5" ${horario.daysOfWeek.indexOf('5') != -1 && 'checked'} name="dias|${i}">
                            <label for="sex|${i}">Sexta</label>

                            <input type="checkbox" id="sab|${i}" value="6" ${horario.daysOfWeek.indexOf('6') != -1 && 'checked'} name="dias|${i}">
                            <label for="sab|${i}">Sábado</label>
                        </div>
                    
                    </div>
                    <div class="col-auto">
                    <div class="form-group">
                        <label for="exampleInputPassword1">Horário do expediente:</label>
                        <div class="input-group mb-3">
                            <div class="input-group-prepend">
                                <span class="input-group-text">Início</span>
                            </div>
                            <input type="time" id="startTime|${i}" required name="startTime|${i}" class="form-control" value="${horario.startTime}">
                            &nbsp;&nbsp;
                            <div class="input-group-prepend">
                                <span class="input-group-text">Fim</span>
                            </div>
                            <input type="time" id="endTime|${i}" required name="endTime|${i}" class="form-control" value="${horario.endTime}">
                            &nbsp;&nbsp;
                            <a class="btn btn-warning" id="removeHorario|${i}" onclick="c--, $('#horarioComercialRow${i}').remove()">Excluir horário</a>
                        </div>
                        
                    </div>
                    </div>
                    
                </div>
                
                `
            })
            
            document.getElementById('addHorarioComercial').addEventListener('click', addHorario)
            
 
            function addHorario(e) {
                let newField = new DOMParser().parseFromString(`
                <div class="row" id="horarioComercialRow${c}">
                    <div class="col-auto">
                        <div class="form-group">
                        <label class="h5">Horário ${c + 1}</label>
                            <label for="exampleInputPassword1">Dias da semana:</label>
                            <br>
                            <input type="checkbox" id="dom|${c}" value="0" name="dias|${c}">
                            <label for="dom|${c}">Domingo</label>

                            <input type="checkbox" id="seg|${c}" value="1" name="dias|${c}">
                            <label for="seg|${c}">Segunda</label>

                            <input type="checkbox" id="ter|${c}" value="2" name="dias|${c}">
                            <label for="ter|${c}">Terça</label>

                            <input type="checkbox" id="qua|${c}" value="3" name="dias|${c}">
                            <label for="qua|${c}">Quarta</label>

                            <input type="checkbox" id="qui|${c}" value="4" name="dias|${c}">
                            <label for="qui|${c}">Quinta</label>

                            <input type="checkbox" id="sex|${c}" value="5" name="dias|${c}">
                            <label for="sex|${c}">Sexta</label>

                            <input type="checkbox" id="sab|${c}" value="6" name="dias|${c}">
                            <label for="sab|${c}">Sábado</label>
                        </div>
                    
                    </div>
                    <div class="col-auto">
                    <div class="form-group">
                        <label for="exampleInputPassword1">Horário do expediente:</label>
                        <div class="input-group mb-3">
                            <div class="input-group-prepend">
                                <span class="input-group-text">Início</span>
                            </div>
                            <input type="time" id="startTime|${c}" required name="startTime|${c}" class="form-control">
                            &nbsp;&nbsp;
                            <div class="input-group-prepend">
                                <span class="input-group-text">Fim</span>
                            </div>
                            <input type="time" id="endTime|${c}" required name="endTime|${c}" class="form-control">
                            &nbsp;&nbsp;
                            <a class="btn btn-warning" id="removeHorario|${c}" name="removeHorario" >Excluir horário</a>
                        </div>
                        
                    </div>
                    </div>
                </div>
                
                `, 'text/html')
                divHorarioComercial.appendChild(newField.body)
                c++
                let removeButtons = document.getElementsByName('removeHorario')
                removeButtons.forEach(elem => {
                    elem.addEventListener('click', (e) => {
                        c--
                        c = c < 0 ? 0 : c
                        $('#horarioComercialRow' + e.target.id.split('|')[1]).remove();
                    })
                })
            }

            let removeButtons = document.getElementsByName('removeHorario')
            removeButtons.forEach(elem => {
                elem.addEventListener('click', (e) => {
                    c--
                    $('#horarioComercialRow' + e.target.id.split('|')[1]).remove();
                })
            })
        }  
    }).catch(error => {
        AstNotif.dialog('Erro', error.message)
        console.log(error)
    })
    
    infoEscolaRef.child('livros').on('value', (snapshot) => {
        listaLivros.innerHTML = ''
        let livrosCadastrados = snapshot.val()
        for (const i in livrosCadastrados) {
            if (Object.hasOwnProperty.call(livrosCadastrados, i)) {
                const livro = livrosCadastrados[i];
                listaLivros.innerHTML += `
                    <tr>
                        <td>
                            <span class="custom-checkbox">
                                <input type="checkbox" id="checkbox${livro.codSistema}" name="options[]" value="${livro.codSistema}">
                                <label for="checkbox${livro.codSistema}"></label>
                            </span>
                        </td>
                        <td>${livro.idLivro}</td>
                        <td>${livro.nomeLivro}</td>
                        <td>${livro.codLivro}</td>
                        <td>
                            <a data-toggle="modal" href="#modalAdicionaLivro" onclick="carregaDadosLivro('${livro.codSistema}')" class="edit" data-toggle="tooltip" title="Editar livro"><i data-feather="edit">&#xE254;</i></a>
                            <a href="#deleteEmployeeModal" class="action" data-toggle="modal" data-toggle="tooltip" title="Ver Estatísticas"><i data-feather="eye" ></i></a>
                        </td>
                    </tr>
                `
            }
        }
        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        })
        feather.replace()
        ativaCheckboxes()
    })

    infoEscolaRef.child('cursos').on('value', (snapshot) => {
        listaCursos.innerHTML = ''
        let cursosCadastrados = snapshot.val()
        for (const i in cursosCadastrados) {
            if (Object.hasOwnProperty.call(cursosCadastrados, i)) {
                const curso = cursosCadastrados[i];
                listaCursos.innerHTML += `
                    <tr>
                        <td>
                            <span class="custom-checkbox">
                                <input type="checkbox" id="checkboxCurso${curso.codSistema}" name="cursos" value="${curso.codSistema}">
                                <label for="checkboxCurso${curso.codSistema}"></label>
                            </span>
                        </td>
                        <td>${curso.nomeCurso}</td>
                        <td></td>
                        <td>${curso.codCurso}</td>
                        <td>
                            <a data-toggle="modal" href="#modalAdicionaCurso" onclick="carregaDadosCurso('${curso.codSistema}')" class="edit" data-toggle="tooltip" title="Editar curso"><i data-feather="edit">&#xE254;</i></a>
                            <a href="#deleteEmployeeModal" class="action" data-toggle="tooltip" title="Ver Estatísticas"><i data-feather="eye"></i></a>
                        </td>
                    </tr>
                `
            }
        }
        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        })
        feather.replace()
        ativaCheckboxes()
    })

    infoEscolaRef.child('checklist').on('value', (snapshot) => {
        listaChecklist.innerHTML = ''
        let checklistsCadastrados = snapshot.val()
        for (const key in checklistsCadastrados) {
            if (Object.hasOwnProperty.call(checklistsCadastrados, key)) {
                const checklist = checklistsCadastrados[key];
                listaChecklist.innerHTML += `
                    <tr>
                        <td>
                            <span class="custom-checkbox">
                                <input type="checkbox" id="checkboxChecklist${key}" name="checklists" value="${key}">
                                <label for="checkboxChecklist${key}"></label>
                            </span>
                        </td>
                        <td>${checklist.topicoChecklist}</td>
                        <td>${checklist.nomeChecklist}</td>
                        <td>${checklist.qtdeChecklist}</td>
                        <td>
                            <a href="#modalAdicionaChecklist" data-toggle="modal" onclick="carregaDadosChecklist('${key}')" class="edit"><i data-feather="edit" data-toggle="tooltip" title="Editar checklist"></i></a>
                            <a href="#deleteEmployeeModal" class="action" data-toggle="tooltip" title="Ver Estatísticas"><i data-feather="eye"></i></a>
                        </td>
                    </tr>
                `
            }
        }
        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        })
        feather.replace()
        ativaCheckboxes()
    })

    infoEscolaRef.child('checklistAcompanhamento').on('value', (snapshot) => {
        listaChecklistAcompanhamento.innerHTML = ''
        let checklistsCadastrados = snapshot.val()
        for (const key in checklistsCadastrados) {
            if (Object.hasOwnProperty.call(checklistsCadastrados, key)) {
                const checklist = checklistsCadastrados[key];
                listaChecklistAcompanhamento.innerHTML += `
                    <tr>
                        <td>
                            <span class="custom-checkbox">
                                <input type="checkbox" id="checkboxChecklist${key}" name="checklists" value="${key}">
                                <label for="checkboxChecklist${key}"></label>
                            </span>
                        </td>
                        <td>${checklist.topicoChecklist}</td>
                        <td>${checklist.nomeChecklist}</td>
                        <td>${checklist.qtdeChecklist}</td>
                        <td>
                            <a href="#modalAdicionaChecklistAcompanhamento" data-toggle="modal" onclick="carregaDadosChecklistAcompanhamento('${key}')" class="edit"><i data-feather="edit" data-toggle="tooltip" title="Editar checklist"></i></a>
                            <a href="#deleteEmployeeModal" class="action"><i data-feather="eye" data-toggle="tooltip" title="Ver Estatísticas"></i></a>
                        </td>
                    </tr>
                `
            }
        }
        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        })
        feather.replace()
        ativaCheckboxes()
    })

    infoEscolaRef.child('codDiasSemana').on('value', (snapshot) => {
        let i = 0
        let diasSemana = snapshot.val()
        document.getElementsByName('abrv').forEach(element => {
            element.value = diasSemana[i]
            i++
        });
    })

    document.getElementById('modalChecklist').addEventListener('click', (e) => {
        document.getElementById('addChecklistTabela').reset()
    })

    document.getElementById('modalChecklistAcompanhamento').addEventListener('click', (e) => {
        document.getElementById('addChecklistAcompanhamentoTabela').reset()
    })
    
}

function carregaDadosLivro(codSistema) {
    infoEscolaRef.child('livros/' + codSistema).once('value').then(snapshot => {
        document.getElementById('idLivroAdd').value = snapshot.val().idLivro
        document.getElementById('nomeLivroAdd').value = snapshot.val().nomeLivro
        document.getElementById('codigoLivroAdd').value = snapshot.val().codLivro
        document.getElementById('codigoSistemaAdd').value = snapshot.val().codSistema
    })
}

function carregaDadosCurso(codSistema) {
    infoEscolaRef.child('cursos/' + codSistema).once('value').then(snapshot => {
        document.getElementById('nomeCursoAdd').value = snapshot.val().nomeCurso
        document.getElementById('codigoCursoAdd').value = snapshot.val().codCurso
        document.getElementById('codigoCursoSistemaAdd').value = snapshot.val().codSistema
    })
}

function carregaDadosChecklist(codSistema) {
    infoEscolaRef.child('checklist/' + codSistema).once('value').then(snapshot => {
        document.getElementById('topicoChecklistAdd').value = snapshot.val().topicoChecklist
        document.getElementById('nomeChecklistAdd').value = snapshot.val().nomeChecklist
        document.getElementById('qtdeChecklistAdd').value = snapshot.val().qtdeChecklist
        document.getElementById('codChecklist').value = snapshot.key

    })
}

function carregaDadosChecklistAcompanhamento(codSistema) {
    infoEscolaRef.child('checklistAcompanhamento/' + codSistema).once('value').then(snapshot => {
        document.getElementById('topicoChecklistAcompanhamentoAdd').value = snapshot.val().topicoChecklist
        document.getElementById('nomeChecklistAcompanhamentoAdd').value = snapshot.val().nomeChecklist
        document.getElementById('qtdeChecklistAcompanhamentoAdd').value = snapshot.val().qtdeChecklist
        document.getElementById('situacao1Add').value = snapshot.val().situacao1
        document.getElementById('situacao2Add').value = snapshot.val().situacao2
        document.getElementById('situacao3Add').value = snapshot.val().situacao3
        document.getElementById('codChecklistAcompanhamento').value = snapshot.key

    })
}


document.getElementById('infoEscolaForm').addEventListener('submit', (e) => {
    e.preventDefault()
    const dados = new FormData(e.target);
    let infoEscola = {}
    infoEscola.nomeEscola = dados.get('nomeEscola')
    infoEscola.frequenciaAprovacao = dados.get('frequenciaAprovacao')
    infoEscola.pontosAprovacao = dados.get('pontosAprovacao')
    infoEscola.cnpjEscola = dados.get('cnpjEscola')
    infoEscola.enderecoEscola = dados.get('enderecoEscola')
    infoEscola.telefoneEscola = dados.get('telefoneEscola')
    infoEscola.emailEscola = dados.get('emailEscola')
    infoEscola.corPrimariaEscola = dados.get('corPrimariaEscola')
    infoEscola.corSecundariaEscola = dados.get('corSecundariaEscola')
    infoEscola.permitirDistribuiNotas = dados.get('permitirDistribuiNotas') == null ? false : true
    infoEscola.tipoChavePix = dados.get('tipoChavePix')
    infoEscola.chavePix = dados.get('chavePix')
    infoEscola.nomePix = dados.get('nomePix')
    infoEscola.cidadePix = dados.get('cidadePix')

    let data = $('#infoEscolaForm').serializeArray();
    console.log(data)
    let horarioComercial = []
    let diasSemana = data.filter(field => field.name.split('|')[0] == 'dias');
    let horario = data.filter(field => field.name.split('|')[0] == 'startTime' || field.name.split('|')[0] == 'endTime')
    let diasSemanaArray = []
    for (const key in diasSemana) {
        if (Object.hasOwnProperty.call(diasSemana, key)) {
            const field = diasSemana[key];
            const i = field.name.split('|')[1]
            const value = field.value
            diasSemanaArray[i] = diasSemanaArray[i] == undefined ? [] : diasSemanaArray[i]
            diasSemanaArray[i].push(value);
            horarioComercial[i] = {daysOfWeek: diasSemanaArray[i]}
        }
    }

    for (const key in horario) {
        if (Object.hasOwnProperty.call(horario, key)) {
            const field = horario[key];
            const i = field.name.split('|')[1]
            const name = field.name.split('|')[0]
            const value = field.value
            horarioComercial[i][name] = value
        }
    }
    infoEscola.horarioComercial = horarioComercial
    console.log(diasSemanaArray)
    console.log(diasSemana)
    console.log(horario)
    console.log(horarioComercial)
    loaderRun(true, 'Enviando dados básicos...')
    infoEscolaRef.child('dadosBasicos').set(infoEscola).then(() => {
        AstNotif.dialog('Sucesso', 'Os dados básicos foram atualizados e aplicados com sucesso.')
        loaderRun()
    }).catch(error => {
        AstNotif.dialog('Erro', error.message)
        console.log(error)
        loaderRun()
    })
})

// Livros
document.getElementById('addLivroTabela').addEventListener('submit', (e) => {
    e.preventDefault()
    const dados = new FormData(e.target);
    let livro = {}
    livro.idLivro = dados.get('idLivroAdd')
    livro.nomeLivro = dados.get('nomeLivroAdd')
    livro.codLivro = dados.get('codigoLivroAdd')
    livro.codSistema = dados.get('codigoSistemaAdd')
    loaderRun(true, 'Enviando dados do livro...')
    infoEscolaRef.child('livros/' + livro.codSistema).set(livro).then(() => {
        AstNotif.notify('Livros Adicionados', 'Livros adicionados com sucesso', 'agora', {length: 5000})
        $('#modalAdicionaLivro').modal('hide')
        loaderRun()
    }).catch(error => {
        AstNotif.dialog('Erro', error.message)
        console.log(error)
        loaderRun()
    })
})

function buscaProximoIdLivro() {
    let textBoxCodSistemaAdd = document.getElementById('codigoSistemaAdd')
    infoEscolaRef.child('livros').once('value').then(snapshot => {
        if (snapshot.val() != null) {
            let dados = snapshot.val()
            let c = 0
            for (const i in dados) {
                if (Object.hasOwnProperty.call(dados, i)) {
                    const livro = dados[i];
                    c++
                }
            }
            while (dados.hasOwnProperty(c)) {
                c++
            }
            textBoxCodSistemaAdd.value = c
        } else {
            textBoxCodSistemaAdd.value = 0
        }
        
    }).catch(error => {
        AstNotif.dialog('Erro', error.message)
        console.log(error)
        loaderRun()
    })
}

document.getElementById('formListaLivros').addEventListener('submit', (e) => {
    e.preventDefault()
    const dados = new FormData(e.target);
    let livrosSelecionados = dados.getAll('options[]')
    if (livrosSelecionados.length == 0) {
        AstNotif.dialog('Opa...', 'Você esqueceu de selecionar os livros. Volte, e marque as caixas dos livros que deseja deletar.')
    } else {
       abrirModal('modal', 'Confirmação', 'Você confirma a exclusão dos livros selecionados?', '<button id="confirmaDeletaLivros" class="btn btn-danger">Sim</button><button class="btn btn-secondary" data-dismiss="modal">Cancelar</button>')
       document.getElementById('confirmaDeletaLivros').addEventListener('click', (e) => {
           e.preventDefault()
           let c = 0
           for (const i in livrosSelecionados) {
               if (Object.hasOwnProperty.call(livrosSelecionados, i)) {
                   const codLivro = livrosSelecionados[i];
                   infoEscolaRef.child('livros/' + codLivro).remove().then(() => {
                    c++
                    if (c == livrosSelecionados.length) {
                        AstNotif.notify('Sucesso', 'Livros deletados com sucesso.', 'agora')
                        $('#modal').modal('hide')
                    }
                    
                   }).catch(error => {
                       AstNotif.dialog('Erro', error.message)
                       console.log(error)
                   })
               }
           }
       }) 
    }
    
})

// Cursos
document.getElementById('addCursoTabela').addEventListener('submit', (e) => {
    e.preventDefault()
    const dados = new FormData(e.target);
    let curso = {}
    curso.nomeCurso = dados.get('nomeCursoAdd')
    curso.codCurso = dados.get('codigoCursoAdd')
    curso.codSistema = dados.get('codigoCursoSistemaAdd')
    loaderRun(true, 'Enviando dados do Curso...')
    infoEscolaRef.child('cursos/' + curso.codSistema).set(curso).then(() => {
        AstNotif.notify('Cursos Adicionados', 'Cursos adicionados com sucesso', 'agora', {length: 5000})
        $('#modalAdicionaCurso').modal('hide')
        loaderRun()
    }).catch(error => {
        AstNotif.dialog('Erro', error.message)
        console.log(error)
        loaderRun()
    })
})

function buscaProximoIdCurso() {
    let textBoxCodSistemaAdd = document.getElementById('codigoCursoSistemaAdd')
    infoEscolaRef.child('cursos').once('value').then(snapshot => {
        if (snapshot.val() != null) {
            let dados = snapshot.val()
            let c = 0
            for (const i in dados) {
                if (Object.hasOwnProperty.call(dados, i)) {
                    const curso = dados[i];
                    c++
                }
            }
            while (dados.hasOwnProperty(c)) {
                c++
            }
            textBoxCodSistemaAdd.value = c
        } else {
            textBoxCodSistemaAdd.value = 0
        }
        
    }).catch(error => {
        AstNotif.dialog('Erro', error.message)
        console.log(error)
        loaderRun()
    })
}

document.getElementById('formListaCursos').addEventListener('submit', (e) => {
    e.preventDefault()
    const dados = new FormData(e.target);
    let cursosSelecionados = dados.getAll('cursos')
    if (cursosSelecionados.length == 0) {
        AstNotif.dialog('Opa...', 'Você esqueceu de selecionar os cursos. Volte, e marque as caixas dos cursos que deseja deletar.')
    } else {
        abrirModal('modal', 'Confirmação', 'Você confirma a exclusão dos cursos selecionados?', '<button id="confirmaDeletaCursos" class="btn btn-danger">Sim</button><button class="btn btn-secondary" data-dismiss="modal">Cancelar</button>')
        document.getElementById('confirmaDeletaCursos').addEventListener('click', (e) => {
            e.preventDefault()
            let c = 0
            for (const i in cursosSelecionados) {
                if (Object.hasOwnProperty.call(cursosSelecionados, i)) {
                    const codCurso = cursosSelecionados[i];
                    infoEscolaRef.child('cursos/' + codCurso).remove().then(() => {
                        c++
                        if (c == cursosSelecionados.length) {
                            AstNotif.notify('Sucesso', 'Cursos deletados com sucesso.', 'agora')
                            $('#modal').modal('hide')
                        }
                    }).catch(error => {
                        AstNotif.dialog('Erro', error.message)
                        console.log(error)
                    })
                }
           }
       }) 
    }
    
})

// Checklists
document.getElementById('addChecklistTabela').addEventListener('submit', (e) => {
    e.preventDefault()
    const dados = new FormData(e.target);
    let checklist = {}
    checklist.topicoChecklist = dados.get('topicoChecklistAdd')
    checklist.nomeChecklist = dados.get('nomeChecklistAdd')
    checklist.qtdeChecklist = dados.get('qtdeChecklistAdd')
    let codChecklist = dados.get('codChecklist')
    loaderRun(true, 'Enviando dados do Checklist...')

    if (codChecklist == '') {
        infoEscolaRef.child('checklist').push(checklist).then(() => {
            AstNotif.notify('Checklist Adicionado', 'Checklist adicionado com sucesso', 'agora', {length: 5000})
            $('#modalAdicionaChecklist').modal('hide')
            loaderRun()
        }).catch(error => {
            
            AstNotif.dialog('Erro', error.message)
            console.log(error)
            loaderRun()
        })
    } else {
        infoEscolaRef.child('checklist/' + codChecklist).set(checklist).then(() => {
            AstNotif.notify('Checklist Editado', 'Checklist editado com sucesso', 'agora', {length: 5000})
            document.getElementById('addChecklistTabela').reset()
            $('#modalAdicionaChecklist').modal('hide')
            loaderRun()
        }).catch(error => {
            AstNotif.dialog('Erro', error.message)
            console.log(error)
            loaderRun()
        })
    }
    
    
})

document.getElementById('formListaChecklist').addEventListener('submit', (e) => {
    e.preventDefault()
    const dados = new FormData(e.target);
    let checklistsSelecionados = dados.getAll('checklists')
    if (checklistsSelecionados.length == 0) {
        AstNotif.dialog('Opa...', 'Você esqueceu de selecionar os checklists. Volte, e marque as caixas dos checklists que deseja deletar.')
    } else {
        abrirModal('modal', 'Confirmação', 'Você confirma a exclusão dos checklists selecionados?', '<button id="confirmaDeletaChecklists" class="btn btn-danger">Sim</button><button class="btn btn-secondary" data-dismiss="modal">Cancelar</button>')
        document.getElementById('confirmaDeletaChecklists').addEventListener('click', (e) => {
            e.preventDefault()
            let c = 0
            for (const i in checklistsSelecionados) {
                if (Object.hasOwnProperty.call(checklistsSelecionados, i)) {
                    const codChecklist = checklistsSelecionados[i];
                    infoEscolaRef.child('checklist/' + codChecklist).remove().then(() => {
                        c++
                        if (c == checklistsSelecionados.length) {
                            AstNotif.notify('Sucesso', 'Checklists deletados com sucesso.', 'agora')
                            $('#modal').modal('hide')
                        }
                    }).catch(error => {
                        AstNotif.dialog('Erro', error.message)
                        console.log(error)
                    })
                }
           }
       }) 
    }
    
})

// Checklists de Acompanhamento
document.getElementById('addChecklistAcompanhamentoTabela').addEventListener('submit', (e) => {
    e.preventDefault()
    const dados = new FormData(e.target);
    let checklist = {}
    checklist.topicoChecklist = dados.get('topicoChecklistAcompanhamentoAdd')
    checklist.nomeChecklist = dados.get('nomeChecklistAcompanhamentoAdd')
    checklist.qtdeChecklist = dados.get('qtdeChecklistAcompanhamentoAdd')
    checklist.situacao1 = dados.get('situacao1Add')
    checklist.situacao2 = dados.get('situacao2Add')
    checklist.situacao3 = dados.get('situacao3Add')
    let codChecklist = dados.get('codChecklistAcompanhamento')

    if (codChecklist == '') {
        infoEscolaRef.child('checklistAcompanhamento').push(checklist).then(() => {
            AstNotif.notify('Checklist Adicionado', 'Checklist adicionado com sucesso', 'agora', {length: 5000})
            $('#modalAdicionaChecklistAcompanhamento').modal('hide')
            loaderRun()
        }).catch(error => {
            AstNotif.dialog('Erro', error.message)
            console.log(error)
            loaderRun()
        })
    } else {
        infoEscolaRef.child('checklistAcompanhamento/' + codChecklist).set(checklist).then(() => {
            AstNotif.notify('Checklist Editado', 'Checklist editado com sucesso', 'agora', {length: 5000})
            document.getElementById('addChecklistTabela').reset()
            $('#modalAdicionaChecklistAcompanhamento').modal('hide')
            loaderRun()
        }).catch(error => {
            AstNotif.dialog('Erro', error.message)
            console.log(error)
            loaderRun()
        })
    }
    loaderRun(true, 'Enviando dados do Checklist...')
    
})

document.getElementById('formListaChecklistAcompanhamento').addEventListener('submit', (e) => {
    e.preventDefault()
    const dados = new FormData(e.target);
    let checklistsSelecionados = dados.getAll('checklists')
    if (checklistsSelecionados.length == 0) {
        AstNotif.dialog('Opa...', 'Você esqueceu de selecionar os checklists. Volte, e marque as caixas dos checklists que deseja deletar.')
    } else {
        abrirModal('modal', 'Confirmação', 'Você confirma a exclusão dos checklists selecionados?', '<button id="confirmaDeletaChecklists" class="btn btn-danger">Sim</button><button class="btn btn-secondary" data-dismiss="modal">Cancelar</button>')
        document.getElementById('confirmaDeletaChecklists').addEventListener('click', (e) => {
            e.preventDefault()
            let c = 0
            for (const i in checklistsSelecionados) {
                if (Object.hasOwnProperty.call(checklistsSelecionados, i)) {
                    const codChecklist = checklistsSelecionados[i];
                    infoEscolaRef.child('checklistAcompanhamento/' + codChecklist).remove().then(() => {
                        c++
                        if (c == checklistsSelecionados.length) {
                            AstNotif.notify('Sucesso', 'Checklists deletados com sucesso.', 'agora')
                            $('#modal').modal('hide')
                        }
                    }).catch(error => {
                        AstNotif.dialog('Erro', error.message)
                        console.log(error)
                    })
                }
           }
       }) 
    }
    
})

// Cod Dias da Semana
document.getElementById('formCodDiasSemana').addEventListener('submit', (e) => {
    e.preventDefault()
    const dados = new FormData(e.target);
    let dias = dados.getAll('abrv')
    infoEscolaRef.child('codDiasSemana').set(dias).then(() => {
        AstNotif.notify('Sucesso', 'Códigos aplicados com sucesso. As próximas turmas serão criadas com base nestes códigos.', 'agora', {length: 30000})
    }).catch(error => {
        AstNotif.dialog('Erro', error.message)
        console.log(error)
    })
})

// Altera logo Escola
let alteraLogoEscola = document.getElementById('alteraLogoEscola')
let imgLogoEscola = document.getElementById('imgLogoEscola')

infoEscolaRef.child('logoEscola').on('value', link => {
    imgLogoEscola.setAttribute('src', link.val())
})

alteraLogoEscola.addEventListener('input', (e) => {
    e.preventDefault()
    let files = e.target.files
    console.log(files[0])
    if (files[0] != undefined) {
        uploadFile(files[0], {tipo: 'logoEscola'}, 'infoEscola', 'sistemaEscolar/infoEscola/logoEscola')
    }
})

// Aba Pré matriculas

function gerarFichaPreMatricula(key) {
    document.getElementById('corpoMatricula').innerHTML = `<iframe src="../resources/pdfsProntos/documento.html#preMatricula?${key}" frameborder="0" width="100%" height="400px" id="fichaPdf" name="fichaPdf"></iframe>`
    $('#matriculaModal').modal({backdrop: 'static'})
}

async function abaPreMatriculas() {
    let listaPreMatriculas = document.getElementById('listaPreMatriculas')
    let preMatriculas
    let dados
    let keyAtual
    carregaMatriculas()

    async function carregaMatriculas() {
        document.getElementById('infoPreMatricula').style.display = 'none'
        preMatriculas = (await preMatriculasRef.once('value')).val()
        let c = 0
        listaPreMatriculas.innerHTML = ''
        for (const key in preMatriculas) {
            if (Object.hasOwnProperty.call(preMatriculas, key)) {
                const preMatricula = preMatriculas[key];
                c++
                    listaPreMatriculas.innerHTML += `
                    <tr>
                        <td>
                            <span class="custom-checkbox">
                            <input type="checkbox" id="checkbox${c}" name="options[]" value="1">
                            <label for="checkbox${c}"></label>
                            </span>
                        </td>
                        <td><a name="nomesAlunos" id="${key}" style="cursor: pointer;" >${preMatricula.nomeAluno}</a></td>
                        <td>${preMatricula.emailAluno}</td>
                        <td>${preMatricula.celularAluno}</td>
                        <td>
                            
                            <a style="cursor: pointer;" class="edit" id="${key}" name="editaPreMatricula" data-toggle="tooltip" title="Editar dados"><i data-feather="edit"></i></a>
                            <a style="cursor: pointer;" id="${key}" name="deletaPreMatricula" class="delete" data-toggle="tooltip" title="Apagar matrícula"><i data-feather="user-x"></i></a>
                            
                        </td>
                    </tr>`
            }
        }
        feather.replace()
        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        })
        escutaNomesAlunos();
        escutaBotoesEdita();
        escutaBotoesDelete();
        
    }

    async function deletaPreMatricula(key) {
        let preMatricula = preMatriculas[key];
        const confirm = await ui.confirm('Tem certeza que deseja apagar a pré-matrícula de ' + preMatricula.nomeAluno + '? Esta ação não pode ser revertida.');
  
        if(confirm){
            preMatriculasRef.child(key).remove().then(() => {
                AstNotif.notify('Sucesso', 'Pré-matrícula removida.', 'agora')
                carregaMatriculas();
            }).catch(error => {
                AstNotif.dialog('Erro', error.message)
                console.log(error)
            })
        }
    }

    async function abreDadosPreMatricula(key) {
        dados = preMatriculas[key];
        keyAtual = key
        document.getElementById('infoPreMatricula').style.display = 'block'
        document.getElementById('rolaTelaAbaixoPre').style.display = 'block'
        document.getElementById('secGeraFichaPre').innerHTML = `<button class="btn btn-outline-primary btn-block" id="editarDadosPre">Ver/Editar dados do aluno</button><button class="btn btn-outline-primary btn-block" id="btnGeraFicha" onclick="gerarFichaPreMatricula('${key}')">Gerar ficha de pré-matrícula em PDF</button>
        `
        
        
        dadosResponsaveis = {
            nomeResponsavelAluno1: dados.nomeResponsavelAluno1,
            relacaoAluno1: dados.relacaoAluno1,
            numeroComercialResponsavel1: dados.numeroComercialResponsavel1,
            numeroCelularResponsavel1: dados.numeroCelularResponsavel1,
            rgResponsavel1: dados.rgResponsavel1,
            cpfResponsavel1: dados.cpfResponsavel1,
            // Dados de Filiação responsável 2
            nomeResponsavelAluno2: dados.nomeResponsavelAluno2,
            relacaoAluno2: dados.relacaoAluno2,
            numeroComercialResponsavel2: dados.numeroComercialResponsavel2,
            numeroCelularResponsavel2: dados.numeroCelularResponsavel2,
            rgResponsavel2: dados.rgResponsavel2,
            cpfResponsavel2: dados.cpfResponsavel2,
            // Dados de Filiação Responsável financeiro
            nomeResponsavelFinanceiroAluno: dados.nomeResponsavelFinanceiroAluno,
            relacaoFinanceiroAluno: dados.relacaoFinanceiroAluno,
            numeroComercialFinanceiroAluno: dados.numeroComercialFinanceiroAluno,
            numeroCelularFinanceiroAluno: dados.numeroCelularFinanceiroAluno,
            rgFinanceiroAluno: dados.rgFinanceiroAluno,
            cpfFinanceiroAluno: dados.cpfFinanceiroAluno,
            // Dados de Filiação responsável pedagógico/didático
            nomeResponsavelPedagogicoAluno: dados.nomeResponsavelPedagogicoAluno,
            relacaoPedagogicoAluno: dados.relacaoPedagogicoAluno,
            numeroComercialPedagogicoAluno: dados.numeroComercialPedagogicoAluno,
            numeroCelularPedagogicoAluno: dados.numeroCelularPedagogicoAluno,
            rgPedagogicoAluno: dados.rgPedagogicoAluno,
            cpfPedagogicoAluno: dados.cpfPedagogicoAluno
        }

        
        dados.fotoAluno != undefined ? document.getElementById('mostraFotoAlunoPre').setAttribute('src', dados.fotoAluno) : document.getElementById('mostraFotoAlunoPre').setAttribute('src', '../images/profile_placeholder.png')
        document.getElementById('mostraNomeAlunoPre').innerText = dados.nomeAluno
        document.getElementById('mostraCpfAlunoPre').innerText = dados.cpfAluno
        document.getElementById('mostraRgAlunoPre').innerText = dados.rgAluno
        document.getElementById('mostraCelularAlunoPre').innerText = dados.celularAluno
        document.getElementById('mostraTelefoneAlunoPre').innerText = dados.telefoneAluno
        document.getElementById('timestampDoAlunoPre').innerText = 'Aluno cadastrado em: ' + new Date(dados.timestamp._seconds * 1000)
        document.getElementById('mostraDataNascimentoAlunoPre').innerText = dados.dataNascimentoAluno.split('-').reverse().join('/');

        let nascimento = dados.dataNascimentoAluno
        
        calcularIdadePrecisa(nascimento).then(function(idade){
            document.getElementById('mostraIdadeAlunoPre').innerText = `${idade.years} anos, ${idade.months} mês(es), e ${idade.days} dias`
        }).catch(function(error){
            AstNotif.dialog('Erro', error.message)
            console.log(error)
        })
        document.getElementById('mostraEmailAlunoPre').innerText = dados.emailAluno
        document.getElementById('mostraMatriculaAlunoPre').innerText = key + ' (Código de pré-matricula)'
        document.getElementById('mostraEnderecoAlunoPre').innerText = `${dados.enderecoAluno}, ${dados.numeroAluno}, ${dados.bairroAluno}, ${dados.cidadeAluno}, ${dados.estadoAluno}. CEP ${dados.cepAluno}.`
        document.getElementById('rolaTelaAbaixoPre').focus()
        document.getElementById('rolaTelaAbaixoPre').style.display = 'none'

        document.getElementById('editarDadosPre').addEventListener('click', () => editarDadosPreMatricula(key))
        
    }

    function editarDadosPreMatricula(key) {
        let aluno = preMatriculas[key]
    
        abrirModal('modal', 'Ver e Editar dados de ' + aluno.nomeAluno, `
    <form id="formEditaAluno" onkeydown="return event.key != 'Enter';">
        <label class="h6">Dados pessoais</label>
        <div class="form-row">
        
        <div class="form-group col-md-4">
            <label for="inputPassword4">Nome</label>
            <input type="name" class="form-control" id="nomeAluno" name="nomeAluno" placeholder="Nome" onblur="maiusculo(this)" required>
        </div>
        <div class="form-group col-auto">
            <label for="inputPassword4">Data de nascimento</label>
            <input type="date" class="form-control" id="dataNascimentoAluno" name="dataNascimentoAluno" placeholder="Data" onblur="calculaIdade(this.value)" required>
            
        </div>
        <div class="form-group col-auto">
            <br><br>
            <label for="dataNascimentoAluno" class="text-muted" id="idadeCalculada">Idade:</label>
        </div>
        </div>
        <div class="form-row">
        <div class="form-group col-auto">
            <label for="inputEmail4">Telefone (fixo)</label>
            <input type="phone" onkeypress="$(this).mask('(00) 0000-00009')" class="form-control" id="telefoneAluno" name="telefoneAluno" placeholder="Número">
        </div>
        
        <div class="form-group col-auto">
            <label for="inputPassword4">Celular</label>
            <input type="phone" class="form-control" id="celularAluno" name="celularAluno" placeholder="Número" onkeypress="$(this).mask('00000000009')" required>
            <small id="senhaHelp" class="form-text text-muted">Digite o DDD seguido do número (Ex.: 31999999999)</small>
        </div>
        
        <div class="form-group col-md-5">
            <label for="inputPassword4">Email</label>
            <input type="email" class="form-control" id="emailAluno" name="emailAluno" placeholder="Email" required>
        </div>
        </div>
        <div class="form-row">
        <div class="form-group col-md-3">
            <label for="inputEmail4">Senha de acesso ao portal</label>
            <div class="input-group mb-3">
            <div class="input-group-prepend">
                <div class="input-group-text">
                <input type="checkbox" aria-label="Mostra e esconde a senha" onclick="this.checked ? (document.getElementById('senhaAluno').type = 'text'):(document.getElementById('senhaAluno').type = 'password')">
                </div>
            </div>
            <input type="password" class="form-control" id="senhaAluno" name="senhaAluno" placeholder="Senha" required>
            </div>
            <small id="senhaHelp" class="form-text text-muted">A senha precisa ter no mínimo 6 caracteres.</small>
        </div>
        <div class="form-group col-auto">
            <label for="inputEmail4">RG</label>
            <input type="text" class="form-control" id="rgAluno" name="rgAluno" placeholder="RG" required>
        </div>
        <div class="form-group col-auto">
            <label for="inputPassword4">CPF</label>
            <input type="text" class="form-control" id="cpfAluno" name="cpfAluno" placeholder="CPF" onchange="verificaCPF(this)" required>
            <small id="cpfHelp" class="form-text text-muted">Digite um CPF válido, existe um algoritmo de validação neste campo.</small>
        </div>
        </div>
        <hr>
        <label class="h6">Dados de endereço</label>
        <div class="form-row col-md-4">
        <label for="inputZip">CEP (somente números)</label>
        <input type="text" class="form-control" id="cepAluno" name="cepAluno" placeholder="CEP" onchange="preencheEndereco(this.value)" onkeypress="$(this).mask('00.000-000')">
        <small id="emailHelp" class="form-text text-muted">O CEP é opcional, mas quando inserido preenche o endereço automaticamente.</small>
        </div>
        <div class="form-row">
        <div class="form-group col-md-5">
            <label for="inputAddress2">Rua</label>
            <input type="text" class="form-control" id="enderecoAluno" name="enderecoAluno" placeholder="Endereço">
        </div>
        <div class="form-group col-md-1">
            <label for="inputAddress2">Número</label>
            <input type="number" class="form-control" id="numeroAluno" name="numeroAluno" placeholder="Núm.">
        </div>
        <div class="form-group col-md-2">
            <label for="inputCity">Bairro</label>
            <input type="text" class="form-control" id="bairroAluno"name="bairroAluno" placeholder="Bairro">
        </div>
        <div class="form-group col-md-2">
            <label for="inputState">Cidade</label>
            <input type="text" class="form-control" id="cidadeAluno" name="cidadeAluno" placeholder="Cidade">
        </div>
        <div class="form-group col-md-1">
            <label for="inputState">Estado</label>
            <input type="text" class="form-control" id="estadoAluno" name="estadoAluno" placeholder="Estado">
        </div>
        </div>
        <hr>
        <label class="h6">Dados opcionais</label>
                <div class="form-row col-auto">
                  <label for="inputZip">"Qual o seu objetivo ao adquirir o curso?"</label>
                  <input type="text" class="form-control" id="objetivoAluno" name="objetivoAluno" placeholder="Descreva...">
                </div>
                <br>
                <div class="form-row col-auto">
                  <label for="inputZip">"Toma remédios controlados? Se sim, qual e com que frequência?"</label>
                  <input type="text" class="form-control" id="remedioAluno" name="remedioAluno" placeholder="Descreva...">
                </div>
                <br>
                <div class="form-row col-auto">
                  <label for="inputZip">"Possui alguma alergia? Se sim qual?"</label>
                  <input type="text" class="form-control" id="alergiaAluno" name="alergiaAluno" placeholder="Descreva...">
                </div>
                <br>
                <div class="form-row col-auto">
                  <label for="inputZip">"Possui intolerância a algum alimento? Se sim qual?"</label>
                  <input type="text" class="form-control" id="intoleranciaAluno" name="intoleranciaAluno" placeholder="Descreva...">
                </div>
                <br>
                <div class="form-row col-auto">
                  <label for="inputZip">"Qual curso está fazendo atualmente?"</label>
                  <input type="text" class="form-control" id="cursoAtualmenteAluno" name="cursoAtualmenteAluno" placeholder="Descreva...">
                </div>
                <br>
                
                <div class="form-row col-auto">
                  <label for="marketing">"Como conheceu a escola?"</label>
                  <select class="form-control" name="marketing" id="marketing">
                    <option selected hidden>Escolha...</option>
                    <option value="Jornal">Jornal</option>
                    <option value="Internet">Internet</option>
                    <option value="Redes Sociais">Redes Sociais</option>
                    <option value="Eventos">Eventos</option>
                    <option value="Indicação">Indicação</option>
                    <option value="Outdoors/Panfletos">Outdoors/Panfletos</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <br>
                <div class="form-row col-auto">
                  <label for="vencimento">Data preferencial para vencimento</label>
                  <select class="form-control" name="vencimento" id="vencimento">
                    <option selected hidden>Escolha...</option>
                    
                  </select>
                </div>
                
                <br>
                <div class="form-row col-auto">
                  <label for="inputZip">Outras observações...</label>
                  <input type="text" class="form-control" id="observacoesAluno" name="observacoesAluno" placeholder="Descreva...">
                </div>
                <br>
                <label><b>Dias e horários disponíveis:</b></label>
                <div class="form-row">
                  <div class=" col-md-2">
                    <div class="custom-control custom-checkbox">
                      
                      <label  for="segunda">Segunda-feira</label>
                    </div>
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="segundaHora1" name="segundaHora1" placeholder="Horário">
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="segundaHora2" name="segundaHora2" placeholder="Horário">
                  </div>
                </div>
                <hr>
                <div class="form-row">
                  <div class=" col-md-2">
                    <div class="custom-control custom-checkbox">
                      
                      <label for="terca">Terça-feira</label>
                    </div>
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="tercaHora1" name="tercaHora1" placeholder="Horário">
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="tercaHora2" name="tercaHora2" placeholder="Horário">
                  </div>
                </div>
                <hr>
                <div class="form-row">
                  <div class=" col-md-2">
                    <div class="custom-control custom-checkbox">
                      
                      <label  for="quarta">Quarta-feira</label>
                    </div>
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="quartaHora1" name="quartaHora1" placeholder="Horário">
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="quartaHora2" name="quartaHora2" placeholder="Horário">
                  </div>
                </div>
                <hr>
                <div class="form-row">
                  <div class=" col-md-2">
                    <div class="custom-control custom-checkbox">
                      
                      <label  for="quinta">Quinta-feira</label>
                    </div>
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="quintaHora1" name="quintaHora1" placeholder="Horário">
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="quintaHora2" name="quintaHora2" placeholder="Horário">
                  </div>
                </div>
                <hr>
                <div class="form-row">
                  <div class=" col-md-2">
                    <div class="custom-control custom-checkbox">
                      
                      <label  for="sexta">Sexta-feira</label>
                    </div>
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="sextaHora1" name="sextaHora1" placeholder="Horário">
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="sextaHora2" name="sextaHora2" placeholder="Horário">
                  </div>
                </div>
                <hr>
                <div class="form-row">
                  <div class=" col-md-2">
                    <div class="custom-control custom-checkbox">
                      
                      <label  for="sabado">Sábado</label>
                    </div>
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="sabadoHora1" name="sabadoHora1" placeholder="Horário">
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="sabadoHora2" name="sabadoHora2" placeholder="Horário">
                  </div>
                </div>
                <hr>
                <div class="form-row">
                  <div class=" col-md-2">
                    <div class="custom-control custom-checkbox">
                      
                      <label  for="domingo">Domingo</label>
                    </div>
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="domingoHora1" name="domingoHora1" placeholder="Horário">
                  </div>
                  <div class="col-md-2">
                    
                    <input type="time" class="form-control" id="domingoHora2" name="domingoHora2" placeholder="Horário">
                  </div>
                </div>
                
                  <br>
                  <hr>
                  <div class="form-row col-auto">
                      
                      <label for="autorizaImagemAluno">O aluno autoriza o uso de sua imagem e dados para divulgação? (Marque esta caixa apenas mediante autorização do aluno ou responsável)</label>
                  </div>
                  <div class="form-row col-auto">
                    <div class="custom-control custom-radio custom-control-inline">
                      <input type="radio" id="autorizaImagem" name="imagemAluno" value="autorizaImagem" class="custom-control-input">
                      <label class="custom-control-label" for="autorizaImagem">Autoriza</label>
                    </div>
                    <div class="custom-control custom-radio custom-control-inline">
                      <input type="radio" id="naoAutorizaImagem" checked name="imagemAluno" value="naoAutorizaImagem" class="custom-control-input">
                      <label class="custom-control-label" for="naoAutorizaImagem">Não autoriza</label>
                    </div>
                  </div>
                  
        <button type="submit" class="btn btn-primary btn-block">Salvar dados</button>
        <hr>
        <h6>Dados dos responsáveis</h6>
        <label>Para editar os dados dos responsáveis você deve abrir a ficha do aluno</label>
        <section id="responsaveis">

        </section>
    </form>
        `, '<button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>');
    
    for (let i = 0; i < 28; i++) {
        let opt = document.createElement('option')
        opt.value = i + 1
        opt.innerHTML = i + 1
        document.getElementById('vencimento').appendChild(opt)                 
    }

    let formEditaAluno = document.getElementById('formEditaAluno');
    let campos = $('#formEditaAluno').serializeArray();
    console.log(campos)
    
    let responsaveis = aluno.responsaveis
        let sectionResponsaveis = document.getElementById('responsaveis')
        console.log(responsaveis)
        sectionResponsaveis.innerHTML = ''
        for (const i in responsaveis) {
            if (Object.hasOwnProperty.call(responsaveis, i)) {
                const responsavel = responsaveis[i];
                sectionResponsaveis.innerHTML += `
                <div class="form-row border border-success rounded">
                
                <div class="form-group col-md-4">
                    <label for="inputAddress">Responsável</label>
                    <input type="text" class="form-control" id="nome${i}" name="nome" placeholder="Nome" onblur="maiusculo(this)" disabled value="${responsavel.nome}">
                </div>
                <div class="form-group col-md-2">
                    <label for="inputAddress">Relação</label>
                    
                    <input type="text" class="form-control form-control-md" value="${responsavel.relacao}" name="relacao" id="relacao${i}" disabled>
                    
                </div>
                <div class="form-group col-md-3">
                    <label for="inputAddress">Número Celular</label>
                    <input type="text" class="form-control" id="celular${i}" value="${responsavel.celular}" name="celular" placeholder="Celular" disabled>
                </div>
                
                <div class="form-group col-md-5">
                    <label for="inputPassword4">Email</label>
                    <input type="email" class="form-control" id="email${i}" value="${responsavel.email}" name="email" placeholder="Email" disabled>
                </div>
                
                <div class="form-group col-auto">
                    <label for="inputEmail4">RG</label>
                    <input type="text" class="form-control" id="rg${i}" value="${responsavel.rg}" name="rg" placeholder="RG" disabled>
                </div>
                
                <div class="form-group col-auto">
                    <label for="inputPassword4">CPF</label>
                    <input type="text" class="form-control" id="cpf${i}" value="${responsavel.cpf}" name="cpf" placeholder="CPF" onchange="verificaCPF(this)" disabled>
                    <small id="cpfHelp3" class="form-text text-muted">Digite um CPF válido, existe um algoritmo de validação neste campo.</small>
                </div>
                <div class="custom-control custom-checkbox">
                    &nbsp;&nbsp;
                        <input type="checkbox" class="custom-control-input" ${responsavel.pedagogico ? 'checked' : null} disabled id="pedagogico${i}" name="pedagogico">
                        <label class="custom-control-label" for="pedagogico${i}">Responsável pedagógico</label>
                    </div>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <div class="custom-control custom-checkbox">
                        <input type="checkbox" class="custom-control-input" ${responsavel.financeiro ? 'checked' : null} disabled id="financeiro${i}" name="financeiro">
                        <label class="custom-control-label" for="financeiro${i}">Responsável financeiro</label>
                    </div>
                </div>
                <br>
                `

                // for (const id in responsavel) {
                //     if (Object.hasOwnProperty.call(responsavel, id)) {
                //         const value = responsavel[id];
                //         console.log(value)
                //         document.getElementById(id + i).value = value
                //         if (id == 'pedagogico' || id == 'financeiro') {
                //             document.getElementById(id + i).checked = value
                //         }
                //     }
                // }
            }
        }

    for (const key in campos) {
        if (Object.hasOwnProperty.call(campos, key)) {
            const element = campos[key];
            console.log(element)
            console.log(aluno[element.name])
            try {
                if (element.name == 'imagemAluno') {
                    document.getElementById(aluno[element.name]).checked = true;
                } else if (aluno[element.name] != 'on') {
                    document.getElementById(element.name).checked = false
                }
                try {
                    document.getElementById(element.name).value = aluno[element.name] == undefined ? null : aluno[element.name] ; 
                } catch (error) {
                    console.log(error)
                }
                    
                
                
                
            } catch (error) {
                console.log(error)
            }
           
            
            
                
        }
    }
    
    
        
        formEditaAluno.addEventListener('submit', (e) => {
            e.preventDefault();
            campos = $('#formEditaAluno').serializeArray();
            console.log(campos)
            let alunoObjNew = {}
            for (const key in campos) {
                if (Object.hasOwnProperty.call(campos, key)) {
                    const element = campos[key];
                    alunoObjNew[element.name] = element.value
                }
            }
            console.log(alunoObjNew)
            preMatriculasRef.child(key).update(alunoObjNew).then(() => {
                AstNotif.notify('Sucesso', 'Dados alterados com sucesso.')
                $('#modal').modal('hide');
                carregaMatriculas();
            }).catch(error => {
                AstNotif.dialog('Erro', error.message)
                console.log(error)
            })
        })
    }

    function escutaBotoesDelete() {
        document.getElementsByName('deletaPreMatricula').forEach(elem => {
            elem.addEventListener('click', (e) => {
                e.preventDefault()
                let key = e.target.id
                deletaPreMatricula(key)
            })
        })
    }

    function escutaBotoesEdita() {
        document.getElementsByName('editaPreMatricula').forEach(elem => {
            elem.addEventListener('click', (e) => {
                e.preventDefault()
                let key = e.target.id
                editarDadosPreMatricula(key)
            })
        })
    }

    function escutaNomesAlunos() {
        document.getElementsByName('nomesAlunos').forEach(elem => {
            elem.addEventListener('click', (e) => {
                e.preventDefault()
                let key = e.target.id
                abreDadosPreMatricula(key)
            })
        })
    }

    let atualizaPreMatriculas = document.getElementById('atualizaPreMatriculas')
    atualizaPreMatriculas.addEventListener('click', (e) => {
        carregaMatriculas()
        AstNotif.toast('Lista Atualizada')
    })

    let btnMatricularAluno = document.getElementById('btnMatricularAluno')
    btnMatricularAluno.addEventListener('click', async (e) => {
        sessionStorage.setItem('preMatricula', keyAtual)
        
        let btnCadastrarAlunos = document.getElementById('btnCadastrarAlunos');
        btnCadastrarAlunos.click();
        setTimeout(() => {
            carregaProfsETurmas(dados);
        }, 500);
    })
}