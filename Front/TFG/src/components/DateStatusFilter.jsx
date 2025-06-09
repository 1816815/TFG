import React, { useState, useEffect, useMemo } from "react";

const DateStatusFilter = ({
  data = [],
  dateField = "creation_date",
  statusField = "state",
  onFilter,
  statusOptions = [
    { value: "all", label: "Todos" },
    { value: "open", label: "Abierta" },
    { value: "closed", label: "Cerrada" },
    { value: "draft", label: "Borrador" },
  ],
}) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const formatDateToYMD = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      // Usar toLocaleDateString para evitar problemas de zona horaria
      return date.toISOString().split("T")[0]; // YYYY-MM-DD
    } catch {
      return null;
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const rawDate = item[dateField];
      const itemDateStr = formatDateToYMD(rawDate);
      
      if (!itemDateStr) return false;

      // Comparar directamente las cadenas de fecha (YYYY-MM-DD)
      const withinStart = startDate ? itemDateStr >= startDate : true;
      const withinEnd = endDate ? itemDateStr <= endDate : true;

      const matchesStatus =
        filterStatus === "all" || item[statusField] === filterStatus;

      return withinStart && withinEnd && matchesStatus;
    });
  }, [data, startDate, endDate, filterStatus, dateField, statusField]);

  useEffect(() => {
    onFilter(filteredData);
  }, [filteredData, onFilter]);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setFilterStatus("all");
  };

  return (
    <div className="row mb-4 align-items-end">
      {/* Fecha desde */}
      <div className="col-md-4 mb-3 mb-md-0">
        <label htmlFor="startDate" className="form-label">
          Desde
        </label>
        <input
          type="date"
          className="form-control"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      {/* Fecha hasta */}
      <div className="col-md-4 mb-3 mb-md-0">
        <label htmlFor="endDate" className="form-label">
          Hasta
        </label>
        <input
          type="date"
          className="form-control"
          id="endDate"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {/* Estado */}
      <div className="col-md-2 mb-3 mb-md-0">
        <label htmlFor="filterStatus" className="form-label">
          Estado
        </label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="form-select"
          id="filterStatus"
        >
          {statusOptions.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Botón Limpiar */}
      <div className="col-md-2 mb-3 mb-md-0 d-flex align-items-end">
        <button
          type="button"
          className="btn btn-outline-secondary w-100"
          onClick={clearFilters}
        >
          Limpiar
        </button>
      </div>
    </div>
  );
};

export default DateStatusFilter;