const TRANSLATIONS = {
    tr: {
        app_title: "Mohr Analizi",
        app_subtitle: "Zemin Mekaniği Laboratuvarı",
        input_title: "Deney Verileri (kPa)",
        test_1: "Deney 1",
        test_2: "Deney 2",
        test_3: "Deney 3",
        btn_analyze: "Analiz Et ve Çiz",
        results_title: "Sonuç parametreleri",
        res_cohesion: "Kohezyon (c)",
        res_friction: "İçsel Sürtünme (ϕ)",
        unit_degree: "derece",
        legend_circles: "Mohr Daireleri",
        legend_envelope: "Göçme Zarfı",
        axis_x: "Normal Gerilme σ (kPa)",
        axis_y: "Kayma Gerilmesi τ (kPa)",
        toggle_btn: "EN",
        filter_title: "Görünüm:",
        filter_all: "Tümü",
        test_label: "Deney"
    },
    en: {
        app_title: "Mohr Analysis",
        app_subtitle: "Soil Mechanics Laboratory",
        input_title: "Test Data (kPa)",
        test_1: "Test 1",
        test_2: "Test 2",
        test_3: "Test 3",
        btn_analyze: "Analyze and Plot",
        results_title: "Result Parameters",
        res_cohesion: "Cohesion (c)",
        res_friction: "Internal Friction (ϕ)",
        unit_degree: "degrees",
        legend_circles: "Mohr Circles",
        legend_envelope: "Failure Envelope",
        axis_x: "Normal Stress σ (kPa)",
        axis_y: "Shear Stress τ (kPa)",
        toggle_btn: "TR",
        filter_title: "View:",
        filter_all: "All",
        test_label: "Test"
    }
};

class MohrApp {
    constructor() {
        this.canvas = document.getElementById('mohrCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.lang = 'en';
        this.filter = 'all';

        // Initial Data State
        this.experiments = [
            { s3: 100, s1: 403.99 },
            { s3: 210, s1: 675.81 },
            { s3: 330, s1: 924.19 }
        ];

        this.resizeCanvas();

        // Bind UI Elements
        document.getElementById('drawBtn').addEventListener('click', () => this.update());
        document.getElementById('addBtn').addEventListener('click', () => this.addExperiment());
        document.getElementById('removeBtn').addEventListener('click', () => this.removeExperiment());

        const langBtn = document.getElementById('langToggle');
        langBtn.textContent = TRANSLATIONS[this.lang].toggle_btn;
        langBtn.addEventListener('click', () => this.toggleLanguage());

        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.update();
        });

