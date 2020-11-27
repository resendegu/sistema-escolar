// Código padrão para todas as páginas do site

function usuarioAtual() {
    let user = firebase.auth().currentUser;

    return user
}

