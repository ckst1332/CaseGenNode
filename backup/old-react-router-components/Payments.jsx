import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Payments() {
  const paymentLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK;
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (paymentLink) {
      window.location.href = paymentLink;
    } else {
      alert("Stripe payment link not configured.");
    }
  };

  return (
    <div className="p-6 lg:p-8 flex justify-center">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Subscribe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-700">
            Subscribe to access additional cases and features.
          </p>
          <Button onClick={handleCheckout} className="w-full bg-blue-600 hover:bg-blue-700">
            Proceed to Payment
          </Button>
          <Button variant="outline" onClick={() => navigate(createPageUrl("Account"))} className="w-full">
            Back to Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
