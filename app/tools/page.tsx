import Link from "next/link";
import { Globe, Router } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const tools = [
    {
        title: "WAN IP Analyzer",
        description:
            "Comprehensive WAN IP analysis with CRM integration, automatic CIDR calculations, and router configuration support",
        icon: Globe,
        link: "/tools/wan-ip-analyzer",
        features: [
            "CRM customer lookup",
            "Automatic CIDR calculation",
            "Region & interface detection",
            "Subnet mask & gateway config",
            "Router recommendations",
            "Tutorial videos",
            "PPPOE vs WAN IP detection",
        ],
    },
    {
        title: "Modem Configuration Tutorials",
        description:
            "Comprehensive video tutorials for modem and router configuration from Yoh-Tech Solutions YouTube channel",
        icon: Router,
        link: "/tools/modem-tutorials",
        features: [
            "Live YouTube integration",
            "All major modem brands",
            "Fiber & copper configurations",
            "Beginner to advanced levels",
            "Advanced search & filters",
            "Mobile responsive design",
            "Real-time video data",
        ],
    },
];

export default function ToolsPage() {
    return (
        <div className="w-full max-w-screen-xl mx-auto px-2 sm:px-4 md:px-8 py-6 md:py-10">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Network Tools</h1>
                <p className="text-muted-foreground">
                    Comprehensive tools for Ethio Telecom network configuration
                    and management
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
                                    <CardDescription>
                                        {tool.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-1">
                                        {tool.features.map((feature, index) => (
                                            <li
                                                key={index}
                                                className="text-sm text-muted-foreground flex items-center gap-2"
                                            >
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
