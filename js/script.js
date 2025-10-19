document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('incomeExpenseChart')
    const ctx = canvas ? canvas.getContext('2d') : null
    
    // Создаём график и сохраняем в глобальную переменную для дальнейшего обновления
    window.incomeExpenseChart = ctx ? new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'],
            datasets: [
                { label: 'Доход', data: [0,0,0,0,0,0,0,0,0,0,0,0], borderColor: '#FF8A5C', tension:0.4 },
                { label: 'Траты', data: [0,0,0,0,0,0,0,0,0,0,0,0], borderColor:'#FF5858', tension:0.4 }
            ]
        },
        options: {
            responsive:true,
            maintainAspectRatio:false,
            plugins:{ legend:{ display:true, position: 'bottom' } },
            scales:{
                x:{ grid:{ display:false }, border:{ display:false } },
                y:{ display:false, grid:{ display:false } }
            }
        }
    }) : null

    const ctxProgress = document.getElementById('progressBar').getContext('2d')
    window.progressChart = new Chart(ctxProgress, {
        type:'bar',
        data:{ labels:['Прогресс'], datasets:[{ label:'Прогресс', data:[0], backgroundColor:'#FF5858', borderRadius:8, stack:'base' }] },
        options:{ indexAxis:'y', scales:{ x:{ min:0, max:100, display:false }, y:{ display:false } }, plugins:{ legend:{ display:false }, tooltip:{ enabled:false } }, responsive:true, maintainAspectRatio:false }
    })

    const ctxChart = document.getElementById('progressChart').getContext('2d')
    const progress2 = 65
    new Chart(ctxChart, {
        type:'doughnut',
        data:{ datasets:[{ data:[progress2,100-progress2], backgroundColor:['#fff','rgba(220,220,220,0.3)'], borderWidth:0, cutout:'75%' }] },
        options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false }, tooltip:{ enabled:false } } }
    })
})

const incomeBtn = document.getElementById("incomeBtn"),
      incomeModal = document.getElementById("incomeModal"),
      addIncomeBtn = document.getElementById("addIncome"),
      incomeInput = document.getElementById("incomeAmount"),
      incomeName = document.getElementById("incomeName"),
      incomeDate = document.getElementById("incomeDate"),
      incomeTime = document.getElementById("incomeTime"),
      expensesBtn = document.getElementById("expensesBtn"),
      expensesModal = document.getElementById("expensesModal"),
      addExpensesBtn = document.getElementById("addExpenses"),
      expensesInput = document.getElementById("expensesAmount"),
      closeIncomeModal = document.getElementById("closeIncomeModal"),
      closeExpensesModal = document.getElementById("closeExpensesModal"),
      incomeText = document.getElementById("incomeText"),
      expensesText = document.getElementById("expensesText"),
      balanceText = document.getElementById("balanceText"),
      transactionsList = document.getElementById("transactionsList"),
      expensesCategory = document.getElementById("expensesCategory"),
      expensesDate = document.getElementById("expensesDate"),
      expensesTime = document.getElementById("expensesTime"),
      expensesName = document.getElementById("expensesName"),
      addAccountBtn = document.getElementById("addAccountBtn"),
      accountModal = document.getElementById("accountModal"),
      accountName = document.getElementById("accountName"),
      accountAmount = document.getElementById("accountAmount"),
      accountType = document.getElementById("accountType"),
      accountDesc = document.getElementById("accountDesc"),
      saveAccountBtn = document.getElementById("saveAccount"),
      deleteAccountBtn = document.getElementById("deleteAccount"),
      accountsList = document.getElementById("accountsList"),
      closeAccountModal = document.getElementById("closeAccountModal")

