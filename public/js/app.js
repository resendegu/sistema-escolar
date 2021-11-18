

var perf = firebase.performance()
firebase.analytics();
// Código padrão para todas as páginas do site
var updatesRef = firebase.database().ref('sistemaEscolar/updates')
var loader = document.getElementById('loader')
var loaderMsg = document.getElementById('loaderMsg')

let user
firebase.auth().onAuthStateChanged((usuario) => {
	user = usuario
	monitoraConexao()
	update()
	
})

function update() {
	let versao = 0.99943
	try {
		updatesRef.on('value', (snapshot) => {
			let dados = snapshot.val().lastUpdate
	
			if (versao < dados.versao) {
				abrirModal('modal', 'Atualização do site', `<b>Uma atualização foi lançada:</b><br>Nova versão: ${dados.versao}<br>Sua versão: ${versao}<br>Descrição do novo Update: ${dados.descricao}<br>Importância: ${dados.prioridade}<br>Data do lançamento: ${dados.data}<br><br><a class="btn btn-primary" onclick="window.location.reload(true)">Clique aqui para atualizar</a><br>Caso você tenha clicado para atualizar mas continua vendo esta mensagem, segure a tecla shift e aperte o botão recarregar do navegador para atualizar.`, `<button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`)
			}
		})
	} catch (error) {
		console.log(error)
	}
	
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

const ui = {
	confirm: async (message) => createConfirm(message)
  }
  
const createConfirm = (message) => {
	return new Promise((complete, failed)=>{
		$('#confirmMessage').text(message)

		$('#confirmYes').off('click');
		$('#confirmNo').off('click');
		
		$('#confirmYes').on('click', ()=> { $('.confirm').hide(); complete(true); });
		$('#confirmNo').on('click', ()=> { $('.confirm').hide(); complete(false); });
		
		$('.confirm').show();
	});
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
	let selectAll = '#selectAll2'
	$('[data-toggle="tooltip"]').tooltip();
	
	// Select/Deselect checkboxes
	var checkbox = $('table tbody input[type="checkbox"]');
	$(selectAll).click(function(e){
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
			$(selectAll).prop("checked", false);
		}
	});
};

