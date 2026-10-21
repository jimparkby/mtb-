/*
 * Мини-движок для экранов прототипа (*.dc.html) вне холста claude.ai.
 * Понимает тот же формат: шаблон в <x-dc> с {{подстановками}}, <sc-for>, <sc-if>,
 * <dc-import> и класс Component extends DCLogic. Рисует через React (vendor/).
 */
(function () {
    'use strict';

    // React грузим синхронно, пока страница ещё разбирается
    document.write('<style>x-dc{display:none}</style>');
    document.write('<script src="vendor/react.production.min.js"><\/script>');
    document.write('<script src="vendor/react-dom.production.min.js"><\/script>');

    var W = 390;
    var H = 844;
    var registry = {};
    var helmetsDone = {};

    var EVENTS = {
        onclick: 'onClick',
        onchange: 'onChange',
        oninput: 'onInput',
        onkeydown: 'onKeyDown',
        onkeyup: 'onKeyUp',
        onpointerdown: 'onPointerDown',
        onpointermove: 'onPointerMove',
        onpointerup: 'onPointerUp',
        onpointercancel: 'onPointerCancel',
        onfocus: 'onFocus',
        onblur: 'onBlur',
    };

    function camel(s) {
        return s.replace(/-([a-z])/g, function (_, c) {
            return c.toUpperCase();
        });
    }

    /** {{ путь }} → значение из области видимости: точечный путь или литерал */
    function lookup(path, scope) {
        var p = path.trim();
        if (p === 'true') return true;
        if (p === 'false') return false;
        if (p === 'null') return null;
        if (/^-?\d+(\.\d+)?$/.test(p)) return Number(p);
        if (/^(['"]).*\1$/.test(p)) return p.slice(1, -1);
        var parts = p.split('.');
        var v = scope;
        for (var i = 0; i < parts.length; i++) {
            if (v == null) return undefined;
            v = v[parts[i]];
        }
        return v;
    }

    var WHOLE = /^\s*\{\{([^}]+)\}\}\s*$/;
    var HOLE = /\{\{([^}]+)\}\}/g;

    /** Атрибут целиком из одной подстановки отдаёт сырое значение, иначе — строку */
    function attrValue(raw, scope) {
        var m = raw.match(WHOLE);
        if (m) return lookup(m[1], scope);
        return text(raw, scope);
    }

    function text(raw, scope) {
        return raw.replace(HOLE, function (_, p) {
            var v = lookup(p, scope);
            return v == null ? '' : String(v);
        });
    }

    /** "a: b; c: d" → { a: 'b', c: 'd' }, точки с запятой внутри скобок не режут */
    function styleObject(css) {
        var out = {};
        var depth = 0;
        var buf = '';
        var decls = [];
        for (var i = 0; i < css.length; i++) {
            var ch = css[i];
            if (ch === '(') depth++;
            if (ch === ')') depth--;
            if (ch === ';' && depth === 0) {
                decls.push(buf);
                buf = '';
            } else buf += ch;
        }
        decls.push(buf);
        decls.forEach(function (d) {
            var k = d.indexOf(':');
            if (k < 0) return;
            var name = d.slice(0, k).trim();
            var value = d.slice(k + 1).trim();
            if (!name) return;
            out[name.indexOf('--') === 0 ? name : camel(name)] = value;
        });
        return out;
    }

    function propsFor(el, scope) {
        var props = {};
        var isSvg = el.namespaceURI === 'http://www.w3.org/2000/svg';
        for (var i = 0; i < el.attributes.length; i++) {
            var a = el.attributes[i];
            var name = a.name;
            var lower = name.toLowerCase();
            if (lower.indexOf('hint-') === 0) continue;
            if (EVENTS[lower]) {
                var fn = attrValue(a.value, scope);
                if (typeof fn === 'function') props[EVENTS[lower]] = fn;
                continue;
            }
            var val = attrValue(a.value, scope);
            if (lower === 'style') {
                props.style = styleObject(String(val == null ? '' : val));
            } else if (lower === 'class') props.className = val;
            else if (lower === 'for') props.htmlFor = val;
            else if (lower === 'value' && !WHOLE.test(a.value)) props.defaultValue = val;
            else if (lower === 'checked') props.defaultChecked = true;
            else if (lower === 'disabled') props.disabled = val !== false && val !== 'false';
            else if (lower.indexOf('aria-') === 0 || lower.indexOf('data-') === 0) props[lower] = val;
            else if (isSvg && name.indexOf('-') > 0) props[camel(name)] = val;
            else if (lower === 'tabindex') props.tabIndex = val;
            else if (lower === 'readonly') props.readOnly = true;
            else if (lower === 'maxlength') props.maxLength = val;
            else props[isSvg ? name : lower] = val;
        }
        return props;
    }

    function children(node, scope, ctx) {
        var out = [];
        node.childNodes.forEach(function (c, i) {
            var r = render(c, scope, ctx, i);
            if (Array.isArray(r)) out.push.apply(out, r);
            else if (r !== null && r !== undefined) out.push(r);
        });
        return out;
    }

    function render(node, scope, ctx, key) {
        var R = window.React;
        if (node.nodeType === 3) return text(node.nodeValue, scope);
        if (node.nodeType !== 1) return null;
        var tag = node.namespaceURI === 'http://www.w3.org/2000/svg' ? node.tagName : node.tagName.toLowerCase();

        if (tag === 'helmet' || tag === 'script') return null;

        if (tag === 'sc-if') {
            if (!attrValue(node.getAttribute('value') || '', scope)) return null;
            return R.createElement(R.Fragment, { key: key }, children(node, scope, ctx));
        }

        if (tag === 'sc-for') {
            var list = attrValue(node.getAttribute('list') || '', scope) || [];
            var as = node.getAttribute('as') || 'item';
            return list.map(function (item, i) {
                var inner = Object.create(scope);
                inner[as] = item;
                inner.$index = i;
                return R.createElement(R.Fragment, { key: key + '-' + i }, children(node, inner, ctx));
            });
        }

        if (tag === 'dc-import') {
            var name = node.getAttribute('name');
            var Comp = registry[name];
            if (!Comp) {
                load(name).then(function () {
                    ctx.forceUpdate();
                });
                return null;
            }
            var p = { key: key };
            for (var j = 0; j < node.attributes.length; j++) {
                var at = node.attributes[j];
                var ln = at.name.toLowerCase();
                if (ln === 'name' || ln.indexOf('hint-') === 0) continue;
                p[camel(ln)] = attrValue(at.value, scope);
            }
            return R.createElement(Comp, p);
        }

        var props = propsFor(node, scope);
        props.key = key;
        var kids = children(node, scope, ctx);
        return R.createElement.apply(null, [tag, props].concat(kids));
    }

    /** Шрифты и стили из <helmet> переносим в <head> один раз на файл */
    function applyHelmet(xdc, id) {
        if (helmetsDone[id]) return;
        helmetsDone[id] = true;
        var helmet = xdc.querySelector('helmet');
        if (!helmet) return;
        Array.prototype.forEach.call(helmet.children, function (c) {
            var copy = document.createElement(c.tagName.toLowerCase());
            for (var i = 0; i < c.attributes.length; i++) copy.setAttribute(c.attributes[i].name, c.attributes[i].value);
            copy.textContent = c.textContent;
            document.head.appendChild(copy);
        });
    }

    /** Из документа с <x-dc> делаем React-компонент */
    function compile(doc, id) {
        var R = window.React;
        var xdc = doc.querySelector('x-dc');
        var script = doc.querySelector('script[data-dc-script]');
        applyHelmet(xdc, id);

        function DCLogic(props) {
            R.Component.call(this, props);
            this.state = {};
        }
        DCLogic.prototype = Object.create(R.Component.prototype);
        DCLogic.prototype.constructor = DCLogic;
        DCLogic.prototype.renderVals = function () {
            return {};
        };
        DCLogic.prototype.render = function () {
            var vals = this.renderVals() || {};
            var kids = children(xdc, vals, this).filter(function (k) {
                return typeof k !== 'string' || k.trim();
            });
            return kids.length === 1 ? kids[0] : R.createElement(R.Fragment, null, kids);
        };

        var src = script ? script.textContent : 'class Component extends DCLogic {}';
        /* eslint-disable-next-line no-new-func */
        return new Function('DCLogic', 'React', src + '\nreturn Component;')(DCLogic, R);
    }

    var loading = {};
    function load(name) {
        if (!loading[name]) {
            loading[name] = fetch(name + '.dc.html')
                .then(function (r) {
                    return r.text();
                })
                .then(function (html) {
                    var doc = new DOMParser().parseFromString(html, 'text/html');
                    registry[name] = compile(doc, name);
                });
        }
        return loading[name];
    }

    /** Экран 390×844 по центру; на компьютере уменьшается под высоту окна */
    function fit(frame) {
        var phone = window.innerWidth <= 500;
        var scale = phone ? window.innerWidth / W : Math.min(1, (window.innerHeight - 24) / H);
        frame.style.transform = 'scale(' + scale + ')';
        frame.parentNode.style.width = W * scale + 'px';
        frame.parentNode.style.height = H * scale + 'px';
    }

    function boot() {
        var xdc = document.querySelector('x-dc');
        if (!xdc) return;
        var Comp = compile(document, location.pathname);
        xdc.parentNode.removeChild(xdc);

        var css = document.createElement('style');
        css.textContent =
            'html,body{margin:0;min-height:100%;background:#0B0C10}' +
            'body{display:flex;align-items:center;justify-content:center;min-height:100vh}' +
            '.dc-shell{position:relative;overflow:hidden;border-radius:28px;box-shadow:0 30px 80px rgba(0,0,0,.6)}' +
            '.dc-frame{width:' + W + 'px;height:' + H + 'px;transform-origin:0 0;position:absolute;left:0;top:0}' +
            '@media (max-width:500px){body{align-items:flex-start}.dc-shell{border-radius:0;box-shadow:none}}' +
            '.dc-home{position:fixed;left:12px;top:12px;z-index:9;font:600 13px Inter,system-ui,sans-serif;color:#9A9CA8;text-decoration:none;background:#1E1F25;padding:8px 12px;border-radius:10px}' +
            '@media (max-width:500px){.dc-home{display:none}}';
        document.head.appendChild(css);

        var home = document.createElement('a');
        home.href = 'index.html';
        home.className = 'dc-home';
        home.textContent = '← Все экраны';
        document.body.appendChild(home);

        var shell = document.createElement('div');
        shell.className = 'dc-shell';
        var frame = document.createElement('div');
        frame.className = 'dc-frame';
        shell.appendChild(frame);
        document.body.appendChild(shell);
        fit(frame);
        window.addEventListener('resize', function () {
            fit(frame);
        });
        window.ReactDOM.createRoot(frame).render(window.React.createElement(Comp, {}));
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
