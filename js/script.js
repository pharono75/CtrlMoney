// --- Вспомогательные функции ---
// Форматирование чисел
function formatNumber(number) {
    return new Intl.NumberFormat('ru-RU').format(number)
}

// Emoji для счетов
const accountTypeEmoji = {
    deposit: '🏦',
    debit: '💳',
    credit: '🏧',
    savings: '🐖',
    investment: '📈',
    cash: '💵',
    other: '🏷️'
}

// Emoji для категорий транзакций
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
    return map[category] || '💸';
}

// Экранирование HTML
function escapeHtml(str) {
    if (!str) return ''
    return String(str).replace(/[&<>"']/g, function (s) {
        return ({'&':'&amp','<':'&lt','>':'&gt','"':'&quot',"'":"&#39"})[s]
    })
}
// Адаптивный размер шрифта
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

// --- Функции для работы со временем/датами (Исправлено/Добавлено) ---

function pad(n) { return n < 10 ? '0' + n : '' + n }

// Helper-функция для ISO week number
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
    return [d.getUTCFullYear(), weekNo]
}

// ДОБАВЛЕНО: Генерация ключа недели (YYYY-WXX)
function getWeekKey(d) {
    const [year, weekNo] = getWeekNumber(d)
    return `${year}-W${pad(weekNo)}`
}

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

// ДОБАВЛЕНО: Генерация ключей для N последних недель
function getLastNWeeksKeys(n, endDate = new Date()) {
    const keys = []
    const d = new Date(endDate)
    // Начинаем с понедельника текущей недели
    d.setDate(d.getDate() - (d.getDay() === 0 ? 6 : d.getDay() - 1)) 

    for (let i = 0; i < n; i++) {
        keys.unshift(getWeekKey(d))
        d.setDate(d.getDate() - 7) // Переходим к понедельнику прошлой недели
    }
    return keys
}

function getDateRange(period) {
    const now = new Date()
    let startDate, endDate

    switch(period) {
        case 'week':
            startDate = new Date(now)
            startDate.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))
            startDate.setHours(0, 0, 0, 0)
            endDate = new Date(startDate)
            endDate.setDate(startDate.getDate() + 6)
            endDate.setHours(23, 59, 59, 999)
            break
        
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
            break

        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1)
            endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
            break
        
        default: // По умолчанию - месяц
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
            break
    }
    return { startDate, endDate }
}

// --- Глобальные переменные ---
let income, expenses, accounts, goals, incomeTransactions, expensesTransactions, editingAccountIndex, editingGoalIndex
let incomeExpenseChart, progressChart
let incomeText, expensesText, balanceText, transactionsList, accountsList
let incomeBtn, incomeModal, addIncomeBtn, incomeInput, incomeName, incomeDate, incomeTime, closeIncomeModal
let expensesBtn, expensesModal, addExpensesBtn, expensesInput, closeExpensesModal, expensesCategory, expensesDate, expensesTime, expensesName
let addAccountBtn, accountModal, accountName, accountAmount, accountType, accountDesc, saveAccountBtn, deleteAccountBtn, closeAccountModal
let viewTransactionModal, closeViewTransactionModal, viewTransactionName, viewTransactionAmount, 
    viewTransactionCategory, viewTransactionDate, viewTransactionTime, viewTransactionType,
    editViewTransaction, deleteViewTransaction, viewingTransactionIndex, viewingTransactionIsIncome
let viewAccountModal, closeViewAccountModal, viewAccountName, viewAccountAmount, 
    viewAccountType, viewAccountDesc, editViewAccount, deleteViewAccount, viewingAccountIndex
let viewGoalModal, closeViewGoalModal, viewGoalName, viewGoalTarget, 
    viewGoalCurrent, viewGoalProgress, editViewGoal, deleteViewGoal, viewingGoalIndex
let editingTransactionIndex = null
let viewGoalProgressChart = null
let editingTransactionIsIncome = null


