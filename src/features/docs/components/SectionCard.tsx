import { Card } from "~/components/ui/card";
import React from "react";

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  content: string[];
}

export const SectionCard = ({ icon, title, content }: SectionCardProps) => {
  return (
    <Card className="p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="bg-primary/10 mt-1 rounded-md p-2">{icon}</div>
        <div className="flex-1">
          <h2 className="mb-3 text-xl font-semibold">{title}</h2>
          <ul className="text-muted-foreground space-y-2">
            {content.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};
