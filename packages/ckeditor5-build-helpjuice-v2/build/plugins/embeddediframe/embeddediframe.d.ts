export default class EmbeddedIFrame extends Plugin {
    static get requires(): (typeof EmbeddedIFrameEditing)[];
}
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import EmbeddedIFrameEditing from "./embeddediframeediting";
