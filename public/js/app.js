var perf = firebase.performance()
firebase.analytics();
// Código padrão para todas as páginas do site
var updatesRef = firebase.database().ref('sistemaEscolar/updates')
var loader = document.getElementById('loader')
var loaderMsg = document.getElementById('loaderMsg')

var loader = document.getElementById('loader')
var loaderMsg = document.getElementById('loaderMsg')

function update() {
	let versao = 0.94
	updatesRef.on('value', (snapshot) => {
		let dados = snapshot.val()
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
function calcularIdadePrecisa(data) {
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
	$("#selectAll").click(function(){
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