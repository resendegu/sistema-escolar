var perf = firebase.performance()
// Código padrão para todas as páginas do site

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
function calcularIdadePrecisa(data, now) {
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
}