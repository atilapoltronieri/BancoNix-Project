var app = angular.module('myApp', ['ui.mask','ngAnimate', 'toaster', 'angularSpinner', 'bsTable']);

app.service('spinnerService', function () {
	this.show = function () {
		document.getElementById('mySpinner').className = "spinner-design"
	},

	this.hide = function () {
		document.getElementById('mySpinner').className = "spinner-design ng-hide"
	}
})

app.directive("showEditarTransferencia", ["$interval", function($interval) {
    return {
        restrict: "A",
        link: function(scope, elem, attrs) {
            //On click
            $(elem).click(function() {
                $('.modal').modal(); 
            });
        }
    }
}])

app.directive('datepicker', function() {
  return {
    restrict: 'A',
    require : 'ngModel',
    link: function(scope, element, attrs, ngModelCtrl) {
      $(element).datepicker({
        dateFormat:'dd-mm-yyyy',
        language: 'pt-BR',
        pickTime: false,
        startDate: '01-11-2013',      
        endDate: '01-11-2030'          
      }).on('changeDate', function(e) {
        ngModelCtrl.$setViewValue(e.date.toLocaleDateString());
        scope.$apply();
      });
    }
  };
})

app.controller('loginCtrl', ['$scope', '$http', '$window', '$location', 'toaster', 'spinnerService', function($scope, $http, $window, $location, toaster, spinnerService) {
    
	if (localStorage.getItem("usuario") != undefined && localStorage.getItem("cnpj") != undefined && localStorage.getItem("usuario_id") != undefined) 
		location.href = '/home.html';
	
    $scope.criarUsuario = function() {
        var source = this;

		if (!source.NovoUsuario) {
			Materialize.toast("Necessita ter um Usuário", 4000, 'red');
			return false;
		}
		// if (!source.NovoSenha){
			// toaster.pop('error', "Novo Usuário", "Necessita ter uma Senha");
			// return false;
		// }
		// if (source.NovoSenha != source.NovoConfirmarSenha){
			// toaster.pop('error', "Novo Usuário", "As Senhas não são Iguais");
			// return false;
		// }
	
		if (!source.validaCnpj(source.NovoCNPJ)) {
			Materialize.toast("CNPJ Inválido", 4000, 'red');
			return false;
		}

		spinnerService.show();

		$http.post("http://localhost:3318/api/Login/AdicionarUsuario?nome=" + source.NovoUsuario + "&cnpj=" + source.NovoCNPJ)
		.success (function(response){
			 Materialize.toast("Novo Usuário Cadastrado com Sucesso", 4000, 'green');
		 })
		.error(function(response){
			Materialize.toast(response, 4000, 'red');
		 })
		.finally (function () {
			spinnerService.hide();
		});
    };

    $scope.login = function() {
        var source = this;

		if (!source.Usuario) {
			Materialize.toast("Digite seu Usuário", 4000, 'red');
			return false;
		}
		if (!source.validaCnpj(source.CNPJ)) {
			Materialize.toast("CNPJ Inválido", 4000, 'red');
			return false;
		}

		spinnerService.show();

		$http.post("http://localhost:3318/api/Login/Login?nome=" + source.Usuario + "&cnpj=" + source.CNPJ)
		.success (function(response){
			 Materialize.toast("Login efetuado com Sucesso", 4000, 'green');
			 localStorage.setItem("usuario", source.Usuario);
			 localStorage.setItem("cnpj", source.CNPJ);
			 localStorage.setItem("usuario_id", response);
			 location.href = '/home.html';
		 })
		.error(function(response){
			Materialize.toast(response, 4000, 'red');
		 })
		.finally (function () {
			spinnerService.hide();
		});
    };

	$scope.validaCnpj = function validaCnpj(str){
		str = str.replace('.','');
		str = str.replace('.','');
		str = str.replace('.','');
		str = str.replace('-','');
		str = str.replace('/','');
		cnpj = str;
		var numeros, digitos, soma, i, resultado, pos, tamanho, digitos_iguais;
		digitos_iguais = 1;
		if (cnpj.length < 14 && cnpj.length < 15)
			return false;
		for (i = 0; i < cnpj.length - 1; i++)
			if (cnpj.charAt(i) != cnpj.charAt(i + 1))
		{
			digitos_iguais = 0;
			break;
		}
		if (!digitos_iguais)
		{
			tamanho = cnpj.length - 2
			numeros = cnpj.substring(0,tamanho);
			digitos = cnpj.substring(tamanho);
			soma = 0;
			pos = tamanho - 7;
			for (i = tamanho; i >= 1; i--)
			{
				soma += numeros.charAt(tamanho - i) * pos--;
				if (pos < 2)
					pos = 9;
			}
			resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
			if (resultado != digitos.charAt(0))
				return false;
			tamanho = tamanho + 1;
			numeros = cnpj.substring(0,tamanho);
			soma = 0;
			pos = tamanho - 7;
			for (i = tamanho; i >= 1; i--)
			{
				soma += numeros.charAt(tamanho - i) * pos--;
				if (pos < 2)
					pos = 9;
			}
			resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
			if (resultado != digitos.charAt(1))
				return false;
			return true;
		}
		else
			return false;
	};

	$scope.showLoginForm = function () {
		return "login-page " + (this.showLogin == false ? "ng-hide" : "");
	}
	
	$scope.showHomeForm = function () {
		return "login-page " + (this.showLogin == false ? "" : "ng-hide");
	}
	
}])

