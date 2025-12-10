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
import { formatCurrency } from '@/lib/utils';
import { Textarea } from '../ui/textarea';

const addBalanceSchema = z.object({
  amount: z.coerce
    .number()
    .positive({ message: 'Amount must be greater than 0.' }),
  reference: z.string().optional(),
  description: z.string().min(1, 'A description is required.'),
});

export type AddBalanceFormValues = z.infer<typeof addBalanceSchema>;

interface AddBalanceFormProps {
  currentBalance: number;
  onSubmit: (values: AddBalanceFormValues) => void;
}

export const AddBalanceForm: React.FC<AddBalanceFormProps> = ({
  currentBalance,
  onSubmit,
}) => {
  const form = useForm<AddBalanceFormValues>({
    resolver: zodResolver(addBalanceSchema),
    defaultValues: {
      amount: 0,
      reference: '',
      description: 'Admin top-up',
    },
  });

  const handleFormSubmit = (values: AddBalanceFormValues) => {
    onSubmit(values);
  };

  const amount = form.watch('amount');
  const newBalance = currentBalance + (amount || 0);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount to Add (BDT)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 1000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Invoice #12345" {...field} />
              </FormControl>
              <FormDescription>
                An optional reference for this transaction.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Monthly top-up" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormDescription>
          Current Balance: {formatCurrency(currentBalance)}
          <br />
          New Balance will be: {formatCurrency(newBalance)}
        </FormDescription>

        <div className="pt-4 flex justify-end">
          <Button type="submit">Add Funds</Button>
        </div>
      </form>
    </Form>
  );
};
