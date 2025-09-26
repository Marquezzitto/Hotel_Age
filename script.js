// =================================================================
// 1. IMPORTAÇÕES E CONFIGURAÇÃO INICIAL DO FIREBASE
// =================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    // REMOVIDA: Não precisamos importar esta função, pois não será usada.
    // sendEmailVerification, 
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

    // MUDANÇA 1: Removida a verificação 'user.emailVerified'.
    // Agora o menu de conta aparece para qualquer usuário logado.
    if (user) { 
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
            
            // MUDANÇA 2: Linha de verificação de e-mail REMOVIDA.
            // await sendEmailVerification(auth.currentUser); 
            
            // MUDANÇA 3: Texto de notificação alterado para refletir o sucesso imediato.
            registerMessage.textContent = 'Cadastro realizado com sucesso! Você já pode fazer login e usar o site.';
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
        // Texto de notificação ajustado na página de login.
        loginMessage.textContent = 'Cadastro realizado com sucesso! Agora você já pode fazer o login.';
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
            // userCredential.user.reload() não é mais estritamente necessário, 
            // mas mantive, pois não causa erro.
            // await userCredential.user.reload();
            // const refreshedUser = auth.currentUser; // Não precisamos disso.

            // Removido o bloco IF/ELSE que checava a verificação de e-mail.
            // O usuário agora faz login diretamente.
            loginMessage.textContent = 'Login efetuado com sucesso! Redirecionando...';
            loginMessage.className = 'message-box success';
            loginMessage.style.display = 'block';
            setTimeout(() => { window.location.href = 'index.html'; }, 2000);
            
        } catch (error) {
            loginMessage.textContent = 'E-mail ou senha incorretos. Tente novamente.';
            loginMessage.className = 'message-box error';
            loginMessage.style.display = 'block';
        }
    });
}


// =================================================================
// 4. LÓGICA DA PÁGINA DE AÇÕES (actions.html) - BLOCO REMOVIDO
// =================================================================

// O bloco de lógica para a página 'actions.html' foi removido porque não é mais necessário,
// já que a verificação de e-mail foi desativada e não haverá links de verificação enviados.
// Você pode remover o conteúdo HTML de actions.html também.
