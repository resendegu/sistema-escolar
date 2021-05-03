const driver = new Driver({
    className: 'scoped-class',        // className to wrap driver.js popover
    animate: true,                    // Whether to animate or not
    opacity: 0.75,                    // Background opacity (0 means only popovers and without overlay)
    padding: 10,                      // Distance of element from around the edges
    allowClose: true,                 // Whether the click on overlay should close or not
    overlayClickNext: false,          // Whether the click on overlay should move next
    doneBtnText: 'Pronto',              // Text on the final button
    closeBtnText: 'Fechar',            // Text on the close button for this step
    stageBackground: 'rgb(255,255,255)',       // Background color for the staged behind highlighted element
    nextBtnText: 'Próximo',              // Next button text for this step
    prevBtnText: 'Anterior',          // Previous button text for this step
    showButtons: false,               // Do not show control buttons in footer
    keyboardControl: false,            // Allow controlling through keyboard (escape to close, arrow keys to move)
    scrollIntoViewOptions: {},        // We use `scrollIntoView()` when possible, pass here the options for it if you want any
    onHighlightStarted: (Element) => {}, // Called when element is about to be highlighted
    onHighlighted: (Element) => {},      // Called when element is fully highlighted
    onDeselected: (Element) => {},       // Called when element has been deselected
    onReset: (Element) => {},            // Called when overlay is about to be cleared
    onNext: (Element) => {},                    // Called when moving to next step on any step
    onPrevious: (Element) => {},                // Called when moving to previous step on any step
});


function iniciaTour(user) {
    console.log(user)
    let acesso = document.location.hash.substring(1)
    if (user == null) {
        if (document.location.pathname == '/login.html' && document.location.hash != '') {
            
            console.log(acesso)
            if (acesso == 'master') {
                setTimeout(function(){
                    driver.defineSteps([
                        {
                          element: '#toggleCadastrarEntrar',
                          popover: {
                            className: 'scoped-class',
                            title: 'Vamos lá!',
                            description: 'Iremos te guiar no seu primeiro acesso. E para começar, precisamos cadastrar um email e senha que já foi definido do banco de dados dos administradores Master. (Se você ainda não fez isso ou não sabe o que é isto, peça o suporte da equipe de TI).<br><br> Clique em "Quero me Cadastrar".',
                            position: 'right'
                          }
                        },
                        {
                          element: '#loginContainer',
                          popover: {
                            className: 'scoped-class2',
                            title: 'Preencha o formulário de cadastro',
                            description: 'Aqui você irá usar o e-mail que o suporte de TI configurou para você. A senha você poderá criar. <br>Quando estiver pronto, clique em "Cadastrar". Nos veremos denovo assim que você terminar o seu cadastro. Agora é com você!',
                            position: 'bottom-center'
                          }
                        },
                      ]);
                      driver.start();
                }, 500);
                document.getElementById('toggleCadastrarEntrar').addEventListener('click', (e) => {
                    driver.moveNext()
                    document.location.hash = 'mastercadastrado'
                })   
            } else if (acesso == 'mastercadastrado') {
                setTimeout(function(){
                    driver.defineSteps([
                        {
                          element: '#loginContainer',
                          popover: {
                            className: 'scoped-class2',
                            title: 'Muito Bem!',
                            description: 'Você já está cadastrado. Aguarde uns 30 segundos para que suas credenciais de master se propagem nos servidores.<br> Insira o e-mail e senha e clique em entrar.',
                            position: 'bottom-center'
                          }
                        },
                      ]);
                      driver.start();
                }, 500);   
            }
        }
    } else {
        if (acesso == 'mastercadastrado') {
            setTimeout(function(){
                driver.defineSteps([
                    {
                      element: '#cardUser',
                      popover: {
                        className: 'scoped-class2',
                        title: 'Você está logado!',
                        description: 'Esta é área de usuário do sistema. Aqui, recomendamos que você clique em "Verificar meu email" para que você não tenha problemas de acesso no sistema. Caso precise, por aqui também você pode alterar sua senha e sua foto de perfil.<br> <button class="btn btn-primary" onclick="driver.moveNext()">Continuar</button>',
                        position: 'right'
                      }
                    },
                    {
                        element: '#painelAdm',
                        popover: {
                          className: 'scoped-class2',
                          title: 'Painel do Administrador',
                          description: 'Este é o painel do administrador. É por aqui que você libera e bloqueia os acessos dos usuários que irão utilizar o sistema. <br>Fique tranquilo pois, qualquer outro usuário que não seja o master, que se cadastrar no sistema, não terá acesso à nenhum dado.<br>Aqui você têm a relação de todos os usuários que estão cadastrados no sistema. Você pode clicar nele para ver os acessos que eles possuem e também pode alterá-los. Lembrando que para que um acesso seja propagado, o usuário deve sair de sua conta (caso esteja logado no momento), e logar novamente para que o acesso seja aplicado.<br> Por aqui também você consegue apagar contas de usuário.<br><button class="btn btn-primary" onclick="driver.moveNext()">Continuar</button>',
                          position: 'left'
                        }
                    },
                    {
                        element: '#navbarNavDropdown',
                        popover: {
                          className: 'scoped-class2',
                          title: 'Navegue no sistema',
                          description: 'Você sempre verá uma barra como essa no topo para navegar entre as diferentes áreas do sistema. Basta clicar e você estará em uma delas!<br><button class="btn btn-primary" data-dismiss="modal" onclick="driver.moveNext()">Continuar</button>',
                          position: 'bottom'
                        }
                    },
                    {
                        element: '#help',
                        popover: {
                          className: 'scoped-class2',
                          title: 'A gente te ajuda!',
                          description: 'Caso queira ver um tutorial como este, basta clicar em "Help", e nós tentaremos te guiar com um tutorial simples como este. Mas se mesmo assim ainda estiver com dúvidas, contate nossa equipe do suporte.<br> Esperamos que você tenha uma ótima experiência com nosso sistema.<br><br> Basta clicar em algum lugar fora de mim para que eu saia!',
                          position: 'bottom-center'
                        }
                    },
                  ]);
                  driver.start();
            }, 500);   
            
        }
    }
}

