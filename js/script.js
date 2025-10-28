/* =================================== HOTEL AGE - JAVASCRIPT PRINCIPAL =================================== */

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar Carousel
    initCarousel();
    // Inicializar Validações de Formulário
    initFormValidation();
    // Inicializar Smooth Scroll
    initSmoothScroll();
    // Inicializar Animações ao Scroll
    initScrollAnimations();
    // Inicializar Menu Mobile
    initMobileMenu();
    // Inicializar Galeria (Lightbox)
    initGallery();
    // Inicializar cálculo de preço
    calculateReservationPrice();
    // Criar botão voltar ao topo
    createBackToTopButton();
    // Inicializar contador de caracteres
    initCharacterCounter();
    // Inicializar confirmação antes de limpar formulário
    initResetConfirmation();
});

/* =================================== CAROUSEL / BANNER PRINCIPAL =================================== */

function initCarousel() {
    const heroSection = document.getElementById('hero');
    if (!heroSection) return;

    // Criar estrutura do carousel
    // AQUI ESTÁ A CORREÇÃO: A crase (`) no início e no fim do bloco HTML
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
        <button class="carousel-btn prev" onclick="changeSlide(-1)">&#10094;</button>
        <button class="carousel-btn next" onclick="changeSlide(1)">&#10095;</button>
        <div class="carousel-indicators">
            <span class="indicator active" onclick="goToSlide(0)"></span>
            <span class="indicator" onclick="goToSlide(1)"></span>
            <span class="indicator" onclick="goToSlide(2)"></span>
            <span class="indicator" onclick="goToSlide(3)"></span>
        </div>
    </div>`;
    // FIM DA CORREÇÃO

    // Substituir conteúdo existente
    heroSection.innerHTML = carouselHTML;

    // Iniciar autoplay
    startAutoplay();
}

let currentSlide = 0;
let autoplayInterval;

function changeSlide(direction) {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    if (!slides.length) return;

    slides[currentSlide].classList.remove('active');
    indicators[currentSlide].classList.remove('active');

    currentSlide += direction;
    if (currentSlide >= slides.length) {
        currentSlide = 0;
    } else if (currentSlide < 0) {
        currentSlide = slides.length - 1;
    }

    slides[currentSlide].classList.add('active');
    indicators[currentSlide].classList.add('active');

    stopAutoplay();
    startAutoplay();
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    if (!slides.length) return;

    slides[currentSlide].classList.remove('active');
    indicators[currentSlide].classList.remove('active');

    currentSlide = index;

    slides[currentSlide].classList.add('active');
    indicators[currentSlide].classList.add('active');

    stopAutoplay();
    startAutoplay();
}

function startAutoplay() {
    autoplayInterval = setInterval(() => {
        changeSlide(1);
    }, 5000);
}

function stopAutoplay() {
    if (autoplayInterval) {
        clearInterval(autoplayInterval);
    }
}

/* =================================== VALIDAÇÃO DE FORMULÁRIOS =================================== */

function initFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    validateField(this);
                }
            });
        });

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            let isValid = true;
            inputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                }
            });
            if (isValid) {
                showSuccessMessage('Formulário enviado com sucesso!');
                // Aqui o envio do formulário pode ser ativado
                // form.submit();
            } else {
                showErrorMessage('Por favor, corrija os erros no formulário.');
            }
        });
    });
}

function validateField(field) {
    removeErrorMessage(field);
    field.classList.remove('error');

    if (field.hasAttribute('required') && !field.value.trim()) {
        showFieldError(field, 'Este campo é obrigatório');
        return false;
    }

    if (field.type === 'email' && field.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
            showFieldError(field, 'Por favor, insira um email válido');
            return false;
        }
    }

    if (field.type === 'tel' && field.value) {
        const phoneRegex = /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/;
        if (!phoneRegex.test(field.value)) {
            showFieldError(field, 'Formato: (11) 99999-9999');
            return false;
        }
    }

    if (field.type === 'date' && field.value) {
        const selectedDate = new Date(field.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            showFieldError(field, 'Data deve ser futura');
            return false;
        }
    }

    return true;
}

function showFieldError(field, message) {
    field.classList.add('error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#d32f2f';
    errorDiv.style.fontSize = '0.9rem';
    errorDiv.style.marginTop = '0.25rem';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

function removeErrorMessage(field) {
    const errorMsg = field.parentNode.querySelector('.error-message');
    if (errorMsg) {
        errorMsg.remove();
    }
}

function showSuccessMessage(message) {
    showMessage(message, 'success');
}

function showErrorMessage(message) {
    showMessage(message, 'error');
}

function showMessage(message, type) {
    const existingMsg = document.querySelector('.notification-message');
    if (existingMsg) {
        existingMsg.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'notification-message';
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.padding = '1rem 2rem';
    messageDiv.style.borderRadius = '8px';
    messageDiv.style.color = '#fff';
    messageDiv.style.fontWeight = 'bold';
    messageDiv.style.zIndex = '9999';
    messageDiv.style.animation = 'slideInFromRight 0.5s ease-out';
    messageDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';

    if (type === 'success') {
        messageDiv.style.backgroundColor = '#4caf50';
    } else {
        messageDiv.style.backgroundColor = '#d32f2f';
    }

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.style.animation = 'slideOutToRight 0.5s ease-out';
        setTimeout(() => {
            messageDiv.remove();
        }, 500);
    }, 5000);
}

document.addEventListener('DOMContentLoaded', function() {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value.length <= 2) {
                    value = '(' + value;
                } else if (value.length <= 6) {
                    value = '(' + value.slice(0, 2) + ') ' + value.slice(2);
                } else if (value.length <= 10) {
                    value = '(' + value.slice(0, 2) + ') ' + value.slice(2, 6) + '-' + value.slice(6);
                } else {
                    value = '(' + value.slice(0, 2) + ') ' + value.slice(2, 7) + '-' + value.slice(7, 11);
                }
            }
            e.target.value = value;
        });
    });
});


function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const offsetTop = target.offsetTop - 100;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            }
        });
    });
}

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('article, section');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
}

/* =================================== MENU MOBILE =================================== */

function initMobileMenu() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    const menuButton = document.createElement('button');
    menuButton.className = 'mobile-menu-btn';
    menuButton.innerHTML = '☰';
    menuButton.setAttribute('aria-label', 'Menu');
    menuButton.style.display = 'none';
    menuButton.style.position = 'absolute';
    menuButton.style.right = '2rem';
    menuButton.style.top = '1rem';
    menuButton.style.background = 'none';
    menuButton.style.border = 'none';
    menuButton.style.color = '#fff';
    menuButton.style.fontSize = '2rem';
    menuButton.style.cursor = 'pointer';
    menuButton.style.zIndex = '1001';

    nav.parentElement.style.position = 'relative';
    nav.parentElement.appendChild(menuButton);

    menuButton.addEventListener('click', function() {
        const navUl = nav.querySelector('ul');
        if (navUl.style.display === 'flex') {
            navUl.style.display = 'none';
            menuButton.innerHTML = '☰';
        } else {
            navUl.style.display = 'flex';
            navUl.style.flexDirection = 'column';
            menuButton.innerHTML = '✕';
        }
    });

    function checkMobile() {
        if (window.innerWidth <= 768) {
            menuButton.style.display = 'block';
            const navUl = nav.querySelector('ul');
            navUl.style.display = 'none';
        } else {
            menuButton.style.display = 'none';
            const navUl = nav.querySelector('ul');
            navUl.style.display = 'flex';
        }
    }

    window.addEventListener('resize', checkMobile);
    checkMobile();
}

/* =================================== GALERIA / LIGHTBOX =================================== */

function initGallery() {
    const galleryImages = document.querySelectorAll('#galeria-quartos img, #galeria-areas-comuns img, #galeria-restaurante img');
    galleryImages.forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', function() {
            openLightbox(this.src, this.alt);
        });
    });
}

function openLightbox(src, alt) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.style.position = 'fixed';
    lightbox.style.top = '0';
    lightbox.style.left = '0';
    lightbox.style.width = '100%';
    lightbox.style.height = '100%';
    lightbox.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    lightbox.style.zIndex = '9999';
    lightbox.style.display = 'flex';
    lightbox.style.justifyContent = 'center';
    lightbox.style.alignItems = 'center';
    lightbox.style.animation = 'fadeIn 0.3s ease-out';

    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.style.maxWidth = '90%';
    img.style.maxHeight = '90%';
    img.style.objectFit = 'contain';
    img.style.borderRadius = '8px';

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '2rem';
    closeBtn.style.right = '2rem';
    closeBtn.style.background = '#fff';
    closeBtn.style.border = 'none';
    closeBtn.style.fontSize = '2rem';
    closeBtn.style.width = '50px';
    closeBtn.style.height = '50px';
    closeBtn.style.borderRadius = '50%';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';

    closeBtn.addEventListener('click', () => {
        lightbox.remove();
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.remove();
        }
    });

    lightbox.appendChild(img);
    lightbox.appendChild(closeBtn);
    document.body.appendChild(lightbox);
}

/* =================================== RESERVA - CÁLCULO DE PREÇO =================================== */

function calculateReservationPrice() {
    const form = document.querySelector('#formulario-reserva form');
    if (!form) return;
    const roomSelect = document.getElementById('tipo-quarto');
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    if (!roomSelect || !checkinInput || !checkoutInput) return;

    const calculatePrice = () => {
        const roomPrices = {
            'standard': 250,
            'superior': 350,
            'luxo': 550,
            'suite': 800,
            'presidencial': 1500
        };

        const roomType = roomSelect.value;
        const checkin = new Date(checkinInput.value);
        const checkout = new Date(checkoutInput.value);

        if (roomType && checkinInput.value && checkoutInput.value && checkout > checkin) {
            const days = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));
            const pricePerNight = roomPrices[roomType] || 0;
            const total = days * pricePerNight;

            // Mostrar resumo
            let resumoSection = document.getElementById('resumo');
            if (!resumoSection) {
                resumoSection = document.createElement('section');
                resumoSection.id = 'resumo';
                form.appendChild(resumoSection);
            }
            resumoSection.innerHTML = `
                <h3>Resumo da Reserva</h3>
                <p><strong>Tipo de Quarto:</strong> ${roomType.charAt(0).toUpperCase() + roomType.slice(1)}</p>
                <p><strong>Número de diárias:</strong> ${days}</p>
                <p><strong>Preço por noite:</strong> R$ ${pricePerNight.toFixed(2)}</p>
                <p style="font-size: 1.3rem; color: #0056b3;"><strong>Total:</strong> R$ ${total.toFixed(2)}</p>
            `;
            resumoSection.style.backgroundColor = '#f0f8ff';
            resumoSection.style.padding = '1.5rem';
            resumoSection.style.borderRadius = '8px';
            resumoSection.style.marginTop = '1.5rem';
        }
    };

    roomSelect.addEventListener('change', calculatePrice);
    checkinInput.addEventListener('change', calculatePrice);
    checkoutInput.addEventListener('change', calculatePrice);
}

/* =================================== BOTÃO VOLTAR AO TOPO =================================== */

function createBackToTopButton() {
    const button = document.createElement('button');
    button.id = 'backToTop';
    button.innerHTML = '↑';
    button.setAttribute('aria-label', 'Voltar ao topo');

    button.style.position = 'fixed';
    button.style.bottom = '2rem';
    button.style.right = '2rem';
    button.style.width = '50px';
    button.style.height = '50px';
    button.style.borderRadius = '50%';
    button.style.backgroundColor = '#0056b3';
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.fontSize = '1.5rem';
    button.style.cursor = 'pointer';
    button.style.display = 'none';
    button.style.zIndex = '1000';
    button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    button.style.transition = 'all 0.3s ease';

    button.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#003d82';
        this.style.transform = 'scale(1.1)';
    });

    button.addEventListener('mouseleave', function() {
        this.style.backgroundColor = '#0056b3';
        this.style.transform = 'scale(1)';
    });

    button.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.body.appendChild(button);

    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            button.style.display = 'block';
        } else {
            button.style.display = 'none';
        }
    });
}

/* =================================== CONTADOR DE CARACTERES (TEXTAREA) =================================== */

function initCharacterCounter() {
    const textareas = document.querySelectorAll('textarea[maxlength]');
    textareas.forEach(textarea => {
        const maxLength = textarea.getAttribute('maxlength');
        const counter = document.createElement('div');
        counter.className = 'char-counter';
        counter.style.textAlign = 'right';
        counter.style.fontSize = '0.9rem';
        counter.style.color = '#666';
        counter.style.marginTop = '0.25rem';
        textarea.parentNode.appendChild(counter);

        const updateCounter = () => {
            const currentLength = textarea.value.length;
            counter.textContent = `${currentLength}/${maxLength} caracteres`;
            if (currentLength >= maxLength * 0.9) {
                counter.style.color = '#d32f2f';
            } else {
                counter.style.color = '#666';
            }
        };
        textarea.addEventListener('input', updateCounter);
        updateCounter();
    });
}

/* =================================== CONFIRMAÇÃO ANTES DE LIMPAR FORMULÁRIO =================================== */

function initResetConfirmation() {
    const resetButtons = document.querySelectorAll('button[type="reset"]');
    resetButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const confirmation = confirm('Tem certeza que deseja limpar todos os campos do formulário?');
            if (!confirmation) {
                e.preventDefault();
            }
        });
    });
}

/* =================================== ANIMAÇÕES CSS ADICIONAIS =================================== */

const style = document.createElement('style');
style.textContent = `
@keyframes slideOutToRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}
input.error, select.error, textarea.error {
    border-color: #d32f2f !important;
    background-color: #ffebee;
}
.mobile-menu-btn:hover {
    opacity: 0.7;
}
`;
document.head.appendChild(style);

/* =================================== LOG DE INICIALIZAÇÃO =================================== */

console.log('%c Hotel Age - Sistema Inicializado ', 'background: #0056b3; color: #fff; font-size: 14px; padding: 5px 10px; border-radius: 5px;');
console.log('✓ Carousel ativado');
console.log('✓ Validação de formulários ativada');
console.log('✓ Smooth scroll ativado');
console.log('✓ Animações ativadas');
console.log('✓ Menu mobile configurado');
