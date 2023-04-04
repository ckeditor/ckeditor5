export default class Info extends Plugin {
    static get requires(): (typeof SuccessUI)[];
}
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import SuccessUI from "./successui";
