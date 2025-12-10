'use client';
import React from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { Session, Mentor } from '@/lib/types';

// Define the validation schema using Zod
const sessionFormSchema = z.object({
  name: z.string().min(3, 'Session name must be at least 3 characters.'),
  mentorId: z.string().min(1, 'A mentor must be selected.'),
  sessionType: z.enum(['Free', 'Paid', 'Exclusive']),
  status: z.enum(['Active', 'Expired', 'Draft']).default('Active'),
  scheduledDate: z.date({
    required_error: 'A date for the session is required.',
  }),
  scheduledTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm).'),
  sessionFee: z.coerce.number().min(0).default(0),
  tag: z.string().optional(),
  offerings: z.string().optional(),
  bestSuitedFor: z.string().optional(),
  requirements: z.string().optional(),
});

type SessionFormValues = z.infer<typeof sessionFormSchema>;

interface SessionFormProps {
  session?: Session | null;
  mentors: Mentor[]; // A list of available mentors
  onSubmit: (data: Partial<Session>) => void;
}

export const SessionForm: React.FC<SessionFormProps> = ({
  session,
  mentors,
  onSubmit,
}) => {
  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      name: session?.name || '',
      mentorId: session?.mentorId || '',
      sessionType: session?.sessionType || 'Paid',
      status: session?.status || 'Draft',
      scheduledDate: session?.scheduledDate
        ? new Date(session.scheduledDate + 'T00:00:00')
        : undefined,
      scheduledTime: session?.scheduledTime || '',
      sessionFee: session?.sessionFee || 0,
      tag: session?.tag || '',
      offerings: session?.offerings || '',
      bestSuitedFor: session?.bestSuitedFor || '',
      requirements: session?.requirements || '',
    },
  });

  const handleFormSubmit = (values: SessionFormValues) => {
    onSubmit({
      ...values,
      scheduledDate: format(values.scheduledDate, 'yyyy-MM-dd'),
    });
  };

  const sessionType = form.watch('sessionType');

  React.useEffect(() => {
    if (sessionType === 'Free') {
      form.setValue('sessionFee', 0);
    }
  }, [sessionType, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Session Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Advanced React Patterns"
                    {...field}
                  />
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
                <FormLabel>Mentor</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue=""
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a mentor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mentors.length > 0 ? (
                      mentors.map((mentor) => (
                        <SelectItem key={mentor.id} value={mentor.id}>
                          {mentor.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-mentors" disabled>
                        No mentors available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="sessionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Session Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select session type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Exclusive">Exclusive</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Exclusive sessions only appear on the mentor's profile.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sessionFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Session Fee (BDT)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 1500"
                    {...field}
                    disabled={sessionType === 'Free'}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormItem>
            <FormLabel>Date and Time</FormLabel>
            <Controller
              control={form.control}
              name="scheduledDate"
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />

                    <div className="border-t p-4">
                      <FormField
                        control={form.control}
                        name="scheduledTime"
                        render={({ field: timeField }) => (
                          <FormItem>
                            <FormLabel>Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...timeField} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            />
            <FormMessage />
          </FormItem>

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Set the session status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Controls the visibility of the session.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="offerings"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Session Offerings</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="List what this session will cover, separated by commas..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bestSuitedFor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Best Suited For</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Beginners, Mid-level developers"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="requirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Setup Requirements</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Laptop with VS Code, stable internet"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4">
          <Button type="submit">
            {session ? 'Save Changes' : 'Create Session'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
