const API_URL =
"https://script.google.com/macros/s/AKfycby6bTl_tUL1STJtWO8jQaXzjQSOhDLgvxj_2UWuI6VJBhh0ehwpCFSlQMhpDn57MfNtow/exec";

const UPI_ID = "yadav-rishab@fam";

const SUPPORT =
"https://t.me/Hammerff7gcz";


/* ================= PRODUCTS ================= */

const products = [

  {
    id:1,
    name:"Product 1",
    price:999,
    daily:18
  },

  {
    id:2,
    name:"Product 2",
    price:1999,
    daily:36
  },

  {
    id:3,
    name:"Product 3",
    price:4999,
    daily:90
  }

];


/* ================= USER SESSION ================= */

let authToken =
localStorage.getItem("nsgAuthToken") || "";

let serverUser = null;


/* ================= LOCAL DATA ================= */

let data =
JSON.parse(
  localStorage.getItem("nsgLocalData") || "null"
) || {

  balance:0,

  attendance:{},

  purchased:[],

  rewards:[],

  deposits:[],

  withdrawals:[],

  transactions:[]

};


if(!data.attendance)
data.attendance = {};

if(!Array.isArray(data.purchased))
data.purchased = [];

if(!Array.isArray(data.rewards))
data.rewards = [];

if(!Array.isArray(data.deposits))
data.deposits = [];

if(!Array.isArray(data.withdrawals))
data.withdrawals = [];

if(!Array.isArray(data.transactions))
data.transactions = [];


function saveData(){

  localStorage.setItem(
    "nsgLocalData",
    JSON.stringify(data)
  );

}


/* ================= MOBILE ================= */

function cleanMobile(value){

  return String(value || "")
    .replace(/\D/g,"")
    .slice(0,10);

}


function validMobile(value){

  return /^[6-9]\d{9}$/.test(
    cleanMobile(value)
  );

}


/* ================= PASSWORD ================= */

function validPassword(value){

  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/
    .test(String(value || ""));

}


/* ================= MESSAGE ================= */

function setMessage(
  id,
  text,
  type="error"
){

  const element =
    document.getElementById(id);

  if(!element)
  return;

  element.textContent = text;

  element.className =
    "form-message " + type;

}


/* ================= AUTH SWITCH ================= */

function showAuth(type){

  document
    .getElementById("loginBox")
    .classList
    .toggle(
      "hidden",
      type !== "login"
    );


  document
    .getElementById("signupBox")
    .classList
    .toggle(
      "hidden",
      type !== "signup"
    );


  document
    .getElementById("loginTab")
    .classList
    .toggle(
      "active",
      type === "login"
    );


  document
    .getElementById("signupTab")
    .classList
    .toggle(
      "active",
      type === "signup"
    );


  setMessage(
    "loginMessage",
    ""
  );

  setMessage(
    "signupMessage",
    ""
  );

}


/* ================= API ================= */

async function apiPost(payload){

  const response =
    await fetch(
      API_URL,
      {
        method:"POST",

        headers:{
          "Content-Type":
          "text/plain;charset=utf-8"
        },

        body:
        JSON.stringify(payload)
      }
    );


  const text =
    await response.text();


  let output;


  try{

    output =
      JSON.parse(text);

  }

  catch(error){

    throw new Error(
      "Invalid server response"
    );

  }


  if(!output.ok){

    throw new Error(
      output.error ||
      "Request failed"
    );

  }


  return output;

}


/* ================= REGISTER ================= */

