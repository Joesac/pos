const ipc = require('electron').ipcRenderer

const container = $(".container")
const tbody = $("tbody")
const totalVal = $("#totalVal")
const amountReceived = $(".amountReceived")
const changeGiven = $(".changeGiven")

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

    ipc.send("begin-print", data)
})