let input = document.getElementById('inputBox');
let buttons = document.querySelectorAll('button');

let string = "";
let arr = Array.from(buttons);
// HISTORY ELEMENTS

const historyList = document.getElementById("historyList");
const clearHistory = document.getElementById("clearHistory");

// Load saved history from browser storage
let calculationHistory = JSON.parse(
    localStorage.getItem("calculatorHistory") || "[]"
);
arr.forEach(button => {
    button.addEventListener('click', (e) =>{
        if(e.target.innerHTML == '='){

    try {

        let expression = string;

        let result = eval(string);

        if (!Number.isFinite(result)) {
            throw new Error("Invalid calculation");
        }

        result = Number.parseFloat(result.toPrecision(12));

        string = String(result);

        input.value = string;

        saveHistory(expression, result);

    } catch (error) {

        input.value = "Error";
        string = "";

    }

}

        else if(e.target.innerHTML == 'AC'){
            string = "";
            input.value = string;
        }
        else if(e.target.innerHTML == 'DEL'){
            string = string.substring(0, string.length-1);
            input.value = string;
        }
        else{
            string += e.target.innerHTML;
            input.value = string;
        }
        
    })
})
const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("light-mode");

    if (document.body.classList.contains("light-mode")) {
        themeToggle.textContent = "🌙 Dark Mode";
    } else {
        themeToggle.textContent = "☀️ Light Mode";
    }

});

// DISPLAY CALCULATION HISTORY

function displayHistory() {

    historyList.innerHTML = "";

    calculationHistory.forEach(item => {

        const li = document.createElement("li");

        const expression = document.createElement("span");
        expression.className = "history-expression";
        expression.textContent = item.expression;

        const result = document.createElement("span");
        result.className = "history-result";
        result.textContent = item.result;

        li.appendChild(expression);
        li.appendChild(result);

        historyList.appendChild(li);

    });

    // SAVE CALCULATION TO HISTORY

function saveHistory(expression, result) {

    calculationHistory.unshift({
        expression: expression,
        result: result
    });

    // Keep only the latest 10 calculations
    calculationHistory = calculationHistory.slice(0, 10);

    // Save history in browser storage
    localStorage.setItem(
        "calculatorHistory",
        JSON.stringify(calculationHistory)
    );

    displayHistory();

}
}
// CLEAR CALCULATION HISTORY

clearHistory.addEventListener("click", () => {

    calculationHistory = [];

    localStorage.removeItem("calculatorHistory");

    displayHistory();

});
// LOAD HISTORY WHEN PAGE OPENS

displayHistory();