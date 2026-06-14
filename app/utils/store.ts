import { ActionHandlerError, toError } from "@diphyx/harlemify/runtime";

// Throws the given streaming-request error as an ActionHandlerError, if present.
export function ensure(error: MaybeError) {
    if (error) {
        throw toError(error, ActionHandlerError);
    }
}
