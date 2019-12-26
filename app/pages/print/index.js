const ipc = require('electron').ipcRenderer

const container = $(".container")
const tbodyProducts = $(".table-container tbody")
const receiptTotalVal = $("#receiptTotalVal")
const amountReceived = $(".amountReceived")
const changeGiven = $(".changeGiven")
const receiptDiscount = $(".receiptDiscount")
const receiptDiscountCondAmt = $(".receiptDiscountCondAmt")
const timeStamp = $("#timestamp")
const user = $("#user")
const billNo = $("#billNo")


ipc.on('print-automatically', (evt, data) => {
    let dataToAppend = '';
    let sumTotal = 0;
    let sale = data.sale;
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
    
    let discount = 0
    let amountDue = sumTotal

    if (sale.discount > 0) {
        if (sale.discountConditionalAmount > 0) {
            if (sumTotal >= sale.discountConditionalAmount) {
                discount = sumTotal * (sale.discount / 100)
                amountDue = (sumTotal - discount).toFixed(2)
            }
        } else {
            discount = sumTotal * (sale.discount / 100)
            amountDue = (sumTotal - discount).toFixed(2)
        }
    }

    receiptTotalVal.text(Number(amountDue).toFixed(2))
    amountReceived.text(sale.amountReceived)
    changeGiven.text((Number(sale.amountReceived) - Number(amountDue)).toFixed(2))
    receiptDiscount.text(sale.discount + '%')
    receiptDiscountCondAmt.text(sale.discountConditionalAmount)
    user.text(sale.seller)
    billNo.text(sale.receiptNumber)
    timeStamp.text(convertTimeStampToHRT(data.timestamp))

    ipc.send("begin-print", data)
})

// Functions
function convertTimeStampToHRT(timestamp) {
    today = new Date(timestamp)
    let date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
    let time = showAMPM(today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds());
    return date+' '+time;
}

function showAMPM(time) {
    splitTime = time.split(':')
    hour = splitTime[0]
    minute = splitTime[1]
    second = splitTime[2]
    ampm = 'PM'

    if (minute.length < 2) minute = '0' + minute
    if (second.length < 2) second = '0' + second

    if (hour < 12) {
        ampm = 'AM'
    }
    let moduloTime = hour % 12

    if (moduloTime == 0) {
        hour = '12'
    } else {
        if (moduloTime < 12) {
            hour = moduloTime
        } else {
            return hour
        }
    }

    return hour + ':' + minute + ':' + second + ampm
}