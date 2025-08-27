# Development Request: Email Recipient Settings for CTA Section

## Document Information
- **Feature**: Form Submission Email Configuration
- **Component**: CTA Section Property Panel
- **Priority**: High (Required for MVP)
- **Estimated Time**: 2-3 days
- **Dependencies**: Email service integration (Resend/SendGrid)

---

## Executive Summary

Implement a clearly distinguished email configuration interface in the CTA Section Property Panel where landing page creators can set their business email to receive customer form submissions. This feature is critical as it determines where customer applications are sent, and must be visually prominent to prevent configuration errors.

## Background & Problem Statement

### Current Issue
- Landing page creators need to specify where form submissions should be sent
- This is different from the email fields that visitors fill out
- Without clear UI distinction, creators may confuse this with visitor-facing form fields
- Missing this configuration would result in lost customer leads

### Solution
Add a visually prominent email configuration section in the CTA Property Panel with clear labeling, visual hierarchy, and testing capabilities.

## Functional Requirements

### 1. Email Configuration Interface

#### Location
- **Component**: `PropertyPanel.tsx` → `CTAPropertyPanel.tsx`
- **Position**: Between "Form Content" and "Form Fields" sections
- **Visibility**: Always visible when CTA section is selected

#### Visual Design Specifications

```typescript
// Design System Values
const emailSettingsDesign = {
  container: {
    background: '#EFF6FF', // blue-50
    border: '2px solid #BFDBFE', // blue-200
    borderRadius: '8px',
    padding: '16px',
    marginVertical: '24px'
  },
  icon: {
    background: '#3B82F6', // blue-500
    size: '32px',
    iconSize: '20px',
    color: '#FFFFFF'
  },
  input: {
    borderColor: '#D1D5DB', // gray-300
    borderColorFocus: '#3B82F6', // blue-500
    borderColorError: '#FCA5A5' // red-300
  }
};
```

### 2. UI Components Structure

```jsx
<EmailSettingsSection>
  <Header>
    <IconContainer>
      <MailIcon />
    </IconContainer>
    <Title>📮 Application Receiver Settings</Title>
    <RequiredBadge>Required</RequiredBadge>
  </Header>
  
  <Description>
    You'll receive customer applications at this email
  </Description>
  
  <InfoAlert>
    <InfoIcon />
    This email is NOT visible to your customers
  </InfoAlert>
  
  <EmailInputGroup>
    <Label>Your Business Email</Label>
    <InputContainer>
      <EmailInput />
      <TestButton />
    </InputContainer>
    <ValidationMessage />
  </EmailInputGroup>
  
  <VisualFlowDiagram />
</EmailSettingsSection>
```

### 3. Data Model Updates

#### Update CTA Section Type
```typescript
// types/builder.types.ts
interface CTASection extends BaseSection {
  type: 'cta';
  data: {
    // Existing fields
    title: string;
    description: string;
    formEnabled: boolean;
    formFields: {
      name: boolean;
      email: boolean;
      phone: boolean;
    };
    buttonText: string;
    
    // New required fields
    recipientEmail: string;        // Required: Where to send submissions
    emailVerified: boolean;        // Has email been verified via test
    
    // New optional fields
    sendCopyToSubmitter?: boolean; // Send confirmation to form submitter
    emailSubject?: string;          // Custom email subject line
    enableGoogleSheets?: boolean;   // Google Sheets integration flag
    googleSheetId?: string;         // Google Sheet ID if enabled
    
    // Existing style fields
    backgroundColor: string;
    textColor: string;
    buttonColor: string;
  };
}
```

### 4. Email Validation Logic

```typescript
// utils/validation.ts
export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return {
      isValid: false,
      error: 'Email is required'
    };
  }
  
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }
  
  // Check for common typos
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'naver.com', 'daum.net'];
  const domain = email.split('@')[1];
  const suggestions = checkForTypos(domain, commonDomains);
  
  return {
    isValid: true,
    warning: suggestions ? `Did you mean ${suggestions}?` : undefined
  };
};
```

### 5. Test Email Functionality

#### API Endpoint
```typescript
// app/api/test-email/route.ts
export async function POST(request: Request) {
  const { email } = await request.json();
  
  // Validate email
  if (!validateEmail(email).isValid) {
    return Response.json(
      { error: 'Invalid email address' },
      { status: 400 }
    );
  }
  
  try {
    // Send test email
    await emailService.send({
      to: email,
      from: 'Landing Builder <noreply@landing-builder.com>',
      subject: 'Test Email - Landing Page Form Configuration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>✅ Email Configuration Successful!</h2>
          <p>Great! Your email is properly configured to receive form submissions.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 14px;">
            When visitors submit the form on your landing page, you'll receive their information at this email address.
          </p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>What's next?</strong></p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
              <li>Complete your landing page design</li>
              <li>Publish your page</li>
              <li>Share the link with your audience</li>
            </ul>
          </div>
          <p style="color: #999; font-size: 12px;">
            This is a test email from Landing Page Builder. If you didn't request this, please ignore it.
          </p>
        </div>
      `
    });
    
    return Response.json({ success: true });
    
  } catch (error) {
    console.error('Test email failed:', error);
    return Response.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}
