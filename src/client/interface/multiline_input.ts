import {Graphics, Text, TextStyle} from "pixi.js";
import {ScrollBar} from "./scroll_bar";

/**
 * MultilineInput
 *
 * A custom multi-line text input field built with PixiJS
 * - Supports typing, deleting, and navigating text with arrow keys
 * - Handles paste, tab, and enter for multi-line text editing
 * - Can scroll vertically with a ScrollBar
 */
export class MultilineInput extends Graphics {
    public lines: string[] = [];
    private texts: Text[] = [];
    private _caret: Graphics;
    private cursorLine = 0;
    private cursorChar = 0;
    private focused = false;
    private blinkTimer?: number;

    private _bg: Graphics;

    private readonly padding = 8;
    private readonly fontSize = 14;
    private readonly fallbackLineHeight = Math.round(this.fontSize * 1.4);
    private readonly fontFamily = "Jersey";
    private readonly _textFill = "#ffffff";
    private readonly _textStroke = "#000000";
    private readonly resolution = 2;

    private _bgFill = 0x2a2727;
    private _bgAlpha = 0.25;
    private _borderWidth = 2;
    private _borderColor = 0x000000;

    private readonly viewportWidth: number;
    private readonly viewportHeight: number;

    public contentHeight = 0;
    private measureText: Text;

    private _scrollbar: ScrollBar;
    private _baseY = 0;

    public autoScrollToCaret = true;
    private _snapToBottomOnAppend = true;
    private _justAppended = false; // internal marker set before render when adding at end

    /**
     * Creates a multiline text input field
     * @param width Total width of the input box
     * @param viewportHeight Height of the visible area (without scrolling)
     * @param initialText Optional initial text to display
     */
    constructor(width: number, viewportHeight: number, initialText = "") {
        super();
        this.viewportWidth = width;
        this.viewportHeight = viewportHeight;

        this.lines = initialText.length ? initialText.split("\n") : [""];
        if (this.lines.length === 0) this.lines.push("");

        this.interactive = true;

        this._bg = new Graphics();
        this.addChild(this._bg);

        this.measureText = new Text("", new TextStyle({
            fontFamily: this.fontFamily,
            fontSize: this.fontSize,
        }));
        this.measureText.resolution = this.resolution;

        // initial render
        this.renderLines();

        this._caret = new Graphics();
        this.addChild(this._caret);
        this.updateCaretGraphics();

        this.on("pointerdown", (e: any) => {
            const local = e.data.getLocalPosition(this);
            this.focus();
            this.placeCaretFromPoint(local.x, local.y);
            if (this.autoScrollToCaret) this.ensureCaretVisible();
        });

        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("paste", () => this.paste());

        this.blinkTimer = window.setInterval(() => {
            this._caret.visible = !this._caret.visible;
        }, 500);

        // when fonts load, re-render to fix initial metrics + notify scrollbar
        if (typeof (document as any).fonts !== "undefined" && (document as any).fonts?.ready) {
            (document as any).fonts.ready.then(() => {
                this.renderLines();
                this.updateCaretGraphics();
                this._notifyScrollBar();
            }).catch(() => { /* ignore */
            });
        }
    }

    // ---------- scrollbar integration ----------
    public setScrollBar(scrollbar: ScrollBar) {
        this._scrollbar = scrollbar;
        // must call after this.x/this.y set and after being added to parent
        this._baseY = (this.y ?? 0);

        this._scrollbar.setOnScroll((scrollTop: number) => this.scrollTo(scrollTop));
        this._notifyScrollBar();
        this._clampYAndSyncScrollbar();
    }

    private _notifyScrollBar() {
        if (!this._scrollbar) return;
        this._scrollbar.update(this.contentHeight, this.viewportHeight);
    }

    private _clampYAndSyncScrollbar() {
        if (!this._scrollbar) return;
        const maxScroll = Math.max(0, this.contentHeight - this.viewportHeight);
        let scrollTop = this._baseY - (this.y ?? this._baseY);
        scrollTop = Math.max(0, Math.min(maxScroll, scrollTop));
        this.y = this._baseY - scrollTop;
        this._scrollbar.scrollTo(scrollTop);
    }

