"use client"

import { useNavigate } from "react-router-dom"

export default function PoliticaDatos() {
  const navigate = useNavigate()

  return (
    <div className="min-vh-100 d-flex flex-column py-5" style={{ position: "relative" }}>
      <div className="container" style={{ position: "relative", zIndex: 1, maxWidth: "800px" }}>
        <button
          className="btn btn-outline-primary btn-sm mb-4"
          onClick={() => navigate(-1)}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="me-2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver
        </button>

        <div className="card shadow-lg border-0 fade-in rounded-5">
          <div className="card-body p-5">
            <div className="text-center mb-5">
              <div
                className="d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "24px",
                  background: "linear-gradient(135deg, var(--kairos-primary) 0%, var(--kairos-primary-dark) 100%)",
                  boxShadow: "var(--shadow-primary)",
                }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h2 className="kairos-logo-small mb-3">Autorización para el Tratamiento de Datos Personales</h2>
            </div>

            <div className="policy-content" style={{ lineHeight: "1.8", color: "var(--kairos-gray-700)" }}>
              <h5 className="fw-bold mt-4">1. Titular de los Datos</h5>
              <p>
                KAIROS BANCO es responsable del tratamiento de sus datos personales conforme a lo establecido en la legislación de protección de datos vigente.
              </p>

              <h5 className="fw-bold mt-4">2. Datos Recopilados</h5>
              <p>
                Recopilamos información personal incluyendo pero no limitado a:
              </p>
              <ul>
                <li>Nombre completo</li>
                <li>Número de documento de identidad</li>
                <li>Información de contacto</li>
                <li>Historial de transacciones y servicios</li>
              </ul>

              <h5 className="fw-bold mt-4">3. Finalidades del Tratamiento</h5>
              <p>
                Sus datos serán utilizados para:
              </p>
              <ul>
                <li>Prestar y mejorar nuestros servicios</li>
                <li>Gestión de turnos y atención al cliente</li>
                <li>Cumplimiento de obligaciones legales y regulatorias</li>
                <li>Prevención de fraude y seguridad</li>
                <li>Análisis y estadísticas (anonimizado)</li>
              </ul>

              <h5 className="fw-bold mt-4">4. Base Legal</h5>
              <p>
                El tratamiento de sus datos se realiza en virtud del consentimiento que usted proporciona al aceptar esta política y de las obligaciones legales aplicables.
              </p>

              <h5 className="fw-bold mt-4">5. Derechos del Titular</h5>
              <p>
                Usted tiene derecho a:
              </p>
              <ul>
                <li>Acceder a sus datos personales</li>
                <li>Solicitar la rectificación de datos inexactos</li>
                <li>Solicitar la eliminación de sus datos (derecho al olvido)</li>
                <li>Oponerse al tratamiento de sus datos</li>
                <li>Solicitar la portabilidad de sus datos</li>
              </ul>

              <h5 className="fw-bold mt-4">6. Seguridad de los Datos</h5>
              <p>
                KAIROS BANCO implementa medidas técnicas y organizativas apropiadas para proteger sus datos personales contra el acceso no autorizado, alteración, divulgación o destrucción.
              </p>

              <h5 className="fw-bold mt-4">7. Contacto</h5>
              <p>
                Si tiene preguntas o desea ejercer sus derechos, contáctenos a través de nuestros canales oficiales de atención al cliente.
              </p>

              <div className="alert alert-info mt-5">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="me-2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <strong>Importante:</strong> Al continuar con el registro, usted acepta esta autorización para el tratamiento de datos personales.
              </div>
            </div>

            <div className="mt-5 text-center">
              <button
                className="btn btn-primary btn-lg rounded-4 px-5"
                onClick={() => navigate(-1)}
              >
                Entendido, Continuar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
