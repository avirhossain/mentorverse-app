
'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { Mentor } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

const createMeetingSchema = z.object({
  mentorId: z.string().optional(),
  subject: z.string().min(3, 'Subject must be at least 3 characters long.'),
  isShareable: z.boolean().default(false),
});

type CreateMeetingFormValues = z.infer<typeof createMeetingSchema>;

interface CreateMeetingFormProps {
  mentors: Mentor[];
  isLoading?: boolean;
  onSubmit: (values: CreateMeetingFormValues) => void;
}

export const CreateMeetingForm: React.FC<CreateMeetingFormProps> = ({
  mentors,
  isLoading,
  onSubmit,
}) => {
  const form = useForm<CreateMeetingFormValues>({
    resolver: zodResolver(createMeetingSchema),
    defaultValues: {
      mentorId: 'none',
      subject: 'Instant Meeting',
      isShareable: false,
    },
  });

  const handleFormSubmit = (values: CreateMeetingFormValues) => {
    onSubmit(values);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-10 w-24 ml-auto" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Quick Sync" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mentorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mentor (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Assign a mentor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {mentors.map((mentor) => (
                    <SelectItem key={mentor.id} value={mentor.id}>
                      {mentor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                The mentor assigned to this meeting.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="isShareable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Shareable Link</FormLabel>
                <FormDescription>
                  If enabled, any registered mentee can join with the link.
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
        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Creating...' : 'Create Meeting'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