// --- Функции приложения ---
function saveGoals () {
    localStorage.setItem('goals', JSON.stringify(goals))
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
        accountsList.innerHTML = '<div class="menu-account no-accounts"><div class="menu-account-info" style="padding:.6em; text-align:center; color:#666; width:100%;">Нет счетов</div></div>'
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
                    <span>${emoji}</span>
                </div>
            </div>
            <div class="menu-account-info">
                <p class="account-name">${escapeHtml(acc.name)}</p>
                <p class="account-amount">${formatAccountAmount(acc.amount)}</p>
            </div>
        `
        accEl.addEventListener('click', () => openAccountView(index))
        accountsList.appendChild(accEl)
    })
}

let goalProgressChart = null;

// --- Функция для создания/обновления прогресс-бара целей ---
function renderGoals() {
    const goalsList = document.getElementById('goalsList')
    if (!goalsList) return

    goalsList.innerHTML = ''

    if (goals.length === 0) {
        goalsList.innerHTML = `
            <div class="goal-item" style="text-align: center; padding: 1em; color: #666;">
                Нет активных целей
            </div>
        `
        return
    }

    goals.forEach((goal, index) => {
        const progress = calcGoalProgress(goal.currentAmount, goal.targetAmount)

        const goalEl = document.createElement('div')
        goalEl.className = 'goal-item'
        goalEl.innerHTML = `
            <div class="goal-header">
                <div class="goal-title">${escapeHtml(goal.name)}</div>
                <div class="goal-percentage">${progress}%</div>
            </div>
            <div class="goal-progress">
                <canvas id="goalProgressChart-${index}"></canvas>
            </div>
            <div class="goal-amounts">
                <span>${formatNumber(goal.currentAmount)}₽</span>
                <span>${formatNumber(goal.targetAmount)}₽</span>
            </div>
        `

        goalEl.addEventListener('click', () => openGoalView(index));
        goalsList.appendChild(goalEl)
        createGoalProgressChart(index, progress)
    })
}

// --- Функция создания прогресс-бара для цели ---
function createGoalProgressChart(goalIndex, progress) {
    const ctx = document.getElementById(`goalProgressChart-${goalIndex}`)
    if (!ctx) return

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Прогресс'],
            datasets: [{
                data: [progress],
                backgroundColor: '#FF5858',
                borderRadius: 8,
                borderWidth: 0
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    min: 0,
                    max: 100,
                    display: false,
                    grid: {
                        display: false
                    }
                },
                y: {
                    display: false,
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            }
        }
    })
}

function openGoalModalForNew() {
    editingGoalIndex = null
    const goalModal = document.getElementById('goalModal'),
        goalName = document.getElementById('goalName'),
        goalTarget = document.getElementById('goalTarget'),
        goalCurrent = document.getElementById('goalCurrent')

    if (goalName) goalName.value = ''
    if (goalTarget) goalTarget.value = ''
    if (goalCurrent) goalCurrent.value = '0'

    const titleEl = document.getElementById('goalModalTitle')
    if (titleEl) titleEl.textContent = 'Добавить цель'

    goalModal.style.display = 'block'
}

function calcGoalProgress(current, target) {
    if (target === 0) return 0
    const progress = (current / target) * 100
    return Math.min(Math.round(progress), 100)
}

function openGoalModalForEdit(index) {
    const goal = goals[index]
    if (!goal) return

    editingGoalIndex = index
    const goalModal = document.getElementById('goalModal'),
        goalName = document.getElementById('goalName'),
        goalTarget = document.getElementById('goalTarget'),
        goalCurrent = document.getElementById('goalCurrent')
    
    if (goalName) goalName.value = goal.name || ''
    if (goalTarget) goalTarget.value = goal.targetAmount || 0
    if (goalCurrent) goalCurrent.value = goal.currentAmount || 0

    const titleEl = document.getElementById('goalModalTitle')
    if (titleEl) titleEl.textContent = 'Редактировать цель'

    goalModal.style.display = 'block'
}

function saveGoalFromModal() {
    const goalName = document.getElementById('goalName')
    const goalTarget = document.getElementById('goalTarget')
    const goalCurrent = document.getElementById('goalCurrent')
    
    const name = goalName ? goalName.value.trim() : ''
    const targetAmount = goalTarget ? parseFloat(goalTarget.value) : 0
    const currentAmount = goalCurrent ? parseFloat(goalCurrent.value) : 0
    
    if (!name) {
        alert('Введите название цели')
        return
    }
    
    if (targetAmount <= 0) {
        alert('Введите корректную целевую сумму')
        return
    }
    
    if (currentAmount < 0) {
        alert('Текущая сумма не может быть отрицательной')
        return
    }
    
    if (editingGoalIndex === null) {
        // Новая цель
        const newGoal = {
            id: 'goal_' + Date.now(),
            name: name,
            targetAmount: targetAmount,
            currentAmount: currentAmount,
            createdAt: new Date().toISOString()
        }
        goals.push(newGoal)
    } else {
        // Редактирование существующей цели
        const goal = goals[editingGoalIndex]
        goal.name = name
        goal.targetAmount = targetAmount
        goal.currentAmount = currentAmount
        goal.updatedAt = new Date().toISOString()
    }
    
    saveGoals()
    renderGoals()
    document.getElementById('goalModal').style.display = 'none'
}

function openAccountModalForNew() {
    editingAccountIndex = null
    if (!accountModal) return
    if (accountName) accountName.value = ''
    if (accountAmount) accountAmount.value = ''
    if (accountType) accountType.value = ''
    if (accountDesc) accountDesc.value = ''
    const titleEl = document.getElementById('accountModalTitle')
    if (titleEl) titleEl.textContent = 'Добавить счет'
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
    const titleEl = document.getElementById('accountModalTitle')
    if (titleEl) titleEl.textContent = 'Редактировать счет'
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
        const newAcc = {
            id: 'acc_' + Date.now(),
            name, amount,
            type: type || 'other',
            desc,
            createdAt: new Date().toISOString()
        }
        accounts.push(newAcc)
    } else {
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

function filterTransactions(transactions, period) {
    const { startDate, endDate } = getDateRange(period)
    return transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date)
        return transactionDate >= startDate && transactionDate <= endDate
    })
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
                const dayOfWeek = new Date(transaction.date).getDay()
                const adjustedDay = (dayOfWeek + 6) % 7
                incomeData[adjustedDay] += transaction.amount
            })

            filteredExpenses.forEach(transaction => {
                const dayOfWeek = new Date(transaction.date).getDay()
                const adjustedDay = (dayOfWeek + 6) % 7
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

function updateChart(period) {
    if (!incomeExpenseChart) return
    const { chartLabels, chartIncomeData, chartExpensesData } = getChartData(period)
    incomeExpenseChart.data.labels = chartLabels
    incomeExpenseChart.data.datasets[0].data = chartIncomeData
    incomeExpenseChart.data.datasets[1].data = chartExpensesData
    incomeExpenseChart.update()
}

// --- Средние значения (ИСПРАВЛЕНО/ПЕРЕМЕЩЕНО) ---

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
        const nonZero = values.filter(v => v > 0)
        if (nonZero.length === 0) return 0
        const sum = nonZero.reduce((s,v) => s+v, 0)
        return sum / nonZero.length
    }

    if (period === 'week') {
        const keys = getLastNWeeksKeys(12) // ИСПРАВЛЕНО
        const totals = Object.fromEntries(keys.map(k => [k, 0]))
        transactions.forEach(t => {
            const d = new Date(t.date)
            if (isNaN(d)) return
            const key = getWeekKey(d) // ИСПРАВЛЕНО
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

// --- Обновление UI ---

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

    if (progressChart && progressChart.data && progressChart.data.datasets && progressChart.data.datasets[0]) {
        progressChart.data.datasets[0].data[0] = periodPercent
        progressChart.update()
    }
}

function updateContent(selectedPeriod, section = 'all') {
    console.log(`Обновление ${section} для периода: ${selectedPeriod}`)
    
    if (section === 'economy' || section === 'all') {
        updateEconomy(selectedPeriod)
    }
    if (section === 'chart' || section === 'all') {
        updateChart(selectedPeriod)
        updateAverages(selectedPeriod)
    }
}

// ОПТИМИЗИРОВАНО: убраны лишние обновления DOM
function updateIncome(amount) {
    income += amount
    localStorage.setItem("income", income)
    updateBalance()
    updateEconomy() // Эта функция сама обновит incomeText
}

// ОПТИМИЗИРОВАНО: убраны лишние обновления DOM
function updateExpenses(amount) {
    expenses += amount
    localStorage.setItem("expenses", expenses)
    updateBalance()
    updateEconomy() // Эта функция сама обновит expensesText
}

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

    // ... (rest of the function is unchanged, just copied here)
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
        else labelText = lastTransaction.toLocaleString('ru-RU', { day: 'numeric', month: 'long' })

        if(label) label.textContent = labelText
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

                // В функции renderTransactionsList замените создание transactionItem на:
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
                `;

                // Добавьте обработчик клика для просмотра деталей
                transactionItem.addEventListener('click', () => {
                    // Находим индекс транзакции в исходном массиве
                    const allTransactions = getAllTransactions();
                    const clickedTransaction = allTransactions.find(t => 
                        t.name === transactionName && 
                        t.amount === transaction.amount && 
                        t.date === transaction.date
                    );
                    
                    if (clickedTransaction) {
                        const isIncome = clickedTransaction.type === 'income';
                        const sourceArray = isIncome ? incomeTransactions : expensesTransactions;
                        const index = sourceArray.findIndex(t => 
                            t.name === clickedTransaction.name && 
                            t.amount === clickedTransaction.amount && 
                            t.date === clickedTransaction.date
                        );
                        
                        if (index !== -1) {
                            openTransactionView(index, isIncome);
                        }
                    }
                })
                transactionsList.appendChild(transactionItem)
            })
        })
}

