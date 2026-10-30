export const site = {
  name: "Oli Wilkins",
  role: "Senior Inference Engineer",
  handle: "okwilkins",
  location: "London, UK",
  intro: "I build LLM inference platforms on Kubernetes.",
  tagline:
    "vLLM, NVIDIA Dynamo, and GPUs that should be working harder than they are.",
  email: "okwilkins@gmail.com",
  url: "https://okwilkins.dev",
  description:
    "I'm Oli Wilkins, a Senior Inference Engineer working on LLM inference, GPU systems, and AI infrastructure. Based in London, UK.",
};

export const socials = [
  { label: "GitHub", href: "https://github.com/okwilkins", icon: "github" },
  { label: "X", href: "https://x.com/okwilkins", icon: "x" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/oliwilkins/",
    icon: "linkedin",
  },
] as const;

export const experience = [
  {
    title: "Senior AI Engineer",
    company: "Likezero",
    period: "Sep 2024 — Present",
    description:
      "I built and own the LLM inference platform on AWS and Kubernetes: vLLM, NVIDIA Dynamo, disaggregated prefill/decode, KV-cache-aware routing, and GPU autoscaling. My async Python infrastructure has handled hundreds of millions of requests.",
    highlights: [
      "I built and own Likezero’s AWS Kubernetes LLM inference platform, using vLLM and NVIDIA Dynamo with disaggregated prefill/decode, KV-cache-aware routing, speculative decoding, and GPU autoscaling through Karpenter and KEDA.",
      "I optimise cold starts, KV cache reuse, and decode throughput for Llama, Qwen, DeepSeek, and embedding models on RTX 6000 Blackwell, H100, and H200 GPUs.",
      "I run the platform through declarative GitOps with Argo CD and Terraform, Cilium networking, cert-manager for TLS, and Prometheus, Loki, and Grafana for observability.",
      "I built a high-concurrency asynchronous Python server bridging RabbitMQ and HTTP, enabling decoupled, KEDA-driven autoscaling. It has handled hundreds of millions of LLM and internal service requests.",
    ],
  },
  {
    title: "Senior AI Engineer",
    company: "Applied Data Science Partners",
    period: "Aug 2023 — Sep 2024",
    description:
      "I delivered three LLM projects in defence and education, and led generative AI and software engineering work in cyber defence.",
    highlights: [
      "I delivered three LLM projects in defence and education, working with GPT, Gemma, and Llama, alongside RAG and retrieval-augmented reasoning.",
      "I led a generative AI and software engineering project applying decoder transformers to new use cases in cyber defence.",
      "I wrote an AI-centred newsletter that grew to more than 850 subscribers and supported new consulting opportunities.",
    ],
  },
  {
    title: "AI & Data Engineer Consultant",
    company: "Liveminds and Maeving",
    period: "Jul 2023 — Sep 2024",
    description:
      "I built a production RAG summarisation product for Liveminds and an analytics platform for Maeving.",
    highlights: [
      "At Liveminds, I productionised a text summarisation product using multi-step RAG with GPT and Claude, helping launch the company’s AI offering and attract investor interest.",
      "At Maeving, I built an ETL and analytics pipeline with Azure, Postgres, and Power BI, giving teams a trusted shared source for self-service analytics.",
    ],
  },
  {
    title: "Data Scientist",
    company: "Laing O’Rourke",
    period: "Jun 2021 — Jul 2023",
    description:
      "I built an end-to-end data product for national infrastructure projects using Azure ML, and fine-tuned Sentence BERT to understand construction-specific language.",
    highlights: [
      "I delivered an end-to-end Azure ML data product for multi-billion-pound financial data, supporting economic strategy for national infrastructure projects.",
      "I fine-tuned Sentence BERT to understand construction-specific language, opening up new NLP use cases across the industry.",
      "I taught Python and data analytics skills and shared developments in data science across the company.",
    ],
  },
  {
    title: "Junior Data Scientist",
    company: "FACEIT",
    period: "Sep 2020 — Jun 2021",
    description:
      "I worked on player skill modelling, toxicity detection, and analytics for a platform used by millions of players.",
    highlights: [
      "I analysed matches from more than two million players to build skill prediction models and address smurfing.",
      "I improved toxicity detection across millions of monthly chat messages, improving the platform experience for millions of users.",
      "I built dashboards and data marts with Looker and BigQuery to support decisions across the business.",
    ],
  },
  {
    title: "Freelance Data Scientist",
    company: "Various companies",
    period: "Oct 2018 — Aug 2020",
    description:
      "I built predictive models, business intelligence, and automated data pipelines for several companies.",
    highlights: [
      "I built and deployed a predictive model that reduced costs associated with advertising and employee time by 50%.",
      "I delivered business intelligence across several companies and productionised a system to scrape, clean, and store NHS jobs data.",
    ],
  },
] as const;

export const skills = [
  "Python",
  "LLM inference",
  "vLLM / NVIDIA Dynamo",
  "Kubernetes",
  "Platform engineering",
  "AWS",
  "Nix",
  "Linux",
] as const;

export const education = {
  institution: "Keele University",
  degree: "BSc (Hons) Physics and Mathematics",
  period: "Sep 2016 — Jul 2019",
};

export const talk = {
  title: "Building Inference Architecture with EKS",
  event: "AWS · 25 Sep 2025",
  description:
    "I spoke at AWS about building a scalable, cost-efficient LLM inference platform for contract intelligence on Amazon EKS and GPUs.",
  href: "https://aws-experience.com/emea/smb/e/43063/accelerating-gpu-workloads-on-aws-from-genai-to-hpc",
};

export const projects = [
  {
    name: "h8s",
    description:
      "My bare-metal Kubernetes homelab on Talos Linux. Declarative provisioning in under 10 minutes, with Argo CD, Cilium, Vault, and full-stack observability.",
    href: "https://github.com/okwilkins/h8s",
  },
  {
    name: ".dotfiles",
    description:
      "My Nix-based development environment across Linux, macOS, containers, and VMs. Reproducible workflows, Neovim, and a terminal-first setup.",
    href: "https://github.com/okwilkins/.dotfiles",
  },
  {
    name: "inferlace",
    description:
      "My handwritten inference engine for the RTX 4080. Exploring how efficient LLM execution works, one layer at a time.",
    href: "https://github.com/okwilkins/inferlace",
  },
] as const;

// Short descriptions based on each project's README.
export const serviceDetails: Record<string, { name: string; description: string; featured?: boolean }> = {
  authelia: {
    name: "Authelia",
    description: "Single sign-on with multi-factor authentication.",
  },
  "chhoto-url": {
    name: "Chhoto-URL",
    description: "A self-hosted URL shortener with a web interface and API.",
  },
  excalidraw: {
    name: "Excalidraw",
    description: "Collaborative, end-to-end encrypted whiteboarding.",
    featured: true,
  },
  grafana: {
    name: "Grafana",
    description: "Dashboards and observability, managed declaratively.",
  },
  harbor: {
    name: "Harbor",
    description: "A container registry with image signing and vulnerability scanning.",
  },
  mazanoke: {
    name: "Mazanoke",
    description: "Image optimisation in the browser.",
  },
  searxng: {
    name: "SearXNG",
    description: "Private metasearch without tracking or profiling.",
    featured: true,
  },
};