function tourLogin() {
    driver.defineSteps([
        {
          element: '#cardUser',
          popover: {
            className: 'scoped-class2',
            title: 'Você está logado!',
            description: 'Esta é área de usuário do sistema. Aqui, recomendamos que você clique em "Verificar meu email" para que você não tenha problemas de acesso no sistema. Caso precise, por aqui também você pode alterar sua senha e sua foto de perfil.<br> <button class="btn btn-primary" onclick="driver.moveNext()">Continuar</button>',
            position: 'right'
          }
        },
        {
            element: '#painelAdm',
            popover: {
              className: 'scoped-class2',
              title: 'Painel do Administrador',
              description: 'Este é o painel do administrador. É por aqui que você libera e bloqueia os acessos dos usuários que irão utilizar o sistema. <br>Fique tranquilo pois, qualquer outro usuário que não seja o master, que se cadastrar no sistema, não terá acesso à nenhum dado.<br>Aqui você têm a relação de todos os usuários que estão cadastrados no sistema. Você pode clicar nele para ver os acessos que eles possuem e também pode alterá-los. Lembrando que para que um acesso seja propagado, o usuário deve sair de sua conta (caso esteja logado no momento), e logar novamente para que o acesso seja aplicado.<br> Por aqui também você consegue apagar contas de usuário.<br><button class="btn btn-primary" onclick="driver.moveNext()">Continuar</button>',
              position: 'left'
            }
        },
        {
            element: '#navbarNavDropdown',
            popover: {
              className: 'scoped-class2',
              title: 'Navegue no sistema',
              description: 'Você sempre verá uma barra como essa no topo para navegar entre as diferentes áreas do sistema. Basta clicar e você estará em uma delas!<br><button class="btn btn-primary" data-dismiss="modal" onclick="driver.moveNext()">Continuar</button>',
              position: 'bottom'
            }
        },
        {
            element: '#help',
            popover: {
              className: 'scoped-class2',
              title: 'A gente te ajuda!',
              description: 'Caso queira ver um tutorial como este, basta clicar em "Help", e nós tentaremos te guiar com um tutorial simples como este. Mas se mesmo assim ainda estiver com dúvidas, contate nossa equipe do suporte.<br> Esperamos que você tenha uma ótima experiência com nosso sistema.<br><br> Basta clicar em algum lugar fora de mim para que eu saia!',
              position: 'bottom-center'
            }
        },
      ]);
      driver.start();
}

