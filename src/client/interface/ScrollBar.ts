import {Application, Container, Graphics} from 'pixi.js';

export class ScrollBar {
    private readonly thumb: Graphics;
    private readonly thumbStroke: Graphics;
    private readonly track: Graphics;
    private scrollY = 0;
    private dragging = false;
    private dragOffset = 0;
    private pointerIsOver = false;
    private readonly wheelHandler: (ev: WheelEvent) => void;

    constructor(
        private content: Container,
        private contentHeight: number,
        private viewportH: number,
        private parent: Container,
        private scrollbarX: number,
        private scrollbarY: number,
        private scrollbarW: number,
        private scrollbarH: number,
        private app: Application,
    ) {
        this.track = new Graphics();
        this.track.beginFill(0x2b2b34);
        this.track.drawRoundedRect(this.scrollbarX, this.scrollbarY, this.scrollbarW, this.scrollbarH, 6);
        this.track.endFill();
        this.parent.addChild(this.track);

        this.thumb = new Graphics();
        this.thumbStroke = new Graphics();
        this.parent.addChild(this.thumb, this.thumbStroke);

        this.thumb.interactive = true;
        this.thumb.on('pointerdown', (e) => {
            this.dragging = true;
            const pointY = e.data.getLocalPosition(this.parent).y;
            this.dragOffset = pointY - (this.thumb as any).__top ;
        });

        this.app.stage.on('pointermove', (e) => {
            if (!this.dragging) return;
            const pointY = e.data.getLocalPosition(this.parent).y;
            const thumbH = (this.thumb as any).__height ?? 28;
            const clamped = this.clamp(pointY - this.dragOffset, this.scrollbarY + 4, this.scrollbarY + this.scrollbarH - thumbH - 4);
            this.setScrollY(((clamped - this.scrollbarY) / (this.scrollbarH - thumbH)) * Math.max(0, this.contentHeight - this.viewportH));
        });

        const stopDrag = () => (this.dragging = false);
        this.app.stage.on('pointerup', stopDrag).on('pointerupoutside', stopDrag);

        this.parent.interactive = true;
        this.parent.on('pointerover', () => (this.pointerIsOver = true)).on('pointerout', () => (this.pointerIsOver = false));

        this.wheelHandler = (ev: WheelEvent) => {
            if (!this.pointerIsOver) return;
            ev.preventDefault();
            this.setScrollY(this.scrollY + ev.deltaY);
        };
        this.app.view.addEventListener('wheel', this.wheelHandler, { passive: false });

        this.parent.on('removed', () => {
            this.app.view.removeEventListener('wheel', this.wheelHandler);
        });

        this.setScrollY(0);
    }

    private clamp(v: number, a: number, b: number) {
        return Math.max(a, Math.min(v, b));
    }

    private updateThumb() {
        const ratio = Math.min(1, this.viewportH / Math.max(1, this.contentHeight));
        const thumbH = Math.max(28, this.scrollbarH * ratio);
        const top = this.scrollbarY + (this.scrollY / Math.max(1, this.contentHeight - this.viewportH)) * (this.scrollbarH - thumbH);

        this.thumb.clear()
            .beginFill(0x222533)
            .drawRoundedRect(this.scrollbarX + 4, top + 4, this.scrollbarW - 8, thumbH - 8, 4)
            .endFill();

        this.thumbStroke.clear()
            .lineStyle(2, 0x3f4650)
            .drawRect(this.scrollbarX + 5, top + 6, this.scrollbarW - 10, thumbH - 12);

        (this.thumb as any).__top = top;
        (this.thumb as any).__height = thumbH;
    }

    public setScrollY(v: number) {
        this.scrollY = this.clamp(v, 0, Math.max(0, this.contentHeight - this.viewportH));
        this.content.y = -this.scrollY;
        this.updateThumb();
    }
}
