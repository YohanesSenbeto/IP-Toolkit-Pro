import { z } from "zod";

// IP Address validation schema
export const ipAddressSchema = z.string().refine(
  (ip) => {
    const ipRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    if (!ipRegex.test(ip)) return false;
    
    const parts = ip.split('.').map(part => parseInt(part, 10));
    return parts.every(part => part >= 0 && part <= 255);
  },
  {
    message: "Invalid IP address format. Must be in the format XXX.XXX.XXX.XXX where each XXX is between 0-255"
  }
);

// CIDR notation validation schema
export const cidrSchema = z.number().int().min(0).max(32).refine(
  (cidr) => cidr >= 0 && cidr <= 32,
  {
    message: "CIDR notation must be between 0 and 32"
  }
);

// IP Calculator form schema
export const ipCalculatorSchema = z.object({
  wanIp: ipAddressSchema,
  cidr: cidrSchema,
  title: z.string().min(1).max(100).optional()
});

// User registration schema
export const userRegistrationSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
  ),
  confirmPassword: z.string(),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
  terms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// User login schema
export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// Knowledge base article schema
export const knowledgeBaseArticleSchema = z.object({
  title: z.string().min(5).max(200),
  slug: z.string().min(5).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug must contain only lowercase letters, numbers, and hyphens"
  }),
  content: z.string().min(10),
  videoUrl: z.string().url().optional().or(z.literal('')),
  routerModels: z.array(z.string()).min(1),
  category: z.enum(["Fiber", "DSL", "LTE", "General", "WiFi", "Routing", "Security"]),
  published: z.boolean().default(false)
});

// Calculation history schema
export const calculationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().nullable(),
  wanIp: z.string(),
  cidr: z.number(),
  result: z.object({
    networkAddress: z.string(),
    broadcastAddress: z.string(),
    subnetMask: z.string(),
    wildcardMask: z.string(),
    defaultGateway: z.string(),
    usableHostRange: z.string(),
    totalHosts: z.number(),
    usableHosts: z.number(),
    cidrNotation: z.string()
  }),
  createdAt: z.date()
});

// Types for form validation
export type IPCalculatorFormData = z.infer<typeof ipCalculatorSchema>;
export type UserRegistrationFormData = z.infer<typeof userRegistrationSchema>;
export type UserLoginFormData = z.infer<typeof userLoginSchema>;
export type KnowledgeBaseArticleFormData = z.infer<typeof knowledgeBaseArticleSchema>;