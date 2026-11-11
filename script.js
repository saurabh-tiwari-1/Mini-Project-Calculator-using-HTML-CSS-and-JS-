
const input = document.getElementById("inputBox");
const buttons = document.querySelectorAll(".calculator .button");
const scientificButtons = document.querySelectorAll(".scientific-button");

const historyList = document.getElementById("historyList");
const emptyHistory = document.getElementById("emptyHistory");
const clearHistory = document.getElementById("clearHistory");

const themeToggle = document.getElementById("themeToggle");
const angleToggle = document.getElementById("angleToggle");
const copyResult = document.getElementById("copyResult");

const totalCalculationsElement = document.getElementById("totalCalculations");
const averageResultElement = document.getElementById("averageResult");
const lastResultElement = document.getElementById("lastResult");

let string = "";
let justEvaluated = false;

let calculationHistory = [];

let angleMode = localStorage.getItem("calculatorAngleMode") || "DEG";

if (!["DEG", "RAD"].includes(angleMode)) {
    angleMode = "DEG";
}

let calculatorStats = {
    total: 0,
    sum: 0,
    last: 0
};

try {
    const savedHistory = JSON.parse(
        localStorage.getItem("calculatorHistory") || "[]"
    );

    if (Array.isArray(savedHistory)) {
        calculationHistory = savedHistory
            .filter(item =>
                item &&
                typeof item.expression === "string" &&
                Number.isFinite(Number(item.result))
            )
            .slice(0, 10);
    }
} catch (error) {
    calculationHistory = [];
}

try {
    const savedStats = JSON.parse(
        localStorage.getItem("calculatorStats") || "{}"
    );

    if (
        Number.isFinite(savedStats.total) &&
        Number.isFinite(savedStats.sum) &&
        Number.isFinite(savedStats.last)
    ) {
        calculatorStats = {
            total: savedStats.total,
            sum: savedStats.sum,
            last: savedStats.last
        };
    }
} catch (error) {
    calculatorStats = {
        total: 0,
        sum: 0,
        last: 0
    };
}

function formatNumber(number) {
    if (!Number.isFinite(number)) {
        throw new Error("Invalid result");
    }

    return Number(number.toPrecision(12)).toString();
}

