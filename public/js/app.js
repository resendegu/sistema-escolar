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