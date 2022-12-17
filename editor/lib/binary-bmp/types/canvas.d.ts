interface ICanvasLike {
    width: number;
    height: number;
    getContext(contextId: '2d'): {
        getImageData(sx: number, sy: number, sw: number, sh: number): {
            readonly width: number;
            readonly height: number;
            readonly data: Uint8ClampedArray;
        };
    };
}
export declare function fromCanvas(bits: number, canvas: ICanvasLike): Uint8Array;
export {}
