import { InteractableType } from "../../types/interactable_type";
import { TileContent } from "../tile_content";

export abstract class Interactable extends TileContent{
    constructor(
        public interactable: InteractableType,
    ){
        super(interactable,false)
    }
}
