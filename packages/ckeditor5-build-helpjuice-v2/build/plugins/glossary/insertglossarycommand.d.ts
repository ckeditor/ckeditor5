export default class InsertGlossaryCommand extends Command {
    execute({ id, definition, upvotes, downvotes, userid, username, range }: {
        id: any;
        definition: any;
        upvotes?: string | undefined;
        downvotes?: string | undefined;
        userid?: string | undefined;
        username?: string | undefined;
        range: any;
    }): void;
    createGlossaryAttribute(writer: any, id: any, definition: any, upvotes: any, downvotes: any, userid: any, username: any, range: any): void;
}
import Command from "@ckeditor/ckeditor5-core/src/command";
