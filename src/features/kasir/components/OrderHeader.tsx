import { Button } from "~/components/ui/button";

interface OrderHeaderProps {
  activeTab: "on-process" | "completed";
  setActiveTab: (tab: "on-process" | "completed") => void;
}

export const OrderHeader = ({ activeTab, setActiveTab }: OrderHeaderProps) => {
  return (
    <div className="flex items-center gap-4">
      <Button
        size="sm"
        variant={activeTab === "on-process" ? "default" : "outline"}
        onClick={() => setActiveTab("on-process")}
      >
        On Process
      </Button>
      <Button
        size="sm"
        variant={activeTab === "completed" ? "default" : "outline"}
        onClick={() => setActiveTab("completed")}
      >
        Completed
      </Button>
    </div>
  );
};
