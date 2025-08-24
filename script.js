// Глобальные переменные
let globalCoins = 100;
let currentChamber = 0;
let bulletChamber = 0;
let round = 1;
let maxRounds = 6;
let chambersCount = 6;
let bulletsCount = 1;
let wheelSpinning = false;
let wheel;
let wheelCanvas;
let wheelOptions = [
    { text: "20 монет", color: "#e94560", value: 20, weight: 15 },
    { text: "50 монет", color: "#00b4d8", value: 50, weight: 8 },
    { text: "10 монет", color: "#ff9e00", value: 10, weight: 20 },
    { text: "100 монет", color: "#2dc659", value: 100, weight: 5 },
    { text: "5 монет", color: "#9d4edd", value: 5, weight: 25 },
    { text: "0 монет", color: "#f72585", value: 0, weight: 10 },
    { text: "30 монет", color: "#4361ee", value: 30, weight: 12 },
    { text: "x2 множитель", color: "#ff5400", value: "multiplier", weight: 3 },
    { text: "Банкрот", color: "#888", value: "bankrupt", weight: 2 }
];
let rouletteBet = 10;
let slotBet = 5;
let diceBet = 5;
let coinBet = 5;
let coinWin = 10;
let prizeBet = 10;
let prizeOptions = ["20 монет", "10 монет", "50 монет", "0 монет", "30 монет"];
let prizesRevealed = false;
let slotSymbols = [
    { symbol: '🍒', value: 2, weight: 30 },
    { symbol: '🍋', value: 3, weight: 25 },
    { symbol: '🍊', value: 4, weight: 20 },
    { symbol: '🍇', value: 5, weight: 15 },
    { symbol: '🔔', value: 10, weight: 8 },
    { symbol: '⭐', value: 15, weight: 5 },
    { symbol: '💎', value: 20, weight: 3 },
    { symbol: '7️⃣', value: 50, weight: 1 }
];
let playerStats = {
    gamesPlayed: 0,
    totalWins: 0,
    totalLosses: 0,
    coinsWon: 0,
    coinsLost: 0,
    luckFactor: 1.0
};

// Инициализация при загрузке
window.onload = function() {
    updateCoinsDisplay();
    initWheel();
    loadStats();
    
    // Закрытие модального окна при клике вне его
    window.onclick = function(event) {
        const modals = document.getElementsByClassName('game-modal');
        for (let i = 0; i < modals.length; i++) {
            if (event.target === modals[i]) {
                modals[i].style.display = 'none';
            }
        }
    };
    
    // Добавляем кнопку статистики
    addStatsButton();
};

// Сохранение и загрузка статистики
function saveStats() {
    localStorage.setItem('playerStats', JSON.stringify(playerStats));
    localStorage.setItem('globalCoins', globalCoins.toString());
}

function loadStats() {
    const savedStats = localStorage.getItem('playerStats');
    const savedCoins = localStorage.getItem('globalCoins');
    
    if (savedStats) playerStats = JSON.parse(savedStats);
    if (savedCoins) globalCoins = parseInt(savedCoins);
}

function addStatsButton() {
    const statsBtn = document.createElement('button');
    statsBtn.textContent = '📊 Статистика';
    statsBtn.className = 'stats-btn';
    statsBtn.onclick = showStats;
    document.body.appendChild(statsBtn);
}

// Улучшенная система рандома с весами
function getWeightedRandom(items) {
    const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0);
    let random = Math.random() * totalWeight;
    
    for (const item of items) {
        random -= item.weight || 1;
        if (random <= 0) return item;
    }
    
    return items[items.length - 1];
}

// Управление монетами
function updateCoinsDisplay() {
    document.getElementById('global-coins').textContent = globalCoins;
    saveStats();
}

function addCoins(amount, reason = "") {
    const luckyAmount = Math.floor(amount * playerStats.luckFactor);
    globalCoins += luckyAmount;
    playerStats.coinsWon += luckyAmount;
    
    updateCoinsDisplay();
    showNotification(`+${luckyAmount} монет! ${reason}`, 'success');
    
    if (luckyAmount > amount * 1.2) {
        playerStats.luckFactor += 0.02;
    }
}

function deductCoins(amount, reason = "") {
    if (globalCoins >= amount) {
        globalCoins -= amount;
        playerStats.coinsLost += amount;
        playerStats.gamesPlayed++;
        
        updateCoinsDisplay();
        return true;
    }
    showNotification("Недостаточно монет!", 'error');
    return false;
}

