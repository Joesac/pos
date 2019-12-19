const ipc = require("electron").ipcRenderer;

const base_url = "http://localhost:3000";
const displaySearchResultsWrapper = $(".display-search-results-wrapper");
const txtSearch = $("#txtSearch");
const cart = $(".cart");
const tblCart = $("#tblCart");
const totalVal = $("#totalVal");
const btnChargeCash = $("#btnChargeCash");
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
const menuBars = $("#menuBars");
const btnMenuUser = $("#btnMenuUser");
const btnMenuProduct = $("#btnMenuProduct");
const btnMenuReport = $("#btnMenuReport");
const btnMenuReceipt = $("#btnMenuReceipt");
const sideBarMenuItem = $(".ui .item");
const innerPage = $(".inner-page");
const userPage = $(".user-page");
const productPage = $(".product-page");
const reportPage = $(".report-page");
const receiptPage = $(".receipt-page");

let productsArrayTempStore = [];

/** LOGIN SCRIPT  */
const loginPage = $(".login-page")
const loginFormWrapper = $(".login-form-wrapper")
const loginForm = loginFormWrapper.find(".form")
const btnLogin = $("#btnLogin")
const txtLoginUsername = $("#txtloginUsername")
const txtLoginPassword = $("#txtLoginPassword")
const displayUsername = $("#displayUsername")
const btnLogout = $("#btnLogout")
btnLogin.click(function() {
  loginForm.removeClass("success error").addClass("loading")
  Login(txtLoginUsername.val().trim(), txtLoginPassword.val().trim())
})

// Hiding the success or error message on typing in the textboxes
loginForm.find("input").keyup(function() {
  loginForm.removeClass("success error")
})

// Check if logged in
ipc.send("isLoggedIn")

ipc.on("isLoggedInBoolean", (evt, data) => {
  if (!!localStorage.getItem("loggedInUserData")) {
    displayUsername.text(getUsername())
    loginPage.addClass("hide")
  }

  hideShowMenuBars(getRole())
})

function Login(username, password) {
  let loginDetails = { username: username, password: password }
  $.ajax({
    type: 'POST',
    contentType: 'application/json',
    url: `${base_url}/login`,
    data: JSON.stringify(loginDetails),
    dataType: 'json',
    success: function(res) {
      if (res != null) {
        localStorage.setItem('loggedInUserData', JSON.stringify(res))
        displayUsername.text(getUsername())
        loginPage.addClass("hide")
        txtLoginUsername.val("")
        txtLoginPassword.val("")
        hideShowMenuBars(getRole())
        return
      }
      loginForm.addClass("error")
    },
    error: function(err) {
      loginForm.addClass("error")
    },
    complete: function() {
      loginForm.removeClass("loading")
    }
  })  
}

function getUsername() {
  return JSON.parse(localStorage.getItem("loggedInUserData")).username
}

function getRole() {
  return JSON.parse(localStorage.getItem("loggedInUserData")).role
}

function hideShowMenuBars(role) {
  if (getRole() != 'admin') {
    menuBars.addClass("hide")
  } else {
    menuBars.removeClass("hide")
  }
}

btnLogout.click(function() {
  localStorage.removeItem("loggedInUserData")
  loginPage.removeClass("hide")
  innerPage.addClass("hide")
})
/** END LOGIN SCRIPT */

/** REPORT PAGE */
const reportDisplayContainer = $(".report-display-container")
const btnSearchReport = $("#btnSearchReport")
const dt = $("#dt")
const df = $("#df")
const tblProductsSoldListTbody = $("#tblProductsSoldList tbody")
const btnPrintReceiptOnPlatform = $("#btnPrintReceiptOnPlatform")

// Initialize date picker
$('#df').calendar({
  type: 'date',
  endCalendar: dt
});

$('#dt').calendar({
  type: 'date',
  startCalendar: df 
});

btnMenuReport.click(function() {
  innerPage.addClass("hide");
  reportPage.removeClass("hide");
})

btnSearchReport.click(function() {
  $.ajax({
    type: 'POST',
    dataType: 'json',
    url: `${base_url}/report/search`,
    data: JSON.stringify({df: df.find("input").val(), dt: dt.find("input").val()}),
    contentType: 'application/json',
    success: function(res) {
      let pdsAndQuantitiesSold = calculate(filterSales(res))
      let allPdtsSold;
      for (i = 0; i < pdsAndQuantitiesSold.length; i++) {
        allPdtsSold += `<tr><td>${pdsAndQuantitiesSold[i].pdt.element.name}</td><td>${pdsAndQuantitiesSold[i].pdt.qtyAccumulator}</td><td>GHC${ formatNumberToCurrencyFormat((pdsAndQuantitiesSold[i].pdt.element.price * pdsAndQuantitiesSold[i].pdt.qtyAccumulator).toFixed(2)) }</td></tr>`;
      }
      tblProductsSoldListTbody.html(allPdtsSold);
    },
    error: function(err) {
      console.log(err.message)
    },
    complete: function() {

    }
  })
})