async function registerUser(){

  const mobile =
    cleanMobile(
      document
      .getElementById("signupMobile")
      .value
    );


  const password =
    document
    .getElementById("signupPassword")
    .value;


  const confirm =
    document
    .getElementById("signupConfirm")
    .value;


  const button =
    document
    .getElementById("signupBtn");


  setMessage(
    "signupMessage",
    ""
  );


  if(!validMobile(mobile)){

    setMessage(
      "signupMessage",
      "Please enter a valid 10 digit mobile number."
    );

    return;

  }


  if(!validPassword(password)){

    setMessage(
      "signupMessage",
      "Password must be at least 8 characters and contain letters and numbers."
    );

    return;

  }


  if(password !== confirm){

    setMessage(
      "signupMessage",
      "Passwords do not match."
    );

    return;

  }


  button.disabled = true;

  button.textContent =
    "Registering...";


  try{

    const output =
      await apiPost({

        action:"register",

        mobile:"+91" + mobile,

        password:password

      });


    setMessage(
      "signupMessage",
      "Registration successful. Please login.",
      "success"
    );


    document
      .getElementById("loginMobile")
      .value = mobile;


    document
      .getElementById("loginPassword")
      .value = "";


    document
      .getElementById("signupPassword")
      .value = "";


    document
      .getElementById("signupConfirm")
      .value = "";


    setTimeout(
      function(){

        showAuth("login");

      },
      700
    );


  }

  catch(error){

    setMessage(
      "signupMessage",
      error.message ||
      "Registration failed. Please try again."
    );

  }

  finally{

    button.disabled = false;

    button.textContent =
      "Register";

  }

}


/* ================= LOGIN ================= */

async function loginUser(){

  const mobile =
    cleanMobile(
      document
      .getElementById("loginMobile")
      .value
    );


  const password =
    document
    .getElementById("loginPassword")
    .value;


  const button =
    document
    .getElementById("loginBtn");


  setMessage(
    "loginMessage",
    ""
  );


  if(
    !validMobile(mobile) ||
    !password
  ){

    setMessage(
      "loginMessage",
      "Wrong details pls try again"
    );

    return;

  }


  button.disabled = true;

  button.textContent =
    "Logging in...";


  try{

    const output =
      await apiPost({

        action:"login",

        mobile:"+91" + mobile,

        password:password

      });


    authToken =
      String(
        output.token ||
        output.sessionToken ||
        ""
      );


    if(!authToken){

      throw new Error(
        "Login response missing session token."
      );

    }


    localStorage.setItem(
      "nsgAuthToken",
      authToken
    );


    serverUser =
      output.user ||
      {
        mobile:"+91" + mobile
      };


    localStorage.setItem(
      "nsgUser",
      JSON.stringify(serverUser)
    );


    openApp();

  }

  catch(error){

    setMessage(
      "loginMessage",
      "Wrong details pls try again"
    );

  }

  finally{

    button.disabled = false;

    button.textContent =
      "Login";

  }

}


/* ================= OPEN APP ================= */

function openApp(){

  document
    .getElementById("authScreen")
    .classList
    .add("hidden");


  document
    .getElementById("appScreen")
    .classList
    .remove("hidden");


  const saved =
    JSON.parse(
      localStorage.getItem("nsgUser") ||
      "{}"
    );


  const mobile =
    (
      serverUser &&
      serverUser.mobile
    ) ||
    saved.mobile ||
    "";


  const clean =
    cleanMobile(mobile);


  document
    .getElementById("loggedMobile")
    .textContent = clean;


  document
    .getElementById("profileMobile")
    .textContent = clean;


  updateUI();

}


/* ================= LOGOUT ================= */

function logoutUser(){

  authToken = "";

  serverUser = null;


  localStorage.removeItem(
    "nsgAuthToken"
  );

  localStorage.removeItem(
    "nsgUser"
  );


  document
    .getElementById("appScreen")
    .classList
    .add("hidden");


  document
    .getElementById("authScreen")
    .classList
    .remove("hidden");


  document
    .getElementById("loginPassword")
    .value = "";


  showAuth("login");

}


/* ================= PAGE NAVIGATION ================= */

function openPage(id){

  document
    .querySelectorAll(".page")
    .forEach(
      page =>
      page.classList.remove("active")
    );


  const page =
    document.getElementById(id);


  if(page)
    page.classList.add("active");


  window.scrollTo({
    top:0,
    behavior:"smooth"
  });


  updateUI();

}


/* ================= MONEY ================= */

function money(value){

  return Number(value || 0)
    .toLocaleString(
      "en-IN",
      {
        minimumFractionDigits:2,
        maximumFractionDigits:2
      }
    );

}


