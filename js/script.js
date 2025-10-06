document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('incomeExpenseChart').getContext('2d')
    
    const incomeExpenseChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'],
            datasets: [
                { label: 'Доход', data: [65000,59000,80000,81000,56000,55000,70000,75000,60000,85000,90000,95000], borderColor: '#FF8A5C', tension:0.4 },
                { label: 'Траты', data: [45000,48000,40000,51000,42000,38000,47000,43000,49000,46000,52000,48000], borderColor:'#FF5858', tension:0.4 }
            ]
        },
        options: {
            responsive:true,
            maintainAspectRatio:false,
            plugins:{ legend:{ display:false } },
            scales:{
                x:{ grid:{ display:false }, border:{ display:false } },
                y:{ display:false, grid:{ display:false } }
            }
        }
    })

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
      expensesBtn = document.getElementById("expensesBtn"),
      expensesModal = document.getElementById("expensesModal"),
      addExpensesBtn = document.getElementById("addExpenses"),
      expensesInput = document.getElementById("expensesAmount"),
      closeIncomeModal = document.getElementById("closeIncomeModal"),
      closeExpensesModal = document.getElementById("closeExpensesModal"),
      incomeText = document.getElementById("incomeText"),
      expensesText = document.getElementById("expensesText"),
      balanceText = document.getElementById("balanceText")

// Загружаем данные
let income = parseFloat(localStorage.getItem("income")) || 0,
    expenses = parseFloat(localStorage.getItem("expenses")) || 0

// Проверяем элементы перед использованием
if (incomeText && expensesText && balanceText) {
    const incomeValue = formatNumber(income) + "₽"
    const expensesValue = formatNumber(expenses) + "₽"
    const balanceValue = formatNumber(income - expenses) + "₽"

    incomeText.textContent = incomeValue
    expensesText.textContent = expensesValue
    balanceText.textContent = balanceValue

    // Применяем адаптивный размер при загрузке
    adjustFontSize(incomeText, incomeValue, "small")
    adjustFontSize(expensesText, expensesValue, "small")
    adjustFontSize(balanceText, balanceValue, "large")
} else {
    console.error("Один или несколько элементов (incomeText, expensesText, balanceText) не найдены")
}

// --- Форматирование чисел с разделителями тысяч ---
function formatNumber(number) {
    return new Intl.NumberFormat('ru-RU').format(number)
}

// --- Адаптивный размер шрифта ---
function adjustFontSize(element, text, type) {
    if (!element) {
        console.error("Элемент для adjustFontSize не передан")
        return
    }
    const length = text.length
    // Сброс overflow
    element.style.whiteSpace = 'normal'
    element.style.textOverflow = 'clip'
    element.style.overflow = 'visible'

    // Базовый размер
    let fontSize = 1 // = 1em

    if (type === "small") {
        if (length <= 8) fontSize = 1
        else if (length <= 10) fontSize = 0.9
        else if (length <= 12) fontSize = 0.68
        else if (length <= 14) fontSize = 0.7
        else if (length <= 16) fontSize = 0.65
        else if (length <= 20) fontSize = 0.6
        else if (length <= 25) fontSize = 0.55
        else if (length <= 30) fontSize = 0.5
        else fontSize = 0.45 // минимальный размер
    } else if (type === "medium") {
        if (length <= 8) fontSize = 1
        else if (length <= 25) fontSize = .95
        else fontSize = .85 // минимальный размер

    } else if (type === "large") {
        if (length <= 8) fontSize = 1.2
        else if (length <= 10) fontSize = 1.1
        else if (length <= 12) fontSize = 0.95
        else if (length <= 14) fontSize = 0.9
        else if (length <= 16) fontSize = 0.85
        else if (length <= 20) fontSize = 0.8
        else if (length <= 25) fontSize = 0.75
        else if (length <= 30) fontSize = 0.7
        else fontSize = 0.65 // минимальный размер
    }

    element.style.fontSize = fontSize + "em"
}

// --- Обновление баланса и экономики ---
function updateBalance() {
    if (balanceText) {
        const balanceValue = formatNumber(income - expenses) + "₽"
        balanceText.textContent = balanceValue
        adjustFontSize(balanceText, balanceValue, "large")
    }
}

function updateEconomy() {
    let savings = income - expenses
    let savingsPercent = income > 0 ? Math.round((savings / income) * 100) : 0

    const savingsElement = document.getElementById("savingsText")
    if (savingsElement) {
        const savingsText = formatNumber(savings) + "₽"
        savingsElement.textContent = savingsText
        adjustFontSize(savingsElement, savingsText, "medium")
    }

    const progressText = document.getElementById("progressText")
    if (progressText) {
        progressText.textContent = savingsPercent + "%"
    }

    // Проверка структуры чарта
    if (window.progressChart && window.progressChart.data && window.progressChart.data.datasets && window.progressChart.data.datasets[0]) {
        window.progressChart.data.datasets[0].data[0] = savingsPercent
        window.progressChart.update()
    } else {
        console.warn("progressChart не инициализирован или имеет некорректную структуру")
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

// --- Добавление дохода ---
function addIncome() {
    const amount = parseFloat(incomeInput.value)
    if (!isNaN(amount) && amount > 0) {
        updateIncome(amount)
        incomeInput.value = ""
        incomeModal.style.display = "none"
    } else {
        alert("Введите корректную сумму")
    }
}

if (addIncomeBtn) addIncomeBtn.addEventListener("click", addIncome)
if (incomeInput) incomeInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addIncome() })


const expensesDate = document.getElementById("expensesDate")
const expensesTime = document.getElementById("expensesTime")

// --- Добавление расхода ---
function addExpense() {
    let inputValue = expensesInput.value.trim()
    
    inputValue = inputValue.value.match(/[\d\s,]+/g).join('').replace(',', '.')
    let amount = parseFloat(inputValue)
    const selectedTime = expensesTime.value
    const selectedDate = expensesDate.value

    
    if (!isNaN(amount) && amount !== 0) {
        amount = Math.abs(amount)

        if (selectedTime && selectedDate) {
            const dateObj = new Date(selectedDate)
            const [hours, minutes] = selectedTime.split(":").map(Number)
            dateObj.setHours(hours, minutes, 0, 0)
        }
        updateExpenses(amount)
        expensesInput.value = ""
        expensesModal.style.display = "none"
    } else {
        alert("Введите корректную сумму")
    }
}

if (addExpensesBtn) addExpensesBtn.addEventListener("click", addExpense)
if (expensesInput) expensesInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addExpense() })

// --- Инициализация экономики при загрузке ---
updateEconomy()