```

### 6. Component Implementation

```typescript
// components/builder/PropertyPanels/CTAPropertyPanel.tsx
import { useState, useEffect } from 'react';
import { Mail, AlertCircle, Send, CheckCircle, Info } from 'lucide-react';
import { validateEmail } from '@/utils/validation';

interface EmailSettingsSectionProps {
  recipientEmail: string;
  emailVerified: boolean;
  onEmailChange: (email: string) => void;
  onEmailVerified: (verified: boolean) => void;
}

export function EmailSettingsSection({
  recipientEmail,
  emailVerified,
  onEmailChange,
  onEmailVerified
}: EmailSettingsSectionProps) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  
  // Real-time validation
  useEffect(() => {
    if (!recipientEmail) {
      setValidationMessage('');
      return;
    }
    
    const validation = validateEmail(recipientEmail);
    if (!validation.isValid) {
      setValidationMessage(validation.error || '');
      onEmailVerified(false);
    } else {
      setValidationMessage('');
      if (validation.warning) {
        setValidationMessage(validation.warning);
      }
    }
  }, [recipientEmail, onEmailVerified]);
  
  const handleTestEmail = async () => {
    const validation = validateEmail(recipientEmail);
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Invalid email');
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
      
      if (response.ok) {
        setStatus('success');
        onEmailVerified(true);
        // Reset to idle after 3 seconds
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        const data = await response.json();
        setErrorMessage(data.error || 'Failed to send test email');
        setStatus('error');
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.');
      setStatus('error');
    }
  };
  
  return (
    <div className="relative bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500 rounded-full p-2">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
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
              type="email"
              value={recipientEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="your-email@company.com"
              className={`w-full px-3 py-2 border rounded-md transition-colors ${
                validationMessage && recipientEmail
                  ? 'border-red-300 focus:border-red-500'
                  : emailVerified
                  ? 'border-green-300'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              required
            />
            {validationMessage && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {validationMessage}
              </p>
            )}
            {emailVerified && !validationMessage && (
              <p className="mt-1 text-sm text-green-600 flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Email verified successfully
              </p>
            )}
          </div>
          
          <button
            onClick={handleTestEmail}
            disabled={status === 'sending' || !recipientEmail || !!validationMessage}
            className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2 ${
              status === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed'
            }`}
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
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Test</span>
              </>
            )}
          </button>
        </div>
        
        {errorMessage && (
          <p className="mt-2 text-sm text-red-600">
            {errorMessage}
          </p>
        )}
      </div>
      
      {/* Visual Flow Diagram */}
      <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-md">
        <p className="text-xs font-medium text-gray-600 mb-2">How it works:</p>
        <div className="flex items-center justify-around">
          <div className="text-center">
            <div className="w-10 h-10 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-lg">
              👤
            </div>
            <span className="text-xs mt-1 block">Visitor</span>
          </div>
          
          <div className="flex-1 px-2">
            <svg className="w-full" height="2">
              <line x1="0" y1="1" x2="100%" y2="1" stroke="#9CA3AF" strokeDasharray="5,5"/>
            </svg>
          </div>
          
          <div className="text-center">
            <div className="w-10 h-10 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-lg">
              📝
            </div>
            <span className="text-xs mt-1 block">Form</span>
          </div>
          
          <div className="flex-1 px-2">
            <svg className="w-full" height="2">
              <line x1="0" y1="1" x2="100%" y2="1" stroke="#9CA3AF" strokeDasharray="5,5"/>
            </svg>
          </div>
          
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-500 border-2 border-blue-600 rounded-full flex items-center justify-center text-lg">
              📧
            </div>
            <span className="text-xs mt-1 block font-semibold text-blue-700">You</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## State Management Updates

### Update Builder Store
```typescript
// store/builderStore.ts
updateSection: (sectionId, updates) => {
  set((state) => {
    const newSections = state.page.sections.map((section) => {
      if (section.id === sectionId) {
        // Special handling for email verification
        if ('recipientEmail' in updates && updates.recipientEmail !== section.data.recipientEmail) {
          return {
            ...section,
            data: {
              ...section.data,
              ...updates,
              emailVerified: false // Reset verification on email change
            }
          };
        }
        return {
          ...section,
          data: { ...section.data, ...updates }
        };
      }
      return section;
    });
    
    return {
      page: {
        ...state.page,
        sections: newSections
      },
      hasUnsavedChanges: true
    };
  });
}
```

## Validation & Publishing Rules