// --- Функции для модальных окон просмотра ---

// Функция открытия просмотра транзакции
function openTransactionView(index, isIncome) {
    const transactions = isIncome ? incomeTransactions : expensesTransactions;
    const transaction = transactions[index];
    
    if (!transaction) return;

    viewingTransactionIndex = index;
    viewingTransactionIsIncome = isIncome;

    // Получаем эмодзи для транзакции
    const emoji = getEmoji(transaction.category);
    
    // Заполняем данные
    viewTransactionEmoji.innerHTML = `<span class="emoji">${emoji}</span>`;
    viewTransactionName.textContent = (transaction.name || (isIncome ? 'Доход' : 'Трата')).toUpperCase();
    
    const amountText = formatNumber(transaction.amount) + '₽';
    viewTransactionAmount.textContent = isIncome ? '+' + amountText : '-' + amountText;
    viewTransactionAmount.className = `transaction-amount-large ${isIncome ? 'income' : 'expense'}`;
    
    viewTransactionCategory.textContent = transaction.category || 'Не указана';
    
    const transactionDate = new Date(transaction.date);
    viewTransactionDate.textContent = transactionDate.toLocaleDateString('ru-RU');
    viewTransactionTime.textContent = transactionDate.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    viewTransactionType.textContent = isIncome ? 'Доход' : 'Расход';

    viewTransactionModal.style.display = 'block';
}

// Функция открытия просмотра счета
function openAccountView(index) {
    const account = accounts[index];
    
    if (!account) return;

    viewingAccountIndex = index;

    // Получаем эмодзи для счета
    const emoji = accountTypeEmoji[account.type] || accountTypeEmoji.other;
    
    // Заполняем данные
    viewAccountEmoji.innerHTML = `<span class="emoji">${emoji}</span>`;
    viewAccountName.textContent = (account.name || 'Не указано').toUpperCase();
    viewAccountAmount.textContent = formatNumber(account.amount) + '₽';
    
    const typeNames = {
        deposit: 'Вклад',
        debit: 'Дебетовый счет',
        credit: 'Кредитный счет',
        savings: 'Накопительный счет',
        investment: 'Инвестиционный счет',
        cash: 'Наличные',
        other: 'Другое'
    };
    viewAccountType.textContent = typeNames[account.type] || 'Не указан';
    viewAccountDesc.textContent = account.desc || 'Не указано';
    
    // Форматируем дату создания
    const createdDate = account.createdAt ? new Date(account.createdAt) : new Date();
    viewAccountCreated.textContent = createdDate.toLocaleDateString('ru-RU');

    viewAccountModal.style.display = 'block';
}

