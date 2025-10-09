"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft } from "lucide-react";

export default function CreateIpPool() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    ipRange: "",
    region: "",
    interface: "",
    description: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/technician/pools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          technicianId: session?.user.id
        })
      });

      if (response.ok) {
        router.push("/technician/dashboard");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create pool");
      }
    } catch (error) {
      setError("An error occurred while creating the pool");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Create IP Pool</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Pool Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Addis Ababa Pool 1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="ipRange">IP Range</Label>
                <Input
                  id="ipRange"
                  value={formData.ipRange}
                  onChange={(e) => setFormData({ ...formData, ipRange: e.target.value })}
                  placeholder="e.g., 10.1.1.0/24"
                  required
                />
              </div>

              <div>
                <Label htmlFor="region">Region</Label>
                <Select value={formData.region} onValueChange={(value) => setFormData({ ...formData, region: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="addis_ababa">Addis Ababa</SelectItem>
                    <SelectItem value="dire_dawa">Dire Dawa</SelectItem>
                    <SelectItem value="hawassa">Hawassa</SelectItem>
                    <SelectItem value="bahir_dar">Bahir Dar</SelectItem>
                    <SelectItem value="mekelle">Mekelle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="interface">Interface Type</Label>
                <Select value={formData.interface} onValueChange={(value) => setFormData({ ...formData, interface: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select interface" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fiber">Fiber</SelectItem>
                    <SelectItem value="dsl">DSL</SelectItem>
                    <SelectItem value="wireless">Wireless</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the pool"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create IP Pool"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}