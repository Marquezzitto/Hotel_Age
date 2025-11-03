/* HOTEL AGE - JAVASCRIPT SEPARADO */

// Aguarda o carregamento completo da página
document.addEventListener('DOMContentLoaded', function() {
    iniciarCarousel();
    iniciarValidacaoFormulario();
    iniciarBotaoVoltarTopo();
    calcularPrecoReserva();
    console.log('✓ Sistema Hotel Age carregado com sucesso!');
});

let slideAtual = 0;
let intervaloTroca;

function iniciarCarousel() {
    const hero = document.getElementById('hero');
    if (!hero) return;

    const carouselHTML = `
    <div class="carousel-container">
        <div class="carousel-slide active">
            <img src="img/Foto7.jpeg" alt="Fachada do Hotel Age">
            <div class="carousel-content">
                <h2>Bem-vindo ao Hotel Age</h2>
                <p>Experimente o melhor da hospitalidade brasileira</p>
            </div>
        </div>
        <div class="carousel-slide">
            <img src="img/Quarto.png" alt="Quarto confortável">
            <div class="carousel-content">
                <h2>Quartos Confortáveis</h2>
                <p>Acomodações pensadas para seu bem-estar</p>
            </div>
        </div>
        <div class="carousel-slide">
            <img src="img/Foto1.jpeg" alt="Lobby elegante">
            <div class="carousel-content">
                <h2>Ambiente Sofisticado</h2>
                <p>Elegância em cada detalhe</p>
            </div>
        </div>
        <div class="carousel-slide">
            <img src="img/Foto9.jpeg" alt="Restaurante">
            <div class="carousel-content">
                <h2>Gastronomia de Excelência</h2>
                <p>Sabores que encantam</p>
            </div>
        </div>
        <button class="carousel-btn prev" onclick="mudarSlide(-1)">&#10094;</button>
        <button class="carousel-btn next" onclick="mudarSlide(1)">&#10095;</button>
        <div class="carousel-indicators">
            <span class="indicator active" onclick="irParaSlide(0)"></span>
            <span class="indicator" onclick="irParaSlide(1)"></span>
            <span class="indicator" onclick="irParaSlide(2)"></span>
            <span class="indicator" onclick="irParaSlide(3)"></span>
        </div>
    </div>`;

    hero.innerHTML = carouselHTML;
    iniciarTrocaAutomatica();
}

function mudarSlide(direcao) {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicadores = document.querySelectorAll('.indicator');
    if (!slides.length) return;

    slides[slideAtual].classList.remove('active');
    indicadores[slideAtual].classList.remove('active');

    slideAtual = slideAtual + direcao;

    if (slideAtual >= slides.length) {
        slideAtual = 0;
    } else if (slideAtual < 0) {
        slideAtual = slides.length - 1;
    }

    slides[slideAtual].classList.add('active');
    indicadores[slideAtual].classList.add('active');
}

function irParaSlide(numero) {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicadores = document.querySelectorAll('.indicator');
    if (!slides.length) return;

    slides[slideAtual].classList.remove('active');
    indicadores[slideAtual].classList.remove('active');

    slideAtual = numero;

    slides[slideAtual].classList.add('active');
    indicadores[slideAtual].classList.add('active');
}

function iniciarTrocaAutomatica() {
    intervaloTroca = setInterval(function() {
        mudarSlide(1);
    }, 5000);
}

function iniciarValidacaoFormulario() {
    const formularios = document.querySelectorAll('form');

    formularios.forEach(function(form) {
        const campos = form.querySelectorAll('input, select, textarea');

        campos.forEach(function(campo) {
            campo.addEventListener('blur', function() {
                validarCampo(this);
            });
        });

        form.addEventListener('submit', function(evento) {
            evento.preventDefault();
            let todosValidos = true;

            campos.forEach(function(campo) {
                if (!validarCampo(campo)) {
                    todosValidos = false;
                }
            });

            if (todosValidos) {
                mostrarMensagem('Formulário enviado com sucesso!', 'sucesso');
            } else {
                mostrarMensagem('Por favor, corrija os erros no formulário.', 'erro');
            }
        });
    });
}

function validarCampo(campo) {
    removerErro(campo);
    campo.classList.remove('error');

    if (campo.hasAttribute('required') && !campo.value.trim()) {
        mostrarErro(campo, 'Este campo é obrigatório');
        return false;
    }

    if (campo.type === 'email' && campo.value) {
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailValido.test(campo.value)) {
            mostrarErro(campo, 'Por favor, insira um email válido');
            return false;
        }
    }

    if (campo.type === 'tel' && campo.value) {
        const telefoneValido = /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/;
        if (!telefoneValido.test(campo.value)) {
            mostrarErro(campo, 'Formato: (11) 99999-9999');
            return false;
        }
    }

    if (campo.type === 'date' && campo.value) {
        const dataSelecionada = new Date(campo.value);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        if (dataSelecionada < hoje) {
            mostrarErro(campo, 'A data deve ser futura');
            return false;
        }
    }

    return true;
}

function mostrarErro(campo, mensagem) {
    campo.classList.add('error');
    const divErro = document.createElement('div');
    divErro.className = 'error-message';
    divErro.textContent = mensagem;
    campo.parentNode.appendChild(divErro);
}

function removerErro(campo) {
    const erroAntigo = campo.parentNode.querySelector('.error-message');
    if (erroAntigo) {
        erroAntigo.remove();
    }
}

function mostrarMensagem(texto, tipo) {
    const mensagemAntiga = document.querySelector('.notificacao');
    if (mensagemAntiga) mensagemAntiga.remove();

    const mensagem = document.createElement('div');
    mensagem.className = 'notificacao ' + (tipo === 'sucesso' ? 'sucesso' : 'erro');
    mensagem.textContent = texto;

    document.body.appendChild(mensagem);

    setTimeout(() => mensagem.remove(), 5000);
}

function iniciarBotaoVoltarTopo() {
    const botao = document.createElement('button');
    botao.id = 'backToTop';
    botao.innerHTML = '↑';
    botao.title = 'Voltar ao topo';

    botao.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.body.appendChild(botao);

    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            botao.classList.add('mostrar');
        } else {
            botao.classList.remove('mostrar');
        }
    });
}

function calcularPrecoReserva() {
    const form = document.querySelector('#formulario-reserva form');
    if (!form) return;

    const tipoQuarto = document.getElementById('tipo-quarto');
    const checkin = document.getElementById('