function filterSales(saleO) {
  let filteredProducts = []

  for (let i = 0; i < saleO.length; i++) {
    const element = saleO[i];
    for (let j = 0; j < element.sale.products.length; j++) {
      const salePdts = element.sale.products[j];
      salePdts.date = element.dateAdded
      filteredProducts.push(salePdts)
    }
  }
  sortedProductsObjs = filteredProducts.sort(compare)
  return sortedProductsObjs
}

function calculate(sortedProductsObjs) {
  let qtyAccumulator = 0
  let revisedPdtAryObj = []
  let justCounted = ''
  
  for (let i = 0; i < sortedProductsObjs.length; i++) {
    const element = sortedProductsObjs[i];
    if (justCounted == element.name) continue
    let revisedPdtsObj = {}
    
    for (let j = i; j < sortedProductsObjs.length; j++) {
      const item = sortedProductsObjs[j];
      if (item.name == element.name) {
        qtyAccumulator += sortedProductsObjs[j].qty
      }
    }
    
    revisedPdtsObj.pdt = {element, qtyAccumulator}
    revisedPdtAryObj.push(revisedPdtsObj)
    justCounted = element.name
    qtyAccumulator = 0
  }
  return revisedPdtAryObj
}

function compare(a, b) {
  const productsObjA = a.name.toUpperCase();
  const productsObjB = b.name.toUpperCase();

  let comparison = 0;
  if (productsObjA > productsObjB) {
    comparison = 1;
  } else if (productsObjA < productsObjB) {
    comparison = -1;
  }
  return comparison;
}
/** END REPORT */

/** RECEIPT PAGE */
const searchContainer = $(".search-container")
const receiptDF = $("#receiptDf")
const btnSearchReceipt = $("#btnSearchReceipt")
const listOfReceipts = $(".list-of-receipts")
receiptDF.calendar({
  type: 'date'
})

btnMenuReceipt.click(function() {
  innerPage.addClass("hide");
  receiptPage.removeClass("hide");
})

let retrievedCheckouts = []
let receiptCurrentlyViewed = []
btnSearchReceipt.click(function() {
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: `${base_url}/receipt-numbers/${searchContainer.find("input").val()}`,
    contentType: 'application/json',
    success: function(res) {
      retrievedCheckouts = res
      let receiptDates = ''
      let date;
      for (let i = 0; i < res.length; i++) {
        date = new Date(res[i].timestamp)
        let dt = date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear()
        var time = showAMPM(date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds());
        receiptDates += `<div class="receiptTimestamps" id='${res[i].timestamp}'>${dt} ${time}</div>`
      }
      listOfReceipts.html(receiptDates)
    },
    error: function(err) {
      console.log(err.message)
    },
    complete: function() {

    }
  })
})

// Clicking on each of the receipt dates
listOfReceipts.on("click", ".receiptTimestamps", function() {
  if (!retrievedCheckouts.length) return

  let $this = $(this)
  let id = $this.attr('id')
  let foundCheckout;

  $this.addClass('selected').siblings().removeClass('selected')

  for (let i = 0; i < retrievedCheckouts.length; i++) {
    if (retrievedCheckouts[i].timestamp == id) {
      foundCheckout = retrievedCheckouts[i]
      receiptCurrentlyViewed = foundCheckout
      i = retrievedCheckouts.length
    }
  }
  
    const tbodyProducts = $(".table-checkout-products tbody")
    let dataToAppend = '';
    let sumTotal = 0;
    let sale = foundCheckout.sale;
    const totalVal = $("#ReceiptTotalVal")
    const amountReceived = $(".amountReceived")
    const changeGiven = $(".changeGiven")
    const timeStamp = $("#timestamp")
    const user = $("#user")
    const billNo = $("#billNo")
    
    for (let i = 0; i < sale.products.length; i++) {
        const item = sale.products[i];
        let amount = item.price * item.qty
        sumTotal += amount
        dataToAppend += `<tr><td>${item.name}</td>`
        dataToAppend += `<td>${item.qty}</td>`
        dataToAppend += `<td>${item.price}</td>`
        dataToAppend += `<td>${amount.toFixed(2)}</td></tr>`
    }
    tbodyProducts.html(dataToAppend)
    totalVal.empty().append(sumTotal.toFixed(2))
    amountReceived.text(sale.amountReceived.toFixed(2))
    changeGiven.text((Number(sale.amountReceived) - Number(sumTotal)).toFixed(2))
    user.text(sale.seller)
    billNo.text(sale.receiptNumber)
    timeStamp.text(convertTimeStampToHRT(foundCheckout.timestamp))

})

