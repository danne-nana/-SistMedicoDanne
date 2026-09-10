document.addEventListener('DOMContentLoaded', () => {

    function limpiarCitasExpiradas() {
        let citas = JSON.parse(localStorage.getItem('citas_medicas')) || [];
        const ahora = new Date();

        const citasVigentes = citas.filter(c => {
            if (!c.fecha) return false;
            const fechaCita = new Date(c.fecha);
            return fechaCita > ahora;
        });

        if (citasVigentes.length !== citas.length) {
            localStorage.setItem('citas_medicas', JSON.stringify(citasVigentes));
        }
    }

    limpiarCitasExpiradas();
    setInterval(limpiarCitasExpiradas, 60000);

    const medicosPorDefecto = [
        { id: 1, nombre: 'Dr. Roberto Gómez', especialidad: 'Cardiología', dias: 'Lunes a Viernes', horario: '08:00 AM - 01:00 PM', estado: 'Disponible' },
        { id: 2, nombre: 'Dra. Elena Ramos', especialidad: 'Pediatría', dias: 'Lunes a Jueves', horario: '09:00 AM - 04:00 PM', estado: 'Disponible' },
        { id: 3, nombre: 'Dr. Carlos Alvarado', especialidad: 'Medicina General', dias: 'Viernes a Domingo', horario: '10:00 AM - 06:00 PM', estado: 'Ocupado' }
    ];

    if (!localStorage.getItem('horarios_medicos')) {
        localStorage.setItem('horarios_medicos', JSON.stringify(medicosPorDefecto));
    }

    const citasPorDefecto = [
        { paciente: 'Juan Pérez', especialidad: 'Cardiología', medico: 'Dr. Roberto Gómez', fecha: '2026-12-28T09:00', estado: 'Pendiente' },
        { paciente: 'María López', especialidad: 'Pediatría', medico: 'Dra. Elena Ramos', fecha: '2026-12-29T11:00', estado: 'Confirmada' }
    ];

    if (!localStorage.getItem('citas_medicas')) {
        localStorage.setItem('citas_medicas', JSON.stringify(citasPorDefecto));
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = document.getElementById('usuario').value.trim().toLowerCase();
            const pass = document.getElementById('password').value.trim();
            const alertBox = document.getElementById('alertBox');

            if (user === 'admin' && pass === '1234') {
                window.location.href = 'dashboard.html';
            } else if (user === 'maria' && pass === '5678') {
                localStorage.setItem('usuario_actual', JSON.stringify({ nombre: 'Dra. María Pérez', especialidad: 'Ginecología' }));
                window.location.href = 'medico_panel.html';
            } else {
                if (alertBox) {
                    alertBox.classList.remove('d-none');
                    alertBox.textContent = 'Usuario o contraseña incorrectos.';
                }
            }
        });
    }

    const citaForm = document.getElementById('citaForm');
    const tablaCitas = document.getElementById('tablaCitas');

    function renderTablaCitas() {
        if (!tablaCitas) return;
        
        limpiarCitasExpiradas();
        
        const citas = JSON.parse(localStorage.getItem('citas_medicas')) || [];
        tablaCitas.innerHTML = '';

        citas.forEach((c, index) => {
            const row = document.createElement('tr');
            const estadoBadge = c.estado === 'Confirmada' 
                ? '<span class="badge bg-success">Confirmada</span>' 
                : '<span class="badge bg-warning text-dark">Pendiente</span>';

            row.innerHTML = `
                <td class="fw-semibold">${c.paciente}</td>
                <td><span class="badge bg-info text-dark">${c.especialidad}</span></td>
                <td>${c.medico}</td>
                <td>${c.fecha ? c.fecha.replace('T', ' ') : ''}</td>
                <td>${estadoBadge}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="eliminarCita(${index})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            tablaCitas.appendChild(row);
        });
    }

    if (citaForm) {
        citaForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const paciente = document.getElementById('paciente').value.trim();
            const especialidad = document.getElementById('especialidad').value;
            const medico = document.getElementById('medico').value.trim();
            const fecha = document.getElementById('fecha').value;
            const estadoInput = document.getElementById('estado');
            const estado = estadoInput ? estadoInput.value : 'Pendiente';

            const nuevaCita = { paciente, especialidad, medico, fecha, estado };

            const citas = JSON.parse(localStorage.getItem('citas_medicas')) || [];
            citas.push(nuevaCita);
            localStorage.setItem('citas_medicas', JSON.stringify(citas));

            renderTablaCitas();
            citaForm.reset();
        });
    }

    window.eliminarCita = (index) => {
        let citas = JSON.parse(localStorage.getItem('citas_medicas')) || [];
        citas.splice(index, 1);
        localStorage.setItem('citas_medicas', JSON.stringify(citas));
        renderTablaCitas();
    };

    renderTablaCitas();

    const tablaResumen = document.getElementById('tablaResumen');
    if (tablaResumen) {
        limpiarCitasExpiradas();
        const citas = JSON.parse(localStorage.getItem('citas_medicas')) || [];
        tablaResumen.innerHTML = '';

        citas.forEach((c) => {
            const row = document.createElement('tr');
            const estadoBadge = c.estado === 'Confirmada' 
                ? '<span class="badge bg-success">Confirmada</span>' 
                : '<span class="badge bg-warning text-dark">Pendiente</span>';

            row.innerHTML = `
                <td class="fw-semibold">${c.paciente}</td>
                <td>${c.medico}</td>
                <td><span class="badge" style="background-color: #8b5cf6;">${c.especialidad}</span></td>
                <td>${c.fecha ? c.fecha.replace('T', ' ') : ''}</td>
                <td>${estadoBadge}</td>
            `;
            tablaResumen.appendChild(row);
        });

        if (document.getElementById('totalPacientes')) document.getElementById('totalPacientes').textContent = citas.length;
        if (document.getElementById('totalCitas')) document.getElementById('totalCitas').textContent = citas.length;
    }

    function renderizarHorarios() {
        const contenedor = document.getElementById('contenedorHorarios');
        if (!contenedor) return;

        const listaMedicos = JSON.parse(localStorage.getItem('horarios_medicos')) || [];
        contenedor.innerHTML = '';

        listaMedicos.forEach(med => {
            const badgeClase = med.estado === 'Disponible' ? 'bg-success' : 'bg-danger';

            const col = document.createElement('div');
            col.className = 'col-md-4 mb-4';
            col.innerHTML = `
                <div class="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
                    <div class="d-flex align-items-center mb-2">
                        <i class="fa-solid fa-user-doctor text-primary fa-xl me-2"></i>
                        <h5 class="fw-bold text-primary mb-0">${med.nombre}</h5>
                    </div>
                    <p class="text-muted mb-2 fw-semibold">${med.especialidad}</p>
                    <p class="mb-1 text-dark"><strong>Días:</strong> ${med.dias}</p>
                    <p class="mb-3 text-dark"><strong>Horario:</strong> ${med.horario}</p>
                    <div>
                        <span class="badge ${badgeClase} px-3 py-2 rounded-3">${med.estado}</span>
                    </div>
                </div>
            `;
            contenedor.appendChild(col);
        });
    }

    renderizarHorarios();

    const formHorarioMedico = document.getElementById('formHorarioMedico');
    if (formHorarioMedico) {
        formHorarioMedico.addEventListener('submit', (e) => {
            e.preventDefault();

            const dias = document.getElementById('diasTrabajo').value;
            const horaInicio = document.getElementById('horaInicio').value;
            const horaFin = document.getElementById('horaFin').value;
            const estado = document.getElementById('estadoMedico').value;

            const medicoSesion = JSON.parse(localStorage.getItem('usuario_actual')) || { nombre: 'Dra. María Pérez', especialidad: 'Ginecología' };
            let lista = JSON.parse(localStorage.getItem('horarios_medicos')) || medicosPorDefecto;

            const index = lista.findIndex(m => m.nombre === medicoSesion.nombre);
            const nuevoRegistro = {
                id: index !== -1 ? lista[index].id : Date.now(),
                nombre: medicoSesion.nombre,
                especialidad: medicoSesion.especialidad,
                dias: dias,
                horario: `${horaInicio} - ${horaFin}`,
                estado: estado
            };

            if (index !== -1) {
                lista[index] = nuevoRegistro;
            } else {
                lista.push(nuevoRegistro);
            }

            localStorage.setItem('horarios_medicos', JSON.stringify(lista));

            const msj = document.getElementById('msjExito');
            if (msj) {
                msj.classList.remove('d-none');
                setTimeout(() => msj.classList.add('d-none'), 3000);
            }
        });
    }
});