/* ================= BALANCE ================= */

function updateBalance(){

  const balance =
    document.getElementById("balance");

  const home =
    document.getElementById("homeBalance");

  const withdraw =
    document.getElementById(
      "withdrawBalance"
    );


  if(balance)
    balance.textContent =
      money(data.balance);


  if(home)
    home.textContent =
      money(data.balance);


  if(withdraw)
    withdraw.textContent =
      money(data.balance);

}


/* ================= PRODUCTS ================= */

function productHTML(product){

  const bought =
    data.purchased.includes(
      product.id
    );


  return `

    <div class="product">

      <div class="product-head">

        <div>

          <h3>
            ${product.name}
          </h3>

          <p>
            Daily reward plan
          </p>

        </div>

        <div class="product-price">
          ₹${product.price}
        </div>

      </div>


      <ul>

        <li>
          Daily reward:
          ₹${product.daily}
        </li>

        <li>
          Plan duration:
          30 days
        </li>

        <li>
          Rewards subject to
          account eligibility
        </li>

      </ul>


      ${
        bought

        ?

        `<button
          class="secondary-btn"
          disabled>
          ✓ Purchased
        </button>`

        :

        `<button
          class="primary-btn"
          onclick="buyProduct(${product.id})">
          Select Product
        </button>`
      }

    </div>

  `;

}


function loadProducts(){

  const html =
    products
    .map(productHTML)
    .join("");


  const productsList =
    document.getElementById(
      "productsList"
    );


  const homeProducts =
    document.getElementById(
      "homeProducts"
    );


  if(productsList)
    productsList.innerHTML =
      html;


  if(homeProducts)
    homeProducts.innerHTML =
      html;

}


/* ================= BUY PRODUCT ================= */

function buyProduct(id){

  const product =
    products.find(
      item =>
      item.id === id
    );


  if(!product)
    return;


  if(
    data.purchased
    .includes(id)
  ){

    alert(
      "This product is already selected."
    );

    return;

  }


  if(
    data.balance <
    product.price
  ){

    alert(
      "Insufficient balance. Please deposit first."
    );

    openPage("deposit");

    return;

  }


  data.balance -=
    product.price;


  data.purchased.push(
    id
  );


  data.transactions.unshift({

    type:"Product Purchase",

    amount:product.price,

    date:new Date()
      .toLocaleString()

  });


  saveData();

  updateUI();


  alert(
    product.name +
    " selected successfully."
  );

}


/* ================= ATTENDANCE ================= */

let calendarDate =
  new Date();


function renderCalendar(){

  const title =
    document.getElementById(
      "monthTitle"
    );


  const calendar =
    document.getElementById(
      "calendar"
    );


  if(!title || !calendar)
    return;


  const year =
    calendarDate
      .getFullYear();


  const month =
    calendarDate
      .getMonth();


  const monthNames = [

    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"

  ];


  title.textContent =
    monthNames[month] +
    " " +
    year;


  calendar.innerHTML = "";


  const firstDay =
    new Date(
      year,
      month,
      1
    ).getDay();


  const days =
    new Date(
      year,
      month + 1,
      0
    ).getDate();


  for(
    let i=0;
    i<firstDay;
    i++
  ){

    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "day empty";

    calendar.appendChild(
      empty
    );

  }


  for(
    let day=1;
    day<=days;
    day++
  ){

    const element =
      document.createElement(
        "div"
      );


    const key =
      year +
      "-" +
      String(month+1)
        .padStart(2,"0") +
      "-" +
      String(day)
        .padStart(2,"0");


    element.className =
      "day";


    element.textContent =
      day;


    if(data.attendance[key])
      element.classList.add(
        "attended"
      );


    const now =
      new Date();


    if(
      day === now.getDate() &&
      month === now.getMonth() &&
      year === now.getFullYear()
    ){

      element.classList.add(
        "today"
      );

    }


    element.onclick =
      function(){

        toggleAttendance(key);

      };


    calendar.appendChild(
      element
    );

  }


  updateAttendanceTotal();

}


