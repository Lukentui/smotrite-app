export function humanFileSize(bytes?: number, digits = 1) {
    if(isNaN(bytes)) {
        return '0kB'
    }

    const thresh = 1000;
  
    if (Math.abs(bytes) < thresh) {
      return "0kB";
    }
  
    const units = ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    let u = -1;
    const r = 10 ** digits;
  
    do {
      bytes /= thresh;
      ++u;
    } while (
      Math.round(Math.abs(bytes) * r) / r >= thresh &&
      u < units.length - 1
    );
  
    return bytes.toFixed(digits) + "" + units[u];
  }