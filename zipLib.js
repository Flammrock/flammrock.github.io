var zipLib = {};

/**
 * @enum CompressionMethod
 */
zipLib.CompressionMethod = {
    NO_COMPRESSION: 0x0, // no compression
    DEFLATE: 0x8 // deflate compression
};

/**
 * Creates a 32-Bit Windows Time/Date Formats from a Date Object
 *
 * @private
 * @param {Date} - a Date Object.
 * @return {number} The 32-Bit Windows Time/Date Formats.
 */
zipLib._dateToNumber = function(d) {
    if (!(d instanceof Date)) throw 'first argument must be a Date object!';
    var b = [
        Math.floor(d.getSeconds() / 2) | (d.getMinutes() << 5) | (d.getHours() << 11), // time
        d.getDate() | ((d.getMonth() + 1) << 5) | ((d.getFullYear() - 0x7BC) << 9) // date
    ];
    return b[0] | (b[1] << 16);
}

/**
 * Creates a Date Object from a 32-Bit Windows Time/Date Formats
 *
 * @private
 * @param {number} - a 32-Bit Windows Time/Date Formats.
 * @return {Date} The Date Object.
 */
zipLib._numberToDate = function(i) {
    if (typeof i !== 'number') throw 'first argument must be a number!';
    var b = [
        i & 0x0000ffff,
        (i & 0xffff0000) >> 16
    ];
    return new Date(
        (b[1] >> 9) + 0x7BC,
        ((b[1] & ~((b[1] >> 9) << 9)) >> 5) - 1,
        b[1] & ~((b[1] >> 9) << 9) & ~(((b[1] & ~((b[1] >> 9) << 9)) >> 5) << 5),
        b[0] >> 11,
        (b[0] & ~((b[0] >> 11) << 11)) >> 5,
        (b[0] & ~((b[0] >> 11) << 11) & ~(((b[0] & ~((b[0] >> 11) << 11)) >> 5) << 5)) * 2
    );
}

/**
 * Generates the CRC Table
 *
 * @private
 * @return {Array.<number>} The CRC Table.
 */