// Функция открытия просмотра цели
// Функция открытия просмотра цели
function openGoalView(index) {
    const goal = goals[index];
    
    if (!goal) return;

    viewingGoalIndex = index;

    // Заполняем данные
    viewGoalName.textContent = (goal.name || 'Не указано').toUpperCase();
    viewGoalTarget.textContent = formatNumber(goal.targetAmount) + '₽';
    viewGoalCurrent.textContent = formatNumber(goal.currentAmount) + '₽';
    
    const progress = calcGoalProgress(goal.currentAmount, goal.targetAmount);
    viewGoalProgress.textContent = progress + '%';
    viewGoalAmounts.textContent = `${formatNumber(goal.currentAmount)} / ${formatNumber(goal.targetAmount)}`;
    viewGoalProgressText.textContent = progress + '%';

    // Создаем круговой график прогресса
    createViewGoalProgressChart(progress);

    viewGoalModal.style.display = 'block';
}

// Функция создания кругового графика прогресса для просмотра цели
function createViewGoalProgressChart(progress) {
    const ctx = document.getElementById('viewGoalProgressChart');
    if (!ctx) return;

    // Уничтожаем предыдущий график, если он существует
    if (viewGoalProgressChart) {
        viewGoalProgressChart.destroy();
    }

    viewGoalProgressChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [progress, 100 - progress],
                backgroundColor: ['#FF5858', '#EFEFEF'],
                borderWidth: 0,
                cutout: '75%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            }
        }
    });
}

// Обработчики для кнопок редактирования в режиме просмотра
function setupViewModalHandlers() {
editViewTransaction.addEventListener('click', function() {
    viewTransactionModal.style.display = 'none';
    
    if (viewingTransactionIsIncome) {
        // Для доходов - открываем модалку дохода в режиме редактирования
        editingTransactionIndex = viewingTransactionIndex;
        editingTransactionIsIncome = true;
        
        resetIncomeModal();
        if (incomeName) incomeName.value = incomeTransactions[viewingTransactionIndex].name || '';
        if (incomeInput) incomeInput.value = incomeTransactions[viewingTransactionIndex].amount || '';
        const date = new Date(incomeTransactions[viewingTransactionIndex].date);
        if (incomeDate) incomeDate.valueAsDate = date;
        if (incomeTime) incomeTime.value = date.toTimeString().slice(0, 5);
        
        // Установите заголовок "Редактировать доход"
        const titleEl = incomeModal.querySelector('h2');
        if (titleEl) titleEl.textContent = 'Редактировать доход';
        
        incomeModal.style.display = 'block';
    } else {
        // Для расходов - открываем модалку расхода в режиме редактирования
        editingTransactionIndex = viewingTransactionIndex;
        editingTransactionIsIncome = false;
        
        resetExpensesModal();
        if (expensesName) expensesName.value = expensesTransactions[viewingTransactionIndex].name || '';
        if (expensesInput) expensesInput.value = expensesTransactions[viewingTransactionIndex].amount || '';
        if (expensesCategory) expensesCategory.value = expensesTransactions[viewingTransactionIndex].category || '';
        const date = new Date(expensesTransactions[viewingTransactionIndex].date);
        if (expensesDate) expensesDate.valueAsDate = date;
        if (expensesTime) expensesTime.value = date.toTimeString().slice(0, 5);
        
        // Установите заголовок "Редактировать трату"
        const titleEl = expensesModal.querySelector('h2');
        if (titleEl) titleEl.textContent = 'Редактировать трату';
        
        expensesModal.style.display = 'block';
    }
});

    deleteViewTransaction.addEventListener('click', function() {
        if (!confirm('Удалить эту транзакцию?')) return;
        
        const transactions = viewingTransactionIsIncome ? incomeTransactions : expensesTransactions;
        const amount = transactions[viewingTransactionIndex].amount;
        
        transactions.splice(viewingTransactionIndex, 1);
        
        // Обновляем хранилище
        localStorage.setItem(
            viewingTransactionIsIncome ? "incomeTransactions" : "expensesTransactions", 
            JSON.stringify(transactions)
        );
        
        // Обновляем баланс
        if (viewingTransactionIsIncome) {
            updateIncome(-amount);
        } else {
            updateExpenses(-amount);
        }
        
        renderTransactionsList();
        viewTransactionModal.style.display = 'none';
        
        const activeBtn = document.querySelector('.dashboard .period-btn.period-active');
        const currentPeriod = activeBtn ? activeBtn.getAttribute('data-period') : 'month';
        updateChart(currentPeriod);
        updateAverages(currentPeriod);
    });

    // Обработчики для счетов
    editViewAccount.addEventListener('click', function() {
        viewAccountModal.style.display = 'none';
        openAccountModalForEdit(viewingAccountIndex);
    });

    deleteViewAccount.addEventListener('click', function() {
        viewAccountModal.style.display = 'none';
        editingAccountIndex = viewingAccountIndex;
        deleteAccountFromModal();
    });

    // Обработчики для целей
    editViewGoal.addEventListener('click', function() {
        viewGoalModal.style.display = 'none';
        openGoalModalForEdit(viewingGoalIndex);
    });

    deleteViewGoal.addEventListener('click', function() {
        if (!confirm('Удалить эту цель?')) return;
        
        goals.splice(viewingGoalIndex, 1);
        saveGoals();
        renderGoals();
        viewGoalModal.style.display = 'none';
    });
}


