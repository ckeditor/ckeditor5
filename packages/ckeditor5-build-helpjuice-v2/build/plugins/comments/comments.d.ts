export default class Comments extends Plugin {
    static get requires(): (typeof CommentsEditing)[];
    static get pluginName(): string;
}
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import CommentsEditing from "./commentsediting";
