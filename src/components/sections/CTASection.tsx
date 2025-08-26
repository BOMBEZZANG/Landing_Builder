import React, { useState } from 'react';
import { CTASection as CTASectionType } from '@/types/builder.types';
import { cn } from '@/lib/utils';
import InlineTextEditor from '@/components/editor/InlineTextEditor';

interface CTASectionProps {
  section: CTASectionType;
  isEditing: boolean;
  onUpdate: (updates: Partial<CTASectionType['data']>) => void;
}

export default function CTASection({
  section,
  isEditing,
  onUpdate
}: CTASectionProps) {
  const { data } = section;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic will be implemented in later phases
    console.log('Form submitted:', formData);
    alert('Form submitted! (This is a placeholder for Phase 1)');
  };

  return (
    <section
      className="px-4 py-20"
      style={{ backgroundColor: data.backgroundColor }}
      data-section-type="cta"
    >
      <div className="max-w-4xl mx-auto text-center">
        {/* Title */}
        <div className="mb-6">
          {isEditing ? (
            <InlineTextEditor
              value={data.title}
              onChange={(value) => onUpdate({ title: value })}
              className="text-3xl md:text-4xl font-bold leading-tight"
              style={{ color: data.textColor }}
              placeholder="Enter CTA title"
            />
          ) : (
            <h2
              className="text-3xl md:text-4xl font-bold leading-tight"
              style={{ color: data.textColor }}
            >
              {data.title}
            </h2>
          )}
        </div>

        {/* Description */}
        <div className="mb-12">
          {isEditing ? (
            <InlineTextEditor
              value={data.description}
              onChange={(value) => onUpdate({ description: value })}
              className="text-xl leading-relaxed max-w-2xl mx-auto"
              style={{ color: data.textColor }}
              placeholder="Enter description"
              multiline
            />
          ) : (
            <p
              className="text-xl leading-relaxed max-w-2xl mx-auto"
              style={{ color: data.textColor }}
            >
              {data.description}
            </p>
          )}
        </div>

        {/* Form or Simple CTA */}
        {data.formEnabled ? (
          <div className="max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              {data.formFields.name && (
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              )}

              {/* Email Field */}
              {data.formFields.email && (
                <div>
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              )}

              {/* Phone Field */}
              {data.formFields.phone && (
                <div>
                  <input
                    type="tel"
                    placeholder="Your Phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                {isEditing ? (
                  <InlineTextEditor
                    value={data.buttonText}
                    onChange={(value) => onUpdate({ buttonText: value })}
                    className="w-full px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-white"
                    style={{ backgroundColor: data.buttonColor }}
                    placeholder="Button text"
                  />
                ) : (
                  <button
                    type="submit"
                    className="w-full px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-white"
                    style={{ backgroundColor: data.buttonColor }}
                  >
                    {data.buttonText}
                  </button>
                )}
              </div>
            </form>

            {/* Form settings hint for editing mode */}
            {isEditing && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
                <p><strong>Form Settings:</strong></p>
                <p>• Fields: {Object.entries(data.formFields).filter(([, enabled]) => enabled).map(([field]) => field).join(', ') || 'None selected'}</p>
                <p>• Recipient: {data.recipientEmail || 'Not set'}</p>
              </div>
            )}
          </div>
        ) : (
          // Simple CTA button without form
          <div>
            {isEditing ? (
              <InlineTextEditor
                value={data.buttonText}
                onChange={(value) => onUpdate({ buttonText: value })}
                className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-white"
                style={{ backgroundColor: data.buttonColor }}
                placeholder="Button text"
              />
            ) : (
              <button
                type="button"
                className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-white"
                style={{ backgroundColor: data.buttonColor }}
                onClick={() => {
                  // Simple CTA action
                  console.log('CTA button clicked');
                }}
              >
                {data.buttonText}
              </button>
            )}
          </div>
        )}

        {/* Trust indicators */}
        {!isEditing && (
          <div className="mt-8 text-sm opacity-75" style={{ color: data.textColor }}>
            <p>Join thousands of satisfied customers</p>
          </div>
        )}
      </div>
    </section>
  );
}