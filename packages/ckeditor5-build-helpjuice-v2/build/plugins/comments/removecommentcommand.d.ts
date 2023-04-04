export default class RemoveCommentCommand extends Command {
    execute({ value }: {
        value: any;
    }): void;
    _findComment(root: any, id: any): any;
}
import Command from "@ckeditor/ckeditor5-core/src/command";