function tourSecretaria() {
    document.getElementById('btnAbaDashboard').click()
    driver.defineSteps([
        // Parte inicial
        {
          element: '#telaPrincipalSecretaria',
          popover: {
            className: 'scoped-class2',
            title: 'Esta é a Secretaria.',
            description: 'No dashboard você consegue ter acesso à dados rápidos sobre sua escola, como aniversariantes do mês, números de alunos matriculados, desativados, entre outros dados.<br> <button class="btn btn-primary" onclick="driver.moveNext()">Continuar</button>',
            position: 'left'
          }
        },
        {
            element: '#sidebar',
            popover: {
              className: 'scoped-class2',
              title: 'Telas da Secretaria',
              description: 'Estes botões são as diferentes telas da área da Secretaria. Você pode alternar entre elas rapidamente, e ainda sem perder o que escreveu na outra tela. <b>Uma experiência de navegação diferenciada!</b><br> Os últimos botões abaixo de "CHATS", são diferentes web chats criados para que você possa conversar internamente com sua equipe. Você pode criar novos chats no botão com símbolo de adição (+).<br><button class="btn btn-primary" onclick="driver.moveNext()">Continuar</button>',
              position: 'left'
            }
        },
        // Parte de cadastro de turmas
        {
            element: '#btnCadastrarTurmas',
            popover: {
              className: 'scoped-class2',
              title: 'Tela de Alunos',
              description: 'Vamos ver a tela de cadastro de Turmas<br><br> Clique em "Cadastrar turmas"',
              position: 'top'
            }
        },
        // Parte da aba de alunos
        {
            element: '#btnAbaAlunos',
            popover: {
              className: 'scoped-class2',
              title: 'Tela de Alunos',
              description: 'Vamos ver o que há de interessante na tela de Alunos<br><br> Clique em "Alunos"',
              position: 'top'
            }
        },
        {
            element: '#abaAlunos',
            popover: {
              className: 'scoped-class2',
              title: 'Tela de Alunos!',
              description: 'Na aba Alunos é mostrado uma tabela mostrando todos os alunos matriculados e ativos na escola. A lista é ordenada pelos números de matrícula dos alunos. Acima da tabela há um campo de busca para filtrar a lista de alunos na tabela, caso seja necessário.<br><button class="btn btn-primary" onclick="driver.moveNext()">Continuar</button>',
              position: 'top'
            }
        },
        {
            element: '#tabelaAlunos',
            popover: {
              className: 'scoped-class2',
              title: 'Tabela dos Alunos',
              description: 'Nesta lista de alunos, para cada aluno é mostrado sua turma e seu número de matrícula, e além disso existem uma área chamada "Ações" onde você pode fazer alguma operação com o aluno, passe o mouse sobre os ícones para ver sua função. <br> Para que você visualize a ficha completa de um aluno basta clicar em cima do nome dele. <br><br> Clique no nome de algum aluno para ver sua ficha. (Caso não tenha nenhum aluno na lista, no botão abaixo para tutorial de criação de alunos) <a class="btn btn-primary">Ver Tutorial</a>',
              position: 'top'
            }
        },
      ]);
      driver.start();

        document.getElementById('btnAbaAlunos').addEventListener('click', (e) => {
            driver.moveNext()
        })
        document.getElementById('btnCadastrarTurmas').addEventListener('click', (e) => {
            driver.moveNext()
        })    
}

