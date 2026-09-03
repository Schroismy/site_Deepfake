/* ═════════════════════════════════════════════════════════════════════════════
   FAKENEWS - JAVASCRIPT UPLOAD E ANÁLISE
   ═════════════════════════════════════════════════════════════════════════════ */

let selectedFile = null;

const uploadBox = document.querySelector('.upload_box');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DRAG & DROP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if (uploadBox) {
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.style.background = 'rgba(0, 102, 255, 0.15)';
    });

    uploadBox.addEventListener('dragleave', () => {
        uploadBox.style.background = 'rgba(0, 102, 255, 0.05)';
    });

    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.style.background = 'rgba(0, 102, 255, 0.05)';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            document.getElementById('fileInput').files = files;
            handleFileSelect({ target: { files: files } });
        }
    });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SELECIONAR ARQUIVO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function handleFileSelect(event) {
    const file = event.target.files[0];
    
    if (file && file.type.startsWith('image/')) {
        selectedFile = file;
        
        // Preview da imagem
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('previewImage');
            preview.src = e.target.result;
            preview.style.display = 'block';
            
            document.getElementById('analyzeBtn').disabled = false;
        };
        reader.readAsDataURL(file);
    } else {
        alert('Por favor, selecione um arquivo de imagem válido.');
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ANALISAR IMAGEM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function analyzeImage() {
    if (!selectedFile) {
        alert('Por favor, selecione uma imagem primeiro.');
        return;
    }

    // Mostrar seção de resultados
    document.getElementById('resultados').classList.add('active');
    document.querySelector('.results_section').scrollIntoView({ behavior: 'smooth' });

    // Simular análise
    const analyzeBtn = document.getElementById('analyzeBtn');
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<span class="loading"></span> Analisando...';

    // Simular delay da análise (2.5 segundos)
    setTimeout(() => {
        // Gerar resultado aleatório para demonstração
        const isFake = Math.random() > 0.5;
        const confidence = Math.floor(Math.random() * 30) + 70; // 70-100%

        displayResult(isFake, confidence);

        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '🔍 Analisar Imagem';
    }, 2500);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOSTRAR RESULTADO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function displayResult(isFake, confidence) {
    const badge = document.getElementById('resultBadge');
    const confidenceDisplay = document.getElementById('resultConfidence');
    const message = document.getElementById('resultMessage');
    const classification = document.getElementById('detailClassification');
    const confidenceDetail = document.getElementById('detailConfidence');
    const artefacts = document.getElementById('detailArtefacts');
    const processing = document.getElementById('detailProcessing');
    const confidenceFill = document.getElementById('confidenceFill');

    if (isFake) {
        badge.className = 'result_badge badge_fake';
        badge.textContent = '⚠️ PROVÁVEL DEEPFAKE';
        message.textContent = 'Esta imagem apresenta características consistentes com um deepfake sintetizado por IA.';
        classification.textContent = 'Deepfake Detectado';
        artefacts.textContent = 'Múltiplos artefatos encontrados';
    } else {
        badge.className = 'result_badge badge_real';
        badge.textContent = '✅ PROVAVELMENTE REAL';
        message.textContent = 'Esta imagem passou na verificação de autenticidade com alta confiança.';
        classification.textContent = 'Imagem Autêntica';
        artefacts.textContent = 'Nenhum artefato suspeito detectado';
    }

    confidenceDisplay.textContent = confidence + '%';
    confidenceDetail.textContent = confidence + '%';
    processing.textContent = '245ms';
    confidenceFill.style.width = confidence + '%';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RESETAR ANÁLISE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function resetAnalysis() {
    selectedFile = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('previewImage').style.display = 'none';
    document.getElementById('analyzeBtn').disabled = true;
    document.getElementById('resultados').classList.remove('active');
    document.querySelector('.upload_section').scrollIntoView({ behavior: 'smooth' });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PARALLAX EFFECT (Opcional)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

window.addEventListener('scroll', () => {
    const hero = document.querySelector('.container_hero');
    if (hero) {
        const scrollPosition = window.pageYOffset;
        hero.style.transform = `translateY(${scrollPosition * 0.5}px)`;
    }
});