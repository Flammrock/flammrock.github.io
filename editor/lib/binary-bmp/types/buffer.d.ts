export declare class SequentialDataView {
  private view
  private pos
  constructor(arrayBuffer: ArrayBuffer);
  appendUint16(value: number, littleEndian?: boolean): void;
  appendUint32(value: number, littleEndian?: boolean): void;
}