    public scrollTo(scrollTop: number) {
        const max = Math.max(0, this.contentHeight - this.viewportHeight);
        const st = Math.max(0, Math.min(max, scrollTop));
        this.y = this._baseY - st;
    }

    // ---------- rendering ----------
    private renderLines() {
        for (const t of this.texts) t.destroy();
        this.texts = [];

        let y = this.padding;
        const style = new TextStyle({
            fill: this._textFill,
            fontSize: this.fontSize,
            fontFamily: this.fontFamily,
            stroke: this._textStroke,
        });

        for (let i = 0; i < this.lines.length; i++) {
            const txt = new Text(this.lines[i], style);
            txt.resolution = this.resolution;
            txt.x = this.padding;
            txt.y = y;
            this.addChild(txt);
            this.texts.push(txt);

            y += this.fontSize;
        }

        const old = this.contentHeight;
        this.contentHeight = Math.max(y + this.padding * 2, this.viewportHeight);

        // expose logical size (for compatibility)
        this.height = this.contentHeight;
        this.width = this.viewportWidth;

        // redraw background + border to match new size
        this._bg.clear();
        this._bg.beginFill(this._bgFill, this._bgAlpha);
        this._bg.drawRect(0, 0, this.viewportWidth, this.contentHeight);
        this._bg.endFill();
        if (this._borderWidth > 0) {
            this._bg.lineStyle(this._borderWidth, this._borderColor, 1);
            this._bg.drawRect(0, 0, this.viewportWidth, this.contentHeight);
            this._bg.endFill();
        }
        this.setChildIndex(this._bg, 0);

        // notify scrollbar and clamp/sync current y
        if (this.contentHeight !== old) {
            this._notifyScrollBar();
            this._clampYAndSyncScrollbar();

            // if we just appended at the end and snap option enabled -> scroll to bottom
            if (this._snapToBottomOnAppend && this._justAppended) {
                const maxScroll = Math.max(0, this.contentHeight - this.viewportHeight);
                this.scrollTo(maxScroll);
                if (typeof this._scrollbar?.scrollTo === "function") {
                    this._scrollbar.scrollTo(maxScroll);
                }
            }
            this._justAppended = false;
            // ensure caret visible if requested
            if (this.autoScrollToCaret) this.ensureCaretVisible();
        }
    }

    private updateCaretGraphics() {
        if (this.cursorLine < 0) this.cursorLine = 0;
        if (this.cursorLine >= this.lines.length) this.cursorLine = this.lines.length - 1;
        const line = this.lines[this.cursorLine] ?? "";

        if (this.cursorChar < 0) this.cursorChar = 0;
        if (this.cursorChar > line.length) this.cursorChar = line.length;

        this.measureText.text = line.slice(0, this.cursorChar);
        const x = this.padding + this.measureText.width;

        let yLocal = this.padding + this.cursorLine * this.fallbackLineHeight;
        if (this.texts[this.cursorLine]) yLocal = this.texts[this.cursorLine].y;

        this._caret.clear();
        this._caret.beginFill(0xffffff);
        this._caret.drawRect(x, yLocal, 2, this.fontSize);
        this._caret.endFill();
        this._caret.visible = this.focused;
    }

    private charIndexFromX(lineText: string, localX: number): number {
        const x = Math.max(0, localX - this.padding);
        for (let i = 0; i < lineText.length; i++) {
            this.measureText.text = lineText.slice(0, i + 1);
            if (this.measureText.width >= x) return i;
        }
        return lineText.length;
    }

    private placeCaretFromPoint(localX: number, localY: number) {
        const lineIdx = Math.floor((localY - this.padding) / this.fontSize);
        this.cursorLine = Math.min(Math.max(lineIdx, 0), this.lines.length - 1);
        this.cursorChar = this.charIndexFromX(this.lines[this.cursorLine], localX);
        this.updateCaretGraphics();
    }

