/**
 * BMP位图文件格式
 * https://en.wikipedia.org/wiki/BMP_file_format
 *
 * 位图文件由文件头、信息头、颜色表、像素数据组成。
 * 分为1位单色位图、4位VGA位图、8位灰度位图、24位RGB位图、32位RGBA位图几种。
 *
 * ## 颜色表
 *
 * 只有1,4,8位色彩才需要颜色表, 24,32位真彩色无颜色表;
 * 颜色表中最多有2^n个颜色, 即1,4,8位色彩分别有2,16,256个, 少于2^n时剩余的颜色会显示为黑色;
 * 每个颜色由4字节的BGRA组成, 在不支持Alpha透明度通道的标准中最后一字节固定为0x00;
 *
 * ## 像素数据
 *
 * 像素数据记录了位图的每一个像素。
 * 1位色彩每8个像素占1个字节;
 * 4位色彩每2个像素占1个字节;
 * 8位色彩每1个像素占1个字节;
 * 24位色彩每1个像素占3个字节, 按B,G,R顺序组成;
 * 32位色彩每1个像素占4个字节, 按B,G,R,A顺序组成;
 * 记录顺序在扫描列之间是从下到上, 记录顺序在扫描行内是从左到右;
 * 一个扫描行所占的字节数必须是4的倍数, 不足的以0填充;
 */
interface Indexable<T> {
    [index: number]: T;
}
export interface IOption {
    bits: number;
    width: number;
    height: number;
    palette?: string[];
    data: Indexable<number>;
}
/** 生成位图文件 */
export declare function make(options: IOption): Uint8Array;
export {}
