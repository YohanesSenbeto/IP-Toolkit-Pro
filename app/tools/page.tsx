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
        <div className="w-full max-w-screen-xl mx-auto px-4 py-10 bg-background text-foreground">
            {/* Page header */}
            <div className="mb-10 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                    Network Tools
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg md:text-xl">
                    Comprehensive tools for Ethio Telecom network configuration
                    and management
                </p>
            </div>

            {/* Tools grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                        <Link
                            key={tool.title}
                            href={tool.link}
                            className="group"
                        >
                            <Card className="h-full flex flex-col justify-between p-6 transition-transform transform hover:-translate-y-1 hover:shadow-lg cursor-pointer border border-gray-200 dark:border-gray-700">
                                <CardHeader>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Icon className="w-8 h-8 text-indigo-600 group-hover:text-indigo-500" />
                                        <CardTitle className="text-lg font-semibold">
                                            {tool.title}
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="text-gray-600 dark:text-gray-300 text-sm">
                                        {tool.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="mt-4 flex-1">
                                    <ul className="space-y-1">
                                        {tool.features.map((feature, index) => (
                                            <li
                                                key={index}
                                                className="flex items-center gap-2 text-gray-700 dark:text-gray-400 text-sm"
                                            >
                                                <span className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0"></span>
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
