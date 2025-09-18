import { Gamepad2 } from 'lucide-react';

type GameIconProps = {
  gameName: string;
  className?: string;
};

// Simple custom icons for specific games
const FreeFireIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3Z" />
    <path d="M6 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3Z" />
    <path d="M12 3v18" />
  </svg>
);

const BGMIicon = ({ className }: { className?: string }) => (
    <svg 
        className={className} 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <path d="M12 12L7 22L17 22L12 12Z" />
        <path d="M12 2L7 12H17L12 2Z" />
    </svg>
);

export const GameIcon = ({ gameName, className }: GameIconProps) => {
  switch (gameName) {
    case 'Free Fire':
      return <FreeFireIcon className={className} />;
    case 'BGMI':
      return <BGMIicon className={className} />;
    default:
      return <Gamepad2 className={className} />;
  }
};