        // Initial Render
        this.renderInputs();
        this.applyTranslations(); // Apply translation after rendering
        this.update();
    }

    addExperiment() {
        // Default values for new experiment: slightly larger than last one or fixed
        const last = this.experiments[this.experiments.length - 1];
        const newEx = last
            ? { s3: last.s3 + 100, s1: last.s1 + 200 }
            : { s3: 100, s1: 300 };

        this.experiments.push(newEx);
        this.renderInputs();
        this.applyTranslations();
        this.update();
    }

    removeExperiment() {
        if (this.experiments.length > 0) {
            this.experiments.pop();
            this.renderInputs();

            // Reset filter if we deleted the currently viewed item
            if (this.filter !== 'all' && parseInt(this.filter) >= this.experiments.length) {
                this.filter = 'all';
            }

            this.applyTranslations();
            this.update();
        }
    }

    renderInputs() {
        const container = document.getElementById('inputsContainer');
        container.innerHTML = '';
        const t = TRANSLATIONS[this.lang];

        this.experiments.forEach((ex, index) => {
            const group = document.createElement('div');
            group.className = 'input-group';

            group.innerHTML = `
                <label>${t ? t.test_label : 'Deney'} ${index + 1}</label>
                <div class="row">
                    <div class="field">
                        <span>σ3</span>
                        <input type="number" class="inp-s3" data-index="${index}" value="${ex.s3}">
                    </div>
                    <div class="field">
                        <span>σ1</span>
                        <input type="number" class="inp-s1" data-index="${index}" value="${ex.s1}">
                    </div>
                </div>
            `;
            container.appendChild(group);
        });

        // Add listeners to new inputs
        container.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                const val = parseFloat(e.target.value) || 0;
                if (e.target.classList.contains('inp-s3')) {
                    this.experiments[index].s3 = val;
                } else {
                    this.experiments[index].s1 = val;
                }
            });
        });

        this.renderFilters();
    }

    renderFilters() {
        const container = document.getElementById('filterContainer');
        container.innerHTML = '';
        const t = TRANSLATIONS[this.lang];

        // "All" button
        const allBtn = document.createElement('button');
        allBtn.className = `filter-btn ${this.filter === 'all' ? 'active' : ''}`;
        allBtn.dataset.filter = 'all';
        allBtn.textContent = t ? t.filter_all : 'All'; // Fallback if T not loaded yet
        allBtn.setAttribute('data-i18n', 'filter_all'); // For re-translation

        allBtn.addEventListener('click', () => this.setFilter('all'));
        container.appendChild(allBtn);

        // Individual buttons
        this.experiments.forEach((_, index) => {
            const btn = document.createElement('button');
            btn.className = `filter-btn ${this.filter === index.toString() ? 'active' : ''}`;
            btn.dataset.filter = index;
            btn.textContent = index + 1;

            btn.addEventListener('click', () => this.setFilter(index.toString()));
            container.appendChild(btn);
        });
    }

    setFilter(val) {
        this.filter = val;
        this.renderFilters(); // Re-render to update active class
        this.update();
    }

    toggleLanguage() {
        this.lang = this.lang === 'tr' ? 'en' : 'tr';
        document.getElementById('langToggle').textContent = TRANSLATIONS[this.lang].toggle_btn;
        this.renderInputs(); // Labels need to be re-rendered or we just apply translation?
        // renderInputs re-creates DOM, so it picks up the new lang if we call it.
        // But simpler: just apply translations, and for dynamic content relies on renderInputs using correct lang

        this.applyTranslations();
        this.update();
    }

    applyTranslations() {
        const t = TRANSLATIONS[this.lang];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) {
                el.textContent = t[key];
            }
        });
    }

    resizeCanvas() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.clientWidth;
        this.canvas.height = parent.clientHeight;
    }

    getData() {
        const data = [];
        this.experiments.forEach(ex => {
            const s3 = parseFloat(ex.s3) || 0;
            const s1 = parseFloat(ex.s1) || 0;
            if (s1 > s3) { // Valid circle only if sigma1 > sigma3
                data.push({
                    s3,
                    s1,
                    center: (s1 + s3) / 2,
                    radius: (s1 - s3) / 2
                });
            }
        });
        return data;
    }

    calculateParameters(circles) {
        if (circles.length < 2) return null;

        // Perform linear regression on (Center, Radius)
        // Theory: Radius = sin(phi) * Center + c * cos(phi)
        // Y = m*X + b
        // m = sin(phi)
        // b = c * cos(phi)

        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        const n = circles.length;

        for (const c of circles) {
            const x = c.center;
            const y = c.radius;
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumXX += x * x;
        }

        const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const b = (sumY - m * sumX) / n;

        // Calculate physical parameters
        // m = sin(phi) -> phi = arcsin(m)
        // b = c * cos(phi) -> c = b / cos(phi)

        // Safety check for arcsin domain [-1, 1]
        if (m < -1 || m > 1) return { c: 0, phi: 0, valid: false };

        const phiRad = Math.asin(m);
        const phiDeg = phiRad * (180 / Math.PI);
        const c = b / Math.cos(phiRad);

        return {
            c: c,
            phi: phiDeg,
            m: m,
            b: b,
            valid: true
        };
    }

    renderLegend() {
        const container = document.getElementById('legendContainer');
        container.innerHTML = '';
        const t = TRANSLATIONS[this.lang];
        const colors = this.getColors();

        this.experiments.forEach((_, index) => {
            const item = document.createElement('div');
            item.className = 'item';
            const color = colors[index % colors.length];

            item.innerHTML = `<span class="color-box" style="background-color: ${color}"></span><span>${t.test_label} ${index + 1}</span>`;
            container.appendChild(item);
        });

        // Envelope
        const envItem = document.createElement('div');
        envItem.className = 'item';
        envItem.innerHTML = `<span class="color-box envelope"></span><span>${t.legend_envelope}</span>`;
        container.appendChild(envItem);
    }

    getColors() {
        return [
            '#38bdf8', '#e879f9', '#4ade80', '#fb7185',
            '#facc15', '#a78bfa', '#2dd4bf', '#f472b6'
        ];
    }

    draw(circles, params) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const t = TRANSLATIONS[this.lang];

        ctx.clearRect(0, 0, w, h);

        // 1. Calculate boundaries to set scale
        let maxX = 0;
        let maxY = 0;

        if (circles.length === 0) {
            maxX = 1000;
            maxY = 500;
        } else {
            circles.forEach(circle => {
                if (circle.s1 > maxX) maxX = circle.s1;
                if (circle.radius > maxY) maxY = circle.radius;
            });
            maxX *= 1.2;
            maxY = maxX / 2;
        }

        const padding = 60;
        const graphW = w - 2 * padding;
        const graphH = h - 2 * padding;

        const scale = Math.min(graphW / maxX, graphH / (maxX * 0.6));

        const zeroX = padding;
        const zeroY = h - padding;

        const toScreenX = (val) => zeroX + val * scale;
        const toScreenY = (val) => zeroY - val * scale;

        // Draw Axes
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(zeroX, zeroY);
        ctx.lineTo(w - padding / 2, zeroY);
        ctx.moveTo(zeroX, zeroY);
        ctx.lineTo(zeroX, padding / 2);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px Inter';
        ctx.textAlign = 'right';
        ctx.fillText(t.axis_x, w - padding, zeroY + 30);
        ctx.save();
        ctx.translate(zeroX - 40, padding + 100);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(t.axis_y, 0, 0);
        ctx.restore();

        // Draw Circles
        const colors = this.getColors();

        circles.forEach((circle, index) => {
            if (this.filter !== 'all' && this.filter !== index.toString()) return;

            const centerX = toScreenX(circle.center);
            const centerY = toScreenY(0);
            const radiusPx = circle.radius * scale;
            const color = colors[index % colors.length];

            ctx.beginPath();
            ctx.arc(centerX, centerY, radiusPx, Math.PI, 0);

            ctx.fillStyle = color + '1A';
            ctx.fill();

            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw Failure Envelope
        if (params && params.valid) {
            const { c, phi } = params;
            const tanPhi = Math.tan(phi * Math.PI / 180);

            const startX = 0;
            const startY = c;
            const endX = maxX;
            const endY = c + endX * tanPhi;

            ctx.beginPath();
            ctx.moveTo(toScreenX(startX), toScreenY(startY));
            ctx.lineTo(toScreenX(endX), toScreenY(endY));
            ctx.strokeStyle = '#f97316';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Draw formula text
            ctx.font = 'bold 14px Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';

            const text = `τ = ${c.toFixed(1)} + σ tan(${phi.toFixed(1)}°)`;

            const labelSigma = maxX * 0.6;
            const labelTau = c + labelSigma * tanPhi;

            const screenX = toScreenX(labelSigma);
            const screenY = toScreenY(labelTau);

            ctx.save();
            ctx.translate(screenX, screenY);
            ctx.rotate(-phi * Math.PI / 180);

            const metrics = ctx.measureText(text);
            const padding = 4;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
            ctx.fillRect(-metrics.width / 2 - padding, -14 - padding - 5, metrics.width + 2 * padding, 20 + 2 * padding);

            ctx.fillStyle = '#f97316';
            ctx.fillText(text, 0, -5);

            ctx.restore();
        }
    }

    update() {
        this.renderLegend();
        const circles = this.getData();
        const params = this.calculateParameters(circles);

        this.draw(circles, params);

        if (params && params.valid) {
            document.getElementById('res_c').textContent = params.c.toFixed(2);
            document.getElementById('res_phi').textContent = params.phi.toFixed(2);
        } else {
            document.getElementById('res_c').textContent = "--";
            document.getElementById('res_phi').textContent = "--";
        }
    }
}

// Init
window.addEventListener('DOMContentLoaded', () => {
    new MohrApp();
});