// Загружаем данные
let income = parseFloat(localStorage.getItem("income")) || 0,
    expenses = parseFloat(localStorage.getItem("expenses")) || 0,
    // account - старое поле: больше не используем как единый number
    // список счетов
    accounts = JSON.parse(localStorage.getItem("accounts")) || [],
    incomeTransactions = JSON.parse(localStorage.getItem("incomeTransactions")) || [],
    expensesTransactions = JSON.parse(localStorage.getItem("expensesTransactions")) || []

if (incomeText && expensesText && balanceText) {
    const incomeValue = formatNumber(income) + "₽"
    const expensesValue = formatNumber(expenses) + "₽"
    const balanceValue = formatNumber(income - expenses) + "₽"

    incomeText.textContent = incomeValue
    expensesText.textContent = expensesValue
    balanceText.textContent = balanceValue

    adjustFontSize(incomeText, incomeValue, "small")
    adjustFontSize(expensesText, expensesValue, "small")
    adjustFontSize(balanceText, balanceValue, "large")
} else {
    console.error("Один или несколько элементов (incomeText, expensesText, balanceText) не найдены")
}

if (expensesDate) {
    expensesDate.valueAsDate = new Date()
}
if (expensesTime) {
    const now = new Date()
    expensesTime.value = now.toTimeString().slice(0, 5)
}
if (incomeDate) {
    incomeDate.valueAsDate = new Date()
}
if (incomeTime) {
    const now2 = new Date()
    incomeTime.value = now2.toTimeString().slice(0, 5)
}

// --- Форматирование чисел с разделителями тысяч ---
function formatNumber(number) {
    return new Intl.NumberFormat('ru-RU').format(number)
}

// --- Счета: emoji для типов ---
const accountTypeEmoji = {
    deposit: '🏦',
    debit: '💳',
    credit: '🏧',
    savings: '🐖',
    investment: '📈',
    cash: '💵',
    other: '🏷️'
}

function saveAccounts() {
    localStorage.setItem('accounts', JSON.stringify(accounts))
}

function formatAccountAmount(amount) {
    return formatNumber(amount) + '₽'
}

function renderAccounts() {
    if (!accountsList) return
    accountsList.innerHTML = ''

    if (accounts.length === 0) {
        accountsList.innerHTML = '<div class="menu-account no-accounts"><div class="menu-account-info" style="padding:.6em">Нет счетов</div></div>'
        return
    }

    accounts.forEach((acc, index) => {
        const accEl = document.createElement('div')
        accEl.className = 'menu-account'
        accEl.dataset.index = index

        const emoji = accountTypeEmoji[acc.type] || accountTypeEmoji.other

        accEl.innerHTML = `
            <div class="menu-account-circle">
                <div class="menu-account-img">
                    <span style="font-size:1.1em">${emoji}</span>
                </div>
            </div>
            <div class="menu-account-info">
                <p class="account-name">${escapeHtml(acc.name)}</p>
                <p class="account-amount">${formatAccountAmount(acc.amount)}</p>
            </div>
        `

        // клик — открыть детали / редактирование
        accEl.addEventListener('click', () => openAccountModalForEdit(index))

        accountsList.appendChild(accEl)
    })
}

function escapeHtml(str) {
    if (!str) return ''
    return String(str).replace(/[&<>"']/g, function (s) {
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[s]
    })
}

let editingAccountIndex = null

function openAccountModalForNew() {
    editingAccountIndex = null
    if (!accountModal) return
    if (accountName) accountName.value = ''
    if (accountAmount) accountAmount.value = ''
    if (accountType) accountType.value = ''
    if (accountDesc) accountDesc.value = ''
    document.getElementById('accountModalTitle').textContent = 'Добавить счет'
    if (deleteAccountBtn) deleteAccountBtn.style.display = 'none'
    accountModal.style.display = 'block'
}

function openAccountModalForEdit(index) {
    const acc = accounts[index]
    if (!acc) return
    editingAccountIndex = index
    if (accountName) accountName.value = acc.name || ''
    if (accountAmount) accountAmount.value = acc.amount || 0
    if (accountType) accountType.value = acc.type || ''
    if (accountDesc) accountDesc.value = acc.desc || ''
    document.getElementById('accountModalTitle').textContent = 'Редактировать счет'
    if (deleteAccountBtn) deleteAccountBtn.style.display = 'inline-block'
    accountModal.style.display = 'block'
}