// --- Функции сброса модальных окон (ДОБАВЛЕНО) ---
function resetIncomeModal() {
    if (incomeInput) incomeInput.value = ""
    if (incomeName) incomeName.value = ""
    const now = new Date()
    if (incomeDate) incomeDate.valueAsDate = now
    if (incomeTime) incomeTime.value = now.toTimeString().slice(0, 5)
}

function resetExpensesModal() {
    if (expensesInput) expensesInput.value = ""
    if (expensesName) expensesName.value = ""
    if (expensesCategory) expensesCategory.value = ""
    const now = new Date()
    if (expensesDate) expensesDate.valueAsDate = now
    if (expensesTime) expensesTime.value = now.toTimeString().slice(0, 5)
}


// --- Добавление транзакций ---

function addIncome() {
    const amount = parseFloat(incomeInput.value);
    const selectedTime = incomeTime ? incomeTime.value : '',
        selectedDate = incomeDate ? incomeDate.value : '',
        name = incomeName ? incomeName.value.trim() : '';
    
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
        
        if (editingTransactionIndex !== null && editingTransactionIsIncome) {
            const oldAmount = incomeTransactions[editingTransactionIndex].amount;
            incomeTransactions[editingTransactionIndex] = transaction;
            
            income = income - oldAmount + amount;
            localStorage.setItem("income", income);
        } else {
            incomeTransactions.push(transaction);
            updateIncome(amount);
        }
        
        localStorage.setItem("incomeTransactions", JSON.stringify(incomeTransactions));
        
        if (editingTransactionIndex !== null) {
            updateBalance();
            updateEconomy();
        }
        
        renderTransactionsList();
        
        resetIncomeModal();
        incomeModal.style.display = "none";
        editingTransactionIndex = null;
        editingTransactionIsIncome = null;
    } else {
        alert("Введите корректную сумму")
    }

    const activeBtn = document.querySelector('.dashboard .period-btn.period-active')
    const currentPeriod = activeBtn ? activeBtn.getAttribute('data-period') : 'month'
    updateChart(currentPeriod)
    updateAverages(currentPeriod)
}


function addExpense() {
    let inputValue = expensesInput.value.trim().replace(',', '.')
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

        if (editingTransactionIndex !== null && !editingTransactionIsIncome) {
            // Редактируем существующую транзакцию
            const oldAmount = expensesTransactions[editingTransactionIndex].amount;
            expensesTransactions[editingTransactionIndex] = transaction;
            
            // Обновляем общие расходы с учетом изменения суммы
            expenses = expenses - oldAmount + amount;
            localStorage.setItem("expenses", expenses);
        } else {
            // Добавляем новую транзакцию
            expensesTransactions.push(transaction);
            updateExpenses(amount);
        }
        
        localStorage.setItem("expensesTransactions", JSON.stringify(expensesTransactions))
        
        if (editingTransactionIndex === null) {
            updateExpenses(amount);
        } else {
            updateBalance();
            updateEconomy();
        }
        
        renderTransactionsList()
        
        resetExpensesModal()
        expensesModal.style.display = "none"
        editingTransactionIndex = null;
        editingTransactionIsIncome = null;
    } else {
        alert("Заполните все поля корректно")
    }

    const activeBtn = document.querySelector('.dashboard .period-btn.period-active')
    const currentPeriod = activeBtn ? activeBtn.getAttribute('data-period') : 'month'
    updateChart(currentPeriod)
    updateAverages(currentPeriod)
}


