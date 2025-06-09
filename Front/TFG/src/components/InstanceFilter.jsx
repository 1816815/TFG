import React, { useState, useMemo } from "react";
import { Search } from "react-feather";

const InstanceFilter = ({ data = [], onFilter, searchableFields = [], statusField = "state" }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        searchableFields.some((field) => {
          const value = item[field]?.toString().toLowerCase() || "";
          return value.includes(searchTerm.toLowerCase());
        });

      const matchesStatus =
        filterStatus === "all" || item[statusField] === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, filterStatus, searchableFields, statusField]);

  // Notificar al componente padre cada vez que se actualiza el filtro
  React.useEffect(() => {
    onFilter(filteredData);
  }, [filteredData, onFilter]);

  return (
    <div className="row mb-4">
      <div className="col-md-8 mb-3 mb-md-0">
        <div className="position-relative">
          <Search className="position-absolute top-50 translate-middle-y ms-3 text-muted" size={16} />
          <input
            type="date"
            className="form-control ps-5"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="col-md-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="form-select"
        >
          <option value="all">Todos los estados</option>
          <option value="open">Abierta</option>
          <option value="closed">Cerrada</option>
          <option value="draft">Borrador</option>
        </select>
      </div>
    </div>
  );
};

export default InstanceFilter;
