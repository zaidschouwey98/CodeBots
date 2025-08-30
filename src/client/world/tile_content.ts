import { TileContentType } from "../types/tile_content_type";
import Tile from "./tile";

export abstract class TileContent{
    constructor(
        public tileContentType:TileContentType,
        public walkable:boolean,
        public tile:Tile
        ){
    }
}
