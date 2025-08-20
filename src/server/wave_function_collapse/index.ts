import {directions, rotate, type Texture} from "./textures";

type Dimensions = {
    width: number;
    height: number;
};

type Wave = {
    possibilities: Texture[];
    isCollapsed: boolean;
};

export default class WaveFunctionCollapse {
    private waves: Wave[];

    constructor(textures: Texture[], {width, height}: Dimensions) {
        const possibilities: Texture[] = textures.flatMap((texture) => {
            return Array.from({length: texture.edges.length}, (_, i) => rotate(texture, i));
        });

        this.waves = Array.from({length: width * height}, () => ({
            possibilities: [...possibilities],
            isCollapsed: false,
        }));
    }

    run(): Texture[] {
        while (!this.isCollapsed()) {
            this.iterate();
        }

        return this.waves.map(({possibilities: [possibility]}) => possibility);
    }

    private iterate(): void {
        const minEntropyIndex = this.getMinEntropyIndex();
        this.collapse(minEntropyIndex);
        this.propagate(minEntropyIndex);
    }

    private getRandomIndex(length: number): number {
        return Math.floor(Math.random() * length);
    }

    private isCollapsed(): boolean {
        return this.waves.every(({isCollapsed}) => isCollapsed);
    }

    private getMinEntropyIndex(): number {
        const minEntropy = this.waves.reduce((acc, wave) => {
            if (wave.isCollapsed) {
                return acc;
            }

            return Math.min(acc, wave.possibilities.length)
        }, Number.MAX_VALUE);

        const minEntropyWaves = this.waves
            .map((wave, index) => ({...wave, index}))
            .filter((wave) => !wave.isCollapsed && wave.possibilities.length === minEntropy);

        if (minEntropyWaves.length === 0) {
            throw new Error("all waves are collapsed");
        }

        return minEntropyWaves[this.getRandomIndex(minEntropyWaves.length)].index;
    }

    private collapse(index: number): void {
        const wave = this.waves[index];

        const totalWeight = wave.possibilities.reduce((acc, possibility) => {
            return  acc + possibility.weight;
        }, 0);
        const randomWeight = this.getRandomIndex(totalWeight);

        let acc = 0;
        const chosenPossibility = wave.possibilities.find((possibility) => {
            acc += possibility.weight;
            return randomWeight < acc;
        });

        wave.possibilities = [chosenPossibility];
        wave.isCollapsed = true;
    }

    private propagate(index: number): void {
        const stack = [index];
        while (stack.length) {
            const currentIndex = stack.pop();

            Object.values(directions).forEach((direction) => {
                const validNeighborIndex = this.getValidNeighborIndex(currentIndex, direction);
                if (!validNeighborIndex) {
                    return;
                }

                const oppositeDirection = this.getOppositeDirection(direction);

                // filter valid possibilities (reversed edge array on opposite edge)

                // if changed and not in stack -> push to stack
            });
        }
    }

    getValidNeighborIndex(index: number, direction: number): number|null {
        // TODO
        return null;
    }

    getOppositeDirection(direction: number): number {
        const directionIndices = Object.values(directions);
        const half = Math.floor(directionIndices.length / 2);

        return directionIndices[(direction + half) % directionIndices.length];
    }
}
