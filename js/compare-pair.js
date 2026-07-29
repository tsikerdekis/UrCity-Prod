/**
 * URCity Dynamic City Pair Comparison Engine
 * 
 * Renders a full side-by-side comparison for any two cities
 * using embedded city data. Supports URL-based pair selection
 * (?from=nyc&to=austin-tx) for SEO and sharing.
 * 
 * All 11 languages work automatically via Hugo i18n strings.
 * No static pages needed for individual pairs — O(1) not O(n²).
 */

(function() {
  'use strict';

  const CITY_DATA = window.URCity && window.URCity.cityData;
  if (!CITY_DATA) return;

  // --- URL parameter handling ---
  function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return { from: params.get('from'), to: params.get('to') };
  }

  function updateUrl(from, to) {
    const url = new URL(window.location);
    if (from && to) {
      url.searchParams.set('from', from);
      url.searchParams.set('to', to);
    } else {
      url.searchParams.delete('from');
      url.searchParams.delete('to');
    }
    window.history.replaceState({ from, to }, '', url);
  }

  // --- City lookup ---
  function findCity(slug) {
    return CITY_DATA.find(c => c.slug === slug);
  }

  // --- Currency & temperature helpers (uses URCitySettings) ---
  function getCurrency(country) {
    const map = {
      'AD': 'EUR', 'AE': 'AED', 'AF': 'AFN', 'AG': 'XCD', 'AI': 'XCD',
      'AL': 'ALL', 'AM': 'AMD', 'AO': 'AOA', 'AR': 'ARS', 'AT': 'EUR',
      'AU': 'AUD', 'AZ': 'AZN', 'BA': 'BAM', 'BB': 'BBD', 'BD': 'BDT',
      'BE': 'EUR', 'BF': 'XOF', 'BG': 'BGN', 'BH': 'BHD', 'BI': 'BIF',
      'BN': 'BND', 'BO': 'BOB', 'BR': 'BRL', 'BS': 'BSD', 'BT': 'BTN',
      'BW': 'BWP', 'BY': 'BYN', 'BZ': 'BZD', 'CA': 'CAD', 'CF': 'XAF',
      'CG': 'XAF', 'CH': 'CHF', 'CI': 'XOF', 'CL': 'CLP', 'CM': 'XAF',
      'CN': 'CNY', 'CO': 'COP', 'CR': 'CRC', 'CU': 'CUP', 'CV': 'CVE',
      'CY': 'EUR', 'CZ': 'CZK', 'DE': 'EUR', 'DJ': 'DJF', 'DK': 'DKK',
      'DM': 'XCD', 'DO': 'DOP', 'DZ': 'DZD', 'EC': 'USD', 'EE': 'EUR',
      'EG': 'EGP', 'ER': 'ERN', 'ES': 'EUR', 'ET': 'ETB', 'FI': 'EUR',
      'FJ': 'FJD', 'FM': 'USD', 'FR': 'EUR', 'GA': 'XAF', 'GB': 'GBP',
      'GD': 'XCD', 'GE': 'GEL', 'GH': 'GHS', 'GL': 'DKK', 'GM': 'GMD',
      'GN': 'GNF', 'GQ': 'XAF', 'GR': 'EUR', 'GT': 'GTQ', 'GW': 'XOF',
      'GY': 'GYD', 'HK': 'HKD', 'HN': 'HNL', 'HR': 'EUR', 'HT': 'HTG',
      'HU': 'HUF', 'IDN': 'IDR', 'IE': 'EUR', 'IL': 'ILS', 'IN': 'INR',
      'IQ': 'IQD', 'IR': 'IRR', 'IT': 'EUR', 'JM': 'JMD', 'JO': 'JOD',
      'JP': 'JPY', 'KE': 'KES', 'KG': 'KGS', 'KH': 'KHR', 'KI': 'AUD',
      'KM': 'KMF', 'KN': 'XCD', 'KR': 'KRW', 'KW': 'KWD', 'KZ': 'KZT',
      'LA': 'LAK', 'LB': 'LBP', 'LC': 'XCD', 'LI': 'CHF', 'LK': 'LKR',
      'LR': 'LRD', 'LS': 'LSL', 'LT': 'EUR', 'LU': 'EUR', 'LV': 'EUR',
      'LY': 'LYD', 'MA': 'MAD', 'MC': 'EUR', 'MD': 'MDL', 'ME': 'EUR',
      'MG': 'MGA', 'MH': 'USD', 'MK': 'MKD', 'ML': 'XOF', 'MM': 'MMK',
      'MN': 'MNT', 'MR': 'MRU', 'MT': 'EUR', 'MU': 'MUR', 'MV': 'MVR',
      'MW': 'MWK', 'MX': 'MXN', 'MZ': 'MZN', 'NA': 'NAD', 'NE': 'XOF',
      'NG': 'NGN', 'NI': 'NIO', 'NL': 'EUR', 'NO': 'NOK', 'NP': 'NPR',
      'NR': 'AUD', 'NZ': 'NZD', 'OM': 'OMR', 'PA': 'USD', 'PE': 'PEN',
      'PG': 'PGK', 'PK': 'PKR', 'PL': 'PLN', 'PT': 'EUR', 'PW': 'USD',
      'PY': 'PYG', 'QA': 'QAR', 'RO': 'RON', 'RS': 'RSD', 'RU': 'RUB',
      'RW': 'RWF', 'SA': 'SAR', 'SB': 'SBD', 'SC': 'SCR', 'SD': 'SDG',
      'SE': 'SEK', 'SG': 'SGD', 'SI': 'EUR', 'SK': 'EUR', 'SL': 'SLL',
      'SM': 'EUR', 'SN': 'XOF', 'SO': 'SOS', 'SR': 'SRD', 'SS': 'SSP',
      'ST': 'STN', 'SV': 'USD', 'SY': 'SYP', 'SZ': 'SZL', 'TD': 'XAF',
      'TG': 'XOF', 'TH': 'THB', 'TJ': 'TJS', 'TL': 'USD', 'TM': 'TMT',
      'TN': 'TND', 'TO': 'TOP', 'TR': 'TRY', 'TT': 'TTD', 'TV': 'AUD',
      'TW': 'TWD', 'TZ': 'TZS', 'UA': 'UAH', 'UG': 'UGX', 'US': 'USD',
      'UY': 'UYU', 'UZ': 'UZS', 'VC': 'XCD', 'VE': 'VES', 'VN': 'VND',
      'VU': 'VUV', 'WS': 'WST', 'XK': 'EUR', 'YE': 'YER', 'ZA': 'ZAR',
      'ZM': 'ZMW', 'ZW': 'ZWL',
    };
    return map[country] || 'USD';
  }

  function formatCurrency(value, country) {
    if (!value && value !== 0) return '—';
    const nativeCurrency = getCurrency(country || 'US');
    const settings = window.URCitySettings;
    if (settings) {
      const state = settings.getState();
      const symbol = settings.getCurrencySymbol(state.currency);
      const nativeSymbol = settings.getCurrencySymbol(nativeCurrency);
      const converted = settings.convertAmount(Number(value), nativeCurrency, state.currency);
      const formatted = Math.round(converted).toLocaleString();
      if (state.currency !== nativeCurrency) {
        return symbol + formatted + ' <span class="currency-native">(' + nativeSymbol + Number(value).toLocaleString() + ')</span>';
      }
      return symbol + formatted;
    }
    return '$' + Number(value).toLocaleString();
  }

  function formatTemp(f) {
    if (!f && f !== 0) return '—';
    const settings = window.URCitySettings;
    if (settings) {
      const state = settings.getState();
      if (state.tempUnit === 'C') {
        return Math.round((f - 32) * 5 / 9) + '°C';
      }
    }
    return f + '°F';
  }

  function formatPercent(value) {
    if (!value && value !== 0) return '—';
    return value + '%';
  }

  function formatPopulation(value) {
    if (!value) return '—';
    return value;
  }

  function formatDiff(a, b, isLowerBetter) {
    if (!a || !b) return { text: '—', cls: 'diff-same' };
    const diff = b - a;
    const pct = a > 0 ? Math.round((diff / a) * 100) : 0;
    const absPct = Math.abs(pct);
    let cls;
    if (isLowerBetter) {
      cls = diff < 0 ? 'diff-lower' : diff > 0 ? 'diff-higher' : 'diff-same';
    } else {
      cls = diff > 0 ? 'diff-lower' : diff < 0 ? 'diff-higher' : 'diff-same';
    }
    const sign = pct > 0 ? '+' : '';
    return { text: `${sign}${absPct}%`, cls };
  }

  // --- Render functions ---
  function renderComparison(fromSlug, toSlug) {
    const cityA = findCity(fromSlug);
    const cityB = findCity(toSlug);
    if (!cityA || !cityB) return;

    // Show results, hide empty state
    document.getElementById('comparison-results').classList.remove('hidden');
    document.getElementById('empty-state').classList.add('hidden');

    // Update page title
    document.title = `${cityA.name} vs ${cityB.name}: Cost of Living Comparison | URCity`;

    // City cards
    document.getElementById('city-name-a').textContent = cityA.name + ', ' + cityA.state;
    document.getElementById('city-name-b').textContent = cityB.name + ', ' + cityB.state;
    document.getElementById('city-summary-a').textContent = cityA.summary || '';
    document.getElementById('city-summary-b').textContent = cityB.summary || '';
    document.getElementById('city-link-a').href = cityA.url || '#';
    document.getElementById('city-link-b').href = cityB.url || '#';
    document.getElementById('city-img-a').src = cityA.image || '/images/og-default.svg';
    document.getElementById('city-img-b').src = cityB.image || '/images/og-default.svg';
    document.getElementById('city-img-a').alt = cityA.name;
    document.getElementById('city-img-b').alt = cityB.name;

    // Table headers
    document.getElementById('table-header-a').textContent = cityA.name;
    document.getElementById('table-header-b').textContent = cityB.name;
    document.getElementById('tax-header-a').textContent = cityA.name;
    document.getElementById('tax-header-b').textContent = cityB.name;
    document.getElementById('climate-header-a').textContent = cityA.name;
    document.getElementById('climate-header-b').textContent = cityB.name;

    // Score bars
    renderScoreBars(cityA, cityB);

    // Data table
    renderDataTable(cityA, cityB);

    // Tax table
    renderTaxTable(cityA, cityB);

    // Climate table
    renderClimateTable(cityA, cityB);

    // Salary calculator
    renderSalaryCalculator(cityA, cityB);
  }

  function renderScoreBars(a, b) {
    const container = document.getElementById('score-bars');
    const metrics = [
      { label: 'Cost of Living', key: 'col', lowerBetter: true },
      { label: 'Housing Index', key: 'housing', lowerBetter: true },
      { label: '1BR Rent', key: 'rent', lowerBetter: true },
      { label: 'Median Home Price', key: 'home', lowerBetter: true },
    ];

    container.innerHTML = metrics.map(m => {
      const valA = a[m.key] || 0;
      const valB = b[m.key] || 0;
      const max = Math.max(valA, valB) || 1;
      const pctA = (valA / max) * 100;
      const pctB = (valB / max) * 100;
      const winner = m.lowerBetter ? (valA < valB ? 'A' : valB < valA ? 'B' : 'tie') : (valA > valB ? 'A' : valB > valA ? 'B' : 'tie');

      return `
        <div class="score-bar-group">
          <div class="score-label">${m.label}</div>
          <div class="score-bars">
            <div class="score-bar-wrapper ${winner === 'A' ? 'winner' : ''}">
              <div class="score-bar" style="width: ${pctA}%">
                <span class="score-value">${formatCurrency(valA, a.country)}</span>
              </div>
            </div>
            <div class="score-bar-wrapper ${winner === 'B' ? 'winner' : ''}">
              <div class="score-bar" style="width: ${pctB}%">
                <span class="score-value">${formatCurrency(valB, b.country)}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderDataTable(a, b) {
    const tbody = document.getElementById('table-body');
    const rows = [
      { label: 'Cost of Living Index', valA: a.col, valB: b.col, fmt: v => v, lowerBetter: true },
      { label: 'Housing Index', valA: a.housing, valB: b.housing, fmt: v => v, lowerBetter: true },
      { label: '1BR Rent', valA: a.rent, valB: b.rent, fmt: v => formatCurrency(v, a.country), fmtB: v => formatCurrency(v, b.country), lowerBetter: true },
      { label: 'Median Home Price', valA: a.home, valB: b.home, fmt: v => formatCurrency(v, a.country), fmtB: v => formatCurrency(v, b.country), lowerBetter: true },
      { label: 'Median Income', valA: a.income, valB: b.income, fmt: v => v || '—', lowerBetter: false },
      { label: 'Unemployment', valA: a.unemployment, valB: b.unemployment, fmt: v => v || '—', lowerBetter: true },
      { label: 'Population', valA: a.pop, valB: b.pop, fmt: formatPopulation, lowerBetter: false },
    ];

    tbody.innerHTML = rows.map(r => {
      const diff = formatDiff(
        typeof r.valA === 'string' ? parseFloat(String(r.valA).replace(/[^0-9.]/g, '')) : r.valA,
        typeof r.valB === 'string' ? parseFloat(String(r.valB).replace(/[^0-9.]/g, '')) : r.valB,
        r.lowerBetter
      );
      return `
        <tr>
          <td>${r.label}</td>
          <td>${r.fmtB ? r.fmt(r.valA) : r.fmt(r.valA)}</td>
          <td>${r.fmtB ? r.fmtB(r.valB) : r.fmt(r.valB)}</td>
          <td class="${diff.cls}">${diff.text}</td>
        </tr>
      `;
    }).join('');
  }

  function renderTaxTable(a, b) {
    const tbody = document.getElementById('tax-body');
    tbody.innerHTML = `
      <tr>
        <td>State Income Tax</td>
        <td>${a.taxState == 0 ? '<strong>0%</strong>' : a.taxState + '%'}</td>
        <td>${b.taxState == 0 ? '<strong>0%</strong>' : b.taxState + '%'}</td>
      </tr>
      <tr>
        <td>Sales Tax</td>
        <td>${a.taxSales}%</td>
        <td>${b.taxSales}%</td>
      </tr>
    `;
  }

  function renderClimateTable(a, b) {
    const tbody = document.getElementById('climate-body');
    tbody.innerHTML = `
      <tr>
        <td>Summer High</td>
        <td>${formatTemp(a.summer)}</td>
        <td>${formatTemp(b.summer)}</td>
      </tr>
      <tr>
        <td>Winter Low</td>
        <td>${formatTemp(a.winter)}</td>
        <td>${formatTemp(b.winter)}</td>
      </tr>
      <tr>
        <td>Sunny Days</td>
        <td>${a.sunny}</td>
        <td>${b.sunny}</td>
      </tr>
    `;
  }

  function renderSalaryCalculator(a, b) {
    const container = document.getElementById('salary-calculator');
    const colA = a.col || 100;
    const colB = b.col || 100;
    const ratio = colA > 0 ? (colB / colA) : 1;
    
    container.innerHTML = `
      <div class="salary-calc-widget">
        <label>Salary in ${a.name}:</label>
        <input type="number" id="salary-input" value="100000" min="0" step="10000">
        <button id="calc-salary-btn" class="btn btn-primary">Calculate</button>
        <div id="salary-result" class="salary-result">
          <p>To maintain the same standard of living in <strong>${b.name}</strong>, you need approximately:</p>
          <p class="salary-equivalent">${formatCurrency(100000 * ratio, b.country)}</p>
        </div>
      </div>
    `;

    document.getElementById('calc-salary-btn').addEventListener('click', function() {
      const salary = parseFloat(document.getElementById('salary-input').value) || 0;
      const equivalent = Math.round(salary * ratio);
      document.getElementById('salary-result').innerHTML = `
        <p>To maintain the same standard of living in <strong>${b.name}</strong>, you need approximately:</p>
        <p class="salary-equivalent">${formatCurrency(equivalent, b.country)}</p>
      `;
    });
  }

  // --- Autocomplete search ---
  function setupAutocomplete(inputId, dropdownId, selectId, onChange) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    const select = document.getElementById(selectId);

    input.addEventListener('input', function() {
      const q = this.value.toLowerCase();
      const options = select.options;
      let results = [];
      for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        if (!opt.value) continue;
        const text = opt.text.toLowerCase();
        if (text.includes(q)) {
          results.push({ value: opt.value, text: opt.text, data: opt.dataset });
        }
      }
      results = results.slice(0, 20);

      if (results.length === 0 || !q) {
        dropdown.classList.add('hidden');
        return;
      }

      dropdown.innerHTML = results.map(r => `
        <div class="search-dropdown-item" data-value="${r.value}">
          ${r.text}
        </div>
      `).join('');
      dropdown.classList.remove('hidden');

      dropdown.querySelectorAll('.search-dropdown-item').forEach(item => {
        item.addEventListener('click', function() {
          const val = this.dataset.value;
          select.value = val;
          input.value = this.textContent;
          dropdown.classList.add('hidden');
          if (onChange) onChange(val);
        });
      });
    });

    input.addEventListener('blur', function() {
      setTimeout(() => dropdown.classList.add('hidden'), 200);
    });

    input.addEventListener('focus', function() {
      if (this.value) this.dispatchEvent(new Event('input'));
    });
  }

  // --- Init ---
  function init() {
    const params = getUrlParams();
    let fromSlug = params.from;
    let toSlug = params.to;

    // Setup autocompletes
    setupAutocomplete('search-a', 'dropdown-a', 'city-a', function(val) {
      fromSlug = val;
      if (fromSlug && toSlug) {
        updateUrl(fromSlug, toSlug);
        renderComparison(fromSlug, toSlug);
      }
    });

    setupAutocomplete('search-b', 'dropdown-b', 'city-b', function(val) {
      toSlug = val;
      if (fromSlug && toSlug) {
        updateUrl(fromSlug, toSlug);
        renderComparison(fromSlug, toSlug);
      }
    });

    // Swap button
    document.getElementById('swap-cities').addEventListener('click', function() {
      const temp = fromSlug;
      fromSlug = toSlug;
      toSlug = temp;
      
      // Update selects
      document.getElementById('city-a').value = fromSlug || '';
      document.getElementById('city-b').value = toSlug || '';
      
      // Update search inputs
      const cityA = findCity(fromSlug);
      const cityB = findCity(toSlug);
      document.getElementById('search-a').value = cityA ? `${cityA.name}, ${cityA.state}` : '';
      document.getElementById('search-b').value = cityB ? `${cityB.name}, ${cityB.state}` : '';

      if (fromSlug && toSlug) {
        updateUrl(fromSlug, toSlug);
        renderComparison(fromSlug, toSlug);
      }
    });

    // If URL has params, auto-select
    if (fromSlug) {
      const cityA = findCity(fromSlug);
      if (cityA) {
        document.getElementById('city-a').value = fromSlug;
        document.getElementById('search-a').value = `${cityA.name}, ${cityA.state}`;
      }
    }
    if (toSlug) {
      const cityB = findCity(toSlug);
      if (cityB) {
        document.getElementById('city-b').value = toSlug;
        document.getElementById('search-b').value = `${cityB.name}, ${cityB.state}`;
      }
    }

    // Render if both cities are set
    if (fromSlug && toSlug) {
      renderComparison(fromSlug, toSlug);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
