export default class Info extends Plugin {
    static get requires(): (typeof InfoUI)[];
}
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import InfoUI from "./infoui";
