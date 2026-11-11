
const input = document.getElementById('inputBox');
const buttons = document.querySelectorAll('.calculator .button');
const historyList = document.getElementById('historyList');
const clearHistory = document.getElementById('clearHistory');
const themeToggle = document.getElementById('themeToggle');

let string = "";
let calculationHistory = [];

try {
    calculationHistory = JSON.parse(
        localStorage.getItem("calculatorHistory") || "[]"
    );

    if (!Array.isArray(calculationHistory)) {
        calculationHistory = [];
    }
} catch (error) {
    calculationHistory = [];
}

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
}

function saveHistory(expression, result) {
    calculationHistory.unshift({
        expression: expression,
        result: result
    });

    calculationHistory = calculationHistory.slice(0, 10);

    localStorage.setItem(
        "calculatorHistory",
        JSON.stringify(calculationHistory)
    );

    displayHistory();
}

buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        const value = e.currentTarget.textContent.trim();

        if (value === '=') {
            if (string === "") return;

            try {
                const expression = string;
                const result = eval(expression);

                if (!Number.isFinite(result)) {
                    throw new Error("Invalid calculation");
                }

                const finalResult = Number.parseFloat(
                    result.toPrecision(12)
                );

                string = String(finalResult);
                input.value = string;

                saveHistory(expression, finalResult);

            } catch (error) {
                input.value = "Error";
                string = "";
            }
        }

        else if (value === 'AC') {
            string = "";
            input.value = "";
        }

        else if (value === 'DEL') {
            if (input.value === "Error") {
                string = "";
            } else {
                string = string.substring(0, string.length - 1);
            }

            input.value = string;
        }

        else if (value === '%') {
            if (string !== "") {
                try {
                    const result = eval(string) / 100;

                    if (!Number.isFinite(result)) {
                        throw new Error("Invalid calculation");
                    }

                    string = String(result);
                    input.value = string;

                } catch (error) {
                    string = "";
                    input.value = "Error";
                }
            }
        }

        else {
            if (input.value === "Error") {
                string = "";
            }

            string += value;
            input.value = string;
        }
    });
});

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");

        if (document.body.classList.contains("light-mode")) {
            themeToggle.textContent = "🌙 Dark Mode";
        } else {
            themeToggle.textContent = "☀️ Light Mode";
        }
    });
}

if (clearHistory) {
    clearHistory.addEventListener("click", () => {
        calculationHistory = [];
        localStorage.removeItem("calculatorHistory");
        displayHistory();
    });
}

displayHistory();

const scientificButtons = document.querySelectorAll(".scientific-button");

scientificButtons.forEach(button => {

    button.addEventListener("click", () => {

        const operation = button.dataset.scientific;

        if (operation === "pi") {
            string += String(Math.PI);
            input.value = string;
            return;
        }

        if (operation === "e") {
            string += String(Math.E);
            input.value = string;
            return;
        }

        if (string === "") return;

        try {

            const number = eval(string);

            let result;

            switch (operation) {

                case "sqrt":
                    result = Math.sqrt(number);
                    break;

                case "square":
                    result = number ** 2;
                    break;

                case "sin":
                    result = Math.sin(number * Math.PI / 180);
                    break;

                case "cos":
                    result = Math.cos(number * Math.PI / 180);
                    break;

                case "tan":
                    result = Math.tan(number * Math.PI / 180);
                    break;

                case "log":
                    result = Math.log10(number);
                    break;

                case "ln":
                    result = Math.log(number);
                    break;

                case "reciprocal":
                    result = 1 / number;
                    break;

            }

            if (!Number.isFinite(result)) {
                throw new Error("Invalid calculation");
            }

            const expression = operation + "(" + string + ")";

            result = Number.parseFloat(result.toPrecision(12));

            string = String(result);
            input.value = string;

            saveHistory(expression, result);

        } catch (error) {

            input.value = "Error";
            string = "";

        }

    });

});

document.addEventListener("keydown", function(event) {

    const key = event.key;

    if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
    }

    if (/^[0-9]$/.test(key) || key === "00") {

        const button = Array.from(buttons).find(
            btn => btn.textContent.trim() === key
        );

        if (button) button.click();

    }

    else if ("+-*/".includes(key)) {

        const button = Array.from(buttons).find(
            btn => btn.textContent.trim() === key
        );

        if (button) button.click();

    }

    else if (key === ".") {

        const button = Array.from(buttons).find(
            btn => btn.textContent.trim() === "."
        );

        if (button) button.click();

    }

    else if (key === "Enter" || key === "=") {

        event.preventDefault();

        const button = Array.from(buttons).find(
            btn => btn.textContent.trim() === "="
        );

        if (button) button.click();

    }

    else if (key === "Backspace") {

        event.preventDefault();

        const button = Array.from(buttons).find(
            btn => btn.textContent.trim() === "DEL"
        );

        if (button) button.click();

    }

    else if (key === "Escape") {

        const button = Array.from(buttons).find(
            btn => btn.textContent.trim() === "AC"
        );

        if (button) button.click();

    }

    else if (key === "%") {

        const button = Array.from(buttons).find(
            btn => btn.textContent.trim() === "%"
        );

        if (button) button.click();

    }

});
