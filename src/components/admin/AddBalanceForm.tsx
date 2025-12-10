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

const addBalanceSchema = z.object({
  amount: z.coerce
    .number()
    .positive({ message: 'Amount must be greater than 0.' }),
});

type AddBalanceFormValues = z.infer<typeof addBalanceSchema>;

interface AddBalanceFormProps {
  currentBalance: number;
  onSubmit: (amount: number) => void;
}

export const AddBalanceForm: React.FC<AddBalanceFormProps> = ({
  currentBalance,
  onSubmit,
}) => {
  const form = useForm<AddBalanceFormValues>({
    resolver: zodResolver(addBalanceSchema),
    defaultValues: {
      amount: 0,
    },
  });

  const handleFormSubmit = (values: AddBalanceFormValues) => {
    onSubmit(values.amount);
  };

  const amount = form.watch('amount');
  const newBalance = currentBalance + (amount || 0);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
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
