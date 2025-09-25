// =================================================================
// 1. IMPORTAÇÕES E CONFIGURAÇÃO INICIAL DO FIREBASE
// (Tudo o que precisamos do Firebase fica aqui no topo)
// =================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    sendEmailVerification, 
    signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// A sua configuração do Firebase (cole a sua aqui)
const firebaseConfig = {
    apiKey: "AIzaSyBfnfohsW-9BkxdHmZMgdN9IT_-l3wAnvs",
    authDomain: "hotel-age.firebaseapp.com",
    projectId: "hotel-age",
    storageBucket: "hotel-age.firebasestorage.app",
    messagingSenderId: "914153302571",
    appId: "1:914153302571:web:c4bdde17f2254f04fc986e"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
// Pega a instância do serviço de Autenticação para usarmos em todo o site
const auth = getAuth(app);


// =================================================================
// 2. LÓGICA DA PÁGINA DE RESERVAS (Calculadora)
// =================================================================

// Tenta encontrar os elementos da calculadora na página
const calculateBtn = document.getElementById('calculate-btn');
const suiteSelect = document.getElementById('suite-type');
const checkinInput = document.getElementById('checkin-date');
const checkoutInput = document.getElementById('checkout-date');
const priceSummaryDiv = document.getElementById('price-summary');

// Só executa o código da calculadora se o botão existir nesta página
if (calculateBtn) {
    const suitePrices = {
        standard: 280,
        deluxe: 450,
        presidencial: 800
    };

    calculateBtn.addEventListener('click', () => {
        const suiteType = suiteSelect.value;
        const checkinDate = new Date(checkinInput.value);
        const checkoutDate = new Date(checkoutInput.value);

        if (!suiteType || !checkinInput.value || !checkoutInput.value) {
            priceSummaryDiv.innerHTML = `<h2>Erro</h2><p style="color: #ff6b6b;">Por favor, preencha todos os campos.</p>`;
            return;
        }

        if (checkoutDate <= checkinDate) {
            priceSummaryDiv.innerHTML = `<h2>Erro</h2><p style="color: #ff6b6b;">A data de check-out deve ser posterior à data de check-in.</p>`;
            return;
        }

        const timeDifference = checkoutDate.getTime() - checkinDate.getTime();
        const numberOfNights = Math.ceil(timeDifference / (1000 * 3600 * 24));
        const pricePerNight = suitePrices[suiteType];
        const totalPrice = numberOfNights * pricePerNight;
        const suiteName = suiteSelect.options[suiteSelect.selectedIndex].text;

        priceSummaryDiv.innerHTML = `
            <h2>Resumo da Reserva</h2>
            <p><strong>Suíte:</strong> ${suiteName}</p>
            <p><strong>Check-in:</strong> ${checkinDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
            <p><strong>Check-out:</strong> ${checkoutDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
            <p><strong>Total de noites:</strong> ${numberOfNights}</p>
            <hr>
            <p class="total-price">Valor Total: R$ ${totalPrice.toFixed(2).replace('.', ',')}</p>
        `;
    });
}


// =================================================================
// 3. LÓGICA DA PÁGINA DE LOGIN E CADASTRO
// =================================================================

// --- Formulário de Cadastro ---
const registerForm = document.getElementById('register-form');
const registerMessage = document.getElementById('register-message');

// Só executa se o formulário de cadastro existir na página
if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        registerMessage.style.display = 'none';
        registerMessage.textContent = '';

        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                sendEmailVerification(auth.currentUser);
                registerMessage.textContent = 'Cadastro realizado! Um link de confirmação foi enviado para o seu e-mail. Você já pode fazer o login.';
                registerMessage.className = 'message-box success';
                registerMessage.style.display = 'block';
                registerForm.reset();
            })
            .catch((error) => {
                let friendlyMessage = 'Ocorreu um erro ao criar a conta. Tente novamente.';
                if (error.code === 'auth/email-already-in-use') {
                    friendlyMessage = 'Este e-mail já está cadastrado. Tente fazer o login.';
                } else if (error.code === 'auth/weak-password') {
                    friendlyMessage = 'A senha precisa ter pelo menos 6 caracteres.';
                }
                registerMessage.textContent = friendlyMessage;
                registerMessage.className = 'message-box error';
                registerMessage.style.display = 'block';
            });
    });
}

// --- Formulário de Login ---
const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');

// Só executa se o formulário de login existir na página
if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        loginMessage.style.display = 'none';
        loginMessage.textContent = '';

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                loginMessage.textContent = 'Login efetuado com sucesso! Redirecionando...';
                loginMessage.className = 'message-box success';
                loginMessage.style.display = 'block';
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            })
            .catch((error) => {
                let friendlyMessage = 'Ocorreu um erro ao tentar fazer o login.';
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                    friendlyMessage = 'E-mail ou senha incorretos. Tente novamente.';
                }
                loginMessage.textContent = friendlyMessage;
                loginMessage.className = 'message-box error';
                loginMessage.style.display = 'block';
            });
    });
}