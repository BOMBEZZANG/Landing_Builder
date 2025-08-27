import { Template, TemplateCategory, TemplateFilter } from '@/types/template.types';
import { PageState } from '@/types/builder.types';
import { v4 as uuidv4 } from 'uuid';

// Built-in templates
const BUILT_IN_TEMPLATES: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Startup Landing',
    description: 'Perfect for startups and new businesses',
    category: 'business',
    thumbnail: '/templates/startup-landing.jpg',
    tags: ['startup', 'business', 'clean', 'modern'],
    author: 'Landing Builder',
    usageCount: 245,
    page: {
      id: uuidv4(),
      title: 'Your Startup Name',
      sections: [
        {
          id: uuidv4(),
          type: 'hero',
          order: 0,
          data: {
            headline: 'The Future is Now',
            subheadline: 'Revolutionary solutions for modern businesses. Join thousands of companies transforming their industry.',
            buttonText: 'Get Started Today',
            buttonAction: 'scroll',
            backgroundType: 'gradient',
            backgroundColor: '#1e3a8a',
            backgroundGradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            textColor: '#ffffff',
            buttonColor: '#10b981',
            alignment: 'center'
          }
        },
        {
          id: uuidv4(),
          type: 'content',
          order: 1,
          data: {
            title: 'Why Choose Us',
            content: 'We combine cutting-edge technology with exceptional service to deliver results that matter. Our innovative approach has helped over 10,000 businesses achieve their goals.',
            imagePosition: 'right',
            backgroundColor: '#ffffff',
            textColor: '#1f2937',
            padding: 'large'
          }
        },
        {
          id: uuidv4(),
          type: 'cta',
          order: 2,
          data: {
            title: 'Ready to Transform Your Business?',
            description: 'Join industry leaders who trust us with their success',
            formEnabled: true,
            formFields: {
              name: true,
              email: true,
              phone: false
            },
            buttonText: 'Start Free Trial',
            recipientEmail: '',
            backgroundColor: '#f8fafc',
            textColor: '#1f2937',
            buttonColor: '#1e3a8a'
          }
        }
      ],
      globalStyles: {
        primaryColor: '#1e3a8a',
        secondaryColor: '#10b981',
        fontFamily: 'modern'
      },
      metadata: {
        description: 'Innovative solutions for modern businesses'
      }
    }
  },
  {
    name: 'SaaS Product',
    description: 'Ideal for software as a service companies',
    category: 'saas',
    thumbnail: '/templates/saas-product.jpg',
    tags: ['saas', 'software', 'tech', 'subscription'],
    author: 'Landing Builder',
    usageCount: 189,
    page: {
      id: uuidv4(),
      title: 'Your SaaS Platform',
      sections: [
        {
          id: uuidv4(),
          type: 'hero',
          order: 0,
          data: {
            headline: 'Streamline Your Workflow',
            subheadline: 'The all-in-one platform that saves you time and boosts productivity. Trusted by 50,000+ teams worldwide.',
            buttonText: 'Start Free Trial',
            buttonAction: 'scroll',
            backgroundType: 'gradient',
            backgroundColor: '#6366f1',
            backgroundGradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            textColor: '#ffffff',
            buttonColor: '#10b981',
            alignment: 'center'
          }
        },
        {
          id: uuidv4(),
          type: 'content',
          order: 1,
          data: {
            title: 'Powerful Features',
            content: 'Everything you need to manage your business in one place. Real-time collaboration, advanced analytics, and seamless integrations.',
            imagePosition: 'left',
            backgroundColor: '#ffffff',
            textColor: '#1f2937',
            padding: 'medium'
          }
        },
        {
          id: uuidv4(),
          type: 'cta',
          order: 2,
          data: {
            title: 'Start Your Free Trial',
            description: 'No credit card required. Cancel anytime.',
            formEnabled: true,
            formFields: {
              name: true,
              email: true,
              phone: true
            },
            buttonText: 'Get Started Now',
            recipientEmail: '',
            backgroundColor: '#f3f4f6',
            textColor: '#1f2937',
            buttonColor: '#6366f1'
          }
        }
      ],
      globalStyles: {
        primaryColor: '#6366f1',
        secondaryColor: '#10b981',
        fontFamily: 'modern'
      },
      metadata: {
        description: 'Streamline your workflow with our powerful platform'
      }
    }
  },
  {
    name: 'Creative Portfolio',
    description: 'Showcase your creative work beautifully',
    category: 'portfolio',
    thumbnail: '/templates/creative-portfolio.jpg',
    tags: ['portfolio', 'creative', 'design', 'showcase'],
    author: 'Landing Builder',
    usageCount: 156,
    page: {
      id: uuidv4(),
      title: 'Your Creative Portfolio',
      sections: [
        {
          id: uuidv4(),
          type: 'hero',
          order: 0,
          data: {
            headline: 'Creative Excellence',
            subheadline: 'Bringing ideas to life through innovative design and passionate craftsmanship.',
            buttonText: 'View My Work',
            buttonAction: 'scroll',
            backgroundType: 'gradient',
            backgroundColor: '#1f2937',
            backgroundGradient: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
            textColor: '#ffffff',
            buttonColor: '#f59e0b',
            alignment: 'center'
          }
        },
        {
          id: uuidv4(),
          type: 'content',
          order: 1,
          data: {
            title: 'About My Work',
            content: 'With over 8 years of experience in creative design, I specialize in creating memorable brand experiences that connect with audiences.',
            imagePosition: 'right',
            backgroundColor: '#ffffff',
            textColor: '#1f2937',
            padding: 'large'
          }
        },
        {
          id: uuidv4(),
          type: 'cta',
          order: 2,
          data: {
            title: 'Let\'s Work Together',
            description: 'Ready to bring your vision to life?',
            formEnabled: true,
            formFields: {
              name: true,
              email: true,
              phone: false
            },
            buttonText: 'Get In Touch',
            recipientEmail: '',
            backgroundColor: '#1f2937',
            textColor: '#ffffff',
            buttonColor: '#f59e0b'
          }
        }
      ],
      globalStyles: {
        primaryColor: '#1f2937',
        secondaryColor: '#f59e0b',
        fontFamily: 'modern'
      },
      metadata: {
        description: 'Creative portfolio showcasing innovative design work'
      }
    }
  },
  {
    name: 'E-commerce Store',
    description: 'Perfect for online stores and product launches',
    category: 'ecommerce',
    thumbnail: '/templates/ecommerce-store.jpg',
    tags: ['ecommerce', 'store', 'products', 'sales'],
    author: 'Landing Builder',
    usageCount: 203,
    page: {
      id: uuidv4(),
      title: 'Your Online Store',
      sections: [
        {
          id: uuidv4(),
          type: 'hero',
          order: 0,
          data: {
            headline: 'Premium Quality Products',
            subheadline: 'Discover our curated collection of premium products. Fast shipping, easy returns, and exceptional customer service.',
            buttonText: 'Shop Now',
            buttonAction: 'scroll',
            backgroundType: 'gradient',
            backgroundColor: '#dc2626',
            backgroundGradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
            textColor: '#ffffff',
            buttonColor: '#ffffff',
            alignment: 'center'
          }
        },
        {
          id: uuidv4(),
          type: 'content',
          order: 1,
          data: {
            title: 'Why Shop With Us',
            content: 'We\'ve been serving customers for over 15 years with quality products, competitive prices, and outstanding service. Free shipping on orders over $50.',
            imagePosition: 'left',
            backgroundColor: '#ffffff',
            textColor: '#1f2937',
            padding: 'medium'
          }
        },
        {
          id: uuidv4(),
          type: 'cta',
          order: 2,
          data: {
            title: 'Special Offer!',
            description: 'Get 20% off your first order when you sign up for our newsletter',
            formEnabled: true,
            formFields: {
              name: true,
              email: true,
              phone: false
            },
            buttonText: 'Claim Discount',
            recipientEmail: '',
            backgroundColor: '#fef3c7',
            textColor: '#1f2937',
            buttonColor: '#dc2626'
          }
        }
      ],
      globalStyles: {
        primaryColor: '#dc2626',
        secondaryColor: '#f59e0b',
        fontFamily: 'modern'
      },
      metadata: {
        description: 'Premium quality products with exceptional service'
      }
    }
  }
];

