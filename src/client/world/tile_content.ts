import { TileContentType } from "../types/tile_content_type";

export abstract class TileContent{
    constructor(
        public tileContentType:TileContentType,
        public walkable:boolean
        ){
    }
}
