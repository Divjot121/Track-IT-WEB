import React from 'react';
import {
  Calculator,
  Atom,
  Globe,
  BookOpen,
  Languages,
  Laptop,
  GraduationCap,
  LucideProps,
} from 'lucide-react';

interface SubjectIconProps extends LucideProps {
  name: string;
}

export const SubjectIcon: React.FC<SubjectIconProps> = ({ name, ...props }) => {
  switch (name) {
    case 'Calculator':
      return <Calculator {...props} />;
    case 'Atom':
      return <Atom {...props} />;
    case 'Globe':
      return <Globe {...props} />;
    case 'BookOpen':
      return <BookOpen {...props} />;
    case 'Languages':
      return <Languages {...props} />;
    case 'Laptop':
      return <Laptop {...props} />;
    default:
      return <GraduationCap {...props} />;
  }
};
