import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const ExportButton = ({ data, headers, surveyTitle, exportDate }) => {
  const [format, setFormat] = useState('xlsx');


  const generateCSV = (data, headers) => {
    const csvHeaders = headers.join(';');
    const csvRows = data.map(row =>
      headers.map(header => `"${(row[header] || '').toString().replace(/"/g, '""')}"`).join(';')
    );
    return [csvHeaders, ...csvRows].join('\n');
  };


  const generateTXT = (data, headers) => {
    const txtHeaders = headers.join('\t');
    const txtRows = data.map(row =>
      headers.map(header => (row[header] || '').toString()).join('\t')
    );
    return [txtHeaders, ...txtRows].join('\n');
  };

  const generateXLSX = (data, headers) => {

    const worksheetData = [headers, ...data.map(row => headers.map(h => row[h] || ''))];
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Export");


    return XLSX.write(wb, { bookType: "xlsx", type: "array" });
  };

  const handleExport = () => {
    const filenameBase = `${surveyTitle || 'export'}_${exportDate || new Date().toISOString()}`;

    if (format === 'csv') {
      const csvContent = '\uFEFF' + generateCSV(data.data, data.headers);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `${filenameBase}.csv`);
    } else if (format === 'txt') {
      const txtContent = generateTXT(data, headers);
      const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8;" });
      saveAs(blob, `${filenameBase}.txt`);
    } else if (format === 'xlsx') {
      const xlsxData = generateXLSX(data, headers);
      const blob = new Blob([xlsxData], { type: "application/octet-stream" });
      saveAs(blob, `${filenameBase}.xlsx`);
    }
  };

  return (
    <div>
        <label htmlFor="format">Seleccione el formato:</label>
      <select name='format' id='format' value={format} onChange={e => setFormat(e.target.value)} className="form-select w-auto d-inline-block me-2">
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
