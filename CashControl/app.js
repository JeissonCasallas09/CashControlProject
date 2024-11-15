// ENTIDADES

class Presupuesto {
    constructor(nombre, cantidad, fecha) {
        this.nombre = nombre;
        this.cantidad = cantidad;
        this.fecha = fecha;
    }
}

class Gasto {
    constructor(monto, tipo, descripcion, fecha) {
        this.monto = monto;
        this.tipo = tipo;
        this.descripcion = descripcion;
        this.fecha = fecha;
    }
}

class Objetivo {
    constructor(montoAhorrar, montoAhorrado, descripcion, fechaLimite) {
        this.montoAhorrar = montoAhorrar;
        this.montoAhorrado = montoAhorrado;
        this.descripcion = descripcion;
        this.fechaLimite = fechaLimite;
    }
}

//MODELO

class Model {
    constructor() {
        this.presupuestos = [];
        this.gastos = [];
        this.objetivos = [];
    }

    addPresupuesto(presupuesto) {
        this.presupuestos.push(presupuesto);
    }

    addGasto(gasto) {
        this.gastos.push(gasto);
    }

    addObjetivo(objetivo) {
        this.objetivos.push(objetivo);
    }

    deleteGasto(index) {
        this.gastos.splice(index, 1);
    }

    deleteObjetivo(index) {
        this.objetivos.splice(index, 1);
    }

    updateObjetivo(index, abono, descripcion, fechaLimite) {
        const objetivo = this.objetivos[index];
        if (abono > 0) {
            objetivo.montoAhorrado += abono;
            if (descripcion) objetivo.descripcion = descripcion;
            if (fechaLimite) objetivo.fechaLimite = fechaLimite;
        }
    }

    getTotalIngresos() {
        return this.presupuestos.reduce((sum, presupuesto) => sum + presupuesto.cantidad, 0);
    }

    getTotalGastos() {
        return this.gastos.reduce((sum, gasto) => sum + gasto.monto, 0);
    }

    getTotalAhorrado() {
        return this.objetivos.reduce((sum, objetivo) => sum + objetivo.montoAhorrado, 0);
    }

    getSaldo() {
        return this.getTotalIngresos() - this.getTotalGastos() - this.getTotalAhorrado();
    }
}


//VISTA
class View {
    constructor() {
        this.$listaHistorialPresupuestos = $('#listaHistorialPresupuestos');
        this.$listaGastos = $('#listaGastos');
        this.$listaObjetivos = $('#listaObjetivos');
        this.$currentBalance = $('#currentBalance');
        this.$balanceOutput = $('#balanceOutput');
        this.$editar = $('#editar');
        this.$cancelarEdicion = $('#cancelarEdicion');
        this.$historialPresupuestos = $('#historialPresupuestos');
    }

    updateHistorialPresupuestos(presupuestos) {
        this.$listaHistorialPresupuestos.empty();
        presupuestos.forEach(presupuesto => {
            this.$listaHistorialPresupuestos.append(`<li>- Descripción de ingreso: ${presupuesto.nombre}: - Cantidad: ${presupuesto.cantidad.toFixed(2)} - Fecha: ${presupuesto.fecha}</li>`);
        });
    }

    showHistorial() {
        this.$historialPresupuestos.show();
    }

    hideHistorial() {
        this.$historialPresupuestos.hide();
    }

    toggleHistorial() {
        this.$historialPresupuestos.toggle();
    }

    updateGastos(gastos) {
        this.$listaGastos.empty();
        gastos.forEach((gasto, index) => {
            this.$listaGastos.append(`
                <li>
                    <span>${gasto.tipo}: $${gasto.monto.toFixed(2)} - Descripción: ${gasto.descripcion} - Fecha: ${gasto.fecha}</span>
                    <button class="modificarGasto" data-index="${index}">Modificar Gasto</button>
                    <button class="eliminarGasto" data-index="${index}">Eliminar</button>
                </li>
            `);
        });
    }

    updateObjetivos(objetivos) {
        this.$listaObjetivos.empty();
        objetivos.forEach((objetivo, index) => {
            this.$listaObjetivos.append(`
                <li>
                    <span>Objetivo: ${objetivo.descripcion} - Monto a Ahorrar: $${objetivo.montoAhorrar.toFixed(2)} - Monto Ahorrado: $${objetivo.montoAhorrado.toFixed(2)} - Fecha Límite: ${objetivo.fechaLimite}</span>
                    <button class="realizarAbono" data-index="${index}">Realizar abono</button>
                    <button class="eliminarObjetivo" data-index="${index}">Eliminar</button>
                </li>
            `);
        });
    }

    updateSaldo(saldo) {
        this.$currentBalance.text(`$${saldo.toFixed(2)}`);
    }

