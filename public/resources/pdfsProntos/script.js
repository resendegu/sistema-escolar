
window.addEventListener('DOMContentLoaded', (e) => {
    let infoEscolaRef = firebase.database().ref('sistemaEscolar/infoEscola')
    let alunosRef = firebase.database().ref('sistemaEscolar/alunos')
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
        var tipoDocuemnto = document.getElementById('tipoDocumento');
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

        // Setting info from school
        loaderRun(true, 'Carregando dados da escola...')
        infoEscolaRef.once('value').then((infoEscola) => {
            let infos = infoEscola.val();
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
            if (type === 'fichaCadastral') geraFichaCadastral(matriculas);
            if (type === 'boletim') geraBoletim(matriculas, ids); 
        }



        function adicionaEspacoCabeçalho(texto1='', texto2='', id='') {
            cabecalho.innerHTML += `
            <tr style="height: 20px;" id="cabecalho${id}">
                <td style="width: 35.7142%; height: 20px; border-style: hidden;"><label>${texto1}</label></td>
                <td style="width: 36.1352%; height: 20px; border-style: hidden;">&nbsp;<label>${texto2}</label></td>
            </tr>
            `
        }

        function adicionaDadosTabela(texto1='', texto2='', id='') {
            if (texto1[0] == true) {
                dadosTabela.innerHTML += `
                <tr style="height: 20px; " id="${id}">
                    <th colspan=2 style="height: 33px; width: 100%; text-align: center;"><b>${texto1[1]}</b></th>
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

        function setaDadosAluno(nome, matricula, foto='', ) {
            nomeAluno.innerText = nome;
            matriculaAluno.innerText = matricula;
            imagemAluno.src = foto;
        }

        

        async function geraFichaCadastral(matriculas) {
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
            
            function gerador(matricula) {
                loaderRun(true, 'Carregando dados da matrícula...')
                alunosRef.child(matricula).once('value').then(async (alunoInfo) => {
                    let aluno = alunoInfo.val();
                    let idade = await calcularIdadePrecisa(aluno.dataNascimentoAluno)
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
                        
                        idade.years < 18 ? [true, `${aluno.relacaoAluno1} do aluno`] : null,
                        idade.years < 18 ? [
                            'Nome', 'RG', 'CPF', 'Celular', 'Telefone comercial', 
                        ] : null,

                        idade.years < 18 && aluno.nomeResponsavelAluno2 != '' ? [true, `${aluno.relacaoAluno2 == 'Outros' ? 'Responsável' : aluno.relacaoAluno2} do aluno`] : null,
                        idade.years < 18 && aluno.nomeResponsavelAluno2 != '' ? [
                            'Nome', 'RG', 'CPF', 'Celular', 'Telefone comercial', 
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
                            aluno.nomeResponsavelAluno1, aluno.rgResponsavel1, aluno.cpfResponsavel1, aluno.numeroCelularResponsavel1, aluno.numeroComercialResponsavel1
                        ] : null,

                        idade.years < 18 && aluno.nomeResponsavelAluno2 != '' ? [''] : null,
                        idade.years < 18 && aluno.nomeResponsavelAluno2 != '' ? [
                            aluno.nomeResponsavelAluno2, aluno.rgResponsavel2, aluno.cpfResponsavel2, aluno.numeroCelularResponsavel2, aluno.numeroComercialResponsavel2
                        ] : null,

                    ]

                    
                    setaDadosAluno(aluno.nomeAluno, aluno.matriculaAluno, aluno.fotoAluno);
                    tituloSecao.innerText = ''
                    for (let i = 0; i < titulos.length; i++) {
                        const titulo = titulos[i];
                        const dado = dados[i];
                        adicionaDadosTabela(titulo, dado, i)
                    }
                    loaderRun()
                })
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




