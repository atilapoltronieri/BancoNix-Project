# BancoNixProjeto
Projeto Banco Nix.

Projeto feito para poder realizar cadastros, edição e exclusão de transferências pelo usuários.

Para ter acesso ao banco de dados necessário para utilização do projeto, crie o mesmo que se encontra no arquivo ScripBancoNixProject.sql.

Dentro do projeto ProjetoWeb consta toda a parte do site para consumir o WebService. Será necessário entrar em js/app.js 
e trocar a parte de "http://localhost:3318" pelo local onde estará instalado o WebService, seja localmente ou em algum servidor.
Para o usar basta abrir em algum browser compatível com HTML5, como o Google Chrome.

Dentro do projeto WebService consta o  projeto desenvolvido em C# para abastecer o ProjetoWeb. Nesta pasta consta o projeto para poder ser executado dentro do Visual Studio.

Existe a publicação do WebService feita para o publicar no IIS ou projeto de preferência. 