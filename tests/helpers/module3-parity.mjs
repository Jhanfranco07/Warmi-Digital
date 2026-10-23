import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

export function normalizeModule3Content(markup) {
  const document = new DOMParser().parseFromString(markup, "text/html");
  document.querySelectorAll("[data-mode-detail]").forEach((node) => node.remove());
  for (const element of document.querySelectorAll("*")) {
    for (const attribute of [...element.attributes]) {
      if (
        attribute.name.endsWith("-offline") ||
        ["id", "for", "aria-controls", "aria-labelledby", "aria-describedby"].includes(
          attribute.name
        )
      )
        element.removeAttribute(attribute.name);
    }
  }
  return document.body.innerHTML;
}

export function sameModeContent(Component, props) {
  const render = (offline) =>
    normalizeModule3Content(
      renderToStaticMarkup(React.createElement(Component, { ...props, offline }))
    );
  return render(false) === render(true);
}
