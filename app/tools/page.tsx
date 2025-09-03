import Link from "next/link";
import { Calculator, Globe, Network, BookOpen, Router } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const tools = [
  {
    title: "WAN IP Analyzer",
    description: "Analyze WAN IP addresses with automatic CIDR calculations, region detection, and configuration recommendations",
    icon: Globe,
    link: "/tools/wan-ip-analyzer",
    features: [
      "Automatic CIDR calculation",
      "Region & interface detection",
      "Router recommendations",
      "Tutorial videos",
      "Customer assignment"
    ]
  },
  {
    title: "IP Calculator",
    description: "Traditional IP subnet calculator with CIDR notation support",
    icon: Calculator,
    link: "/tools/ip-calculator",
    features: [
      "CIDR calculations",
      "Subnet information",
      "Host calculations",
      "Binary representation"
    ]
  },
  {
    title: "Network Tools",
    description: "Additional network utilities and diagnostics",
    icon: Network,
    link: "/tools/network",
    features: [
      "Ping tests",
      "Traceroute",
      "DNS lookups",
      "Port scanning"
    ]
  }
];

export default function ToolsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Network Tools</h1>
        <p className="text-muted-foreground">
          Comprehensive tools for Ethio Telecom network configuration and management
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link key={tool.title} href={tool.link}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Icon className="w-8 h-8 text-primary" />
                    <CardTitle>{tool.title}</CardTitle>
                  </div>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {tool.features.map((feature, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1 h-1 bg-primary rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}