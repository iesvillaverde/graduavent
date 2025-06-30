function procesarAcompanantes() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const datos = hoja.getDataRange().getValues();

  // Encontrar los índices de las columnas "Nombres" y "Número de acompañantes"
  const encabezados = datos[0];
  const idxNombres = encabezados.indexOf("Nombres");
  const idxAcompañantes = encabezados.indexOf("Número de acompañantes");
  
  if (idxNombres === -1 || idxAcompañantes === -1) {
    SpreadsheetApp.getUi().alert("No se encontró alguna de las columnas necesarias.");
    return;
  }

  let fila = 1; // Empezamos desde la fila 2 en la hoja (índice 1 en datos)
  let totalFilas = datos.length;
  let filasProcesadas = 0;

  while (fila < totalFilas && filasProcesadas < 120) {
    const filaActual = datos[fila];
    const numAcomp = filaActual[idxAcompañantes];
    const nombre = filaActual[idxNombres];

    // Condición 1: si la columna "Número de acompañantes" está vacía, es 0 o > 2, pasa a la siguiente fila
    if (numAcomp === "" || numAcomp === null || numAcomp === undefined || numAcomp === 0 || numAcomp > 2) {
      fila++;
      continue;
    }

    // Condición 2: si "Nombres" no empieza por "acompañante"
    if (typeof nombre === 'string' && !nombre.toLowerCase().startsWith("acompañante")) {
      var nombreGuardado = nombre;
    }
      
    // Inserta una fila debajo de la actual
    hoja.insertRowsAfter(fila + 1, 1);
    
    // Copiar los valores de la fila actual a la nueva fila
    const nuevaFila = [...filaActual];
    
    // Modificar la columna "Nombres" de la nueva fila
    nuevaFila[idxNombres] = "Acompañante de " + nombreGuardado;
    
    // Modificar la columna "Número de acompañantes" de la nueva fila
    const nuevoNumAcomp = (numAcomp !== "" && numAcomp !== null && !isNaN(numAcomp)) ? numAcomp - 1 : 0;
    nuevaFila[idxAcompañantes] = nuevoNumAcomp;
    
    // Escribir la nueva fila en la hoja
    hoja.getRange(fila + 2, 1, 1, nuevaFila.length).setValues([nuevaFila]);
    
    // Actualizar datos y totalFilas
    datos.splice(fila + 1, 0, nuevaFila);
    totalFilas++;
    
    
    fila++;
    filasProcesadas++;
  }
}
