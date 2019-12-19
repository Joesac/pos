const ipc = require('electron').ipcRenderer

const container = $(".container")
const tbodyProducts = $(".table-container tbody")
const totalVal = $("#totalVal")
const amountReceived = $(".amountReceived")
const changeGiven = $(".changeGiven")
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
    
    totalVal.empty().append(sumTotal.toFixed(2))
    amountReceived.text(sale.amountReceived.toFixed(2))
    changeGiven.text((Number(sale.amountReceived) - Number(sumTotal)).toFixed(2))
    user.text(sale.seller)
    billNo.text(sale.receiptNumber)
    timeStamp.text(convertTimeStampToHRT(data.timestamp))

    console.log(amountReceived.text(), changeGiven.text())

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