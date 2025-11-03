/* ========================================
   JAVASCRIPT SIMPLIFICADO - HOTEL AGE
   Código básico e fácil de entender
   ======================================== */

// Aguarda o carregamento completo da página
document.addEventListener('DOMContentLoaded', function() {
    // Inicia todas as funcionalidades
    iniciarCarousel();
    iniciarValidacaoFormulario();
    iniciarBotaoVoltarTopo();
    calcularPrecoReserva();
    console.log('✓ Sistema Hotel Age carregado com sucesso!');
});

/* ========================================
   1. CAROUSEL (CARROSSEL DE IMAGENS)
   ======================================== */

// Variável que guarda qual slide está ativo
let slideAtual = 0;

// Função para criar o carousel na página
function iniciarCarousel() {
    // Busca a seção hero no HTML
    const hero = document.getElementById('hero');
    
    // Se não encontrar, para a função
    if (!hero) return;

    // HTML do carousel
    const carouselHTML = `
    <div class="carousel-container">
        <div class="carousel-slide active">
            <img src="img/Designer.jpeg" alt="Fachada do Hotel Age">
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

    // Insere o carousel no HTML
    hero.innerHTML = carouselHTML;

    // Inicia a troca automática de slides
    iniciarTrocaAutomatica();
}

// Função para mudar de slide (quando clica nas setas)
function mudarSlide(direcao) {
    // Busca todos os slides
    const slides = document.querySelectorAll('.carousel-slide');
    const indicadores = document.querySelectorAll('.indicator');
    
    // Se não encontrar slides, para a função
    if (!slides.length) return;

    // Remove a classe 'active' do slide atual
    slides[slideAtual].classList.remove('active');
    indicadores[slideAtual].classList.remove('active');

    // Calcula qual será o próximo slide
    slideAtual = slideAtual + direcao;
    
    // Se passou do último slide, volta para o primeiro
    if (slideAtual >= slides.length) {
        slideAtual = 0;
    }
    // Se voltou antes do primeiro, vai para o último
    else if (slideAtual < 0) {
        slideAtual = slides.length - 1;
    }

    // Adiciona a classe 'active' no novo slide
    slides[slideAtual].classList.add('active');
    indicadores[slideAtual].classList.add('active');
}

// Função para ir direto para um slide específico (quando clica nos indicadores)
function irParaSlide(numero) {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicadores = document.querySelectorAll('.indicator');
    
    if (!slides.length) return;

    // Remove active do slide atual
    slides[slideAtual].classList.remove('active');
    indicadores[slideAtual].classList.remove('active');

    // Define o novo slide
    slideAtual = numero;

    // Adiciona active no novo slide
    slides[slideAtual].classList.add('active');
    indicadores[slideAtual].classList.add('active');
}

// Variável que controla a troca automática
let intervaloTroca;

// Função para iniciar a troca automática de slides
function iniciarTrocaAutomatica() {
    // A cada 5 segundos (5000 milissegundos), muda para o próximo slide
    intervaloTroca = setInterval(function() {
        mudarSlide(1);
    }, 5000);
}

/* ========================================
   2. VALIDAÇÃO DE FORMULÁRIOS
   ======================================== */

function iniciarValidacaoFormulario() {
    // Busca todos os formulários da página
    const formularios = document.querySelectorAll('form');

    // Para cada formulário encontrado
    formularios.forEach(function(form) {
        // Busca todos os campos do formulário
        const campos = form.querySelectorAll('input, select, textarea');

        // Para cada campo, adiciona validação quando perder o foco
        campos.forEach(function(campo) {
            campo.addEventListener('blur', function() {
                validarCampo(this);
            });
        });

        // Quando tentar enviar o formulário
        form.addEventListener('submit', function(evento) {
            // Impede o envio padrão
            evento.preventDefault();
            
            // Variável para verificar se tudo está válido
            let todosValidos = true;

            // Valida todos os campos
            campos.forEach(function(campo) {
                if (!validarCampo(campo)) {
                    todosValidos = false;
                }
            });

            // Se tudo estiver válido
            if (todosValidos) {
                mostrarMensagem('Formulário enviado com sucesso!', 'sucesso');
                // Aqui poderia enviar o formulário de verdade
                // form.submit();
            } else {
                mostrarMensagem('Por favor, corrija os erros no formulário.', 'erro');
            }
        });
    });
}

// Função que valida um campo específico
function validarCampo(campo) {
    // Remove mensagens de erro antigas
    removerErro(campo);
    campo.classList.remove('error');

    // 1. Verifica se o campo obrigatório está vazio
    if (campo.hasAttribute('required') && !campo.value.trim()) {
        mostrarErro(campo, 'Este campo é obrigatório');
        return false;
    }

    // 2. Valida e-mail
    if (campo.type === 'email' && campo.value) {
        // Expressão regular simples para validar e-mail
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailValido.test(campo.value)) {
            mostrarErro(campo, 'Por favor, insira um email válido');
            return false;
        }
    }

    // 3. Valida telefone
    if (campo.type === 'tel' && campo.value) {
        // Expressão regular para validar telefone brasileiro
        const telefoneValido = /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/;
        if (!telefoneValido.test(campo.value)) {
            mostrarErro(campo, 'Formato: (11) 99999-9999');
            return false;
        }
    }

    // 4. Valida data
    if (campo.type === 'date' && campo.value) {
        const dataSelecionada = new Date(campo.value);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        if (dataSelecionada < hoje) {
            mostrarErro(campo, 'A data deve ser futura');
            return false;
        }
    }

    // Se passou em todas as validações
    return true;
}

// Função para mostrar erro em um campo
function mostrarErro(campo, mensagem) {
    // Adiciona classe de erro no campo
    campo.classList.add('error');
    
    // Cria uma div com a mensagem de erro
    const divErro = document.createElement('div');
    divErro.className = 'error-message';
    divErro.textContent = mensagem;
    
    // Insere a mensagem após o campo
    campo.parentNode.appendChild(divErro);
}

// Função para remover mensagem de erro
function removerErro(campo) {
    const erroAntigo = campo.parentNode.querySelector('.error-message');
    if (erroAntigo) {
        erroAntigo.remove();
    }
}

// Função para mostrar mensagem geral (sucesso ou erro)
function mostrarMensagem(texto, tipo) {
    // Remove mensagem antiga se existir
    const mensagemAntiga = document.querySelector('.notificacao');
    if (mensagemAntiga) {
        mensagemAntiga.remove();
    }

    // Cria a nova mensagem
    const mensagem = document.createElement('div');
    mensagem.className = 'notificacao';
    mensagem.textContent = texto;
    mensagem.style.position = 'fixed';
    mensagem.style.top = '20px';
    mensagem.style.right = '20px';
    mensagem.style.padding = '15px 30px';
    mensagem.style.borderRadius = '8px';
    mensagem.style.color = 'white';
    mensagem.style.fontWeight = 'bold';
    mensagem.style.zIndex = '9999';

    // Define a cor baseada no tipo
    if (tipo === 'sucesso') {
        mensagem.style.backgroundColor = '#4caf50';
    } else {
        mensagem.style.backgroundColor = '#d32f2f';
    }

    // Adiciona ao body
    document.body.appendChild(mensagem);

    // Remove após 5 segundos
    setTimeout(function() {
        mensagem.remove();
    }, 5000);
}

/* ========================================
   3. BOTÃO VOLTAR AO TOPO
   ======================================== */

function iniciarBotaoVoltarTopo() {
    // Cria o botão
    const botao = document.createElement('button');
    botao.id = 'backToTop';
    botao.innerHTML = '↑';
    botao.title = 'Voltar ao topo';

    // Quando clicar no botão
    botao.addEventListener('click', function() {
        // Volta ao topo da página suavemente
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Adiciona o botão na página
    document.body.appendChild(botao);

    // Mostra/esconde o botão baseado na rolagem
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            botao.style.display = 'block';
        } else {
            botao.style.display = 'none';
        }
    });
}

/* ========================================
   4. CÁLCULO DE PREÇO DA RESERVA
   ======================================== */

function calcularPrecoReserva() {
    // Busca o formulário de reservas
    const form = document.querySelector('#formulario-reserva form');
    if (!form) return;

    // Busca os campos necessários
    const tipoQuarto = document.getElementById('tipo-quarto');
    const checkin = document.getElementById('checkin');
    const checkout = document.getElementById('checkout');

    // Se não encontrar os campos, para a função
    if (!tipoQuarto || !checkin || !checkout) return;

    // Tabela de preços por tipo de quarto
    // ***** AJUSTE FEITO AQUI *****
    const precos = {
        'simples': 200,
        'duplo': 300,
        'triplo': 400,
        'suite': 600
    };
    // *****************************

    // Função que faz o cálculo
    function calcular() {
        // Pega os valores dos campos
        const quarto = tipoQuarto.value;
        const dataCheckin = new Date(checkin.value);
        const dataCheckout = new Date(checkout.value);

        // Se todos os campos estiverem preenchidos e checkout for depois do checkin
        if (quarto && checkin.value && checkout.value && dataCheckout > dataCheckin) {
            // Calcula quantos dias
            const diferencaMilissegundos = dataCheckout - dataCheckin;
            const dias = Math.ceil(diferencaMilissegundos / (1000 * 60 * 60 * 24));
            
            // Pega o preço do quarto escolhido
            const precoPorNoite = precos[quarto] || 0;
            
            // Calcula o total
            const total = dias * precoPorNoite;

            // Mostra o resumo
            let resumo = document.getElementById('resumo');
            
            // Se não existe a seção de resumo, cria
            if (!resumo) {
                resumo = document.createElement('section');
                resumo.id = 'resumo';
                form.appendChild(resumo);
            }

            // Atualiza o conteúdo do resumo
            resumo.innerHTML = `
                <h3>Resumo da Reserva</h3>
                <p><strong>Tipo de Quarto:</strong> ${quarto.charAt(0).toUpperCase() + quarto.slice(1)}</p>
                <p><strong>Número de diárias:</strong> ${dias}</p>
                <p><strong>Preço por noite:</strong> R$ ${precoPorNoite.toFixed(2)}</p>
                <p style="font-size: 20px; color: #0056b3;"><strong>Total:</strong> R$ ${total.toFixed(2)}</p>
            `;
            resumo.style.backgroundColor = '#f0f8ff';
            resumo.style.padding = '20px';
            resumo.style.borderRadius = '8px';
            resumo.style.marginTop = '20px';
        }
    }

    // Adiciona o cálculo quando os campos mudarem
    tipoQuarto.addEventListener('change', calcular);
    checkin.addEventListener('change', calcular);
    checkout.addEventListener('change', calcular);
}

/* ========================================
   5. FORMATAÇÃO AUTOMÁTICA DE TELEFONE
   ======================================== */

// Busca todos os campos de telefone
const camposTelefone = document.querySelectorAll('input[type="tel"]');

// Para cada campo de telefone
camposTelefone.forEach(function(campo) {
    // Quando digitar algo
    campo.addEventListener('input', function(e) {
        // Remove tudo que não é número
        let valor = e.target.value.replace(/\D/g, '');
        
        // Formata o telefone enquanto digita
        if (valor.length > 0) {
            if (valor.length <= 2) {
                valor = '(' + valor;
            } else if (valor.length <= 6) {
                valor = '(' + valor.slice(0, 2) + ') ' + valor.slice(2);
            } else if (valor.length <= 10) {
                valor = '(' + valor.slice(0, 2) + ') ' + valor.slice(2, 6) + '-' + valor.slice(6);
            } else {
                valor = '(' + valor.slice(0, 2) + ') ' + valor.slice(2, 7) + '-' + valor.slice(7, 11);
            }
        }
        
        // Atualiza o valor do campo
        e.target.value = valor;
    });
});

/* ========================================
   FIM DO SCRIPT
   ======================================== */

console.log('✓ Todas as funções foram carregadas:');
console.log('  - Carousel');
console.log('  - Validação de Formulários');
console.log('  - Botão Voltar ao Topo');
console.log('  - Cálculo de Preço');
console.log('  - Formatação de Telefone');

