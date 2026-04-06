// ============================================================
//  ESCUNA BÚZIOS — Script do Painel Google Sheets
//
//  Como usar:
//  1. Abra o Google Apps Script da sua planilha
//     (Extensões → Apps Script)
//  2. Cole este código em um novo arquivo .gs
//  3. Execute criarPainel() manualmente pela primeira vez
//  4. Para atualizar automaticamente a cada novo cadastro,
//     vá em Acionadores → Adicionar acionador:
//       Função: criarPainel
//       Evento: Da planilha → Ao editar
// ============================================================

const DADOS_ABA   = 'Cadastros';
const PAINEL_ABA  = 'Painel';

// Colunas na aba Cadastros (índice base 0)
const COL_DATA    = 0;
const COL_NOME    = 1;
const COL_WPP     = 2;
const COL_PAIS    = 3;
const COL_ESTADO  = 4;
const COL_PASSEIO = 5;
const COL_OPTIN   = 6;
const COL_CANAL   = 7;

function criarPainel() {
  const ss      = SpreadsheetApp.getActiveSpreadsheet();
  const dadosAba = ss.getSheetByName(DADOS_ABA);

  if (!dadosAba) {
    SpreadsheetApp.getUi().alert('Aba "' + DADOS_ABA + '" não encontrada.');
    return;
  }

  // Pega os dados (ignora cabeçalho)
  const allValues = dadosAba.getDataRange().getValues();
  const rows = allValues.slice(1).filter(r => r[COL_DATA] !== '');

  if (rows.length === 0) {
    SpreadsheetApp.getUi().alert('Nenhum dado encontrado na aba Cadastros.');
    return;
  }

  // Cria ou limpa a aba Painel
  let painel = ss.getSheetByName(PAINEL_ABA);
  if (!painel) {
    painel = ss.insertSheet(PAINEL_ABA);
  } else {
    painel.clearContents();
    painel.clearFormats();
    // Remove gráficos existentes
    painel.getCharts().forEach(c => painel.removeChart(c));
  }

  // ── Cabeçalho do painel ──────────────────────────────────
  const titulo = painel.getRange('B2');
  titulo.setValue('⛵ Escuna Búzios — Painel de Cadastros');
  titulo.setFontSize(16).setFontWeight('bold').setFontColor('#004F6B');
  painel.getRange('B3').setValue('Atualizado em: ' + new Date().toLocaleString('pt-BR'))
    .setFontColor('#5a7a85').setFontSize(11);

  // ── Métricas ─────────────────────────────────────────────
  const agora      = new Date();
  const mesAtual   = agora.getMonth();
  const anoAtual   = agora.getFullYear();

  const total      = rows.length;
  const novosMes   = rows.filter(r => {
    const d = parseDataBR(r[COL_DATA]);
    return d && d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
  }).length;
  const recorrentes = rows.filter(r => String(r[COL_PASSEIO]).toLowerCase().includes('sim')).length;
  const optins      = rows.filter(r => String(r[COL_OPTIN]).toLowerCase().includes('sim')).length;
  const pctRecorrentes = total > 0 ? Math.round(recorrentes/total*100) : 0;
  const pctOptins      = total > 0 ? Math.round(optins/total*100) : 0;

  const metricas = [
    ['Total de cadastros', total, ''],
    ['Novos este mês',     novosMes, '(' + ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][mesAtual] + ')'],
    ['Clientes recorrentes', recorrentes, pctRecorrentes + '% do total'],
    ['Opt-in marketing',  optins, pctOptins + '% do total'],
  ];

  const metricasStartRow = 5;
  const metricasCols = ['B','D','F','H'];
  metricas.forEach(([label, valor, sub], i) => {
    const col = metricasCols[i];
    painel.getRange(col + metricasStartRow).setValue(label)
      .setFontSize(10).setFontColor('#5a7a85').setFontWeight('bold')
      .setBackground('#e6f4f8').setHorizontalAlignment('center');
    painel.getRange(col + (metricasStartRow+1)).setValue(valor)
      .setFontSize(22).setFontWeight('bold').setFontColor('#004F6B')
      .setBackground('#e6f4f8').setHorizontalAlignment('center');
    painel.getRange(col + (metricasStartRow+2)).setValue(sub)
      .setFontSize(9).setFontColor('#5a7a85')
      .setBackground('#e6f4f8').setHorizontalAlignment('center');
    // Bordas do card
    painel.getRange(col + metricasStartRow + ':' + col + (metricasStartRow+2))
      .setBorder(true, true, true, true, false, false, '#d8eaef', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    // Largura das colunas
    painel.setColumnWidth(columnLetterToIndex(col), 120);
  });

  // ── Tabela: cadastros por mês ────────────────────────────
  const mesesMap = {};
  rows.forEach(r => {
    const d = parseDataBR(r[COL_DATA]);
    if (!d) return;
    const key = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][d.getMonth()] + '/' + String(d.getFullYear()).slice(2);
    mesesMap[key] = (mesesMap[key] || 0) + 1;
  });
  const mesesKeys = Object.keys(mesesMap).slice(-12);

  const mesesStartRow = metricasStartRow + 5;
  painel.getRange('B' + mesesStartRow).setValue('Cadastros por Mês')
    .setFontSize(12).setFontWeight('bold').setFontColor('#004F6B');

  const mesesHeaderRow = mesesStartRow + 1;
  painel.getRange('B' + mesesHeaderRow).setValue('Mês').setFontWeight('bold').setBackground('#004F6B').setFontColor('#fff');
  painel.getRange('C' + mesesHeaderRow).setValue('Cadastros').setFontWeight('bold').setBackground('#004F6B').setFontColor('#fff');

  mesesKeys.forEach((key, i) => {
    const row = mesesHeaderRow + 1 + i;
    painel.getRange('B' + row).setValue(key);
    painel.getRange('C' + row).setValue(mesesMap[key]);
  });

  // Gráfico: cadastros por mês
  const mesesDataRange = painel.getRange('B' + mesesHeaderRow + ':C' + (mesesHeaderRow + mesesKeys.length));
  const chartMensal = painel.newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(mesesDataRange)
    .setPosition(mesesStartRow, 5, 0, 0)
    .setOption('title', 'Cadastros por Mês')
    .setOption('colors', ['#006B8F'])
    .setOption('legend', { position: 'none' })
    .setOption('width', 420).setOption('height', 260)
    .build();
  painel.insertChart(chartMensal);

  // ── Tabela: top países ───────────────────────────────────
  const paisesMap = {};
  rows.forEach(r => { const v = String(r[COL_PAIS]).trim(); if (v) paisesMap[v] = (paisesMap[v] || 0) + 1; });
  const paisesEntries = Object.entries(paisesMap).sort((a,b) => b[1]-a[1]).slice(0, 10);

  const paisesStartRow = mesesHeaderRow + mesesKeys.length + 3;
  painel.getRange('B' + paisesStartRow).setValue('Origem — País')
    .setFontSize(12).setFontWeight('bold').setFontColor('#004F6B');

  const paisesHeaderRow = paisesStartRow + 1;
  painel.getRange('B' + paisesHeaderRow).setValue('País').setFontWeight('bold').setBackground('#004F6B').setFontColor('#fff');
  painel.getRange('C' + paisesHeaderRow).setValue('Cadastros').setFontWeight('bold').setBackground('#004F6B').setFontColor('#fff');

  paisesEntries.forEach(([pais, count], i) => {
    const row = paisesHeaderRow + 1 + i;
    painel.getRange('B' + row).setValue(pais);
    painel.getRange('C' + row).setValue(count);
  });

  // Gráfico: países (pizza)
  const paisesDataRange = painel.getRange('B' + paisesHeaderRow + ':C' + (paisesHeaderRow + paisesEntries.length));
  const chartPaises = painel.newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(paisesDataRange)
    .setPosition(paisesStartRow, 5, 0, 0)
    .setOption('title', 'Origem por País')
    .setOption('width', 420).setOption('height', 260)
    .build();
  painel.insertChart(chartPaises);

  // ── Tabela: top estados ──────────────────────────────────
  const estadosMap = {};
  rows.filter(r => r[COL_PAIS] === 'BR').forEach(r => {
    const v = String(r[COL_ESTADO]).trim();
    if (v) estadosMap[v] = (estadosMap[v] || 0) + 1;
  });
  const estadosEntries = Object.entries(estadosMap).sort((a,b) => b[1]-a[1]).slice(0, 10);

  const estadosStartRow = paisesHeaderRow + paisesEntries.length + 3;
  painel.getRange('B' + estadosStartRow).setValue('Origem — Estado (brasileiros)')
    .setFontSize(12).setFontWeight('bold').setFontColor('#004F6B');

  const estadosHeaderRow = estadosStartRow + 1;
  painel.getRange('B' + estadosHeaderRow).setValue('Estado').setFontWeight('bold').setBackground('#004F6B').setFontColor('#fff');
  painel.getRange('C' + estadosHeaderRow).setValue('Cadastros').setFontWeight('bold').setBackground('#004F6B').setFontColor('#fff');

  estadosEntries.forEach(([estado, count], i) => {
    const row = estadosHeaderRow + 1 + i;
    painel.getRange('B' + row).setValue(estado);
    painel.getRange('C' + row).setValue(count);
  });

  // Gráfico: estados (barras)
  if (estadosEntries.length > 0) {
    const estadosDataRange = painel.getRange('B' + estadosHeaderRow + ':C' + (estadosHeaderRow + estadosEntries.length));
    const chartEstados = painel.newChart()
      .setChartType(Charts.ChartType.BAR)
      .addRange(estadosDataRange)
      .setPosition(estadosStartRow, 5, 0, 0)
      .setOption('title', 'Top Estados (Brasil)')
      .setOption('colors', ['#006B8F'])
      .setOption('legend', { position: 'none' })
      .setOption('width', 420).setOption('height', 260)
      .build();
    painel.insertChart(chartEstados);
  }

  // ── Tabela: canal de cadastro ────────────────────────────
  const canalMap = { Manual: 0, Google: 0, Facebook: 0, Instagram: 0 };
  rows.forEach(r => {
    const c = String(r[COL_CANAL] || '').toLowerCase().trim();
    if      (c === 'google')    canalMap['Google']++;
    else if (c === 'facebook')  canalMap['Facebook']++;
    else if (c === 'instagram') canalMap['Instagram']++;
    else                        canalMap['Manual']++;
  });
  const canalEntries = Object.entries(canalMap).filter(([,v]) => v > 0);

  const canalStartRow = estadosHeaderRow + estadosEntries.length + 3;
  painel.getRange('B' + canalStartRow).setValue('Canal de Cadastro')
    .setFontSize(12).setFontWeight('bold').setFontColor('#004F6B');

  const canalHeaderRow = canalStartRow + 1;
  painel.getRange('B' + canalHeaderRow).setValue('Canal').setFontWeight('bold').setBackground('#004F6B').setFontColor('#fff');
  painel.getRange('C' + canalHeaderRow).setValue('Cadastros').setFontWeight('bold').setBackground('#004F6B').setFontColor('#fff');

  canalEntries.forEach(([canal, count], i) => {
    const row = canalHeaderRow + 1 + i;
    painel.getRange('B' + row).setValue(canal);
    painel.getRange('C' + row).setValue(count);
  });

  // Gráfico: canal (pizza)
  const canalDataRange = painel.getRange('B' + canalHeaderRow + ':C' + (canalHeaderRow + canalEntries.length));
  const chartCanal = painel.newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(canalDataRange)
    .setPosition(canalStartRow, 5, 0, 0)
    .setOption('title', 'Canal de Cadastro')
    .setOption('width', 420).setOption('height', 260)
    .build();
  painel.insertChart(chartCanal);

  // ── Formatação final ─────────────────────────────────────
  painel.setColumnWidth(1, 20);  // col A = margem
  painel.setColumnWidth(2, 140); // col B = label
  painel.setColumnWidth(3, 100); // col C = valor
  painel.setTabColor('#006B8F');

  // Ativa a aba do painel
  ss.setActiveSheet(painel);
  SpreadsheetApp.getUi().alert('✅ Painel atualizado com sucesso!');
}

/* ── Helpers ────────────────────────────────────────────── */

function parseDataBR(val) {
  if (!val) return null;
  const str = String(val);
  // Formato: dd/mm/yyyy hh:mm:ss
  const match = str.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (match) return new Date(match[3], match[2]-1, match[1]);
  // Fallback: tenta objeto Date direto (quando planilha passa Date)
  if (val instanceof Date) return val;
  return null;
}

function columnLetterToIndex(letter) {
  return letter.toUpperCase().charCodeAt(0) - 64;
}
