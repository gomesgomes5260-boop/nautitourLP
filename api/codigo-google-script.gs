// ============================================================
//  ESCUNA BÚZIOS — Google Apps Script
//  Cole este código em: script.google.com → Novo projeto
//  Depois clique em Implantar → Nova implantação → Web App
// ============================================================

const SHEET_NAME = 'Cadastros';
const SHEET_ID   = '1ceXTUhX8A1GOrB5JTu6b0H25sU_LUNnDTdsgTUAgzNE';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss    = SpreadsheetApp.openById(SHEET_ID);
    let sheet   = ss.getSheetByName(SHEET_NAME);

    // Cria a aba e o cabeçalho se não existir
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        'Data/Hora', 'Nome', 'WhatsApp', 'País', 'Estado',
        'Já fez o passeio?', 'Opt-in Marketing', 'Login Social', 'Email Social'
      ]);
      sheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#1B7A6A').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      data.data_hora        || '',
      data.nome             || '',
      data.whatsapp         || '',
      data.pais             || '',
      data.estado           || '',
      data.ja_fez_passeio   || '',
      data.optin_marketing  || '',
      data.login_social     || '',
      data.email_social     || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Teste manual: rode esta função para verificar se a planilha está acessível
function testar() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  Logger.log('Planilha encontrada: ' + ss.getName());
}
