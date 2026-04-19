---
description: Client components — forms with RHF + Zod/Yup, TanStack Query mutations, field errors, toasts, loading, invalidation
globs: apps/**/src/**/*.tsx
alwaysApply: false
---

# Client forms and mutations

Use this guidance in files with `'use client'` (especially forms and `useMutation`).

## Stack

- **Form UI**: Prefer shadcn-style `Form` / `FormField` / `FormItem` / `FormControl` / `FormLabel` / `FormMessage` from the app’s `@/components/ui/form` (wraps `react-hook-form`). Use plain `<form>` only when there is no form primitive in that app yet.
- **Validation**: `react-hook-form` + **Zod** (`zodResolver` from `@hookform/resolvers/zod`) or **Yup** (`yupResolver`) if the feature already uses Yup. Keep schema next to the form or under `lib/validation/`.
- **Server state**: `@tanstack/react-query` — `useQuery` for GETs, `useMutation` for POST/PATCH/PUT/DELETE.

## Validation errors on inputs

- Wire each field through `FormField` + `FormControl` so **`FormMessage`** (or equivalent) shows `fieldState.error` for that input.
- Do not rely only on a single banner for schema errors; users must see which field failed.

## API feedback (toast)

- **On mutation error** (`onError` or `mutation.isError` after user action): show a **toast** with a clear message (this repo often uses `toast` from `sonner`; use the same toast system already wired in that app’s providers).
- **On mutation success**: show a **success toast** when the action is user-visible (create/update/delete); skip only for silent background sync.

## Submit button loading

- Disable the submit control while `mutation.isPending` (or `form.formState.isSubmitting` if the mutation is triggered from `handleSubmit` without a separate pending flag).
- Show a **loading indicator** on the button (`Loader2` + `animate-spin`, `Button` `disabled`, etc.) so the user knows the request is in flight.

## Invalidate GET data after writes

- After a successful **POST / PATCH / PUT / DELETE**, call `queryClient.invalidateQueries({ queryKey: ... })` for every **GET** query that should reflect the change (lists, detail, counts). Reuse the same `queryKey` factories/constants as the corresponding `useQuery` (e.g. shared `query-keys` module where the app has one).

## Minimal pattern (conceptual)

```tsx
const form = useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: { ... },
});

const qc = useQueryClient();
const mutation = useMutation({
  mutationFn: api.update,
  onSuccess: async () => {
    toast.success('Saved');
    await qc.invalidateQueries({ queryKey: itemKeys.detail(id) });
    await qc.invalidateQueries({ queryKey: itemKeys.list() });
  },
  onError: (err) => {
    toast.error(messageFrom(err));
  },
});

<Form {...form}>
  <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
    <FormField
      control={form.control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Title</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit" disabled={mutation.isPending}>
      {mutation.isPending ? <Loader2 className="animate-spin" /> : null}
      Save
    </Button>
  </form>
</Form>
```
