export function switchNombreTabla(idMarca) {
  switch (idMarca.toString()) {
    case "1":
      return "impresorasHp";
    case "2":
      return "impresorasBrother";
    case "3":
      return "impresorasRicoh";
    case "4":
      return "impresorasXerox";
    case "5":
      return "impresorasSamsung";
    case "11":
      return "impresorasLexmark";
    case "12":
      return "impresorasEpson";
    case "13":
      return "impresorasPantum";
    default:
      return null;
  }
}
