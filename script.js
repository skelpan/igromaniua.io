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
    { text: "20 монет", color: "#e94560", value: 20 },
    { text: "50 монет", color: "#00b4d8", value: 50 },
    { text: "10 монет", color: "#ff9e00", value: 10 },
    { text: "100 монет", color: "#2dc659", value: 100 },
    { text: "5 монет", color: "#9d4edd", value: 5 },
    { text: "0 монет", color: "#f72585", value: 0 },
    { text: "30 монет", color: "#4361ee", value: 30 },
    { text: "Крутить again", color: "#ff5400", value: "again" }
];
let rouletteBet = 10;
let slotBet = 5;
let diceBet = 5;
let coinBet = 5;
let coinWin = 10;
let prizeBet = 10;
let prizeOptions = ["20 монет", "10 монет", "50 монет"];
let prizesRevealed = false;
let slotSymbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '⭐', '💎', '7️⃣'];

// Инициализация при загрузке
window.onload = function() {
    updateCoinsDisplay();
    initWheel();
    
    // Закрытие модального окна при клике вне его
    window.onclick = function(event) {
        const modals = document.getElementsByClassName('game-modal');
        for (let i = 0; i < modals.length; i++) {
            if (event.target === modals[i]) {
                modals[i].style.display = 'none';
            }
        }
    };
};

// Управление монетами
function updateCoinsDisplay() {
    document.getElementById('global-coins').textContent = globalCoins;
    
    // Обновляем статус кнопок в зависимости от количества монет
    const gameButtons = document.querySelectorAll('.play-btn:not(.add-coins-btn)');
    gameButtons.forEach(btn => {
        const gameCard = btn.closest('.game-card');
        if (gameCard) {
            const costMatch = gameCard.querySelector('.game-description').textContent.match(/Стоимость: (\d+) монет/);
            if (costMatch && globalCoins < parseInt(costMatch[1])) {
                btn.disabled = true;
                btn.title = "Недостаточно монет";
            } else {
                btn.disabled = false;
                btn.title = "";
            }
        }
    });
}

function addCoins(amount) {
    globalCoins += amount;
    updateCoinsDisplay();
    showNotification(`+${amount} монет!`, 'success');
}

