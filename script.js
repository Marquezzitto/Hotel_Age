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

    if (user && user.emailVerified) { // MUDANÇA: Só considera logado se o e-mail for verificado
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
    // ... (código da calculadora continua o mesmo, sem alterações)
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

            // MUDANÇA 1: Mostra a mensagem na página de registro e não redireciona mais
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
    
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        loginMessage.style.display = 'none';

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;

                // MUDANÇA 2: Verifica se o e-mail do usuário foi verificado
                if (user && user.emailVerified) {
                    // Se sim, o login é bem-sucedido
                    loginMessage.textContent = 'Login efetuado com sucesso! Redirecionando...';
                    loginMessage.className = 'message-box success';
                    loginMessage.style.display = 'block';
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                } else {
                    // Se não, impede o login e avisa o usuário
                    signOut(auth); // Desloga o usuário preventivamente
                    loginMessage.textContent = 'Seu e-mail ainda não foi verificado. Por favor, clique no link que enviamos para sua caixa de entrada.';
                    loginMessage.className = 'message-box error';
                    loginMessage.style.display = 'block';
                }
            })
            .catch((error) => {
                let friendlyMessage = 'E-mail ou senha incorretos. Tente novamente.';
                loginMessage.textContent = friendlyMessage;
                loginMessage.className = 'message-box error';
                loginMessage.style.display = 'block';
            });
    });
}