    updateBalance(totalPresupuestos, totalGastos, totalAhorrado) {
        this.$balanceOutput.html(`
            <p>Saldo Libre: $${(totalPresupuestos - totalGastos - totalAhorrado).toFixed(2)}</p>
            <p>Total Gastado: $${totalGastos.toFixed(2)}</p>
            <p>Total Ahorrado: $${totalAhorrado.toFixed(2)}</p>
        `);
    }

    showEditForm() {
        this.$editar.show();
    }

    hideEditForm() {
        this.$editar.hide();
    }
}


//CONTROLADORES

$(document).ready(function() {
    const model = new Model();
    const view = new View();

    function updateUI() {
        view.updateHistorialPresupuestos(model.presupuestos);
        view.updateGastos(model.gastos);
        view.updateObjetivos(model.objetivos);
        view.updateSaldo(model.getSaldo());
        view.updateBalance(model.getTotalIngresos(), model.getTotalGastos(), model.getTotalAhorrado());
    }

    function isPositiveNumber(value) {
        return !isNaN(value) && value > 0;
    }

    $('#agregarPresupuesto').on('click', function() {
        const nombre = $('#presupuestoNombre').val().trim();
        const cantidad = parseFloat($('#presupuestoCantidad').val());
        const fecha = $('#presupuestoFecha').val();

        if (nombre && isPositiveNumber(cantidad) && fecha) {
            const presupuesto = new Presupuesto(nombre, cantidad, fecha);
            model.addPresupuesto(presupuesto);
            $('#presupuestoNombre').val('');
            $('#presupuestoCantidad').val('');
            $('#presupuestoFecha').val('');
            updateUI();
        } else {
            alert('Por favor, ingrese un nombre, una cantidad positiva y una fecha.');
        }
    });

    $('#agregarGasto').on('click', function() {
        const monto = parseFloat($('#gastoMonto').val());
        const tipo = $('#gastoTipo').val();
        const descripcion = $('#gastoDescripcion').val().trim();
        const fecha = $('#gastoFecha').val();

        if (isPositiveNumber(monto) && tipo && descripcion && fecha) {
            if (model.getSaldo() >= monto) {
                const gasto = new Gasto(monto, tipo, descripcion, fecha);
                model.addGasto(gasto);
                $('#gastoMonto').val('');
                $('#gastoTipo').val('');
                $('#gastoDescripcion').val('');
                $('#gastoFecha').val('');
                updateUI();
            } else {
                alert('No hay suficiente saldo para agregar este gasto.');
            }
        } else {
            alert('Por favor, ingrese un monto positivo, tipo, descripción y fecha.');
        }
    });

    $('#agregarObjetivo').on('click', function() {
        const montoAhorrar = parseFloat($('#objetivoMonto').val());
        const montoAhorrado = parseFloat($('#objetivoAhorrado').val());
        const descripcion = $('#objetivoDescripcion').val().trim();
        const fechaLimite = $('#objetivoFechaLimite').val();

        if (isPositiveNumber(montoAhorrar) && isPositiveNumber(montoAhorrado) && descripcion && fechaLimite) {
            if (montoAhorrado > montoAhorrar) {
                alert('El monto ahorrado no puede ser mayor que el monto a ahorrar.');
            } else if (model.getSaldo() >= montoAhorrar) {
                const objetivo = new Objetivo(montoAhorrar, montoAhorrado, descripcion, fechaLimite);
                model.addObjetivo(objetivo);
                $('#objetivoMonto').val('');
                $('#objetivoAhorrado').val('');
                $('#objetivoDescripcion').val('');
                $('#objetivoFechaLimite').val('');
                updateUI();
                if (montoAhorrado === montoAhorrar) {
                    alert('¡Ya has cumplido tu meta!');
                }
            } else {
                alert('No hay suficiente saldo para agregar este objetivo.');
            }
        } else {
            alert('Por favor, ingrese un monto positivo a ahorrar, un monto positivo ya ahorrado, una descripción y una fecha límite.');
        }
    });

    $('#generarBalance').on('click', function() {
        const totalIngresos = model.getTotalIngresos().toFixed(2);
        const totalGastos = model.getTotalGastos().toFixed(2);
        const saldoDisponible = model.getSaldo().toFixed(2);
        const totalAhorrado = model.getTotalAhorrado().toFixed(2);

        $('#modalTotalIngresos').text(`Total Ingresado: $${totalIngresos}`);
        $('#modalSaldoDisponible').text(`Saldo Disponible: $${saldoDisponible}`);
        $('#modalTotalGastos').text(`Total Gastos: $${totalGastos}`);
        $('#modalTotalAhorrado').text(`Total Ahorrado: $${totalAhorrado}`);

        $('#modalBalance').show();
    });

    $('.close').on('click', function() {
        $('#modalBalance').hide();
    });

    $(window).on('click', function(event) {
        if ($(event.target).is('#modalBalance')) {
            $('#modalBalance').hide();
        }
    });

    $('#historialPresupuesto').on('click', function() {
        view.toggleHistorial();
    });

    view.$listaGastos.on('click', '.eliminarGasto', function() {
        const index = $(this).data('index');
        const gasto = model.gastos[index];

        
        const userChoice = confirm(`¿Quieres eliminar este gasto de $${gasto.monto.toFixed(2)}? Elige "Aceptar" para devolver el dinero al saldo o "Cancelar" para no realizar cambios.`);
        if (userChoice) {
            if (confirm("¿Confirmas que quieres devolver el monto al saldo?")) {
                model.deleteGasto(index);
                updateUI();
            } else {
                
                model.deleteGasto(index);
                updateUI();
            }
        }
    });

    view.$listaObjetivos.on('click', '.eliminarObjetivo', function() {
        const index = $(this).data('index');
        const objetivo = model.objetivos[index];

        
        const userChoice = confirm(`¿Quieres eliminar este objetivo de $${objetivo.montoAhorrar.toFixed(2)}? Elige "Aceptar" para devolver el dinero al saldo o "Cancelar" para no realizar cambios.`);
        if (userChoice) {
            if (confirm("¿Confirmas que quieres devolver el monto al saldo?")) {
                
                const montoAhorrado = objetivo.montoAhorrado;
                model.deleteObjetivo(index);
                updateUI();
            } else {
                
                model.deleteObjetivo(index);
                updateUI();
            }
        }
    });

    view.$listaGastos.on('click', '.modificarGasto', function() {
        const index = $(this).data('index');
        const gasto = model.gastos[index];

        $('#editarMonto').val(gasto.monto);
        $('#editarTipo').val(gasto.tipo);
        $('#editarDescripcion').val(gasto.descripcion);
        $('#editarFecha').val(gasto.fecha);

        view.showEditForm();

        
        $('#guardarCambios').off('click').on('click', function() {
            const nuevoMonto = parseFloat($('#editarMonto').val());
            const nuevoTipo = $('#editarTipo').val();
            const nuevaDescripcion = $('#editarDescripcion').val().trim();
            const nuevaFecha = $('#editarFecha').val();

            if (isPositiveNumber(nuevoMonto) && nuevoTipo && nuevaDescripcion && nuevaFecha) {
                if (model.getSaldo() + model.gastos[index].monto >= nuevoMonto) {
                    const nuevoGasto = new Gasto(nuevoMonto, nuevoTipo, nuevaDescripcion, nuevaFecha);
                    model.gastos[index] = nuevoGasto;
                    view.hideEditForm();
                    updateUI();
                } else {
                    alert('No hay suficiente saldo para realizar este gasto.');
                }
            } else {
                alert('Por favor, ingrese un monto positivo, tipo, descripción y fecha válidos.');
            }
        });
    });

    view.$listaObjetivos.on('click', '.realizarAbono', function() {
        const index = $(this).data('index');
        const objetivo = model.objetivos[index];

        $('#editarMonto').val('');
        $('#editarDescripcion').val(objetivo.descripcion);
        $('#editarFecha').val('');

        view.showEditForm();

        
        $('#guardarCambios').off('click').on('click', function() {
            const abono = parseFloat($('#editarMonto').val());
            const nuevaDescripcion = $('#editarDescripcion').val().trim();
            const nuevaFecha = $('#editarFecha').val();

            if (isPositiveNumber(abono)) {
                const saldoDisponible = model.getSaldo();
                const montoObjetivo = objetivo.montoAhorrar - objetivo.montoAhorrado;
                if (abono <= saldoDisponible) {
                    if (objetivo.montoAhorrado + abono > objetivo.montoAhorrar) {
                        alert('El monto ahorrado no puede ser mayor que el monto a ahorrar.');
                    } else {
                        model.updateObjetivo(index, abono, nuevaDescripcion, nuevaFecha);
                        view.hideEditForm();
                        updateUI();
                        if (model.objetivos[index].montoAhorrado === model.objetivos[index].montoAhorrar) {
                            alert('¡Ya has cumplido tu meta!');
                        }
                    }
                } else {
                    alert('No hay suficiente saldo para realizar este abono.');
                }
            } else {
                alert('Por favor, ingrese un monto positivo para el abono.');
            }
        });
    });

    $('#cancelarEdicion').on('click', function() {
        view.hideEditForm();
    });

    updateUI();
});


