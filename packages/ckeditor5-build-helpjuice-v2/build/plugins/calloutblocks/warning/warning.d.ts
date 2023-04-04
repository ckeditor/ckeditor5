export default class Warning extends Plugin {
    static get requires(): (typeof WarningUI)[];
}
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import WarningUI from "./warningui";
