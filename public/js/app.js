
var perf = firebase.performance()
firebase.analytics();
// Código padrão para todas as páginas do site
var updatesRef = firebase.database().ref('sistemaEscolar/updates')
var loader = document.getElementById('loader')
var loaderMsg = document.getElementById('loaderMsg')

var loader = document.getElementById('loader')
var loaderMsg = document.getElementById('loaderMsg')

let user
firebase.auth().onAuthStateChanged((usuario) => {
	user = usuario
	monitoraConexao()
	update()
})

function update() {
	let versao = 0.995
	updatesRef.on('value', (snapshot) => {
		let dados = snapshot.val().lastUpdate

		if (versao < dados.versao) {
			abrirModal('modal', 'Atualização do site', `<b>Uma atualização foi lançada:</b><br>Nova versão: ${dados.versao}<br>Sua versão: ${versao}<br>Descrição do novo Update: ${dados.descricao}<br>Importância: ${dados.prioridade}<br>Data do lançamento: ${dados.data}<br><br><a class="btn btn-primary" onclick="window.location.reload(true)">Clique aqui para atualizar</a><br>Caso você tenha clicado para atualizar mas continua vendo esta mensagem, segure a tecla shift e aperte o botão recarregar do navegador para atualizar.`, `<button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`)
		}
	})
}

function loaderRun(show=false, msg='') {
	let loader = document.getElementById('loader')
	let loaderMsg = document.getElementById('loaderMsg')
	if (show) {
		loader.style.display = 'block'
		loaderMsg.innerText = msg
	} else {
		loader.style.display = 'none'
		loaderMsg.innerText = 'Aguarde...'
	}
}

function usuarioAtual() {
    let user = firebase.auth().currentUser;

    return user
}

/**
 * Define um modal e o abre
 * @param {string} id O id do modal. O padrão é 'modal'
 * @param {string} titulo Título do seu modal
 * @param {*} corpo O que será renderizado no corpo do modal
 * @param {*} botoes O que será renderizado nos botões do rodapé do modal
 */
function abrirModal(id='modal', titulo, corpo, botoes) {
    document.getElementById('titulo').innerText = titulo
    document.getElementById('corpo').innerHTML = corpo
    document.getElementById('botoes').innerHTML = botoes
	$('#' + id).modal({backdrop: 'static'})
    $('#' + id).modal()
}


async function getAddress(numCep) {
    try {
        const resp = await fetch('https://brasilapi.com.br/api/cep/v1/' + numCep)
        const address = await resp.json();
        return address;
    } catch (error) {
        console.log(error)
        throw new Error(error);
    }
}

/* 
* Função CacularIdade
* Função para calcular a idade de uma pessoa, tendo como base o dia de hoje
* @params data - String referente à data de nascimento da pessoa, no formato dd/mm/yyyy
* @return Retorna uma string com a idade da pessoa em anos.
*/
function calcularIdadePrecisa(dataNasc) {
	console.log(dataNasc)
	let nascimento = dataNasc
	nascimento = nascimento.split('-')
    let data = new Date()
    data.setDate(Number(nascimento[2]))
    data.setFullYear(Number(nascimento[0]))
    data.setMonth(Number(nascimento[1]) - 1)
    for (const key in nascimento) {
        if (Object.hasOwnProperty.call(nascimento, key)) {
            const element = nascimento[key];
            nascimento[key] = parseInt(element)
        }
    }
	let timestampNow = firebase.functions().httpsCallable('timestamp')
	return timestampNow().then(function(result){
		var now = new Date(result.data.timestamp._seconds * 1000)

		var yearNow = now.getYear();
		var monthNow = now.getMonth();
		var dateNow = now.getDate();

		var yearDob = data.getYear();
		var monthDob = data.getMonth();
		var dateDob = data.getDate();
		var age = {};
		yearAge = yearNow - yearDob;

		if (monthNow >= monthDob)
			var monthAge = monthNow - monthDob;
		else {
			yearAge--;
			var monthAge = 12 + monthNow -monthDob;
		}

		if (dateNow >= dateDob)
			var dateAge = dateNow - dateDob;
		else {
			monthAge--;
			var dateAge = 31 + dateNow - dateDob;

			if (monthAge < 0) {
			monthAge = 11;
			yearAge--;
			}
		}

		age = {
				years: yearAge,
				months: monthAge,
				days: dateAge
			};
		
		return age;
	}).catch(function(error){
		throw new Error(error)
	})
	
}

function maiusculo(element) {
	element.value = element.value.toUpperCase()
	return element.value.toUpperCase()
}

function formataNumMatricula(num) {
    let numero = num
    numero = "00000" + numero.replace(/\D/g, '');
	numero = numero.slice(-5,-1) + numero.slice(-1);
	return numero
}

function ativaCheckboxes(){
	// Activate tooltip
	$('[data-toggle="tooltip"]').tooltip();
	
	// Select/Deselect checkboxes
	var checkbox = $('table tbody input[type="checkbox"]');
	$("#selectAll").click(function(e){
		console.log(e)
		if(this.checked){
			checkbox.each(function(){
				this.checked = true;                        
			});
		} else{
			checkbox.each(function(){
				this.checked = false;                        
			});
		} 
	});
	checkbox.click(function(){
		if(!this.checked){
			$("#selectAll").prop("checked", false);
		}
	});
};

