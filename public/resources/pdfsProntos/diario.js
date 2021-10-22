window.addEventListener('DOMContentLoaded', (e) => {
    let hash = window.location.hash;
    if (hash) {
        let servico = hash.split('?')[0].substring(1);
        let turma = hash.split('?')[1];
        let codHistorico = hash.split('?')[2];
        
        console.log(servico)
        switch (servico) {
            case 'diario':
                geraDiario(turma, codHistorico)
                break;
            
            default:
                break;
        }
        
    }
})

function timestamp(time) {
    document.getElementById('timestamp').innerText = time
}

function title(title) {
    let titleRow = document.getElementById('title')
    titleRow.innerHTML = `<td class="tg-wp8o" colspan="16"><span style="font-weight:bold">${title}</span></td>`
}

function infoSchool(info) {
    let infoSchoolRow = document.getElementById('infoSchool')
    infoSchoolRow.innerHTML = `
    <td class="tg-wp8o" colspan="16">${info.nomeEscola} | CNPJ: ${info.cnpjEscola} <br> ${info.enderecoEscola} - Telefone: ${info.telefoneEscola} - E-mail: ${info.emailEscola}</td>
    `
    
}

function infoDoc(info, curso) {
    const infoDocRow = document.getElementById('infoDoc')
    infoDocRow.innerHTML = `
        <td class="tg-sg5v" colspan="4">
            <b>Curso:</b><br>
            <b>Professor:</b><br>
            <b>Início e Fim previstos:</b>
        </td>
        <td class="tg-sg5v" colspan="4">
            ${curso}<br>
            ${info.professor[0].nome}<br>
            ${info.status.inicio.split('-').reverse().join('/')} - ${info.status.fim.split('-').reverse().join('/')}
        </td>
        <td class="tg-sg5v" style="text-align: end;" colspan="6">
            <b>Turma:</b><br>
            <b>Período:</b><br>
            <b>Horário:</b>
        </td>
        <td class="tg-sg5v" colspan="2">
            ${info.codigoSala}<br>
            ${info.status.nomePeriodo}<br>
            ${info.hora}h
        </td>
    `
}

function setRows(rows) {
    let rowsElem = document.getElementById('rows')
    rowsElem.innerHTML = ''

    let html = ''
    let cells
    rows.map((row) => {
        cells = ''
        row.map((cell) =>{ 
            cells += `<td class="tg-0lax" style="${cell.center && 'text-align: center;'}" colspan="${cell.size}">${cell.text}</td>`
        })
        html += `<tr>${cells}</tr>`
    })

    rowsElem.innerHTML = html
    
}

function infoTopics(topics) {
    const infoTopicsRow = document.getElementById('infoTopics')
    let c = 16
    infoTopicsRow.innerHTML = ''

    topics.map((topic, i) => {
        infoTopicsRow.innerHTML += `
            <td class="tg-0pky" style="${topic.center && 'text-align: center;'}" colspan="${topic.size}">${topic.text}</td>
        `
    })

}

function lastRow(row) {
    const lastRowElem = document.getElementById('lastRow')
    let html = ''
    let cells = ''
    row.map((cell) =>{ 
        cells += `<td class="tg-0lax" colspan="${cell.size}">${cell.text}</td>`
    })
    html = `<tr> ${cells}</tr>`
    lastRowElem.innerHTML = html
}

async function geraDiario(turma, codHistorico) {
    loaderRun(true, 'Aguarde, processando...')
    const turmaRef = firebase.database().ref('sistemaEscolar/turmas').child(turma);
    const desempenhoRef = firebase.database().ref('sistemaEscolar/notasDesempenho/referencia')
    const infoEscola = (await firebase.database().ref('sistemaEscolar/infoEscola').once('value')).val();
    const infoTurma = (await turmaRef.once('value')).val();
    const notasDesempenho = (await desempenhoRef.once('value')).val()
    let somatorioDesempenho = 0
    for (const nomeNota in notasDesempenho) {
        if (Object.hasOwnProperty.call(notasDesempenho, nomeNota)) {
            const nota = notasDesempenho[nomeNota];
            somatorioDesempenho += nota
        }
    }
    const timeNow = firebase.functions().httpsCallable('timestamp')
    let timestampNow = (await timeNow()).data.timestamp
    let now = new Date(timestampNow._seconds * 1000)
    timestamp(`Data e hora de emissão: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`)

    infoSchool(infoEscola.dadosBasicos)
    title('NOTAS E FALTAS LANÇADAS PARA A TURMA')

    let nomeCurso = infoEscola.cursos[infoTurma.curso].nomeCurso
    infoDoc(infoTurma, nomeCurso)
    // the sizes for info topics must sum 16 mandatorily
    const notas = infoTurma.notas
    let qtdeNotas = Object.keys(notas).length
    let topicsArray = [
        {text: 'Nº', size: 1, width: '10%'},
        {text: 'Aluno', size: 13 - qtdeNotas, width: '37%'},
    ]
    
    for (const nomeNota in notas) {
        if (Object.hasOwnProperty.call(notas, nomeNota)) {
            const totalPts = notas[nomeNota];
            topicsArray.push({text: `${nomeNota}<br>(${totalPts}pts)`, size: 1, center: true})
        }
    }
    topicsArray.push({text: 'Total', size: 1, rotate: true})
    topicsArray.push({text: 'Faltas', size: 1, rotate: true})
    infoTopics(topicsArray)

    let rows = []
    const alunos = infoTurma.alunos
    let c = 0
    for (const matricula in alunos) {
        if (Object.hasOwnProperty.call(alunos, matricula)) {
            const aluno = alunos[matricula];
            let infoRow = []
            infoRow.push({text: c + 1, size: 1, center: true});
            infoRow.push({text: aluno.nome, size: 13 - qtdeNotas});
            let somatorioNotas = 0
            for (const nomeNota in aluno.notas) {
                if (Object.hasOwnProperty.call(aluno.notas, nomeNota)) {
                    const nota = aluno.notas[nomeNota];
                    infoRow.push({text: nota, size: 1, center: true});
                    somatorioNotas += nota;
                }
            }
            infoRow.push({text: somatorioNotas, size: 1, center: true});
            const totalFaltas = aluno.frequencia ? Object.keys(aluno.frequencia).length : 0
            infoRow.push({text: totalFaltas, size: 1, center: true})
            
            rows.push(infoRow)
            c++
        }
    }
    console.log(rows)
    setRows(rows)

    let lastRowArray = []
    lastRowArray.push({text: '', size: 1})
    lastRowArray.push({text: 'Visto:<br>___/___/______', size: 1})
    lastRowArray.push({text: 'Assinatura', size: 14})
    lastRow(lastRowArray)

    loaderRun()
}