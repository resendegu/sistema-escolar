# Atenção: versão descontinuada
Uma nova versão deste sistema utilizando ReactJS + MaterialUI está sendo desenvolvida [aqui](https://github.com/GrupoProX/sistema-escolar-react). Você pode utilizar este código da maneira que achar melhor, mas saiba que nossos esforços estarão voltados para o novo projeto.

# Sistema de gestão escolar

Um sistema de gestão escolar, indicado para **escolas de idiomas e cursos livres**, feito com HTML5 e CSS3, JavaScript, Bootstrap 4. O [Firebase](https://firebase.google.com) é utilizado como hospedagem, backend e demais funcionalidades. *O firebase possui cotas gratuitas generosas, confira-as no site do Firebase*.
 
 Você pode acessar uma prévia desse sistema no endereço [escola.grupoprox.com](https://escola.grupoprox.com/)
 
 ### Proposta do projeto 
 Ser simples, responsivo (dentro do possível), e atender à necessidades básicas de cursos livres, por exemplo, apresentando seções para professores, secretaria, e administrativo, guardando todos os dados escolares (como históricos, notas...) na nuvem, também gerenciando esses dados automaticamente na plataforma, permitindo um acesso mais facilitado, e também remoto das informações necessárias.

 ## Funcionalidades do sistema
 De forma simples e com vídeos curtos, apresento as funções de cada área do site/sistema.
### Área de Login/Cadastro (Autenticação)
O login é baseado no formato email/senha. Todo usuário que se cadastra no site não tem permissões para realizar nada com banco de dados, funções... Ou seja, não têm acesso à nada. Exceto os usuários "master" ou "administradores do sistema". Por uma questão de segurança, é necessário definir pelo menos um email de um usuário master manualmente no Realtime Database do Firebase. (Veja o vídeo abaixo mostrando como definir um usuário master manualmente).

##### Vídeo - Como definir usuários master no Realtime Database. (1min30seg)
[![Definir usuários masters no Firebase - Vídeo](http://img.youtube.com/vi/eRPceWNkV3s/0.jpg)](http://www.youtube.com/watch?v=eRPceWNkV3s "Definir usuários masters no Firebase")

##### Vídeo - Como se cadastrar e logar no site. (1min40seg)
[![Como se cadastrar e logar no site](http://img.youtube.com/vi/QGrImToH5-s/0.jpg)](http://www.youtube.com/watch?v=QGrImToH5-s "Como se cadastrar e logar no site")
Quando qualquer usuário que não seja um usuário master, se cadastra no sistema, esse usuário não terá nenhum tipo de acesso ao sistema.


##### Vídeo - Como usar o painel de administrador na pagina de login (1min46seg)
[![Como usar o painel de administrador na pagina de login](http://img.youtube.com/vi/T0z-knrXUrI/0.jpg)](http://www.youtube.com/watch?v=T0z-knrXUrI "Como usar o painel de administrador na pagina de login")
No painel do administrador você também pode definir usuários masters sem precisar de cadastrá-lo manualmente no Firebase.


Projeto em construção :-) 
