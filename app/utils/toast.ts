const DWELL_TIME = 1500;

export const toast = (text: string) => {
  const isToastInstance = document.querySelector(".toast");
  if (isToastInstance) {
    return;
  }
  const div = document.createElement("div");
  const { body } = document;
  div.classList.add("toast");
  div.innerHTML = text;
  body.appendChild(div);

  setTimeout(() => {
    div.parentNode?.removeChild(div);
  }, DWELL_TIME);
};
