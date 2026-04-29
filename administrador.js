

let datos = JSON.parse(
    localStorage.getItem("datos")
) || [];
let filtrados = [];

console.log("1 - inicio archivo");


// ===== EVENTOS =====

document.getElementById("excelFile").addEventListener("change", leerExcel);
document.getElementById("btnFiltrar").addEventListener("click", filtrar);
document.getElementById("btnGuardar").addEventListener("click", guardarTurno);
document.getElementById("btnResumen").addEventListener("click", resumenZonas);

//  RESET CORREGIDO
document.getElementById("btnReset").addEventListener("click", () => {

    // Reset inputs
    document.getElementById("minpesos").value = 10000;
    document.getElementById("mindolares").value = 50;

    // Volver al estado original (SIN FILTROS)
    filtrados = [...datos];

    // Re-render completo
    renderTabla(filtrados);
    actualizarPanel(filtrados);
    calcularResumenImportes(filtrados);
});


// ===== LEER EXCEL =====



function leerExcel(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (evt) {
        console.log(" ONLOAD ejecutado");

        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const hoja = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(hoja);

        console.log(" Excel convertido:", json);

        datos = json.map(d => ({
            maquina: d.Máquina,
            location: d.Location,
            importe: d.Importe,
            zona: d.Zona,
            moneda: d.Moneda
        }));

        console.log(" Antes de guardar");
        localStorage.setItem("datos", JSON.stringify(datos));
        console.log(" Guardado OK");

        // ===== RECUPERAR TURNO (AHORA SÍ BIEN UBICADO) =====

        const turnoGuardado = JSON.parse(localStorage.getItem("turno")) || [];

        datos.forEach(d => {
            const encontrada = turnoGuardado.find(t => t.maquina === d.maquina);
            if (encontrada) {
                d.extraida = encontrada.extraida;
            }
        });

        filtrados = [...datos];

        renderTabla(filtrados);
        actualizarPanel(filtrados);
        calcularResumenImportes(filtrados);

        console.log(" Verificación:", localStorage.getItem("datos"));

        alert("Excel cargado correctamente");
    };

    reader.readAsArrayBuffer(file);
}



// ===== RENDER TABLA =====


function renderTabla(lista) {
    const tbody = document.querySelector("#tabla tbody");
    tbody.innerHTML = "";

    lista.forEach(item => {
        const tr = document.createElement("tr");

        if (item.extraida) {
            tr.style.background = "#c8f7c5";
        }



        let moneda = (item.moneda || "").toLowerCase();

        let importeFormateado = item.importe;

        if (moneda.includes("peso") || moneda.includes("ars")) {
            importeFormateado = formatoPesos(item.importe);
        } else if (moneda.includes("dolar") || moneda.includes("usd")) {
            importeFormateado = formatoDolares(item.importe);
        }

        tr.innerHTML = `
            <td>${item.maquina}</td>
            <td>${item.location}</td>
            <td>${importeFormateado}</td>
            <td>${item.zona}</td>
            <td>${(item.moneda || "").toUpperCase()}</td>
        `;

        tbody.appendChild(tr);
    });
}

// ===== FILTRO =====

function filtrar() {
    const minPesos = Number(document.getElementById("minpesos").value) || 0;
    const minDolares = Number(document.getElementById("mindolares").value) || 0;

    filtrados = datos.filter(d => {
        const moneda = (d.moneda || "").toLowerCase();

        if (moneda.includes("peso") || moneda.includes("ars")) {
            return d.importe >= minPesos;
        }

        if (moneda.includes("dolar") || moneda.includes("usd")) {
            return d.importe >= minDolares;
        }

        return false;
    });

    renderTabla(filtrados);
    actualizarPanel(filtrados);
    calcularResumenImportes(filtrados);
}

// ===== GUARDAR TURNO =====

function guardarTurno() {
    localStorage.setItem("turno", JSON.stringify(filtrados));
    alert("Turno guardado correctamente");
}

// ===== RESUMEN POR ZONA =====

function resumenZonas() {
    const turno = JSON.parse(localStorage.getItem("turno")) || [];

    const resumen = {};
    turno.forEach(m => {
        if (!resumen[m.zona]) {
            resumen[m.zona] = { total: 0, hechas: 0 };
        }
        resumen[m.zona].total++;
        if (m.extraida) resumen[m.zona].hechas++;
    });

    renderResumen(resumen);
}

function renderResumen(resumen) {
    const cont = document.getElementById("resumenZonas");
    cont.innerHTML = "";

    Object.keys(resumen).forEach(zona => {
        const data = resumen[zona];
        const faltan = data.total - data.hechas;

        const div = document.createElement("div");
        div.style.border = faltan === 0 ? "2px solid green" : "2px solid red";

        div.innerHTML = `
            <h3>${zona}</h3>
            <p>Total: ${data.total}</p>
            <p>Hechas: ${data.hechas}</p>
            <p>Faltan: ${faltan}</p>
        `;

        cont.appendChild(div);
    });
}

// ===== RESUMEN IMPORTES =====

function calcularResumenImportes(lista) {
    let totalPesos = 0;
    let totalUSD = 0;

    lista.forEach(item => {
        const moneda = item.moneda || "";

        if (moneda.includes("peso") || moneda.includes("ars")) {
            totalPesos += item.importe;
        } else if (moneda.includes("dolar") || moneda.includes("usd")) {
            totalUSD += item.importe;
        }
    });

    renderResumenImportes({ totalPesos, totalUSD });
}

function renderResumenImportes(data) {
    document.getElementById('totalPesos').textContent = formatoPesos(data.totalPesos);
    document.getElementById('totalUSD').textContent = formatoDolares(data.totalUSD);
}

// ===== PANEL GENERAL =====

function actualizarPanel(lista) {
    let hechas = 0;
    lista.forEach(m => { if (m.extraida) hechas++; });

    const total = lista.length;
    const faltan = total - hechas;

    document.getElementById("totalMaquinas").textContent = total;
    document.getElementById("hechas").textContent = hechas;
    document.getElementById("faltan").textContent = faltan;
}

// ===== FORMATO =====

function formatoPesos(valor) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valor);
}

function formatoDolares(valor) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        currencyDisplay: 'code',
        minimumFractionDigits: 2
    }).format(valor);
}

function exportarJSON() {

    const dataStr = JSON.stringify(datos, null, 2);

    const blob = new Blob(
        [dataStr],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "datos.json";
    a.click();

    URL.revokeObjectURL(url);
}