function saveAccountFromModal() {
    const name = accountName ? accountName.value.trim() : ''
    let amount = accountAmount ? parseFloat(String(accountAmount.value).replace(',', '.')) : 0
    const type = accountType ? accountType.value : ''
    const desc = accountDesc ? accountDesc.value.trim() : ''

    if (!name) { alert('Введите название счета'); return }
    if (isNaN(amount) || amount < 0) { alert('Введите корректную сумму'); return }

    if (editingAccountIndex === null) {
        // новый счет
        const newAcc = {
            id: 'acc_' + Date.now(),
            name,
            amount,
            type: type || 'other',
            desc,
            createdAt: new Date().toISOString()
        }
        accounts.push(newAcc)
    } else {
        // редактирование
        const acc = accounts[editingAccountIndex]
        if (!acc) return
        acc.name = name
        acc.amount = amount
        acc.type = type || 'other'
        acc.desc = desc
        acc.updatedAt = new Date().toISOString()
    }

    saveAccounts()
    renderAccounts()
    accountModal.style.display = 'none'
}

function deleteAccountFromModal() {
    if (editingAccountIndex === null) return
    if (!confirm('Удалить этот счет?')) return
    accounts.splice(editingAccountIndex, 1)
    saveAccounts()
    renderAccounts()
    accountModal.style.display = 'none'
}

// Обработчики кнопок модалки
if (addAccountBtn) addAccountBtn.addEventListener('click', openAccountModalForNew)
if (saveAccountBtn) saveAccountBtn.addEventListener('click', saveAccountFromModal)
if (deleteAccountBtn) deleteAccountBtn.addEventListener('click', deleteAccountFromModal)
if (closeAccountModal) closeAccountModal.addEventListener('click', () => { if (accountModal) accountModal.style.display = 'none' })

// Делать весь блок кликабельным — если клик не по конкретной внутренней ссылке
const accountMenu = document.getElementById('accountMenu')
if (accountMenu) {
    accountMenu.addEventListener('click', (e) => {
        // если клик пришел по самой кнопке, handler addAccountBtn уже сработает
        const target = e.target
        if (target && target.id === 'addAccountBtn') return
        openAccountModalForNew()
    })
}

// Закрывать модал при клике вне
if (accountModal) {
    window.addEventListener('click', (e) => {
        if (e.target === accountModal) accountModal.style.display = 'none'
    })
}

// Первичный рендер
renderAccounts()

// --- Адаптивный размер шрифта ---
function adjustFontSize(element, text, type) {
    if (!element) {
        console.error("Элемент для adjustFontSize не передан")
        return
    }
    const length = text.length
    element.style.whiteSpace = 'normal'
    element.style.textOverflow = 'clip'
    element.style.overflow = 'visible'

    let fontSize = 1 // = 1em
    const baseSize = {
        small: 1,
        medium: 1.1,
        large: 1.2
    }

    const getScaleFactor = (len, type) => {
        const baseScale = Math.max(0.4, 1 - (len - 8) * 0.05)
        switch(type) {
            case 'small': return baseScale * 0.9
            case 'medium': return baseScale * 1
            case 'large': return baseScale * 1.1
            default: return baseScale
        }
    }

    fontSize = baseSize[type] * (length <= 8 ? 1 : getScaleFactor(length, type))

    const minSizes = {
        small: 0.45,
        medium: 0.85,
        large: 0.65
    }
    
    fontSize = Math.max(fontSize, minSizes[type])

    element.style.fontSize = fontSize + "em"
}