app.controller('transferenciaCtrl', ['$scope', '$http', '$window', '$location', 'toaster', 'spinnerService', function($scope, $http, $window, $location, toaster, spinnerService) {
	
	this.listaTransferencias = [];
	
	$scope.logout = function ()
	{
		localStorage.removeItem("usuario");
		localStorage.removeItem("cnpj");
		localStorage.removeItem("usuario_id");
		location.href = '/';		
	}	
	
	$scope.valorTotalTransferencias = function () {
		var source = this;
		
		if (source.listaTransferencias == undefined || source.listaTransferencias == []) 
			return "0,00";
		else
			return Enumerable.from(source.listaTransferencias).sum(function (x) {return x.valor});
	}
	
	$scope.carregarTransferencias = function () {
			
		var source = this;	
		source.listaTransferencias = [];
		source.listaTransferenciasFiltro = [];
		source.listaTransferenciasShow = [];
		source.filtro = {};
		source.objetoTela = {};
		source.usuarioLogado = {};
		source.usuarioLogado.usuarioNome = localStorage.getItem("usuario");
		source.paginacao = {};
		source.paginacao.paginaAtual = 1;
		
		spinnerService.show();
		
		$http.get("http://localhost:3318/api/Transferencia/CarregarTransferencia?usuarioId=" + localStorage.getItem("usuario_id"))
		.success (function(response){
			 Materialize.toast('Transferências Carregadas', 4000, 'green');
			 //toaster.pop('success', "Transferencia", "Transferências Carregadas");
			 source.listaTransferencias = JSON.parse(response);
			 source.aplicarFiltro();
		 })
		.error(function(response){			
			 Materialize.toast(response, 4000, 'red');
			 //toaster.pop('error', "Login", response);
		 })
		.finally (function () {
			spinnerService.hide();
		});
	}
	
	$scope.aplicarFiltro = function() {
		var source = this;		
		source.paginacao.paginaAtual = 1;
		source.listaTransferenciasFiltro = source.listaTransferencias;
		
		if (source.filtro.pagadorNome != undefined && source.filtro.pagadorNome != "")
			source.listaTransferenciasFiltro = Enumerable.from(source.listaTransferenciasFiltro).where(function (x) {return x.pagadorNome.indexOf(source.filtro.pagadorNome) >= 0}).toArray();
		if (source.filtro.beneficiarioNome != undefined && source.filtro.beneficiarioNome != "")
			source.listaTransferenciasFiltro = Enumerable.from(source.listaTransferenciasFiltro).where(function (x) {return x.beneficiarioNome.indexOf(source.filtro.beneficiarioNome) >= 0}).toArray();
		if (source.filtro.data != undefined && source.filtro.data != "")
			source.listaTransferenciasFiltro = Enumerable.from(source.listaTransferenciasFiltro).where(function (x) {return new Date(x.data).toLocaleDateString('pt-BR').replace(new RegExp("/", 'g'), "") == source.filtro.data }).toArray();
		
		source.aplicarFiltroPaginacao();
	}
	
	$scope.aplicarFiltroPaginacao = function () {
		var source = this;
		
		source.listaTransferenciasShow = source.listaTransferenciasFiltro;
		spinnerService.show();
		
		source.paginacao.registroInicial = ((source.paginacao.paginaAtual - 1) * 10) + 1;
		if (source.paginacao.paginaAtual * 10 < source.listaTransferenciasShow.length)
			source.paginacao.registroFinal = (source.paginacao.paginaAtual * 10);
		else
			source.paginacao.registroFinal = source.listaTransferenciasShow.length;
		
		source.paginacao.registrosTotais = source.listaTransferenciasShow.length;
		
		source.listaTransferenciasShow = source.listaTransferenciasShow.slice(source.paginacao.registroInicial - 1, source.paginacao.registroFinal)
		
		spinnerService.hide();
	}
	
	$scope.validaProximaPagina = function () {
		
		var source = this;
		
		if (source.paginacao.paginaAtual * 10 < source.listaTransferenciasFiltro.length)
			return false;
		
		return true;
	}
	
	$scope.validaAnteriorPagina = function () {
		
		var source = this;
		
		if (source.paginacao.paginaAtual > 1)
			return false;
		
		return true;
	}
	
	$scope.proximaPagina = function () {
		
		var source = this;
		spinnerService.show();
		source.listaTransferenciasShow = [];
		source.paginacao.paginaAtual = source.paginacao.paginaAtual + 1;
		source.aplicarFiltroPaginacao();
		
		spinnerService.hide();
	}
	
	$scope.anteriorPagina = function () {
		
		var source = this;
		spinnerService.show();
		source.listaTransferenciasShow = [];
		source.paginacao.paginaAtual = source.paginacao.paginaAtual - 1;
		source.aplicarFiltroPaginacao();
		
		spinnerService.hide();
	}
	
	$scope.validaSalvar = function () {
		
		var source = this;
		
		if (source.objetoTela.pagadorNome != undefined &&
			source.objetoTela.pagadorBanco != undefined &&
			source.objetoTela.pagadorAgencia != undefined &&
			source.objetoTela.pagadorConta != undefined &&
			source.objetoTela.beneficiarioNome != undefined &&
			source.objetoTela.beneficiarioBanco != undefined &&
			source.objetoTela.beneficiarioAgencia != undefined &&
			source.objetoTela.beneficiarioConta != undefined &&
			source.objetoTela.valor != undefined &&
			source.objetoTela.tipo != undefined &&
			source.objetoTela.status != undefined
		)		
		return false;
		
		return true;
	}
	
	$scope.validaValor = function () {
		var source = this;
		
		if (source.objetoTela.valor <= 100000)
			source.objetoTela.status = "OK";
		else
			source.objetoTela.status = "Error";

		source.validaTipo();
	}
	
	$scope.validaTipo = function () {
		var source = this;
		
		if (source.objetoTela.pagadorBanco != undefined && source.objetoTela.pagadorBanco == source.objetoTela.beneficiarioBanco)
			source.objetoTela.tipo = "CC";
		else if (source.objetoTela.valor < 5000 && source.validaHora())
			source.objetoTela.tipo = "TED";
		else
			source.objetoTela.tipo = "DOC";
	}
	
	$scope.validaHora = function () {
		var startTime = '10:00:00';
		var endTime = '16:00:00';

		currentDate = new Date()   

		startDate = new Date(currentDate.getTime());
		startDate.setHours(startTime.split(":")[0]);
		startDate.setMinutes(startTime.split(":")[1]);
		startDate.setSeconds(startTime.split(":")[2]);

		endDate = new Date(currentDate.getTime());
		endDate.setHours(endTime.split(":")[0]);
		endDate.setMinutes(endTime.split(":")[1]);
		endDate.setSeconds(endTime.split(":")[2]);


		return startDate < currentDate && endDate > currentDate
	}
	
	$scope.novaTransferencia = function () {
		
		var source = this;	
		source.objetoTela = {};
	}
	
	$scope.salvarTransferencia = function () {
		
		var source = this;	
		
		if (source.objetoTela.idDeletar != undefined && source.objetoTela.idDeletar == source.objetoTela.id) {			
			source.objetoTela.status = "DELETADO";
		}
		
		var transferencia = {};
		
		transferencia.id = source.objetoTela.id;
		transferencia.usuario_id = localStorage.getItem("usuario_id");
		transferencia.pagadorNome = source.objetoTela.pagadorNome;
		transferencia.pagadorBanco = source.objetoTela.pagadorBanco;
		transferencia.pagadorAgencia = source.objetoTela.pagadorAgencia;
		transferencia.pagadorConta = source.objetoTela.pagadorConta;
		transferencia.beneficiarioNome = source.objetoTela.beneficiarioNome;
		transferencia.beneficiarioBanco = source.objetoTela.beneficiarioBanco;
		transferencia.beneficiarioAgencia = source.objetoTela.beneficiarioAgencia;
		transferencia.beneficiarioConta = source.objetoTela.beneficiarioConta;
		transferencia.valor = source.objetoTela.valor;
		transferencia.tipo = source.objetoTela.tipo;
		transferencia.status = source.objetoTela.status;
		transferencia.data = source.objetoTela.data;		
		var transferenciaJson = JSON.stringify(transferencia);
		
		spinnerService.show();

		$http.post("http://localhost:3318/api/Transferencia/SalvarTransferencia?transferenciaJson=" + transferenciaJson)
		.success (function(response){
			
			if (transferencia.id != undefined && transferencia.id != 0)
				source.listaTransferencias = Enumerable.from(source.listaTransferencias).where(function (x) { return x.id != transferencia.id}).toArray();
						
			if (source.objetoTela.status != "DELETADO") {
				source.listaTransferencias.push(JSON.parse(response));
				source.listaTransferencias = Enumerable.from(source.listaTransferencias).orderBy(function (x) { return x.id }).toArray();
				Materialize.toast("Registro Salvo com Sucesso.", 4000, 'green');
			}
			else
				Materialize.toast("Registro Deletado com Sucesso.", 4000, 'green');
			
			source.aplicarFiltro();
		 })
		.error(function(response){
			 Materialize.toast(response, 4000, 'red');
			 //toaster.pop('error', "Login", response);
		 })
		.finally (function () {
			spinnerService.hide();
		});
	}
	
	$scope.deletarTransferencia = function (idDeletar) {
		
		var source = this;
		
		source.objetoTela.idDeletar = idDeletar;
	}
	
	$scope.editarTransferencia = function(transferencia) {
		var source = this;
		
		source.objetoTela.idTransferencia = "ID: " + transferencia.id;
		source.objetoTela.id = transferencia.id;
		source.objetoTela.pagadorNome = transferencia.pagadorNome;
		source.objetoTela.pagadorBanco = transferencia.pagadorBanco;
		source.objetoTela.pagadorAgencia = transferencia.pagadorAgencia;
		source.objetoTela.pagadorConta = transferencia.pagadorConta;
		source.objetoTela.beneficiarioNome = transferencia.beneficiarioNome;
		source.objetoTela.beneficiarioBanco = transferencia.beneficiarioBanco;
		source.objetoTela.beneficiarioAgencia = transferencia.beneficiarioAgencia;
		source.objetoTela.beneficiarioConta = transferencia.beneficiarioConta;
		source.objetoTela.valor = transferencia.valor;
		source.objetoTela.tipo = transferencia.tipo;
		source.objetoTela.status = transferencia.status;
		source.objetoTela.data = transferencia.data;
	}
	
	if (localStorage.getItem("usuario") != undefined && localStorage.getItem("cnpj") != undefined && localStorage.getItem("usuario_id") != undefined)
		$scope.carregarTransferencias();
	else {
		$scope.logout();
	}
	
}])
