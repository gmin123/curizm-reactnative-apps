declare module 'colorsys' {
  interface RGB {
    r: number;
    g: number;
    b: number;
  }

  interface HSL {
    h: number;
    s: number;
    l: number;
  }

  interface HSV {
    h: number;
    s: number;
    v: number;
  }

  interface CMYK {
    c: number;
    m: number;
    y: number;
    k: number;
  }

  interface HEX {
    hex: string;
  }

  export function rgb_to_hsl(rgb: RGB): HSL;
  export function hsl_to_rgb(hsl: HSL): RGB;
  export function rgb_to_hsv(rgb: RGB): HSV;
  export function hsv_to_rgb(hsv: HSV): RGB;
  export function rgb_to_cmyk(rgb: RGB): CMYK;
  export function cmyk_to_rgb(cmyk: CMYK): RGB;
  export function rgb_to_hex(rgb: RGB): HEX;
  export function hex_to_rgb(hex: HEX): RGB;
  export function hsl_to_hsv(hsl: HSL): HSV;
  export function hsv_to_hsl(hsv: HSV): HSL;
} 