// --- Инициализация ---
document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. Поиск элементов DOM ---
    const canvas = document.getElementById('incomeExpenseChart')
    const ctx = canvas ? canvas.getContext('2d') : null
    const ctxProgress = document.getElementById('progressBar') ? document.getElementById('progressBar').getContext('2d') : null
    const ctxChart = document.getElementById('progressChart') ? document.getElementById('progressChart').getContext('2d') : null
    
    incomeBtn = document.getElementById("incomeBtn")
    incomeModal = document.getElementById("incomeModal")
    addIncomeBtn = document.getElementById("addIncome")
    incomeInput = document.getElementById("incomeAmount")
    incomeName = document.getElementById("incomeName")
    incomeDate = document.getElementById("incomeDate")
    incomeTime = document.getElementById("incomeTime")
    expensesBtn = document.getElementById("expensesBtn")
    expensesModal = document.getElementById("expensesModal")
    addExpensesBtn = document.getElementById("addExpenses")
    expensesInput = document.getElementById("expensesAmount")
    closeIncomeModal = document.getElementById("closeIncomeModal")
    closeExpensesModal = document.getElementById("closeExpensesModal")
    incomeText = document.getElementById("incomeText")
    expensesText = document.getElementById("expensesText")
    balanceText = document.getElementById("balanceText")
    transactionsList = document.getElementById("transactionsList")
    expensesCategory = document.getElementById("expensesCategory")
    expensesDate = document.getElementById("expensesDate")
    expensesTime = document.getElementById("expensesTime")
    expensesName = document.getElementById("expensesName")
    addAccountBtn = document.getElementById("addAccountBtn")
    accountModal = document.getElementById("accountModal")
    accountName = document.getElementById("accountName")
    accountAmount = document.getElementById("accountAmount")
    accountType = document.getElementById("accountType")
    accountDesc = document.getElementById("accountDesc")
    saveAccountBtn = document.getElementById("saveAccount")
    deleteAccountBtn = document.getElementById("deleteAccount")
    accountsList = document.getElementById("accountsList")
    closeAccountModal = document.getElementById("closeAccountModal")

    viewTransactionModal = document.getElementById('viewTransactionModal');
    closeViewTransactionModal = document.getElementById('closeViewTransactionModal');
    viewTransactionName = document.getElementById('viewTransactionName');
    viewTransactionAmount = document.getElementById('viewTransactionAmount');
    viewTransactionCategory = document.getElementById('viewTransactionCategory');
    viewTransactionDate = document.getElementById('viewTransactionDate');
    viewTransactionTime = document.getElementById('viewTransactionTime');
    viewTransactionType = document.getElementById('viewTransactionType');
    editViewTransaction = document.getElementById('editViewTransaction');
    deleteViewTransaction = document.getElementById('deleteViewTransaction');

    viewAccountModal = document.getElementById('viewAccountModal');
    closeViewAccountModal = document.getElementById('closeViewAccountModal');
    viewAccountName = document.getElementById('viewAccountName');
    viewAccountAmount = document.getElementById('viewAccountAmount');
    viewAccountType = document.getElementById('viewAccountType');
    viewAccountDesc = document.getElementById('viewAccountDesc');
    editViewAccount = document.getElementById('editViewAccount');
    deleteViewAccount = document.getElementById('deleteViewAccount');

    viewGoalModal = document.getElementById('viewGoalModal');
    closeViewGoalModal = document.getElementById('closeViewGoalModal');
    viewGoalName = document.getElementById('viewGoalName');
    viewGoalTarget = document.getElementById('viewGoalTarget');
    viewGoalCurrent = document.getElementById('viewGoalCurrent');
    viewGoalProgress = document.getElementById('viewGoalProgress');
    editViewGoal = document.getElementById('editViewGoal');
    deleteViewGoal = document.getElementById('deleteViewGoal');
    
    viewTransactionEmoji = document.getElementById('viewTransactionEmoji');
    viewGoalAmounts = document.getElementById('viewGoalAmounts');
    viewGoalProgressText = document.getElementById('viewGoalProgressText');

    viewAccountEmoji = document.getElementById('viewAccountEmoji');
    viewAccountCreated = document.getElementById('viewAccountCreated');

    // В разделе поиска элементов DOM добавьте:
actionsModal = document.getElementById("actionsModal");
closeActionsModal = document.getElementById("closeActionsModal");
clearDataModal = document.getElementById("clearDataModal");
closeClearDataModal = document.getElementById("closeClearDataModal");
clearDataAction = document.getElementById("clearDataAction");
exportDataAction = document.getElementById("exportDataAction");
clearTransactionsCheckbox = document.getElementById("clearTransactions");
clearAccountsCheckbox = document.getElementById("clearAccounts");
clearGoalsCheckbox = document.getElementById("clearGoals");
clearAllCheckbox = document.getElementById("clearAll");
clearSelectedDataBtn = document.getElementById("clearSelectedData");
actionsBtn = document.querySelector('.menu-btn-actions button');

// В разделе установки слушателей событий добавьте:
if (actionsBtn) {
    actionsBtn.addEventListener('click', openActionsModal);
}

if (closeActionsModal) {
    closeActionsModal.addEventListener('click', () => {
        if (actionsModal) actionsModal.style.display = 'none';
    });
}

if (closeClearDataModal) {
    closeClearDataModal.addEventListener('click', () => {
        if (clearDataModal) clearDataModal.style.display = 'none';
    });
}

// Обработчики для карточек действий
if (clearDataAction) {
    clearDataAction.addEventListener('click', () => {
        actionsModal.style.display = 'none';
        openClearDataModal();
    });
}

if (exportDataAction) {
    exportDataAction.addEventListener('click', () => {
        actionsModal.style.display = 'none';
        exportAllData();
    });
}

// Логика чекбоксов
if (clearAllCheckbox) {
    clearAllCheckbox.addEventListener('change', function() {
        if (this.checked) {
            if (clearTransactionsCheckbox) clearTransactionsCheckbox.checked = true;
            if (clearAccountsCheckbox) clearAccountsCheckbox.checked = true;
            if (clearGoalsCheckbox) clearGoalsCheckbox.checked = true;
            [clearTransactionsCheckbox, clearAccountsCheckbox, clearGoalsCheckbox].forEach(cb => {
                if (cb) cb.disabled = true;
            });
        } else {
            [clearTransactionsCheckbox, clearAccountsCheckbox, clearGoalsCheckbox].forEach(cb => {
                if (cb) cb.disabled = false;
            });
        }
    });
}

[clearTransactionsCheckbox, clearAccountsCheckbox, clearGoalsCheckbox].forEach(checkbox => {
    if (checkbox) {
        checkbox.addEventListener('change', function() {
            if (!this.checked && clearAllCheckbox) {
                clearAllCheckbox.checked = false;
            }
        });
    }
});

