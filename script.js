
//IMPORTAÇÕES E CONFIGURAÇÃO INICIAL DO FIREBASE

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    applyActionCode 
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import { getFirestore, doc, setDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

//Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBfnfohsW-9BkxdHmZMgdN9IT_-l3wAnvs",
    authDomain: "hotel-age.firebaseapp.com",
    projectId: "hotel-age",
    storageBucket: "hotel-age.firebasestorage.app",
    messagingSenderId: "914153302571",
    appId: "1:914153302571:web:c4bdde17f2254f04fc986e"
};

// Serviços do Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);



//LÓGICA GLOBAL (Roda em todas as páginas)


//Atualiza o menu se o usuário está logado ou não
onAuthStateChanged(auth, (user) => {
    const navLogin = document.getElementById('nav-login');
    const navAccount = document.getElementById('nav-account');
    const navLogout = document.getElementById('nav-logout');

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

//Botão de Sair (Logout)
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



//LÓGICAS DE PÁGINAS ESPECÍFICAS


//Lógica da Calculadora ---
const calculateBtn = document.getElementById('calculate-btn');

if (calculateBtn) {
    const PRICES = {
        standard: 150.00,
        deluxe: 300.00,
        presidencial: 750.00
    };
    const SUITE_NAMES = {
        standard: 'Suíte Standard',
        deluxe: 'Suíte Deluxe',
        presidencial: 'Suíte Presidencial'
    };

    calculateBtn.addEventListener('click', (event) => {
        event.preventDefault();

        const checkinInput = document.getElementById('checkin-date');
        const checkoutInput = document.getElementById('checkout-date');
        const suiteSelect = document.getElementById('suite-type');
        
        const resultsDetails = document.getElementById('results-details');
        const summaryDays = document.getElementById('summary-days');
        const summaryTotal = document.getElementById('summary-total');
        const summarySuite = document.getElementById('summary-suite'); // NOVO ELEMENTO
        const totalMessage = document.getElementById('reservation-total-message');

        const checkinDate = new Date(checkinInput.value);
        const checkoutDate = new Date(checkoutInput.value);
        const suiteType = suiteSelect.value;
        
        // Validação DATAS
        if (!checkinInput.value || !checkoutInput.value || checkinDate >= checkoutDate || !suiteType) {
            totalMessage.textContent = 'Erro! Por favor, selecione datas válidas e o tipo de suíte.';
            totalMessage.style.display = 'block';
            resultsDetails.style.display = 'none';
            return;
        }
        
        const diffTime = Math.abs(checkoutDate.getTime() - checkinDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        const pricePerNight = PRICES[suiteType] || 0;
        const totalValue = diffDays * pricePerNight;

        // Exibição do Resultado
        if (totalValue > 0) {
            summaryDays.textContent = `${diffDays}`;
            summaryTotal.textContent = `R$ ${totalValue.toFixed(2).replace('.', ',')}`;
            summarySuite.textContent = SUITE_NAMES[suiteType];
            
            resultsDetails.style.display = 'block';
            totalMessage.style.display = 'none';
        } else {
            totalMessage.textContent = 'Erro no cálculo. O valor deve ser positivo e as datas válidas.';
            totalMessage.style.display = 'block';
            resultsDetails.style.display = 'none';
        }
    });
}


//Lógica de Transição: "Finalizar Reserva" -> "Formulário de Pagamento" ---
const finalizeReservationBtn = document.getElementById('finalize-reservation-btn');
const reservationSummaryView = document.getElementById('reservation-summary-view');
const paymentFormView = document.getElementById('payment-form-view');
const backToSummaryBtn = document.getElementById('back-to-summary-btn');

if (finalizeReservationBtn && paymentFormView) {
    
    //Mostrar formulário de pagamento
    finalizeReservationBtn.addEventListener('click', () => {
        const user = auth.currentUser;
        if (!user) {
            alert('Você precisa estar logado para finalizar uma reserva. Redirecionando...');
            window.location.href = 'login.html';
            return;
        }

        // Passa o valor total para o formulário de pagamento
        const totalDisplay = document.getElementById('summary-total').textContent;
        document.getElementById('payment-total-display').textContent = totalDisplay;

        // Alterna as visualizações
        reservationSummaryView.style.display = 'none';
        paymentFormView.style.display = 'block';
    });

    //Voltar ao resumo
    backToSummaryBtn.addEventListener('click', () => {
        paymentFormView.style.display = 'none';
        reservationSummaryView.style.display = 'block';
    });
}


//Lógica de Confirmação Final: "Confirmar e Pagar" (com Concorrência) ---
const confirmPaymentBtn = document.getElementById('confirm-payment-btn');
const paymentMessage = document.getElementById('payment-message');

if (confirmPaymentBtn) {
    confirmPaymentBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        paymentMessage.style.display = 'none';
        
        //Coleta de Dados
        const checkinDateValue = document.getElementById('checkin-date').value;
        const checkoutDateValue = document.getElementById('checkout-date').value;
        const suiteType = document.getElementById('suite-type').value;
        const paymentMethod = document.getElementById('payment-method').value;
        const paymentName = document.getElementById('payment-name').value;
        
        const totalText = document.getElementById('summary-total').textContent;
        const totalValue = parseFloat(totalText.replace('R$', '').replace(',', '.'));
        const user = auth.currentUser;

        if (!paymentMethod || !paymentName) {
            paymentMessage.textContent = 'Por favor, preencha todos os campos de pagamento.';
            paymentMessage.style.display = 'block';
            return;
        }
        
        try {
            //VERIFICAÇÃO DE CONCORRÊNCIA (Double Booking)
            const reservationsRef = collection(db, "reservations");
            let q = query(reservationsRef, where("suiteType", "==", suiteType));
            
            const querySnapshot = await getDocs(q);
            let isConflicting = false;
            
            const newCheckin = new Date(checkinDateValue);
            const newCheckout = new Date(checkoutDateValue);

            querySnapshot.forEach(docSnapshot => {
                const existingReservation = docSnapshot.data();
                const existingCheckin = new Date(existingReservation.checkIn);
                const existingCheckout = new Date(existingReservation.checkOut);

                // Lógica de Conflito: Ocorre quando [newCheckin < existingCheckout] E [newCheckout > existingCheckin]
                if (newCheckin < existingCheckout && newCheckout > existingCheckin) {
                    isConflicting = true;
                }
            });

            if (isConflicting) {
                alert('As datas selecionadas já estão reservadas para esta suíte. Escolha outro período.');
                // Volta para a visualização de resumo para que o usuário mude as datas
                paymentFormView.style.display = 'none';
                reservationSummaryView.style.display = 'block';
                return;
            }

            //SALVAR NO FIREBASE
            const reservationId = user.uid + '_' + new Date().getTime(); 
            
            await setDoc(doc(db, "reservations", reservationId), {
                userId: user.uid,
                email: user.email,
                suiteType: suiteType,
                checkIn: checkinDateValue,
                checkOut: checkoutDateValue,
                totalValue: totalValue,
                paymentMethod: paymentMethod, // NOVO CAMPO
                paymentName: paymentName,     // NOVO CAMPO
                status: 'Confirmada'
            });

            //Feedback Final
            alert('Parabéns! Sua reserva foi concluída e confirmada com sucesso! Você será redirecionado para a página inicial.');
            window.location.href = 'index.html'; 

        } catch (error) {
            console.error("Erro ao salvar a reserva:", error);
            paymentMessage.textContent = 'Erro inesperado. Tente novamente.';
            paymentMessage.style.display = 'block';
        }
    });
}


//Lógica do Formulário de Cadastro ---
const registerForm = document.getElementById('register-form');
if (registerForm) {
    const registerMessage = document.getElementById('register-message');
    const birthdateInput = document.getElementById('register-birthdate');
    
    //Removi a linha do flatpickr para evitar erros se o plugin não estiver incluído.
    
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
            await createUserWithEmailAndPassword(auth, email, password);
            const user = auth.currentUser; // Pega o usuário recém-criado
            
            await setDoc(doc(db, "users", user.uid), {
                nome: name, email: email, cpf: cpf, telefone: phone, dataNascimento: birthdate
            });
            
//             // Verificação de e-mail desativada
            
//             registerMessage.textContent = 'Cadastro realizado com sucesso! Você já pode fazer login e usar o site.';
//             registerMessage.className = 'message-box success';
//             registerMessage.style.display = 'block';
//             registerForm.reset();
//         } catch (error) {
//             let friendlyMessage = 'Ocorreu um erro.';
//             if (error.code === 'auth/email-already-in-use') {
//                 friendlyMessage = 'Este e-mail já está cadastrado.';
//             } else if (error.code === 'auth/weak-password') {
//                 friendlyMessage = 'A senha precisa ter pelo menos 6 caracteres.';
//             }
//             registerMessage.textContent = friendlyMessage;
//             registerMessage.className = 'message-box error';
//             registerMessage.style.display = 'block';
//         }
//     });
// }

//Lógica do Formulário de Login ---
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

