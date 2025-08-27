import { useState, useEffect, useCallback } from 'react';
import { Mail, AlertCircle, Send, CheckCircle, Info } from 'lucide-react';
import { validateEmail, debounce } from '@/utils/validation';

interface EmailSettingsSectionProps {
  recipientEmail: string;
  emailVerified: boolean;
  onEmailChange: (email: string) => void;
  onEmailVerified: (verified: boolean) => void;
}

type TestStatus = 'idle' | 'sending' | 'success' | 'error';

export function EmailSettingsSection({
  recipientEmail,
  emailVerified,
  onEmailChange,
  onEmailVerified
}: EmailSettingsSectionProps) {
  const [status, setStatus] = useState<TestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  
  // Debounced validation to avoid excessive API calls
  const debouncedValidation = useCallback(
    debounce((email: string) => {
      if (!email) {
        setValidationMessage('');
        setShowWarning(false);
        return;
      }
      
      const validation = validateEmail(email);
      if (!validation.isValid) {
        setValidationMessage(validation.error || '');
        setShowWarning(false);
        onEmailVerified(false);
      } else {
        setValidationMessage('');
        if (validation.warning) {
          setValidationMessage(validation.warning);
          setShowWarning(true);
        } else {
          setShowWarning(false);
        }
      }
    }, 300),
    [onEmailVerified]
  );

  // Real-time validation with debouncing
  useEffect(() => {
    debouncedValidation(recipientEmail);
  }, [recipientEmail, debouncedValidation]);

  const handleEmailChange = (email: string) => {
    onEmailChange(email);
    // Reset verification when email changes
    if (email !== recipientEmail) {
      onEmailVerified(false);
      setStatus('idle');
      setErrorMessage('');
    }
  };

  const handleTestEmail = async () => {
    const validation = validateEmail(recipientEmail);
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Invalid email');
      setStatus('error');
      return;
    }
    
    setStatus('sending');
    setErrorMessage('');
    
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recipientEmail })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setStatus('success');
        onEmailVerified(true);
        // Reset to idle after 3 seconds
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setErrorMessage(data.error || 'Failed to send test email');
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch (error) {
      setErrorMessage('Network error. Please check your connection and try again.');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const isValidEmail = recipientEmail && validateEmail(recipientEmail).isValid;
  const hasError = validationMessage && !showWarning;
  
  return (
    <div className="relative bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500 rounded-full p-2">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center">
              📮 Application Receiver Settings
            </h3>
            <p className="text-sm text-gray-600">
              You'll receive customer applications at this email
            </p>
          </div>
        </div>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
          Required
        </span>
      </div>
      
      {/* Info Alert */}
      <div className="mb-4 flex items-start space-x-2 p-3 bg-white bg-opacity-70 rounded-md">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-gray-700">
          <span className="font-medium">Important:</span> This email is NOT visible to your customers. 
          They will see the form fields you configure below.
        </p>
      </div>
      
      {/* Email Input */}
      <div>
        <label htmlFor="recipient-email" className="block text-sm font-medium text-gray-700 mb-1">
          Your Business Email
        </label>
        <div className="flex space-x-2">
          <div className="flex-1">
            <input
              id="recipient-email"
              name="recipient-email"
              type="email"
              value={recipientEmail}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="your-email@company.com"
              className={`w-full px-3 py-2 border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                hasError
                  ? 'border-red-300 focus:border-red-500'
                  : emailVerified && isValidEmail
                  ? 'border-green-300'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              required
              aria-describedby={
                validationMessage ? 'email-validation' : 
                emailVerified ? 'email-verified' : undefined
              }
            />
            
            {/* Validation Messages */}
            {validationMessage && (
              <p 
                id="email-validation"
                className={`mt-1 text-sm flex items-center ${
                  showWarning ? 'text-amber-600' : 'text-red-600'
                }`}
              >
                <AlertCircle className="w-3 h-3 mr-1" />
                {validationMessage}
              </p>
            )}
            
            {emailVerified && !validationMessage && (
              <p id="email-verified" className="mt-1 text-sm text-green-600 flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Email verified successfully
              </p>
            )}
          </div>
          
          {/* Test Button */}
          <button
            onClick={handleTestEmail}
            disabled={status === 'sending' || !recipientEmail || !!hasError}
            className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2 min-w-[80px] ${
              status === 'success'
                ? 'bg-green-500 text-white'
                : status === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed'
            }`}
            aria-label="Send test email"
          >
            {status === 'sending' ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Sending...</span>
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Sent!</span>
              </>
            ) : status === 'error' ? (
              <>
                <AlertCircle className="w-4 h-4" />
                <span>Error</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Test</span>
              </>
            )}
          </button>
        </div>
        
        {/* Error Message */}
        {errorMessage && status === 'error' && (
          <p className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
            {errorMessage}
          </p>
        )}
      </div>
      
      {/* Visual Flow Diagram */}
      <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-md">
        <p className="text-xs font-medium text-gray-600 mb-2">How it works:</p>
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="w-10 h-10 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-lg">
              👤
            </div>
            <span className="text-xs mt-1 block text-gray-600">Visitor</span>
          </div>
          
          <div className="flex-1 px-2">
            <svg className="w-full" height="2" aria-hidden="true">
              <line x1="0" y1="1" x2="100%" y2="1" stroke="#9CA3AF" strokeDasharray="5,5"/>
            </svg>
          </div>
          
          <div className="text-center">
            <div className="w-10 h-10 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-lg">
              📝
            </div>
            <span className="text-xs mt-1 block text-gray-600">Form</span>
          </div>
          
          <div className="flex-1 px-2">
            <svg className="w-full" height="2" aria-hidden="true">
              <line x1="0" y1="1" x2="100%" y2="1" stroke="#9CA3AF" strokeDasharray="5,5"/>
            </svg>
          </div>
          
          <div className="text-center">
            <div className={`w-10 h-10 border-2 rounded-full flex items-center justify-center text-lg ${
              emailVerified 
                ? 'bg-blue-500 border-blue-600' 
                : 'bg-white border-gray-300'
            }`}>
              📧
            </div>
            <span className={`text-xs mt-1 block font-semibold ${
              emailVerified ? 'text-blue-700' : 'text-gray-600'
            }`}>
              You
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}