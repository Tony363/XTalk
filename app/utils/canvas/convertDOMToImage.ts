import html2canvas from "html2canvas";

export function toBlobURL(url: string) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = document.createElement("img");
    img.setAttribute("crossorigin", "anonymous");
    img.src = url;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        const blobURL = URL.createObjectURL(blob as Blob);
        resolve(blobURL);
      });
    };
    img.onerror = () => {
      resolve(url);
    };
  });
}
export const convertToBlobImage = async (container: HTMLElement) => {
  const imgNodeList = Array.from(container.getElementsByTagName("img"));
  const unBlobNodeList = imgNodeList.filter(
    (img) => !img.src.startsWith("blob"),
  );
  for (const img of unBlobNodeList) {
    const blobUrl = await toBlobURL(img.src);
    img.src = String(blobUrl);
  }
};
interface ConvertDOMToImage {
  DOM: HTMLElement;
  callback: (base64: string) => void;
  quality?: number;
  scaleBy?: number;
  isCovertImg?: boolean;
  ignoreElements?: (ele: Element) => boolean;
}
export const convertDOMToImage = async (params: ConvertDOMToImage) => {
  const {
    DOM,
    callback,
    quality = 0.92,
    ignoreElements = () => false,
    scaleBy = 1,
  } = params;
  const w = DOM.clientWidth;
  const h = DOM.clientHeight;

  const sTop = document.documentElement.scrollTop || document.body.scrollTop;

  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  const canvas = document.createElement("canvas");
  canvas.width = w * window.devicePixelRatio * scaleBy;
  canvas.height = h * window.devicePixelRatio * scaleBy;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  const context: CanvasRenderingContext2D | null = canvas.getContext("2d");
  if (context) {
    context.scale(scaleBy, scaleBy);
    context.imageSmoothingEnabled = false;
  }
  if (params.isCovertImg) {
    await convertToBlobImage(DOM);
  }
  html2canvas(DOM, {
    canvas,
    useCORS: true,
    ignoreElements,
  }).then((canvas: HTMLCanvasElement) => {
    const dataImg = canvas.toDataURL("image/jpeg", quality);
    document.documentElement.scrollTop = sTop;
    document.body.scrollTop = sTop;
    callback(dataImg);
  });
};
