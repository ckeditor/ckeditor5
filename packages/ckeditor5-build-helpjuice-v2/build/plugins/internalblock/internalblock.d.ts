export default class InternalBlock extends Plugin {
    static get requires(): (typeof InternalBlockUI)[];
}
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import InternalBlockUI from "./internalblockui";
