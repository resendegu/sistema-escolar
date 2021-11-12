
window.addEventListener('DOMContentLoaded', (e) => {
    let infoEscolaRef = firebase.database().ref('sistemaEscolar/infoEscola')
    let alunosRef = firebase.database().ref('sistemaEscolar/alunos')
    let preMatriculasRef = firebase.database().ref('sistemaEscolar/preMatriculas')
    let alunosDesativadosRef = firebase.database().ref('sistemaEscolar/alunosDesativados')
    let alunosStorageRef = firebase.storage().ref('sistemaEscolar/alunos')
    let timestamp = firebase.functions().httpsCallable('timestamp');
    timestamp().then(function(time) {
        // Instantiating the elements
        const dataEhora = new Date(time.data.timestamp._seconds * 1000);
        console.log(dataEhora);
        console.log(time.data.timestamp)
        var logoEscola = document.getElementById('logoEscola');
        var nomeEscola = document.getElementById('nomeEscola');
        var dataEmissao = document.getElementById('dataEmissao');
        var logoSecundaria = document.getElementById('logoSecundaria');
        var imagemAluno = document.getElementById('imagemAluno');
        var tipoDocumento = document.getElementById('tipoDocumento');
        var nomeAluno = document.getElementById('nomeAluno');
        var matriculaAluno = document.getElementById('matriculaAluno');

        var previousMatricula = document.getElementById('previousMatricula');
        var previousId = document.getElementById('previousId');
        var nextId = document.getElementById('nextId');
        var previousId = document.getElementById('previousId');
        var nextMatricula = document.getElementById('nextMatricula');
        var cabecalho = document.getElementById('cabecalho');
        var tituloSecao = document.getElementById('tituloSecao');
        var dadosTabela = document.getElementById('dadosTabela');
        var dadosFinais = document.getElementById('dadosFinais');
        var espacoFinal = document.getElementById('espacoFinal')

        // Setting info from school
        let infos
        loaderRun(true, 'Carregando dados da escola...')
        infoEscolaRef.once('value').then((infoEscola) => {
            infos = infoEscola.val();
            nomeEscola.innerText =  infos.dadosBasicos.nomeEscola
            dataEmissao.innerText = `${dataEhora.getDate()}/${dataEhora.getMonth() + 1}/${dataEhora.getFullYear()} ${dataEhora.getHours()}:${dataEhora.getMinutes()}`
            logoEscola.innerHTML = `<img src="${infos.logoEscola}" style="width: 70px; height: 70px;"></img>`
            logoSecundaria.innerHTML = `<p style="font-size: x-small;">${infos.dadosBasicos.cnpjEscola}</p><p style="font-size: x-small;">${infos.dadosBasicos.telefoneEscola}</p><p style="font-size: x-small;">${infos.dadosBasicos.enderecoEscola}</p>`
            loaderRun()
        })

        let hash = window.location.hash;
        if (hash) {
            let type = hash.split('?')[0].substring(1);
            let matriculas = hash.split('?')[1];
            let ids = hash.split('?')[2] || '';
            console.log(type, matriculas, ids);
            if (type === 'fichaCadastral') {
                geraFichaCadastral(matriculas);
                tipoDocumento.innerText = 'Ficha Cadastral'
            }
            if (type === 'preMatricula') {
                // Neste caso os parametros recebidos no lugar da matrícula serão um código de pré-matricula
                geraFichaCadastral(matriculas, 'preMatricula')
                console.log('foi')
                tipoDocumento.innerText = 'Ficha de Pré-matrícula'
            }
            if (type === 'boletim') {
                geraBoletim(matriculas, ids); 
                tipoDocumento.innerText = 'Boletim'
            } 
        }



        function adicionaEspacoCabeçalho(texto1='', texto2='', texto3='', texto4='', colspan=null, id='') {
            if (colspan != null) {
                cabecalho.innerHTML += `
                <tr style="height: 20px;" id="cabecalho${id}">
                    <th ${colspan} style="width: 35.7142%; height: 20px; border-style: hidden; text-align: start; font-weight: normal; "><label><b>${texto1}</b></label>&nbsp;<label>${texto2}</label></td>
                </tr>
                `
            } else {
                cabecalho.innerHTML += `
                <tr style="height: 20px;" id="cabecalho${id}">
                    <td style="width: 35.7142%; height: 20px; border-style: hidden;"><label><b>${texto1}</b></label>&nbsp;<label>${texto2}</label></td>
                    <td style="width: 36.1352%; height: 20px; border-style: hidden;"><label><b>${texto3}</b></label>&nbsp;<label>${texto4}</label></td>
                </tr>
                `
            }
            
        }

        function adicionaDadosTabela(texto1='', texto2='', id='') {
            if (texto1[0] == true) {
                dadosTabela.innerHTML += `
                <tr style="height: 20px; " id="${id}">
                    <th colspan=2 style="height: 33px; width: 100%;  text-align: center;"><b>${texto1[1]}</b></th>
                </tr>
                `
            } else if (texto1[0] == false) {
                dadosTabela.innerHTML += `
                <tr style="height: 20px; " id="${id}">
                    <th colspan=2 style="height: 33px; width: 100%;  text-align: start;">&nbsp;<b>${texto1[1]}</b></th>
                </tr>
                `
            } else {
                for (let i = 0; i < texto1.length; i++) {
                    const topico = texto1[i];
                    const texto = texto2[i]
                    dadosTabela.innerHTML += `
                    <tr style="height: 20px; " id="${id}">
                        <td style="min-width: 140px; height: 33px; width: 30%; background-color: lightgray; text-align: center;">&nbsp;${topico}</td>
                        <td style="height: 33px; width: 60%;">&nbsp;${texto}</td>
                    </tr>
                    `
                }
            }
            
        }


        async function geraBoletim(matriculas, ids) {
            let c = 0
            if (matriculas.indexOf(',') !== -1) {
                matriculas = matriculas.split(',');
                ids = ids.split(',');

                console.log(matriculas, ids)

                nextMatricula.style.display = 'block'
                previousMatricula.style.display = 'block'
                nextId.style.display = 'none'
                previousId.style.display = 'none'
                console.log(matriculas);
                gerador(matriculas[c], ids[c]); 
            } else {
                nextMatricula.style.display = 'none'
                previousMatricula.style.display = 'none'
                if (ids.indexOf(',') == -1) {
                    nextId.style.display = 'none'
                    previousId.style.display = 'none'
                } else {
                    nextId.style.display = 'block'
                    previousId.style.display = 'block'
                }
                
                gerador(matriculas, ids)
            }
            
            async function gerador(matricula, id) {
                loaderRun(true, 'Carregando dados da matrícula...')
                dadosTabela.innerHTML = ''
                let alunoInfo = await alunosRef.child(matricula).once('value')
                alunoInfo = alunoInfo.exists() ? alunoInfo : await alunosDesativadosRef.child(matricula + '/dadosAluno').once('value')

                    let aluno = alunoInfo.val();
                    let historico = aluno.historicoEscolar[id]
                    
                    let idade = await calcularIdadePrecisa(aluno.dataNascimentoAluno)
                    console.log(aluno);


                    
                    // Adiciona o semestre mais os livros
                    let semestreLivros = historico.infoAluno.nomePeriodo + ' - '
                    let c1 = 0
                    for (const i in historico.infoAluno.livros) {
                        if (c1 >= 1) {
                            semestreLivros += ' | '
                        }
                        
                        if (Object.hasOwnProperty.call(historico.infoAluno.livros, i)) {
                            const codLivroSistema = historico.infoAluno.livros[i];
                            semestreLivros += infos.livros[codLivroSistema].idLivro 
                        }
                        
                        c1++
                    }
                    adicionaEspacoCabeçalho('Nome: ', aluno.nomeAluno, 'Matrícula:', aluno.matriculaAluno)
                    console.log(aluno.fotoAluno)
                    !aluno.fotoAluno ? null : imagemAluno.src = aluno.fotoAluno 
                    adicionaEspacoCabeçalho('Turma:', historico.turma, 'Curso:', infos.cursos[historico.infoAluno.curso].nomeCurso)
                    adicionaEspacoCabeçalho('Data Início:', historico.infoAluno.inicio.split('-').reverse().join('/'), 'Data término:', historico.infoAluno.fim.split('-').reverse().join('/'))
                    adicionaEspacoCabeçalho('Semestre - Livro:', semestreLivros, '', '', 'colspan=2')

                    tituloSecao.innerText = ''
                    let notasDesempenho = historico.infoAluno.desempenho
                    let notas = []
                    let topicos = []
                    let soma = 0
                    console.log(notasDesempenho)
                    notasDesempenho != undefined ? adicionaDadosTabela([true, 'Notas de desempenho']) : null
                    for (const topicoDesempenho in notasDesempenho) {
                        if (Object.hasOwnProperty.call(notasDesempenho, topicoDesempenho)) {
                            const nota = notasDesempenho[topicoDesempenho];
                            notas.push(nota)
                            topicos.push(topicoDesempenho)
                        }
                    }
                    adicionaDadosTabela(topicos, notas)

                    adicionaDadosTabela([true, 'Notas gerais'])
                    let notasGerais = historico.infoAluno.notas
                    notas = []
                    topicos = []
                    for (const topicoGeral in notasGerais) {
                        if (Object.hasOwnProperty.call(notasGerais, topicoGeral)) {
                            const nota = notasGerais[topicoGeral];
                            notas.push(nota)
                            topicos.push(topicoGeral)
                            soma += nota
                        }
                    }
                    adicionaDadosTabela(topicos, notas)
                    adicionaDadosTabela([false, `Nota Final: ${soma}`])

                    adicionaDadosTabela([true, 'Frequência'])
                    let faltas = 0
                    let frequencia = historico.infoAluno.frequencia
                    for (const time in frequencia) {
                        if (Object.hasOwnProperty.call(frequencia, time)) {
                            const turma = frequencia[time];
                            faltas++
                        }
                    }
                    let aulasPresente = Number(historico.infoAluno.qtdeAulas) - faltas
                    let porcentagemFrequencia = ((100*aulasPresente)/Number(historico.infoAluno.qtdeAulas)).toFixed(2)
                    
                    adicionaDadosTabela(['Frequência (%)', 'Faltas'], [porcentagemFrequencia + '%', faltas == 0 ? 'Nenhuma falta' :`${faltas} de um total de ${historico.infoAluno.qtdeAulas} aulas ministradas`])
                    if (soma >= infos.dadosBasicos.pontosAprovacao) {
                        if (porcentagemFrequencia >= infos.dadosBasicos.frequenciaAprovacao) {
                            adicionaDadosTabela([false, 'Situação final: <label style="color: green;">APROVADO</label>'])
                        } else {
                            adicionaDadosTabela([false, 'Situação final: <label style="color: red;">REPROVADO POR FREQUÊNCIA</label>'])
                        }  
                    } else {
                        if (porcentagemFrequencia < infos.dadosBasicos.frequenciaAprovacao) {
                            adicionaDadosTabela([false, 'Situação final: <label style="color: red;">REPROVADO POR NOTA E FREQUÊNCIA</label>'])
                        } else {
                            adicionaDadosTabela([false, 'Situação final: <label style="color: red;">REPROVADO POR NOTA</label>'])
                        }
                        
                    }
                    
                    espacoFinal.innerHTML = `
                    <br><br>
                    <table style="width: 100%; border-collapse: collapse; border-style: hidden; height: 50px;" border="1">
                        <tbody>
                            <tr style="height: 18px;">
                                <td style="width: 33.3333%; padding: 10px; border-style: hidden; height: 18px; text-align: center;">
                                    <hr style="border-color: black;">
                                    <strong>Professor</strong>
                                </td>
                                <td style="width: 33.3333%; padding: 10px; border-style: hidden; height: 18px; text-align: center;">
                                    <hr style="border-color: black;">
                                    <strong>Dire&ccedil;&atilde;o</strong>
                                </td>
                                <td style="width: 33.3333%; padding: 10px; border-style: hidden; height: 18px; text-align: center;">
                                    <hr style="border-color: black;">
                                    <strong>Aluno ou respons&aacute;vel</strong>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    `
                    
                    loaderRun()
                
            }

            nextMatricula.addEventListener('click', (e) => {
                if (c < matriculas.length - 1) {
                    c++
                    gerador(matriculas[c], ids[c])
                }  
            })

            previousMatricula.addEventListener('click', (e) => {
                if (c > 0) {
                    c--
                    gerador(matriculas[c], ids[c])
                }
            })

        }

        async function geraFichaCadastral(matriculas, tipo='matricula') {
            let c = 0
            if (matriculas.indexOf(',') !== -1) {
                matriculas = matriculas.split(',');
                nextMatricula.style.display = 'block'
                previousMatricula.style.display = 'block'
                nextId.style.display = 'none'
                previousId.style.display = 'none'
                console.log(matriculas);
                gerador(matriculas[c]); 
            } else {
                nextMatricula.style.display = 'none'
                previousMatricula.style.display = 'none'
                nextId.style.display = 'none'
                previousId.style.display = 'none'
                gerador(matriculas)
            }
            
            async function gerador(matricula) {
                loaderRun(true, 'Carregando dados da matrícula...')
                let alunoInfo
                if (tipo === 'matricula') {
                    alunoInfo = await alunosRef.child(matricula).once('value')
                } else {
                    alunoInfo = await preMatriculasRef.child(matricula).once('value')
                }
                
                alunoInfo = alunoInfo.exists() ? alunoInfo : await alunosDesativadosRef.child(matricula + '/dadosAluno').once('value')
                    
                    let aluno = alunoInfo.val();
                    let idade = await calcularIdadePrecisa(aluno.dataNascimentoAluno)
                    let responsaveis = aluno.responsaveis
                    console.log(responsaveis)
                    let responsavel
                    let keyResp
                    for (const key in responsaveis) {
                        if (Object.hasOwnProperty.call(responsaveis, key)) {
                            const resp = responsaveis[key];
                            keyResp = key
                            if (resp.pedagogico) {
                                responsavel = resp
                            
                            }
                        }
                    }
                    if (idade.years < 18) {
                        responsavel = responsavel === undefined ? responsaveis[keyResp] : responsavel
                    }
                    
                    console.log(aluno);
                    let titulos = [
                        [true, 'Dados do Aluno'],
                        [
                            'Data de Nascimento',
                            'CPF',
                            'RG',
                            'E-mail',
                            'Celular',
                            'Telefone',
                            'Endereço',
                            'Cidade - Estado',
                        ],
                        
                        idade.years < 18 ? [true, `${responsavel.relacao} do aluno`] : null,
                        idade.years < 18 ? [
                            'Nome', 'RG', 'CPF', 'Celular', 'E-mail', 
                        ] : null,

                        
                    ]
                    let dados = [
                        '',
                        [
                            aluno.dataNascimentoAluno.split('-').reverse().join('/'),
                            aluno.cpfAluno,
                            aluno.rgAluno,
                            aluno.emailAluno,
                            aluno.celularAluno,
                            aluno.telefoneAluno,
                            `${aluno.enderecoAluno}, ${aluno.bairroAluno}, CEP ${aluno.cepAluno} `,
                            aluno.cidadeAluno + ' - ' + aluno.estadoAluno,
                        ],

                        idade.years < 18 ? [''] : null,
                        idade.years < 18 ? [
                            responsavel.nome, responsavel.rg, responsavel.cpf, responsavel.celular, responsavel.email
                        ] : null,

                        

                    ]

                    
                    adicionaEspacoCabeçalho('Nome: ', aluno.nomeAluno, 'Matrícula:', aluno.matriculaAluno)
                    !aluno.fotoAluno ? null : imagemAluno.src = aluno.fotoAluno 
                    tituloSecao.innerText = ''
                    for (let i = 0; i < titulos.length; i++) {
                        const titulo = titulos[i];
                        const dado = dados[i];
                        adicionaDadosTabela(titulo, dado, i)
                    }
                    loaderRun()
                
                
            }

            nextMatricula.addEventListener('click', (e) => {
                if (c < matriculas.length - 1) {
                    c++
                    gerador(matriculas[c])
                }  
            })

            previousMatricula.addEventListener('click', (e) => {
                if (c > 0) {
                    c--
                    gerador(matriculas[c])
                }
            })

        }
    })
})




