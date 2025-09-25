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
    signOut,
    applyActionCode // Função adicionada
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
        navLogin.style.display = 'none';
        navAccount.style.display = 'list-item';
        navLogout.style.display = 'list-item';
    } else {
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
            window.location.href = 'login.html';
        }).catch((error) => {
            console.error('Erro ao fazer logout:', error);
        });
    });
}


// =================================================================
// 3. LÓGICAS DE PÁGINAS ESPECÍFICAS
// =================================================================

// --- Lógica da Calculadora ---
const calculateBtn = document.getElementById('calculate-btn');
if (calculateBtn) {
    // ... (código da calculadora aqui, sem alterações)
}

// --- Lógica do Formulário de Cadastro ---
const registerForm = document.getElementById('register-form');
if (registerForm) {
    const registerMessage = document.getElementById('register-message');
    
    const birthdateInput = document.getElementById('register-birthdate');
    if (birthdateInput) {
        flatpickr(birthdateInput, { "locale": "pt", dateFormat: "d/m/Y" });
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
            let friendlyMessage = 'Ocorreu um erro.';
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

// --- Lógica do Formulário de Login ---
const loginForm = document.getElementById('login-form');
if (loginForm) {
    const loginMessage = document.getElementById('login-message');
    
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'registered') {
        loginMessage.textContent = 'Cadastro realizado com sucesso! Verifique seu e-mail e faça o login.';
        loginMessage.className = 'message-box success';
        loginMessage.style.display = 'block';
    }
    
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        loginMessage.style.display = 'none';

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            await userCredential.user.reload();
            const refreshedUser = auth.currentUser;

            if (refreshedUser && refreshedUser.emailVerified) {
                loginMessage.textContent = 'Login efetuado com sucesso! Redirecionando...';
                loginMessage.className = 'message-box success';
                loginMessage.style.display = 'block';
                setTimeout(() => { window.location.href = 'index.html'; }, 2000);
            } else {
                await signOut(auth);
                loginMessage.textContent = 'Seu e-mail ainda não foi verificado. Por favor, clique no link que enviamos para sua caixa de entrada.';
                loginMessage.className = 'message-box error';
                loginMessage.style.display = 'block';
            }
        } catch (error) {
            loginMessage.textContent = 'E-mail ou senha incorretos. Tente novamente.';
            loginMessage.className = 'message-box error';
            loginMessage.style.display = 'block';
        }
    });
}


// =================================================================
// 4. LÓGICA DA PÁGINA DE AÇÕES (actions.html) - BLOCO ADICIONADO
// =================================================================

const actionTitle = document.getElementById('action-title');
if (actionTitle) {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const actionCode = params.get('oobCode');
    const actionMessage = document.getElementById('action-message');

    if (mode === 'verifyEmail' && actionCode) {
        applyActionCode(auth, actionCode).then(() => {
            actionTitle.textContent = 'E-mail Verificado com Sucesso!';
            actionMessage.textContent = 'Sua conta está ativa. Você será redirecionado para a página de login em 5 segundos.';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 5000);
        }).catch((error) => {
            actionTitle.textContent = 'Erro na Verificação';
            actionMessage.textContent = 'O link de verificação é inválido ou já expirou. Por favor, tente se cadastrar novamente.';
            console.error(error);
        });
    } else {
        actionTitle.textContent = 'Página Inválida';
        actionMessage.textContent = 'Esta página só pode ser acessada através de um link de e-mail.';
    }
}