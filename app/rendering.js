// El texto del usuario nunca se interpreta como HTML.
export function renderTitle(element, userInput) {
  element.textContent = userInput;
}
export function renderDescription(element, userInput) {
  element.textContent = userInput;
}