    private ensureCaretVisible() {
        if (!this.texts[this.cursorLine] || !this._scrollbar) return;
        const caretTop = this.texts[this.cursorLine].y;
        const caretBottom = caretTop + this.texts[this.cursorLine].height;

        const currentScrollTop = this._baseY - (this.y ?? this._baseY);
        const viewportTop = currentScrollTop;
        const viewportBottom = currentScrollTop + this.viewportHeight;

        if (caretTop < viewportTop) {
            this.scrollTo(caretTop);
            this._scrollbar.scrollTo(caretTop);
        } else if (caretBottom > viewportBottom) {
            this.scrollTo(caretBottom - this.viewportHeight);
            this._scrollbar.scrollTo(caretBottom - this.viewportHeight);
        }
    }

    // ---------- keyboard handling ----------
    private focus() {
        this.focused = true;
        this._caret.visible = true;
    }

    private onKeyDown = (e: KeyboardEvent) => {
        if (!this.focused) return;

        // Printable char
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            const line = this.lines[this.cursorLine] ?? "";
            // if we are at the very end (last line, at its end) and append happens, mark _justAppended
            if (this.cursorLine === this.lines.length - 1 && this.cursorChar === line.length) {
                this._justAppended = true;
            }

            this.lines[this.cursorLine] = line.slice(0, this.cursorChar) + e.key + line.slice(this.cursorChar);
            this.cursorChar += 1;
            this.renderLines();
            this.updateCaretGraphics();
            if (this.autoScrollToCaret) this.ensureCaretVisible();
            e.preventDefault();
            return;
        }