// Функции для открытия/закрытия игр
function openGame(gameId) {
    let cost = 0;
    switch (gameId) {
        case 'russian-roulette': cost = rouletteBet; break;
        case 'wheel-of-fortune': cost = 15; break;
        case 'slot-machine': cost = slotBet; break;
        case 'dice': cost = diceBet; break;
        case 'coin-flip': cost = coinBet; break;
        case 'choose-prize': cost = prizeBet; break;
    }
    
    if (cost > 0 && globalCoins < cost) {
        showNotification(`Недостаточно монет! Нужно: ${cost}`, 'error');
        return;
    }
    
    document.getElementById(gameId).style.display = 'flex';
    if (gameId === 'wheel-of-fortune') initWheel();
}

function closeGame(gameId) {
    document.getElementById(gameId).style.display = 'none';
}

function toggleSettings(settingsId) {
    const settings = document.getElementById(settingsId);
    settings.style.display = settings.style.display === 'block' ? 'none' : 'block';
}

// Русская рулетка
function applyRouletteSettings() {
    chambersCount = parseInt(document.getElementById('chambers-count').value) || 6;
    bulletsCount = parseInt(document.getElementById('bullets-count').value) || 1;
    rouletteBet = parseInt(document.getElementById('roulette-bet').value) || 10;
    
    if (bulletsCount >= chambersCount) {
        bulletsCount = chambersCount - 1;
        document.getElementById('bullets-count').value = bulletsCount;
    }
    
    document.getElementById('chambers-total').textContent = chambersCount;
    document.getElementById('bullets-total').textContent = bulletsCount;
    document.getElementById('roulette-bet-display').textContent = rouletteBet;
    document.getElementById('roulette-status').textContent = `Револьвер заряжен. В барабане ${chambersCount} камор, ${bulletsCount} пуль.`;
    
    document.getElementById('roulette-settings').style.display = 'none';
    resetRoulette();
}

function spinBarrel() {
    if (!deductCoins(rouletteBet, "Русская рулетка")) return;
    
    const revolver = document.getElementById('revolver');
    revolver.classList.add('spin');
    
    const luckModifier = Math.max(0.5, Math.min(1.5, playerStats.luckFactor));
    const effectiveChambers = Math.floor(chambersCount / luckModifier);
    
    bulletChamber = Math.floor(Math.random() * effectiveChambers);
    currentChamber = 0;
    
    setTimeout(() => {
        revolver.classList.remove('spin');
        document.getElementById('roulette-status').textContent = 'Барабан прокручен. Нажми на курок!';
        document.getElementById('spin-button').disabled = true;
        document.getElementById('trigger-button').disabled = false;
    }, 1000);
}

function pullTrigger() {
    const revolver = document.getElementById('revolver');
    const status = document.getElementById('roulette-status');
    const roundCounter = document.getElementById('round-counter');
    
    if (currentChamber === bulletChamber) {
        revolver.textContent = '💥';
        revolver.classList.add('shake');
        status.textContent = 'Вы проиграли! Игра окончена.';
        document.getElementById('trigger-button').disabled = true;
        document.getElementById('spin-button').disabled = true;
        playerStats.totalLosses++;
        playerStats.luckFactor = Math.max(0.8, playerStats.luckFactor - 0.1);
        
        setTimeout(() => {
            resetRoulette();
        }, 3000);
    } else {
        revolver.classList.add('shake');
        status.textContent = 'Щёлк! Пустой выстрел. Вы выжили!';
        currentChamber++;
        round++;
        roundCounter.textContent = round;
        
        if (round > maxRounds) {
            const winAmount = rouletteBet * 10;
            addCoins(winAmount, "Победа в рулетке!");
            status.textContent = `Поздравляем! Вы прошли все раунды и выиграли ${winAmount} монет!`;
            document.getElementById('trigger-button').disabled = true;
            document.getElementById('spin-button').disabled = true;
            playerStats.totalWins++;
            
            setTimeout(() => {
                resetRoulette();
            }, 3000);
            return;
        }
        
        setTimeout(() => {
            revolver.classList.remove('shake');
            document.getElementById('spin-button').disabled = false;
            document.getElementById('trigger-button').disabled = true;
        }, 1000);
    }
    saveStats();
}

