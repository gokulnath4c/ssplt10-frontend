import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Trophy,
  CheckCircle,
  ArrowRight,
  Edit
} from "lucide-react";

interface PlayerDetails {
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  state: string;
  city: string;
  position: string;
  pincode: string;
}

interface RegistrationReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onEdit: () => void;
  playerDetails: PlayerDetails;
  registrationFee: number;
  gstPercentage: number;
}

const RegistrationReviewModal: React.FC<RegistrationReviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onEdit,
  playerDetails,
  registrationFee,
  gstPercentage
}) => {
  const totalAmount = Math.round(registrationFee * (1 + gstPercentage / 100));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Review Your Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Player Information Card */}
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-3">
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Player Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600">Full Name</p>
                      <p className="font-medium text-sm">{playerDetails.full_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600">Email</p>
                      <p className="font-medium text-sm">{playerDetails.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600">Phone</p>
                      <p className="font-medium text-sm">{playerDetails.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600">Date of Birth</p>
                      <p className="font-medium text-sm">{formatDate(playerDetails.date_of_birth)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Trophy className="w-3 h-3 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600">Playing Position</p>
                      <Badge variant="secondary" className="text-xs">{playerDetails.position}</Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600">Location</p>
                      <p className="font-medium text-sm">
                        {playerDetails.city}, {playerDetails.state} - {playerDetails.pincode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information Card */}
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-3">
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-green-600" />
                Payment Details
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-base font-bold">
                  <span className="text-sm">Total Amount (incl. GST)</span>
                  <span className="text-green-600">₹{totalAmount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms and Conditions Notice */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800">
              <strong>Important:</strong> By proceeding with payment, you agree to our Terms and Conditions
              and Privacy Policy. The registration fee is non-refundable.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3">
            <Button
              variant="outline"
              onClick={onEdit}
              className="flex-1 flex items-center gap-2 text-sm"
            >
              <Edit className="w-3 h-3" />
              Edit Details
            </Button>

            <Button
              onClick={onConfirm}
              className="flex-1 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-sm"
            >
              Proceed to Payment
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationReviewModal;