import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Mail, X, ExternalLink, Globe, Zap, Copy, Check } from 'lucide-react';
import { PageState, PublishSettings, DeploymentStatus, PublishValidationResult } from '@/types/builder.types';
import { validateForPublishing } from '@/utils/validation';
import Button from '@/components/ui/Button';
import { useTranslation } from '@/components/i18n/I18nProvider';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  page: PageState;
  onPublish: (settings: PublishSettings) => Promise<any>;
}

export function PublishModal({ isOpen, onClose, page, onPublish }: PublishModalProps) {
  const { t } = useTranslation();
  const [validation, setValidation] = useState<PublishValidationResult | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus | null>(null);
  const [publishSettings, setPublishSettings] = useState<PublishSettings>({
    userId: 'user-' + Date.now(),
    enableAnalytics: true,
    formService: 'netlify-forms', // Default to Netlify Forms
    optimizations: {
      minify: true,
      optimizeImages: true,
      includeAnimations: true
    }
  });
  const [currentStep, setCurrentStep] = useState<'validation' | 'deploying' | 'success'>('validation');
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
    
    // Use default settings with Netlify Forms and all optimizations
    const defaultSettings = {
      ...publishSettings,
      formService: 'netlify-forms' as const,
      optimizations: {
        minify: true,
        optimizeImages: true,
        includeAnimations: true
      },
      enableAnalytics: true
    };
    
    try {
      const result = await onPublish(defaultSettings);
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
  
  // Removed handleNext and handleBack functions - no longer needed

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
              <h2 className="text-lg font-semibold text-gray-900">{t('modals.publishModal.title')}</h2>
              <p className="text-sm text-gray-600">{t('modals.publishModal.subtitle')}</p>
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
                      <h3 className="font-medium text-red-900 mb-2">{t('modals.publishModal.cannotPublishYet')}</h3>
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
                          <strong>{t('modals.publishModal.emailSetupRequired')}:</strong> {t('modals.publishModal.configureRecipientEmail')}
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
                      <h3 className="font-medium text-green-900 mb-1">{t('modals.publishModal.readyToPublish')}</h3>
                      <p className="text-sm text-green-700">{t('modals.publishModal.meetsAllRequirements')}</p>
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
                      <h3 className="font-medium text-amber-900 mb-2">{t('modals.publishModal.recommendations')}</h3>
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
                  <h3 className="font-medium text-gray-900 mb-3">{t('modals.publishModal.whatHappensWhenPublish')}</h3>
                </div>
              )}
            </>
          )}
          
          {/* Settings step removed - using default configuration */}
          
          {/* Step: Deploying */}
          {currentStep === 'deploying' && (
            <div className="text-center space-y-4">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('modals.publishModal.publishingTitle')}</h3>
                <p className="text-sm text-gray-600">{t('modals.publishModal.publishingSubtitle')}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2 text-sm text-gray-600 text-center">
                  <div className="whitespace-pre-line">
                    {t('modals.publishModal.publishingMessage')}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {t('modals.publishModal.pleaseDoNotClose')}
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('modals.publishModal.successTitle')}</h3>
                <p className="text-sm text-gray-600">{t('modals.publishModal.successSubtitle')}</p>
              </div>
              {deploymentStatus && (
                <div className="space-y-4">
                  {/* Primary URL */}
                  {(deploymentStatus.url || deploymentStatus.netlifyUrl) && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Globe className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-green-900">{t('modals.publishModal.yourLandingPageUrl')}</span>
                        </div>
                        <a
                          href={getDisplayUrl(deploymentStatus)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <span>{t('modals.publishModal.viewPage')}</span>
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
                          title={t('modals.publishModal.copyUrl')}
                        >
                          {copiedUrl === getDisplayUrl(deploymentStatus) ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {copiedUrl === getDisplayUrl(deploymentStatus) && (
                        <div className="mt-2 text-xs text-green-600 font-medium">✓ {t('modals.publishModal.urlCopied')}</div>
                      )}
                    </div>
                  )}


                  {/* Additional Info */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="text-center text-sm text-gray-600">
                      {t('modals.publishModal.successMessage')}
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
{t('modals.publishModal.cancel')}
              </Button>
              
              {validation?.canPublish ? (
                <Button
                  variant="primary"
                  onClick={handlePublish}
                  disabled={isPublishing}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {t('modals.publishModal.publishNow')}
                </Button>
              ) : (
                <div className="text-sm text-gray-500">
                  {t('modals.publishModal.fixIssuesBelow')}
                </div>
              )}
            </>
          )}
          
          {/* Settings footer removed - no longer needed */}
          
          {currentStep === 'deploying' && (
            <>
              <div></div>
              <div className="text-sm text-gray-500">
                {t('modals.publishModal.publishingInProgress')}
              </div>
            </>
          )}
          
          {currentStep === 'success' && (
            <>
              <Button
                variant="outline"
                onClick={onClose}
              >
                {t('modals.publishModal.close')}
              </Button>
              
              {(deploymentStatus?.url || deploymentStatus?.netlifyUrl) && (
                <Button
                  variant="primary"
                  onClick={() => window.open(getDisplayUrl(deploymentStatus), '_blank')}
                  className="flex items-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{t('modals.publishModal.viewLivePage')}</span>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}