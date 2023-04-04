export default class Tab extends Plugin {
    static get requires(): (typeof TabUI)[];
}
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import TabUI from "./tabui";
