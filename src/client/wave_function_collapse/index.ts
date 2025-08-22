import type {TextureName} from "../spritesheet_atlas";
import {directions, rotate, type Texture, type EdgeName} from "./textures";

type Dimensions = {
    width: number;
    height: number;
};

type NeighborWithDirection = {
    index: number;
    direction: number;
};

type Wave = {
    possibilities: Texture[];
    isCollapsed: boolean;
};

type ResultTexture = {
    name: TextureName;
    rotation: number;
    overlay?: TextureName;
};

export default class WaveFunctionCollapse {
    private waves: Wave[];
    private dimensions: Dimensions;

    constructor(textures: Texture[], dimensions: Dimensions) {
        this.dimensions = dimensions;

        const possibilities: Texture[] = textures.flatMap((texture) => {
            return Array.from({length: texture.edges.length}, (_, i) => rotate(texture, i));
        });

        this.waves = Array.from({length: dimensions.width * dimensions.height}, () => ({
            possibilities: [...possibilities],
            isCollapsed: false,
        }));
    }

    run(): ResultTexture[] {
        while (!this.isCollapsed()) {
            this.iterate();
        }

        return this.waves.map(({possibilities: [{name, rotation, overlays}]}) => {
            const random = Math.random();
            let sum = 0;

            return {
                name,
                rotation,
                overlay: overlays.reduce<ResultTexture["overlay"]>((acc, {probability, texture}) => {
                    sum += probability;
                    if (!acc && random < sum) {
                        acc = texture;
                    }

                    return acc;
                }, undefined),
            };
        });
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

    private getEntropy(wave: Wave): number {
        const weightSum = wave.possibilities.reduce((acc, possibility) => {
            return acc + possibility.weight;
        }, 0);
        const logSum = wave.possibilities.reduce((acc, possibility) => {
            return acc + possibility.weight * Math.log(possibility.weight);
        }, 0);

        return Math.log(weightSum) - (logSum / weightSum)
    }

    private getMinEntropyIndex(): number {
        const minEntropy = this.waves.reduce((acc, wave) => {
            if (wave.isCollapsed) {
                return acc;
            }

            return Math.min(acc, this.getEntropy(wave));
        }, Number.MAX_VALUE);

        const minEntropyWaves = this.waves
            .map((wave, index) => ({...wave, index}))
            .filter((wave) => !wave.isCollapsed && this.getEntropy(wave) === minEntropy);

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

        if (!chosenPossibility) {
            throw new Error("no possibility");
        }

        wave.possibilities = [chosenPossibility];
        wave.isCollapsed = true;
    }

    private propagate(index: number): void {
        const stack = [index];
        while (stack.length) {
            const currentIndex = stack.pop()!;

            const validNeighbors = this.getValidNeighbors(currentIndex);
            validNeighbors.forEach(({index, direction}) => {
                const neighbor = this.waves[index];
                const validNeighborPossibilities = this.getValidNeighborPossibilities(currentIndex, direction, index);

                if (validNeighborPossibilities.length < neighbor.possibilities.length) {
                    neighbor.possibilities = validNeighborPossibilities;
                    if (!stack.some((i) => i === index)) {
                        stack.push(index);
                    }
                }
            });
        }
    }

    private getValidNeighborPossibilities(currentIndex: number, direction: number, neighborIndex: number): Texture[] {
        const currentWave = this.waves[currentIndex];
        const neighborWave = this.waves[neighborIndex];
        const oppositeDirection = this.getOppositeDirection(direction);

        return neighborWave.possibilities.filter((neighborPossibility) => {
            const neighborEdge = neighborPossibility.edges[oppositeDirection];

            return currentWave.possibilities.some((currentPossibility) => {
                const currentEdge = currentPossibility.edges[direction];

                return this.areEdgesMatching(currentEdge, neighborEdge);
            });
        });
    }

    private areEdgesMatching(first: EdgeName, second: EdgeName): boolean {
        return first === second;
        // for (let i = 0; i < first.length; i++) {
        //     if (first[i] !== second[second.length - 1 - i]) {
        //         return false;
        //     }
        // }

        // return true;
    }

    private getValidNeighborIndex(index: number, direction: number): number|null {
        switch (direction) {
        case directions.UP:
            if (index < this.dimensions.width) {
                break;
            }

            return index - this.dimensions.width;
        case directions.RIGHT:
            if ((index + 1) % this.dimensions.width === 0) {
                break;
            }

            return index + 1;
        case directions.DOWN:
            if (index >= this.dimensions.width * (this.dimensions.height - 1)) {
                break;
            }

            return index + this.dimensions.width;
        case directions.LEFT:
            if (index % this.dimensions.width === 0) {
                break;
            }

            return index - 1;
        }

        return null;
    }

    private getValidNeighbors(index: number): NeighborWithDirection[] {
        return Object.values(directions)
            .map((direction) => ({
                direction,
                index: this.getValidNeighborIndex(index, direction)
            }))
            .filter(({index}) => index !== null) as NeighborWithDirection[];
    }

    private getOppositeDirection(direction: number): number {
        const directionIndices = Object.values(directions);
        const half = Math.floor(directionIndices.length / 2);

        return directionIndices[(direction + half) % directionIndices.length];
    }
}
