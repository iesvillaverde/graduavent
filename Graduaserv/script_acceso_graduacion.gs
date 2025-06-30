
function doGet(e) {
  var codigo = e.parameter["codigo"];
  var sesion = e.parameter["sesion"]; //La sesión se usa para elegir la hoja de invitaciones adecuada 
  var resultado = verificarCodigo(codigo, sesion);
  var html = "<html><body><h1>"+resultado+"</h1></body></html>";
  var text = resultado;
  //return HtmlService.createHtmlOutput(html)
  return ContentService.createTextOutput(resultado);
}

function verificarCodigo(inputCodigo, inputSesion) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("sesion_" + inputSesion); // Cambia si tu hoja tiene otro nombre

  if (sheet === null) {
   return("ko: no existe la hoja de control para la sesion [" + inputSesion + "]"); //Si no hay una hoja con el nombre de la sesion, p.ej. sesion_100
  }
  // Obtener encabezados
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const idxCodigo = headers.indexOf("codigo") + 1;
  const idxUsado = headers.indexOf("usado") + 1;
  const idxFecha = headers.indexOf("fecha") + 1;

  if (idxCodigo === 0 || idxUsado === 0 || idxFecha === 0 ) {
    return "ko: la hoja de control no tiene las cabeceras adecuadas (codigo,usado.fecha,plazas)"; // Aseguramos que todas las columnas existen
  }

  // Buscar el código en la columna "codigo"
  const finder = sheet.getRange(2, idxCodigo, sheet.getLastRow() - 1).createTextFinder(inputCodigo);
  finder.matchCase(true).matchEntireCell(true);
  const match = finder.findNext();

  if (!match) {
    return "ko: no se encontró código " + inputCodigo; // No se encontró el código
  }

  const row = match.getRow();
  const usado = sheet.getRange(row, idxUsado).getValue();
  const fecha = sheet.getRange(row, idxFecha).getValue();
  
  cadena_respuesta = "";
  if (usado === true) {
    // El código se ha solicitado
    if (diferenciaMayorANSegundos(new Date(), fecha, 2) == true) { //más de una vez en un período mayor s 2 segundos
      cadena_respuesta = "ko: usado " + Utilities.formatDate(new Date(fecha), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");
    } else { //Consideramos que el código es válido, bien porque se ha solcitado por primera vez o ya se solicitó pero no han transcurrido más de 2 sg. desde la solicitud.
      cadena_respuesta = "ok" + ";Plazas libres:" + getPlazas(inputSesion);
    }
  } else {
    // Código válido: marcamos como usado y ponemos fecha actual
    const fechaActual = new Date();
    sheet.getRange(row, idxUsado).setValue(true);
    sheet.getRange(row, idxFecha).setValue(fechaActual);
      cadena_respuesta = "ok"+ ";Plazas libres:" + getPlazas(inputSesion);;
  }
  // Set the response headers to prevent caching
  return cadena_respuesta;
}


function diferenciaMayorANSegundos(fecha1, fecha2, numero_segundos) {
  // Asegúrate de que las fechas sean objetos Date
  var date1 = new Date(fecha1);
  var date2 = new Date(fecha2);

  // Calcula la diferencia en milisegundos
  var diferenciaMs = date1.getTime() - date2.getTime();
  
  // Convierte la diferencia a segundos
  var diferenciaSegundos = diferenciaMs / 1000;

  // Devuelve true si la diferencia es mayor a 4 segundos
  return diferenciaSegundos > numero_segundos;
}

function getPlazas(inputSesion) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("sesion_" + inputSesion); // Cambia si tu hoja tiene otro nombre
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const idxPlazas = headers.indexOf("plazas");
    plazas =""; 
 
    if (idxPlazas === 0) {
      plazas = "desconocido, falta campo Plazas"; // La columna no aparece en la hoja asociada
    } else {
      const datos = sheet.getDataRange().getValues();
      plazas = datos[1][idxPlazas];
    }

    return plazas;  
}