function resetRoulette() {
    const revolver = document.getElementById('revolver');
    revolver.textContent = '🔫';
    revolver.classList.remove('shake');
    document.getElementById('roulette-status').textContent = `Револьвер заряжен. В барабане ${chambersCount} камор, ${bulletsCount} пуль.`;
    document.getElementById('spin-button').disabled = false;
    document.getElementById('trigger-button').disabled = true;
    document.getElementById('round-counter').textContent = '1';
    round = 1;
}

// Колесо Фортуны
function addWheelOption() {
    const optionsContainer = document.getElementById('wheel-options');
    const newOption = document.createElement('div');
    newOption.className = 'option-row';
    newOption.innerHTML = `
        <input type="text" placeholder="Вариант приза">
        <input type="color" value="${getRandomColor()}">
        <input type="number" value="10" min="1" max="100" placeholder="Вес">
        <button onclick="removeWheelOption(this)">❌</button>
    `;
    optionsContainer.appendChild(newOption);
}

function removeWheelOption(button) {
    if (document.getElementById('wheel-options').children.length > 2) {
        button.parentElement.remove();
    } else {
        showNotification('Должен остаться хотя бы один вариант!', 'error');
    }
}

function applyWheelSettings() {
    const options = [];
    const optionRows = document.getElementById('wheel-options').children;
    
    for (let row of optionRows) {
        const textInput = row.querySelector('input[type="text"]');
        const colorInput = row.querySelector('input[type="color"]');
        const weightInput = row.querySelector('input[type="number"]');
        
        if (textInput.value.trim()) {
            const valueMatch = textInput.value.match(/(\d+)/);
            const value = valueMatch ? parseInt(valueMatch[1]) : 0;
            const weight = weightInput ? parseInt(weightInput.value) || 10 : 10;
            
            let specialValue = value;
            if (textInput.value.toLowerCase().includes('банкрот')) specialValue = 'bankrupt';
            if (textInput.value.toLowerCase().includes('множитель')) specialValue = 'multiplier';
            
            options.push({
                text: textInput.value,
                color: colorInput.value,
                value: specialValue,
                weight: weight
            });
        }
    }
    
    if (options.length > 1) {
        wheelOptions = options;
        initWheel();
        document.getElementById('wheel-settings').style.display = 'none';
    } else {
        showNotification('Добавьте хотя бы два варианта!', 'error');
    }
}

function initWheel() {
    wheelCanvas = document.getElementById('wheel');
    wheel = wheelCanvas.getContext('2d');
    drawWheel();
}

function drawWheel() {
    wheel.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
    const center = wheelCanvas.width / 2;
    const radius = wheelCanvas.width / 2 - 10;
    const sliceAngle = 2 * Math.PI / wheelOptions.length;
    
    wheelOptions.forEach((option, i) => {
        const angle = i * sliceAngle;
        
        wheel.beginPath();
        wheel.moveTo(center, center);
        wheel.arc(center, center, radius, angle, angle + sliceAngle);
        wheel.closePath();
        wheel.fillStyle = option.color;
        wheel.fill();
        wheel.stroke();
        
        wheel.save();
        wheel.translate(center, center);
        wheel.rotate(angle + sliceAngle / 2);
        wheel.textAlign = 'right';
        wheel.fillStyle = '#fff';
        wheel.font = 'bold 14px Arial';
        wheel.fillText(option.text, radius - 10, 5);
        wheel.restore();
    });
    
    wheel.beginPath();
    wheel.arc(center, center, 10, 0, 2 * Math.PI);
    wheel.fillStyle = '#1a1a2e';
    wheel.fill();
    wheel.stroke();
}

function spinWheel() {
    if (wheelSpinning) return;
    if (!deductCoins(15, "Колесо фортуны")) return;
    
    wheelSpinning = true;
    const resultElement = document.getElementById('wheel-result');
    const spinButton = document.getElementById('wheel-spin-btn');
    resultElement.textContent = '';
    spinButton.disabled = true;
    
    const adaptiveWeights = wheelOptions.map(opt => {
        let weight = opt.weight;
        if (opt.value === 'bankrupt' && playerStats.luckFactor > 1.1) {
            weight = Math.max(1, weight - 2);
        }
        if (typeof opt.value === 'number' && opt.value > 0 && playerStats.gamesPlayed < 10) {
            weight += 3;
        }
        return { ...opt, weight };
    });
    
    const spinDuration = 3000 + Math.random() * 2000;
    const startTime = Date.now();
    
    const spinInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / spinDuration;
        
        if (progress >= 1) {
            clearInterval(spinInterval);
            wheelSpinning = false;
            spinButton.disabled = false;
            
            const result = getWeightedRandom(adaptiveWeights);
            handleWheelResult(result);
            return;
        }
        
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const rotation = easeOut * 15 * Math.PI;
        wheelCanvas.style.transform = `rotate(${rotation}rad)`;
    }, 16);
}

