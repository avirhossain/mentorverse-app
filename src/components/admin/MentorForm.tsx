'use client';
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { Mentor } from '@/lib/types';
import { Switch } from '../ui/switch';

// Define the validation schema using Zod
const mentorFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  bio: z.string().optional(),
  expertise: z.string().optional(), // Handled as comma-separated string
  hourlyRate: z.coerce.number().min(0, 'Rate must be non-negative.').optional(),
  isActive: z.boolean().default(true),
});

type MentorFormValues = z.infer<typeof mentorFormSchema>;

interface MentorFormProps {
  mentor?: Mentor | null;
  onSubmit: (data: Partial<Mentor>) => void;
}

export const MentorForm: React.FC<MentorFormProps> = ({ mentor, onSubmit }) => {
  const form = useForm<MentorFormValues>({
    resolver: zodResolver(mentorFormSchema),
    defaultValues: {
      name: mentor?.name || '',
      email: mentor?.email || '',
      bio: mentor?.bio || '',
      expertise: mentor?.expertise?.join(', ') || '',
      hourlyRate: mentor?.hourlyRate || 0,
      isActive: mentor?.isActive ?? true,
    },
  });

  useEffect(() => {
    // Reset form values if the mentor prop changes
    form.reset({
      name: mentor?.name || '',
      email: mentor?.email || '',
      bio: mentor?.bio || '',
      expertise: mentor?.expertise?.join(', ') || '',
      hourlyRate: mentor?.hourlyRate || 0,
      isActive: mentor?.isActive ?? true,
    });
  }, [mentor, form]);

  const handleFormSubmit = (values: MentorFormValues) => {
    const expertiseArray =
      values.expertise?.split(',').map((e) => e.trim()).filter(Boolean) || [];
    
    onSubmit({
      ...values,
      expertise: expertiseArray,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Dr. John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biography</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little bit about the mentor..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="expertise"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expertise</FormLabel>
              <FormControl>
                <Input placeholder="AI, Machine Learning, Python" {...field} />
              </FormControl>
              <FormDescription>
                Enter areas of expertise, separated by commas.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="hourlyRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hourly Rate ($)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Status</FormLabel>
                <FormDescription>
                  Inactive mentors won't be visible in the mentee app.
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
          <Button type="submit">
            {mentor ? 'Save Changes' : 'Create Mentor'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
