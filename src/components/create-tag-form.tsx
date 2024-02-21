import { Check, Loader2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Dialog from '@radix-ui/react-dialog';
import { z } from 'zod';

import { Button } from './ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const createTagSchema = z.object({
  title: z.string().min(3, { message: 'Minimum 3 characters' })
});

type CreateTagSchema = z.infer<typeof createTagSchema>;

function generateSlug(text: string): string {
  const normalizedText = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let slug = normalizedText.trim().replace(/\s+/g, '-').toLowerCase();
  slug = slug.replace(/[^a-z0-9-]+/g, '');

  if (slug.startsWith('-')) {
    slug = slug.substring(1);
  }

  return slug;
}

export function CreateTagForm() {
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch, formState } = useForm<CreateTagSchema>({
    resolver: zodResolver(createTagSchema),
  });

  const slug = watch('title') ? generateSlug(watch('title')) : '';

  const { mutateAsync } = useMutation({
    mutationFn: async ({ title }: CreateTagSchema) => {
      await new Promise(resolve => setTimeout(resolve, 2000));

      await fetch('http://localhost:3333/tags', {
        method: 'POST',
        body: JSON.stringify({
          title,
          slug: generateSlug(title),
          amountOfVideos: 0,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['get-tags']
      });
    }
  });

  async function createTag({ title }: CreateTagSchema) {
    await mutateAsync({ title });
  }

  return (
    <form onSubmit={handleSubmit(createTag)} className="w-full space-y-6">
      <div className="space-y-2.5">
        <label
          htmlFor="title"
          className="block text-sm font-medium"
        >
          Tag name
        </label>
        <input
          {...register('title')}
          type="text"
          id="title"
          className="h-10 w-full bg-zinc-900/20 border border-zinc-800 rounded-lg px-3 py-2"
        />
        {formState.errors?.title && (
          <p className="text-sm text-red-400">{formState.errors.title.message}</p>
        )}
      </div>
      <div className="space-y-2.5">
        <label
          htmlFor="slug"
          className="block text-sm font-medium"
        >
          Slug
        </label>
        <input
          type="text"
          id="slug"
          value={slug}
          readOnly
          className="h-10 w-full bg-zinc-900/20 border border-zinc-800 rounded-lg px-3 py-2"
        />
      </div>
      <div className="flex items-center justify-end gap-2">
        <Dialog.Close asChild>
          <Button>
            <X className="size-3"/>
            Cancel
          </Button>
        </Dialog.Close>
        <Button disabled={formState.isSubmitting} className="py-1.5 px-2.5 rounded-md bg-teal-400 text-teal-950 hover:bg-teal-500">
          {formState.isSubmitting ? <Loader2 className="size-3 animate-spin"/> : <Check className="size-3"/>}
          Save
        </Button>
      </div>
    </form>
  );
}
