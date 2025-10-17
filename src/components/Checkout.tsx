import React, { useState } from 'react';
import { ArrowLeft, Upload, X, Check, Loader2 } from 'lucide-react';
import { CartItem, PaymentMethod, ServiceType } from '../types';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { useOrders } from '../hooks/useOrders';
import { uploadReceiptToCloudinary, compressImage } from '../lib/cloudinary';

interface CheckoutProps {
  cartItems: CartItem[];
  totalPrice: number;
  onBack: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cartItems, totalPrice, onBack }) => {
  const { paymentMethods } = usePaymentMethods();
  const { createOrder, creating, error } = useOrders();
  const [step, setStep] = useState<'details' | 'payment'>('details');
  // Updated customer fields
  const [branchName, setBranchName] = useState('');
  const [ownerRepresentative, setOwnerRepresentative] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientContact, setRecipientContact] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('delivery');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gcash');
  const [referenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [uiNotice, setUiNotice] = useState<string | null>(null);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  // Receipt upload state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const copyOrderDetails = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  // Helper to check if a date is Wednesday, Thursday, Friday, or Saturday
  const isAllowedDay = (dateString: string): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    return day === 3 || day === 4 || day === 5 || day === 6; // Wed, Thu, Fri, Sat
  };

  // Get minimum date (next available Wed-Sat)
  const getMinDate = (): string => {
    const today = new Date();
    const day = today.getDay();
    let daysToAdd = 0;
    
    if (day === 0) daysToAdd = 3; // Sunday -> Wednesday
    else if (day === 1) daysToAdd = 2; // Monday -> Wednesday
    else if (day === 2) daysToAdd = 1; // Tuesday -> Wednesday
    else if (day === 3 || day === 4 || day === 5 || day === 6) daysToAdd = 0; // Wed-Sat -> today
    
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + daysToAdd);
    return minDate.toISOString().split('T')[0];
  };

  // Generate time slots based on service type
  const getTimeSlots = (): string[] => {
    const slots: string[] = [];
    const startHour = serviceType === 'delivery' ? 12 : 8; // 12 PM for delivery, 8 AM for pickup
    
    for (let hour = startHour; hour < 21; hour++) { // Until 9 PM
      const hourStr = hour.toString().padStart(2, '0');
      slots.push(`${hourStr}:00`);
      slots.push(`${hourStr}:30`);
    }
    slots.push('21:00'); // Add 9 PM as last slot
    
    return slots;
  };

  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReceiptFile(file);
    setUploadError(null);
    setReceiptUrl(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };


  const handleRemoveReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    setReceiptUrl(null);
    setUploadError(null);
  };

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Set default payment method when payment methods are loaded
  React.useEffect(() => {
    if (paymentMethods.length > 0 && !paymentMethod) {
      setPaymentMethod(paymentMethods[0].id as PaymentMethod);
    }
  }, [paymentMethods, paymentMethod]);

  const selectedPaymentMethod = paymentMethods.find(method => method.id === paymentMethod);

  const handleProceedToPayment = () => {
    setStep('payment');
  };

  const handlePlaceOrder = async () => {
    let uploadedReceiptUrl = receiptUrl;

    // Upload receipt first if user selected one but hasn't uploaded yet
    if (receiptFile && !receiptUrl) {
      try {
        setUploadingReceipt(true);
        setUploadError(null);
        setUiNotice('Uploading receipt...');

        // Compress image before upload
        const compressedFile = await compressImage(receiptFile, 1200, 0.8);
        
        // Upload to Cloudinary
        uploadedReceiptUrl = await uploadReceiptToCloudinary(compressedFile);
        setReceiptUrl(uploadedReceiptUrl);
        setUiNotice('Receipt uploaded! Creating order...');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to upload receipt';
        setUploadError(message);
        setUiNotice(`Upload failed: ${message}. Please try again or continue without receipt.`);
        setUploadingReceipt(false);
        return; // Stop order placement if upload fails
      } finally {
        setUploadingReceipt(false);
      }
    }

    // Persist order to database
    try {
      const scheduledDateTime = scheduledDate && scheduledTime 
        ? `${scheduledDate} ${scheduledTime}` 
        : undefined;
      const mergedNotes = landmark ? `${notes ? notes + ' | ' : ''}Landmark: ${landmark}` : notes;
      const customerInfo = `Branch: ${branchName} | Owner: ${ownerRepresentative} | Recipient: ${recipientName}`;
      
      await createOrder({
        customerName: customerInfo,
        contactNumber: recipientContact,
        serviceType,
        address: serviceType === 'delivery' ? address : undefined,
        pickupTime: scheduledDateTime,
        paymentMethod,
        referenceNumber,
        notes: mergedNotes,
        total: totalPrice,
        items: cartItems,
        receiptUrl: uploadedReceiptUrl ?? undefined,
      });
    } catch (e) {
      const raw = e instanceof Error ? e.message : '';
      if (/insufficient stock/i.test(raw)) {
        setUiNotice(raw);
        return;
      }
      if (/rate limit/i.test(raw)) {
        setUiNotice('Too many orders: Please wait 1 minute before placing another order.');
      } else if (/missing identifiers/i.test(raw)) {
        setUiNotice('Too many orders: Please wait 1 minute before placing another order.');
      } else {
        setUiNotice('Too many orders: Please wait 1 minute before placing another order.');
      }
      return;
    }
    
    const scheduleInfo = scheduledDate && scheduledTime 
      ? `📅 Scheduled: ${new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        })}`
      : '';
    
    const orderDetails = `
🛒 Raffa's ORDER

🏢 Branch: ${branchName}
👤 Owner/Representative: ${ownerRepresentative}
📦 Recipient: ${recipientName}
📞 Recipient Contact: ${recipientContact}
📍 Service: ${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}
${serviceType === 'delivery' ? `🏠 Address: ${address}${landmark ? `\n🗺️ Landmark: ${landmark}` : ''}` : ''}
${scheduleInfo}


📋 ORDER DETAILS:
${cartItems.map(item => {
  let itemDetails = `• ${item.name}`;
  if (item.selectedVariation) {
    itemDetails += ` (${item.selectedVariation.name})`;
  }
  if (item.selectedAddOns && item.selectedAddOns.length > 0) {
    itemDetails += ` + ${item.selectedAddOns.map(addOn => 
      addOn.quantity && addOn.quantity > 1 
        ? `${addOn.name} x${addOn.quantity}`
        : addOn.name
    ).join(', ')}`;
  }
  itemDetails += ` x${item.quantity} - ₱${item.totalPrice * item.quantity}`;
  return itemDetails;
}).join('\n')}

💰 TOTAL: ₱${totalPrice}
${serviceType === 'delivery' ? `🛵 DELIVERY FEE:` : ''}

💳 Payment: ${selectedPaymentMethod?.name || paymentMethod}
${uploadedReceiptUrl ? `📸 Payment Receipt: ${uploadedReceiptUrl}` : '📸 Payment Screenshot: Please attach your payment receipt screenshot'}

${notes ? `📝 Notes: ${notes}` : ''}

Please confirm this order to proceed. Thank you for choosing Raffa's! 🥟
    `.trim();

    const pageId = '61574906107219';
    // Deep link retained for future use if needed
    // const appDeepLink = `fb-messenger://user-thread/${pageId}`;
    const encodedMessage = encodeURIComponent(orderDetails);
    const webLink = `https://m.me/${pageId}?text=${encodedMessage}`;

    // Best effort: copy order details so user can paste in Messenger if text cannot be prefilled
    await copyOrderDetails(orderDetails);

    if (isMobile) {
      // Always prefer the web messenger with prefilled text on mobile as first choice
      window.location.href = webLink;
    } else {
      window.open(webLink, '_blank');
    }
    
  };

  const isDetailsValid = branchName && ownerRepresentative && recipientName && recipientContact && 
    scheduledDate && scheduledTime &&
    isAllowedDay(scheduledDate) &&
    (serviceType !== 'delivery' || address);

  if (step === 'details') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Cart</span>
          </button>
          <h1 className="text-3xl font-lilita text-[color:var(--raffa-dark)] ml-8">Order Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-fredoka font-medium text-[color:var(--raffa-dark)] mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-red-100">
                  <div>
                    <h4 className="font-medium text-black">{item.name}</h4>
                    {item.selectedVariation && (
                      <p className="text-sm text-gray-600">Size: {item.selectedVariation.name}</p>
                    )}
                    {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                      <p className="text-sm text-gray-600">
                        Add-ons: {item.selectedAddOns.map(addOn => addOn.name).join(', ')}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">₱{item.totalPrice} x {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-black">₱{item.totalPrice * item.quantity}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-yellow-300 pt-4">
              <div className="flex items-center justify-between text-2xl font-fredoka font-semibold text-[color:var(--raffa-dark)]">
                <span>Total:</span>
                <span>₱{totalPrice}</span>
              </div>
            </div>
          </div>

          {/* Customer Details Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-fredoka font-medium text-[color:var(--raffa-dark)] mb-6">Customer Information</h2>
            
            <form className="space-y-6">
              {/* Customer Information */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Branch Name *</label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter branch name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Owner/Representative *</label>
                <input
                  type="text"
                  value={ownerRepresentative}
                  onChange={(e) => setOwnerRepresentative(e.target.value)}
                  className="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter owner or representative name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Recipient of Delivery *</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter recipient name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Contact Number of Recipient *</label>
                <input
                  type="tel"
                  value={recipientContact}
                  onChange={(e) => setRecipientContact(e.target.value)}
                  className="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  placeholder="09XX XXX XXXX"
                  required
                />
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-sm font-medium text-black mb-3">Service Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'delivery', label: 'Delivery', icon: '🛵' },
                    { value: 'pickup', label: 'Pick up', icon: '🚶' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setServiceType(option.value as ServiceType)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        serviceType === option.value
                          ? 'border-yellow-500 bg-yellow-500 text-[color:var(--raffa-dark)]'
                          : 'border-yellow-300 bg-white text-gray-700 hover:border-yellow-400'
                      }`}
                    >
                      <div className="text-2xl mb-1">{option.icon}</div>
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Scheduled Date and Time */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Scheduled Date *</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={getMinDate()}
                  className="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available days: Wednesday, Thursday, Friday, and Saturday only
                </p>
                {scheduledDate && !isAllowedDay(scheduledDate) && (
                  <p className="text-xs text-red-600 mt-1">
                    ⚠️ Please select Wednesday, Thursday, Friday, or Saturday
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Scheduled Time *</label>
                <select
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="">Select time</option>
                  {getTimeSlots().map(slot => (
                    <option key={slot} value={slot}>
                      {new Date(`2000-01-01T${slot}`).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {serviceType === 'delivery' 
                    ? 'Delivery available from 12:00 PM onwards' 
                    : 'Pick up available from 8:00 AM onwards'}
                </p>
              </div>

              {/* Delivery Address */}
              {serviceType === 'delivery' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Delivery Address *</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your complete delivery address"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Landmark</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                      placeholder="e.g., Near McDonald's, Beside 7-Eleven, In front of school"
                    />
                  </div>
                </>
              )}

              {/* Special Notes */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Special Instructions</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="Any special requests or notes..."
                  rows={3}
                />
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={!isDetailsValid}
                className={`w-full py-4 rounded-xl font-medium text-lg transition-all duration-200 transform ${
                  isDetailsValid
                    ? 'bg-[color:var(--raffa-red)] text-white hover:bg-red-700 hover:scale-[1.02]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Proceed to Payment
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Payment Step
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button
          onClick={() => setStep('details')}
          className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Details</span>
        </button>
        <h1 className="text-3xl font-lilita text-[color:var(--raffa-dark)] ml-8">Payment</h1>
      </div>

      {uiNotice && (
        <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 text-yellow-800 p-4 text-sm">
          {uiNotice}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Method Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-fredoka font-medium text-[color:var(--raffa-dark)] mb-6">Choose Payment Method</h2>
          
          <div className="grid grid-cols-1 gap-4 mb-6">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center space-x-3 ${
                  paymentMethod === method.id
                    ? 'border-yellow-500 bg-yellow-500 text-[color:var(--raffa-dark)]'
                    : 'border-yellow-300 bg-white text-gray-700 hover:border-yellow-400'
                }`}
              >
                <span className="text-2xl">💳</span>
                <span className="font-medium">{method.name}</span>
              </button>
            ))}
          </div>

          {/* Payment Details with QR Code */}
          {selectedPaymentMethod && (
            <div className="bg-yellow-50 rounded-lg p-6 mb-6">
              <h3 className="font-medium text-black mb-4">Payment Details</h3>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{selectedPaymentMethod.name}</p>
                  <p className="font-mono text-black font-medium">{selectedPaymentMethod.account_number}</p>
                  <p className="text-sm text-gray-600 mb-3">Account Name: {selectedPaymentMethod.account_name}</p>
                  <p className="text-xl font-semibold text-[color:var(--raffa-dark)]">Amount: ₱{totalPrice}</p>
                </div>
                <div className="flex-shrink-0">
                  <img 
                    src={selectedPaymentMethod.qr_code_url} 
                    alt={`${selectedPaymentMethod.name} QR Code`}
                    className="w-32 h-32 rounded-lg border-2 border-yellow-300 shadow-sm"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';
                    }}
                  />
                  <p className="text-xs text-gray-500 text-center mt-2">Scan to pay</p>
                </div>
              </div>
            </div>
          )}

          {/* Receipt Upload */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-medium text-black mb-3">📸 Upload Payment Receipt</h4>
            
            {!receiptPreview ? (
              <div>
                <label
                  htmlFor="receipt-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-orange-300 rounded-lg cursor-pointer bg-white hover:bg-orange-50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-8 w-8 text-orange-500 mb-2" />
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Click to select receipt</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 10MB (Optional)</p>
                  </div>
                  <input
                    id="receipt-upload"
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
                    onChange={handleReceiptFileChange}
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden border-2 border-blue-300">
                  <img
                    src={receiptPreview}
                    alt="Receipt preview"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={handleRemoveReceipt}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {receiptUrl ? (
                  <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    <Check className="h-5 w-5" />
                    <span className="text-sm font-medium">Receipt ready! Will be saved with your order.</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                    <Upload className="h-5 w-5" />
                    <span className="text-sm font-medium">Receipt selected. Will upload when you place order.</span>
                  </div>
                )}

                {uploadError && (
                  <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                    {uploadError}
                  </div>
                )}
              </div>
            )}
            
            <p className="text-xs text-gray-600 mt-3">
              {receiptFile ? 'Receipt will be uploaded automatically when you place your order.' : 'You can also attach your receipt in the Messenger conversation.'}
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-fredoka font-medium text-[color:var(--raffa-dark)] mb-6">Final Order Summary</h2>
          
          <div className="space-y-4 mb-6">
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="font-medium text-black mb-2">Customer Details</h4>
              <p className="text-sm text-gray-600">Branch: {branchName}</p>
              <p className="text-sm text-gray-600">Owner/Representative: {ownerRepresentative}</p>
              <p className="text-sm text-gray-600">Recipient: {recipientName}</p>
              <p className="text-sm text-gray-600">Contact: {recipientContact}</p>
              <p className="text-sm text-gray-600">Service: {serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}</p>
              {serviceType === 'delivery' && (
                <>
                  <p className="text-sm text-gray-600">Address: {address}</p>
                  {landmark && <p className="text-sm text-gray-600">Landmark: {landmark}</p>}
                </>
              )}
              {scheduledDate && scheduledTime && (
                <p className="text-sm text-gray-600">
                  Scheduled: {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              )}
            </div>

            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-red-100">
                <div>
                  <h4 className="font-medium text-black">{item.name}</h4>
                  {item.selectedVariation && (
                    <p className="text-sm text-gray-600">Size: {item.selectedVariation.name}</p>
                  )}
                  {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                    <p className="text-sm text-gray-600">
                      Add-ons: {item.selectedAddOns.map(addOn => 
                        addOn.quantity && addOn.quantity > 1 
                          ? `${addOn.name} x${addOn.quantity}`
                          : addOn.name
                      ).join(', ')}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">₱{item.totalPrice} x {item.quantity}</p>
                </div>
                <span className="font-semibold text-black">₱{item.totalPrice * item.quantity}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t border-yellow-300 pt-4 mb-6">
            <div className="flex items-center justify-between text-2xl font-fredoka font-semibold text-[color:var(--raffa-dark)]">
              <span>Total:</span>
              <span>₱{totalPrice}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={creating || uploadingReceipt}
            className={`w-full py-4 rounded-xl font-medium text-lg transition-all duration-200 transform ${creating || uploadingReceipt ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[color:var(--raffa-red)] text-white hover:bg-red-700 hover:scale-[1.02]'}`}
          >
            {uploadingReceipt ? (
              <span className="flex items-center justify-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Uploading Receipt...</span>
              </span>
            ) : creating ? (
              'Placing Order...'
            ) : (
              'Place Order via Messenger'
            )}
          </button>
          {error && !uiNotice && (
            <p className="text-sm text-red-600 text-center mt-2">{error}</p>
          )}
          
          <p className="text-xs text-gray-500 text-center mt-3">
            You'll be redirected to Facebook Messenger to confirm your order. Don't forget to attach your payment screenshot!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
