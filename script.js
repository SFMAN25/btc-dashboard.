let btcPrice = 0;
let chart;
let alertPrice = null;
let prices = [];

// جلب بيانات BTC من CoinGecko
async function fetchBTCPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usdt&days=1&interval=minute');
        const data = await response.json();
        const latestPrice = data.prices[data.prices.length - 1][1];
        btcPrice = latestPrice;
        document.getElementById('btc-price').innerText = `$${btcPrice.toFixed(2)}`;
        updateChart(btcPrice);
        prices.push(btcPrice);
        if(prices.length > 200) prices.shift();
        checkAlert();
        calculateIndicators();
    } catch (error) {
        console.error('خطأ في جلب البيانات:', error);
    }
}

// إعداد الرسم البياني
const ctx = document.getElementById('btcChart').getContext('2d');
chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'BTC/USDT',
            data: [],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        scales: {
            x: { display: true },
            y: { display: true }
        }
    }
});

// تحديث الرسم البياني
function updateChart(price) {
    const time = new Date().toLocaleTimeString();
    chart.data.labels.push(time);
    chart.data.datasets[0].data.push(price);
    if(chart.data.labels.length > 50){
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }
    chart.update();
}

// ضبط التنبيه
function setAlert() {
    const input = document.getElementById('alert-price');
    alertPrice = parseFloat(input.value);
    if(!isNaN(alertPrice)) {
        alert(`تم ضبط التنبيه عند الوصول إلى $${alertPrice}`);
    }
}

// التحقق من التنبيه
function checkAlert() {
    if(alertPrice && btcPrice >= alertPrice) {
        alert(`تنبيه! وصل سعر BTC/USDT إلى $${btcPrice.toFixed(2)}`);
        alertPrice = null; // تعطيل التنبيه بعد الإشعار
    }
}

// حساب مؤشرات فنية مبسطة وإشارات
function calculateIndicators() {
    if(prices.length < 14) return; // للـ RSI
    // حساب RSI بسيط
    let gains = 0, losses = 0;
    for(let i = prices.length - 14; i < prices.length - 1; i++){
        let change = prices[i+1] - prices[i];
        if(change > 0) gains += change;
        else losses -= change;
    }
    let rs = gains / (losses || 1);
    let rsi = 100 - (100 / (1 + rs));

    // Moving Averages
    let ma50 = prices.slice(-50).reduce((a,b)=>a+b,0)/50;
    let ma200 = prices.slice(-200).reduce((a,b)=>a+b,0)/200;

    // إشارات شراء/بيع
    let signal = '';
    if(rsi < 30 && ma50 > ma200) signal = '📈 إشارة شراء';
    else if(rsi > 70 && ma50 < ma200) signal = '📉 إشارة بيع';

    document.getElementById('signal').innerText = signal;
}

// تحديث السعر كل دقيقة
fetchBTCPrice();
setInterval(fetchBTCPrice, 60000);
