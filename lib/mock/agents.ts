import {
  Image, Shield, BarChart3, Search, Layout, Users,
  PenLine, FileText, TrendingUp, Code, type LucideIcon,
} from "lucide-react";

export interface Agent {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  icon: LucideIcon;
  category: string;
  executionTime: string;
  pricePerRun: number;
  rating: number;
  reviewCount: number;
  users: string;
  inputs: string[];
  outputs: string[];
  workflow: { label: string; description: string }[];
  reviews: { id: string; author: string; rating: number; comment: string; date: string }[];
}

export const AGENTS: Agent[] = [
  {
    id: "nft-launch",
    name: "NFT Launch Agent",
    description: "Deploy NFT collections on Arc with automated metadata generation, minting, and marketplace listing.",
    longDescription: "Launch a complete NFT collection on the Arc blockchain without writing a single line of Solidity. This agent handles everything from contract deployment to metadata generation, batch minting, and marketplace integration. Supports ERC-721 and ERC-1155 standards with configurable royalties, reveal mechanics, and whitelist management.",
    icon: Image,
    category: "Web3",
    executionTime: "~8 min",
    pricePerRun: 5.00,
    rating: 4.8,
    reviewCount: 124,
    users: "3.2k",
    inputs: [
      "Collection name and symbol",
      "Token base URI (IPFS/Arweave)",
      "Royalty percentage and recipient",
      "Mint price and max supply",
      "Whitelist addresses (optional)",
    ],
    outputs: [
      "Deployed contract address",
      "Minted token IDs and metadata",
      "Marketplace listing URL",
      "Verification on Arcscan",
      "Deployment receipt and gas report",
    ],
    workflow: [
      { label: "Analyze", description: "Parse collection requirements and validate parameters" },
      { label: "Generate Contract", description: "Write optimized Solidity contract with chosen standard" },
      { label: "Deploy", description: "Deploy contract to Arc testnet with gas optimization" },
      { label: "Mint & Verify", description: "Batch mint tokens and verify contract on explorer" },
      { label: "Output", description: "Return deployment addresses and marketplace links" },
    ],
    reviews: [
      { id: "r1", author: "alice.eth", rating: 5, comment: "Deployed my first collection in minutes. The metadata generation is flawless.", date: "2026-05-28" },
      { id: "r2", author: "buildoor", rating: 4, comment: "Great for quick launches. Would love more customization options for the contract.", date: "2026-05-20" },
      { id: "r3", author: "nftdeployer", rating: 5, comment: "Saved me hours of Solidity work. The Arcscan verification is a nice touch.", date: "2026-05-15" },
    ],
  },
  {
    id: "smart-contract-auditor",
    name: "Smart Contract Auditor",
    description: "Comprehensive Solidity security audit with vulnerability detection, gas optimization, and best practice checks.",
    longDescription: "Get a professional-grade security audit for your Solidity smart contracts. The auditor analyzes source code for common vulnerability patterns including reentrancy, overflow, access control issues, and flash loan attacks. It also provides gas optimization suggestions and compliance checks against ERC standards.",
    icon: Shield,
    category: "Development",
    executionTime: "~15 min",
    pricePerRun: 12.00,
    rating: 4.9,
    reviewCount: 89,
    users: "1.8k",
    inputs: [
      "Solidity source code (single file or zip)",
      "Compiler version and optimization settings",
      "Contract dependencies and imports",
      "Access control roles and permissions",
      "Known external contract addresses",
    ],
    outputs: [
      "Comprehensive audit report (PDF/MD)",
      "Vulnerability severity matrix",
      "Gas optimization suggestions",
      "Fix recommendations with code snippets",
      "Compliance score and ERC standard checks",
    ],
    workflow: [
      { label: "Parse", description: "Parse source code and resolve dependencies" },
      { label: "Analyze Patterns", description: "Scan for known vulnerability patterns" },
      { label: "Detect Issues", description: "Flag security issues with severity levels" },
      { label: "Optimize Gas", description: "Identify gas-heavy patterns and suggest fixes" },
      { label: "Output", description: "Generate comprehensive audit report" },
    ],
    reviews: [
      { id: "r4", author: "solidity_dev", rating: 5, comment: "Caught a reentrancy vulnerability I completely missed. Worth every penny.", date: "2026-05-25" },
      { id: "r5", author: "defi_builder", rating: 5, comment: "The gas optimization suggestions saved me 30% on deployment costs.", date: "2026-05-18" },
      { id: "r6", author: "audit_review", rating: 4, comment: "Thorough but takes a bit longer than estimated for large contracts.", date: "2026-05-10" },
    ],
  },
  {
    id: "tokenomics-designer",
    name: "Tokenomics Designer",
    description: "Design optimal token distribution models, vesting schedules, and incentive structures for your project.",
    longDescription: "Build a data-driven tokenomics model for your blockchain project. The agent analyzes your project's goals and generates optimal token distribution, vesting schedules, liquidity provisioning, and inflation/deflation models. Includes visual charts and exportable reports for investor presentations.",
    icon: BarChart3,
    category: "Web3",
    executionTime: "~10 min",
    pricePerRun: 8.00,
    rating: 4.7,
    reviewCount: 67,
    users: "1.2k",
    inputs: [
      "Total token supply and initial circulation",
      "Distribution percentages (team, treasury, community, investors)",
      "Vesting cliff and duration parameters",
      "Inflation/deflation rate targets",
      "Staking rewards and emissions schedule",
    ],
    outputs: [
      "Tokenomics model report with charts",
      "Vesting schedule with unlock events",
      "Distribution pie chart and allocation table",
      "Inflation/deflation projection graph",
      "Exportable CSV and PDF reports",
    ],
    workflow: [
      { label: "Analyze Goals", description: "Interpret project requirements and constraints" },
      { label: "Design Model", description: "Create token distribution and allocation model" },
      { label: "Schedule Vesting", description: "Generate vesting cliffs, durations, and unlocks" },
      { label: "Simulate", description: "Run inflation/deflation simulations over time" },
      { label: "Output", description: "Deliver model with charts and exportable reports" },
    ],
    reviews: [
      { id: "r7", author: "tokenguy", rating: 5, comment: "The vesting schedule generator is incredibly detailed. Love the cliff visualization.", date: "2026-05-22" },
      { id: "r8", author: "dao_founder", rating: 4, comment: "Good starting point for tokenomics. I wish it integrated with more DEXes for LP simulation.", date: "2026-05-14" },
    ],
  },
  {
    id: "web3-research",
    name: "Web3 Research Agent",
    description: "Deep research on blockchain protocols, market trends, on-chain data, and competitive analysis.",
    longDescription: "Conduct thorough research on any Web3 topic. The agent aggregates data from multiple sources including blockchain explorers, Dune Analytics, CoinGecko, Twitter, and research papers. It synthesizes findings into a structured report with data visualizations, key insights, and actionable recommendations.",
    icon: Search,
    category: "Research",
    executionTime: "~5 min",
    pricePerRun: 3.00,
    rating: 4.6,
    reviewCount: 203,
    users: "5.7k",
    inputs: [
      "Research topic or question",
      "Data sources to include (on-chain, social, news)",
      "Time range for analysis",
      "Competitors or protocols to compare",
      "Output format preference",
    ],
    outputs: [
      "Research report with executive summary",
      "On-chain data analysis and charts",
      "Competitive landscape comparison",
      "Key findings and insights",
      "Sources and citations",
    ],
    workflow: [
      { label: "Parse Query", description: "Understand research question and scope" },
      { label: "Search Sources", description: "Aggregate data from on-chain and off-chain sources" },
      { label: "Analyze", description: "Process data and identify patterns and trends" },
      { label: "Synthesize", description: "Combine findings into coherent insights" },
      { label: "Output", description: "Format research report with visualizations" },
    ],
    reviews: [
      { id: "r9", author: "researcher_xyz", rating: 5, comment: "Incredibly thorough research. It caught a trend I had completely overlooked.", date: "2026-05-30" },
      { id: "r10", author: "dao_analyst", rating: 4, comment: "Great for quick protocol research. The on-chain data integration is solid.", date: "2026-05-21" },
      { id: "r11", author: "crypto_investor", rating: 5, comment: "Saves me hours of manual research. The reports are presentation-ready.", date: "2026-05-12" },
    ],
  },
  {
    id: "landing-page-builder",
    name: "Landing Page Builder",
    description: "Generate production-ready landing pages with Tailwind CSS, framer-motion animations, and responsive design.",
    longDescription: "Create beautiful, responsive landing pages in minutes. Describe your brand and requirements, and the agent generates a complete React component with Tailwind CSS styling and framer-motion animations. Includes SEO meta tags, accessibility features, and dark mode support out of the box.",
    icon: Layout,
    category: "Development",
    executionTime: "~3 min",
    pricePerRun: 4.00,
    rating: 4.5,
    reviewCount: 156,
    users: "4.1k",
    inputs: [
      "Product or brand name and description",
      "Sections needed (hero, features, pricing, FAQ, etc.)",
      "Color scheme and brand assets",
      "Call-to-action text and links",
      "Preferred style (minimal, bold, playful)",
    ],
    outputs: [
      "React component with Tailwind CSS",
      "framer-motion animation code",
      "Responsive layout (mobile, tablet, desktop)",
      "SEO meta tags and Open Graph data",
      "Exportable single-file component",
    ],
    workflow: [
      { label: "Parse Requirements", description: "Extract brand info and section preferences" },
      { label: "Generate Layout", description: "Build responsive page structure" },
      { label: "Build Sections", description: "Create each section with Tailwind styles" },
      { label: "Add Animations", description: "Apply framer-motion entrance animations" },
      { label: "Output", description: "Export complete component code" },
    ],
    reviews: [
      { id: "r12", author: "founder_saas", rating: 5, comment: "Launched our landing page in under 10 minutes. The animations are gorgeous.", date: "2026-05-27" },
      { id: "r13", author: "webdev_jen", rating: 4, comment: "Great output quality. Would love more template options to choose from.", date: "2026-05-19" },
      { id: "r14", author: "startup_dude", rating: 5, comment: "The dark mode support was a pleasant surprise. Saved me hours of CSS work.", date: "2026-05-08" },
    ],
  },
  {
    id: "dao-governance",
    name: "DAO Governance Agent",
    description: "Automate DAO proposal creation, voting analysis, treasury management, and member coordination.",
    longDescription: "Streamline your DAO operations with automated governance workflows. The agent connects to your DAO's smart contracts, monitors proposal activity, analyzes voting patterns, manages treasury allocations, and generates governance reports. Supports popular DAO frameworks including Aragon, Compound, and custom implementations.",
    icon: Users,
    category: "Automation",
    executionTime: "~6 min",
    pricePerRun: 6.00,
    rating: 4.7,
    reviewCount: 78,
    users: "980",
    inputs: [
      "DAO contract address and framework type",
      "Proposal parameters and voting strategy",
      "Treasury management rules and limits",
      "Member roles and permissions",
      "Notification preferences (email, Discord, Telegram)",
    ],
    outputs: [
      "Created on-chain proposals",
      "Voting analysis with participation metrics",
      "Treasury balance and transaction report",
      "Member activity and reputation tracking",
      "Governance automation configuration",
    ],
    workflow: [
      { label: "Connect", description: "Connect to DAO contracts and read state" },
      { label: "Analyze", description: "Analyze governance state and member activity" },
      { label: "Generate", description: "Create proposals and governance actions" },
      { label: "Simulate", description: "Simulate voting outcomes and treasury impact" },
      { label: "Output", description: "Deploy proposals and generate governance report" },
    ],
    reviews: [
      { id: "r15", author: "dao_wizard", rating: 5, comment: "Automated our entire weekly proposal workflow. Game changer for DAO ops.", date: "2026-05-26" },
      { id: "r16", author: "gov_nerd", rating: 4, comment: "The voting analysis is fantastic. Would like to see more treasury strategies.", date: "2026-05-17" },
    ],
  },
  {
    id: "marketing-copywriter",
    name: "Marketing Copywriter",
    description: "Generate compelling Web3 marketing copy for social media, blog posts, email campaigns, and launch materials.",
    longDescription: "Create engaging marketing content tailored to Web3 audiences. The agent understands crypto-native language, meme culture, and community building. It generates platform-optimized copy for Twitter/X, Discord, Mirror blog posts, and email newsletters with A/B testing variants.",
    icon: PenLine,
    category: "Marketing",
    executionTime: "~2 min",
    pricePerRun: 2.00,
    rating: 4.4,
    reviewCount: 112,
    users: "2.9k",
    inputs: [
      "Product/project description and value prop",
      "Target audience (degens, builders, investors, gamers)",
      "Platforms to generate copy for",
      "Tone (professional, playful, urgent, hype)",
      "Campaign goal (awareness, mint, launch, education)",
    ],
    outputs: [
      "Twitter/X thread (5-10 tweets)",
      "Discord announcement and community update",
      "Blog post draft with SEO keywords",
      "Email newsletter template",
      "A/B variant suggestions for each platform",
    ],
    workflow: [
      { label: "Analyze Brand", description: "Understand brand voice and campaign goals" },
      { label: "Research Audience", description: "Analyze target audience preferences" },
      { label: "Draft Copy", description: "Generate platform-specific content" },
      { label: "Optimize", description: "Apply SEO keywords and engagement hooks" },
      { label: "Output", description: "Deliver formatted copy with variants" },
    ],
    reviews: [
      { id: "r17", author: "marketer_web3", rating: 5, comment: "The Twitter thread generator understands crypto culture perfectly.", date: "2026-05-24" },
      { id: "r18", author: "project_lead", rating: 4, comment: "Good copy but sometimes too hype-heavy. Easy to edit though.", date: "2026-05-16" },
    ],
  },
  {
    id: "content-summarizer",
    name: "Content Summarizer",
    description: "Summarize long-form content into concise, actionable summaries with key insights and source references.",
    longDescription: "Process lengthy documents, articles, whitepapers, and research papers into digestible summaries. The agent extracts key arguments, data points, and conclusions while preserving important context. Supports PDF, Markdown, HTML, and plain text inputs with configurable summary length.",
    icon: FileText,
    category: "Content",
    executionTime: "~2 min",
    pricePerRun: 1.00,
    rating: 4.3,
    reviewCount: 245,
    users: "6.8k",
    inputs: [
      "Source content (URL, file upload, or paste)",
      "Desired summary length (short, medium, detailed)",
      "Focus areas or sections to prioritize",
      "Output format (bullet points, narrative, structured)",
      "Language preference",
    ],
    outputs: [
      "Concise summary with key points",
      "Actionable insights and takeaways",
      "Source references and citations",
      "Original structure preserved",
      "Exportable Markdown document",
    ],
    workflow: [
      { label: "Parse Content", description: "Extract and normalize source text" },
      { label: "Extract Key Points", description: "Identify main arguments and data" },
      { label: "Summarize", description: "Generate concise summary at requested length" },
      { label: "Structure", description: "Organize output in requested format" },
      { label: "Output", description: "Deliver formatted summary with references" },
    ],
    reviews: [
      { id: "r19", author: "content_consumer", rating: 5, comment: "Summarized a 50-page whitepaper in seconds. Incredibly accurate.", date: "2026-05-29" },
      { id: "r20", author: "research_student", rating: 4, comment: "Great for literature reviews. The citation preservation is very helpful.", date: "2026-05-13" },
      { id: "r21", author: "daily_reader", rating: 4, comment: "I use this daily for newsletter content. Saves me hours of reading.", date: "2026-05-07" },
    ],
  },
  {
    id: "defi-yield-optimizer",
    name: "DeFi Yield Optimizer",
    description: "Analyze DeFi protocols and recommend optimal yield strategies across multiple chains and pools.",
    longDescription: "Navigate the complex DeFi landscape with data-driven yield optimization. The agent scans lending protocols, DEX liquidity pools, yield aggregators, and farming opportunities across Arc and EVM-compatible chains. It factors in APY, TVL, risk scores, impermanent loss, and gas costs to recommend the best strategies.",
    icon: TrendingUp,
    category: "Web3",
    executionTime: "~7 min",
    pricePerRun: 7.00,
    rating: 4.6,
    reviewCount: 94,
    users: "1.5k",
    inputs: [
      "Risk tolerance (conservative, moderate, aggressive)",
      "Investment amount and asset type",
      "Preferred protocols or DEXes",
      "Investment time horizon",
      "Gas budget and transaction frequency",
    ],
    outputs: [
      "Yield strategy report with rankings",
      "APY comparison across protocols",
      "Risk assessment for each strategy",
      "Impermanent loss projections",
      "Recommended allocation breakdown",
    ],
    workflow: [
      { label: "Scan Protocols", description: "Fetch live data from supported protocols" },
      { label: "Compare Yields", description: "Analyze APY, TVL, and reward tokens" },
      { label: "Assess Risks", description: "Evaluate smart contract risk and IL" },
      { label: "Optimize", description: "Calculate optimal allocation strategy" },
      { label: "Output", description: "Deliver strategy report with recommendations" },
    ],
    reviews: [
      { id: "r22", author: "yield_seeker", rating: 5, comment: "Found a yield farm I never knew existed. Already earning 15% more.", date: "2026-05-23" },
      { id: "r23", author: "defi_saver", rating: 4, comment: "The risk assessment is conservative but accurate. Good for safety-first investors.", date: "2026-05-11" },
    ],
  },
  {
    id: "dapp-scaffolder",
    name: "dApp Scaffolder",
    description: "Generate full-stack dApp boilerplates with smart contracts, Next.js frontend, and deployment scripts.",
    longDescription: "Jumpstart your dApp development with production-ready boilerplate code. Describe your dApp idea and the scaffolder generates a complete project with Solidity smart contracts, a Next.js frontend with wagmi/viem integration, deployment scripts for Hardhat/Foundry, and comprehensive documentation.",
    icon: Code,
    category: "Development",
    executionTime: "~4 min",
    pricePerRun: 5.00,
    rating: 4.8,
    reviewCount: 143,
    users: "3.5k",
    inputs: [
      "dApp type (NFT marketplace, DEX, lending, governance, etc.)",
      "Smart contract features and functions",
      "Frontend requirements and pages",
      "Target chain and deployment preferences",
      "Additional integrations (IPFS, The Graph, oracles)",
    ],
    outputs: [
      "Complete project folder structure",
      "Smart contracts with Hardhat/Foundry setup",
      "Next.js frontend with wallet connection",
      "Deployment scripts and configuration",
      "README with setup instructions",
    ],
    workflow: [
      { label: "Analyze", description: "Parse dApp requirements and feature list" },
      { label: "Generate Contracts", description: "Write Solidity contracts with tests" },
      { label: "Build Frontend", description: "Create Next.js pages with wagmi integration" },
      { label: "Configure", description: "Set up deployment scripts and environment" },
      { label: "Output", description: "Package complete project scaffold" },
    ],
    reviews: [
      { id: "r24", author: "fullstack_dev", rating: 5, comment: "This scaffolded our entire NFT marketplace in 4 minutes. Unbelievable.", date: "2026-05-28" },
      { id: "r25", author: "web3_learner", rating: 5, comment: "Perfect for learning. The generated code is clean and well-commented.", date: "2026-05-20" },
      { id: "r26", author: "hackathon_participant", rating: 4, comment: "Used this for a hackathon. Got a working prototype in record time.", date: "2026-05-09" },
    ],
  },
];

export const CATEGORIES = ["Web3", "Development", "Research", "Marketing", "Content", "Automation"];

export function getAgentById(id: string): Agent | undefined {
  return AGENTS.find((a) => a.id === id);
}

export function getAgentsByCategory(category: string): Agent[] {
  if (!category) return AGENTS;
  return AGENTS.filter((a) => a.category === category);
}

export const FEATURED_AGENT_IDS = [
  "nft-launch",
  "smart-contract-auditor",
  "tokenomics-designer",
  "web3-research",
  "landing-page-builder",
  "dao-governance",
];