function handleWheelResult(result) {
    const resultElement = document.getElementById('wheel-result');
    
    if (result.value === "multiplier") {
        const multiplier = 2 + Math.floor(Math.random() * 3);
        const bonus = 15 * multiplier;
        addCoins(bonus, `Множитель x${multiplier}!`);
        resultElement.textContent = `Множитель x${multiplier}! +${bonus} монет`;
        playerStats.luckFactor += 0.05;
    } 
    else if (result.value === "bankrupt") {
        resultElement.textContent = "Банкрот! Ставка не возвращается";
        playerStats.totalLosses++;
        playerStats.luckFactor = Math.max(0.8, playerStats.luckFactor - 0.1);
    }
    else if (typeof result.value === "number") {
        addCoins(result.value, "Колесо фортуны");
        resultElement.textContent = `Вы выиграли: ${result.text}!`;
        playerStats.totalWins++;
    }
    
    saveStats();
}

// Однорукий бандит
function applySlotSettings() {
    slotBet = parseInt(document.getElementById('slot-bet').value) || 5;
    document.getElementById('slot-bet-display').textContent = slotBet;
    document.getElementById('slot-settings').style.display = 'none';
}

function spinSlots() {
    if (!deductCoins(slotBet, "Однорукий бандит")) return;
    
    const slots = [document.getElementById('slot1'), document.getElementById('slot2'), document.getElementById('slot3')];
    const resultElement = document.getElementById('slot-result');
    const spinButton = document.getElementById('slot-spin-btn');
    
    resultElement.textContent = 'Крутим...';
    spinButton.disabled = true;
    
    const difficulty = globalCoins < 50 ? 0.7 : globalCoins > 200 ? 0.3 : 0.5;
    
    slots.forEach((slot, index) => {
        let spins = 0;
        const maxSpins = 10 + index * 5;
        
        const spinInterval = setInterval(() => {
            const randomSymbol = getWeightedRandom(slotSymbols);
            slot.textContent = randomSymbol.symbol;
            slot.dataset.value = randomSymbol.value;
            
            spins++;
            if (spins >= maxSpins) {
                clearInterval(spinInterval);
                if (index === 2) {
                    checkSlotResult(difficulty);
                    spinButton.disabled = false;
                }
            }
        }, 100);
    });
}

function checkSlotResult(difficulty) {
    const slot1 = document.getElementById('slot1');
    const slot2 = document.getElementById('slot2');
    const slot3 = document.getElementById('slot3');
    
    const val1 = parseInt(slot1.dataset.value);
    const val2 = parseInt(slot2.dataset.value);
    const val3 = parseInt(slot3.dataset.value);
    
    let winAmount = 0;
    let message = '';
    
    if (slot1.textContent === slot2.textContent && slot2.textContent === slot3.textContent) {
        winAmount = Math.floor((val1 + val2 + val3) * 10 * difficulty);
        message = `ДЖЕКПОТ! ${slot1.textContent} ${slot2.textContent} ${slot3.textContent} - ${winAmount} монет!`;
        playerStats.luckFactor += 0.1;
    } 
    else if (slot1.textContent === slot2.textContent || slot2.textContent === slot3.textContent || slot1.textContent === slot3.textContent) {
        const matchedValue = slot1.textContent === slot2.textContent ? val1 : val3;
        winAmount = Math.floor(matchedValue * 6 * difficulty);
        message = `Два одинаковых! +${winAmount} монет`;
    }
    else {
        const values = [val1, val2, val3].sort((a, b) => a - b);
        if (values[0] === values[1] - 1 && values[1] === values[2] - 1) {
            winAmount = Math.floor((val1 + val2 + val3) * 2 * difficulty);
            message = `Последовательность! +${winAmount} монет`;
        }
    }
    
    if (winAmount > 0) {
        addCoins(winAmount, "Слоты");
        playerStats.totalWins++;
    } else {
        message = 'Повезёт в следующий раз!';
        playerStats.totalLosses++;
    }
    
    resultElement.textContent = message;
    saveStats();
}