const actualReceiptPlatform = $(".actual-receipt-platform")
btnPrintReceiptOnPlatform.click(function() {
  ipc.send("prepare-receipt-print", receiptCurrentlyViewed);
})

function convertTimeStampToHRT(timestamp) {
  today = new Date(timestamp)
  let date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
  let time = showAMPM(today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds());
  return date+' '+time;
}
/** END RECEIPT PAGE */

// Showing Clock
setInterval(function() {
  timestamp.text(clock());
}, 1000);

// Show sidebar
menuBars.click(function() {
  $(".sidebar").sidebar("toggle");
});

sideBarMenuItem.click(function() {
  $(".sidebar").sidebar("toggle");
});

// Showing User Page
const tblUsersListTbody = $("#tblUsersList tbody");
btnMenuUser.click(function() {
  innerPage.addClass("hide");
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
const saveUserEdit = $(".saveUserEdit")
tblUsersListTbody.on("click", "tr", function() {
  const $this = $(this);
  selectedUserObj.id = $this.attr("id");
  selectedUserObj.fullname = $this.children("td:nth-child(1)").text();
  selectedUserObj.username = $this.children("td:nth-child(2)").text();
  selectedUserObj.password = $this.children("td:nth-child(3)").text();
  selectedUserObj.role = $this.children("td:nth-child(4)").text();

  saveUserEdit.attr("id", `save_${selectedUserObj.id}`);
  editUserFullname.val(selectedUserObj.fullname);
  editUserUsername.val(selectedUserObj.username);
  editUserPassword.val(selectedUserObj.password);
  editUserRole.dropdown(`set selected`,selectedUserObj.role);
  editUserModal.modal({closable: false}).modal("show");
});

// Saving Edited User
saveUserEdit.click(function() {
  let fn = editUserFullname.val().trim(),
    us = editUserUsername.val().trim(),
    ps = editUserPassword.val().trim(),
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
      row.children("td:nth-child(1)").text(fn)
      row.children("td:nth-child(2)").text(us)
      row.children("td:nth-child(3)").text(ps)
      row.children("td:nth-child(4)").text(rl)
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

// Hidding either success or error message when typing in any of the add create new User textboxes
$("#newUserFullname, #newUserUsername, #newUserPassword").keydown(function() {
  addNewUserModal.find('.form').removeClass('error success')
})
$("#newUserRole").dropdown({
  onChange: function() {
    addNewUserModal.find('.form').removeClass('error success')
  }
})

// Hidding either success or error message when typing in any of the Edit User textboxes
$("#editUserFullname, #editUserUsername, #editUserPassword").keydown(function() {
  editUserModal.find('.form').removeClass('error success')
})
$("#editUserRole").dropdown({
  onChange: function() {
    editUserModal.find('.form').removeClass('error success')
  }
})

// Searching for a User on User Page
$("#txtUserSearch").keyup(function() {
  let allUsers = "",
    searchTerm = $(this).val().trim();

  $.get(`${base_url}/search/users`, { searchTerm }, resData => {
    if (!resData.length) {
      allUsers = resData
    } else {
      for (i = 0; i < resData.length; i++) {
        allUsers += `<tr id="${resData[i]._id}"><td>${resData[i].fullname}</td><td>${resData[i].username}</td><td>${resData[i].password}</td><td>${resData[i].role}</td></tr>`;
      }
    }
    tblUsersListTbody.html(allUsers);
  });
})

// Showing Product Page
const tblProductsListTbody = $("#tblProductsList tbody");
btnMenuProduct.click(function() {
  innerPage.addClass("hide");
  productPage.removeClass("hide");
  let allProducts = "";
  $.get(`${base_url}/products`, resData => {
    if (resData.length) {
      for (i = 0; i < resData.length; i++) {
        allProducts += `<tr id="${resData[i]._id}"><td>${resData[i].name}</td><td>${resData[i].price}</td><td>${resData[i].qty}</td><td`
        if (resData[i].qty < resData[i].reorderLevel) {
          allProducts += ` class="reorder-level-reached" `
        }
        allProducts += `>${resData[i].reorderLevel}</td></tr>`
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
const editPdtReorderLevel = $("#editPdtReorderLevel");
tblProductsListTbody.on("click", "tr", function() {
  const $this = $(this);
  selectedProductObj.id = $this.attr("id");
  selectedProductObj.name = $this.children("td:nth-child(1)").text();
  selectedProductObj.price = $this.children("td:nth-child(2)").text();
  selectedProductObj.qty = $this.children("td:nth-child(3)").text();
  selectedProductObj.reorderLevel = $this.children("td:nth-child(4)").text();

  saveProductEdit.attr("id", `save_${selectedProductObj.id}`);
  editPdtName.val(selectedProductObj.name);
  editPdtPrice.val(selectedProductObj.price);
  editPdtQty.val(selectedProductObj.qty);
  editPdtReorderLevel.val(selectedProductObj.reorderLevel);
  editProductModal.modal({closable: false}).modal("show");
});

// Saving Edited Product
saveProductEdit.click(function() {
  $this = $(this)
  if (editPdtName.val() == "" ||  editPdtPrice.val() == "" || editPdtQty.val() == "" || editPdtReorderLevel.val() == "") {
    return
  }

  editProductModal.find('.form').addClass('loading')
  $this.addClass('loading')

  selectedProductObj.name = editPdtName.val();
  selectedProductObj.price = editPdtPrice.val();
  selectedProductObj.qty = editPdtQty.val();
  selectedProductObj.reorderLevel = editPdtReorderLevel.val();

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
      pdtRow.children("td:nth-child(4)").text(editPdtReorderLevel.val())
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

// Hidding either success or error message when typing in any of the add or create new product textboxes
$("#editPdtName, #editPdtPrice, #editPdtQty").keydown(function() {
  editProductModal.find('.form').removeClass('error success')
})

// Adding a new Product
const addNewProductModal = $("#addNewProductModal")
const newPdtName = $("#newPdtName")
const newPdtPrice = $("#newPdtPrice")
const newPdtQty = $("#newPdtQty")
const newPdtReorderLevel = $("#newPdtReorderLevel")
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
$("#newPdtName, #newPdtPrice, #newPdtQty, #newPdtReorderLevel").keydown(function() {
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
  newProductObj.reorderLevel = newPdtReorderLevel.val().trim()

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
        allProducts += `<tr id="${resData[i]._id}"><td>${resData[i].name}</td><td>${resData[i].price}</td><td>${resData[i].qty}</td><td`
        if (resData[i].qty < resData[i].reorderLevel) {
          allProducts += ` class="reorder-level-reached" `
        }
        allProducts += `>${resData[i].reorderLevel}</td></tr>`
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
  } else {
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
    totalVal.children("h3").text("GHC" + formatNumberToCurrencyFormat(sumTotal.toFixed(2)));
  }
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
    .modal({ closable: false })
    .modal("show");
});

// Cancel Cash Charge Modal
btnCancelAmountCustomerPaidModal.click(function() {
  amountCustomerPaidModal.modal("close");
});

// Charging by Cash
const errorTextContainer = amountCustomerPaidModal.find("div.error")
btnCheckoutAmountCustomerPaid.on("click", function() {
  
  if (Number(txtAmountReceived.val().replace(",","") - Number(totalVal.children('h3').text().split("GHC")[1].replace(",","")) < 0)) {
    errorTextContainer.html("<p>Amount paid is smaller than amount due</p>")
    txtAmountReceived.closest(".form").addClass('error')
    txtAmountReceived.val("")
    return false;
  }
  
  let allProductsDetails = tblCart.find("tbody tr");
  let productsPurchasedArray = [];
  let dataToSend = {};
  txtAmountReceived.closest(".form").removeClass('error')

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
  dataToSend.seller = displayUsername.text();
  dataToSend.receiptNumber = 0;
  dataToSend.paymentType = "cash";

  $.ajax({
    type: "POST",
    contentType: "application/json",
    url: `${base_url}/checkout/`,
    data: JSON.stringify(dataToSend),
    dataType: "json",
    success: function(res) {
      console.log(res)
      if (res.lowerPdt) {
        errorTextContainer.html(`<p>Available Quantity of ${res.lowerPdt[0].name} is less than what is requested to sell</p>`)
        txtAmountReceived.closest(".form").addClass('error')
        return
      }
      ipc.send("prepare-receipt-print", res);
      amountCustomerPaidModal.modal("ok")
    },
    error: function(e) {
      alert(e.message);
    }
  });
});

// Clicking on new Sale Button
// reset the amount received textbox
btnNew.click(function() {
  txtAmountReceived.val("");
  cart.find("tbody").empty();
  totalVal.children("h3").text("GHC0.00");
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