// Период — экономика
const economyPeriodButtons = document.querySelectorAll('.economy .period-btn')
economyPeriodButtons.forEach(button => {
    button.addEventListener('click', function() {
        economyPeriodButtons.forEach(btn => btn.classList.remove('period-active'))
        this.classList.add('period-active')
        const selectedPeriod = this.getAttribute('data-period')
        updateContent(selectedPeriod, 'economy')
    })
})

// Период — графики в дашборде
const chartPeriodButtons = document.querySelectorAll('.dashboard .period-btn')
chartPeriodButtons.forEach(button => {
    button.addEventListener('click', function() {
        chartPeriodButtons.forEach(btn => btn.classList.remove('period-active'))
        this.classList.add('period-active')
        const selectedPeriod = this.getAttribute('data-period')
        updateContent(selectedPeriod, 'chart')
    })
})

function getDateRange(period) {
    const now = new Date()
    let startDate, endDate

    switch(period) {
        case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
            break
        
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
            break


        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1)
            endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
            break
        
        default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
            break
    }

    return { startDate, endDate }
}

console.log(getDateRange('week'))
console.log(getDateRange('month'))
console.log(getDateRange('year'))

function filterTransactions(transaction, period) {
    const { startDate, endDate } = getDateRange(period)

    return transaction.filter(transaction => {
        const transactionDate = new Date(transaction.date)
        return transactionDate >= startDate && transactionDate <= endDate
    })
}

function updateChart(period) {
    if (!window.incomeExpenseChart) return

    let labels, incomeData, expensesData
    const { chartLabels, chartIncomeData, chartExpensesData } = getChartData(period)

    labels = chartLabels
    incomeData = chartIncomeData
    expensesData = chartExpensesData

    window.incomeExpenseChart.data.labels = labels
    window.incomeExpenseChart.data.datasets[0].data = incomeData
    window.incomeExpenseChart.data.datasets[1].data = expensesData

    window.incomeExpenseChart.update()
}

function getChartData(period) {
    let labels = [],
        incomeData = [],
        expensesData = []

    const filteredExpenses = filterTransactions(expensesTransactions, period),
        filteredIncome = filterTransactions(incomeTransactions, period)
    
    switch(period) {
        case 'week':
            labels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
            incomeData = new Array(7).fill(0)
            expensesData = new Array(7).fill(0)

            filteredIncome.forEach(transaction => {
                const dayOfWeek = new Date(transaction.date).getDay(),
                    adjustedDay = (dayOfWeek + 6) % 7
                incomeData[adjustedDay] += transaction.amount
            })

            filteredExpenses.forEach(transaction => {
                const dayOfWeek = new Date(transaction.date).getDay(),
                    adjustedDay = (dayOfWeek + 6) % 7
                expensesData[adjustedDay] += transaction.amount
            })
            break

        case 'month':
            const currentDate = new Date(),
                currentYear = currentDate.getFullYear(),
                currentMonth = currentDate.getMonth(),
                daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
            
            labels = Array.from({length: daysInMonth}, (_,index) => (index + 1).toString())

            incomeData = new Array(daysInMonth).fill(0)
            expensesData = new Array(daysInMonth).fill(0)

            filteredIncome.forEach(transaction => {
                const transactionDate = new Date(transaction.date)
                const dayOfMonth = transactionDate.getDate() - 1
                if (dayOfMonth >= 0 && dayOfMonth < daysInMonth) {
                    incomeData[dayOfMonth] += transaction.amount
                }
            })
            
            filteredExpenses.forEach(transaction => {
                const transactionDate = new Date(transaction.date)
                const dayOfMonth = transactionDate.getDate() - 1
                if (dayOfMonth >= 0 && dayOfMonth < daysInMonth) {
                    expensesData[dayOfMonth] += transaction.amount
                }
            })
            break

        case 'year':
            labels = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
            incomeData = new Array(12).fill(0)
            expensesData = new Array(12).fill(0)

            filteredIncome.forEach(transaction => {
                const transactionDate = new Date(transaction.date)
                const month = transactionDate.getMonth()
                incomeData[month] += transaction.amount
            })
            
            filteredExpenses.forEach(transaction => {
                const transactionDate = new Date(transaction.date)
                const month = transactionDate.getMonth()
                expensesData[month] += transaction.amount
            })
            break
            
        default:
            const defaultCurrentDate = new Date()
            const defaultYear = defaultCurrentDate.getFullYear()
            const defaultMonth = defaultCurrentDate.getMonth()
            const defaultDaysInMonth = new Date(defaultYear, defaultMonth + 1, 0).getDate()
            
            labels = Array.from({length: defaultDaysInMonth}, (_, index) => (index + 1).toString())
            incomeData = new Array(defaultDaysInMonth).fill(0)
            expensesData = new Array(defaultDaysInMonth).fill(0)
    }

    return { 
        chartLabels: labels, 
        chartIncomeData: incomeData, 
        chartExpensesData: expensesData 
    }

}


