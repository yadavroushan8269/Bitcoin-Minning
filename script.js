const funds = [
  {
    name:"NSG Growth Fund",
    type:"Equity · Growth",
    invested:"₹50,000",
    value:"₹62,500",
    return:"+25.0%"
  },
  {
    name:"NSG Balanced Fund",
    type:"Hybrid · Balanced",
    invested:"₹30,000",
    value:"₹35,400",
    return:"+18.0%"
  },
  {
    name:"NSG Equity Opportunities",
    type:"Equity · Diversified",
    invested:"₹40,000",
    value:"₹48,600",
    return:"+21.5%"
  },
  {
    name:"NSG Income Fund",
    type:"Debt · Income",
    invested:"₹20,000",
    value:"₹23,000",
    return:"+15.0%"
  }
];

let balanceVisible = true;

function fundHTML(fund){

  return `
    <div class="fund-card">

      <div class="fund-head">

        <div>
          <div class="fund-name">${fund.name}</div>
          <div class="fund-type">${fund.type}</div>
        </div>

        <div class="fund-return">
          ${fund.return}
        </div>

      </div>

      <div class="mini-chart">
        <svg viewBox="0 0 300 40"
             preserveAspectRatio="none">

          <polyline
            points="0,34 25,29 50,31 75,22
                    100,25 125,15 150,20
                    175,12 200,16 225,8
                    250,13 275,5 300,9"
            fill="none"
            stroke="#8bcf57"
            stroke-width="2"/>

        </svg>
      </div>

      <div class="fund-values">

        <div>
          <small>Amount invested</small>
          <strong>${fund.invested}</strong>
        </div>

        <div>
          <small>Current value</small>
          <strong>${fund.value}</strong>
        </div>

      </div>

    </div>
  `;
}


function loadFunds(){

  const home =
    document.getElementById("homeFunds");

  const list =
    document.getElementById("fundList");

  const explore =
    document.getElementById("exploreList");

  home.innerHTML =
    funds.slice(0,2)
    .map(fundHTML)
    .join("");

  list.innerHTML =
    funds.map(fundHTML).join("");

  explore.innerHTML =
    funds.map(fundHTML).join("");
}


function openPage(page, button){

  document.querySelectorAll(".page")
    .forEach(p => p.classList.remove("active"));

  const target =
    document.getElementById(page);

  if(target){
    target.classList.add("active");
  }

  document.querySelectorAll(".nav")
    .forEach(n => n.classList.remove("active"));

  if(button){
    button.classList.add("active");
  }

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });
}


function toggleBalance(){

  const balance =
    document.getElementById("balance");

  balanceVisible = !balanceVisible;

  balance.textContent =
    balanceVisible
      ? "₹1,70,500"
      : "••••••";
}


function logout(){

  if(confirm("Logout from this account?")){

    localStorage.removeItem("nsgUser");

    alert("Logged out successfully.");

    location.reload();
  }
}


function loadUser(){

  let user = null;

  try{
    user =
      JSON.parse(
        localStorage.getItem("nsgUser")
      );
  }catch(e){}

  if(!user){
    user = {
      name:"Investor",
      userId:"NSG100001",
      mobile:"XXXXXXXXXX"
    };
  }

  document.getElementById("username")
    .textContent =
    user.name || "Investor";

  document.getElementById("profileName")
    .textContent =
    user.name || "Investor";

  document.getElementById("userId")
    .textContent =
    user.userId || "NSG100001";

  document.getElementById("mobile")
    .textContent =
    user.mobile || "XXXXXXXXXX";
}


document.addEventListener(
  "DOMContentLoaded",
  function(){

    loadFunds();
    loadUser();

  }
);
