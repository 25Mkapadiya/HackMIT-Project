import type { Metadata } from "next";
import type { ReactNode } from "react";
import LearnHeader from "@/components/learn/LearnHeader";
import LearnCtaButtons from "@/components/learn/LearnCtaButtons";
import ConcernsAccordion from "@/components/learn/ConcernsAccordion";
import Reveal from "@/components/learn/Reveal";
import { Section, SectionHeading, InfoCard, IconCircle, Callout, FlowStep, FlowArrow } from "@/components/learn/LearnUI";
import {
  BoltIcon,
  DropletIcon,
  MapIcon,
  TowerIcon,
  NetworkIcon,
  BatteryIcon,
  UsersIcon,
  BuildingIcon,
  ServerIcon,
  SparkleIcon,
  CloudIcon,
  PlayIcon,
  GlobeIcon,
  LeafIcon,
  SpeakerWaveIcon,
  TruckIcon,
  CoinIcon,
  HardHatIcon,
} from "@/components/learn/icons";

export const metadata: Metadata = {
  title: "Learn — GEO: Graphical Energy Outcomes",
  description: "A plain-language guide to what data centers are, what they need, and how they interact with the communities around them.",
};

const NEEDS = [
  {
    icon: <BoltIcon />,
    color: "#f2b93b",
    title: "Electricity",
    text: "Servers operate continuously and can require enormous amounts of electricity. Large data centers may require hundreds of megawatts of power, making proximity to substations, transmission infrastructure, and sufficient grid capacity important.",
    callout: "Nearby transmission lines do not necessarily mean power capacity is available. Utility interconnection studies are often required to determine actual available capacity.",
  },
  {
    icon: <DropletIcon />,
    color: "#3ba9f2",
    title: "Water & Cooling",
    text: "Servers generate large amounts of heat and must be cooled continuously. Some facilities use evaporative cooling systems that consume water, while others rely more heavily on air cooling, closed-loop systems, or other cooling technologies.",
    callout: "Water demand varies significantly based on the cooling technology, climate, facility design, and operating conditions.",
  },
  {
    icon: <MapIcon />,
    color: "#8fa3bf",
    title: "Land",
    text: "Large facilities require significant land for buildings, electrical equipment, generators, cooling systems, parking, security buffers, and supporting infrastructure.",
  },
  {
    icon: <TowerIcon />,
    color: "#f2703b",
    title: "Grid Infrastructure",
    text: "Being near high-voltage transmission lines and substations can reduce the distance needed to connect a facility to the electrical grid. However, physical proximity does not guarantee that the grid has enough available capacity.",
  },
  {
    icon: <NetworkIcon />,
    color: "#9b6ef2",
    title: "Fiber Connectivity",
    text: "Data centers depend on high-capacity fiber-optic networks to quickly move enormous amounts of information between users, companies, and other data centers.",
  },
  {
    icon: <BatteryIcon />,
    color: "#3bf2a0",
    title: "Backup Power",
    text: "Facilities need highly reliable power. Backup generators, batteries, and other systems may be used to keep operations running during grid outages.",
  },
];

