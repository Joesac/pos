const ipc = require("electron").ipcRenderer;

const base_url = "http://localhost:3000";
const displaySearchResultsWrapper = $(".display-search-results-wrapper");
const txtSearch = $("#txtSearch");
const cart = $(".cart");
const tblCart = $("#tblCart");
const totalVal = $("#totalVal");
const btnChargeCash = $("#btnChargeCash");
const printCheckoutReceiptModal = $("#printCheckoutReceiptModal");
const amountCustomerPaidModal = $("#amountCustomerPaidModal");
const btnCancelAmountCustomerPaidModal = $("#btnCancelAmountCustomerPaidModal");
const btnCheckoutAmountCustomerPaid = $("#btnCheckoutAmountCustomerPaid");
const timestamp = $(".timestamp");
const btnPrintReceipt = $("#btnPrintReceipt");
const totalContainer = $(".total-container");
const btnClosePrintReceiptModal = $("#btnClosePrintReceiptModal");
const txtAmountReceived = $("#txtAmountReceived");
const btnNew = $("#btnNew");
const iconMenu = $("#iconMenu");
const btnMenuUser = $("#btnMenuUser");
const btnMenuProduct = $("#btnMenuProduct");
const sideBarMenuItem = $(".ui .item");
const innerPage = $(".inner-page");
const userPage = $(".user-page");
const productPage = $(".product-page");

let productsArrayTempStore = [];

// Showing Clock
setInterval(function() {
  timestamp.text(clock());
}, 1000);

// Show sidebar
iconMenu.click(function() {
  $(".sidebar").sidebar("toggle");
});

sideBarMenuItem.click(function() {
  innerPage.addClass("hide");
  $(".sidebar").sidebar("toggle");
});

// Showing User Page
const tblUsersListTbody = $("#tblUsersList tbody");
btnMenuUser.click(function() {
  userPage.removeClass("hide");
  let allUsers = "";
  $.get(`${base_url}/users`, resData => {
    if (resData.length) {
      for (i = 0; i < resData.length; i++) {
        allUsers += `<tr id="${resData[i]._id}"><td>${resData[i].fullname}</td><td>${resData[i].username}</td><td>${resData[i].password}</td><td>${resData[i].role}</td></tr>`;
      }
      tblUsersListTbody.html(allUsers);
    }
  });
});

// Adding a new User by showing the new User Modal
const addNewUserModal = $("#addNewUserModal")
const newUserFullname = $("#newUserFullname")
const newUserUsername = $("#newUserUsername")
const newUserPassword = $("#newUserPassword")
const newUserRole = $("#newUserRole")
let newUserObj = {}
$("#btnCreateNewUser").click(function() {
  addNewUserModal.modal('setting', 'closable', false).modal('show')
})

// Saving or Adding the new user
const btnSaveNewUser = $("#btnSaveNewUser")
btnSaveNewUser.click(function() {
  if (newUserFullname.val().trim() == '' || newUserUsername.val().trim() == '' || newUserPassword.val().trim() == '' || newUserRole.dropdown("get value").trim() == '') {
    return;
  }
  
  let $this = $(this)
  addNewUserModal.find('.form').addClass('loading')
  $this.addClass('loading')

  newUserObj.fullname = newUserFullname.val().trim()
  newUserObj.username = newUserUsername.val().trim()
  newUserObj.password = newUserPassword.val().trim()
  newUserObj.role = newUserRole.dropdown("get value")
  
  $.ajax({
    type: 'POST',
    url: `${base_url}/user`,
    contentType: 'application/json',
    data: JSON.stringify(newUserObj),
    dataType: 'json',
    success: function(res) {
      console.log(res)
      addNewUserModal.find('.form').removeClass('error').addClass('success')
    },
    error: function(err) {
      addNewUserModal.find('.form').removeClass('success').addClass('error').find('.message.error span').text(err.responseJSON.message)
    },
    complete: function() {
      addNewUserModal.find('.form').removeClass('loading')
      $this.removeClass('loading')
    }
  })
})

// Close New User modal
btnCancelNewUser = $("#btnCancelNewUser")
btnCancelNewUser.click(function() {
  addNewProductModal.modal("close")
})

