import {
  AuthorizationError,
  ConflictError,
  ValidationError,
} from "@/modules/auth/errors";

export function getActionErrorMessage(error: unknown): string {
  if (
    error instanceof AuthorizationError ||
    error instanceof ConflictError ||
    error instanceof ValidationError
  ) {
    return error.message;
  }

  return "No se pudo completar la operación. Revisa los datos e inténtalo nuevamente.";
}