// --- Обновление баланса и экономики ---
function updateBalance() {
    if (balanceText) {
        const balanceValue = formatNumber(income - expenses) + "₽"
        balanceText.textContent = balanceValue
        adjustFontSize(balanceText, balanceValue, "large")
    }
}

function updateEconomy(period = 'month') {
    const filteredIncome = filterTransactions(incomeTransactions, period)
    const filteredExpenses = filterTransactions(expensesTransactions, period)

    const periodIncome = filteredIncome.reduce((sum, transaction) => sum + transaction.amount, 0)
    const periodExpenses = filteredExpenses.reduce((sum, transaction) => sum + transaction.amount, 0)
    const periodSavings = periodIncome - periodExpenses
    const periodPercent = periodIncome > 0 ? Math.round((periodSavings / periodIncome) * 100) : 0

    if (incomeText) {
        const incomeValue = formatNumber(periodIncome) + '₽'
        incomeText.textContent = incomeValue
        adjustFontSize(incomeText, incomeValue, 'small')
    }

    if (expensesText) {
        const expensesValue = formatNumber(periodExpenses) + "₽"
        expensesText.textContent = expensesValue
        adjustFontSize(expensesText, expensesValue, "small")
    }

    const savingsElement = document.getElementById("savingsText")
    if (savingsElement) {
        const savingsText = formatNumber(periodSavings) + "₽"
        savingsElement.textContent = savingsText
        adjustFontSize(savingsElement, savingsText, "medium")
    }

    const progressText = document.getElementById("progressText")
    if (progressText) {
        progressText.textContent = periodPercent + "%"
    }

    if (window.progressChart && window.progressChart.data && window.progressChart.data.datasets && window.progressChart.data.datasets[0]) {
        window.progressChart.data.datasets[0].data[0] = periodPercent
        window.progressChart.update()
    }

    // Обновляем средние значения (доход/трат) для выбранного периода
    try {
        updateAverages(period)
    } catch (err) {
        console.error('Ошибка при обновлении средних значений:', err)
    }

// --- Средние значения ---
function pad(n) { return n < 10 ? '0' + n : '' + n }

function getLastNMonthsKeys(n, endDate = new Date()) {
    const keys = []
    const d = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
    for (let i = 0; i < n; i++) {
        const year = d.getFullYear()
        const month = d.getMonth() + 1
        keys.unshift(`${year}-${pad(month)}`)
        d.setMonth(d.getMonth() - 1)
    }
    return keys
}


function computeAverageForPeriod(transactions, period) {
    if (!Array.isArray(transactions) || transactions.length === 0) return 0

    if (period === 'month') {
        const keys = getLastNMonthsKeys(12)
        const totals = Object.fromEntries(keys.map(k => [k, 0]))
        transactions.forEach(t => {
            const d = new Date(t.date)
            if (isNaN(d)) return
            const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
            if (key in totals) totals[key] += t.amount
        })
    const values = Object.values(totals)
    // учитываем только периоды с транзакциями (значение > 0)
    const nonZero = values.filter(v => v > 0)
    if (nonZero.length === 0) return 0
    const sum = nonZero.reduce((s,v) => s+v, 0)
    return sum / nonZero.length
    }

    if (period === 'week') {
        const keys = getLastNWeeksKeys(12)
        const totals = Object.fromEntries(keys.map(k => [k, 0]))
        transactions.forEach(t => {
            const d = new Date(t.date)
            if (isNaN(d)) return
            const key = getWeekKey(d)
            if (key in totals) totals[key] += t.amount
        })
    const values = Object.values(totals)
    const nonZero = values.filter(v => v > 0)
    if (nonZero.length === 0) return 0
    const sum = nonZero.reduce((s,v) => s+v, 0)
    return sum / nonZero.length
    }

    // year
    const yearMap = {}
    transactions.forEach(t => {
        const d = new Date(t.date)
        if (isNaN(d)) return
        const y = d.getFullYear()
        yearMap[y] = (yearMap[y] || 0) + t.amount
    })
    const years = Object.keys(yearMap)
    if (years.length === 0) return 0
    const sumYears = Object.values(yearMap).reduce((s,v) => s+v, 0)
    return sumYears / years.length
}

function updateAverages(period = 'month') {
    const avgExpensesText = document.getElementById('avgExpensesText')
    const avgIncomeText = document.getElementById('avgIncomeText')

    const avgExpenses = computeAverageForPeriod(expensesTransactions, period)
    const avgIncome = computeAverageForPeriod(incomeTransactions, period)

    if (avgExpensesText) {
        const avgExpensesValue = formatNumber(Math.round(avgExpenses)) + '₽'
        avgExpensesText.textContent = avgExpensesValue
        adjustFontSize(avgExpensesText, avgExpensesValue, "large")
    }
    if (avgIncomeText) {
        const avgIncomeValue = formatNumber(Math.round(avgIncome)) + '₽'
        avgIncomeText.textContent = avgIncomeValue
        adjustFontSize(avgIncomeText, avgIncomeValue, "large")
    }
}
}

