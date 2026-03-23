import { useState } from "react";
import { X, CreditCard, Loader2 } from "lucide-react";

// Mock payment modal with a simulated card form for paid course enrollment
const PaymentModal = ({ course, onClose, onSuccess }) => {
    const [processing, setProcessing] = useState(false);

    // Handles the mock payment confirmation
    const handlePay = async () => {
        setProcessing(true);
        // Simulate a brief processing delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await onSuccess();
        setProcessing(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={!processing ? onClose : undefined} />

            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-[#1E3A8A]">Complete Payment</h2>
                    {!processing && (
                        <button onClick={onClose} className="p-1 hover:bg-[#F3F4F6] rounded transition-colors cursor-pointer">
                            <X className="w-5 h-5 text-[#6B7280]" />
                        </button>
                    )}
                </div>

                {/* Course info */}
                <div className="bg-[#F9FAFB] rounded-lg p-4 mb-6">
                    <p className="text-sm font-medium text-[#111827] mb-1">{course.title}</p>
                    <p className="text-xs text-[#6B7280]">by {course.instructor?.name}</p>
                    <p className="text-xl font-bold text-[#111827] mt-2">${course.price}</p>
                </div>

                {/* Mock card form (visual only) */}
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-xs font-medium text-[#6B7280] mb-1">Card Number</label>
                        <div className="flex items-center gap-2 border border-[#E5E7EB] rounded-lg px-3 py-2.5 bg-[#F9FAFB]">
                            <CreditCard className="w-4 h-4 text-[#6B7280]" />
                            <span className="text-sm text-[#6B7280]">4242 4242 4242 4242</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-[#6B7280] mb-1">Expiry</label>
                            <div className="border border-[#E5E7EB] rounded-lg px-3 py-2.5 bg-[#F9FAFB]">
                                <span className="text-sm text-[#6B7280]">12/28</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[#6B7280] mb-1">CVC</label>
                            <div className="border border-[#E5E7EB] rounded-lg px-3 py-2.5 bg-[#F9FAFB]">
                                <span className="text-sm text-[#6B7280]">123</span>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-xs text-[#6B7280] mb-4 text-center">
                    This is a simulated payment. No real charges will be made.
                </p>

                {/* Action buttons */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePay}
                        disabled={processing}
                        className="flex-1 bg-[#2563EB] text-white py-2.5 rounded-lg font-medium hover:bg-[#1E3A8A] transition-colors disabled:opacity-70 cursor-pointer"
                    >
                        {processing ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                            </span>
                        ) : (
                            `Pay $${course.price}`
                        )}
                    </button>
                    {!processing && (
                        <button
                            onClick={onClose}
                            className="border border-[#E5E7EB] text-[#6B7280] px-4 py-2.5 rounded-lg hover:text-[#2563EB] hover:border-[#2563EB] transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