class TemplateService {
  private templates: Template[] = [];

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    const now = new Date().toISOString();
    this.templates = BUILT_IN_TEMPLATES.map(template => ({
      ...template,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    }));
  }

  // Get all templates
  getAllTemplates(): Template[] {
    return this.templates;
  }

  // Get templates by category
  getTemplatesByCategory(category: TemplateCategory): Template[] {
    return this.templates.filter(template => template.category === category);
  }

  // Get template by ID
  getTemplateById(id: string): Template | null {
    return this.templates.find(template => template.id === id) || null;
  }

  // Filter templates
  filterTemplates(filter: TemplateFilter): Template[] {
    let filtered = this.templates;

    if (filter.category) {
      filtered = filtered.filter(template => template.category === filter.category);
    }

    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(template =>
        filter.tags!.some(tag => template.tags.includes(tag))
      );
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchLower) ||
        template.description.toLowerCase().includes(searchLower) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (filter.author) {
      filtered = filtered.filter(template => template.author === filter.author);
    }

    return filtered;
  }

  // Get all categories
  getCategories(): TemplateCategory[] {
    return Array.from(new Set(this.templates.map(template => template.category)));
  }

  // Get all tags
  getAllTags(): string[] {
    const allTags = this.templates.flatMap(template => template.tags);
    return Array.from(new Set(allTags)).sort();
  }

  // Save custom template (user-created)
  saveCustomTemplate(name: string, description: string, page: PageState): Template {
    const template: Template = {
      id: uuidv4(),
      name,
      description,
      category: 'custom',
      thumbnail: '/templates/custom-template.jpg', // Default thumbnail
      tags: ['custom'],
      page: JSON.parse(JSON.stringify(page)), // Deep clone
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCustom: true,
      author: 'You',
      usageCount: 0
    };

    this.templates.push(template);
    this.saveCustomTemplates();
    return template;
  }

  // Load custom templates from localStorage
  loadCustomTemplates(): Template[] {
    try {
      const saved = localStorage.getItem('custom-templates');
      if (saved) {
        const customTemplates: Template[] = JSON.parse(saved);
        // Remove existing custom templates and add loaded ones
        this.templates = this.templates.filter(t => !t.isCustom);
        this.templates.push(...customTemplates);
        return customTemplates;
      }
    } catch (error) {
      console.error('Failed to load custom templates:', error);
    }
    return [];
  }

  // Save custom templates to localStorage
  private saveCustomTemplates() {
    try {
      const customTemplates = this.templates.filter(t => t.isCustom);
      localStorage.setItem('custom-templates', JSON.stringify(customTemplates));
    } catch (error) {
      console.error('Failed to save custom templates:', error);
    }
  }

  // Delete custom template
  deleteCustomTemplate(id: string): boolean {
    const index = this.templates.findIndex(t => t.id === id && t.isCustom);
    if (index !== -1) {
      this.templates.splice(index, 1);
      this.saveCustomTemplates();
      return true;
    }
    return false;
  }

  // Increment usage count
  incrementUsage(id: string) {
    const template = this.templates.find(t => t.id === id);
    if (template) {
      template.usageCount = (template.usageCount || 0) + 1;
      if (template.isCustom) {
        this.saveCustomTemplates();
      }
    }
  }
}

export const templateService = new TemplateService();