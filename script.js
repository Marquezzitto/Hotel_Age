// =================================================================
// 1. IMPORTAÇÕES E CONFIGURAÇÃO INICIAL DO FIREBASE
// =================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    sendEmailVerification, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut 
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// A sua configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBfnfohsW-9BkxdHmZMgdN9IT_-l3wAnvs",
    authDomain: "hotel-age.firebaseapp.com",
    projectId: "hotel-age",
    storageBucket: "hotel-age.firebasestorage.app",
    messagingSenderId: "914153302571",
    appId: "1:914153302571:web:c4bdde17f2254f04fc986e"
};

// Inicializa os serviços do Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// =================================================================
// 2. LÓGICA GLOBAL (Roda em todas as páginas)
// =================================================================

// Observador que atualiza o menu se o usuário está logado ou não
onAuthStateChanged(auth, (user) => {
    const navLogin = document.getElementById('nav-login');
    const navAccount = document.getElementById('nav-account');
    const navLogout = document.getElementById('nav-logout');

    if (user && user.emailVerified) {
        // Usuário logado e verificado
        navLogin.style.display = 'none';
        navAccount.style.display = 'list-item';
        navLogout.style.display = 'list-item';
    } else {
        // Usuário deslogado ou não verificado
        navLogin.style.display = 'list-item';
        navAccount.style.display = 'none';
        navLogout.style.display = 'none';
    }
});

// Funcionalidade do botão de Sair (Logout)
const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        signOut(auth).then(() => {
            console.log('Logout efetuado com sucesso.');
            window.location.href = 'login.html';
        }).catch((error) => {
            console.error('Erro ao fazer logout:', error);
        });
    });
}


// =================================================================
// 3. LÓGICAS DE PÁGINAS ESPECÍFICAS
// =================================================================

// --- Lógica da Calculadora (só roda na página de reservas) ---
const calculateBtn = document.getElementById('calculate-btn');
if (calculateBtn) {
    const suiteSelect = document.getElementById('suite-type');
    const checkinInput = document.getElementById('checkin-date');
    const checkoutInput = document.getElementById('checkout-date');
    const priceSummaryDiv = document.getElementById('price-summary');
    
    const suitePrices = { standard: 280, deluxe: 450, presidencial: 800 };

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

// --- Lógica do Formulário de Cadastro (só roda na página de registro) ---
const registerForm = document.getElementById('register-form');
if (registerForm) {
    const registerMessage = document.getElementById('register-message');
    
    const birthdateInput = document.getElementById('register-birthdate');
    if (birthdateInput) {
        flatpickr(birthdateInput, {
            "locale": "pt",
            dateFormat: "d/m/Y",
        });
    }

    registerForm.addEventListener('submit', async (event) => { 
        event.preventDefault();
        registerMessage.style.display = 'none';
        
        const name = document.getElementById('register-name').value;
        const cpf = document.getElementById('register-cpf').value;
        const phone = document.getElementById('register-phone').value;
        const birthdate = birthdateInput.value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            await setDoc(doc(db, "users", user.uid), {
                nome: name, email: email, cpf: cpf, telefone: phone, dataNascimento: birthdate
            });
            
            await sendEmailVerification(auth.currentUser);
            
            registerMessage.textContent = 'Cadastro realizado! Um link foi enviado para seu e-mail. Por favor, verifique sua conta para poder fazer o login.';
            registerMessage.className = 'message-box success';
            registerMessage.style.display = 'block';
            registerForm.reset();

        } catch (error) {
            let friendlyMessage = 'Ocorreu um erro. Tente novamente.';
            if (error.code === 'auth/email-already-in-use') {
                friendlyMessage = 'Este e-mail já está cadastrado.';
            } else if (error.code === 'auth/weak-password') {
                friendlyMessage = 'A senha precisa ter pelo menos 6 caracteres.';
            }
            registerMessage.textContent = friendlyMessage;
            registerMessage.className = 'message-box error';
            registerMessage.style.display = 'block';
        }
    });
}

// --- Lógica do Formulário de Login (só roda na página de login) ---
const loginForm = document.getElementById('login-form');
if (loginForm) {
    const loginMessage = document.getElementById('login-message');
    
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'registered') {
        loginMessage.textContent = 'Cadastro realizado com sucesso! Verifique seu e-mail e faça o login.';
        loginMessage.className = 'message-box success';
        loginMessage.style.display = 'block';
    }
    
    // ATUALIZADO COM ASYNC/AWAIT E USER.RELOAD()
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        loginMessage.style.display = 'none';

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            // FORÇA a recarga dos dados do usuário do servidor
            await userCredential.user.reload();
            const refreshedUser = auth.currentUser;

            if (refreshedUser && refreshedUser.emailVerified) {
                // Se o e-mail estiver verificado, o login é bem-sucedido
                loginMessage.textContent = 'Login efetuado com sucesso! Redirecionando...';
                loginMessage.className = 'message-box success';
                loginMessage.style.display = 'block';
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                // Se não, impede o login e avisa o usuário
                await signOut(auth); // Desloga o usuário preventivamente
                loginMessage.textContent = 'Seu e-mail ainda não foi verificado. Por favor, clique no link que enviamos para sua caixa de entrada.';
                loginMessage.className = 'message-box error';
                loginMessage.style.display = 'block';
            }
        } catch (error) {
            // Se o e-mail/senha estiverem errados, o erro será capturado aqui
            console.error('Erro no login:', error.code);
            let friendlyMessage = 'E-mail ou senha incorretos. Tente novamente.';
            loginMessage.textContent = friendlyMessage;
            loginMessage.className = 'message-box error';
            loginMessage.style.display = 'block';
        }
    });
}
