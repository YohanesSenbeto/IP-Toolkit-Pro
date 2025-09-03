import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash("password123", 10);
    const techPassword = await bcrypt.hash("tech123", 10);

    // Create regular users for testing
    await prisma.user.upsert({
        where: { email: "admin@example.com" },
        update: {},
        create: {
            email: "admin@example.com",
            name: "Admin User",
            password: hashedPassword,
            role: "ADMIN",
        },
    });

    await prisma.user.upsert({
        where: { email: "user@example.com" },
        update: {},
        create: {
            email: "user@example.com",
            name: "Regular User",
            password: hashedPassword,
            role: "USER",
        },
    });

    // Create technicians for testing
    await prisma.ethioTelecomTechnician.upsert({
        where: { employeeId: "14777" },
        update: {},
        create: {
            employeeId: "14777",
            username: "ethio14777",
            name: "John Technician",
            email: "john.technician@ethiotelecom.et",
            password: techPassword,
            regionId: null, // Will be assigned later
        },
    });

    await prisma.ethioTelecomTechnician.upsert({
        where: { employeeId: "14888" },
        update: {},
        create: {
            employeeId: "14888",
            username: "ethio14888",
            name: "Sarah Network Engineer",
            email: "sarah.engineer@ethiotelecom.et",
            password: techPassword,
            regionId: null, // Will be assigned later
        },
    });

    // Seed WAN IP addresses for testing
    const wanIps = [
        {
            ipAddress: "196.188.64.1",
            cidr: 24,
            description: "Main PE Router - Addis Ababa Central",
            location: "Addis Ababa Data Center",
            routerModel: "Cisco ASR 9000"
        },
        {
            ipAddress: "196.188.65.1", 
            cidr: 26,
            description: "Edge Router - Bole Branch",
            location: "Bole Office",
            routerModel: "Juniper MX204"
        },
        {
            ipAddress: "196.188.66.1",
            cidr: 28,
            description: "Customer Premise Router - Hilton Hotel",
            location: "Hilton Addis",
            routerModel: "MikroTik CCR1036"
        },
        {
            ipAddress: "196.188.67.1",
            cidr: 30,
            description: "Backhaul Link - Akaki to Bole",
            location: "Akaki Transmission Site",
            routerModel: "Huawei NE40E"
        }
    ];

    for (const wanIp of wanIps) {
        await prisma.wanIp.upsert({
            where: { ipAddress: wanIp.ipAddress },
            update: {},
            create: wanIp
        });
    }

    // Seed router models with tutorial links
    const routerModels = [
        {
            modelName: "Cisco ASR 9000",
            manufacturer: "Cisco",
            type: "PE Router",
            capabilities: ["MPLS", "BGP", "OSPF", "QoS"],
            tutorialUrl: "/knowledge-base/cisco-asr-9000-configuration"
        },
        {
            modelName: "Juniper MX204",
            manufacturer: "Juniper",
            type: "Edge Router", 
            capabilities: ["MPLS", "BGP", "Firewall", "VPN"],
            tutorialUrl: "/knowledge-base/juniper-mx204-setup"
        },
        {
            modelName: "MikroTik CCR1036",
            manufacturer: "MikroTik",
            type: "Customer Premise Router",
            capabilities: ["NAT", "Firewall", "QoS", "VPN"],
            tutorialUrl: "/knowledge-base/mikrotik-ccr1036-configuration"
        },
        {
            modelName: "Huawei NE40E",
            manufacturer: "Huawei",
            type: "Core Router",
            capabilities: ["MPLS", "BGP", "OSPF", "VRF"],
            tutorialUrl: "/knowledge-base/huawei-ne40e-installation"
        }
    ];

    for (const routerModel of routerModels) {
        await prisma.routerModel.upsert({
            where: { modelName: routerModel.modelName },
            update: {},
            create: routerModel
        });
    }
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e);
        prisma.$disconnect();
    });