function updateContent(selectedPeriod, section = 'all') {
    console.log(`Обновление ${section} для периода: ${selectedPeriod}`)
    
    if (section === 'economy' || section === 'all') {
        updateEconomy(selectedPeriod)
    }

    if (section === 'chart' || section === 'all') {
        updateChart(selectedPeriod)
    }
}

// --- Обновление дохода/расхода ---
function updateIncome(amount) {
    income += amount
    localStorage.setItem("income", income)
    if (incomeText) {
        const incomeValue = formatNumber(income) + "₽"
        incomeText.textContent = incomeValue
        adjustFontSize(incomeText, incomeValue, "small")
    }
    
    updateBalance()
    updateEconomy()
}

function updateExpenses(amount) {
    expenses += amount
    localStorage.setItem("expenses", expenses)
    if (expensesText) {
        const expensesValue = formatNumber(expenses) + "₽"
        expensesText.textContent = expensesValue
        adjustFontSize(expensesText, expensesValue, "small")
    }
    updateBalance()
    updateEconomy()
}

function accountsUpdate(amount) {
    account += amount
    localStorage.setItem("account", account)
    if (accountText) {
        const accountValue = formatNumber(account) + "₽"
        accountText.textContent = accountValue
        adjustFontSize(accountText, accountValue, "small")
    }
}




// --- Модалки ---
if (incomeBtn) incomeBtn.addEventListener("click", () => incomeModal.style.display = "block")
if (expensesBtn) expensesBtn.addEventListener("click", () => expensesModal.style.display = "block")
if (closeIncomeModal) closeIncomeModal.addEventListener("click", () => incomeModal.style.display = "none")
if (closeExpensesModal) closeExpensesModal.addEventListener("click", () => expensesModal.style.display = "none")
if (incomeModal && expensesModal) {
    window.addEventListener("click", (e) => {
        if (e.target === incomeModal) incomeModal.style.display = "none"
        if (e.target === expensesModal) expensesModal.style.display = "none"
    })
}


