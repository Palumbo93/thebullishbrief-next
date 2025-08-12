import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button'
import { BRAND_COPY } from '../data/copy';
import { useViewportHeight } from '../hooks/useViewportHeight';
import { FULL_HEIGHT_BACKDROP_CSS, FULL_HEIGHT_DRAWER_CSS } from '../utils/viewportUtils';
import { getOnboardingOptions } from '../utils/preferenceMapping';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface OnboardingData {
  investorType: string;
  experience: string;
  riskTolerance: string;
  interests: string[];
  country: string;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    investorType: '',
    experience: '',
    riskTolerance: '',
    interests: [],
    country: ''
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);
  const { height: viewportHeight } = useViewportHeight();

  // Scroll to top when step changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [currentStep]);

  const totalSteps = 6;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Update user profile with onboarding data
      const { error } = await supabase
        .from('user_profiles')
        .update({
          preferences: {
            ...formData,
            onboardingCompleted: true,
            completedAt: new Date().toISOString()
          }
        })
        .eq('id', user.id);

      if (error) throw error;
      
      onComplete();
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSelection = (field: keyof OnboardingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  const canProceed = () => {
    switch (currentStep) {
      case 1: return true; // Welcome page - always can proceed
      case 2: return formData.investorType !== '';
      case 3: return formData.experience !== '';
      case 4: return formData.riskTolerance !== '';
      case 5: return formData.interests.length > 0;
      case 6: return formData.country !== '';
      default: return false;
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return {
          title: "Personalized Market Intelligence",
          subtitle: "",
          isWelcomePage: true,
          welcomeContent: {
            description: BRAND_COPY.onboarding.welcome.description,
            features: []
          }
        };
        
      case 2:
        return {
          title: "What type of investor are you?",
          subtitle: "Help us understand your investment style",
          options: getOnboardingOptions('investorType'),
          field: 'investorType' as keyof OnboardingData,
          selectedValue: formData.investorType
        };
      
      case 3:
        return {
          title: "How long have you been investing?",
          subtitle: "Your experience level helps us tailor content",
          options: getOnboardingOptions('experience'),
          field: 'experience' as keyof OnboardingData,
          selectedValue: formData.experience
        };
      
      case 4:
        return {
          title: "What's your risk tolerance?",
          subtitle: "Understanding your comfort with risk",
          options: getOnboardingOptions('riskTolerance'),
          field: 'riskTolerance' as keyof OnboardingData,
          selectedValue: formData.riskTolerance
        };
      
      case 5:
        return {
          title: "What interests you most?",
          subtitle: "Select all topics that interest you",
          isMultiSelect: true,
          options: getOnboardingOptions('interests'),
          field: 'interests' as keyof OnboardingData,
          selectedValue: formData.interests
        };
      
      case 6:
        return {
          title: "Where are you located?",
          subtitle: "Help us provide relevant market information",
          options: getOnboardingOptions('country'),
          field: 'country' as keyof OnboardingData,
          selectedValue: formData.country
        };
      
      default:
        return null;
    }
  };

  const stepContent = getStepContent();
  if (!stepContent) return null;

    return (
    <>
      <style>{`
        .onboarding-modal-backdrop {
          ${FULL_HEIGHT_BACKDROP_CSS}
          background: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .onboarding-modal-container {
          background: var(--color-bg-primary);
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          height: 100%;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .onboarding-modal-container.welcome {
          max-width: none;
          max-height: none;
          background: transparent;
        }
        .onboarding-modal-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .onboarding-modal-content::-webkit-scrollbar {
          display: none;
        }
        
        /* Mobile styles */
        @media (max-width: 767px) {
          .onboarding-modal-backdrop {
            padding: 0;
            align-items: stretch;
            justify-content: stretch;
          }
          .onboarding-modal-container {
            ${FULL_HEIGHT_DRAWER_CSS}
            width: 100vw;
            max-width: none;
            max-height: none;
            border-radius: 0;
            border: none;
            box-shadow: none;
          }
          .onboarding-modal-content {
            padding-bottom: calc(var(--space-6) + env(safe-area-inset-bottom, 0));
          }
        }
      `}</style>
      
      {/* Main Modal Container - Always Present */}
      <div 
        className="onboarding-modal-backdrop animate-modal-enter"
        style={{
          height: `${viewportHeight}px`
        }}
      >
        <div className={`onboarding-modal-container ${currentStep === 1 ? 'welcome' : ''}`}>
          
          {/* Welcome Slide Content */}
          {currentStep === 1 && (
            <>
              {/* Background Video */}
              <video
                autoPlay
                muted
                loop
                playsInline
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: 0
                }}
              >
                <source src="https://potsdvyvpwuycgocpivf.supabase.co/storage/v1/object/public/websiteassets/websitevideos/5152378-hd_1280_720_24fps.mp4" type="video/mp4" />
              </video>

              {/* Content Overlay */}
              <div style={{
                position: 'relative',
                zIndex: 1,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-8)',
                background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.7) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
              }}>
                {/* Grain Overlay */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `
                    radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px),
                    radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '4px 4px, 4px 4px',
                  backgroundPosition: '0 0, 2px 2px',
                  opacity: 0.3,
                  pointerEvents: 'none',
                  zIndex: 1
                }} />
                {/* Logo */}
                <div style={{ marginBottom: 'var(--space-12)' }}>
                  <div style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <img 
                      src="/images/logo.png" 
                      alt="The Bullish Brief" 
                      style={{
                        width: '120px',
                        height: '120px',
                        objectFit: 'contain',
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                        if (nextElement) {
                          nextElement.style.display = 'flex';
                        }
                      }}
                    />
                    <div style={{
                      display: 'none',
                      width: '120px',
                      height: '120px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        width: '8px',
                        height: '8px',
                        backgroundColor: 'var(--color-brand-primary)',
                        borderRadius: 'var(--radius-full)',
                        border: '2px solid var(--color-bg-secondary)',
                      }} className="animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Hero Description */}
                <p style={{
                  fontSize: 'clamp(var(--text-2xl), 5vw, var(--text-4xl))',
                  color: 'white',
                  fontFamily: 'var(--font-editorial)',
                  fontWeight: 'var(--font-normal)',
                  lineHeight: '1.2',
                  letterSpacing: '-0.02em',
                  margin: 0,
                  maxWidth: '600px',
                  textAlign: 'center',
                  textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  marginBottom: 'var(--space-12)'
                }}>
                  {BRAND_COPY.onboarding.welcome.description}
                </p>
                
                {/* Continue Button */}
                <Button
                  onClick={handleNext}
                  variant="primary"
                  size="lg"
                  icon={ArrowRight}
                  iconSide="right"
                  fullWidth={false}
                  className="animate-slide-in-right"
                >
                  Continue
                </Button>
              </div>
            </>
          )}

          {/* Regular Onboarding Steps Content */}
          {currentStep > 1 && (
            <>
              {/* Progress Indicator */}
              <div style={{
                padding: 'var(--space-4) var(--space-8)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                borderBottom: '0.5px solid var(--color-border-primary)',
                background: 'var(--color-bg-primary)',
                flexShrink: 0
              }}>
                <div style={{
                  display: 'flex',
                  gap: 'var(--space-2)',
                  alignItems: 'center'
                }}>
                  {Array.from({ length: totalSteps - 1 }, (_, i) => (
                    <div
                      key={i}
                      style={{
                        width: i < (currentStep - 1) ? '12px' : '8px',
                        height: i < (currentStep - 1) ? '12px' : '8px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: i < (currentStep - 1) ? 'var(--color-brand-primary)' : 'var(--color-border-primary)',
                        transition: 'all var(--transition-base)'
                      }}
                    />
                  ))}
                </div>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                  margin: 0
                }}>
                  {currentStep - 1} of {totalSteps - 1}
                </p>
              </div>

              {/* Content */}
              <div 
                ref={contentRef}
                className="onboarding-modal-content"
                style={{
                  padding: 'var(--space-8) var(--space-8) 0 var(--space-8)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <div 
                  key={currentStep}
                  className="animate-slide-in"
                  style={{
                    maxWidth: '600px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    paddingTop: 'var(--space-12)',
                    paddingBottom: 'var(--space-16)'
                  }}>

                  {/* Title */}
                  <h2 style={{
                    fontFamily: 'var(--font-editorial)',
                    fontWeight: 'var(--font-normal)',
                    fontSize: 'clamp(var(--text-xl), 3vw, var(--text-2xl))',
                    textAlign: 'center',
                    marginBottom: 'var(--space-3)',
                    lineHeight: '1.2',
                    color: 'var(--color-text-primary)'
                  }}>
                    {stepContent?.title}
                  </h2>

                  {/* Subtitle */}
                  <p style={{
                    fontSize: 'var(--text-base)',
                    color: 'var(--color-text-secondary)',
                    textAlign: 'center',
                    marginBottom: 'var(--space-12)',
                    maxWidth: '400px'
                  }}>
                    {stepContent?.subtitle}
                  </p>

                  {/* Options */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: stepContent?.isMultiSelect 
                      ? 'repeat(auto-fit, minmax(180px, 1fr))'
                      : 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: 'var(--space-4)',
                    width: '100%',
                    maxWidth: stepContent?.isMultiSelect ? '800px' : '600px',
                    marginBottom: 'var(--space-8)'
                  }}>
                    {stepContent?.options && stepContent.options.map((option, index) => {
                      const isSelected = stepContent.isMultiSelect
                        ? (stepContent.selectedValue as string[]).includes(option.id)
                        : stepContent.selectedValue === option.id;

                      return (
                        <button
                          key={option.id}
                          className="animate-fade-in"
                          onClick={() => {
                            if (stepContent.isMultiSelect) {
                              handleInterestToggle(option.id);
                            } else {
                              handleSelection(stepContent.field!, option.id);
                            }
                          }}
                          style={{
                            padding: 'var(--space-6)',
                            border: `1px solid ${isSelected ? 'var(--color-brand-primary)' : 'var(--color-border-primary)'}`,
                            borderRadius: 'var(--radius-lg)',
                            background: isSelected 
                              ? 'linear-gradient(135deg, rgba(var(--color-brand-primary-rgb), 0.08) 0%, rgba(var(--color-brand-primary-rgb), 0.03) 50%, rgba(var(--color-brand-primary-rgb), 0.01) 100%)'
                              : 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s ease',
                            textAlign: 'center',
                            position: 'relative',
                            minHeight: stepContent.isMultiSelect ? '80px' : '100px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 'var(--space-2)',
                            opacity: 0,
                            animationDelay: `${Math.floor(index / 2) * 0.1}s`,
                            transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                            boxShadow: isSelected 
                              ? `
                                0 0 0 1px var(--color-brand-primary),
                                0 0 0 3px rgba(var(--color-brand-primary-rgb), 0.1),
                                0 4px 20px rgba(var(--color-brand-primary-rgb), 0.15),
                                0 8px 32px rgba(var(--color-brand-primary-rgb), 0.08)
                              `
                              : 'none',
                            backdropFilter: isSelected ? 'blur(8px)' : 'none'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
                              e.currentTarget.style.background = 'var(--color-bg-secondary)';
                              e.currentTarget.style.transform = 'translateY(-1px) scale(1.01)';
                              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = 'var(--color-border-primary)';
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.transform = 'translateY(0) scale(1)';
                              e.currentTarget.style.boxShadow = 'none';
                            }
                          }}
                        >
                          {/* Inner glow effect for selected state */}
                          {isSelected && (
                            <>
                              <div style={{
                                position: 'absolute',
                                inset: '-2px',
                                borderRadius: 'var(--radius-lg)',
                                background: 'linear-gradient(135deg, rgba(var(--color-brand-primary-rgb), 0.3) 0%, rgba(var(--color-brand-primary-rgb), 0.1) 50%, transparent 100%)',
                                zIndex: -1,
                                opacity: 0.6,
                                filter: 'blur(4px)',
                                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                              }} />
                              {/* Animated border effect */}
                              <div style={{
                                position: 'absolute',
                                inset: '-1px',
                                borderRadius: 'var(--radius-lg)',
                                background: 'linear-gradient(45deg, transparent 30%, rgba(var(--color-brand-primary-rgb), 0.2) 50%, transparent 70%)',
                                backgroundSize: '200% 200%',
                                animation: 'shimmer 3s ease-in-out infinite',
                                zIndex: -1
                              }} />
                            </>
                          )}
                          
                          <div style={{
                            fontFamily: 'var(--font-editorial)',
                            fontSize: 'var(--text-lg)',
                            fontWeight: 'var(--font-normal)',
                            color: isSelected ? 'var(--color-brand-primary)' : 'var(--color-text-primary)',
                            marginBottom: (option as any).desc ? 'var(--space-1)' : 0,
                            transition: 'all var(--transition-base)',
                            textShadow: isSelected ? '0 0 20px rgba(var(--color-brand-primary-rgb), 0.3)' : 'none',
                            transform: isSelected ? 'translateZ(0)' : 'none'
                          }}>
                            {option.label}
                          </div>
                          
                          {(option as any).desc && (
                            <div style={{
                              fontSize: 'var(--text-sm)',
                              color: isSelected ? 'var(--color-text-secondary)' : 'var(--color-text-tertiary)',
                              lineHeight: '1.4',
                              transition: 'all var(--transition-base)',
                              opacity: isSelected ? 1 : 0.8,
                              transform: isSelected ? 'translateZ(0)' : 'none'
                            }}>
                              {(option as any).desc}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer Navigation */}
              <div style={{
                padding: 'var(--space-6) var(--space-8)',
                display: 'flex',
                maxWidth: '600px',
                width: '100%',
                margin: '0 auto',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '0.5px solid var(--color-border-primary)',
                background: 'var(--color-bg-primary)',
                gap: 'var(--space-4)',
                flexShrink: 0
              }}>
                <Button
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  variant="secondary"
                  icon={ArrowLeft}
                  iconSide="left"
                  fullWidth={false}
                  className="animate-slide-in-left"
                >
                  Back
                </Button>

                <Button
                  onClick={currentStep === totalSteps ? handleComplete : handleNext}
                  disabled={!canProceed() || loading}
                  loading={loading}
                  variant="primary"
                  icon={currentStep === totalSteps ? undefined : ArrowRight}
                  iconSide="right"
                  fullWidth={false}
                  className="animate-slide-in-right"
                  style={{ minWidth: '140px' }}
                >
                  {currentStep === totalSteps ? 'Complete Setup' : 'Next'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};