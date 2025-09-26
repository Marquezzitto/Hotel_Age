// =================================================================
// 1. IMPORTAÇÕES E CONFIGURAÇÃO INICIAL DO FIREBASE
// =================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    // sendEmailVerification, (Removida)
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    applyActionCode 
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

    // Usuário logado aparece a conta, sem verificação de e-mail.
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
    // 1. Definição dos Preços Diários (Ajuste estes valores se necessário!)
    const PRICES = {
        standard: 150.00,
        deluxe: 300.00,
        presidencial: 750.00
    };

    calculateBtn.addEventListener('click', (event) => {
        event.preventDefault();

        // 2. Leitura dos Inputs
        const checkinInput = document.getElementById('checkin-date');
        const checkoutInput = document.getElementById('checkout-date');
        const suiteSelect = document.getElementById('suite-type');
        
        // Elementos de Exibição
        const resultsDetails = document.getElementById('results-details');
        const summaryDays = document.getElementById('summary-days');
        const summaryTotal = document.getElementById('summary-total');
        const totalMessage = document.getElementById('reservation-total-message');

        const checkinDate = new Date(checkinInput.value);
        const checkoutDate = new Date(checkoutInput.value);
        const suiteType = suiteSelect.value;
        
        // 3. Validação
        if (!checkinInput.value || !checkoutInput.value || checkinDate >= checkoutDate || !suiteType) {
            totalMessage.textContent = 'Erro! Por favor, selecione datas válidas e o tipo de suíte.';
            totalMessage.style.display = 'block';
            if(resultsDetails) resultsDetails.style.display = 'none';
            return;
        }
        
        // 4. Cálculo da Diferença de Dias
        const diffTime = Math.abs(checkoutDate.getTime() - checkinDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        // 5. Cálculo do Valor Total
        const pricePerNight = PRICES[suiteType] || 0;
        const totalValue = diffDays * pricePerNight;

        // 6. Exibição do Resultado
        if (totalValue > 0) {
            summaryDays.textContent = `${diffDays}`;
            summaryTotal.textContent = `R$ ${totalValue.toFixed(2).replace('.', ',')}`;
            
            if(resultsDetails) resultsDetails.style.display = 'block';
            if(totalMessage) totalMessage.style.display = 'none';
        } else {
            totalMessage.textContent = 'Erro no cálculo. O valor deve ser positivo e as datas válidas.';
            totalMessage.style.display = 'block';
            if(resultsDetails) resultsDetails.style.display = 'none';
        }
    });
}


// --- Lógica do Botão de Finalizar Reserva ---
const finalizeReservationBtn = document.getElementById('finalize-reservation-btn');

if (finalizeReservationBtn) {
    finalizeReservationBtn.addEventListener('click', async () => {
        // 1. **COLETA DE DADOS:** Pega os valores
        const checkinDate = document.getElementById('checkin-date').value;
        const checkoutDate = document.getElementById('checkout-date').value;
        const suiteType = document.getElementById('suite-type').value;

        // Pega o valor total do HTML.
        const summaryTotalElement = document.getElementById('summary-total');
        const totalText = summaryTotalElement ? summaryTotalElement.textContent : 'R$ 0,00';
        const totalValue = parseFloat(totalText.replace('R$', '').replace(',', '.'));
        
        // 2. **VERIFICAÇÃO DE PRÉ-REQUISITOS:**
        if (totalValue === 0) {
            alert('Por favor, calcule e valide o valor da reserva primeiro.');
            return;
        }

        // 3. **VERIFICAÇÃO DE LOGIN:**
        const user = auth.currentUser;
        if (!user) {
            alert('Você precisa estar logado para finalizar uma reserva. Redirecionando para o login...');
            window.location.href = 'login.html';
            return;
        }

        // 4. **SALVAR NO FIREBASE:**
        try {
            const reservationId = user.uid + '_' + new Date().getTime(); 
            
            await setDoc(doc(db, "reservations", reservationId), {
                userId: user.uid,
                email: user.email,
                suiteType: suiteType,
                checkIn: checkinDate,
                checkOut: checkoutDate,
                totalValue: totalValue,
                status: 'Pendente' // Status inicial
            });

            alert('Reserva finalizada com sucesso! Você será redirecionado para a página inicial.');
            window.location.href = 'index.html'; 

        } catch (error) {
            console.error("Erro ao salvar a reserva:", error);
            alert('Não foi possível finalizar a reserva. Verifique sua conexão e tente novamente.');
        }
    });
}

// --- Lógica do Formulário de Cadastro ---
const registerForm = document.getElementById('register-form');
if (registerForm) {
    const registerMessage = document.getElementById('register-message');
    const birthdateInput = document.getElementById('register-birthdate');
    
    // Adicione esta linha de volta se você usa o flatpickr na página de registro
    if (birthdateInput) {
        //flatpickr(birthdateInput, { "locale": "pt", dateFormat: "d/m/Y" });
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
            
            // Verificação de e-mail removida.
            
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
            await signInWithEmailAndPassword(auth, email, password);
            
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
// 4. LÓGICA DA PÁGINA DE AÇÕES (actions.html) - REMOVIDA
// =================================================================
