const base_url = 'http://localhost:3000'
const displaySearchResultsWrapper = $(".display-search-results-wrapper")
const txtSearch =  $("#txtSearch")
const cart = $(".cart")
const tblCart = $("#tblCart")

let productsArrayTempStore = [];

// Searching for a product to sell
txtSearch.keyup(function() {
    let searchedProducts = '',
        searchTerm = $(this).val().trim();
        
    $.get(`${base_url}/search/products`, { searchTerm }, (resData) => {
        if (resData.length) {
            productsArrayTempStore = resData
            for (i = 0; i < resData.length; i++) {
                searchedProducts += `<button class="ui button blue product-item" id="${i}">${resData[i].name}</button>`
            }
            displaySearchResultsWrapper.html(searchedProducts)
        }
    })
})

// Adding a searched product to Cart
displaySearchResultsWrapper.on("click", ".product-item", function() {
    let productToAppend = '';
    let id = $(this).attr('id');

    productToAppend += `<tr id="pdt_${productsArrayTempStore[id].id}"><td>${productsArrayTempStore[id].name}</td><td>`
    productToAppend += '<div class="ui mini input"><input type="text" value="1" class="pdt-item-qty"></div>'
    productToAppend += `</td><td class="pdt-item-price">${productsArrayTempStore[id].price}</td><td class="pdt-item-total">${productsArrayTempStore[id].price}</td><td>`
    productToAppend += `<button class="ui circular google plus icon button trash-btn"><i id="trush_${productsArrayTempStore[id].id}" class="icon trash alternate outline"></i></button>`
    productToAppend += '</td></tr>'
    cart.find('tbody').append( productToAppend )
})

// Allowing only Numbers
tblCart.on("keydown", ".pdt-item-qty", function(evt) {
    acceptOnlyNumbers(evt)
})

// Changing Quantity
tblCart.on("keyup", ".pdt-item-qty", function() {
    const $this = $(this);
    myValue = $this.val();
    
    if (myValue === '') {
        myValue = 1
    }
    
    $this.parent("div").parent("td").siblings(".pdt-item-total").text(
        myValue * Number.parseFloat( $this.closest("td").siblings(".pdt-item-price").text() )
    )
})

// Removing item from Cart
tblCart.on("click", ".trash-btn", function() {
    $(this).closest("tr").remove()
})

// Functions
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