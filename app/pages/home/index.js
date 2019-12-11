const ipc = require('electron').ipcRenderer

const base_url = "http://localhost:3000";
const displaySearchResultsWrapper = $(".display-search-results-wrapper");
const txtSearch = $("#txtSearch");
const cart = $(".cart");
const tblCart = $("#tblCart");
const totalVal = $("#totalVal");
const btnChargeCash = $("#btnChargeCash");
const printCheckoutReceiptModal = $("#printCheckoutReceiptModal")
const amountCustomerPaidModal = $("#amountCustomerPaidModal")
const btnCancelAmountCustomerPaidModal = $("#btnCancelAmountCustomerPaidModal")
const btnCheckoutAmountCustomerPaid = $("#btnCheckoutAmountCustomerPaid")
const timestamp = $(".timestamp")
const btnPrintReceipt = $("#btnPrintReceipt")
const totalContainer = $('.total-container')
const btnClosePrintReceiptModal = $("#btnClosePrintReceiptModal")
const txtAmountReceived = $("#txtAmountReceived")
const btnNew = $("#btnNew")

let productsArrayTempStore = [];

// Showing Clock
setInterval(function() {
    timestamp.text(clock())
}, 1000)

// Searching for a product to sell
txtSearch.keyup(function() {
  let searchedProducts = "",
    searchTerm = $(this)
      .val()
      .trim();

  $.get(`${base_url}/search/products`, { searchTerm }, resData => {
    if (resData.length) {
      productsArrayTempStore = resData;
      for (i = 0; i < resData.length; i++) {
        searchedProducts += `<button class="ui button blue product-item" id="${i}">
        <p>${resData[i].name}</p>
        <p>GHC ${resData[i].price}</p>
        </button>`;
      }
      displaySearchResultsWrapper.html(searchedProducts);
    }
  });
});

// Adding a searched product to Cart
displaySearchResultsWrapper.on("click", ".product-item", function() {
  let productToAppend = "";
  let id = $(this).attr("id");
  let rowId = `pdt_${productsArrayTempStore[id]._id}`;
  if (checkCartContainsProduct(rowId)) {
    cart.find(`tr#${rowId}`).addClass("red");
    return;
  }
  cart.find(`tr`).removeClass("red");

  productToAppend += `<tr id="${rowId}"><td>${productsArrayTempStore[id].name}</td><td>`;
  productToAppend +=
    '<div class="ui mini input"><input type="text" value="1" class="pdt-item-qty"></div>';
  productToAppend += `</td><td class="pdt-item-price">${productsArrayTempStore[id].price}</td><td class="pdt-item-total">${productsArrayTempStore[id].price}</td><td>`;
  productToAppend += `<button class="ui circular google plus icon button trash-btn"><i id="trush_${productsArrayTempStore[id]._id}" class="icon trash alternate outline"></i></button>`;
  productToAppend += "</td></tr>";
  cart.find("tbody").append(productToAppend);

  let tds = tblCart.find("td.pdt-item-total");
  let sumTotal = sumAllCartItems(tds);
  totalVal.text(formatNumberToCurrencyFormat(sumTotal.toFixed(2)));
});

// Allowing only Numbers
tblCart.on("keydown", ".pdt-item-qty", function(evt) {
  acceptOnlyNumbers(evt);
});

// Changing Quantity
tblCart.on("keyup", ".pdt-item-qty", function() {
  const $this = $(this);
  myValue = $this.val();

  if (myValue === "") {
    myValue = 1;
  }

  $this
    .closest("td")
    .siblings(".pdt-item-total")
    .text(
      formatNumberToCurrencyFormat(
        (
          myValue *
          Number.parseFloat(
            $this
              .closest("td")
              .siblings(".pdt-item-price")
              .text()
          )
        ).toFixed(2)
      )
    );

  let tds = tblCart.find("td.pdt-item-total");
  let sumTotal = sumAllCartItems(tds);
  totalVal.text(formatNumberToCurrencyFormat(sumTotal.toFixed(2)));
});

// Removing item from Cart
tblCart.on("click", ".trash-btn", function() {
  $(this)
    .closest("tr")
    .remove();
  let tds = tblCart.find("td.pdt-item-total");
  let sumTotal = sumAllCartItems(tds);
  totalVal.text(formatNumberToCurrencyFormat(sumTotal.toFixed(2)));
});

// Clicking on Cash Charge Button
btnChargeCash.on("click", function() {
    amountCustomerPaidModal.modal({'transition': 'horizontal flip', 'closable': false}).modal('show')
})

// Cancel Cash Charge Modal
btnCancelAmountCustomerPaidModal.click(function() {
    amountCustomerPaidModal.modal('close')
    console.log("k")
})

