import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import useInstance from "../hooks/useInstance";
import useParticipation from "../hooks/useParticipations";
import { useParams } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Activity,
  Users,
  Calendar,
  FileText,
  Target,
  Clock,
  CheckCircle,
} from "lucide-react";

const COLORS = [
  "#0d6efd",
  "#198754",
  "#ffc107",
  "#fd7e14",
  "#6f42c1",
  "#d63384",
  "#20c997",
];

const CHART_TYPES = [
  { id: "bar", name: "Barras Verticales", icon: BarChart3, variant: "primary" },
  {
    id: "bar-horizontal",
    name: "Barras Horizontales",
    icon: BarChart3,
    variant: "secondary",
  },
  { id: "pie", name: "Circular", icon: PieChartIcon, variant: "success" },
  { id: "line", name: "Líneas", icon: TrendingUp, variant: "warning" },
  { id: "area", name: "Área", icon: Activity, variant: "info" },
];

export const SurveyStats = () => {
  const { surveyId, instanceId } = useParams();
  const { loadInstanceById } = useInstance();
  const { loadParticipations, loadExportData } = useParticipation();

  const instance = useSelector((state) => state.instances.currentInstance);
  const questions = instance?.survey_questions || [];
  const loadingInstances = useSelector((state) => state.instances.loading);
  const loadingExport = useSelector((state) => state.participations.loading);
  const error = useSelector((state) => state.instances.error);
  const exportData = useSelector((state) => state.participations.exportData);
  const participations = useSelector((state) => state.participations.items);

  const {
    data,
    headers,
    survey_title,
    total_responses,
    export_date,
    statistics,
    metadata,
  } = exportData || {};

  const { total_questions, completed_participations, days_active } =
    instance || {};

  const [chartTypes, setChartTypes] = useState({});

  useEffect(() => {
    if (instanceId) {
      loadInstanceById(instanceId);
      loadExportData(instanceId);
      loadParticipations(instanceId, { page: 1, page_size: 1000 });
    }
  }, [instanceId]);

  const processQuestionData = (question, data) => {
    const counts = {};
    let totalAnswers = 0;
    const key = question.content;

    data.forEach((row) => {
      let answer = row[key];
      if (!answer) return;

      if (question.type === "multiple") {
        const answersArray = answer.split(";").map((a) => a.trim());
        answersArray.forEach((ans) => {
          counts[ans] = (counts[ans] || 0) + 1;
          totalAnswers++;
        });
      } else if (question.type === "single") {
        counts[answer] = (counts[answer] || 0) + 1;
        totalAnswers++;
      } else if (["text", "open", "textarea"].includes(question.type)) {
        if (answer.trim() !== "") {
          counts["Respondidas"] = (counts["Respondidas"] || 0) + 1;
          totalAnswers++;
        }
      }
    });

    const options = Object.keys(counts);

    // Para barras y pie: un solo objeto con keys de opciones
    const pivoted = {
      name: question.content,
      ...counts,
    };

    // Para línea y área: array con cada opción como punto con valor
    const flatData = options.map((option) => ({
      option,
      count: counts[option],
    }));

    return {
      chartData: [pivoted],
      flatData,
      options,
      total: totalAnswers,
    };
  };

  const generalStats = [
    {
      name: "Total Respuestas",
      value: total_responses || 0,
      icon: Users,
      color: "primary",
      bgColor: "bg-primary",
      description: "Respuestas recibidas",
    },
    {
      name: "Preguntas",
      value: total_questions || questions.length,
      icon: FileText,
      color: "success",
      bgColor: "bg-success",
      description: "Total de preguntas",
    },
    {
      name: "Completadas",
      value: completed_participations || 0,
      icon: CheckCircle,
      color: "info",
      bgColor: "bg-info",
      description: "Participaciones completas",
    },
    {
      name: "Días Activos",
      value: days_active || 0,
      icon: Calendar,
      color: "warning",
      bgColor: "bg-warning",
      description: "Días desde creación",
    },
  ];

  const trendData = (() => {
    const map = {};

    Object.values(participations || {}).forEach((p) => {
      if (p.date) {
        const dateObj = new Date(p.date);
        const dateKey = dateObj.toISOString().split("T")[0]; // yyyy-mm-dd

        if (!map[dateKey]) {
          map[dateKey] = { respuestas: 0, completadas: 0 };
        }

        map[dateKey].respuestas += 1;
        if (p.state === "completed") {
          map[dateKey].completadas += 1;
        }
      }
    });

    return Object.entries(map)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, values]) => ({
        day: date,
        ...values,
      }));
  })();

  const handleChartTypeChange = (questionId, chartType) => {
    setChartTypes((prev) => ({
      ...prev,
      [questionId]: chartType,
    }));
  };

  const renderChart = (questionData, questionId, questionText) => {
    const chartType = chartTypes[questionId] || "bar";
    const { chartData, options } = questionData;

    if (!chartData || chartData.length === 0) {
      return (
        <div
          className="d-flex align-items-center justify-content-center"
          style={{ height: "300px" }}
        >
          <div className="text-center text-muted">
            <FileText size={48} className="mb-3" />
            <p>Sin datos disponibles</p>
          </div>
        </div>
      );
    }

    const getColor = (index) => COLORS[index % COLORS.length];

    const singleObj = chartData[0];
    const lineAreaData = options.map((option) => ({
      name: option,
      value: singleObj[option],
    }));

    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {options.map((option, index) => (
                <Bar
                  key={option}
                  dataKey={option}
                  name={option}
                  fill={getColor(index)}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineAreaData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                name={questionText}
                stroke={getColor(0)}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={lineAreaData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="value"
                name={questionText}
                stroke={getColor(0)}
                fill={getColor(0)}
                fillOpacity={0.4}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case "pie":
        const total = questionData.total;
        const dataPie = options.map((option) => ({
          name: option,
          value: chartData[0][option],
        }));

        const renderLabel = ({ percent }) => `${(percent * 100).toFixed(1)}%`;

        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataPie}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={renderLabel}
                labelLine={false}
              >
                {options.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(index)} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case "bar-horizontal":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ left: 80, right: 30, top: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                dataKey="name"
                type="category"
                width={150}
                tick={{ fontSize: 14 }}
              />
              <Tooltip />
              <Legend />
              {options.map((option, index) => (
                <Bar
                  key={option}
                  dataKey={option}
                  name={option}
                  fill={getColor(index)}
                  label={{
                    position: "right",
                    formatter: (value) =>
                      `${((value / questionData.total) * 100).toFixed(1)}%`,
                    fill: "#333",
                    fontSize: 12,
                  }}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  if (loadingInstances || loadingExport) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div
            className="spinner-border text-primary mb-3"
            role="status"
            style={{ width: "4rem", height: "4rem" }}
          >
            <span className="visually-hidden">Cargando...</span>
          </div>
          <h4 className="text-muted">Cargando estadísticas...</h4>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="text-danger mb-3" style={{ fontSize: "4rem" }}>
            ⚠️
          </div>
          <h2 className="text-danger mb-2">Error al cargar datos</h2>
          <p className="text-muted">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <div className="bg-white shadow-sm border-bottom">
        <div className="container-fluid py-4">
          <div className="row align-items-center">
            <div className="col">
              <h1 className="display-6 fw-bold text-dark mb-2">
                {survey_title || "Estadísticas de Encuesta"}
              </h1>
              <p className="text-muted mb-0">
                <Calendar size={16} className="me-2" />
                Datos exportados:{" "}
                {export_date
                  ? new Date(export_date).toLocaleDateString("es-ES")
                  : "N/A"}
              </p>
            </div>
            <div className="col-auto">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                <Target size={32} className="text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid py-4">
        {/* Estadísticas Generales */}
        <div className="row g-4 mb-4">
          {generalStats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div key={stat.name} className="col-lg-3 col-md-6">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div
                        className={`${stat.bgColor} bg-opacity-10 p-3 rounded-3 me-3`}
                      >
                        <IconComponent
                          size={24}
                          className={`text-${stat.color}`}
                        />
                      </div>
                      <div>
                        <h6 className="card-subtitle mb-1 text-muted">
                          {stat.name}
                        </h6>
                        <h3 className="card-title mb-0 fw-bold">
                          {stat.value}
                        </h3>
                      </div>
                    </div>
                    <small className="text-muted mt-2 d-block">
                      {stat.description}
                    </small>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Gráfico de Tendencias */}
        {trendData.length > 0 && (
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="card-title mb-0 d-flex align-items-center">
                <TrendingUp size={20} className="text-primary me-2" />
                Tendencia de Participación
              </h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="respuestas"
                    stackId="1"
                    stroke="#0d6efd"
                    fill="#0d6efd"
                  />
                  <Area
                    type="monotone"
                    dataKey="completadas"
                    stackId="1"
                    stroke="#198754"
                    fill="#198754"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {/* Estadísticas por pregunta */}
        {questions.map((question) => {
          const questionData =
            Array.isArray(data) && data.length > 0
              ? processQuestionData(question, data)
              : { chartData: [], dataKey: "", total: 0 };

          const currentType = chartTypes[question.id] || "bar";

          return (
            <div key={question.id} className="card mb-4 shadow-sm border-0">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h6 className="mb-0">{question.content}</h6>
                <div className="btn-group">
                  {CHART_TYPES.filter((type) =>
                    ["bar", "bar-horizontal", "pie"].includes(type.id)
                  ).map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        className={`btn btn-sm ${
                          currentType === type.id
                            ? `btn-${type.variant}`
                            : "btn-outline-secondary"
                        }`}
                        onClick={() =>
                          handleChartTypeChange(question.id, type.id)
                        }
                      >
                        <Icon size={14} className="me-1" />
                        {type.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="card-body">
                {questionData.total > 0 ? (
                  renderChart(questionData, question.id, question.content)
                ) : (
                  <p className="text-muted">
                    Sin respuestas para esta pregunta.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
