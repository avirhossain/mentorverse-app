
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
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MenteesAPI } from '@/lib/firebase-adapter';
import { useFirestore } from '@/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const addBalanceSchema = z.object({
  paymentMethod: z.enum(['bKash', 'coupon']),
  transactionId: z.string().optional(),
  couponCode: z.string().optional(),
  amount: z.coerce
    .number()
    .positive({ message: 'Amount must be greater than 0.' }),
});

export type AddBalanceFormValues = z.infer<typeof addBalanceSchema>;

interface AddBalanceFormProps {
  menteeId: string;
}

export const AddBalanceForm: React.FC<AddBalanceFormProps> = ({
  menteeId,
}) => {
  const { toast } = useToast();
  const firestore = useFirestore();
  const form = useForm<AddBalanceFormValues>({
    resolver: zodResolver(addBalanceSchema),
    defaultValues: {
      paymentMethod: 'bKash',
      amount: 0,
      transactionId: '',
      couponCode: '',
    },
  });

  const handleFormSubmit = (values: AddBalanceFormValues) => {
    if (!firestore) return;
    if (values.paymentMethod === 'bKash') {
      if (!values.transactionId) {
        toast({
          variant: 'destructive',
          title: 'Transaction ID required',
          description: 'Please enter your bKash transaction ID.',
        });
        return;
      }
      MenteesAPI.requestBalanceAdd(
        firestore,
        menteeId,
        values.amount,
        `bKash top-up request. TrxID: ${values.transactionId}`
      );
      toast({
        title: 'Request Submitted',
        description: 'We will confirm your payment shortly.',
      });
    } else if (values.paymentMethod === 'coupon') {
      if (!values.couponCode) {
        toast({
          variant: 'destructive',
          title: 'Coupon Code Required',
          description: 'Please enter a coupon code.',
        });
        return;
      }
      // This is a placeholder for coupon verification logic.
      // In a real app, you would call a cloud function to verify the coupon.
      toast({
        title: 'Coupon Applied!',
        description: 'Your balance has been updated.',
      });
    }
  };

  return (
    <Tabs defaultValue="bKash" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="bKash">bKash</TabsTrigger>
        <TabsTrigger value="coupon">Coupon</TabsTrigger>
      </TabsList>
      <TabsContent value="bKash">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <Input type="hidden" {...field} value="bKash" />
              )}
            />
            <div className="rounded-md border bg-muted/50 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Pay your desired amount to our bKash number:
              </p>
              <p className="text-lg font-bold text-primary">01673737971</p>
            </div>
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount Sent (BDT)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 1000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transactionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>bKash Transaction ID (TrxID)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 9A8B7C6D5E" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-4 flex justify-end">
              <Button type="submit">Submit for Verification</Button>
            </div>
          </form>
        </Form>
      </TabsContent>
      <TabsContent value="coupon">
         <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
             <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <Input type="hidden" {...field} value="coupon" />
              )}
            />
            <FormField
              control={form.control}
              name="couponCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coupon Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your coupon code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="pt-4 flex justify-end">
              <Button type="submit">Apply Coupon</Button>
            </div>
          </form>
        </Form>
      </TabsContent>
    </Tabs>
  );
};