// --- Добавление категорий---
function getAllTransactions() {
    const allTransactions = [
        ...incomeTransactions.map(t => ({ ...t, type: 'income' })),
        ...expensesTransactions.map(t => ({ ...t, type: 'expense' }))
    ]
        return allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))
}

function renderTransactionsList() {
    if (!transactionsList) return
    transactionsList.innerHTML = ''

    const allTransactions = getAllTransactions()
    if (allTransactions.length === 0) {
        transactionsList.innerHTML = '<div class="transaction-item"><p>Нет транзакций</p></div>'
        return
    }

    const transactionsDateBlock = document.querySelector(".transactions-date")
    if (transactionsDateBlock) {
        const label = transactionsDateBlock.querySelector("p")
        const lastTransaction = allTransactions.length > 0 ? new Date(allTransactions[0].date) : new Date()

        const today = new Date()
        const yesterday = new Date()
        yesterday.setDate(today.getDate() - 1)

        let labelText = ""
        if (lastTransaction.toDateString() === today.toDateString()) labelText = "Сегодня"
        else if (lastTransaction.toDateString() === yesterday.toDateString()) labelText = "Вчера"
        else labelText = lastTransaction.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })

        label.textContent = labelText
    }

    const groups = {}
    allTransactions.forEach(t => {
        const d = new Date(t.date)
        const key = d.toDateString()
        if (!groups[key]) groups[key] = []
        groups[key].push(t)
    })

    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)

    function formatCompactNumber(num) {
        if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + ' млрд₽'
        if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + ' млн₽'
        if (num >= 1_000) return formatNumber(num)
        return num + '₽'
    }

    function getEmoji(category) {
        const map = {
            'еда': '🍔',
            'транспорт': '🚌',
            'развлечения': '🎮',
            'жилье': '🏠',
            'здоровье': '💊',
            'одежда': '👕',
            'другое': '💡',
            'доход': '💰'
        }
        return map[category] || '💸'
    }

    Object.keys(groups)
        .sort((a, b) => new Date(b) - new Date(a))
        .forEach(dateKey => {
            const date = new Date(dateKey)
            const dateLabel =
                date.toDateString() === today.toDateString()
                    ? 'Сегодня'
                    : date.toDateString() === yesterday.toDateString()
                    ? 'Вчера'
                    : date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })

            const dateHeader = document.createElement('div')
            dateHeader.className = 'transaction-date-header'
            dateHeader.textContent = dateLabel
            transactionsList.appendChild(dateHeader)

            groups[dateKey].forEach(transaction => {
                const transactionItem = document.createElement('div')
                transactionItem.className = 'transaction-item'

                const emoji = getEmoji(transaction.category)
                const transactionName = transaction.name || (transaction.type === 'income' ? 'Доход' : 'Трата')

                const amountClass = transaction.type === 'income' ? 'positive' : 'negative'
                const amountSign = transaction.type === 'income' ? '+' : '-'
                const shortAmount = formatCompactNumber(transaction.amount)
                const trDate = new Date(transaction.date)
                const timeString = trDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

                transactionItem.innerHTML = `
                    <div class="transaction-icon emoji-bg">
                        <span class="emoji">${emoji}</span>
                    </div>
                    <div class="transaction-info">
                        <p class="transaction-name">${transactionName}</p>
                        <p class="transaction-category">${transaction.category ? transaction.category : ''} <span class="transaction-time" style="color:#999; font-size:0.8em; margin-left:6px">${timeString}</span></p>
                    </div>
                    <div class="transaction-amount ${amountClass}">
                        <p>${amountSign}${shortAmount}</p>
                    </div>
                `
                transactionsList.appendChild(transactionItem)
            })
        })
}

