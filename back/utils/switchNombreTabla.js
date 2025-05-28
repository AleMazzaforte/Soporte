export function switchNombreTabla(idMarca) {
  switch (idMarca.toString()) {
    case "1":
      return "impresorasHpToner";
    case "2":
      return "impresorasBrotherToner";
    case "3":
      return "impresorasRicohToner";
    case "4":
      return "impresorasXeroxToner";
    case "5":
      return "impresorasSamsungToner";
    case "11":
      return "impresorasLexmarkToner";
    case "12":
      return "impresorasEpsonTinta";
    case "13":
      return "impresorasPantumToner";
    default:
      return null;
  }
}
