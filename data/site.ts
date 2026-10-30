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

export const experienceIntro = [
  "LLM inference on Kubernetes. vLLM, NVIDIA Dynamo, GPUs that should be working harder than they are.",
  "CUDA enjoyer in the evenings. Nix, Neovim and a terminal person always. Sometimes I give talks about standing this stuff up on EKS.",
] as const;

export const experience = [
  {
    title: "Senior AI Engineer",
    company: "Likezero",
    period: "Sept 2024 – Present",
    description:
      "Own and architect Likezero's AWS Kubernetes LLM inference platform, built from the ground up. Cut LLM cold-starts by 80%, raised KV cache hit rates and 2-4x increased tokens decode throughput.",
    highlights: [
      "Own and architect Likezero's AWS Kubernetes LLM inference platform, built from the ground up. vLLM and NVIDIA Dynamo, prefill/decode disaggregation, KV-cache-aware routing, speculative decoding and GPU node autoscaling with Karpenter and KEDA.",
      "Cut LLM cold-starts by 80%, raised KV cache hit rates and 2-4x increased tokens decode throughput. Served Llama 3.3, Qwen 3.6/3.8, Deepseek v4 and embedding models on RTX 6000 Blackwells and H100s and H200s.",
      "Platform is declarative GitOps (ArgoCD, Terraform) with cluster networking (Cilium), TLS (cert-manager), observability (Loki, Prometheus and Grafana) and company-wide services.",
      "Built a high-concurrency asynchronous Python server bridging RabbitMQ and HTTP. This underpins Likezero's decoupled autoscaling infrastructure by enabling RabbitMQ/KEDA-driven scaling. This has delivered hundreds of millions of LLM and internal service requests.",
    ],
  },
  {
    title: "Senior AI Engineer",
    company: "Applied Data Science Partners",
    period: "Aug 2023 – Sept 2024",
    description:
      "Three projects delivered with LLMs in defence and education. Led a gen AI and software engineering project that uses decoder transformers for novel use cases in cyber defence.",
    highlights: [
      "Three projects delivered with LLMs in defence and education. Used many closed and open-source models, such as GPT, Gemma, and Llama, in addition to RAG, chain-of-thoughts, and Retrieval Augmented Thoughts.",
      "Led a gen AI and software engineering project that uses decoder transformers for novel use cases in cyber defence.",
      "Author of an AI-centred newsletter. With over 850 subscribers, the newsletter has furthered the company's reputation and consulting opportunities.",
    ],
  },
  {
    title: "AI & Data Engineer Consultant",
    company: "Liveminds and Maeving",
    period: "Jul 2023 – Sept 2024",
    description:
      "At Liveminds, I developed and productionised a text summarisation product with a multi-step RAG process using GPT and Claude. At Maeving, I created a full ETL and analytics pipeline with Azure, Postgres, and PowerBI.",
    highlights: [
      "At Liveminds, I developed and productionised a text summarisation product with a multi-step RAG process using GPT and Claude. This kickstarted Liveminds' AI product offering and attracted investor attention.",
      "At Maeving, I created a full ETL and analytics pipeline with Azure, Postgres, and PowerBI. These systems led to deepened analytics across the company and self-serve from a trusted single data source.",
    ],
  },
  {
    title: "Data Scientist",
    company: "Laing O'Rourke",
    period: "Jun 2021 – Jul 2023",
    description:
      "I built an end-to-end data product for national infrastructure projects using Azure ML, and fine-tuned Sentence BERT to understand construction-specific language.",
    highlights: [
      "Tasked with providing economic strategy for national infrastructure projects, I delivered a complete end-to-end data product for multi-billion pound financial data using Azure ML.",
      "Before the advent of GPT-3.5, I created a system to understand construction-specific language by fine-tuning a Sentence BERT model. This system created future opportunities for NLP modelling in the broader construction industry.",
      "Fostered company data culture by reporting on exciting news in data, presenting and teaching Python/data analytics skills.",
    ],
  },
  {
    title: "Junior Data Scientist",
    company: "Faceit",
    period: "Sept 2020 – June 2021",
    description:
      "I worked on player skill modelling, toxicity detection, and analytics for a platform used by millions of players.",
    highlights: [
      "By analysing the matches of over 2 million players, I created predictive models to determine player's skill to solve the platform's 'smurf' problem.",
      "I improved a model that detects toxicity in millions of monthly chat messages. My work improved the platform experience for millions of users.",
      "I provided insight into all business areas by creating dashboards and datamarts within Looker and BigQuery.",
    ],
  },
  {
    title: "Freelance Data Scientist",
    company: "Various Companies",
    period: "Oct 2018 – Aug 2020",
    description:
      "I built predictive models, business intelligence, and automated data pipelines for several companies.",
    highlights: [
      "Created and deployed a predictive model that led to a 50% decrease in costs associated with advertising and employee time.",
      "Clarified trends and statistical phenomena with various data by providing business intelligence across multiple companies.",
      "Designed and productionised a system that could automatically scrape, clean, and add data to a database from the NHS jobs website.",
    ],
  },
] as const;

export const skills = [
  "Python",
  "Dynamo/vLLM",
  "LLM Inference",
  "Kubernetes",
  "Platform Engineering",
  "AWS",
  "Nix",
  "Linux",
] as const;

export const education = {
  institution: "Keele University",
  degree: "BSc (Hons) Physics and Mathematics",
  period: "Sept 2016 – July 2019",
};

export const talk = {
  title: "Building Inference Architecture with EKS",
  event: "AWS",
  date: "25th September 2025",
  subtitle: "Accelerating GPU workloads on AWS: from GenAI to HPC",
  description:
    "Talk at AWS on how to deploy LLMs for contract intelligence application on AWS, highlighting real-world architecture decisions, the journey to building a scalable, cost-efficient inference platform with Amazon EKS and GPU instances on AWS.",
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
  "personal-website": {
    name: "Personal Website",
    description: "My experience, projects and homelab services.",
  },
  searxng: {
    name: "SearXNG",
    description: "Private metasearch without tracking or profiling.",
    featured: true,
  },
};
