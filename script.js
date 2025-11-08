let btcPrice = 0;
let chart;
let alertPrice = null;

// جلب بيانات BTC من CoinGecko
async function fetchBTCPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usdt');
        const data = await response.json();
        btcPrice = data.bitcoin.usdt;
        document.getElementById('btc-price').innerText = `$${btcPrice}`;
        updateChart(btcPrice);
        checkAlert();
    } catch (error) {
        console.error('خطأ في جلب البيانات:', error);
    }
}

// اعداد الرسم البياني
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
    if(chart.data.labels.length > 20){
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
        alert(`تنبيه! وصل سعر BTC/USDT إلى $${btcPrice}`);
        alertPrice = null; // تعطيل التنبيه بعد الإشعار
    }
}

// تحديث السعر كل 10 ثواني
fetchBTCPrice();
setInterval(fetchBTCPrice, 10000);