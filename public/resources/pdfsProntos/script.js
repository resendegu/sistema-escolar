
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
        infoEscolaRef.once('value').then((infoEscola) => {
            let infos = infoEscola.val();
            nomeEscola.innerText =  infos.dadosBasicos.nomeEscola
            dataEmissao.innerText = `${dataEhora.getDate()}/${dataEhora.getMonth() + 1}/${dataEhora.getFullYear()} ${dataEhora.getHours()}:${dataEhora.getMinutes()}`
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
            cabecalho.innerHTML = `
            <tr style="height: 20px;" id="cabecalho${id}">
                <td style="width: 35.7142%; height: 20px; border-style: hidden;"><label>${texto1}</label></td>
                <td style="width: 36.1352%; height: 20px; border-style: hidden;">&nbsp;<label>${texto2}</label></td>
            </tr>
            `
        }

        function adicionaDadosTabela(texto1='', texto2='', id='') {
        dadosTabela.innerHTML = `
            <tr style="height: 33px;" id="${id}">
                <td style="min-width: 140px; height: 33px; width: 25.7961%;">${texto1}</td>
                <td style="height: 33px; width: 74.0446%;">${texto2}</td>
            </tr>
        ` 
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
                console.log(matriculas);
                gerador(matriculas[0]); 
            } else {
                
            }
            function gerador(matricula) {
                alunosRef.child(matricula).once('value').then((alunoInfo) => {
                    alunosStorageRef.child(matricula + '/arquivos').getDownloadURL().then((url) => {

                    })
                    let aluno = alunoInfo.val();
                    console.log(aluno);
                    setaDadosAluno(aluno.nomeAluno, aluno.matriculaAluno, aluno.fotoAluno);
                    c++;
                    
                })
            }

            nextMatricula.addEventListener('click', (e) => {
                if (c < matriculas.length - 1) {
                    gerador(matriculas[c])
                }  
            })

            previousMatricula.addEventListener('click', (e) => {
                if (c > 0) {
                    gerador(matriculas[c])
                }
            })

        }
    })
})




