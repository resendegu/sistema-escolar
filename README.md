# Sistema de gestão escolar

Um sistema de gestão escolar, indicado para **escolas de idiomas e cursos livres**, feito com HTML5 e CSS3, JavaScript, Bootstrap 4. O [Firebase](https://firebase.google.com) é utilizado como hospedagem, backend e demais funcionalidades. *O firebase possui cotas gratuitas generosas, confira-as no site do Firebase*.
 
 Você pode acessar uma prévia desse sistema no endereço [sistemaescolar.gustavoresende.net](https://sistemaescolar.gustavoresende.net)
 
 ### Proposta do projeto 
 Ser simples, responsivo (dentro do possível), e atender à necessidades básicas de cursos livres, por exemplo, apresentando seções para professores, secretaria, e administrativo, guardando todos os dados escolares (como históricos, notas...) na nuvem, também gerenciando esses dados automaticamente na plataforma, permitindo um acesso mais facilitado, e também remoto das informações necessárias.

 ## Funcionalidades do sistema
 De forma simples e com vídeos curtos, apresento as funções de cada área do site/sistema.
### Área de Login/Cadastro (Autenticação)
O login é baseado no formato email/senha. Todo usuário que se cadastra no site não tem permissões para realizar nada com banco de dados, funções... Ou seja, não têm acesso à nada. Exceto os usuários "master" ou "administradores do sistema". Por uma questão de segurança, é necessário definir um email de um usuário master manualmente no Realtime Database .do Firebase. (Veja o vídeo abaixo mostrando como definir um usuário master manualmente)