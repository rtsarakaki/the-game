import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const CopyIcon: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} transition-transform duration-200 hover:scale-110`}
  >
    <g className="animate-pulse">
      <rect
        x="9"
        y="9"
        width="13"
        height="13"
        rx="2"
        ry="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        className="animate-[fadeIn_0.3s_ease-in-out]"
      />
      <path
        d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        className="animate-[slideIn_0.4s_ease-in-out]"
      />
    </g>
  </svg>
);

export const EmailIcon: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} transition-transform duration-200 hover:scale-110`}
  >
    <g className="hover:animate-bounce">
      <rect
        x="2"
        y="4"
        width="20"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        className="animate-[drawRect_0.5s_ease-in-out]"
      />
      <path
        d="m2 7 10 6 10-6"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        className="animate-[drawPath_0.6s_ease-in-out_0.2s_both]"
        strokeDasharray="28"
        strokeDashoffset="28"
        style={{
          animation: 'drawPath 0.6s ease-in-out 0.2s both'
        }}
      />
    </g>
  </svg>
);

export const WhatsAppIcon: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} transition-transform duration-200 hover:scale-110`}
  >
    <g className="hover:animate-pulse">
      <path
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"
        fill="currentColor"
        className="animate-[fadeIn_0.5s_ease-in-out]"
      />
    </g>
  </svg>
);

export const CopyAllIcon: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} transition-transform duration-200 hover:scale-110`}
  >
    <g className="hover:animate-pulse">
      <rect
        x="9"
        y="9"
        width="13"
        height="13"
        rx="2"
        ry="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        className="animate-[slideInRight_0.3s_ease-in-out]"
      />
      <path
        d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        className="animate-[slideInLeft_0.4s_ease-in-out]"
      />
      <path
        d="M13 13h4M13 17h4M13 9h4"
        stroke="currentColor"
        strokeWidth="1.5"
        className="animate-[fadeIn_0.6s_ease-in-out_0.3s_both]"
      />
    </g>
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} transition-all duration-300`}
  >
    <g className="animate-[checkmark_0.5s_ease-in-out]">
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        className="animate-[scaleIn_0.3s_ease-in-out]"
      />
      <path
        d="m9 12 2 2 4-4"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-[drawCheck_0.4s_ease-in-out_0.2s_both]"
        strokeDasharray="8"
        strokeDashoffset="8"
        style={{
          animation: 'drawCheck 0.4s ease-in-out 0.2s both'
        }}
      />
    </g>
  </svg>
);

export const OpenInNewTabIcon: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} transition-transform duration-200 hover:scale-110`}
    aria-label="Abrir em nova aba"
  >
    <rect x="3" y="7" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M21 3v6m0-6h-6m6 0L13 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export const IncognitoIcon: React.FC<IconProps> = ({ className = "", size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} transition-transform duration-200 hover:scale-110`}
    aria-label="Abrir em aba anônima"
  >
    <path d="M3 19c.5-2.5 3.5-4 9-4s8.5 1.5 9 4" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="9" cy="15" r="1.5" fill="currentColor" />
    <circle cx="15" cy="15" r="1.5" fill="currentColor" />
    <path d="M8 10l-2-6h12l-2 6" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M8 10h8" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

export const DiceIcon: React.FC<IconProps> = ({ className = "", size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} transition-transform duration-200 hover:rotate-12 hover:scale-110 animate-bounce`}
    aria-label="Nova partida"
  >
    <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2" fill="#fff" />
    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
    <circle cx="16" cy="8" r="1.5" fill="currentColor" />
    <circle cx="8" cy="16" r="1.5" fill="currentColor" />
    <circle cx="16" cy="16" r="1.5" fill="currentColor" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

// CSS Animations (to be added to globals.css)
export const shareIconsStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideIn {
    from { transform: translateX(-10px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideInRight {
    from { transform: translateX(10px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideInLeft {
    from { transform: translateX(-10px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes drawRect {
    from { stroke-dasharray: 72; stroke-dashoffset: 72; }
    to { stroke-dasharray: 72; stroke-dashoffset: 0; }
  }
  
  @keyframes drawPath {
    from { stroke-dashoffset: 28; }
    to { stroke-dashoffset: 0; }
  }
  
  @keyframes scaleIn {
    from { transform: scale(0); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  
  @keyframes drawCheck {
    from { stroke-dashoffset: 8; }
    to { stroke-dashoffset: 0; }
  }
  
  @keyframes checkmark {
    0% { transform: scale(0); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
`;