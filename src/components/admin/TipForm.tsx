'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import type { Tip } from '@/lib/types';

const tipFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters.'),
  isActive: z.boolean().default(true),
});

type TipFormValues = z.infer<typeof tipFormSchema>;

interface TipFormProps {
  tip?: Tip | null;
  onSubmit: (data: Partial<Tip>) => void;
}

export const TipForm: React.FC<TipFormProps> = ({ tip, onSubmit }) => {
  const form = useForm<TipFormValues>({
    resolver: zodResolver(tipFormSchema),
    defaultValues: {
      title: tip?.title || '',
      description: tip?.description || '',
      isActive: tip?.isActive ?? true,
    },
  });

  const handleFormSubmit = (values: TipFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., How to Ace Your Interview"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write the main content of the tip here..."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                You can use Markdown for simple formatting.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Status</FormLabel>
                <FormDescription>
                  Inactive tips won't be visible to mentees.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="pt-4">
          <Button type="submit">{tip ? 'Save Changes' : 'Create Tip'}</Button>
        </div>
      </form>
    </Form>
  );
};
