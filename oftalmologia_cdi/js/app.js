/**
 * SISTEMA CLÍNICO DE OFTALMOLOGÍA CDI - MPPS / MISIÓN MILAGRO
 * Arquitectura de Controladores, Lógica de Consulta, Estadísticas y Generación de Documentos
 */

(function () {
  'use strict';

  // =========================================================================
  // Estado Global y Persistencia
  // =========================================================================
  const STORAGE_KEY_PATIENTS = 'CDI_OFTALMOLOGIA_PACIENTES_V1';
  const STORAGE_KEY_CONFIG = 'CDI_OFTALMOLOGIA_CONFIG_V1';
  const STORAGE_KEY_THEME = 'CDI_OFTALMOLOGIA_THEME_V1';

  let pacientes = [];
  let config = {};
  let currentPatient = null;
  let activeRxList = [];

  // Inicializar Datos
  function initStorage() {
    const storedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (storedConfig) {
      try {
        config = JSON.parse(storedConfig);
      } catch (e) {
        config = { ...SEED_CONFIG };
      }
    } else {
      config = { ...SEED_CONFIG };
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    }

    const storedPatients = localStorage.getItem(STORAGE_KEY_PATIENTS);
    if (storedPatients) {
      try {
        pacientes = JSON.parse(storedPatients);
      } catch (e) {
        pacientes = [...SEED_PACIENTES];
      }
    } else {
      pacientes = [...SEED_PACIENTES];
      localStorage.setItem(STORAGE_KEY_PATIENTS, JSON.stringify(pacientes));
    }

    // Inicializar Tema
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
  }

  function savePatients() {
    localStorage.setItem(STORAGE_KEY_PATIENTS, JSON.stringify(pacientes));
    updateBadges();
  }

  function saveConfig() {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    renderConfigHeader();
  }

  // =========================================================================
  // Control de Tema (Oscuro / Claro)
  // =========================================================================
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(STORAGE_KEY_THEME, newTheme);
    updateThemeIcon(newTheme);
  }

  function updateThemeIcon(theme) {
    const btn = document.getElementById('btn-toggle-theme');
    if (btn) {
      btn.innerHTML = theme === 'dark' 
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>` 
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    }
  }

  // =========================================================================
  // Navegación por Pestañas
  // =========================================================================
  function initTabs() {
    const tabBtns = document.querySelectorAll('.nav-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        switchTab(targetTab);
      });
    });
  }

  function switchTab(tabId) {
    document.querySelectorAll('.nav-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active'));

    const activeBtn = document.querySelector(`.nav-tab-btn[data-tab="${tabId}"]`);
    const activeView = document.getElementById(`tab-${tabId}`);

    if (activeBtn) activeBtn.classList.add('active');
    if (activeView) activeView.classList.add('active');

    // Cargar contenido según pestaña
    if (tabId === 'pacientes') renderPatientsTable();
    if (tabId === 'mision-milagro') renderMilagroCensus();
    if (tabId === 'estadisticas') renderStatistics();
    if (tabId === 'configuracion') loadConfigForm();
  }

  // =========================================================================
  // Actualización de Encabezados y Contadores
  // =========================================================================
  function renderConfigHeader() {
    const cdiLabel = document.getElementById('banner-cdi-name');
    const asicLabel = document.getElementById('banner-asic-name');
    const doctorLabel = document.getElementById('consult-doctor-name');

    if (cdiLabel) cdiLabel.textContent = config.cdiName || 'CDI Sin Asignar';
    if (asicLabel) asicLabel.textContent = `${config.asicName || ''} - Edo. ${config.estado || 'Venezuela'}`;
    if (doctorLabel) doctorLabel.textContent = `Especialista: ${config.oftalmologo} (${config.registroMPPS})`;
  }

  function updateBadges() {
    const totalCount = pacientes.length;
    let milagroCount = 0;
    pacientes.forEach(p => {
      if (p.consultas) {
        p.consultas.forEach(c => {
          if (c.misionMilagro && c.misionMilagro.candidato) {
            milagroCount++;
          }
        });
      }
    });

    const badgePatients = document.getElementById('badge-total-patients');
    const badgeMilagro = document.getElementById('badge-milagro-candidates');
    if (badgePatients) badgePatients.textContent = totalCount;
    if (badgeMilagro) badgeMilagro.textContent = milagroCount;
  }

  // =========================================================================
  // Búsqueda y Manejo de Pacientes
  // =========================================================================
  function searchPatientByCedula() {
    const tipo = document.getElementById('patient-tipo-doc').value;
    const cedula = document.getElementById('patient-cedula').value.trim();

    if (!cedula) {
      alert('Por favor ingrese el número de cédula para buscar.');
      return;
    }

    const found = pacientes.find(p => p.tipoDoc === tipo && p.cedula.replace(/\D/g, '') === cedula.replace(/\D/g, ''));

    if (found) {
      fillPatientForm(found);
      currentPatient = found;
      showPatientAlert(`Paciente encontrado: ${found.nombres} ${found.apellidos} (${found.consultas ? found.consultas.length : 0} consultas previas)`, 'info');
      renderPreviousConsultationsMini(found);
    } else {
      currentPatient = null;
      document.getElementById('patient-previous-consults').innerHTML = '';
      showPatientAlert(`Cédula ${tipo}-${cedula} no registrada. Complete los datos para registrar como nuevo paciente.`, 'new');
    }
  }

  function fillPatientForm(p) {
    document.getElementById('patient-nombres').value = p.nombres || '';
    document.getElementById('patient-apellidos').value = p.apellidos || '';
    document.getElementById('patient-edad').value = p.edad || '';
    document.getElementById('patient-sexo').value = p.sexo || 'F';
    document.getElementById('patient-telefono').value = p.telefono || '';
    document.getElementById('patient-comunidad').value = p.comunidad || '';
    document.getElementById('patient-ocupacion').value = p.ocupacion || '';
    document.getElementById('patient-antecedentes').value = (p.antecedentes || []).join(', ');
    document.getElementById('patient-alergias').value = p.alergias || '';
  }

  function clearPatientForm() {
    document.getElementById('patient-cedula').value = '';
    document.getElementById('patient-nombres').value = '';
    document.getElementById('patient-apellidos').value = '';
    document.getElementById('patient-edad').value = '';
    document.getElementById('patient-telefono').value = '';
    document.getElementById('patient-comunidad').value = '';
    document.getElementById('patient-ocupacion').value = '';
    document.getElementById('patient-antecedentes').value = '';
    document.getElementById('patient-alergias').value = '';
    document.getElementById('patient-previous-consults').innerHTML = '';
    currentPatient = null;
    clearConsultForm();
  }

  function showPatientAlert(msg, type) {
    const container = document.getElementById('patient-search-feedback');
    if (!container) return;

    const bg = type === 'info' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(16, 185, 129, 0.15)';
    const color = type === 'info' ? '#06b6d4' : '#10b981';
    const icon = type === 'info' ? 'ℹ️' : '✨';

    container.innerHTML = `
      <div style="background: ${bg}; border: 1px solid ${color}; color: ${color}; padding: 8px 12px; border-radius: 8px; font-size: 0.82rem; margin-top: 8px; display: flex; align-items: center; gap: 8px;">
        <span>${icon}</span>
        <span>${msg}</span>
      </div>
    `;
    setTimeout(() => { container.innerHTML = ''; }, 6000);
  }

  function renderPreviousConsultationsMini(p) {
    const container = document.getElementById('patient-previous-consults');
    if (!container || !p.consultas || p.consultas.length === 0) {
      if (container) container.innerHTML = '';
      return;
    }

    let html = `
      <div style="margin-top: 14px; background: rgba(0,0,0,0.15); border: 1px solid var(--border-glass); border-radius: 8px; padding: 12px;">
        <div style="font-weight: 700; font-size: 0.82rem; color: var(--accent-cyan); margin-bottom: 6px;">Historial de Consultas de ${p.nombres}:</div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
    `;

    p.consultas.forEach((c, idx) => {
      const fechaFormat = new Date(c.fecha).toLocaleDateString('es-VE');
      const diagPrincipal = c.diagnosticos && c.diagnosticos[0] ? c.diagnosticos[0].nombre : 'Consulta general';
      html += `
        <button type="button" class="btn btn-secondary btn-sm" onclick="window.CDIApp.loadPastConsult('${p.id}', '${c.id}')" style="font-size: 0.76rem; padding: 4px 10px;">
          📅 ${fechaFormat} - ${diagPrincipal}
        </button>
      `;
    });

    html += `</div></div>`;
    container.innerHTML = html;
  }

  // =========================================================================
  // Control del Examen Físico Oftalmológico (OD / OS)
  // =========================================================================
  function initOphthalmicControls() {
    // Escuchar cambios de Presión Intraocular (Tonometría)
    const pioOdInput = document.getElementById('exam-pio-od');
    const pioOsInput = document.getElementById('exam-pio-os');

    if (pioOdInput) {
      pioOdInput.addEventListener('input', () => updatePioIndicator('od', pioOdInput.value));
    }
    if (pioOsInput) {
      pioOsInput.addEventListener('input', () => updatePioIndicator('os', pioOsInput.value));
    }

    // Toggle Misión Milagro
    const milagroToggle = document.getElementById('milagro-candidate-switch');
    const milagroDetails = document.getElementById('milagro-details-panel');
    if (milagroToggle && milagroDetails) {
      milagroToggle.addEventListener('change', () => {
        milagroDetails.style.display = milagroToggle.checked ? 'block' : 'none';
      });
    }

    // Llenar select de diagnósticos rápidos
    const selectDiag = document.getElementById('select-quick-diag');
    if (selectDiag) {
      selectDiag.innerHTML = '<option value="">-- Seleccionar diagnóstico frecuente --</option>' +
        DIAGNOSTICOS_FRECUENTES.map(d => `<option value="${d.cie}">${d.cie} - ${d.nombre} (${d.grupo})</option>`).join('');

      selectDiag.addEventListener('change', () => {
        const selected = DIAGNOSTICOS_FRECUENTES.find(d => d.cie === selectDiag.value);
        if (selected) {
          addDiagnosisBadge(selected);
          // Si es quirúrgico, sugerir activación de Misión Milagro
          if (selected.quirurgico && milagroToggle && !milagroToggle.checked) {
            milagroToggle.checked = true;
            milagroDetails.style.display = 'block';
            document.getElementById('milagro-cirugia').value = selected.nombre.includes('Catarata') 
              ? 'Facoemulsificación + Implante de LIO (Catarata)'
              : (selected.nombre.includes('Pterigión') ? 'Resección de Pterigión + Autoinjerto Conjuntival' : 'Procedimiento Especial Oftalmológico');
          }
        }
      });
    }

    // Llenar select de medicamentos SUMED
    const selectMed = document.getElementById('select-quick-med');
    if (selectMed) {
      selectMed.innerHTML = '<option value="">-- Seleccionar colirio / medicamento CDI --</option>' +
        MEDICAMENTOS_SUMED.map(m => `<option value="${m.id}">${m.nombre} (${m.tipo})</option>`).join('');
    }
  }

  function updatePioIndicator(eye, valStr) {
    const val = parseFloat(valStr);
    const badge = document.getElementById(`pio-status-${eye}`);
    if (!badge) return;

    if (isNaN(val) || val <= 0) {
      badge.textContent = 'Sin medir';
      badge.className = 'pio-status-indicator';
      return;
    }

    if (val < 10) {
      badge.textContent = 'Hipotonía (<10)';
      badge.className = 'pio-status-indicator pio-alert';
    } else if (val <= 21) {
      badge.textContent = 'Normal (10-21 mmHg)';
      badge.className = 'pio-status-indicator pio-normal';
    } else if (val <= 24) {
      badge.textContent = 'Sospecha de Hipertensión Ocular';
      badge.className = 'pio-status-indicator pio-alert';
    } else {
      badge.textContent = '⚠️ ALERTA: Hipertensión Ocular / Glaucoma';
      badge.className = 'pio-status-indicator pio-danger';
    }
  }

  // Lista de Diagnósticos activos en la consulta
  let activeDiagnosticos = [];

  function addDiagnosisBadge(diag) {
    if (activeDiagnosticos.some(d => d.cie === diag.cie)) return;

    activeDiagnosticos.push(diag);
    renderDiagnosisBadges();
  }

  function removeDiagnosis(cie) {
    activeDiagnosticos = activeDiagnosticos.filter(d => d.cie !== cie);
    renderDiagnosisBadges();
  }

  function renderDiagnosisBadges() {
    const container = document.getElementById('active-diagnosticos-container');
    if (!container) return;

    if (activeDiagnosticos.length === 0) {
      container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.82rem; font-style: italic;">No se han añadido diagnósticos aún. Seleccione uno arriba o ingrese manualmente.</div>';
      return;
    }

    container.innerHTML = activeDiagnosticos.map(d => `
      <span class="badge-tag" style="background: rgba(6, 182, 212, 0.15); color: var(--accent-cyan); border: 1px solid rgba(6, 182, 212, 0.4); padding: 5px 10px; font-size: 0.82rem; margin: 3px; display: inline-flex; align-items: center; gap: 6px;">
        <strong>${d.cie}</strong> ${d.nombre}
        <button type="button" onclick="window.CDIApp.removeDiagnosis('${d.cie}')" style="background: transparent; border: none; color: inherit; cursor: pointer; font-weight: bold; margin-left: 4px;">×</button>
      </span>
    `).join('');
  }

  // =========================================================================
  // Constructor de Récipe y Farmacia
  // =========================================================================
  function addPrescriptionItem() {
    const select = document.getElementById('select-quick-med');
    const customDose = document.getElementById('rx-custom-dose').value.trim();
    const medId = select.value;

    if (!medId) {
      alert('Por favor seleccione un medicamento del catálogo.');
      return;
    }

    const med = MEDICAMENTOS_SUMED.find(m => m.id === medId);
    if (!med) return;

    activeRxList.push({
      id: med.id,
      nombre: med.nombre,
      dosis: customDose || med.dosis,
      advertencia: med.advertencia
    });

    renderPrescriptionList();
    document.getElementById('rx-custom-dose').value = '';
    select.value = '';
  }

  function removeRxItem(idx) {
    activeRxList.splice(idx, 1);
    renderPrescriptionList();
  }

  function renderPrescriptionList() {
    const container = document.getElementById('rx-items-list');
    if (!container) return;

    if (activeRxList.length === 0) {
      container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.82rem; font-style: italic;">No hay medicamentos prescritos en este récipe.</div>';
      return;
    }

    container.innerHTML = activeRxList.map((item, idx) => `
      <div class="rx-item-row">
        <div class="med-name">${item.nombre}</div>
        <div class="med-dose">${item.dosis} ${item.advertencia ? `<span style="font-size:0.75rem; color:var(--accent-amber); display:block;">Nota: ${item.advertencia}</span>` : ''}</div>
        <button type="button" class="btn-remove-rx" onclick="window.CDIApp.removeRxItem(${idx})" title="Eliminar medicamento">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    `).join('');
  }

  // =========================================================================
  // Guardado de la Consulta Médica
  // =========================================================================
  function saveConsultation() {
    const tipo = document.getElementById('patient-tipo-doc').value;
    const cedula = document.getElementById('patient-cedula').value.trim();
    const nombres = document.getElementById('patient-nombres').value.trim();
    const apellidos = document.getElementById('patient-apellidos').value.trim();

    if (!cedula || !nombres || !apellidos) {
      alert('Por favor ingrese al menos la Cédula, Nombres y Apellidos del paciente.');
      return;
    }

    // Buscar si el paciente ya existe o crear uno nuevo
    let patientObj = pacientes.find(p => p.tipoDoc === tipo && p.cedula.replace(/\D/g, '') === cedula.replace(/\D/g, ''));

    if (!patientObj) {
      patientObj = {
        id: `PAC-${Date.now().toString().slice(-6)}`,
        tipoDoc: tipo,
        cedula: cedula.replace(/\D/g, ''),
        nombres: nombres,
        apellidos: apellidos,
        edad: parseInt(document.getElementById('patient-edad').value, 10) || 0,
        sexo: document.getElementById('patient-sexo').value,
        telefono: document.getElementById('patient-telefono').value.trim(),
        estado: config.estado,
        municipio: config.municipio,
        parroquia: config.parroquia,
        comunidad: document.getElementById('patient-comunidad').value.trim(),
        ocupacion: document.getElementById('patient-ocupacion').value.trim(),
        antecedentes: document.getElementById('patient-antecedentes').value.split(',').map(s => s.trim()).filter(Boolean),
        alergias: document.getElementById('patient-alergias').value.trim(),
        consultas: []
      };
      pacientes.unshift(patientObj);
    } else {
      // Actualizar datos generales
      patientObj.nombres = nombres;
      patientObj.apellidos = apellidos;
      patientObj.edad = parseInt(document.getElementById('patient-edad').value, 10) || patientObj.edad;
      patientObj.sexo = document.getElementById('patient-sexo').value;
      patientObj.telefono = document.getElementById('patient-telefono').value.trim();
      patientObj.comunidad = document.getElementById('patient-comunidad').value.trim();
      patientObj.ocupacion = document.getElementById('patient-ocupacion').value.trim();
      patientObj.antecedentes = document.getElementById('patient-antecedentes').value.split(',').map(s => s.trim()).filter(Boolean);
      patientObj.alergias = document.getElementById('patient-alergias').value.trim();
      if (!patientObj.consultas) patientObj.consultas = [];
    }

    // Armar Objeto de Consulta Oftalmológica
    const isMilagro = document.getElementById('milagro-candidate-switch').checked;

    const newConsult = {
      id: `CONS-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      fecha: new Date().toISOString(),
      oftalmologo: config.oftalmologo,
      cdi: config.cdiName,
      motivo: document.getElementById('consult-motivo').value.trim(),
      enfermedadActual: document.getElementById('consult-enfermedad-actual').value.trim(),
      agudezaVisual: {
        od: {
          sc: document.getElementById('av-od-sc').value,
          cc: document.getElementById('av-od-cc').value,
          ph: document.getElementById('av-od-ph').value,
          cerca: document.getElementById('av-od-cerca').value
        },
        os: {
          sc: document.getElementById('av-os-sc').value,
          cc: document.getElementById('av-os-cc').value,
          ph: document.getElementById('av-os-ph').value,
          cerca: document.getElementById('av-os-cerca').value
        }
      },
      refraccion: {
        od: {
          esfera: document.getElementById('rx-od-esf').value,
          cilindro: document.getElementById('rx-od-cil').value,
          eje: document.getElementById('rx-od-eje').value,
          adic: document.getElementById('rx-od-adic').value
        },
        os: {
          esfera: document.getElementById('rx-os-esf').value,
          cilindro: document.getElementById('rx-os-cil').value,
          eje: document.getElementById('rx-os-eje').value,
          adic: document.getElementById('rx-os-adic').value
        },
        dp: document.getElementById('rx-dp').value
      },
      tonometria: {
        od: parseFloat(document.getElementById('exam-pio-od').value) || 0,
        os: parseFloat(document.getElementById('exam-pio-os').value) || 0,
        metodo: "Goldmann"
      },
      biomicroscopia: {
        od: document.getElementById('exam-bio-od').value.trim(),
        os: document.getElementById('exam-bio-os').value.trim()
      },
      fondoOjo: {
        od: document.getElementById('exam-fo-od').value.trim(),
        os: document.getElementById('exam-fo-os').value.trim()
      },
      diagnosticos: activeDiagnosticos.length > 0 ? [...activeDiagnosticos] : [
        { cie: "H52.7", nombre: "Trastorno de la refracción, no especificado" }
      ],
      misionMilagro: {
        candidato: isMilagro,
        ojoQuirurgico: isMilagro ? document.getElementById('milagro-eye').value : "Ninguno",
        cirugia: isMilagro ? document.getElementById('milagro-cirugia').value : "No aplica",
        prioridad: isMilagro ? document.getElementById('milagro-prioridad').value : "N/A",
        biometriaLIO: isMilagro ? document.getElementById('milagro-lio').value : "N/A",
        estadoProtocolo: isMilagro ? document.getElementById('milagro-estado-protocolo').value : "No Quirúrgico",
        laboratorio: {
          hematologia: isMilagro && document.getElementById('check-lab-hem').checked ? "Completado" : "Pendiente",
          glicemia: isMilagro && document.getElementById('check-lab-gli').checked ? "Completado" : "Pendiente",
          tpTpt: isMilagro && document.getElementById('check-lab-tp').checked ? "Completado" : "Pendiente",
          ekg: isMilagro && document.getElementById('check-lab-ekg').checked ? "Completado" : "Pendiente",
          riesgoCardiovascular: isMilagro && document.getElementById('check-lab-cv').checked ? "Aprobado" : "Pendiente"
        }
      },
      tratamiento: [...activeRxList],
      lentesPrescritos: {
        tipo: document.getElementById('lentes-tipo').value,
        od: `Esf: ${document.getElementById('rx-od-esf').value} Cil: ${document.getElementById('rx-od-cil').value} x ${document.getElementById('rx-od-eje').value}° Add: ${document.getElementById('rx-od-adic').value}`,
        os: `Esf: ${document.getElementById('rx-os-esf').value} Cil: ${document.getElementById('rx-os-cil').value} x ${document.getElementById('rx-os-eje').value}° Add: ${document.getElementById('rx-os-adic').value}`,
        observaciones: document.getElementById('lentes-obs').value.trim()
      },
      observaciones: document.getElementById('consult-plan-general').value.trim()
    };

    patientObj.consultas.unshift(newConsult);
    savePatients();

    alert(`¡Consulta oftalmológica guardada con éxito!\nPaciente: ${patientObj.nombres} ${patientObj.apellidos}\nID Consulta: ${newConsult.id}`);
    
    // Preparar opciones de impresión
    showPrintModal(patientObj, newConsult);
  }

  function clearConsultForm() {
    document.getElementById('consult-motivo').value = '';
    document.getElementById('consult-enfermedad-actual').value = '';
    document.getElementById('av-od-sc').value = '20/20';
    document.getElementById('av-od-cc').value = '20/20';
    document.getElementById('av-od-ph').value = '20/20';
    document.getElementById('av-od-cerca').value = 'J1';
    document.getElementById('av-os-sc').value = '20/20';
    document.getElementById('av-os-cc').value = '20/20';
    document.getElementById('av-os-ph').value = '20/20';
    document.getElementById('av-os-cerca').value = 'J1';

    document.getElementById('rx-od-esf').value = '0.00';
    document.getElementById('rx-od-cil').value = '0.00';
    document.getElementById('rx-od-eje').value = '0';
    document.getElementById('rx-od-adic').value = '0.00';
    document.getElementById('rx-os-esf').value = '0.00';
    document.getElementById('rx-os-cil').value = '0.00';
    document.getElementById('rx-os-eje').value = '0';
    document.getElementById('rx-os-adic').value = '0.00';
    document.getElementById('rx-dp').value = '62';

    document.getElementById('exam-pio-od').value = '';
    document.getElementById('exam-pio-os').value = '';
    updatePioIndicator('od', '');
    updatePioIndicator('os', '');

    document.getElementById('exam-bio-od').value = 'Párpados libres. Córnea transparente. Cámara anterior amplia. Cristalino transparente.';
    document.getElementById('exam-bio-os').value = 'Párpados libres. Córnea transparente. Cámara anterior amplia. Cristalino transparente.';

    document.getElementById('exam-fo-od').value = 'Papila rosada, bordes nítidos, E/P 0.3. Mácula normal con brillo foveal. Retina aplicada.';
    document.getElementById('exam-fo-os').value = 'Papila rosada, bordes nítidos, E/P 0.3. Mácula normal con brillo foveal. Retina aplicada.';

    document.getElementById('milagro-candidate-switch').checked = false;
    document.getElementById('milagro-details-panel').style.display = 'none';

    activeDiagnosticos = [];
    renderDiagnosisBadges();

    activeRxList = [];
    renderPrescriptionList();

    document.getElementById('lentes-obs').value = '';
    document.getElementById('consult-plan-general').value = '';
  }

  function loadPastConsult(patientId, consultId) {
    const p = pacientes.find(item => item.id === patientId);
    if (!p || !p.consultas) return;
    const c = p.consultas.find(item => item.id === consultId);
    if (!c) return;

    fillPatientForm(p);
    currentPatient = p;

    document.getElementById('consult-motivo').value = c.motivo || '';
    document.getElementById('consult-enfermedad-actual').value = c.enfermedadActual || '';

    if (c.agudezaVisual) {
      if (c.agudezaVisual.od) {
        document.getElementById('av-od-sc').value = c.agudezaVisual.od.sc || '20/20';
        document.getElementById('av-od-cc').value = c.agudezaVisual.od.cc || '20/20';
        document.getElementById('av-od-ph').value = c.agudezaVisual.od.ph || '20/20';
        document.getElementById('av-od-cerca').value = c.agudezaVisual.od.cerca || 'J1';
      }
      if (c.agudezaVisual.os) {
        document.getElementById('av-os-sc').value = c.agudezaVisual.os.sc || '20/20';
        document.getElementById('av-os-cc').value = c.agudezaVisual.os.cc || '20/20';
        document.getElementById('av-os-ph').value = c.agudezaVisual.os.ph || '20/20';
        document.getElementById('av-os-cerca').value = c.agudezaVisual.os.cerca || 'J1';
      }
    }

    if (c.refraccion) {
      if (c.refraccion.od) {
        document.getElementById('rx-od-esf').value = c.refraccion.od.esfera || '0.00';
        document.getElementById('rx-od-cil').value = c.refraccion.od.cilindro || '0.00';
        document.getElementById('rx-od-eje').value = c.refraccion.od.eje || '0';
        document.getElementById('rx-od-adic').value = c.refraccion.od.adic || '0.00';
      }
      if (c.refraccion.os) {
        document.getElementById('rx-os-esf').value = c.refraccion.os.esfera || '0.00';
        document.getElementById('rx-os-cil').value = c.refraccion.os.cilindro || '0.00';
        document.getElementById('rx-os-eje').value = c.refraccion.os.eje || '0';
        document.getElementById('rx-os-adic').value = c.refraccion.os.adic || '0.00';
      }
      document.getElementById('rx-dp').value = c.refraccion.dp || '62';
    }

    if (c.tonometria) {
      document.getElementById('exam-pio-od').value = c.tonometria.od || '';
      document.getElementById('exam-pio-os').value = c.tonometria.os || '';
      updatePioIndicator('od', c.tonometria.od);
      updatePioIndicator('os', c.tonometria.os);
    }

    if (c.biomicroscopia) {
      document.getElementById('exam-bio-od').value = c.biomicroscopia.od || '';
      document.getElementById('exam-bio-os').value = c.biomicroscopia.os || '';
    }

    if (c.fondoOjo) {
      document.getElementById('exam-fo-od').value = c.fondoOjo.od || '';
      document.getElementById('exam-fo-os').value = c.fondoOjo.os || '';
    }

    activeDiagnosticos = c.diagnosticos ? [...c.diagnosticos] : [];
    renderDiagnosisBadges();

    if (c.misionMilagro && c.misionMilagro.candidato) {
      document.getElementById('milagro-candidate-switch').checked = true;
      document.getElementById('milagro-details-panel').style.display = 'block';
      document.getElementById('milagro-eye').value = c.misionMilagro.ojoQuirurgico || 'OD';
      document.getElementById('milagro-cirugia').value = c.misionMilagro.cirugia || '';
      document.getElementById('milagro-prioridad').value = c.misionMilagro.prioridad || 'Media';
      document.getElementById('milagro-lio').value = c.misionMilagro.biometriaLIO || '';
      document.getElementById('milagro-estado-protocolo').value = c.misionMilagro.estadoProtocolo || 'Pendiente por Laboratorio';
    } else {
      document.getElementById('milagro-candidate-switch').checked = false;
      document.getElementById('milagro-details-panel').style.display = 'none';
    }

    activeRxList = c.tratamiento ? [...c.tratamiento] : [];
    renderPrescriptionList();

    if (c.lentesPrescritos) {
      document.getElementById('lentes-tipo').value = c.lentesPrescritos.tipo || 'Monofocal';
      document.getElementById('lentes-obs').value = c.lentesPrescritos.observaciones || '';
    }

    document.getElementById('consult-plan-general').value = c.observaciones || '';
    switchTab('nueva-consulta');
    showPatientAlert(`Consulta del ${new Date(c.fecha).toLocaleDateString('es-VE')} cargada en el formulario.`, 'info');
  }

  // =========================================================================
  // Directorio y Tabla de Pacientes
  // =========================================================================
  function renderPatientsTable() {
    const tbody = document.getElementById('patients-table-body');
    const filterText = (document.getElementById('search-patients-input')?.value || '').toLowerCase().trim();

    if (!tbody) return;

    let filtered = pacientes;
    if (filterText) {
      filtered = pacientes.filter(p => 
        p.cedula.includes(filterText) ||
        p.nombres.toLowerCase().includes(filterText) ||
        p.apellidos.toLowerCase().includes(filterText) ||
        (p.comunidad && p.comunidad.toLowerCase().includes(filterText))
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">No se encontraron pacientes registrados con ese criterio.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(p => {
      const lastConsult = p.consultas && p.consultas[0];
      const fechaUltima = lastConsult ? new Date(lastConsult.fecha).toLocaleDateString('es-VE') : 'Sin consultas';
      const diagStr = lastConsult && lastConsult.diagnosticos && lastConsult.diagnosticos[0] 
        ? lastConsult.diagnosticos[0].nombre 
        : 'N/A';
      
      const isMilagro = lastConsult && lastConsult.misionMilagro && lastConsult.misionMilagro.candidato;

      return `
        <tr>
          <td><strong style="color:var(--accent-cyan);">${p.tipoDoc}-${Number(p.cedula).toLocaleString('es-VE')}</strong></td>
          <td><strong>${p.nombres} ${p.apellidos}</strong></td>
          <td>${p.edad} años (${p.sexo})</td>
          <td>${p.telefono || 'Sin teléfono'}</td>
          <td>
            <div style="font-size:0.8rem; font-weight:600;">${diagStr}</div>
            <div style="font-size:0.72rem; color:var(--text-muted);">Última: ${fechaUltima}</div>
          </td>
          <td>
            ${isMilagro 
              ? `<span class="badge-tag" style="background:rgba(251,191,36,0.15); color:var(--milagro-gold); border:1px solid rgba(251,191,36,0.3);">☀️ Misión Milagro (${lastConsult.misionMilagro.ojoQuirurgico})</span>` 
              : `<span class="badge-tag" style="background:rgba(148,163,184,0.1); color:var(--text-muted);">Control Ambulatorio</span>`}
          </td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-secondary btn-sm" onclick="window.CDIApp.openPatientHistory('${p.id}')" title="Ver Expediente">
                📋 Ver
              </button>
              <button class="btn btn-primary btn-sm" onclick="window.CDIApp.newConsultForPatient('${p.id}')" title="Nueva Consulta">
                🩺 Consulta
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function openPatientHistory(patientId) {
    const p = pacientes.find(item => item.id === patientId);
    if (!p) return;

    let modalHtml = `
      <div class="modal-header">
        <h3 style="display:flex; align-items:center; gap:8px;">
          <span>👤</span> Expediente Clínico: ${p.nombres} ${p.apellidos} (${p.tipoDoc}-${p.cedula})
        </h3>
        <button class="btn-close-modal" onclick="window.CDIApp.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; margin-bottom:16px; background:rgba(0,0,0,0.15); padding:12px; border-radius:8px;">
          <div><strong>Edad/Sexo:</strong> ${p.edad} años (${p.sexo})</div>
          <div><strong>Teléfono:</strong> ${p.telefono}</div>
          <div><strong>Comunidad:</strong> ${p.comunidad || 'No especificada'}</div>
          <div><strong>Ocupación:</strong> ${p.ocupacion || 'N/A'}</div>
          <div><strong>Antecedentes:</strong> ${(p.antecedentes || []).join(', ') || 'Sin antecedentes'}</div>
          <div><strong>Alergias:</strong> ${p.alergias || 'Ninguna conocida'}</div>
        </div>

        <h4 style="color:var(--accent-cyan); margin-bottom:12px;">Historial de Atenciones Oftalmológicas (${p.consultas ? p.consultas.length : 0})</h4>
    `;

    if (!p.consultas || p.consultas.length === 0) {
      modalHtml += `<p style="color:var(--text-muted);">No tiene consultas registradas.</p>`;
    } else {
      p.consultas.forEach((c, idx) => {
        const fecha = new Date(c.fecha).toLocaleString('es-VE');
        modalHtml += `
          <div style="border: 1px solid var(--border-glass); border-radius: 8px; padding: 14px; margin-bottom: 12px; background: var(--bg-surface-elevated);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid var(--border-glass); padding-bottom:6px;">
              <strong>Consulta #${p.consultas.length - idx}: ${fecha}</strong>
              <div style="display:flex; gap:6px;">
                <button class="btn btn-outline-print btn-sm" onclick="window.CDIApp.printDocument('historia', '${p.id}', '${c.id}')">🖨️ Historia</button>
                <button class="btn btn-outline-print btn-sm" onclick="window.CDIApp.printDocument('recipe', '${p.id}', '${c.id}')">💊 Récipe</button>
                ${c.misionMilagro && c.misionMilagro.candidato ? `<button class="btn btn-warning btn-sm" onclick="window.CDIApp.printDocument('milagro', '${p.id}', '${c.id}')">☀️ Ref. Quirúrgica</button>` : ''}
              </div>
            </div>
            <div style="font-size:0.86rem; display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
              <div>
                <strong>Motivo:</strong> ${c.motivo}<br>
                <strong>Diagnósticos:</strong> ${(c.diagnosticos || []).map(d => d.nombre).join(', ') || 'N/A'}<br>
                <strong>PIO:</strong> OD: ${c.tonometria?.od || '-'} mmHg | OS: ${c.tonometria?.os || '-'} mmHg
              </div>
              <div>
                <strong>AV OD:</strong> SC: ${c.agudezaVisual?.od?.sc} / CC: ${c.agudezaVisual?.od?.cc}<br>
                <strong>AV OS:</strong> SC: ${c.agudezaVisual?.os?.sc} / CC: ${c.agudezaVisual?.os?.cc}<br>
                <strong>Lentes:</strong> ${c.lentesPrescritos?.tipo || 'N/A'}
              </div>
            </div>
          </div>
        `;
      });
    }

    modalHtml += `
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="window.CDIApp.closeModal()">Cerrar</button>
      </div>
    `;

    showGenericModal(modalHtml);
  }

  function newConsultForPatient(patientId) {
    const p = pacientes.find(item => item.id === patientId);
    if (!p) return;

    fillPatientForm(p);
    currentPatient = p;
    clearConsultForm();
    switchTab('nueva-consulta');
    showPatientAlert(`Paciente ${p.nombres} ${p.apellidos} seleccionado para nueva consulta.`, 'info');
  }

  // =========================================================================
  // Módulo Misión Milagro (Censo Quirúrgico Comunitario)
  // =========================================================================
  function renderMilagroCensus() {
    const tbody = document.getElementById('milagro-table-body');
    const filterStatus = document.getElementById('milagro-filter-status')?.value || 'all';

    if (!tbody) return;

    let surgicalPatients = [];
    pacientes.forEach(p => {
      if (p.consultas) {
        p.consultas.forEach(c => {
          if (c.misionMilagro && c.misionMilagro.candidato) {
            surgicalPatients.push({
              patient: p,
              consult: c,
              milagro: c.misionMilagro
            });
          }
        });
      }
    });

    if (filterStatus !== 'all') {
      surgicalPatients = surgicalPatients.filter(item => item.milagro.estadoProtocolo === filterStatus);
    }

    if (surgicalPatients.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:24px; color:var(--text-muted);">No hay pacientes en censo quirúrgico para el filtro seleccionado.</td></tr>`;
      return;
    }

    tbody.innerHTML = surgicalPatients.map(item => {
      const p = item.patient;
      const c = item.consult;
      const m = item.milagro;

      let badgePriorityClass = 'badge-media';
      if (m.prioridad === 'Alta') badgePriorityClass = 'badge-alta';
      if (m.prioridad === 'Baja') badgePriorityClass = 'badge-baja';

      let badgeProtocolClass = 'badge-pendiente';
      if (m.estadoProtocolo === 'Apto para Quirófano') badgeProtocolClass = 'badge-apto';

      return `
        <tr>
          <td><strong style="color:var(--milagro-gold);">${p.tipoDoc}-${Number(p.cedula).toLocaleString('es-VE')}</strong></td>
          <td><strong>${p.nombres} ${p.apellidos}</strong><br><span style="font-size:0.75rem; color:var(--text-muted);">${p.comunidad || 'Comunidad CDI'}</span></td>
          <td><strong>${m.cirugia}</strong><br><span style="font-size:0.75rem; color:var(--accent-cyan);">Ojo: ${m.ojoQuirurgico} | LIO: ${m.biometriaLIO || 'N/A'}</span></td>
          <td><span class="badge-tag ${badgePriorityClass}">${m.prioridad}</span></td>
          <td><span class="badge-tag ${badgeProtocolClass}">${m.estadoProtocolo}</span></td>
          <td>
            <select class="form-control" style="font-size:0.78rem; padding:4px 8px;" onchange="window.CDIApp.changeMilagroStatus('${p.id}', '${c.id}', this.value)">
              <option value="Pendiente por Laboratorio" ${m.estadoProtocolo === 'Pendiente por Laboratorio' ? 'selected' : ''}>Pendiente por Laboratorio</option>
              <option value="Apto para Quirófano" ${m.estadoProtocolo === 'Apto para Quirófano' ? 'selected' : ''}>Apto para Quirófano</option>
              <option value="Programado para Jornada" ${m.estadoProtocolo === 'Programado para Jornada' ? 'selected' : ''}>Programado para Jornada</option>
              <option value="Operado / En Control" ${m.estadoProtocolo === 'Operado / En Control' ? 'selected' : ''}>Operado / En Control</option>
            </select>
          </td>
          <td>
            <button class="btn btn-warning btn-sm" onclick="window.CDIApp.printDocument('milagro', '${p.id}', '${c.id}')" title="Imprimir Hoja de Referencia Quirúrgica Misión Milagro">
              🖨️ Referencia
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function changeMilagroStatus(patientId, consultId, newStatus) {
    const p = pacientes.find(item => item.id === patientId);
    if (!p || !p.consultas) return;
    const c = p.consultas.find(item => item.id === consultId);
    if (!c || !c.misionMilagro) return;

    c.misionMilagro.estadoProtocolo = newStatus;
    savePatients();
    renderMilagroCensus();
  }

  function exportMilagroCSV() {
    let csv = "TipoDoc,Cedula,Nombres,Apellidos,Edad,Telefono,Comunidad,Cirugia,Ojo,Prioridad,LIO,EstadoProtocolo\n";
    pacientes.forEach(p => {
      if (p.consultas) {
        p.consultas.forEach(c => {
          if (c.misionMilagro && c.misionMilagro.candidato) {
            const m = c.misionMilagro;
            csv += `"${p.tipoDoc}","${p.cedula}","${p.nombres}","${p.apellidos}",${p.edad},"${p.telefono}","${p.comunidad}","${m.cirugia}","${m.ojoQuirurgico}","${m.prioridad}","${m.biometriaLIO}","${m.estadoProtocolo}"\n`;
          }
        });
      }
    });

    downloadCSV(csv, `Censo_Mision_Milagro_${config.cdiName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
  }

  // =========================================================================
  // Estadísticas y Morbilidad MPPS (EPI CDI)
  // =========================================================================
  function renderStatistics() {
    let totalConsultas = 0;
    let totalMilagro = 0;
    let totalGlaucoma = 0;
    let totalLentes = 0;

    const diagCounts = {};

    pacientes.forEach(p => {
      if (p.consultas) {
        p.consultas.forEach(c => {
          totalConsultas++;
          if (c.misionMilagro && c.misionMilagro.candidato) totalMilagro++;
          if (c.tonometria && (c.tonometria.od > 21 || c.tonometria.os > 21)) totalGlaucoma++;
          if (c.lentesPrescritos && c.lentesPrescritos.tipo) totalLentes++;

          if (c.diagnosticos) {
            c.diagnosticos.forEach(d => {
              const name = d.nombre.split('(')[0].trim();
              diagCounts[name] = (diagCounts[name] || 0) + 1;
            });
          }
        });
      }
    });

    document.getElementById('stat-total-consultas').textContent = totalConsultas;
    document.getElementById('stat-total-milagro').textContent = totalMilagro;
    document.getElementById('stat-total-glaucoma').textContent = totalGlaucoma;
    document.getElementById('stat-total-lentes').textContent = totalLentes;

    // Renderizar gráfico de barras de morbilidad
    const chartContainer = document.getElementById('morbidity-chart-container');
    if (!chartContainer) return;

    const sortedDiags = Object.entries(diagCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const maxCount = sortedDiags.length > 0 ? sortedDiags[0][1] : 1;

    const colors = ['#06b6d4', '#0284c7', '#10b981', '#fbbf24', '#f43f5e', '#8b5cf6', '#ec4899', '#14b8a6'];

    chartContainer.innerHTML = sortedDiags.map(([name, count], idx) => {
      const pct = Math.round((count / maxCount) * 100);
      const color = colors[idx % colors.length];
      return `
        <div class="chart-bar-row">
          <div class="chart-bar-label" title="${name}">${name}</div>
          <div class="chart-bar-track">
            <div class="chart-bar-fill" style="width: ${pct}%; background: ${color};"></div>
          </div>
          <div class="chart-bar-count">${count}</div>
        </div>
      `;
    }).join('');
  }

  function exportMorbidityCSV() {
    let csv = "Diagnostico,TotalCasos\n";
    const diagCounts = {};

    pacientes.forEach(p => {
      if (p.consultas) {
        p.consultas.forEach(c => {
          if (c.diagnosticos) {
            c.diagnosticos.forEach(d => {
              const name = d.nombre.split('(')[0].trim();
              diagCounts[name] = (diagCounts[name] || 0) + 1;
            });
          }
        });
      }
    });

    Object.entries(diagCounts).forEach(([diag, count]) => {
      csv += `"${diag}",${count}\n`;
    });

    downloadCSV(csv, `Morbilidad_Oftalmologia_MPPS_${new Date().toISOString().slice(0, 10)}.csv`);
  }

  // =========================================================================
  // Impresiones y Documentos Oficiales MPPS / CDI
  // =========================================================================
  function showPrintModal(patient, consult) {
    const modalHtml = `
      <div class="modal-header">
        <h3 style="display:flex; align-items:center; gap:8px;">
          <span>🖨️</span> Opciones de Impresión Oficial CDI
        </h3>
        <button class="btn-close-modal" onclick="window.CDIApp.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <p style="margin-bottom: 16px; color: var(--text-secondary);">
          La consulta de <strong>${patient.nombres} ${patient.apellidos}</strong> ha sido registrada. ¿Qué documento oficial desea imprimir o emitir?
        </p>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
          <button class="btn btn-secondary" style="padding:16px; display:flex; flex-direction:column; align-items:center; gap:8px; text-align:center;" onclick="window.CDIApp.printDocument('historia', '${patient.id}', '${consult.id}')">
            <span style="font-size:1.8rem;">📋</span>
            <strong>Historia Oftalmológica</strong>
            <span style="font-size:0.75rem; color:var(--text-muted);">Formato integral de consulta con examen OD/OS</span>
          </button>

          <button class="btn btn-secondary" style="padding:16px; display:flex; flex-direction:column; align-items:center; gap:8px; text-align:center;" onclick="window.CDIApp.printDocument('recipe', '${patient.id}', '${consult.id}')">
            <span style="font-size:1.8rem;">💊</span>
            <strong>Récipe e Indicaciones</strong>
            <span style="font-size:0.75rem; color:var(--text-muted);">Recetario con medicamentos SUMED y dosis</span>
          </button>

          ${consult.misionMilagro && consult.misionMilagro.candidato ? `
          <button class="btn btn-warning" style="padding:16px; display:flex; flex-direction:column; align-items:center; gap:8px; text-align:center;" onclick="window.CDIApp.printDocument('milagro', '${patient.id}', '${consult.id}')">
            <span style="font-size:1.8rem;">☀️</span>
            <strong>Referencia Misión Milagro</strong>
            <span style="font-size:0.75rem;">Hoja preoperatoria y solicitud de cupo quirúrgico</span>
          </button>
          ` : ''}

          <button class="btn btn-secondary" style="padding:16px; display:flex; flex-direction:column; align-items:center; gap:8px; text-align:center;" onclick="window.CDIApp.printDocument('lentes', '${patient.id}', '${consult.id}')">
            <span style="font-size:1.8rem;">👓</span>
            <strong>Orden de Cristales / Lentes</strong>
            <span style="font-size:0.75rem; color:var(--text-muted);">Fórmula óptica para taller de optometría comunitaria</span>
          </button>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="window.CDIApp.closeModal()">Continuar sin Imprimir</button>
      </div>
    `;

    showGenericModal(modalHtml);
  }

  function printDocument(docType, patientId, consultId) {
    const patient = pacientes.find(p => p.id === patientId);
    if (!patient) return;
    const consult = (patient.consultas || []).find(c => c.id === consultId);
    if (!consult) return;

    const printArea = document.getElementById('print-document-area');
    if (!printArea) return;

    let docHtml = '';

    const headerHtml = `
      <div class="print-official-header">
        <h2>República Bolivariana de Venezuela</h2>
        <h3>Ministerio del Poder Popular para la Salud (MPPS)</h3>
        <p>Fundación Misión Barrio Adentro | Misión Milagro | ${config.asicName || 'ASIC'} | ${config.cdiName || 'CDI'}</p>
        <p style="margin-top:4px; font-weight:bold;">SERVICIO DE OFTALMOLOGÍA Y SALUD OCULAR COMUNITARIA</p>
      </div>
    `;

    const patientInfoHtml = `
      <table class="print-table">
        <tr>
          <th style="width:15%;">PACIENTE:</th>
          <td style="width:45%; font-weight:bold;">${patient.nombres} ${patient.apellidos}</td>
          <th style="width:15%;">CÉDULA:</th>
          <td style="width:25%; font-weight:bold;">${patient.tipoDoc}-${Number(patient.cedula).toLocaleString('es-VE')}</td>
        </tr>
        <tr>
          <th>EDAD / SEXO:</th>
          <td>${patient.edad} años | ${patient.sexo === 'M' ? 'Masculino' : 'Femenino'}</td>
          <th>FECHA:</th>
          <td>${new Date(consult.fecha).toLocaleDateString('es-VE')}</td>
        </tr>
        <tr>
          <th>TELÉFONO:</th>
          <td>${patient.telefono || 'N/A'}</td>
          <th>COMUNIDAD:</th>
          <td>${patient.comunidad || 'No especificada'}</td>
        </tr>
      </table>
    `;

    const signatureHtml = `
      <div class="print-signatures">
        <div class="sig-line">
          <strong>${config.oftalmologo}</strong><br>
          Oftalmólogo / Cirujano Ocular<br>
          ${config.registroMPPS}
        </div>
        <div class="sig-line">
          <strong>Coordinación Médica CDI</strong><br>
          ${config.cdiName}<br>
          Sello Oficial del Centro
        </div>
      </div>
    `;

    if (docType === 'historia') {
      docHtml = `
        <div class="print-page">
          ${headerHtml}
          <div style="text-align:center; font-weight:bold; font-size:12pt; margin:8px 0 14px 0; text-decoration:underline;">HISTORIA CLÍNICA OFTALMOLÓGICA ESPECIALIZADA</div>
          ${patientInfoHtml}

          <div class="print-section-title">1. Motivo de Consulta y Enfermedad Actual</div>
          <p style="font-size:9.5pt; margin:4px 0 8px 0;"><strong>Motivo:</strong> ${consult.motivo}</p>
          <p style="font-size:9.5pt; margin:4px 0 8px 0;"><strong>Enfermedad Actual:</strong> ${consult.enfermedadActual || 'Refiere sintomatología descrita sin otros concomitantes de relevancia.'}</p>

          <div class="print-section-title">2. Examen Físico Oftalmológico (OD / OS)</div>
          <table class="print-table">
            <thead>
              <tr>
                <th>Parámetro Clínico</th>
                <th style="color:#0284c7;">Ojo Derecho (OD)</th>
                <th style="color:#059669;">Ojo Izquierdo (OS)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Agudeza Visual (AV)</strong></td>
                <td>SC: ${consult.agudezaVisual?.od?.sc || '-'} | CC: ${consult.agudezaVisual?.od?.cc || '-'} | PH: ${consult.agudezaVisual?.od?.ph || '-'} | Cerca: ${consult.agudezaVisual?.od?.cerca || '-'}</td>
                <td>SC: ${consult.agudezaVisual?.os?.sc || '-'} | CC: ${consult.agudezaVisual?.os?.cc || '-'} | PH: ${consult.agudezaVisual?.os?.ph || '-'} | Cerca: ${consult.agudezaVisual?.os?.cerca || '-'}</td>
              </tr>
              <tr>
                <td><strong>Refracción Subjetiva</strong></td>
                <td>Esf: ${consult.refraccion?.od?.esfera} / Cil: ${consult.refraccion?.od?.cilindro} x ${consult.refraccion?.od?.eje}° Add: ${consult.refraccion?.od?.adic}</td>
                <td>Esf: ${consult.refraccion?.os?.esfera} / Cil: ${consult.refraccion?.os?.cilindro} x ${consult.refraccion?.os?.eje}° Add: ${consult.refraccion?.os?.adic}</td>
              </tr>
              <tr>
                <td><strong>Tonometría (PIO)</strong></td>
                <td><strong>${consult.tonometria?.od || '-'} mmHg</strong> (${consult.tonometria?.od > 21 ? 'ELEVADA' : 'Normal'})</td>
                <td><strong>${consult.tonometria?.os || '-'} mmHg</strong> (${consult.tonometria?.os > 21 ? 'ELEVADA' : 'Normal'})</td>
              </tr>
              <tr>
                <td><strong>Biomicroscopía (L. Hendidura)</strong></td>
                <td>${consult.biomicroscopia?.od || 'Sin alteraciones'}</td>
                <td>${consult.biomicroscopia?.os || 'Sin alteraciones'}</td>
              </tr>
              <tr>
                <td><strong>Fondo de Ojo</strong></td>
                <td>${consult.fondoOjo?.od || 'Normal'}</td>
                <td>${consult.fondoOjo?.os || 'Normal'}</td>
              </tr>
            </tbody>
          </table>

          <div class="print-section-title">3. Impresión Diagnóstica (CIE-10)</div>
          <ul style="margin-left:20px; font-size:9.5pt;">
            ${(consult.diagnosticos || []).map(d => `<li><strong>${d.cie}</strong>: ${d.nombre}</li>`).join('')}
          </ul>

          <div class="print-section-title">4. Plan Terapéutico y Conducta</div>
          <p style="font-size:9.5pt;">${consult.observaciones || 'Se indica tratamiento médico y control ambulatorio.'}</p>

          ${signatureHtml}
        </div>
      `;
    } else if (docType === 'recipe') {
      docHtml = `
        <div class="print-page">
          ${headerHtml}
          <div style="text-align:center; font-weight:bold; font-size:12pt; margin:8px 0 14px 0; text-decoration:underline;">RÉCIPE MÉDICO E INDICACIONES OFTALMOLÓGICAS</div>
          ${patientInfoHtml}

          <div class="print-section-title">Rp. Prescripción de Medicamentos</div>
          <div style="margin: 16px 0; min-height: 250px;">
            ${(consult.tratamiento || []).map((t, idx) => `
              <div style="margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px dashed #ccc;">
                <div style="font-size:11pt; font-weight:bold;">${idx + 1}. ${t.nombre || t.medicamento}</div>
                <div style="font-size:10pt; margin-left:14px; margin-top:3px;"><strong>Indicación:</strong> ${t.dosis}</div>
              </div>
            `).join('')}
          </div>

          <div class="print-section-title">Recomendaciones y Cuidados Generales</div>
          <p style="font-size:9pt; color:#333; line-height:1.4;">
            - Lavarse bien las manos antes de aplicar cualquier colirio o ungüento oftálmico.<br>
            - Si utiliza dos colirios distintos, espere al menos 10 minutos entre la aplicación de cada uno.<br>
            - Evite frotarse los ojos vigorosamente y proteja sus ojos de la luz solar directa.<br>
            - En caso de dolor intenso, ojo rojo súbito o pérdida brusca de visión, acudir de inmediato al CDI.
          </p>

          ${signatureHtml}
        </div>
      `;
    } else if (docType === 'milagro') {
      const m = consult.misionMilagro || {};
      docHtml = `
        <div class="print-page">
          ${headerHtml}
          <div style="text-align:center; font-weight:bold; font-size:13pt; margin:8px 0 14px 0; color:#b91c1c; text-decoration:underline;">FICHA DE CAPTACIÓN Y REFERENCIA QUIRÚRGICA - MISIÓN MILAGRO</div>
          ${patientInfoHtml}

          <div class="print-section-title">1. Diagnóstico e Intervención Propuesta</div>
          <table class="print-table">
            <tr>
              <th style="width:25%;">INTERVENCIÓN:</th>
              <td style="font-weight:bold; font-size:11pt; color:#0284c7;">${m.cirugia || 'Catarata / Pterigión'}</td>
              <th style="width:15%;">OJO A OPERAR:</th>
              <td style="font-weight:bold; font-size:11pt;">${m.ojoQuirurgico || 'OD'}</td>
            </tr>
            <tr>
              <th>DIAGNÓSTICO:</th>
              <td>${(consult.diagnosticos || []).map(d => d.nombre).join(', ')}</td>
              <th>PRIORIDAD:</th>
              <td><strong style="color:#b91c1c;">${m.prioridad || 'Media'}</strong></td>
            </tr>
            <tr>
              <th>BIOMETRÍA (LIO):</th>
              <td style="font-weight:bold;">${m.biometriaLIO || 'Pendiente'}</td>
              <th>ESTADO:</th>
              <td>${m.estadoProtocolo || 'En preparación'}</td>
            </tr>
          </table>

          <div class="print-section-title">2. Protocolo Preoperatorio Obligatorio</div>
          <table class="print-table">
            <tr>
              <th>Examen Requerido</th>
              <th>Estado / Resultado</th>
              <th>Examen Requerido</th>
              <th>Estado / Resultado</th>
            </tr>
            <tr>
              <td>Hematología Completa</td>
              <td>${m.laboratorio?.hematologia || 'Pendiente'}</td>
              <td>Glicemia en Ayunas</td>
              <td>${m.laboratorio?.glicemia || 'Pendiente'}</td>
            </tr>
            <tr>
              <td>Tiempos Coagulación (TP/TPT)</td>
              <td>${m.laboratorio?.tpTpt || 'Pendiente'}</td>
              <td>Electrocardiograma (EKG)</td>
              <td>${m.laboratorio?.ekg || 'Pendiente'}</td>
            </tr>
            <tr>
              <td>Valoración Cardiovascular</td>
              <td>${m.laboratorio?.riesgoCardiovascular || 'Pendiente'}</td>
              <td>Serología (VIH / VDRL)</td>
              <td>Normal / No Reactivo</td>
            </tr>
          </table>

          <div class="print-section-title">3. Resumen Clínico Oftalmológico</div>
          <p style="font-size:9.5pt; margin:4px 0;">
            <strong>Agudeza Visual:</strong> OD: ${consult.agudezaVisual?.od?.sc || '-'} | OS: ${consult.agudezaVisual?.os?.sc || '-'}<br>
            <strong>Presión Intraocular:</strong> OD: ${consult.tonometria?.od} mmHg | OS: ${consult.tonometria?.os} mmHg<br>
            <strong>Biomicroscopía:</strong> ${consult.biomicroscopia?.od || 'Opacidad de cristalino evidente.'}
          </p>

          ${signatureHtml}
        </div>
      `;
    } else if (docType === 'lentes') {
      docHtml = `
        <div class="print-page">
          ${headerHtml}
          <div style="text-align:center; font-weight:bold; font-size:12pt; margin:8px 0 14px 0; text-decoration:underline;">ORDEN DE PRESCRIPCIÓN ÓPTICA - PROGRAMA COMUNITARIO DE LENTES</div>
          ${patientInfoHtml}

          <div class="print-section-title">Fórmula Óptica de Refracción (Rx)</div>
          <table class="print-table" style="text-align:center;">
            <thead>
              <tr>
                <th>Ojo</th>
                <th>Esfera (Esf)</th>
                <th>Cilindro (Cil)</th>
                <th>Eje (°)</th>
                <th>Adición (Add)</th>
                <th>D.P. (mm)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-weight:bold; color:#0284c7;">Ojo Derecho (OD)</td>
                <td>${consult.refraccion?.od?.esfera || '0.00'}</td>
                <td>${consult.refraccion?.od?.cilindro || '0.00'}</td>
                <td>${consult.refraccion?.od?.eje || '0'}°</td>
                <td>${consult.refraccion?.od?.adic || '0.00'}</td>
                <td rowspan="2" style="vertical-align:middle; font-weight:bold;">${consult.refraccion?.dp || '62'} mm</td>
              </tr>
              <tr>
                <td style="font-weight:bold; color:#059669;">Ojo Izquierdo (OS)</td>
                <td>${consult.refraccion?.os?.esfera || '0.00'}</td>
                <td>${consult.refraccion?.os?.cilindro || '0.00'}</td>
                <td>${consult.refraccion?.os?.eje || '0'}°</td>
                <td>${consult.refraccion?.os?.adic || '0.00'}</td>
              </tr>
            </tbody>
          </table>

          <div class="print-section-title">Especificaciones del Lente y Montura</div>
          <p style="font-size:10pt; margin:6px 0;"><strong>Tipo de Cristal Sugerido:</strong> ${consult.lentesPrescritos?.tipo || 'Monofocal'}</p>
          <p style="font-size:10pt; margin:6px 0;"><strong>Observaciones del Optometrista/Oftalmólogo:</strong> ${consult.lentesPrescritos?.observaciones || 'Montura para convenio social.'}</p>

          ${signatureHtml}
        </div>
      `;
    }

    printArea.innerHTML = docHtml;
    closeModal();
    window.print();
  }

  // =========================================================================
  // Configuración del CDI y Respaldos
  // =========================================================================
  function loadConfigForm() {
    document.getElementById('cfg-cdi-name').value = config.cdiName || '';
    document.getElementById('cfg-asic-name').value = config.asicName || '';
    document.getElementById('cfg-estado').value = config.estado || '';
    document.getElementById('cfg-municipio').value = config.municipio || '';
    document.getElementById('cfg-parroquia').value = config.parroquia || '';
    document.getElementById('cfg-oftalmologo').value = config.oftalmologo || '';
    document.getElementById('cfg-mpps-reg').value = config.registroMPPS || '';
  }

  function saveConfigFromForm() {
    config.cdiName = document.getElementById('cfg-cdi-name').value.trim();
    config.asicName = document.getElementById('cfg-asic-name').value.trim();
    config.estado = document.getElementById('cfg-estado').value.trim();
    config.municipio = document.getElementById('cfg-municipio').value.trim();
    config.parroquia = document.getElementById('cfg-parroquia').value.trim();
    config.oftalmologo = document.getElementById('cfg-oftalmologo').value.trim();
    config.registroMPPS = document.getElementById('cfg-mpps-reg').value.trim();

    saveConfig();
    alert('Configuración institucional del CDI actualizada correctamente.');
  }

  function exportBackupJSON() {
    const backupData = {
      version: "1.0",
      fechaExport: new Date().toISOString(),
      config: config,
      pacientes: pacientes
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Respaldo_Oftalmologia_${config.cdiName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  function importBackupJSON(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported.pacientes && Array.isArray(imported.pacientes)) {
          pacientes = imported.pacientes;
          savePatients();
        }
        if (imported.config) {
          config = imported.config;
          saveConfig();
        }
        alert('¡Respaldo importado exitosamente!');
        switchTab('pacientes');
      } catch (err) {
        alert('Error al leer el archivo JSON de respaldo. Verifique que sea válido.');
      }
    };
    reader.readAsText(file);
  }

  function resetToDemoSeed() {
    if (confirm('¿Está seguro de restaurar los datos iniciales de demostración? Se reestablecerán los pacientes de prueba.')) {
      pacientes = [...SEED_PACIENTES];
      config = { ...SEED_CONFIG };
      savePatients();
      saveConfig();
      alert('Datos de prueba recargados con éxito.');
      switchTab('pacientes');
    }
  }

  // =========================================================================
  // Modales y Utilidades
  // =========================================================================
  function showGenericModal(innerHtml) {
    const modal = document.getElementById('app-modal');
    const content = document.getElementById('app-modal-content');
    if (!modal || !content) return;

    content.innerHTML = innerHtml;
    modal.classList.add('active');
  }

  function closeModal() {
    const modal = document.getElementById('app-modal');
    if (modal) modal.classList.remove('active');
  }

  function openSnellenChartModal() {
    const html = `
      <div class="modal-header">
        <h3 style="display:flex; align-items:center; gap:8px;">
          <span>👁️</span> Cartilla Optométrica de Snellen Digital
        </h3>
        <button class="btn-close-modal" onclick="window.CDIApp.closeModal()">✕</button>
      </div>
      <div class="modal-body" style="background:#000; padding:20px;">
        <div style="text-align:center; color:#94a3b8; font-size:0.8rem; margin-bottom:12px;">
          Cartilla calibrada para toma rápida de agudeza visual en consultorio CDI (distancia referencial 3m o 6m)
        </div>
        <div class="snellen-chart-box">
          <div class="snellen-line" style="font-size: 5rem; letter-spacing: 0;">
            <span class="snellen-letters">E</span>
            <span class="snellen-fraction">20/200</span>
          </div>
          <div class="snellen-line" style="font-size: 3.4rem;">
            <span class="snellen-letters">F P</span>
            <span class="snellen-fraction">20/100</span>
          </div>
          <div class="snellen-line" style="font-size: 2.5rem;">
            <span class="snellen-letters">T O Z</span>
            <span class="snellen-fraction">20/70</span>
          </div>
          <div class="snellen-line" style="font-size: 1.9rem;">
            <span class="snellen-letters">L P E D</span>
            <span class="snellen-fraction">20/50</span>
          </div>
          <div class="snellen-line" style="font-size: 1.5rem;">
            <span class="snellen-letters">P E C F D</span>
            <span class="snellen-fraction">20/40</span>
          </div>
          <div class="snellen-line" style="font-size: 1.2rem;">
            <span class="snellen-letters">E D F C Z P</span>
            <span class="snellen-fraction">20/30</span>
          </div>
          <div class="snellen-line" style="font-size: 1.0rem; color:#166534;">
            <span class="snellen-letters">F E L O P Z D</span>
            <span class="snellen-fraction">20/25</span>
          </div>
          <div class="snellen-line" style="font-size: 0.85rem; color:#b91c1c;">
            <span class="snellen-letters">D E F P O T E C</span>
            <span class="snellen-fraction">20/20</span>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="window.CDIApp.closeModal()">Cerrar Cartilla</button>
      </div>
    `;
    showGenericModal(html);
  }

  function downloadCSV(csvContent, filename) {
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // =========================================================================
  // Inicialización del Sistema al Cargar DOM
  // =========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    initStorage();
    renderConfigHeader();
    updateBadges();
    initTabs();
    initOphthalmicControls();

    // Eventos de botones
    document.getElementById('btn-toggle-theme')?.addEventListener('click', toggleTheme);
    document.getElementById('btn-search-patient')?.addEventListener('click', searchPatientByCedula);
    document.getElementById('btn-clear-patient')?.addEventListener('click', clearPatientForm);
    document.getElementById('btn-save-consult')?.addEventListener('click', saveConsultation);
    document.getElementById('btn-new-consult-clear')?.addEventListener('click', clearConsultForm);
    document.getElementById('btn-add-rx-item')?.addEventListener('click', addPrescriptionItem);
    document.getElementById('btn-open-snellen')?.addEventListener('click', openSnellenChartModal);
    
    // Búsqueda en tabla de pacientes
    document.getElementById('search-patients-input')?.addEventListener('input', renderPatientsTable);
    document.getElementById('milagro-filter-status')?.addEventListener('change', renderMilagroCensus);
    document.getElementById('btn-export-milagro-csv')?.addEventListener('click', exportMilagroCSV);
    document.getElementById('btn-export-morbidity-csv')?.addEventListener('click', exportMorbidityCSV);

    // Configuración
    document.getElementById('btn-save-config')?.addEventListener('click', saveConfigFromForm);
    document.getElementById('btn-export-backup')?.addEventListener('click', exportBackupJSON);
    document.getElementById('file-import-backup')?.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        importBackupJSON(e.target.files[0]);
      }
    });
    document.getElementById('btn-reset-demo')?.addEventListener('click', resetToDemoSeed);

    // Enter en input de cédula para buscar
    document.getElementById('patient-cedula')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        searchPatientByCedula();
      }
    });

    // Cerrar modal al clickear backdrop
    document.getElementById('app-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'app-modal') closeModal();
    });
  });

  // Exponer API a ventana para callbacks onclick en HTML
  window.CDIApp = {
    loadPastConsult,
    openPatientHistory,
    newConsultForPatient,
    changeMilagroStatus,
    printDocument,
    closeModal,
    removeDiagnosis,
    removeRxItem
  };

})();