function ativaCheckboxes3(){
	// Activate tooltip
	let selectAll = '#selectAll3'
	$('[data-toggle="tooltip"]').tooltip();
	
	// Select/Deselect checkboxes
	var checkbox = $('table tbody input[type="checkbox"]');
	$(selectAll).click(function(e){
		console.log(e)
		if(this.checked){
			checkbox.each(function(){
				if (!this.checked) {
					this.click() 
				}
				                       
			});
		} else{
			checkbox.each(function(){
				if (this.checked) {
					this.click()
				}
				                    
			});
		} 
	});
	checkbox.click(function(){
		if(!this.checked){
			$(selectAll).prop("checked", false);
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

function lastTabUsed() {
	try {
		let ultimaAba = sessionStorage.getItem('ultimaAba')
		document.getElementById(ultimaAba).click()
	} catch (error) {
		console.log(error)
	}
}
	


document.getElementById('sidebar').addEventListener('click', (e) => {
	sessionStorage.setItem('ultimaAba', e.target.id)
	console.log(e.target.id)
	
})

function convertTimestamp(timestamp) {
	let time = new Date(timestamp._seconds * 1000)

	return time;
}

function chamados() {
	try {
		let areaEditaChamados = document.getElementById('areaEditaChamados');
		let chamadosRef = firebase.database().ref('sistemaEscolar/chamados');
		let chamadosImg = firebase.storage().ref('sistemaEscolar/chamados');
		let formAddChamados = document.getElementById('formAddChamados');
		let camposAddChamados = document.getElementById('camposAddChamados');
		let btnAddChamado = document.getElementById('btnAddChamado');

		btnAddChamado.addEventListener('click', () => AstNotif.toast('Lista atualizada'));

		areaEditaChamados.style.display = 'none';
		camposAddChamados.style.display = 'block';
		let user;
		setTimeout(() => {
			user = usuarioAtual();
			console.log(user);
		
			document.getElementById('nome').value = user.displayName;
			document.getElementById('email').value = user.email;
	
			carregaChamados()
			
		}, 1000);
		
		formAddChamados.addEventListener('submit', async (e) => {
			e.preventDefault();
			const confirm = await ui.confirm('Depois de aberto o chamado, a equipe de suporte receberá um e-mail com todas as informações cadastradas e dará uma resposta dentro do tempo de resposta aproximadamente. Você confirma a abertura do chamado?');
	  
			if(confirm){
				loaderRun(true, 'Abrindo chamado e enviando arquivos')
				let firebaseKey = await chamadosRef.push().key
				let formData = new FormData(formAddChamados)
				let imagens = formData.getAll('imagens')
				console.log(imagens)
				let data = $('#formAddChamados').serializeArray();
				console.log(data);
	
				let dataObj = {};
				data.forEach(element => {
					dataObj[element.name] = element.value;
				});
				console.log(dataObj);
	
				let imagesUrl = []
				let c = 0
				
				
	
				if (imagens[0].name == '') {
					await chamadosRef.child(firebaseKey).set(dataObj)
					loaderRun()
					AstNotif.dialog('Sucesso', 'Seu chamado foi aberto, e os servidores já estão processando sua abertura. Em instantes será enviado um e-mail para nossa equipe de suporte, tendo seu endereço de e-mail em cópia para que possa acompanhar a solicitação. Verifique sua caixa de entrada, e em alguns casos, sua caixa de SPAM também.')
				} else {
					imagens.forEach(async (img) => {
						let uploadTask = await chamadosImg.child(firebaseKey).child(img.name).put(img)
						let url = await uploadTask.ref.getDownloadURL()
						imagesUrl.push(url)
						dataObj.imagens = imagesUrl
						if (c == (imagens.length - 1)) {
							await chamadosRef.child(firebaseKey).set(dataObj)
							loaderRun()
		
							AstNotif.dialog('Sucesso', 'Seu chamado foi aberto, e os servidores já estão processando sua abertura. Em instantes será enviado um e-mail para nossa equipe de suporte, tendo seu endereço de e-mail em cópia para que possa acompanhar a solicitação. Verifique sua caixa de entrada, e em alguns casos, sua caixa de SPAM também.')
						}
						
						c++
					})
				}
		
			}
		})
	
		const badges = ['success', 'info', 'warning', 'danger'];
		const priorities = ['Baixa', 'Média', 'Alta', 'Crítica'];
	
		const situationsBadges = ['warning', 'primary', 'success']
		const situations = ['Pendente', 'Em análise', 'Finalizado']
	
		const carregaChamados = async () => {
			let listaChamados = document.getElementById('listaChamados')
	
			chamadosRef.on('value', (snapshot) => {
				let chamados = snapshot.val()
				if (snapshot.exists()) {
					listaChamados.innerHTML = ''
				} else {
					listaChamados.innerHTML = '<tr><td></td> <td>Nenhum chamado encontrado</td></tr>'
				}
				
				for (const key in chamados) {
					if (Object.hasOwnProperty.call(chamados, key)) {
						const chamado = chamados[key];
						const priority = chamado.prioridade
						let timestamp = !chamado.timestamp ? null : convertTimestamp(chamado.timestamp)
						listaChamados.innerHTML += `
						<tr>
						<td>
						  
						</td>
						<td>${chamado.assunto}</td>
						<td><span class="badge badge-pill badge-${badges[priority]}">${priorities[priority]}</span></td>
						<td>${timestamp ? timestamp.toLocaleDateString() + ' ás ' +  timestamp.toLocaleTimeString() : 'Aguardando servidor...'}</td>
						<td><span class="badge badge-pill badge-${chamado.situacao == undefined ? 'light' : situationsBadges[chamado.situacao]}">${chamado.situacao == undefined ? 'Processando...' : situations[chamado.situacao]}</span></td>
						<td>
						  <a style="cursor: pointer;" name="editaChamado" id="chamado|${key}" class="action" data-toggle="modal" data-toggle="tooltip" data-placement="top" title="Editar"><i data-feather="edit" >&#xE254;</i></a>
						  
						</td>
					  </tr>
						`
					}
				}
				feather.replace()
				escutaEditaChamados()
			})
		}

		function escutaEditaChamados() {
			document.getElementsByName('editaChamado').forEach(elem => {
				elem.addEventListener('click', (e) => {
					editaChamados(e.target.id.split('|')[1])
				})
			})
		}

		async function editaChamados(key) {
			AstNotif.dialog('E ai', 'Aqui quem fala é o programador. Ainda estamos desenvolvendo a edição de chamados. Caso queira editar algum chamado, entre em contato com o suporte via e-mail. Pedimos desculpas por qualquer transtorno.')
		}
	} catch (error) {
		console.log(error)
		loaderRun()
	}
}


function handleCalendar() {
	// calendar.on('dateClick', function(info) {
	// 	console.log(info)
	// })
}