const CONCERNS = [
  {
    icon: <BoltIcon />,
    color: "#f2b93b",
    title: "Electricity Demand",
    text: "Large data centers can place significant new demand on regional electric grids. Depending on local conditions, additional generation, transmission lines, substations, or other infrastructure may be needed.",
    considerations: ["Grid congestion", "New transmission infrastructure", "Electricity supply", "Reliability", "Generation mix"],
  },
  {
    icon: <DropletIcon />,
    color: "#3ba9f2",
    title: "Water Consumption",
    text: "Some cooling systems use significant amounts of water, particularly in warmer climates or facilities using evaporative cooling.",
    considerations: ["Local water supply", "Drought conditions", "Competing municipal/agricultural demand", "Cooling technology", "Water source"],
  },
  {
    icon: <SpeakerWaveIcon />,
    color: "#f2703b",
    title: "Noise",
    text: "Cooling equipment, mechanical systems, transformers, and backup generators can create continuous or intermittent noise. Noise becomes especially important when facilities are located close to residential neighborhoods.",
    extra: (
      <div className="mt-3 flex flex-col sm:flex-row items-center gap-2 sm:gap-3 rounded-lg border border-base-700 bg-base-900/70 px-3.5 py-3">
        <FlowStep label="Data Center" />
        <FlowArrow direction="right" />
        <FlowStep label="Distance from homes" />
        <FlowArrow direction="right" />
        <div className="flex items-center gap-1.5 text-[10.5px] font-bold tracking-wide">
          <span className="px-2 py-1 rounded-md bg-[#3bf2a0]/10 text-[#3bf2a0]">LOW</span>
          <span className="px-2 py-1 rounded-md bg-[#f2b93b]/10 text-[#f2b93b]">MODERATE</span>
          <span className="px-2 py-1 rounded-md bg-[#ff5470]/10 text-[#ff5470]">HIGH</span>
        </div>
      </div>
    ),
  },
  {
    icon: <TruckIcon />,
    color: "#8fa3bf",
    title: "Backup Generator Emissions",
    text: "Diesel or other backup generators may periodically operate for testing or during power outages, creating localized air pollution and noise.",
    considerations: ["Nitrogen oxides", "Particulate emissions", "Noise", "Testing frequency"],
  },
  {
    icon: <MapIcon />,
    color: "#f2b93b",
    title: "Land Use",
    text: "Large campuses can occupy substantial areas of land and may compete with housing, industrial uses, agriculture, conservation, or other development.",
  },
  {
    icon: <LeafIcon />,
    color: "#3bf2a0",
    title: "Environmental Impact",
    text: "Development can affect vegetation, wildlife habitat, stormwater runoff, and local ecosystems depending on where construction occurs.",
    considerations: ["Wetlands", "Flood zones", "Protected land", "Habitat", "Stormwater", "Existing land use"],
  },
  {
    icon: <UsersIcon />,
    color: "#9b6ef2",
    title: "Residential Proximity",
    text: "Impacts such as noise, construction traffic, visual changes, and generator operation become more important when facilities are located near populated areas.",
  },
  {
    icon: <HardHatIcon />,
    color: "#8fa3bf",
    title: "Construction & Traffic",
    text: "Large projects can generate substantial construction activity and truck traffic during development, although traffic after construction is generally different from traditional high-employment commercial facilities.",
  },
];

const BENEFITS = [
  { icon: <ServerIcon />, color: "#9b6ef2", title: "Digital Infrastructure", text: "Supports cloud computing, AI, communications, banking, streaming, and other digital services." },
  { icon: <CoinIcon />, color: "#f2b93b", title: "Investment", text: "Large projects can involve significant private investment in buildings, electrical systems, and infrastructure." },
  { icon: <BuildingIcon />, color: "#3ba9f2", title: "Tax Revenue", text: "Depending on local tax structures and incentives, facilities may contribute property, sales, utility, or other tax revenue." },
  { icon: <TowerIcon />, color: "#3bf2a0", title: "Infrastructure Development", text: "Projects may contribute to upgrades to electrical, fiber, water, or transportation infrastructure." },
  { icon: <HardHatIcon />, color: "#f2703b", title: "Employment", text: "Data centers create construction jobs during development and permanent technical, operational, security, and maintenance roles after completion." },
];

const MODEL_FACTORS: { icon: ReactNode; label: string; color: string }[] = [
  { icon: <BoltIcon />, label: "Power Infrastructure", color: "#f2b93b" },
  { icon: <DropletIcon />, label: "Water", color: "#3ba9f2" },
  { icon: <UsersIcon />, label: "Residential Density", color: "#9b6ef2" },
  { icon: <SpeakerWaveIcon />, label: "Noise", color: "#f2703b" },
  { icon: <LeafIcon />, label: "Environmental Conditions", color: "#3bf2a0" },
  { icon: <MapIcon />, label: "Land", color: "#8fa3bf" },
  { icon: <NetworkIcon />, label: "Fiber / Connectivity", color: "#9b6ef2" },
  { icon: <ServerIcon />, label: "Existing Infrastructure", color: "#8fa3bf" },
];

