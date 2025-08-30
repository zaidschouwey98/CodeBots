import { InteractableType } from "../../types/interactable_type";
import Tile from "../tile";
import { TileContent } from "../tile_content";

export abstract class Interactable extends TileContent{
    constructor(
        public interactable: InteractableType, tile:Tile
    ){
        super(interactable,false, tile)
    }
}