function toggleAttendance(key){

  const today =
    new Date()
    .toISOString()
    .slice(0,10);


  if(key !== today){

    alert(
      "Attendance can only be marked for today."
    );

    return;

  }


  data.attendance[key] =
    !data.attendance[key];


  if(
    !data.attendance[key]
  ){

    delete data.attendance[key];

  }


  saveData();

  renderCalendar();

}


function changeMonth(number){

  calendarDate.setMonth(
    calendarDate.getMonth() +
    number
  );


  renderCalendar();

}


function updateAttendanceTotal(){

  const element =
    document.getElementById(
      "attendanceTotal"
    );


  if(element){

    element.textContent =
      Object.keys(
        data.attendance
      ).length;

  }

}


/* ================= REWARDS ================= */

function renderRewards(){

  const box =
    document.getElementById(
      "rewardsList"
    );


  if(!box)
    return;


  if(
    !data.purchased.length
  ){

    box.innerHTML = `

      <div class="reward-item">

        <b>
          No purchased products
        </b>

        <p>
          Select a product to
          see available rewards.
        </p>

      </div>

    `;

    return;

  }


  box.innerHTML =
    data.purchased
    .map(function(id){

      const product =
        products.find(
          item =>
          item.id === id
        );


      if(!product)
        return "";


      const today =
        new Date()
        .toISOString()
        .slice(0,10);


      const claimed =
        data.rewards.some(
          reward =>
          reward.productId === id &&
          reward.date === today
        );


      return `

        <div class="reward-item">

          <b>
            ${product.name}
          </b>

          <p>
            Daily Reward:
            ₹${product.daily}
          </p>


          ${
            claimed

            ?

            `<button
              class="secondary-btn"
              disabled>
              ✓ Claimed Today
            </button>`

            :

            `<button
              class="primary-btn"
              onclick="claimReward(${id})">
              Claim Reward
            </button>`
          }

        </div>

      `;

    })
    .join("");

}


function claimReward(id){

  const product =
    products.find(
      item =>
      item.id === id
    );


  if(
    !product ||
    !data.purchased.includes(id)
  )
    return;


  const today =
    new Date()
    .toISOString()
    .slice(0,10);


  if(
    data.rewards.some(
      reward =>
      reward.productId === id &&
      reward.date === today
    )
  ){

    alert(
      "Reward already claimed today."
    );

    return;

  }


  data.balance +=
    product.daily;


  data.rewards.push({

    productId:id,

    amount:product.daily,

    date:today

  });


  data.transactions.unshift({

    type:"Bonus",

    amount:product.daily,

    date:new Date()
      .toLocaleString()

  });


  saveData();

  updateUI();


  alert(
    "₹" +
    product.daily +
    " reward added."
  );

}


/* ================= DEPOSIT ================= */

function showDeposit(){

  openPage("deposit");

}


function copyUPI(){

  if(
    navigator.clipboard
  ){

    navigator.clipboard
      .writeText(UPI_ID)
      .then(
        function(){

          alert(
            "UPI ID copied: " +
            UPI_ID
          );

        }
      )
      .catch(
        fallbackCopyUPI
      );

  }

  else{

    fallbackCopyUPI();

  }

}


function fallbackCopyUPI(){

  const input =
    document.createElement(
      "input"
    );


  input.value =
    UPI_ID;


  document.body.appendChild(
    input
  );


  input.select();


  document.execCommand(
    "copy"
  );


  input.remove();


  alert(
    "UPI ID copied: " +
    UPI_ID
  );

}


function fileBase64(file){

  return new Promise(
    function(resolve,reject){

      const reader =
        new FileReader();


      reader.onload =
        function(){

          const result =
            String(
              reader.result
            );


          resolve(
            result.split(",")[1] ||
            ""
          );

        };


      reader.onerror =
        reject;


      reader.readAsDataURL(
        file
      );

    }
  );

}