### Pre-publish Validation
```typescript
// utils/publishValidation.ts
export function validateForPublishing(page: PageState): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check CTA section email configuration
  const ctaSection = page.sections.find(s => s.type === 'cta') as CTASection;
  
  if (ctaSection?.data.formEnabled) {
    if (!ctaSection.data.recipientEmail) {
      errors.push('Email address is required to receive form submissions');
    } else if (!ctaSection.data.emailVerified) {
      warnings.push('Email has not been verified. Consider sending a test email.');
    }
  }
  
  return {
    canPublish: errors.length === 0,
    errors,
    warnings
  };
}
```

### Publishing Modal Update
```typescript
// Show validation before publishing
const PublishModal = () => {
  const validation = validateForPublishing(page);
  
  if (!validation.canPublish) {
    return (
      <Alert type="error">
        <AlertCircle />
        <div>
          <h4>Cannot publish yet:</h4>
          <ul>
            {validation.errors.map(error => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      </Alert>
    );
  }
  
  // Continue with publishing...
};
```

## Testing Requirements

### Unit Tests
```typescript
describe('EmailSettingsSection', () => {
  it('displays required badge');
  it('validates email format in real-time');
  it('disables test button for invalid email');
  it('sends test email successfully');
  it('shows success message after test email');
  it('resets verification when email changes');
  it('shows visual flow diagram');
});

describe('Email Validation', () => {
  it('rejects invalid email formats');
  it('accepts valid email formats');
  it('suggests corrections for common typos');
  it('requires email for form-enabled CTA');
});
```

### E2E Tests
```typescript
describe('Form Configuration Flow', () => {
  it('user can configure recipient email');
  it('test email is received');
  it('cannot publish without email when form is enabled');
  it('email persists after save and reload');
});
```

## UI/UX Requirements

### Visual Hierarchy
1. **Primary Focus**: Blue background makes section stand out
2. **Clear Labeling**: "YOUR Business Email" emphasis
3. **Visual Feedback**: Color-coded validation states
4. **Help Text**: Inline explanations and tooltips
5. **Flow Diagram**: Visual representation of data flow

### Responsive Design
- Mobile: Full-width inputs, stacked layout
- Tablet: Side-by-side input and button
- Desktop: Optimal spacing and sizing

### Accessibility
- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly
- Color contrast WCAG AA compliant

## Error Handling

### Error States
1. **Empty Email**: Show "Email is required"
2. **Invalid Format**: Show "Please enter a valid email"
3. **Network Error**: Show "Failed to send test email. Please try again."
4. **Server Error**: Show specific error message from API

### Success States
1. **Test Email Sent**: Green checkmark with "Sent!" message
2. **Email Verified**: Persistent green border on input
3. **Ready to Publish**: No blocking errors in validation

## Performance Considerations

- Debounce email validation (300ms)
- Cache test email results
- Optimize re-renders using React.memo
- Lazy load email service only when needed

## Dependencies

### Required Packages
```json
{
  "dependencies": {
    "lucide-react": "^0.263.1",
    "resend": "^2.0.0" // or alternative email service
  }
}
```

### Environment Variables
```bash
# Email Service Configuration
EMAIL_API_KEY=re_xxxxx
EMAIL_FROM_ADDRESS=noreply@landing-builder.com
EMAIL_FROM_NAME=Landing Builder
```

## Migration Notes

### For Existing Users
- Default `recipientEmail` to empty string
- Set `emailVerified` to false
- Show onboarding tooltip on first visit

## Success Criteria

### Acceptance Criteria
- [ ] Email settings section is visually prominent in CTA Property Panel
- [ ] Email validation works in real-time
- [ ] Test email sends successfully
- [ ] Visual flow diagram displays correctly
- [ ] Cannot publish without email when form is enabled
- [ ] Email persists across sessions
- [ ] Mobile responsive design works

### Performance Metrics
- Email validation: < 50ms
- Test email send: < 3s
- UI updates: < 100ms

## Timeline

### Development Phases
1. **Day 1**: UI component implementation (8 hours)
2. **Day 2**: Email service integration & API (6 hours)
3. **Day 3**: Testing & refinements (4 hours)

**Total Estimate**: 18 hours

## Future Enhancements

### Phase 2 Considerations
1. Multiple recipient emails
2. Email templates customization
3. Auto-responder configuration
4. Form submission analytics
5. Webhook integrations
6. Conditional email routing

## Risk Mitigation

### Potential Issues
1. **Email Deliverability**: Use established service (Resend/SendGrid)
2. **Spam Filters**: Proper SPF/DKIM setup
3. **Rate Limiting**: Implement cooldown for test emails
4. **Data Loss**: Save email immediately to localStorage

---

## Approval

**Requested by**: Product Team  
**Assigned to**: Frontend Developer  
**Review by**: Technical Lead  
**Testing by**: QA Team  

**Status**: Ready for Development

---

*This feature is critical for MVP launch. The recipient email configuration must be intuitive and foolproof to prevent lost leads.*