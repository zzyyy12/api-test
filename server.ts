// server.ts
import { serve } from "https://deno.land/std@0.182.0/http/server.ts";

const htmlContent = `<!DOCTYPE html>
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
                        <input type="number" id="exchange-cny" step="0.01" value="1.2" min="0.01">
                    </div>
                    <div class="exchange-equals">=</div>
                    <div class="input-group">
                        <label for="exchange-usd">美元数值</label>
                        <input type="number" id="exchange-usd" step="0.01" value="1.0" min="0.01">
                    </div>
                </div>
                <div class="exchange-rate-display" id="exchange-rate-display">
                    <span id="current-exchange-display"><span id="exchange-cny-value">1.2</span> 人民币 = <span id="exchange-usd-value">1.0</span> 美元</span>
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
            
            return 7.2; // 默认汇率
        }
        
        function toggleBaseUnit(unit) {
            // 自动调整价格
            const baseInputPrice = parseFloat(document.getElementById('base-input-price').value);
            const baseOutputPrice = parseFloat(document.getElementById('base-output-price').value);
            
            if (!isNaN(baseInputPrice) && !isNaN(baseOutputPrice)) {
                if (unit === 'thousand' && baseUnit === 'million') {
                    // 从百万转换为千
                    document.getElementById('base-input-price').value = (baseInputPrice / 1000).toFixed(6);
                    document.getElementById('base-output-price').value = (baseOutputPrice / 1000).toFixed(6);
                } else if (unit === 'million' && baseUnit === 'thousand') {
                    // 从千转换为百万
                    document.getElementById('base-input-price').value = (baseInputPrice * 1000).toFixed(2);
                    document.getElementById('base-output-price').value = (baseOutputPrice * 1000).toFixed(2);
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
            let baseInputPrice = parseFloat(document.getElementById('base-input-price').value);
            let baseOutputPrice = parseFloat(document.getElementById('base-output-price').value);
            const modelRate = parseFloat(document.getElementById('model-rate').value);
            const completionRate = parseFloat(document.getElementById('completion-rate').value);
            const groupRate = parseFloat(document.getElementById('group-rate').value);
            const inputTokens = parseFloat(document.getElementById('input-tokens').value);
            const outputTokens = parseFloat(document.getElementById('output-tokens').value);
            const exchangeRate = getExchangeRate();
            
            // 根据单位调整基础价格到每百万tokens
            if (baseUnit === 'thousand') {
                // 如果输入以每千tokens为单位，转换为每百万tokens
                baseInputPrice = baseInputPrice * 1000;
                baseOutputPrice = baseOutputPrice * 1000;
            }
            
            // 计算基准价格 = 标价 / 倍率
            const baseRealInputPrice = baseInputPrice / modelRate;
            const baseRealOutputPrice = baseOutputPrice / completionRate;
            
            // 新的计算逻辑
            // 模型倍率 * 基准价格 * 分组倍率 = 实际价格
            const realInputPricePerMillion = modelRate * baseRealInputPrice * groupRate;
            const realOutputPricePerMillion = completionRate * baseRealOutputPrice * groupRate;
            
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
                    baseInputPrice: baseUnit === 'thousand' ? baseInputPrice / 1000 : baseInputPrice,
                    baseOutputPrice: baseUnit === 'thousand' ? baseOutputPrice / 1000 : baseOutputPrice,
                    baseRealInputPrice: baseUnit === 'thousand' ? baseRealInputPrice / 1000 : baseRealInputPrice,
                    baseRealOutputPrice: baseUnit === 'thousand' ? baseRealOutputPrice / 1000 : baseRealOutputPrice,
                    modelRate: modelRate,
                    completionRate: completionRate,
                    groupRate: groupRate
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
                    baseInputPrice: baseInputPrice / 1000,
                    baseOutputPrice: baseOutputPrice / 1000,
                    baseRealInputPrice: baseRealInputPrice / 1000,
                    baseRealOutputPrice: baseRealOutputPrice / 1000,
                    modelRate: modelRate,
                    completionRate: completionRate,
                    groupRate: groupRate
                }
            };
            
            // 显示结果
            updateResultsDisplay();
            
            // 显示结果区域
            const resultsElement = document.getElementById('results');
            resultsElement.classList.add('show');
            
            // 添加数字计数动画效果
            animateResults();
        }
        
        function animateResults() {
            // 为数字添加专业的动画效果
            const animatedElements = [
                { id: 'real-input-price-usd', delay: 100 },
                { id: 'real-output-price-usd', delay: 200 },
                { id: 'real-input-price-cny', delay: 300 },
                { id: 'real-output-price-cny', delay: 400 },
                { id: 'input-cost', delay: 500 },
                { id: 'output-cost', delay: 600 },
                { id: 'input-cost-cny', delay: 700 },
                { id: 'output-cost-cny', delay: 800 },
                { id: 'total-cost', delay: 1000, isTotal: true },
                { id: 'total-cost-cny', delay: 1100, isTotal: true }
            ];
            
            // 添加脉冲波动动画的CSS
            if (!document.getElementById('animation-styles')) {
                const styleSheet = document.createElement('style');
                styleSheet.id = 'animation-styles';
                styleSheet.innerHTML = `
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
                        50% { background-color: rgba(37, 99, 235, 0.15); }
                        100% { background-color: transparent; }
                    }
                    .result-highlight {
                        animation: highlight 1.5s ease;
                        border-radius: 4px;
                    }
                    .total-highlight {
                        position: relative;
                    }
                    .total-highlight::after {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        border-radius: 4px;
                        box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
                        opacity: 0;
                        animation: pulseGlow 1.5s ease-in-out;
                    }
                `;
                document.head.appendChild(styleSheet);
            }
            
            // 模拟数字计数动画
            animatedElements.forEach(item => {
                const element = document.getElementById(item.id);
                if (!element) return;
                
                // 获取当前显示的值
                const originalText = element.textContent;
                // 提取数字部分
                const match = originalText.match(/[¥$]([\d.]+)/);
                
                if (match) {
                    const originalValue = parseFloat(match[1]);
                    const currency = originalText.includes('$') ? '$' : '¥';
                    const suffix = originalText.includes('/') ? originalText.substring(originalText.indexOf('/')) : '';
                    
                    // 保存原始类
                    const originalClasses = element.className;
                    
                    setTimeout(() => {
                        // 添加动画类
                        element.style.opacity = '0';
                        element.style.transform = 'translateY(10px)';
                        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                        
                        // 在下一帧应用动画
                        requestAnimationFrame(() => {
                            element.style.opacity = '1';
                            element.style.transform = 'translateY(0)';
                            
                            // 添加高亮效果
                            element.classList.add('result-highlight');
                            
                            // 如果是总费用，添加特殊高亮
                            if (item.isTotal) {
                                element.classList.add('total-highlight');
                                // 粗体和稍大字体
                                element.style.fontWeight = '700';
                                element.style.fontSize = '1.15rem';
                                
                                // 添加脉冲效果
                                setTimeout(() => {
                                    element.style.transition = 'all 1s ease';
                                    if (item.id === 'total-cost') {
                                        element.style.color = '#2563eb';
                                    } else {
                                        element.style.color = '#ef4444';
                                    }
                                }, 1000);
                            }
                            
                            // 移除动画类
                            setTimeout(() => {
                                element.classList.remove('result-highlight');
                            }, 1500);
                        });
                    }, item.delay);
                }
            });
            
            // 添加结果区域的进入动画
            const resultsColumns = document.querySelectorAll('.results-column');
            resultsColumns.forEach((column, index) => {
                column.style.opacity = '0';
                column.style.transform = 'translateY(20px)';
                column.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                
                setTimeout(() => {
                    column.style.opacity = '1';
                    column.style.transform = 'translateY(0)';
                }, 300 + index * 150);
            });
        }
        
        function toggleUnit(unit) {
            currentUnit = unit;
            document.getElementById('show-per-million').classList.toggle('active', unit === 'million');
            document.getElementById('show-per-thousand').classList.toggle('active', unit === 'thousand');
            updateResultsDisplay();
        }
        
        function updateResultsDisplay() {
            const results = calculationResults[currentUnit === 'million' ? 'perMillion' : 'perThousand'];
            const unitSuffix = currentUnit === 'million' ? '/百万' : '/千';
            const exchangeRate = getExchangeRate();
            
            // 获取基础价格以显示
            const baseInputPrice = parseFloat(document.getElementById('base-input-price').value);
            const baseOutputPrice = parseFloat(document.getElementById('base-output-price').value);
            const modelRate = parseFloat(document.getElementById('model-rate').value);
            const completionRate = parseFloat(document.getElementById('completion-rate').value);
            const groupRate = parseFloat(document.getElementById('group-rate').value);
            const inputTokens = parseFloat(document.getElementById('input-tokens').value);
            const outputTokens = parseFloat(document.getElementById('output-tokens').value);
            
            // 显示基础价格
            document.getElementById('base-input-price-display').textContent = 
                '$' + formatNumber(results.baseInputPrice, 6) + unitSuffix + ' (标价)';
            document.getElementById('base-output-price-display').textContent = 
                '$' + formatNumber(results.baseOutputPrice, 6) + unitSuffix + ' (标价)';
            
            // 美元单价
            document.getElementById('real-input-price-usd').textContent = 
                '$' + formatNumber(results.inputPrice, 6) + unitSuffix;
            document.getElementById('real-output-price-usd').textContent = 
                '$' + formatNumber(results.outputPrice, 6) + unitSuffix;
            
            // 为美元单价添加计算过程 - 更新为正确的计算公式
            document.getElementById('real-input-price-usd-calc').innerHTML = 
                \`模型倍率 × (标价 ÷ 模型倍率) × 分组倍率<br>
                 = \${formatNumber(modelRate, 2)} × ($\${formatNumber(results.baseInputPrice, 6)} ÷ \${formatNumber(modelRate, 2)}) × \${formatNumber(groupRate, 2)}<br>
                 = \${formatNumber(modelRate, 2)} × $\${formatNumber(results.baseRealInputPrice, 6)} × \${formatNumber(groupRate, 2)}<br>
                 = $\${formatNumber(results.inputPrice, 6)}\`;
            document.getElementById('real-output-price-usd-calc').innerHTML = 
                \`补全倍率 × (标价 ÷ 补全倍率) × 分组倍率<br>
                 = \${formatNumber(completionRate, 2)} × ($\${formatNumber(results.baseOutputPrice, 6)} ÷ \${formatNumber(completionRate, 2)}) × \${formatNumber(groupRate, 2)}<br>
                 = \${formatNumber(completionRate, 2)} × $\${formatNumber(results.baseRealOutputPrice, 6)} × \${formatNumber(groupRate, 2)}<br>
                 = $\${formatNumber(results.outputPrice, 6)}\`;
            
            // 人民币单价 (美元单价 × 汇率)
            const cnyInputPrice = results.inputPrice * exchangeRate;
            const cnyOutputPrice = results.outputPrice * exchangeRate;
            
            document.getElementById('real-input-price-cny').textContent = 
                '¥' + formatNumber(cnyInputPrice, 6) + unitSuffix;
            document.getElementById('real-output-price-cny').textContent = 
                '¥' + formatNumber(cnyOutputPrice, 6) + unitSuffix;
            
            // 为人民币单价添加计算过程
            document.getElementById('real-input-price-cny-calc').innerHTML = 
                \`计算过程: $\${formatNumber(results.inputPrice, 6)} (美元单价) × \${formatNumber(exchangeRate, 2)} (汇率) = ¥\${formatNumber(cnyInputPrice, 6)}\`;
            document.getElementById('real-output-price-cny-calc').innerHTML = 
                \`计算过程: $\${formatNumber(results.outputPrice, 6)} (美元单价) × \${formatNumber(exchangeRate, 2)} (汇率) = ¥\${formatNumber(cnyOutputPrice, 6)}\`;
            
            // 费用信息
            document.getElementById('input-cost').textContent = 
                '$' + formatNumber(results.inputCost, 6);
            document.getElementById('output-cost').textContent = 
                '$' + formatNumber(results.outputCost, 6);
            document.getElementById('total-cost').textContent = 
                '$' + formatNumber(results.totalCost, 6);
            
            // 为费用信息添加计算过程 - 更新为正确的计算公式
            document.getElementById('input-cost-calc').innerHTML = 
                \`提示 \${inputTokens} tokens ÷ 1,000,000 × $\${formatNumber(results.inputPrice, 6)} = $\${formatNumber(results.inputCost, 6)}\`;
            document.getElementById('output-cost-calc').innerHTML = 
                \`补全 \${outputTokens} tokens ÷ 1,000,000 × $\${formatNumber(results.outputPrice, 6)} = $\${formatNumber(results.outputCost, 6)}\`;
            document.getElementById('total-cost-calc').innerHTML = 
                \`$\${formatNumber(results.inputCost, 6)} (提示费用) + $\${formatNumber(results.outputCost, 6)} (补全费用) = $\${formatNumber(results.totalCost, 6)}\`;
            
            // 人民币费用
            document.getElementById('input-cost-cny').textContent = 
                '¥' + formatNumber(results.inputCostCny, 6);
            document.getElementById('output-cost-cny').textContent = 
                '¥' + formatNumber(results.outputCostCny, 6);
            document.getElementById('total-cost-cny').textContent = 
                '¥' + formatNumber(results.totalCostCny, 6);
            
            // 为人民币费用添加计算过程
            document.getElementById('input-cost-cny-calc').innerHTML = 
                \`计算过程: $\${formatNumber(results.inputCost, 6)} (美元费用) × \${formatNumber(exchangeRate, 2)} (汇率) = ¥\${formatNumber(results.inputCostCny, 6)}\`;
            document.getElementById('output-cost-cny-calc').innerHTML = 
                \`计算过程: $\${formatNumber(results.outputCost, 6)} (美元费用) × \${formatNumber(exchangeRate, 2)} (汇率) = ¥\${formatNumber(results.outputCostCny, 6)}\`;
            document.getElementById('total-cost-cny-calc').innerHTML = 
                \`计算过程: $\${formatNumber(results.totalCost, 6)} (美元总费用) × \${formatNumber(exchangeRate, 2)} (汇率) = ¥\${formatNumber(results.totalCostCny, 6)}\`;
        }
        
        function updateExchangeRateDisplay() {
            const cnyValue = parseFloat(document.getElementById('exchange-cny').value);
            const usdValue = parseFloat(document.getElementById('exchange-usd').value);
            
            if (!isNaN(cnyValue) && !isNaN(usdValue) && usdValue > 0 && cnyValue > 0) {
                document.getElementById('exchange-cny-value').textContent = cnyValue.toFixed(2);
                document.getElementById('exchange-usd-value').textContent = usdValue.toFixed(2);
            }
        }
        
        function applyExchangeRate() {
            // 获取输入值
            const usdValue = parseFloat(document.getElementById('exchange-usd').value);
            const cnyValue = parseFloat(document.getElementById('exchange-cny').value);
            
            if (!isNaN(usdValue) && !isNaN(cnyValue) && usdValue > 0 && cnyValue > 0) {
                // 更新汇率
                const exchangeRate = cnyValue / usdValue;
                
                // 更新汇率显示
                updateExchangeRateDisplay();
                
                // 高亮显示汇率变更成功
                const exchangeRateDisplay = document.getElementById('exchange-rate-display');
                exchangeRateDisplay.style.animation = 'none';
                exchangeRateDisplay.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';  // 成功绿色背景
                exchangeRateDisplay.style.borderLeft = '3px solid #22c55e';  // 成功绿色边框
                setTimeout(() => {
                    exchangeRateDisplay.style.animation = 'fadeIn 0.5s ease';
                    setTimeout(() => {
                        exchangeRateDisplay.style.backgroundColor = 'var(--highlight-color)';
                        exchangeRateDisplay.style.borderLeft = '3px solid var(--primary-color)';
                    }, 1000);
                }, 10);
                
                // 重新计算价格
                calculatePrice();
            } else {
                // 输入无效时显示提示在汇率显示区域
                document.getElementById('current-exchange-display').textContent = '输入无效';
                document.getElementById('exchange-rate-display').style.backgroundColor = 'rgba(239, 68, 68, 0.1)';  // 错误红色背景
                document.getElementById('exchange-rate-display').style.borderLeft = '3px solid #ef4444';  // 错误红色边框
                
                // 3秒后恢复
                setTimeout(() => {
                    document.getElementById('exchange-rate-display').style.backgroundColor = 'var(--highlight-color)';
                    document.getElementById('exchange-rate-display').style.borderLeft = '3px solid var(--primary-color)';
                    updateExchangeRateDisplay();
                }, 3000);
            }
        }
        
        // 页面加载时初始化
        window.onload = function() {
            // 设置初始汇率显示
            updateExchangeRateDisplay();
            
            // 添加输入事件监听
            // 更新基准价格和标价的联动
            document.getElementById('base-input-price').addEventListener('input', updateBaseRealPrices);
            document.getElementById('base-output-price').addEventListener('input', updateBaseRealPrices);
            
            // 倍率变化时更新价格
            document.getElementById('model-rate').addEventListener('input', updateBaseRealPrices);
            document.getElementById('completion-rate').addEventListener('input', updateBaseRealPrices);
            document.getElementById('group-rate').addEventListener('input', calculatePrice);
            
            // 添加输入框变化时更新显示
            document.getElementById('exchange-cny').addEventListener('input', updateExchangeRateDisplay);
            document.getElementById('exchange-usd').addEventListener('input', updateExchangeRateDisplay);
            
            // 添加计算过程显示切换功能
            document.getElementById('toggle-calculations').addEventListener('click', function() {
                const calcDetails = document.querySelectorAll('.calculation-details');
                const isVisible = calcDetails[0].classList.contains('calculation-visible');
                
                calcDetails.forEach(detail => {
                    detail.classList.toggle('calculation-visible', !isVisible);
                });
                
                this.textContent = isVisible ? '显示计算过程' : '隐藏计算过程';
            });
            
            // 添加单价计算过程显示切换功能
            document.getElementById('toggle-unit-calculations').addEventListener('click', function() {
                const calcDetails = document.querySelectorAll('.price-currency-column .calculation-details');
                const isVisible = calcDetails[0].classList.contains('calculation-visible');
                
                calcDetails.forEach(detail => {
                    detail.classList.toggle('calculation-visible', !isVisible);
                });
                
                this.textContent = isVisible ? '显示计算过程' : '隐藏计算过程';
            });
            
            // 自动计算价格
            calculatePrice();
        };
        
        // 更新基准价格
        function updateBaseRealPrices(event) {
            const baseInputPrice = parseFloat(document.getElementById('base-input-price').value);
            const baseOutputPrice = parseFloat(document.getElementById('base-output-price').value);
            const modelRate = parseFloat(document.getElementById('model-rate').value);
            const completionRate = parseFloat(document.getElementById('completion-rate').value);
            
            // 不再显示基准价格，但仍然在内部计算
            // 重新计算价格
            calculatePrice();
        }
    </script>
</body>
</html>`;

console.log("Server running on http://localhost:8000");
await serve(
  (req: Request) =>
    new Response(htmlContent, {
      headers: { "content-type": "text/html; charset=utf-8" },
    }),
  { port: 8000 },
);