async function submitDeposit(){

  const amount =
    Number(
      document
      .getElementById(
        "depositAmount"
      )
      ?.value || 0
    );


  const utr =
    document
    .getElementById("utr")
    ?.value
    .trim() || "";


  const file =
    document
    .getElementById(
      "paymentScreenshot"
    )
    ?.files?.[0];


  if(!authToken){

    logoutUser();

    return;

  }


  if(amount < 500){

    alert(
      "Minimum deposit is ₹500."
    );

    return;

  }


  if(amount > 20000){

    alert(
      "Maximum deposit is ₹20,000."
    );

    return;

  }


  if(!utr){

    alert(
      "Please enter UTR / Transaction ID."
    );

    return;

  }


  if(!file){

    alert(
      "Please select payment screenshot."
    );

    return;

  }


  if(
    file.size >
    3 * 1024 * 1024
  ){

    alert(
      "Screenshot must be 3 MB or smaller."
    );

    return;

  }


  const button =
    document.getElementById(
      "depositSubmitBtn"
    );


  button.disabled = true;

  button.textContent =
    "Submitting...";


  try{

    const imageBase64 =
      await fileBase64(file);


    const output =
      await apiPost({

        action:"createDeposit",

        token:authToken,

        userKey:
          (
            serverUser &&
            serverUser.userKey
          ) || "",

        amount:amount,

        utr:utr,

        imageBase64:
          imageBase64,

        imageName:
          file.name,

        imageType:
          file.type

      });


    const requestId =
      output.requestId;


    data.deposits.unshift({

      requestId:requestId,

      amount:amount,

      utr:utr,

      status:"PENDING",

      date:new Date()
        .toLocaleString()

    });


    data.transactions.unshift({

      type:"Deposit",

      amount:amount,

      status:"PENDING",

      date:new Date()
        .toLocaleString()

    });


    saveData();


    document
      .getElementById(
        "depositAmount"
      )
      .value = "";


    document
      .getElementById("utr")
      .value = "";


    document
      .getElementById(
        "paymentScreenshot"
      )
      .value = "";


    alert(
      "Deposit request sent. Admin verification ke baad balance update hoga."
    );


    updateUI();


    pollDeposit(
      requestId
    );

  }

  catch(error){

    console.error(error);

    alert(
      error.message ||
      "Deposit request send nahi hua."
    );

  }

  finally{

    button.disabled = false;

    button.textContent =
      "Submit Deposit Request";

  }

}


/* ================= DEPOSIT STATUS ================= */

async function pollDeposit(
  requestId
){

  let count = 0;


  const timer =
    setInterval(
      async function(){

        count++;


        try{

          const response =
            await fetch(
              API_URL +
              "?action=status&requestId=" +
              encodeURIComponent(
                requestId
              )
            );


          const output =
            await response.json();


          if(
            output.ok &&
            (
              output.status ===
              "APPROVED" ||

              output.status ===
              "REJECTED"
            )
          ){

            clearInterval(
              timer
            );


            const deposit =
              data.deposits.find(
                item =>
                item.requestId ===
                requestId
              );


            if(deposit){

              const oldStatus =
                deposit.status;


              deposit.status =
                output.status;


              deposit.reviewedAt =
                output.reviewedAt ||
                new Date()
                  .toLocaleString();


              if(
                oldStatus !==
                "APPROVED" &&
                output.status ===
                "APPROVED"
              ){

                data.balance +=
                  Number(
                    deposit.amount
                  );

              }


              data.transactions.unshift({

                type:"Deposit",

                amount:
                  Number(
                    deposit.amount
                  ),

                status:
                  output.status,

                date:
                  new Date()
                    .toLocaleString()

              });


              saveData();

              updateUI();


              alert(
                output.status ===
                "APPROVED"

                ?

                "Deposit approved. Balance updated."

                :

                "Deposit rejected."
              );

            }

          }

        }

        catch(error){

          // Keep polling.

        }


        if(count >= 120){

          clearInterval(
            timer
          );

        }

      },
      5000
    );

}


/* ================= WITHDRAWAL ================= */

function showWithdrawal(){

  openPage("withdraw");

}


