// main.ts
// 使用 Deno 内建的 HTTP 服务器
// 无需从 std 导入 'serve'

// 将你的完整 HTML 内容粘贴到这个模板字符串中
const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API价格计算器</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-color: #2563eb;
            --primary-hover: #1d4ed8;
            --secondary-color: #f3f4f6;
            --text-color: #1f2937;
            --text-light: #6b7280;
            --border-color: #e5e7eb;
            --highlight-color: #eff6ff;
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
            --radius: 0.5rem;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            max-width: 600px;
            margin: 2rem auto;
            padding: 0 1.5rem;
            line-height: 1.6;
            color: var(--text-color);
            background-color: #fafafa;
        }

        h1 {
            text-align: center;
            margin-bottom: 2rem;
            font-weight: 700;
            font-size: 2rem;
            color: var(--primary-color);
            position: relative;
            padding-bottom: 0.5rem;
        }

        h1::after {
            content: "";
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 80px;
            height: 3px;
            background: linear-gradient(to right, var(--primary-color), #60a5fa);
            border-radius: 3px;
        }

        .calculator {
            background-color: white;
            border-radius: var(--radius);
            padding: 2rem;
            box-shadow: var(--shadow-lg);
            transition: all 0.3s ease;
        }

        .section {
            margin-bottom: 2rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid var(--border-color);
            transition: all 0.2s ease;
        }

        .section:last-of-type {
            border-bottom: none;
        }

        .section-title {
            font-weight: 600;
            font-size: 1.1rem;
            margin-bottom: 1rem;
            color: var(--primary-color);
            display: flex;
            align-items: center;
        }

        .section-title::before {
            content: "";
            display: inline-block;
            width: 8px;
            height: 18px;
            background-color: var(--primary-color);
            border-radius: 4px;
            margin-right: 8px;
        }

        .input-group {
            margin-bottom: 1rem;
            position: relative;
        }

        label {
            display: block;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
            font-weight: 500;
            color: var(--text-light);
        }

        input {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid var(--border-color);
            border-radius: var(--radius);
            box-sizing: border-box;
            font-size: 1rem;
            transition: all 0.2s ease;
            background-color: white;
            font-family: 'Inter', sans-serif;
        }

        input:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        input:hover {
            border-color: #cbd5e1;
        }

        button {
            background-color: var(--primary-color);
            color: white;
            padding: 0.9rem;
            border: none;
            border-radius: var(--radius);
            cursor: pointer;
            font-size: 1rem;
            width: 100%;
            margin-top: 1rem;
            font-weight: 500;
            transition: all 0.2s ease;
            box-shadow: var(--shadow-sm);
            position: relative;
            overflow: hidden;
        }

        button:hover {
            background-color: var(--primary-hover);
            transform: translateY(-1px);
            box-shadow: var(--shadow-md);
        }

        button:active {
            transform: translateY(0);
        }

        .calculate-button {
            background: linear-gradient(45deg, var(--primary-color), #4f46e5);
            font-weight: 600;
            padding: 1rem;
            letter-spacing: 0.5px;
            box-shadow: var(--shadow-md);
            margin-top: 1.5rem;
            position: relative;
            overflow: hidden;
        }

        .calculate-button::after {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: rgba(255, 255, 255, 0.1);
            transform: rotate(30deg);
            transition: transform 0.5s ease;
        }

        .calculate-button:hover::after {
            transform: rotate(30deg) translate(10%, 10%);
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideIn {
            from { transform: translateX(-10px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        .results {
            margin-top: 2rem;
            padding: 2rem;
            background-color: var(--highlight-color);
            border-radius: var(--radius);
            display: none;
            box-shadow: var(--shadow-md);
            animation: fadeIn 0.5s ease;
            border-left: 4px solid var(--primary-color);
        }

        .results.show {
            display: block;
            animation: fadeIn 0.5s ease forwards;
        }

        .result-row {
            display: grid;
            grid-template-columns: 1fr auto;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.9rem;
            padding: 0.6rem 0;
            border-bottom: 1px dashed rgba(37, 99, 235, 0.1);
        }

        .result-row:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
        }

        .result-label {
            font-weight: 500;
            color: var(--text-light);
            padding-right: 0.5rem;
        }

        .results-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
            margin-top: 1.5rem;
        }

        .results-column {
            background-color: white;
            border-radius: var(--radius);
            padding: 1.8rem;
            box-shadow: var(--shadow-sm);
            transition: all 0.3s ease;
            overflow: hidden;
            animation: slideIn 0.5s ease forwards;
            animation-delay: 0.1s;
            opacity: 0;
        }

        .results-column:hover {
            box-shadow: var(--shadow-md);
            transform: translateY(-2px);
        }

        .results-column:nth-child(2) {
            animation-delay: 0.3s;
        }

        .column-title {
            font-weight: 600;
            margin-bottom: 1.2rem;
            padding-bottom: 0.6rem;
            border-bottom: 1px solid var(--border-color);
            color: var(--primary-color);
            text-align: center;
            font-size: 1.05rem;
            position: relative;
        }

        .column-title::after {
            content: "";
            position: absolute;
            bottom: -1px;
            left: 25%;
            width: 50%;
            height: 2px;
            background: var(--primary-color);
            border-radius: 1px;
        }

        @media (min-width: 640px) {
            .calculator {
                padding: 2.5rem;
            }

            .section {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                gap: 1.5rem;
                align-items: start;
            }

            .section-title {
                grid-column: 1 / -1;
            }

            .input-group {
                margin-bottom: 0;
            }
        }

        /* 修改桌面端结果网格布局的媒体查询，中小屏幕下默认为单列 */
        .results-grid {
            grid-template-columns: 1fr; /* 覆盖任何其他设置，确保默认为单列 */
        }

        /* 只有在大屏幕上才使用双列布局 */
        @media (min-width: 1025px) {
            .results-grid {
                grid-template-columns: 1fr 1fr;
            }
        }

        @media (max-width: 767px) {
            .results-grid {
                grid-template-columns: 1fr;
                gap: 2rem;
            }

            .price-currency-grid {
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
            }

        }

        /* 新增iPad适配规则 */
        @media (min-width: 768px) and (max-width: 1024px) {
            .results-grid {
                grid-template-columns: 1fr;
                gap: 2rem;
            }

            .results-column {
                padding: 2rem;
            }

            .calculator {
                padding: 2rem;
            }

            .price-currency-grid {
                grid-template-columns: 1fr 1fr;
                gap: 1.5rem;
            }

            body {
                max-width: 700px;
                margin: 2.5rem auto;
                padding: 0 2rem;
            }
        }

        @media (max-width: 639px) {
            .calculator {
                padding: 1.5rem;
            }

            .results {
                padding: 1.5rem;
            }

            .results-column {
                padding: 1.25rem;
                margin-bottom: 1rem;
            }

            .price-currency-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }

            .base-price-section {
                padding: 1rem;
            }

            h1 {
                font-size: 1.75rem;
            }

            .unit-toggle {
                flex-direction: row;
                margin-bottom: 1.2rem;
            }

            .unit-toggle button {
                padding: 0.45rem;
                font-size: 0.8rem;
            }
        }

        @media (max-width: 480px) {
            body {
                padding: 0 1rem;
                margin: 1rem auto;
            }

            .calculator {
                padding: 1.25rem;
            }

            .column-title {
                font-size: 1rem;
            }

            .section-title {
                font-size: 1rem;
            }

            .section-subtitle {
                font-size: 0.9rem;
            }

            .result-row {
                flex-direction: column;
                align-items: flex-start;
                padding: 0.5rem 0;
            }

            .result-row span:last-child {
                margin-top: 0.25rem;
                align-self: flex-end;
            }

            .price-calculation div:not(:first-child) {
                margin-left: 0.25rem;
            }
        }

        @media (min-width: 1200px) {
            body {
                max-width: 1200px;
            }

            .calculator {
                padding: 3rem;
            }

            .results {
                padding: 2.5rem;
            }

            .results-column {
                padding: 2rem;
            }
        }

        .unit-toggle {
            display: flex;
            gap: 0.5rem;
            margin: 0.5rem 0 1rem 0;
        }

        .unit-toggle button {
            flex: 1;
            padding: 0.5rem;
            font-size: 0.85rem;
            background-color: white;
            color: var(--text-color);
            border: 1px solid var(--border-color);
            box-shadow: none;
            margin-top: 0;
        }

        .unit-toggle button.active {
            background-color: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
        }

        select {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid var(--border-color);
            border-radius: var(--radius);
            box-sizing: border-box;
            font-size: 1rem;
            transition: all 0.2s ease;
            background-color: var(--secondary-color);
            font-family: 'Inter', sans-serif;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 1rem center;
            background-size: 1rem;
        }

        select:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        #total-cost {
            font-weight: 700;
            color: #2563eb;
            font-size: 1.1rem;
        }

        #total-cost-cny {
            font-weight: 700;
            color: #ef4444;
            font-size: 1.1rem;
        }

        .secondary-button {
            background-color: white;
            color: var(--primary-color);
            border: 1px solid var(--primary-color);
            padding: 0.7rem;
            border-radius: var(--radius);
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
            transition: all 0.2s ease;
        }

        .secondary-button:hover {
            background-color: var(--highlight-color);
            transform: translateY(-1px);
        }

        .exchange-rate-display {
            background-color: var(--highlight-color);
            padding: 0.8rem;
            border-radius: var(--radius);
            margin-top: 1rem;
            text-align: center;
            font-weight: 500;
            color: var(--text-color);
            border-left: 3px solid var(--primary-color);
        }

        #current-exchange-rate {
            font-weight: 700;
            color: var(--primary-color);
        }

        .exchange-form {
            display: flex;
            flex-direction: column;
        }

        .exchange-inputs {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .exchange-equals {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--text-light);
            margin-top: 1.5rem;
        }

        @media (max-width: 639px) {
            .exchange-inputs {
                flex-direction: column;
            }

            .exchange-equals {
                margin: 0.5rem 0;
                height: 40px;
            }
        }

        .price-currency-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.5rem;
            margin-top: 1rem;
        }

        .price-currency-column {
            background-color: rgba(255, 255, 255, 0.7);
            border-radius: var(--radius);
            padding: 1.2rem;
            border: 1px solid var(--border-color);
            transition: all 0.3s ease;
            box-shadow: var(--shadow-sm);
            display: flex;
            flex-direction: column;
        }

        .price-currency-column:hover {
            transform: translateY(-3px);
            box-shadow: var(--shadow-md);
            background-color: white;
        }

        .currency-label {
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--primary-color);
            text-align: center;
            font-size: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid var(--primary-color);
        }

        .result-separator {
            height: 1px;
            background-color: var(--border-color);
            margin: 1.2rem 0;
        }

        .section-subtitle {
            font-weight: 600;
            font-size: 1rem;
            color: var(--primary-color);
            margin-bottom: 1.2rem;
            text-align: center;
            background-color: rgba(37, 99, 235, 0.05);
            padding: 0.6rem;
            border-radius: var(--radius);
        }

        .base-price-section {
            background-color: rgba(255, 255, 255, 0.8);
            border-radius: var(--radius);
            padding: 1.2rem;
            border: 1px solid var(--border-color);
            margin-top: 1rem;
            transition: all 0.3s ease;
        }

        .base-price-section:hover {
            box-shadow: var(--shadow-sm);
            background-color: white;
        }

        .result-value {
            font-weight: 600;
            color: var(--primary-color);
        }

        #base-input-price-display, #base-output-price-display,
        #real-input-price-usd, #real-output-price-usd,
        #real-input-price-cny, #real-output-price-cny,
        #input-cost, #output-cost,
        #input-cost-cny, #output-cost-cny {
            font-weight: 400;
            color: var(--text-color);
            font-size: 1.05rem;
            text-align: right;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            min-width: 120px;
            position: relative;
        }

        .price-calculation {
            font-size: 0.85rem;
            color: var(--text-light);
            margin-top: 0.8rem;
            display: block;
            text-align: left;
            border-top: 1px dashed rgba(37, 99, 235, 0.1);
            background-color: rgba(37, 99, 235, 0.03);
            padding: 0.8rem;
            border-radius: 0.3rem;
        }

        .price-calculation div:first-child {
            font-weight: 600;
            margin-bottom: 0.3rem;
            color: var(--primary-color);
        }

        .price-calculation div:not(:first-child) {
            margin-left: 0.5rem;
            line-height: 1.5;
        }

        .price-calc-separator {
            height: 1px;
            background-color: rgba(37, 99, 235, 0.1);
            margin: 0.5rem 0;
            border: none;
        }

        /* 计算过程说明样式 */
        .calculation-details {
            font-size: 0.8rem;
            color: var(--text-light);
            padding: 0.4rem 0.6rem;
            margin-top: 0.2rem;
            margin-bottom: 0.5rem;
            background-color: rgba(37, 99, 235, 0.03);
            border-radius: 0.3rem;
            border-left: 2px solid var(--primary-color);
            line-height: 1.4;
            grid-column: 1 / -1;
            display: none; /* 默认隐藏 */
        }

        .calculation-visible {
            display: block;
        }

        /* 新增切换按钮样式 */
        .toggle-calculations {
            background-color: var(--highlight-color);
            color: var(--primary-color);
            border: 1px solid var(--primary-color);
            padding: 0.5rem 0.7rem;
            border-radius: var(--radius);
            cursor: pointer;
            font-size: 0.85rem;
            font-weight: 500;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
            width: 100%;
            text-align: center;
            transition: all 0.2s ease;
        }

        .toggle-calculations:hover {
            background-color: rgba(37, 99, 235, 0.1);
        }

        /* 价格显示元素 */
        .display-group {
            margin-bottom: 1rem;
            position: relative;
        }

        .display-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
            font-weight: 500;
            color: var(--text-light);
        }

        .price-display {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid var(--border-color);
            border-radius: var(--radius);
            box-sizing: border-box;
            font-size: 1rem;
            background-color: #f8f9fa;
            font-family: 'Inter', sans-serif;
            font-weight: 500;
            color: var(--primary-color);
        }

        .calculation-note {
            font-size: 0.85rem;
            color: var(--text-light);
            margin-top: 1rem;
            padding: 0.8rem;
            background-color: rgba(37, 99, 235, 0.05);
            border-radius: var(--radius);
            border-left: 3px solid var(--primary-color);
            grid-column: 1 / -1;
        }

        .calculation-note div:first-child {
            font-weight: 600;
            margin-bottom: 0.4rem;
            color: var(--primary-color);
        }

        .calculation-note div:not(:first-child) {
            margin-left: 0.5rem;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <h1>API价格计算器</h1>

    <div class="calculator">
        <div class="section">
            <div class="section-title">倍率设置</div>
            <div class="input-group">
                <label for="model-rate">模型倍率</label>
                <input type="number" id="model-rate" step="0.1" value="2.50">
            </div>
            <div class="input-group">
                <label for="completion-rate">补全倍率</label>
                <input type="number" id="completion-rate" step="0.1" value="4.00">
            </div>
            <div class="input-group">
                <label for="group-rate">分组倍率</label>
                <input type="number" id="group-rate" step="0.1" value="1.00">
            </div>
        </div>

        <div class="section">
            <div class="section-title">基础价格设置</div>

            <div class="unit-toggle" style="grid-column: 1 / -1;">
                <button id="base-price-per-million" class="active" onclick="toggleBaseUnit('million')">每百万tokens</button>
                <button id="base-price-per-thousand" onclick="toggleBaseUnit('thousand')">每千tokens</button>
            </div>

            <div class="input-group">
                <label for="base-input-price">提示标价 (<span id="base-input-unit">每百万tokens</span> $)</label>
                <input type="number" id="base-input-price" step="0.01" value="5.00">
            </div>
            <div class="input-group">
                <label for="base-output-price">补全标价 (<span id="base-output-unit">每百万tokens</span> $)</label>
                <input type="number" id="base-output-price" step="0.01" value="20.00">
            </div>
        </div>

        <div class="section">
            <div class="section-title">Token用量</div>
            <div class="input-group">
                <label for="input-tokens">提示tokens数量</label>
                <input type="number" id="input-tokens" value="1000">
            </div>
            <div class="input-group">
                <label for="output-tokens">补全tokens数量</label>
                <input type="number" id="output-tokens" value="200">
            </div>
        </div>

        <div class="section">
            <div class="section-title">汇率设置</div>
            <div class="exchange-form">
                <div class="exchange-inputs">
                    <div class="input-group">
                        <label for="exchange-cny">人民币数值</label>
                        <input type="number" id="exchange-cny" step="0.01" value="7.2" min="0.01"> <!-- 默认汇率7.2 -->
                    </div>
                    <div class="exchange-equals">=</div>
                    <div class="input-group">
                        <label for="exchange-usd">美元数值</label>
                        <input type="number" id="exchange-usd" step="0.01" value="1.0" min="0.01">
                    </div>
                </div>
                <div class="exchange-rate-display" id="exchange-rate-display">
                    <span id="current-exchange-display"><span id="exchange-cny-value">7.2</span> 人民币 = <span id="exchange-usd-value">1.0</span> 美元</span>
                </div>
                <button type="button" class="secondary-button" onclick="applyExchangeRate()" style="width: 100%; margin-top: 1rem;">应用汇率</button>
            </div>
        </div>

        <button onclick="calculatePrice()" class="calculate-button">计算价格</button>

        <div id="results" class="results">
            <div class="section-title">计算结果</div>

            <div class="results-grid">
                <div class="results-column">
                    <div class="column-title">单价信息</div>
                    <div class="unit-toggle">
                        <button id="show-per-million" class="active" onclick="toggleUnit('million')">每百万tokens</button>
                        <button id="show-per-thousand" onclick="toggleUnit('thousand')">每千tokens</button>
                    </div>

                    <div class="base-price-section">
                        <div class="section-subtitle">标价信息</div>
                        <div class="result-row">
                            <span class="result-label">提示标价:</span>
                            <span id="base-input-price-display">$0.00</span>
                        </div>
                        <div class="result-row">
                            <span class="result-label">补全标价:</span>
                            <span id="base-output-price-display">$0.00</span>
                        </div>
                    </div>

                    <div class="result-separator"></div>
                    <div class="section-subtitle">最终计算单价</div>

                    <button class="toggle-calculations" id="toggle-unit-calculations">显示计算过程</button>

                    <div class="price-calculation" style="margin-top: 1rem;">
                        <div>计算公式说明：</div>
                        <div>提示实际价格 = 模型倍率 × (提示标价 ÷ 模型倍率) × 分组倍率</div>
                        <div>补全实际价格 = 补全倍率 × (补全标价 ÷ 补全倍率) × 分组倍率</div>
                    </div>

                    <div class="price-currency-grid">
                        <div class="price-currency-column">
                            <div class="currency-label">USD 单价</div>
                            <div class="result-row">
                                <span class="result-label">提示单价:</span>
                                <span id="real-input-price-usd">$0.00</span>
                            </div>
                            <div class="calculation-details" id="real-input-price-usd-calc"></div>
                            <div class="result-row">
                                <span class="result-label">补全单价:</span>
                                <span id="real-output-price-usd">$0.00</span>
                            </div>
                            <div class="calculation-details" id="real-output-price-usd-calc"></div>
                        </div>

                        <div class="price-currency-column">
                            <div class="currency-label">CNY 单价</div>
                            <div class="result-row">
                                <span class="result-label">提示单价:</span>
                                <span id="real-input-price-cny">¥0.00</span>
                            </div>
                            <div class="calculation-details" id="real-input-price-cny-calc"></div>
                            <div class="result-row">
                                <span class="result-label">补全单价:</span>
                                <span id="real-output-price-cny">¥0.00</span>
                            </div>
                            <div class="calculation-details" id="real-output-price-cny-calc"></div>
                        </div>
                    </div>
                </div>

                <div class="results-column">
                    <div class="column-title">费用信息</div>
                    <button class="toggle-calculations" id="toggle-calculations">显示计算过程</button>
                    <div class="result-row">
                        <span class="result-label">提示费用 (USD):</span>
                        <span id="input-cost">$0.00</span>
                    </div>
                    <div class="calculation-details" id="input-cost-calc"></div>
                    <div class="result-row">
                        <span class="result-label">补全费用 (USD):</span>
                        <span id="output-cost">$0.00</span>
                    </div>
                    <div class="calculation-details" id="output-cost-calc"></div>
                    <div class="result-row">
                        <span class="result-label">提示费用 (CNY):</span>
                        <span id="input-cost-cny">¥0.00</span>
                    </div>
                    <div class="calculation-details" id="input-cost-cny-calc"></div>
                    <div class="result-row">
                        <span class="result-label">补全费用 (CNY):</span>
                        <span id="output-cost-cny">¥0.00</span>
                    </div>
                    <div class="calculation-details" id="output-cost-cny-calc"></div>
                    <div class="result-row">
                        <span class="result-label">总费用 (USD):</span>
                        <span id="total-cost">$0.00</span>
                    </div>
                    <div class="calculation-details" id="total-cost-calc"></div>
                    <div class="result-row">
                        <span class="result-label">总费用 (CNY):</span>
                        <span id="total-cost-cny">¥0.00</span>
                    </div>
                    <div class="calculation-details" id="total-cost-cny-calc"></div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let currentUnit = 'million';
        let baseUnit = 'million'; // 保留这个变量用于基础价格单位切换
        let calculationResults = {};

        function formatNumber(num, decimals) {
            // 如果数字为0，直接返回带小数点的0
            if (num === 0) {
                return "0." + "0".repeat(decimals);
            }

            // 直接使用toFixed方法，无额外处理
            return num.toFixed(decimals);
        }

        function getExchangeRate() {
            const usdValue = parseFloat(document.getElementById('exchange-usd').value);
            const cnyValue = parseFloat(document.getElementById('exchange-cny').value);

            if (!isNaN(usdValue) && !isNaN(cnyValue) && usdValue > 0 && cnyValue > 0) {
                return cnyValue / usdValue; // 汇率 = 人民币值 / 美元值
            }

            // 如果输入无效或未设置，返回一个默认值，例如 7.2
            // 在实际应用中，你可能希望从一个可靠的API获取实时汇率
            // 但对于这个计算器，我们用一个默认值或用户输入值
            const defaultCny = 7.2;
            const defaultUsd = 1.0;
            document.getElementById('exchange-cny').value = defaultCny;
            document.getElementById('exchange-usd').value = defaultUsd;
            updateExchangeRateDisplay(); // 更新显示为默认值
            return defaultCny / defaultUsd;
        }


        function toggleBaseUnit(unit) {
            // 自动调整价格
            const baseInputPriceEl = document.getElementById('base-input-price');
            const baseOutputPriceEl = document.getElementById('base-output-price');
            const baseInputPrice = parseFloat(baseInputPriceEl.value);
            const baseOutputPrice = parseFloat(baseOutputPriceEl.value);

            if (!isNaN(baseInputPrice) && !isNaN(baseOutputPrice)) {
                if (unit === 'thousand' && baseUnit === 'million') {
                    // 从百万转换为千
                    baseInputPriceEl.value = (baseInputPrice / 1000).toFixed(6);
                    baseOutputPriceEl.value = (baseOutputPrice / 1000).toFixed(6);
                } else if (unit === 'million' && baseUnit === 'thousand') {
                    // 从千转换为百万
                    baseInputPriceEl.value = (baseInputPrice * 1000).toFixed(2);
                    baseOutputPriceEl.value = (baseOutputPrice * 1000).toFixed(2);
                }
            }

            // 更新变量和UI状态
            baseUnit = unit;
            document.getElementById('base-price-per-million').classList.toggle('active', unit === 'million');
            document.getElementById('base-price-per-thousand').classList.toggle('active', unit === 'thousand');

            // 更新标签文本
            const unitText = unit === 'million' ? '每百万tokens' : '每千tokens';
            document.getElementById('base-input-unit').textContent = unitText;
            document.getElementById('base-output-unit').textContent = unitText;

            // 重新计算价格
            calculatePrice();
        }


        function calculatePrice() {
            // 获取输入值
            let baseInputPrice = parseFloat(document.getElementById('base-input-price').value) || 0;
            let baseOutputPrice = parseFloat(document.getElementById('base-output-price').value) || 0;
            const modelRate = parseFloat(document.getElementById('model-rate').value) || 1;
            const completionRate = parseFloat(document.getElementById('completion-rate').value) || 1;
            const groupRate = parseFloat(document.getElementById('group-rate').value) || 1;
            const inputTokens = parseFloat(document.getElementById('input-tokens').value) || 0;
            const outputTokens = parseFloat(document.getElementById('output-tokens').value) || 0;
            const exchangeRate = getExchangeRate(); // getExchangeRate 已包含默认值处理

            // 确保倍率至少为1，防止除零或负数倍率问题
            const safeModelRate = Math.max(0.000001, modelRate); // Use a very small positive number instead of 1 if 0 is invalid
            const safeCompletionRate = Math.max(0.000001, completionRate);
            const safeGroupRate = Math.max(0, groupRate); // Group rate can be 0


            // 根据单位调整基础价格到每百万tokens
            let baseInputPricePerMillion = baseInputPrice;
            let baseOutputPricePerMillion = baseOutputPrice;
            if (baseUnit === 'thousand') {
                // 如果输入以每千tokens为单位，转换为每百万tokens
                baseInputPricePerMillion = baseInputPrice * 1000;
                baseOutputPricePerMillion = baseOutputPrice * 1000;
            }

            // 计算基准价格 = 标价 / 倍率 (防止除以0)
            const baseRealInputPrice = baseInputPricePerMillion / safeModelRate;
            const baseRealOutputPrice = baseOutputPricePerMillion / safeCompletionRate;

            // 新的计算逻辑
            // 模型倍率 * 基准价格 * 分组倍率 = 实际价格
            const realInputPricePerMillion = safeModelRate * baseRealInputPrice * safeGroupRate;
            const realOutputPricePerMillion = safeCompletionRate * baseRealOutputPrice * safeGroupRate;

            // 计算每千tokens价格
            const realInputPricePerThousand = realInputPricePerMillion / 1000;
            const realOutputPricePerThousand = realOutputPricePerMillion / 1000;

            // 计算费用 (基于实际用量)
            const inputCost = (inputTokens / 1000000) * realInputPricePerMillion;
            const outputCost = (outputTokens / 1000000) * realOutputPricePerMillion;
            const totalCost = inputCost + outputCost;

            // 计算人民币费用
            const inputCostCny = inputCost * exchangeRate;
            const outputCostCny = outputCost * exchangeRate;
            const totalCostCny = totalCost * exchangeRate;

            // 保存计算结果，添加额外数据用于显示
            calculationResults = {
                perMillion: {
                    inputPrice: realInputPricePerMillion,
                    outputPrice: realOutputPricePerMillion,
                    inputCost: inputCost,
                    outputCost: outputCost,
                    totalCost: totalCost,
                    inputCostCny: inputCostCny,
                    outputCostCny: outputCostCny,
                    totalCostCny: totalCostCny,
                    // 添加更多字段用于显示计算过程
                    baseInputPrice: baseInputPricePerMillion, // Always store per million internally for consistency
                    baseOutputPrice: baseOutputPricePerMillion,
                    baseRealInputPrice: baseRealInputPrice,
                    baseRealOutputPrice: baseRealOutputPrice,
                    modelRate: safeModelRate,
                    completionRate: safeCompletionRate,
                    groupRate: safeGroupRate,
                    inputTokens: inputTokens,
                    outputTokens: outputTokens,
                    exchangeRate: exchangeRate
                },
                perThousand: {
                    inputPrice: realInputPricePerThousand,
                    outputPrice: realOutputPricePerThousand,
                    inputCost: inputCost,
                    outputCost: outputCost,
                    totalCost: totalCost,
                    inputCostCny: inputCostCny,
                    outputCostCny: outputCostCny,
                    totalCostCny: totalCostCny,
                    // 添加更多字段用于显示计算过程
                    baseInputPrice: baseInputPricePerMillion / 1000,
                    baseOutputPrice: baseOutputPricePerMillion / 1000,
                    baseRealInputPrice: baseRealInputPrice / 1000,
                    baseRealOutputPrice: baseRealOutputPrice / 1000,
                    modelRate: safeModelRate,
                    completionRate: safeCompletionRate,
                    groupRate: safeGroupRate,
                    inputTokens: inputTokens,
                    outputTokens: outputTokens,
                    exchangeRate: exchangeRate
                }
            };

            // 显示结果
            updateResultsDisplay();

            // 显示结果区域
            const resultsElement = document.getElementById('results');
            if (resultsElement) {
                 resultsElement.classList.add('show');
            }

            // 添加数字计数动画效果
            animateResults();
        }


        function animateResults() {
            // 为数字添加专业的动画效果
            const animatedElements = [
                { id: 'base-input-price-display', delay: 50 },
                { id: 'base-output-price-display', delay: 100 },
                { id: 'real-input-price-usd', delay: 150 },
                { id: 'real-output-price-usd', delay: 200 },
                { id: 'real-input-price-cny', delay: 250 },
                { id: 'real-output-price-cny', delay: 300 },
                { id: 'input-cost', delay: 350 },
                { id: 'output-cost', delay: 400 },
                { id: 'input-cost-cny', delay: 450 },
                { id: 'output-cost-cny', delay: 500 },
                { id: 'total-cost', delay: 600, isTotal: true },
                { id: 'total-cost-cny', delay: 650, isTotal: true }
            ];

            // 添加脉冲波动动画的CSS (确保只添加一次)
            if (!document.getElementById('animation-styles')) {
                const styleSheet = document.createElement('style');
                styleSheet.id = 'animation-styles';
                styleSheet.innerHTML = \`
                    @keyframes pulseGlow {
                        0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); }
                        70% { box-shadow: 0 0 0 10px rgba(37, 99, 235, 0); }
                        100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
                    }
                    @keyframes countUp {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes highlight {
                        0% { background-color: transparent; }
                        50% { background-color: rgba(37, 99, 235, 0.1); } /* Lighter highlight */
                        100% { background-color: transparent; }
                    }
                    .result-highlight {
                        animation: highlight 1.2s ease-out; /* Faster highlight */
                        border-radius: 4px;
                        display: inline-block; /* Ensure background covers text */
                        padding: 0 2px; /* Small padding */
                        margin: 0 -2px; /* Counteract padding */
                    }
                    .total-highlight {
                        position: relative;
                    }
                    /* Removed pulseGlow ::after for cleaner look */
                \`;
                document.head.appendChild(styleSheet);
            }

            // 应用动画和高亮
            animatedElements.forEach(item => {
                const element = document.getElementById(item.id);
                if (!element) return;

                 // 清除旧的动画和样式残留
                element.style.opacity = '';
                element.style.transform = '';
                element.style.transition = '';
                element.style.fontWeight = ''; // Reset font weight
                element.style.fontSize = '';   // Reset font size
                element.style.color = '';      // Reset color
                element.classList.remove('result-highlight', 'total-highlight');


                // 使用 setTimeout 触发动画
                setTimeout(() => {
                    // Apply entrance animation
                    element.style.opacity = '0';
                    element.style.transform = 'translateY(8px)'; // Slightly smaller movement
                    element.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out'; // Faster transition

                    // Trigger reflow before applying final state
                    void element.offsetWidth;

                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';

                    // Add highlight effect shortly after entrance
                    setTimeout(() => {
                         element.classList.add('result-highlight');
                    }, 50); // Start highlight slightly after text appears


                    // Style total costs differently
                    if (item.isTotal) {
                        element.classList.add('total-highlight');
                        element.style.fontWeight = '700'; // Bold
                        element.style.fontSize = '1.15rem'; // Slightly larger
                         // element.style.color = item.id === 'total-cost' ? 'var(--primary-color)' : '#ef4444'; // Set color directly
                    }

                    // Clean up highlight class after animation
                    setTimeout(() => {
                         element.classList.remove('result-highlight');
                         // Ensure final styles remain for totals
                         if (item.isTotal) {
                             element.style.fontWeight = '700';
                             element.style.fontSize = '1.15rem';
                             // element.style.color = item.id === 'total-cost' ? 'var(--primary-color)' : '#ef4444';
                         } else {
                             // Reset non-total elements to default styles if needed
                             element.style.fontWeight = '';
                             element.style.fontSize = '';
                             element.style.color = '';
                         }
                    }, 1250); // Duration of highlight animation + entrance = 1200ms + buffer

                }, item.delay);
            });

             // Add results columns entrance animation
             const resultsColumns = document.querySelectorAll('.results-column');
             resultsColumns.forEach((column, index) => {
                 column.style.opacity = '0';
                 column.style.transform = 'translateY(15px)'; // Smaller movement
                 column.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out'; // Smoother/faster

                 setTimeout(() => {
                     column.style.opacity = '1';
                     column.style.transform = 'translateY(0)';
                 }, 150 + index * 100); // Faster stagger
             });
        }


        function toggleUnit(unit) {
            currentUnit = unit;
            document.getElementById('show-per-million').classList.toggle('active', unit === 'million');
            document.getElementById('show-per-thousand').classList.toggle('active', unit === 'thousand');
            updateResultsDisplay(); // Re-render results with the new unit
            animateResults(); // Re-apply animation when unit changes
        }

        function updateResultsDisplay() {
            // Check if calculationResults is populated
            if (!calculationResults.perMillion || !calculationResults.perThousand) {
                console.log("Calculation results not ready.");
                return; // Exit if data isn't ready
            }

            const results = calculationResults[currentUnit === 'million' ? 'perMillion' : 'perThousand'];
            const baseResults = calculationResults['perMillion']; // Base prices are always stored per million

            const unitSuffix = currentUnit === 'million' ? '/百万' : '/千';
            const exchangeRate = results.exchangeRate; // Use stored rate
            const modelRate = results.modelRate;
            const completionRate = results.completionRate;
            const groupRate = results.groupRate;
            const inputTokens = results.inputTokens;
            const outputTokens = results.outputTokens;

            // Determine display precision based on unit
            const priceDecimals = currentUnit === 'million' ? 6 : 6; // Keep 6 for per thousand too for precision
            const costDecimals = 6; // Costs are usually fine with 6 decimals


            // Helper to get elements safely
            const getEl = (id) => document.getElementById(id);
            const setContent = (id, text) => {
                const el = getEl(id);
                if (el) el.textContent = text;
            };
            const setHTML = (id, html) => {
                 const el = getEl(id);
                 if (el) el.innerHTML = html;
            }

            // --- Display Base Prices (always show based on the *input* unit setting) ---
            const baseUnitSuffix = baseUnit === 'million' ? '/百万' : '/千';
            const baseInputDisplayPrice = baseUnit === 'million' ? baseResults.baseInputPrice : baseResults.baseInputPrice / 1000;
            const baseOutputDisplayPrice = baseUnit === 'million' ? baseResults.baseOutputPrice : baseResults.baseOutputPrice / 1000;
            const basePriceDecimals = baseUnit === 'million' ? 2 : 6; // Adjust precision based on input setting

            setContent('base-input-price-display', \`$\${formatNumber(baseInputDisplayPrice, basePriceDecimals)} \${baseUnitSuffix} (标价)\`);
            setContent('base-output-price-display', \`$\${formatNumber(baseOutputDisplayPrice, basePriceDecimals)} \${baseUnitSuffix} (标价)\`);


            // --- Display Real Unit Prices (USD) ---
            setContent('real-input-price-usd', \`$\${formatNumber(results.inputPrice, priceDecimals)}\${unitSuffix}\`);
            setContent('real-output-price-usd', \`$\${formatNumber(results.outputPrice, priceDecimals)}\${unitSuffix}\`);

            // --- Display Real Unit Prices (CNY) ---
            const cnyInputPrice = results.inputPrice * exchangeRate;
            const cnyOutputPrice = results.outputPrice * exchangeRate;
            setContent('real-input-price-cny', \`¥\${formatNumber(cnyInputPrice, priceDecimals)}\${unitSuffix}\`);
            setContent('real-output-price-cny', \`¥\${formatNumber(cnyOutputPrice, priceDecimals)}\${unitSuffix}\`);

            // --- Display Costs (USD) ---
            setContent('input-cost', \`$\${formatNumber(results.inputCost, costDecimals)}\`);
            setContent('output-cost', \`$\${formatNumber(results.outputCost, costDecimals)}\`);
            setContent('total-cost', \`$\${formatNumber(results.totalCost, costDecimals)}\`);

            // --- Display Costs (CNY) ---
            setContent('input-cost-cny', \`¥\${formatNumber(results.inputCostCny, costDecimals)}\`);
            setContent('output-cost-cny', \`¥\${formatNumber(results.outputCostCny, costDecimals)}\`);
            setContent('total-cost-cny', \`¥\${formatNumber(results.totalCostCny, costDecimals)}\`);


            // --- Update Calculation Details ---
            const formatRate = (r) => formatNumber(r, 2); // Format rates consistently
            const formatPrice = (p) => formatNumber(p, priceDecimals);
            const formatCost = (c) => formatNumber(c, costDecimals);
            const formatToken = (t) => t.toLocaleString(); // Format large token numbers

            // Unit Price Calculations
            const baseInputForCalc = results.baseInputPrice; // Use unit-adjusted base price for calc display
            const baseOutputForCalc = results.baseOutputPrice;
            const baseRealInputForCalc = results.baseRealInputPrice;
            const baseRealOutputForCalc = results.baseRealOutputPrice;

            setHTML('real-input-price-usd-calc', \`
                模型倍率 × (标价 ÷ 模型倍率) × 分组倍率

                = \${formatRate(modelRate)} × ($<span class="calc-num">\${formatPrice(baseInputForCalc)}</span>\${unitSuffix} ÷ \${formatRate(modelRate)}) × \${formatRate(groupRate)}

                = \${formatRate(modelRate)} ×$<span class="calc-num">\${formatPrice(baseRealInputForCalc)}</span>\${unitSuffix} × \${formatRate(groupRate)}

                = $<span class="calc-result">\${formatPrice(results.inputPrice)}</span>\${unitSuffix}
            \`);
             setHTML('real-output-price-usd-calc', \`
                补全倍率 × (标价 ÷ 补全倍率) × 分组倍率

                = \${formatRate(completionRate)} × ($<span class="calc-num">\${formatPrice(baseOutputForCalc)}</span>\${unitSuffix} ÷ \${formatRate(completionRate)}) × \${formatRate(groupRate)}

                = \${formatRate(completionRate)} ×$<span class="calc-num">\${formatPrice(baseRealOutputForCalc)}</span>\${unitSuffix} × \${formatRate(groupRate)}

                = $<span class="calc-result">\${formatPrice(results.outputPrice)}</span>\${unitSuffix}
            \`);
            setHTML('real-input-price-cny-calc', \`
                $<span class="calc-num">\${formatPrice(results.inputPrice)}</span>\${unitSuffix} (USD单价) × \${formatRate(exchangeRate)} (汇率)

                 = ¥<span class="calc-result">\${formatPrice(cnyInputPrice)}</span>\${unitSuffix}
            \`);
             setHTML('real-output-price-cny-calc', \`
                $<span class="calc-num">\${formatPrice(results.outputPrice)}</span>\${unitSuffix} (USD单价) × \${formatRate(exchangeRate)} (汇率)

                 = ¥<span class="calc-result">\${formatPrice(cnyOutputPrice)}</span>\${unitSuffix}
            \`);

            // Cost Calculations (Always use per million prices for cost calculation)
            const inputPricePerM = calculationResults.perMillion.inputPrice;
            const outputPricePerM = calculationResults.perMillion.outputPrice;

            setHTML('input-cost-calc', \`
                (\${formatToken(inputTokens)} tokens ÷ 1,000,000) ×$<span class="calc-num">\${formatNumber(inputPricePerM, 6)}</span>/百万

                 = $<span class="calc-result">\${formatCost(results.inputCost)}</span>
            \`);
             setHTML('output-cost-calc', \`
                (\${formatToken(outputTokens)} tokens ÷ 1,000,000) ×$<span class="calc-num">\${formatNumber(outputPricePerM, 6)}</span>/百万

                 = $<span class="calc-result">\${formatCost(results.outputCost)}</span>
            \`);
            setHTML('total-cost-calc', \`
                $<span class="calc-num">\${formatCost(results.inputCost)}</span> (提示USD) + $<span class="calc-num">\${formatCost(results.outputCost)}</span> (补全USD)

                 = $<span class="calc-result">\${formatCost(results.totalCost)}</span>
            \`);
            setHTML('input-cost-cny-calc', \`
                $<span class="calc-num">\${formatCost(results.inputCost)}</span> (提示USD) × \${formatRate(exchangeRate)} (汇率)

                 = ¥<span class="calc-result">\${formatCost(results.inputCostCny)}</span>
            \`);
             setHTML('output-cost-cny-calc', \`
                $<span class="calc-num">\${formatCost(results.outputCost)}</span> (补全USD) × \${formatRate(exchangeRate)} (汇率)

                 = ¥<span class="calc-result">\${formatCost(results.outputCostCny)}</span>
            \`);
            setHTML('total-cost-cny-calc', \`
                ¥<span class="calc-num">\${formatCost(results.inputCostCny)}</span> (提示CNY) + ¥<span class="calc-num">\${formatCost(results.outputCostCny)}</span> (补全CNY)

                 = ¥<span class="calc-result">\${formatCost(results.totalCostCny)}</span>
                
或 $<span class="calc-num">\${formatCost(results.totalCost)}</span> (总USD) × \${formatRate(exchangeRate)} (汇率)
            \`);

             // Add styles for calculation details numbers
             if (!document.getElementById('calc-detail-styles')) {
                const style = document.createElement('style');
                style.id = 'calc-detail-styles';
                style.innerHTML = \`
                    .calc-num { font-weight: 500; color: var(--text-light); }
                    .calc-result { font-weight: 600; color: var(--primary-color); }
                    .calculation-details br { margin-bottom: 4px; display: block; }
                \`;
                document.head.appendChild(style);
            }
        }


        function updateExchangeRateDisplay() {
            const cnyInput = document.getElementById('exchange-cny');
            const usdInput = document.getElementById('exchange-usd');
            const cnyValue = parseFloat(cnyInput.value);
            const usdValue = parseFloat(usdInput.value);

            const displayCny = document.getElementById('exchange-cny-value');
            const displayUsd = document.getElementById('exchange-usd-value');
            const displayContainer = document.getElementById('exchange-rate-display');

            if (displayCny && displayUsd) {
                if (!isNaN(cnyValue) && !isNaN(usdValue) && usdValue > 0 && cnyValue > 0) {
                    displayCny.textContent = cnyValue.toFixed(2);
                    displayUsd.textContent = usdValue.toFixed(2);
                    displayContainer.style.backgroundColor = 'var(--highlight-color)'; // Reset background on valid input
                    displayContainer.style.borderLeft = '3px solid var(--primary-color)';
                } else {
                    // Optionally indicate invalid input, but keep the last valid display or default
                    // For simplicity, we just don't update if invalid
                }
            }
        }


        function applyExchangeRate() {
            const usdValue = parseFloat(document.getElementById('exchange-usd').value);
            const cnyValue = parseFloat(document.getElementById('exchange-cny').value);
            const exchangeRateDisplay = document.getElementById('exchange-rate-display');
            const currentDisplay = document.getElementById('current-exchange-display');

            if (!isNaN(usdValue) && !isNaN(cnyValue) && usdValue > 0 && cnyValue > 0) {
                // 更新汇率显示
                updateExchangeRateDisplay();

                // 短暂高亮显示汇率应用成功
                exchangeRateDisplay.style.transition = 'background-color 0.2s ease, border-color 0.2s ease';
                exchangeRateDisplay.style.backgroundColor = 'rgba(34, 197, 94, 0.15)'; // Lighter success green
                exchangeRateDisplay.style.borderLeftColor = '#22c55e';

                // 重新计算价格
                calculatePrice(); // Calculate price uses the new values via getExchangeRate()

                // 恢复原始样式
                setTimeout(() => {
                    exchangeRateDisplay.style.backgroundColor = 'var(--highlight-color)';
                    exchangeRateDisplay.style.borderLeftColor = 'var(--primary-color)';
                }, 1000); // Keep highlighted for 1 second

            } else {
                // 输入无效时显示提示
                currentDisplay.textContent = '请输入有效的汇率值 (大于0)';
                exchangeRateDisplay.style.transition = 'background-color 0.2s ease, border-color 0.2s ease';
                exchangeRateDisplay.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; // Error red background
                exchangeRateDisplay.style.borderLeftColor = '#ef4444'; // Error red border

                // 3秒后尝试恢复显示 (如果用户没改的话会恢复默认)
                setTimeout(() => {
                     // Re-run display logic which might reset to defaults or previous valid state
                     updateExchangeRateDisplay();
                     // Get the current values again in case user fixed them
                     const currentCny = parseFloat(document.getElementById('exchange-cny').value);
                     const currentUsd = parseFloat(document.getElementById('exchange-usd').value);
                     if (!isNaN(currentCny) && !isNaN(currentUsd) && currentUsd > 0 && currentCny > 0) {
                         currentDisplay.innerHTML = \`<span id="exchange-cny-value">\${currentCny.toFixed(2)}</span> 人民币 = <span id="exchange-usd-value">\${currentUsd.toFixed(2)}</span> 美元\`;
                         exchangeRateDisplay.style.backgroundColor = 'var(--highlight-color)';
                         exchangeRateDisplay.style.borderLeftColor = 'var(--primary-color)';
                     } else {
                         // If still invalid, maybe keep the error message or clear it
                          currentDisplay.innerHTML = \`<span id="exchange-cny-value">7.2</span> 人民币 = <span id="exchange-usd-value">1.0</span> 美元\`; // Reset to default text
                          exchangeRateDisplay.style.backgroundColor = 'var(--highlight-color)';
                          exchangeRateDisplay.style.borderLeftColor = 'var(--primary-color)';
                     }
                }, 3000);
            }
        }

        // 更新基准价格 (仅触发重新计算)
        function handleRateOrPriceChange() {
            // No need to update intermediate displays, just recalculate everything
            calculatePrice();
        }

        // 页面加载时和交互时初始化/更新
        function initializeCalculator() {
            // 设置初始汇率显示
            updateExchangeRateDisplay();

            // 添加事件监听器
            const inputsToListen = [
                'model-rate', 'completion-rate', 'group-rate',
                'base-input-price', 'base-output-price',
                'input-tokens', 'output-tokens',
                'exchange-cny', // Listen to exchange rate inputs for live display update
                'exchange-usd'
            ];

            inputsToListen.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                     if (id === 'exchange-cny' || id === 'exchange-usd') {
                         element.addEventListener('input', updateExchangeRateDisplay);
                     } else {
                         // Most inputs trigger a full recalculation on change
                         element.addEventListener('input', handleRateOrPriceChange);
                     }
                }
            });

             // Setup toggle buttons
             document.getElementById('toggle-calculations')?.addEventListener('click', function() {
                 const isVisible = toggleVisibility('.results-column:nth-child(2) .calculation-details');
                 this.textContent = isVisible ? '隐藏费用计算过程' : '显示费用计算过程';
             });

             document.getElementById('toggle-unit-calculations')?.addEventListener('click', function() {
                 const isVisible = toggleVisibility('.price-currency-column .calculation-details');
                 this.textContent = isVisible ? '隐藏单价计算过程' : '显示单价计算过程';
             });

             // Helper function for toggling visibility
             function toggleVisibility(selector) {
                 const details = document.querySelectorAll(selector);
                 if (!details.length) return false;
                 // Check visibility state based on the first element
                 const currentlyVisible = details[0].classList.contains('calculation-visible');
                 details.forEach(detail => {
                     detail.classList.toggle('calculation-visible', !currentlyVisible);
                 });
                 return !currentlyVisible; // Return the new visibility state
             }


            // 首次加载时自动计算价格
            calculatePrice();
        }

        // DOMContentLoaded is generally preferred over window.onload
        document.addEventListener('DOMContentLoaded', initializeCalculator);

    </script>
</body>
</html>
`;

// Deno.serve takes a handler function that receives a Request object
// and returns a Response object or a Promise resolving to a Response.
Deno.serve((req: Request) => {
  const url = new URL(req.url);

  // Serve the main HTML file for the root path
  if (url.pathname === "/") {
    return new Response(htmlContent, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }

  // Optional: Handle favicon requests to avoid 404 logs in the browser console
  if (url.pathname === "/favicon.ico") {
     // You could return a small transparent ico file here if you have one,
     // or just return 204 No Content or 404 Not Found.
     return new Response(null, { status: 204 });
  }

  // For any other path, return 404 Not Found
  return new Response("Not Found", { status: 404 });
});

// Log a message when the server starts (useful for local testing)
console.log("Calculator server running. Access it at http://localhost:8000");