        switch (e.key) {
            case "Backspace": {
                const line = this.lines[this.cursorLine] ?? "";
                if (this.cursorChar > 0) {
                    this.lines[this.cursorLine] = line.slice(0, this.cursorChar - 1) + line.slice(this.cursorChar);
                    this.cursorChar -= 1;
                } else if (this.cursorLine > 0) {
                    const prev = this.lines[this.cursorLine - 1];
                    const newPos = prev.length;
                    this.lines[this.cursorLine - 1] = prev + line;
                    this.lines.splice(this.cursorLine, 1);
                    this.cursorLine -= 1;
                    this.cursorChar = newPos;
                }
                this.renderLines();
                this.updateCaretGraphics();
                if (this.autoScrollToCaret) this.ensureCaretVisible();
                e.preventDefault();
                break;
            }

            case "Delete": {
                const line = this.lines[this.cursorLine] ?? "";
                if (this.cursorChar < line.length) {
                    this.lines[this.cursorLine] = line.slice(0, this.cursorChar) + line.slice(this.cursorChar + 1);
                } else if (this.cursorLine < this.lines.length - 1) {
                    this.lines[this.cursorLine] = line + this.lines[this.cursorLine + 1];
                    this.lines.splice(this.cursorLine + 1, 1);
                }
                this.renderLines();
                this.updateCaretGraphics();
                if (this.autoScrollToCaret) this.ensureCaretVisible();
                e.preventDefault();
                break;
            }

            case "Enter": {
                const line = this.lines[this.cursorLine] ?? "";
                // if we are at the last line and split -> consider as append
                if (this.cursorLine === this.lines.length - 1) {
                    this._justAppended = true;
                }
                const before = line.slice(0, this.cursorChar);
                const after = line.slice(this.cursorChar);
                this.lines[this.cursorLine] = before;
                this.lines.splice(this.cursorLine + 1, 0, after);
                this.cursorLine += 1;
                this.cursorChar = 0;
                this.renderLines();
                this.updateCaretGraphics();
                if (this.autoScrollToCaret) this.ensureCaretVisible();
                e.preventDefault();
                break;
            }

            case "ArrowLeft": {
                if (this.cursorChar > 0) {
                    this.cursorChar -= 1;
                } else if (this.cursorLine > 0) {
                    this.cursorLine -= 1;
                    this.cursorChar = this.lines[this.cursorLine].length;
                }
                this.updateCaretGraphics();
                if (this.autoScrollToCaret) this.ensureCaretVisible();
                e.preventDefault();
                break;
            }

            case "ArrowRight": {
                const line = this.lines[this.cursorLine] ?? "";
                if (this.cursorChar < line.length) {
                    this.cursorChar += 1;
                } else if (this.cursorLine < this.lines.length - 1) {
                    this.cursorLine += 1;
                    this.cursorChar = 0;
                }
                this.updateCaretGraphics();
                if (this.autoScrollToCaret) this.ensureCaretVisible();
                e.preventDefault();
                break;
            }

            case "ArrowUp": {
                if (this.cursorLine > 0) {
                    this.cursorLine -= 1;
                    this.cursorChar = Math.min(this.cursorChar, this.lines[this.cursorLine].length);
                }
                this.updateCaretGraphics();
                if (this.autoScrollToCaret) this.ensureCaretVisible();
                e.preventDefault();
                break;
            }

            case "ArrowDown": {
                if (this.cursorLine < this.lines.length - 1) {
                    this.cursorLine += 1;
                    this.cursorChar = Math.min(this.cursorChar, this.lines[this.cursorLine].length);
                }
                this.updateCaretGraphics();
                if (this.autoScrollToCaret) this.ensureCaretVisible();
                e.preventDefault();
                break;
            }

            case "Tab": {
                const line = this.lines[this.cursorLine] ?? "";
                if (this.cursorLine === this.lines.length - 1 && this.cursorChar === line.length) {
                    this._justAppended = true;
                }
                this.lines[this.cursorLine] = line.slice(0, this.cursorChar) + "  " + line.slice(this.cursorChar);
                this.cursorChar += 2;
                this.renderLines();
                this.updateCaretGraphics();
                if (this.autoScrollToCaret) this.ensureCaretVisible();
                e.preventDefault();
                break;
            }

            default:
                break;
        }
    };

    private paste() {
        navigator.clipboard.readText().then(text => {
            if (!this.focused) return;
            if (!text) return;

            const line = this.lines[this.cursorLine] ?? "";
            // if we are at the very end (last line, at its end) and append happens, mark _justAppended
            if (this.cursorLine === this.lines.length - 1 && this.cursorChar === line.length) {
                this._justAppended = true;
            }

            const before = line.slice(0, this.cursorChar);
            const after = line.slice(this.cursorChar);
            const newLines = text.split("\n");
            if (newLines.length === 1) {
                // simple paste
                this.lines[this.cursorLine] = before + text + after;
                this.cursorChar += text.length;
            } else {
                // multi-line paste
                const middleLines = newLines.slice(1, -1);
                this.lines[this.cursorLine] = before + newLines[0];
                this.lines.splice(this.cursorLine + 1, 0, ...middleLines, newLines[newLines.length - 1] + after);
                this.cursorLine += newLines.length - 1;
                this.cursorChar = newLines[newLines.length - 1].length;
            }

            this.renderLines();
            this.updateCaretGraphics();
            if (this.autoScrollToCaret) this.ensureCaretVisible();
        }).catch((err) => {
            console.error("Failed to read from clipboard:", err);
        });
    }

    public getText(): string {
        return this.lines.join("\n");
    }

    public setText(t: string) {
        this.lines = t.length ? t.split("\n") : [""];
        this.cursorLine = 0;
        this.cursorChar = 0;
        this.renderLines();
        this.updateCaretGraphics();
    }

    public destroy(options?: any): void {
        if (this.blinkTimer) window.clearInterval(this.blinkTimer);
        window.removeEventListener("keydown", this.onKeyDown);
        this.measureText.destroy();
        this._caret.destroy();
        for (const t of this.texts) t.destroy();
        this._bg.destroy();
        super.destroy(options);
        this._scrollbar.destroy();
    }
}