async function submitWithdrawal(){

  const amount =
    Number(
      document
      .getElementById(
        "withdrawAmount"
      )
      ?.value || 0
    );


  const name =
    document
    .getElementById("bankName")
    ?.value
    .trim() || "";


  const account =
    document
    .getElementById(
      "accountNumber"
    )
    ?.value
    .trim() || "";


  const confirm =
    document
    .getElementById(
      "confirmAccount"
    )
    ?.value
    .trim() || "";


  const bank =
    document
    .getElementById("bank")
    ?.value
    .trim() || "";


  const ifsc =
    (
      document
      .getElementById("ifsc")
      ?.value
      .trim() || ""
    ).toUpperCase();


  if(!authToken){

    logoutUser();

    return;

  }


  if(amount < 300){

    alert(
      "Minimum withdrawal is ₹300."
    );

    return;

  }


  if(amount > 10000){

    alert(
      "Maximum withdrawal is ₹10,000."
    );

    return;

  }


  if(amount > data.balance){

    alert(
      "Insufficient balance."
    );

    return;

  }


  if(
    !name ||
    !account ||
    !confirm ||
    !bank ||
    !ifsc
  ){

    alert(
      "Please fill all bank details."
    );

    return;

  }


  if(account !== confirm){

    alert(
      "Account numbers do not match."
    );

    return;

  }


  if(
    !/^[A-Z]{4}0[A-Z0-9]{6}$/
      .test(ifsc)
  ){

    alert(
      "Invalid IFSC code."
    );

    return;

  }


  const button =
    document.getElementById(
      "withdrawSubmitBtn"
    );


  button.disabled = true;

  button.textContent =
    "Submitting...";


  try{

    const output =
      await apiPost({

        action:"createWithdrawal",

        token:authToken,

        userKey:
          (
            serverUser &&
            serverUser.userKey
          ) || "",

        amount:amount,

        holderName:name,

        accountNumber:account,

        bankName:bank,

        ifsc:ifsc

      });


    const requestId =
      output.requestId;


    data.balance -=
      amount;


    data.withdrawals.unshift({

      requestId:requestId,

      amount:amount,

      name:name,

      account:account,

      bank:bank,

      ifsc:ifsc,

      status:"PENDING",

      date:new Date()
        .toLocaleString()

    });


    data.transactions.unshift({

      type:"Withdrawal",

      amount:amount,

      status:"PENDING",

      date:new Date()
        .toLocaleString()

    });


    saveData();


    document
      .getElementById(
        "withdrawAmount"
      )
      .value = "";


    alert(
      "Withdrawal request sent. Admin payment ke baad status update hoga."
    );


    updateUI();


    pollWithdrawal(
      requestId
    );

  }

  catch(error){

    console.error(error);

    alert(
      error.message ||
      "Withdrawal request send nahi hua."
    );

  }

  finally{

    button.disabled = false;

    button.textContent =
      "Submit Withdrawal Request";

  }

}


/* ================= WITHDRAWAL STATUS ================= */

async function pollWithdrawal(
  requestId
){

  let count = 0;


  const timer =
    setInterval(
      async function(){

        count++;


        try{

          const response =
            await fetch(
              API_URL +
              "?action=withdrawalStatus&requestId=" +
              encodeURIComponent(
                requestId
              )
            );


          const output =
            await response.json();


          if(
            output.ok &&
            (
              output.status ===
              "PAID" ||

              output.status ===
              "REJECTED"
            )
          ){

            clearInterval(
              timer
            );


            const withdrawal =
              data.withdrawals.find(
                item =>
                item.requestId ===
                requestId
              );


            if(withdrawal){

              withdrawal.status =
                output.status;


              withdrawal.reviewedAt =
                output.reviewedAt ||
                new Date()
                  .toLocaleString();


              if(
                output.status ===
                "REJECTED"
              ){

                data.balance +=
                  Number(
                    withdrawal.amount
                  );

              }


              data.transactions.unshift({

                type:"Withdrawal",

                amount:
                  Number(
                    withdrawal.amount
                  ),

                status:
                  output.status,

                date:
                  new Date()
                    .toLocaleString()

              });


              saveData();

              updateUI();


              alert(

                output.status ===
                "PAID"

                ?

                "Withdrawal marked paid."

                :

                "Withdrawal rejected; amount returned to balance."

              );

            }

          }

        }

        catch(error){

          // Keep polling.

        }


        if(count >= 120){

          clearInterval(
            timer
          );

        }

      },
      5000
    );

}


