/* Forces real page loads for this static snapshot.
   Next.js otherwise intercepts clicks and asks for routes like /cases,
   which are files named cases.html (and collide with the cases/ folder). */
(function () {
  var current = document.currentScript && document.currentScript.src;
  var siteRoot = new URL("./", current || document.baseURI).href;

  function destination(href) {
    if (!href || href.charAt(0) === "#") return null;
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return null;
    if (/^(https?:)?\/\//i.test(href)) return null;

    var hash = "";
    var search = "";
    var path = href;
    var hi = path.indexOf("#");
    if (hi >= 0) {
      hash = path.slice(hi);
      path = path.slice(0, hi);
    }
    var qi = path.indexOf("?");
    if (qi >= 0) {
      search = path.slice(qi);
      path = path.slice(0, qi);
    }
    if (path === "" && hash) return null;

    if (path.charAt(0) === "/") {
      if (/^\/(_next|brand|media|logos)\//.test(path)) return null;
      if (!/\.[a-z0-9]+$/i.test(path)) {
        var clean = path.replace(/\/+$/, "") || "/";
        path = clean === "/" ? "/index.html" : clean + ".html";
      }
      return new URL(path.replace(/^\//, ""), siteRoot).href + search + hash;
    }

    try {
      return new URL(path + search + hash, document.baseURI).href;
    } catch (err) {
      return null;
    }
  }

  function onClick(event) {
    if (event.defaultPrevented && event.type !== "click") return;
    var node = event.target;
    if (!node || !node.closest) return;
    var link = node.closest("a[href]");
    if (!link) return;
    if (link.hasAttribute("download")) return;
    var target = link.getAttribute("target");
    if (target && target !== "_self") return;

    var next = destination(link.getAttribute("href"));
    if (!next) return;

    if (link.getAttribute("href") !== next) link.setAttribute("href", next);

    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    window.location.href = next;
  }

  window.addEventListener("click", onClick, true);
  window.addEventListener("auxclick", onClick, true);
})();
