/* ZIP sem dependências externas. Os arquivos já compactados (imagens) são armazenados. */
(() => {
  "use strict";
  const encoder = new TextEncoder();
  const table = Uint32Array.from({ length: 256 }, (_, value) => {
    for (let bit = 0; bit < 8; bit++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    return value >>> 0;
  });
  function crc32(bytes) {
    let value = 0xffffffff;
    for (const byte of bytes) value = table[(value ^ byte) & 255] ^ (value >>> 8);
    return (value ^ 0xffffffff) >>> 0;
  }
  async function create(entries) {
    const chunks = [], central = [];
    let offset = 0, centralSize = 0;
    for (const [path, value] of entries) {
      if (path.startsWith("/") || path.split("/").includes("..")) throw new Error("Caminho inválido no backup.");
      const name = encoder.encode(path);
      const bytes = typeof value === "string" ? encoder.encode(value) : new Uint8Array(await value.arrayBuffer());
      const checksum = crc32(bytes);
      const local = new Uint8Array(30 + name.length), localView = new DataView(local.buffer);
      localView.setUint32(0, 0x04034b50, true); localView.setUint16(4, 20, true);
      localView.setUint16(6, 0x800, true); localView.setUint32(14, checksum, true);
      localView.setUint32(18, bytes.length, true); localView.setUint32(22, bytes.length, true);
      localView.setUint16(26, name.length, true); local.set(name, 30);
      const header = new Uint8Array(46 + name.length), view = new DataView(header.buffer);
      view.setUint32(0, 0x02014b50, true); view.setUint16(4, 20, true); view.setUint16(6, 20, true);
      view.setUint16(8, 0x800, true); view.setUint32(16, checksum, true);
      view.setUint32(20, bytes.length, true); view.setUint32(24, bytes.length, true);
      view.setUint16(28, name.length, true); view.setUint32(42, offset, true); header.set(name, 46);
      chunks.push(local, bytes); central.push(header);
      offset += local.length + bytes.length; centralSize += header.length;
    }
    const end = new Uint8Array(22), view = new DataView(end.buffer);
    view.setUint32(0, 0x06054b50, true); view.setUint16(8, entries.length, true);
    view.setUint16(10, entries.length, true); view.setUint32(12, centralSize, true); view.setUint32(16, offset, true);
    return new Blob([...chunks, ...central, end], { type: "application/zip" });
  }
  async function read(blob) {
    const bytes = new Uint8Array(await blob.arrayBuffer()), view = new DataView(bytes.buffer);
    const entries = new Map();
    let offset = 0, total = 0;
    while (offset + 4 <= bytes.length && view.getUint32(offset, true) === 0x04034b50) {
      if (offset + 30 > bytes.length) throw new Error("Backup incompleto.");
      const flags = view.getUint16(offset + 6, true), method = view.getUint16(offset + 8, true);
      const checksum = view.getUint32(offset + 14, true), size = view.getUint32(offset + 18, true);
      const nameLength = view.getUint16(offset + 26, true), extraLength = view.getUint16(offset + 28, true);
      if (method !== 0 || flags & 9) throw new Error("Importe um ZIP exportado pelo painel.");
      const start = offset + 30 + nameLength + extraLength, end = start + size;
      if (end > bytes.length || size > 100 * 1024 * 1024) throw new Error("O backup está incompleto ou é grande demais.");
      const path = new TextDecoder().decode(bytes.subarray(offset + 30, offset + 30 + nameLength));
      if (path.startsWith("/") || path.includes("\\") || path.split("/").includes("..") || entries.has(path)) throw new Error("O backup contém um caminho inválido.");
      const content = bytes.slice(start, end);
      if (crc32(content) !== checksum) throw new Error("Um arquivo do backup está danificado.");
      total += size;
      if (total > 200 * 1024 * 1024) throw new Error("O backup excedeu o limite de importação.");
      entries.set(path, content); offset = end;
    }
    if (!entries.size) throw new Error("O ZIP não contém arquivos reconhecidos.");
    return entries;
  }
  window.AdminZip = { create, read };
})();
