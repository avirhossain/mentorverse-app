"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Loader2, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function BookingDialog({ mentorName, sessionCost, timeslot }: { mentorName: string, sessionCost: number, timeslot: string }) {
  const [isBooking, setIsBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  
  const handleBooking = () => {
    setIsBooking(true);
    // Simulate API call
    setTimeout(() => {
      setIsBooking(false);
      setIsBooked(true);
    }, 1500);
  };

  const formattedDate = format(new Date(timeslot), "eeee, MMMM d, yyyy 'at' h:mm a");

  return (
    <Dialog onOpenChange={(open) => {
        if (!open) {
            // Reset state on close
            setTimeout(() => {
                setIsBooked(false);
                setIsBooking(false);
            }, 300)
        }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">Book Now</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {!isBooked ? (
          <>
            <DialogHeader>
              <DialogTitle>Confirm Your Session</DialogTitle>
              <DialogDescription>
                You are booking a session with {mentorName}. Please review the details below.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Mentor:</span>
                <span className="font-semibold">{mentorName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-semibold text-right">{formattedDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Cost:</span>
                <Badge variant="default" className="text-lg bg-primary">{formatCurrency(sessionCost)}</Badge>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleBooking} disabled={isBooking} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                {isBooking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirming...
                  </>
                ) : `Confirm & Pay ${formatCurrency(sessionCost)}`}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                    <CheckCircle className="text-green-600 w-8 h-8" />
                </div>
              <DialogTitle>
                Booking Confirmed!
              </DialogTitle>
              <DialogDescription>
                Your session with {mentorName} is booked. You will receive a confirmation email shortly.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 text-center bg-muted/50 rounded-lg">
               <p className="text-sm">Your session is scheduled for:</p>
               <p className="font-semibold mt-1">{formattedDate}</p>
            </div>
            <DialogFooter>
               <DialogClose asChild>
                 <Button type="button" variant="secondary" className="w-full">
                   Close
                 </Button>
               </DialogClose>
             </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
