let balance =
  Number(localStorage.getItem("nsgBalance"));

if (!balance) {
  balance = 50;
  localStorage.setItem("nsgBalance", balance);
}

let totalRecharge =
  Number(localStorage.getItem("nsgTotalRecharge"));

if (!totalRecharge) {
  totalRecharge = 50;
  localStorage.setItem(
    "nsgTotalRecharge",
    totalRecharge
  );
}

let totalWithdraw =
  Number(localStorage.getItem("nsgTotalWithdraw")) || 0;

let userId =
  localStorage.getItem("nsgUserId");

if (!userId) {

  userId =
    Math.floor(
      100000000 + Math.random() * 900000000
    );

  localStorage.setItem(
    "nsgUserId",
    userId
  );
}

document.getElementById("userId")
  .textContent = userId;

function update(){

  document.getElementById("recharge")
    .textContent =
    "₹" + balance.toFixed(2);

  document.getElementById("withdraw")
    .textContent =
    "₹" + balance.toFixed(2);

  document.getElementById("totalRecharge")
    .textContent =
    "₹" + totalRecharge.toFixed(2);

  document.getElementById("totalWithdraw")
    .textContent =
    "₹" + totalWithdraw.toFixed(2);

  localStorage.setItem(
    "nsgBalance",
    balance
  );
}


function virtualDeposit(){

  let amount =
    prompt(
      "Enter virtual coins to add:"
    );

  amount = Number(amount);

  if(!amount || amount <= 0)
    return;

  balance += amount;
  totalRecharge += amount;

  localStorage.setItem(
    "nsgTotalRecharge",
    totalRecharge
  );

  update();

  alert(
    "Virtual balance added successfully."
  );
}


function virtualWithdraw(){

  let amount =
    Number(
      prompt(
        "Enter virtual coins to withdraw:"
      )
    );

  if(!amount || amount <= 0)
    return;

  if(amount > balance){

    alert(
      "Insufficient virtual balance."
    );

    return;
  }

  balance -= amount;
  totalWithdraw += amount;

  localStorage.setItem(
    "nsgTotalWithdraw",
    totalWithdraw
  );

  update();

  alert(
    "Virtual withdrawal recorded."
  );
}


function invite(){

  alert(
    "Your referral ID: " + userId
  );
}


function plans(){

  alert(
    "No investment plans are active in this prototype."
  );
}


function bank(){

  alert(
    "Bank-account management is disabled in this prototype."
  );
}


function commission(){

  alert(
    "Commission history is empty."
  );
}


function invest(){

  alert(
    "Investment section — virtual prototype."
  );
}


function team(){

  alert(
    "Team section — virtual prototype."
  );
}


function profile(){

  alert(
    "Player ID: " + userId
  );
}


update();
