/**
 * Google Apps Script - MULTIQUIZZ API (Quiz, Modo Estudo e Módulo Atividades)
 * 
 * ============================================================================
 * INSTRUÇÕES PARA ATUALIZAR / IMPLANTAR NO GOOGLE SHEETS:
 * ============================================================================
 * 
 * 1. Abra sua planilha no Google Sheets.
 * 2. Acesse o menu: Extensões > Apps Script.
 * 3. Cole este código substituindo todo o conteúdo anterior do arquivo Code.gs.
 * 4. Salve o arquivo (ícone de disquete ou Ctrl+S).
 * 
 * 5. ATENÇÃO - ATUALIZAÇÃO DA IMPLANTAÇÃO (MUITO IMPORTANTE):
 *    No Google Apps Script, salvar o código NÃO atualiza a versão ativa automaticamente.
 *    Para ativar o código novo:
 *    - Clique no botão azul "Implantar" (canto superior direito).
 *    - Selecione "Gerenciar implantações".
 *    - Clique no ícone de lápis (Editar) na implantação existente.
 *    - No campo "Versão", mude para: "Nova versão".
 *    - Clique no botão azul "Implantar".
 *    (Ou, se preferir, crie uma "Nova implantação" como "App da Web",
 *     com "Quem pode acessar: Qualquer pessoa", e copie a nova URL para APPS_SCRIPT_URL).
 * 
 * 6. SOBRE IMAGENS DO GOOGLE DRIVE:
 *    - Para exibir imagens guardadas no Google Drive, o arquivo da imagem DEVE
 *      estar com o compartilhamento configurado para:
 *      "Qualquer pessoa com o link" pode ser "Leitor".
 *    - O sistema aceita qualquer formato de link do Google Drive (o link normal
 *      de compartilhamento https://drive.google.com/file/d/.../view?usp=sharing
 *      é automaticamente processado e exibido).
 */

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Helper: busca aba de forma flexível (sem diferenciar maiúsculas/minúsculas e acentos)
    function getSheetFlexible(candidateNames) {
      const allSheets = ss.getSheets();
      for (let i = 0; i < allSheets.length; i++) {
        const sheetName = allSheets[i].getName().trim().toUpperCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        for (let j = 0; j < candidateNames.length; j++) {
          const target = candidateNames[j].toUpperCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          if (sheetName === target || sheetName.replace(/[^A-Z0-9]/g, '') === target.replace(/[^A-Z0-9]/g, '')) {
            return allSheets[i];
          }
        }
      }
      return null;
    }

    // Helper: busca índice de coluna por múltiplos nomes possíveis (ignora maiúsculas, espaços e acentos)
    function findColIdx(headers, candidateNames) {
      for (let i = 0; i < headers.length; i++) {
        const h = String(headers[i] || '').trim().toUpperCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        for (let j = 0; j < candidateNames.length; j++) {
          const c = candidateNames[j].toUpperCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          if (h === c || h.replace(/[^A-Z0-9]/g, '') === c.replace(/[^A-Z0-9]/g, '')) {
            return i;
          }
        }
      }
      return -1;
    }

    // Helper: limpa URLs e textos
    function cleanStr(val) {
      if (val === null || val === undefined) return '';
      return String(val).trim().replace(/^["']|["']$/g, '');
    }

    // 1. Ler aba CATEGORIA
    const catSheet = getSheetFlexible(["CATEGORIA", "CATEGORIAS"]);
    const categorias = [];
    if (catSheet) {
      const catData = catSheet.getDataRange().getValues();
      if (catData.length > 1) {
        const catHeaders = catData[0];
        const idIdx = findColIdx(catHeaders, ["ID", "CODIGO", "ID_CATEGORIA"]);
        const nomeIdx = findColIdx(catHeaders, ["CATEGORIA", "NOME", "PROCEDIMENTO"]);
        const ativaIdx = findColIdx(catHeaders, ["ATIVA", "ATIVO", "STATUS"]);

        for (let i = 1; i < catData.length; i++) {
          const row = catData[i];
          const nome = nomeIdx !== -1 ? cleanStr(row[nomeIdx]) : '';
          const ativa = ativaIdx !== -1 ? cleanStr(row[ativaIdx]).toUpperCase() : 'SIM';
          const id = idIdx !== -1 && row[idIdx] ? cleanStr(row[idIdx]) : String(i);

          if (nome) {
            categorias.push({
              id: id,
              categoria: nome,
              ativa: ativa || 'SIM'
            });
          }
        }
      }
    }

    // 2. Ler aba QUESTOES
    const qSheet = getSheetFlexible(["QUESTOES", "QUESTÕES", "PERGUNTAS"]);
    const questoes = [];
    if (qSheet) {
      const qData = qSheet.getDataRange().getValues();
      if (qData.length > 1) {
        const qHeaders = qData[0];
        const idIdx = findColIdx(qHeaders, ["ID", "CODIGO"]);
        const catIdx = findColIdx(qHeaders, ["CATEGORIA", "CATEGORIA_QUESTAO"]);
        const ordemIdx = findColIdx(qHeaders, ["ORDEM", "NUMERO"]);
        const pergIdx = findColIdx(qHeaders, ["PERGUNTA", "ENUNCIADO"]);
        const aIdx = findColIdx(qHeaders, ["A", "ALT_A", "ALTERNATIVA_A"]);
        const bIdx = findColIdx(qHeaders, ["B", "ALT_B", "ALTERNATIVA_B"]);
        const cIdx = findColIdx(qHeaders, ["C", "ALT_C", "ALTERNATIVA_C"]);
        const dIdx = findColIdx(qHeaders, ["D", "ALT_D", "ALTERNATIVA_D"]);
        const corrIdx = findColIdx(qHeaders, ["CORRETA", "GABARITO", "RESPOSTA"]);
        const justIdx = findColIdx(qHeaders, ["JUSTIFICATIVA", "EXPLICACAO"]);
        const imgIdx = findColIdx(qHeaders, ["IMAGEM", "IMAGENS", "FOTO", "URL", "IMG"]);
        const ativaIdx = findColIdx(qHeaders, ["ATIVA", "ATIVO", "STATUS"]);

        for (let i = 1; i < qData.length; i++) {
          const row = qData[i];
          const pergunta = pergIdx !== -1 ? cleanStr(row[pergIdx]) : '';
          if (!pergunta) continue;

          questoes.push({
            id: idIdx !== -1 && row[idIdx] ? cleanStr(row[idIdx]) : String(i),
            categoria: catIdx !== -1 ? cleanStr(row[catIdx]) : '',
            ordem: ordemIdx !== -1 && !isNaN(Number(row[ordemIdx])) ? Number(row[ordemIdx]) : i,
            pergunta: pergunta,
            a: aIdx !== -1 ? cleanStr(row[aIdx]) : '',
            b: bIdx !== -1 ? cleanStr(row[bIdx]) : '',
            c: cIdx !== -1 ? cleanStr(row[cIdx]) : '',
            d: dIdx !== -1 ? cleanStr(row[dIdx]) : '',
            correta: corrIdx !== -1 ? cleanStr(row[corrIdx]).toUpperCase() : 'A',
            justificativa: justIdx !== -1 ? cleanStr(row[justIdx]) : '',
            imagem: imgIdx !== -1 ? cleanStr(row[imgIdx]) : '',
            ativa: ativaIdx !== -1 ? cleanStr(row[ativaIdx]).toUpperCase() : 'SIM'
          });
        }
      }
    }

    // 3. Ler aba ATIVIDADES
    const ativSheet = getSheetFlexible(["ATIVIDADES", "ATIVIDADE"]);
    const atividades = [];
    if (ativSheet) {
      const ativData = ativSheet.getDataRange().getValues();
      if (ativData.length > 1) {
        const ativHeaders = ativData[0];
        const idIdx = findColIdx(ativHeaders, ["ID_ATIVIDADE", "ID ATIVIDADE", "ID", "CODIGO"]);
        const catIdx = findColIdx(ativHeaders, ["CATEGORIA", "CATEGORIA_ATIVIDADE"]);
        const tipoIdx = findColIdx(ativHeaders, ["TIPO", "MODALIDADE"]);
        const titIdx = findColIdx(ativHeaders, ["TITULO", "TÍTULO", "NOME"]);
        const instIdx = findColIdx(ativHeaders, ["INSTRUCAO", "INSTRUÇÃO", "ORIENTACAO", "ORIENTAÇÃO", "DESCRICAO"]);
        const imgIdx = findColIdx(ativHeaders, ["IMAGEM", "IMAGENS", "FOTO", "URL", "IMG", "LINK_IMAGEM"]);
        const ativaIdx = findColIdx(ativHeaders, ["ATIVA", "ATIVO", "STATUS"]);

        for (let i = 1; i < ativData.length; i++) {
          const row = ativData[i];
          const id = idIdx !== -1 ? cleanStr(row[idIdx]) : '';
          if (!id) continue;

          atividades.push({
            id: id,
            categoria: catIdx !== -1 ? cleanStr(row[catIdx]) : '',
            tipo: tipoIdx !== -1 ? cleanStr(row[tipoIdx]).toUpperCase() : 'ASSOCIAR',
            titulo: titIdx !== -1 ? cleanStr(row[titIdx]) : '',
            instrucao: instIdx !== -1 ? cleanStr(row[instIdx]) : '',
            imagem: imgIdx !== -1 ? cleanStr(row[imgIdx]) : '',
            ativa: ativaIdx !== -1 ? cleanStr(row[ativaIdx]).toUpperCase() : 'SIM'
          });
        }
      }
    }

    // 4. Ler aba ITENS_ATIVIDADE
    const itensSheet = getSheetFlexible(["ITENS_ATIVIDADE", "ITENS ATIVIDADE", "ITENS_ATIVIDADES", "ITENS"]);
    const itensAtividade = [];
    if (itensSheet) {
      const itensData = itensSheet.getDataRange().getValues();
      if (itensData.length > 1) {
        const itensHeaders = itensData[0];
        const idIdx = findColIdx(itensHeaders, ["ID_ITEM", "ID ITEM", "ID", "CODIGO"]);
        const ativIdIdx = findColIdx(itensHeaders, ["ID_ATIVIDADE", "ID ATIVIDADE", "ATIVIDADE"]);
        const ordemIdx = findColIdx(itensHeaders, ["ORDEM_CORRETA", "ORDEM CORRETA", "ORDEM"]);
        const txtIdx = findColIdx(itensHeaders, ["TEXTO", "ITEM", "DESCRICAO", "CONTEUDO"]);
        const imgIdx = findColIdx(itensHeaders, ["IMAGEM", "IMAGENS", "FOTO", "URL", "IMG"]);
        const ativaIdx = findColIdx(itensHeaders, ["ATIVA", "ATIVO", "STATUS"]);

        for (let i = 1; i < itensData.length; i++) {
          const row = itensData[i];
          const id = idIdx !== -1 ? cleanStr(row[idIdx]) : '';
          if (!id) continue;

          itensAtividade.push({
            id: id,
            atividadeId: ativIdIdx !== -1 ? cleanStr(row[ativIdIdx]) : '',
            ordemCorreta: ordemIdx !== -1 && !isNaN(Number(row[ordemIdx])) ? Number(row[ordemIdx]) : i,
            texto: txtIdx !== -1 ? cleanStr(row[txtIdx]) : '',
            imagem: imgIdx !== -1 ? cleanStr(row[imgIdx]) : '',
            ativa: ativaIdx !== -1 ? cleanStr(row[ativaIdx]).toUpperCase() : 'SIM'
          });
        }
      }
    }

    // 5. Ler aba ALVOS_ATIVIDADE
    const alvosSheet = getSheetFlexible(["ALVOS_ATIVIDADE", "ALVOS ATIVIDADE", "ALVOS_ATIVIDADES", "ALVOS"]);
    const alvosAtividade = [];
    if (alvosSheet) {
      const alvosData = alvosSheet.getDataRange().getValues();
      if (alvosData.length > 1) {
        const alvosHeaders = alvosData[0];
        const idIdx = findColIdx(alvosHeaders, ["ID_ALVO", "ID ALVO", "ID", "CODIGO"]);
        const ativIdIdx = findColIdx(alvosHeaders, ["ID_ATIVIDADE", "ID ATIVIDADE", "ATIVIDADE"]);
        const ordemIdx = findColIdx(alvosHeaders, ["ORDEM", "NUMERO"]);
        const titIdx = findColIdx(alvosHeaders, ["TITULO_ALVO", "TITULO ALVO", "TITULO", "TÍTULO", "ALVO", "NOME"]);
        const descIdx = findColIdx(alvosHeaders, ["DESCRICAO", "DESCRIÇÃO", "DETALHES"]);
        const imgIdx = findColIdx(alvosHeaders, ["IMAGEM", "IMAGENS", "FOTO", "URL", "IMG"]);
        const corrItemIdx = findColIdx(alvosHeaders, ["ID_ITEM_CORRETO", "ID ITEM CORRETO", "ITEM_CORRETO", "CORRETO", "RESPOSTA"]);

        for (let i = 1; i < alvosData.length; i++) {
          const row = alvosData[i];
          const id = idIdx !== -1 ? cleanStr(row[idIdx]) : '';
          if (!id) continue;

          alvosAtividade.push({
            id: id,
            atividadeId: ativIdIdx !== -1 ? cleanStr(row[ativIdIdx]) : '',
            ordem: ordemIdx !== -1 && !isNaN(Number(row[ordemIdx])) ? Number(row[ordemIdx]) : i,
            tituloAlvo: titIdx !== -1 ? cleanStr(row[titIdx]) : '',
            descricao: descIdx !== -1 ? cleanStr(row[descIdx]) : '',
            imagem: imgIdx !== -1 ? cleanStr(row[imgIdx]) : '',
            idItemCorreto: corrItemIdx !== -1 ? cleanStr(row[corrItemIdx]) : ''
          });
        }
      }
    }

    const output = JSON.stringify({
      success: true,
      updatedAt: new Date().toISOString(),
      categorias: categorias,
      questoes: questoes,
      atividades: atividades,
      itensAtividade: itensAtividade,
      alvosAtividade: alvosAtividade
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