// Showing the edit user modal
selectedUserObj = {};
const editUserModal = $("#editUserModal");
const editUserFullname = $("#editUserFullname");
const editUserUsername = $("#editUserUsername");
const editUserPassword = $("#editUserPassword");
const editUserRole = $("#editUserRole")
tblUsersListTbody.on("click", "tr", function() {
  const $this = $(this);
  selectedUserObj.id = $this.attr("id");
  selectedUserObj.fullname = $this.children("td:nth-child(1)").text();
  selectedUserObj.username = $this.children("td:nth-child(2)").text();
  selectedUserObj.password = $this.children("td:nth-child(3)").text();
  selectedUserObj.role = $this.children("td:nth-child(4)").text();

  saveProductEdit.attr("id", `save_${selectedUserObj.id}`);
  editUserFullname.val(selectedUserObj.fullname);
  editUserUsername.val(selectedUserObj.username);
  editUserPassword.val(selectedUserObj.password);
  editUserRole.val(selectedUserObj.role);
  editUserModal.modal({closable: false}).modal("show");
});

// Saving Edited User
const saveUserEdit = $(".saveUserEdit")
saveUserEdit.click(function() {
  let fn = editUserFullname.val().trim(),
    us = editUserUsername.val().trim(),
    ps = editUserUsername.val().trim(),
    rl = editUserRole.dropdown("get value").trim()
  $this = $(this)
  if (fn == "" ||  us == "" || ps == "" || rl == "") {
    return
  }

  editUserModal.find('.form').addClass('loading')
  $this.addClass('loading')

  selectedUserObj.fullname = fn;
  selectedUserObj.username = us;
  selectedUserObj.password = ps;
  selectedUserObj.role = rl;
  
  $.ajax({
    type: "POST",
    contentType: "application/json",
    url: `${base_url}/users/edit/${selectedUserObj.id}`,
    data: JSON.stringify(selectedUserObj),
    dataType: "json",
    success: function(res) {
      let formattedId = $this.attr('id').split("_")[1]
      let row = tblUsersListTbody.find(`tr#${formattedId}`)

      row.children("td:nth-child(1)").text(editPdtName.val())
      row.children("td:nth-child(2)").text(editPdtPrice.val())
      row.children("td:nth-child(3)").text(editPdtQty.val())
      row.children("td:nth-child(3)").text(editPdtQty.val())
      editUserModal.find('.form').addClass('success')
    },
    error: function(err) {
      editUserModal.find('.form').addClass('error')
    },
    complete: function() {
      editUserModal.find('.form').removeClass('loading')
      $this.removeClass('loading')
    }
  });
});

// Showing Product Page
const tblProductsListTbody = $("#tblProductsList tbody");
btnMenuProduct.click(function() {
  productPage.removeClass("hide");
  let allProducts = "";
  $.get(`${base_url}/products`, resData => {
    if (resData.length) {
      for (i = 0; i < resData.length; i++) {
        allProducts += `<tr id="${resData[i]._id}"><td>${resData[i].name}</td><td>${resData[i].price}</td><td>${resData[i].qty}</td></tr>`;
      }
      tblProductsListTbody.html(allProducts);
    }
  });
});

// Clicking on All Products Individual rows
selectedProductObj = {};
const editProductModal = $("#editProductModal");
const saveProductEdit = $(".saveProductEdit")
const editPdtName = $("#editPdtName");
const editPdtPrice = $("#editPdtPrice");
const editPdtQty = $("#editPdtQty");
tblProductsListTbody.on("click", "tr", function() {
  const $this = $(this);
  selectedProductObj.id = $this.attr("id");
  selectedProductObj.name = $this.children("td:nth-child(1)").text();
  selectedProductObj.price = $this.children("td:nth-child(2)").text();
  selectedProductObj.qty = $this.children("td:nth-child(3)").text();

  saveProductEdit.attr("id", `save_${selectedProductObj.id}`);
  editPdtName.val(selectedProductObj.name);
  editPdtPrice.val(selectedProductObj.price);
  editPdtQty.val(selectedProductObj.qty);
  editProductModal.modal({closable: false}).modal("show");
});