// Кости
function applyDiceSettings() {
    diceBet = parseInt(document.getElementById('dice-bet').value) || 5;
    document.getElementById('dice-bet-display').textContent = diceBet;
    document.getElementById('dice-settings').style.display = 'none';
}

function rollDice(count) {
    if (!deductCoins(diceBet, `Кости (${count} кубика)`)) return;
    
    const diceResult = document.getElementById('dice-result');
    const diceSum = document.getElementById('dice-sum');
    const diceWin = document.getElementById('dice-win');
    
    let result = '';
    let sum = 0;
    let values = [];
    
    for (let i = 0; i < count; i++) {
        const value = Math.floor(Math.random() * 6) + 1;
        values.push(value);
        result += getDiceEmoji(value) + ' ';
        sum += value;
    }
    
    diceResult.innerHTML = result;
    
    let winAmount = 0;
    if (count === 1) {
        winAmount = values[0] * diceBet;
    } else if (count === 2) {
        if (values[0] === values[1]) {
            winAmount = values[0] * values[1] * diceBet * 2;
        } else {
            winAmount = sum * diceBet;
        }
    } else {
        const unique = new Set(values);
        if (unique.size === 1) {
            winAmount = sum * diceBet * 3;
        } else if (unique.size === 2) {
            winAmount = sum * diceBet * 1.5;
        } else {
            const sorted = [...values].sort((a, b) => a - b);
            if (sorted[0] + 1 === sorted[1] && sorted[1] + 1 === sorted[2]) {
                winAmount = sum * diceBet * 2;
            } else {
                winAmount = sum * diceBet;
            }
        }
    }
    
    addCoins(winAmount, "Кости");
    diceSum.textContent = count > 1 ? `Сумма: ${sum}` : '';
    diceWin.textContent = `Выигрыш: ${winAmount} монет!`;
    playerStats.totalWins++;
    saveStats();
}

function getDiceEmoji(value) {
    const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return diceEmojis[value - 1];
}

// Монетка
function applyCoinSettings() {
    coinBet = parseInt(document.getElementById('coin-bet').value) || 5;
    coinWin = coinBet * 2;
    document.getElementById('coin-bet-display').textContent = coinBet;
    document.getElementById('coin-win-amount').textContent = coinWin;
    document.getElementById('coin-settings').style.display = 'none';
}

function flipCoin(choice) {
    if (!deductCoins(coinBet, "Монетка")) return;
    
    const coin = document.getElementById('coin');
    const resultElement = document.getElementById('coin-result');
    
    coin.classList.add('flip');
    resultElement.textContent = '';
    
    const winChance = 0.5 + (playerStats.luckFactor - 1) * 0.1;
    const result = Math.random() < winChance ? 'орёл' : 'решка';
    
    setTimeout(() => {
        coin.textContent = result === 'орёл' ? '🦅' : '🐠';
        
        if (result === choice) {
            const winAmount = Math.floor(coinWin * playerStats.luckFactor);
            addCoins(winAmount, "Монетка");
            resultElement.textContent = `Поздравляем! Выпал ${result}, вы выиграли ${winAmount} монет!`;
            playerStats.totalWins++;
            playerStats.luckFactor += 0.02;
        } else {
            resultElement.textContent = `Увы! Выпал ${result}, а вы выбрали ${choice}.`;
            playerStats.totalLosses++;
            playerStats.luckFactor = Math.max(0.8, playerStats.luckFactor - 0.01);
        }
        
        coin.classList.remove('flip');
        saveStats();
    }, 500);
}

// Случайный выбор
function generateRandomNumber() {
    const min = parseInt(document.getElementById('min-number').value) || 1;
    const max = parseInt(document.getElementById('max-number').value) || 100;
    
    if (min >= max) {
        showNotification('Минимальное значение должно быть меньше максимального!', 'error');
        return;
    }
    
    const result = Math.floor(Math.random() * (max - min + 1)) + min;
    document.getElementById('random-result').textContent = `Случайное число: ${result}`;
    document.getElementById('random-result').classList.add('win');
}

