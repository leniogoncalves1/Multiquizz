/**
 * Google Apps Script - MULTIQUIZZ API
 * 
 * INSTRUÇÕES PARA INSTALAÇÃO:
 * 1. Abra sua planilha no Google Sheets.
 * 2. Clique no menu: Extensões > Apps Script.
 * 3. Substitua todo o código do editor por este script.
 * 4. Clique em "Implantar" (Deploy) > "Nova implantação" (New deployment).
 * 5. Selecione o tipo: "App da Web" (Web app).
 * 6. Na configuração:
 *    - Executar como: "Eu" (Me)
 *    - Quem pode acessar: "Qualquer pessoa" (Anyone)
 * 7. Clique em "Implantar" e copie a URL do Web App gerada.
 * 8. Defina essa URL na variável de ambiente APPS_SCRIPT_URL (ou no .env / Vercel).
 */

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Ler aba CATEGORIA
    const catSheet = ss.getSheetByName("CATEGORIA");
    const categorias = [];
    if (catSheet) {
      const catData = catSheet.getDataRange().getValues();
      const catHeaders = catData[0].map(h => String(h).trim().toUpperCase());
      const idIdx = catHeaders.indexOf("ID");
      const nomeIdx = catHeaders.indexOf("CATEGORIA");
      const ativaIdx = catHeaders.indexOf("ATIVA");

      for (let i = 1; i < catData.length; i++) {
        const row = catData[i];
        const nome = row[nomeIdx] ? String(row[nomeIdx]).trim() : "";
        const ativa = row[ativaIdx] ? String(row[ativaIdx]).trim().toUpperCase() : "NÃO";
        const id = row[idIdx] ? String(row[idIdx]).trim() : String(i);

        if (nome) {
          categorias.push({
            id: id,
            categoria: nome,
            ativa: ativa
          });
        }
      }
    }

    // 2. Ler aba QUESTOES
    const qSheet = ss.getSheetByName("QUESTOES");
    const questoes = [];
    if (qSheet) {
      const qData = qSheet.getDataRange().getValues();
      const qHeaders = qData[0].map(h => String(h).trim().toUpperCase());

      const idIdx = qHeaders.indexOf("ID");
      const catIdx = qHeaders.indexOf("CATEGORIA");
      const ordemIdx = qHeaders.indexOf("ORDEM");
      const pergIdx = qHeaders.indexOf("PERGUNTA");
      const aIdx = qHeaders.indexOf("A");
      const bIdx = qHeaders.indexOf("B");
      const cIdx = qHeaders.indexOf("C");
      const dIdx = qHeaders.indexOf("D");
      const corrIdx = qHeaders.indexOf("CORRETA");
      const justIdx = qHeaders.indexOf("JUSTIFICATIVA");
      const imgIdx = qHeaders.indexOf("IMAGEM");
      const ativaIdx = qHeaders.indexOf("ATIVA");

      for (let i = 1; i < qData.length; i++) {
        const row = qData[i];
        const pergunta = row[pergIdx] ? String(row[pergIdx]).trim() : "";
        if (!pergunta) continue;

        questoes.push({
          id: row[idIdx] ? String(row[idIdx]).trim() : String(i),
          categoria: row[catIdx] ? String(row[catIdx]).trim() : "",
          ordem: Number(row[ordemIdx]) || i,
          pergunta: pergunta,
          a: row[aIdx] ? String(row[aIdx]).trim() : "",
          b: row[bIdx] ? String(row[bIdx]).trim() : "",
          c: row[cIdx] ? String(row[cIdx]).trim() : "",
          d: row[dIdx] ? String(row[dIdx]).trim() : "",
          correta: row[corrIdx] ? String(row[corrIdx]).trim().toUpperCase() : "A",
          justificativa: row[justIdx] ? String(row[justIdx]).trim() : "",
          imagem: row[imgIdx] ? String(row[imgIdx]).trim() : "",
          ativa: row[ativaIdx] ? String(row[ativaIdx]).trim().toUpperCase() : "NÃO"
        });
      }
    }

    const output = JSON.stringify({
      success: true,
      updatedAt: new Date().toISOString(),
      categorias: categorias,
      questoes: questoes
    });

    return ContentService
      .createTextOutput(output)
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    const errorOutput = JSON.stringify({
      success: false,
      error: err.toString()
    });
    return ContentService
      .createTextOutput(errorOutput)
      .setMimeType(ContentService.MimeType.JSON);
  }
}