// Saving Edited Product
saveProductEdit.click(function() {
  $this = $(this)
  if (editPdtName.val() == "" ||  editPdtPrice.val() == "" || editPdtQty.val() == "") {
    return
  }

  editProductModal.find('.form').addClass('loading')
  $this.addClass('loading')

  selectedProductObj.name = editPdtName.val();
  selectedProductObj.price = editPdtPrice.val();
  selectedProductObj.qty = editPdtQty.val();

  $.ajax({
    type: "POST",
    contentType: "application/json",
    url: `${base_url}/products/edit/${selectedProductObj.id}`,
    data: JSON.stringify(selectedProductObj),
    dataType: "json",
    success: function(res) {
      let formattedId = $this.attr('id').split("_")[1]
      let pdtRow = tblProductsListTbody.find(`tr#${formattedId}`)

      pdtRow.children("td:nth-child(1)").text(editPdtName.val())
      pdtRow.children("td:nth-child(2)").text(editPdtPrice.val())
      pdtRow.children("td:nth-child(3)").text(editPdtQty.val())
      editProductModal.find('.form').addClass('success')
    },
    error: function(err) {
      editProductModal.find('.form').addClass('error')
    },
    complete: function() {
      editProductModal.find('.form').removeClass('loading')
      $this.removeClass('loading')
    }
  });
});

// Closing the Edit Modal
const btnCloseEditPdtModal = $("#btnCloseEditPdtModal")
btnCloseEditPdtModal.click(function() {
  editProductModal.modal("close")
})

// Hidding either success or error message when typing in any of the add create new textboxes
$("#editPdtName, #editPdtPrice, #editPdtQty").keydown(function() {
  editProductModal.find('.form').removeClass('error success')
})

// Adding a new Product
const addNewProductModal = $("#addNewProductModal")
const newPdtName = $("#newPdtName")
const newPdtPrice = $("#newPdtPrice")
const newPdtQty = $("#newPdtQty")
let newProductObj = {}
$("#btnCreateNewPdt").click(function() {
  addNewProductModal.modal('setting', 'closable', false).modal('show')
})

// Close New Product modal
const btnCancelNewProduct = $("#btnCancelNewProduct")
btnCancelNewProduct.click(function() {
  addNewProductModal.modal("close")
})

// Hidding either success or error message when typing in any of the add create new textboxes
$("#newPdtName, #newPdtPrice, #newPdtQty").keydown(function() {
  addNewProductModal.find('.form').removeClass('error success')
})

// Saving the New Product
const btnSaveNewProduct = $("#btnSaveNewProduct")
btnSaveNewProduct.click(function() {
  if (newPdtName.val().trim() == '' || newPdtPrice.val().trim() == '') {
    return;
  }
  
  let $this = $(this)
  addNewProductModal.find('.form').addClass('loading')
  $this.addClass('loading')

  newProductObj.name = newPdtName.val().trim()
  newProductObj.price = newPdtPrice.val().trim()
  newProductObj.qty = newPdtQty.val().trim() || 0

  $.ajax({
    type: 'POST',
    url: `${base_url}/product`,
    contentType: 'application/json',
    data: JSON.stringify(newProductObj),
    dataType: 'json',
    success: function(res) {
      addNewProductModal.find('.form').removeClass('error').addClass('success')
    },
    error: function(err) {
      addNewProductModal.find('.form').removeClass('success').addClass('error').find('.message.error span').text(err.responseJSON.message)
    },
    complete: function() {
      addNewProductModal.find('.form').removeClass('loading')
      $this.removeClass('loading')
    }
  })
})

// Searching for a product on Current Products page
const txtProductSearch = $("#txtProductSearch")
txtProductSearch.keyup(function() {
  let allProducts = "",
      searchTerm = $(this).val().trim();

  $.get(`${base_url}/search/products`, { searchTerm }, resData => {
    if (resData.length) {
      productsArrayTempStore = resData;
      for (i = 0; i < resData.length; i++) {
        allProducts += `<tr id="${resData[i]._id}"><td>${resData[i].name}</td><td>${resData[i].price}</td><td>${resData[i].qty}</td></tr>`;
      }
      tblProductsListTbody.html(allProducts);
    }
  });
})

$("#btnMenuSell").click(function() {
  innerPage.addClass("hide");
  $(".sidebar").sidebar("toggle");
})