function deductCoins(amount) {
    if (globalCoins >= amount) {
        globalCoins -= amount;
        updateCoinsDisplay();
        return true;
    }
    showNotification("Недостаточно монет!", 'error');
    return false;
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '10000';
    notification.style.fontWeight = 'bold';
    
    if (type === 'success') {
        notification.style.background = '#2dc659';
    } else {
        notification.style.background = '#e94560';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Функции для открытия/закрытия игр
function openGame(gameId) {
    // Проверяем, хватает ли монет для игры
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
    
    // Ограничения
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
    if (!deductCoins(rouletteBet)) return;
    
    const revolver = document.getElementById('revolver');
    revolver.classList.add('spin');
    
    bulletChamber = Math.floor(Math.random() * chambersCount);
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
        // Игрок проиграл
        revolver.textContent = '💥';
        revolver.classList.add('shake');
        status.textContent = 'Вы проиграли! Игра окончена.';
        document.getElementById('trigger-button').disabled = true;
        document.getElementById('spin-button').disabled = true;
        
        setTimeout(() => {
            resetRoulette();
        }, 3000);
    } else {
        // Игрок выжил
        revolver.classList.add('shake');
        status.textContent = 'Щёлк! Пустой выстрел. Вы выжили!';
        currentChamber++;
        round++;
        roundCounter.textContent = round;
        
        // Проверяем, не достигли ли максимального количества раундов
        if (round > maxRounds) {
            const winAmount = rouletteBet * 10;
            addCoins(winAmount);
            status.textContent = `Поздравляем! Вы прошли все раунды и выиграли ${winAmount} монет!`;
            document.getElementById('trigger-button').disabled = true;
            document.getElementById('spin-button').disabled = true;
            
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
        
        if (textInput.value.trim()) {
            // Парсим значение из текста (ищем числа)
            const valueMatch = textInput.value.match(/(\d+)/);
            const value = valueMatch ? parseInt(valueMatch[1]) : 0;
            
            options.push({
                text: textInput.value,
                color: colorInput.value,
                value: value
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
        
        // Рисуем сегмент
        wheel.beginPath();
        wheel.moveTo(center, center);
        wheel.arc(center, center, radius, angle, angle + sliceAngle);
        wheel.closePath();
        wheel.fillStyle = option.color;
        wheel.fill();
        wheel.stroke();
        
        // Рисуем текст
        wheel.save();
        wheel.translate(center, center);
        wheel.rotate(angle + sliceAngle / 2);
        wheel.textAlign = 'right';
        wheel.fillStyle = '#fff';
        wheel.font = 'bold 14px Arial';
        wheel.fillText(option.text, radius - 10, 5);
        wheel.restore();
    });
    
    // Рисуем центр колеса
    wheel.beginPath();
    wheel.arc(center, center, 10, 0, 2 * Math.PI);
    wheel.fillStyle = '#1a1a2e';
    wheel.fill();
    wheel.stroke();
}

function spinWheel() {
    if (wheelSpinning) return;
    if (!deductCoins(15)) return;
    
    wheelSpinning = true;
    const resultElement = document.getElementById('wheel-result');
    const spinButton = document.getElementById('wheel-spin-btn');
    resultElement.textContent = '';
    spinButton.disabled = true;
    
    const spinDuration = 3000 + Math.random() * 2000; // 3-5 секунд
    const startTime = Date.now();
    
    // Анимация вращения
    const spinInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / spinDuration;
        
        if (progress >= 1) {
            clearInterval(spinInterval);
            wheelSpinning = false;
            spinButton.disabled = false;
            
            // Определяем результат
            const resultIndex = Math.floor(Math.random() * wheelOptions.length);
            const result = wheelOptions[resultIndex];
            
            if (result.value === "again") {
                resultElement.textContent = `Вы выиграли: Бесплатное вращение!`;
                addCoins(15); // Возвращаем монеты
            } else {
                resultElement.textContent = `Вы выиграли: ${result.text}!`;
                if (result.value > 0) {
                    addCoins(result.value);
                }
            }
            return;
        }
        
        // Вращаем колесо с замедлением
        const easeOut = 1 - Math.pow(1 - progress, 3); // easing function
        const rotation = easeOut * 10 * Math.PI;
        wheelCanvas.style.transform = `rotate(${rotation}rad)`;
    }, 16);
}

// Однорукий бандит
function applySlotSettings() {
    slotBet = parseInt(document.getElementById('slot-bet').value) || 5;
    document.getElementById('slot-bet-display').textContent = slotBet;
    document.getElementById('slot-settings').style.display = 'none';
}

function spinSlots() {
    if (!deductCoins(slotBet)) return;
    
    const balanceElement = document.getElementById('balance');
    const slots = [document.getElementById('slot1'), document.getElementById('slot2'), document.getElementById('slot3')];
    const resultElement = document.getElementById('slot-result');
    const spinButton = document.getElementById('slot-spin-btn');
    
    resultElement.textContent = 'Крутим...';
    spinButton.disabled = true;
    
    // Запускаем анимацию для каждого слота
    slots.forEach((slot, index) => {
        let spins = 0;
        const maxSpins = 10 + index * 5; // Каждый следующий слот крутится дольше
        
        const spinInterval = setInterval(() => {
            const randomSymbol = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
            slot.textContent = randomSymbol;
            
            spins++;
            if (spins >= maxSpins) {
                clearInterval(spinInterval);
                
                // После остановки последнего слота проверяем результат
                if (index === 2) {
                    checkSlotResult();
                    spinButton.disabled = false;
                }
            }
        }, 100);
    });
    
    function checkSlotResult() {
        const slot1 = document.getElementById('slot1').textContent;
        const slot2 = document.getElementById('slot2').textContent;
        const slot3 = document.getElementById('slot3').textContent;
        
        if (slot1 === slot2 && slot2 === slot3) {
            // Джекпот!
            const winAmount = slotBet * 40;
            addCoins(winAmount);
            resultElement.textContent = `Джекпот! Вы выиграли ${winAmount} монет!`;
            document.querySelector('.slots-container').classList.add('win');
        } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
            // Два одинаковых символа
            const winAmount = slotBet * 6;
            addCoins(winAmount);
            resultElement.textContent = `Два одинаковых! Вы выиграли ${winAmount} монет!`;
        } else {
            resultElement.textContent = 'Повезёт в следующий раз!';
        }
    }
}

// Кости
function applyDiceSettings() {
    diceBet = parseInt(document.getElementById('dice-bet').value) || 5;
    document.getElementById('dice-bet-display').textContent = diceBet;
    document.getElementById('dice-settings').style.display = 'none';
}

function rollDice(count) {
    if (!deductCoins(diceBet)) return;
    
    const diceResult = document.getElementById('dice-result');
    const diceSum = document.getElementById('dice-sum');
    const diceWin = document.getElementById('dice-win');
    
    let result = '';
    let sum = 0;
    
    for (let i = 0; i < count; i++) {
        const value = Math.floor(Math.random() * 6) + 1;
        result += getDiceEmoji(value) + ' ';
        sum += value;
    }
    
    diceResult.innerHTML = result;
    
    // Вычисляем выигрыш
    let winAmount = 0;
    if (count === 1) {
        winAmount = value * diceBet;
    } else {
        winAmount = sum * diceBet / 2;
    }
    
    addCoins(winAmount);
    
    diceSum.textContent = count > 1 ? `Сумма: ${sum}` : '';
    diceWin.textContent = `Вы выиграли: ${winAmount} монет!`;
    diceResult.classList.add('win');
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
    if (!deductCoins(coinBet)) return;
    
    const coin = document.getElementById('coin');
    const resultElement = document.getElementById('coin-result');
    
    coin.classList.add('flip');
    resultElement.textContent = '';
    
    setTimeout(() => {
        const result = Math.random() > 0.5 ? 'орёл' : 'решка';
        coin.textContent = result === 'орёл' ? '🦅' : '🐠';
        
        if (result === choice) {
            addCoins(coinWin);
            resultElement.textContent = `Поздравляем! Выпал ${result}, вы выиграли ${coinWin} монет!`;
            resultElement.classList.add('win');
        } else {
            resultElement.textContent = `Увы! Выпал ${result}, а вы выбрали ${choice}.`;
        }
        
        coin.classList.remove('flip');
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
        
        if (textInput.value.trim()) {
            options.push(textInput.value);
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
    if (!deductCoins(prizeBet)) return;
    
    prizesRevealed = true;
    const prizeBoxes = document.querySelectorAll('.prize-box');
    const resultElement = document.getElementById('prize-result');
    
    // Создаем значения призов
    const prizeValues = [];
    for (let i = 0; i < prizeOptions.length; i++) {
        const match = prizeOptions[i].match(/(\d+)/);
        prizeValues.push(match ? parseInt(match[1]) : 0);
    }
    
    // Показываем все призы
    prizeBoxes.forEach((box, i) => {
        setTimeout(() => {
            box.textContent = prizeOptions[i] || "Пусто";
        }, 500);
    });
    
    // Показываем результат выбора
    setTimeout(() => {
        const winAmount = prizeValues[index] || 0;
        if (winAmount > 0) {
            addCoins(winAmount);
            resultElement.textContent = `Вы выбрали: ${prizeOptions[index]}!`;
            resultElement.classList.add('win');
        } else {
            resultElement.textContent = `Вы выбрали: ${prizeOptions[index]}`;
        }
    }, 1000);
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