zipLib._makeCRCTable = function() {
    var c;
    var crcTable = [];
    for (var n = 0; n < 256; n++) {
        c = n;
        for (var k = 0; k < 8; k++) {
            c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    return crcTable;
}

/**
 * Generates the CRC-32 Code for a ArrayBuffer or a Uint8Array or a string
 *
 * @private
 * @param {string|ArrayBuffer|Uint8Array} str - Data wich will be used to generate the CRC-32 code.
 * @return {number} The CRC-32 Code.
 */
zipLib._crc32 = function(str) {
    var crcTable = zipLib.crcTable || (zipLib.crcTable = zipLib._makeCRCTable());
    var crc = 0 ^ (-1);
    if (str instanceof ArrayBuffer) {
        var view = new Uint8Array(str);
        for (var i = 0; i < view.byteLength; i++) {
            crc = (crc >>> 8) ^ crcTable[(crc ^ view[i]) & 0xFF];
        }
    } else if (str instanceof Uint8Array) {
        for (var i = 0; i < str.byteLength; i++) {
            crc = (crc >>> 8) ^ crcTable[(crc ^ str[i]) & 0xFF];
        }
    } else {
        for (var i = 0; i < str.length; i++) {
            crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
        }
    }
    return (crc ^ (-1)) >>> 0;
};

/**
 * Safe MS-DOS path name
 *
 * @private
 * @param {string} p - path name.
 * @return {string} The Safe path name for format ZIP.
 * @throws if path not valid, the function throws an error.
 */
zipLib._safePath = function(p) {
    if (!/^(?:[a-z]:)?[\/\\]{0,2}(?:[.\/\\ ](?![.\/\\\n])|[^<>:"|?*.\/\\ \n])+(\/|\\)?$/i.test(p)) {
        throw 'Not valid path name!';
    }
    p = p.replace(/\\/g, '/');
    if (p[p.length - 1] !== '/') p += '/'; // normalize
    return p;
};

/**
 * Creates a new Uint8Array based on two different ArrayBuffers
 *
 * @private
 * @param {ArrayBuffers} buffer1 The first buffer.
 * @param {ArrayBuffers} buffer2 The second buffer.
 * @return {ArrayBuffers} The new ArrayBuffer created out of the two.
 */
zipLib._appendBuffer = function(buffer1, buffer2) {
    var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
};

/**
 * @private
 */
zipLib._Entry = class Entry {

    /**
     * @constructor
     * @param {string} filename - Name od the Entry.
     * @param {ArrayBuffer} rawbuffer - ArrayBuffer of the Entry.
     * @param {number} compressionMethod - Compression Method.
     * @param {Date} [filelastmodified] - Last Modified Date of the Entry.
     * @param {string} [comment] - Comment of the Entry.
     * @param {boolean} [isfolder] - Set to true if the Entry is a Folder else the Entry is a File.
     * @throws If filename isn't valid, this throws an error 'Not valid filename!'
     */
    constructor(filename, rawbuffer, compressionMethod, filelastmodified, comment, isfolder) {

        this._crc32 = zipLib._crc32(rawbuffer);
        this._isfolder = isfolder || false;
        this._originalSize = rawbuffer.byteLength;
        this._name = filename;
        this._comment = typeof comment === 'string' ? comment : '';
        this._lastModifiedDate = filelastmodified instanceof Date ? filelastmodified : new Date();
        this._compressionMethod = compressionMethod;

        // compression method
        if (this._isfolder) {
            this._buffer = new ArrayBuffer(0);
            this._compressionMethod = 0x0;
        } else {
            switch (this._compressionMethod) {
                case zipLib.CompressionMethod.DEFLATE:
                    var buff = pako.deflate(new Uint8Array(rawbuffer));
                    this._buffer = new ArrayBuffer(buff.byteLength - 6);
                    var v = new Uint8Array(buff);
                    var v2 = new Uint8Array(this._buffer);
                    for (var i = 2; i < v.length - 4; i++) {
                        v2[i - 2] = v[i];
                    }
                    break;
                default:
                    this._buffer = rawbuffer;
            }
        }

        this._name = zipLib._safePath(this._name);
        if (!this._isfolder) this._name = this._name.slice(0, -1);

    }

    /**
     * Build the "Local File Header" of the Entry
     *
     * @return {zipLib._LocalFileHeader} The "Local File Header" of the Entry.
     */
    getLocalFileHeader() {
        return new zipLib._LocalFileHeader(this);
    }

    /**
     * Build the "Central Directory File Header" of the Entry
     *
     * @return {zipLib._LocalFileHeader} The "Central Directory File Header" of the Entry.
     */
    getCentralDirectoryFileHeader(offsetLocalHeader) {
        return new zipLib._CentralDirectoryFileHeader(this, offsetLocalHeader);
    }

    /**
     * Get the Buffer of the Entry
     *
     * @return {ArrayBuffer} The Buffer of the Entry.
     */
    get buffer() {
        return this._buffer;
    }

    /**
     * Tell if the Entry is Folder or a File
     *
     * @return {boolean} true if the Entry is a Folder else false.
     */
    get isfolder() {
        return this._isfolder;
    }

    /**
     * Get the CRC-32 Code of the Entry
     *
     * @return {number} The CRC-32 Code of the Entry.
     */
    get crc32() {
        return this._crc32;
    }

    /**
     * Get the Orignal Size Buffer of the Entry
     *
     * @return {number} The Orignal Size Buffer of the Entry.
     */
    get originalSize() {
        return this._originalSize;
    }

    /**
     * Get the Name of the Entry
     *
     * @return {string} The Buffer of the Entry.
     */
    get name() {
        return this._name;
    }

    /**
     * Get the Comment of the Entry
     *
     * @return {string} The Comment of the Entry.
     */
    get comment() {
        return this._comment;
    }

    /**
     * Get the Last Modified Date of the Entry
     *
     * @return {Date} The Last Modified Date of the Entry.
     */
    get lastModifiedDate() {
        return this._lastModifiedDate;
    }

    /**
     * Get the Compression Method of the Entry
     *
     * @return {Date} The Compression Method of the Entry.
     */
    get compressionMethod() {
        return this._compressionMethod;
    }

}

/**
 * @private
 */
zipLib._LocalFileHeader = class LocalFileHeader {

    /**
     * @constructor
     * @param {zipLib._Entry} entry - a zipLib._Entry Object.
     */
    constructor(entry) {

        this._entry = entry;
        this._fileBuffer = this._entry.buffer;
        this._filename = new TextEncoder().encode(this._entry.name).buffer;
        this._buffer = new ArrayBuffer(30 + this._filename.byteLength);

        var view = new DataView(this._buffer);

        view.setInt32(0, 0x04034b50, true); // Local file header signature
        view.setInt16(4, 0x14, true); // Version needed
        view.setInt16(6, 0x00, true); // Flags
        view.setInt16(8, this._entry.compressionMethod, true); // Compression method
        view.setInt32(10,
            zipLib._dateToNumber(this._entry.lastModifiedDate), true // Date/Time
        );

        view.setInt32(14, this._entry.crc32, true); // CRC32
        view.setInt32(18, this._fileBuffer.byteLength, true); // Compressed Size
        view.setInt32(22, this._entry.originalSize, true); // Uncompressed Size
        view.setInt16(26, this._filename.byteLength, true); // File name length (n)
        view.setInt16(28, 0x0, true); // Extra field length (m)
        var v1 = new Uint8Array(this._filename);
        for (var i = 0; i < v1.length; i++) {
            view.setInt8(30 + i, v1[i], true);
        }

    }

    /**
     * Get the Buffer of the Local File Header
     *
     * @return {ArrayBuffer} The Buffer of the Local File Header.
     */
    get buffer() {
        return this._buffer;
    }

}

/**
 * @private
 */
zipLib._CentralDirectoryFileHeader = class CentralDirectoryFileHeader {

    /**
     * @constructor
     * @param {zipLib._Entry} entry - a zipLib._Entry Object.
     */
    constructor(entry, offsetLocalHeader) {

        this._entry = entry;
        this._fileBuffer = this._entry.buffer;
        this._offsetLocalHeader = offsetLocalHeader || 0;
        this._comment = new TextEncoder().encode((this._entry.comment)).buffer;
        this._filename = new TextEncoder().encode(this._entry.name).buffer;
        this._buffer = new ArrayBuffer(46 + this._filename.byteLength + this._comment.byteLength);

        var view = new DataView(this._buffer);

        view.setInt32(0, 0x02014b50, true); // Central Directory file header signature
        view.setInt16(4, 0x0014, true); // Version
        view.setInt16(6, 0x14, true); // Version needed
        view.setInt16(8, 0x00, true); // Flags
        view.setInt16(10, this._entry.compressionMethod, true); // Compression method
        view.setInt32(12,
            zipLib._dateToNumber(this._entry.lastModifiedDate), true // Date/Time
        );

        view.setInt32(16, this._entry.crc32, true); // CRC32
        view.setInt32(20, this._fileBuffer.byteLength, true); // Compressed Size
        view.setInt32(24, this._entry.originalSize, true); // Uncompressed Size
        view.setInt16(28, this._filename.byteLength, true); // File name length (n)
        view.setInt16(30, 0x00, true); // Extra field length (m)
        view.setInt16(32, this._comment.byteLength, true); // File comment length (k)
        view.setInt16(34, 0x00, true); // Disk # start
        view.setInt16(36, 0x00, true); // Internal attributes
        view.setInt32(38, this._entry.isfolder ? 0x0010 : 0x00, true); // External attributes
        view.setInt32(42, offsetLocalHeader, true); // Offset of local header
        var v1 = new Uint8Array(this._filename);
        for (var i = 0; i < v1.length; i++) {
            view.setInt8(46 + i, v1[i], true); // File Name
        }
        var v3 = new Uint8Array(this._comment);
        for (var i = 0; i < v3.length; i++) {
            view.setInt8(46 + v1.length + i, v3[i], true); // File Comment
        }
    }

    /**
     * Get the Buffer of the Central Directory File Header
     *
     * @return {ArrayBuffer} The Buffer of the Central Directory File Header.
     */
    get buffer() {
        return this._buffer;
    }
}


zipLib.Zip = class Zip {

    /**
     * @constructor
     * @param {number} [compressionMethod] - Compression Method
     * @param {string} [comment] - Global Comment of the ZIP Archive.
     * @param {string} [root] - Root Folder.
     * @param {zipLib.Zip} [parent] - Allow to create tree folder structure more easly.
     * @throws if compression Method specified isn't supported, an error is throwed.
     */
    constructor(compressionMethod, comment, root, parent) {

        this._compressionMethod = typeof compressionMethod === 'number' ? compressionMethod : zipLib.CompressionMethod.NO_COMPRESSION;

        // Check if the compression Method is supported
        var issupported = false;
        for (var n in zipLib.CompressionMethod) {
            if (zipLib.CompressionMethod.hasOwnProperty(n)) {
                if (zipLib.CompressionMethod[n] == this._compressionMethod) {
                    issupported = true;
                    break;
                }
            }
        }
        if (!issupported) {
            throw 'The Specified Compression Method isn\'t supported! Only DELFATE is supported!';
        }


        this._root = typeof root === 'string' ? root : '';
        this._parent = parent instanceof zipLib.Zip ? parent : null;
        this._files = {};
        this._folders = {};
        this._comment = typeof comment === 'string' ? comment : 'zipLib By Flammrock';

        if (this._root != '') {
            this._root = zipLib._safePath(this._root);
        }

    }

    /**
     * Build path
     *
     * @param {string} p - path name.
     * @param {Date} [lastModifiedDate] - last Modified Date of the path.
     * @return {zipLib.Zip} The last "container" of path.
     */
    _buildPath(p, lastModifiedDate) {
        var n = p.split('/');
        var f = this;
        for (var i = 0; i < n.length - 1; i++) {
            if (typeof f._folders[n[i]] === 'undefined') {
                f._folders[n[i]] = new zipLib.Zip(this._compressionMethod, '', f._root + n[i] + '/', f);
                f._folders[n[i]].__lastModifiedDate = lastModifiedDate instanceof Date ? lastModifiedDate : new Date();
            }
            f = f._folders[n[i]];
        }
        return f;
    }

    /**
     * Add a file to the ZIP Archive
     *
     * @param {string} filename - Name of the File.
     * @param {ArrayBuffer} buffer - Buffer of the File.
     * @param {Date} [lastModifiedDate] - Last Modified Date of the File.
     * @param {string} [comment] - Comment of the File.
     */
    file(filename, buffer, lastModifiedDate, comment) {
        filename = zipLib._safePath(filename);
        var f = this._buildPath(filename.slice(0, -1), lastModifiedDate);
        var n = filename.split('/');
        f._files[n[n.length - 2]] = new zipLib._Entry(f._root + n[n.length - 2], buffer, this._compressionMethod, lastModifiedDate, comment);
    }

    /**
     * Add a folder to the ZIP Archive
     *
     * @param {string} foldername - Name of the Folder.
     * @param {Date} [lastModifiedDate] - Last Modified Date of the Folder.
     * @param {string} [comment] - Comment of the Folder.
     * @return {zipLib.Zip} The Folder ZIP Container, simply use .file() on this returned object to add a file to this folder.
     */
    folder(foldername, lastModifiedDate, comment) {
        return this._buildPath(zipLib._safePath(foldername), lastModifiedDate);
    }

    /**
     * Get the entries of this ZIP Archive
     *
     * @return {Array.<zipLib._Entry>} The entries of this ZIP Archive.
     */
    get entries() {
        var entries = [];
        if (this._parent != null) {
            entries.push(new zipLib._Entry(this._root, new ArrayBuffer(0), this._compressionMethod, this.__lastModifiedDate, this._comment, true));
        }
        for (var i in this._files) {
            if (this._files.hasOwnProperty(i)) {
                entries.push(this._files[i]);
            }
        }
        for (var i in this._folders) {
            if (this._folders.hasOwnProperty(i)) {
                entries = entries.concat(this._folders[i].entries);
            }
        }
        return entries;
    }

    /**
     * Build the buffer of this ZIP Archive
     *
     * @return {ArrayBuffer} The buffer of this ZIP Archive.
     */
    toBuffer() {

        var buffer = new ArrayBuffer(); // our final buffer
        var index = [0]; // the offset of the first "local file header" is always "0"
        var entries = this.entries; // get all entries of this ZIP Archive
        for (var i = 0; i < entries.length; i++) {
            var b = entries[i].getLocalFileHeader().buffer; // build and retrieve the buffer of the "local file header"
            buffer = zipLib._appendBuffer(buffer, b); // add the "local file header" of this file to the whole buffer
            buffer = zipLib._appendBuffer(buffer, entries[i].buffer); // add the buffer of this file to the whole buffer
            index.push(buffer.byteLength); // we store each offset of "local file header" (this is used by .getCentralDirectoryFileHeader() method)
        }

        var size = 0; // used to calcule the size (in byte) of the "central directory"
        var offsetStartCentralDirectory = buffer.byteLength; // offset byte when the "central directory" start

        for (var i = 0; i < entries.length; i++) {
            var b = entries[i].getCentralDirectoryFileHeader(index[i]).buffer;
            size += b.byteLength;
            buffer = zipLib._appendBuffer(buffer, b); // append the "Central Directory File Header" buffer to the whole buffer
        }

        var datacomment = new TextEncoder().encode(this._comment).buffer;

        // build the "End of central directory record"
        var endbuffer = new ArrayBuffer(22 + datacomment.byteLength);
        var view = new DataView(endbuffer);
        view.setInt32(0, 0x06054b50, true); // Signature
        view.setInt16(4, 0x0, true); // Disk Number
        view.setInt16(6, 0x0, true); // Disk # w/cd
        view.setInt16(8, entries.length, true); // Disk entries
        view.setInt16(10, entries.length, true); // Total entries
        view.setInt32(12, size, true); // Central directory size
        view.setInt32(16, offsetStartCentralDirectory, true); // Offset of cd wrt to starting disk
        view.setInt16(20, datacomment.byteLength, true); // Comment length
        var v1 = new Uint8Array(datacomment);
        for (var i = 0; i < v1.length; i++) {
            view.setInt8(22 + i, v1[i], true); // Comment
        }

        // add the "End of central directory record" to the whole buffer
        buffer = zipLib._appendBuffer(buffer, endbuffer);

        return buffer;

    }

}
