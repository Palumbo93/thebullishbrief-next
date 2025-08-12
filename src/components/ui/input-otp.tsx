import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, style, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={containerClassName}
    className={className}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      ...style
    }}
    {...props}
  />
))
InputOTP.displayName = "InputOTP"

const InputOTPGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    className={className}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      ...style
    }}
    {...props}
  />
))
InputOTPGroup.displayName = "InputOTPGroup"

const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { index: number }
>(({ index, className, style, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index]

  return (
    <div
      ref={ref}
      className={className}
      style={{
        position: 'relative',
        display: 'flex',
        height: '48px',
        width: '40px',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #ffffff30',
        borderRadius: 'var(--radius-md)',
        fontSize: 'var(--text-lg)',
        fontWeight: 'var(--font-semibold)',
        color: 'var(--color-text-primary)',
        background: 'var(--color-bg-primary)',
        transition: 'all var(--transition-base)',
        ...(isActive && {
          borderColor: 'var(--color-brand-primary)',
          boxShadow: '0 0 0 2px var(--color-brand-primary)',
          zIndex: 10
        }),
        ...style
      }}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div style={{
          pointerEvents: 'none',
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'caret-blink 1s infinite'
        }}>
          <div style={{
            height: '16px',
            width: '1px',
            background: 'var(--color-text-primary)',
            animation: 'caret-blink 1s infinite'
          }} />
        </div>
      )}
    </div>
  )
})
InputOTPSlot.displayName = "InputOTPSlot"

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ style, ...props }, ref) => (
  <div 
    ref={ref} 
    role="separator" 
    style={{
      color: 'var(--color-text-secondary)',
      fontSize: 'var(--text-lg)',
      fontWeight: 'var(--font-medium)',
      ...style
    }}
    {...props}
  >
    -
  </div>
))
InputOTPSeparator.displayName = "InputOTPSeparator"

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } 