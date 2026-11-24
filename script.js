// ========================================================
// CodeTyper - ملف الجافاسكريبت (script.js)
// فريق العمل: Alpha Team
// ========================================================

// 1. مكتبة الأكواد الخاصة بمناهج أولى حاسبات
const snippets = {
    "C++": [
        `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello FCI!" << endl;\n    return 0;\n}`,
        `int n = 5, fact = 1;\nfor (int i = 1; i <= n; i++) {\n    fact *= i;\n}\ncout << "Factorial: " << fact;`,
        `int arr[4] = {10, 20, 30, 40};\nint sum = 0;\nfor (int x : arr) {\n    sum += x;\n}\ncout << sum;`
    ],
    "Python": [
        `grades = [3.5, 3.8, 3.2, 4.0]\ngpa = sum(grades) / len(grades)\nprint("Your GPA is:", gpa)`,
        `numbers = [1, 2, 3, 4, 5]\neven_nums = [x for x in numbers if x % 2 == 0]\nprint(even_nums)`,
        `name = input("Enter your name: ")\nprint(f"Welcome to CS, {name}!")`
    ],
    "JavaScript": [
        `function add(a, b) {\n    return a + b;\n}\nconsole.log(add(10, 20));`,
        `const courses = ["Math", "Programming", "Physics"];\ncourses.forEach(c => console.log(c));`,
        `document.getElementById("btn").addEventListener("click", () => {\n    alert("Hello Alpha Team!");\n});`
    ]
};

// 2. ربط عناصر الـ HTML بالـ JavaScript
const codeBox = document.getElementById("code");
const codeInput = document.getElementById("code2");
const mainArea = document.querySelector("main");
const langSelect = document.getElementById("lango");
const timeSelect = document.getElementById("time") || document.querySelectorAll("section select")[1];
const timerDisplay = document.getElementById("timer-val");
const wpmDisplay = document.getElementById("wpm-val");
const accuracyDisplay = document.getElementById("accuracy-val");
const restartButton = document.getElementById("restart");
const soundButton = document.getElementById("sound");
const tabTitle = document.getElementById("tab");
const clickMessage = document.getElementById("click");

// 3. متغيرات حالة التطبيق
let currentText = "";
let currentIndex = 0;
let mistakes = 0;
let totalTyped = 0;
let timer = null;
let timeLeft = 60;
let totalTime = 60;
let isRunning = false;
let soundEnabled = true;

// 4. نظام صوت الكيبورد الميكانيكي (Web Audio API)
function playKeyClickSound() {
    if (!soundEnabled) return;
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.frequency.setValueAtTime(450, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.04);

        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.04);
    } catch (e) {}
}

// 5. دالة تحميل كود جديد وتجهيز الشاشة
function loadNewSnippet() {
    clearInterval(timer);
    isRunning = false;

    const lang = langSelect.value;
    const timeValStr = timeSelect ? timeSelect.value : "60sec";
    totalTime = parseInt(timeValStr, 10) || 60;
    timeLeft = totalTime;

    const filenames = {
        "C++": "📄 main.cpp",
        "Python": "🐍 script.py",
        "JavaScript": "⚡ app.js"
    };
    if (tabTitle) tabTitle.textContent = filenames[lang] || "📄 code.txt";

    const list = snippets[lang] || snippets["C++"];
    const randomIndex = Math.floor(Math.random() * list.length);
    currentText = list[randomIndex];

    currentIndex = 0;
    mistakes = 0;
    totalTyped = 0;
    if (timerDisplay) timerDisplay.textContent = timeLeft;
    if (wpmDisplay) wpmDisplay.textContent = "0";
    if (accuracyDisplay) accuracyDisplay.textContent = "100";
    if (codeInput) codeInput.value = "";

    if (clickMessage) {
        clickMessage.style.display = "block";
        clickMessage.textContent = "اضغط هنا وابدأ الكتابة على الكيبورد ⌨️";
        clickMessage.style.backgroundColor = "transparent";
        clickMessage.style.color = "rgb(39, 193, 199)";
    }

    // تقسيم كل حرف داخل span
    codeBox.innerHTML = "";
    currentText.split("").forEach((char, index) => {
        const span = document.createElement("span");
        span.classList.add("char");
        span.textContent = char;

        if (index === 0) {
            span.classList.add("current");
        }
        codeBox.appendChild(span);
    });

    if (codeInput) codeInput.focus();
}

