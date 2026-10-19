const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");

const source = fs.readFileSync(path.join(__dirname, "../src/visual.ts"), "utf8");
const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
}).outputText;

function createHarness() {
    const frames = new Map();
    const events = [];
    const exports = {};
    let nextFrame = 0;
    const sandbox = {
        exports,
        require: () => ({}),
        Error,
        document: {
            createElement: (tagName) => ({ tagName, children: [], appendChild(child) { this.children.push(child); } })
        },
        requestAnimationFrame: (callback) => {
            const frame = ++nextFrame;
            frames.set(frame, callback);
            return frame;
        },
        cancelAnimationFrame: (frame) => frames.delete(frame)
    };
    vm.runInNewContext(compiled, sandbox, { filename: "visual.js" });
    const visual = Object.create(exports.Visual.prototype);
    visual.renderCycle = null;
    visual.host = {
        eventService: Object.fromEntries(["renderingStarted", "renderingFinished", "renderingFailed"]
            .map((name) => [name, (options, message) => events.push({ name, options, message })]))
    };
    visual.render = () => undefined;
    return {
        visual,
        events,
        frames,
        names: () => events.map((event) => event.name),
        flush: () => {
            const callbacks = [...frames.values()];
            frames.clear();
            callbacks.forEach((callback) => callback(0));
        }
    };
}

test("empty rendering completes with the original update options", () => {
    const harness = createHarness();
    const options = { viewport: { width: 800, height: 600 } };
    harness.visual.update(options);
    assert.deepEqual(harness.names(), ["renderingStarted", "renderingFinished"]);
    harness.events.forEach((event) => assert.equal(event.options, options));
});

test("render completion waits for nested layout frames", () => {
    const harness = createHarness();
    harness.visual.render = () => harness.visual.scheduleLayout(() => {
        harness.visual.scheduleLayout(() => undefined);
    });
    harness.visual.update({});
    assert.deepEqual(harness.names(), ["renderingStarted"]);
    harness.flush();
    assert.deepEqual(harness.names(), ["renderingStarted"]);
    harness.flush();
    assert.deepEqual(harness.names(), ["renderingStarted", "renderingFinished"]);
});

for (const asynchronous of [false, true]) {
    test(`${asynchronous ? "layout" : "synchronous"} failure cancels pending frames`, () => {
        const harness = createHarness();
        const fail = () => { throw new Error("render failed"); };
        harness.visual.render = () => {
            harness.visual.scheduleLayout(() => undefined);
            if (asynchronous) {
                harness.visual.scheduleLayout(fail);
            } else {
                fail();
            }
        };
        harness.visual.update({});
        if (asynchronous) harness.flush();
        assert.deepEqual(harness.names(), ["renderingStarted", "renderingFailed"]);
        assert.equal(harness.events[1].message, "render failed");
        assert.equal(harness.frames.size, 0);
    });
}

test("a newer update cancels stale layout work", () => {
    const harness = createHarness();
    let staleLayoutRan = false;
    harness.visual.render = () => harness.visual.scheduleLayout(() => { staleLayoutRan = true; });
    harness.visual.update({});
    harness.visual.render = () => undefined;
    harness.visual.update({});
    harness.flush();
    assert.equal(staleLayoutRan, false);
    assert.deepEqual(harness.names(), ["renderingStarted", "renderingFailed", "renderingStarted", "renderingFinished"]);
});

test("destroy cancels rendering and detaches the outside-click handler", () => {
    const harness = createHarness();
    let detached = false;
    let removed = false;
    harness.visual.detachSettingsOutsideClickHandler = () => { detached = true; };
    harness.visual.container = { remove: () => { removed = true; } };
    harness.visual.render = () => harness.visual.scheduleLayout(() => undefined);
    harness.visual.update({});
    harness.visual.destroy();
    assert.equal(harness.frames.size, 0);
    assert.equal(detached, true);
    assert.equal(removed, true);
    assert.deepEqual(harness.names(), ["renderingStarted", "renderingFailed"]);
});

for (const dataPoint of [false, true]) {
    test(`context menu supports ${dataPoint ? "data points" : "empty space"}`, () => {
        const harness = createHarness();
        const selectionId = { key: "measurement-1" };
        let listener;
        let actual;
        let prevented = false;
        let stopped = false;
        const element = { addEventListener: (name, callback) => { assert.equal(name, "contextmenu"); listener = callback; } };
        harness.visual.selectionManager = { showContextMenu: (identity, position) => { actual = { identity, position }; } };
        harness.visual.bindContextMenu(element, dataPoint ? selectionId : undefined);
        listener({ clientX: 25, clientY: 50, preventDefault: () => { prevented = true; }, stopPropagation: () => { stopped = true; } });
        assert.equal(prevented, true);
        assert.equal(stopped, true);
        assert.equal(actual.position.x, 25);
        assert.equal(actual.position.y, 50);
        if (dataPoint) assert.equal(actual.identity, selectionId);
        else assert.equal(Object.keys(actual.identity).length, 0);
    });
}

test("selection is disabled when the host disallows interactions", () => {
    const harness = createHarness();
    harness.visual.host.hostCapabilities = { allowInteractions: false };
    harness.visual.selectedGraphSeries = new Set();
    harness.visual.toggleGraphSeries("measurement-1", {}, false);
    assert.equal(harness.visual.selectedGraphSeries.size, 0);
});

test("keyboard activation accepts Enter and Space and ignores other keys", () => {
    const harness = createHarness();
    const listeners = {};
    const element = { addEventListener: (name, callback) => { listeners[name] = callback; } };
    const activated = [];
    harness.visual.bindKeyboardActivation(element, (event) => activated.push(event.key));
    for (const key of ["Enter", " ", "ArrowDown"]) {
        let prevented = false;
        listeners.keydown({ key, preventDefault: () => { prevented = true; } });
        assert.equal(prevented, key !== "ArrowDown");
    }
    assert.deepEqual(activated, ["Enter", " "]);
});

