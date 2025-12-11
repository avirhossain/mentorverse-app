'use client';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
  designation: z.string().optional(),
  company: z.string().optional(),
  bio: z.string().optional(),
  expertise: z.string().optional(), // Handled as comma-separated string
  education: z.string().optional(),
  experience: z.string().optional(),
  awards: z.string().optional(), // Handled as comma-separated string
  whatToExpect: z.string().optional(),
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
      designation: mentor?.designation || '',
      company: mentor?.company || '',
      bio: mentor?.bio || '',
      expertise: mentor?.expertise?.join(', ') || '',
      education: mentor?.education || '',
      experience: mentor?.experience || '',
      awards: mentor?.awards?.join(', ') || '',
      whatToExpect: mentor?.whatToExpect || '',
      isActive: mentor?.isActive ?? true,
    },
  });

  useEffect(() => {
    // Reset form values if the mentor prop changes
    form.reset({
      name: mentor?.name || '',
      email: mentor?.email || '',
      designation: mentor?.designation || '',
      company: mentor?.company || '',
      bio: mentor?.bio || '',
      expertise: mentor?.expertise?.join(', ') || '',
      education: mentor?.education || '',
      experience: mentor?.experience || '',
      awards: mentor?.awards?.join(', ') || '',
      whatToExpect: mentor?.whatToExpect || '',
      isActive: mentor?.isActive ?? true,
    });
  }, [mentor, form]);

  const handleFormSubmit = (values: MentorFormValues) => {
    const expertiseArray =
      values.expertise?.split(',').map((e) => e.trim()).filter(Boolean) || [];
    const awardsArray =
      values.awards?.split(',').map((e) => e.trim()).filter(Boolean) || [];
    
    onSubmit({
      ...values,
      expertise: expertiseArray,
      awards: awardsArray,
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="designation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Designation</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Software Engineer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Google" {...field} />
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

        <FormField
          control={form.control}
          name="experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experience</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the mentor's professional experience..."
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
          name="education"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Education</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="List the mentor's educational background..."
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
          name="awards"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Awards</FormLabel>
              <FormControl>
                <Input placeholder="Google CEO Award, Nobel Prize" {...field} />
              </FormControl>
              <FormDescription>
                Enter any awards, separated by commas.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="whatToExpect"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What you can expect from me</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what a mentee can expect from sessions..."
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

    