// Searching for a product to sell
txtSearch.keyup(function() {
  let searchedProducts = "",
    searchTerm = $(this).val().trim();

  if (searchTerm == "") {
    displaySearchResultsWrapper.html("<h2>Nothing Searched for yet</h2")
    return
  }

  $.get(`${base_url}/search/products`, { searchTerm }, resData => {
    if (resData.length == 0) {
        displaySearchResultsWrapper.html("<h2>Nothing found</h2")
        return
    }
    
    productsArrayTempStore = resData;
    for (i = 0; i < resData.length; i++) {
      searchedProducts += `<button class="ui button blue product-item" id="${i}">
      <p>${resData[i].name}</p>
      <p>GHC${resData[i].price}</p>
      </button>`;
    }
    displaySearchResultsWrapper.html(searchedProducts);
    
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
  totalVal
    .children("h3")
    .text("GHC" + formatNumberToCurrencyFormat(sumTotal.toFixed(2)));

  // Set forcus to the searchbox
  txtSearch.focus();
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
  totalVal
    .children("h3")
    .text("GHC" + formatNumberToCurrencyFormat(sumTotal.toFixed(2)));
});

// Removing item from Cart
tblCart.on("click", ".trash-btn", function() {
  $(this)
    .closest("tr")
    .remove();
  let tds = tblCart.find("td.pdt-item-total");
  let sumTotal = sumAllCartItems(tds);
  totalVal
    .children("h3")
    .text("GHC" + formatNumberToCurrencyFormat(sumTotal.toFixed(2)));
});

// Clicking on Cash Charge Button
btnChargeCash.on("click", function() {
  amountCustomerPaidModal
    .modal({ transition: "horizontal flip", closable: false })
    .modal("show");
});

// Cancel Cash Charge Modal
btnCancelAmountCustomerPaidModal.click(function() {
  amountCustomerPaidModal.modal("close");
  console.log("k");
});

// Charging by Cash
let productsResData;
btnCheckoutAmountCustomerPaid.on("click", function() {
  if (Number(txtAmountReceived.val() - Number(totalVal.text()) < 0)) {
    alert("Amount received is smaller than amount Due");
    return false;
  }

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

  dataToSend.products = productsPurchasedArray;
  dataToSend.amountReceived = txtAmountReceived.val();
  dataToSend.paymentType = "cash";

  $.ajax({
    type: "POST",
    contentType: "application/json",
    url: `${base_url}/checkout/`,
    data: JSON.stringify(dataToSend),
    dataType: "json",
    success: function(res) {
      console.log(res);
      productsResData = res;
      printCheckoutReceiptModal
        .modal({ transition: "horizontal flip", closable: false })
        .modal("show");
    },
    error: function(e) {
      alert(e.message);
    }
  });
});

// Printing Receipt
btnPrintReceipt.click(function() {
  console.log("Printing receipt...");
  console.log(cart, totalContainer, txtAmountReceived.val());
  data = {};
  printCheckoutReceiptModal.modal("close");

  ipc.send("prepare-receipt-print", productsResData);
});

// Clicking on new Sale Button
// reset the amount received textbox
btnNew.click(function() {
  txtAmountReceived.val("");
  cart.find("tbody").empty();
  totalVal.children("h3").text("GHC0.00");
});

// Hiding Print Receipt Modal
btnClosePrintReceiptModal.click(function() {
  printCheckoutReceiptModal.modal("close");
});

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
  var date =
    today.getDate() + "-" + (today.getMonth() + 1) + "-" + today.getFullYear();
  var time = showAMPM(
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
  );
  return date + " " + time;
}

function showAMPM(time) {
  splitTime = time.split(":");
  hour = splitTime[0];
  minute = splitTime[1];
  second = splitTime[2];
  ampm = "PM";

  if (minute.length < 2) minute = "0" + minute;
  if (second.length < 2) second = "0" + second;

  if (hour < 12) {
    ampm = "AM";
  }
  let moduloTime = hour % 12;

  if (moduloTime == 0) {
    hour = "12";
  } else {
    if (moduloTime < 12) {
      hour = moduloTime;
    } else {
      return hour;
    }
  }

  return hour + ":" + minute + ":" + second + ampm;
}
