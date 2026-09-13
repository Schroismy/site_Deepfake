// Quando arquivo é selecionado
function handleFileSelect(event) {
    const file = event.target.files[0];
    
    if (!file) {
        alert('Nenhum arquivo selecionado');
        return;
    }
    
    // Validar tipo
    if (!file.type.startsWith('image/')) {
        alert('Selecione uma imagem válida!');
        return;
    }
    
    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert('Arquivo muito grande! Máximo 10MB');
        return;
    }
    
    // Mostrar preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewImg = document.getElementById('previewImage');
        previewImg.src = e.target.result;
        previewImg.style.display = 'block';
        
        // Habilitar botão analisar
        document.getElementById('analyzeBtn').disabled = false;
    };
    reader.readAsDataURL(file);
}

// Analisar imagem
async function analyzeImage() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Selecione uma imagem!');
        return;
    }
    
    // Desabilitar botão
    const analyzeBtn = document.getElementById('analyzeBtn');
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '⏳ Analisando...';
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'image');
    
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('Análise recebida:', data);
            exibirResultado(data);
        } else {
            alert('Erro: ' + (data.erro || 'Erro desconhecido'));
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = '🔍 Analisar Imagem';
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao analisar: ' + error.message);
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = '🔍 Analisar Imagem';
    }
}

// Exibir resultado
function exibirResultado(data) {
    // Mostrar seção de resultados
    document.getElementById('verificar').style.display = 'none';
    document.getElementById('resultados').classList.add('active');
    
    const detection = data.detection || {};
    const verdict = detection.verdict || 'erro';
    const confidence = detection.confidence || 0;
    
    // Atualizar badge
    const badge = document.getElementById('resultBadge');
    if (verdict === 'synthetic') {
        badge.textContent = '⚠️ DEEPFAKE DETECTADO';
        badge.className = 'result_badge badge_fake';
    } else if (verdict === 'authentic') {
        badge.textContent = '✅ IMAGEM AUTÊNTICA';
        badge.className = 'result_badge badge_real';
    } else {
        badge.textContent = '❓ RESULTADO INCONCLUSIVO';
        badge.className = 'result_badge';
    }
    
    // Atualizar confiança
    const confPercent = (confidence * 100).toFixed(2);
    document.getElementById('resultConfidence').textContent = confPercent + '%';
    document.getElementById('confidenceFill').style.width = confPercent + '%';
    
    // Atualizar mensagem
    document.getElementById('resultMessage').textContent = 
        detection.explanation || 'Análise concluída';
    
    // Atualizar detalhes
    document.getElementById('detailClassification').textContent = verdict.toUpperCase();
    document.getElementById('detailConfidence').textContent = confPercent + '%';
    document.getElementById('detailArtefacts').textContent = 
        detection.image_size || 'N/A';
    document.getElementById('detailProcessing').textContent = '< 2s';
    
    // Scroll para resultado
    setTimeout(() => {
        document.getElementById('resultados').scrollIntoView({ behavior: 'smooth' });
    }, 300);
}

// Resetar análise
function resetAnalysis() {
    document.getElementById('verificar').style.display = 'flex';
    document.getElementById('resultados').classList.remove('active');
    document.getElementById('fileInput').value = '';
    document.getElementById('previewImage').style.display = 'none';
    document.getElementById('previewImage').src = '';
    document.getElementById('analyzeBtn').disabled = true;
    document.getElementById('analyzeBtn').textContent = '🔍 Analisar Imagem';
}

// Drag and drop
document.addEventListener('DOMContentLoaded', function() {
    const uploadBox = document.getElementById('uploadBox');
    
    if (uploadBox) {
        uploadBox.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadBox.style.background = 'rgba(0, 102, 255, 0.15)';
        });
        
        uploadBox.addEventListener('dragleave', function() {
            uploadBox.style.background = 'rgba(0, 102, 255, 0.05)';
        });
        
        uploadBox.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadBox.style.background = 'rgba(0, 102, 255, 0.05)';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                document.getElementById('fileInput').files = files;
                handleFileSelect({ target: { files: files } });
            }
        });
    }
});