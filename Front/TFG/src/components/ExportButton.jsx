import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const ExportButton = ({ exportData, instance }) => {
  const [format, setFormat] = useState('xlsx');

  const {
    data,
    headers,
    survey_title,
    total_responses,
    export_date,
    statistics,
    metadata,
  } = exportData;

  const { total_questions, completed_participations, days_active } = instance;

  // Traducción de tipos de pregunta
  const typeLabels = {
    single: 'Opción única',
    multiple: 'Opción múltiple',
    text: 'Respuesta abierta',
    open: 'Respuesta abierta',
    textarea: 'Respuesta abierta',
  };

  // Traducción de estados de participación
  const stateLabels = {
    in_progress: 'En progreso',
    completed: 'Finalizada',
    abandoned: 'Abandonada',
  };

  // Traducción de estados en los datos antes de exportar
  const translateStatesInData = () =>
    data.map(row => ({
      ...row,
      estado: stateLabels[row.estado] || row.estado,
    }));

  const generateCSV = () => {
    const lines = [];

    lines.push(`Título de la encuesta:;${survey_title}`);
    lines.push(`Fecha de exportación:;${export_date}`);
    lines.push(`Total de preguntas:;${total_questions}`);
    lines.push(`Total de participaciones:;${total_responses}`);
    lines.push(`Participaciones finalizadas:;${completed_participations}`);
    lines.push(`Días activa:;${days_active}`);
    lines.push('');

    if (metadata) {
      lines.push('Fechas de la instancia:');
      lines.push(`Fecha de creación;${metadata.creation_date ?? ''}`);
      lines.push(`Fecha de cierre;${metadata.closure_date ?? ''}`);
      lines.push('');
    }

    if (statistics?.questions_by_type) {
      lines.push('Preguntas por tipo:');
      Object.entries(statistics.questions_by_type).forEach(([type, count]) => {
        lines.push(`${typeLabels[type] || type};${count}`);
      });
      lines.push('');
    }

    if (statistics?.completion_rate) {
      lines.push('Tasa de respuesta por pregunta (%):');
      Object.entries(statistics.completion_rate).forEach(([key, val]) => {
        lines.push(`${key};${val}`);
      });
    }

    lines.push('');
    lines.push(headers.join(';'));

    const translatedData = translateStatesInData();
    const csvRows = translatedData.map(row =>
      headers.map(header => `"${(row[header] || '').toString().replace(/"/g, '""')}"`).join(';')
    );

    return lines.concat(csvRows).join('\n');
  };

  const generateTXT = () => {
    const lines = [];

    lines.push(`Título de la encuesta:\t${survey_title}`);
    lines.push(`Fecha de exportación:\t${export_date}`);
    lines.push(`Total de preguntas:;${total_questions}`);
    lines.push(`Total de participaciones:\t${total_responses}`);
    lines.push(`Participaciones finalizadas:\t${completed_participations}`);
    lines.push(`Días activa:\t${days_active}`);
    lines.push('');

    if (metadata) {
      lines.push('Fechas de la instancia:');
      lines.push(`Fecha de creación\t${metadata.creation_date ?? ''}`);
      lines.push(`Fecha de cierre\t${metadata.closure_date ?? ''}`);
      lines.push('');
    }

    if (statistics?.questions_by_type) {
      lines.push('Preguntas por tipo:');
      Object.entries(statistics.questions_by_type).forEach(([type, count]) => {
        lines.push(`${typeLabels[type] || type}\t${count}`);
      });
      lines.push('');
    }

    if (statistics?.completion_rate) {
      lines.push('Tasa de respuesta por pregunta (%):');
      Object.entries(statistics.completion_rate).forEach(([key, val]) => {
        lines.push(`${key}\t${val}`);
      });
    }

    lines.push('');
    lines.push(headers.join('\t'));

    const translatedData = translateStatesInData();
    const txtRows = translatedData.map(row =>
      headers.map(header => (row[header] || '').toString()).join('\t')
    );

    return lines.concat(txtRows).join('\n');
  };

  const generateXLSX = () => {
    const wb = XLSX.utils.book_new();

    const translatedData = translateStatesInData();
    const worksheetData = [headers, ...translatedData.map(row => headers.map(h => row[h] || ''))];
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(wb, ws, "Respuestas");

    const resumen = [];
    resumen.push(["Título de la encuesta", survey_title]);
    resumen.push(["Fecha de exportación", export_date]);
    resumen.push(["Total de preguntas", total_questions]);
    resumen.push(["Total de participaciones", total_responses]);
    resumen.push(["Participaciones finalizadas", completed_participations]);
    resumen.push(["Días activa", days_active]);
    resumen.push([]);

    if (metadata) {
      resumen.push(["Fechas de la instancia"]);
      resumen.push(["Fecha de creación", metadata.creation_date ?? '']);
      resumen.push(["Fecha de cierre", metadata.closure_date ?? '']);
      resumen.push([]);
    }

    if (statistics?.questions_by_type) {
      resumen.push(["Preguntas por tipo"]);
      Object.entries(statistics.questions_by_type).forEach(([type, count]) => {
        resumen.push([typeLabels[type] || type, count]);
      });
      resumen.push([]);
    }

    if (statistics?.completion_rate) {
      resumen.push(["Tasa de respuesta por pregunta (%)"]);
      Object.entries(statistics.completion_rate).forEach(([key, val]) => {
        resumen.push([key, val]);
      });
    }

    const summarySheet = XLSX.utils.aoa_to_sheet(resumen);
    XLSX.utils.book_append_sheet(wb, summarySheet, "Resumen");

    return XLSX.write(wb, { bookType: "xlsx", type: "array" });
  };

  const handleExport = () => {
    const safeTitle = (survey_title || 'export').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filenameBase = `${safeTitle}_${export_date || new Date().toISOString()}`;

    if (format === 'csv') {
      const csvContent = '\uFEFF' + generateCSV();
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `${filenameBase}.csv`);
    } else if (format === 'txt') {
      const txtContent = generateTXT();
      const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8;" });
      saveAs(blob, `${filenameBase}.txt`);
    } else if (format === 'xlsx') {
      const xlsxData = generateXLSX();
      const blob = new Blob([xlsxData], { type: "application/octet-stream" });
      saveAs(blob, `${filenameBase}.xlsx`);
    }
  };

  return (
    <div>
      <label htmlFor="format">Seleccione el formato:</label>
      <select
        name="format"
        id="format"
        value={format}
        onChange={e => setFormat(e.target.value)}
        className="form-select w-auto d-inline-block me-2"
      >
        <option value="xlsx">XLSX</option>
        <option value="csv">CSV</option>
        <option value="txt">TXT</option>
      </select>
      <button onClick={handleExport} className="btn btn-success">
        Exportar Datos
      </button>
    </div>
  );
};

export default ExportButton;
