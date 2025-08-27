export type Locale = 'en' | 'ko';

export interface TranslationKeys {
  // Common UI elements
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    preview: string;
    publish: string;
    loading: string;
    error: string;
    success: string;
    reset: string;
    templates: string;
    applied: string;
    apply: string;
  };
  
  // Builder toolbar
  builder: {
    toolbar: {
      save: string;
      saved: string;
      preview: string;
      publish: string;
      settings: string;
      undo: string;
      redo: string;
      reset: string;
      confirmReset: string;
      templates: string;
      saveTemplate: string;
      editMode: string;
      previewMode: string;
      pc: string;
      tablet: string;
      mobile: string;
    };
    sections: {
      hero: string;
      content: string;
      cta: string;
      addSection: string;
      moveUp: string;
      moveDown: string;
      duplicate: string;
      remove: string;
      noSections: string;
      sectionsWillAppear: string;
    };
    properties: {
      background: string;
      backgroundColor: string;
      backgroundImage: string;
      backgroundType: string;
      backgroundGradient: string;
      text: string;
      textColor: string;
      fontSize: string;
      fontFamily: string;
      alignment: string;
      padding: string;
      margin: string;
      layout: string;
      colors: string;
      spacing: string;
      headline: string;
      subheadline: string;
      buttonText: string;
      buttonAction: string;
      buttonColor: string;
      title: string;
      content: string;
      imagePosition: string;
      description: string;
      formEnabled: string;
      formFields: string;
      left: string;
      center: string;
      right: string;
      top: string;
      bottom: string;
      small: string;
      medium: string;
      large: string;
      color: string;
      image: string;
      gradient: string;
      scroll: string;
      form: string;
      link: string;
      modern: string;
      classic: string;
      playful: string;
    };
  };
  
  // Form elements
  form: {
    labels: {
      name: string;
      email: string;
      phone: string;
      message: string;
      subject: string;
      recipientEmail: string;
      yourBusinessEmail: string;
    };
    placeholders: {
      name: string;
      email: string;
      phone: string;
      message: string;
      subject: string;
      enterText: string;
      yourEmailCompany: string;
      enterYourName: string;
      enterYourEmail: string;
      enterYourPhone: string;
    };
    buttons: {
      submit: string;
      reset: string;
      clear: string;
      getStarted: string;
      getStartedNow: string;
    };
    validation: {
      required: string;
      invalidEmail: string;
      invalidPhone: string;
      minLength: string;
      maxLength: string;
    };
  };
  
  // Messages and notifications
  messages: {
    success: {
      saved: string;
      published: string;
      emailSent: string;
      emailApplied: string;
      imageUploaded: string;
      settingsUpdated: string;
      templateSaved: string;
    };
    error: {
      saveFailed: string;
      publishFailed: string;
      uploadFailed: string;
      networkError: string;
      invalidInput: string;
      genericError: string;
      emailServiceNotConfigured: string;
    };
    info: {
      autoSave: string;
      unsavedChanges: string;
      processing: string;
      loadingBuilder: string;
      initializingCanvas: string;
      applicationReceiverSettings: string;
      receiveCustomerApplications: string;
      notVisibleToCustomers: string;
      important: string;
    };
  };
  
  // Modal dialogs
  modals: {
    confirmDelete: {
      title: string;
      message: string;
      confirm: string;
      cancel: string;
    };
    publishSettings: {
      title: string;
      domain: string;
      customDomain: string;
      seo: string;
      analytics: string;
      enableAnalytics: string;
      formService: string;
      optimizations: string;
      minify: string;
      optimizeImages: string;
      includeAnimations: string;
      publishYourLandingPage: string;
      fixValidationErrors: string;
      publishing: string;
      publishedSuccessfully: string;
      liveUrl: string;
      openInNewTab: string;
      copyLink: string;
      linkCopied: string;
      close: string;
    };
    imageUpload: {
      title: string;
      dragDrop: string;
      browse: string;
      maxSize: string;
      supportedFormats: string;
      uploading: string;
      processing: string;
      dropImage: string;
    };
    saveTemplate: {
      title: string;
      templateName: string;
      enterTemplateName: string;
      category: string;
      tags: string;
      enterTags: string;
      saving: string;
    };
  };
  
  // Email settings
  email: {
    settings: {
      applicationReceiverSettings: string;
      receiveApplicationsAt: string;
      yourBusinessEmail: string;
      apply: string;
      applying: string;
      applied: string;
      emailAppliedSuccessfully: string;
      howItWorks: string;
      visitor: string;
      form: string;
      you: string;
    };
  };
  
  // Canvas
  canvas: {
    dragToReorder: string;
    clickToEdit: string;
    loadingBuilder: string;
    noSectionsYet: string;
    addSectionsUsing: string;
  };
  
  // Landing page content (for generated pages)
  landing: {
    defaultHeadline: string;
    defaultSubheadline: string;
    defaultContent: string;
    defaultCta: string;
    defaultCtaDescription: string;
  };
}