// 6. دالة تشغيل عداد الوقت
function startTimer() {
    isRunning = true;
    if (clickMessage) clickMessage.style.display = "none";

    timer = setInterval(() => {
        timeLeft--;
        if (timerDisplay) timerDisplay.textContent = timeLeft;

        updateStats();

        if (timeLeft <= 0) {
            finishTest();
        }
    }, 1000);
}

// 7. حساب السرعة والدقة
function updateStats() {
    const timeElapsed = (totalTime - timeLeft) / 60;
    const correctChars = currentIndex - mistakes;

    let wpm = 0;
    if (timeElapsed > 0 && correctChars > 0) {
        wpm = Math.round((correctChars / 5) / timeElapsed);
    }
    if (wpmDisplay) wpmDisplay.textContent = wpm >= 0 ? wpm : 0;

    let accuracy = 100;
    if (totalTyped > 0) {
        accuracy = Math.round(((totalTyped - mistakes) / totalTyped) * 100);
    }
    if (accuracyDisplay) accuracyDisplay.textContent = accuracy >= 0 ? accuracy : 0;
}

// 8. التعامل مع ضغطات أزرار الكيبورد
if (codeInput) {
    codeInput.addEventListener("keydown", (e) => {
        if (["Shift", "Control", "Alt", "Meta", "CapsLock"].includes(e.key)) {
            return;
        }

        if (!isRunning && timeLeft > 0) {
            startTimer();
        }

        if (timeLeft <= 0) return;

        const charSpans = codeBox.querySelectorAll(".char");

        // زر المسح (Backspace)
        if (e.key === "Backspace") {
            if (currentIndex > 0) {
                charSpans[currentIndex].classList.remove("current");
                currentIndex--;
                charSpans[currentIndex].classList.remove("correct", "incorrect");
                charSpans[currentIndex].classList.add("current");
            }
            return;
        }

        if (currentIndex >= currentText.length) {
            finishTest();
            return;
        }

        playKeyClickSound();

        const expectedChar = currentText[currentIndex];
        let typedChar = e.key === "Enter" ? "\n" : e.key;

        totalTyped++;
        charSpans[currentIndex].classList.remove("current");

        if (typedChar === expectedChar) {
            charSpans[currentIndex].classList.add("correct");
        } else {
            charSpans[currentIndex].classList.add("incorrect");
            mistakes++;
        }

        currentIndex++;

        if (currentIndex < currentText.length) {
            charSpans[currentIndex].classList.add("current");
        } else {
            finishTest();
        }

        updateStats();
    });
}

// 9. إنهاء الاختبار
function finishTest() {
    clearInterval(timer);
    isRunning = false;
    if (codeInput) codeInput.blur();

    const finalWPM = wpmDisplay ? wpmDisplay.textContent : 0;
    const finalAcc = accuracyDisplay ? accuracyDisplay.textContent : 100;

    if (clickMessage) {
        clickMessage.textContent = `🎉 انتهى الاختبار! سرعتك: ${finalWPM} كلمة/دقيقة | الدقة: ${finalAcc}%`;
        clickMessage.style.display = "block";
        clickMessage.style.backgroundColor = "rgb(39, 193, 199)";
        clickMessage.style.color = "#000000";
        clickMessage.style.fontWeight = "bold";
        clickMessage.style.borderRadius = "6px";
    }
}

// 10. تفعيل الأحداث للأزرار والقوائم
if (mainArea) {
    mainArea.addEventListener("click", () => {
        if (codeInput) codeInput.focus();
    });
}

if (langSelect) {
    langSelect.addEventListener("change", loadNewSnippet);
}

if (timeSelect) {
    timeSelect.addEventListener("change", loadNewSnippet);
}

if (restartButton) {
    restartButton.addEventListener("click", loadNewSnippet);
}

if (soundButton) {
    soundButton.addEventListener("click", () => {
        soundEnabled = !soundEnabled;
        soundButton.textContent = soundEnabled ? "🔊 صوت الكيبورد: مفعل" : "🔇 صوت الكيبورد: معطل";
        soundButton.style.borderColor = soundEnabled ? "rgb(39, 193, 199)" : "#ff4d4d";
        if (codeInput) codeInput.focus();
    });
}

window.addEventListener("DOMContentLoaded", () => {
    loadNewSnippet();
});