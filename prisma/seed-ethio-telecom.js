const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Seeding Ethio Telecom regional IP data...");

    // Create regions
    const regions = [
        { name: "SWAAZ/SARBET", code: "SWAAZ" },
        { name: "EAAZ/BOLE", code: "EAAZ" },
        { name: "NAAZ", code: "NAAZ" },
        { name: "WAAZ", code: "WAAZ" },
        { name: "EAAZ", code: "EAAZ" },
        { name: "CWR Ambo", code: "CWR" },
    ];

    for (const region of regions) {
        await prisma.ethioTelecomRegion.upsert({
            where: { name: region.name },
            update: {},
            create: region,
        });
    }

    // Get all regions
    const swaaz = await prisma.ethioTelecomRegion.findUnique({
        where: { name: "SWAAZ/SARBET" },
    });
    const eaaz = await prisma.ethioTelecomRegion.findUnique({
        where: { name: "EAAZ/BOLE" },
    });
    const naaz = await prisma.ethioTelecomRegion.findUnique({
        where: { name: "NAAZ" },
    });
    const waaz = await prisma.ethioTelecomRegion.findUnique({
        where: { name: "WAAZ" },
    });
    const eaaz2 = await prisma.ethioTelecomRegion.findUnique({
        where: { name: "EAAZ" },
    });
    const cwr = await prisma.ethioTelecomRegion.findUnique({
        where: { name: "CWR Ambo" },
    });

    // Create interfaces with IP pools
    const interfaces = [
        // SWAAZ/SARBET
        {
            name: "VBUI100",
            regionId: swaaz.id,
            ipPoolStart: "10.129.0.1",
            ipPoolEnd: "10.129.47.255",
            subnetMask: "255.255.192.0",
            defaultGateway: "10.129.48.1",
        },
        {
            name: "VBUI101",
            regionId: swaaz.id,
            ipPoolStart: "10.83.0.2",
            ipPoolEnd: "10.83.127.255",
            subnetMask: "255.255.0.0",
            defaultGateway: "10.83.0.1",
        },
        {
            name: "VBUI300",
            regionId: swaaz.id,
            ipPoolStart: "10.129.96.1",
            ipPoolEnd: "10.129.127.254",
            subnetMask: "255.255.224.0",
            defaultGateway: "10.129.96.1",
        },
        {
            name: "VBUI1700",
            regionId: swaaz.id,
            ipPoolStart: "196.188.128.1",
            ipPoolEnd: "196.188.159.254",
            subnetMask: "255.255.224.0",
            defaultGateway: "196.188.128.1",
        },
        // EAAZ/BOLE
        {
            name: "VBUI100",
            regionId: eaaz.id,
            ipPoolStart: "10.130.0.1",
            ipPoolEnd: "10.130.63.254",
            subnetMask: "255.255.192.0",
            defaultGateway: "10.130.48.1",
        },
        {
            name: "VBUI101",
            regionId: eaaz.id,
            ipPoolStart: "10.87.0.2",
            ipPoolEnd: "10.87.255.254",
            subnetMask: "255.255.0.0",
            defaultGateway: "10.87.0.1",
        },
        // ARADA
        {
            name: "VBUI200",
            regionId: naaz.id,
            ipPoolStart: "10.130.96.2",
            ipPoolEnd: "10.130.127.254",
            subnetMask: "255.255.224.0",
            defaultGateway: "10.130.96.1",
        },
        {
            name: "VBUI1700",
            regionId: naaz.id,
            ipPoolStart: "196.188.0.2",
            ipPoolEnd: "196.188.31.254",
            subnetMask: "255.255.224.0",
            defaultGateway: "196.188.0.1",
        },
        {
            name: "VBUI100",
            regionId: naaz.id,
            ipPoolStart: "10.133.0.1",
            ipPoolEnd: "10.133.63.254",
            subnetMask: "255.255.192.0",
            defaultGateway: "10.133.48.1",
        },
        // WAAZ
        {
            name: "vbui200",
            regionId: waaz.id,
            ipPoolStart: "10.149.0.1",
            ipPoolEnd: "10.149.63.254",
            subnetMask: "255.255.192.0",
            defaultGateway: "10.149.48.1",
        },
        {
            name: "VBUI100",
            regionId: waaz.id,
            ipPoolStart: "10.134.48.2",
            ipPoolEnd: "10.134.63.254",
            subnetMask: "255.255.192.0",
            defaultGateway: "10.134.48.1",
        },
        {
            name: "VBUI101",
            regionId: waaz.id,
            ipPoolStart: "10.177.45.3",
            ipPoolEnd: "10.177.45.254",
            subnetMask: "255.255.255.0",
            defaultGateway: "10.177.45.1",
        },
        {
            name: "VBUI1700",
            regionId: waaz.id,
            ipPoolStart: "196.189.160.2",
            ipPoolEnd: "196.189.175.254",
            subnetMask: "255.255.240.0",
            defaultGateway: "196.189.160.1",
        },
        // YEKA
        {
            name: "Vbui100",
            regionId: eaaz2.id,
            ipPoolStart: "10.150.48.2",
            ipPoolEnd: "10.150.63.254",
            subnetMask: "255.255.192.0",
            defaultGateway: "10.150.48.1",
        },
        {
            name: "Vbui200",
            regionId: eaaz2.id,
            ipPoolStart: "10.150.96.2",
            ipPoolEnd: "10.150.127.254",
            subnetMask: "255.255.224.0",
            defaultGateway: "10.150.96.1",
        },
        {
            name: "Vbui101",
            regionId: eaaz2.id,
            ipPoolStart: "10.85.128.2",
            ipPoolEnd: "10.85.255.254",
            subnetMask: "255.255.128.0",
            defaultGateway: "10.85.128.1",
        },
        // CWR Ambo
        {
            name: "Vbui100",
            regionId: cwr.id,
            ipPoolStart: "10.130.144.2",
            ipPoolEnd: "10.130.147.254",
            subnetMask: "255.255.252.0",
            defaultGateway: "10.130.144.1",
        },
        {
            name: "Vbui300",
            regionId: cwr.id,
            ipPoolStart: "10.239.128.2",
            ipPoolEnd: "10.239.159.254",
            subnetMask: "255.255.224.0",
            defaultGateway: "10.239.128.1",
        },
        {
            name: "Vbui1700",
            regionId: cwr.id,
            ipPoolStart: "196.190.192.2",
            ipPoolEnd: "196.190.207.254",
            subnetMask: "255.255.240.0",
            defaultGateway: "196.190.192.1",
        },
    ];

    for (const interfaceItem of interfaces) {
        await prisma.ethioTelecomInterface
            .upsert({
                where: {
                    // Use a unique constraint based on name and regionId
                    // Since there's no compound unique constraint, we'll use a workaround
                    id: await prisma.ethioTelecomInterface
                        .findFirst({
                            where: {
                                name: interfaceItem.name,
                                regionId: interfaceItem.regionId,
                            },
                        })
                        .then(
                            (existing) =>
                                existing?.id ||
                                "new-" + Date.now() + Math.random()
                        ),
                },
                update: {},
                create: interfaceItem,
            })
            .catch(async () => {
                // Fallback: create if doesn't exist, skip if exists
                const existing = await prisma.ethioTelecomInterface.findFirst({
                    where: {
                        name: interfaceItem.name,
                        regionId: interfaceItem.regionId,
                    },
                });

                if (!existing) {
                    await prisma.ethioTelecomInterface.create({
                        data: interfaceItem,
                    });
                }
            });
    }

    // Create technician for Yohanes.Senbeto
    await prisma.ethioTelecomTechnician.upsert({
        where: { employeeId: "14777" },
        update: {},
        create: {
            employeeId: "14777",
            username: "Yohanes.Senbeto",
            name: "Yohanes Senbeto",
            email: "yohanes.senbeto@ethiotelecom.et",
            regionId: swaaz.id,
        },
    });

    // Create sample customer data with WAN IP assignments
    const customers = [
        // SWAAZ/SARBET customers
        {
            accountNumber: "742684130",
            accessNumber: "13101826064",
            wanIp: "10.129.0.5",
            interfaceName: "VBUI100",
            regionName: "SWAAZ/SARBET",
            customerName: "Abebe Kebede",
            location: "Addis Ababa, Sarbet"
        },
        {
            accountNumber: "845721369",
            accessNumber: "13101827542",
            wanIp: "10.129.0.12",
            interfaceName: "VBUI100",
            regionName: "SWAAZ/SARBET",
            customerName: "Fatuma Ali",
            location: "Addis Ababa, Lideta"
        },
        {
            accountNumber: "963147258",
            accessNumber: "13101828315",
            wanIp: "10.83.0.15",
            interfaceName: "VBUI101",
            regionName: "SWAAZ/SARBET",
            customerName: "Mohammed Ahmed",
            location: "Addis Ababa, Kazanchis"
        },
        
        // EAAZ/BOLE customers
        {
            accountNumber: "258369147",
            accessNumber: "13101829476",
            wanIp: "10.130.0.8",
            interfaceName: "VBUI100",
            regionName: "EAAZ/BOLE",
            customerName: "Hirut Tadesse",
            location: "Addis Ababa, Bole"
        },
        {
            accountNumber: "741852963",
            accessNumber: "13101830528",
            wanIp: "10.87.0.25",
            interfaceName: "VBUI101",
            regionName: "EAAZ/BOLE",
            customerName: "Daniel Gizaw",
            location: "Addis Ababa, Gerji"
        },
        
        // NAAZ customers
        {
            accountNumber: "852963741",
            accessNumber: "13101831689",
            wanIp: "10.130.96.10",
            interfaceName: "VBUI200",
            regionName: "NAAZ",
            customerName: "Alemu Bekele",
            location: "Addis Ababa, Arada"
        },
        
        // WAAZ customers
        {
            accountNumber: "369147852",
            accessNumber: "13101832741",
            wanIp: "10.149.0.18",
            interfaceName: "vbui200",
            regionName: "WAAZ",
            customerName: "Tigist Mekonnen",
            location: "Addis Ababa, Merkato"
        },
        
        // CWR Ambo customers
        {
            accountNumber: "147258369",
            accessNumber: "13101833892",
            wanIp: "10.239.139.51",
            interfaceName: "Vbui300",
            regionName: "CWR Ambo",
            customerName: "Getachew Lemma",
            location: "Ambo, Ethiopia"
        }
    ];

    // Create customer WAN IP assignments
    for (const customer of customers) {
        const interfaceRecord = await prisma.ethioTelecomInterface.findFirst({
            where: {
                name: customer.interfaceName,
                region: {
                    name: customer.regionName
                }
            }
        });

        if (interfaceRecord) {
            await prisma.customerWanIp.upsert({
                where: { accountNumber: customer.accountNumber },
                update: {
                    accessNumber: customer.accessNumber,
                    wanIp: customer.wanIp,
                    interfaceId: interfaceRecord.id,
                    customerName: customer.customerName,
                    location: customer.location,
                    isActive: true
                },
                create: {
                    accountNumber: customer.accountNumber,
                    accessNumber: customer.accessNumber,
                    wanIp: customer.wanIp,
                    interfaceId: interfaceRecord.id,
                    customerName: customer.customerName,
                    location: customer.location,
                    isActive: true
                }
            });
        }
    }

    console.log("✅ Ethio Telecom regional IP data seeded successfully!");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