/* ================= HISTORY ================= */

function renderWithdrawHistory(){

  const box =
    document.getElementById(
      "withdrawHistoryList"
    );


  if(!box)
    return;


  if(
    !data.withdrawals.length
  ){

    box.innerHTML =
      '<div class="card">No withdrawal history found.</div>';

    return;

  }


  box.innerHTML =
    data.withdrawals
    .map(
      function(item){

        return `

          <div class="history-item">

            <div>

              <b>
                Withdrawal
              </b>

              <p>
                ${item.date}
              </p>

              <small>
                Status:
                ${item.status}
              </small>

            </div>


            <div class="amount-red">

              -₹${money(item.amount)}

            </div>

          </div>

        `;

      }
    )
    .join("");

}


function renderDepositHistory(){

  const box =
    document.getElementById(
      "depositHistoryList"
    );


  if(!box)
    return;


  if(
    !data.deposits.length
  ){

    box.innerHTML =
      '<div class="card">No deposit history found.</div>';

    return;

  }


  box.innerHTML =
    data.deposits
    .map(
      function(item){

        return `

          <div class="history-item">

            <div>

              <b>
                Deposit
              </b>

              <p>
                ${item.date}
              </p>

              <small>
                UTR:
                ${item.utr}
              </small>

              <br>

              <small>
                Status:
                ${item.status}
              </small>

            </div>


            <div class="amount-green">

              +₹${money(item.amount)}

            </div>

          </div>

        `;

      }
    )
    .join("");

}


function renderTransactions(){

  const box =
    document.getElementById(
      "transactionList"
    );


  if(!box)
    return;


  if(
    !data.transactions.length
  ){

    box.innerHTML =
      '<div class="card">No transactions found.</div>';

    return;

  }


  box.innerHTML =
    data.transactions
    .map(
      function(item){

        const positive =
          item.type === "Deposit" ||
          item.type === "Bonus";


        return `

          <div class="history-item">

            <div>

              <b>
                ${item.type}
              </b>

              <p>
                ${item.date}
              </p>

              <small>
                Status:
                ${item.status ||
                "COMPLETED"}
              </small>

            </div>


            <div class="${
              positive
              ?
              "amount-green"
              :
              "amount-red"
            }">

              ${
                positive
                ? "+"
                : "-"
              }₹${money(item.amount)}

            </div>

          </div>

        `;

      }
    )
    .join("");

}


/* ================= OTHER ================= */

function customerService(){

  window.open(
    SUPPORT,
    "_blank"
  );

}


function inviteNow(){

  const text =
    encodeURIComponent(
      "Join NSG Wellfare"
    );


  window.open(
    "https://wa.me/?text=" +
    text,
    "_blank"
  );

}


function downloadApp(){

  alert(
    "App download link will be available here."
  );

}


function showModal(
  title,
  content
){

  document
    .getElementById(
      "modalTitle"
    )
    .textContent = title;


  document
    .getElementById(
      "modalContent"
    )
    .innerHTML = content;


  document
    .getElementById(
      "modal"
    )
    .classList
    .add("show");

}


function closeModal(){

  document
    .getElementById(
      "modal"
    )
    .classList
    .remove("show");

}


/* ================= UPDATE UI ================= */

function updateUI(){

  updateBalance();

  loadProducts();

  renderRewards();

  renderCalendar();

  renderWithdrawHistory();

  renderDepositHistory();

  renderTransactions();

}


/* ================= START ================= */

document.addEventListener(
  "DOMContentLoaded",
  function(){

    const savedUser =
      JSON.parse(
        localStorage.getItem(
          "nsgUser"
        ) || "null"
      );


    if(
      authToken &&
      savedUser
    ){

      serverUser =
        savedUser;

      openApp();

    }

    else{

      showAuth("login");

    }

  }
);