if (clearSelectedDataBtn) {
    clearSelectedDataBtn.addEventListener('click', clearSelectedData);
}

// Закрытие по клику вне окна
window.addEventListener('click', (e) => {
    if (e.target === actionsModal) actionsModal.style.display = 'none';
    if (e.target === clearDataModal) clearDataModal.style.display = 'none';
});

// Функции (добавить после DOMContentLoaded):
function openActionsModal() {
    if (actionsModal) actionsModal.style.display = 'block';
}

function openClearDataModal() {
    if (clearTransactionsCheckbox) {
        clearTransactionsCheckbox.checked = true;
        clearTransactionsCheckbox.disabled = false;
    }
    if (clearAccountsCheckbox) {
        clearAccountsCheckbox.checked = false;
        clearAccountsCheckbox.disabled = false;
    }
    if (clearGoalsCheckbox) {
        clearGoalsCheckbox.checked = false;
        clearGoalsCheckbox.disabled = false;
    }
    if (clearAllCheckbox) {
        clearAllCheckbox.checked = false;
    }
    
    if (clearDataModal) clearDataModal.style.display = 'block';
}

function clearSelectedData() {
    const clearTransactions = clearTransactionsCheckbox ? clearTransactionsCheckbox.checked : false;
    const clearAccounts = clearAccountsCheckbox ? clearAccountsCheckbox.checked : false;
    const clearGoals = clearGoalsCheckbox ? clearGoalsCheckbox.checked : false;
    const clearAll = clearAllCheckbox ? clearAllCheckbox.checked : false;
    
    let message = "Вы уверены, что хотите удалить";
    let items = [];
    
    if (clearAll) {
        message += " ВСЕ данные? Это действие нельзя отменить.";
    } else {
        if (clearTransactions) items.push("транзакции");
        if (clearAccounts) items.push("счета");
        if (clearGoals) items.push("цели");
        
        if (items.length === 0) {
            alert("Выберите данные для удаления");
            return;
        }
        
        message += " " + items.join(", ") + "?";
    }
    
    if (!confirm(message)) return;
    
    try {
        if (clearAll || clearTransactions) {
            localStorage.removeItem("income");
            localStorage.removeItem("expenses");
            localStorage.removeItem("incomeTransactions");
            localStorage.removeItem("expensesTransactions");
            income = 0;
            expenses = 0;
            incomeTransactions = [];
            expensesTransactions = [];
        }
        
        if (clearAll || clearAccounts) {
            localStorage.removeItem("accounts");
            accounts = [];
        }
        
        if (clearAll || clearGoals) {
            localStorage.removeItem("goals");
            goals = [];
        }
        
        updateBalance();
        updateEconomy();
        renderTransactionsList();
        renderAccounts();
        renderGoals();
        
        const activeBtn = document.querySelector('.dashboard .period-btn.period-active');
        const currentPeriod = activeBtn ? activeBtn.getAttribute('data-period') : 'month';
        updateChart(currentPeriod);
        updateAverages(currentPeriod);
        
        clearDataModal.style.display = 'none';
        
        alert("Данные успешно удалены");
        
    } catch (error) {
        console.error("Ошибка при удалении данных:", error);
        alert("Произошла ошибка при удалении данных");
    }
}