// Charging by Cash
let productsResData;
btnCheckoutAmountCustomerPaid.on("click", function() {
  let allProductsDetails = tblCart.find("tbody tr");
  let productsPurchasedArray = [];
  let dataToSend = {};

  $.each(allProductsDetails, function(index, item) {
    let tds = $(this).children("td"),
      productPurchased = {};
    productPurchased.name = tds.eq(0).text();
    productPurchased.qty = tds.find(".pdt-item-qty").val();
    productPurchased.price = $(this)
      .find(".pdt-item-price")
      .text();

    productsPurchasedArray.push(productPurchased);
  });

  dataToSend.products = productsPurchasedArray
  dataToSend.amountReceived = txtAmountReceived.val()
  dataToSend.paymentType = 'cash'

  $.ajax({
    type: "POST",
    contentType: "application/json",
    url: `${base_url}/checkout/`,
    data: JSON.stringify(dataToSend),
    dataType: "json",
    success: function(res) {
      console.log(res)
      productsResData = res
      printCheckoutReceiptModal.modal({'transition': 'horizontal flip', 'closable': false}).modal('show')
    },
    error: function(e) {
      alert(e.message);
    }
  });
});

// Printing Receipt
btnPrintReceipt.click(function() {
    console.log("Printing receipt...")
    console.log(cart, totalContainer, txtAmountReceived.val())
    data = {}
    printCheckoutReceiptModal.modal("close")
    
    ipc.send('prepare-receipt-print', productsResData)
})

// Clicking on new Sale Button
// reset the amount received textbox
btnNew.click(function() {
  txtAmountReceived.val("")
  cart.find("tbody").empty()
  totalVal.text('0.00')
})

// Hiding Print Receipt Modal
btnClosePrintReceiptModal.click(function() {
    printCheckoutReceiptModal.modal("close")
})

// Functions
function sumAllCartItems(tds) {
  let total = 0;
  let commanSeparatedNumber = 0;
  $.each(tds, function(index, ele) {
    commanSeparatedNumber = ele.textContent.replace(/,/g, "");
    total += Number(commanSeparatedNumber);
  });
  return total;
}

function checkCartContainsProduct(id) {
  let foundProduct = tblCart.find(`tr#${id}`);

  if (!foundProduct.length) {
    return false;
  }
  return true;
}

function acceptOnlyNumbers(e) {
  var key = e.which || e.keyCode;
  var counter = 0;
  var value = e.target.innerHTML.trim() || e.target.value;

  if (
    !(
      (!e.shiftKey &&
        !e.altKey &&
        !e.ctrlKey &&
        // numbers
        key >= 48 &&
        key <= 57) ||
      // Numeric keypad
      (key >= 96 && key <= 105) ||
      // Backspace
      key == 8 ||
      // Home and End
      key == 35 ||
      key == 36 ||
      // left and right arrows
      key == 37 ||
      key == 39 ||
      // Del and Tab
      key == 46 ||
      key == 9
    )
  ) {
    e.preventDefault();
  }

  if (value) {
    for (let i = 0; i < value.length; i++) {
      if (value[i] == ".") {
        counter++;
      }
    }
  }

  if (counter > 0 && (key == 110 || key == 190)) {
    e.preventDefault();
  }
}

function formatNumberToCurrencyFormat(number, total = false) {
  let numString = number.toString().split(".")[0],
    decimalPart = number.toString().split(".")[1],
    reversedNum = numString
      .split("")
      .reverse()
      .join()
      .replace(/,/gi, ""),
    tempReversedNum = "";

  for (let i = 0; i < reversedNum.length; i++) {
    if (i % 3 === 0 && i !== 0) {
      tempReversedNum += ",";
    }
    tempReversedNum += reversedNum[i];
  }

  let tempCorrectedNum = "";
  for (let i = tempReversedNum.length - 1; i >= 0; i--) {
    tempCorrectedNum += tempReversedNum[i];
  }

  return tempCorrectedNum + "." + decimalPart;
}

function clock() {
    var today = new Date();
    var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
    var time = showAMPM(today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds());
    return date+' '+time;
}

function showAMPM(time) {
    splitTime = time.split(':')
    hour = splitTime[0]
    minute = splitTime[1]
    second = splitTime[2]

    if (minute.length < 2) minute = '0' + minute
    if (second.length < 2) second = '0' + second
    if (hour == 0) return 12 + ':' + minute + ':' + second + 'AM'

    let moduloTime = hour % 12
    if (moduloTime < 12) {
      if (moduloTime.toString().length < 2) {
        moduloTime = '0' + moduloTime
      } else {
        moduloTime = 12
      }
        return moduloTime + ':' + minute + ':' + second + 'PM'
    } else {
        return hour + ':' + minute + ':' + second + 'AM'
    }
}