function ativaCheckboxes2(){
	// Activate tooltip
	$('[data-toggle="tooltip"]').tooltip();
	
	// Select/Deselect checkboxes
	var checkbox = $('table tbody input[type="checkbox"]');
	$("#selectAll2").click(function(e){
		console.log(e)
		if(this.checked){
			checkbox.each(function(){
				this.checked = true;                        
			});
		} else{
			checkbox.each(function(){
				this.checked = false;                        
			});
		} 
	});
	checkbox.click(function(){
		if(!this.checked){
			$("#selectAll2").prop("checked", false);
		}
	});
};

// Monitora última vez online
function monitoraConexao() {
	try {
		// Since I can connect from multiple devices or browser tabs, we store each connection instance separately
		// any time that connectionsRef's value is null (i.e. has no children) I am offline
		var userConnectionsRef = firebase.database().ref('sistemaEscolar/usuarios/' + user.uid + '/connections');

		// stores the timestamp of my last disconnect (the last time I was seen online)
		var lastOnlineRef = firebase.database().ref(`sistemaEscolar/usuarios/${user.uid}/lastOnline`);

		var connectedRef = firebase.database().ref('.info/connected');
		let c = 0
		connectedRef.on('value', (snap) => {
			if (snap.val() === true) {
				if (c > 1) {
					try {
						let snack = document.getElementById("ast-snack-el")
						snack.remove()
						console.log('elemento removido')
					} catch (error) {
						console.log(error)
					}
					AstNotif.snackbar('Você está devolta online!', {length: 5000, color: 'white', bgcolor: 'darkgreen', position: 'top'})
				}
				
				

				// We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
				var con = userConnectionsRef.push();

				// When I disconnect, remove this device
				con.onDisconnect().remove();

				// Add this device to my connections list
				// this value could contain info about the device or a timestamp too
				con.set(true);

				// When I disconnect, update the last time I was seen online
				lastOnlineRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
				
			} else {
				if (c > 1) {
					AstNotif.snackbar('Verifique sua conexão com a internet. Não estamos conseguindo nos comunicar com os servidores...', {length: 100000, color: 'white', bgcolor: 'red', position: 'top'})
				console.log('desconectado')
				}
				
			}
			c++
			console.log(c)
		});
	} catch (error) {
		console.log(error)
	}
	
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


async function storageDownload(ref, nomeArquivo) {
    return firebase.storage().ref(ref).getDownloadURL().then(function(urlDownload) {
		// `url` is the download URL for 'images/stars.jpg'
	  
		// This can be downloaded directly:
		AstNotif.dialog("Aguarde", `<img src="../images/carregamento.gif" width="50px"> <br> Baixando arquivo...<br> O download pode demorar dependendo da sua conexão e do tamanho do arquivo.`, {fa: "exclamation-circle", positive: "", negative: "", iconSize: 48});
		try {
			return fetch(urlDownload).then(resp => resp.blob()).then(blob => {
				const url = window.URL.createObjectURL(blob)
				const a = document.createElement('a')
				a.style.display = 'none'
				a.href = url
				a.download = nomeArquivo
				console.log(a)
				document.body.appendChild(a)
				a.click()
				window.URL.revokeObjectURL(url)
				document.getElementById('ast-dialog-bg').remove()
				return {answer: 'Download concluído', url: urlDownload}
			}).catch((error) => {
				console.log(error)
				throw new Error(error.message)
			})
		} catch (error) {
			console.log(error)
			throw new Error(error.message)
		}
		
	}).catch(function(error) {
		console.log(error)
		throw new Error(error.message)
	});
}

async function storageDelete(ref) {
	var deleteRef = firebase.storage().ref(ref)

	return deleteRef.delete().then(function() {
		return {answer: 'Arquivo deletado com sucesso!'}
	}).catch(function(error) {
		console.log(error)
		throw new Error(error.message)
	})
}

async function retornaDadosAluno(matricula='') {
	let alunosDBRef = firebase.database().ref('sistemaEscolar/alunos')

	try {
		let dados = await alunosDBRef.child(matricula).once('value')
		return dados.val()
	} catch (error) {
		throw new Error(error);
	}
	
}

function verificaCPF(element) {
    let cpfAluno = element;
	let strCPF = element.value;
    var Soma;
    var Resto;
    Soma = 0;
  if (strCPF == "00000000000" || strCPF.length != 11) {
    AstNotif.dialog('CPF inválido.', 'Digite e Verifique as informações de CPF novamente.')
    cpfAluno.value = ''
  }
  for (i=1; i<=9; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (11 - i);
  Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11))  Resto = 0;
    if (Resto != parseInt(strCPF.substring(9, 10)) ) {
        AstNotif.dialog('CPF inválido.', 'Digite e Verifique as informações de CPF novamente.')
        cpfAluno.value = ''
    } 

  Soma = 0;
    for (i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (12 - i);
    Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11))  Resto = 0;
    if (Resto != parseInt(strCPF.substring(10, 11) ) ) {
        AstNotif.dialog('CPF inválido.', 'Digite e Verifique as informações de CPF novamente.')
        cpfAluno.value = ''
    } 
    return true;
}

window.addEventListener('DOMContentLoaded', (e) => {
	try {
		let ultimaAba = sessionStorage.getItem('ultimaAba')
		document.getElementById(ultimaAba).click()
	} catch (error) {
		console.log(error)
	}
})

document.getElementById('sidebar').addEventListener('click', (e) => {
	sessionStorage.setItem('ultimaAba', e.target.id)
	console.log(e.target.id)
	
})