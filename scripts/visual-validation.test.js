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