function chooseRandomOption() {
    const optionsText = document.getElementById('custom-options').value;
    
    if (!optionsText.trim()) {
        showNotification('Введите варианты для выбора!', 'error');
        return;
    }
    
    const options = optionsText.split(',').map(opt => opt.trim()).filter(opt => opt);
    
    if (options.length < 2) {
        showNotification('Введите хотя бы два варианта!', 'error');
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * options.length);
    document.getElementById('random-result').textContent = `Случайный выбор: ${options[randomIndex]}`;
    document.getElementById('random-result').classList.add('win');
}

// Выбери приз
function addPrizeOption() {
    const optionsContainer = document.getElementById('prize-options');
    const newOption = document.createElement('div');
    newOption.className = 'option-row';
    newOption.innerHTML = `
        <input type="text" placeholder="Приз">
        <input type="number" value="10" min="1" max="100" placeholder="Вес">
        <button onclick="removePrizeOption(this)">❌</button>
    `;
    optionsContainer.appendChild(newOption);
}

function removePrizeOption(button) {
    if (document.getElementById('prize-options').children.length > 2) {
        button.parentElement.remove();
    } else {
        showNotification('Должен остаться хотя бы один приз!', 'error');
    }
}

function applyPrizeSettings() {
    const options = [];
    const optionRows = document.getElementById('prize-options').children;
    prizeBet = parseInt(document.getElementById('prize-bet').value) || 10;
    
    for (let row of optionRows) {
        const textInput = row.querySelector('input[type="text"]');
        const weightInput = row.querySelector('input[type="number"]');
        
        if (textInput.value.trim()) {
            const match = textInput.value.match(/(\d+)/);
            const value = match ? parseInt(match[1]) : 0;
            const weight = weightInput ? parseInt(weightInput.value) || 10 : 10;
            
            options.push({
                text: textInput.value,
                value: value,
                weight: weight
            });
        }
    }
    
    if (options.length > 1) {
        prizeOptions = options;
        document.getElementById('prize-bet-display').textContent = prizeBet;
        document.getElementById('prize-settings').style.display = 'none';
        resetPrizes();
    } else {
        showNotification('Добавьте хотя бы два приза!', 'error');
    }
}

function selectPrize(index) {
    if (prizesRevealed) return;
    if (!deductCoins(prizeBet, "Выбери приз")) return;
    
    prizesRevealed = true;
    const prizeBoxes = document.querySelectorAll('.prize-box');
    const resultElement = document.getElementById('prize-result');
    
    const weightedPrizes = prizeOptions.map(prize => ({
        ...prize,
        weight: prize.value === 0 ? Math.max(1, prize.weight - 5) : prize.weight
    }));
    
    const prizes = [];
    for (let i = 0; i < prizeBoxes.length; i++) {
        prizes.push(getWeightedRandom(weightedPrizes));
    }
    
    prizeBoxes.forEach((box, i) => {
        setTimeout(() => {
            box.textContent = prizes[i].text;
            box.dataset.value = prizes[i].value;
        }, 500 + i * 200);
    });
    
    setTimeout(() => {
        const selectedPrize = prizes[index];
        const winAmount = selectedPrize.value;
        
        if (winAmount > 0) {
            addCoins(winAmount, "Приз");
            resultElement.textContent = `Вы выбрали: ${selectedPrize.text}!`;
            playerStats.totalWins++;
        } else {
            resultElement.textContent = `Вы выбрали: ${selectedPrize.text}`;
            playerStats.totalLosses++;
        }
        
        resultElement.classList.add('win');
        saveStats();
    }, 1500);
}

function resetPrizes() {
    const prizeBoxes = document.querySelectorAll('.prize-box');
    prizeBoxes.forEach(box => {
        box.textContent = '🎁';
    });
    document.getElementById('prize-result').textContent = '';
    document.getElementById('prize-result').classList.remove('win');
    prizesRevealed = false;
}

// Вспомогательные функции
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.innerHTML = message;
    notification.className = `notification notification-${type}`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => notification.remove(), 500);
    }, duration);
}

function showStats() {
    const statsMessage = `
        Игр сыграно: ${playerStats.gamesPlayed}<br>
        Побед: ${playerStats.totalWins}<br>
        Поражений: ${playerStats.totalLosses}<br>
        Монет выиграно: ${playerStats.coinsWon}<br>
        Монет проиграно: ${playerStats.coinsLost}<br>
        Коэффициент удачи: ${playerStats.luckFactor.toFixed(2)}
    `;
    
    showNotification(statsMessage, 'info', 5000);
}