test("all UI and field-role localization keys exist in both supported locales", () => {
    const english = JSON.parse(fs.readFileSync(path.join(__dirname, "../stringResources/en-US/resources.resjson"), "utf8"));
    const dutch = JSON.parse(fs.readFileSync(path.join(__dirname, "../stringResources/nl-NL/resources.resjson"), "utf8"));
    const capabilities = JSON.parse(fs.readFileSync(path.join(__dirname, "../capabilities.json"), "utf8"));
    const uiKeys = [...source.matchAll(/localize\(\s*"([^"]+)"/g)].map((match) => match[1]);
    const formattingKeys = [...source.matchAll(/"[^"]+":\s*"(Format_[^"]+)"/g)].map((match) => match[1]);
    const roleKeys = capabilities.dataRoles.map((role) => role.displayNameKey);
    const missing = [...new Set([...uiKeys, ...formattingKeys, ...roleKeys])].filter((key) => !(key in english) || !(key in dutch));
    assert.deepEqual(missing, []);
    assert.deepEqual(Object.keys(english).sort(), Object.keys(dutch).sort());
});

test("all fixed formatting display names are covered by the localization mapping", () => {
    const settingsSource = fs.readFileSync(path.join(__dirname, "../src/settings.ts"), "utf8");
    const displayNames = [...settingsSource.matchAll(/displayName\s*[:=]\s*"([^"]+)"/g)].map((match) => match[1]);
    const mappings = new Set([...source.matchAll(/"([^"]+)":\s*"Format_[^"]+"/g)].map((match) => match[1]));
    const missing = [...new Set(displayNames)].filter((name) => !mappings.has(name) && !/^Detail \d+$/.test(name));
    assert.deepEqual(missing, []);
});

test("formatting labels receive Power BI localization keys", () => {
    const harness = createHarness();
    const group = { displayName: "Titel", slices: [{ displayName: "Tekstkleur" }] };
    const model = { cards: [{ displayName: "Algemeen", groups: [group] }] };
    group.parent = model;
    harness.visual.localizationManager = { getDisplayName: (key) => key };
    harness.visual.formattingSettings = model;
    harness.visual.localizeFormattingLabels();
    assert.equal(model.cards[0].displayNameKey, "Format_General");
    assert.equal(group.displayNameKey, "Format_Title");
    assert.equal(group.slices[0].displayNameKey, "Format_FontColor");
});

test("high-contrast theme uses the Power BI host palette", () => {
    const harness = createHarness();
    const classes = new Set();
    const properties = {};
    harness.visual.container = {
        classList: {
            toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name)
        },
        style: { setProperty: (name, value) => { properties[name] = value; } }
    };
    harness.visual.host.colorPalette = {
        isHighContrast: true,
        foreground: { value: "#ffffff" },
        background: { value: "#000000" },
        foregroundSelected: { value: "#ffff00" }
    };
    harness.visual.applyAccessibilityTheme();
    assert.equal(classes.has("rlg-high-contrast"), true);
    assert.equal(properties["--rlg-hc-foreground"], "#ffffff");
    assert.equal(properties["--rlg-hc-background"], "#000000");
    assert.equal(properties["--rlg-hc-selected"], "#ffff00");
});

test("keyboard pane resizing respects pane minimums and preserves total height", () => {
    const harness = createHarness();
    const heights = new Map([["table", 200], ["debug", 200]]);
    harness.visual.getPaneHeight = (key) => heights.get(key);
    harness.visual.getMinimumPaneHeight = () => 120;
    harness.visual.getRenderedPaneHeight = () => 400;
    harness.visual.setResizablePaneHeight = (key, height) => heights.set(key, height);

    harness.visual.resizePanesByKeyboard({ key: "table", defaultHeight: 200 }, { key: "debug", defaultHeight: 200 }, 10);
    assert.equal(heights.get("table"), 210);
    assert.equal(heights.get("debug"), 190);

    heights.set("table", 120);
    heights.set("debug", 280);
    harness.visual.resizePanesByKeyboard({ key: "table", defaultHeight: 120 }, { key: "debug", defaultHeight: 280 }, -40);
    assert.equal(heights.get("table"), 120);
    assert.equal(heights.get("debug"), 280);
});

test("rich text renders untrusted markup as text and only creates sub/sup elements", () => {
    const harness = createHarness();
    const parent = { children: [], appendChild(child) { this.children.push(child); } };
    harness.visual.appendHtmlRichText(parent, '<img src=x onerror=alert(1)>Dn<sub>T</sub><sup>2</sup><script>alert(1)</script>');
    assert.deepEqual(parent.children.map((child) => child.tagName), ["span", "sub", "sup", "span"]);
    assert.equal(parent.children[0].textContent, '<img src=x onerror=alert(1)>Dn');
    assert.equal(parent.children[3].textContent, '<script>alert(1)</script>');
});

test("patched braces preserves expansion and rejects excessive nesting", () => {
    const braces = require("braces");
    assert.deepEqual(braces.expand("{a,b}"), ["a", "b"]);
    const nested = "{".repeat(1000) + "a,b" + "}".repeat(1000);
    for (const operation of [braces, braces.parse, braces.expand]) {
        assert.throws(() => operation(nested), /exceeds max depth/);
    }
});

test("sockjs can use the patched uuid CommonJS API", () => {
    const { createRequire } = require("node:module");
    const sockjsRequire = createRequire(require.resolve("sockjs/package.json"));
    const uuid = sockjsRequire("uuid");
    assert.match(uuid.v4(), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});