// --- Добавление дохода ---
function addIncome() {
    const amount = parseFloat(incomeInput.value)
    const category = expensesCategory ? expensesCategory.value : '',
        selectedTime = incomeTime ? incomeTime.value : '',
        selectedDate = incomeDate ? incomeDate.value : '',
        name = incomeName ? incomeName.value.trim() : ''
    if (!isNaN(amount) && amount > 0) {
        let dateTime
        if (selectedDate && selectedTime) {
            dateTime = new Date(selectedDate + 'T' + selectedTime)
        } else {
            dateTime = new Date()
        }

        const transaction = {
            amount: amount,
            name: name || 'Доход',
            category: 'доход',
            date: dateTime.toISOString(),
        }
        
        incomeTransactions.push(transaction)
        localStorage.setItem("incomeTransactions", JSON.stringify(incomeTransactions))
        
        updateIncome(amount)
        renderTransactionsList()
        incomeInput.value = ""
        if (incomeName) incomeName.value = ""
        if (incomeDate) incomeDate.value = ""
        if (incomeTime) incomeTime.value = ""
        incomeModal.style.display = "none"
    } else {
        alert("Введите корректную сумму")
    }

    const activeBtn = document.querySelector('.dashboard .period-btn.period-active')
    const currentPeriod = activeBtn ? activeBtn.getAttribute('data-period') : 'month'
    updateChart(currentPeriod)
    updateAverages(currentPeriod)

}

if (addIncomeBtn) addIncomeBtn.addEventListener("click", addIncome)
if (incomeInput) incomeInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addIncome() })

// --- Добавление расхода ---
function addExpense() {
    let inputValue = expensesInput.value.trim()
    
    inputValue = inputValue.replace(',', '.')
    let amount = parseFloat(inputValue)
    const category = expensesCategory.value,
        selectedTime = expensesTime.value,
        selectedDate = expensesDate.value,
        name = expensesName.value.trim()

    
    if (!isNaN(amount) && amount !== 0 && category.trim() !== '' && name !== '') {
        amount = Math.abs(amount)

        let dateTime  
        if (selectedTime && selectedDate) {
            dateTime = new Date(selectedDate + 'T' + selectedTime)
        } else {
            dateTime = new Date()
        }

        const transaction = {
            amount: amount,
            name: name,
            category: category,
            date: dateTime.toISOString(),
        }

        expensesTransactions.push(transaction)
        localStorage.setItem("expensesTransactions", JSON.stringify(expensesTransactions))
        
        updateExpenses(amount)
        renderTransactionsList()
        
        expensesDate.value = ""
        expensesInput.value = ""
        expensesCategory.value = ""
        expensesModal.style.display = "none"
    } else {
        alert("Заполните все поля корректно")
    }

    const activeBtn = document.querySelector('.dashboard .period-btn.period-active')
    const currentPeriod = activeBtn ? activeBtn.getAttribute('data-period') : 'month'
    updateChart(currentPeriod)
    updateAverages(currentPeriod)

}

function addAccount() {
    const name = accountName.value.trim()
    let amount = parseFloat(accountAmount.value.trim().replace(',', '.'))
    
    if (!isNaN(amount) && amount >= 0 && name !== '') {
        account += amount
        localStorage.setItem("account", account)
        accountName.value = ""
        accountAmount.value = ""
        accountModal.style.display = "none"
    } else {
        alert("Введите корректные данные для счёта")
    }
}


if (addExpensesBtn) addExpensesBtn.addEventListener("click", addExpense)
if (expensesInput) expensesInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addExpense() })

// --- Инициализация при загрузке ---
document.addEventListener('DOMContentLoaded', () => {
    updateContent('month', 'all')

    const monthBtn = document.querySelector('.dashboard .period-btn[data-period="month"]')
    if (monthBtn) {
        monthBtn.classList.add('period-active')
    }
    renderTransactionsList()
})
