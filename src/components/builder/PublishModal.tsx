import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Mail, X, ExternalLink, Settings, Globe, Zap, Copy, Check } from 'lucide-react';
import { PageState, PublishSettings, DeploymentStatus, PublishValidationResult } from '@/types/builder.types';
import { validateForPublishing } from '@/utils/validation';
import Button from '@/components/ui/Button';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  page: PageState;
  onPublish: (settings: PublishSettings) => Promise<any>;
}

export function PublishModal({ isOpen, onClose, page, onPublish }: PublishModalProps) {
  const [validation, setValidation] = useState<PublishValidationResult | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus | null>(null);
  const [publishSettings, setPublishSettings] = useState<PublishSettings>({
    userId: 'user-' + Date.now(),
    enableAnalytics: false,
    formService: 'formspree',
    optimizations: {
      minify: true,
      optimizeImages: true,
      includeAnimations: true
    }
  });
  const [currentStep, setCurrentStep] = useState<'validation' | 'settings' | 'deploying' | 'success'>('validation');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setValidation(validateForPublishing(page));
      setCurrentStep('validation');
      setDeploymentStatus(null);
    }
  }, [isOpen, page]);
  
  useEffect(() => {
    if (deploymentStatus?.url) {
      setCurrentStep('success');
    }
  }, [deploymentStatus]);

  const handlePublish = async () => {
    if (!validation?.canPublish) return;

    setIsPublishing(true);
    setCurrentStep('deploying');
    
    try {
      const result = await onPublish(publishSettings);
      console.log('Publish result:', result);
      console.log('Result has URL:', !!result?.url);
      console.log('Result has netlifyUrl:', !!result?.netlifyUrl);
      
      if (result && (result.url || result.netlifyUrl)) {
        setDeploymentStatus({
          isDeploying: false,
          url: result.url,
          netlifyUrl: result.netlifyUrl,
          deploymentId: result.deploymentId,
          lastDeployedAt: new Date().toISOString()
        });
        setCurrentStep('success');
      } else {
        throw new Error('Deployment completed but no URL received');
      }
    } catch (error) {
      console.error('Publishing failed:', error);
      setDeploymentStatus({
        isDeploying: false,
        error: error instanceof Error ? error.message : 'Publishing failed'
      });
      setCurrentStep('validation');
    } finally {
      setIsPublishing(false);
    }
  };
  
  const handleNext = () => {
    if (currentStep === 'validation' && validation?.canPublish) {
      setCurrentStep('settings');
    }
  };
  
  const handleBack = () => {
    if (currentStep === 'settings') {
      setCurrentStep('validation');
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error('Failed to copy URL:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    }
  };

  // Format URL to match the requested format: https://landing-pages-deploy.netlify.app/{userId}/{pageId}/
  const getDisplayUrl = (deploymentStatus: DeploymentStatus) => {
    if (deploymentStatus.netlifyUrl) {
      // Remove '/sites/' from the netlify URL to match your requested format
      return deploymentStatus.netlifyUrl.replace('/sites/', '/');
    }
    return deploymentStatus.url || '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Publish Landing Page</h2>
              <p className="text-sm text-gray-600">Make your page live on the web</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step: Validation */}
          {currentStep === 'validation' && validation && (
            <>
              {/* Validation Status */}
              {!validation.canPublish ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-red-900 mb-2">Cannot publish yet</h3>
                      <ul className="space-y-1">
                        {validation.errors.map((error, index) => (
                          <li key={index} className="text-sm text-red-700 flex items-center">
                            <span className="w-1 h-1 bg-red-400 rounded-full mr-2 flex-shrink-0"></span>
                            {error}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 p-3 bg-red-100 rounded-md">
                        <p className="text-sm text-red-800 flex items-center">
                          <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                          <strong>Email Setup Required:</strong> Configure your recipient email in the CTA section to receive form submissions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-green-900 mb-1">Ready to publish!</h3>
                      <p className="text-sm text-green-700">Your landing page meets all requirements.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {validation.warnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-amber-900 mb-2">Recommendations</h3>
                      <ul className="space-y-1">
                        {validation.warnings.map((warning, index) => (
                          <li key={index} className="text-sm text-amber-700 flex items-center">
                            <span className="w-1 h-1 bg-amber-400 rounded-full mr-2 flex-shrink-0"></span>
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Publishing Information */}
              {validation.canPublish && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">What happens when you publish?</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 flex-shrink-0 mt-2"></span>
                      Your landing page will be generated as optimized HTML
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 flex-shrink-0 mt-2"></span>
                      Deployed to GitHub Pages with automatic SSL
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 flex-shrink-0 mt-2"></span>
                      Form submissions will be handled via your chosen service
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 flex-shrink-0 mt-2"></span>
                      You can make updates and republish anytime
                    </li>
                  </ul>
                </div>
              )}
            </>
          )}
          
          {/* Step: Settings */}
          {currentStep === 'settings' && (
            <div className="space-y-6">
              <div className="text-center">
                <Settings className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Publishing Settings</h3>
                <p className="text-sm text-gray-600">Configure how your page will be published</p>
              </div>
              
              {/* Form Service */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Form Handling Service</label>
                <div className="space-y-2">
                  {[
                    { value: 'formspree', label: 'Formspree', description: 'Easy setup, reliable form handling' },
                    { value: 'netlify-forms', label: 'Netlify Forms', description: 'Built-in Netlify form processing' },
                    { value: 'custom', label: 'Custom API', description: 'Use your own form endpoint' }
                  ].map(option => (
                    <label key={option.value} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="formService"
                        value={option.value}
                        checked={publishSettings.formService === option.value}
                        onChange={(e) => setPublishSettings(prev => ({ ...prev, formService: e.target.value as any }))}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Optimizations */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Optimizations</label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={publishSettings.optimizations.minify}
                      onChange={(e) => setPublishSettings(prev => ({
                        ...prev,
                        optimizations: { ...prev.optimizations, minify: e.target.checked }
                      }))}
                    />
                    <div>
                      <div className="font-medium text-gray-900">Minify HTML/CSS/JS</div>
                      <div className="text-sm text-gray-600">Reduce file size for faster loading</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={publishSettings.optimizations.optimizeImages}
                      onChange={(e) => setPublishSettings(prev => ({
                        ...prev,
                        optimizations: { ...prev.optimizations, optimizeImages: e.target.checked }
                      }))}
                    />
                    <div>
                      <div className="font-medium text-gray-900">Optimize Images</div>
                      <div className="text-sm text-gray-600">Add lazy loading and responsive attributes</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={publishSettings.optimizations.includeAnimations}
                      onChange={(e) => setPublishSettings(prev => ({
                        ...prev,
                        optimizations: { ...prev.optimizations, includeAnimations: e.target.checked }
                      }))}
                    />
                    <div>
                      <div className="font-medium text-gray-900">Include Animations</div>
                      <div className="text-sm text-gray-600">Add smooth transitions and effects</div>
                    </div>
                  </label>
                </div>
              </div>
              
              {/* Analytics */}
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={publishSettings.enableAnalytics}
                    onChange={(e) => setPublishSettings(prev => ({ ...prev, enableAnalytics: e.target.checked }))}
                  />
                  <div>
                    <div className="font-medium text-gray-900">Enable Analytics</div>
                    <div className="text-sm text-gray-600">Track page views and form submissions</div>
                  </div>
                </label>
              </div>
            </div>
          )}
          
          {/* Step: Deploying */}
          {currentStep === 'deploying' && (
            <div className="text-center space-y-4">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Publishing Your Page</h3>
                <p className="text-sm text-gray-600">This may take a few moments...</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Generating optimized HTML</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Deploying to GitHub Pages</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Setting up form handling</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step: Success */}
          {currentStep === 'success' && (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Successfully Published!</h3>
                <p className="text-sm text-gray-600">Your landing page is now live on the web</p>
              </div>
              {deploymentStatus && (
                <div className="space-y-4">
                  {/* Primary URL */}
                  {(deploymentStatus.url || deploymentStatus.netlifyUrl) && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Globe className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-green-900">Your Landing Page URL:</span>
                        </div>
                        <a
                          href={getDisplayUrl(deploymentStatus)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <span>View Page</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      <div className="flex items-center space-x-2 p-3 bg-green-100 rounded-lg">
                        <div className="flex-1 text-sm text-green-800 font-mono break-all">
                          {getDisplayUrl(deploymentStatus)}
                        </div>
                        <button
                          onClick={() => copyToClipboard(getDisplayUrl(deploymentStatus))}
                          className="flex items-center justify-center w-8 h-8 text-green-600 hover:text-green-700 hover:bg-green-200 rounded-md transition-colors"
                          title="Copy URL"
                        >
                          {copiedUrl === getDisplayUrl(deploymentStatus) ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {copiedUrl === getDisplayUrl(deploymentStatus) && (
                        <div className="mt-2 text-xs text-green-600 font-medium">✓ URL copied to clipboard!</div>
                      )}
                    </div>
                  )}


                  {/* Additional Info */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="text-center text-sm text-gray-600">
                      🎉 Your landing page is now live! Share this URL to get visitors.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          {currentStep === 'validation' && (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isPublishing}
              >
                Cancel
              </Button>
              
              {validation?.canPublish ? (
                <Button
                  variant="primary"
                  onClick={handleNext}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configure Settings
                </Button>
              ) : (
                <div className="text-sm text-gray-500">
                  Fix the issues above to continue
                </div>
              )}
            </>
          )}
          
          {currentStep === 'settings' && (
            <>
              <Button
                variant="outline"
                onClick={handleBack}
              >
                Back
              </Button>
              
              <Button
                variant="primary"
                onClick={handlePublish}
                disabled={isPublishing}
                className="flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Publish Now</span>
              </Button>
            </>
          )}
          
          {currentStep === 'deploying' && (
            <>
              <div></div>
              <div className="text-sm text-gray-500">
                Publishing in progress...
              </div>
            </>
          )}
          
          {currentStep === 'success' && (
            <>
              <Button
                variant="outline"
                onClick={onClose}
              >
                Close
              </Button>
              
              {(deploymentStatus?.url || deploymentStatus?.netlifyUrl) && (
                <Button
                  variant="primary"
                  onClick={() => window.open(getDisplayUrl(deploymentStatus), '_blank')}
                  className="flex items-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Live Page</span>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}