export default class RemoveGlossaryCommand extends Command {
    execute({ id }: {
        id: any;
    }): void;
    _findGlossary(root: any, id: any): any;
}
import Command from "@ckeditor/ckeditor5-core/src/command";
