let balance = Number(localStorage.getItem("nsgCoins"));

if (isNaN(balance)) {
  balance = 50;
  localStorage.setItem("nsgCoins", balance);
}

let playerId = localStorage.getItem("nsgPlayerId");

if (!playerId) {
  playerId =
    "NSG" +
    Math.floor(100000 + Math.random() * 900000);

  localStorage.setItem("nsgPlayerId", playerId);
}

let bets = [10,10];
let activeBets = [null,null];

let multiplier = 1;
let crashPoint = 0;
let running = false;
let roundNumber = 1;
let timer = null;

const balanceEl =
  document.getElementById("balance");

const multiplierEl =
  document.getElementById("multiplier");

const statusEl =
  document.getElementById("status");

const playerIdEl =
  document.getElementById("playerId");

playerIdEl.textContent = playerId;

function updateBalance(){

  balanceEl.textContent =
    balance.toFixed(2);

  localStorage.setItem(
    "nsgCoins",
    balance
  );
}


function randomCrash(){

  // Free-play random crash point
  const value =
    1.05 +
    Math.random() * 7;

  return Number(value.toFixed(2));
}


function startRound(){

  running = true;

  multiplier = 1;
  crashPoint = randomCrash();

  roundNumber++;

  document.getElementById("round")
    .textContent =
    "Round #" +
    String(roundNumber).padStart(3,"0");

  statusEl.textContent =
    "FLYING";

  document.querySelectorAll(".bet-button")
    .forEach(btn=>{
      btn.textContent = "BET";
      btn.classList.remove("cashed");
    });

  activeBets = [null,null];

  drawGraph(0);

  clearInterval(timer);

  timer = setInterval(()=>{

    multiplier +=
      0.01 + multiplier * 0.004;

    multiplier =
      Number(multiplier.toFixed(2));

    multiplierEl.textContent =
      multiplier.toFixed(2) + "x";

    drawGraph(multiplier);

    if(multiplier >= crashPoint){
      crash();
    }

  },80);
}


function crash(){

  clearInterval(timer);

  running = false;

  multiplierEl.textContent =
    crashPoint.toFixed(2) + "x";

  statusEl.textContent =
    "💥 CRASHED";

  activeBets.forEach((bet,i)=>{

    if(!bet) return;

    addHistory(
      bet.amount,
      crashPoint,
      false
    );

    activeBets[i] = null;
  });

  setTimeout(startWaiting,2500);
}


function startWaiting(){

  multiplierEl.textContent = "1.00x";

  statusEl.textContent =
    "WAITING FOR NEXT ROUND";

  drawGraph(0);

  setTimeout(startRound,2500);
}


function placeBet(index){

  if(running){

    if(activeBets[index]){
      cashOut(index);
      return;
    }

    alert(
      "Betting is closed after the round starts."
    );

    return;
  }

  const amount =
    Number(bets[index]);

  if(amount <= 0){
    return;
  }

  if(amount > balance){

    alert(
      "Not enough virtual coins."
    );

    return;
  }

  balance -= amount;

  updateBalance();

  activeBets[index] = {
    amount:amount
  };

  const btn =
    document.getElementById(
      "betBtn"+index
    );

  btn.textContent = "CANCEL";
  btn.classList.add("cashed");

  setTimeout(()=>{

    if(!running &&
       activeBets[index]){

      balance += amount;

      updateBalance();

      activeBets[index] = null;

      btn.textContent = "BET";
      btn.classList.remove("cashed");
    }

  },2000);
}


function cashOut(index){

  const bet =
    activeBets[index];

  if(!bet || !running){
    return;
  }

  const win =
    bet.amount * multiplier;

  balance += win;

  updateBalance();

  addHistory(
    bet.amount,
    multiplier,
    true
  );

  activeBets[index] = null;

  const btn =
    document.getElementById(
      "betBtn"+index
    );

  btn.textContent = "CASHED";
  btn.classList.remove("cashed");
}


function changeBet(index,value){

  bets[index] =
    Math.max(
      1,
      Math.min(
        1000,
        bets[index] + value
      )
    );

  document.getElementById(
    "bet"+index
  ).textContent =
    bets[index];
}


function setBet(index,value){

  bets[index] = value;

  document.getElementById(
    "bet"+index
  ).textContent =
    value;
}


function drawGraph(value){

  const svg =
    document.querySelector(".chart svg");

  const line =
    document.getElementById("linePath");

  const area =
    document.getElementById("areaPath");

  const plane =
    document.getElementById("plane");

  const width =
    svg.clientWidth || 600;

  const height =
    svg.clientHeight || 330;

  let progress =
    Math.min(
      value / 8,
      1
    );

  let x =
    35 + progress * (width - 80);

  let y =
    height -
    35 -
    progress * (height - 90);

  let startY =
    height - 35;

  let d =
    `M0 ${startY}
     Q ${x*.45} ${startY}
       ${x} ${y}`;

  line.setAttribute("d",d);

  area.setAttribute(
    "d",
    `M0 ${startY}
     Q ${x*.45} ${startY}
       ${x} ${y}
     L${x} ${startY}
     Z`
  );

  plane.setAttribute(
    "x",
    Math.max(10,x-18)
  );

  plane.setAttribute(
    "y",
    Math.max(35,y+10)
  );
}


function addHistory(
  amount,
  mult,
  win
){

  const list =
    document.getElementById(
      "historyList"
    );

  const row =
    document.createElement("div");

  row.className =
    "history-row";

  const result =
    win
      ? "+" + (amount * mult).toFixed(2)
      : "Lost";

  row.innerHTML = `
    <span>${playerId}</span>
    <span>${amount.toFixed(2)}</span>
    <span>${mult.toFixed(2)}x</span>
    <span class="${win?"win":"loss"}">
      ${result}
    </span>
  `;

  list.prepend(row);

  while(list.children.length > 20){
    list.removeChild(
      list.lastChild
    );
  }
}


function openMenu(){

  document
    .getElementById("sideMenu")
    .classList.add("show");

  document
    .getElementById("overlay")
    .classList.add("show");
}


function closeMenu(){

  document
    .getElementById("sideMenu")
    .classList.remove("show");

  document
    .getElementById("overlay")
    .classList.remove("show");
}


function showHistory(){

  closeMenu();

  document
    .querySelector(".history")
    .scrollIntoView({
      behavior:"smooth"
    });
}


function showRules(){

  alert(
`NSG Aviator - Free Play

• This is a virtual-coin game.
• Starting balance: 50 virtual coins.
• Multiplier increases during each round.
• The round ends at a randomly generated crash point.
• Cash-out before crash gives virtual winnings.
• No real-money deposits or withdrawals.`
  );
}


function resetCoins(){

  balance = 50;

  updateBalance();

  alert(
    "50 virtual coins restored."
  );

  closeMenu();
}


updateBalance();

for(let i=0;i<4;i++){

  const fake =
    1.2 + Math.random()*3;

  addHistory(
    Math.floor(
      5 + Math.random()*40
    ),
    Number(fake.toFixed(2)),
    Math.random()>.4
  );
}

setTimeout(
  startRound,
  1500
);
