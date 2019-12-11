const ipc = require('electron').ipcRenderer

const container = $(".container")
const tbody = $("tbody")
const totalVal = $("#totalVal")
const amountReceived = $(".amountReceived")
const changeGiven = $(".changeGiven")
const timeStamp = $(".timestamp")


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
        dataToAppend += `<td>${amount}</td></tr>`
    }
    tbody.html(dataToAppend)
    totalVal.empty().append(sumTotal)
    amountReceived.children("span").text(sale.amountReceived)
    changeGiven.children("span").text(Number(sale.amountReceived) - Number(sumTotal))
    timeStamp.text(data.timeStamp)


    ipc.send("begin-print", data)
})

// Functions
function timestamp() {
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