// Shape returned by form server actions and read by useActionState on the client.
export interface FormState {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}
