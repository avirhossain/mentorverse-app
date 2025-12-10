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
import type { Mentee } from '@/lib/types';
import { Switch } from '../ui/switch';

const menteeFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
});

type MenteeFormValues = z.infer<typeof menteeFormSchema>;

interface MenteeFormProps {
  mentee?: Mentee | null;
  onSubmit: (data: Partial<Mentee>) => void;
}

export const MenteeForm: React.FC<MenteeFormProps> = ({ mentee, onSubmit }) => {
  const form = useForm<MenteeFormValues>({
    resolver: zodResolver(menteeFormSchema),
    defaultValues: {
      name: mentee?.name || '',
      email: mentee?.email || '',
      phone: mentee?.phone || '',
      isActive: mentee?.isActive ?? true,
    },
  });

  const handleFormSubmit = (values: MenteeFormValues) => {
    onSubmit(values);
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
                  <Input placeholder="Jane Doe" {...field} />
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
                  <Input placeholder="jane.doe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="+123456789" {...field} />
              </FormControl>
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
                <FormLabel>Account Status</FormLabel>
                <FormDescription>
                  Inactive mentees cannot log in to the application.
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
            {mentee ? 'Save Changes' : 'Create Mentee'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
