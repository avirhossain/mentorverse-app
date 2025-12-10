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
import { Textarea } from '@/components/ui/textarea';
import type { Disbursement, Mentor } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

const disbursementFormSchema = z.object({
  mentorId: z.string().min(1, 'A mentor must be selected.'),
  totalAmount: z.coerce.number().min(1, 'Amount must be greater than 0.'),
  note: z.string().optional(),
});

type DisbursementFormValues = z.infer<typeof disbursementFormSchema>;

interface DisbursementFormProps {
  disbursement?: Disbursement | null;
  mentors: Mentor[];
  onSubmit: (data: Partial<Disbursement>) => void;
  isLoading?: boolean;
}

export const DisbursementForm: React.FC<DisbursementFormProps> = ({
  disbursement,
  mentors,
  onSubmit,
  isLoading = false,
}) => {
  const form = useForm<DisbursementFormValues>({
    resolver: zodResolver(disbursementFormSchema),
    defaultValues: {
      mentorId: disbursement?.mentorId || '',
      totalAmount: disbursement?.totalAmount || 0,
      note: (disbursement as any)?.note || '',
    },
  });

  const handleFormSubmit = (values: DisbursementFormValues) => {
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
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="mentorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mentor</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a mentor to pay" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mentors.map((mentor) => (
                    <SelectItem key={mentor.id} value={mentor.id}>
                      {mentor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="totalAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (BDT)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 5000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Payment for May 2024 sessions"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Internal notes for this transaction.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4 flex justify-end">
          <Button type="submit">
            {disbursement ? 'Save Changes' : 'Create Record'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