export default function LearnPage() {
  return (
    <div className="absolute inset-0 overflow-y-auto bg-base-950 text-ink-100">
      <LearnHeader />

      {/* HERO */}
      <Section className="pt-16 sm:pt-24 pb-10 sm:pb-14">
        <Reveal className="text-center">
          <h1 className="text-[32px] sm:text-[48px] font-bold tracking-tight text-ink-100 leading-[1.1]">
            Understanding Data Centers
          </h1>
          <p className="mt-4 text-[15px] sm:text-[18px] font-medium text-ink-300 max-w-2xl mx-auto">
            The infrastructure behind the digital world — and the communities that host it.
          </p>
          <p className="mt-5 text-[13px] sm:text-[14.5px] text-ink-500 leading-relaxed max-w-2xl mx-auto">
            Data centers are the physical infrastructure that powers cloud computing, artificial intelligence,
            streaming, websites, financial systems, and many of the digital services we use every day. As demand
            for computing grows, so does the need to understand where these facilities are built and how they
            interact with surrounding communities.
          </p>
        </Reveal>

        <Reveal delay={100} className="mt-10 flex items-center justify-center gap-2 sm:gap-4">
          <FlowStep label="Electric Grid" sub="Power source" />
          <FlowArrow direction="right" />
          <FlowStep label="Data Center" sub="Compute + storage" />
          <FlowArrow direction="right" />
          <FlowStep label="Digital Services" sub="AI, cloud, streaming" />
        </Reveal>

        <Reveal delay={160} className="mt-8 text-center">
          <span className="inline-block text-[12.5px] sm:text-[13px] font-semibold text-ink-100 px-4 py-2 rounded-full border border-base-700 bg-base-900/60 glass-panel">
            Every digital action has a physical footprint.
          </span>
        </Reveal>
      </Section>

      {/* SECTION 1 — WHAT IS A DATA CENTER */}
      <Section>
        <SectionHeading
          title="What is a data center?"
          subtitle="A data center is a facility filled with servers and networking equipment that stores, processes, and transfers digital information. When you stream a movie, use an AI model, save something to the cloud, make an online payment, or visit a website, the computing behind that activity often happens inside a data center."
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <InfoCard icon={<SparkleIcon />} color="#9b6ef2" title="Artificial Intelligence">
            Training and running AI models can require large amounts of computing power.
          </InfoCard>
          <InfoCard icon={<CloudIcon />} color="#3ba9f2" title="Cloud Computing" delay={40}>
            Companies use data centers to remotely store files, applications, databases, and computing resources.
          </InfoCard>
          <InfoCard icon={<PlayIcon />} color="#ff5470" title="Streaming" delay={80}>
            Video, music, gaming, and other digital content is processed and delivered through data center infrastructure.
          </InfoCard>
          <InfoCard icon={<GlobeIcon />} color="#f2b93b" title="Internet Services" delay={120}>
            Websites, search engines, social networks, financial platforms, and communications systems depend on data centers.
          </InfoCard>
        </div>
      </Section>

      {/* SECTION 2 — WHAT DOES A DATA CENTER NEED */}
      <Section className="bg-base-900/20 rounded-3xl">
        <SectionHeading eyebrow="Infrastructure" title="What does a data center need?" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {NEEDS.map((n, i) => (
            <InfoCard key={n.title} icon={n.icon} color={n.color} title={n.title} delay={i * 40}>
              <p>{n.text}</p>
              {n.callout && (
                <div className="mt-2.5">
                  <Callout color={n.color}>{n.callout}</Callout>
                </div>
              )}
            </InfoCard>
          ))}
        </div>
      </Section>

      {/* SECTION 3 — WHY LOCATION MATTERS */}
      <Section>
        <SectionHeading
          title="Why does location matter?"
          subtitle="Two identical data centers can have very different effects depending on where they are built. Distance from homes, water availability, local grid conditions, existing infrastructure, climate, and surrounding land uses can all change the impact of a project."
        />
        <Reveal className="flex flex-col items-center gap-3">
          <FlowStep label="LOCATION" />
          <FlowArrow direction="down" />
          <div className="flex flex-wrap justify-center gap-2 max-w-xl">
            {["Electricity", "Water", "Population", "Grid Capacity", "Land", "Fiber", "Noise", "Environmental Conditions"].map((f) => (
              <span key={f} className="text-[11px] sm:text-[11.5px] font-medium px-3 py-1.5 rounded-full border border-base-700 text-ink-300">
                {f}
              </span>
            ))}
          </div>
          <FlowArrow direction="down" />
          <div className="px-5 py-2.5 rounded-lg font-bold text-[13px] sm:text-[14px] tracking-wide text-accent-proposed border border-accent-proposed/40 bg-accent-proposed/10">
            COMMUNITY IMPACT
          </div>
        </Reveal>
        <Reveal delay={80} className="mt-8 text-center text-[13px] sm:text-[14px] text-ink-300 max-w-xl mx-auto leading-relaxed">
          This is why evaluating a data center requires more than simply finding an empty parcel of land.
        </Reveal>
      </Section>

      {/* SECTION 4 — CONCERNS */}
      <Section className="max-w-3xl">
        <SectionHeading
          title="What impacts should communities consider?"
          subtitle="Data centers provide important digital infrastructure and economic investment, but large facilities can also create local impacts that communities and developers should evaluate."
        />
        <ConcernsAccordion items={CONCERNS} />
        <Reveal className="mt-4 text-[11px] text-ink-600 text-center leading-relaxed">
          GEO&rsquo;s Noise Impact Assessment uses the selected cooling technology and surrounding residential density/proximity as part of estimating this concern for a proposed site.
        </Reveal>
      </Section>

      {/* SECTION 5 — BENEFITS */}
      <Section className="bg-base-900/20 rounded-3xl">
        <SectionHeading
          title="Why are data centers built?"
          subtitle="Data centers support rapidly growing digital infrastructure and can bring substantial investment to communities."
        />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {BENEFITS.map((b, i) => (
            <InfoCard key={b.title} icon={b.icon} color={b.color} title={b.title} delay={i * 40}>
              {b.text}
            </InfoCard>
          ))}
        </div>
      </Section>

      {/* SECTION 6 — HOW GEO WORKS */}
      <Section>
        <SectionHeading eyebrow="GEO — Graphical Energy Outcomes" title="From Data to Decisions" subtitle="GEO helps people understand how potential data center developments interact with the communities and infrastructure around them." />
        <div className="grid sm:grid-cols-2 gap-4">
          <Reveal className="rounded-xl border border-base-700 bg-base-900/60 glass-panel p-5 sm:p-6">
            <IconCircle icon={<UsersIcon />} color="#9b6ef2" size="md" />
            <h3 className="mt-3.5 text-[15px] font-semibold text-ink-100 leading-snug">
              Understand what a data center could mean for your community.
            </h3>
            <p className="mt-2 text-[12.5px] text-ink-500 leading-relaxed">
              Residents can explore proposed or hypothetical data center locations and understand potential impacts
              related to electricity, water, noise, residential proximity, environmental conditions, and surrounding
              infrastructure.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-1.5 text-[10.5px] font-semibold text-ink-300">
              {["Choose a location", "Analyze infrastructure", "See potential impacts", "Understand your community"].map((s, i, arr) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className="px-2 py-1 rounded-md border border-base-700">{s}</span>
                  {i < arr.length - 1 && <FlowArrow direction="right" />}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={80} className="rounded-xl border border-base-700 bg-base-900/60 glass-panel p-5 sm:p-6">
            <IconCircle icon={<BuildingIcon />} color="#ff5470" size="md" />
            <h3 className="mt-3.5 text-[15px] font-semibold text-ink-100 leading-snug">
              Evaluate potential data center locations before development.
            </h3>
            <p className="mt-2 text-[12.5px] text-ink-500 leading-relaxed">
              Aspiring developers can place a potential data center on the map and quickly evaluate how its location
              interacts with power infrastructure, water resources, nearby residents, environmental constraints, and
              other site-selection factors.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-1.5 text-[10.5px] font-semibold text-ink-300">
              {["Place a site", "Analyze infrastructure", "Identify constraints", "Compare locations"].map((s, i, arr) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className="px-2 py-1 rounded-md border border-base-700">{s}</span>
                  {i < arr.length - 1 && <FlowArrow direction="right" />}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </Section>

      {/* SECTION 7 — HOW THE MODEL THINKS */}
      <Section className="bg-base-900/20 rounded-3xl">
        <SectionHeading eyebrow="Methodology" title="How the model thinks" subtitle="GEO combines publicly available infrastructure, geographic, environmental, and demographic data to provide an intuitive first-pass assessment of a potential site." />

        <Reveal className="flex flex-col items-center gap-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl w-full">
            {MODEL_FACTORS.map((f) => (
              <div key={f.label} className="flex items-center gap-2 rounded-lg border border-base-700 bg-base-900/70 px-2.5 py-2">
                <IconCircle icon={f.icon} color={f.color} size="sm" />
                <span className="text-[10.5px] sm:text-[11px] font-medium text-ink-300 leading-tight">{f.label}</span>
              </div>
            ))}
          </div>
          <FlowArrow direction="down" />
          <FlowStep label="Potential Data Center Site" />
          <FlowArrow direction="down" />
          <div className="px-5 py-2.5 rounded-lg font-bold text-[13px] sm:text-[14px] tracking-wide text-ink-100 border border-base-600 bg-base-800">
            GEO Impact Analysis
          </div>
          <FlowArrow direction="down" />
          <div className="flex flex-wrap justify-center gap-2">
            <span className="px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide bg-[#3bf2a0]/10 text-[#3bf2a0] border border-[#3bf2a0]/30">Low Concern</span>
            <span className="px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide bg-[#f2b93b]/10 text-[#f2b93b] border border-[#f2b93b]/30">Moderate Concern</span>
            <span className="px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide bg-[#ff5470]/10 text-[#ff5470] border border-[#ff5470]/30">High Concern</span>
          </div>
        </Reveal>

        <Reveal delay={100} className="mt-8 max-w-2xl mx-auto rounded-lg border border-base-700 bg-base-900/70 px-4 py-3.5 text-[11.5px] text-ink-500 leading-relaxed">
          <span className="font-semibold text-ink-300">Disclaimer — </span>
          GEO is a screening and educational tool, not an engineering, environmental, permitting, utility
          interconnection, or legal study. Actual project feasibility requires detailed analysis by utilities,
          engineers, regulators, developers, and local stakeholders.
        </Reveal>
      </Section>

      {/* SECTION 8 — FINAL CTA */}
      <Section className="pb-20 sm:pb-28">
        <Reveal className="text-center">
          <h2 className="text-[22px] sm:text-[30px] font-bold text-ink-100 tracking-tight">
            See the physical impact behind the digital world.
          </h2>
          <p className="mt-3 text-[13px] sm:text-[14.5px] text-ink-500 max-w-xl mx-auto leading-relaxed">
            Explore how infrastructure, environment, and communities intersect with the next generation of computing infrastructure.
          </p>
          <div className="mt-7">
            <LearnCtaButtons />
          </div>
        </Reveal>
      </Section>
    </div>
  );
}