function evaluateExpression(expression) {

    const tokens = expression.match(
        /(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?|[+\-*/]/gi
    );

    if (
        !tokens ||
        tokens.join("").toLowerCase() !==
        expression.replace(/\s/g, "").toLowerCase()
    ) {
        throw new Error("Invalid expression");
    }

    let position = 0;

    function parsePrimary() {

        const token = tokens[position];

        if (token === "+" || token === "-") {
            position++;

            const value = parsePrimary();

            return token === "-" ? -value : value;
        }

        if (token === undefined) {
            throw new Error("Incomplete expression");
        }

        position++;

        const value = Number(token);

        if (!Number.isFinite(value)) {
            throw new Error("Invalid number");
        }

        return value;
    }

    function parseTerm() {

        let value = parsePrimary();

        while (
            tokens[position] === "*" ||
            tokens[position] === "/"
        ) {

            const operator = tokens[position++];

            const nextValue = parsePrimary();

            if (operator === "*") {
                value *= nextValue;
            } else {
                value /= nextValue;
            }

        }

        return value;
    }

    function parseExpression() {

        let value = parseTerm();

        while (
            tokens[position] === "+" ||
            tokens[position] === "-"
        ) {

            const operator = tokens[position++];

            const nextValue = parseTerm();

            if (operator === "+") {
                value += nextValue;
            } else {
                value -= nextValue;
            }

        }

        return value;
    }

    const result = parseExpression();

    if (position !== tokens.length || !Number.isFinite(result)) {
        throw new Error("Invalid calculation");
    }

    return result;
}

function updateStatistics() {

    totalCalculationsElement.textContent =
        calculatorStats.total.toLocaleString();

    const average = calculatorStats.total > 0
        ? calculatorStats.sum / calculatorStats.total
        : 0;

    averageResultElement.textContent =
        formatNumber(average);

    lastResultElement.textContent =
        formatNumber(calculatorStats.last);

}

function displayHistory() {

    historyList.innerHTML = "";

    emptyHistory.style.display =
        calculationHistory.length === 0 ? "block" : "none";

    calculationHistory.forEach(item => {

        const li = document.createElement("li");

        const expression = document.createElement("span");
        expression.className = "history-expression";
        expression.textContent = item.expression;

        const result = document.createElement("span");
        result.className = "history-result";
        result.textContent = formatNumber(Number(item.result));

        li.appendChild(expression);
        li.appendChild(result);

        li.title = "Click to reuse this result";

        li.addEventListener("click", () => {

            string = formatNumber(Number(item.result));
            input.value = string;
            justEvaluated = true;

        });

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

    calculatorStats.total++;
    calculatorStats.sum += result;
    calculatorStats.last = result;

    localStorage.setItem(
        "calculatorStats",
        JSON.stringify(calculatorStats)
    );

    displayHistory();
    updateStatistics();

}

function calculate() {

    if (string.trim() === "") {
        return;
    }

    try {

        const expression = string;

        const result = evaluateExpression(expression);

        const finalResult = Number(formatNumber(result));

        string = formatNumber(finalResult);
        input.value = string;

        justEvaluated = true;

        saveHistory(expression, finalResult);

    } catch (error) {

        input.value = "Error";
        string = "";
        justEvaluated = false;

    }

}

function clearCalculator() {

    string = "";
    input.value = "";
    justEvaluated = false;

}

function deleteLastCharacter() {

    if (input.value === "Error") {
        clearCalculator();
        return;
    }

    string = string.slice(0, -1);
    input.value = string;
    justEvaluated = false;

}

function handleButton(value) {

    if (value === "=") {
        calculate();
        return;
    }

    if (value === "AC") {
        clearCalculator();
        return;
    }

    if (value === "DEL") {
        deleteLastCharacter();
        return;
    }

    if (value === "%") {

        if (string.trim() === "") {
            return;
        }

        try {

            const expression = string + "%";
            const result = evaluateExpression(string) / 100;

            string = formatNumber(result);
            input.value = string;

            justEvaluated = true;

            saveHistory(expression, result);

        } catch (error) {

            input.value = "Error";
            string = "";
            justEvaluated = false;

        }

        return;
    }

    if (input.value === "Error") {
        clearCalculator();
    }

    if (justEvaluated) {

        if (/^[0-9.]$/.test(value) || value === "00") {
            string = "";
            input.value = "";
        }

        justEvaluated = false;

    }

    if ("+-*/".includes(value)) {

        if (string === "" && value !== "-") {
            return;
        }

        const lastCharacter = string.slice(-1);

        if ("+-*/".includes(lastCharacter)) {

            if (value === "-" && lastCharacter !== "-") {
                string += value;
            } else {
                string = string.slice(0, -1) + value;
            }

        } else {
            string += value;
        }

    } else {

        if (value === ".") {

            const currentNumber = string.split(/[+\-*/]/).pop();

            if (currentNumber.includes(".")) {
                return;
            }

        }

        string += value;

    }

    input.value = string;

}

buttons.forEach(button => {

    button.addEventListener("click", () => {

        handleButton(button.dataset.value);

    });

});

function toRadians(value) {

    return angleMode === "DEG"
        ? value * Math.PI / 180
        : value;

}

function handleScientific(operation) {

    if (operation === "pi" || operation === "e") {

        if (justEvaluated) {
            string = "";
            justEvaluated = false;
        }

        if (input.value === "Error") {
            clearCalculator();
        }

        const constant = operation === "pi"
            ? String(Math.PI)
            : String(Math.E);

        if (/[0-9.]$/.test(string)) {
            string += "*";
        }

        string += constant;
        input.value = string;

        return;

    }

    if (string.trim() === "") {
        return;
    }

    try {

        const number = evaluateExpression(string);

        let result;

        switch (operation) {

            case "sqrt":
                result = Math.sqrt(number);
                break;

            case "square":
                result = number ** 2;
                break;

            case "sin":
                result = Math.sin(toRadians(number));
                break;

            case "cos":
                result = Math.cos(toRadians(number));
                break;

            case "tan": {

                const angle = toRadians(number);

                if (Math.abs(Math.cos(angle)) < 1e-12) {
                    throw new Error("Undefined tangent");
                }

                result = Math.tan(angle);
                break;

            }

            case "log":
                result = Math.log10(number);
                break;

            case "ln":
                result = Math.log(number);
                break;

            case "reciprocal":
                result = 1 / number;
                break;

            default:
                throw new Error("Unknown operation");

        }

        if (!Number.isFinite(result)) {
            throw new Error("Invalid calculation");
        }

        const expression = operation + "(" + string + ")";

        result = Number(formatNumber(result));

        string = formatNumber(result);
        input.value = string;

        justEvaluated = true;

        saveHistory(expression, result);

    } catch (error) {

        input.value = "Error";
        string = "";
        justEvaluated = false;

    }

}

scientificButtons.forEach(button => {

    button.addEventListener("click", () => {

        handleScientific(button.dataset.scientific);

    });

});

angleToggle.textContent = angleMode;

angleToggle.addEventListener("click", () => {

    angleMode = angleMode === "DEG" ? "RAD" : "DEG";

    angleToggle.textContent = angleMode;

    localStorage.setItem(
        "calculatorAngleMode",
        angleMode
    );

});

if (localStorage.getItem("calculatorTheme") === "light") {

    document.body.classList.add("light-mode");
    themeToggle.textContent = "🌙 Dark Mode";

}

themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("light-mode");

    const isLight = document.body.classList.contains("light-mode");

    themeToggle.textContent = isLight
        ? "🌙 Dark Mode"
        : "☀️ Light Mode";

    localStorage.setItem(
        "calculatorTheme",
        isLight ? "light" : "dark"
    );

});

clearHistory.addEventListener("click", () => {

    calculationHistory = [];

    localStorage.removeItem("calculatorHistory");

    displayHistory();

});

copyResult.addEventListener("click", async () => {

    if (
        input.value.trim() === "" ||
        input.value === "Error"
    ) {
        return;
    }

    try {

        await navigator.clipboard.writeText(input.value);

        copyResult.textContent = "✓ Copied!";

        setTimeout(() => {

            copyResult.textContent = "📋 Copy Result";

        }, 1500);

    } catch (error) {

        copyResult.textContent = "Copy unavailable";

        setTimeout(() => {

            copyResult.textContent = "📋 Copy Result";

        }, 1500);

    }

});

document.addEventListener("keydown", event => {

    if (
        event.ctrlKey ||
        event.altKey ||
        event.metaKey
    ) {
        return;
    }

    const key = event.key;

    if (/^[0-9]$/.test(key)) {

        handleButton(key);

    } else if ("+-*/".includes(key)) {

        handleButton(key);

    } else if (key === ".") {

        handleButton(".");

    } else if (key === "Enter" || key === "=") {

        event.preventDefault();
        handleButton("=");

    } else if (key === "Backspace") {

        event.preventDefault();
        handleButton("DEL");

    } else if (key === "Escape") {

        handleButton("AC");

    } else if (key === "%") {

        handleButton("%");

    }

});

displayHistory();
updateStatistics();
