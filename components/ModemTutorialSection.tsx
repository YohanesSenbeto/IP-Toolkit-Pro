"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    Router,
    ExternalLink,
    Play
} from "lucide-react";

interface ModemTutorialSectionProps {
    onVideoSelect?: (video: any) => void;
}

export default function ModemTutorialSection({ onVideoSelect }: ModemTutorialSectionProps) {
    const handleViewTutorials = () => {
        window.open('/tools/modem-tutorials', '_blank');
    };

    return (
        <div className="mb-8">
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                        <Router className="h-6 w-6" />
                        Modem Configuration Tutorials
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-2">
                        Access our comprehensive library of modem and router configuration tutorials 
                        from Yoh-Tech Solutions YouTube channel. Learn step-by-step setup guides 
                        for all major modem brands and connection types.
                    </p>
                </CardHeader>

                <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {/* Feature Cards */}
                        <div className="bg-white rounded-lg p-4 border border-blue-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <h3 className="font-semibold text-sm text-gray-800">All Modem Brands</h3>
                            </div>
                            <p className="text-xs text-gray-600">
                                Huawei, TP-Link, D-Link, Cisco, Netgear, ZTE, Linksys
                            </p>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-green-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <h3 className="font-semibold text-sm text-gray-800">Connection Types</h3>
                            </div>
                            <p className="text-xs text-gray-600">
                                Fiber, Copper, DSL, Ethernet configurations
                            </p>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-purple-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <h3 className="font-semibold text-sm text-gray-800">Difficulty Levels</h3>
                            </div>
                            <p className="text-xs text-gray-600">
                                Beginner to Advanced tutorials
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            onClick={handleViewTutorials}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            <Play className="h-4 w-4 mr-2" />
                            View All Tutorials
                            <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                        
                        <Button
                            variant="outline"
                            onClick={() => window.open('https://youtube.com/@yoh-tech-solutions', '_blank')}
                            className="flex items-center gap-2"
                        >
                            <ExternalLink className="h-4 w-4" />
                            YouTube Channel
                        </Button>
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-4 pt-4 border-t border-blue-200">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center gap-4">
                                <span>📺 Live YouTube Integration</span>
                                <span>🔍 Advanced Search & Filters</span>
                                <span>📱 Mobile Responsive</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