function exportAllData() {
    try {
        const data = {
            income: income,
            expenses: expenses,
            accounts: accounts,
            goals: goals,
            incomeTransactions: incomeTransactions,
            expensesTransactions: expensesTransactions,
            exportDate: new Date().toISOString(),
            app: "CtrlMoney"
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `CtrlMoney_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert("Данные успешно экспортированы в файл");
        
    } catch (error) {
        console.error("Ошибка при экспорте данных:", error);
        alert("Произошла ошибка при экспорте данных");
    }
}

// Обработчики закрытия модальных окон просмотра
if (closeViewTransactionModal) closeViewTransactionModal.addEventListener('click', () => viewTransactionModal.style.display = 'none');
if (closeViewAccountModal) closeViewAccountModal.addEventListener('click', () => viewAccountModal.style.display = 'none');
if (closeViewGoalModal) closeViewGoalModal.addEventListener('click', () => viewGoalModal.style.display = 'none');

// Закрытие по клику вне окна
window.addEventListener('click', (e) => {
    if (e.target === viewTransactionModal) viewTransactionModal.style.display = 'none';
    if (e.target === viewAccountModal) viewAccountModal.style.display = 'none';
    if (e.target === viewGoalModal) viewGoalModal.style.display = 'none';
});

// Настройка обработчиков для кнопок в модальных окнах просмотра
setupViewModalHandlers();

    // --- 2. Инициализация графиков ---
    incomeExpenseChart = ctx ? new Chart(ctx, {
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

    progressChart = ctxProgress ? new Chart(ctxProgress, {
        type:'bar',
        data:{ labels:['Прогресс'], datasets:[{ label:'Прогресс', data:[0], backgroundColor:'#FF5858', borderRadius:8, stack:'base' }] },
        options:{ indexAxis:'y', scales:{ x:{ min:0, max:100, display:false }, y:{ display:false } }, plugins:{ legend:{ display:false }, tooltip:{ enabled:false } }, responsive:true, maintainAspectRatio:false }
    }) : null

    if (ctxChart) {
        const progress2 = 65
        new Chart(ctxChart, {
            type:'doughnut',
            data:{ datasets:[{ data:[progress2,100-progress2], backgroundColor:['#fff','rgba(220,220,220,0.3)'], borderWidth:0, cutout:'75%' }] },
            options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false }, tooltip:{ enabled:false } } }
        })
    }

    // --- 3. Загрузка данных и состояния ---
    income = parseFloat(localStorage.getItem("income")) || 0
    expenses = parseFloat(localStorage.getItem("expenses")) || 0
    accounts = JSON.parse(localStorage.getItem("accounts")) || []
    goals = JSON.parse(localStorage.getItem('goals')) || []
    incomeTransactions = JSON.parse(localStorage.getItem("incomeTransactions")) || []
    expensesTransactions = JSON.parse(localStorage.getItem("expensesTransactions")) || []
    editingAccountIndex = null

    // --- 4. Начальная отрисовка UI ---
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

    // Установка времени и даты по умолчанию
    resetIncomeModal()
    resetExpensesModal()

    // --- 5. Установка слушателей событий ---

    // Модалка Счетов
    if (addAccountBtn) addAccountBtn.addEventListener('click', openAccountModalForNew)
    if (saveAccountBtn) saveAccountBtn.addEventListener('click', saveAccountFromModal)
    if (deleteAccountBtn) deleteAccountBtn.addEventListener('click', deleteAccountFromModal)
    if (closeAccountModal) closeAccountModal.addEventListener('click', () => { if (accountModal) accountModal.style.display = 'none' })

    const accountMenu = document.getElementById('accountMenu')
    if (accountMenu) {
        accountMenu.addEventListener('click', (e) => {
            const target = e.target
            if (target && (target.id === 'addAccountBtn' || target.parentElement.id === 'addAccountBtn')) return
            openAccountModalForNew()
        })
    }

    // Модалка Целей
    const goalModal = document.getElementById('goalModal')
    const closeGoalModal = document.getElementById('closeGoalModal')
    const saveGoalBtn = document.getElementById('saveGoal')
    const goalMenuBtn = document.querySelector('.menu-btn-target button')
    
    // Обработчики событий для целей
    if (goalMenuBtn) {
        goalMenuBtn.addEventListener('click', openGoalModalForNew)
    }
    
    if (saveGoalBtn) {
        saveGoalBtn.addEventListener('click', saveGoalFromModal)
    }
    
    if (closeGoalModal) {
        closeGoalModal.addEventListener('click', () => {
            if (goalModal) goalModal.style.display = 'none'
        });
    }
    
    // Закрытие модалки по клику вне ее
    window.addEventListener('click', (e) => {
        if (e.target === goalModal) {
            goalModal.style.display = 'none'
        }
    })

    // Модалки Доходов/Расходов (ИСПРАВЛЕНО: добавлен сброс)
    if (incomeBtn) incomeBtn.addEventListener("click", () => {
        editingTransactionIndex = null;
        editingTransactionIsIncome = null;
        resetIncomeModal();
        
        const titleEl = incomeModal.querySelector('h2');
        if (titleEl) titleEl.textContent = 'Добавить доход';
        
        incomeModal.style.display = "block";
    })

    if (expensesBtn) expensesBtn.addEventListener("click", () => {
        editingTransactionIndex = null;
        editingTransactionIsIncome = null;
        resetExpensesModal();
        
        const titleEl = expensesModal.querySelector('h2');
        if (titleEl) titleEl.textContent = 'Добавить трату';
        
        expensesModal.style.display = "block";
    })
    if (closeIncomeModal) closeIncomeModal.addEventListener("click", () => incomeModal.style.display = "none")
    if (closeExpensesModal) closeExpensesModal.addEventListener("click", () => expensesModal.style.display = "none")

    // ОПТИМИЗИРОВАНО: Один слушатель для закрытия модалок по клику вне
    window.addEventListener("click", (e) => {
        if (e.target === incomeModal) incomeModal.style.display = "none"
        if (e.target === expensesModal) expensesModal.style.display = "none"
        if (e.target === accountModal) accountModal.style.display = "none"
    if (e.target === goalModal) goalModal.style.display = "none" 
   })

    // Кнопки добавления
    if (addIncomeBtn) addIncomeBtn.addEventListener("click", addIncome)
    if (incomeInput) incomeInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addIncome() })
    if (addExpensesBtn) addExpensesBtn.addEventListener("click", addExpense)
    if (expensesInput) expensesInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addExpense() })

    // Кнопки периода
    const economyPeriodButtons = document.querySelectorAll('.economy .period-btn')
    economyPeriodButtons.forEach(button => {
        button.addEventListener('click', function() {
            economyPeriodButtons.forEach(btn => btn.classList.remove('period-active'))
            this.classList.add('period-active')
            const selectedPeriod = this.getAttribute('data-period')
            updateContent(selectedPeriod, 'economy')
        })
    })

    const chartPeriodButtons = document.querySelectorAll('.dashboard .period-btn')
    chartPeriodButtons.forEach(button => {
        button.addEventListener('click', function() {
            chartPeriodButtons.forEach(btn => btn.classList.remove('period-active'))
            this.classList.add('period-active')
            const selectedPeriod = this.getAttribute('data-period')
            updateContent(selectedPeriod, 'chart')
        })
    })

    // --- 6. Финальная отрисовка при загрузке ---
    renderGoals()
    renderAccounts()
    updateContent('month', 'all') // Загружаем данные за месяц по умолчанию
    renderTransactionsList()
})
