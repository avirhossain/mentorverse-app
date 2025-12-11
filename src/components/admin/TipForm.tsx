'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
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
import { getThumbnailFromUrl } from '@/ai/flows/thumbnail-flow';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const tipFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters.'),
  linkUrl: z.string().url().optional().or(z.literal('')),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
});

type TipFormValues = z.infer<typeof tipFormSchema>;

interface TipFormProps {
  tip?: Tip | null;
  onSubmit: (data: Partial<Tip>) => void;
}

export const TipForm: React.FC<TipFormProps> = ({ tip, onSubmit }) => {
  const [isFetchingThumbnail, setIsFetchingThumbnail] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    tip?.imageUrl || null
  );
  const { toast } = useToast();

  const form = useForm<TipFormValues>({
    resolver: zodResolver(tipFormSchema),
    defaultValues: {
      title: tip?.title || '',
      description: tip?.description || '',
      linkUrl: tip?.linkUrl || '',
      imageUrl: tip?.imageUrl || '',
      isActive: tip?.isActive ?? true,
    },
  });

  const handleLinkBlur = async (
    e: React.FocusEvent<HTMLInputElement, Element>
  ) => {
    const url = e.target.value;
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      setIsFetchingThumbnail(true);
      setThumbnailPreview(null);
      form.setValue('imageUrl', '');
      try {
        const response = await getThumbnailFromUrl({ url });
        if (response?.thumbnailUrl) {
          setThumbnailPreview(response.thumbnailUrl);
          form.setValue('imageUrl', response.thumbnailUrl);
        } else {
          toast({
            variant: 'destructive',
            title: 'Could not fetch thumbnail',
            description:
              'Please check the URL or provide an image URL manually.',
          });
        }
      } catch (error) {
        console.error('Error fetching thumbnail:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'An unexpected error occurred while fetching the thumbnail.',
        });
      } finally {
        setIsFetchingThumbnail(false);
      }
    }
  };

  const handleFormSubmit = (values: TipFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
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
          name="linkUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  {...field}
                  onBlur={handleLinkBlur}
                />
              </FormControl>
              <FormDescription>
                Pasting a YouTube or article link here will try to fetch a thumbnail.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {isFetchingThumbnail && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Fetching thumbnail...</span>
          </div>
        )}

        {thumbnailPreview && (
            <div className="mt-2 space-y-2">
                <Label>Thumbnail Preview</Label>
                <div className='relative w-full aspect-video overflow-hidden rounded-md border'>
                    <Image src={thumbnailPreview} alt="Thumbnail Preview" layout="fill" objectFit="cover" />
                </div>
            </div>
        )}

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Or paste an image URL directly"
                  {...field}
                />
              </FormControl>
              <FormDescription>Manually override the fetched thumbnail.</FormDescription>
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
