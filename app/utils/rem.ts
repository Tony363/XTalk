const BASE_FONTSIZE = 16;
const MIN_FONTSIZE = 8;
const MAX_SCALE = 2;

function setFontSize(params?: DomFontSizeParams) {
  const {
    designWidth = 750,
    autoSize = true,
    baseSize = BASE_FONTSIZE,
    minSize = MIN_FONTSIZE,
    maxScale = MAX_SCALE,
  } = params || {};
  let scale = document.documentElement.clientWidth / designWidth;
  scale = Math.min(scale, maxScale);
  const fontSize = Math.max(baseSize * scale, minSize);
  const htmlFontSize = autoSize ? fontSize : baseSize;
  document.documentElement.style.fontSize = `${htmlFontSize}px`;
}

interface DomFontSizeParams {
  designWidth?: number;
  autoSize?: boolean;
  baseSize?: number;
  minSize?: number;
  maxScale?: number;
}
export const setDomFontSize = (params: DomFontSizeParams) => {
  setFontSize(params);
  window.onresize = function () {
    setFontSize(params);
  };
};
