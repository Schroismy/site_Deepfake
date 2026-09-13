// Função para enviar arquivo e analisar
async function analisarArquivo() {
    const fileInput = document.getElementById('fileInput');
    const mediaType = document.getElementById('mediaType');
    
    if (!fileInput.files[0]) {
        alert('Selecione um arquivo');
        return;
    }
    
    if (!mediaType.value) {
        alert('Selecione o tipo de mídia');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('type', mediaType.value);
    
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            exibirResultado(data);
        } else {
            alert('Erro: ' + data.erro);
        }
    } catch (error) {
        alert('Erro ao enviar: ' + error);
    }
}

function exibirResultado(data) {
    const resultDiv = document.getElementById('resultado');
    if (!resultDiv) return;
    
    const html = `
        <div class="resultado-card">
            <h3>Resultado da Análise</h3>
            <p><strong>Arquivo:</strong> ${data.filename}</p>
            <p><strong>Veredito:</strong> <strong style="color: ${data.detection.verdict === 'authentic' ? 'green' : 'red'}">${data.detection.verdict.toUpperCase()}</strong></p>
            <p><strong>Confiança:</strong> ${(data.detection.confidence * 100).toFixed(2)}%</p>
            <p><strong>Explicação:</strong> ${data.detection.explanation}</p>
            <p><small>Armazenado em: MongoDB (ID: ${data.file_id.substring(0, 8)}...)</small></p>
        </div>
    `;
    
    resultDiv.innerHTML = html;
    resultDiv.style.display = 'block';
}

// Carregar histórico
async function carregarHistorico() {
    try {
        const response = await fetch('/api/history');
        const history = await response.json();
        
        const historyDiv = document.getElementById('historico');
        if (!historyDiv) return;
        
        let html = '<h3>Histórico de Análises</h3>';
        
        if (history.length === 0) {
            html += '<p>Nenhuma análise realizada</p>';
        } else {
            html += '<ul>';
            history.forEach(item => {
                html += `
                    <li>
                        <strong>${item.filename}</strong> - 
                        <span style="color: ${item.detection.verdict === 'authentic' ? 'green' : 'red'}">
                            ${item.detection.verdict}
                        </span>
                        (${(item.detection.confidence * 100).toFixed(2)}%)
                    </li>
                `;
            });
            html += '</ul>';
        }
        
        historyDiv.innerHTML = html;
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
    }
}

// Carregar histórico ao abrir página
document.addEventListener('DOMContentLoaded', carregarHistorico);